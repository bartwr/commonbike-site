import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import RentBikeButton from '/imports/client/components/RentBikeButton';
import ReturnBikeButton from '/imports/client/components/ReturnBikeButton';

import { Objects } from '/imports/api/objects.js';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent'
  },
  dialog: {
    width: '90vw',
    height: 'auto',
    minHeight: '60vh',
    padding: '4vmin',
    marginTop: '5vmin',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '5vmin'
  },
  actionbutton: {
    width: '50vw',
    height: '30px',
    margin: '1vmin'
  },
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '20px 20px 0 20px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 74px)',
    display: 'flex',
    justifyContent: 'space-below',
    flexDirection: 'column'
  },
  list: {
    margin: '0 auto',
    padding: 0,
    textAlign: 'center',
    listStyle: 'none',
  },
  listitem: {
    padding: '0 10px 0 0',
    margin: '0 auto',
    textAlign: 'center',
    minHeight: '40px',
    fontSize: '1.2em',
    fontWeight: '500',
    listStyle: 'none',
  },
  mediumFont: {
    fontSize: '2em',
    fontWeight: '1000',
  }
});


class ObjectDetails extends Component {

  constructor(props) {
    super(props);
  }
  
  renderObjectState(state) {
    const {object, classes} = this.props;

    let statetext = object.lock.locked ? "AVAILABLE" : "IN USE"
    return (
      <div className={classes.base}>
        <ul className={classes.list}>
          <li className={classes.listitem,s.mediumFont}>{statetext}</li>
        </ul>
      </div>
    );
    
    
    // if(this.props.object.lock.locked==false) {
    //   return (
    //     <div className={classes.base}>
    //       <ul className={classes.list}>
    //         <li className={classes.listitem,s.mediumFont}>IN GEBRUIK</li>
    //       </ul>
    //     </div>
    //   );
    // } else if(this.props.object.state.state!="available") {
    //   return (
    //     <div className={classes.base}>
    //       <ul className={classes.list}>
    //         <li className={classes.listitem,s.mediumFont}>NOT AVAILABLE</li>
    //       </ul>
    //     </div>
    //   );
    // } else {
    //   return (
    //     <div className={classes.base}>
    //       <ul className={classes.list}>
    //         <li className={classes.listitem,s.mediumFont}>UNKNOWN</li>
    //       </ul>
    //     </div>
    //   );
    // }
  }
  
  clickCreateBike(object) {
    console.log("clickCreateBike", object);
  }
  
  clickUpdateGPS(object) {
    console.log("clickUpdateGPS", object);
  }

  render() {
    if(this.props.object==undefined) {
      return (null);
    }
    
    const { object, classes } = this.props;

    let location = object.lock && object.lock.lat_lng || [0,0];
    
    console.log("object %o / location: %o", object, location);
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <Typography variant="h4" style={{backgroundColor: 'white', color: 'black'}}>{object.title}</Typography>
          <br />
          <RentBikeButton bike={this.props.object} classes={classes} />
          <ReturnBikeButton bike={this.props.object} classes={classes} />
        </div>
      </div>
    );
  }
}

ObjectDetails.propTypes = {
  currentUser: PropTypes.object,
  object: PropTypes.object,
  isEditable: PropTypes.any,
};

ObjectDetails.defaultProps = {
  currentUser: undefined,
  object: undefined,
  isEditable: false,
}

export default withTracker((props) => {
    Meteor.subscribe('objects');
    
    let object = Objects.findOne({_id: props.objectId});

    console.log("found object %o", object);

    // Return variables for use in this component
    return {
      currentUser: Meteor.user(),
      object: object
    };
})(withStyles(styles) (ObjectDetails));
