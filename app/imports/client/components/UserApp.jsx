import React, { Component, } from 'react';
import PropTypes from 'prop-types';

// Import components
import PageHeader from '/imports/client/components/PageHeader.jsx'

// UserApp component - represents the whole app
export default class UserApp extends Component {

  render() {
    return (
      <div style={s.base}>
        {this.props.showPageHeader ? <PageHeader /> : null}
        {this.props.content}
      </div>
    );
  }
}

UserApp.propTypes = {
  showPageHeader: PropTypes.bool,
};

UserApp.defaultProps = {
  showPageHeader: true,
}

var s = {
  base: {
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(255deg, #02275A 19%, #00132E 70%)',
    maxWidth: '100%',
    minHeight: '100%',
    overflow: 'auto',
    margin: '0 auto',
  },
}
