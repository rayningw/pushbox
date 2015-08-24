var Sidebarred = React.createClass({

  render: function() {
    return (
      <div>
        <ul id="sidebar">
          <li className="sidebar-brand">
            <a href="/#">{this.props.brand}</a>
          </li>
          <li>
            {this.props.sidebarContent}
          </li>
        </ul>

        <div id="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                {this.props.pageContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Sidebarred;