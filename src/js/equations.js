import {
	Fraction,
	tableToFraction,
	fractionTableToStrings
} from './_fraction';
import { generateTable } from './table';

// const initTableContent = [
// 	['', '1', 'x1', 'x2'],
// 	['q', '', '', ''],
// ];

// const initTableContent = [
// 	['',   '1',  'x1', 'x2'],
// 	['q',  '0',  '-1',  '-3'],
// 	['x3', '1',  '-1',  '1'],
// 	['x4', '-6', '2',   '-4'],
// 	['x5', '16', '1',   '2'],
// ];

const initTableContent = [
	['',   '1',  'x1', 'x2'],
	['q',  '0',  '-3',  '-1'],
	['x3', '2',  '-1',  '2'],
	['x4', '4',  '1',  '-1'],
];

const deleteRow = index => {
	delete initTableContent[index];
	loadInitTable();
}

const addRow = () => {
	initTableContent.push(['', '', '', '']);
	loadInitTable();
}

const updateCell = e => {
	initTableContent[e.target.dataset.row][e.target.dataset.column] = e.target.value;
}

const tableContainer  = document.querySelector('#init-table-container');
const outputContainer = document.querySelector('#output-container');
const stepButton      = document.createElement('button');
stepButton.id = 'next-step-button';
stepButton.innerHTML = 'Next step';

const ELEMS_IN_ROW = 4;

const solveSteps = [];

tableContainer.addEventListener('submit', e => {
	e.preventDefault();

	tableContainer.innerHTML = '';
	outputContainer.appendChild( stepButton );

	tableToFraction(initTableContent);

	const stepTable = generateTable({
		tableContent: fractionTableToStrings(initTableContent)
	});
	stepTable.classList.add('step0');
	stepTable.classList.add('main');
	outputContainer.insertBefore( stepTable, stepButton );

	solveSteps.push({
		step: 0,
		table: initTableContent,
		basis: {
			row: null,
			column: null
		},
		secondary: false
	});
});

const loadInitTable = () => {
	tableContainer.innerHTML = '';
	tableContainer.appendChild( generateTable({
		tableContent: initTableContent,
		initial: true,
		addRow: addRow,
		deleteRow: deleteRow,
		updateCell: updateCell
	}) );

	const submitButton = document.createElement('button');
	submitButton.setAttribute('type', 'submit');
	submitButton.innerHTML = 'Submit';

	tableContainer.appendChild(submitButton);
}

loadInitTable();

const parseIntFromTH = thString => Number.parseInt(thString.match(/\d+/)[0]);

const highlightRowBasis = (htmlTable, basisIndex) => {
	htmlTable.children[basisIndex * ELEMS_IN_ROW].classList.add('basis');

	const rowsInTable = Math.round(htmlTable.children.length / ELEMS_IN_ROW);
	const isLastRow = rowsInTable - 1 === basisIndex;

	const rowTopIndex = basisIndex;
	const rowBottomIndex = (
		isLastRow ?
			basisIndex :
			basisIndex + 1
	);

	const rowBottomCSSClass = isLastRow ? 'row-basis-bottom' : 'row-basis-top';

	for (let index = 0; index < ELEMS_IN_ROW; index++) {
		htmlTable.children[index + rowTopIndex * ELEMS_IN_ROW].classList.add('row-basis-top', 'basis');
		htmlTable.children[index + rowBottomIndex * ELEMS_IN_ROW].classList.add(rowBottomCSSClass);
	}
}

const highlightColumnBasis = (htmlTable, basisIndex) => {
	htmlTable.children[basisIndex].classList.add('basis');

	const rowsInTable = Math.round(htmlTable.children.length / ELEMS_IN_ROW);

	const isLastColumn = ELEMS_IN_ROW - 1 === basisIndex;

	const columnRightIndex = (
		isLastColumn ?
			basisIndex :
			basisIndex + 1
	);

	const columnRightCSSClass = isLastColumn ? 'column-basis-right' : 'column-basis-left';

	for (let index = 0; index < rowsInTable; index++) {
		htmlTable.children[index * ELEMS_IN_ROW + basisIndex].classList.add('column-basis-left', 'basis');
		htmlTable.children[index * ELEMS_IN_ROW + columnRightIndex].classList.add(columnRightCSSClass);
	}
}

