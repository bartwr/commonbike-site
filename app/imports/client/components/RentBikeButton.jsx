import React, { Component, } from 'react';
import Button from '@material-ui/core/Button';

import {bikeAccount, renterAccount} from '../../config.js';
import {doRentBike} from '../../api/lisk-blockchain/methods/rent-bike.js';

class RentBikeButton extends Component {

  constructor(props) {
    super(props);
  }

  clickRentBike(bikeAddress, bikeDeposit) {
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
        onClick={this.clickRentBike.bind(this, this.props.bike.wallet.address, this.props.bike.blockchain.depositInLSK)}
        >
        RENT BIKE
      </Button>
    )
  }


}

export default RentBikeButton;

