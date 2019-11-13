import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import Redirect from 'react-router/Redirect'
import Typography from '@material-ui/core/Typography';
import AddBoxIcon from '@material-ui/icons/AddBox';
import ObjectBlockAdmin from '/imports/client/containers/ObjectBlockAdmin';
import Card from '@material-ui/core/Card';

import { Settings, getSettingsClientSide } from '/imports/api/settings.js';
import { Objects } from '/imports/api/objects.js';

const styles = theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  addbox: {
    position: 'relative',
    width: '38vmin', // '120px',
    height: '45vmin', // '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: '2vmin',
    boxSizing: 'border-box',
    padding: '0.1vmin',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent',
    borderRadius: '10px',
    zIndex: 1,
  },
  addicon: {
    width: '100px',
    height: '100px',
    color: 'white'
  }
});

class OverviewPageAdmin extends Component {

  constructor(props) {
    super(props);
    
    this.state = { redirect: false }
  }
  
  doRedirect = (location) => {
    console.log("do redirect %s", location);
    this.setState({redirect: location});
  }
  
  newObjectHandler() {
    Meteor.call('objects.createnew', this.newObjectAdded.bind(this));
  }
  
  newObjectAdded(error, result) {
    if(error) {
      alert('Unable to add a new object to the system');
      return false;
    }

      if(result._id!=undefined) {
        this.setState((prevstate) => {
          return { redirect: '/admin/object/' + result._id }
        });
      }
  }

  handleObjectSelection = (object) => {
    this.setState({redirect: '/object/'+object._id});
  }
  
  handleEditSelection = (object) => {
    this.doRedirect('/admin/object/' + object._id)
  }

  handleDeleteSelection = (object) => {
    console.log(object, object.blockchain.title);
    if( ! confirm(`Are you sure that you want to delete this bicycle, "${object.blockchain.title}"?`))
      return;
  
    Meteor.call('objects.remove', object._id, this.processServerResultDeleteItem.bind(this));
  
    return true;
  }
  
  processServerResultDeleteItem = (err, serverResult) => {
    const { item  } = this.props;
  
    // var util = require('util')
    // if(err) {
    //   this.doSnack(util.format('Unable to delete %s! reason: %s', item.title, JSON.stringify(err)), snackbarOptions.error);
    // } else if (serverResult.result!==true) {
    //   this.doSnack(util.format('Unable to adminmodedelete %s! reason: %s', item.title, serverResult.message), snackbarOptions.error);
    // } else {
    //   this.doSnack(serverResult.message,snackbarOptions.success);
    // }
  };

  renderObject(object) {
    return (
      <ObjectBlockAdmin key={object._id} object={object}
        selecthandler={this.handleObjectSelection}
        edithandler={this.handleEditSelection}
        deletehandler={this.handleDeleteSelection}
        adminmode={true} />
     )
  }

  render() {
    const { classes, objects } = this.props;
    
    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} push/>);
    }
    
    return (
      <div className={classes.root}>
        { objects.length != 0 ?
           objects.map(this.renderObject.bind(this))
          :
          <Typography variant='h4'>No Bicycles Available</Typography>
        }
        <Card className={classes.addbox}>
          <AddBoxIcon className={classes.addicon} onClick={this.newObjectHandler.bind(this)} />
        </Card>
      </div>
    );
  }
}

var s = {
  base: {
    padding: '10px 20px'
  },
  paragraph: {
    padding: '0 20px'
  }
}

OverviewPageAdmin.propTypes = {
  settings: PropTypes.any,
  objects:  PropTypes.array,
  showMap: PropTypes.bool,
  showList: PropTypes.bool,
  adminmode: PropTypes.bool,
};

OverviewPageAdmin.defaultProps = {
  settings: undefined,
  objects: [],
  showMap: false,
  showList: true,
  adminmode: false
}

export default withTracker((props) => {
  Meteor.subscribe('settings', false);
  Meteor.subscribe('objects');

  let settings = getSettingsClientSide();
  if(!settings) {
    return {};
  }
  
  let objects = Objects.find({}, { sort: {title: 1} }).fetch();
  
  return {
    settings: getSettingsClientSide(),
    objects,
    ...props
  };
})(withStyles(styles)(OverviewPageAdmin));