const countNextStep = () => {
	const htmlTables = document.querySelectorAll('.grid-table');
	const lastHtmlTable = htmlTables[htmlTables.length - 1];

	const lastStep = solveSteps[solveSteps.length - 1];

	if (!lastStep.secondary) {

		//
		// Find column basis
		//
		const row = lastStep.table[1];
		const rowElements = row.map(
			(value, index) => {
				return { value: value, index: index };
			}
		).slice(2);
		const negativeElementsRow = rowElements.filter( obj => obj.value.compare(0) < 0 );

		let columnBasis = null;
		if (negativeElementsRow.length === 1) {

			columnBasis = negativeElementsRow[0].index;

		} else {

			(negativeElementsRow.length === 0 ? rowElements : negativeElementsRow)
				.forEach(data => {
					const thValue = parseIntFromTH(lastStep.table[0][data.index]);

					if (columnBasis === null) {
						columnBasis = {
							thValue: thValue,
							index: data.index,
						}
					} else if (columnBasis.thValue > thValue) {
						columnBasis = {
							thValue: thValue,
							index: data.index,
						}
					}
				});

			columnBasis = columnBasis.index;
		}

		highlightColumnBasis(lastHtmlTable, columnBasis);

		//
		// Find row basis
		//
		const columnElements = lastStep.table.map(
			(row, index) => {
				return { value: row[1], index: index };
			}
		).slice(2);
		const negativeElementsColumn = columnElements.filter( obj => obj.value.compare(0) < 0 );

		let rowBasis = null;
		if (negativeElementsColumn.length === 1) {

			rowBasis = negativeElementsColumn[0].index;

		} else if (negativeElementsColumn.length > 1) {

			negativeElementsColumn.forEach(data => {
				const thValue = parseIntFromTH(lastStep.table[data.index][0]);

				if (rowBasis === null) {
					rowBasis = {
						thValue: thValue,
						index: data.index,
					}
				} else if (rowBasis.thValue > thValue) {
					rowBasis = {
						thValue: thValue,
						index: data.index,
					}
				}
			});

			rowBasis = rowBasis.index;
		} else {

			columnElements.forEach(data => {
				const attitude = lastStep.table[data.index][columnBasis] / lastStep.table[data.index][1];

				if (rowBasis === null) {
					rowBasis = {
						index: data.index,
						attitude: attitude
					};
				} else if (rowBasis.attitude < attitude) {
					rowBasis = {
						index: data.index,
						attitude: attitude
					};
				}
			});

			rowBasis = rowBasis.index;
		}

		highlightRowBasis(lastHtmlTable, rowBasis);

		lastStep.basis = {
			row: rowBasis,
			column: columnBasis
		}

		const nextStep = {
			secondary: true,
			step: lastStep.step,
			basis: lastStep.basis,

			table: [],
		}

		const lambda = lastStep.table[rowBasis][columnBasis];

		const tmpTable = lastStep.table.map( arr => arr.slice() );

		tmpTable[rowBasis][columnBasis] = lambda.inverse();

		tmpTable[rowBasis] = tmpTable[rowBasis].map( (value, index) => {
			if (index === columnBasis || index === 0) {
				return value;
			} else {
				return value.div( lambda );
			}
		});

		for (let index = 1; index < tmpTable.length; index++) {
			if (index !== rowBasis) {
				tmpTable[index][columnBasis] = tmpTable[index][columnBasis].div( lambda.neg() );
			}
		}

		for (let index = 1; index < tmpTable.length; index++) {
			if (index === rowBasis) continue;
			for (let jndex = 1; jndex < tmpTable[index].length; jndex++) {
				if (jndex === columnBasis) continue;

				tmpTable[index][jndex] = lastStep.table[rowBasis][jndex].mul( tmpTable[index][columnBasis] );
			}
		}

		nextStep.table = tmpTable;
		const stepTable = generateTable({
			tableContent: fractionTableToStrings(tmpTable)
		});
		stepTable.classList.add(`step${nextStep.step}`);
		stepTable.classList.add('secondary');
		outputContainer.insertBefore( stepTable, stepButton );
		
		solveSteps.push( nextStep );

	} else {

		const penultimateStep = solveSteps[solveSteps.length - 2];

		const nextStep = {
			secondary: false,
			step: lastStep.step + 1,
			basis: {
				row: null,
				column: null
			},

			table: [],
		}

		const tmpTable = lastStep.table.map( arr => arr.slice() );
		for (let index = 1; index < tmpTable.length; index++) {
			if (index === lastStep.basis.row) continue;
			for (let jndex = 1; jndex < tmpTable[index].length; jndex++) {
				if (jndex === lastStep.basis.column) continue;

				tmpTable[index][jndex] = lastStep.table[index][jndex].add( penultimateStep.table[index][jndex] );
			}
		}

		const tmp = tmpTable[lastStep.basis.row][0];
		tmpTable[lastStep.basis.row][0] = tmpTable[0][lastStep.basis.column];
		tmpTable[0][lastStep.basis.column] = tmp;

		nextStep.table = tmpTable;
		const stepTable = generateTable({
			tableContent: fractionTableToStrings(tmpTable)
		});
		stepTable.classList.add(`step${nextStep.step}`);
		stepTable.classList.add('main');
		outputContainer.insertBefore( stepTable, stepButton );
		
		solveSteps.push( nextStep );

		checkTable();
	}

	window.scrollTo(0, document.body.scrollHeight);
}

