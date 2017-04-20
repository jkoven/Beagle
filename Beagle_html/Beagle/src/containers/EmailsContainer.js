import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Emails from '../components/Emails';
import dataSource from '../sources/dataSource';

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

  loadData(newState) {            	//loadData sends the query to the suQl server and retrieves the data
    let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Documents(limit:1000) {
            Subject
            Timestamp
            From:FromAddress
            To:ToAddresses
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
		this.state.emails.sort(function(a,b){
			if (parseInt(a.Timestamp) < parseInt(b.Timestamp)) {
		    return -1;
		  }
		  if (parseInt(a.Timestamp) > parseInt(b.Timestamp)) {
		    return 1;
		  }
		  // a must be equal to b
		  return 0;
		})
    const {actions} = this.props;
    return <Emails actions={actions} emails={this.state.emails} position={this.props.position + 15}/>;
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
