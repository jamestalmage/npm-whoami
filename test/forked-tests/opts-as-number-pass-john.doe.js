'use strict';
var npmWoami = require('../..');
var assert = require('assert');

npmWoami(55000, function(err, result) {
  assert.ifError(err);
  assert.equal('john.doe', result);
  process.send('passed');
});
