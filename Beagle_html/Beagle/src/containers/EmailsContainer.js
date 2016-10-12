import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Emails from '../components/Emails';
import dataSource from '../sources/dataSource';

class EmailsContainer extends Component {
  constructor() {
    super();
    this.state = {
      emails: []
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

  translateStateToFilter(state) {
    var jsonQuery = {
      filters: []
    }
    state.filters.forEach(function(element) {
      if (typeof element.values !== 'undefined'){
        var jsonData ={};

        jsonData['field'] = element.selection;
        jsonData['operation'] = 'contains';
        jsonData['value'] = element.values;
        jsonQuery.filters.push(jsonData);
      }
    });
    return jsonQuery;
  }

  loadData(newState) {            	//loadData sends the query to the suQl server and retrieves the data
    let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Documents {
            Subject
            Timestamp
            From
            To
            Contents
					}
				}
		}`

    dataSource.query(
        query, this.translateStateToFilter(newState)
    ).then(r => {
      if (typeof r.data !== 'undefined'){
        this.setState({emails: r.data.Select.Documents})
      }
    }).catch((err) => console.log('In ContactListContainer: ', err.message))
  }

  render() {
    const {actions} = this.props;
    return <Emails actions={actions} emails={this.state.emails} />;
  }
}

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailsContainer);
