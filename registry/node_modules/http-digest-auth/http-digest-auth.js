'use strict';


var crypto = require('crypto');


// We store all "sessions" in here.
var nonces = {};



function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}


function getparts(req) {
  var parts = {
    'username': null,
    'realm':    null,
    'nonce':    null,
    'uri':      null,
    'response': null,
    'opaque':   null,
    'qop':      null,
    'nc':       null,
    'cnonce':   null
  };

  for (var k in parts) {
    // First check for ""
    var val = new RegExp(k+'="([^"]*)"').exec(req.headers.authorization);

    if (val == null) {
      // Some values are enclosed in ""
      val = new RegExp(k+'=([^,]*)').exec(req.headers.authorization);
    }

    if ((val == null) || (!val[1])) {
      // We need all parts.
      return false;
    }

    parts[k] = val[1];
  }

  return parts;
}


function auth401(req, res, realm, opaque, message) {
  var nonce = new Date().getTime();

  // The session times out after one hour.
  var timer = setTimeout(function() {
    delete nonces[opaque];
  }, 60*60*1000);

  nonces[opaque] = {
    n:     nonce,
    timer: timer
  };

  res.writeHead(401, {
    'Content-Type': 'text/html',
    'WWW-Authenticate': 'Digest realm="'+realm+'",qop="auth",nonce="'+nonce+'",opaque="'+opaque+'"'
  });

  // End the request here, no point in sending any more.
  res.end(message);  
}


exports.login = function(req, res, realm, users) {
  var opaque = md5(realm+req.headers['user-agent']+req.connection.remoteAddress);

  // Check if the headers are present.
  if (!req.headers.authorization) {
    auth401(req, res, realm, opaque, 'Please login.');
    return false;
  }

  // We only support digest authentication.
  if (req.headers.authorization.substr(0, 6) != 'Digest') {
    auth401(req, res, realm, opaque, 'Only digest authentication supported.');
    return false;
  }

  var parts = getparts(req);

  // We need all parts.
  if (parts === false) {
    auth401(req, res, realm, opaque, 'Invalid authentication header.');
    return false;
  }

  if (parts.realm != realm) {
    auth401(req, res, realm, opaque, 'Invalid realm.');
    return false;
  }

  // Check for a valid username.
  if (!users[parts.username]) {
    auth401(req, res, realm, opaque, 'Invalid username and/or password combination.');
    return false;
  }

  // Make sure the requested url is actually the url we are authenticating.
  var p = parts.uri.lastIndexOf(req.url);

  // Some browsers add the host and port, others don't, so check both.
  // Don't just check for the substring but actually make sure the whole end matches.
  if ((p == -1) || ((p + req.url.length) != parts.uri.length)) {
    auth401(req, res, realm, opaque, 'Invalid uri.');
    return false;
  }

  // Make sure this session exists and hasn't timed out.
  if (!nonces[opaque] || (nonces[opaque].n != parts.nonce)) {
    auth401(req, res, realm, opaque, 'Invalid nonce.');
    return false;
  }

  var response = md5(users[parts.username]+':'+parts.nonce+':'+parts.nc+':'+parts.cnonce+':'+parts.qop+':'+md5(req.method+':'+parts.uri));

  if (parts.response != response) {
    auth401(req, res, realm, opaque, 'Invalid username and/or password combination.');
    return false;
  }

  // Extend the session by one hour.
  clearTimeout(nonces[opaque].timer);

  nonces[opaque].timer = setTimeout(function() {
    delete nonces[opaque];
  }, 60*60*1000);

  return parts.username;
};


// Logout the current session.
exports.logout = function(req) {
  var parts = getparts(req);

  if (parts === false) {
    // This user isn't logged in.
    return false;
  }

  var opaque = md5(parts.realm+req.headers['user-agent']+req.connection.remoteAddress);

  clearTimeout(nonces[opaque].timer);

  delete nonces[opaque];

  return true;
};


exports.passhash = function(realm, username, password) {
  return md5(username+':'+realm+':'+password);
};

