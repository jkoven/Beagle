'use strict';

import React from 'react';
import Panel from './Panel';
import GraphContainer from '../containers/GraphContainer';
//import ContactGraph from './ContactGraph'
require('styles//GraphPanel.scss');
class GraphPanel extends React.Component {
  render() {
    return (
      <div className='graphpanel-component'>
        <Panel title='Contact Graph'>
        	<GraphContainer />
        </Panel>
      </div>
    )
  }
}

GraphPanel.displayName = 'GraphPanel';

// Uncomment properties you need
// CenterPanel.propTypes = {};
// CenterPanel.defaultProps = {};

export default GraphPanel;