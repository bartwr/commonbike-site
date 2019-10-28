import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

import {doCreateAccount} from '../../api/lisk-blockchain/client/create-account.js';

// Import components
import Wallet from '/imports/client/components/Wallet';
// import { clientStorage } from 'ClientStorage';
import { ReactiveVar }   from 'meteor/reactive-var';
import { ClientStorage } from 'ClientStorage';

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

const persistentReactive = (name, initial = false) => {
  let reactive;
  
  compareWallets = (w1, w2) => {
    return (w1.passphrase==w2.passphrase&&w1.privateKey==w2.privateKey&&
             w1.publicKey==w2.publicKey&&w1.address==w2.address);
  }

  if (ClientStorage.has(name)) {
    reactive = new ReactiveVar(ClientStorage.get(name), compareWallets);
  } else {
    ClientStorage.set(name, initial);
    reactive = new ReactiveVar(initial, compareWallets);
  }
 
  reactive.set = function (newValue) {
    console.log("reactive set to %o", newValue)
    let oldValue = reactive.curValue;
    if ((reactive.equalsFunc || ReactiveVar._isEqual)(oldValue, newValue)) {
      console.log("no changes detected")
      return;
    }
    reactive.curValue = newValue;
    ClientStorage.set(name, newValue);
    reactive.dep.changed();
  };
 
  return reactive;
};

var wallet = persistentReactive("user-wallet", cBlankWallet);

class UserWallet extends Component {
  constructor(props) {
    super(props);
  }
  
  clearAccount() {
    const renterAccount = {"passphrase":"","privateKey":"","publicKey":"","address":""}
    wallet.set(renterAccount)
  }

  setDefaultAccount() {
    const renterAccount = {"passphrase":"bridge tail scissors ahead crunch easily wild play face parent between perfect","privateKey":"0c6e2f5d58d7f9c52d287fac34d8e2a02a932ebd357daf065d599c2e0c1a2cca4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91","publicKey":"4ccc735fa41359a4d5ebf13057d70c67ce0cee68415e5b597db34d6b2c8d9a91","address":"4271028317684991679L"}
    wallet.set(renterAccount)
  }

  createNewAccount = async () => {
    const newAccount = await doCreateAccount()
    wallet.set(newAccount)
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

UserWallet.propTypes = {
  wallet: PropTypes.object
};

UserWallet.defaultProps = {
  wallet: undefined
}

export default withTracker((props) => {
  return {
    title: 'USER WALLET',
    wallet: wallet.get(),
  };
})(withStyles(styles)(UserWallet));
