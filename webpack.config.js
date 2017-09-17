
const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    watch: true,
    module: {
        loaders: [
            {
                'test': /\.tsx?/,
                'loaders': ['babel-loader', 'ts-loader'],
                'exclude': [/node_modules/, nodeModulesPath]
            },
            {
                'test': /\.(jsx?)$/,
                'loaders': ['babel'],
                'exclude': [/node_modules/, nodeModulesPath]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
};
