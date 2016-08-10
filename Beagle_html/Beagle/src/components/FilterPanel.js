'use strict';

import React from 'react';
import Panel from './Panel'
import TextField from 'material-ui/TextField';
import SearchIcon from 'material-ui/svg-icons/action/search';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import {addFilter} from '../actions/const';
import FilterItem from '../components/FilterItem'

require('styles//FilterPanel.scss');
class FilterPanel extends React.Component {


  onEnter(e) {
    let {addData} = this.props
    console.log("Key Entered");
    if(e.key == 'Enter') {
      console.log("Key Entered");
      addData("Data");
    }
  };


  render() {
    let {numEmails,addFilter,addData,changeFilter, filters} = this.props;
    let style ={
      position:"absolute",
      marginLeft: 220,
      marginTop: -22,
    };

    let styleItem = {
     marginTop:35
   }
    let size = filters.length;


    return (
      <div className="filterpanel-component">
        <Panel title="Filters">
          <FloatingActionButton style={style} mini={true} onClick={()=>addFilter()}>
            <ContentAdd />
          </FloatingActionButton>
          <div style={styleItem}>
          {filters.map((s, idx) => <FilterItem numEmails={numEmails} addData={addData} changeFilter={changeFilter} filterIdx={idx} size={size}/>)}
          </div>



        </Panel>
      </div>
    );
  }
}

FilterPanel.displayName = 'FilterPanel';

// Uncomment properties you need
// FilterPanel.propTypes = {};
// FilterPanel.defaultProps = {};

export default FilterPanel;
//<SearchIcon style={{postion: 'absolute', color:'#ccc'}}/>
