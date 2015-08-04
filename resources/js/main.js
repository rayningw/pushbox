'use strict';

var config = require('./config/config');
var App = require('./components/app');

function run() {
  React.render(
    <App message={config.message} />,
    document.getElementById('content')
  );
}

if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', run);
}
else {
  window.attachEvent('onload', run);
}

