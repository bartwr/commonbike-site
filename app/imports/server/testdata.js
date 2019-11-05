import { Meteor } from 'meteor/meteor';
import { Objects } from '/imports/api/objects.js';
import '/imports/api/users.js';
import { getUserDescription } from '/imports/api/users.js';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { getAddressFromPublicKey, getKeys } from '@liskhq/lisk-cryptography';

var testUsers = [
    {name:"user1",email:"user1@lisk.bike",
     password:"lisk!!", roles:[]},
    {name:"User2",email:"user2@lisk.bike",
     password:"lisk!!", roles:[]},
    {name:"Marc",email:"marc@lisk.bike",
     password:"lisk!!",roles:['admin']},
    {name:"Lisk Center Utrecht",email:"lcu@lisk.bike",
     password:"lisk!!",roles:[]},
    {name:"tourist1",email:"tourist1@lisk.bike",
     password:"lisk!!", roles:[] },
    {name:"tourist2",email:"tourist2@lisk.bike",
     password:"lisk!!", roles:[]},
  ];
  
const cTestBikeImage = '/files/Testdata/liskbike.png';

var testLocations = [
  {title:"Lisk Bikes @ Lisk Center Utrecht",
   address: "Jaarbeursplein, Utrecht",
   lat_lng: [ 52.088304, 5.107243]
  },
  {title:"Lisk Bikes @ Lisk HQ ",
   address: "Eichhornstraße 3, 10785 Berlin, Germany",
   lat_lng: [ 52.506396, 13.373237]
  },
  {title:"Bumos office",
   address: "Jutfaseweg 156A, Utrecht, Netherlands",
   lat_lng: [ 52.069018, 5.114817]
  },
  {
    title: "Domplein",
    address: "Domplein, Utrecht",
    lat_lng: [ 52.090788, 5.121851]
  }
];

var testObjects = [
  { title: 'Lisk Bike #1', description: 'Concox BL10 lock #1', state: 'available', locktype: 'concox-bl10',
    locksettings: { lockid: '0355951092273478' },
    startcoordinates: [52.088304, 5.107243] }, // LCU location
  { title: 'Lisk Bike #2', description: 'Concox BL10 lock #1', state: 'available', locktype: 'concox-bl10',
    locksettings: { lockid: '0355951092920805' },
    startcoordinates: [52.506396, 13.373237] }, // Lisk HQ
  { title: 'Lisk Bike #3', description: 'Concox BL10 lock #1', state: 'available', locktype: 'concox-bl10',
    locksettings: { lockid: '0355951092914766' },
    startcoordinates: [52.069018, 5.114817] }, // Bumos office
  { title: 'Lisk Bike #4', description: 'Concox BL10 lock #1', state: 'available', locktype: 'concox-bl10',
    locksettings: { lockid: '355951092143820' },
    startcoordinates: [52.090788, 5.121851] }, // domplein
]

export const cleanupTestUsers = function() {
  testUsers.forEach(function (userData) {
    var hithere=Accounts.findUserByEmail(userData.email);
    if(hithere) {
      // logout user prior to deleting
      Meteor.users.update({_id:hithere}, {$set: { "services.resume.loginTokens" : [] }});

      var id = hithere._id;

      userData.roles.forEach(function (role) {
          if (Roles.userIsInRole(id, [role])) {
              Roles.removeUsersFromRoles(id, [role]);
            }
        });

      Meteor.users.remove({_id: id});
    }
  });
}

export const cleanupTestData = function() {
  let Locations = new Mongo.Collection('locations');
  Locations.rawCollection().drop();
  Locations = undefined;
  
  let Transactions = new Mongo.Collection('transactions');
  Transactions.rawCollection().drop();
  Transactions = undefined;
  
  testObjects.forEach(function (object) {
    var hereitis=Objects.findOne({title: object.title});
    if(hereitis) {
      Objects.remove({objectId: object._id});
    }
  });
}

