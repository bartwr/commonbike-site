const { APIClient } = require('@liskhq/lisk-client');
const UpdateBikeLocationTransaction = require('../transactions/update-bike-location');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');

import { Promise } from 'meteor/promise';

const updateBikeLocation = async (client, bikeAccount, prevLatitude, prevLongitude, newLatitude, newLongitude) => {

    const tx = new UpdateBikeLocationTransaction({
        asset: {
            id: bikeAccount.address, // XXX or use bike.address
            previousLatitude: Number(prevLatitude).toString(),
            previousLongitude: Number(prevLongitude).toString(),
            latitude: Number(newLatitude).toString(),
            longitude: Number(newLongitude).toString(),
        },
        amount: 0, // transactions.utils.convertLSKToBeddows(bikeDeposit.toString()),
        senderPublicKey: bikeAccount.publicKey,
        recipientId: bikeAccount.address,
        timestamp: getTimestamp(),
    });

    tx.sign(bikeAccount.passphrase);
    console.log(tx);

    return client.transactions.broadcast(tx.toJSON())
}

const doUpdateBikeLocation = async (bikeAccount, newLatitude, newLongitude) => {
  const settings = await getSettingsClientSide();
  if(! settings) return false;

  const client = new APIClient([settings.bikecoin.provider_url]);
  if(! client) return false;
  
  // fetch current bike info from the blockchain
  let bikestatus = await client.accounts.get({address:bikeAccount.address});
  if(bikestatus.data.length!=1) {
    return false;
  }
  
  let oldlocation = bikestatus.data[0].asset.location || {latitude:0, longitude:0};
  
  const result = updateBikeLocation(
        client,
        bikeAccount,
        oldlocation.latitude,
        oldlocation.longitude,
        newLatitude,
        newLongitude);
  result.then(result => {
      // console.log(result)
  }, (err) => {
      console.error(err.errors[0].message)
  })

  return result;
}

module.exports = {doUpdateBikeLocation}
