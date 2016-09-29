var React = require('react')

var TextBox = React.createClass({
  getInitialState: function(){
    return {
      buttonFocus: false,
      textFocus: true,
      inputValue: this.props.ftext
    }
  },

  componentWillReceiveProps: function (newProps){
    this.setState({
      inputValue: newProps.ftext
    })
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
    let {filterIdx,textIdx} = this.props
    if(e.key == 'Enter') {
      this.props.addData(filterIdx,textIdx,e.target.value);
      return false;
    } else {
      return true;
    }
  },

  onBlur: function(e) {
    let {filterIdx,textIdx} = this.props;
    if(e.target.value != ''){
    this.props.addData(filterIdx,textIdx,e.target.value);
  }
  },

  remove: function() {
    this.props.removeFilterLine(this.props.filterIdx, this.props.textIdx);
  },


  render: function() {
    let svgStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      paddingBottom: '0px',
      position: 'absolute',
      height:'100%'
    }
    var textStyle
    var buttonStyle
    if (!this.state.textFocus) {
      textStyle = {
        width: '140px',
        marginLeft: '20px',
        marginTop: '5px',
        opacity: 0.5,
        outline: '1px'
      }
    } else {
      textStyle =  {
        width: '140px',
        marginLeft: '20px',
        marginTop: '5px',
        outline: '0px',
        backgroundColor: 'white'
      }
    }
    if (this.props.textIdx === this.props.maxIdx) {
      buttonStyle = {
        marginTop: '1px',
        opacity: 0.5
      }
    } else {
      buttonStyle = {
        marginTop:'1px',
        border: '0px',
        outline: '0px',
        visibility:'hidden'
      }
    }

    return(
        <span>
        <span>
        <span style = {svgStyle} width={30}>
          <svg width = {30} height = {30}>
            <circle cx={10} cy={15} r={6} stroke='LightSkyBlue' strokeWidth={1} fill='LightSkyBlue' onClick={this.remove}/>
            <line x1={7} y1={15} x2={13} y2={15} stroke='white' strokeWidth={3} fill='white' onClick={this.remove}/>
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
        <button style={buttonStyle} onMouseEnter={this.toggleHover} onMouseLeave= {this.toggleHover} type='button'
        onClick={this.orClick}>OR</button>
        </span>
        </span>
    )
  }
})

module.exports = TextBox
