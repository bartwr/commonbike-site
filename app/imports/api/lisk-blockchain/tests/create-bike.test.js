require('dotenv').config()
const fs = require('fs');
const { APIClient } = require('@liskhq/lisk-client');
const transactions = require('@liskhq/lisk-transactions');
const client = new APIClient([`http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`]);
const { getTimestamp } = require('../_helpers.js');

// Get custom transaction types
const CreateBikeTransaction = require('../transactions/create-bike'); // require the newly created transaction type 'HelloTransaction'

// Get 'account'
const account = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json')); 

// Get bike ID
const bikeId = account.publicKey;

// Create tx
const tx = new CreateBikeTransaction({
  senderPublicKey: account.publicKey,
  recipientId: account.address,
  timestamp: getTimestamp(),
  asset: {
    id: account.address, //Number(bikeId).toString(),
    title: 'hello bike!',
    description: 'Rent me! I\'m a very good bike.',
    pricePerHour: transactions.utils.convertLSKToBeddows("1"),
    deposit: transactions.utils.convertLSKToBeddows("20"),
    latitude: null,
    longitude: null
  }
});
console.log(tx);

// Sign transaction
tx.sign(account.passphrase);

// Broadcast the tx to the blockchain
const broadcastTx = client.transactions.broadcast(tx.toJSON());

broadcastTx.then(() => {
  console.info(`Bike #${bikeId} created`);
})
.catch(error => {
  console.error(error);
});
