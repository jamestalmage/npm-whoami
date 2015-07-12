'use strict';
var assert = require('assert');
var npmWhoami = require('../');
var path = require('path');
var proxyquire = require('proxyquire');
var fork = require('child_process').fork;
var semver = require('semver');

var REGISTRY = 'http://localhost:55550';
var FIXTURE_DIR = path.resolve(__dirname, 'fixture');

describe('npm-whoami', function() {
  this.timeout(10000);
  this.slow(7000);
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
    process.chdir(FIXTURE_DIR);
  });

  function setup(username, timeout) {
    childProcess.send({
      username: username,
      timeout: timeout || 0
    });
  }

  function opts(timeout) {
    var o = {registry: REGISTRY};
    if (timeout) {
      o.timeout = timeout;
    }
    return o;
  }

  it('jane.doe - registry url set in object', function(done) {
    setup('jane.doe');
    npmWhoami(opts(), function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe - registry url set as string', function(done) {
    setup('john.doe');
    npmWhoami(REGISTRY, function(err, result) {
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

  runFork({
    description: 'pass timeout as the only argument',
    file: 'opts-as-number-pass-john.doe.js',
    username: 'john.doe',
    timeout: 4000,
    code: 0,
    expect: 'passed'
  });

  runFork({
    description: 'pass timeout as the only argument - fails',
    file: 'opts-as-number-fail.js',
    username: 'james.talmage',
    timeout: 4000,
    code: 0,
    expect: 'failed'
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

  if (semver.gte(process.version, '0.11.0')) {
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

      runFork({
        description:'pass timeout as the only argument',
        file:'sync-opts-as-number-pass-jane.doe.js',
        username: 'jane.doe',
        timeout: 4000,
        code: 0,
        expect: 'passed'
      });

      runFork({
        description:'pass timeout as the only argument - fails',
        file:'sync-opts-as-number-fail.js',
        username: 'james.talmage',
        timeout: 4000,
        code: 0,
        expect: 'failed'
      });
    });
  } else {
    it('throws on old versions of node', function() {
      try {
        npmWhoami.sync();
      } catch (e) {
        assert(/sync mode not supported/.test(e.message), 'bad message: ' + e.message);
        return;
      }
      assert.fail('should have thrown');
    });

  }

  // runs a test in a forked process.
  // necessary for when we want to set registry url via `.npmrc`,
  // instead of explicitly passing an argument.
  function runFork(opts, exclusive) {
    (exclusive ? it.only : it)(opts.description, function(_done) {
      setup(opts.username, opts.timeout);
      var message = 'no_message';
      var mulitpleMessages = false;
      var env = {};
      for (var key in process.env) {
        // Strip all the `npm_config*` environment variables out,
        // or they will interfere with fixtures `.npmrc` file
        if (process.env.hasOwnProperty(key) && !/^npm_config/i.test(key)) {
          env[key] = process.env[key];
        }
      }
      env.HOME = FIXTURE_DIR;
      var forkedTest = fork(
        __dirname + '/forked-tests/' + opts.file,
        [],
        {
          env: env,
          cwd: FIXTURE_DIR
        });

      forkedTest.on('message', function(m) {
        if (mulitpleMessages) {
          _done(new Error('received multiple messages'));
        }
        mulitpleMessages = true;
        message = m;
      });

      forkedTest.on('exit', function(code) {
        assert.equal(opts.code, code);
        assert.equal(opts.expect, message);
        _done();
      });
    });
  }

  /* jshint ignore:start */
  function xrunFork(opts) {
    xit(opts.description);
  }
  /* jshint ignore:end */

  runFork.only = function(opts) {
    runFork(opts, true);
  };
});
