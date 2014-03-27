'use strict';


var http = require('http'),
    auth = require('./http-digest-auth');


var realm = 'Admin section';
var users = {
  'admin': 'df612ed72c77e5b55021809a58799711', // This is the output of: auth.passhash('Admin section', 'admin', 'password')
  'erik':  auth.passhash(realm, 'erik', 'hello')
};


var server = http.createServer(function(req, res) {
  var username = auth.login(req, res, realm, users);

  if (username === false) {
    // The request is already finished so we can just return here.
    return;
  }

  console.log('Logged in as: '+username);

  res.end('Logged in as: '+username);
});

server.listen(8080);

