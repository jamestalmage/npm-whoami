'use strict';
var express = require('express');

var app = express();

var username;
var timeout;
var server;

app.get('/whoami', handleResponse);

app.get('/-/whoami', handleResponse);

function handleResponse(req, res, next) {
  setTimeout(function() {
    res.json({username:username});
    next();
  }, timeout);
}

process.on('message', function(m) {
  username = m.username;
  timeout = m.timeout;
});

server = app.listen(55550, function(err) {
  if (err) {
    return process.exit(1);
  }
  process.send({message:'server_up'});
});
