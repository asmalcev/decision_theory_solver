const tableContainer  = document.querySelector('#init-table-container');
const outputContainer = document.querySelector('#output-container');
const stepButton      = document.createElement('button');
stepButton.id = 'next-step-button';
stepButton.innerHTML = 'Next step';

const initTableContent = [
	['', '1', 'x1', 'x2'],
	['q', '', '', ''],
];

// const initTableContent = [
// 	['',   '1',  'x1', 'x2'],
// 	['q',  '0',  '-1',  '-3'],
// 	['x3', '1',  '-1',  '1'],
// 	['x4', '-6', '2',   '-4'],
// 	['x5', '16', '1',   '2'],
// ];

const solveSteps = [];

const generateTable = (tableContent, initial = false) => {
	const table = document.createElement('table');

	for (const rowIndex in tableContent) {
		if (rowIndex == 0) {
			const row = document.createElement('tr');

			tableContent[rowIndex].forEach((data, cellIndex) => {
				const cell = document.createElement('th');

				if (initial && cellIndex > 1) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex) );
				} else {
					cell.innerHTML = cellIndex > 1 ? `-${data}` : data;
				}
				row.appendChild( cell );
			});

			table.appendChild( row );
		} else {
			const row = document.createElement('tr');

			tableContent[rowIndex].forEach((data, cellIndex) => {
				const cell = cellIndex === 0 ? document.createElement('th') : document.createElement('td');

				if (
					initial && rowIndex != 1 && cellIndex === 0
				) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex) );

				} else if (
					initial && cellIndex !== 0
				) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex, 'number') );

				} else {
					cell.innerHTML = data;
				}

				row.appendChild( cell );
			});

			if (initial && rowIndex > 1) {
				const deleteButton = document.createElement('button');
				deleteButton.classList.add('delete-button');
				deleteButton.innerHTML = 'Delete';

				deleteButton.addEventListener('click', e => {
					e.preventDefault();

					deleteRow(rowIndex);
				});
				
				row.appendChild(deleteButton);
			}

			table.appendChild( row );
		}
	}

	if (initial) {
		const row = document.createElement('tr');

		const createButton = document.createElement('button');
		createButton.classList.add('create-button');
		createButton.innerHTML = 'Add new row';

		createButton.addEventListener('click', e => {
			e.preventDefault();

			addRow();
		});

		row.appendChild(createButton);

		table.appendChild( row );
	}

	return table;
}

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

const createInputWithValue = (value, row, column, type = 'text') => {
	const input = document.createElement('input');

	input.setAttribute('type', type);
	if (type === 'number') {
            input.setAttribute('step', '0.0000000000000001');
	}
	input.setAttribute('required', 'true');
	input.dataset.row = row;
	input.dataset.column = column;

	input.addEventListener('input', updateCell);

	input.value = value;

	return input;
}

tableContainer.addEventListener('submit', e => {
	e.preventDefault();

	tableContainer.innerHTML = '';
	outputContainer.appendChild( stepButton );
	outputContainer.appendChild( generateTable(initTableContent) );

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
	tableContainer.appendChild( generateTable(initTableContent, true) );

	const submitButton = document.createElement('button');
	submitButton.setAttribute('type', 'submit');
	submitButton.innerHTML = 'Submit';

	tableContainer.appendChild(submitButton);
}

loadInitTable();

const parseIntFromTH = thString => Number.parseInt(thString.match(/\d+/)[0]);

const countNextStep = () => {
	const htmlTables = document.querySelectorAll('table');
	const lastHtmlTable = htmlTables[htmlTables.length - 1];

	const lastStep = solveSteps[solveSteps.length - 1];

	if (!lastStep.secondary) {

		//
		// Find column basis
		//
		const row = lastStep.table[1];
		const rowElements = row.map(
			(value, index) => {
				return { value: Number.parseFloat(value), index: index};
			}
		).slice(2);
		const negativeElementsRow = rowElements.filter( obj => obj.value < 0 );

		let columnBasis = null;
		if (negativeElementsRow.length === 1) {

			columnBasis = negativeElementsRow[0].index;

		} else {

			(negativeElementsRow.length === 0 ? rowElements : negativeElementsRow)
				.forEach(data => {
					thValue = parseIntFromTH(lastStep.table[0][data.index]);

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

		lastHtmlTable.children[0].children[columnBasis].setAttribute('style', 'color:red');

		//
		// Find row basis
		//
		const columnElements = lastStep.table.map(
			(row, index) => {
				return { value: row[1], index: index };
			}
		).slice(2);
		const negativeElementsColumn = columnElements.filter( obj => obj.value < 0 );

		let rowBasis = null;
		if (negativeElementsColumn.length === 1) {

			rowBasis = negativeElementsColumn[0].index;

		} else if (negativeElementsColumn.length > 1) {

			negativeElementsColumn.forEach(data => {
				thValue = parseIntFromTH(lastStep.table[data.index][0]);

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

		lastHtmlTable.children[rowBasis].children[0].setAttribute('style', 'color:red');

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

		tmpTable[rowBasis][columnBasis] = 1 / lambda;

		tmpTable[rowBasis] = tmpTable[rowBasis].map( (value, index) => {
			if (index === columnBasis || index === 0) {
				return value;
			} else {
				return value / lambda;
			}
		});

		for (let index = 1; index < tmpTable.length; index++) {
			if (index !== rowBasis) {
				tmpTable[index][columnBasis] = tmpTable[index][columnBasis] / -lambda;
			}
		}

		for (let index = 1; index < tmpTable.length; index++) {
			if (index === rowBasis) continue;
			for (let jndex = 1; jndex < tmpTable[index].length; jndex++) {
				if (jndex === columnBasis) continue;

				tmpTable[index][jndex] = lastStep.table[rowBasis][jndex] * tmpTable[index][columnBasis];
			}
		}

		nextStep.table = tmpTable;
		outputContainer.appendChild( generateTable(tmpTable) );
		
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

				tmpTable[index][jndex] = Number.parseFloat(lastStep.table[index][jndex]) + Number.parseFloat(penultimateStep.table[index][jndex]);
			}
		}

		const tmp = tmpTable[lastStep.basis.row][0];
		tmpTable[lastStep.basis.row][0] = tmpTable[0][lastStep.basis.column];
		tmpTable[0][lastStep.basis.column] = tmp;

		nextStep.table = tmpTable;
		outputContainer.appendChild( generateTable(tmpTable) );
		
		solveSteps.push( nextStep );

	}
}

stepButton.addEventListener('click', countNextStep);
