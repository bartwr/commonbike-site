require('dotenv').config()
const fs = require('fs');

const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const transactions = require('@liskhq/lisk-transactions');
const { getTimestamp } = require('../_helpers.js');

const FaucetTransaction = require('../transactions/faucet.js');
// const HelloTransaction = require('../hello_transaction');

const { APIClient } = require('@liskhq/lisk-client');

const createAccount = (name) => {
  const passphrase = Mnemonic.generateMnemonic();
  const { privateKey, publicKey } = getKeys(passphrase);
  const address = getAddressFromPublicKey(publicKey);

  const account = {
    passphrase,
    privateKey,
    publicKey,
    address
  };

  fs.writeFileSync(`./accounts/${name}.json`, JSON.stringify(account));

  return account;
}


// Create account
const account = createAccount(process.argv[2])

// Make connection to the blockchain
// `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`
const client = new APIClient(['http://localhost:4000']);

// Add funds to account
const tx = new FaucetTransaction({
  type: 777,
  fee: '0',
  amount: transactions.utils.convertLSKToBeddows('10000'),
  senderPublicKey: account.publicKey,
  recipientId: account.address,
  timestamp: getTimestamp()
});

// Sign tx
tx.sign(account.passphrase);

const faucetTx = client.transactions.broadcast(tx.toJSON());

faucetTx.then(() => {
  console.info("Faucet transaction done");
})
.catch(error => {
  console.error(error);
  process.exit(1);
});
