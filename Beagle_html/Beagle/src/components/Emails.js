'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search';
import _ from 'lodash';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
require('styles//Emails.scss');

let monthEnum = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

class Emails extends React.Component {
	constructor() {
		super();
		this.state = {
			visible: false,
			width: 800,
			destroyOnClose: false,
			center: false,
			subject:"",
			from:"",
			to:"",
			contents:""
		}
	}
	onClick(subject,from,to,contents) {
     this.setState({
       mousePosition: {
         x: this.pageX,
         y: this.pageY,
       },
       visible: true,
			 subject:subject,
			 from:from,
			 to:to,
			 contents:contents
     });
   }


	handleOpen(subject, from, to, contents){
		this.state.subject = subject;
		this.state.from = from;
		this.state.to = to;
		this.state.contents = contents;
	}

	onClose() {
	 this.setState({
		 visible:false
	 })
 }

	render() {
		 let dialog;
		let {emails} = this.props;
		let fullDates = [];
		for (var i = 0; i < emails.length; i++) {
			let str = i + ".Timestamp"
			let time = new Date(parseInt(_.get(emails, str)));
			let month = time.getMonth().toString();
			let day = time.getDate().toString();
			let year = time.getFullYear().toString();
			let date = monthEnum[month] + ' ' + day + ', ' +  year + ' ';
			fullDates.push(date);
			let wrapClassName = '';
      if (this.state.center) {
        wrapClassName = 'center';
      }
			const style = {
				width: this.state.width,
			};



      dialog = (
        <Dialog
          visible={this.state.visible}
          wrapClassName={wrapClassName}
          animation="zoom"
          maskAnimation="fade"
          onClose={()=>(this.onClose())}
          style={style}
          mousePosition={this.state.mousePosition}
          title={<div  className = "popup">{this.state.subject}</div>}
        >
				<div className = "popup"><span className = "props">From</span>:{this.state.from}</div>
				<div className = "popup"><span className = "props">To</span>:{this.state.to}</div>
				<div  className = "popup"><span className = "tmp"><span className = "props2">Content</span>:</span>{this.state.contents}</div>
        </Dialog>
      );
		}

		return (
			<div className="Emails-component">
				<div className="Emails-component-list" style={{ marginTop: -30 }}>
					{emails.map((c,idx) => <RaisedButton fullWidth = {true}  key={c.Subject} className="Emails-component-info" onClick={()=>(this.onClick(c.Subject,c.From,c.To,c.Contents))}><div  className = "text2">{fullDates[idx] + c.Subject}</div>
 					</RaisedButton>
				)}
				</div>
				{dialog}
      </div>

		);
	}
}

Emails.displayName = 'Emails';



export default Emails;
