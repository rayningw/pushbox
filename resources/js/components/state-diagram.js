var _ = require('lodash');

var StateNode = require('./state-node');

var StateDiagram = React.createClass({

  render: function() {
    var stateNodes = _.map(this.props.states, function(state) {
      return (
        <div key={state.name}>
          <StateNode name={state.name} code={state.code} />
          <hr />
        </div>
      );
    });

    return (
      <div>
        <div className="title">State Diagram</div>
        <div>
          {stateNodes}
        </div>
      </div>
    );
  }

});

module.exports = StateDiagram;