require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import FilterContainer from '../containers/FilterContainer';
import CenterPanel from './CenterPanel';
import GraphPanel from './GraphPanel';
import RightPanel from './RightPanel';
import ProgressBar from './ProgressBar'

export class AppComponent extends React.Component {

	render() {
		return (
			<div className="index">
				<ProgressBar />
				<FilterContainer />
				<CenterPanel />
				<GraphPanel/>
				<RightPanel />
			</div>
		);
	}
}
AppComponent.defaultProps = {
};

export default AppComponent;
