'use strict';

import React from 'react';
import Panel from './Panel'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FilterItem from '../components/FilterItem'

require('styles//FilterPanel.scss');

class FilterPanel extends React.Component {


  onEnter(e) {
    let {addData} = this.props
//    console.log("Key Entered");
    if(e.key == 'Enter') {
//      console.log("Key Entered");
      addData("Data");
    }
  };


  render() {
    let {numEmails,addFilter,addData,changeFilter, removeFilter, removeFilterLine, filters} = this.props;
    let style ={
      position:"absolute",
      marginLeft: 220,
      marginTop: -22
    };

    let styleItem = {
     marginTop:35
   }
    let size = filters.length;

//    console.log('filters',filters);
    return (
      <div className="filterpanel-component" style={{width:285}}>
        <Panel title="Filters">
          <FloatingActionButton style={style} mini={true} onClick={()=>addFilter()}>
            <ContentAdd />
          </FloatingActionButton>
          <div style={styleItem}>
          {filters.map((s, idx) => <FilterItem numEmails={numEmails} filter = {s} key = {s.filterId} filterkey={s.filterId} addData={addData} changeFilter={changeFilter} filterIdx={idx} size={size} removeFilter={removeFilter} removeFilterLine={removeFilterLine}/>)}
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
