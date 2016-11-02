'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import dataSource from '../sources/dataSource';

require('styles//ContactGraph.scss');
var d3 = require('d3');
let nodeScale = d3.scaleLog();
let linkScale = d3.scaleLog();
let linkSpacing = 8;
let width = 300;
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
    let nodes = newProps.nodes;
//    let toNodes = newProps.nodes;
//    let contacts = newProps.contacts;
    let links = [];
    let height = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height'));
    width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
    let yCenter = height/2;
    let nodeSpacing = (height - 30) / nodes.length;
    let nodeStartY = yCenter - (((nodes.length - 1) * nodeSpacing)/2);
    linkSpacing = ((width - 4) / 3) / nodes.length;
    let nodeX = width/2;
    let minLinkCount = Number.MAX_VALUE;
    let maxLinkCount = 0;
    let minNodeCount = Number.MAX_VALUE;
    let maxNodeCount = 0;

    linkScale.range([2, 12]);
    nodeScale.range([2, 7])

    nodes.map ((node, idx) => {
      node['ndx'] = idx+1;
      minNodeCount = Math.min(node.size, minNodeCount);
      maxNodeCount = Math.max(node.size, maxNodeCount);
      node['y'] = nodeStartY + (idx * nodeSpacing) + (nodeSpacing/2);
      node['x'] = nodeX;
      if (node.queryNode) {
        node.toList.map((tnode) => {
          let thisTo = nodes.find(function(ttnode){
            return(ttnode.id === tnode.Key);
          });
          if (typeof thisTo !== 'undefined') {
            if (thisTo.id !== node.id) {
            //   node.toLinks.push({
            //     target: thisTo,
            //     size: thisTo.size
            //   });
              thisTo.fromLinks.push({
                target: node,
                size: thisTo.size
              });
              minLinkCount = Math.min(thisTo.size, minLinkCount);
              maxLinkCount = Math.max(thisTo.size, maxLinkCount);
            }
          }
        });
        node.fromList.map((fnode) => {
          let thisFrom = nodes.find(function(ffnode){
            return(ffnode.id === fnode.Key);
          });
          if (typeof thisFrom !== 'undefined') {
            if (thisFrom.id !== node.id) {
            //   node.fromLinks.push({
            //     target: thisFrom,
            //     size: thisFrom.size
            //   });
              thisFrom.toLinks.push({
                target: node,
                size: thisFrom.size
              });
              minLinkCount = Math.min(thisFrom.size, minLinkCount);
              maxLinkCount = Math.max(thisFrom.size, maxLinkCount);
            }
          }
        });
      }
    });
    // toNodes.map ((tnode, idx) => {
    //   minNodeCount = Math.min(tnode.size, minNodeCount);
    //   maxNodeCount = Math.max(tnode.size, maxNodeCount);
    //   tnode['y'] = toStartY + (idx * toSpacing);
    //   tnode['x'] = toX;
    //   if (tnode.queryNode) {
    //     tnode.fromList.map((fnode) => {
    //       let thisFrom = fromNodes.find(function(ffnode){
    //         return(ffnode.id === fnode.Key);
    //       });
    //       if (typeof thisFrom !== 'undefined' ) {
    //         if (thisFrom.id !== tnode.id) {
    //           let fromLink = links.find(function(link){return (link.source === thisFrom && link.target === tnode)});
    //           if (typeof fromLink === 'undefined') {
    //             links.push({
    //               source: tnode,
    //               target: thisFrom,
    //               value: thisFrom.size,
    //               lineClass: 'normal',
    //               lineType: 'to'
    //             });
    //             minLinkCount = Math.min(thisFrom.size, minLinkCount);
    //             maxLinkCount = Math.max(thisFrom.size, maxLinkCount);
    //           } else {
    //             fromLink.lineType = 'any';
    //           }
    //         }
    //       }
    //     });
    //   }
    // });
    linkScale.domain([minLinkCount, maxLinkCount]);
    nodeScale.domain([minNodeCount, maxNodeCount]);
    // links.map ((link) => {
    //   link['midpointx'] = (link.source.x + link.target.x) / 2;
    //   link['midpointy'] = (link.source.y + link.target.y) / 2;
    //   link['angle'] = this.angle(link.source.x, link.source.y, link.target.x, link.target.y);
    // });
    this.setState({
      nodes: nodes,
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
    let currentNodes = this.state.nodes;
    // let query = `query getData($filters:[Rule]){
    //           Select(filters:$filters){
    //             Summaries {
    //               Any {
    //                 Key
    //                 Count
    //               }
    //             }
    //           }
    //         }`
    // let jsonQuery = this.props.jsonQuery;
    // if (jsonQuery.filters.length > 0){
    //   dataSource.query(
    //     query, jsonQuery
    //   ).then(r => {
    //     let contactList = [];
    //     if (typeof r.data !== 'undefined'){
    //       contactList = r.data.Select.Summaries;
    //       console.log(contactList);
    //     }
    //   });
    // }
    currentNodes.map((node) => {
      if(node.id === name) {
        node.nodeClass = 'highlighted';
      }
      this.setState({
        nodes: currentNodes
      });
    });
  },

  mouseOutOfNode: function(){
    let currentNodes = this.state.nodes;
    currentNodes.map((node) => {
        node.nodeClass = 'normal';
      this.setState({
        nodes: currentNodes
      });
    });
  },
  mouseOverlink: function (e, link){
    let name = link.id;
    let currentNodes = this.state.nodes;
    currentNodes.map((node) => {
      if(node.id === name) {
        node.nodeClass = 'node' + link.ndx;
      }
      this.setState({
        nodes: currentNodes
      });
    });
  },

  mouseOutOfLink: function(){
    let currentNodes = this.state.nodes;
    currentNodes.map((node) => {
        node.nodeClass = 'normal';
      this.setState({
        nodes: currentNodes
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
    Save for bubbles if needed
              {contact.fromLinks.map((link, i) =>
                <circle
                  key={'fromlinkcircle' + contact.id + i}
                  className={'node'+link.target.ndx}
                  cx={contact.x - 20 - (i*linkSpacing)}
                  cy={contact.y}
                  r={linkScale(link.size)}
                  onMouseOver={this.mouseOverNode}
                  onMouseOut={this.mouseOutOfNode}
                />
              )}
              {contact.toLinks.map((link, i) =>
                <circle
                  key={'tolinkcircle' + contact.id + i}
                  className={'node'+link.target.ndx}
                  cx={contact.x + 20 + (i*linkSpacing)}
                  cy={contact.y}
                  r={linkScale(link.size)}
                  onMouseOver={this.mouseOverNode}
                  onMouseOut={this.mouseOutOfNode}
                />
              )}
    Save if we want the node back under the label
              <circle
                key={'graphcircle' + contact.id + i}
                className={'node'+contact.ndx}
                cx={contact.x}
                cy={contact.y}
                r={nodeScale(contact.size)}
                onMouseOver={this.mouseOverNode}
                onMouseOut={this.mouseOutOfNode}
              />
  */
  render: function(){
    let overLink = this.mouseOverlink;
    let outOfLink = this.mouseOutOfLink;
    let rad = 7;
    let fromX = width/5;
    let toX = ((width/5) * 4) - 10;

    return (
      <div className='contactgraph-component'>
        <svg className='contact-graph-svg'>
        <text
          className={'header'}
          x={width/6}
          y={20}
          textAnchor='middle'
          >
          {'FROM'}
        </text>
        <text
          className={'header'}
          x={width/6 * 5}
          y={20}
          textAnchor='middle'
          >
          {'TO'}
        </text>
        {this.state.nodes.map((contact, i) =>
          <g
            key={'g-graphcircle' + contact.id + i}
            className={contact.id}
          >
            contact.queryNode &&
            <text
              key={'nodelabel' + contact.id + i}
              className={contact.nodeClass === 'normal' ? contact.queryNode ? 'highlighted' : contact.nodeClass : contact.nodeClass}
              x={contact.x}
              y={contact.y - rad - 3}
              textAnchor='middle'
              onMouseOver={this.mouseOverNode}
              onMouseOut={this.mouseOutOfNode}
              >
              {contact.id}
            </text>
            {
              contact.fromNode &&
                <polygon
                  className={'node'+contact.ndx}
                  points={[fromX, contact.y - rad - 3, fromX + 5 ,contact.y - rad - 12, fromX + 10 ,contact.y - rad - 3]}
                />
            }
            {
              contact.toNode &&
                <polygon
                  className={'node'+contact.ndx}
                  points={[toX, contact.y - rad - 3, toX + 5 ,contact.y - rad - 12, toX + 10 ,contact.y - rad - 3]}
                />
            }
                {contact.fromLinks.map((link, i) =>
                  link.target.fromNode &&
                    <rect
                      key={'fromlinkrect' + contact.id + i}
                      className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                      x={(4 * width / 5) + (link.target.ndx*linkSpacing)}
                      y={(contact.y - rad - 15) + (12 - linkScale(link.size))}
                      height={linkScale(link.size)}
                      width={4}
                      onMouseOver={function (e) {overLink(e, link.target)}}
                      onMouseOut={function () {outOfLink()}}
                    />
                  )
                }
                {contact.toLinks.map((link, i) =>
                  link.target.toNode &&
                    <rect
                      key={'tolinkrect' + contact.id + i}
                      className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                      x={(width/5) - (link.target.ndx*linkSpacing)}
                      y={(contact.y - rad - 15) + (12 - linkScale(link.size))}
                      height={linkScale(link.size)}
                      width={4}
                      onMouseOver={function (e) {overLink(e, link.target)}}
                      onMouseOut={function () {outOfLink()}}
                    />
                  )
                }
          </g>
        )}
        </svg>
      </div>
    );
  }
});
