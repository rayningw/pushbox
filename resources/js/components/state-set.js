var _ = require('lodash');

var Draggable = require('./draggable');
var StateNode = require('./state-node');

var StateSet = React.createClass({

  getInitialState: function() {
    return {
      positions: this.props.layout.positions
    };
  },

  render: function() {
    var stateNodes = _.map(this.props.states, function(state) {
      var position = this.state.positions[state.name];

      return (
        <Draggable key={state.name} x={position.x} y={position.y}>
          <StateNode name={state.name} statements={state.statements} />
        </Draggable>
      );
    }.bind(this));

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

module.exports = StateSet;