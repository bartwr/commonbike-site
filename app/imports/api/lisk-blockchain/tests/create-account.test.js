require('dotenv').config()
const fs = require('fs');

const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const transactions = require('@liskhq/lisk-transactions');
const { getTimestamp } = require('../_helpers.js');

const FaucetTransaction = require('../transactions/faucet.js');

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

  if(name==undefined) name=account.address;
  
  let filename = `./accounts/${name}.json`;
  fs.writeFileSync(filename, JSON.stringify(account));
  
  const resolve = require('path').resolve
  console.log("+++++++++++++++++++++++++++++++++++++++++++");
  console.log("New account created with name %s", name);
  console.log("  passphrase: %s", account.passphrase)
  console.log("  private key: %s", account.privateKey)
  console.log("  public key: %s", account.publicKey)
  console.log("  address: %s", account.address)
  console.log("  file: %s", resolve(filename));

  return account;
}

// Create account
const account = createAccount(process.argv[2])

// Make connection to the blockchain
// `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`
const client = new APIClient(['https://brainz.lisk.bike']);

// Add funds to account
const tx = new FaucetTransaction({
  type: 777,
  fee: '0',
  amount: transactions.utils.convertLSKToBeddows('100'),
  senderPublicKey: account.publicKey,
  recipientId: account.address,
  timestamp: getTimestamp()
});
console.log("+++++++++++++++++++++++++++++++++++++++++++");
console.log('Faucet transaction created with type %s', tx.type);

// Sign tx
tx.sign(account.passphrase);
console.log("+++++++++++++++++++++++++++++++++++++++++++");
console.log('Faucet transaction signed (id %s)', tx.id);

const faucetTx = client.transactions.broadcast(tx.toJSON());
console.log("+++++++++++++++++++++++++++++++++++++++++++");
console.log('Faucet transaction broadcast to the blockchain (id %s)', tx.id);

faucetTx.then(() => {
  console.log("+++++++++++++++++++++++++++++++++++++++++++");
  console.info("Faucet transaction done (id %s)", tx.id);
})
.catch(error => {
  console.log("+++++++++++++++++++++++++++++++++++++++++++");
  console.info("Faucet transaction failed (id %s)", tx.id);
  console.error(error);
  process.exit(1);
});
