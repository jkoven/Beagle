import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContactList from '../components/ContactList';
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

class ContactListContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: []
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
			queryContacts: {}
		}
		let clist = {};
		state.filters.forEach(function(element) {
			if (typeof element.values != 'undefined') {
				var jsonData ={};

				let contact = {
					'Any': true,
					'ToAddresses': true,
					'FromAddress': true
				}

				if (contact[element.selection] && typeof element.values !== 'undefined'){
					element.values.map((e) => {
						clist[e] = true;
					});
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
				jsonQuery['queryContacts'] = clist;

			}
		});
		return jsonQuery;
	}

	loadData(newState) {
		let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Summaries {
						Any {
							Key
							Count
							Counts{
          			FromAddress
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
		let qdata = this.translateStateToFilter(newState);
		dataSource.query(
			query, qdata
		).then(r => {
			if (typeof r.data !== 'undefined'){
				this.setState({
					contacts: r.data.Select.Summaries.Any.filter(function(c){
						return (!qdata.queryContacts.hasOwnProperty(c.Key));
					})
				})
			}
		}).catch((err) => console.log('In ContactListContainer: ', err.message))
	}


	render() {
//		const {actions} = this.props;
		let {actions} = this.props;
		return <ContactList parent={this} contacts={this.state.contacts} {...actions}/>;
	}
}

ContactListContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ContactListContainer);
