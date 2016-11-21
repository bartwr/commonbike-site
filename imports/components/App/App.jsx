import React, { Component } from 'react';

// UserApp component - represents the whole app
export default class UserApp extends Component {

  render() {
    return (
      <div style={s.base}>
        {this.props.content}
      </div>
    );
  }

}

var s = {
  base: {
    maxWidth: '100%',
    height: '100%',
    margin: '0 auto'
  },
}
