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
import { createSendCommand, processSinglePacket } from '/server/api/concox-bl10.js'; // methods

// import '/server/api/paymentservices/mollie.js'; // methods

Meteor.startup(() => {
	// code to run on server at startup
	
	const cDefaultBikeAccount = {
		"passphrase":"debris glare sustain expire cloth shove paper grit flock vital object laptop",
		"privateKey":"49f24b696c7d31b6f85ae496aad43869c3e40cf553b17080e7550639b93338dcb6b88243c1aea70a9c1770cac22e510f884013d97a5402ae3555e70340057962",
		"publicKey":"b6b88243c1aea70a9c1770cac22e510f884013d97a5402ae3555e70340057962",
		"address":"5079673205830650891L"}
	
	if(true) {
		var myObjects = Objects.find().fetch();
		_.each(myObjects, function (objectData) {
			if("passphrase" in objectData.wallet == false) {
				console.log("updating object wallet for " + objectData.title)
		    Objects.update(objectData._id, {$unset:{ wallet: "" }});
				Objects.update(objectData._id, {$set:{ wallet: {   passphrase: '', privateKey: '', publicKey: '', address: '' }}});
			}
			
			if(objectData.title=="Lisk Bike #1" && objectData.wallet.privatekey!=cDefaultBikeAccount.privateKey) {
				console.log("initialize bike #1 with default bike account");
				Objects.update(objectData._id, {$set:{ wallet: cDefaultBikeAccount}});
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
			if("passphrase" in user.profile.wallet == false) {
				console.log()
		    Meteor.users.update(user._id, {$unset:{ 'profile.wallet': "" }});
				Meteor.users.update(user._id, {$set:{ 'profile.wallet': {   passphrase: '', privateKey: '', publicKey: '', address: '' }}});
			}

			if("passphrase" in user.profile.wallet == false) {
				console.log()
		    Meteor.users.update(user._id, {$unset:{ 'profile.wallet': "" }});
				Meteor.users.update(user._id, {$set:{ 'profile.wallet': {   passphrase: '', privateKey: '', publicKey: '', address: '' }}});
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

const net = require('net');

var resetsent = false;

var server = net.createServer(Meteor.bindEnvironment(function(socket) {
  // console.log('incoming connection from %s',  socket.remoteAddress);
  socket.on('data', Meteor.bindEnvironment(function(data) {
    const buf = data.toString('hex');
    const cmdSplit = buf.split(/(?=7878|7979)/gi)
    cmdSplit.map( buf => {
      processSinglePacket(socket, buf);
    });
  }));
	
  if(false==resetsent) {
    console.log("send command");
    // socket.write(createSendCommand('GPRSSET#'))
    // Server:1,app.lisk.bike,9020,0
    // socket.write(createSendCommand('SERVER,1,app.lisk.bike/api/liskbike,80,0#'))
		// socket.write(createSendCommand('UNLOCK#'))
    resetsent=true;
  }

	// socket.write('Echo server\r\n');
	// socket.pipe(socket);

  socket.on('error', function(data) {
    console.log("%o",data);
  })
}));

// ---------------------------------------------------
// for now the bl10 server is parked in the meteor app
// so that I can use the mongodb for state storage
//
// later on when things run through the blockchain
// it can be moved to a separate process. This process
// can either run standalone or be controlled by using pm2
// commands issued by the meteor backend.

let port = 3005;                // listening port
let serverip = '0.0.0.0'; // external IP address for this server

console.log('starting concox BL10 server on %s:%s', serverip, port);
server.listen(port, serverip);