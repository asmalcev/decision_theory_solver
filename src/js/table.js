// const initTableContent = [
// 	['', '1', 'x1', 'x2'],
// 	['q', '', '', ''],
// ];

const initTableContent = [
	['',   '1',  'x1', 'x2'],
	['q',  '0',  '-1',  '-3'],
	['x3', '1',  '-1',  '1'],
	['x4', '-6', '2',   '-4'],
	['x5', '16', '1',   '2'],
];

// const initTableContent = [
// 	['',   '1',  'x1', 'x2'],
// 	['q',  '0',  '-3',  '-1'],
// 	['x3', '2',  '-1',  '2'],
// 	['x4', '4',  '1',  '-1'],
// ];

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

const createInputWithValue = (value, row, column, type = 'text', placeholder = 'x') => {
	const input = document.createElement('input');

	input.setAttribute('type', type);
	if (type === 'number') {
		input.setAttribute('step', '0.0000000000000001');
	}
	input.setAttribute('required', 'true');
	input.setAttribute('placeholder', placeholder);
	input.dataset.row = row;
	input.dataset.column = column;

	input.addEventListener('input', updateCell);

	input.value = value;

	return input;
}

const generateTable = (tableContent, initial = false) => {
	const table = document.createElement('div');
	table.classList.add('grid-table');

	for (const rowIndex in tableContent) {
		if (rowIndex == 0) {

			tableContent[rowIndex].forEach((data, cellIndex) => {
				const cell = document.createElement('div');
				cell.classList.add('headcell');

				if (initial && cellIndex > 1) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex) );
				} else {
					cell.innerHTML = cellIndex > 1 ? `-${data}` : data;
				}
				table.appendChild( cell );
			});

		} else {
			tableContent[rowIndex].forEach((data, cellIndex) => {
				const cell = document.createElement('div');
				cell.classList.add(cellIndex === 0 ? 'headcell' : 'cell');

				if (
					initial && rowIndex != 1 && cellIndex === 0
				) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex) );

				} else if (
					initial && cellIndex !== 0
				) {
					cell.appendChild( createInputWithValue(data, rowIndex, cellIndex, 'number', 0) );

				} else {
					cell.innerHTML = String(data).slice(0, 8);
				}

				table.appendChild( cell );
			});

			if (initial && rowIndex > 1) {
				const deleteButton = document.createElement('button');
				deleteButton.classList.add('delete-button');
				deleteButton.innerHTML = 'Delete';

				deleteButton.addEventListener('click', e => {
					e.preventDefault();

					deleteRow(rowIndex);
				});
				
				table.children[table.children.length - 1].appendChild(deleteButton);
			}
		}
	}

	if (initial) {
		const createButton = document.createElement('button');
		createButton.classList.add('create-button');
		createButton.innerHTML = 'Add new row';

		createButton.addEventListener('click', e => {
			e.preventDefault();

			addRow();
		});

		const createButtonContainer = document.createElement('div');
		createButtonContainer.classList.add('create-button--container');
		createButtonContainer.appendChild( createButton );

		table.appendChild( createButtonContainer );
	}

	return table;
}

export {
	generateTable,
	initTableContent
};