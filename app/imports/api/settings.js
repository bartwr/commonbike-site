import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
import { getUserDescription } from '/imports/api/users.js';
import {CoinSchema} from '/imports/api/bikecoinschema.js';

export const Settings = new Mongo.Collection('settings');

const latestSettingsVersion = 1;		// FUTURE: for automatic update of settings later on
export const defaultProfileName = 'default';   // FUTURE: multiple profiles

// set fields/objects that are also visible to the client here
const publicFieldset = {profileName:1, mapbox:1, gps: 1,
	                      "bikecoin.provider_url": 1 };

if (Meteor.isServer) {
	Meteor.publish('settings', function settingsPublication(profileName) {
		if(!profileName) {
			profileName=defaultProfileName
		}

		if(Roles.userIsInRole( this.userId, 'admin' )) {
			return Settings.find({profileName: profileName});
		} else {
			return Settings.find({profileName: profileName}, {fields: publicFieldset});
		}
	});

	// use this function serverside to get all settings
	export const getSettingsServerSide = function(profileName) {
		if( ! profileName) {
			profileName = defaultProfileName
		}

		var settings = Settings.findOne({profileName: profileName});

		if(!settings) {
			Meteor.call('settings.check');

			settings = Settings.findOne({profileName: profileName});
		}

		return Settings.findOne({profileName: profileName});
	}
}

// use this function serverside to get client side settings
export const getSettingsClientSide = function(profileName) {
	if( ! profileName) {
		profileName = defaultProfileName
	}

	return Settings.findOne({profileName: profileName});
}

export const MapboxSchema = new SimpleSchema({
  'style': {
    type: String,
    label: "mapbox.style",
    defaultValue: 'mapbox.streets'
  },
  'userId': {
    type: String,
    label: "mapbox.accessToken",
    // defaultValue: '<fill in mapbox access token here>'
    defaultValue: 'pk.eyJ1IjoiZXJpY3ZycCIsImEiOiJjaWhraHE5ajIwNmRqdGpqN2h2ZXhqMnRsIn0.1FBWllDyQ_nSlHFE2jMLDA'
  }
});

export const OnboardingSchema = new SimpleSchema({
  'enabled': {
    type: Boolean,
    label: "onboarding.enabled",
    defaultValue: 'false'
  }
});

export const BackupSchema = new SimpleSchema({
  'location': {
    type: String,
    label: "Backup Location",
    defaultValue: '~/backup-liskbike'
  }
});

export const GPSSchema = new SimpleSchema({
	'enabled': {
    type: Boolean,
    label: "gps enabled",
    defaultValue: 'false'
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
  }
});

export const CoinSettingsSchema = new SimpleSchema({
	'provider_url': {
    type: String,
    label: "bikecoin.provider_url",
    defaultValue: ''
  },
	wallet: {
		type: CoinSchema
	}
})

// for now there is only one set of settings. Later on profilename can be used later
// to use different settings for different instances

export const DevelopmentOptionsSchema = new SimpleSchema({
	'showTestButtons': {
    type: Boolean,
    label: "Show Test Buttons",
    defaultValue: 'false'
  },
	'forwardRequests': {
		type: Boolean,
    label: "Forward incoming requests",
    defaultValue: 'false'
	},
	'forwardRequestsURL': {
		type: String,
    label: "Forwarding Destination URL",
    defaultValue: 'http://luggage.dyndns.tv:7777'
	}
});

export const SettingsSchema = new SimpleSchema({
  _id: {
  	type: String,
  },
  profileName: {
    type: String,
    label: "profile name",
    defaultValue: 'standard'
  },
  version: {
    type: Number,
    label: "settings structure version",
    defaultValue: latestSettingsVersion
  },
	baseurl: {
    type: String,
    label: "base url",
    defaultValue: ''
  },
  mapbox: {
    type: MapboxSchema
  },
	onboarding: {
		type: OnboardingSchema
  },
	backup: {
    type: BackupSchema
  },
	gps: {
    type: GPSSchema
  },
	bikecoin: {
	    type: CoinSettingsSchema
  },
	developmentOptions: {
		type: DevelopmentOptionsSchema
	},
});

