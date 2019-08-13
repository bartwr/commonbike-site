import { Meteor } from 'meteor/meteor';
import { Locations, Address2LatLng } from '/imports/api/locations.js';
import { Objects } from '/imports/api/objects.js';
import { Transactions } from '/imports/api/transactions.js';
import '/imports/api/users.js';
import { getUserDescription } from '/imports/api/users.js';
import BikeCoin from '/imports/api/bikecoin.js';

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

var testLocations = [
  {title:"Lisk Bikes @ Lisk Center Utrecht",
   address: "Jaarbeursplein, Utrecht",
   lat_lng: [ 52.088304, 5.107243],
   imageUrl:'/files/Testdata/liskcentr.png',
   providers:["lcu@lisk.bike", "marc@lisk.bike"],
   bikeimage: '/files/Testdata/liskbike.png',
   bikes: [ { title: 'Lisk Bike', description: 'Damesfiets', state: 'available',
              locktype: 'plainkey', locksettings: { keyid: '1001' }} ]
  },
  {title:"Lisk Bikes @ Lisk HQ ",
   address: "Eichhornstraße 3, 10785 Berlin, Germany",
   lat_lng: [ 52.506396, 13.373237],
   imageUrl:'/files/Testdata/liskcentr.png',
   providers:["berlin@lisk.bike", "marc@lisk.bike"],
   bikeimage: '/files/Testdata/liskbike.png',
   bikes: [ { title: 'Lisk Bike', description: 'Damesfiets', state: 'available',
              locktype: 'plainkey', locksettings: { keyid: '1001' }} ]
  },
  {title:"Bumos office Test Location",
   address: "Jutfaseweg 156A, Utrecht, Netherlands",
   lat_lng: [ 52.069018, 5.114817],
   imageUrl:'/files/Testdata/liskcentr.png',
   providers:["marc@lisk.bike"],
   bikeimage: '/files/Testdata/liskbike.png',
   bikes: [ { title: 'Lisk Bike', description: 'Damesfiets', state: 'available',
              locktype: 'plainkey', locksettings: { keyid: '1001' }}
            // { title: 'Skopei Demo Bike (160020)', description: 'de Skopei fiets met nummer 160020', state: 'available',
            //   locktype: 'skopei-v1', locksettings: { elockid: '160020'}},
            // { title: 'Skopei Demo Bike (160021)', description: 'de Skopei fiets met nummer 160021 ', state: 'available',
            //   locktype: 'skopei-v1', locksettings: { elockid: '160021'}},
            // { title: 'Skopei Demo Bike (170178)', description: 'de Skopei fiets met nummer 170178', state: 'available',
            //   locktype: 'skopei-v1', locksettings: { elockid: '170178'}},
            // { title: 'GoAbout Demo Bike', description: 'de GoAbout fiets met nummer xxxx', state: 'available',
            //   locktype: 'goabout-v1', locksettings: { elockid: '170178', code: 'asdfasdfasdfasdfasdf' }},
            // { title: 'OpenELock Demo Bike', description: 'de CommonBike Elock fiets met nummer xxxx', state: 'available',
            //   locktype: 'open-elock', locksettings: { elockid: '0611', code: 'herewegonow' }},
            // { title: 'Batavus 1 (AXA)', description: 'Fietsnr. 1122', state: 'available',
            //   locktype: 'axa-elock', locksettings: { connectionname: 'AXA lock EFGGGHA1321', pincode: '00908'}},
            // { title: 'Batavus 2 (KeyLocker)', description: 'Fietsnr. 1134', state: 'available',
            //   locktype: 'open-keylocker', locksettings: { keylocker: 1, pincode: '3692'}},
            // { title: 'Batavus 3', description: 'Fietsnr. 1145', state: 'available',
            //   locktype: 'open-keylocker', locksettings: { keylocker: 2, pincode: '7834'}},
            // { title: 'Batavus 4', description: 'Fietsnr. 1165', state: 'available'},
            // { title: 'Batavus 5', description: 'Fietsnr. 1166', state: 'outoforder'}
              ]
  },
];

export const cleanupTestUsers = function() {
  _.each(testUsers, function (userData) {
    var hithere=Accounts.findUserByEmail(userData.email);
    if(hithere) {
      // logout user prior to deleting
      Meteor.users.update({_id:hithere}, {$set: { "services.resume.loginTokens" : [] }});

      var id = hithere._id;

      _.each(userData.roles, function (role) {
          if (Roles.userIsInRole(id, [role])) {
              Roles.removeUsersFromRoles(id, [role]);
            }
        });

      Transactions.remove({userId: id});
      Meteor.users.remove({_id: id});
    }
  });
}

export const cleanupTestData = function() {
  _.each(testLocations, function (locationData) {
    var hereitis=Locations.findOne({title: locationData.title});
    if(hereitis) {
        var id = hereitis._id;

        // remove all objects for this location
        var myObjects = Objects.find({locationId: id}).fetch();
        _.each(myObjects, function (object) {
          Transactions.remove({objectId: object._id});
        });

        Objects.remove({locationId: id});

        Transactions.remove({locationId: id});
        Locations.remove({_id: id});
    }
  });
}

const GetRandomAvatar = () => {
  const url = 'https://randomuser.me/api/'
  const response = HTTP.get(url)
  const obj = JSON.parse(response.content)
  const avatar_url = obj.results[0].picture.large

  return avatar_url
}

