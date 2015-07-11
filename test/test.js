'use strict';
var assert = require('assert');
var npmWhoami = require('../');
var path = require('path');
var proxyquire = require('proxyquire');
var fork = require('child_process').fork;

describe('npm-whoami', function() {
  this.timeout(10000);
  var originalDirectory;
  var childProcess;

  before(function(done) {
    originalDirectory = process.cwd();
    childProcess = fork(__dirname + '/lib/server.js');

    childProcess.once('message', function(m) {
      assert.equal(m.message, 'server_up');
      done();
    });
  });

  after(function() {
    process.chdir(originalDirectory);
    childProcess.kill();
  });

  beforeEach(function() {
    process.chdir(path.resolve(__dirname, 'fixture'));
  });

  function setup(username, timeout) {
    /*if ('function' === typeof timeout) {
      done = timeout;
      timeout = 0;
    } */
    childProcess.send({
      username: username,
      timeout: timeout || 0
    });
  }

  it('jane.doe', function(done) {
    setup('jane.doe');
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe', function(done) {
    setup('john.doe');
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'john.doe');
      done();
    });
  });

  it('unauth - bad return value', function(done) {
    setup(null);
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert(err);
      done();
    });
  });

  it('unauth - not logged in', function(done) {
    setup(null);
    npmWhoami(function(err, result) {
      if (!err) {
        assert.fail('This test will fail if you are logged into npm: YOU ARE: '  + result);
      }
      done();
    });
  });

  it('long timeout - fails', function(done) {
    setup('james.talmage', 4000);
    npmWhoami({timeout:3000, registry:'http://localhost:55550'}, function(err, result) {
      assert(err);
      done();
    });
  });

  it('long timeout - passes', function(done) {
    setup('james.talmage', 4000);
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
