//@ts-check

'use strict';

const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const baseConfig = require("./webpack.config.base");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
module.exports = {
  ...baseConfig,
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: {
    'browser': './src/browser.ts',
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: [
          { loader: 'file-loader' },
          { loader: 'extract-loader' },
          { loader: "ejs-webpack-loader" }
        ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/sounds", to: "sounds" }
      ],
    }),
  ]
};