'use strict'

var addons = require('./dist/react');
Object.keys(addons).forEach(function (key) {exports[key] = addons[key]});