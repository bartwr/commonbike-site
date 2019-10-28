const { APIClient } = require('@liskhq/lisk-client');
const { getSettingsClientSide } = require('/imports/api/settings.js');


const getAccount = (providerUrl, address) => {
  const client = new APIClient([providerUrl]);

  return new Promise((resolve, reject) => {
    client.accounts.get({address: address})
      .then((res) => {
        // console.log('res', res.data)
        resolve(res.data);
      })
      .catch(err => {
        alert(JSON.stringify(err.errors[0].message));
        console.log('err', err)
        reject(err);
      });
  })
}

const doGetAccount = async (address) => {
    const settings = await getSettingsClientSide();
    if(!settings) return false;
    
    const result = await getAccount(settings.bikecoin.provider_url, address);
    return result;
}

module.exports = {doGetAccount}
