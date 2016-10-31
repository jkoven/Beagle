'use strict';

import React from 'react';
import TimeContainer from '../containers/TimeContainer';
//import ContactGraph from './ContactGraph'
require('styles//TimePanel.scss');
class TimePanel extends React.Component {
  render() {
    return (
      <div className='timepanel-component' >
        	<TimeContainer />
      </div>
    )
  }
}

TimePanel.displayName = 'TimePanel';

// Uncomment properties you need
// CenterPanel.propTypes = {};
// CenterPanel.defaultProps = {};

export default TimePanel;
