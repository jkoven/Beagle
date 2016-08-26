var React = require('react')

var TextBox = React.createClass({
  getInitialState: function(){
    return {
      buttonFocus: false,
      textFocus: true,
      inputValue: this.props.ftext
    }
  },

  toggleFocus: function() {
    this.setState(
      {focus: !this.state.focus})
  },

  orClick: function() {
    this.props.func();
  },

  textClick: function(e) {
    this.setState({inputValue: e.target.value});
    this.setState({textFocus: true});
  },

  textBlur: function(e) {
    this.setState({inputValue: e.target.value});
    this.setState({textFocus: false});
  },

  onEnter: function(e) {
    let {addData,filterIdx,textIdx} = this.props
    if(e.key == 'Enter') {
      this.props.addData(filterIdx,textIdx,e.target.value);
      return false;
    } else {
      return true;
    }
  },

  onBlur: function(e) {
    let {addData,filterIdx,textIdx} = this.props;
    if(e.target.value != ''){
    this.props.addData(filterIdx,textIdx,e.target.value);
  }
  },

  remove: function(e) {
    this.props.removeFilterLine(this.props.filterIdx, this.props.textIdx);
  },


  render: function() {
    let svgStyle = {
      display: "inline-block",
      verticalAlign: "top",
      paddingBottom: 0,
      position: "absolute",
      height:"100%"
    }
    var textStyle
    var buttonStyle
    if (!this.state.textFocus) {
      textStyle = {
        width: 200,
        marginLeft: 20,
        marginTop: 5,
        opacity: 0.5,
        outline: 1
      }
    } else {
      textStyle =  {
        width: 200,
        marginLeft: 20,
        marginTop: 5,
        outline: 0,
        backgroundColor: 'white'
      }
    }
    if (this.props.textIdx === this.props.maxIdx) {
      buttonStyle = {
        marginTop: 1,
        opacity: 0.5
      }
    } else {
      buttonStyle = {
        marginTop: 1,
        border: 0,
        outline: 0,
        visibility:'hidden'
      }
    }

    return(
        <span>
        <span>
        <span style = {svgStyle} width={30}>
          <svg width = {30} height = {30}>
            <circle cx={10} cy={15} r={6} stroke="LightSkyBlue" strokeWidth={1} fill="LightSkyBlue" onClick={this.remove.bind(this)}/>
            <line x1={7} y1={15} x2={13} y2={15} stroke="white" strokeWidth={3} fill="white" onClick={this.remove.bind(this)}/>
            </svg>
            <div style = {textStyle}></div>
            </span>
        <input
          type='text'
          style={textStyle}
          autoFocus
          onChange={(event) => { this.setState({inputValue: event.target.value}) }}
          onKeyPress={this.onEnter}
          value={this.state.inputValue}
          onFocus={this.textClick}
          onBlur={this.textBlur}
          onClick={this.textClick}/>
        </span>
        <span>
        <button style={buttonStyle} onMouseEnter={this.toggleHover} onMouseLeave= {this.toggleHover} type="button"
        onClick={this.orClick}>OR</button>
        </span>
        </span>
    )
  }
})

module.exports = TextBox
