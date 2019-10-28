import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
const { defaultProfileName, getSettingsClientSide } = require('/imports/api/settings.js');

import {doCreateAccount} from '../../api/lisk-blockchain/client/create-account.js';

// Import components
import Wallet from '/imports/client/components/Wallet';
// import { clientStorage } from 'ClientStorage';

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
  }
});

const cBlankWallet = {
  passphrase: '',
  privateKey: '',
  publicKey: '',
  address: ''
}

class SystemWallet extends Component {
  constructor(props) {
    super(props);
  }
  
  clearAccount() {
    const walletdata = {
      "bikecoin.wallet.passphrase":"",
      "bikecoin.wallet.privateKey":"",
      "bikecoin.wallet.publicKey":"",
      "bikecoin.wallet.address":""
    }
    
    Meteor.call('settings.applychanges', this.props.settings._id, walletdata);
  }

  setDefaultAccount() {
    const walletdata = {
      "bikecoin.wallet.passphrase":"bridge tail scissors ahead crunch easily wild play face parent between perfect",
      "bikecoin.wallet.privateKey":"0c6e2f5d58d7f9c52d287fac34d8e2a02a932ebd357daf065d599c2e0c1a2cca4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91",
      "bikecoin.wallet.publicKey":"4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91",
      "bikecoin.wallet.address":"4271028317684991679L"}
    Meteor.call('settings.applychanges', this.props.settings._id, walletdata);
  }

  createNewAccount = async () => {
    const newData = await doCreateAccount()
    const walletdata = {
      "bikecoin.wallet.passphrase":newData.passphrase,
      "bikecoin.wallet.privateKey":newData.privateKey,
      "bikecoin.wallet.publicKey":newData.publicKey,
      "bikecoin.wallet.address":newData.address}
    Meteor.call('settings.applychanges', this.props.settings._id, walletdata);
  }

  render() {
    const {classes, wallet, title } = this.props;
    
    return (
      <div className={classes.root}>
        <Wallet wallet={wallet}
          title={title}
          clearAccountHandler={this.clearAccount.bind(this)}
          defaultAccountHandler={this.setDefaultAccount.bind(this)}
          createAccountHandler={this.createNewAccount.bind(this)} />
      </div>
    );
  }
}

SystemWallet.propTypes = {
  settings: PropTypes.object,
  title: PropTypes.string,
  wallet: PropTypes.object
};

SystemWallet.defaultProps = {
  settings: undefined,
  title: '',
  wallet: undefined
}

export default withTracker((props) => {
  Meteor.subscribe('settings');
  
  let settings = getSettingsClientSide();
  let wallet = cBlankWallet
  if(settings!=undefined) {
    wallet = settings.bikecoin.wallet;
  }
  
  console.log("system settings %o", settings);
  console.log("system wallet %o", wallet);
  
  return {
    settings,
    title: 'SYSTEM WALLET',
    wallet,
  };
})(withStyles(styles)(SystemWallet));
