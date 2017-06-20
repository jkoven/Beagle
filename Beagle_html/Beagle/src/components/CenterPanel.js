'use strict';

import React from 'react';
import Panel from './Panel';
import WordCloudContainer from '../containers/WordCloudContainer';
//import ContactGraph from './ContactGraph'
//import CenterEmail from './CenterEmail.js'
require('styles//CenterPanel.scss');
class CenterPanel extends React.Component {
  render() {
    return (
      <div className='centerpanel-component'>
      <Panel title="Mentions">
        <WordCloudContainer />
      </Panel>
      </div>
    )
  }
}

CenterPanel.displayName = 'CenterPanel';

// Uncomment properties you need
// CenterPanel.propTypes = {};
// CenterPanel.defaultProps = {};

export default CenterPanel;
