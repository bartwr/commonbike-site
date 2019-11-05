import React, { Component, } from 'react';
import Button from '@material-ui/core/Button';

import {bikeAccount, renterAccount} from '../../config.js';
import {doReturnBike} from '../../api/lisk-blockchain/methods/return-bike.js';

class ReturnBikeButton extends Component {

  constructor(props) {
    super(props);
  }

  clickReturnBike(bike) {
    doReturnBike(renterAccount, bikeAccount).then(res => {
      console.log(res)
    });
  }

  render() {
    return (
      <Button
        variant="contained"
        className={this.props.classes.actionbutton}
        onClick={this.clickReturnBike.bind(this, this.props.bike)}
        >
        RETURN BIKE
      </Button>
    )
  }


}

export default ReturnBikeButton;

