import React from 'react';
var DropDown = require('./DropDown.js');
require('styles//FilterList.scss');
module.exports = React.createClass({
    render: function() {
      let {addData,filterIdx, changeFilter, size} = this.props;
      let lineStyle;

      let svgStyle = {
        display: "inline-block",
        verticalAlign: "top",
        paddingBottom: 0,
        position: "absolute",
        height:"100%"
      }

      let unorderedList = {
        display: "inline-block",
        width: 280,
        marginLeft: 20
      }

      if (size != filterIdx+1) {
         lineStyle = {
          borderLeft: "solid 3px #ccc",
          width: 30,
          height:"100%",
          marginTop:-8,
          marginLeft:8.4,

        }
      } else {
        lineStyle = {}
      }

      let ballLine = {
            overflow: "hidden",
            position: "relative"
      }

      return(

        <div style={ballLine} >
              <span style = {svgStyle} width={30}>
              <svg width = {30} height = {20}>
                <circle cx={10} cy={10} r={6} stroke="blue" strokeWidth={1} fill="blue" />
                </svg>
                <div style = {lineStyle}></div>
                </span>



            <span style={unorderedList}>
              <tr>
                <td>
                  <div className = "filterNum"><div className = "emailNumber">41067</div>
                  </div>
                    <DropDown
                      options={['IS FROM/TO:', 'MENTION:', 'SUBJECT CONTAINS:']}
                      active={null}
                      onChange={null}
                      size={size}
                      addData={addData}
                      filterIdx={filterIdx}
                      changeFilter={changeFilter}
                      />
                </td>
              </tr>
            </span>
        </div>

      );
    }



});
