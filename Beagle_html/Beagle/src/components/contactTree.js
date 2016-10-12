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
      rootNodes: [],
      childNodes: [],
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
//    let nodes = newProps.contactNodes;
    let contacts = newProps.contacts;
    let rootNodes = newProps.roots;
    let childNodes = [];
    let links = [];
    let height = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height'));
//    let width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
    let yCenter = height/2;
    let rootSpacing = (height - 30) / rootNodes.length;
    let rootStartY = yCenter - (((rootNodes.length - 1) * rootSpacing)/2);
    let rootX = 100;
    let childX = rootX + 300;
    let minLinkCount = Number.MAX_VALUE;
    let maxLinkCount = 0;
    let minNodeCount = Number.MAX_VALUE;
    let maxNodeCount = 0;

    linkScale.range([.5, 5]);
    nodeScale.range([1, 5])

    rootNodes.map ((snode, idx) => {
      minNodeCount = Math.min(snode.size, minNodeCount);
      maxNodeCount = Math.max(snode.size, maxNodeCount);
      snode['y'] = rootStartY + (idx * rootSpacing);
      snode['x'] = rootX;
      let nodeData;
      switch (snode.nodeType) {
        case 'any':
          nodeData = contacts.Any.find(function(contact){
            return (snode.id === contact.Key);
          });
          break;
        case 'to':
          nodeData = contacts.ToAddresses.find(function(contact){
            return (snode.id === contact.Key);
          });
          break;
        case 'from':
          nodeData = contacts.FromAddress.find(function(contact){
            return (snode.id === contact.Key);
          });
          break;
        default:
          break;
      }

      if (typeof nodeData !== 'undefined'){
        let thisNodeData;
        switch (snode.nodeType) {
          case 'any':
            thisNodeData = nodeData.Summaries.Any.slice(0,10 + rootNodes.length);
            break;
          case 'to':
            thisNodeData = nodeData.Summaries.FromAddress.slice(0,10 + rootNodes.length);
            break;
          case 'from':
            thisNodeData = nodeData.Summaries.ToAddresses.slice(0,10 + rootNodes.length);
            break;
          default:
            break;
        }
        thisNodeData.slice(0,10 + rootNodes.length).map((cnode) => {
          // if (typeof rootNodes.find (function(tnode){
          //   return (cnode.Key === tnode.id)
          // }) === 'undefined') {
            let thisChild = childNodes.find(function(tnode){
              return(tnode.id === cnode.Key);
            });
            if (typeof thisChild === 'undefined') {
              thisChild = {
                id: cnode.Key,
                size: cnode.Count,
                queryNode: false,
                mouseOver: false,
                nodeClass: 'normal',
                nodeType: snode.nodeType === 'any' ? 'any' : snode.nodeType === 'to' ? 'from' : 'to'};
              if (typeof rootNodes.find (function(tnode){
                return (cnode.Key === tnode.id)
              }) !== 'undefined') {
                thisChild['queryNode'] = true;
              }
              minNodeCount = Math.min(thisChild.size, minNodeCount);
              maxNodeCount = Math.max(thisChild.size, maxNodeCount);
              minLinkCount = Math.min(thisChild.size, minLinkCount);
              maxLinkCount = Math.max(thisChild.size, maxLinkCount);
              childNodes.push(thisChild);
            }
            links.push({source: snode, target: thisChild, value:cnode.Count,lineClass: 'normal', lineType: snode.nodeType})
//          }
        });
      }
    });
    linkScale.domain([minLinkCount, maxLinkCount]);
    nodeScale.domain([minNodeCount, maxNodeCount]);
    let childSpacing = (height - 30) / childNodes.length;
    let childStartY = yCenter - (((childNodes.length - 1) * childSpacing)/2);
    childNodes.map((cnode, index) => {
      cnode['y'] = childStartY + (index * childSpacing);
      cnode['x'] = childX;
    });
    links.map ((link) => {
      link['midpointx'] = (link.source.x + link.target.x) / 2;
      link['midpointy'] = (link.source.y + link.target.y) / 2;
      link['angle'] = this.angle(link.source.x, link.source.y, link.target.x, link.target.y);
    });
    this.setState({
      rootNodes: rootNodes,
      childNodes: childNodes,
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
        {this.state.rootNodes.map((contact, i) =>
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
        {this.state.childNodes.map((contact, i) =>
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
