require('dotenv').config()
const { APIClient } = require('@liskhq/lisk-client');
const { prefix, getTimestamp, getProviderURL } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');

// get all "create bike transactions"
const listbikes = async (showdetails) => {
  // Make connection to the blockchain
  const client = new APIClient([getProviderURL()]);

  const createbiketxs = await client.transactions.get({ type: '1001' });
  for(let i=0; i<createbiketxs.data.length;i++) {
    let tx = createbiketxs.data[i];
    if(showdetails==true) {
      console.log("  ++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("  %s - '%s' owned by %s", tx.asset.id, tx.asset.title, tx.asset.ownerid);
      console.log("  transaction asset data");
      console.log(prefix(JSON.stringify(tx.asset,0,2), "      "));
      
      // Now lookup the account info for this bike
      let accountlist = await client.accounts.get({address:tx.asset.id});
      if(accountlist.data.length==1) {
        let account = accountlist.data[0];
        console.log("  account data:");
        console.log(prefix(JSON.stringify(account,0,2), "      "));
      } else {
        console.log("");
        // no bikes found
        return false;
      }
    } else {
      console.log("%s - '%s' owned by %s", tx.asset.id, tx.asset.title, tx.asset.ownerid);
    }
  }
}
let showdetails = process.argv.includes("details");
listbikes(showdetails)
.catch(error => {
  console.error(error);
});

