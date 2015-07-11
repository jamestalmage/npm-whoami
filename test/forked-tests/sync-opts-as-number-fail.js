'use strict';
var npmWoami = require('../..');

try {
  npmWoami.sync(3000);
} catch (e) {
  process.send('failed');
}
