import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { RedirectTo } from '/client/main'

// Import components
import RaisedButton from '/imports/client/components/RaisedButton';
import '/imports/api/users.js';
import EditSettings from '/imports/client/containers/EditSettings.jsx'
import ManageApiKeys from '/imports/client/components/ManageApiKeys';

class Profile extends Component {
  constructor(props) {
    super(props);
  }

  // reservations() {
  //   RedirectTo('/objects')
  // }
  //
  // objects() {
  //   RedirectTo('/admin/objects')
  // }
  //
  // wallet() {
  //   RedirectTo('/wallet')
  // }

  rentals() {
    RedirectTo('/admin/rentals')
  }

  manageusers() {wallet
    RedirectTo('/admin/users')
  }

  admintools() {
    RedirectTo('/admin/admintools')
  }

  logout() {
    Meteor.logout();
    RedirectTo('/')
  }

  getUserPersonalia() {
    if(this.props.currentUser && this.props.currentUser.emails) {
      return this.props.currentUser.emails[0].address;
    } else {
      return '';
    }
  }

  getMyObjectsButton() {
    // bestaande providers en gebruikers met rechten kunnen locaties beheren
    var show = this.props.currentUser && this.props.currentUser.profile &&
                        (this.props.currentUser.profile.provider_objects ||
                         this.props.currentUser.profile.cancreateobjects)
  
    if(Roles.userIsInRole( Meteor.userId(), 'admin')) {
      show = true; // administrators can always manage objects
    }
  
    if(show) {
      return ( <RaisedButton onClick={this.objects.bind(this)}>MY LOCATIONS</RaisedButton> )
    } else {
      return ( <div /> )
    }
  }

  getMyRentalsButton() {
    var show = this.props.currentUser && this.props.currentUser.profile &&
               (this.props.currentUser.profile.provider_objects ||
                this.props.currentUser.profile.cancreateobjects)

    if(Roles.userIsInRole( Meteor.userId(), 'admin')) {
      show = true; // administrators can always manage locations
    }

    if(show) {
      return ( <RaisedButton onClick={this.rentals.bind(this)}>MY RENTAL</RaisedButton> )
    } else {
      return ( <div /> )
    }
  }

  getManageUsersButton() {
    if(Roles.userIsInRole( Meteor.userId(), 'admin' )) {
      return ( <RaisedButton onClick={this.manageusers.bind(this)}>USER ADMINISTRATION</RaisedButton> )
    } else {
      return ( <div /> )
    }
  }

  getEditSystemSettings() {
    if(Roles.userIsInRole( Meteor.userId(), 'admin' )) {
      return (<EditSettings title="SYSTEEMINSTELLINGEN"/> )
    } else {
      return ( <div /> )
    }
  }

  getAdminToolsButton() {
    if(Roles.userIsInRole( Meteor.userId(), 'admin' )) {
      return ( <RaisedButton onClick={this.admintools.bind(this)}>ADMIN FUCTIONS</RaisedButton> )
    } else {
      return ( <div /> )
    }
  }

  render() {
    self = this;

    // <RaisedButton onClick={this.locations.bind(this)}>MIJN LOCATIES</RaisedButton>

    // <RaisedButton onClick={this.rentals.bind(this)}>MIJN VERHUUR</RaisedButton>

    return (
      <div style={s.base}>

        <div style={s.centerbox}>

          <p style={s.personalia}>
            { this.getUserPersonalia() }
          </p>

          // <RaisedButton onClick={() => RedirectTo('/')}>SEARCH</RaisedButton>

          // <RaisedButton onClick={this.reservations.bind(this)}>BIKE</RaisedButton>

          // <RaisedButton onClick={this.wallet.bind(this)}>WALLET</RaisedButton>

          { this.getMyObjectsButton() }

          { this.getMyRentalsButton() }

          {/* }<ManageApiKeys keyOwnerId={Meteor.userId()} keyType="user" /> */}

          { this.getManageUsersButton() }

          { this.getEditSystemSettings() }

          { this.getAdminToolsButton() }

          <RaisedButton onClick={this.logout.bind(this)}>LOG OUT</RaisedButton>
        </div>

      </div>
    );
  }
}

var s = {
  base: {
    padding: '10px 20px',
    textAlign: 'center'
  },
  personalia: {
    padding: '0 20px',
    fontWeight: 'bold',
    fontSize: '20px',
  },
}

Profile.propTypes = {
  locations: PropTypes.array,
  isEditable: PropTypes.any,
  clickItemHandler: PropTypes.any,
};

Profile.defaultProps = {
  isEditable: false
}

export default createContainer((props) => {
  Meteor.subscribe('users');

  return {
    currentUser: Meteor.users.findOne()
  };
}, Profile);

//
