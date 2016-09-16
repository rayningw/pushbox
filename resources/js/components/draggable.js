const React = require('react');
var _ = require('lodash');

var Draggable = React.createClass({

  getInitialState: function() {
    return {
    };
  },

  // The position of the element when dragging starts
  originalX: 0,
  originalY: 0,

  // The mouse co-ordinates when the dragging starts
  startMouseX: 0,
  startMouseY: 0,

  // NOTE(ray): Tried using drag events but there were several bugs:
  // 1) Drag end event did not report clientX and clientY correctly
  // 2) Drag move event did not fire when dragged outside of some range

  onMouseDown: function(event) {
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.originalX = this.props.x;
    this.originalY = this.props.y;
    this.addDocumentListeners();
  },

  onDocumentMouseMove: function(event) {
    this.updateXy(event.clientX, event.clientY);
  },

  onDocumentMouseUp: function(event) {
    this.updateXy(event.clientX, event.clientY);
    this.removeDocumentListeners();
  },

  addDocumentListeners: function() {
    document.addEventListener('mouseup', this.onDocumentMouseUp);
    document.addEventListener('mousemove', this.onDocumentMouseMove);
  },

  removeDocumentListeners: function() {
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
  },

  updateXy: function(lastX, lastY) {
    var newX = this.originalX + lastX - this.startMouseX;
    var newY = this.originalY + lastY - this.startMouseY;
    this.props.onDragComplete(newX, newY);
  },

  render: function() {
    var style = { left: this.props.x, top: this.props.y };

    return (
      <div className="draggable-container" style={style} onMouseDown={this.onMouseDown}>
        {this.props.children}
      </div>
    );
  }

});

module.exports = Draggable;