export const checkTestUsers = function() {
    testUsers.forEach(function (userData) {
      var id;

      var hithere=Accounts.findUserByEmail(userData.email);
      if(hithere) {
      id = hithere._id;
    } else {
      // assign new keypair to object
      // assign new keypair to object
      const passphrase = Mnemonic.generateMnemonic();
      const { privateKey, publicKey } = getKeys(passphrase);
      const address = getAddressFromPublicKey(publicKey);

      let wallet = {
        passphrase,
        privateKey,
        publicKey,
        address
      };

      id = Accounts.createUser({
        email: userData.email,
        password: userData.password,
        profile: { name: userData.name,
                   wallet: {
                     passphrase: passphrase,
                     privateKey: privateKey,
                     publicKey: publicKey,
                     address: address
                   }
        }
      });

      // email verification
      Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true, 'profile.active':true}});
    }

    userData.roles.forEach(function (role) {
        if (!Roles.userIsInRole(id, [role])) {
          Roles.addUsersToRoles(id, [role]);
        }
      });
    });
}

var createLockCode = function(length) {
  var base = Math.pow(10, length+1);
  var code = Math.floor(base + Math.random() * base)
  return code.toString().substring(1, length+1);
}

var createLock = function(locktype, locksettings) {

  if(locktype!='concox-bl10'&&locktype!='open-elock'&&locktype!='plainkey') {
      // assume plainkey for unknown keytypes
      console.error('unknown lock type %s in testdata definitions. Using plainkey', locktype);
      locktype='plainkey';
  }

  var lockInfo = {};
  if(locktype=='plainkey') {
    lockInfo = Object.assign({locktype: locktype, keyid: '0000' }, locksettings);
  } else if(locktype=='concox-bl10') {
    lockInfo = Object.assign({
      locktype: locktype,
      lockid: '',
      lat_lng: [999,999],
      lat_lng_timestamp: new Date
    }, locksettings);
  }

  return lockInfo;
}

export const checkTestObjects = function() {
  var timestamp =  new Date();
  testObjects.forEach(function (object) {
    var gimmebike=Objects.findOne({title: object.title});
    if (!gimmebike) {
      console.log("create object %o", object);
      
      var lockinfo = null;
      if("locktype" in object) {
        lockinfo = createLock(object.locktype, object.locksettings);
      } else {
        lockinfo = createLock('plainkey');
      }

      // var firstproviderid = null;
      // _.each(locationData.providers, function (provider) {
      //   var hithere=Accounts.findUserByEmail(provider);
      //   if (hithere) {
      //     if(firstproviderid==null) {
      //       firstproviderid = hithere._id;
      //       firstprovidermail=hithere.emails[0].address;
      //     }
      //
      //     Meteor.users.update({_id: hithere._id}, {$addToSet: {'profile.provider_locations': locationId}} );
      //   }
      // });

      // Create account for bike lock
      const passphrase = Mnemonic.generateMnemonic();
      const { privateKey, publicKey } = getKeys(passphrase);
      const address = getAddressFromPublicKey(publicKey);
      const wallet = { passphrase, privateKey, publicKey, address };

      var keyid = Objects.insert({
        title: object.title,
        description: object.description,
        imageUrl: 'url(' + cTestBikeImage + ')',
        state: { state: object.state,
                 timestamp: timestamp,
                 lat_lng: object.startcoordinates},
        lisk: { ownerAddress : "",
                pricePerHourInLSK : 1,
                depositInLSK : 20},
        wallet: {
          passphrase: wallet.passphrase,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          address: wallet.address
        },
        lock: lockinfo,
      });
    }
  });
};

Meteor.methods({
  'testdata.cleanupTestUsers'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    cleanupTestUsers();

    var description = "Testgebruikers verwijderd door " + getUserDescription(Meteor.user());
    console.log(description);

  },
  'testdata.cleanupTestData'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    cleanupTestData();

    var description = "Testdata verwijderd door " + getUserDescription(Meteor.user());
    console.log(description);
  },
  'testdata.checkTestUsers'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    checkTestUsers();

    var description = "Testgebruikers toegevoegd door " + getUserDescription(Meteor.user());
    console.log(description);
  },
  'testdata.checkTestObjects'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    checkTestObjects();

    var description = "Testdata toegevoegd door " + getUserDescription(Meteor.user());
    console.log(description);
  }
});
