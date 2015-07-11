'use strict';
var assert = require('assert');
var npmWhoami = require('../');
var sinopia = require('./lib/sinopia');
var path = require('path');
var proxyquire = require('proxyquire');

describe('npm-whoami', function() {
  this.timeout(10000);
  var originalDirectory;

  before(function(done) {
    originalDirectory = process.cwd();
    sinopia.start(done);
  });

  after(function(done) {
    process.chdir(originalDirectory);
    sinopia.stop(done);
  });

  function chdir(name) {
    process.chdir(path.resolve(__dirname, 'fixture', name));
  }

  it('jane.doe', function(done) {
    chdir('jane');
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'jane.doe');
      done();
    });
  });

  it('john.doe', function(done) {
    chdir('john');
    npmWhoami({registry: 'http://localhost:55550'}, function(err, result) {
      assert.ifError(err);
      assert.equal(result, 'john.doe');
      done();
    });
  });

  it('unauth', function(done) {
    chdir('unauth');
    npmWhoami(function(err, result) {
      assert(err);
      //assert.strictEqual(result, null);
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
