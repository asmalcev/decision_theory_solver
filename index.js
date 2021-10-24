const tableContainer  = document.querySelector('#init-table-container');
const outputContainer = document.querySelector('#output-container');
const stepButton      = document.createElement('button');
stepButton.id = 'next-step-button';
stepButton.innerHTML = 'Next step';

// const initTableContent = [
// 	['', '1', '-x1', '-x2'],
// 	['q', '', '', ''],
// ];

const initTableContent = [
	['',   '1',  '-x1', '-x2'],
	['q',  '0',  '-1',  '-3'],
	['x3', '1',  '-1',  '1'],
	['x4', '-6', '2',   '-4'],
	['x5', '16', '1',   '2'],
];

const solveSteps = [];

const generateTable = (tableContent, initial = false) => {
	const table = document.createElement('table');

	for (const rowIndex in tableContent) {
		if (rowIndex == 0) {
			const row = document.createElement('tr');

			tableContent[rowIndex].forEach(data => {
				const cell = document.createElement('th');
				cell.innerHTML = data;
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

	solveSteps.push(initTableContent);
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

	const lastTable = solveSteps[solveSteps.length - 1];

	const row = lastTable[1];
	const negativeElements = row.map(
		(value, index) => { return { value: Number.parseFloat(value), index: index}; }
	).slice(2).filter( obj => obj.value < 0 );

	let basic = null;
	if (negativeElements.length === 1) {
		basic = {
			thValue: null,
			index: negativeElements[0].index,
		}
	} else {
		negativeElements.forEach(data => {
			thValue = parseIntFromTH(lastTable[0][data.index]);

			if (basic === null) {
				basic = {
					thValue: thValue,
					index: data.index,
				}
			} else if (basic.thValue > thValue) {
				basic = {
					thValue: thValue,
					index: data.index,
				}
			}
		});
	}

	lastHtmlTable.children[0].children[basic.index].setAttribute('style', 'color:red')
}

stepButton.addEventListener('click', countNextStep);