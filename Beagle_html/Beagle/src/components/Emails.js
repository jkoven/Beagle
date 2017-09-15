'use strict';

import React from 'react';
import _ from 'lodash';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'rc-dialog';
import Infinite from 'react-infinite';
import ReactDOM from 'react-dom'
import 'rc-dialog/assets/index.css';
require('styles//Emails.scss');

let monthEnum = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let width = 300;

module.exports = React.createClass({
	getInitialState: function() {
    return {
			highlightwords:{},
			visible: false,
			width: 800,
			destroyOnClose: false,
			center: false,
			subject:'',
			from:'',
			to:'',
			emailListHeight: 400,
			contents:'',
			emails:[],
			heights:[],
			expanded:-1
    };
  },
	componentDidMount: function () {
    this.setState({
			emailListHeight: ReactDOM.findDOMNode(this).offsetHeight
		});
  },

	componentWillReceiveProps: function (newProps){
		width = ReactDOM.findDOMNode(this).offsetWidth;
		let heights = [];
		for (let i = 0; i < newProps.emails.length; i++){
			heights.push(75);
		}
	this.setState({
		emails: newProps.emails,
		heights: heights,
		highlightwords: newProps.highlightwords,
		expanded: -1
	});
	},


	onClick: function(idx) {
		if (this.state.expanded === idx){
			this.setState({
				heights: [...this.state.heights.slice(0,this.state.expanded), 75 ,...this.state.heights.slice(this.state.expanded + 1)],
				expanded: -1
			})
		} else if (this.state.expanded >= 0) {
		  this.state.heights = [...this.state.heights.slice(0,this.state.expanded), 75 ,...this.state.heights.slice(this.state.expanded + 1)];
			this.setState({
				heights: [...this.state.heights.slice(0,idx), 225 ,...this.state.heights.slice(idx + 1)],
				expanded: idx
			})
		} else {
			this.setState({
				heights: [...this.state.heights.slice(0,idx), 225 ,...this.state.heights.slice(idx + 1)],
				expanded: idx
			})
		}
//		return;
		// contents = contents.replace(/</g, '&lt;');
		// contents = contents.replace(/>/g, '&gt;');
		// contents = contents.replace(/\n/g, '<br />')
    //  this.setState({
    //    mousePosition: {
    //      x: this.pageX,
    //      y: this.pageY
    //    },
    //    visible: true,
		// 	 subject:subject,
		// 	 from:from,
		// 	 to:to,
		// 	 contents:contents
    //  });
   },

	onClose: function() {
	 this.setState({
		 visible:false
	 })
 },

	render() {
		let dialog;
		let contents = '';
		let {emails,heights} = this.state;
//		console.log(emails);
		let fullDates = [];
		let wrapClassName = '';
		if (this.state.center) {
			wrapClassName = 'center';
		}
		const style = {
			width: this.state.width
		};
		for (var i = 0; i < emails.length; i++) {
			let str = i + '.Timestamp'
			let time = new Date(parseInt(_.get(emails, str)));
			let month = time.getMonth().toString();
			let day = time.getDate().toString();
			let year = time.getFullYear().toString();
			let date = monthEnum[month] + ' ' + day + ', ' +  year + ' ';
			fullDates.push(date);

		}
		return (

			<div className='Emails-component' >
			<div className='Emails-component-list' >
			<Infinite containerHeight={this.state.emailListHeight} elementHeight={this.state.heights}>
				{emails.map((c,idx) =>
					<div
							key={'emaildivrow'+idx}
							className={'emaillistdiv'}
							style={{height: heights[idx] - 1}}
							>
								<svg
									key={'emailsvg' + c.Subject + idx}
									className='emaillist-emails-svg'
									style={{width: width}}
									>
									{ this.state.expanded !== idx &&
										<path
											className={'emailexpandarrow'}
											d="M 5 5 L 10 10 L 5 15"
										/>
									}
									{ this.state.expanded === idx &&
										<path
											className={'emailexpandarrow'}
											d="M 5 5 L 10 10 L 15 5"
										/>
									}
										<rect
											key={'emailsvgrect' + idx}
											className={'emailexpandrect'}
											onClick={()=>(this.onClick(idx))}
										/>
										<text
											key={'nodelabel' + c.Key + (i)}
											className={'normal'}
											x={20}
											y={16}
											>
											{fullDates[idx] + c.Subject.replace(/<em>/g, '').replace(/<\/em>/g, '')}
										</text>
								</svg>
								{
									heights[idx] <= 75 &&
									<div
										className={'emaillistsnippet'}
									>
									<div dangerouslySetInnerHTML={{__html: c.Contents.substring(0,200)}} />
									</div>

								}
								{
									heights[idx] > 75 &&
									<div
										className={'emaillistexpandedemail'}
									>
									<div className = 'popup'><span className = 'props'>{'From'}</span>:<span dangerouslySetInnerHTML={{__html: c.From}} /></div>
									<div className = 'popup'><span className = 'props'>To</span>:<span dangerouslySetInnerHTML={{__html: c.To}} /></div>
									<div className = 'popup'><span className = 'props'>Date</span>:{new Date(parseInt(c.Timestamp)).toString()}</div>
									<div className = 'popup'><span className = 'props'>Subject</span>:<span dangerouslySetInnerHTML={{__html: c.Subject}} /></div>
									<div  className = 'popup'><span className = 'props2'>Content</span>:
									<div dangerouslySetInnerHTML={{__html: c.Contents.replace(/\n/g, '<br />')}} /></div>
									</div>
								}
						</div>
					)}
			</Infinite>
			</div>
      </div>

		);
	}
})
