const React = require('react');
var _ = require('lodash');

var Tabbed = React.createClass({

  getInitialState: function() {
    return {
      selectedIdx: 0
    };
  },

  select: function(idx, evt) {
    evt.preventDefault();
    this.setState({ selectedIdx: idx });
    this.props.onSelect(idx);
  },

  renderPass: 0,

  render: function() {
    var lisAndContents = _.map(this.props.tabs, function(tab, idx) {
      var isSelected = idx == this.state.selectedIdx;
      return [
        (
          <li key={'nav-' + idx} role="presentation" className={isSelected ? 'active' : ''}>
            <a href="#" onClick={_.wrap(idx, this.select)}>{tab.name}</a>
          </li>
        ),
        (
          <div ref={'content-' + idx} key={'content-' + idx} style={{ display: (isSelected ? 'block' : 'none') }}>
            {tab.content}
          </div>
        )
      ];
    }.bind(this));
    return (
      <div>
        <ul className="nav nav-tabs">
          {_.pluck(lisAndContents, 0)}
        </ul>
        {_.pluck(lisAndContents, 1)}
      </div>
    );
  }

});

module.exports = Tabbed;
