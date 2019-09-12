import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { Accounts } from 'meteor/accounts-base';

// Import templates
import FeedbackWidgetComponent from '/imports/client/components/FeedbackWidget.jsx';

class FeedbackWidget extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <FeedbackWidgetComponent />
    )
  }

}

FeedbackWidget.propTypes = {
}

export default FeedbackWidget;
