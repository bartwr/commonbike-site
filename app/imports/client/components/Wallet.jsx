import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {doGetAccount} from '../../api/lisk-blockchain/methods/get-account.js';
const transactions = require('@liskhq/lisk-transactions');

const styles = theme => ({
  outer: {
    maxWidth: '80vw',
    minHeight: '80vh',
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
  inner: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'no-wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent',
    zIndex: 1,
    padding: '4vmin'
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginTop: '1.5vmin',
    marginBottom: '1vmin',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  balance: {
    textAlign: 'center',
    width: '100%',
    marginTop: '1vmin',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 'bold'
  },
  listitemheader: {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginTop: '1.5vmin',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  listitem: {
    textAlign: 'center',
    width: '100%',
    marginTop: '1vmin',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  listitempassphrase: {
    textAlign: 'center',
    width: '100%',
    marginTop: '1vmin',
    whiteSpace: 'wrap',
    overflow: 'wrap',
    textOverflow: 'wrap'
  },
  actionbutton: {
    minWidth: '50vmin',
    height: '30px',
    margin: '2vmin',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});

class Wallet extends Component {
  constructor(props) {
    super(props);
    
    this.state = {balance: '-', timer: false};
  }
  
  componentDidMount() {
    if(this.props.showbalance==true) {
      this.getBalance();
    } else {
      'skip first getbalance call'
    }    
  }
  
  componentWillUnmount() {
    if(this.state.timer!=false) {
      clearTimeout(this.state.timer);
    }
  }
  
  getBalance = async () => {
    const {wallet, updatedelay} = this.props;
    try {
      if(wallet&&wallet.address!='') {
        let account = await doGetAccount(wallet.address);
        if(false!=account) {
          this.setState((prevstate)=>{
            return {
              balance: account.length>0 ?
                transactions.utils.convertBeddowsToLSK(account[0].balance)
                :
                'account does not exist yet'
            }
          });
        }
      } else {
        this.setState((prevstate)=>{
            return {
              balance: '-'
            }
          });
      }
    } catch(ex) {
      console.error(ex.message);
    } finally {
      this.setState((prevstate)=>{return {
        timer: setTimeout(this.getBalance.bind(this), updatedelay)
      }});
    }
  }
  
  render() {
    const {classes, wallet, showbalance, title,
           clearAccountHandler, defaultAccountHandler, createAccountHandler } = this.props;
    
    if(wallet==undefined) return (null);
    
    return (
      <div className={classes.outer}>
        <div className={classes.inner} style={{textOverflow: 'ellipsis'}}>
          { title != '' ?
              <Typography variant="h5" className={classes.title}>{title}</Typography>
            :
              <Typography variant="h5" className={classes.listitemheader}>address</Typography>
          }
          <Typography noWrap variant="subtitle1" className={classes.listitem}>{wallet.address}</Typography>
          { showbalance == true ?
              <Typography variant="h5" className={classes.listitemheader}>balance</Typography>
            :
              null
          }
          { showbalance == true ?
              <Typography variant="h5" className={classes.listitem}>{this.state.balance}</Typography>
            :
              null
          }
          <Typography noWrap variant="subtitle1" className={classes.listitemheader}>passphrase</Typography>
          <Typography wrap variant="subtitle1" className={classes.listitempassphrase}>{wallet.passphrase}</Typography>
          <Typography noWrap variant="subtitle1" className={classes.listitemheader}>private key</Typography>
          <Typography noWrap variant="subtitle1" className={classes.listitem}>{wallet.privateKey}</Typography>
          <Typography noWrap variant="subtitle1" className={classes.listitemheader}>public key</Typography>
          <Typography noWrap variant="subtitle1" className={classes.listitem}>{wallet.publicKey}</Typography>
          { clearAccountHandler != undefined ?
              <Button variant="contained" className={classes.actionbutton} onClick={this.props.clearAccountHandler.bind(this)}>CLEAR ACCOUNT</Button>
            :
              null
          }
          { defaultAccountHandler != undefined ?
              <Button variant="contained" className={classes.actionbutton} onClick={this.props.defaultAccountHandler.bind(this)}>USE DEFAULT ACCOUNT</Button>
            :
              null
          }
          { createAccountHandler != undefined ?
              <Button variant="contained" className={classes.actionbutton} onClick={this.props.createAccountHandler.bind(this)}>CREATE NEW ACCOUNT</Button>
            :
              null
          }
        </div>
      </div>
    );
  }
}

Wallet.propTypes = {
  title: PropTypes.string,
  wallettype: PropTypes.object,
  showbalance: PropTypes.bool,
  updatedelay: PropTypes.number,   // delay between balance updates (ms)
  clearAccountHandler: PropTypes.any,
  defaultAccountHandler: PropTypes.any,
  createAccountHandler: PropTypes.any,
};

Wallet.defaultProps = {
  title: '',
  wallet: undefined,
  showbalance: true,
  updatedelay: 2000, // milliseconds
  clearAccountHandler: undefined,
  defaultAccountHandler: undefined,
  createAccountHandler: undefined,
}

export default withStyles(styles)(Wallet);
