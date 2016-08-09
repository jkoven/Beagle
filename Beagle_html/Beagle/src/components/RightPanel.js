'use strict';

import React from 'react';
import Panel from './Panel';
import WordCloudContainer from '../containers/WordCloudContainer';
import EmailsContainer from '../containers/EmailsContainer';
require('styles//RightPanel.scss');
class RightPanel extends React.Component {
  render() {
    return (
      <div className="rightpanel-component">
        <Panel title="Mentions" height="63%">
          <WordCloudContainer field="PERSON" />
          <WordCloudContainer field="Contents" />
          <WordCloudContainer field="Subject" />
          <WordCloudContainer field="ORGANIZATION" />
        </Panel>
        <Panel title="Emails" height="37%">
            <EmailsContainer />
        </Panel>
      </div>
    );
  }
}

RightPanel.displayName = 'RightPanel';

// Uncomment properties you need
// RightPanel.propTypes = {};
// RightPanel.defaultProps = {};

export default RightPanel;
