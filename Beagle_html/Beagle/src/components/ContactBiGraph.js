'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import Infinite from 'react-infinite';
import Dialog from 'rc-dialog';
import dataSource from '../sources/dataSource';
import ReactTooltip from 'react-tooltip'
import _ from 'lodash'
//import dataSource from '../sources/dataSource';

require('styles//ContactGraph.scss');
var d3 = require('d3-scale');
//let linkSpacing = 8;
let width = 300;
let height = 40;
let oneClick=false;
let contactElementHeight = 28;
let rad = (contactElementHeight - 4)/2 - 1;

module.exports = React.createClass({

  getInitialState: function() {
    return {
      nodeScale: d3.scaleLog(),
      linkScale: d3.scaleLog(),
      contacts: [],
      contactsByCol: [],
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
      gridWidth: 300,
      mousePosition:{
        x: 0,
        y: 0
      },
      dialogTitle: 'Emtpy List',
      query: `query getData($filters:[Rule]){
								Select(filters:$filters){
									Summaries {
										ToAddresses {
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
      contactListHeight: ReactDOM.findDOMNode(this).offsetHeight - 55,
      gridWidth: (ReactDOM.findDOMNode(this).offsetWidth / 4) * 3
		});
  },

  componentDidUpdate: function() {
//    console.log('in did update')
  },

  componentWillReceiveProps: function (newProps){
    let nodeScale = d3.scaleLinear();
    let linkScale = d3.scaleLinear();
    let nodes = newProps.nodes;
    let fromCount = 0;
//    console.log(nodes);
//    let toNodes = newProps.nodes;
//    let contacts = newProps.contacts;
    let links = [];
    let nodeStartY = 0;

    height = nodes.length * 24 + 10
    width = ReactDOM.findDOMNode(this).offsetWidth;
//    let yCenter = height/2;
    let nodeSpacing = 24;
//    linkSpacing = 2 * rad + 2;
    let nodeX = 5;

    nodes.map ((node, idx) => {
      node['ndx'] = idx+1;
      node['y'] = nodeStartY + (idx * nodeSpacing) + (nodeSpacing/2);
      node['x'] = nodeX;
    //   if (node.queryNode) {
    //     if (node.toNode) {
    //       fromCount++;
    //     }
    //     node.toList.map((tnode) => {
    //       let thisTo = nodes.find(function(ttnode){
    //         return(ttnode.id === tnode.Key);
    //       });
    //       if (typeof thisTo !== 'undefined') {
    //         if (thisTo.id !== node.id) {
    //         //   node.toLinks.push({
    //         //     target: thisTo,
    //         //     size: thisTo.size
    //         //   });
    //           thisTo.fromLinks.push({
    //             target: node,
    //             size: tnode.Count
    //           });
    //         }
    //       }
    //     });
    //     node.fromList.map((fnode) => {
    //       let thisFrom = nodes.find(function(ffnode){
    //         return(ffnode.id === fnode.Key);
    //       });
    //       if (typeof thisFrom !== 'undefined') {
    //         if (thisFrom.id !== node.id) {
    //         //   node.fromLinks.push({
    //         //     target: thisFrom,
    //         //     size: thisFrom.size
    //         //   });
    //           thisFrom.toLinks.push({
    //             target: node,
    //             size: fnode.Count
    //           });
    //         }
    //       }
    //     });
      // }
    });
    linkScale.range([1, rad]);
    nodeScale.range([1, rad]);
    linkScale.domain([newProps.minLinkCount, newProps.maxLinkCount]);
    nodeScale.domain([(newProps.minNodeCount > 0) ? newProps.minNodeCount : 1, newProps.maxNodeCount]);
    newProps.contacts.map((contact) => {
        contact.nodeClass = 'normal';
    });
    let contactsByCol = [];
    for(let i = 0; i < newProps.contacts.length; i = i + 3){
      let col = [];
      for (let j = 0; j < 3; j++){
        if (i + j < newProps.contacts.length){
          col[j] = newProps.contacts[i+j];
        }
      }
      contactsByCol.push(col);
    }
    this.setState({
      nodes: nodes,
      contactListHeight: ReactDOM.findDOMNode(this).offsetHeight - 10,
      links: links,
      contacts: newProps.contacts,
      contactsByCol: contactsByCol,
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

  onClose: function() {
   this.setState({
     dialogVisible:false
   })
 },

 // tipOpen: function(contact) {
 //   contact.nodeClass = 'highlighted';
 //   this.setState({
 //     contacts: this.state.contacts
 //   });
 // },
mouseClick: function(contact){
    let self = this;
    if (oneClick) {
      oneClick = false;
      ReactTooltip.hide();
      self.mouseDoubleClick(contact);
    } else {
      oneClick = true;
      setTimeout(function() {
        if (oneClick) {
          ReactTooltip.hide();
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
      }, 300)
    }
  },

  mouseDoubleClick: function(contact){
		this.props.addListItem(contact, 'Any');
	},

  render: function() {
    let {contacts} = this.state;
    let {contactsByCol} = this.state;
//    let self = this;
//    console.log(contacts);
		this.state.maxCount = _.get(contacts,'0.Count');
    // if(this.state.searchArr != contacts){
		// 	this.search(this.state.input);
		// }
    let mouseDoubleClick = this.mouseDoubleClick;
    let mouseClick = this.mouseClick;
//    let tipOpen = this.tipOpen;

//    let rad = 7;
    let fromX = width/3;
//    let toX = fromX + 60 + ((this.state.fromCount < 3) ? 0 : this.state.fromCount - 2) * linkSpacing;
    let countX = width/3 - 5;
    let radCenter = width/3 - rad - 5
//    let gridY = rad + 1;
    // let gridBoxWidth = Math.floor(3+2*rad);
    let gridBoxHeight = Math.floor(2+2*rad);
    // let gridCols = Math.floor(this.state.gridWidth / gridBoxWidth);
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
              <rect
              className='countbackground'
              x={this.state.dialogWidth - 45 - 100}
              width={100}
              y={0}
              height={gridBoxHeight}
              />
              <text
                key={'nodecount' + c.Key + i}
                className={'normal'}
                x={this.state.dialogWidth - 45}
                y={18}
                style={{textAnchor: 'end'}}
                >
                {c.Count}
              </text>
            </svg>
          </div>)}
        </Infinite>
			</Dialog>
		);

    return (
      <div className='contactgraph-component'>
        <div className='contactlist-component-list' style={{top: '10px'}}>
				<Infinite containerHeight={this.state.contactListHeight} elementHeight={contactElementHeight}>
					{ contactsByCol.map((row, i) =>
            <div
                key={'contactdivrow'+i}
                >
                {row.map((c,j) =>
                <span
                  key={'contactspan' + (i + j)}
                  onClick= {function () {mouseClick(c.Key)}}
                >
                <svg
                  ref={c.Key+(i+j)}
                  data-tip data-for={c.Key+'itip'}
                  key={c.Key}
                  className='contactlist-component-contact-svg'
                  style={{width: width/3, left:j * (width/3)}}
                  >
                  <text
                    key={'nodelabel' + c.Key + (i+j)}
                    className={c.nodeClass === 'normal' ? c.queryNode ? 'highlighted' : c.nodeClass : c.nodeClass}
                    x={5}
                    y={18}
                    >
                    {c.Key}
                  </text>
                  <rect
                  className='countbackground'
                  x={fromX-75}
                  width={75}
                  y={0}
                  height={gridBoxHeight}
                  />
                  <text
                    key={'nodecount' + c.Key + i}
                    className={c.nodeClass === 'normal' ? c.queryNode ? 'highlighted' : c.nodeClass : c.nodeClass}
                    x={countX - (2 * rad) - 4}
                    y={18}
                    style={{textAnchor: 'end'}}
                    >
                    {(this.state.nodes.length < 1) ? c.Count : c.fromLinkCount + c.toLinkCount}
                  </text>
                  {c.toCount > 0 && this.state.nodes.length < 1 &&
                    <path
                      key={'tolinkcircleL' + c.Key + c.ndx + i}
                      className={'node1'}
                      d={`M ${radCenter} ${1 + rad - this.state.nodeScale(c.toCount)}
                      A ${this.state.nodeScale(c.toCount)} ${this.state.nodeScale(c.toCount)},
                      0, 0, 0,
                      ${radCenter} ${rad+1+this.state.nodeScale(c.toCount)}
                      L ${radCenter} ${rad+1} Z`}
                    />
                  }
                  {c.fromCount > 0 && this.state.nodes.length < 1 &&
                    <path
                      key={'fromlinkcircleL' + c.Key + c.ndx + i}
                      className={'node4'}
                      d={`M ${radCenter+1} ${1 + rad - this.state.nodeScale(c.fromCount)}
                      A ${this.state.nodeScale(c.fromCount)} ${this.state.nodeScale(c.fromCount)},
                      0, 0, 1,
                      ${radCenter+1} ${rad+1+this.state.nodeScale(c.fromCount)}
                      L ${radCenter+1} ${rad+1} Z`}
                    />
                  }
                  {c.toLinkCount > 0 &&
                    <path
                      key={'tolinkcircleL' + c.Key + c.ndx + i}
                      className={'node1'}
                      d={`M ${radCenter} ${1 + rad - this.state.linkScale(c.toLinkCount)}
                      A ${this.state.linkScale(c.toLinkCount)} ${this.state.linkScale(c.toLinkCount)},
                      0, 0, 0,
                      ${radCenter} ${rad+1+this.state.linkScale(c.toLinkCount)}
                      L ${radCenter} ${rad+1} Z`}
                    />
                  }
                  {c.fromLinkCount > 0 &&
                    <path
                      key={'fromlinkcircleL' + c.Key + c.ndx + i}
                      className={'node4'}
                      d={`M ${radCenter+1} ${1 + rad - this.state.linkScale(c.fromLinkCount)}
                      A ${this.state.linkScale(c.fromLinkCount)} ${this.state.linkScale(c.fromLinkCount)},
                      0, 0, 1,
                      ${radCenter+1} ${rad+1+this.state.linkScale(c.fromLinkCount)}
                      L ${radCenter+1} ${rad+1} Z`}
                    />
                  }
  					    </svg>
                <ReactTooltip
                  id={c.Key+'itip'}
                  type='info'
                  scrollHide={true}
                >
                <p>{c.Key}</p>
                {c.sendsTo.map((link) =>
                  link.target.toNode &&
                  <p key={c.Key + 'to' + link.target.id + i}>
                    {'To ' + link.target.id+': '+ link.size}
                  </p>
                  )
                }
                {c.receivedFrom.map((link) =>
                  link.target.fromNode &&
                  <p key={c.Key + 'from' + link.target.id + i}>
                    {'From ' + link.target.id+': '+ link.size}
                  </p>
                  )
                }
                {this.state.nodes.length < 1 && c.toCount > 0 &&
                  <p key={c.Key + 'toall' + i}>
                    {'Total sent emails: '+ c.toCount}
                  </p>
                }
                {this.state.nodes.length < 1 && c.fromCount > 0 &&
                  <p key={c.Key + 'fromall'+ i}>
                  {'Total Recieved emails: '+ c.fromCount}
                  </p>
                }
                </ReactTooltip>
              </span>)
              }
            </div>)
          }
  				</Infinite>
				</div>
        {dialog}
      </div>
    );
  }
});
