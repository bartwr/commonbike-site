require('dotenv').config()
const { APIClient } = require('@liskhq/lisk-client');
const { prefix, getTimestamp, getProviderURL } = require('../_helpers.js');
const RentBikeTransaction = require('../transactions/rent-bike');
const transactions = require('@liskhq/lisk-transactions');
const fs = require('fs');

const rentbike = async (renteraccount, bikeaddress) => {
  const client = new APIClient([getProviderURL()]);

  // find the bike info on the blockchain
  let account = undefined;
  let accountlist = await client.accounts.get({address:bikeaddress});
  if(accountlist.data.length==1) {
    account = accountlist.data[0];
  } else {
    console.log("bike account not found. Please try again");
    return false;
  }

  const tx = new RentBikeTransaction({
      asset: {
          id: bikeaddress, 
      },
      amount: account.asset.deposit,
      senderPublicKey: renteraccount.publicKey,
      recipientId: bikeaddress,
      timestamp: getTimestamp(),
  });

  tx.sign(renteraccount.passphrase);
  // console.log(tx);

  return await client.transactions.broadcast(tx.toJSON())
}

// Get 'accounts'
const renteraccount = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json'));
const bikeaddress = process.argv[3];

if(undefined==renteraccount) { console.log("Owner account not found"); return; }
if(undefined==bikeaddress) { console.log("Bicycle account not found"); return; }

console.log("Renter %s will rent bike %s", renteraccount.address, bikeaddress);

rentbike(renteraccount, bikeaddress)
.catch(error => {
  console.error(error);
});