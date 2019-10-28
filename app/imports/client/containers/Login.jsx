import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base';
import { RedirectTo } from '/client/main'
import { withTracker } from 'meteor/react-meteor-data';

// Import templates
import LoginForm from '/imports/client/containers/LoginForm.jsx';

class Login extends Component {

  loginCallback(err) {
    if(err) {
      console.log(err);
      alert(err.message);
    }
  }

  logout() { Meteor.logout() }

  renderIntro() {
    return (
      <div style={s.base}>

        <div style={s.intro}>
          <p>
            Register or log in with your email adress
          </p>
          <p>
            to access the backend
          </p>
        </div>


        <div style={{textAlign: 'center'}}>
          <LoginForm loginCallback={this.loginCallback.bind(this)} />
        </div>

      </div>
    )
  }

  renderTeaser() {
    return (
      <div style={Object.assign({padding: '20px'}, s.base)}>
        <p>Great you want to join us</p>
        <p>Further explanatory text.<p>
        </p><a style={s.anchor} href="mailto:info@lisk.bike">Mail us</a> if you want to help us test.</p>
        <p>You will be the first we will notify when the next fase starts.</p>
        <p><a style={s.anchor} href="http://lisk.bike/" target="_blank"><i>How does it work?</i></a></p>
        <p><button onClick={this.logout}>Logout</button></p>
      </div>
    )
  }

  render() {
    const {currentUser} = this.props
    const {settings} = this.props

    let active = currentUser && currentUser.profile && currentUser.profile.active
    // if(!settings.onboarding.enabled) {
    //   active=true;
    // }

    return (
      <div style={s.base}>
        {currentUser ? (active ? RedirectTo(this.props.redirectTo ? this.props.redirectTo : '/') : this.renderTeaser()) : this.renderIntro()}

      </div>
    );
  }
}

var s = {
  base: {
    color: 'white',
    width: '480px',
    maxWidth: '100%',
    minHeight: 'calc(100% - 74px)',
    height: 'calc(100% - 74px)',
    margin: '0 auto',
    lineHeight: 'default',
    paddingTop: '20px',
    fontSize: '1.05em',
    textAlign: 'center',
    fontWeight: '500',
  },
  anchor: {
    color: '#000',
  },
  intro: {
    padding: '0 5px'
  },
}

Login.propTypes = {
  redirectTo: PropTypes.string
}

export default withTracker((props) => {
  return {
    currentUser: Meteor.user(),
    // settings: Settings.findOne({})
  };
})(Login);
