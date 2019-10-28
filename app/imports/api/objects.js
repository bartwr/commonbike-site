import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';

import { getUserDescription } from '/imports/api/users.js';
import { CoinSchema } from '/imports/api/bikecoinschema.js';

export const Objects = new Mongo.Collection('objects');

export const StateSchema = new SimpleSchema({
  'state': {
    type: String,
    label: "State",
    defaultValue: 'available'
  },
  lat_lng: {
    type:   Array,
    label: "GPS location",
    maxCount: 2
  },
  'lat_lng.$': {
    type: Number,
    decimal: true,
    optional: true
  },
  'timestamp': {
    type: Number,
    label: "Timestamp",
    defaultValue: ''
  },
  'userId': {
    type: String,
    label: "User Id",
    defaultValue: ''
  },
});

export const PriceSchema = new SimpleSchema({
  'value': {
    type: String,
    label: "Value",
    defaultValue: '0'
  },
  'currency': {
    type: String,
    label: "Currency",
    defaultValue: 'euro'
  },
  'timeunit': {
    type: String,
    label: "Timeunit",
    defaultValue: 'hour'
  },
  'description': {
    type: String,
    label: "Description",
    defaultValue: 'tijdelijk gratis'
  },
});

// TODO: make schema voor lock options

export const ObjectsSchema = new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
  description: {
    type: String,
    label: "Description",
    optional: true,
  },
  imageUrl: {
    type: String,
    label: "Image URL",
    optional: true,
    max: 1000
  },
  state: {
    type: StateSchema
  },
  price: {
    type: PriceSchema
  },
  lock: {
    type: Object,
    blackbox: true
  },
  wallet: {
    type: CoinSchema
  },
});

if (Meteor.isServer) {
  Meteor.publish('objects', function objectsPublication() {
    return Objects.find();
  });
}

export function getStateChangeNeatDescription(objectTitle, newState) {
  var description = ""
  if(newState=='reserved') {
    description = objectTitle + " gereserveerd"
  } else if(newState=='inuse') {
    description = objectTitle + " gehuurd"
  } else if(newState=='available') {
    description = objectTitle + " teruggebracht"
  } else if(newState=='outoforder') {
    description = objectTitle + " buiten bedrijf gesteld"
  } else {
    description = objectTitle + " in toestand '" + newState + "' gezet"
  }

  return description;
}

export const createObject = (title) => {
  // set SimpleSchema.debug to true to get more info about schema errors
  SimpleSchema.debug = true

  var timestamp =  new Date().valueOf();

  var length = 5;
  var base = Math.pow(10, length+1);
  var code = Math.floor(base + Math.random() * base)
  // console.log('code: ' + code);
  keycode = code.toString().substring(1, length+1);

  var data = {
    title: title,
    description: '',
    imageUrl: '/files/Block/bike.png',
    state: {state: 'available',
            userId: Meteor.userId(),
            timestamp: timestamp,
            userDescription: getUserDescription(Meteor.user())},
    lock: {type: 'plainkey',
           settings: {keyid: keycode }
          },
    price: {value: '0',
            currency: 'euro',
            timeunit: 'day',
            description: 'tijdelijk gratis'},
    lat_lng: [0, 0],
    wallet: { address : '',
              privatekey :  '' }
  }

  try {
    var context =  ObjectsSchema.newContext();
    check(data, ObjectsSchema);
  } catch(ex) {
    console.log('Error in data: ',ex.message );
    return;
  }

  return data;
}

Meteor.methods({
  'objects.insert'(data) {

    // Make sure the user is logged in
    if (! Meteor.userId()) throw new Meteor.Error('not-authorized');

    try {
      check(data, ObjectsSchema);
    } catch(ex) {
      console.log('data for new object does not match schema: ' + ex.message);
      return;
    }

  	// Strip HTML Tags
    data.title = data.title.replace(/<.*?>/g, " ").replace(/\s+/g, " ").trim();

    // assign new keypair to object
    var keypair = BikeCoin.newKeypair();
    data.wallet.address=keypair.address;
    data.wallet.privatekey=keypair.privatekey;

    // Insert object
    var objectId = Objects.insert(data);

    var object = Objects.findOne(objectId, {title:1, locationId:1});
    var description = getUserDescription(Meteor.user()) + ' has added a new bike ' + object.title;
    console.log(description);
  },
  'objects.update'(objectId, data) {

    // Make sure the user is logged in
    if (! Meteor.userId()) throw new Meteor.Error('not-authorized');

    // check(data, ObjectsSchema);

	  var strippedTitle = data.title.replace(/<.*?>/g, " ").replace(/\s+/g, " ").trim();

    Objects.update(objectId, {$set:{
      locationId: data.locationId,
      title: strippedTitle,
      description: data.description,
      imageUrl: data.imageUrl
    }});
  },
  'objects.applychanges'(_id, changes) {

    // Make sure the user is logged in
    if (! Meteor.userId()) throw new Meteor.Error('not-authorized');

    var context =  ObjectsSchema.newContext();
    if(context.validate({ $set: changes}, {modifier: true} )) {
      var object = Objects.findOne(_id);

      var logchanges = {};
      Object.keys(changes).forEach((fieldname) => {
        // convert dot notation to actual value
        val = new Function('_', 'return _.' + fieldname)(object);
        logchanges[fieldname] = { new: changes[fieldname],
                                  prev: val||'undefined' };
      });

      // apply changes
      Objects.update(_id, {$set : changes} );

      var description = getUserDescription(Meteor.user()) + ' heeft de instellingen van object ' + object.title + ' gewijzigd';
      console.log(description);
    } else {
      console.log('unable to update object with id ' + _id);
      console.log(context);
    };
  },
  'objects.remove'(objectId){
    var object = Objects.findOne(objectId);

    Objects.remove(objectId);

    var description = getUserDescription(Meteor.user()) + ' has removed bike ' + object.title;
    console.log(description);
  },
  'objects.setState'(objectId, userId, newState){
    // Make sure the user is logged in
    if (! Meteor.userId()) throw new Meteor.Error('not-authorized');

    // console.log('setstate userDescription: ' + userDescription)
    // console.log('setstate object: ' + userId, Meteor.userId())

    var timestamp = new Date().valueOf();
    Objects.update({_id: objectId}, { $set: {
        'state.userId': userId,
        'state.state': newState,
        'state.timestamp': timestamp }
    });

    return;
  },
});
