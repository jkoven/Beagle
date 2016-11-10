'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import Infinite from 'react-infinite';
import Dialog from 'rc-dialog';
import dataSource from '../sources/dataSource';
import _ from 'lodash'
//import dataSource from '../sources/dataSource';

require('styles//ContactGraph.scss');
var d3 = require('d3');
let linkSpacing = 8;
let width = 300;
let height = 40;
let rad = 8;
let oneClick=false;

module.exports = React.createClass({

  getInitialState: function() {
    return {
      nodeScale: d3.scaleLog(),
      linkScale: d3.scaleLog(),
      contacts: [],
      maxCount: 0,
      test: 0,
      fromCount: 0,
      nodes: [],
      links: [],
      searchArr : [],
      input: '',
      queryNodeHeight: 40,
      contactListHeight: 600,
      dialogVisible: false,
      dialogWidth: 300,
      dialogHeight: 500,
      dialogNodes: [],
      mousePosition:{
        x: 0,
        y: 0
      },
      dialogTitle: 'Emtpy List',
      query: `query getData($filters:[Rule]){
								Select(filters:$filters){
									Summaries {
										FromAddress {
											Key
											Count
										}
									}
								}
							}`
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
    let nodeScale = d3.scaleLog();
    let linkScale = d3.scaleLog();
    let nodes = newProps.nodes;
    let fromCount = 0;
//    console.log(nodes);
//    let toNodes = newProps.nodes;
//    let contacts = newProps.contacts;
    let links = [];
    height = 24 * nodes.length + 40;
    width = parseInt(d3.select(ReactDOM.findDOMNode(this)).style('width'));
//    let yCenter = height/2;
    let nodeSpacing = 24;
    let nodeStartY = 35;
    linkSpacing = 2 * rad + 2;
    let nodeX = 5;

    nodes.map ((node, idx) => {
      node['ndx'] = idx+1;
      node['y'] = nodeStartY + (idx * nodeSpacing) + (nodeSpacing/2);
      node['x'] = nodeX;
      if (node.queryNode) {
        if (node.toNode) {
          fromCount++;
        }
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
    linkScale.range([1, rad]);
    nodeScale.range([1, rad]);
    linkScale.domain([newProps.minLinkCount, newProps.maxLinkCount]);
    nodeScale.domain([(newProps.minNodeCount > 0) ? newProps.minNodeCount : 1, newProps.maxNodeCount]);
    newProps.contacts.map((contact) => {
        contact.nodeClass = 'normal';
    });
    this.setState({
      nodes: nodes,
      contactListHeight: parseInt(d3.select(ReactDOM.findDOMNode(this)).style('height')) - height,
      links: links,
      contacts: newProps.contacts,
      queryNodeHeight: height,
      dialogWidth: 3 * width / 5,
      nodeScale: nodeScale,
      linkScale: linkScale,
      fromCount: fromCount
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

  mouseOverContact: function (contact){
    let currentContacts = this.state.contacts;
    contact.Summaries.ToAddresses.map((node) => {
      let link = currentContacts.find(function(c){
        return c.Key === node.Key;
      });
      if (typeof link !== 'undefined') {
        link.nodeClass = 'highlighted';
      }
    });
    this.setState({
      contacts: currentContacts
    });
  },

  mouseOutOfContact: function(){
    let currentContacts = this.state.contacts;
    currentContacts.map((node) => {
        node.nodeClass = 'normal';
    });
    this.setState({
      contacts: currentContacts
    });
  },

  onClose: function() {
   this.setState({
     dialogVisible:false
   })
 },
mouseClick: function(contact){
  console.log('here');
    let self = this;
    if (oneClick) {
      oneClick = false;
      self.mouseDoubleClick(contact);
    } else {
      oneClick = true;
      setTimeout(function() {
        if (oneClick) {
          oneClick = false;
          let jQuery = {};
          jQuery.filters = [{'field': 'FromAddress', 'operation': 'contains', 'value': [contact]}];
          dataSource.query(
            self.state.query, jQuery
          ).then(r => {
            let contactList = [];
            if (typeof r.data !== 'undefined'){
              contactList = r.data.Select.Summaries.ToAddresses;
            }
            self.setState({
              dialogVisible: true,
              dialogTitle: contact,
              dialogNodes: contactList
            })
          });
        }
      }, 200)
    }
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
    let {contacts} = this.state;
//    console.log(contacts);
		this.state.maxCount = _.get(contacts,'0.Count');
    // if(this.state.searchArr != contacts){
		// 	this.search(this.state.input);
		// }
		let contactElementHeight = 24;
    let mouseDoubleClick = this.mouseDoubleClick;
    let mouseClick = this.mouseClick;
    let overLink = this.mouseOverlink;
    let outOfLink = this.mouseOutOfLink;
    let overContact = this.mouseOverContact;
    let outOfContact = this.mouseOutOfContact;

//    let rad = 7;
    let fromX = width/3;
    let toX = fromX + 60 + ((this.state.fromCount < 3) ? 0 : this.state.fromCount - 2) * linkSpacing;
    let dialog = (
			<Dialog
				visible={this.state.dialogVisible}
				wrapClassName={'none'}
				animation='zoom'
				maskAnimation='fade'
				onClose={()=>(this.onClose())}
				style={{width: this.state.dialogWidth, height: this.state.dialogHeight}}
				mousePosition={this.state.mousePosition}
				title={<div  className = 'contactlist-component-list' style = {{height: contactElementHeight}}>{this.state.dialogTitle}</div>}
			>
        <Infinite containerHeight={this.state.contactListHeight} elementHeight={24}>
        { contacts.map((c,i) =>
          typeof this.state.nodes.find(function(n){return n.id === c.Key}) === 'undefined' &&
          <div
            key={'contactdiv'+c.Key}
            onDoubleClick= {function () {mouseDoubleClick(c.Key)}}
            >
            <svg
              key={c.Key}
              className='dialog-component-contact-svg'>
              <text
                key={'dialognodelabel' + c.Key + i}
                className={'normal'}
                x={5}
                y={18}
                >
                {c.Key}
              </text>
            </svg>
          </div>)}
        </Infinite>
			</Dialog>
		);

    return (
      <div className='contactgraph-component'>
        <svg className='contact-graph-svg'>
        <text
          className={'header'}
          x={fromX}
          y={20}
          textAnchor='middle'
          >
          {'FROM'}
        </text>
        <text
          className={'header'}
          x={toX}
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
              onMouseOver={this.mouseOverNode}
              onMouseOut={this.mouseOutOfNode}
              >
              {contact.id}
            </text>
            {
              contact.toNode &&
                <polygon
                  className={'node'+contact.ndx}
                  points={[
                    fromX - 5+ i * linkSpacing, contact.y,
                    fromX + i * linkSpacing, contact.y + 10,
                    fromX + 5 + i * linkSpacing, contact.y
                  ]}
                />
            }
            {
              contact.fromNode &&
                <polygon
                  className={'node'+contact.ndx}
                  points={[
                    toX - 5 + i * linkSpacing, contact.y,
                    toX + i * linkSpacing,contact.y + 10,
                    toX + 5 + i * linkSpacing,contact.y
                  ]}
                />
            }
          </g>
        )}
        </svg>
        <div className='contactlist-component-list' style={{top: this.state.queryNodeHeight}}>
				<Infinite containerHeight={this.state.contactListHeight} elementHeight={contactElementHeight}>
					{ contacts.map((c,i) =>
            <div
              key={'contactdiv'+c.Key}
              onClick= {function () {mouseClick(c.Key)}}
              >
              <svg
                key={c.Key}
                className='contactlist-component-contact-svg'>
                <text
                  key={'nodelabel' + c.Key + i}
                  className={c.nodeClass === 'normal' ? c.queryNode ? 'highlighted' : c.nodeClass : c.nodeClass}
                  x={5}
                  y={18}
                  onMouseOver={function () {overContact(c)}}
                  onMouseOut={function () {outOfContact()}}
                  >
                  {c.Key}
                </text>
                {c.sendsTo.map((link) =>
                  link.target.toNode &&
                  <circle
                    key={'tolinkcircleL' + link.target.id + i}
                    className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                    cx={fromX + ((link.target.ndx - 1) * linkSpacing)}
                    cy={10}
                    r={this.state.linkScale(link.size)}
                    onMouseOver={function (e) {overLink(e, link.target)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                  )
                }
                {c.receivedFrom.map((link) =>
                  link.target.fromNode &&
                  <circle
                    key={'fromlinkcircleL' + link.target.id + i}
                    className={link.target.nodeClass === 'highlighted' ? 'blinknode'+link.target.ndx : 'node'+link.target.ndx}
                    cx={toX + ((link.target.ndx-1)*linkSpacing)}
                    cy={10}
                    r={this.state.linkScale(link.size)}
                    onMouseOver={function (e) {overLink(e, link.target)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                  )
                }
                {this.state.nodes.length < 1 && c.toCount > 0 &&
                  <circle
                    key={'tolinkcircleL' + c.Key + c.ndx + i}
                    className={'node1'}
                    cx={toX}
                    cy={10}
                    r={this.state.nodeScale(c.toCount)}
                    onMouseOver={function (e) {overLink(e, c)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                }
                {this.state.nodes.length < 1 && c.fromCount > 0 &&
                  <circle
                    key={'fromlinkcircleL' + c.Key+ c.ndx + i}
                    className={'node2'}
                    cx={fromX}
                    cy={10}
                    r={this.state.nodeScale(c.fromCount)}
                    onMouseOver={function (e) {overLink(e, c)}}
                    onMouseOut={function () {outOfLink()}}
                  />
                }
					    </svg>
            </div>)}
					</Infinite>
				</div>
        {dialog}
      </div>
    );
  }
});
