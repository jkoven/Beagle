var React = require('react')

var ListItem = React.createClass({

render() {
  let {contacts} = this.props;
    return (<div className="contactlist-component-contact">
      {_.get(contacts, this.state.num+".Count")}
    </div>);
    this.state.num = this.state.num + 1;
}

});

module.exports = ListItem
