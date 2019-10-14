import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import SignUpButton from '/imports/client/components/SignUpButton.jsx';
import Hr from '/imports/client/components/Hr.jsx';

class Join extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.flex).style.display = 'flex';
  }

  render() {
    return (
      <div style={s.base}>

        <h1>Lisk bike: Where do you want to cycle?</h1>

        <p>
           Placeholder for: Promotional text.
        </p>

        

        <SignUpButton />

        <h2>How does it work?</h2>

        <p>
          Placeholder for: explinatory text.
        </p>

        <h2>Open source?</h2>

        <p>
        Placeholder for: explinatory text.
        </p>

        <h2>Join us!</h2>

        <p>
        Placeholder for: explinatory text.
        </p>

        <div ref="flex" style={{width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', height: '120px'}}>
          
          
          
        </div>

        <Hr />

        <p>
          <b>For more information:  <a href="http://commonbike.com/" target="_blank">commonbike.com</a></b>
        </p>

      </div>
    );
  }
}

var s = {
  base: {
    maxWidth: '400px',
    margin: '0 auto',
    textAlign: 'left',
  },
}

Join.propTypes = {
};

export default createContainer((props) => {
  return {
    currentUser: Meteor.user()
  };
}, Join);
