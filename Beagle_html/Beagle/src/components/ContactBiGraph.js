'use strict';

import React from 'react';
import ReactDOM from 'react-dom'

require('styles//ContactGraph.scss');
var d3 = require('d3');
let nodeScale = d3.scaleLog();
let linkScale = d3.scaleLog();

module.exports = React.createClass({

  getInitialState: function() {
    return {
      nodes: [],
      fromNodes: [],
      toNodes: [],
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
    let toNodes = newProps.toNodes;
//    let contacts = newProps.contacts;
    let fromNodes = newProps.fromNodes;
    let links = [];
    let height = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height'));
    let width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
    let yCenter = height/2;
    let fromSpacing = (height - 30) / fromNodes.length;
    let fromStartY = yCenter - (((fromNodes.length - 1) * fromSpacing)/2);
    let fromX = 100;
    let toX = width - 100;
    let toSpacing = (height - 30) / toNodes.length;
    let toStartY = yCenter - (((toNodes.length - 1) * toSpacing)/2);
    let minLinkCount = Number.MAX_VALUE;
    let maxLinkCount = 0;
    let minNodeCount = Number.MAX_VALUE;
    let maxNodeCount = 0;

    linkScale.range([.5, 5]);
    nodeScale.range([1, 5])

    fromNodes.map ((fnode, idx) => {
      minNodeCount = Math.min(fnode.size, minNodeCount);
      maxNodeCount = Math.max(fnode.size, maxNodeCount);
      fnode['y'] = fromStartY + (idx * fromSpacing);
      fnode['x'] = fromX;
      if (fnode.queryNode) {
        fnode.toList.map((tnode) => {
          let thisTo = toNodes.find(function(ttnode){
            return(ttnode.id === tnode.Key);
          });
          if (typeof thisTo !== 'undefined') {
            links.push({
              source: fnode,
              target: thisTo,
              value: thisTo.size,
              lineClass: 'normal',
              lineType: (thisTo.queryNode && fnode.queryNode) ? 'any' : 'from'
            });
            minLinkCount = Math.min(thisTo.size, minLinkCount);
            maxLinkCount = Math.max(thisTo.size, maxLinkCount);
          }
        });
      }
    });
    toNodes.map ((tnode, idx) => {
      minNodeCount = Math.min(tnode.size, minNodeCount);
      maxNodeCount = Math.max(tnode.size, maxNodeCount);
      tnode['y'] = toStartY + (idx * toSpacing);
      tnode['x'] = toX;
      if (tnode.queryNode) {
        tnode.fromList.map((fnode) => {
          let thisFrom = fromNodes.find(function(ffnode){
            return(ffnode.id === fnode.Key);
          });
          if (typeof thisFrom !== 'undefined') {
              if (typeof links.find(function(link){return (link.source === thisFrom && link.target === tnode)}) === 'undefined') {
              links.push({
                source: tnode,
                target: thisFrom,
                value: thisFrom.size,
                lineClass: 'normal',
                lineType: 'to'
              });
              minLinkCount = Math.min(thisFrom.size, minLinkCount);
              maxLinkCount = Math.max(thisFrom.size, maxLinkCount);
            }
          }
        });
      }
    });
    linkScale.domain([minLinkCount, maxLinkCount]);
    nodeScale.domain([minNodeCount, maxNodeCount]);
    links.map ((link) => {
      link['midpointx'] = (link.source.x + link.target.x) / 2;
      link['midpointy'] = (link.source.y + link.target.y) / 2;
      link['angle'] = this.angle(link.source.x, link.source.y, link.target.x, link.target.y);
    });
    this.setState({
      fromNodes: fromNodes,
      toNodes: toNodes,
      links: links
    });
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

  /* Link label code for later
                <text key={'linklabel' + link.id + i}
                className={link.lineClass}
                x={link.midpointx} y={link.midpointy}
                transform={'rotate(' + link.angle + ' ' + link.midpointx + ' ' + link.midpointy + ')'}
                textAnchor='middle'>
                {link.value}
              </text>
  */
  render: function(){
    let rad = 5;
    return (
      <div className='contactgraph-component'>
        <svg className='contact-graph-svg'>
        {this.state.links.map((link, i) =>
          <g key={'g-graphline' + link.id + i}>
            <line
              key={'graphline' + link.id + i}
              className={link.lineClass +link.lineType}
              x1={link.source.x} y1={link.source.y}
              x2={link.target.x} y2={link.target.y}
              style={{strokeWidth: linkScale(link.value)}}
            />
          </g>
        )}
        {this.state.fromNodes.map((contact, i) =>
          <g
            key={'g-graphcircle' + contact.id + i}
            className={contact.id}
          >
            <circle
              key={'graphcircle' + contact.id + i}
              className={(contact.queryNode ? 'qnode' : 'nqnode') + contact.nodeType}
              cx={contact.x}
              cy={contact.y}
              r={nodeScale(contact.size)}
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
        {this.state.toNodes.map((contact, i) =>
          <g
            key={'g-graphcircle' + contact.id + i}
            className={contact.id}
          >
            <circle
              key={'graphcircle' + contact.id + i}
              className={(contact.queryNode ? 'qnode' : 'nqnode') + contact.nodeType}
              cx={contact.x}
              cy={contact.y}
              r={nodeScale(contact.size)}
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
