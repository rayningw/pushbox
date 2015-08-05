var _ = require('lodash');

var StateNode = React.createClass({

  statementBoundingRects: {},

  updateStatementBoundingRects: function() {
    this.statementBoundingRects =
       _.chain(this.props.statements)
        .indexBy('condition')
        .mapValues(function(statement) {
          var domRect = React.findDOMNode(this.refs[statement.condition]).getBoundingClientRect();
          return { from: { x: domRect.left, y: domRect.top },
                   to:   { x: domRect.right, y: domRect.bottom } };
        }.bind(this))
        .value();
  },

  componentDidMount: function() {
    this.updateStatementBoundingRects();
  },

  componentDidUpdate: function() {
    this.updateStatementBoundingRects();
  },

  // Returns the bounding rect of the statement identified by its condition
  getStatementBoundingRect: function(condition) {
    return this.statementBoundingRects[condition];
  },

  render: function() {
    var statements = _.map(this.props.statements, function(statement) {
      return (
        <tr key={statement.condition} ref={statement.condition} className="code">
          <td>{statement.condition}</td>
          <td>{statement.actions}</td>
          <td>{statement.transition}</td>
        </tr>
      );
    });
    return (
      <div className="state-node">
        <div className="name">{this.props.name}</div>
        <table className="table statements">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Actions</th>
              <th>Transition</th>
            </tr>
          </thead>
          {statements}
        </table>
      </div>
    );
  }

});

module.exports = StateNode;