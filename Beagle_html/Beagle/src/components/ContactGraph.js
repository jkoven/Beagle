'use strict';

import React from 'react';
import ReactDOM from 'react-dom'

require('styles//ContactGraph.scss');
var d3 = require('d3');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      nodes: [],
      links: []
    };
},

  componentDidMount: function() {
    // let el = React.findDOMNode(this);
    // console.log(el);
    // d3.select(el).append('svg').attr('class','contact-graph-svg');
  },

  componentDidUpdate: function() {
//    console.log('in did update')
  },

  componentWillReceiveProps: function (newProps){
    let nodes = newProps.contactNodes;
    let links = newProps.links;
    let height = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height'));
    let width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
    d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(function(d) {return d.id; }).distance(200))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .alphaDecay(0.1)
    .on('end', (() => {
      links.map ((link) => {
        link['midpointx'] = (link.source.x + link.target.x) / 2;
        link['midpointy'] = (link.source.y + link.target.y) / 2;
        link['angle'] = this.angle(link.source.x, link.source.y, link.target.x, link.target.y);
      });
      this.setState({
        nodes: nodes,
        links:links
      })
    }));

  },

  angle: function(sx, sy, ex, ey){
    let dy = ey - sy;
    let dx = ex - sx;
    if (sx > ex) {
      dy = sy - ey;
      dx = sx - ex;
    }
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
  },

  mouseOverNode: function (e){
    let name = e.target.parentNode.getAttribute('class');
    let currentLinks = this.state.links;
    currentLinks.map((link) => {
      if(link.source.id === name || link.target.id === name) {
        link.lineClass = 'highlighted';
        link.source.nodeClass = 'highlighted';
        link.target.nodeClass = 'highlighted';
      }
      this.setState({
        links: currentLinks
      });
    });
  },

  mouseOutOfNode: function(){
    let currentLinks = this.state.links;
    currentLinks.map((link) => {
      link.lineClass = 'normal';
      link.source.nodeClass = 'normal';
      link.target.nodeClass = 'normal';
      this.setState({
        links: currentLinks
      });
    });
  },

  render: function(){
    let rad = 5;
    return (
      <div className='contactgraph-component'>
        <svg className='contact-graph-svg'>
        {this.state.links.map((link, i) =>
          <g key={'g-graphline' + link.id + i}>
            <line
              key={'graphline' + link.id + i}
              className={link.lineClass}
              x1={link.source.x} y1={link.source.y}
              x2={link.target.x} y2={link.target.y}
            />
            <text key={'linklabel' + link.id + i}
              className={link.lineClass}
              x={link.midpointx} y={link.midpointy}
              transform={'rotate(' + link.angle + ' ' + link.midpointx + ' ' + link.midpointy + ')'}
              textAnchor='middle'>
              {link.value}
            </text>
          </g>
        )}
        {this.state.nodes.map((contact, i) =>
          <g
            key={'g-graphcircle' + contact.id + i}
            className={contact.id}
          >
            <circle
              key={'graphcircle' + contact.id + i}
              className={contact.queryNode ? 'qnode' : 'nqnode'}
              cx={contact.x}
              cy={contact.y}
              r={rad}
              onMouseOver={this.mouseOverNode}
              onMouseOut={this.mouseOutOfNode}
            />
            <text
              key={'nodelabel' + contact.id + i}
              className={contact.queryNode ? 'highlighted' : contact.nodeClass}
              x={contact.x}
              y={contact.y - rad - 2}
              textAnchor='middle'>{contact.id}
            </text>
          </g>
        )}
        </svg>
      </div>
    );
  }
});
