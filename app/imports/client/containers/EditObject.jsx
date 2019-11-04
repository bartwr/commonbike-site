import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';
import { RedirectTo } from '/client/main'

import EditFields from '/imports/client/components/EditFields';
import {doCreateAccount} from '/imports/api/lisk-blockchain/methods/create-account.js';

import { Objects, createObject } from '/imports/api/objects.js';
const { getSettingsClientSide } = require('/imports/api/settings.js');

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent'
  },
  dialog: {
    width: '90vw',
    height: 'auto',
    minHeight: '60vh',
    padding: '4vmin',
    paddingLeft: '2vmin',
    paddingRight: '2vmin',
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
});

class EditObject extends Component {

  constructor(props) {
    super(props);
    
    this.state = { openpanel: 'exp-contr-settings-lock' }
  }
  
  componentDidMount() {
    // get the settings from the blockchain here
  }
  
  loadSettingsFromBlockchain() {
    // ask the Blockchain to send the latest settings
  }

  sendSettingsToBlockchain() {
    Meteor.call('objects.registeronblockchain', this.props.object._id, this.processSendSettingsToBlockchainResult.bind(this));
  }
  
  processSendSettingsToBlockchainResult(error, result) {
    if(error) {
      alert('unable to register this object on the blockchain')
      return;
    }
    
    if(!result.result) {
      alert('unable to register this object on the blockchain: ' + result.message);
      return;
    }
  }

  updateLocalSettings(changes) {
    // update the object settings that are backend specific in the local mongodb
    Meteor.call('objects.applychanges', this.props.object._id, changes);
    return true;
  }

  handleExpansion = (panelId, expanded) => {
    // console.log('objectsettings - panel %s changed to %s ',panelId, expanded?'open':'closed');
    this.setState({ openpanel: expanded ? panelId: 'none' });
  };

  getLockFields() {
    const {object} = this.props;
    
    var lockTypes = [ { _id: 'concox-bl10', title: 'Concox BL10 e-lock'},
                      { _id: 'open-elock', title: 'Open e-lock'},
                    	{ _id: 'plainkey', title: 'Key'}];
    
    let fields=[];
    
    if(object.lock.locktype=='open-elock') {
      fields = [
        {
            fieldname: 'lock.locktype',
            fieldvalue: object.lock.locktype,
            controltype: 'combo',
            label: 'Type of Lock',
            options: lockTypes
        },
        {
            fieldname: 'lock.settings.elockid',
            fieldvalue: object.lock.settings.elockid,
            controltype: 'text',
            label: 'lock id (IMEI)'
        },
        {
            fieldname: 'lock.settings.code',
            fieldvalue: object.lock.settings.code,
            controltype: 'text',
            label: 'code'
        }
      ]
    } else if(object.lock.locktype=='plainkey') {
  		fields = [
        {
            fieldname: 'lock.locktype',
            fieldvalue: object.lock.locktype,
            controltype: 'combo',
            label: 'Type of Lock',
            options: lockTypes
        },
	  		{
	          fieldname: 'lock.settings.keyid',
	          fieldvalue: object.lock.settings.keyid,
	          controltype: 'text',
	          label: 'Sleutelnr.'
	  		}
	  	]
    } else if(object.lock.locktype=='concox-bl10') {
      fields = [
        {
            fieldname: 'lock.locktype',
            fieldvalue: object.lock.locktype,
            controltype: 'combo',
            label: 'Type of Lock',
            options: lockTypes
        },
        {
            fieldname: 'lock.lockid',
            fieldvalue: object.lock.lockid,
            controltype: 'text',
            label: 'Lock ID'
        },
        {
            fieldname: 'lock._state', // generated field
            fieldvalue: (object.lock.locked ? 'Locked':'Unlocked') +  ' @ '
                        + (object.lock.state_timestamp ? object.lock.state_timestamp.toLocaleString() : 'unknown'),
            controltype: 'text-readonly',
            label: 'Locked'
        },
        {
            fieldname: 'lock._location', // generated field
            fieldvalue: '[' + (object.lock.lat_lng ? object.lock.lat_lng[0] : 'x') + ',' + (object.lock.lat_lng ? object.lock.lat_lng[1] : 'x') + '] @ '
                        + (object.lock.lat_lng_timestamp ? object.lock.lat_lng_timestamp.toLocaleString() : 'unknown'),
            controltype: 'text-readonly',
            label: 'Battery Voltage'
        },
        {
            fieldname: 'lock.battery',
            fieldvalue: object.lock.battery,
            controltype: 'text-readonly',
            label: 'Battery Voltage'
        },
        {
            fieldname: 'lock.charging',
            fieldvalue: object.lock.charging ? 'yes':'no',
            controltype: 'text-readonly',
            label: 'Charging'
        }
      ]
    } else {
      console.error('unknown lock type %s', object.lock.locktype)
    }
  
    return fields;
  }
  
