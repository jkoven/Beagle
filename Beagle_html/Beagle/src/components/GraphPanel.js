'use strict';

import React from 'react';
import Panel from './Panel';
import BiGraphContainer from '../containers/BiGraphContainer';
//import ContactGraph from './ContactGraph'
require('styles//GraphPanel.scss');
class GraphPanel extends React.Component {
  render() {
    return (
      <div className='graphpanel-component'>
        <Panel title='Contact Graph' leftmargin='45px'>
        	<BiGraphContainer />
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
