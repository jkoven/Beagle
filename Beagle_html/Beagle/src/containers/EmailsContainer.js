import React, {Component} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Emails from '../components/Emails';
import dataSource from '../sources/dataSource';

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

class EmailsContainer extends Component {
  constructor() {
    super();
    this.state = {
      emails: [],
			highlightwords: {}
    };
  }

  shouldLoadData() {

	}

  componentWillMount() {
		this.loadData(this.props.state);
	}

	componentWillReceiveProps(nextProps) {
		this.state.highlightwords = {};
		this.loadData(nextProps.state);
	}

  translateStateToFilter(state) {
    var jsonQuery = {
      filters: [],
			highlightwords: {}
    }

    state.filters.forEach(function(element) {
      if (typeof element.values !== 'undefined'){
        var jsonData ={};


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
						switch (element.selection){
							case 'Any':
							case 'ToAddresses':
							case 'FromAddress':
							if (typeof jsonQuery.highlightwords['Addresses'] === 'undefined'){
								jsonQuery.highlightwords['Addresses'] = element.values;
							} else {
								jsonQuery.highlightwords['Addresses'] = [...jsonQuery.highlightwords['Addresses'].slice(0), ...element.values.slice(0)];
							}
							break;
							case 'Subject':
								if (typeof jsonQuery.highlightwords['Subject'] === 'undefined'){
									jsonQuery.highlightwords['Subject'] = element.values;
								} else {
									jsonQuery.highlightwords['Subject'] = [...jsonQuery.highlightwords['Contents'].slice(0), ...element.values.slice(0)];
								}
							break;
							default:
								if (typeof jsonQuery.highlightwords['Contents'] === 'undefined'){
									jsonQuery.highlightwords['Contents'] = element.values;
								} else {
									jsonQuery.highlightwords['Contents'] = [...jsonQuery.highlightwords['Contents'].slice(0), ...element.values.slice(0)];
								}
						}
				}
        jsonQuery.filters.push(jsonData);
      }
    });
    return jsonQuery;
  }

  loadData(newState) {            	//loadData sends the query to the suQl server and retrieves the data
    let query = `query getData($filters:[Rule]){
				Select(filters:$filters){
					Documents(limit:1000) {
						Path
            Subject
            Timestamp
            From:FromAddress
            To:ToAddresses
            Contents
					}
				}
		}`
		let jsonQuery = this.translateStateToFilter(newState);
    dataSource.query(
        query, jsonQuery
    ).then(r => {
      if (typeof r.data !== 'undefined'){
        this.setState({
					emails: r.data.Select.Documents.sort(function(a,b){
						return(b.Timestamp - a.Timestamp)
					}),
					highlightwords: jsonQuery.highlightwords
				})
      }
    }).catch((err) => console.log('In ContactListContainer: ', err.message))
  }

  render() {
		let self = this;
		this.state.emails.forEach(function(email){
			if (typeof email.Contents !== 'undefined'){
				email.Contents = email.Contents.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				if (typeof self.state.highlightwords['Contents'] !== 'undefined'){
					self.state.highlightwords['Contents'].forEach(function(term){
						let regString = new RegExp(term, 'ig');
						email.Contents = email.Contents.replace(regString, '<em>' + term + '</em>');
					})
				}
			}
			if (typeof email.Subject !== 'undefined'){
				email.Subject = email.Subject.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				if (typeof self.state.highlightwords['Subject'] !== 'undefined'){
					self.state.highlightwords['Subject'].forEach(function(term){
						let regString = new RegExp(term, 'ig');
						email.Subject = email.Subject.replace(regString, '<em>' + term + '</em>');
					})
				}
			}
			if (typeof email.To !== 'undefined'){
				let newTo = []
				email.To.forEach(function(to){
					to = to.replace(/</g, '&lt;').replace(/>/g, '&gt;');
					if (typeof self.state.highlightwords['Addresses'] !== 'undefined'){
						self.state.highlightwords['Addresses'].forEach(function(term){
							let regString = new RegExp(term, 'ig');
							to = to.replace(regString, '<em>' + term + '</em>');
						})
					}
					newTo.push(to);

				})
				email.To = newTo;
			}
			if (typeof email.From !== 'undefined'){
				email.From = email.From.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				if (typeof self.state.highlightwords['Addresses'] !== 'undefined'){
					self.state.highlightwords['Addresses'].forEach(function(term){
						let regString = new RegExp(term, 'ig');
						email.From = email.From.replace(regString, '<em>' + term + '</em>');
					})
				}
			}
		})
    const {actions} = this.props;
    return <Emails actions={actions} emails={this.state.emails} position={this.props.position + 15} highlightwords = {this.state.highlightwords}/>;
  }
}

function mapStateToProps(state) {
	const props = {state};
	return props;
}

function mapDispatchToProps(dispatch) {
	const actions = {};
	const actionMap = { actions: bindActionCreators(actions, dispatch) };
	return actionMap;
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailsContainer);
