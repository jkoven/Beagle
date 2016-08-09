/* Populated by react-webpack-redux:action */
export const ADD_FILTER = 'ADD_FILTER'
export const ADD_DATA = 'ADD_DATA'
export const CHANGE_FILTER = 'CHANGE_FILTER'

export function addFilter() {
  return {type: ADD_FILTER }
}

export function addData(filterIdx,textIdx,value) {
  return {type: ADD_DATA, filterIdx, textIdx, value}
}

export function changeFilter(filterIdx, value) {
  return {type: CHANGE_FILTER, filterIdx, value}
}