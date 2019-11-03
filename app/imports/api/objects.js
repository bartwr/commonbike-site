import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';

import { CoinSchema } from '/imports/api/bikecoinschema.js';

const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');

export const Objects = new Mongo.Collection('objects');

export const LiskSchema = new SimpleSchema({
  id: {
    type: String,
    label: "Asset ID",
  },
  title: {
    type: String,
    label: "Bike title",
  },
  description: {
    type: String,
    label: "Bike description",
  },
  lat_lng: {
    type:   Array,
    label: "Last GPS location",
    maxCount: 2
  },
  'lat_lng.$': {
    type: Number,
    decimal: true,
    optional: true
  },
  pricePerHourInLSK: {
    type: Number,
    label: "Price per hour (LSK)",
    defaultValue: 1
  },
  depositInLSK: {
    type: Number,
    label: "Deposit (LSK)",
    defaultValue: 29
  },
  rentedBy: {
    type: String,
    label: "Renter ID"
  },
  rentalStartDatetime: {
    type: Date,
    label: "Start Date/Time"
  },
  rentalEndDatetime: {
    type: Date,
    label: "End Date/Time"
  }
});

export const LockSchema = new SimpleSchema({
  locktype: {
    type: String,
    label: "Lock type",
    max: 32
  },
  lockid: {
    type: String,
    label: "Lock ID",
  },
  lat_lng: {
    type:   Array,
    label: "Last GPS location",
    maxCount: 2
  },
  'lat_lng.$': {
    type: Number,
    decimal: true,
    optional: true
  },
  lat_lng_timestamp: {
    type: Date,
    label: "Last lock state change",
  },
  state_timestamp: {
    type: Date,
    label: "Last lock state change",
  },
  locked: {
    type: Boolean,
    label: "Locked state",
  },
  battery: {
    type: Number,
    label: "Battery Voltage",
  },
  charging: {
    type: Boolean,
    label: "Charging state",
  },
});

export const ObjectsSchema = new SimpleSchema({
  blockchain: {
    type: LiskSchema
  },
  wallet: {
    type: CoinSchema
  },
  lock: {
    type: LockSchema
  }
});

if (Meteor.isServer) {
  Meteor.publish('objects', function objectsPublication() {
    return Objects.find();
  });
}

export const createObject = () => {
  // set SimpleSchema.debug to true to get more info about schema errors
  SimpleSchema.debug = true

  var data = {
    blockchain: {
      id: '',
      title: '',
      description: '',
      lat_lng: [0,0],
      pricePerHourInLSK: 1,
      depositInLSK: 20,
      rentedBy: '',
      rentalStartDatetime: new Date(),
      rentalEndDatetime: new Date(),
    },
    lock: {locktype: 'concox-bl10',
           lockid: '',
           lat_lng: [999,999],
           lat_lng_timestamp: new Date(),
           state_timestamp: new Date(),
           locked: false,
           battery: 0,
           charging: false
          },
    wallet: { passphrase :  '',
              privateKey :  '',
              publicKey : '',
              address :  '' }
  }
  
  // assign new keypair to object
  const passphrase = Mnemonic.generateMnemonic();
  const { privateKey, publicKey } = getKeys(passphrase);
  const address = getAddressFromPublicKey(publicKey);

  data.wallet = {
    passphrase,
    privateKey,
    publicKey,
    address
  };

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
  'objects.applychanges'(_id, changes) {

    // Make sure the user is logged in
    if (! Meteor.userId()) throw new Meteor.Error('not-authorized');
    
    let object = Objects.findOne({uuid: uuid});
    if(object) {
      var context =  ObjectsSchema.newContext();
      if(context.validate({ $set: changes}, {modifier: true} )) {
        // apply changes
        Objects.update(_id, {$set : changes} );
        console.log('Settings changed for ' + object.blockchain.title);
        
        return {
          result: true,
          message: 'Object ' + item.title + ' updated',
          uuid
        }
      } else {
        return {
          result: false,
          message: 'Object ' + item.title + ' contains invalid data',
          uuid
        }
      };
    } else {
      // make sure that no item exists with same title / category
      item = Objects.findOne({'blockchain.title':changes.title})
      if(item) {
        return {
          result: true,
          message: 'There is already an object with this title registered (' + changes.title + ')',
          _id: item.id
        }
      }
      
      item = Object.assign({}, createObject(), changes);
      Objects.insert(item);
      return {
        result: true,
        message: 'Object ' + changes.title + ' created',
        uuid
      }
    }
  },
  'objects.remove'(objectId){
    var object = Objects.findOne(objectId);

    Objects.remove(objectId);

    var description = 'Object ' + object.title + ' was removed';
    console.log(description);
  },
  // 'objects.setState'(objectId, userId, newState){
  //   // Make sure the user is logged in
  //   if (! Meteor.userId()) throw new Meteor.Error('not-authorized');
  //
  //   Objects.update({_id: objectId}, { $set: {
  //       'state.userId': userId,
  //       'state.state': newState,
  //       'state.timestamp': new Date() }
  //   });
  //
  //   return;
  // },
  // 'objects.returnBike'(object) {
  //   console.log('returning bike %o', object);
  //
  //   let bikeaddress = object.wallet.address;
  //
  //
  //   return {
  //     result: 'ok'
  //   }
  // }
});
