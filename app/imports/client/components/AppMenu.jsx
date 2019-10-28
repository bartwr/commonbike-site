import { Meteor } from 'meteor/meteor'
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { RedirectTo } from '/client/main'

const styles = {
  list: {
    width: 'auto',
  },
  fullList: {
    width: 'auto',
  },
  menuIcon: {
    color: 'white'
  }
};

class AppMenu extends React.Component {
  state = {
    main: false,
    systemsettings: false,
    testitems: false,
  };

  toggleStateItem = (itemname) => () => {
    this.setState((state) => {
      let newstate = !state[itemname];
      return {[itemname]: newstate}
    });
  };

  setStateItem = (itemname, open) => () => {
    this.setState({ [itemname]: open });
  };

  closeMenu = () => {
    this.setState({ main: false });
  }

  doRedirect = (location) => () => {
    this.closeMenu();
    RedirectTo(location)
  }

  // doHistory() {
  //   this.closeMenu();
  //   RedirectTo('/history');
  // }

  doSystemSettings() {
    this.closeMenu();
    RedirectTo('locations')
  }

  cleanTestUsers() {
    if( !confirm('Are you sure you want to remove all testusers? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestUsers');

    if(istestuser) {
      Meteor.logout(()=>RedirectTo('/'));
    }

    alert('All testusers are removed!');
  }

  cleanTestData() {
    if( !confirm('Are you sure you want to remove all testdata? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestData');

    alert('All testdata is removed!');
  }

  insertTestUsers() {
    if( !confirm('Are you sure you want to add testusers? Never do this on a production server.')) {
      return;
    }

    Meteor.call('testdata.checkTestUsers');

    alert('The testusers have been added!');
  }

  insertTestData() {
    if( !confirm('Are you sure you want to add testdata? Never do this on a production server.')) {
      return;
    }

    Meteor.call('testdata.checkTestObjects');

    alert('The testdata has been added!');
  }
  doCheckTestUsers() {
    this.closeMenu();

    let istestuser = Meteor.user&&Meteor.user.profile&&Meteor.user.profile.testdata;

    Meteor.call('testdata.checkTestUsers')

    if(istestuser) {
      Meteor.logout(()=>RedirectTo('/'));
    }
  }

  doCheckTestData() {
    this.closeMenu();

    Meteor.call('testdata.checkTestData')

    RedirectTo('/');
  }

  doTestdataRemove() {
    this.closeMenu();

    let istestuser = Meteor.user&&Meteor.user.profile&&Meteor.user.profile.testdata;

    Meteor.call('testdata.cleanupTestData')
    Meteor.call('testdata.cleanupTestUsers')

    if(istestuser) {
      Meteor.logout(()=>RedirectTo('/'));
    }
  }
  
  doAdminfunctions() {
    
  }

  doLogout() {
    this.closeMenu();

    Meteor.logout(()=>RedirectTo('/'));
  }

  doLogin() {
    this.closeMenu();

    RedirectTo('/login');
  }

  objects() {
    RedirectTo('/objects')
  }

  render() {
    const { classes } = this.props;
    const user = this.props.user;

    let isAdmin = user && Roles.userIsInRole(user._id, 'admin');
    let email = user && user.emails && user.emails[0] ? user.emails[0].address: ""

    const sideList = (
      <div className={classes.list}>
        <List>
          {[
            { title: 'Search on the Map', onclick: this.doRedirect('/').bind(this) },
            { title: 'List of all bicycles', onclick: this.doRedirect('/objects').bind(this) },
//            { title: 'My Rentals', onclick: this.doRedirect('/admin/rentals').bind(this) }, -> needs special version of objects page
            { title: 'My Wallet', onclick: this.doRedirect('/wallet').bind(this) },
            ].map((info, index) => (
            <ListItem button key={info.title} onClick={info.onclick}>
              <ListItemIcon><StarIcon /></ListItemIcon>
              <ListItemText primary={info.title} />
            </ListItem>
          ))}
        </List>
        <Divider />
        { isAdmin ?
            <div>
              <ListItem button onClick={this.toggleStateItem('systemsettings')}>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Administrator" />
                  {this.state.systemsettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={this.state.systemsettings} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {[
                    { title: 'User Management', onclick: this.doRedirect('/admin/users').bind(this) },
                    { title: 'System Settings', onclick: this.doRedirect('/systemsettings').bind(this) } ,
                    { title: 'Log', onclick: this.doRedirect('/admin/log').bind(this) } ,
                    ].map((info, index) => (
                    <ListItem button key={'menuitem' + info.title}  onClick={info.onclick} className={classes.nested}>
                      <ListItemIcon><StarBorderIcon /></ListItemIcon>
                      <ListItemText primary={info.title} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </div>
          :
            null
          }
        <Divider />
        { isAdmin && this.props.testitems ?
            this.renderTestSubmenu(classes, isAdmin)
            :
            null
         }
        { this.props.user ?
         <ListItem button key={"Logout"} onClick={this.doLogout.bind(this)}>
           <ListItemIcon><StarIcon /></ListItemIcon>
           <ListItemText primary={"Logout"} />
         </ListItem>
         :
         <ListItem button key={"Login"} onClick={this.doLogin.bind(this)}>
           <ListItemIcon><StarIcon /></ListItemIcon>
           <ListItemText primary={"Login"} />
         </ListItem>
       }
       { this.props.user ?
         <ListItem>
           <AccountCircleIcon />
           <ListItemText primary={email} />
         </ListItem>
         :
         null
        }
      </div>
    );

    return (
      <div>
        <IconButton onClick={this.setStateItem('main', true)} className={classes.menuIcon}>
          <MenuIcon />
        </IconButton>
        <Drawer open={this.state.main} onClose={this.setStateItem('main', false)}>
            {sideList}
            <div
              tabIndex={0}
              role="button"
              onClick={ this.setStateItem('main', false)}
              onKeyDown={this.setStateItem('main', false)}
            />
        </Drawer>
      </div>
    );
  }
  
  cleanTestUsers() {
    if( !confirm('Are you sure you want to remove all testusers? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestUsers');

    alert('All testusers are removed!');
  }

  cleanTestData() {
    if( !confirm('Are you sure you want to remove all testdata? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestData');

    alert('All testdata is removed!');
  }

  insertTestUsers() {
    if( !confirm('Are you sure you want to add testusers? Never do this on a production server.')) {
      return;
    }

    Meteor.call('testdata.checkTestUsers');

    alert('The testusers have been added!');
  }

  insertTestData() {
    if( !confirm('Are you sure you want to add testdata? Never do this on a production server.')) {
      return;
    }

    Meteor.call('testdata.checkTestObjects');

    alert('The testdata has been added!');
  }
  
  renderTestSubmenu(classes, isAdmin) {
    return (
      <div>
        <ListItem button onClick={this.toggleStateItem('testitems')}>
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="Test" />
            {this.state.testitems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
        <Collapse in={this.state.testitems} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {
              isAdmin ?
                [
                { title: 'Remove Test Users', onclick: this.cleanTestUsers.bind(this) },
                { title: 'Remove Test Data', onclick: this.cleanTestData.bind(this) },
                { title: 'Add Test Users', onclick: this.insertTestUsers.bind(this) },
                { title: 'Add Test Data', onclick: this.insertTestData.bind(this) },
                ].map((info, index) => (
                  <ListItem button key={info.title} className={classes.nested} onClick={info.onclick}>
                    <ListItemIcon><StarBorderIcon /></ListItemIcon>
                    <ListItemText primary={info.title} />
                  </ListItem>
                ))
              : null
            }
          </List>
        </Collapse>
        <Divider />
      </div>
    )
  }

}

AppMenu.propTypes = {
  user: PropTypes.object,
  classes: PropTypes.object.isRequired,
  testitems: PropTypes.bool
};

AppMenu.defaultProps = {
  user: {},
  testitems: false
}

export default withStyles(styles)(AppMenu);