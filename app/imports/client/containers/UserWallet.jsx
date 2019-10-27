import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

// Import components
import Wallet from '/imports/client/components/Wallet';

class UserWallet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Wallet
        wallettype='user'
        providerurl={ this.props.providerurl }
        address={ this.props.address } />
    );
  }
}

UserWallet.propTypes = {
  providerurl: PropTypes.string,
  address: PropTypes.string
};

UserWallet.defaultProps = {
  providerurl: '',
  address: ''
}

export default withTracker((props) => {
  if(!Meteor.user()) {
    return (<div />);
  }

  var user = Meteor.user()
  var address = user.profile.wallet.address;
  var providerurl = "https://ropsten.infura.io/sCQUO1V3FOo";

  console.log("userwallet: ", address, providerurl);

  return {
    address: address,
    providerurl: providerurl
  };
})(UserWallet);
