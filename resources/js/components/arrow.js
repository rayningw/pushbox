var Arrow = React.createClass({

  render: function() {
    return (
      <path d={"M " + this.props.from.x + " " + this.props.from.y +
               " L " + this.props.to.x + " " + this.props.to.y}
            fill="none" stroke="#6666ff" strokeWidth="1px"
            markerStart="url(#markerCircle)"
            markerEnd="url(#markerArrow)" />
    );
  }

});

module.exports = Arrow;