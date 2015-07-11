'use strict';
var fork  = require('child_process').fork;
var path = require('path');
var config = require('./sinopia-config');

module.exports.start = start;
module.exports.stop = stop;

var childProcess;

var binPath = path.resolve(path.dirname(require.resolve('sinopia')), 'bin/sinopia');

config(path.resolve(__dirname, '../../sinopia'));

function start(cb) {
  if (childProcess) {
    throw new Error('childProcess already running');
  }

  childProcess = fork(binPath, [
    '-c', path.join(__dirname, '../../sinopia/config.yaml'),
    '-l', '55550'
  ]);

  childProcess.on('message', function(msg) {
    if ('sinopia_started' in msg) {
      var old = cb;
      cb = function() {};
      if (old) {
        old();
      }
    }
  });

  childProcess.on('error', function(err) {
    throw err;
  });
}

function stop (cb) {
  if (childProcess) {
    if (cb) {
      childProcess.on('close', cb);
      childProcess.on('error', cb);
    }
    childProcess.kill();
  }
  childProcess = null;
}
process.on('exit', stop);
