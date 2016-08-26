'use strict';

import React from 'react';
import Panel from './Panel';
import WordCloudContainer from '../containers/WordCloudContainer';
import EmailsContainer from '../containers/EmailsContainer';
require('styles//RightPanel.scss');
export class RightPanel extends React.Component {

  render() {
    let mentionHeight = 596;
    let emailHeight = window.innerHeight - mentionHeight - 30;
    return (
      <div className="rightpanel-component">
        <Panel title="Mentions" height={mentionHeight}>
          <WordCloudContainer field="PERSON" />
          <WordCloudContainer field="Contents" />
          <WordCloudContainer field="Subject" />
          <WordCloudContainer field="ORGANIZATION" />
        </Panel>
        <Panel title="Emails" height={emailHeight}>
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
