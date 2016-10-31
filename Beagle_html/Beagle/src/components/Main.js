require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import GraphPanel from './GraphPanel';
import RightPanel from './RightPanel';
import ProgressBar from './ProgressBar'
import TimePanel from './TimePanel'

export class AppComponent extends React.Component {

	render() {
		return (
			<div className="index">
				<ProgressBar />
				<LeftPanel />
				<CenterPanel />
				<GraphPanel/>
				<RightPanel />
				<TimePanel />
			</div>
		);
	}
}
AppComponent.defaultProps = {
};

export default AppComponent;
