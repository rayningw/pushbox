var express = require('express');

var logger = require('./lib/logging-service').getLogger('canvas-tutorial');

var app = express();

app.use('/', express.static('public'));

var server = app.listen(process.env.PORT || 5000, function() {
  logger.info('Listening on port: ' + server.address().port);
});