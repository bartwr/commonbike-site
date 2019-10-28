import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';// Import components
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteIcon from '@material-ui/icons/Delete';

import Redirect from 'react-router/Redirect'

// Import components
import '/imports/api/users.js'

const styles = theme => ({
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '20px 5px 0 5px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 66px)',
  },
  paragraph: {
    padding: '0 20px'
  },
  filterbar: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filteritem: {
    flexBasis: 'auto',
    maxWidth: '250px',
    flexGrow: 1,
    marginBottom: theme.spacing(1),
  },
  filterinput: {
    padding: theme.spacing(0.5),
  },
  centerbox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    paddingLeft: theme.spacing(1),
    margin: theme.spacing(0.5),
  },
  itemtitle: {
    flexBasis: 'auto',
    flexGrow: 1,
    textAlign: 'left',
    // 'white-space': 'nowrap',
    // 'text-overflow': 'hide'
  },
  itemactions: {
    flexGrow: 1,
    width: '80px',
    flexGrow: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconbutton: {
    padding: 0
  },
  icon: {
    height: '16px',
    width: '16px',
    margin: 0
  },
  exportbutton: {
//    flexBasis: '35%',
    width: '115px',
    flexGrow: 0,
    marginLeft: theme.spacing(1)
  }
});

var userFilter = new ReactiveVar("");

class AdminUsersList extends Component {

  constructor(props) {
    super(props);

    this.state = {redirect: false}
    userFilter.set('')
  }

  userReadonly(userid) {
    return Meteor.userId()!=userid;
  }
  
  export() {
    Meteor.call('users.getusersexport', this.doExportData.bind(this))
  }
  
  doExportData(error, exportdata)  {
    let headerrow = exportdata.columns.map(col=>'\"'+col+'\"').join(";");
    let datarows = exportdata.data.map(row=>row.map(col=>col).join(";"));
    let csv = [headerrow].concat(datarows).join('\n');

    var data, filename, link;

    filename = 'export-users.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    var data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  };
  
  doRedirect = (location) => () => {
    console.log("do redirect %s", location);
    this.setState({redirect: location});
  }
  
  deleteUser = (id, username) => () => {
    if( ! confirm('Are you sure that you want to remove user '+ username +'?'))
      return;

    confirm('Sure?') && Meteor.call('users.remove', id);
  }
  
  renderUsers(users) {
    const { classes, isAdmin } = this.props
    
    if(!users) return (<div />)
    
    return (
      <div>
        { users.map((user,index) => {
            let title = (user.username ? user.username : 'anonymous') + ' [' + user.emails[0].address + ']';
            return (
              <Card key={'user-'+index} className={classes.centerbox}>
                <Typography className={classes.itemtitle} noWrap>{title}</Typography>
                <CardActions className={classes.itemactions}>
                  { isAdmin ?
                    <IconButton aria-label="Edit" className={classes.iconbutton} onClick={this.doRedirect('/edituser/'+ user._id).bind(this)}>
                      <SettingsIcon className={classes.icon} />
                    </IconButton>
                    :
                    null }
                  { isAdmin ?
                    <IconButton aria-label="Delete" className={classes.iconbutton} onClick={this.deleteUser(user._id,title).bind(this)}>
                      <DeleteIcon  className={classes.icon} />
                    </IconButton>
                    :
                    null
                  }
                </CardActions>
              </Card>
            )
          })
        }
      </div>
    );
  }
  
  handleUserFilterChanged = (e) => {
    userFilter.set(e.target.value);
  }

  render() {
    let currentuser = Meteor.userId();

    const { classes } = this.props;
    
    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} push/>);
    }

    return (
      <div className={classes.base}>
        <Toolbar position="static" className={classes.filterbar}>
          <TextField
              id="filter"
              type='text'
              label="Type here to search for user"
              className={classes.filteritem}
              InputProps={{
                  className: classes.filterinput
              }}
              autoFocus
              variant="outlined"
              onChange={this.handleUserFilterChanged}
            defaultValue={userFilter.get()} />
            <Button className={ classes.exportbutton } onClick={() => this.export() } variant='contained'>EXPORT ALL</Button>
          </Toolbar>
        {
          this.renderUsers(this.props.users)
        }
      </div>
    );
  }
}

AdminUsersList.propTypes = {
  isAdmin: PropTypes.bool,
  users: PropTypes.any,
  isEditable: PropTypes.any
};

AdminUsersList.defaultProps = {
  isAdmin: false,
  users: [],
  isEditable: false
}

export default  withStyles(styles)(withTracker((props) => {
  let value = userFilter.get();
  
  console.log("userfilter %o", value);

	Meteor.subscribe('allusers', value);
  Meteor.subscribe('roles');
  
  let filter = {};
  if(userFilter!=='') {
    filter = { $or: [ {'username': { '$regex' : value, '$options' : 'i' }},
                      {'emails.address': { '$regex' : value, '$options' : 'i' }}]}
  }
  
  var users = Meteor.users.find(filter, { sort: {username: 1} }).fetch();

  let isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');

	return {
    isAdmin,
  	users
	};
})(AdminUsersList));
