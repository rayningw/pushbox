var StateNode = React.createClass({

  render: function() {
    return (
      <div className="state-node">
        <div className="name">{this.props.name}</div>
        <div className="code">{this.props.code}</div>
      </div>
    );
  }

});

module.exports = StateNode;