var Draggable = React.createClass({

  getInitialState: function() {
    return {
      x: this.props.x,
      y: this.props.y
    };
  },

  startX: 0,
  startY: 0,

  // The screenX co-ordinate on the dragend event was a strange number, so we record the latest
  // co-ordinates on drag
  lastMouseX: 0,
  lastMouseY: 0,

  onDrag: function(event) {
    // A (0,0) event fires just before dragend
    if (event.screenX === 0 && event.screenY === 0) {
      return;
    }
    this.lastMouseX = event.screenX;
    this.lastMouseY = event.screenY;
  },

  onDragStart: function(event) {
    this.startX = event.screenX;
    this.startY = event.screenY;
    this.lastMouseX = event.screenX;
    this.lastMouseY = event.screenY;
  },

  onDragEnd: function(event) {
    var newX = this.state.x + this.lastMouseX - this.startX;
    var newY = this.state.y + this.lastMouseY - this.startY;
    this.setState({ x: newX, y: newY });
  },

  render: function() {
    var style = { left: this.state.x, top: this.state.y };

    return (
      <div className="draggable-container" draggable="true" style={style}
           onDrag={this.onDrag} onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        {this.props.children}
      </div>
    );

  }

});

module.exports = Draggable;