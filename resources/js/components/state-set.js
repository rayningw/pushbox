var _ = require('lodash');

var Draggable = require('./draggable');
var StateNode = require('./state-node');

var StateSet = React.createClass({

  getInitialState: function() {
    return {
    };
  },

  onPositionUpdated: function(name, x, y) {
    var newLayout = _.clone(this.props.layout, true);
    newLayout.positions[name] = { x: x, y: y };
    this.props.onLayoutUpdated(newLayout);
  },

  render: function() {
    var stateNodes = _.map(this.props.states, function(state) {
      var position = this.props.layout.positions[state.name];

      return (
        <Draggable key={state.name} x={position.x} y={position.y}
                   onDragComplete={_.partial(this.onPositionUpdated, [state.name])}>
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