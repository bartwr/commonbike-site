import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import Redirect from 'react-router/Redirect'

class LiskBikeLogo extends Component {

  render() {
    return (
      <a href="/" style={s.base}>
        Lisk.Bike
      </a>
    );
  }
}

var s = {
  base: {
    display: 'block',
    width: '300px',
    height: '45px',
    fontSize: 'default',
    lineHeight: 'default',
    color: '#fff',
    fontWeight: 'bold',
    backgroundImage: 'url("/files/PageHeader/lisk-white.svg")',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    textIndent: '-9999px',
    position: 'relative'
  },
}

export default LiskBikeLogo;