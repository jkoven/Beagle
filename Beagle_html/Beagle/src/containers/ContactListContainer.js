import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContactList from '../components/ContactList';
import dataSource from '../sources/dataSource';
import { addContactListItem} from '../actions/const';


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
			filters: []
		}
		state.filters.forEach(function(element) {
			if (typeof element.values !== 'undefined'){
				var jsonData ={};
				var selection;
				if (element.selection == 'SUBJECT CONTAINS:') {
					selection = 'Subject';
				} else if (element.selection == 'CONTENT CONTAINS:') {
					selection = 'Contents';
				} else if (element.selection == 'PERSON:') {
					selection = 'PERSON';
				} else if (element.selection == 'ORGANIZATION:') {
					selection = 'ORGANIZATION';
				} else {
					selection = 'ToAddresses';
				}

				jsonData['field'] = selection;
				jsonData['operation'] = 'contains';
				jsonData['value'] = element.values;
				jsonQuery.filters.push(jsonData);
			}
		});
		return jsonQuery;
	}

	loadData(newState) {
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
		dataSource.query(
			query, this.translateStateToFilter(newState)
		).then(r => {
			if (typeof r.data !== 'undefined'){
				this.setState({contacts: r.data.Select.Summaries.ToAddresses})
			}
		}).catch((err) => console.log('In ContactListContainer: ', err.message))
	}


	render() {
//		const {actions} = this.props;
		let {actions} = this.props;
		return <ContactList contacts={this.state.contacts} {...actions}/>;
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
	const actions = {addContactListItem};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactListContainer);
