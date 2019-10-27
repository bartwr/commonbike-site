import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { Settings } from '/imports/api/settings.js';
import L from 'leaflet'
import 'leaflet-search'

import './Leaflet.EasyButton.js';

import { Objects } from '/imports/api/objects.js';

class LocationsMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      map: undefined,
      watchId : undefined,
      trackingMarkersGroup: undefined,
      objectMarkersGroup: undefined,
    }
  }

  formatJSON(rawjson) {
    let json = {}, key, loc, disp = [];

    for(var i in rawjson) {
      key = rawjson[i].formatted_address;
      loc = L.latLng( rawjson[i].geometry.location.lat(), rawjson[i].geometry.location.lng() );
      json[key] = loc;// key,value format
    }

    return json;
  }

  componentDidMount() {
    // Init map
    let map = L.map('mapid', {
      zoomControl: true// Hide zoom buttons
    });

    // Start geocoding
    let geocoder = new google.maps.Geocoder();
    let googleGeocoding = (text, callResponse) => geocoder.geocode({address: text}, callResponse);

    // Now add the search control
    map.addControl( new L.Control.Search({
      position: 'topleft',
      sourceData: googleGeocoding,
      formatData: this.formatJSON,
      markerLocation: true,
      autoType: false,
      autoCollapse: true,
      minLength: 2
    }) );

    // Add a leyer for search elements
    let markersLayer = new L.LayerGroup();
    map.addLayer(markersLayer);

    map.setView(this.props.startLocation, this.props.startZoom);

    map.on('moveend', this.mapChanged.bind(this));
    map.on('zoomend', this.mapChanged.bind(this));

    this.props.mapChanged ? this.props.mapChanged(map.getBounds()) : null

    // Now set the map view
    map.setView(this.props.startLocation, this.props.startZoom);

    // Le easy button
    L.easyButton( '<img src="'+ s.images.hier + '" style="width:22px;height:22px" />', this.toggleTrackUser.bind(this) ).addTo(map);

    var objectMarkersGroup = L.featureGroup().addTo(map);
    objectMarkersGroup.on("click", function (event) {
        var clickedMarker = event.layer;
        RedirectTo('/bike/details/' + clickedMarker.bikeLocationId);
    }.bind(this));

    var trackingMarkersGroup = L.featureGroup().addTo(map);   // no tracking marker yet!
    this.toggleTrackUser()

    this.setState(prevState => ({ map: map,
                                  trackingMarkersGroup: trackingMarkersGroup,
                                  objectMarkersGroup: objectMarkersGroup,
                                }));

    setTimeout(this.mapChanged,1000);
  }

  initializeMap() {
    if ( ! this.props.settings)
      return;

    var settings = this.props.settings;

    if (settings.mapbox.userId.startsWith('<')) {
      console.warn(settings.mapbox.userId)
      return
    }

    // https://www.mapbox.com/api-documentation/#retrieve-a-static-map-image
    // const url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
    const url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}'

    L.tileLayer(url, {
      attribution: '<a href="http://mapbox.com">Mapbox</a> | <a href="http://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 22,
      id: settings.mapbox.style,  // https://www.mapbox.com/studio/tilesets/
      accessToken: settings.mapbox.userId
    }).addTo(this.state.map);

  }

  initializeObjectsMarkers() {
    console.log("locationsmap.initializeObjectsMarkers objects %o", this.props.objects)

    if(!this.props.objects) return;
    
  // create custom icon
    var bikeIcon = L.icon({
        iconUrl: '/files/ObjectDetails/marker.svg',
        iconSize: ['32px', '32px'], // size of the icon
        });

    this.props.objects.map((object) => {
      if(object.state.lat_lng) {
        var marker = L.marker(object.state.lat_lng, {icon: bikeIcon, zIndexOffset: -900}); // bike object marker
        marker.bikeLocationId = object._id;
        // markers.push(marker); // .bindPopup(location.title)
        this.state.objectMarkersGroup.addLayer(marker);
      }
    });
  }

  mapChanged(e) {
    // Send changed trigger to parent
    if(!this.state) return;
    if(!this.state.map) return;

    this.props.mapChanged ? this.props.mapChanged(this.state.map.getBounds()) : null
  }

  // ----------------------------------------------------------------------------
  // user location tracking related functions
  // ----------------------------------------------------------------------------
  trackSuccess(pos) {
    console.log('trackSuccess');

    const {coords} = pos
    let newLatLng = [coords.latitude, coords.longitude]

    var trackingMarkersGroup = this.state.trackingMarkersGroup;
    var marker = undefined;

    if (trackingMarkersGroup.getLayers().length==0) {
       // create a new tracking marker
      marker = L.circleMarker([0,0]);
      marker.zIndexOffset = -800; // use marker/tracking
      marker.bindPopup("<b>You are here</b>");
      trackingMarkersGroup.addLayer(marker)
    } else {
      marker = trackingMarkersGroup.getLayers()[0];
    }

    marker.setLatLng(newLatLng);

    if(!this.state.map.getBounds().contains(newLatLng)) {
      this.state.map.setView(newLatLng);
    }

    // for now: tracking is switched off after obtaining a single valid location
    // TODO:implement a toggle button for continuous tracking later on
    navigator.geolocation.clearWatch(this.state.watchId);
    this.setState(prevState => ({ watchId: undefined}));
  }

  trackError(err) {
    // alert('ERROR(' + err.code + '): ' + err.message);
    console.warn('ERROR(' + err.code + '): ' + err.message)
  }

  toggleTrackUser() {
    if(this.state.watchId==undefined) {
      let options = {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0
      }

      var newid = navigator.geolocation.watchPosition(this.trackSuccess.bind(this), this.trackError.bind(this), options)
      this.setState(prevState => ({ watchId: newid}));
    } else {
      navigator.geolocation.clearWatch(this.state.watchId);
      this.setState(prevState => ({ watchId: undefined}));
    }
  }

  // ----------------------------------------------------------------------------
  // rendering
  // ----------------------------------------------------------------------------
  render() {
    if(this.state.map) {
      this.initializeMap();
      // this.initializeLocationsMarkers();
      this.initializeObjectsMarkers();
    }

    return (
      <div id='mapid' style={Object.assign({}, s.base, {width: this.props.width, height: this.props.height, maxWidth: '100%'})} />
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    background: '#e0e0e0',
    textAlign: 'right'
  },
  images: {
    hier: '/files/IconsButtons/compass-black.svg' // 'https://einheri.nl/assets/img/home_files/compass-black.svg'
  },
  searchForLocation: {
    position: 'relative',
    zIndex: 90000,
    display: 'block',
    width: 'calc(100vw - 40px)',
    margin: '20px auto',
    borderRadius: 0,
    border: 'none',
    height: '50px',
    lineHeight: '50px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)'
  }
}

LocationsMap.propTypes = {
  width: PropTypes.any,
  height: PropTypes.any,
  locations: PropTypes.array,
  objects: PropTypes.array,
  mapboxSettings: PropTypes.object,
  mapChanged: PropTypes.func,
  clickItemHandler: PropTypes.any,
  startLocation: PropTypes.array,
  startZoom: PropTypes.number
};

LocationsMap.defaultProps = {
  width: '100vw',
  height: '50vh',
  clickItemHandler: '',
  startLocation: [52.088304, 5.107243],   // LCU
  startZoom: 15
}

export default LocationsMap;
