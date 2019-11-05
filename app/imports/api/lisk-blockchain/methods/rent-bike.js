const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');
const { getSettingsClientSide } = require('/imports/api/settings.js');
const { getTimestamp, getBike } = require('../_helpers.js');

import { Promise } from 'meteor/promise';

const rentBike = async (providerUrl, bike, renterAccount) => {
    const client = new APIClient([providerUrl]);

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

    const settings = await getSettingsClientSide();
    if(!settings) return false;

    const rentResult = rentBike(
        settings.bikecoin.provider_url,
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
