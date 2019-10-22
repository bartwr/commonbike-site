import { Meteor } from 'meteor/meteor'
import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

// Import components
import LiskBikeLogo from '/imports/client/components/LiskBikeLogo.jsx'
import BackButton from '/imports/client/components/BackButton.jsx'
import RaisedButton from '/imports/client/components/RaisedButton.jsx'
import Avatar from '/imports/client/components/Avatar.jsx'
import { RedirectTo } from '/client/main'

class PageHeader extends Component {

  constructor(props) {
    super(props);
  }

  gotoProfile() {
    RedirectTo('/profile');
  }

  render() {
    return (
      <div style={s.base}>
        <div style={s.flex}>
          <BackButton />
          <a onClick={() => RedirectTo('/')} style={{display: 'flex'}}><LiskBikeLogo style={s.logo} /></a>
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

PageHeader.propTypes = {
  children: PropTypes.any,
};

export default PageHeader
