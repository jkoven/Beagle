import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContactGraph from '../components/ContactGraph';
import dataSource from '../sources/dataSource';

class GraphContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: [],
			contactNodes:[],
			contactLinks:[]
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
			contacts: []
		}
		let clist = [];
		state.filters.forEach(function(element) {
			if (typeof element.values != 'undefined') {
				var jsonData ={};
				var selection;

				if (element.selection == 'SUBJECT CONTAINS:') {
					selection = 'Subject';
				} else if (element.selection == 'MENTION:') {
					selection = 'Contents';
				} else {
					selection = 'ToAddresses';
					if (typeof element.values !== 'undefined'){
						clist = [...clist.slice(0), ...element.values.slice(0)]
					}
				}

				jsonData['field'] = selection;
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
							ToAddresses {
								Key
								Count
								Counts{
	          			From
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
				if (typeof r.data !== 'undefined'){
//					console.log(r.data);
					contactList = r.data.Select.Summaries.ToAddresses;
				}
				jsonQuery.contacts.map((c) => {
					let contactData = contactList.find(function(e){
						return c === e.Key;
					});
					if (typeof contactData !== 'undefined'){
						contactNodes.push({id: contactData.Key, size: contactData.Count});
					}
				});
				return {cn:contactNodes, cl:contactList};
			}));
			Promise.all(queries).then(rr => {
				rr.map((d) => {
					let self = this;
					loadMoreData(jsonQuery, d.cl, d.cn, self)
				});
			}).catch((err) => console.log('In GraphContainer: ', err.message));
			// Do the queiry to get the inter contact counts.
		} else {
			this.setState({
				contacts: [],
				contactNodes: [],
				contactLinks: []
			});
		}
	}

	loadMoreData(jsonQuery, contactList, contactNodes, self){
		let contactLinks = [];
		let queries = [];
		let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Count
				}
			}`
			jsonQuery.contacts.map ((c, i, arr) => {
				for(var idx = i + 1; idx < arr.length; idx++){
					let contact2 = arr[idx];
					let filters = [{
						'field': 'ToAddresses',
						'operation': 'contains',
						'value': c
					},{
						'field': 'ToAddresses',
						'operation': 'contains',
						'value': contact2
					}];
					let newFilters = {
						filters : filters
					};
					queries.push (dataSource.query(
						query, newFilters
					).then((result) => {
						return {c1: c, c2: contact2, result: result}
					}));
				}
			});
			Promise.all(queries).then(r => {
				r.map((d) => {
					contactLinks.push({source: d.c1, target: d.c2, value:d.result.data.Select.Count});
				});
				return contactLinks;
			}).then((dd) => {
				self.setState({
					contacts: contactList,
					contactNodes: contactNodes,
					contactLinks: dd
				});
			}).catch((err) => console.log('In GraphContainer: ', err.message))

	}



	render() {
//		const {actions} = this.props;
		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
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
