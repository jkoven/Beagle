/* Define your initial state here.
 *
 * If you change the type from object to something else, do not forget to update
 * src/container/App.js accordingly.
 */
const initialState = [];

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
        return [...state, {selection: "FROM/TO"}]
    }

    case 'ADD_DATA' : {
      // console.log(action.filterIdx);
      // console.log(state);
      // console.log(state[action.filterIdx].selection);
      // console.log(action.value);
      var filter = Object.assign({},state[action.filterIdx]);
      if (typeof filter.values !== 'undefined') {
        filter.values[action.textIdx] = action.value;
      } else {
        filter.values = [];
      }
      filter.values[action.textIdx] = action.value;
      return [...state.slice(0,action.filterIdx), filter, ...state.slice(action.filterIdx+1)]
    }

    default: {
      /* Return original state if no actions were consumed. */
      return state;
    }

    case 'CHANGE_FILTER' : {
      state[action.filterIdx].selection = action.value;
      return state;
    }



  }
}
