import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

// Import components
import Wallet from '/imports/client/components/Wallet';
import { Settings } from '/imports/api/settings.js';
// import { clientStorage } from 'ClientStorage';
import { ClientStorage } from 'ClientStorage';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent'
  },
  dialog: {
    width: '60vw',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '5vmin'
  },
  actionbutton: {
    width: '50vw',
    height: '30px',
    margin: '1vmin'
  }
});

class UserWallet extends Component {
  constructor(props) {
    super(props);
  }
  
  setDefaultAccount() {
    const renterAccount = {"passphrase":"bridge tail scissors ahead crunch easily wild play face parent between perfect","privateKey":"0c6e2f5d58d7f9c52d287fac34d8e2a02a932ebd357daf065d599c2e0c1a2cca4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91","publicKey":"4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91","address":"4271028317684991679L"}
    ClientStorage.set("user-wallet", renterAccount)
    
    alert("refresh page please");
  }

  render() {
    const {classes} = this.props;

    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <Wallet
            wallet={this.props.wallet}
            providerurl={ this.props.providerurl }
            address={ this.props.address } />
          <Button variant="contained" style={{margin: '5vmin'}} onClick={this.setDefaultAccount.bind(this)}>SET DEFAULT</Button>
        </div>
      </div>
    );
  }
}

UserWallet.propTypes = {
  providerurl: PropTypes.string,
  wallet: PropTypes.object
};

UserWallet.defaultProps = {
  providerurl: '',
  wallet: undefined
}

export default withTracker((props) => {
  Meteor.subscribe('settings');

  const settings = Settings.findOne();
  if(!settings) {
    return (<div />);
  }
  
  let wallet = {
    passphrase: '<enter passphrase here>',
    privateKey: '',
    publicKey: '',
    address: ''
  }
  
  // const clientStorage = ClientStorage.clientStorage;
  if(ClientStorage.has("user-wallet")==false) {
    ClientStorage.set("user-wallet", wallet)
  }
  
  wallet = ClientStorage.get("user-wallet");
  console.log('got a user wallet: %o', wallet);

  return {
    wallet,
    providerurl: settings.bikecoin.providerurl
  };
})(withStyles(styles)(UserWallet));
