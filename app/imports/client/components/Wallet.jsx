import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'no-wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent',
    zIndex: 1,
  },
  listitem: {
    marginLeft: '5vmin',
    marginTop: '5vmin'
  }
});

class Wallet extends Component {

  constructor(props) {
    super(props);
    
    this.state = {balance: 0};
  }
  
  enterPassphrase() {
    
  }
  
  clearPassphrase() {
    
  }

  render() {
    const {wallet, classes} = this.props;
    
    if(wallet==undefined) return (null);
    
    return (
      <div className={classes.root}>
        <Typography variant="subtitle2" className={classes.listitem}>passphrase: {wallet.passphrase}</Typography>
        <Typography variant="subtitle2" className={classes.listitem}>private key: {wallet.privateKey}</Typography>
        <Typography variant="subtitle2" className={classes.listitem}>public key: {wallet.publicKey}</Typography>
        <Typography variant="subtitle2" className={classes.listitem}>address: {wallet.address}</Typography>
        <Typography variant="subtitle2" className={classes.listitem}>balance: {this.state.balance}</Typography>
      </div>
    );
  }
}

Wallet.propTypes = {
  wallettype: PropTypes.object,
  providerurl: PropTypes.string,
};

Wallet.defaultProps = {
  wallet: undefined,
  providerurl: '',
}

export default withStyles(styles)(Wallet);
