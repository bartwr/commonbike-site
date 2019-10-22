import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

// Import models
import { Settings } from '/imports/api/settings.js';
import { Objects, createObject } from '/imports/api/objects.js';

// Import components
import ObjectList from '/imports/client/components/ObjectList';
import LocationsMap from '/imports/client/components/LocationsMap';

class LocationList extends Component {

  constructor(props) {
    super(props);

    this.state = { mapBoundaries: null }
  }

  newObjectHandler() {
    var newName = prompt('Enter a name for the new bike');

    if(newName){
      Meteor.call('objects.insert', createObject(newName), this.newObjectAdded.bind(this));
    }
  }
  newObjectAdded(error, result) {
    // Re-subscribe is necessary: otherwise the location does not show up
    // in the provider's location list without a full page reload (there is no
    // subscription relation with the user table that maintains the list
    // of managed locations per user)
    Meteor.subscribe('objects', this.props.isEditable);

    alert('The bike has been added to the system');
  }

  /*
    getVisibleObjectsOnly :: ? -> ?

    Get only the objects inside the maps boundaries.
  */
  getVisibleObjectsOnly(object) {

    // Every object needs a lat/lng
    if( ! object.state.lat_lng)
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

  getMap() {
    if(!this.props.isEditable) {
      return (
        <LocationsMap
          objects={this.props.objects}
          settings={this.props.settings}
          mapChanged={this.mapChanged.bind(this)} />
      );
    } else {
      return (<div />);
    }
  }

  render() {
    return (
      <div>
       { this.getMap()}
       <ObjectList isEditable={this.props.isEditable}
        objects={this.props.objects}
        newObjectHandler={this.newObjectHandler.bind(this)}
        canCreateObjects={this.props.cancreateobjects} />
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

LocationList.propTypes = {
  isEditable: PropTypes.any,
  newLocation: PropTypes.any,
//  locHandle:  PropTypes.any
};

LocationList.defaultProps = {
  isEditable: false,
  newObject: null
  //locHandle: null
}

export default createContainer((props) => {
  Meteor.subscribe('settings', false);
  Meteor.subscribe('objects');

  const user=Meteor.user();
  let cancreateobjects = false;
  if(user&&user.profile&&user.profile.cancreateobjects) {
    cancreateobjects = user.profile.cancreateobjects || false;
  }
  
  let objects = Objects.find({}, { sort: {title: 1} }).fetch();
  console.log("Locationsoverview - objects: %o", objects);

  return {
    currentUser: Meteor.user(),
    objects,
    settings: Settings.findOne({}),
    cancreateobjects
  };
}, LocationList);
