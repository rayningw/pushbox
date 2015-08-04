var StateSet = require('./state-set');

var App = React.createClass({

  getInitialState: function() {
    return {
      title: 'Pushybox',
      program: this.props.newProgram
    }
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
          <div className="col-md-12 title">
            {this.state.program.name}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <StateSet states={this.state.program.states} />
          </div>
        </div>
      </div>
    );
  }

});

module.exports = App;