import React, { Component, } from 'react';
import Button from '@material-ui/core/Button';

import {bikeAccount, renterAccount} from '../../config.js';
import {doRentBike} from '../../api/lisk-blockchain/client/rent-bike.js';

class RentBikeButton extends Component {

  constructor(props) {
    super(props);
  }

  clickRentBike(bike) {
    doRentBike(renterAccount, bikeAccount).then(res => {
      console.log(res)
    }).catch(err => {
      console.error(err)
    });

    // getBike(client, bikeAccount).then(bike => {
    //   console.log("bike:", bike);
    
    //   rentBike(bike, renterAccount).then(rentResult => {
    //     console.log(rentResult);
    //   });
    // });
  }

  render() {
    return (
      <Button
        variant="contained"
        className={this.props.classes.actionbutton}
        onClick={this.clickRentBike.bind(this, this.props.bike)}
        >
        RENT BIKE
      </Button>
    )
  }


}

export default RentBikeButton;

