const { APIClient } = require('@liskhq/lisk-client');
const ReturnBikeTransaction = require('../transactions/return-bike');

const { getTimestamp, getBike } = require('../_helpers.js');
const client = new APIClient(['http://brainz.lisk.bike:4000']);

import { Promise } from 'meteor/promise';

const returnBike = (bike, renterAccount) => {
    const tx =  new ReturnBikeTransaction({
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

    return client.transactions.broadcast(tx.toJSON())
    .then(() => tx)
    .catch(err => {
      console.error("return-bike.err2:", err);
      // return Promise.reject(err);
    });
}

const doReturnBike = async (renterAccount, bikeAccount) => {
    const bike = await getBike(client, bikeAccount);
      
    const returnResult = returnBike(bike, renterAccount);
    returnResult.then(result => {
        // console.log(result)
    }, (err) => {
        alert(err.errors[0].message)
    })

    return returnResult;
}

module.exports = {doReturnBike}
