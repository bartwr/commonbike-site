const { APIClient } = require('@liskhq/lisk-client');
const FaucetTransaction = require('../transactions/faucet.js');

const { getAddressFromPublicKey, getKeys } = require('@liskhq/lisk-cryptography');
const { Mnemonic } = require('@liskhq/lisk-passphrase');
const transactions = require('@liskhq/lisk-transactions');
const { getTimestamp } = require('../_helpers.js');
const { getSettingsClientSide } = require('/imports/api/settings.js');

const createAccount = (providerUrl, addFunds=true) => {
  const passphrase = Mnemonic.generateMnemonic();
  const { privateKey, publicKey } = getKeys(passphrase);
  const address = getAddressFromPublicKey(publicKey);

  const account = {
    passphrase,
    privateKey,
    publicKey,
    address
  };
  
  if(addFunds) {
    // Make connection to the blockchain
    const client = new APIClient([providerUrl]);

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

    return new Promise((resolve, reject) => {
      client.transactions.broadcast(tx.toJSON())
        .then((res) => {
          console.log('res', res)
          // alert(JSON.stringify(res));
          resolve(account);
        })
        .catch(err => {
          alert(JSON.stringify(err.errors[0].message));
          console.log('err', err)
          reject(account);
        });
    })
  } else {
    return account;
  }
}

const doCreateAccount = async (addfunds=false) => {
    const settings = await getSettingsClientSide();
    if(!settings) return false;
    
    console.log("calling createaccount with provider %s", settings.bikecoin.provider_url);
    
    const createAccountResult = await createAccount(settings.bikecoin.provider_url, addfunds);
    console.log('createAccountResult', createAccountResult);

    return createAccountResult;
}

module.exports = {doCreateAccount}
