import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import { ClientStorage } from 'ClientStorage';

const transactions = require('@liskhq/lisk-transactions');

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

  isBikeRentedToMe() {
    if(! this.state.status) return false;
    if(! ClientStorage.get('user-wallet')) return false;
    return this.state.status.rentedBy == ClientStorage.get('user-wallet').address;
  }
  
  async updateObjectStatus() {
    try {
      if(this.props.object==undefined) {
        console.error(`No object found; I cannot update the object status.`)
        return false;
      }
      let newStatus = await getObjectStatus(
        this.props.settings.bikecoin.provider_url,
        this.props.object.wallet.address
      );
      if(! newStatus) {
        console.error(`Couldn't get object status for ${this.props.settings.bikecoin.provider_url} and ${this.props.object.wallet.address}`)
        return false;
      }
      let balance = transactions.utils.convertBeddowsToLSK(newStatus.balance);
      let deposit = transactions.utils.convertBeddowsToLSK(newStatus.asset.deposit);
      this.setState((prevstate) => { return { status: newStatus && newStatus.asset, balance: balance, deposit: deposit } });
    } catch(ex) {
      console.error(ex);
    } finally {
      this.setState((prevstate) => {
        return {
          timer: setTimeout(this.updateObjectStatus.bind(this), 2000)
        }
      });
    }
  }

  render() {
    if(this.props.objectId==undefined) {
      return (null);
    }

    const { objectId, classes } = this.props;
    const { status, balance, deposit } = this.state;
    
    if(undefined==status) {
      return null;
    }

    let location = status.location || {latitude: 40, longitude: 10};
    let unlocked = status.rentedBy!=""&&status.rentedBy!=undefined;
    
    // console.log("unlocked: %s", status.rentedBy)
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <MiniMap
            lat_lng={[location.latitude, location.longitude]}
            objectislocked={unlocked==false}
            bikeAddress={objectId} />
          <Typography variant="h4" style={{backgroundColor: 'white', color: 'black'}}>{status.title}</Typography>
          <Typography variant="h6" style={{backgroundColor: 'white', color: 'black'}}>{objectId}</Typography>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>balance: {balance}</Typography>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>ownerId: {status.ownerId}</Typography>
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>deposit: {deposit}</Typography>
          { unlocked==true?
                <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>rented by: {status.rentedBy}</Typography>
              :
                null
          }
          <Typography variant="subtitle1" style={{backgroundColor: 'white', color: 'black'}}>location: {location.longitude}, {location.latitude}</Typography>

          <RentBikeButton bikeId={this.props.objectId} depositInLSK={deposit} classes={classes} isDisabled={unlocked} />
        </div>
      </div>
    );
    
    // <ReturnBikeButton bikeId={this.props.objectId} classes={classes} isDisabled={
    //   ! this.isBikeRentedToMe()
    // } />
    
  }
}

ObjectDetails.propTypes = {
  object: PropTypes.object,
  settings: PropTypes.object,
};

ObjectDetails.defaultProps = {
  object: undefined,
  settings: undefined,
}

export default withTracker((props) => {
    Meteor.subscribe('objects');
    Meteor.subscribe('settings');
    // Get settings
    let settings = getSettingsClientSide();
    if(!settings) {
      console.log("no settings available");
      return {};
    }
    // Return variables for use in this component
    return {
      objectId: props.objectId,
      object: Objects.findOne(props.objectId),
      settings: settings
    };
})(withStyles(styles) (ObjectDetails));
