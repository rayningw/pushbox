var _ = require('lodash');

var StateNode = React.createClass({

  render: function() {
    var statements = _.map(this.props.statements, function(statement) {
      return (
        <tr key={statement.condition} className="code">
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