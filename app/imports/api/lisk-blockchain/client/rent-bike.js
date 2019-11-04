const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');

const { getTimestamp, getBike } = require('../_helpers.js');
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

    return await client.transactions.broadcast(tx.toJSON())
}

const doRentBike = async (renterAccount, bikeAccount) => {
    const bike = await getBike(client, bikeAccount);
      
    const rentResult = rentBike(bike, renterAccount);
    rentResult.then(result => {
        // console.log(result)
    }, (err) => {
        alert(err.errors[0].message)
    })

    return rentResult;
}

module.exports = {doRentBike}
