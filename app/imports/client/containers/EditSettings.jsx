import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';
import {propTypes} from 'react-router';

// Import components
import EditFields from '/imports/client/components/EditFields';

// Import models
import { Settings, SettingsSchema, defaultProfileName } from '/imports/api/settings.js';

class EditSettings extends Component {

  constructor(props) {
    super(props);
  }

  update(changes) {
    console.log('update settings ' + this.props.settings.profileName + ' with ', changes);

    var context =  SettingsSchema.newContext();
    if(!context.validate({ $set: changes}, {modifier: true} )) {
      alert('De wijzigingen bevatten ongeldige waarden');
      console.log(context);
      return false;
    };


    Meteor.call('settings.applychanges', this.props.settings._id, changes);

    return true;
  }

  render() {
  	if(!this.props.settings) {
    	return ( <div />);
  	}

    var yesNo = [ { _id: 'true', title: 'Yes'},
                  { _id: 'false', title: 'No'}];

  	var fields = [
      {
          controltype: 'header',
          label: 'Server'
      },
      {
          fieldname: 'baseurl',
          fieldvalue: this.props.settings.baseurl,
          controltype: 'text',
          label: 'Base URL (server url)'
  		},
      {
          controltype: 'header',
          label: 'Map'
      },
  		{
          fieldname: 'mapbox.style',
          fieldvalue: this.props.settings.mapbox.style,
          controltype: 'text',
          label: 'Style'
  		},
  		{
          fieldname: 'mapbox.userId',
          fieldvalue: this.props.settings.mapbox.userId,
          controltype: 'text',
          label: 'UserId',
  		},
      {
          controltype: 'header',
          label: 'Automatic Onboarding'
      },
  		{
          fieldname: 'onboarding.enabled',
          fieldvalue: this.props.settings.onboarding.enabled,
          controltype: 'combo',
          label: 'Enabled',
          controltype: 'yesno'
  		},
      {
          controltype: 'header',
          label: 'MongoDB Backup'
      },
      {
          fieldname: 'backup.location',
          fieldvalue: this.props.settings.backup.location,
          controltype: 'text',
          label: 'storage directory'
      },
      {
          controltype: 'header',
          label: 'Use GPS Location'
      },
      {
          fieldname: 'gps.enabled',
          fieldvalue: this.props.settings.gps.enabled,
          label: 'Enabled',
          controltype: 'yesno'
      },
      {
          controltype: 'header',
          label: 'BikeCoin Contract'
      },
  		{
          fieldname: 'bikecoin.enabled',
          fieldvalue: this.props.settings.bikecoin.enabled,
          controltype: 'combo',
          label: 'Enabled',
          controltype: 'yesno'
  		},
      {
          fieldname: 'bikecoin.provider_url',
          fieldvalue: this.props.settings.bikecoin.provider_url,
          controltype: 'text',
          label: 'Provider URL'
      },
      {
          fieldname: 'bikecoin.deploycontract',
          fieldvalue: 'bikecoin.deploycontract',
          controltype: 'serverside-action',
          label: 'Deploy Contract'
      },
      {
          fieldname: 'bikecoin.token_address',
          fieldvalue: this.props.settings.bikecoin.token_address,
          controltype: 'text',
          label: 'Token Address'
      },
      {
          fieldname: 'bikecoin.token_abi',
          fieldvalue: this.props.settings.bikecoin.token_abi,
          controltype: 'text',
          label: 'Token ABI'
      },
      {
          controltype: 'header',
          label: 'Application BikeCoin Wallet'
      },
      {
          fieldname: 'bikecoin.coin.wallet.address',
          fieldvalue: this.props.settings.bikecoin.wallet.address,
          controltype: 'text',
          label: 'Address'
      },
      {
          fieldname: 'bikecoin.coin.wallet.privatekey',
          fieldvalue: this.props.settings.bikecoin.wallet.privatekey,
          controltype: 'text',
          label: 'Private Key'
      },
      {
          controltype: 'header',
          label: 'Development Options'
      },
      {
          fieldname: 'developmentOptions.showTestButtons',
          fieldvalue: this.props.settings.developmentOptions.showTestButtons,
          controltype: 'yesno',
          label: 'Show Test buttons'
      },
      {
          fieldname: 'developmentOptions.forwardRequests',
          fieldvalue: this.props.settings.developmentOptions.forwardRequests,
          controltype: 'yesno',
          label: 'Forward API requests (debugmode)'
      },
      {
          fieldname: 'developmentOptions.forwardRequestsURL',
          fieldvalue: this.props.settings.developmentOptions.forwardRequestsURL,
          controltype: 'text',
          label: 'Forward API requests URL'
      },
      {
          controltype: 'header',
          label: ''
      },
  	]

    var handlers = [
      { name: "deploycontract",
        action: this.deployContract
      }
    ]

    return (
      <EditFields title={this.props.title} fields={fields} handlers={handlers} apply={this.update.bind(this)} />
    );
  }

  deployContract() {
    console.log("deploy the contracts now!!!!!!")
    // Meteor.call('bikecoin.deploycontract');
  }
}

var s = {
  base: {
    background: '#fff',
    display: 'flex',
    fontWeight: 'normal',
    lineHeight: 'normal',
    padding: '10px',
    maxWidth: '100%',
    width: '400px',
    margin: '20px auto',
    borderBottom: 'solid 5px #bc8311',
    textAlign: 'left',
  },
}

EditSettings.propTypes = {
  title: PropTypes.string.isRequired
};

EditSettings.defaultProps = {
  title: 'INSTELLINGEN'
}

export default withTracker((props) => {
  // Subscribe to models
  Meteor.subscribe('settings', true);

  var settings = Settings.find({profileName: defaultProfileName}).fetch()[0];
  if(!settings) {
    return {}
  }

  // Return variables for use in this component
  return {
    title: props.title,
    settings: settings // ,
  };

})(EditSettings);
