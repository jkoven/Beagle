'use strict';

import React from 'react';

require('styles//Panel.scss');

class Panel extends React.Component {
	render() {
		let {title, direction,height,leftmargin} = this.props;
		if (typeof leftmargin === 'undefined'){
			leftmargin = '0px';
		}
		let styles = {
			component: {height:height},
			content: {
				flexDirection: direction
			}
		}
		return (
			<div className="panel-component" style={styles.component}>
				<h1 style={{'marginLeft': leftmargin}}>{title}</h1>
				<div className={"panel-component-content"} style={styles.content}>
					{this.props.children}
				</div>
			</div>
		);
	}
}

Panel.displayName = 'Panel';

// Uncomment properties you need
// Panel.propTypes = {};
// Panel.defaultProps = {};

export default Panel;
