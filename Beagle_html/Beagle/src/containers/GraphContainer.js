import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import ContactGraph from '../components/ContactGraph';
import ContactTree from '../components/ContactTree';
import dataSource from '../sources/dataSource';

class GraphContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: [],
			contactNodes:[],
			contactLinks:[],
			contactRootNodes:[]
		};
	}

	componentWillMount() {
	}

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.state);
	}

	translateStateToFilter(state) {
		var jsonQuery = {
			filters: [],
			contacts: [],
			anyList: [],
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
						jsonQuery.anyList = [...jsonQuery.anyList.slice(0), ...element.values.slice(0)]
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


				jsonData['field'] = element.selection;
				jsonData['operation'] = 'contains';
				jsonData['value'] = element.values;
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
		let loadMoreData = this.loadMoreData;
		var jsonQuery = this.translateStateToFilter(newState);
		if (newState.filters.length > 0) {															//loadData sends the query to the suQl server and retrieves the data
			let query = `query getData($filters:[Rule]){
					Select(filters:$filters){
						Summaries {
							FromAddress (limit:100) {
								Key
								Count
								Counts {
	          			From
	        			}
								Summaries {
								ToAddresses {
										Key
										Count
									}
								}
							}
							ToAddresses (limit:100) {
								Key
								Count
								Counts{
	          			From
	        			}
								Summaries {
								FromAddress {
										Key
										Count
									}
								}
							}
							Any (limit:100) {
								Key
								Count
								Counts{
	          			From
	        			}
								Summaries {
									Any {
										Key
										Count
									}
								}
							}
						}
					}
				}`
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
			queries.push(dataSource.query(
				query, jsonQuery
			).then(r => {
				let contactList = [];
				let contactNodes = [];
				let contactRootNodes = [];
				if (typeof r.data !== 'undefined'){
					contactList = r.data.Select.Summaries;
				}
				jsonQuery.contacts.map((c) => {
					let contactData = contactList.Any.find(function(e){
						return (c === e.Key);
					});
//					console.log('testing', c);
					if (typeof contactData !== 'undefined'){
						contactNodes.push({id: contactData.Key, size: contactData.Count, queryNode: true, mouseOver: false, nodeClass: 'normal'});
						if (typeof jsonQuery.anyList.find(function(con) {return (con === contactData.Key)}) !== 'undefined'){
//							console.log('any', contactData.Key);
							contactRootNodes.push({id: contactData.Key, size: contactData.Count, queryNode: true, mouseOver: false, nodeClass: 'normal', nodeType: 'any'});
						}
						if (typeof jsonQuery.toList.find(function(con) {return (con === contactData.Key)}) !== 'undefined'){
//							console.log('to', contactData.Key);
							contactRootNodes.push({id: contactData.Key, size: contactData.Count, queryNode: true, mouseOver: false, nodeClass: 'normal', nodeType: 'to'});
						}
						if (typeof jsonQuery.fromList.find(function(con) {return (con === contactData.Key)}) !== 'undefined'){
//							console.log('from', contactData.Key);
							contactRootNodes.push({id: contactData.Key, size: contactData.Count, queryNode: true, mouseOver: false, nodeClass: 'normal', nodeType: 'from'});
						}
					}
				});
				if (contactNodes.length < contactList.Any.length + 10){
					contactList.Any.map ((contact) => {
						let foundNode = contactNodes.find(function (e){
							return e.id === contact.Key;
						});
						if (typeof foundNode === 'undefined') {
							contactNodes.push ({id:contact.Key, size: contact.Count, queryNode: false, mouseOver: false, nodeClass: 'normal'});
						}
					});
				}
				return {cn:contactNodes, cl:contactList, cr:contactRootNodes};
			}));
			Promise.all(queries).then(rr => {
				rr.map((d) => {
					let self = this;
					loadMoreData(jsonQuery, d.cl, d.cn, d.cr, self)
				});
			}).catch((err) => console.log('In GraphContainer: ', err.message));
			// Do the queiry to get the inter contact counts.
		} else {
			this.setState({
				contacts: [],
				contactNodes: [],
				contactLinks: [],
				contactRootNodes: []
			});
		}
	}

	loadMoreData(jsonQuery, contactList, contactNodes, contactRootNodes, self){
		let contactLinks = [];
		contactNodes.map((sourceContact, idx) => {
			let contactData;
			switch (sourceContact.nodeType) {
				case 'any':
				  contactData = contactList.Any.find(function(e){
						return e.Key === sourceContact.id;
					});
					break;
				case 'to':
				  contactData = contactList.toAddresses.find(function(e){
						return e.Key === sourceContact.id;
					});
					break;
				case 'from':
				  contactData = contactList.FromAddress.find(function(e){
						return e.Key === sourceContact.id;
					});
					break;
				default:
					break;
			}
			for (let idx1 = idx + 1; idx1 < contactNodes.length; idx1++){
				let targetContact;
				switch (sourceContact.nodeType) {
					case 'any':
						targetContact = contactData.Summaries.Any.find((e) => {
							return e.Key === contactNodes[idx1].id;
						});
						break;
					case 'to':
						targetContact = contactData.Summaries.FromAddress.find((e) => {
							return e.Key === contactNodes[idx1].id;
						});
						break;
					case 'from':
						targetContact = contactData.Summaries.ToAddresses.find((e) => {
							return e.Key === contactNodes[idx1].id;
						});
						break;
					default:
						break;
				}
				if (typeof targetContact !== 'undefined') {
					contactLinks.push({source: sourceContact.id, target: targetContact.Key, value:targetContact.Count, lineClass: 'normal'})
				}
			}
		});
		self.setState({
			contacts: contactList,
			contactNodes: contactNodes,
			contactLinks: contactLinks,
			contactRootNodes: contactRootNodes
		});

		// let queries = [];
		// let query = `query getData($filters:[Rule]){
		// 		Select(filters:$filters){
		// 			Count
		// 		}
		// 	}`
		// 	contactNodes.map ((c, i, arr) => {
		// 		for(var idx = i + 1; idx < arr.length; idx++){
		// 			let contact2 = arr[idx].id;
		// 			let filters = [{
		// 				'field': 'ToAddresses',
		// 				'operation': 'contains',
		// 				'value': c.id
		// 			},{
		// 				'field': 'ToAddresses',
		// 				'operation': 'contains',
		// 				'value': contact2
		// 			}];
		// 			let newFilters = {
		// 				filters : filters
		// 			};
		// 			queries.push (dataSource.query(
		// 				query, newFilters
		// 			).then((result) => {
		// 				if (typeof result !== undefined){
		// 					return {c1: c.id, c2: contact2, result: result}
		// 				} else return {}
		// 			}));
		// 		}
		// 	});
		// 	Promise.all(queries).then(r => {
		// 		if (typeof r !== 'undefined'){
		// 			r.map((d) => {
		// 				if (d.c1 !== 'undefined' && d.c2 !== 'undefined') {
		// 					contactLinks.push({source: d.c1, target: d.c2, value:d.result.data.Select.Count, lineClass: 'normal'});
		// 				}
		// 			});
		// 		}
		// 		return contactLinks;
		// 	}).then((dd) => {
		// 		self.setState({
		// 			contacts: contactList,
		// 			contactNodes: contactNodes,
		// 			contactLinks: dd
		// 		});
		// 	}).catch((err) => console.log('In GraphContainer: ', err.message))
	}



	render() {
//		const {actions} = this.props;
//		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
		return <ContactTree
			contactNodes={this.state.contactNodes}
			inks={this.state.contactLinks}
			roots={this.state.contactRootNodes}
			contacts={this.state.contacts}
			/>;

	}
}

GraphContainer.propTypes = {
	actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
