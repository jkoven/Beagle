'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
//import Panel from './Panel'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FilterItem from '../components/FilterItem'

require('styles//FilterPanel.scss');


module.exports = React.createClass({
//class FilterPanel extends React.Component {


  getInitialState: function() {
    return {
      width:300
    }
  },

  componentWillReceiveProps: function() {
    this.setState({
      width : ReactDOM.findDOMNode(this).offsetWidth
    })
  },

  onEnter: function(e) {
    let {addData} = this.props

//    console.log('Key Entered');
    if(e.key == 'Enter') {
//      console.log('Key Entered');
      addData('Data');
    }
  },


  render: function() {
    let {numEmails, addFilter, addData, changeFilter, removeFilter, removeFilterLine, filters} = this.props;
    let style = {
      margin: '0px',
      top: '15px',
      right: 'auto',
      bottom: 'auto',
      left: this.state.width - 10,
      position: 'fixed'
      // position:'absolute',
      // marginLeft: 220,
      // marginTop: -22
    };

    let styleItem = {
     marginTop:'35px'
   }
    let size = filters.length;

//    console.log('filters',filters);
    return (
      <div>
          <FloatingActionButton style={style} mini={true} onClick={()=>addFilter()}>
            <ContentAdd />
          </FloatingActionButton>
          <div style={styleItem}>
          {filters.map((s, idx) =>
            <FilterItem
              numEmails={numEmails}
              filter = {s}
              key = {s.filterId}
              filterkey={s.filterId}
              addData={addData}
              changeFilter={changeFilter}
              filterIdx={idx}
              size={size}
              removeFilter={removeFilter}
              removeFilterLine={removeFilterLine}
            />)}
          </div>
      </div>
    );
  }
});

// FilterPanel.displayName = 'FilterPanel';
//
// // Uncomment properties you need
// // FilterPanel.propTypes = {};
// // FilterPanel.defaultProps = {};
//
// export default FilterPanel;
// //<SearchIcon style={{postion: 'absolute', color:'#ccc'}}/>
