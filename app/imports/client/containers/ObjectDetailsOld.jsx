import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

// Import models
// import { Locations } from '/imports/api/locations.js';
import { Objects } from '/imports/api/objects.js';

// Import components
import ObjectDetailsComponent from '/imports/client/components/ObjectDetailsComponent';

/**
 *  ObjectDetailsOld
 *
 * @param {Object} locations
 * @param {Boolean} isEditable
 */
class ObjectDetailsOld extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ObjectDetailsComponent
        currentUser={this.props.currentUser}
        location={this.props.location}
        object={this.props.object}
        checkedIn={this.props.checkedIn}
        isEditable={this.props.isEditable} />
    );
  }
}

// Define what propTypes are allowed
ObjectDetailsOld.propTypes = {
  isEditable: PropTypes.any,
  locations: PropTypes.array,
  onClickHandler: PropTypes.any
};

// Set default prop values
ObjectDetailsOld.defaultProps = {
  isEditable: false,
  object: {},
  location: {}
}

export default withTracker((props) => {
    // Subscribe to models
    Meteor.subscribe('locations', props.isEditable);
    Meteor.subscribe('objects');

    // Get object (bike) information
    let object = Objects.find({_id: props.objectId}).fetch()[0];

    // Return variables for use in this component
    return {
      currentUser: Meteor.user(),
      object: object,
      location: object ? Locations.find({_id: object.locationId}).fetch()[0] : {}
    };
})(ObjectDetailsOld);
