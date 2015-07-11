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
  var timeoutObject;

  which('npm', callNpm);

  function callNpm(err, pathToNpm) {
    if (err) {
      return cb(err);
    }
    var cmd = pathToNpm + ' whoami';
    if (opts.registry) {
      cmd += ' --registry ' + opts.registry;
    }
    exec(cmd, {encoding:'utf8'}, handleResult);
    timeoutObject = setTimeout(function() {
      timeoutObject = null;
      handleResult(new Error(timeout + 'ms timeout exceeded'));
    }, timeout);
  }

  function handleResult(err, stdout, stderr) {
    var old = cb;
    cb = function() {};
    if (timeoutObject) {
      clearTimeout(timeoutObject);
      timeoutObject = null;
    }
    old(err, stdout && stdout.trim());
  }
}
