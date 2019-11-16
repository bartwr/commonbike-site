require('dotenv').config()
const { APIClient } = require('@liskhq/lisk-client');
const { prefix, getTimestamp, getProviderURL } = require('../_helpers.js');
const ReturnBikeTransaction = require('../transactions/return-bike');
const transactions = require('@liskhq/lisk-transactions');
const fs = require('fs');

const returnbike = async (bikeaccount) => {
  const client = new APIClient([getProviderURL()]);

  // find the bike info on the blockchain
  let account = undefined;
  let accountlist = await client.accounts.get({address:bikeaccount.address});
  if(accountlist.data.length==1) {
    account = accountlist.data[0];
  } else {
    console.log("bike account not found. Please try again");
    return false;
  }

  let asset = {
      id: bikeaccount.address,
  }
  
  let prevlatitude = account.asset.location ? account.asset.location.latitude : 0;
  let prevlongitude = account.asset.location ? account.asset.location.longitude : 0;
  
  // move bike around
  latitude = prevlatitude + Math.random() / 100;
  longitude = prevlongitude + Math.random() / 100;

  asset.location = {longitude,latitude};
  asset.prevlocation = {prevlongitude,prevlatitude};

  const tx = new ReturnBikeTransaction({
      asset,
      // amount: transactions.utils.convertLSKToBeddows(bikeDeposit.toString()),
      senderPublicKey: bikeaccount.publicKey,
      recipientId: bikeaccount.address,
      timestamp: getTimestamp(),
  });

  tx.sign(bikeaccount.passphrase);
  
  return await client.transactions.broadcast(tx.toJSON());
}

// Get 'accounts'
const bikeaccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json'));

if(undefined==bikeaccount) { console.log("Bicycle account not found"); return; }

console.log("Bike %s will be locked", bikeaccount);

returnbike(bikeaccount)
.catch(error => {
  console.error(error);
});