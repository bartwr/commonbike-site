import React, { Component, } from 'react';
import Button from '@material-ui/core/Button';
import { ClientStorage } from 'ClientStorage';

import {bikeAccount, renterAccount} from '../../config.js';
import {doReturnBike} from '../../api/lisk-blockchain/methods/return-bike.js';

class ReturnBikeButton extends Component {

  constructor(props) {
    super(props);
  }

  clickReturnBike(bikeAddress) {
    if(! Meteor.user) {
      alert('No user account found. Please wait a bit or reload the page.');
      return;
    }
    const renterAccount = ClientStorage.get('user-wallet')
    doReturnBike(renterAccount, bikeAddress, false).then(res => {
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
        onClick={this.clickReturnBike.bind(this, this.props.bikeId)}
        disabled={this.props.isDisabled}
        >
        RETURN BIKE
      </Button>
    )
  }


}

export default ReturnBikeButton;

