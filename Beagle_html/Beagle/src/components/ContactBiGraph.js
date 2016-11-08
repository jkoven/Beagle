'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import Infinite from 'react-infinite';
import _ from 'lodash'
//import dataSource from '../sources/dataSource';

require('styles//ContactGraph.scss');
var d3 = require('d3');
let nodeScale = d3.scaleLog();
let linkScale = d3.scaleLog();
let linkSpacing = 8;
let width = 300;
let height = 40;
module.exports = React.createClass({

  getInitialState: function() {
    return {
      maxCount: 0,
      test: 0,
      nodes: [],
      fromNodes: [],
      toNodes: [],
      links: [],
      searchArr : [],
      input: '',
      queryNodeHeight: 40,
      contactListHeight : 600
    };
},

  componentDidMount: function() {
    this.setState({
			contactListHeight: ReactDOM.findDOMNode(this).offsetHeight - 55
		});
  },

  componentDidUpdate: function() {
//    console.log('in did update')
  },

  componentWillReceiveProps: function (newProps){
    let nodes = newProps.nodes;
//    console.log(nodes);
//    let toNodes = newProps.nodes;
//    let contacts = newProps.contacts;
    let links = [];
    height = 24 * nodes.length + 40;
    width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
//    let yCenter = height/2;
    let nodeSpacing = 24;
    let nodeStartY = 35;
    linkSpacing = ((width - 4) / 5) / 12;
    let nodeX = width/2;

    linkScale.range([1, 19]);
    nodeScale.range([1, 19])

    nodes.map ((node, idx) => {
      node['ndx'] = idx+1;
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
                size: tnode.Count
              });
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
                size: fnode.Count
              });
            }
          }
        });
      }
    });
    linkScale.domain([newProps.minLinkCount, newProps.maxLinkCount]);
    nodeScale.domain([newProps.minNodeCount, newProps.maxNodeCount]);
    this.setState({
      nodes: nodes,
      contactListHeight: parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height')) - height,
      links: links,
      queryNodeHeight: height
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

  mouseDoubleClick: function(contact){
		this.props.addListItem(contact, 'Any');
	},

  // search: function(input) {
  //  this.state.test = 0;
  //  this.state.searchArr = [];
  //  let {contacts} = this.props;
  //    for(var i = 0; i < contacts.length; i++){
  //      if((_.get(contacts,i+'.Key')).includes(input)==true){
  //        if((_.get(contacts,i+'.Counts')).FromAddress > this.state.test){
  //          this.state.test = (_.get(contacts,i+'.Counts')).FromAddress;
  //        }
  //        this.state.searchArr.push({
  //        Key:	(_.get(contacts,i+'.Key')),
  //        Count: (_.get(contacts,i+'.Count')),
  //        Counts: (_.get(contacts,i+'.Counts')).FromAddress
  //      })
  //      }
  //    }
  //    this.state.maxCount = _.get(this.state.searchArr,'0.Count');
  //  },

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
  render: function() {
    let {contacts} = this.props;
//    console.log(contacts);
		this.state.maxCount = _.get(contacts,'0.Count');
    // if(this.state.searchArr != contacts){
		// 	this.search(this.state.input);
		// }
		let contactElementHeight = 24;
    let mouseDoubleClick = this.mouseDoubleClick;
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
              y={contact.y + 10}
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
                  points={[
                    fromX, contact.y + 10,
                    fromX + 5, contact.y,
                    fromX + 10, contact.y + 10
                  ]}
                />
            }
            {
              contact.toNode &&
                <polygon
                  className={'node'+contact.ndx}
                  points={[toX, contact.y + 10, toX + 5 ,contact.y, toX + 10 ,contact.y + 10]}
                />
            }
                {contact.fromLinks.map((link, i) =>
                  link.target.fromNode &&
                    <rect
                      key={'fromlinkrect' + contact.id + i}
                      className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                      x={(4 * width / 5) + (link.target.ndx*linkSpacing)}
                      y={contact.y + 10 - linkScale(link.size)}
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
                      y={contact.y + 10 - linkScale(link.size)}
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
        <div className='contactlist-component-list' style={{top: this.state.queryNodeHeight}}>
				<Infinite containerHeight={this.state.contactListHeight} elementHeight={contactElementHeight}>
					{ contacts.map((c,i) =>
            <div
              key={'contactdiv'+c.Key}
              onDoubleClick= {function () {mouseDoubleClick(c.Key)}}
              >
              <svg
                key={c.Key}
                className='contactlist-component-contact-svg'>
                <text
                  key={'nodelabel' + c.Key + i}
                  className={'normal'}
                  x={width/2}
                  y={contactElementHeight/2}
                  textAnchor='middle'
                  >
                  {c.Key}
                </text>
                {c.sendsTo.map((link) =>
                  link.target.toNode &&
                  <rect
                    key={'tolinkrectL' + link.target.id + i}
                    className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                    x={(width/5) - (link.target.ndx*linkSpacing)}
                    y={20 - linkScale(link.size)}
                    height={linkScale(link.size)}
                    width={4}
                    onMouseOver={function (e) {overLink(e, link.target)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                  )
                }
                {c.receivedFrom.map((link) =>
                  link.target.fromNode &&
                  <rect
                    key={'fromlinkrectL' + link.target.id + i}
                    className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                    x={(4 * width / 5) + (link.target.ndx*linkSpacing)}
                    y={20 - linkScale(link.size)}
                    height={linkScale(link.size)}
                    width={4}
                    onMouseOver={function (e) {overLink(e, link.target)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                  )
                }
					    </svg>
            </div>)}
					</Infinite>
				</div>
      </div>
    );
  }
});
