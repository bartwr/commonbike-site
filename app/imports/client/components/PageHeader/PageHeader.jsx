import { Meteor } from 'meteor/meteor'
import React, { Component, PropTypes } from 'react';

import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import R from 'ramda';

// Import components
import CommonBikeLogo from '../CommonBikeLogo/CommonBikeLogo.jsx'
import BackButton from '../Button/BackButton.jsx'
import RaisedButton from '../Button/RaisedButton.jsx'
import Avatar from '../Avatar/Avatar.jsx'
import {propTypes} from 'react-router';

class PageHeader extends Component {

  constructor(props) {
    super(props);
  }

  gotoProfile() {
    this.context.history.push('/profile');
  }

  render() {
    return (
      <div style={s.base}>
        <div style={s.flex}>
          <BackButton />
          <a href="/" style={{display: 'flex'}}><CommonBikeLogo type="common" style={s.logo} /></a>
          { Meteor.userId() ? <a onClick={this.gotoProfile.bind(this)}><Avatar /></a> : <div /> }
        </div>
        {this.props.children}
      </div>
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '15px 20px 15px 20px'
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  logo: {
    width: '174px',
    height: '28px',
    alignSelf: 'center'
  },
}

PageHeader.contextTypes = {
  history: propTypes.historyContext
}

PageHeader.propTypes = {
  children: PropTypes.any,
};

export default PageHeader;