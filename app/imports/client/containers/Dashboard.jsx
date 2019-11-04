import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor'
const { APIClient } = require('@liskhq/lisk-client');
import { withTracker } from 'meteor/react-meteor-data';
import {getAllBikes} from '/imports/api/lisk-blockchain/methods/get-bikes.js';
import {getBikeStatus} from '/imports/api/lisk-blockchain/methods/get-bike-status.js';
import {getObjectStatus} from '/imports/api/lisk-blockchain/methods/get-object-status.js';
import { Settings, getSettingsClientSide } from '/imports/api/settings.js';
import { Objects, createObject } from '/imports/api/objects.js';
import * as R from 'ramda';

const getBikes = (settings) => getAllBikes(settings.bikecoin.provider_url)

class Bike extends Component {
  async componentDidMount() {
    const bikeStatus = await getBikeStatus(
      this.props.settings.bikecoin.provider_url, 
      this.props.data.id
    )
    console.log('bikeStatus', bikeStatus)
    const objectStatus = await getObjectStatus(
      this.props.settings.bikecoin.provider_url, 
      this.props.data.id
    )
    console.log('objectStatus', objectStatus)
  }

  render() {
    return (
      <div>
        <b>{this.props.data.title}</b> | {this.props.data.id}<br />
        Beddows per hour: {this.props.data.pricePerHour}<br />
        Lng/lat: {this.props.data.longitude}/{this.props.data.latitude}<br />
        <i style={{color: 'darkgreen'}}>
          status: ...
        </i>
        <hr />
      </div>
    )
  }
}

class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      bikes: null
    }

    this.TO_interval;
  }

  componentDidMount() {
    const self = this;
    // Get data & set state
    const getData = async () => {
      self.setState(
        await self.getLatestBlockchainData(self.props.settings)
      );
    }
    // Every 5 seconds: Get latest data
    this.TO_interval = setInterval(getData, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.TO_interval)
  }

  async getLatestBlockchainData(settings) {
    // Get bikes
    const bikes = await getBikes(settings)
    // Return data
    return {
      bikes: bikes
    }
  }

  render() {
    console.log(this.state)
    return (
      <div style={s.base}>
        <h2>Bikes</h2>
        {this.state.bikes && R.map((bike) =>
          <Bike key={bike.id} data={bike} settings={this.props.settings} />
          , this.state.bikes
        )}
      </div>
    );
  }
}

var s = {
  base: {
    padding: '20px'
  },
}

export default withTracker((props) => {
  Meteor.subscribe('settings', false);
  Meteor.subscribe('objects');

  let settings = getSettingsClientSide();
  let objects = Objects.find({}, { sort: {title: 1} }).fetch();
  
  return {
    currentUser: Meteor.user(),
    settings: getSettingsClientSide(),
    objects,
    ...props
  };
})(Dashboard);
