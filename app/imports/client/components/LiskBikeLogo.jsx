import React, { Component, } from 'react';
import PropTypes from 'prop-types';

class LiskBikeLogo extends Component {

  render() {
    return (
      <div style={Object.assign({}, s.base, this.props.style, {backgroundImage: 'url("/files/PageHeader/lisk-white.svg")'})}>
        Lisk.Bike
      </div>
    );
  }
}

var s = {
  base: {
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