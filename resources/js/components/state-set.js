const React = require('react'),
  PropTypes = React.PropTypes;
const ReactDOM = require('react-dom');
var assert = require('assert');
var _ = require('lodash');

var Draggable = require('./draggable');
var StateNode = require('./state-node');
var Arrow = require('./arrow');

var StateSet = React.createClass({

  propTypes: {
    states: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      statements: PropTypes.arrayOf(PropTypes.shape({
        condition: PropTypes.string.isRequired,
        transition: PropTypes.string.isRequired
      }))
    })).isRequired,
    positions: PropTypes.objectOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    })).isRequired,
    onPositionsUpdated: PropTypes.func.isRequired
  },

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

        var svgCanvasRect = ReactDOM.findDOMNode(this.refs.svgCanvas).getBoundingClientRect();
        var shortestArrow = this.calcShortestArrow(fromCandidates, toCandidates);
        var shift = { x: -svgCanvasRect.left, y: -svgCanvasRect.top };

        arrows.push({
          key:  state.name + ',' + statement.condition,
          from: this.shiftCoord(shortestArrow.from, shift),
          to:   this.shiftCoord(shortestArrow.to, shift)
        });
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
        <button onClick={this.autoAnneal}>Perform Annealing</button>
        <button onClick={this.manualAnneal}>Manually Step Annealing</button>
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
    var markerCircle = ReactDOM.findDOMNode(this.refs.markerCircle);
    markerCircle.setAttribute('markerWidth', '8');
    markerCircle.setAttribute('markerHeight', '8');
    markerCircle.setAttribute('refX', '5');
    markerCircle.setAttribute('refY', '5');

    var markerArrow = ReactDOM.findDOMNode(this.refs.markerArrow);
    markerArrow.setAttribute('markerWidth', '13');
    markerArrow.setAttribute('markerHeight', '13');
    markerArrow.setAttribute('refX', '2');
    markerArrow.setAttribute('refY', '6');
    markerArrow.setAttribute('orient', 'auto');

    this.updateArrows();
  },

  componentDidUpdate: function() {
    this.updateArrows();

    if (this.annealingInfo && this.annealingInfo.doNextStep) {
      this.doAnnealStep();
    }
  },

  annealingInfo: null,

  // Sets up the simulated annealing structures so annealing steps can be done
  setupAnnealing: function() {
    console.log("Setting up annealing");
    this.annealingInfo = {
      // Whether we want to do the next step (set to false for manual stepping)
      doNextStep: false,
      // Latest graph which we have accepted
      acceptedGraph: null,
      // Energy of the accepted graph
      acceptedEnergy: Number.POSITIVE_INFINITY,
      // Positions of we are going to render next to test it out
      positionsToTest: null,
      // Current tolerance for higher energies
      curTolerance: 10000
    };
  },

  // Tears down the simualated annealing structures
  teardownAnnealing: function() {
    console.log("Tearing down annealing");
    this.annealingInfo = null;
    this.forceUpdate();
  },

  // Perform simulated annealing by continually performing annealing steps
  autoAnneal: function() {
    console.log("Auto annealing");
    this.setupAnnealing();
    this.annealingInfo.doNextStep = true;
    this.doAnnealStep();
  },

  // Manually step through simualated annealing steps
  manualAnneal: function() {
    console.log("Manual annealing");
    if (!this.annealingInfo) {
      this.setupAnnealing();
    }
    this.doAnnealStep();
  },

  doAnnealStep: function() {
    console.log("Doing annealing step")
    // If we have stabilised then end annealing
    if (this.annealingInfo.curTolerance <= 0) {
      console.log("Reached zero tolerance")
      this.teardownAnnealing();
      return;
    }

    // Calculate details about rendered graph, i.e. what we are testing
    const graphUnderTest = this.getRenderedGraph();
    this.decorateGraphWithOverlaps(graphUnderTest);
    const energyUnderTest = this.calcGraphEnergy(graphUnderTest);
    console.log("Energy of graph under test: " + energyUnderTest);

    // If the rendered layout has lower energy then accept it so that the next
    // nudging will use it.
    if (energyUnderTest < this.annealingInfo.acceptedEnergy + this.annealingInfo.curTolerance) {
      console.log("Accepted graph under test");
      this.annealingInfo.acceptedGraph = graphUnderTest;
      this.annealingInfo.acceptedEnergy = energyUnderTest;

    // Otherwise the next nudging will continue to use the previously accepted graph
    } else {
      console.log("Rejected graph under test");
    }

    if (this.annealingInfo.acceptedEnergy <= 0) {
      console.log("Reached zero energy");
      this.teardownAnnealing();
      return;
    }

    // Nudge graph around to get the layout which we are going to render next to test it
    this.nudgeGraph(this.annealingInfo.acceptedGraph);

    // Call out to set positions from layoutToTest
    this.props.onPositionsUpdated(this.annealingInfo.positionsToTest);

    // Decrement the energy tolerance for the next step
    this.annealingInfo.curTolerance -= 100;

    // Force a render to perform the next step in case positions did not change
    this.forceUpdate();
  },

  // Mutates the graph by nudging the node positions
  nudgeGraph: function(graph) {
    // Calculate the combined force on each node
    let forces = {};
    _.forEach(graph.nodes, self => {
      self.overlaps.forEach(overlap => {
        const selfName = self.name;
        const otherName = overlap.overlapWith;

        const selfCenter = this.calcCenter(self.rect);
        const otherCenter = this.calcCenter(graph.nodes[otherName].rect);

        const repulsion = this.calcRepulsionWithOther(selfCenter, otherCenter);

        forces[selfName] = this.combineForces(
          forces[selfName] || { x: 0, y: 0 }, repulsion.forceOnSelf);
        forces[otherName] = this.combineForces(
          forces[otherName] || { x: 0, y: 0 }, repulsion.forceOnOther);
      });
    });

    // Apply the force on each node
    this.annealingInfo.positionsToTest = {};
    _.forEach(graph.nodes, node => {
      const force = forces[node.name];
      if (force) {
        this.annealingInfo.positionsToTest[node.name] = this.applyForce(force, node.position);
      } else {
        this.annealingInfo.positionsToTest[node.name] = node.position;
      }
    });
  },

  applyForce: function(force, position) {
    return {
      x: Math.max(0, position.x + force.x),
      y: Math.max(0, position.y + force.y)
    };
  },

  combineForces: function(one, two) {
    return {
      x: one.x + two.x,
      y: one.y + two.y
    };
  },

  // Calculates the center of a rectangle
  calcCenter: function(rect) {
    return {
      x: rect.left + (rect.right - rect.left) / 2,
      y: rect.top + (rect.bottom - rect.top) / 2
    };
  },

  calcRepulsionWithOther: function(selfPosition, otherPosition) {
    const angle = this.calcAngle(selfPosition, otherPosition);
    const oppositeAngle = angle + Math.PI;
    return {
      forceOnSelf: this.calcVector(10, oppositeAngle),
      forceOnOther: this.calcVector(10, angle)
    };
  },

  calcAngle: function(one, two) {
    const quadrant = this.getQuadrant(two, one);
    if (quadrant == 1) {
      return Math.atan((two.y - one.y) / (two.x - one.x));
    } else if (quadrant == 2) {
      return Math.PI + Math.atan((two.y - one.y) / (two.x - one.x));
    } else if (quadrant == 3) {
      return Math.PI + Math.atan((two.y - one.y) / (two.x - one.x));
    } else if (quadrant == 4) {
      return Math.atan((two.y - one.y) / (two.x - one.x));
    }
  },

  getQuadrant: function(position, origin) {
    if (position.x > origin.x && position.y >= origin.y) {
      return 1;
    } else if (position.x <= origin.x && position.y > origin.y) {
      return 2;
    } else if (position.x < origin.x && position.y <= origin.y) {
      return 3;
    } else if (position.x >= origin.x && position.y < origin.y) {
      return 4;
    } else {
      throw new Error("Unknown quadrant for position: " + JSON.stringify(position) +
          " against origin: " + JSON.stringify(origin));
    }
  },

  calcVector: function(magnitude, angle) {
    return {
      x: magnitude * Math.cos(angle),
      y: magnitude * Math.sin(angle)
    };
  },

  getRenderedGraph: function() {
    let nodes = {};
    this.props.states.forEach(state => {
      const elem = ReactDOM.findDOMNode(this.refs[state.name]);
      const rect = elem.getBoundingClientRect();
      nodes[state.name] = {
        name: state.name,
        rect: rect,
        position: _.clone(this.props.positions[state.name])
      };
    });

    return {
      nodes: nodes
    };
  },

  decorateGraphWithOverlaps: function(graph) {
    _.forEach(graph.nodes, self => {
      let overlaps = [];
      _.forEach(graph.nodes, (other, otherName) => {
        if (self === other) {
          return;
        }
        const overlapArea = this.calcOverlapArea(self.rect, other.rect);
        if (overlapArea > 0) {
          overlaps.push({
            overlapWith: otherName,
            overlapArea: overlapArea
          });
        }
      });
      self.overlaps = overlaps;
    });
  },

  calcGraphEnergy: function(graph) {
    return _.reduce(graph.nodes, (acc, node) => {
      return acc + this.calcNodeEnergy(node);
    }, 0);
  },

  calcNodeEnergy: function(node) {
    return node.overlaps.reduce((acc, overlap) => {
      return acc + overlap.overlapArea;
    }, 0);
  },

  // Calculates the area of overlap between two rectangles
  calcOverlapArea: function(one, two) {
    // Multiply the 1-dimensional overlaps to get the 2-dimensional overlap
    const xOverlap = this.calcOverlapRange([ one.left, one.right ], [ two.left, two.right ]);
    const yOverlap = this.calcOverlapRange([ one.top, one.bottom ], [ two.top, two.bottom ]);
    return xOverlap * yOverlap;
  },

  // Calculates the overlap between two ranges in a 1-dimensional plane
  calcOverlapRange: function(one, two) {
    // Find the "first" and "second" ranges wrt. to their first ordinate
    // position in order to calculate overlap easily.
    let first, second;
    if (one[0] < two[0]) {
      first = one;
      second = two;
    } else {
      first = two;
      second = one;
    }

    // First and second do not overlap
    if (first[1] <= second[0]) {
      return 0;
    }
    // First completely covers the second
    else if (first[1] >= second[1]) {
      return second[1] - second[0];
    }
    // First overlaps partly with the second
    else if (first[1] <= second[1]) {
      return first[1] - second[0];
    }
    else {
      throw new Error("Unexpected arrangement to calculate overlap range");
    }
  },

});

module.exports = StateSet;
