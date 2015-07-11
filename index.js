'use strict';
var exec = require('child_process').exec;
var which = require('which');
var assert = require('assert');

module.exports = whoami;

function whoami(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = null;
  }

  which('npm', callNpm);

  function callNpm(err, pathToNpm) {
    if (err) {
      return cb(err);
    }
    var callConfig = makeCallConfig(opts, pathToNpm);
    exec(callConfig.command, callConfig.execOpts, handleResult);
  }

  function handleResult(err, stdout, stderr) {
    cb(err, stdout && stdout.trim());
  }
}

function makeCallConfig(opts, pathToNpm) {
  opts = opts || {};
  var timeout = opts.timeout || 10000;
  assert('number', typeof timeout, 'timeout');

  var cmd = pathToNpm + ' whoami';
  if (opts.registry) {
    cmd += ' --registry ' + opts.registry;
  }

  return {
    command: cmd,
    execOpts: {encoding: 'utf8', timeout: timeout}
  };
}
