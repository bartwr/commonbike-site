import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { RedirectTo } from '/client/main'

// Import components
import RaisedButton from '/imports/client/components/RaisedButton.jsx'

class SignUpButton extends Component {

  login() { RedirectTo('/login') }

  render() {
    return (
      <RaisedButton onClick={this.login.bind(this)}>
        {this.props.buttonText}
      </RaisedButton>
    )
  }

};

SignUpButton.propTypes = {
  /**
   * Replace the default text
   */
  buttonText: PropTypes.string
};

SignUpButton.defaultProps = {
  buttonText: 'Gaaf, meld me aan!'
};

export default SignUpButton;
