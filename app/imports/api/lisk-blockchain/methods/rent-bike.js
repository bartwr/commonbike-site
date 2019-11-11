const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');

import { Promise } from 'meteor/promise';

const rentBike = async (client, bikeAddress, bikeDeposit, renterAccount) => {

    const tx = new RentBikeTransaction({
        asset: {
            id: bikeAddress, // XXX or use bike.address
        },
        amount: transactions.utils.convertLSKToBeddows(bikeDeposit.toString()),
        senderPublicKey: renterAccount.publicKey,
        recipientId: bikeAddress,
        timestamp: getTimestamp(),
    });

    tx.sign(renterAccount.passphrase);
    // console.log(tx);

    return await client.transactions.broadcast(tx.toJSON())
}

const doRentBike = async (renterAccount, bikeAddress, bikeDeposit) => {
  const settings = await getSettingsClientSide();
  if(! settings) return false;

  const client = new APIClient([settings.bikecoin.provider_url]);
  if(! client) return false;
  
  const rentResult = rentBike(
        client,
        bikeAddress,
        bikeDeposit,
        renterAccount
    );
  rentResult.then(result => {
      // console.log(result)
  }, (err) => {
      alert(err.errors[0].message)
  })

  return rentResult;
}

module.exports = {doRentBike}
