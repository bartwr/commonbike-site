import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';
import { RedirectTo } from '/client/main'

import EditFields from '/imports/client/components/EditFields';
import {doCreateAccount} from '/imports/api/lisk-blockchain/client/create-account.js';

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
  }

  update(changes) {
    Meteor.call('objects.applychanges', this.props.object._id, changes);

    return true;
  }

  getLockFields() {
    const {object} = this.props;
  
  	var fields = [];
    var lockType = object.lock.locktype;
    if(lockType=='open-elock') {
      fields = [
        {
            fieldname: 'lock.settings.elockid',
            fieldvalue: object.lock.settings.elockid,
            controltype: 'text',
            label: 'lock id'
        },
        {
            fieldname: 'lock.settings.code',
            fieldvalue: object.lock.settings.code,
            controltype: 'text',
            label: 'code'
        }
      ]
    } else if(lockType=='plainkey') {
  		fields = [
	  		{
	          fieldname: 'lock.settings.keyid',
	          fieldvalue: object.lock.settings.keyid,
	          controltype: 'text',
	          label: 'Sleutelnr.'
	  		}
	  	]
    } else if(lockType=='concox-bl10') {
      fields = [
        {
            fieldname: 'lock.lockid',
            fieldvalue: object.lock.lockid,
            controltype: 'text',
            label: 'Lock ID'
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
      console.error('unknown lock type %s', lockType)
    }
  
    return fields;
  }
  
  getCoinFields() {
    const { object } = this.props;
  
    let fields = [
      {
          controltype: 'header',
          label: 'Bicycle Wallet'
      },
      {
          fieldname: 'object.wallet.passphrase',
          fieldvalue: object.wallet.passphrase,
          controltype: 'text',
          label: 'Passphrase'
      },
      {
          fieldname: 'object.privateKey',
          fieldvalue: object.wallet.privateKey,
          controltype: 'text',
          label: 'Private Key'
      },
      {
          fieldname: 'object.publicKey',
          fieldvalue: object.wallet.publicKey,
          controltype: 'text',
          label: 'Public Key'
      },
      {
          fieldname: 'object.address',
          fieldvalue: object.wallet.address,
          controltype: 'text',
          label: 'Address'
      },
    ]
  
    return fields;
  }

  render() {
  	if(this.props.object==undefined) {
      console.log('skip render because object is undefined');
    	return ( <div />);
  	}

    
    const {classes, object, isnew } = this.props;

    console.log('rendering editobject %o', object);

  	var lockTypes = [ { _id: 'concox-bl10', title: 'Concox BL10 e-lock'},
                      { _id: 'open-elock', title: 'Open e-lock'},
                    	{ _id: 'plainkey', title: 'sleutel'}];
  	var fields = [
  		{
          controltype: 'header',
          label: 'Blockchain asset'
  		},
      {
          fieldname: 'id',
          fieldvalue: object.blockchain.id,
          controltype: 'text',
          label: 'Asset ID'
  		},
  		{
          fieldname: 'title',
          fieldvalue: object.blockchain.title,
          controltype: 'text',
          label: 'Title'
  		},
  		{
          fieldname: 'description',
          fieldvalue: object.blockchain.description,
          controltype: 'text',
          label: 'Description'
  		},
      {
          fieldname: 'blockchain.lat_lng',
          fieldvalue: '[' + object.blockchain.lat_lng[0] + ', ' + object.blockchain.lat_lng[0] + ']',
          controltype: 'text-readonly',
          label: 'Location on blockchain'
  		},
  		{
          fieldname: 'blockchain.pricePerHourInLSK',
          fieldvalue: object.blockchain.pricePerHourInLSK,
          controltype: 'number',
          label: 'Price/Hour (LSK)'
  		},
      {
          fieldname: 'blockchain.depositInLSK',
          fieldvalue: object.blockchain.depositInLSK,
          controltype: 'number',
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
  		{
          controltype: 'header',
          label: 'Lock'
  		},
  		{
          fieldname: 'lock.locktype',
          fieldvalue: object.lock.locktype,
          controltype: 'combo',
          label: 'Type of Lock',
          options: lockTypes
  		}
  	]

  	fields = fields.concat(this.getLockFields());
    
    fields = fields.concat(this.getCoinFields());
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <EditFields fields={fields} title={'EDIT OBJECT'} apply={this.update.bind(this)}  />
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
  console.log("working with object %o", object);
  return {
    object:object,
    isnew,
    ...props,
  };
})(withStyles(styles) (EditObject));
