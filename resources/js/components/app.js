var assert = require('assert');

var MedPcParser = require('./medpc-parser');
var StateSet = require('./state-set');

var App = React.createClass({

  getInitialState: function() {
    var program = this.loadProgram();

    return {
      title: 'Pushybox',
      name: program.name,
      states: program.states,
      layout: program.layout
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

  validateProgram: function(program) {
    assert(program.name, 'Missing name');
    assert(program.states instanceof Array, 'Missing states');
    assert(program.layout, 'Missing layout');
    assert(program.layout.positions, 'Missing positions');

    return program;
  },

  saveProgram: function() {
    var program = {
      name: this.state.name,
      states: this.state.states,
      layout: this.state.layout
    }
    console.log('Saving program');
    window.localStorage.setItem('program', JSON.stringify(program));
  },

  onLayoutUpdated: function(layout) {
    this.setState({ layout: layout });
  },

  onParsed: function(program) {
    this.setState({ name: program.name, states: program.states, layout: program.layout });
  },

  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>Pushybox</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <MedPcParser onParsed={this.onParsed} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 title">
            {this.state.name}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <StateSet states={this.state.states}
                      layout={this.state.layout}
                      onLayoutUpdated={this.onLayoutUpdated} />
          </div>
        </div>
      </div>
    );
  }

});

module.exports = App;