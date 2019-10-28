import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

// Import models
import { Objects } from '/imports/api/objects.js';

// Import components
import ObjectDetailsComponent from '/imports/client/components/ObjectDetailsComponent';

class ObjectDetailsOld extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ObjectDetailsComponent
        currentUser={this.props.currentUser}
        object={this.props.object}
        // checkedIn={this.props.checkedIn}
        isEditable={this.props.isEditable} />
    );
  }
}

ObjectDetailsOld.propTypes = {
  isEditable: PropTypes.any,
  object: PropTypes.object,
  onClickHandler: PropTypes.any
};

ObjectDetailsOld.defaultProps = {
  isEditable: false,
  object: undefined,
}

export default withTracker((props) => {
    Meteor.subscribe('objects');
    
    let object = Objects.findOne({_id: props.objectId});

    console.log("found object %o", object);

    // Return variables for use in this component
    return {
      currentUser: Meteor.user(),
      object: object
    };
})(ObjectDetailsOld);
