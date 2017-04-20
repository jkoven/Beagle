'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Range} from 'rc-slider';

require('rc-slider/assets/index.css');
require('styles//TimeGraph.scss');
var d3 = require('d3-scale');
let heightScale = d3.scaleLinear();

module.exports = React.createClass({

  getInitialState: function() {
    return {
      boxHeight: 100,
      boxWidth: 700,
      barCount: 100,
      barWidth: 6,
      barHeight: 25,
      minDate: '',
      maxDate: '',
      marks: [0,0],
      maxMark: 0,
      timeGroups: [{}],
      interval: 'Year',
      curRange: [0,0]
    }
  },

  componentDidMount: function() {
  },

  componentWillReceiveProps: function (newProps){
    let boxHeight = ReactDOM.findDOMNode(this).offsetHeight;
    let boxWidth = ReactDOM.findDOMNode(this).offsetWidth;
    heightScale.range([0,(boxHeight/2) - 5]);
    let maxCount = 0;
    newProps.timeGroups.map((g) => {
      maxCount = Math.max(maxCount, g.Count);
    });
    heightScale.domain([0, maxCount]);
    this.setState({
      boxHeight: boxHeight,
      boxWidth: boxWidth,
      barCount: newProps.timeGroups.length,
      barWidth: (boxWidth - 20)/newProps.timeGroups.length,
      barHeight: (boxHeight/2) - 5,
      minDate: newProps.minDate,
      maxDate: newProps.maxDate,
      marks: [0,newProps.timeGroups.length - 1],
      maxMark: newProps.timeGroups.length - 1,
      timeGroups: newProps.timeGroups,
      interval: newProps.interval,
      curRange: [0,newProps.timeGroups.length - 1]
    })
  },

  sliderChange: function (self, e){
    self.setState({
      marks: e
    })
  },

  sliderRangeChange: function (self, range){
    if(self.state.curRange[0] !== range[0] || self.state.curRange[1] !== range[1]){
      let beforeValue = '';
      let beforeAction = '';
      let afterAction = '';
      let afterValue = '';
      if (self.state.curRange[0] !== range[0]) {
        afterAction = 'modify';
        let dateStrings = self.state.timeGroups[range[0]].KeyAsString.split('/');
        switch (self.state.interval) {
          case 'Year':
            afterValue = dateStrings[0] + '-01-01'
            break;
          case 'Quarter':
            afterValue = dateStrings[1]+ '-' + dateStrings[0] + '-01'
            break;
          case 'Month':
            afterValue = dateStrings[1]+ '-' + dateStrings[0] + '-01'
            break;
          case 'Week':
            afterValue = dateStrings[2]+ '-' + dateStrings[1] + '-' + dateStrings[0]
            break;
          case 'Day':
            afterValue = dateStrings[2]+ '-' + dateStrings[1] + '-' + dateStrings[0]
            break;
          default:

        }
      }
      if (self.state.curRange[1] !== range[1]) {
        beforeAction = 'modify';
        let dateStrings = self.state.timeGroups[range[1]].KeyAsString.split('/');
        switch (self.state.interval) {
          case 'Year':
            beforeValue = dateStrings[0] + '-12-31'
            break;
          case 'Quarter':
            beforeValue = dateStrings[1]+ '-' + dateStrings[0] + '-31'
            break;
          case 'Month':
            beforeValue = dateStrings[1]+ '-' + dateStrings[0] + '-31'
            break;
          case 'Week':
            beforeValue = dateStrings[2]+ '-' + dateStrings[1] + '-' + (parseInt(dateStrings[0]) + 1)
            break;
          case 'Day':
            beforeValue = dateStrings[2]+ '-' + dateStrings[1] + '-' + (parseInt(dateStrings[0]) + 7)
            break;
          default:

        }
      }
      self.props.addModifyDateFilters(afterAction, afterValue, beforeAction, beforeValue);
      self.setState({
        curRange: range
      })
    }
  },

  sliderTipFormat(self, v){
    return(self.state.timeGroups[v].KeyAsString);
  },

  render: function(){
    self=this;
    let maxMark = this.state.maxMark;
    let marks = this.state.marks;
    let minDate = this.state.minDate;
    let maxDate = this.state.maxDate;
    let sliderChange = this.sliderChange;
    let sliderRangeChange = this.sliderRangeChange;
    let tipFormatter = this.sliderTipFormat;
    let sliderMarks = {};
    if(this.props.minDate !== ''){
      minDate = minDate.slice(0, minDate.indexOf('T'));
      maxDate = maxDate.slice(0, maxDate.indexOf('T'));
      sliderMarks[0] = minDate;
      sliderMarks[maxMark] =  maxDate;
    }
    return (
      <div className='timegraph-component'>
        <svg className='slider-caption-svg'>
        <text
          className='intervalcaption'
          x={this.state.boxWidth/2}
          y={this.state.boxHeight/8}
        >
          {'Interval: ' + this.state.interval}
        </text>
        <text
          className='startcaption'
          x={10}
          y={this.state.boxHeight/8}
        >
          {'Start Date : ' + minDate}
        </text>
        <text
          className='endcaption'
          x={this.state.boxWidth - 10}
          y={this.state.boxHeight/8}
        >
          {'End Date : ' + maxDate}
        </text>
        </svg>
        <div
          className='sliderdiv'
          style={{width:this.state.boxWidth - 20 - (this.state.barWidth),
          left: 10 + this.state.barWidth/2 + 'px'}}
          >
          <Range
            allowCross={false}
            min={0}
            max={maxMark}
            range={true}
            value={marks}
            onChange={function(e){sliderChange(self, e)}}
            onAfterChange={function(range) {sliderRangeChange(self, range)}}
            tipFormatter={function(v){return (tipFormatter(self, v))}}
          />
        </div>
        <svg className='time-graph-svg'>
        {this.props.timeGroups.map((g, i) =>
          <g
            key={'timebar' + i}
            className={'normal'}
          >
          <rect
            className={'normal'}
            x={10+i*self.state.barWidth}
            y={(self.state.boxHeight/2 - 5) - heightScale(g.Count)}
            width={self.state.barWidth}
            height={heightScale(g.Count)}
          />
          </g>
        )}
        </svg>
      </div>
    );
  }
});
