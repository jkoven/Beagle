import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import ContactGraph from '../components/ContactGraph';
import ContactBiGraph from '../components/ContactBiGraph';
import dataSource from '../sources/dataSource';
import {addListItem} from '../actions/const';

function isValidDate(dateString) {
	var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
	return dateString.match(regEx) != null;
}


function today () {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	return (yyyy+'-'+mm+'-'+dd);
}

class BiGraphContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: [],
			nodes:[],
			jsonQuery: [],
			minLinkCount: Number.MAX_VALUE,
	    maxLinkCount: 0,
			minNodeCount: Number.MAX_VALUE,
	    maxNodeCount: 0,
			minEmailCount: Number.MAX_VALUE,
	    maxEmailCount: 0,
			query: `query getData($filters:[Rule]){
								Select(filters:$filters){
									Summaries {
										FromAddress(limit: 10000) {
											Key
											Count
											Summaries {
												ToAddresses (limit: 10000) {
													Key
													Count
												}
											}
										}
										ToAddresses(limit: 10000) {
												Key
												Count
												Summaries {
												FromAddress (limit: 10000) {
													Key
													Count
												}
											}
										}
									}
								}
							}`

		};
	}

	componentWillMount() {
		this.loadData(this.props.state);
	}

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.state);
	}

	translateStateToFilter(state) {
		var jsonQuery = {
			filters: [],
			contacts: [],
			toList: [],
			fromList: []
		}
		let clist = [];
		state.filters.forEach(function(element) {
			if (typeof element.values != 'undefined') {
				var jsonData ={};

				let contact = {
					'Any': true,
					'ToAddresses': true,
					'FromAddress': true
				}

				if (contact[element.selection] && typeof element.values !== 'undefined'){
					clist = [...clist.slice(0), ...element.values.slice(0)]
				}
				switch (element.selection) {
					case 'Any':
            jsonQuery.fromList = [...jsonQuery.fromList.slice(0), ...element.values.slice(0)]
            jsonQuery.toList = [...jsonQuery.toList.slice(0), ...element.values.slice(0)]
						break;
					case 'ToAddresses':
						jsonQuery.toList = [...jsonQuery.toList.slice(0), ...element.values.slice(0)]
						break;
					case 'FromAddress':
						jsonQuery.fromList = [...jsonQuery.fromList.slice(0), ...element.values.slice(0)]
						break;
					default:
						break;
				}

				switch (element.selection) {
					case 'ToLength':
						jsonData['field'] = element.selection;
						jsonData['operation'] = 'between';
						jsonData['value'] = ['1', isNaN(parseInt(element.values[0])) ? '10' : parseInt(element.values[0]).toString()];
						break;
						case 'StartDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
							jsonData['value'] = [isValidDate(element.values[0]) ? element.values[0] : '0000-1-1'];
							break;
						case 'EndDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
							jsonData['value'] = ['0000-1-1', isValidDate(element.values[0]) ? element.values[0] : today()];
							break;
				    default:
							jsonData['field'] = element.selection;
							jsonData['operation'] = 'contains';
							jsonData['value'] = element.values;
				}
				jsonQuery.filters.push(jsonData);
			}
		});
		let uniqueContacts = {};
		clist = clist.filter(function(item) {
        return uniqueContacts.hasOwnProperty(item) ? false : (uniqueContacts[item] = true);
    });
		jsonQuery.contacts = clist;
		return jsonQuery;
	}

	loadData(newState) {
		var jsonQuery = this.translateStateToFilter(newState);
//		if (newState.filters.length > 0) {															//loadData sends the query to the suQl server and retrieves the data
				/*{
				  Select(filters:[
				    {field:Contents, operation: in, value:'california'},
				    {field:To, operation: in,
				      value:['sue.nord@enron.com', 'susan.mara@enron.com']}]) {
				    Documents {
				      From
				    }
				  }
				}*/
				/*{'filters':  [{'field':'ToAddress', 'operation': 'in',
				      'value':['sue.nord@enron.com', 'susan.mara@enron.com']}]}*/
			let queries = [];
			let minLinkCount = Number.MAX_VALUE;
	    let maxLinkCount = 0;
			let minNodeCount = Number.MAX_VALUE;
	    let maxNodeCount = 0;
			let minEmailCount = Number.MAX_VALUE;
	    let maxEmailCount = 0;
			queries.push(dataSource.query(
				this.state.query, jsonQuery
			).then(r => {
				let contactList = [];
        let queryNodes = [];
				if (typeof r.data !== 'undefined'){
					contactList = r.data.Select.Summaries;
				}
				jsonQuery.toList.map((c) => {
          let queryData = contactList.ToAddresses.find(function(e){
						return (c === e.Key);
					});
          if (typeof queryData !== 'undefined'){
  					queryNodes.push({
							id: queryData.Key,
							size: queryData.Count,
							fromList: queryData.Summaries.FromAddress,
							toList: [],
							toLinks: [],
							fromLinks: [],
							queryNode: true,
							mouseOver: false,
							nodeClass: 'normal',
							toNode: true,
							fromNode: false
						});
          }
				});
				jsonQuery.fromList.map((c) => {
          let queryData = contactList.FromAddress.find(function(e){
						return (c === e.Key);
					});
          if (typeof queryData !== 'undefined'){
						let thisNode = queryNodes.find(function(n){
							return (queryData.Key === n.id);
						});
						if (typeof thisNode === 'undefined') {
	  					queryNodes.push({
								id: queryData.Key,
								size: queryData.Count,
								fromList: [],
								toList: queryData.Summaries.ToAddresses,
								toLinks: [],
								fromLinks: [],
								queryNode: true,
								mouseOver: false,
								nodeClass: 'normal',
								toNode: false,
								fromNode: true
							});
						} else {
							thisNode.toList = queryData.Summaries.ToAddresses;
							thisNode.fromNode = true;
						}
          }
				});
				contactList.ToAddresses.map((contact) => {
					contact.nodeClass='normal';
					contact.Summaries.ToAddresses = [];
					contact.receivedFrom = [];
					contact.sendsTo = [];
					contact.toCount = contact.Count;
					contact.fromCount = 0;
					contact.toLinkCount = 0;
					contact.fromLinkCount = 0;
					queryNodes.map((qn) => {
						let linkNode = contact.Summaries.FromAddress.find(function(tn){return tn.Key === qn.id});
						if (typeof linkNode !== 'undefined') {
							contact.receivedFrom.push({target: qn, size: linkNode.Count});
							contact.fromLinkCount += linkNode.Count;
							minLinkCount = Math.min(linkNode.Count, minLinkCount);
              maxLinkCount = Math.max(linkNode.Count, maxLinkCount);
						}
					})
				});
				contactList.FromAddress.map((contact) => {
					contact.nodeClass='normal';
					contact.Summaries.FromAddress = [];
					contact.sendsTo = [];
					contact.receivedFrom = [];
					contact.fromCount = contact.Count;
					contact.toCount = 0;
					contact.toLinkCount = 0;
					contact.fromLinkCount = 0;
					queryNodes.map((qn) => {
						let linkNode = contact.Summaries.ToAddresses.find(function(fn){return fn.Key === qn.id});
						if (typeof linkNode !== 'undefined') {
							contact.sendsTo.push({target: qn, size: linkNode.Count});
							contact.toLinkCount += linkNode.Count;
							minLinkCount = Math.min(linkNode.Count, minLinkCount);
              maxLinkCount = Math.max(linkNode.Count, maxLinkCount);
						}
					})
				});
				let contacts = [];
				if (jsonQuery.toList.length  < 1 && jsonQuery.fromList.length < 1) {
					contacts = contactList.ToAddresses;
					contactList.FromAddress.map((contact) => {
						let exists = contacts.find(function(c){
							return (c.Key === contact.Key);
						});
						if (typeof exists === 'undefined'){
							contacts.push(contact);
						} else {
							exists.Summaries.ToAddresses = contact.Summaries.ToAddresses;
							exists.sendsTo = contact.sendsTo;
							exists.Count = contact.Count + exists.Count;
							exists.fromCount = contact.fromCount;
							exists.toLinkCount = contact.toLinkCount;
						}
					});
				} else {
					if (jsonQuery.fromList.length  > 0) {
						contacts = contactList.ToAddresses;
					}
					if (jsonQuery.toList.length > 0) {
						contactList.FromAddress.map((contact) => {
							let exists = contacts.find(function(c){
								return (c.Key === contact.Key);
							});
							if (typeof exists === 'undefined'){
								contacts.push(contact);
							} else {
								exists.Summaries.ToAddresses = contact.Summaries.ToAddresses;
								exists.sendsTo = contact.sendsTo;
								exists.Count = contact.Count + exists.Count;
								exists.fromCount = contact.fromCount;
								exists.toLinkCount = contact.toLinkCount;
							}
						});
					}
				}
//				console.log(contactList);
				contacts.map((contact) => {
					maxEmailCount = Math.max(contact.Count, maxEmailCount);
					minEmailCount = Math.min(contact.Count, minEmailCount);
					if (contact.toCount > 0){
						maxNodeCount = Math.max(contact.toCount, maxNodeCount);
						minNodeCount = Math.min(contact.toCount, minNodeCount);
					}
					if (contact.fromCount > 0){
			      maxNodeCount = Math.max(contact.fromCount, maxNodeCount);
						minNodeCount = Math.min(contact.fromCount, minNodeCount);
					}
				});
				if (queryNodes.length < 1){
					contacts.sort(function(a,b){
						return ((b.Count) - (a.Count));
					})
				} else {
					contacts.sort(function(a,b){
						return ((b.fromLinkCount + b.toLinkCount) - (a.fromLinkCount + a.toLinkCount));
					})
				}
				return {qn:queryNodes,
								cl:contacts,
								minLC: minLinkCount,
								maxLC: maxLinkCount,
								minNC: minNodeCount,
								maxNC: maxNodeCount,
								minEC: minEmailCount,
								maxEC: maxEmailCount
							};
				})
			);

      Promise.all(queries).then(rr => {
				rr.map((d) => {
          this.setState({
            contacts: d.cl,
            nodes: d.qn,
						minLinkCount: d.minLC,
						maxLinkCount: d.maxLC,
						minNodeCount: d.minNC,
						maxNodeCount: d.maxNC,
						minEmailCount: d.minEC,
						maxEmailCount: d.maxEC
          });
				});
			}).catch((err) => console.log('In BiGraphContainer: ', err.message));
			// Do the queiry to get the inter contact counts.
		// } else {
		// 	this.setState({
		// 		contacts: [],
		// 		nodes: [],
		// 	});
		// }
	}

	render() {
//		const {actions} = this.props;
//		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
		let {actions} = this.props;
		return <ContactBiGraph
			nodes={this.state.nodes}
			contacts={this.state.contacts}
			minLinkCount= {this.state.minLinkCount}
			maxLinkCount= {this.state.maxLinkCount}
			minNodeCount= {this.state.minNodeCount}
			maxNodeCount= {this.state.maxNodeCount}
			minEmailCount= {this.state.minEmailCount}
			maxEmailCount= {this.state.maxEmailCount}
			{...actions}
			/>;

	}
}

BiGraphContainer.propTypes = {
	actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {addListItem};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(BiGraphContainer);
