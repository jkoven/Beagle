'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search';

require('styles//ContactList.scss');
import {PRIMARY, PRIMARY_VERY_LIGHT} from './style';
class ContactList extends React.Component {
	constructor() {
		super();
		this.state = {
			maxCount: 0,
			input : "",
			searchArr : []
		}
	}
	 search(input){
		this.state.searchArr = [];
		let {contacts} = this.props;
			for(var i = 0; i < contacts.length; i++){
				if((_.get(contacts,i+".Key")).includes(input)==true){
					this.state.searchArr.push({
					Key:	(_.get(contacts,i+".Key")),
					Count: (_.get(contacts,i+".Count"))
				})
				}
			}
			this.state.maxCount = _.get(this.state.searchArr,"0.Count");
		}

	render() {
		let {contacts} = this.props;
		    this.state.maxCount = _.get(contacts,"0.Count");
		if(this.state.searchArr != contacts){
			this.search(this.state.input);
		}
		return (
			<div className="contactlist-component">
				<div>
					<div className = "searchLength">{this.state.searchArr.length}</div>
					<TextField
						style={{ transform: 'scale(1.0) translate(-10%,-30px)', width: '100%', marginLeft:31, marginTop:20}}
						fullWidth={true}
						id="Search"
						type="search"
						value={this.state.input}
						onChange={e => {
						this.setState({input: e.target.value })
						{this.search(e.target.value)}
					}
					}
						floatingLabelText={(<div>
							<SearchIcon color="#D0E7F0" style={{ verticalAlign: 'middle', transform: 'scale(1.0) translate(0px,-2px)' }}   />
							<span className = "total" style={{ display: 'inline-block' }}>Search</span>
						</div>) }
						/>
				</div>
				<div className="contactlist-component-list" style={{ marginTop: -30 }}>
					{	this.state.searchArr.map(c => <div className = "hidden" key={c.Key} className="contactlist-component-contact">{c.Key}
					<div className = "count">

					<svg className="goodCSS" width="85">
					<g>
					<rect width = "85"  height = "11" x="0" y="-5" fill={"white"} className="borderCSS">
				</rect>
					<rect  width = {"85"*((c.Count)/(this.state.maxCount))}   height = "11" x="0" y="-5" fill={PRIMARY_VERY_LIGHT} className="goodCSS">
				</rect>
				<text x="	0%" y="70%" className = "textCSS">{c.Count}</text>
				</g>
				</svg>
				</div>
					<div className = "count2">
				<svg className="goodCSS" width="85">
				<g>
				<rect width = "85"  height = "11" x="0" y="-5" fill={"white"} className="borderCSS">
			</rect>
				<rect  width = {"85"*((c.Count)/(this.state.maxCount))}   height = "11" x="0" y="-5" fill={"#ff9393"} className="goodCSS">
			</rect>
			<text x="	0%" y="70%" className = "textCSS">{c.Count}</text>
			</g>
			</svg>


						</div>
					</div>)}
				</div>
			</div>
		);
	}
}

ContactList.displayName = 'ContactList';

// Uncomment properties you need
// ContactList.propTypes = {};
// ContactList.defaultProps = {};

export default ContactList;