  getCoinFields() {
    const { object } = this.props;
  
    let fields = [
      {
          fieldname: 'wallet.passphrase',
          fieldvalue: object.wallet.passphrase,
          controltype: 'text',
          label: 'Passphrase'
      },
      {
          fieldname: 'wallet.privateKey',
          fieldvalue: object.wallet.privateKey,
          controltype: 'text',
          label: 'Private Key'
      },
      {
          fieldname: 'wallet.publicKey',
          fieldvalue: object.wallet.publicKey,
          controltype: 'text',
          label: 'Public Key'
      },
      {
          fieldname: 'wallet.address',
          fieldvalue: object.wallet.address,
          controltype: 'text',
          label: 'Address'
      }
    ]
  
    return fields;
  }
  
  getBlockchainFields() {
    const {object} = this.props;
    
    let fields = [];
    if(! object.blockchain || object.blockchain.id=='') {
      fields = [
        {
            fieldname: 'blockchain.id',
            fieldvalue: "NOT REGISTERED ON THE BLOCKCHAIN YET",
            controltype: 'text-readonly',
            label: 'Asset ID'
    		},
    		{
            fieldname: 'blockchain.title',
            fieldvalue: (object.blockchain ? object.blockchain.title : object.title),
            controltype: 'text',
            label: 'Title'
    		},
    		{
            fieldname: 'blockchain.description',
            fieldvalue: (object.blockchain ? object.blockchain.description : object.description),
            controltype: 'text',
            label: 'Description'
    		},
    		{
            fieldname: 'blockchain.pricePerHourInLSK',
            fieldvalue: (object.blockchain ? object.blockchain.pricePerHourInLSK : object.lisk.pricePerHourInLSK),
            controltype: 'number',
            label: 'Price/Hour (LSK)'
    		},
        {
            fieldname: 'blockchain.depositInLSK',
            fieldvalue: (object.blockchain ? object.blockchain.depositInLSK : object.lisk.depositInLSK),
            controltype: 'number',
            label: 'Deposit (LSK)'
    		},
        {
            fieldname: 'registeronblockchain',
            fieldvalue: 'registeronblockchain',
            controltype: 'clientside-action-nochanges',
            label: 'Register on the blockchain'
    		}
      ]
    } else if(object.blockchain.id=='WAITING FOR TRANSACTION COMPLETION') {
        fields = [
          {
              fieldname: 'blockchain.id',
              fieldvalue: object.blockchain.id,
              controltype: 'text-readonly',
              label: 'Asset ID'
      		},
      		{
              fieldname: 'blockchain.title',
              fieldvalue: object.blockchain.title,
              controltype: 'text-readonly',
              label: 'Title'
      		},
      		{
              fieldname: 'blockchain.description',
              fieldvalue: object.blockchain.description,
              controltype: 'text-readonly',
              label: 'Description'
      		}
        ]
    } else {
      fields = [ // Read only once registered
        {
            fieldname: 'blockchain.id',
            fieldvalue: object.blockchain.id,
            controltype: 'text-readonly',
            label: 'Asset ID'
    		},
    		{
            fieldname: 'blockchain.title',
            fieldvalue: object.blockchain.title,
            controltype: 'text-readonly',
            label: 'Title'
    		},
    		{
            fieldname: 'blockchain.description',
            fieldvalue: object.blockchain.description,
            controltype: 'text-readonly',
            label: 'Description'
    		},
        {
            fieldname: 'blockchain.ownerid',
            fieldvalue: "",
            controltype: 'text-readonly',
            label: 'Owner ID'
    		},
        {
            fieldname: 'blockchain.lat_lng',
            fieldvalue: '[' + object.lock.lat_lng[0] + ', ' + object.lock.lat_lng[0] + ']',
            controltype: 'text-readonly',
            label: 'Location on blockchain'
    		},
    		{
            fieldname: 'blockchain.pricePerHourInLSK',
            fieldvalue: object.blockchain.pricePerHourInLSK,
            controltype: 'number-readonly',
            label: 'Price/Hour (LSK)'
    		},
        {
            fieldname: 'blockchain.depositInLSK',
            fieldvalue: object.blockchain.depositInLSK,
            controltype: 'number-readonly',
            label: 'Deposit (LSK)'
    		},
        {
            fieldname: 'blockchain.rentedBy',
            fieldvalue: object.blockchain.rentedBy,
            controltype: 'text-readonly',
            label: 'Renter ID'
    		},
        {
            fieldname: 'blockchain.rentalStartDatetime',
            fieldvalue: object.blockchain.rentedBy,
            controltype: 'text-readonly',
            label: 'Rental Start Date/Time'
    		},
        {
            fieldname: 'blockchain.rentalEndDatetime',
            fieldvalue: object.blockchain.rentedBy,
            controltype: 'text-readonly',
            label: 'Rental End Date/Time'
    		},
      ]
    }
    
    return fields;
  }

