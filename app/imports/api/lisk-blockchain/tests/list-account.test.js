require('dotenv').config()
const { APIClient } = require('@liskhq/lisk-client');
const { prefix, getTimestamp, getProviderURL } = require('../_helpers.js');
const transactions = require('@liskhq/lisk-transactions');
const util = require('util')
const fs = require('fs');

const transactiontypes = {
  '1': 'transfer',
  '2': 'register delegates',
  '3': 'cast votes',
  '4': 'register multisignature account',
  '5': 'create dapp',
  '777': 'faucet',
  '1001': 'create bike',
  '1002': 'rent bike',
  '1003': 'return bike',
  '1004': 'update bike location',
}

// get all "create bike transactions"
const listaccount = async (address, showdetails) => {
  // Make connection to the blockchain
  const client = new APIClient([getProviderURL()]);
  
  console.log("++++++++++++++++++++++++++++++++++++++++++++++");

  // lookup this account
  let account, description='';
  let accountlist = await client.accounts.get({address});
  if(accountlist.data.length==1) {
    account = accountlist.data[0];
    description = account.address + ' [' + transactions.utils.convertBeddowsToLSK(account.balance) + ' LSK]'
    console.log(description);
    if(showdetails) {
      console.log(prefix(JSON.stringify(account,0,2), "    "));
    }
  } else {
    description = address + ' - no account info available';
    console.log(description);
    return;
  }

  // TODO: figure out how to get these in a single call or make a nice sorted list
  // get incoming transactions
  const incomingtxs = await client.transactions.get({recipientId: address});
  for(let i=0; i<incomingtxs.data.length;i++) {
    let tx = incomingtxs.data[i];
    let typedescription = "unknown (" + tx.type + ")";
    if(tx.type.toString() in transactiontypes) {
      typedescription = transactiontypes[tx.type.toString()];
    }
    console.log("tx-in: %s - %s [%s] (%s: %s -> %s)", new Date((tx.timestamp+1464109200)*1000).toLocaleString(), tx.id, typedescription,
      tx.amount, tx.senderId, tx.recipientId||tx.recipientPublicKey);
  }

  // get incoming transactions
  const outgoingtxs = await client.transactions.get({senderId: address});
  for(let i=0; i<outgoingtxs.data.length;i++) {
    let tx = outgoingtxs.data[i];
    let typedescription = "unknown (" + tx.type + ")";
    if(tx.type.toString() in transactiontypes) {
      typedescription = transactiontypes[tx.type.toString()];
    }
    console.log("tx-out: %s - %s [%s] (%s: %s -> %s)", new Date((tx.timestamp+1464109200)*1000).toLocaleString(), tx.id, typedescription,
      tx.amount, tx.senderId, tx.recipientId||tx.recipientPublicKey);
  }
}

if(process.argv.length<3) {
  console.log("You need to specify an account or address to get account info");
  console.log("usage node list-accoint.test.js <account name / address> [<details>]");
  return;
}


// Get 'account'
let address;
let filename='./accounts/'+process.argv[2]+'.json';
if(fs.existsSync(filename)==true) {
    const account = JSON.parse(fs.readFileSync(filename));
    address = account.address;
} else {
  address = process.argv[2];
}

if(undefined==address) { console.log("no account specified"); return; }

let showdetails = process.argv.length>3
listaccount(address, showdetails)
.catch(error => {
  console.error(error);
});

