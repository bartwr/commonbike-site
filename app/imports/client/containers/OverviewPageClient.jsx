import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import Redirect from 'react-router/Redirect'
import Typography from '@material-ui/core/Typography';

import { Settings, getSettingsClientSide } from '/imports/api/settings.js';
// import { Objects } from '/imports/api/objects.js';

import LocationsMap from '/imports/client/components/LocationsMap';
import ObjectBlockClient from '/imports/client/containers/ObjectBlockClient';

import {getAllBikes} from '/imports/api/lisk-blockchain/methods/get-bikes.js';
import { getObjectStatus } from '/imports/api/lisk-blockchain/methods/get-object-status.js';

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  listroot: {
    flex:  '1 1 auto',
    height: '20vh',
    width: '90%',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start'
  },
  mapcontainer: {
    flex:  '1 0 auto',
    height: '20vh',
    width: '90%'
  },
  title: {
    color: 'white'
  }
});

class OverviewPageClient extends Component {

  constructor(props) {
    super(props);
    
    let timer = setTimeout(this.updateObjects.bind(this), 1000);  // first check after 1 second
    // let timer=false;
    this.state = { redirect: false, mapBoundaries: null, timer: timer, objects: [] }
  }
  
  updateObjectState = async (object) => {
    // console.log(object.id)
    let status = await getObjectStatus(this.props.settings.bikecoin.provider_url, object.id);
    // console.log("status for %s is %o", object.id, status.asset);
    if(false!=status) {
      this.setState((prevstate) => {
        return { ['asset-' + object.id]:status.asset}});
    } else {
      this.setState((prevstate) => {
        return { ['asset-' + object.id]:false}});
    }
  }
  
  componentWillUnmount() {
    if(this.state.timer!=false) {
      clearTimeout(this.state.timer);
    }
  }

  async updateObjects() {
    let newObjects = await getAllBikes(this.props.settings.bikecoin.provider_url);
    
    newObjects.forEach(this.updateObjectState.bind(this));
    
    let newstate = {
      objects: newObjects
    }
    newObjects.forEach((object)=>{
      newstate['asset-' + object.id]=false
    });
    
    // console.log(newstate);
    
    // this.state.objects.forEach((existingobject)=>{
    //   if
    // })
    
    // console.log("got new objects %o", newObjects)

    this.setState((prevstate)=>{
      return {
        objects: newObjects,
        timer: setTimeout(this.updateObjects.bind(this), 2000)
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

  // mapChange :: Object { _northEast: {lat: Float, lng: Float}, _southWest: {lat: Float, lng: Float} } -> void
  mapChanged(boundaries) {
    // Check input
    check(boundaries, L.LatLngBounds)
    // Set new state
    this.setState({ mapBoundaries: boundaries })
  }

  handleObjectSelection = (object) => {
    this.setState({redirect: '/object/'+object.id});
  }
  
  renderObjectBlock(object) {
    return (
      <ObjectBlockClient key={'key-'+object.id}
           object={object}
           asset={this.state['asset'+object.id]}
           selecthandler={this.handleObjectSelection.bind(this)} />
    )
  }
  
  render() {
    const { showMap, showList, classes } = this.props;
    
    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} push/>);
    }
    
    // console.log("state: %o", this.state)
    
    return (
      <div className={classes.root}>
        { showMap ?
            <div className={classes.mapcontainer}>
              <LocationsMap
                objects={this.state.objects}
                settings={this.props.settings}
                mapChanged={this.mapChanged.bind(this)} />
            </div>
          :
            null
        }
        {
          showList ?
            <div className={classes.listroot}>
               { undefined!=this.state.objects && this.state.objects.length>0 ?
                      this.state.objects.map(this.renderObjectBlock.bind(this))
                    :
                      <Typography variant='h4' className={classes.title}>No Bicycles Available</Typography>
                }
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

OverviewPageClient.propTypes = {
  settings: PropTypes.any,
  objects:  PropTypes.any,
  showMap: PropTypes.bool,
  showList: PropTypes.bool,
};

OverviewPageClient.defaultProps = {
  settings: undefined,
  objects: undefined,
  showMap: false,
  showList: true,
}

export default withTracker((props) => {
  Meteor.subscribe('settings', false);
  // Meteor.subscribe('objects');

  let settings = getSettingsClientSide();
  if(!settings) {
    return {};
  }
  
  // let objects = Objects.find({}, { sort: {title: 1} }).fetch();
  
  return {
    settings: getSettingsClientSide(),
    // objects,
    ...props
  };
})(withStyles(styles)(OverviewPageClient));
