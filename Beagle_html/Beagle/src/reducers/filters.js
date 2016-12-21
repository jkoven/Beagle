/* Define your initial state here.
 *
 * If you change the type from object to something else, do not forget to update
 * src/container/App.js accordingly.
 */
const initialState = [];
var filterUid = 0;
module.exports = function(state = initialState, action) {
  /* Keep the reducer clean - do not mutate the original state. */
  //let nextState = Object.assign({}, state);

  switch(action.type) {
    /*
    case 'YOUR_ACTION': {
      // Modify next state depending on the action and return it
      return nextState;
    } break;
    */
    case 'ADD_FILTER' : {
              return [...state, {selection: 'Any', filterId: filterUid++}]
    }

    case 'ADD_DATA' : {
      // console.log(action.filterIdx);
      // console.log(state);
      // console.log(state[action.filterIdx].selection);
      // console.log(action.value);
      var filter = Object.assign({},state[action.filterIdx]);
      if (typeof filter.values === 'undefined') {
        filter.values = [];
      }
      if (action.textIdx === 0 && action.value === '') {
        filter.values[action.textIdx] = '*';
      } else {
        filter.values[action.textIdx] = action.value;
      }
      return [...state.slice(0,action.filterIdx), filter, ...state.slice(action.filterIdx+1)]
    }

    case 'CHANGE_FILTER' : {
      state[action.filterIdx].selection = action.value;
      return [...state.slice(0,action.filterIdx), Object.assign({}, state[action.filterIdx]), ...state.slice(action.filterIdx+1)]
    }

    case 'ADD_LIST_ITEM' : {
      let contact = {'Any': 0, 'ToAddresses': 0, 'FromAddress': 0}
      if (state.length > 0) {
        let idx = state.length - 1;
        if (state[idx].selection === action.selection || (action.selection === 'Any') && contact.hasOwnProperty(state[idx].selection)){
          var filter = Object.assign({},state[idx]);
          if (typeof filter.values === 'undefined') {
            filter.values = [action.contact];
          } else {
            filter.values.push(action.contact);
          }
          return [...state.slice(0, idx), filter];
        } else {
          return [...state, {selection: action.selection, values: [action.contact], filterId: filterUid++}];
        }
      } else  {
        return [...state, {selection: action.selection, values: [action.contact], filterId: filterUid++}];
      }
    }

    case 'REMOVE_FILTER' : {
//      console.log('removeFilter: ',[...state.slice(0,action.filterIdx), ...state.slice(action.filterIdx+1)])
      return [...state.slice(0,action.filterIdx), ...state.slice(action.filterIdx+1)];
    }

    case 'REMOVE_FILTER_LINE' : {
      var filter = Object.assign({},state[action.filterIdx]);
      if (typeof filter.values === 'undefined') {
        return state;
      } else if (action.textIdx > filter.values.length) {
        return state;
      }
      filter.values = [...filter.values.slice(0, action.textIdx), ...filter.values.slice(action.textIdx+1)];
      if (filter.values.length === 0) {
        return [...state.slice(0,action.filterIdx), ...state.slice(action.filterIdx+1)];
      } else
        return [...state.slice(0,action.filterIdx), filter, ...state.slice(action.filterIdx+1)];
    }

    case 'ADD_MODIFY_DATE_FILTERS' : {
      switch (action.afterAction) {
        case '':
          break;
        case 'modify':
          let filterIndex = state.findIndex(function(s){
            return s.selection === 'StartDate';
          });
          let filter = {};
          filter.selection = 'StartDate';
          filter.values = [action.afterValue];
          if (filterIndex !== -1) {
            filter.filterId = state[filterIndex].filterId;
            return [...state.slice(0,filterIndex), filter, ...state.slice(filterIndex+1)];
          } else {
            filter.filterId = filterUid++;
            return [...state, filter];
          }
        default:
          return state;
      }
      switch (action.beforeAction) {
        case '':
          break;
        case 'modify':
          let filterIndex = state.findIndex(function(s){
            return s.selection === 'EndDate';
          });
          let filter = {};
          filter.selection = 'EndDate';
          filter.values = [action.beforeValue];
          if (filterIndex !== -1) {
            filter.filterId = state[filterIndex].filterId;
            return [...state.slice(0,filterIndex), filter, ...state.slice(filterIndex+1)];
          } else {
            filter.filterId = filterUid++;
            return [...state, filter];
          }
        default:
          return state;
      }
      return state;
    }


    default: {
      /* Return original state if no actions were consumed. */
      return state;
    }



  }
}
