import React, {
  Component,
  PropTypes
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import FilterItem from '../components/FilterItem';
import FilterPanel from '../components/FilterPanel';
import dataSource from '../sources/dataSource';
import { addFilter , addData , changeFilter, removeFilter, removeFilterLine} from '../actions/const';

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

class FilterContainer extends Component {
  constructor() {
		super();
		this.state = {
			emails: []
		};
	}

  componentWillMount() {
    this.loadData(this.props.filters);
  }

  componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.filters);
	}


translateStateToFilter(state,index) {
    var jsonQuery = {
      filters: []
    };
    for (var i = index; i >= 0; i--) {
      if (typeof state[i].values !== 'undefined'){
        var jsonData ={};

        switch (state[i].selection) {
					case 'ToLength':
						jsonData['field'] = state[i].selection;
						jsonData['operation'] = 'between';
						jsonData['value'] = ['1', isNaN(parseInt(state[i].values[0])) ? '10' : parseInt(state[i].values[0]).toString()];
						break;
						case 'StartDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
							jsonData['value'] = [isValidDate(state[i].values[0]) ? state[i].values[0] : '0000-1-1'];
							break;
            case 'EndDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
              jsonData['value'] = ['0000-1-1', isValidDate(state[i].values[0]) ? state[i].values[0] : today()];
							break;
					default:
						jsonData['field'] = state[i].selection;
						jsonData['operation'] = 'contains';
						jsonData['value'] = state[i].values;
				}
        jsonQuery.filters.push(jsonData);
      }
    }
    return jsonQuery;
  }

  loadData(newState) {                              	//loadData sends the query to the suQl server and retrieves the data
    let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
          Count
				}
		}`
    // let query = `query getData($filters:[Rule]){
		// 		Select(filters:$filters){
    //       Count
		// 			Documents {
    //         Subject
    //         Timestamp
    //         From
    //         To
    //         Contents
		// 			}
		// 		}
		// }`

    this.state.emails = [];
    newState.forEach(function(element,index) {
      dataSource.query(
          query, this.translateStateToFilter(newState,index)
      ).then(r => {
        var d = {};
        if(typeof r.data !== 'undefined'){
          d[index] = r.data.Select.Count;
          this.setState({emails: this.state.emails.concat(d)});
        }
      }).catch((err) => console.log('In ContactListContainer: ', err.message))
    },this)
  }



  render() {
    let {actions,filters} = this.props;
    return (<FilterPanel  numEmails={this.state.emails} {...actions} filters={filters}/>)
  }
}

FilterContainer.propTypes = {
  actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const props = {filters: state.filters};
  return props;
}

function mapDispatchToProps(dispatch) {
  const actions = {addFilter,addData,changeFilter, removeFilter, removeFilterLine};
  const actionMap = {actions: bindActionCreators(actions, dispatch) };
  return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterContainer);
