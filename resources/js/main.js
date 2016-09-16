'use strict';

const React = require('react');
var config = require('./config/config');
var App = require('./components/app');

function run() {
  React.render(
    <App newProgram={config.newProgram} />,
    document.getElementById('content')
  );
}

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', run);
}
else {
  window.attachEvent('onload', run);
}
