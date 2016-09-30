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

  render() {
  let {words, field} = this.props;
  let self=this;

  if(field=='PERSON'){
    field = 'Person';
    this.state.PersonMaxCount = _.get(words,'0.Count');
    this.state.PersonArr = [];
    this.state.PersonCount = [];
    {words.map(c =>
      this.state.PersonArr.push(c.Key)
      )
    }
    {words.map(c =>
      this.state.PersonCount.push(c.Count)
      )
    }
  }

  if(field=='Contents'){
    this.state.ContentMaxCount = _.get(words,'0.Count');
    this.state.ContentsArr = [];
    this.state.ContentCount = [];
    {words.map(c =>
      this.state.ContentsArr.push(c.Key)
      )
    }
    {words.map(c =>
      this.state.ContentCount.push(c.Count)
      )
    }
  }

  if(field=='Subject'){
    this.state.SubjectMaxCount = _.get(words,'0.Count');
    this.state.SubjectArr = [];
    this.state.SubjectCount = [];
    {words.map(c =>
      this.state.SubjectArr.push(c.Key)
      )
    }
    {words.map(c =>
      this.state.SubjectCount.push(c.Count)
      )
    }
  }

  if(field=='ORGANIZATION'){
    this.state.OrganizationMaxCount = _.get(words,'0.Count');
    field = 'Organization';
    this.state.OrganizationArr = [];
    this.state.OrganizationCount = [];
    {words.map(c =>
      this.state.OrganizationArr.push(c.Key)
      )
    }
    {words.map(c =>
      this.state.OrganizationCount.push(c.Count)
      )
    }
  }

  this.state.PersonArr = this.state.PersonArr.slice(0,20);        //gets the first 20 words, change this number to alter the number of words to display
  this.state.ContentsArr = this.state.ContentsArr.slice(0,20);
  this.state.SubjectArr = this.state.SubjectArr.slice(0,20);
  this.state.OrganizationArr = this.state.OrganizationArr.slice(0,20);

if(field =='Person'){
    return (
      <table><thead>{field}</thead>
      <tbody>
      <tr >
      <td className='wordcloud-component'>
        {this.state.PersonArr.map((s, idx) =>
          <svg className='wordsvg' key={'person' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.PersonArr[idx], 'PERSON:')}}>
          <g key={'persongroup' + s + idx}>
          <rect  height = '13' x='0' fill={'white'} className='borderCSS' >
        </rect>
          <rect  width = {'65'*((this.state.PersonCount[idx])/(this.state.PersonMaxCount))}  height = '15' x='-6' fill={PRIMARY_VERY_LIGHT} className='goodCSS'   >
        </rect>
        <text className='term'  x='0' y='11.25'>{this.state.PersonArr[idx]}</text>
        <text className='num'  x='0' y='11.25'>{this.state.PersonCount[idx]}</text>
        </g>
        </svg>
            )
          }
      </td>
      </tr>
      </tbody>
      </table>
    );
  }


  if(field =='Contents'){
      return(
        <table><thead>{field}</thead>
        <tbody>
        <tr >
        <td className='wordcloud-component'>
          {this.state.ContentsArr.map((s, idx) =>
            <svg  className='wordsvg' key={'contents' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.ContentsArr[idx], 'CONTENT CONTAINS:')}}>
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
      );
    }


    if(field =='Subject'){
        return (
          <table><thead>{field}</thead>
          <tbody>
          <tr>
          <td className='wordcloud-component'>
            {this.state.SubjectArr.map((s, idx) =>
              <svg className='wordsvg' key={'subject' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.SubjectArr[idx], 'SUBJECT CONTAINS:')}}>
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
        );
      }


      if(field =='Organization'){
          return (
            <table><thead>{field}</thead>
            <tbody>
            <tr>
            <td className='wordcloud-component'>
              {this.state.OrganizationArr.map((s, idx) =>
                <svg className='wordsvg' key={'org' + s + idx} onDoubleClick={function () {self.mouseDoubleClick(self.state.OrganizationArr[idx], 'ORGANIZATION:')}}>
                <g key={'orggroup' + s + idx}>
                <rect  height = '13' x='0' fill={'white'} className='borderCSS' >
              </rect>
                <rect width = {'65'*((this.state.OrganizationCount[idx])/(this.state.OrganizationMaxCount))}  height = '15' x='-6' fill={PRIMARY_VERY_LIGHT} className='goodCSS'   >
              </rect>
                  <text className='term' x='0' y='11.25'>{this.state.OrganizationArr[idx]}</text>
                  <text className='num' x='0' y='11.25'>{this.state.OrganizationCount[idx]}</text>
              </g>
              </svg>
                  )
                }
            </td>
            </tr>
            </tbody>
            </table>
          );
        }else{
    return(
            <td className='wordcloud-component'>{field}
            </td>
          );
  }
  }
}

WordCloud.displayName = 'WordCloud';

// Uncomment properties you need
// WordCloudComponent.propTypes = {};
// WordCloudComponent.defaultProps = {};

export default WordCloud;
