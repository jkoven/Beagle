var React = require('react')
var lodashMap = require('lodash.map')
var TextBox = require('./TextBox.js')

var textUid = 0;
var DropDown = React.createClass({

  propTypes: {
    options: React.PropTypes.any.isRequired,
    active: React.PropTypes.any.isRequired,
    onChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
  },

  handleChange (event) {
    let {changeFilter,filterIdx} = this.props;
    changeFilter(filterIdx,this.props.options[event.target.value]);
    this.props.onChange(event.target.value);
  },

  getInitialState: function(){
    let textVals = [''];
    if (typeof this.props.filter.values !== 'undefined') {
      textVals = this.props.filter.values.slice();
    }
    return {
      textVals: textVals,
      textUids: [textUid++],
      hover: false,
      focus: false
    }
  },

  componentWillReceiveProps: function (newProps){
    if (typeof newProps.filter.values !== 'undefined'){
      if (newProps.filter.values.length > this.state.textVals.length) {
        let addVals = newProps.filter.values;
        let addCount = newProps.filter.values.length - this.state.textVals.length;
        let newVals = this.state.textVals;
        let newIds = this.state.textUids;
        for (let i = 0; i < addCount; i++){
          newVals.push(addVals[this.state.textVals.length + i]);
          newIds.push(textUid++);
        }
        this.setState({
          textVals: newVals,
          textUids: newIds
        })
      } else if (newProps.filter.values[newProps.filter.values.length-1] !== this.state.textVals[this.state.textVals.length - 1]) {
        this.setState({
          textVals: newProps.filter.values.slice(0)
        })
      }
    }
  },

  toggleHover: function() {
    this.setState(
      {hover: !this.state.hover})
  },

  toggleFocus: function() {
    this.setState(
      {focus: !this.state.Focus})
  },

  handleNewFilterLine: function() {
    let newVals = this.state.textVals;
    let newUids = this.state.textUids;
    newVals.push('');
    newUids.push(textUid++);
    this.setState({
      textVals: newVals,
      textUids: newUids
    })
  },

  handleTextUpdate: function(filterIdx,textIdx,text) {
    this.state.textVals[textIdx] = text;
    this.props.addData(filterIdx,textIdx,text);
  },

  handleFilterLineRemove: function(filterIdx, textIdx) {
    let newTextVals = [...this.state.textVals.slice(0, textIdx), ...this.state.textVals.slice(textIdx+1)];
    let newTextUids = [...this.state.textUids.slice(0, textIdx), ...this.state.textUids.slice(textIdx+1)];
    if (newTextVals.length === 0) {
      newTextVals = [''];
      newTextUids = [textUid++];
    }
    this.setState({
      textVals: newTextVals,
      textUids: newTextUids
    })
    this.props.removeFilterLine(filterIdx, textIdx);
  },

  render () {

//    var buttonStyle

    var {filterIdx, options} = this.props

    // if (!this.state.hover) {
    //   buttonStyle =  {
    //     marginTop: 1,
    //     border: 1,
    //     outline: 0,
    //     backgroundColor: 'white',
    //     color: 'white'
    //   }
    // } else {
    //   buttonStyle = {
    //     marginTop: 1,
    //   }
    // }

    // if(this.state.focus) {
    //   buttonStyle = {
    //     marginTop: 1
    //   }
    // }
//    console.log('props:', this.props);
//    console.log('state:', this.state);

    return (
      <span className= {'dropSelect'}>

      <select className='{dropSelect}' size='1' onChange={this.handleChange} value={this.props.active}>
        {lodashMap(options, function mapOptions (value, key) {
          return (
            <option value={key} key={key}>{value}</option>
          )
        })}
        </select>

        {this.state.textVals.map((s, idx) => {
            return (
            <div key={'div'+ this.props.dropKey+this.state.textUids[idx]}>
            <TextBox
              addData={this.handleTextUpdate}
              removeFilterLine={this.handleFilterLineRemove}
              filterIdx={filterIdx}
              ftext={s}
              textIdx={idx}
              maxIdx={this.state.textVals.length - 1}
              key={'textbox' + this.props.dropKey+this.state.textUids[idx]}
              boxKey={'textbox' + this.props.dropKey+this.state.textUids[idx]}
              func={this.handleNewFilterLine}
              />
            </div>)
        })}


      </span>
    )
  }
})

module.exports = DropDown
