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
      let {filter, numEmails, addData, filterIdx, changeFilter, removeFilterLine, size} = this.props;
      let lineStyle;

      let svgStyle = {
        display: 'inline-block',
        verticalAlign: 'top',
        paddingBottom: '0px',
        position: 'absolute',
        height:'100%'
      }

      let unorderedList = {
        display: 'inline-block',
        width: '280px',
        marginLeft: '20px'
      }

      if (size != filterIdx+1) {
         lineStyle = {
          borderLeft: 'solid 3px #ccc',
          width: '30px',
          height:'100%',
          marginTop:'-8px',
          marginLeft:'8.4px'

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
              <span style = {svgStyle} width={'30px'}>
              <svg width = {'30px'} height = {'20px'}>
                <circle cx={'10px'} cy={'10px'} r={'6px'} stroke='LightSkyBlue' strokeWidth={'1px'} fill='LightSkyBlue' onClick={this.remove}/>
                <line x1={'7px'} y1={'10px'} x2={'13px'} y2={'10px'} stroke='white' strokeWidth={'3px'} fill='white' onClick={this.remove}/>
                </svg>
                <div style = {lineStyle}></div>
                </span>



            <span style={unorderedList}>
                  <div className = 'filterNum'><div className = 'emailNumber'>{numberEmails}</div>
                  </div>
                    <DropDown
                      options= {['IS FROM/TO:', 'CONTENT CONTAINS:', 'SUBJECT CONTAINS:',  'PERSON:', 'ORGANIZATION:']}
                      active= {this.state.active}
                      onChange={this.updateActive}
                      size={size}
                      addData={addData}
                      filterIdx={filterIdx}
                      changeFilter={changeFilter}
                      removeFilterLine={removeFilterLine}
                      key = {this.props.filterkey+'drop'}
                      dropKey={this.props.filterkey+'drop'}
                      filter={filter}
                      />
            </span>
        </div>

      );
    }



});
