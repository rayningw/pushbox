var _ = require('lodash');

var StateNode = React.createClass({

  // Connection points for the statement boxes, indexed by condition name
  statementConnectionPoints: {},

  // Connection points for the entire state box
  stateConnectionPoints: [],

  updateConnectionPoints: function() {
    this.updateStateConnectionPoints();
    this.updateStatementConnectionPoints();
  },

  updateStatementConnectionPoints: function() {
    this.statementConnectionPoints =
       _.chain(this.props.statements)
        .indexBy('condition')
        .mapValues(function(statement) {
          var rect = React.findDOMNode(this.refs[statement.condition]).getBoundingClientRect();
          var halfwayY = (rect.top + rect.bottom) / 2;
          return [
            { x: rect.left,  y: halfwayY },
            { x: rect.right, y: halfwayY }
          ];
        }.bind(this))
        .value();
  },

  updateStateConnectionPoints: function() {
    var nameRect = this.refs.name.getDOMNode().getBoundingClientRect();
    var entireRect = this.getDOMNode().getBoundingClientRect();

    var nameHalfwayY = (nameRect.top + nameRect.bottom) / 2;
    var entireHalfwayX = (entireRect.left + entireRect.right) / 2;

    this.stateConnectionPoints = [
      { x: entireRect.left,  y: nameHalfwayY },
      { x: entireRect.right, y: nameHalfwayY },
      { x: entireHalfwayX, y: entireRect.top },
      { x: entireHalfwayX, y: entireRect.bottom }
    ];
  },

  componentDidMount: function() {
    this.updateConnectionPoints();
  },

  componentDidUpdate: function() {
    this.updateConnectionPoints();
  },

  getStatementConnectionPoints: function(condition) {
    return this.statementConnectionPoints[condition];
  },

  getStateConnectionPoints: function() {
    return this.stateConnectionPoints;
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
        <div ref="name" className="name">{this.props.name}</div>
        <table className="table statements">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Actions</th>
              <th>Transition</th>
            </tr>
          </thead>
          <tbody>
            {statements}
          </tbody>
        </table>
      </div>
    );
  }

});

module.exports = StateNode;