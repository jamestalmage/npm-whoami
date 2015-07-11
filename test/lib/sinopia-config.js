'use strict';
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = function(_dir) {

  var dir = path.resolve(_dir || 'sinopia');
  var storage = path.resolve(dir, 'storage');
  var dbJson = path.resolve(storage, '.sinopia-db.json');
  var htpasswd = path.resolve(dir, 'htpasswd');
  var configPath = path.resolve(dir, 'config.yaml');

  mkdirp.sync(storage);

  fs.writeFileSync(htpasswd, fs.readFileSync(__dirname + '/htpasswd'));
  fs.writeFileSync(dbJson, fs.readFileSync(__dirname + '/.sinopia-db.json'));

  var conf = [
    'storage: ' + storage,

    'auth:',
    '  htpasswd:',
    '    file: ' + htpasswd,

    'uplinks:',
    '  npmjs:',
    '    url: https://registry.npmjs.org',

    'packages:',
    "  '@*/*':",
    '    access: $all',
    '    publish: $authenticated',
    "  '*':",
    '    access: $all',
    '    publish: $authenticated',
    '    proxy: npmjs',

    'logs:',
    '  - {type: stdout, format: pretty, level: http}'
  ];

  fs.writeFileSync(configPath, conf.join('\n'));
};

