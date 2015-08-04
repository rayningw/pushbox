var _ = require('lodash');

var StateNode = require('./state-node');

var StateSet = React.createClass({

  getInitialState: function() {
    return {
      positions: this.props.layout.positions
    };
  },

  render: function() {
    var that = this;
    var stateNodes = _.map(this.props.states, function(state) {
      var position = this.state.positions[state.name];
      var style = { left: position.x, top: position.y };

      var startX;
      var startY;

      // The screenX co-ordinate on the dragend event was a strange number, so we record the latest
      // co-ordinates on drag
      var lastMouseX;
      var lastMouseY;

      function onDrag(event) {
        // A (0,0) event fires just before dragend
        if (!(event.screenX === 0 && event.screenY === 0)) {
          lastMouseX = event.screenX;
          lastMouseY = event.screenY;
        }
      }

      function onDragStart(event) {
        startX = event.screenX;
        startY = event.screenY;
        lastMouseX = event.screenX;
        lastMouseY = event.screenY;
      }

      function onDragEnd(event) {
        var newX = position.x + lastMouseX - startX;
        var newY = position.y + lastMouseY - startY;
        var newPositions = that.state.positions;
        newPositions[state.name] = { x: newX, y: newY };
        that.setState({ positions: newPositions });
      }

      return (
        <div key={state.name} className="state-node-container" style={style} draggable="true"
             onDrag={onDrag} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <StateNode name={state.name} statements={state.statements} />
        </div>
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