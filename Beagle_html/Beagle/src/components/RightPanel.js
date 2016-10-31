'use strict';

import React from 'react';
import Panel from './Panel';
import WordCloudContainer from '../containers/WordCloudContainer';
import EmailsContainer from '../containers/EmailsContainer';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ActionHelp from 'material-ui/svg-icons/action/help';
import Dialog from 'rc-dialog';

var helpData = require('../sources/helpData.json');

require('styles//RightPanel.scss');

export class RightPanel extends React.Component {
  constructor() {
		super();
		this.state = {
			visible: false,
			width: '800px',
			destroyOnClose: false,
			center: false
		}
	}

  openHelp(){
    this.setState({
      mousePosition: {
        x: this.pageX,
        y: this.pageY
      },
      visible: true
    })
  }

  onClose() {
	 this.setState({visible:false})
 }

  render() {
    let helpButtonStyle ={
      margin: '0px',
      top: '15px',
      right: '20px',
      bottom: 'auto',
      left: 'auto',
      position: 'fixed'
      // position:'absolute',
      // marginLeft: 400,
      // marginTop: -22
    };
    let dialog;
    let mentionHeight = '515px';
    let emailHeight = (window.innerHeight - parseInt(mentionHeight) - 30) + 'px';
    let wrapClassName = '';
    if (this.state.center) {
			wrapClassName = 'center';
		}
		const style = {
			width: this.state.width
		};
		dialog = (
			<Dialog
				visible={this.state.visible}
				wrapClassName={wrapClassName}
				animation='zoom'
				maskAnimation='fade'
				onClose={()=>(this.onClose())}
				style={style}
				mousePosition={this.state.mousePosition}
				title={<div  className = 'helppopup'>Beagle Guidance</div>}
			>
      {helpData.helpLines.map((line) =>
        Object.keys(line).map((key) =>
			    <div className = 'helppopup'><span className = 'props'>{key}</span>: {line[key]}</div>
        )
      )}
			</Dialog>
		);
    return (
      <div className="rightpanel-component">
        <Panel title="Mentions" height={mentionHeight}>
          <FloatingActionButton style={helpButtonStyle} mini={true} onClick={()=>this.openHelp()}>
            <ActionHelp />
            </FloatingActionButton>
          <WordCloudContainer />
        </Panel>
        <Panel title="Communications" height={emailHeight}>
            <EmailsContainer />
        </Panel>
        {dialog}
      </div>
    );
  }
}

RightPanel.displayName = 'RightPanel';

// Uncomment properties you need
// RightPanel.propTypes = {};
// RightPanel.defaultProps = {};
export default RightPanel;
