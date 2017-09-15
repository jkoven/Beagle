'use strict';

import React from 'react';
import {PRIMARY_VERY_LIGHT} from './style';
//import _ from 'lodash';
require('styles//WordCloud.scss');
require('styles//wordcloud-component-words.scss');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentKeywords: '',
      PersonArr: [],  //an array containing a key(word) and count for the Person section
      ContentsArr: [],
      SubjectArr: [],
      OrganizationArr: [],
      PersonMaxCount: 0,    //highest count number for the Person Section
      ContentMaxCount: 0,
      SubjectMaxCount: 0,
      OrganizationMaxCount: 0,
      PersonCount:[],   //array for the count number of each word in the Person section
      ContentCount:[],
      SubjectCount:[],
      OrganizationCount:[],
      TermLists:[]
    };
  },

  componentWillReceiveProps: function (newProps){
    if (this.state.currentKeywords === ''){
      let keyList = Object.keys(newProps.words);
      this.setState({
        currentKeywords: '#' + keyList[keyList.length - 1] + 'Keywords'
      })
    }
  },

  mouseDoubleClick: function (value, selection) {
    this.props.addListItem(value, selection);
  }
,
  handleChange(e){
    let child = document.querySelector( e.target.value );
    let parent = child.parentNode;
    parent.appendChild(child);
    this.setState({
      currentKeywords: e.target.value
    })
  },

  render: function () {
    let self=this;
    this.state.TermLists = [];
    this.state.heights = [];
    for (var key in this.props.words) {
      let newObj = {};
      newObj[key] = this.props.words[key];
      this.state.TermLists.push(newObj);
    }

    return (

            <div>
              <select className='wordCloudSelect' size='1' onChange={function(value) {self.handleChange(value);}} value={this.state.currentKeywords}>
              {
                this.state.TermLists.map((keypair,i) =>
                <option
                key={'wordselectrow_'+i}
                value={'#' + Object.keys(keypair)[0] + 'Keywords'}>{Object.keys(keypair)[0]}
                </option>
                )
              }
              </select>
              {
                this.state.TermLists.map((keypair,i) =>
                  <g
                    key={Object.keys(keypair)[0] + 'Keywords' + i}
                    id={Object.keys(keypair)[0] + 'Keywords'}
                    className='wordcloud-component'
                  >
                    <table><thead><tr><td>{Object.keys(keypair)[0]}</td></tr></thead>
                    <tbody>
                    <tr>
                    <td className='wordcloud-component-content'>
                      {keypair[Object.keys(keypair)[0]].map((s, idx) =>
                        <svg
                          className='wordsvg' key={'subject' + s['Key'] + idx}
                          onDoubleClick={function () {self.mouseDoubleClick(s['Key'], Object.keys(keypair)[0])}}
                        >
                          <g key={'subjectgroup' + s['Key'] + idx}>
                            <rect  height = '13' x='0' fill={'white'} className='borderCSS' >
                            </rect>
                            <rect width = {'65'*((s['Count'])/(keypair[Object.keys(keypair)[0]][0]['Count']))}  height = '15' x='-6' fill={PRIMARY_VERY_LIGHT} className='goodCSS'   >
                            </rect>
                            <text className='term' x='0' y='11.25'>{s['Key']}</text>
                            <text className='num' x='0' y='11.25'>{s['Count']}</text>
                          </g>
                        </svg>
                      )}
                      </td>
                      </tr>
                      </tbody>
                      </table>
                    </g>
                  )
                }

                </div>
            );

    }
})
