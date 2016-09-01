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
			var jsonData ={};
			var selection;

			if (element.selection == 'SUBJECT CONTAINS:') {
				selection = 'Subject';
			} else if (element.selection == 'MENTION:') {
				selection = 'Contents';
			} else {
				selection = 'ToAddresses';
			}

			jsonData['field'] = selection;
			jsonData['operation'] = 'contains';
			jsonData['value'] = element.values;
			jsonQuery.filters.push(jsonData);
		});
		return jsonQuery;
	}

	loadData(newState) {															//loadData sends the query to the suQl server and retrieves the data
		let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Summaries {
						To {
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
				this.setState({contacts: r.data.Select.Summaries.To})
			}
		}).catch((err) => console.log('In ContactListContainer: ', err.message))
	}


	render() {
//		const {actions} = this.props;
		return <ContactList contacts={this.state.contacts}/>;
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
