require('dotenv').config()
const { APIClient } = require('@liskhq/lisk-client');
const { prefix, getTimestamp, getProviderURL } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');
const util = require('util')

// get all "create bike transactions"
const listbikes = async (showdetails) => {
  // Make connection to the blockchain
  const client = new APIClient([getProviderURL()]);

  const createbiketxs = await client.transactions.get({ type: '1001' });
  for(let i=0; i<createbiketxs.data.length;i++) {
    let tx = createbiketxs.data[i];

    let description = util.format("%s - '%s' owned by %s", tx.asset.id, tx.asset.title, tx.asset.ownerid)
    
    // Now lookup the account info for this bike
    let account;
    let accountlist = await client.accounts.get({address:tx.asset.id});
    if(accountlist.data.length==1) {
      account = accountlist.data[0];
      description += ' [' + transactions.utils.convertBeddowsToLSK(account.balance) + ' LSK]'
      if(account.asset) {
        description+= ' - ' + (account.asset.rentedBy!='' ? util.format("rented by %s", account.asset.rentedBy) : 'available');
      } else {
        description+= ' - no account info available';
      }
    } else {
      description+= ' - no account info available';
    }

    if(showdetails==true&&account!=undefined) {
      console.log("  ++++++++++++++++++++++++++++++++++++++++++++++");
      console.log(description);
      console.log("  create bike transaction asset data");
      console.log(prefix(JSON.stringify(tx.asset,0,2), "      "));
      console.log("  account data:");
      console.log(prefix(JSON.stringify(account,0,2), "      "));
    } else {
      console.log(description);
    }
  }
}
let showdetails = process.argv.includes("details");
listbikes(showdetails)
.catch(error => {
  console.error(error);
});

