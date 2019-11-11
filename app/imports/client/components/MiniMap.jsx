import React, { Component, createRef} from 'react';

import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import { ClientStorage } from 'ClientStorage';

import { Settings, getSettingsClientSide } from '/imports/api/settings.js';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import RentBikeButton from '/imports/client/components/RentBikeButton';
import ReturnBikeButton from '/imports/client/components/ReturnBikeButton';
import { getObjectStatus } from '/imports/api/lisk-blockchain/methods/get-object-status.js';

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

import { Objects } from '/imports/api/objects.js';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '50vmin',
    height: '30vmin',
    background: 'transparent',
    margin: '1vmin',
    border: '1px solid black'
  },
  map: {
    width: '100%',
    height: '23vmin',
  },
  mapLocked: {
    width: '100%',
    height: '100%',
  },
  buttonbar: {
    display: 'flex',
    flexdirection: 'row',
    justifyContent: 'space-around'
  },
  button: {
    margin: '1vmin'
  }
});

class MiniMap extends Component {
  constructor(props) {
    super(props);

    console.log('minimap props: ' , props)
    
    let lat_lng = props.lat_lng;
    if(props.lat_lng[0]==999&&props.lat_lng[1]==999) {
      console.log('set latlng to default LCU location');
      lat_lng = [52.088147, 5.106613];
    }
    
    this.state = {
      refmap : React.createRef(),
      refmarker : React.createRef(),
      mapcenter: lat_lng,
      objectpos: lat_lng
    }
  }
  
  updatePosition = () => {
    const map = this.state.refmap.current;
    console.log("update position %o", map.viewport.center)
    
    if (map != null) {
        this.setState({mapcenter: map.viewport.center})
    }
  }
  
  showBike = () => {
    this.setState({ mapcenter: this.state.objectpos })
  }
  
  moveBike = () => {
    this.setState({ objectpos: this.state.mapcenter })
  }

  returnBike = (bikeAddress) => {
    if(! Meteor.user) {
      alert('No user account found. Please wait a bit or reload the page.');
      return;
    }
    const renterAccount = ClientStorage.get('user-wallet')
    Meteor.call('objects.lockBike', renterAccount, bikeAddress)
  }
  
  lockBike = () => {
    const bikeAddress = this.props.bikeAddress;
    // We end the rental. This will lock the bike.
    this.returnBike(bikeAddress)
  }

  render() {
    const { classes, lat_lng, objectislocked } = this.props; // lat_lng,
    const { refmap, mapcenter, objectpos} = this.state;

    const zoom = 15;
    
    return (
      <div className={classes.root}>
        <Map className={objectislocked? classes.mapLocked : classes.map} ref={refmap} center={mapcenter} zoom={zoom} draggable={objectislocked==false} onDragend={this.updatePosition}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker ref={this.refmarker} position={{lat: objectpos[0], lng: objectpos[1]}}/>
        </Map>
        { objectislocked!=true ?
            <div className={classes.buttonbar}>
              <Button className={classes.button} variant="outlined" onClick={this.showBike.bind(this)}>SHOW</Button>
              <Button className={classes.button} variant="outlined" onClick={this.moveBike.bind(this)}>MOVE</Button>
              <Button className={classes.button} variant="outlined" onClick={this.lockBike.bind(this)}>LOCK</Button>
            </div>
          :
            null
        }
      </div>
    );
    // <Typography variant="h6">{'[' + objectpos[0] + ', '+  objectpos[1] + ']'}</Typography>
  }
}

MiniMap.propTypes = {
  lat_lng: PropTypes.array,
  updatelocation: PropTypes.any,
  objectislocked: PropTypes.bool
};

MiniMap.defaultProps = {
  lat_lng: [0,0],
  updatelocation: PropTypes.any,
  objectislocked: true
}

export default withStyles(styles) (MiniMap);
