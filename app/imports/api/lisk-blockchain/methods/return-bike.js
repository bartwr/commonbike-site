const { APIClient } = require('@liskhq/lisk-client');
const ReturnBikeTransaction = require('../transactions/return-bike');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');

import { Promise } from 'meteor/promise';

const returnBike = async (client, bikeAddress, bikeDeposit, renterAccount) => {

    const tx =  new ReturnBikeTransaction({
        asset: {
            id: bikeAddress,
        },
        amount: transactions.utils.convertLSKToBeddows(bikeDeposit.toString()),
        senderPublicKey: renterAccount.publicKey,
        recipientId: bikeAddress,
        timestamp: getTimestamp(),
    });

    tx.sign(renterAccount.passphrase);
    // console.log(tx);

    return await client.transactions.broadcast(tx.toJSON());
}

const doReturnBike = async (renterAccount, bikeAddress, bikeDeposit) => {
  const settings = await getSettingsClientSide();
  if(!settings) return false;

  const client = new APIClient([settings.bikecoin.provider_url]);
  if(!client) return false;

  const returnResult = returnBike(
      client,
      bikeAddress,
      bikeDeposit,
      renterAccount
  );
  returnResult.then(result => {
      // console.log(result)
  }, (err) => {
      alert(err)
  })

  return returnResult;
}

module.exports = {doReturnBike}
