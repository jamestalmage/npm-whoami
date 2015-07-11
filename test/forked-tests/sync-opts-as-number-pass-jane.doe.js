'use strict';
var npmWoami = require('../..');
var assert = require('assert');

var name = npmWoami.sync(55000);
assert.equal('jane.doe', name);
process.send('passed');
