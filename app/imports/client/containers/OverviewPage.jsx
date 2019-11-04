import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import Redirect from 'react-router/Redirect'

import { Settings, getSettingsClientSide } from '/imports/api/settings.js';
import { Objects, createObject } from '/imports/api/objects.js';

import ObjectList from '/imports/client/components/ObjectList';
import LocationsMap from '/imports/client/components/LocationsMap';


import {getAllBikes} from '/imports/api/lisk-blockchain/client/get-bikes.js';

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  mapcontainer: {
    flex:  '1 1 auto',
    height: '30vh',
    width: '90vw'
  },
  listcontainer: {
    flex:  '1 1 auto',
    minHeight: '50vh'
  }
});

class OverviewPage extends Component {

  constructor(props) {
    super(props);
    
    console.log("props %o", props);
    
    let timer = setTimeout(this.updateBikes.bind(this), 1000);
    // let timer=false;
    this.state = { redirect: false, mapBoundaries: null, timer: timer }
  }
  
  componentWillUnmount() {
    if(this.state.timer!=false) {
      clearTimeout(this.state.timer);
    }
  }
  
  async updateBikes() {
    let newBikes = await getAllBikes(this.props.settings.bikecoin.provider_url);
    console.log("got bikes: %o", newBikes)
    
    this.setState((prevstate)=>{
      return {
        bikes: newBikes,
        timer: setTimeout(this.updateBikes.bind(this), 5000)
      }
    });
  }

  newObjectHandler() {
    Meteor.call('objects.createnew', this.newObjectAdded.bind(this));
  }
  
  newObjectAdded(error, result) {
    if(error) {
      alert('Unable to add a new object to the system');
      return false;
    }

      if(result._id!=undefined) {
        this.setState((prevstate)=> {
          return { redirect: '/admin/object/' + result._id }
        });
      }
  }
  

  /*
    getVisibleObjectsOnly :: ? -> ?

    Get only the objects inside the maps boundaries.
  */
  getVisibleObjectsOnly(object) {

    // Every object needs a lat/lng
    if( ! object.lock.lat_lng)
      return false;

    // If mapBoundaries is not set: exclude this object
    if( ! this.state.mapBoundaries)
      return false;

    // Every object needs to be visible inside the map boundaries
    // #TODO: Should work below the equator as well
    let b = this.state.mapBoundaries, o = object, visibleOnMap = false;
    visibleOnMap = b._southWest.lat <= o.lat_lng[0] && b._northEast.lat >= o.lat_lng[0] // (check if object lies between latitude 'west' & latitude 'east')
    visibleOnMap = visibleOnMap && b._northEast.lng >= o.lat_lng[1] && b._southWest.lng <= o.lat_lng[1] // (check if object lies between longitude 'north' & longitude 'south')

    return visibleOnMap;
  }

  // mapChange :: Object { _northEast: {lat: Float, lng: Float}, _southWest: {lat: Float, lng: Float} } -> void
  mapChanged(boundaries) {
    // Check input
    check(boundaries, L.LatLngBounds)
    // Set new state
    this.setState({ mapBoundaries: boundaries })
  }

  render() {
    const { showMap, showList, adminmode, classes } = this.props;
    
    console.log('render redirect %s', this.state.redirect);
    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} push/>);
    }
    
    return (
      <div className={classes.root}>
        { showMap ?
            <div className={classes.mapcontainer}>
              <LocationsMap
                objects={this.props.objects}
                settings={this.props.settings}
                mapChanged={this.mapChanged.bind(this)} />
            </div>
          :
            null
        }
       { showList ?
            <div className={classes.listcontainer}>
              <ObjectList adminmode={this.props.adminmode}
                objects={this.props.objects}
                newObjectHandler={adminmode==true ? this.newObjectHandler.bind(this): undefined }
                />
            </div>
          :
            null
        }
      </div>
    );
  }
}

var s = {
  base: {
    padding: '10px 20px'
  },
  paragraph: {
    padding: '0 20px'
  }
}

OverviewPage.propTypes = {
  settings: PropTypes.any,
  objects:  PropTypes.any,
  showMap: PropTypes.bool,
  showList: PropTypes.bool,
  adminmode: PropTypes.bool,
};

OverviewPage.defaultProps = {
  settings: undefined,
  objects: undefined,
  showMap: false,
  showList: true,
  adminmode: false
}

export default withTracker((props) => {
  Meteor.subscribe('settings', false);
  Meteor.subscribe('objects');

  let settings = getSettingsClientSide();
  if(!settings) {
    console.log("no settings available");
    return {};
  } else {
    console.log("got settings %o", settings);
  }
  
  let objects = Objects.find({}, { sort: {title: 1} }).fetch();
  
  return {
    settings: getSettingsClientSide(),
    objects,
    ...props
  };
})(withStyles(styles)(OverviewPage));
