import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session'

// Import components
import PageHeader from '/imports/client/components/PageHeader.jsx'
import Info from '/imports/client/containers/Info.jsx'

import { ClientStorage } from 'ClientStorage';

// UserApp component - represents the whole app
export default class UserApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // console.log("info shown: %s", Session.get("infoshown"))
    // let nevershow = ClientStorage.has("dontshow-info") && (ClientStorage.get("dontshow-info")==true);
    let nevershow = 1;

    if(Session.get("infoshown")!=true&&nevershow==false) {
        Session.set("infoshown", true);
        console.log("info shown 2: %s", Session.get("infoshown"))
        return (
          <div style={s.base}>
            <Info/>
          </div>
        );
    }
    
    return (
      <div style={s.base}>
        {this.props.showPageHeader ? <PageHeader /> : null}
        <div style={s.inner}>
          {this.props.content}
        </div>
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
  inner: {
    width: '860px',
    maxWidth: '100%',
    paddingTop: '16px',
    marginRight: 'auto',
    marginLeft: 'auto'
  }
}
