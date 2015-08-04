var StateDiagram = require('./state-diagram');

var App = React.createClass({

  getInitialState: function() {
    return {
      title: 'Pushybox',
      states: [
        { name: 'S0', code: 'PRINT "HELLO"' },
        { name: 'S1', code: 'SET A(5)=0;' },
        { name: 'S2', code: 'SET A(6)=0;' }
      ]
    }
  },

  render: function() {
    return (
      <div>
        <div className="title">
          {this.state.title}
        </div>
        <StateDiagram states={this.state.states} />
      </div>
    );
  }

});

module.exports = App;