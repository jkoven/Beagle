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
      var jsonData ={};
      var selection;

      if (state[i].selection == 'SUBJECT CONTAINS:') {
        selection = 'Subject';
      } else if (state[i].selection == 'MENTION:') {
        selection = 'Contents';
      } else {
        selection = 'ToAddresses';
      }

      jsonData['field'] = selection;
      jsonData['operation'] = 'in';
      jsonData['value'] = state[i].values;
      jsonQuery.filters.push(jsonData);
    }
    return jsonQuery;
  }

  loadData(newState) {                              	//loadData sends the query to the suQl server and retrieves the data
    let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
          Count
					Documents {
            Subject
            Timestamp
            From
            To
            Contents
					}
				}
		}`

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
      }).catch(console.error)
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
