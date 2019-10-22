import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

// Import components
import LiskBikeLogo from '/imports/client/components/LiskBikeLogo.jsx'
import RaisedButton from '/imports/client/components/RaisedButton.jsx'
import PageHeader from '/imports/client/components/PageHeader.jsx'

class CustomPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={Object.assign({}, s.base, {backgroundColor: this.props.backgroundColor})}>
        {this.props.children}
      </div>
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    margin: '0 auto',
    // width: '76%',
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 'calc(100% - 74px)',
  },
  logo: {
    height: '36px'
  },
}

CustomPage.propTypes = {
  children: PropTypes.any.isRequired,
  backgroundColor: PropTypes.string,
};

CustomPage.defaultProps = {
  backgroundColor: '#fff',
};

export default createContainer((props) => {
  return {
    currentUser: Meteor.user()
  };
}, CustomPage);
