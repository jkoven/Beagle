'use strict';

import React from 'react';
import Panel from './Panel';
import FilterContainer from '../containers/FilterContainer';
//import ContactGraph from './ContactGraph'
require('styles//FilterPanel.scss');
class LeftPanel extends React.Component {
  render() {
    return (
      <div className='filterpanel-component'>
        <Panel title='Filters' direction='row'>
        	<FilterContainer />
        </Panel>
      </div>
    )
  }
}

LeftPanel.displayName = 'LeftPanel';

// Uncomment properties you need
// CenterPanel.propTypes = {};
// CenterPanel.defaultProps = {};

export default LeftPanel;
