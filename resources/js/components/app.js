var StateSet = require('./state-set');

var App = React.createClass({

  getInitialState: function() {
    return {
      title: 'Pushybox',
      name: this.props.newProgram.name,
      states: this.props.newProgram.states,
      layout: this.props.newProgram.layout
    }
  },

  onLayoutUpdated: function(layout) {
    this.setState({ layout: layout });
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