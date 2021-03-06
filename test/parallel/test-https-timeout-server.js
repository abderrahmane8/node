'use strict';
var common = require('../common');
var assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
var https = require('https');

var net = require('net');
var fs = require('fs');

var clientErrors = 0;

process.on('exit', function() {
  assert.equal(clientErrors, 1);
});

var options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem'),
  handshakeTimeout: 50
};

var server = https.createServer(options, common.fail);

server.on('clientError', function(err, conn) {
  // Don't hesitate to update the asserts if the internal structure of
  // the cleartext object ever changes. We're checking that the https.Server
  // has closed the client connection.
  assert.equal(conn._secureEstablished, false);
  server.close();
  clientErrors++;
  conn.destroy();
});

server.listen(common.PORT, function() {
  net.connect({ host: '127.0.0.1', port: common.PORT });
});
