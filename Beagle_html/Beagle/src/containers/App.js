import React, {
	Component,
	PropTypes
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Main from '../components/Main';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();




class App extends Component {
	render() {
		const {actions} = this.props;

		return <Main actions={actions}/>;

	}
}

App.propTypes = {
	actions: PropTypes.object.isRequired
};
function mapStateToProps(state) {
	const props = {
		filter: state.filter
	};
	return props;
}
function mapDispatchToProps(dispatch) {
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}
export default connect(mapStateToProps, mapDispatchToProps)(App);