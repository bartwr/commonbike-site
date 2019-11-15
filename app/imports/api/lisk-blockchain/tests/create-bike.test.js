require('dotenv').config()
const fs = require('fs');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const { APIClient } = require('@liskhq/lisk-client');
const transactions = require('@liskhq/lisk-transactions');
const { getTimestamp, getProviderURL } = require('../_helpers.js');

// Get custom transaction types
const CreateBikeTransaction = require('../transactions/create-bike'); // require the newly created transaction type 'HelloTransaction'

// Make connection to the blockchain
const client = new APIClient([getProviderURL()]);

if(process.argv.length!=4) {
  console.log("You need two accounts to create a bike (owner + bicycle)");
  console.log("usage node create-bike-test.js <owner account name> <bicycle account name>");
  return;
}

// Get 'accounts'
const owneraccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json'));
const bikeaccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[3]+'.json'));

if(undefined==owneraccount) { console.log("Owner account not found"); return; }
if(undefined==bikeaccount) { console.log("Bicycle account not found"); return; }

// create a nice start location for the bike
let base = [52.090621, 5.121474] // put bike at a random location near utrecht
// let base = [52.499752, 13.376343] // put bike at a random location in berlin

latitude = base[0] + Math.random() / 100;
longitude = base[1] + Math.random() / 100;

// create a nice name for the bike
const words = Mnemonic.generateMnemonic().split(" ");
const title = words[0] + " " + words[1];

// Create tx
const tx = new CreateBikeTransaction({
  senderPublicKey: owneraccount.publicKey,
  recipientId: bikeaccount.address,
  timestamp: getTimestamp(),
  asset: {
    id: bikeaccount.address,
    title,
    description: 'yet another cool bike on the blockchain!',
    ownerid: owneraccount.address,
    pricePerHour: transactions.utils.convertLSKToBeddows("1"),
    deposit: transactions.utils.convertLSKToBeddows("20"),
    latitude,
    longitude
  }
});

// Sign transaction
tx.sign(owneraccount.passphrase);

// Broadcast the tx to the blockchain
const broadcastTx = client.transactions.broadcast(tx.toJSON());

broadcastTx.then((info) => {
  console.info(`Bike '%s' with id %s created`, title, bikeaccount.address);
})
.catch(error => {
  console.error(error);
});
