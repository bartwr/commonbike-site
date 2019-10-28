import { Meteor } from 'meteor/meteor'
import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

// Import components
import LiskBikeLogo from '/imports/client/components/LiskBikeLogo.jsx'
import { RedirectTo } from '/client/main'
import AppMenu from '/imports/client/components/AppMenu.jsx'

import { Settings } from '/imports/api/settings.js';

class PageHeader extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const classes = this.props.classes;
    const { currentUser } = this.props

    return (
      <div className={`${classes.root} ${classes.PageHeader}`}>
        <AppBar position="static" className={classes.appbar}>
          <Toolbar>
            <div className={classes.menudiv}>
              <AppMenu testitems={this.props.showTestOptions} user={currentUser} />
            </div>
            <div onClick={() => RedirectTo('/')} className={classes.logodiv}>
              <LiskBikeLogo className={classes.logo}/>
            </div>
          </Toolbar>
        </AppBar>
        {this.props.children}
      </div>
    );
  }
}

PageHeader.propTypes = {
  children: PropTypes.any,
  showTestOptions: PropTypes.bool
};

PageHeader.defaultProps = {
  showTestOptions: false
}

const styles = theme => ({
  PageHeader: {
    padding: '5px 0'
  },
  root: {
    flexGrow: 1,
  },
  appbar: {
    backgroundColor: 'transparent',// '#fbae17',
  },
  menudiv: {
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(1),
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    zIndex: '100'
  },
  logodiv: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '99',
  },
  logo: {
    width: '300px',
    height: '35px',
    border: '1px solid green'
  }
});

export default withStyles(styles)(withTracker((props) => {
  Meteor.subscribe('settings');

  var settings = Settings.findOne();
  if(!settings) {
    return {}
  }

  return {
    currentUser: Meteor.user(),
    showTestOptions: settings.developmentOptions && settings.developmentOptions.showTestButtons||false
  }
})(PageHeader))

