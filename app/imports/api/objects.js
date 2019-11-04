import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';

import { CoinSchema } from '/imports/api/bikecoinschema.js';
import { getSettingsServerSide } from '/imports/api/settings.js';

const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const BigNum = require('@liskhq/bignum');
const { Mnemonic } = require('@liskhq/lisk-passphrase');

const CreateBikeTransaction = require('./lisk-blockchain/transactions/create-bike.js');

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
  
  const words = Mnemonic.generateMnemonic().split(" ");
  const title = words[0] + " " + words[1];

  var data = {
    blockchain: {
      id: '',
      title: title,
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

if(Meteor.isServer) {
  Meteor.methods({
    'objects.createnew'() {
      let newObject = createObject();
      let newId = Objects.insert(newObject);
      return { _id: newId }
    },
    'objects.applychanges'(_id, changes) {
      console.log("incoming applychanges %o for object %s", changes, _id)

      // Make sure the user is logged in
      if (! Meteor.userId()) throw new Meteor.Error('not-authorized');
      
      let object = Objects.findOne(_id);
      if(object) {
        var context =  ObjectsSchema.newContext();
        if(context.validate({ $set: changes}, {modifier: true} )) {
          // apply changes
          Objects.update(_id, {$set : changes} );
          console.log('Settings changed for ' + object.blockchain.title || "unnamed object");
          
          return {
            result: true,
            message: 'Object ' + object.blockchain.title + ' updated',
            id: object._id
          }
        } else {
          return {
            result: false,
            message: 'Object ' + object.blockchain.title + ' contains invalid data',
            id: object._id
          }
        };
      } else {
        // make sure that no object exists with same title / category
        object = Objects.findOne({'blockchain.title':changes.title})
        if(object) {
          return {
            result: true,
            message: 'There is already an object with this title registered (' + changes.title + ')',
            id: object._id
          }
        }
        
        object = Object.assign({}, createObject(), changes);
        Objects.insert(object);
        return {
          result: true,
          message: 'Object ' + changes.title + ' created',
        }
      }
    },
    'objects.remove'(objectId){
      var object = Objects.findOne(objectId);

      Objects.remove(objectId);

      var description = 'Object ' + object.blockchain.title + ' was removed';
      console.log(description);
    },
    async 'objects.registeronblockchain'(objectId){

      return { result: false, message: 'this is not working yet!'}

      // var object = Objects.findOne(objectId);
      //
      // if(object.blockchain.title=='') {
      //   return { result: false, message: 'please provide a title for this object!'}
      // } else if(object.blockchain.description=='') {
      //   return { result: false, message: 'please provide a description for this object!'}
      // }
      //
      // Objects.update(objectId, {$set: {'blockchain.id': 'WAITING FOR TRANSACTION COMPLETION'}});
      //
      // let settings = await getSettingsServerSide();
      //
      // // Create tx
      // const tx = new CreateBikeTransaction({
      //   senderPublicKey: settings.bikecoin.wallet.publicKey,
      //   recipientId: settings.bikecoin.wallet.address,
      //   timestamp: getTimestamp(),
      //   asset: {
      //
      //     id: object.wallet.publicKey,
      //     title: object.blockchain.title,
      //     description: object.blockchain.description,
      //     pricePerHour: transactions.utils.convertLSKToBeddows(object.blockchain.pricePerHourInLSK),
      //     deposit: transactions.utils.convertLSKToBeddows(object.blockchain.depositInLSK),
      //     latitude: null,
      //     longitude: null
      //   }
      // });
      // console.log(tx);
      //
      // // Sign transaction
      // tx.sign(settings.bikecoin.wallet.passphrase);
      //
      // // Broadcast the tx to the blockchain
      // const broadcastTx = client.transactions.broadcast(tx.toJSON());
      //
      // broadcastTx.then(() => {
      //   Objects.update(objectId, {$set: {'blockchain.id': object.wallet.publicKey}});
      // })
      // .catch(error => {
      //   console.error(error);
      // });
      //
      // return { result: true, message: 'registration transaction has been sent to the blockchain!'}
    },
  });
}
