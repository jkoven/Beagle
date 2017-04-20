'use strict';

import React from 'react';
import {PRIMARY_VERY_LIGHT} from './style';
import _ from 'lodash';
require('styles//WordCloud.scss');
require('styles//wordcloud-component-words.scss');

class WordCloud extends React.Component {
  constructor() {
    super();
    this.state = {
      currentKeywords: 'contentsKeywords',
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
      OrganizationCount:[]
    }
  }

  mouseDoubleClick (value, selection) {
    this.props.addListItem(value, selection);
  }

  handleChange(e){
    let child = document.querySelector( e.target.value );
    let parent = child.parentNode;
    parent.appendChild(child);
    this.setState({
      currentKeywords: e.target.value
    })
  }

  render() {
    // let personWords = (typeof this.props.words.PERSON !== 'undefined') ? this.props.words.PERSON : [];
    // let organizationWords = (typeof this.props.words.ORGANIZATION !== 'undefined') ? this.props.words.ORGANIZATION : [];
    let contentWords = (typeof this.props.words.Contents !== 'undefined') ? this.props.words.Contents : [];
    let subjectWords = (typeof this.props.words.Subject !== 'undefined') ? this.props.words.Subject : [];
    let self=this;

    // this.state.PersonMaxCount = _.get(personWords,'0.Count');
    // this.state.PersonArr = [];
    // this.state.PersonCount = [];
    // {personWords.map((c) => {
    //   this.state.PersonArr.push(c.Key);
    //   this.state.PersonCount.push(c.Count)
    //   })
    // }


    this.state.ContentMaxCount = _.get(contentWords,'0.Count');
    this.state.ContentsArr = [];
    this.state.ContentCount = [];
    {contentWords.map((c) => {
      this.state.ContentsArr.push(c.Key);
      this.state.ContentCount.push(c.Count)
      })
    }

    this.state.SubjectMaxCount = _.get(subjectWords,'0.Count');
    this.state.SubjectArr = [];
    this.state.SubjectCount = [];
    {subjectWords.map((c) => {
      this.state.SubjectArr.push(c.Key)
      this.state.SubjectCount.push(c.Count)
      })
    }

    // this.state.OrganizationMaxCount = _.get(organizationWords,'0.Count');
    // this.state.OrganizationArr = [];
    // this.state.OrganizationCount = [];
    // {organizationWords.map((c) => {
    //   this.state.OrganizationArr.push(c.Key)
    //   this.state.OrganizationCount.push(c.Count)
    //   })
    // }

//  this.state.PersonArr = this.state.PersonArr.slice(0,100);        //gets the first 20 words, change this number to alter the number of words to display
  this.state.ContentsArr = this.state.ContentsArr.slice(0,100);
  this.state.SubjectArr = this.state.SubjectArr.slice(0,100);
//  this.state.OrganizationArr = this.state.OrganizationArr.slice(0,100);

    return (
      <div>
      <select className='wordCloudSelect' size='1' onChange={function(value) {self.handleChange(value);}} value={this.state.currentKeywords}>
      <option value={'#contentsKeywords'}>{'Contents'}</option>
      <option value={'#personKeywords'}>{'Person'}</option>
      <option value={'#subjectKeywords'}>{'Subject'}</option>
      <option value={'#organizationKeywords'}>{'Organization'}</option>
      </select>

        <g id='subjectKeywords' className='wordcloud-component' >
          <table><thead><tr><td>'Subject'</td></tr></thead>
          <tbody>
          <tr>
          <td className='wordcloud-component-content'>
            {this.state.SubjectArr.map((s, idx) =>
              <svg className='wordsvg' key={'subject' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.SubjectArr[idx], 'Subject')}}>
              <g key={'subjectgroup' + s + idx}>
              <rect  height = '13' x='0' fill={'white'} className='borderCSS' >
            </rect>
              <rect width = {'65'*((this.state.SubjectCount[idx])/(this.state.SubjectMaxCount))}  height = '15' x='-6' fill={PRIMARY_VERY_LIGHT} className='goodCSS'   >
            </rect>
                <text className='term' x='0' y='11.25'>{this.state.SubjectArr[idx]}</text>
                <text className='num' x='0' y='11.25'>{this.state.SubjectCount[idx]}</text>
            </g>
            </svg>
                )
              }
          </td>
          </tr>
          </tbody>
          </table>
          </g>

          <g id='contentsKeywords' className='wordcloud-component' >
          <table><thead><tr><td>'Contents'</td></tr></thead>
          <tbody>
          <tr >
          <td className='wordcloud-component-content'>
            {this.state.ContentsArr.map((s, idx) =>
              <svg  className='wordsvg' key={'contents' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.ContentsArr[idx], 'Contents')}}>
              <g key={'contentsgroup' + s + idx}>
              <rect  height = '13' x='0' fill={'white'} className='borderCSS' >
            </rect>
              <rect  width = {'65'*((this.state.ContentCount[idx])/(this.state.ContentMaxCount))}   height = '15' x='-6' fill={PRIMARY_VERY_LIGHT} className='goodCSS'   >
            </rect>
                <text className='term' x='0' y='11.25' >{this.state.ContentsArr[idx]}</text>
                <text className='num'  x='0' y='11.25' >{this.state.ContentCount[idx]}</text>
            </g>
            </svg>
                )
              }
          </td>
          </tr>
          </tbody>
          </table>
          </g>

          </div>
      );
    }
}

WordCloud.displayName = 'WordCloud';

// Uncomment properties you need
// WordCloudComponent.propTypes = {};
// WordCloudComponent.defaultProps = {};

export default WordCloud;
