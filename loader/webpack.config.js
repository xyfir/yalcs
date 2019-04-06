require('dotenv').config();
require('enve');

const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,

  entry: './loader.ts',

  output: {
    libraryTarget: 'umd',
    filename: 'yalcs-loader.js',
    library: 'YALCSLoader',
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.ts']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            ['@babel/preset-typescript', { allExtensions: true }],
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: [
                    'last 3 Chrome versions',
                    'last 3 Firefox versions'
                  ]
                }
              }
            ]
          ]
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
