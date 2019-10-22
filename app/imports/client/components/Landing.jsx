import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { RedirectTo } from '/client/main'

// Import components
import CommonBikeLogo from '/imports/client/components/CommonBikeLogo.jsx'
import RaisedButton from '/imports/client/components/RaisedButton.jsx';

class Landing extends Component {

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.base).style.display = 'flex';
  }

  login() {
    RedirectTo('/login')
  }

  render() {
    return (
      <div style={s.base} ref="base">
        <CommonBikeLogo style={s.logo} />

        <p style={s.introText}>
          Welcome at the new bike-sharing-system of the Netherlands. We are making bike sharing fun and easy. Our goal: everywhere and allways a bike available for everyone.
        </p>

        <div style={s.bottomWrapper}>
          <p>
            <a style={s.smallText} onClick={() => RedirectTo('/join')}>ehm, how does it work?</a>
          </p>

    			<RaisedButton onClick={RedirectTo.bind(this, '/')}>
    				Where can I hire a bike?
    			</RaisedButton>
        </div>

      </div>
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '40px 20px 0 20px',
    background: '#00d0a2',
    margin: '0 auto',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '568px',
  },
  logo: {
    height: '50px'
  },
  logo2: {
    height: '220px'
  },
  introText: {
    maxWidth: '320px',
    padding: '10px',
    margin: '0 auto',
    fontWeight: '500',
    fontSize: '1.45em',
    lineHeight: '1.3em',
    '@media (minWidth: 700px)': {
      maxWidth: '500px'
    }
  },
  smallText: {
    color: '#fff',
    fontSize: '0.8em',
    fontWeight: '500',
  }
}

export default createContainer((props) => {
  return {
    currentUser: Meteor.user()
  };
}, Landing);
