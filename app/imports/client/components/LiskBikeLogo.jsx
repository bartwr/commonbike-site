import React, { Component, } from 'react';
import PropTypes from 'prop-types';

class LiskBikeLogo extends Component {

  render() {
    return (
      <div style={s.base}>Lisk.Bike</div>
    );
  }
}

var s = {
  base: {
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
  },
}

export default LiskBikeLogo;