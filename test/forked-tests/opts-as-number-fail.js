'use strict';
var npmWoami = require('../..');
var assert = require('assert');

npmWoami(3000, function(err, result) {
  assert(err, 'expected an error');
  process.send('failed');
});
