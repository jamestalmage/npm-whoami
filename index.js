'use strict';
var exec = require('child_process').exec;
var which = require('which');
var assert = require('assert');

module.exports = whoami;

function whoami(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = {};
  }
  var timeout = opts.timeout || 10000;
  assert('number', typeof timeout, 'timeout');

  which('npm', callNpm);

  function callNpm(err, pathToNpm) {
    if (err) {
      return cb(err);
    }
    var cmd = pathToNpm + ' whoami';
    if (opts.registry) {
      cmd += ' --registry ' + opts.registry;
    }
    exec(cmd, {encoding:'utf8', timeout:timeout}, handleResult);
  }

  function handleResult(err, stdout, stderr) {
    var old = cb;
    cb = function() {};
    old(err, stdout && stdout.trim());
  }
}
