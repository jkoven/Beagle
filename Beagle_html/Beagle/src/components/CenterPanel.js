'use strict';

import React from 'react';
import Panel from './Panel';
import ContactListContainer from '../containers/ContactListContainer';
//import ContactGraph from './ContactGraph'
import CenterEmail from './CenterEmail.js'
require('styles//CenterPanel.scss');
class CenterPanel extends React.Component {
  render() {
    return (
      <div className='centerpanel-component'>
        <Panel title='Contacts' direction='row'>
        	<ContactListContainer />
			    <CenterEmail />
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
