import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

// Import components
import PageHeader from '/imports/client/components/PageHeader.jsx'
import SignUpButton from '/imports/client/components/SignUpButton.jsx'

class ContentPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={s.base}>

        {this.props.children}

        <div style={s.bottomWrapper}>
          <SignUpButton />
        </div>

      </div>
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '20px 20px 0 20px',
    margin: '0 auto',
    width: '100%',
    height: '100%',
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logo: {
    height: '36px'
  },
}

ContentPage.propTypes = {
  children: PropTypes.any.isRequired,
};

export default ContentPage;
