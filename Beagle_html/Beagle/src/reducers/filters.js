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
              return [...state, {selection: 'FROM/TO', filterId: filterUid++}]
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

    default: {
      /* Return original state if no actions were consumed. */
      return state;
    }



  }
}
