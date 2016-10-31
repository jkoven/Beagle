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
			fromNodes:[],
      toNodes: []
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
        let fromNodes = [];
        let toNodes = [];
				if (typeof r.data !== 'undefined'){
					contactList = r.data.Select.Summaries;
				}
				jsonQuery.contacts.map((c) => {
          let toData = contactList.ToAddresses.find(function(e){
						return (c === e.Key);
					});
          let fromData = contactList.FromAddress.find(function(e){
						return (c === e.Key);
					});
          if (typeof toData !== 'undefined'){
  					if (typeof jsonQuery.toList.find(function(con) {return (con === toData.Key)}) !== 'undefined'){
  						toNodes.push({id: toData.Key, size: toData.Count, fromList: toData.Summaries.FromAddress, queryNode: true, mouseOver: false, nodeClass: 'normal', nodeType: 'to'});
  					}
          }
          if (typeof fromData !== 'undefined'){
  					if (typeof jsonQuery.fromList.find(function(con) {return (con === fromData.Key)}) !== 'undefined'){
  						fromNodes.push({id: fromData.Key, size: fromData.Count, toList: fromData.Summaries.ToAddresses, queryNode: true, mouseOver: false, nodeClass: 'normal', nodeType: 'from'});
  					}
          }
				});
// We now have to fill out the to and from nodes with non query nodes.
        let toNodeList = [];
        let toNodesInList = {};
        let fromNodeList = [];
        let fromNodesInList = {};

        fromNodes.map((fnode) => {
          fromNodesInList[fnode.id] = true;
        });
        toNodes.map((tnode) => {
          toNodesInList[tnode.id] = true;
        });

        fromNodes.map((fnode) => {
          fnode.toList.map((tn) => {
            if (!toNodesInList.hasOwnProperty(tn.Key)){
              toNodeList.push(tn);
              toNodesInList[tn.Key] = true;
            }
          });
        });
        toNodes.map((tnode) => {
          tnode.fromList.map((fn) => {
            if (!fromNodesInList.hasOwnProperty(fn.Key)){
              fromNodeList.push(fn);
              fromNodesInList[fn.Key] = true;
            }
          });
        });
        // Sort from biggest to smallest
        toNodeList.sort(function(a,b){
          return(b.Count - a.Count);
        });
        if (toNodeList.length > 20 - toNodes.length){
          toNodeList = toNodeList.slice(0, 20 - toNodes.length)
        }
        fromNodeList.sort(function(a, b){
          return(b.Count - a.Count);
        });
        if (fromNodeList.length > 20 - fromNodes.length){
          fromNodeList = fromNodeList.slice(0, 20 - fromNodes.length)
        }

        toNodeList.map((toData) => {
          toNodes.push({id: toData.Key, size: toData.Count, queryNode: false, mouseOver: false, nodeClass: 'normal', nodeType: 'to'});
        });
        fromNodeList.map((fromData) => {
          fromNodes.push({id: fromData.Key, size: fromData.Count, queryNode: false, mouseOver: false, nodeClass: 'normal', nodeType: 'from'});
        });
  			return {tn:toNodes, fn:fromNodes, cl:contactList};
				})
			);
      Promise.all(queries).then(rr => {
				rr.map((d) => {
          this.setState({
            contacts: d.cl,
            fromNodes: d.fn,
            toNodes: d.tn
          });
				});
			}).catch((err) => console.log('In BiGraphContainer: ', err.message));
			// Do the queiry to get the inter contact counts.
		} else {
			this.setState({
				contacts: [],
				fromNodes: [],
        toNodes: []
			});
		}
	}

	render() {
//		const {actions} = this.props;
//		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
		return <ContactBiGraph
			toNodes={this.state.toNodes} l
			fromNodes={this.state.fromNodes}
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
