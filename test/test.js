'use strict';
var assert = require('assert');
var npmWhoami = require('../');
var path = require('path');
var proxyquire = require('proxyquire');
var express = require('express');

describe('npm-whoami', function() {
  this.timeout(10000);
  var originalDirectory;
  var username;
  var server;

  var app = express();

  app.get('/whoami', function(req, res) {
    res.json({username:username});
  });

  app.get('/-/whoami', function(req, res) {
    res.json({username:username});
  });

  before(function(done) {
    originalDirectory = process.cwd();
    server = app.listen(55550, done);
  });

  after(function(done) {
    process.chdir(originalDirectory);
    server.close(done);
  });

  beforeEach(function() {
    username = undefined;
  });

  function chdir(name) {
    process.chdir(path.resolve(__dirname, 'fixture', name));
  }

  it('jane.doe', function(done) {
    chdir('jane');
    username = 'jane.doe';
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe', function(done) {
    chdir('john');
    username = 'john.doe';
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'john.doe');
      done();
    });
  });

  it('unauth - bad return value', function(done) {
    chdir('unauth');
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert(err);
      done();
    });
  });

  it('unauth - not logged in', function(done) {
    chdir('unauth');
    npmWhoami(function(err, result) {
      if (!err) {
        assert.fail('This test will fail if you are logged into npm: YOU ARE: '  + result);
      }
      done();
    });
  });

  it("can't find npm", function(done) {
    var npmWhoami = proxyquire('../', {
      which: function(name, cb) {
        assert.equal('npm', name);
        setTimeout(function() {
          cb(new Error('npm not found'));
        });
      }
    });

    npmWhoami(function(err, result) {
      assert(err);
      done();
    });
  });

});
