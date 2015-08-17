var assert = require('assert');
var _ = require('lodash');

var MedPcParser = require('./medpc-parser');
var StateSet = require('./state-set');
var Tabbed = require('./tabbed');

var App = React.createClass({

  getInitialState: function() {
    var program = this.loadProgram();

    return {
      title: 'Pushybox',
      name: program.name,
      stateSets: program.stateSets,
      positions: program.positions
    }
  },

  componentDidUpdate: function() {
    this.saveProgram();
  },

  loadProgram: function() {
    var programString = window.localStorage.getItem('program');
    if (programString) {
      console.log('Loading saved program');
      try {
        var program = JSON.parse(programString);
        return this.validateProgram(program);
      }
      catch (err) {
        console.log('Error parsing saved program:', err);
        console.log('Reverting to default new program');
        return this.props.newProgram;
      }
    }
    else {
      console.log('Loading new program:', this.props.newProgram);
      return this.props.newProgram;
    }
  },

  loadDefault: function() {
    this.setState(this.props.newProgram);
  },

  validateProgram: function(program) {
    assert(program.name, 'Missing name');
    assert(program.stateSets, 'Missing state sets');
    assert(program.positions, 'Missing positions');

    return program;
  },

  saveProgram: function() {
    var program = {
      name: this.state.name,
      stateSets: this.state.stateSets,
      positions: this.state.positions
    }
    console.log('Saving program');
    window.localStorage.setItem('program', JSON.stringify(program));
  },

  onPositionsUpdated: function(stateSetName, stateSetPositions) {
    var positions = _.clone(this.state.positions, true);
    positions[stateSetName] = stateSetPositions;
    this.setState({ positions: positions });
  },

  onParse: function(program) {
    this.setState(program);
  },

  onSelectStateSet: function() {
    // Need to tell visible tab content to re-render since it may depend on its visibility
    // Ideally this should be handled in the Tabbed component after changing visibility
    // but could not get it to work
    this.forceUpdate();
  },

  render: function() {
    var tabs = _.map(this.state.stateSets, function(stateSet) {
      return {
        name: stateSet.name,
        content: (
          <StateSet name={stateSet.name}
                    states={stateSet.states}
                    positions={this.state.positions[stateSet.name]}
                    onPositionsUpdated={_.partial(this.onPositionsUpdated, [stateSet.name])} />
        )
      };
    }.bind(this));

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>Pushbox</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button className="btn" onClick={this.loadDefault}>Load Default</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <MedPcParser onParse={this.onParse} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 title">
            {this.state.name}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Tabbed tabs={tabs} onSelect={this.onSelectStateSet} />
          </div>
        </div>
      </div>
    );
  }

});

module.exports = App;