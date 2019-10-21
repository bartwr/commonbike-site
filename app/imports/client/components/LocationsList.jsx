import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Link } from 'react-router';
import { RedirectTo } from '/client/main'

// Import models
import { Locations } from '/imports/api/locations.js';

// Import components
import LocationBlock from '/imports/client/containers/LocationBlock';
import RaisedButton from '/imports/client/components/RaisedButton';

/**
 *  LocationList
 *
 * @param {Object} locations
 * @param {Boolean} isEditable
 */
class LocationList extends Component {

  constructor(props) {
    super(props);
  }

  newLocation() {
    if(this.props.newLocationHandler) {
      this.props.newLocationHandler();
    }
  }

  render() {
    self = this;
    return (
      <div style={s.base}>
        <div style={Object.assign({display: 'none'}, this.props.isEditable && {display: 'block'})}>

          <p style={s.paragraph}>
            On this page you can manage the locations.
          </p>

          { self.props.canCreateLocations ?
            <p style={s.paragraph}>Click on <b>New location</b> or <b><i>edit at title</i></b>.</p>
            :
            <p style={s.paragraph}><b><i>change a title</i></b>.</p>
          }

          { self.props.canCreateLocations ?
            <RaisedButton onClick={this.newLocation.bind(this)}>New lacation</RaisedButton>
            :
            <div />
          }
        </div>

        {this.props.locations.map((location) =>  <LocationBlock
                              key={location._id}
                              item={location}
                              isEditable={self.props.isEditable}
                              onClick={self.props.clickItemHandler} />)}

      </div>
    );
  }

}

var s = {
  base: {
    padding: '10px 20px',
    textAlign: 'center'
  },
  paragraph: {
    padding: '0 20px'
  }
}

LocationList.propTypes = {
  locations: PropTypes.array,
  isEditable: PropTypes.any,
  canCreateLocations: PropTypes.any,
  clickItemHandler: PropTypes.any,
  newLocationHandler: PropTypes.any,
};

LocationList.defaultProps = {
  canCreateLocations: false,
  isEditable: false
}

export default LocationList
