const { APIClient } = require('@liskhq/lisk-client');
const RentBikeTransaction = require('../transactions/rent-bike');

const { getTimestamp, getBike } = require('./_helpers.js');
const client = new APIClient(['http://brainz.lisk.bike:4000']);

const rentBike = (bike, renterAccount) => {
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

    return client.transactions.broadcast(tx.toJSON())
    .then(() => tx)
    .catch(err => {
      console.error("rent-bike.err2:", err);
      // return Promise.reject(err);
    });
}

const doRentBike = async (renterAccount, bikeAccount) => {
    const bike = await getBike(client, bikeAccount);
    console.log("bike:", bike);
      
    const rentResult = await rentBike(bike, renterAccount);
    console.log(rentResult);

    return rentResult;
}

module.exports = {doRentBike}
