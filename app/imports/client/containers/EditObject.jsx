import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';
import { RedirectTo } from '/client/main'

// Import components
import EditFields from '/imports/client/components/EditFields';

// Import models
import { Objects, ObjectsSchema } from '/imports/api/objects.js';

class EditObject extends Component {

  constructor(props) {
    super(props);
  }

  update(changes) {
    Meteor.call('objects.applychanges', this.props.object._id, changes);

    return true;
  }

  getLockFields() {
  	var fields = [];
    var lockType = this.props.object.lock.type;
    if(lockType=='open-elock') {
      fields = [
        {
            fieldname: 'lock.settings.elockid',
            fieldvalue: this.props.object.lock.settings.elockid,
            controltype: 'text',
            label: 'lock id'
        },
        {
            fieldname: 'lock.settings.code',
            fieldvalue: this.props.object.lock.settings.code,
            controltype: 'text',
            label: 'code'
        }
      ]
    } else if(lockType=='plainkey') {
  		fields = [
	  		{
	          fieldname: 'lock.settings.keyid',
	          fieldvalue: this.props.object.lock.settings.keyid,
	          controltype: 'text',
	          label: 'Sleutelnr.'
	  		}
	  	]
    } else if(lockType=='concox-bl10') {
      fields = [
        // {
        //     fieldname: 'lock.settings.callbackurl',
        //     fieldvalue: this.props.object.lock.settings.callbackurl,
        //     controltype: 'text',
        //     label: 'Callback URL'
        // }
      ]
    } else {
      console.error('unknown lock type %s', lockType)
    }

    return fields;
  }

  getCoinFields() {
    let fields = [
      {
          controltype: 'header',
          label: 'CommonBikeCoin'
      },
      {
          fieldname: 'object.wallet.address',
          fieldvalue: this.props.object.wallet.address,
          controltype: 'text',
          label: 'Address'
      },
      {
          fieldname: 'object.wallet.privatekey',
          fieldvalue: this.props.object.wallet.privatekey,
          controltype: 'text',
          label: 'Private Key'
      },
    ]

    return fields;
  }

  render() {
  	if(!this.props.object) {
    	return ( <div />);
  	}

  	var validLocations = Locations.find({},{fields:{_id:1, title:1}}).fetch();
  	var lockTypes = [ { _id: 'concox-bl10', title: 'Concox BL10 e-lock'},
                      { _id: 'open-elock', title: 'Open e-lock'},
                    	{ _id: 'plainkey', title: 'sleutel'}];
  	var timeUnits = [ { _id: 'day', title: 'dag'},
  	                  { _id: 'halfday', title: 'dagdeel'},
  	                  { _id: 'hour', title: 'uur'}];

  	var fields = [
  		{
          controltype: 'header',
          label: 'Algemeen'
  		},
  		{
          fieldname: 'title',
          fieldvalue: this.props.object.title,
          controltype: 'text',
          label: 'Naam'
  		},
  		{
          fieldname: 'description',
          fieldvalue: this.props.object.description,
          controltype: 'text',
          label: 'Beschrijving'
  		},
  		{
          fieldname: 'imageUrl',
          fieldvalue: this.props.object.imageUrl,
          controltype: 'text',
          label: 'Avatar'
  		},
  		{
          fieldname: 'locationId',
          fieldvalue: this.props.object.locationId,
          controltype: 'combo',
          label: 'Locatie',
          options: validLocations
  		},
  		{
          controltype: 'header',
          label: 'Huurprijs'
  		},
  		{
          fieldname: 'price.value',
          fieldvalue: this.props.object.price.value,
          controltype: 'text',
          label: 'Bedrag'
  		},
  		{
          fieldname: 'price.currency',
          fieldvalue: this.props.object.price.currency,
          controltype: 'text',
          label: 'Munteenheid'
  		},
  		{
          fieldname: 'price.timeunit',
          fieldvalue: this.props.object.price.timeunit,
          controltype: 'combo',
          label: 'Tijdeenheid',
          options: timeUnits
  		},
  		{
          fieldname: 'price.description',
          fieldvalue: this.props.object.price.description,
          controltype: 'text',
          label: 'Beschrijving'
  		},
      {
          controltype: 'header',
          label: 'Status'
  		},
  		{
          fieldname: 'state.state',
          fieldvalue: this.props.object.state.state,
          controltype: 'text-readonly',
          label: 'State'
  		},
      {
          fieldname: 'state.userId',
          fieldvalue: this.props.object.state.userId,
          controltype: 'text-readonly',
          label: 'gebruikers ID'
  		},
      {
          fieldname: 'state.timestamp',
          fieldvalue: this.props.object.state.timestamp,
          controltype: 'text-readonly',
          label: 'timestamp'
  		},
  		{
          controltype: 'header',
          label: 'Slot'
  		},
  		{
          fieldname: 'lock.type',
          fieldvalue: this.props.object.lock.type,
          controltype: 'combo',
          label: 'Type Slot',
          options: lockTypes
  		}
  	]

  	fields = fields.concat(this.getLockFields());

    fields = fields.concat(this.getCoinFields());

    return (
      <EditFields fields={fields} apply={this.update.bind(this)} />
    );
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

EditObject.propTypes = {
  objectId: PropTypes.string.isRequired
};

EditObject.defaultProps = {
  objectId: ''
}

export default createContainer((props) => {
  // Subscribe to models
  Meteor.subscribe('objects');
  Meteor.subscribe('locations', true);

  // Return variables for use in this component
  return {
  	user: Meteor.user(),
    objectId: props.objectId,
    object: Objects.find({_id: props.objectId}).fetch()[0],
  };

}, EditObject);
