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
    childProcess.send({
      username: username,
      timeout: timeout || 0
    });
  }

  function opts(timeout) {
    var o = {registry: 'http://localhost:55550'};
    if (timeout) {
      o.timeout = timeout;
    }
    return o;
  }

  it('jane.doe', function(done) {
    setup('jane.doe');
    npmWhoami(opts(), function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe', function(done) {
    setup('john.doe');
    npmWhoami(opts(), function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'john.doe');
      done();
    });
  });

  it('unauth - bad return value', function(done) {
    setup(null);
    npmWhoami(opts(), function(err, result) {
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
    npmWhoami(opts(3000), function(err, result) {
      assert(err);
      done();
    });
  });

  it('long timeout - passes', function(done) {
    setup('james.talmage', 4000);
    npmWhoami(opts(5500), function(err, result) {
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

  describe('sync', function() {
    it('jane.doe', function() {
      setup('jane.doe');
      var name = npmWhoami.sync(opts());
      assert.equal(name, 'jane.doe');
    });

    it('john.doe', function() {
      setup('john.doe');
      var name = npmWhoami.sync(opts());
      assert.equal(name, 'john.doe');
    });

    it('unauth - bad return value', function() {
      setup(null);
      try {
        npmWhoami.sync(opts());
      } catch (e) {
        return;
      }
      assert.fail('should have thrown');
    });

    it('unauth - not logged in', function() {
      setup(null);
      try {
        npmWhoami.sync();
      } catch (e) {
        return;
      }
      assert.fail('should have thrown');
    });

    it('long timeout - fails', function() {
      setup('james.talmage', 4000);
      try {
        npmWhoami.sync(opts(3000));
      } catch (e) {
        return;
      }
      assert.fail('should have thrown');
    });

    it('long timeout - passes', function() {
      setup('james.talmage', 4000);
      var name = npmWhoami.sync(opts(5500));
      assert.equal('james.talmage', name);
    });
  });

});
