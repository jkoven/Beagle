'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import Infinite from 'react-infinite';
import Dialog from 'rc-dialog';
import dataSource from '../sources/dataSource';
import ReactTooltip from 'react-tooltip'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import SocialGroup from 'material-ui/svg-icons/Social/Group';
import _ from 'lodash'
//import dataSource from '../sources/dataSource';

require('styles//ContactGraph.scss');
var d3 = require('d3');
//let linkSpacing = 8;
let width = 300;
let height = 40;
let oneClick=false;
let contactElementHeight = 28;
let rad = (contactElementHeight - 4)/2 - 1;
let graphRad = 10;

module.exports = React.createClass({

  getInitialState: function() {
    return {
      nodeScale: d3.scaleLog(),
      linkScale: d3.scaleLog(),
      graphLinkScale: d3.scaleLog(),
      graphNodeScale: d3.scaleLog(),
      graphType: 'circle',
      contacts: [],
//      contactsByCol: [],
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
      graphDialogWidth: (window.innerWidth/4) * 3,
      graphDialogVisible: false,
      graphDialogCount: 20,
      graphDialogContacts:[],
      dialogHeight: 500,
      graphDialogHeight: window.innerHeight - 100,
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
										Any (limit:10000) {
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
//    console.log(newProps.contacts);
    let nodeScale = d3.scaleLinear();
    let linkScale = d3.scaleLinear();
    let graphNodeScale = d3.scaleLinear();
    let graphLinkScale = d3.scaleLinear();
    let nodes = newProps.nodes;
    let fromCount = 0;
//    console.log(nodes);
//    let toNodes = newProps.nodes;
//    let contacts = newProps.contacts;
    let links = [];
//    let nodeStartY = 0;

    height = nodes.length * 24 + 10
    width = ReactDOM.findDOMNode(this).offsetWidth;
//    let yCenter = height/2;
//    let nodeSpacing = 24;
//    linkSpacing = 2 * rad + 2;
//    let nodeX = 5;

    // nodes.map ((node, idx) => {
    //   node['ndx'] = idx+1;
    //   node['y'] = nodeStartY + (idx * nodeSpacing) + (nodeSpacing/2);
    //   node['x'] = nodeX;
    // });
    linkScale.range([1, rad]);
    nodeScale.range([1, rad]);
    graphNodeScale.range([1, graphRad]);
    graphLinkScale.range([1, graphRad]);
    linkScale.domain([newProps.minLinkCount, newProps.maxLinkCount]);
    graphLinkScale.domain([newProps.minLinkCount, newProps.maxLinkCount]);
    nodeScale.domain([(newProps.minNodeCount > 0) ? newProps.minNodeCount : 1, newProps.maxNodeCount]);
    graphNodeScale.domain([(newProps.minEmailCount > 0) ? newProps.minEmailCount : 1, newProps.maxEmailCount]);
    newProps.contacts.map((contact) => {
        contact.nodeClass = 'normal';
    });
    this.setState({
      nodes: nodes,
      contactListHeight: ReactDOM.findDOMNode(this).offsetHeight - 10,
      links: links,
      contacts: newProps.contacts,
      // contactsByCol: contactsByCol,
      queryNodeHeight: height,
      dialogWidth: 3 * width / 5,
      nodeScale: nodeScale,
      linkScale: linkScale,
      graphLinkScale: graphLinkScale,
      graphNodeScale: graphNodeScale,
      fromCount: fromCount,
      graphDialogVisible: false
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
    this.state.contacts.map((contact)=>{
      contact.nodeClass='normal';
    })
   this.setState({
     dialogVisible:false,
     graphDialogVisible:false
   })
 },

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
          jQuery.filters = [{'field': 'Any', 'operation': 'contains', 'value': [contact]}];
          dataSource.query(
            self.state.query, jQuery
          ).then(r => {
            let contactList = [];
            if (typeof r.data !== 'undefined'){
              contactList = r.data.Select.Summaries.Any;
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

  graphClick: function(contact){
		this.props.addListItem(contact, 'Any');
	},

  showGraph: function(){
    let minLinkCount = Number.MAX_VALUE;
    let maxLinkCount = 0;
    let links = [];
    let linkTo = new Set();
    let linkFrom = new Set();
    let inGraph = new Set();
    let self = this;
    let contacts = this.state.contacts.slice(0,self.state.graphDialogCount);
    contacts.map((contact) => {
      inGraph.add(contact.Key);
    });
//    console.log(contacts);
//    console.log(this.state.contacts);
    contacts.map((contact, idx) => {
      contact.graphRad = self.state.graphNodeScale(contacts.length);
//      contact.graphRad = graphRad;
      contact.Summaries.ToAddresses.map((to) => {
        if ((!((linkTo.has(contact.Key) && linkFrom.has(to.Key))
            || (linkFrom.has(contact.Key) && linkTo.has(to.Key)))) && inGraph.has(to.Key))
            links.push({source:contact, target:contacts.find(function(c){return c.Key === to.Key}), count:to.Count, lineClass: 'normal'});
            linkFrom.add(contact.Key);
            linkTo.add(to.Key);
            maxLinkCount=(maxLinkCount < to.Count) ? to.Count : maxLinkCount;
            minLinkCount=(to.Count < minLinkCount) ? to.Count : minLinkCount;
      })
    })
//    console.log(links);
    this.state.graphLinkScale.domain([minLinkCount,maxLinkCount]);
    let height = this.state.graphDialogHeight - 100;
    let width = this.state.graphDialogWidth;
    switch (this.state.graphType) {
      case 'circle':
        let radius = Math.min(width/2, height/2) - 100;
        let radDegree = 0.0176;
        let centerX = parseFloat(width)/2.0;
        let centerY = parseFloat(height)/2.0;
        let chunk = 90.0;
        let size = contacts.length;
        let degreeperpoint = 355.0 / (size + 1);
          contacts.map((contact, i) => {
            let curdegree = chunk * (i % 4) + degreeperpoint * Math.floor(i / 4);
            contact.x = centerX + (radius * Math.cos(radDegree * curdegree));
            contact.y = centerY + (radius * Math.sin(radDegree * curdegree));
            contact.textX = (curdegree >= 270 || curdegree < 90)
                        ? contact.x + contact.graphRad + 2
                        : contact.x - contact.graphRad - 2;
            contact.textY = contact.y;
            contact.angle = this.angle(centerX, centerY, contact.x, contact.y);
            contact.textAnchor = (curdegree >= 270 || curdegree < 90) ? 'start' : 'end';
          });
          this.setState({
            links: links,
            graphDialogVisible: true,
            graphDialogContacts: contacts
          })
        break;
      case 'force':
      default:
        let nodes = contacts;
        d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).distance(250))
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
            links: links,
            graphDialogVisible: true,
            graphDialogContacts: contacts
          })
        }));
    }
	},

  render: function() {
    let self = this;
    let {contacts} = this.state;
    let gRad = 5;
//    let self = this;
//    console.log(contacts);
		this.state.maxCount = _.get(contacts,'0.Count');
    // if(this.state.searchArr != contacts){
		// 	this.search(this.state.input);
		// }
    let mouseDoubleClick = this.mouseDoubleClick;
    let mouseClick = this.mouseClick;
    let showGraph = this.showGraph;
//    let tipOpen = this.tipOpen;

//    let rad = 7;
    let fromX = width;
//    let toX = fromX + 60 + ((this.state.fromCount < 3) ? 0 : this.state.fromCount - 2) * linkSpacing;
    let countX = width - 5;
    let radCenter = width - rad - 5
//    let gridY = rad + 1;
    // let gridBoxWidth = Math.floor(3+2*rad);
    let gridBoxHeight = Math.floor(2+2*rad);
    // let gridCols = Math.floor(this.state.gridWidth / gridBoxWidth);
    let buttonStyle = {
      margin: '0px',
      top: '-30px',
      right: 'auto',
      bottom: 'auto',
      left: '0px',
      position: 'relative'
      // position:'absolute',
      // marginLeft: 220,
      // marginTop: -22
    };
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
        { this.state.dialogNodes.map((c,i) =>
          typeof this.state.nodes.find(function(n){return n.id === c.Key}) === 'undefined' &&
          <div
            key={'contactdiv'+c.Key}
            onDoubleClick = {function () {mouseDoubleClick(c.Key)}}
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
    let graphDialog = (
			<Dialog
				visible={this.state.graphDialogVisible}
				wrapClassName={'none'}
				animation='zoom'
				maskAnimation='fade'
				onClose={()=>(this.onClose())}
				style={{width: this.state.graphDialogWidth, height: this.state.graphDialogHeight, left: this.state.graphDialogWidth/6, top: '-20px'}}
				mousePosition={this.state.mousePosition}
				title={<div  className = 'contactlist-component-list' style = {{height: contactElementHeight}}>{'Contact Graph'}</div>}
			>
      <FloatingActionButton style={buttonStyle} mini={true}
        onClick={
          ()=>{
            self.state.graphDialogCount++;
            showGraph()
          }
        }
      >
        <ContentAdd />
      </FloatingActionButton>
      <FloatingActionButton style={buttonStyle} mini={true}
      onClick={
        ()=>{
          self.state.graphDialogCount--;
          showGraph()
        }
      }
    >
        <ContentRemove />
      </FloatingActionButton>
      <div className='contactgraph-component'>
        <svg className='contact-graph-svg' style={{height: this.state.graphDialogHeight - 60}}>
        {this.state.links.map((link, i) =>
          <g key={'g-graphline' + link.index + i}>
            <line
              key={'graphline' + link.index + i}
              className={link.lineClass}
              style={{strokeWidth: parseInt(this.state.graphLinkScale(link.count)) + 'px'}}
              x1={link.source.x} y1={link.source.y}
              x2={link.target.x} y2={link.target.y}
              onMouseOver = {function(){
                  link.lineClass = 'highlight';
                  link.source.nodeClass = 'highlight'
                  link.target.nodeClass = 'hightlight'
                  self.setState({links:self.state.links})
                  }
                }
              onMouseOut = {function(){
                  link.lineClass = 'normal';
                  link.source.nodeClass = 'normal'
                  link.target.nodeClass = 'normal'
                  self.setState({links:self.state.links})
                }
              }
            />
          </g>
        )}
        {this.state.graphDialogContacts.map((contact, i) =>
          <g
            key={'g-graphcircle' + contact.Key + i}
            className={contact.Key}
          >
            <circle
              key={'graphcircle' + contact.Key + i}
              className={'qnodeany'}
              cx={contact.x}
              cy={contact.y}
              r={contact.graphRad}
              onClick = {function () {mouseDoubleClick(contact.Key)}}
              onMouseOver = {function(){
                  contact.nodeClass = 'highlight';
                  self.state.links.map((link)=>{
                    if (link.source.Key === contact.Key || link.target.Key === contact.Key){
                      link.lineClass = 'highlight';
                      link.target.nodeClass = 'highlight';
                      link.source.nodeClass = 'highlight';
                    }
                  })
                  self.setState({graphDialogContacts:self.state.graphDialogContacts})
                }
              }
              onMouseOut = {function(){
                  contact.nodeClass = 'normal';
                  self.state.links.map((link)=>{
                    if (link.source.Key === contact.Key || link.target.Key === contact.Key) {
                      link.lineClass = 'normal';
                      link.target.nodeClass = 'normal';
                      link.source.nodeClass = 'normal';
                    }
                  })
                  self.setState({graphDialogContacts:self.state.graphDialogContacts})
                  }
                }
            />
            {
              self.state.graphType === 'circle' &&
              <text
                key={'nodelabel' + contact.Key + i}
                className={contact.nodeClass}
                x={contact.textX}
                y={contact.textY}
                style={{textAnchor: contact.textAnchor, alignmentBaseline: 'middle'}}
                onClick = {function () {mouseDoubleClick(contact.Key)}}
                transform={'rotate(' + contact.angle + ' ' + contact.x + ' ' + contact.y + ')'}
                textAnchor='middle'
                onMouseOver = {function(){
                    contact.nodeClass = 'highlight';
                    self.state.links.map((link)=>{
                      if (link.source.Key === contact.Key || link.target.Key === contact.Key){
                        link.lineClass = 'highlight';
                        link.target.nodeClass = 'highlight';
                        link.source.nodeClass = 'highlight';
                      }
                    })
                    self.setState({graphDialogContacts:self.state.graphDialogContacts})
                  }
                }
                onMouseOut = {function(){
                    contact.nodeClass = 'normal';
                    self.state.links.map((link)=>{
                      if (link.source.Key === contact.Key || link.target.Key === contact.Key) {
                        link.lineClass = 'normal';
                        link.target.nodeClass = 'normal';
                        link.source.nodeClass = 'normal';
                      }
                    })
                    self.setState({graphDialogContacts:self.state.graphDialogContacts})
                    }
                  }
              >
                {contact.Key}
              </text>
            }
            {
              self.state.graphType === 'force' &&
              <text
                key={'nodelabel' + contact.Key + i}
                className={contact.nodeClass}
                x={contact.x}
                y={contact.y - contact.graphRad - 2}
                onClick = {function () {mouseDoubleClick(contact.Key)}}
                textAnchor='middle'
                onMouseOver = {function(){
                    contact.nodeClass = 'highlight';
                    self.state.links.map((link)=>{
                      if (link.source.Key === contact.Key || link.target.Key === contact.Key){
                        link.lineClass = 'highlight';
                        link.target.nodeClass = 'highlight';
                        link.source.nodeClass = 'highlight';
                      }
                    })
                    self.setState({graphDialogContacts:self.state.graphDialogContacts})
                  }
                }
                onMouseOut = {function(){
                    contact.nodeClass = 'normal';
                    self.state.links.map((link)=>{
                      if (link.source.Key === contact.Key || link.target.Key === contact.Key) {
                        link.lineClass = 'normal';
                        link.target.nodeClass = 'normal';
                        link.source.nodeClass = 'normal';
                      }
                    })
                    self.setState({graphDialogContacts:self.state.graphDialogContacts})
                    }
                  }
              >
                {contact.Key}
              </text>
            }
          </g>
        )}
      </svg>
      </div>
			</Dialog>
		);

    return (
      <div className='contactgraph-component'>
      <FloatingActionButton style={buttonStyle} mini={true} onClick={()=>showGraph()}>
        <SocialGroup />
      </FloatingActionButton>
        <div className='contactlist-component-list' style={{top: '10px'}}>
				<Infinite containerHeight={this.state.contactListHeight} elementHeight={contactElementHeight}>
					{ contacts.map((c, i) =>
            <div
                key={'contactdivrow'+i}
                >
                <span
                  key={'contactspan' + (i)}
                  onClick= {function () {mouseClick(c.Key)}}
                >
                <svg
                  ref={c.Key+(i)}
                  data-tip data-for={c.Key+'itip'}
                  key={c.Key}
                  className='contactlist-component-contact-svg'
                  style={{width: width}}
                  >
                  <text
                    key={'nodelabel' + c.Key + (i)}
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
                    {(this.state.nodes.length < 1) ? c.Count : c.fromCount + c.toCount}
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
              </span>
            </div>)
          }
  				</Infinite>
				</div>
        {dialog}
        {graphDialog}
      </div>
    );
  }
});
