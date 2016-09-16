const React = require('react');

var Expandable = React.createClass({

  getInitialState: function() {
    return {
      expanded: this.props.expanded
    };
  },

  toggle: function() {
    this.setState({ expanded: !this.state.expanded });
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading" onClick={this.toggle}>
          <div className="pull-right">{this.state.expanded ? '[-]' : '[+]'}</div>
          <h3 className="panel-title">{this.props.title}</h3>
        </div>
        <div className="panel-body" style={{ display: this.state.expanded ? 'block' : 'none' }}>
          {this.props.children}
        </div>
      </div>
    );
  }

});

module.exports = Expandable;
