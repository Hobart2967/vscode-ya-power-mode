//@ts-check

'use strict';

const extensionConfig = require('./webpack.config.extension');
const browser = require('./webpack.config.browser');

module.exports = [ extensionConfig, browser ];