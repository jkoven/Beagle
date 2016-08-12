var React = require('react')

var TextBox = React.createClass({
  getInitialState: function(){
    return {
      buttonFocus: false,
      textFocus: false
    }
  },

  toggleFocus: function() {
    this.setState(
      {focus: !this.state.focus})
  },

  onClick: function() {
    let {data} = this.props;
    var newElement = 1;
    this.setState({focus: true});
    data.push(newElement);
    this.props.func(data);
  },

  textClick: function() {
    this.setState({textFocus: true});
  },

  onEnter: function(e) {
    let {addData,filterIdx,textIdx} = this.props
    if(e.key == 'Enter') {
      addData(filterIdx,textIdx,e.target.value);
    }
  },

  onBlur: function(e) {
    let {addData,filterIdx,textIdx} = this.props;
    if(e.target.value != ''){
    addData(filterIdx,textIdx,e.target.value);
  }
  },


  render: function() {
    var textStyle
    var buttonStyle
    if (!this.state.textFocus) {
      textStyle = {
        width: 200,
        marginLeft: 20,
        marginTop: 5,
        opacity: 0.5
      }
    } else {
      textStyle =  {
        width: 200,
        marginLeft: 20,
        marginTop: 5,
        border: 0,
        outline: 0,
        backgroundColor: 'white'
      }
    }

    if(this.state.focus) {
      buttonStyle = {
        marginTop: 1,
        border: 0,
        outline: 0,
        visibility:'hidden'
      }
    } else {
      buttonStyle = {
        marginTop: 1,
        opacity: 0.5
      }
    }

    return(
        <span>
        <span>
        <input style={textStyle} onMouseEnter={this.toggleHover} onKeyPress={this.onEnter} type="text"
        onClick={this.textClick} />
        </span>
        <span>
        <button style={buttonStyle} onMouseEnter={this.toggleHover} onMouseLeave= {this.toggleHover} type="button"
        onClick={this.onClick}>OR</button>
        </span>
        </span>
    )
  }
})

module.exports = TextBox
