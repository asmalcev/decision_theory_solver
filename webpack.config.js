const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	plugins: [ new MiniCssExtractPlugin({
		filename: '[name].css',
		chunkFilename: '[id].css',
	}) ],

	entry: {
		index: './src/js/index.js',
		equation: './src/js/equations.js',
		strategy_matrix_games: './src/js/strategy_matrix_games.js'
	},
	output: {
		path: path.resolve(__dirname, 'build'), 
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			}
		]
	}
}