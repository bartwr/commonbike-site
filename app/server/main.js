import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'

import { Settings } from '/imports/api/settings.js';
import '/imports/api/users.js'
import BikeCoin from '/imports/api/bikecoin.js'
import { Objects } from '/imports/api/objects.js';
import '/imports/api/api-keys.js'
import { Log } from '/imports/api/log.js'
import '/imports/server/testdata.js'
import '/imports/api/databasetools.js';
// import '/server/api/paymentservices/mollie.js'; // methods

Meteor.startup(() => {
	// code to run on server at startup
	
	if(false) {
		var myObjects = Objects.find().fetch();
		_.each(myObjects, function (objectData) {
		    var timestamp =  new Date().valueOf();
		    var length = 5;
		    var base = Math.pow(10, length+1);
		    var code = Math.floor(base + Math.random() * base)
		    var keycode = code.toString().substring(1, length+1);

			if(!objectData.state) {
			    Objects.update(objectData._id, {$set:{
			      state: {state: 'available',
	              		  userId: null,
	                      timestamp: timestamp}
			    }});
			}

			if(!objectData.lock) {
			    Objects.update(objectData._id, {$set:{
			      lock: {type: 'plainkey',
			             settings: {keyid: keycode }
			         }
			    }});
			}
		});

		var myUsers = Meteor.users.find().fetch();
		_.each(myUsers, function (user) {
			if(!user.profile || !user.profile.active) {
				Meteor.users.update(user._id, {$set : { 'profile.active' : false }});
			}
			if(!user.profile || !user.profile.name) {
				Meteor.users.update(user._id, {$set : { 'profile.name' : 'anonymous' }});
			}
			if(!user.profile || !user.profile.avatar) {
				Meteor.users.update(user._id, {$set : { 'profile.avatar' : '' }});
			}
		});
	}

	if(true) {
		_.each(myObjects, function (objectData) {
			if(objectData.coordinates) {
		    Objects.update(objectData._id, {$unset:{ coordinates: "" }});
			}
			if(objectData.point) {
		    Objects.update(objectData._id, {$unset:{ point: "" }});
			}
		});
	}

  var myUsers = Meteor.users.find().fetch();
	_.each(myUsers, function (user) {
		if(!user.profile || !user.profile.active) {
			Meteor.users.update(user._id, {$set : { 'profile.active' : false }});
		}
		if(!user.profile || !user.profile.name) {
			Meteor.users.update(user._id, {$set : { 'profile.name' : 'anonymous' }});
		}
		if(!user.profile || !user.profile.avatar) {
			Meteor.users.update(user._id, {$set : { 'profile.avatar' : '' }});
		}
		if(!user.profile || !user.profile.cancreateobjects) {
			Meteor.users.update(user._id, {$set : { 'profile.cancreateobjects' : 'false' }});
		}

		if(!user.profile || !user.profile.wallet) {
			Meteor.users.update(user._id, {$set : { 'profile.wallet.address' : '',
		                                          'profile.wallet.privatekey' : '' }});
		}

		if(user.profile && user.profile.wallet &&
		   user.profile.wallet.address=='' && user.profile.wallet.privatekey=='') {

			var keypair = BikeCoin.newKeypair();
			Meteor.users.update(user._id, {$set : { 'profile.wallet.address' : keypair.address,
		                                          'profile.wallet.privatekey' :  keypair.privatekey	}});
		}

	});


});

Meteor.methods( {
  'login.finduser'(email) {
    var daUser = Accounts.findUserByEmail(email);
    if(daUser) {
      return [daUser];
    } else {
      return [];
    }
  }
});
