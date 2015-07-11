'use strict';
var exec = require('child_process').exec;
var which = require('which');

module.exports = whoami;

function whoami(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = {};
  }

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
  }

  function handleResult(err, stdout, stderr) {
    cb(err, stdout && stdout.trim());
  }
}
