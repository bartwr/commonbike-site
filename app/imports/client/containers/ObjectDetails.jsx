import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

import { Settings, getSettingsClientSide } from '/imports/api/settings.js';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import RentBikeButton from '/imports/client/components/RentBikeButton';
import ReturnBikeButton from '/imports/client/components/ReturnBikeButton';
import { getObjectStatus } from '/imports/api/lisk-blockchain/methods/get-object-status.js';
import MiniMap from '/imports/client/components/MiniMap';

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
    
    const { object } = this.props;
    
    let timer = setTimeout(this.updateObjectStatus.bind(this), 1000);
    // let timer=false;
    this.state = {
      timer: timer,
      status: undefined
    }
  }
  
  componentWillUnmount() {
    if(this.state.timer!=false) {
      clearTimeout(this.state.timer);
    }
  }
  
  async updateObjectStatus() {
    try {
      // console.log("update object status for object %s", this.props.object.wallet.address)
      let newStatus = await getObjectStatus(this.props.settings.bikecoin.provider_url, this.props.object.wallet.address);
      this.setState((prevstate)=>{ return { status: newStatus } });
    } catch(ex) {
      console.error(ex);
    } finally {
      this.setState((prevstate)=>{
        return { timer: setTimeout(this.updateObjectStatus.bind(this), 2000) } });
    }
  }
  
  // clickCreateBike(object) {
  //   console.log("clickCreateBike", object);
  // }
  //
 // }
  renderBlockchain() {
    const { classes } = this.props;
    const { status } = this.state;
    
    // console.log("render blockchain state %o", this.state)
    if(status==undefined) {
      return (null);
    } else if(status==false) {
      return (
        <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>ACCOUNT NOT FUNDED</Typography>
      );
    } else if("asset" in status==false||"ownerId" in status.asset==false) {
      return (
        <>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>balance: {status.balance}</Typography>
          <Typography variant="h6" style={{backgroundColor: 'white', color: 'black'}}>NOT REGISTERED ON THE BLOCKCHAIN</Typography>
        </>
      )
    } else {
      const { status } = this.state;
      return (
        <>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>balance: {status.balance}</Typography>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>ownerId: {status.asset.ownerId}</Typography>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>deposit: {status.asset.deposit}</Typography>
          
          <RentBikeButton bike={this.props.object} classes={classes} />
          <ReturnBikeButton bike={this.props.object} classes={classes} />
        </>
      )
    }
  }

  render() {
    if(this.props.object==undefined) {
      return (null);
    }
    
    const { object, classes } = this.props;

    let location = object.lock && object.lock.lat_lng || [0,0];
    
    console.log("object %o", object);
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <MiniMap lat_lng={object.lock.lat_lng} />
          <Typography variant="h4" style={{backgroundColor: 'white', color: 'black'}}>{object.blockchain.title}</Typography>
          <Typography variant="h6" style={{backgroundColor: 'white', color: 'black'}}>{object.wallet.address}</Typography>
          { this.renderBlockchain() }
        </div>
      </div>
    );
    // <Button variant="contained" className={classes.actionbutton} onClick={this.clickCreateBike.bind(this, object)} disabled>CREATE BIKE</Button>
    // <Button variant="contained" className={classes.actionbutton} onClick={this.clickUpdateGPS.bind(this, object)} disabled>UPDATE GPS LOCATION</Button>
    
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
    Meteor.subscribe('settings');
    
    let object = Objects.findOne({_id: props.objectId});
    
    let settings = getSettingsClientSide();
    if(!settings) {
      console.log("no settings available");
      return {};
    }
    
    // Return variables for use in this component
    return {
      currentUser: Meteor.user(),
      object: object,
      settings: settings
    };
})(withStyles(styles) (ObjectDetails));
