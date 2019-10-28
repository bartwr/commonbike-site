import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

// Import components
import '/imports/api/users.js'
import AdminUsersListComponent from '/imports/client/components/AdminUsersList';

class AdminUsersList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AdminUsersListComponent users={this.props.users} isEditable={this.props.isEditable}  />
    );
  }
}

AdminUsersList.propTypes = {
  users: PropTypes.array,
  isEditable: PropTypes.any
};

AdminUsersList.defaultProps = {
  users: [],
  isEditable: false,
}

export default withTracker((props) => {
  Meteor.subscribe('allusers');

  var users = Meteor.users.find({}, { sort: {title: 1} }).fetch();

	return {
  	users: users
	};
})(AdminUsersList);
