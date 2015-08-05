var assert = require('assert');
var _ = require('lodash');

var Draggable = require('./draggable');
var StateNode = require('./state-node');
var Arrow = require('./arrow');

var StateSet = React.createClass({

  getInitialState: function() {
    return {
      arrows: []
    };
  },

  updateArrows: function() {
    var arrows = [];
    _.forEach(this.props.states, function(state) {
      var stateNodeElem = this.refs[state.name];

      if (!stateNodeElem) {
        console.log('No state nodes rendered yet');
        return;
      }

      _.forEach(state.statements, function(statement, idx) {
        var fromRect = stateNodeElem.getStatementBoundingRect(statement.condition);
        var toPoint = this.props.layout.positions[statement.transition];

        if (_.isUndefined(fromRect) || _.isUndefined(toPoint)) {
          return;
        }

        var svgCanvasRect = React.findDOMNode(this.refs.svgCanvas).getBoundingClientRect();
        var from = { x: fromRect.to.x - svgCanvasRect.left, y: fromRect.to.y - svgCanvasRect.top};
        var to = toPoint;

        arrows.push({ key: state.name + ',' + statement.condition, from: from, to: to });
      }.bind(this));
    }.bind(this));

    if (!_.isEqual(arrows, this.state.arrows)) {
      this.setState({ arrows: arrows });
    }
  },

  onPositionUpdated: function(name, x, y) {
    var newLayout = _.clone(this.props.layout, true);
    newLayout.positions[name] = { x: x, y: y };
    this.props.onLayoutUpdated(newLayout);
  },

  makeStateNodes: function() {
    return _.map(this.props.states, function(state) {
      var position = this.props.layout.positions[state.name];

      return (
        <Draggable key={state.name} x={position.x} y={position.y}
                   onDragComplete={_.partial(this.onPositionUpdated, [state.name])}>
          <StateNode ref={state.name} name={state.name} statements={state.statements} />
        </Draggable>
      );
    }.bind(this));
  },

  render: function() {
    var stateNodes = this.makeStateNodes();
    var arrows = _.map(this.state.arrows, function(arrow) {
      return (
        <Arrow key={arrow.key} from={arrow.from} to={arrow.to} />
      );
    });

    return (
      <div>
        <div className="title">State Diagram</div>
        <div className="combined-canvas">
          <div className="html-canvas">
            {stateNodes}
          </div>
          <svg ref="svgCanvas" className="svg-canvas">
            <defs>
              <marker ref="markerCircle" id="markerCircle">
                <circle cx="5" cy="5" r="3" stroke="none" fill="black" />
              </marker>

              <marker ref="markerArrow" id="markerArrow">
                <path d="M2,2 L2,11 L10,6 L2,2" fill="black" />
              </marker>
            </defs>
            {arrows}
          </svg>
        </div>
      </div>
    );
  },

  componentDidMount: function() {
    // Set attributes unsupported by React
    // https://github.com/facebook/react/issues/140
    var markerCircle = this.refs.markerCircle.getDOMNode();
    markerCircle.setAttribute('markerWidth', '8');
    markerCircle.setAttribute('markerHeight', '8');
    markerCircle.setAttribute('refX', '5');
    markerCircle.setAttribute('refY', '5');

    var markerArrow = this.refs.markerArrow.getDOMNode();
    markerArrow.setAttribute('markerWidth', '13');
    markerArrow.setAttribute('markerHeight', '13');
    markerArrow.setAttribute('refX', '2');
    markerArrow.setAttribute('refY', '6');
    markerArrow.setAttribute('orient', 'auto');

    this.updateArrows();
  },

  componentDidUpdate: function() {
    this.updateArrows();
  }

});

module.exports = StateSet;