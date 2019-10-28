const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');

const { getTimestamp, getBike } = require('./_helpers.js');
const client = new APIClient(['http://brainz.lisk.bike:4000']);

import { Promise } from 'meteor/promise';

const rentBike = async (bike, renterAccount) => {
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

    return new Promise((resolve, reject) => {
        client.transactions.broadcast(tx.toJSON())
            .then((res) => {
              console.log('res', res)
              alert(JSON.stringify(res));
              resolve(res);
            })
            .catch(err => {
              alert(JSON.stringify(err.errors[0].message));
              console.log('err', err)
              reject(err);
            });
    })
}

const doRentBike = async (renterAccount, bikeAccount) => {
    const bike = await getBike(client, bikeAccount);
    console.log("bike:", bike);
      
    const rentResult = await rentBike(bike, renterAccount);
    console.log('rentResult', rentResult);

    return rentResult;
}

module.exports = {doRentBike}
