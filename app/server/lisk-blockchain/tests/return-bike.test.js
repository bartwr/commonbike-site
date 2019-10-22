require('dotenv').config()
const fs = require('fs');
const { APIClient } = require('@liskhq/lisk-client');
const ReturnBikeTransaction = require('../transactions/return-bike');

const { getTimestamp, getBike } = require('./_helpers.js');

const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);
const renterAccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json')); 
const bikeAccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[3]+'.json')); 


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

// test-coode
getBike(client, bikeAccount).then(bike => {
  console.log("bike:", bike);

  returnBike(bike, renterAccount).then(returnResult => {
    console.log(returnResult);
  });
})