export const checkTestUsers = function() {
    _.each(testUsers, function (userData) {
      var id;

      var hithere=Accounts.findUserByEmail(userData.email);
      if(hithere) {
      id = hithere._id;
    } else {
      // assign new keypair to object
      var keypair = BikeCoin.newKeypair();

      id = Accounts.createUser({
        email: userData.email,
        password: userData.password,
        profile: { name: userData.name,
                   avatar: userData.avatar || GetRandomAvatar(),
                   wallet: {
                     address:keypair.address,
                     privatekey:keypair.privatekey
                   }
        }
      });

      var anavatar = GetRandomAvatar();
      Meteor.users.update({_id: id}, {$set:{'avatar': anavatar}});

      // email verification
      Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true, 'profile.active':true}});
      Meteor.call('transactions.registerUser', id);
    }

    _.each(userData.roles, function (role) {
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

var createLock = function(locktype, locksettings,object) {
  var lockInfo = {};

  if(locktype!='axa-elock'&&locktype!='goabout-v1'&&locktype!='skopei-v1'&&locktype!='open-bikelocker'&&
     locktype!='open-keylocker'&&locktype!='open-elock'&&locktype!='plainkey') {
      // assume plainkey for unknown keytypes
      locktype='plainkey';
  }

  lockInfo = {
    type: locktype,
    settings: {} // add settings for axa e-lock here
  }

  if(locktype=='plainkey'||locktype=='open-bikelocker') {
    lockInfo.settings = Object.assign({keyid: '0000' }, locksettings);
  } else if(locktype=='open-keylocker') {
    lockInfo.settings = Object.assign({keylocker: 1, pincode: '1234'}, locksettings);
  } else if(locktype=='axa-elock') {
    lockInfo.settings = Object.assign({connectionname: 'AXA_HALLORONALD', pincode: '11111'}, locksettings);
  } else if(locktype=='skopei-v1') {
    lockInfo.settings = Object.assign({elockid: 'xxxxxx'}, locksettings);
  } else if(locktype=='goabout-v1'||locktype=='open-elock') {
    lockInfo.settings = Object.assign({elockid: 'xxxxxx', code: 'asdfadsfadsfasdfasdfasdf'}, locksettings);
  }

  return lockInfo;
}

export const checkTestLocations = function() {
  _.each(testLocations, function (locationData) {
    var locationId;


    var hereitis=Locations.findOne({title: locationData.title});
    if(hereitis) {
      locationId = hereitis._id;
    } else {
      if(!locationData.lat_lng) {
        locationData.lat_lng=Address2LatLng(locationData.address);
      }

      locationId = Locations.insert({
        title: locationData.title,
        description: locationData.description || '',
        address: locationData.address || '',
        lat_lng: locationData.lat_lng,
        imageUrl: locationData.imageUrl,
      });
    }

    var firstproviderid = null;
    _.each(locationData.providers, function (provider) {
      var hithere=Accounts.findUserByEmail(provider);
      if (hithere) {
        if(firstproviderid==null) {
          firstproviderid = hithere._id;
          firstprovidermail=hithere.emails[0].address;
        }

        Meteor.users.update({_id: hithere._id}, {$addToSet: {'profile.provider_locations': locationId}} );
      }
    });

    var timestamp =  new Date().valueOf();
    _.each(locationData.bikes, function (bike) {
      var gimmebike=Objects.findOne({locationId: locationId, title: bike.title});
      if (!gimmebike) {

        var lockinfo = null;
        if(!bike.locktype) {
          lockinfo = createLock('plainkey');
        } else {
          lockinfo = createLock(bike.locktype, bike.locksettings);
        }

        var priceinfo = {
          value: '0',
          currency: 'euro',
          timeunit: 'day',
          description: 'tijdelijk gratis'
        };

        // assign new keypair to object
        var keypair = BikeCoin.newKeypair();

        var walletinfo = {
          address:keypair.address,
          privatekey:keypair.privatekey
        }

        var keyid = Objects.insert({
          locationId: locationId,
          title: bike.title,
          description: bike.description,
          imageUrl: locationData.bikeimage,
          state: { state: bike.state,
                   userId: firstproviderid,
                   timestamp: timestamp,
                   userDescription: '' },
          lock: lockinfo,
          price: priceinfo,
          wallet: walletinfo
        });
      }
    });
  });
};

Meteor.methods({
  'testdata.cleanupTestUsers'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    cleanupTestUsers();

    var description = "Testgebruikers verwijderd door " + getUserDescription(Meteor.user());
    Meteor.call('transactions.addTransaction', 'ADMIN_CLEANUP_TESTUSERS', description, this.userid, null, null, null);

  },
  'testdata.cleanupTestData'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    cleanupTestData();

    var description = "Testdata verwijderd door " + getUserDescription(Meteor.user());
    Meteor.call('transactions.addTransaction', 'ADMIN_CLEANUP_TESTUSERS', description, this.userid, null, null, null);
  },
  'testdata.checkTestUsers'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    checkTestUsers();

    var description = "Testgebruikers toegevoegd door " + getUserDescription(Meteor.user());
    Meteor.call('transactions.addTransaction', 'ADMIN_CLEANUP_TESTUSERS', description, this.userid, null, null, null);
  },
  'testdata.checkTestLocations'(data) {
    // Make sure the user is logged in
    if (!Meteor.userId||!Roles.userIsInRole( this.userId, 'admin' )) throw new Meteor.Error('not-authorized');

    checkTestLocations();

    var description = "Testdata toegevoegd door " + getUserDescription(Meteor.user());
    Meteor.call('transactions.addTransaction', 'ADMIN_CLEANUP_TESTUSERS', description, this.userid, null, null, null);
  }
});
