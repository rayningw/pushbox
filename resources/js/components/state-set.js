const React = require('react');
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
        var fromCandidates = stateNodeElem.getStatementConnectionPoints(statement.condition);
        var toNode = this.refs[statement.transition];
        if (!toNode) {
          return;
        }

        var toCandidates = toNode.getStateConnectionPoints();

        var svgCanvasRect = React.findDOMNode(this.refs.svgCanvas).getBoundingClientRect();
        var shortestArrow = this.calcShortestArrow(fromCandidates, toCandidates);
        var shift = { x: -svgCanvasRect.left, y: -svgCanvasRect.top };

        arrows.push({ key:  state.name + ',' + statement.condition,
                      from: this.shiftCoord(shortestArrow.from, shift),
                      to:   this.shiftCoord(shortestArrow.to, shift) });
      }.bind(this));
    }.bind(this));

    if (!_.isEqual(arrows, this.state.arrows)) {
      this.setState({ arrows: arrows });
    }
  },

  shiftCoord: function(coord, shift) {
    return { x: coord.x + shift.x, y: coord.y + shift.y };
  },

  // Returns the shortest arrow between a set of "from" candidate points and set of "to" candidates
  calcShortestArrow: function(fromCandidates, toCandidates) {
    assert(fromCandidates.length > 0);
    assert(toCandidates.length > 0);

    var shortest = { distance: Number.POSITIVE_INFINITY };
    _.forEach(fromCandidates, function(from) {
      _.forEach(toCandidates, function(to) {
        var distance = (to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y);
        if (distance < shortest.distance) {
          shortest = { distance: distance, from: from, to: to };
        }
      });
    });

    assert(shortest.from);
    return shortest;
  },

  onPositionUpdated: function(name, x, y) {
    var positions = _.clone(this.props.positions, true);
    positions[name] = { x: x, y: y };
    this.props.onPositionsUpdated(positions);
  },

  makeStateNodes: function() {
    return _.map(this.props.states, function(state) {
      var position = this.props.positions[state.name];
      assert(position, 'No position found for state: ' + state.name + ' in state set: ' + this.props.name);

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
      <div className="state-set">
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
