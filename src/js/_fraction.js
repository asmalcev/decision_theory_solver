const Fraction = require('fraction.js');

const tableToFraction = table => {
	for (let i = 1; i < table.length; i++) {
		for (let j = 1; j < table[0].length; j++) {
			table[i][j] = new Fraction( table[i][j] );
		}
	}
}

const fractionTableToStrings = table =>
	table.map( row => row.map(element => typeof element === 'string' ? element : element.toString()) );

export {
	Fraction,
	tableToFraction,
	fractionTableToStrings,
};