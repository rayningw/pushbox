const React = require('react');
var _ = require('lodash');

var Routed = React.createClass({

  componentDidMount: function() {
    window.addEventListener('hashchange', function(event) {
      event.preventDefault();
      this.forceUpdate();
    }.bind(this));
  },

  render: function() {
    var routeName = window.location.hash.substr(1);
    console.log('route name:', routeName);
    console.log('routes:', this.props.routes);

    var content;
    _.forEach(this.props.routes, function(curContent, curName) {
      if (routeName === curName) {
        content = curContent;
        return false;
      }
    }.bind(this));

    if (!content) {
      return ( <div>Not found</div> );
    }
    else {
      return content;
    }
  }

});

module.exports = Routed;
