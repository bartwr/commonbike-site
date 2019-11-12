import React, { Component, } from 'react';
import Button from '@material-ui/core/Button';
import {doRentBike} from '../../api/lisk-blockchain/methods/rent-bike.js';
import { ClientStorage } from 'ClientStorage';

class RentBikeButton extends Component {

  constructor(props) {
    super(props);
  }

  clickRentBike(bikeAddress, bikeDeposit) {
    if(! Meteor.user) {
      alert('No user account found. Please wait a bit or reload the page.');
      return;
    }
    const renterAccount = ClientStorage.get('user-wallet')
    doRentBike(renterAccount, bikeAddress, bikeDeposit).then(res => {
      console.log(res)
    }).catch(err => {
      console.error(err)
    });
  }

  render() {
    return (
      <Button
        variant="contained"
        className={this.props.classes.actionbutton}
        onClick={this.clickRentBike.bind(this, this.props.bikeId, this.props.depositInLSK)}
        disabled={this.props.isDisabled}
        >
        RENT BIKE
      </Button>
    )
  }

}

export default RentBikeButton;

