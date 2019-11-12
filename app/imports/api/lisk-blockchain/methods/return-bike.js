const { APIClient } = require('@liskhq/lisk-client');
const ReturnBikeTransaction = require('../transactions/return-bike');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');

import { Promise } from 'meteor/promise';

const returnBike = async (client, bikeAddress, renterAccount, location, prevlocation) => {
  
    let asset = {
        id: bikeAddress,
    }
    
    if(location.longitude==undefined) {
      location={longitude:51,latitude:0};
      prevlocation={longitude:51,latitude:0};
    }

    if(location!=false&&prevlocation!=false) {
      asset.location = location;
      asset.prevlocation = prevlocation;
    }

    const tx = new ReturnBikeTransaction({
        asset,
        // amount: transactions.utils.convertLSKToBeddows(bikeDeposit.toString()),
        senderPublicKey: renterAccount.publicKey,
        recipientId: bikeAddress,
        timestamp: getTimestamp(),
    });

    tx.sign(renterAccount.passphrase);
    
    console.log(tx);

    return await client.transactions.broadcast(tx.toJSON());
}

const doReturnBike = async (renterAccount, bikeAddress, location, prevlocation) => {
  const settings = await getSettingsClientSide();
  if(!settings) return false;

  const client = new APIClient([settings.bikecoin.provider_url]);
  if(!client) return false;

  const returnResult = returnBike(
      client,
      bikeAddress,
      renterAccount,
      location,
      prevlocation
  );
  returnResult.then(result => {
      // console.log(result)
  }, (err) => {
      alert(err)
  })

  return returnResult;
}

module.exports = {doReturnBike}
