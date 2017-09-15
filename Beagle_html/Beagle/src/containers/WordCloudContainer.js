import React, {
	Component,
	PropTypes
} from 'react';
import {	bindActionCreators} from 'redux';
import {	connect} from 'react-redux';
import WordCloud from '../components/WordCloud';
import dataSource from '../sources/dataSource';
import {addListItem} from '../actions/const';

require('styles//wordcloud-component-words.scss');

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

class WordCloudContainer extends Component {
	constructor() {
		super();
		this.state = {
			words: [],
			field: ''
		}
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

	      //var selection = this.translateSelection(element.selection);

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
    return jsonQuery;
  }

	loadData(newState) {							//loadData sends the query to the suQl server and retrieves the data
		let {field} = this.props;
		this.state.field = field;
		/*
		let query = `query getData($filters:[Rule]){
			Select(filters:$filters) {
				Summaries{
					Contents (limit:1000) {
						Key
						Count
					}
					Subject (limit:1000) {
						Key
						Count
					}
				}
			}
		}`
		*/

		let query = `query getData($filters:[Rule]){
			Select(filters:$filters) {
				Summaries{
					PERSON (limit:1000) {
						Key
						Count
					}
					ORGANIZATION (limit:1000) {
						Key
						Count
					}
					Subject (limit:1000) {
						Key
						Count
					}
					Contents (limit:1000) {
						Key
						Count
					}
				}
			}
		}`


		dataSource.query(
			query, this.translateStateToFilter(newState)
		).then(
			r => {
				if (typeof r.data !== 'undefined'){
					this.setState({words: r.data.Select.Summaries})
				}
			}).catch((err) => console.log('In ContactListContainer: ', err.message));

	}


	render() {
		const {actions} = this.props;

		return <WordCloud {...actions} words = {this.state.words}/>;
	}
}

WordCloudContainer.propTypes = {
	actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {addListItem};
	const actionMap = {
		actions: bindActionCreators(actions, dispatch)
	};
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(WordCloudContainer);
