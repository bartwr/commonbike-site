const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');

import { Promise } from 'meteor/promise';

const rentBike = async (client, bike, renterAccount) => {

    const tx = new RentBikeTransaction({
        asset: {
            id: bike.id, // XXX or use bike.address
        },
        amount: bike.deposit,
        senderPublicKey: renterAccount.publicKey,
        recipientId: bike.id,
        timestamp: getTimestamp(),
    });

    tx.sign(renterAccount.passphrase);
    // console.log(tx);

    return await client.transactions.broadcast(tx.toJSON())
}

const doRentBike = async (renterAccount, bikeAccount) => {
  const settings = await getSettingsClientSide();
  if(!settings) return false;

  const client = new APIClient([settings.bikecoin.provider_url]);
  if(!client) return false;
  
  const bike = await getBike(client, bikeAccount);
  if(undefined==bike) return false;
  
  const rentResult = rentBike(
        client,
        bike,
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
