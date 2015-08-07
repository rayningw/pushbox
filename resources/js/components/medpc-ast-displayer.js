var _ = require('lodash');

var MedPcAstDisplayer = React.createClass({

  makeNodeElem: function(node, prefix) {
    return (
      <tr>
        <td>{prefix}{node.type}</td>
        <td><pre>{JSON.stringify(node, null, '\t')}</pre></td>
      </tr>
    );
  },

  render: function() {
    var nodeElems = _.map(this.props.ast.directives, function(node) {
      return this.makeNodeElem(node);
    }.bind(this));

    return (
      <table className="table table-bordered medpc-ast-displayer">
        <thead>
          <tr>
            <th>Type</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {nodeElems}
        </tbody>
      </table>
    );
  }

});

module.exports = MedPcAstDisplayer;