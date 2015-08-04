var App = React.createClass({

  getInitialState: function() {
    return {
      title: 'Pushybox'
    }
  },

  render: function() {
    return (
      <div id="app">
        <div>
          {this.state.title}
        </div>
        <div>
          {this.props.message}
        </div>
      </div>
    );
  }

});

module.exports = App;