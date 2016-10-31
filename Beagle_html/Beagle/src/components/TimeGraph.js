'use strict';

import React from 'react';
import ReactDOM from 'react-dom'

require('styles//TimeGraph.scss');
var d3 = require('d3');
let nodeScale = d3.scaleLog();
let linkScale = d3.scaleLog();

module.exports = React.createClass({

  render: function(){
    let rad = 5;
    return (
      <div className='timegraph-component'>
        <svg className='time-graph-svg'>
        <text x={20} y={30}>Temporal Stuff Will Go Here</text>
        </svg>
      </div>
    );
  }
});
