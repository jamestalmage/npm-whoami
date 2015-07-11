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
  var handleResponse;

  var app = express();

  app.get('/whoami', function(req, res, next) {
    handleResponse(res, next);
  });

  app.get('/-/whoami', function(req, res, next) {
    handleResponse(res, next);
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
    process.chdir(path.resolve(__dirname, 'fixture'));
    handleResponse = function(res, next) {
      res.json({username:username});
      next();
    };
  });

  it('jane.doe', function(done) {
    username = 'jane.doe';
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe', function(done) {
    username = 'john.doe';
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'john.doe');
      done();
    });
  });

  it('unauth - bad return value', function(done) {
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert(err);
      done();
    });
  });

  it('unauth - not logged in', function(done) {
    npmWhoami(function(err, result) {
      if (!err) {
        assert.fail('This test will fail if you are logged into npm: YOU ARE: '  + result);
      }
      done();
    });
  });

  it('long timeout - fails', function(done) {
    handleResponse = function(res, next) {
      setTimeout(function() {
        res.json({username:'james.talmage'});
        next();
      }, 4000);
    };
    npmWhoami({timeout:3000, registry:'http://localhost:55550'}, function(err, result) {
      assert(err);
      done();
    });
  });

  it('long timeout - passes', function(done) {
    handleResponse = function(res, next) {
      setTimeout(function() {
        res.json({username:'james.talmage'});
        next();
      }, 4000);
    };
    npmWhoami({timeout:5500, registry:'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal('james.talmage', result);
      done();
    });
  });

  it("can't find npm executable", function(done) {
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