  render() {
  	if(this.props.object==undefined) {
    	return ( <div />);
  	}

    const {classes, object, isnew} = this.props;
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <EditFields
             title="LOCK SETTINGS"
             fields={this.getLockFields()}
             apply={this.updateLocalSettings.bind(this)}
             handleExpansion={this.handleExpansion.bind(this)}
             panelId={'exp-contr-settings-lock'}
             externalPanelId={this.state.openpanel} />
           
          <EditFields
             title="BLOCKCHAIN SETTINGS"
             fields={this.getBlockchainFields()}
             apply={this.updateLocalSettings.bind(this)}
             handleExpansion={this.handleExpansion.bind(this)}
             panelId={'exp-contr-settings-blockchain'}
             externalPanelId={this.state.openpanel}
             handlers={[
                {name:'registeronblockchain', action:this.sendSettingsToBlockchain.bind(this)},
               ]
             } />
          
          <EditFields
             title="WALLET SETTINGS"
             fields={this.getCoinFields()}
             apply={this.updateLocalSettings.bind(this)}
             handleExpansion={this.handleExpansion.bind(this)}
             panelId={'exp-contr-settings-wallet'}
             externalPanelId={this.state.openpanel} />
        </div>
      </div>
    );
  }
}

EditObject.propTypes = {
  object: PropTypes.object,
  isnew: PropTypes.bool
};

EditObject.defaultProps = {
  object: undefined,
  isnew: true
}

export default withTracker((props) => {
  // Subscribe to models
  Meteor.subscribe('objects');
  Meteor.subscribe('settings');
  
  let isnew = false;
  let object = Objects.findOne({_id: props.objectId})
  if(undefined==object) {
    let settings = getSettingsClientSide();
    if(settings) {
      // const newAccount = await doCreateAccount(true)
      isnew=true;
      
      object = createObject();
    }
  }

  // Return variables for use in this component
  return {
    object:object,
    isnew,
    ...props,
  };
})(withStyles(styles) (EditObject));
