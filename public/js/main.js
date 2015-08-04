(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var App = React.createClass({displayName: "App",

  getInitialState: function() {
    return {
      title: 'Pushybox'
    }
  },

  render: function() {
    return (
      React.createElement("div", {id: "app"}, 
        React.createElement("div", {className: "title"}, 
          this.state.title
        ), 
        React.createElement("div", null, 
          this.props.message
        )
      )
    );
  }

});

module.exports = App;

},{}],2:[function(require,module,exports){
exports.message = 'Sups world!!!';

},{}],3:[function(require,module,exports){
'use strict';

var config = require('./config/config');
var App = require('./components/app');

function run() {
  React.render(
    React.createElement(App, {message: config.message}),
    document.getElementById('content')
  );
}

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', run);
}
else {
  window.attachEvent('onload', run);
}

},{"./components/app":1,"./config/config":2}]},{},[3]);
