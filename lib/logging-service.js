var _ = require('lodash');

// To retrieve request context
var cls = require('continuation-local-storage');

function Logger(name) {
  this.name = name;
}

Logger.prototype.log = function(level, messages) {
  var joined = _.reduce(messages, function(acc, message) {
    var pretty;
    if (_.isObject(message) || _.isArray(message)) {
      pretty = JSON.stringify(message);
    }
    else {
      pretty = message;
    }
    if (acc === '') {
      return pretty;
    }
    else {
      return acc + ' ' + pretty;
    }
  });

  var namespace = cls.getNamespace('request');
  var rid = namespace && namespace.get('rid');
  var context = rid ? rid : 'No context';
  console.log([new Date().toISOString(), context, level.toUpperCase(), this.name, joined].join(' | '));
};

_.forEach(['trace', 'debug', 'info', 'warn', 'error'], function(level) {
  Logger.prototype[level] = function(messages /** vargs **/) {
    this.log(level, Array.prototype.slice.call(arguments));
  };
});

exports.getLogger = function(name) {
  return new Logger(name);
};