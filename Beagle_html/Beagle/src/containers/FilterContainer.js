import React, {
  Component,
  PropTypes
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import FilterItem from '../components/FilterItem';
import FilterPanel from '../components/FilterPanel';
import dataSource from '../sources/dataSource';
import { addFilter , addData , changeFilter} from '../actions/const';

class FilterContainer extends Component {
  constructor() {
		super();
		this.state = {
			emails: []
		};
	}

  componentWillMount() {
    console.log(this.props.filters);
    this.loadData(this.props.filters);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.filters)
		this.loadData(nextProps.filters);
	}


  translateStateToFilter(state,index) {
    console.log("TRANSLATE STATE: ");
    console.log(state);
    var jsonQuery = {
      filters: []
    };
    for (var i = index; i >= 0; i--) {
      var jsonData ={};
      var selection;
      //console.log(element.selection);

      //var selection = this.translateSelection(element.selection);
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
    };
    console.log("jsonQuery: ");
    console.log(jsonQuery);
    return jsonQuery;
  }

  loadData(newState) {
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
    newState.forEach(function(element,index,array) {
      dataSource.query(
          query, this.translateStateToFilter(newState,index)
      ).then(r => {
        var d = {};
        console.log("R.data.select.count: "  + r.data.Select.Count);
        d[index] = r.data.Select.Count;
        console.log("d");
        console.log(d);
        this.setState({emails: this.state.emails.concat(d)});
      }).catch(console.error)
    },this)
  }



  render() {
    console.log("this.state.emails: ");
    console.log(this.state.emails);
    let {actions,filters} = this.props;
    return (<FilterPanel  numEmails={this.state.emails} addFilter={actions.addFilter} addData={actions.addData} changeFilter={actions.changeFilter} filters={filters}/>)
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
  const actions = {addFilter,addData,changeFilter};
  const actionMap = {actions: bindActionCreators(actions, dispatch) };
  return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterContainer);
