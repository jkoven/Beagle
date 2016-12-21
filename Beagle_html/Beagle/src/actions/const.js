/* Populated by react-webpack-redux:action */
export const ADD_FILTER = 'ADD_FILTER'
export const ADD_DATA = 'ADD_DATA'
export const CHANGE_FILTER = 'CHANGE_FILTER'
export const REMOVE_FILTER = 'REMOVE_FILTER'
export const REMOVE_FILTER_LINE = 'REMOVE_FILTER_LINE'
export const ADD_LIST_ITEM = 'ADD_LIST_ITEM'
export const ADD_MODIFY_DATE_FILTERS = 'ADD_MODIFY_DATE_FILTERS'

export function addFilter() {
  return {type: ADD_FILTER }
}

export function addData(filterIdx,textIdx,value) {
  return {type: ADD_DATA, filterIdx, textIdx, value}
}

export function changeFilter(filterIdx, value) {
  return {type: CHANGE_FILTER, filterIdx, value}
}

export function removeFilter(filterIdx) {
  return {type: REMOVE_FILTER, filterIdx}
}

export function removeFilterLine(filterIdx, textIdx) {
  return {type: REMOVE_FILTER_LINE, filterIdx, textIdx}
}

export function addListItem(contact, selection){
  return {type: ADD_LIST_ITEM, contact, selection}
}

export function addModifyDateFilters(afterAction, afterValue, beforeAction, beforeValue){
  return {type: ADD_MODIFY_DATE_FILTERS, afterAction, afterValue, beforeAction, beforeValue}
}