const checkTable = () => {
	const lastStep = solveSteps[solveSteps.length - 1];

	let notNegative = true;
	let areInt = true;

	for (let index = 1; index < ELEMS_IN_ROW; index++) {
		const element = lastStep.table[1][index];
		if (element.compare(0) < 0) {
			notNegative = false;
		}
		if (element.d !== 1) {
			areInt = false;
		}
	}

	for (let index = 2; index < lastStep.table.length; index++) {
		const element = lastStep.table[index][1];
		if (element.compare(0) < 0) {
			notNegative = false;
		}
		if (element.d !== 1) {
			areInt = false;
		}
	}

	if (notNegative) {
		if (areInt) {
			const message = document.createElement('p');
			message.innerHTML = 'Time to check if the conditions are met';

			const yesButton = document.createElement('button');
			yesButton.innerHTML = 'Solution finished';
			yesButton.addEventListener('click', e => {
				clearMessage(e);
				solutionFinished(e);
			});

			const notButton = document.createElement('button');
			notButton.innerHTML = 'Need to add a row';
			notButton.addEventListener('click', e => {
				clearMessage(e);
				appendNegativeRow(e);
			});

			const messageContainer = document.createElement('div');
			messageContainer.classList.add('message--container');

			messageContainer.appendChild(message);
			messageContainer.appendChild(yesButton);
			messageContainer.appendChild(notButton);

			outputContainer.insertBefore( messageContainer, stepButton );

			stepButton.hidden = true;
		} else {
			appendFractionalRow();
		}
	}
}

stepButton.addEventListener('click', countNextStep);

const clearMessage = e => {
	e.target.parentNode.remove();
}

const solutionFinished = () => {
	const message = document.createElement('p');
	message.innerHTML = 'Congratulations!';

	outputContainer.insertBefore( message, stepButton );
}

const appendNegativeRow = () => {
	const lastStep = solveSteps[solveSteps.length - 1];

	const nextStep = {
		secondary: false,
		step: lastStep.step + 1,
		basis: {
			row: null,
			column: null
		},

		table: lastStep.table.map( arr => arr.slice() ),
	}

	let maximumIndex = -1;

	for (let index = 1; index < nextStep.table[0].length; index++) {
		const indexValue = parseIntFromTH(nextStep.table[0][index]);
		if (indexValue > maximumIndex) {
			maximumIndex = indexValue;
		}
	}

	for (let index = 2; index < nextStep.table.length; index++) {
		const indexValue = parseIntFromTH(nextStep.table[index][0]);
		if (indexValue > maximumIndex) {
			maximumIndex = indexValue;
		}
	}

	nextStep.table.push([`x${maximumIndex + 1}`, new Fraction(-1), new Fraction(-1), new Fraction(-1)]);

	const stepTable = generateTable({
		tableContent: fractionTableToStrings(nextStep.table)
	});
	stepTable.classList.add(`step${nextStep.step}`);
	stepTable.classList.add('negative-row');
	outputContainer.insertBefore( stepTable, stepButton );

	solveSteps.push( nextStep );

	stepButton.hidden = false;
}

const appendFractionalRow = () => {
	const lastStep = solveSteps[solveSteps.length - 1];

	const nextStep = {
		secondary: false,
		step: lastStep.step + 1,
		basis: {
			row: null,
			column: null
		},

		table: lastStep.table.map( arr => arr.slice() ),
	}

	let maximumIndex = -1;

	for (let index = 1; index < nextStep.table[0].length; index++) {
		const indexValue = parseIntFromTH(nextStep.table[0][index]);
		if (indexValue > maximumIndex) {
			maximumIndex = indexValue;
		}
	}

	let rows = [];

	for (let index = 2; index < nextStep.table.length; index++) {
		const indexValue = parseIntFromTH(nextStep.table[index][0]);
		
		rows.push({
			index: index,
			Xindex: indexValue,
			zeros: nextStep.table[index].filter(element => element === 0)
		});

		if (indexValue > maximumIndex) {
			maximumIndex = indexValue;
		}
	}

	rows = rows.filter(element => element.zeros.length === 0);
	rows.sort((element1, element2) => element1.Xindex - element2.Xindex);

	nextStep.table.push(
		[`x${maximumIndex + 1}`]
			.concat(
				nextStep.table[rows[0].index].slice(1).map( element => element.floor().sub(element) )
			)
	);

	const stepTable = generateTable({
		tableContent: fractionTableToStrings(nextStep.table)
	});
	stepTable.classList.add(`step${nextStep.step}`);
	stepTable.classList.add('fractional-row');
	outputContainer.insertBefore( stepTable, stepButton );

	solveSteps.push( nextStep );
}