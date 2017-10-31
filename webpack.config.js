const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isProduction = process.argv.indexOf('-p') !== -1;
const glob = require("glob");

const themes = glob.sync('src/themes/*.scss').map(fileName => fileName.replace(/(.+\/)|(\.scss)/g , ''));

const themeExtractors = themes.map(themeName => new ExtractTextPlugin({
	filename:function(getPath) {
		return getPath("themes/" + themeName + (isProduction ? '.min' : '') + ".css");
	}
}));

const extractCSS = new ExtractTextPlugin({
	filename:function(getPath) {
		return getPath("[name]" + (isProduction ? '.min' : '') + ".css");
	}
});

const plugins = [
	...themeExtractors ,
	extractCSS
];

if ( isProduction ) {
	plugins.push(new UglifyJSPlugin({
		uglifyOptions:{
			compress:true ,
			output:{
				comments:false
			}
		}
	}));
}
const outputFilename = !isProduction ? '[name].js' : '[name].min.js';

module.exports = [
	{
		entry:{
			'editable-content':[
				'./src/EditableContent.scss' ,
				...(themes.map(themeName => './src/themes/' + themeName + '.scss')) ,
				'./src/EditableContent.js'
			]
		} ,
		output:{
			path:path.resolve('./dist') ,
			filename:outputFilename ,
			library:'EditableContent' ,
			libraryTarget:'var'
		} ,
		externals:{
			'react':'React' ,
			'draft-js':'Draft' ,
			'draft-convert':'DraftConvert' ,
			'jquery':'$'
		} ,
		module:{
			rules:[
				{test:/\.(jpg|png|svg)$/ , loader:'url-loader'} ,
				{test:/\.(js|jsx)$/ , loader:'babel-loader' , exclude:/node_modules/} ,
				...(themes.map((themeName , index) => ({test:new RegExp(themeName + "\.scss$") , use:themeExtractors[index].extract(['css-loader' , 'sass-loader'])}))) ,
				{test:/EditableContent\.scss$/ , loader:extractCSS.extract(['css-loader' , 'sass-loader'])}
			]
		} ,
		plugins:plugins
	} ,

	// build as umd module
	{
		entry:{
			'editable-content':'./src/EditableContent.js'
		} ,
		output:{
			path:path.resolve('./dist') ,
			filename:'[name].umd.js' ,
			library:'EditableContent' ,
			libraryTarget:'umd'
		} ,
		externals:{
			'react':'react' ,
			'draft-js':'draft-js' ,
			'draft-convert':'draft-convert' ,
			'jquery':'jquery'
		} ,
		module:{
			rules:[
				{test:/\.(jpg|png|svg)$/ , loader:'url-loader'} ,
				{test:/\.(js|jsx)$/ , loader:'babel-loader' , exclude:/node_modules/}
			]
		}
	}
]