import React, { Component, } from 'react';
import PropTypes from 'prop-types';

class Hr extends Component {

  render() {
    return (
      <hr style={s.base} />
    );
  }
}

var s = {
  base: {
    border: 'none',
    background: '#fff',
    height: '2px'
  },
}

export default Hr;
