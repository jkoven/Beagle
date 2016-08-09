import React, {
  Component,
  PropTypes
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import FilterItem from '../components/FilterItem';
import FilterPanel from '../components/FilterPanel';
import { addFilter , addData , changeFilter} from '../actions/const';

class FilterContainer extends Component {
  constructor() {
		super();
		this.state = {
			contacts: []
		};
	}

  



  render() {
  let {actions,filters} = this.props;
  return (<FilterPanel addFilter={actions.addFilter} addData={actions.addData} changeFilter={actions.changeFilter} filters={filters}/>)
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
