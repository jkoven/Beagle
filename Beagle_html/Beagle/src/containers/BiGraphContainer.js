import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import ContactGraph from '../components/ContactGraph';
import ContactBiGraph from '../components/ContactBiGraph';
import dataSource from '../sources/dataSource';

class BiGraphContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: [],
			nodes:[]
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
		var jsonQuery = this.translateStateToFilter(newState);
		if (newState.filters.length > 0) {															//loadData sends the query to the suQl server and retrieves the data
			let query = `query getData($filters:[Rule]){
					Select(filters:$filters){
						Summaries {
							Any (limit:100) {
								Key
								Count
								Counts{
	          			From
	        			}
								Summaries {
									ToAddresses {
										Key
										Count
									}
									FromAddress {
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
        let queryNodes = [];
				if (typeof r.data !== 'undefined'){
					contactList = r.data.Select.Summaries;
				}
				jsonQuery.contacts.map((c) => {
          let queryData = contactList.Any.find(function(e){
						return (c === e.Key);
					});
          if (typeof queryData !== 'undefined'){
  					queryNodes.push({
							id: queryData.Key,
							size: queryData.Count,
							fromList: queryData.Summaries.FromAddress,
							toList: queryData.Summaries.ToAddresses,
							toLinks: [],
							fromLinks: [],
							queryNode: true,
							mouseOver: false,
							nodeClass: 'normal',
							nodeType: 'to'
						});
          }
				});
// We now have to fill out the to and from nodes with non query nodes.
        let nodeList = [];
        let nodesInList = {};

        queryNodes.map((qnode) => {
          nodesInList[qnode.id] = true;
        });

        queryNodes.map((qnode) => {
          qnode.toList.map((tn) => {
            if (!nodesInList.hasOwnProperty(tn.Key)){
              nodeList.push(tn);
              nodesInList[tn.Key] = true;
            }
          });
          qnode.fromList.map((fn) => {
            if (!nodesInList.hasOwnProperty(fn.Key)){
              nodeList.push(fn);
              nodesInList[fn.Key] = true;
            }
					});
				});
        // Sort from biggest to smallest
        nodeList.sort(function(a,b){
          return(b.Count - a.Count);
        });
        if (nodeList.length > 12 - queryNodes.length){
          nodeList = nodeList.slice(0, 12 - queryNodes.length)
        }
        nodeList.map((nData) => {
          queryNodes.push({
						id: nData.Key,
						size: nData.Count,
						toLinks: [],
						fromLinks: [],
						queryNode: false,
						mouseOver: false,
						nodeClass: 'normal',
						nodeType: 'to'});
        });
				return {qn:queryNodes, cl:contactList};
				})
			);
      Promise.all(queries).then(rr => {
				rr.map((d) => {
          this.setState({
            contacts: d.cl,
            nodes: d.qn
          });
				});
			}).catch((err) => console.log('In BiGraphContainer: ', err.message));
			// Do the queiry to get the inter contact counts.
		} else {
			this.setState({
				contacts: [],
				nodes: []
			});
		}
	}

	render() {
//		const {actions} = this.props;
//		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
		return <ContactBiGraph
			nodes={this.state.nodes}
			contacts={this.state.contacts}
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
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(BiGraphContainer);