if (Meteor.isServer) {
	Meteor.methods({
	  'settings.check'() {
	    // Make sure this runs serverside only
	    if ( ! Meteor.isServer) throw new Meteor.Error('not-authorized');

	    // for now there is only one settings profile
		  var settings = Settings.findOne({profileName: defaultProfileName});
	    if( !settings) {
		    var settingsId = Settings.insert({});
	    	settings = {
	    		_id: settingsId,
	    		profileName: defaultProfileName,
	    		version: latestSettingsVersion,
					baseurl: '',
	    		mapbox: {
					  style: 'mapbox.streets',
					  userId: '<mapbox access token has not been set in system settings>'
					},
					onboarding: {
					  enabled:false
					},
					backup: {
					  location:''
					},
					gps: {
						enabled:true,
						lat_lng: [999,999]
				  },
					bikecoin: {
						provider_url: '',
						wallet: {
							passphrase: '',
							privateKey: '',
							publicKey: '',
							address: ''
						}
					},
					developmentOptions: {
						showTestButtons: false,
						forwardRequests: false,
						forwardRequestsURL: 'http://luggage.dyndns.tv:7777'
					},
	    	}

				try {
		      check(settings, SettingsSchema);
		    } catch(ex) {
		      console.log('data for new settings does not match schema: ' + ex.message);
		      throw new Meteor.Error('invalid-settings');
		      return;
		    }

				Settings.update(settingsId, settings, {validate: false});

		    var description = 'Standaard instellingen aangemaakt';
				console.log(description);
	    } else {
				if("developmentOptions" in settings == false) {
					settings.developmentOptions = {
						showTestButtons: false,
						forwardRequests: false,
						forwardRequestsURL: "http://luggage.dyndns.tv:7777"
					}
				
					console.log("added Development options to settings")
					Settings.update(settings._id, settings, {validate: false});
				}
				
				if("passphrase" in settings.bikecoin.wallet == false) {
					console.log("update settings wallet")
					Settings.update(settings._id, {$unset:{ 'bikecoin.wallet': "" }});
					Settings.update(settings._id, {$set:{ 'bikecoin.wallet': {   passphrase: '', privateKey: '', publicKey: '', address: '' }}});
				}
				
				if("token_address" in settings.bikecoin != false) {
					console.log("remove bikecoin.token_address from settings")
					Settings.update(settings._id, {$unset:{ 'bikecoin.token_address': "" }});
				}
				
				if("token_abi" in settings.bikecoin != false) {
					console.log("remove bikecoin.token_abi from settings")
					Settings.update(settings._id, {$unset:{ 'bikecoin.token_abi': "" }});
				}

				if("enabled" in settings.bikecoin != false) {
					console.log("remove enabled from settings")
					Settings.update(settings._id, {$unset:{ 'bikecoin.enabled': "" }});
				}

		    try {
		      check(settings, SettingsSchema);
		    } catch(ex) {
		      console.log('data for settings does not match schema: ' + ex.message);
					console.log(JSON.stringify(ex.message));
					console.log(ex);
			  	throw new Meteor.Error('invalid-settings');
		    }
	    }

			// Do settings initialisation below this line. Code above assures that the
			// structures are present in the database, code below should set values
			// so that it works out of the box when doing a fresh installation
			if(settings.bikecoin.provider_url==''||
		     settings.bikecoin.provider_url.includes('infura') == true) {
				// key generation will fail if there is no provider_url set
				console.log('setting provider URL to brainz.lisk.bike testnode');
				settings.bikecoin.provider_url='http://brainz.lisk.bike:4000';

				Settings.update(settings._id, settings, {validate: false});	// todo: make net selectable in the configuration
			}
			
			if(Meteor.users.find().fetch().length==0) {
				console.log('create genesis user');

				Accounts.createUser({
						username: 'backend-admin',
						email : 'admin@lisk.bike',
						password : 'lisk!!!!',
						profile  : {
								active: true
						}
				});
			}

			if(Meteor.users.find().fetch().length==1) {
					var user = Meteor.users.find().fetch()[0];
					if(!Roles.userIsInRole(user._id, ["admin"])) {
						console.log('giving user ' + user._id + ' admin role');
						Roles.addUsersToRoles(user._id, ['admin']);
					}
			}
	  },
	  'settings.update'(settingsId, settings) {
	    // Make sure an adminuser is logged in
	    if(!Meteor.userId()||!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
	    	 throw new Meteor.Error('not-authorized');
	    }

	    try {
	      check(settings, SettingsSchema);
	    } catch(ex) {
	      console.log('data for new settings does not match schema: ' + ex.message);
	  	  throw new Meteor.Error('schema-error');
	    }

			Settings.update(settingsId, settings, {validate: false});

	    var description = getUserDescription(Meteor.user()) + ' heeft de instellingen van profiel ' + settings.profileName + ' gewijzigd';
			console.log(description);
	  },
	  'settings.applychanges'(_id, changes) {
		  // Make sure the user is logged in
		  if (! Meteor.userId()) throw new Meteor.Error('not-authorized');

			var context =  SettingsSchema.newContext();
			if(context.validate({ $set: changes}, {modifier: true} )) {
        var oldsettings = Settings.findOne(_id);

        // log original values as well
        var logchanges = {};
        Object.keys(changes).forEach((fieldname) => {
          // convert dot notation to actual value
          val = new Function('_', 'return _.' + fieldname)(oldsettings);
          logchanges[fieldname] = { new: changes[fieldname],
          	                        prev: val||'undefined' };
        });

				Settings.update(_id, {$set : changes} );

        var description = getUserDescription(Meteor.user()) + ' heeft de systeeminstellingen gewijzigd';
				console.log(description);
			};
    }
	});

	Meteor.startup(() => {
		Meteor.call('settings.check');
	});
}
