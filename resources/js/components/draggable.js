var Draggable = React.createClass({

  getInitialState: function() {
    return {
    };
  },

  startX: 0,
  startY: 0,

  // The clientX co-ordinate on the dragend event was a strange number, so we record the latest
  // co-ordinates on drag
  lastMouseX: 0,
  lastMouseY: 0,

  onDrag: function(event) {
    // A (0,0) event fires just before dragend
    if (event.clientX === 0 && event.clientY === 0) {
      return;
    }
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  },

  onDragStart: function(event) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  },

  onDragEnd: function(event) {
    var newX = this.props.x + this.lastMouseX - this.startX;
    var newY = this.props.y + this.lastMouseY - this.startY;
    this.props.onDragComplete(newX, newY);
  },

  render: function() {
    var style = { left: this.props.x, top: this.props.y };

    return (
      <div className="draggable-container" draggable="true" style={style}
           onDrag={this.onDrag} onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        {this.props.children}
      </div>
    );

  }

});

module.exports = Draggable;