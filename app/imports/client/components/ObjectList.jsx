import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ObjectBlock from '/imports/client/containers/ObjectBlock';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
// import ObjectDetails from '/imports/client/containers/ObjectDetails';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { withStyles } from '@material-ui/core/styles';
import Redirect from 'react-router/Redirect'

// Import models
import { Objects } from '/imports/api/objects.js';

const styles = theme => ({
  root: {
    margin: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  addbox: {
     display: 'flex',
     flexDirection: 'column',
     justifyContent: 'center',
     alignItems: 'center',
     width: '200px',
     height: '200px',
     margin: theme.spacing(1),
     paddingTop: theme.spacing(0.5).unit
    },
  addicon: {
    width: '100px',
    height: '100px',
  }
});

class ObjectList extends Component {

  constructor(props) {
    super(props);

    this.state = {redirect: false}
  }
  
  doRedirect = (location) => () => {
    console.log("do redirect %s", location);
    this.setState({redirect: location});
  }
  
  newObject() {
    if(this.props.newObject) {
      this.props.newObject();
    }
  }
  
  handleObjectSelection = (object) => {
    // console.log('select catalogitem %o', menuitem.catalogitem.uuid);
    this.setState({redirect: '/bike/'+object._id});
  }
  
  handleEditSelection = (object) => {
    // console.log('edit catalogitem %o', menuitem.catalogitem.uuid);
    RedirectTo((this.props.isEditable ? '/admin/bike/details/' : '/bike/details/') + this.props.item._id)
    this.setState({showeditscreen: true, selectedobjectid: object._id});
  }

  // handleDeleteSelection = (menuitem) => {
  //   if( ! confirm('Are you sure that you want to delete bicycle '+ object.title +'?'))
  //     return;
  //
  //   Meteor.call('objects.remove', object._id, this.processServerResultDeleteItem.bind(this));
  //
  //   return true;
  //   // this.setState({showeditscreen: true, selectedobjectid: menuitem.catalogitem.uuid});
  // }
  //
  // processServerResultDeleteItem = (err, serverResult) => {
  //   const { item  } = this.props;
  //
  //   // var util = require('util')
  //   // if(err) {
  //   //   this.doSnack(util.format('Unable to delete %s! reason: %s', item.title, JSON.stringify(err)), snackbarOptions.error);
  //   // } else if (serverResult.result!==true) {
  //   //   this.doSnack(util.format('Unable to delete %s! reason: %s', item.title, serverResult.message), snackbarOptions.error);
  //   // } else {
  //   //   this.doSnack(serverResult.message,snackbarOptions.success);
  //   // }
  // };
  
  renderObject(object) {
    return (
      <ObjectBlock key={object._id} object={object}
        selecthandler={this.handleObjectSelection}
        edithandler={this.handleEditSelection} />
     )
  }

  render() {
    if(!this.props.objects ) return (null);
    
    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} push/>);
    }

    const { classes, allowCreateLocation, editmode, objects } = this.props;
    
    return (
      <div  className={classes.root}>
        { objects.length != 0 ?
           objects.map(this.renderObject.bind(this))
          :
          <Typography> variant='h4'>No Bicycles Available</Typography>
        }
        { editmode && allowCreateLocation ?
            <Card className={classes.addbox}>
              <AddBoxIcon className={classes.addicon} onClick={this.newObject.bind(this)} />
            </Card>
          :
            null
        }
      </div>
    );
  }
}

ObjectList.propTypes = {
  objects: PropTypes.array,
  clickItemHandler: PropTypes.any,
};

ObjectList.defaultProps = {
  objects: [],
  clickItemHandler: '',
}

export default withStyles(styles)(ObjectList)
