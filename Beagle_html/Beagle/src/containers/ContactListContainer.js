import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContactList from '../components/ContactList';
import dataSource from '../sources/dataSource';

class ContactListContainer extends Component {
	constructor() {
		super();
		this.state = {
			contacts: []
		};
	}
	shouldLoadData() {

	}

	componentWillMount() {
		this.loadData(this.props.state);
	}

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.state);
	}

	translateSelection(select) {
		console.log(select);
		if (select == 'SUBJECT CONTAINS: ') {
			return 'Subject';
		} else if (select == 'MENTION: ') {
			return 'Contents';
		} else {
			return 'ToAddresses';
		}
	}


	translateStateToFilter(state) {
		console.log(state);
		console.log(state.filters);
		var jsonQuery = {
			filters: []
		}
		state.filters.forEach(function(element,index,array) {
			var jsonData ={};
			var selection;
			console.log(element.selection);

			//var selection = this.translateSelection(element.selection);
			if (element.selection == 'SUBJECT CONTAINS:') {
				selection = 'Subject';
			} else if (element.selection == 'MENTION:') {
				selection = 'Contents';
			} else {
				selection = 'ToAddresses';
			}

			jsonData['field'] = selection;
			jsonData['operation'] = 'in';
			jsonData['value'] = element.values;
			jsonQuery.filters.push(jsonData);
		});
		console.log(jsonQuery);
		return jsonQuery;
	}

	loadData(newState) {
		let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Summaries {
						To {
							Key
							Count
						}
					}
				}
			}`
			/*{
			  Select(filters:[
			    {field:Contents, operation: in, value:"california"},
			    {field:To, operation: in,
			      value:["sue.nord@enron.com", "susan.mara@enron.com"]}]) {
			    Documents {
			      From
			    }
			  }
			}*/
			/*{'filters':  [{'field':'ToAddress', 'operation': 'in',
			      'value':['sue.nord@enron.com', 'susan.mara@enron.com']}]}*/
		dataSource.query(
			query, this.translateStateToFilter(newState)
		).then(r => this.setState({contacts: r.data.Select.Summaries.To})).catch(console.error)
	}


	/*filterList(event) {
		console.log("FitlerList");
		this.state.contacts = this.state.contacts.filter(s => s.indexOf ? s.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1 : true )
	}*/

	render() {
		const {actions} = this.props;
		return <ContactList contacts={this.state.contacts} />;
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
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactListContainer);
