import React from 'react';
var DropDown = require('./DropDown.js');
require('styles//FilterList.scss');
module.exports = React.createClass({
    getInitialState: function() {
      return {
        active: 0
      };
  },
    updateActive: function(a){
      this.setState({active: a});
    },

    remove: function(){
      let {filterIdx, removeFilter} = this.props;
//      console.log(this.props, removeFilter);
      removeFilter(filterIdx);
    },
    render: function() {
      let {numEmails, addData,filterIdx, changeFilter, removeFilterLine, size} = this.props;
      let lineStyle;

      let svgStyle = {
        display: 'inline-block',
        verticalAlign: 'top',
        paddingBottom: 0,
        position: 'absolute',
        height:'100%'
      }

      let unorderedList = {
        display: 'inline-block',
        width: 280,
        marginLeft: 20
      }

      if (size != filterIdx+1) {
         lineStyle = {
          borderLeft: 'solid 3px #ccc',
          width: 30,
          height:'100%',
          marginTop:-8,
          marginLeft:8.4

        }
      } else {
        lineStyle = {}
      }

      let ballLine = {
            overflow: 'hidden',
            position: 'relative'
      }

      let numberEmails;

      numEmails.forEach(function(element,index){
        if (numEmails[index].hasOwnProperty(filterIdx)) {
          numberEmails = numEmails[index][filterIdx];
        }
      })

//      console.log('props:', this.props);
//      console.log('state:', this.state);

      return(

        <div style={ballLine} >
              <span style = {svgStyle} width={30}>
              <svg width = {30} height = {20}>
                <circle cx={10} cy={10} r={6} stroke='LightSkyBlue' strokeWidth={1} fill='LightSkyBlue' onClick={this.remove.bind(this)}/>
                <line x1={7} y1={10} x2={13} y2={10} stroke='white' strokeWidth={3} fill='white' onClick={this.remove.bind(this)}/>
                </svg>
                <div style = {lineStyle}></div>
                </span>



            <span style={unorderedList}>
              <tr>
                <td>
                  <div className = 'filterNum'><div className = 'emailNumber'>{numberEmails}</div>
                  </div>
                    <DropDown
                      options= {['IS FROM/TO:', 'MENTION:', 'SUBJECT CONTAINS:']}
                      active= {this.state.active}
                      onChange={this.updateActive}
                      size={size}
                      addData={addData}
                      filterIdx={filterIdx}
                      changeFilter={changeFilter}
                      removeFilterLine={removeFilterLine}
                      key = {this.props.filterkey+'drop'}
                      dropKey={this.props.filterkey+'drop'}
                      />
                </td>
              </tr>
            </span>
        </div>

      );
    }



});
