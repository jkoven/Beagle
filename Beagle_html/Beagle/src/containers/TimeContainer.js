import React, {Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import ContactGraph from '../components/ContactGraph';
import TimeGraph from '../components/TimeGraph';
import dataSource from '../sources/dataSource';
import {addModifyDateFilters} from '../actions/const';

function isValidDate(dateString) {
	var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
	return dateString.match(regEx) != null;
}

function today () {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	return (yyyy+'-'+mm+'-'+dd);
}

class TimeContainer extends Component {
	constructor() {
		super();
		this.state = {
			timeGroups: [],
      timeCount: 0
		};
	}

	componentDidMount() {
		this.loadData({filters: []});
	}

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps.state);
	}

	translateStateToFilter(state) {
		var jsonQuery = {
			filters: [],
			contacts: [],
			toList: [],
			fromList: []
		}
		let clist = [];
		state.filters.forEach(function(element) {
			if (typeof element.values != 'undefined') {
				var jsonData ={};

				let contact = {
					'Any': true,
					'ToAddresses': true,
					'FromAddress': true
				}

				if (contact[element.selection] && typeof element.values !== 'undefined'){
					clist = [...clist.slice(0), ...element.values.slice(0)]
				}
				switch (element.selection) {
					case 'Any':
            jsonQuery.fromList = [...jsonQuery.fromList.slice(0), ...element.values.slice(0)]
            jsonQuery.toList = [...jsonQuery.toList.slice(0), ...element.values.slice(0)]
						break;
					case 'ToAddresses':
						jsonQuery.toList = [...jsonQuery.toList.slice(0), ...element.values.slice(0)]
						break;
					case 'FromAddress':
						jsonQuery.fromList = [...jsonQuery.fromList.slice(0), ...element.values.slice(0)]
						break;
					default:
						break;
				}


				switch (element.selection) {
					case 'ToLength':
						jsonData['field'] = element.selection;
						jsonData['operation'] = 'between';
						jsonData['value'] = ['1', isNaN(parseInt(element.values[0])) ? '10' : parseInt(element.values[0]).toString()];
						break;
						case 'StartDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
							jsonData['value'] = [isValidDate(element.values[0]) ? element.values[0] : '0000-1-1'];
							break;
						case 'EndDate':
							jsonData['field'] = 'Timestamp';
							jsonData['operation'] = 'between';
							jsonData['value'] = ['0000-1-1', isValidDate(element.values[0]) ? element.values[0] : today()];
							break;
					default:
						jsonData['field'] = element.selection;
						jsonData['operation'] = 'contains';
						jsonData['value'] = element.values;
				}
				jsonQuery.filters.push(jsonData);
			}
		});
		let uniqueContacts = {};
		clist = clist.filter(function(item) {
        return uniqueContacts.hasOwnProperty(item) ? false : (uniqueContacts[item] = true);
    });
		jsonQuery.contacts = clist;
		return jsonQuery;
	}

	loadData(newState) {
		var jsonQuery = this.translateStateToFilter(newState);
			let query = `query getData($filters:[Rule], $interval:Interval){
					Select(filters:$filters){
						Count
						Summaries{
							Timestamp(interval:$interval){
									KeyAsString
									Count
							}
						}
					}
				}`

			let minMaxQuery = `query getData($filters:[Rule]){
					Select(filters:$filters){
						Stats {
							Timestamp{
									MinAsString
									MaxAsString
							}
						}
					}
				}`
			let mmQueries = [];
			let interval = ''
			mmQueries.push(dataSource.query(
				minMaxQuery, jsonQuery
			).then(r => {
				let minDate = new Date(r.data.Select.Stats.Timestamp.MinAsString);
				let maxDate = new Date(r.data.Select.Stats.Timestamp.MaxAsString);
				let numMonths = 0;
				if (maxDate.getFullYear() > minDate.getFullYear()){
					numMonths = 12 * (maxDate.getFullYear() - minDate.getFullYear());
				}
				numMonths += maxDate.getMonth() - minDate.getMonth();

					if (numMonths <= 3){
						interval = 'Day'
					} else if (numMonths * 4 < 100){
						interval = 'Week'
					} else if (numMonths < 100) {
						interval = 'Month'
					} else if (numMonths / 4 < 100) {
						interval = 'Quarter'
					} else {
						interval = 'Year'
					}

				jsonQuery.interval = interval;
				let queries = [];
				queries.push(dataSource.query(
					query, jsonQuery
				).then(ret => {
					return ({
						timeCount: ret.data.Select.Count,
						timeGroups: ret.data.Select.Summaries.Timestamp,
						minDate: r.data.Select.Stats.Timestamp.MinAsString,
						maxDate: r.data.Select.Stats.Timestamp.MaxAsString,
						interval: interval
					})
				}));
				Promise.all(queries).then(rr => {
									rr.map((d) => {
										this.setState({
											timeGroups: d.timeGroups,
											timeCount: d.timeCount,
											minDate: d.minDate,
											maxDate: d.maxDate,
											interval: d.interval
										})
									});
								}).catch((err) => console.log('In BiGraphContainer: ', err.message));
				return ({
					status: true
				});
			}));
			Promise.all(mmQueries).then(rr => {
				rr.map((d) => {
					if(d.status !== true){
						console.log('Problem in timegraph promise');
					}
				});
			}).catch((err) => console.log('In BiGraphContainer: ', err.message));

	}

	render() {
//		const {actions} = this.props;
//		return <ContactGraph contacts={this.state.contactNodes} links={this.state.contactLinks}/>;
		let {actions} = this.props;
		return <TimeGraph
			timeCount={this.state.timeCount}
			timeGroups={this.state.timeGroups}
			minDate={this.state.minDate}
			maxDate={this.state.maxDate}
			interval={this.state.interval}
			{...actions}
			/>;

	}
}

TimeContainer.propTypes = {
	actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {addModifyDateFilters};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeContainer);
