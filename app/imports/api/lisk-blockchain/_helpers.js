const { EPOCH_TIME } = require('@liskhq/lisk-constants');

// Function that generates timestamp
const getTimestamp = () => {
  const millisSinceEpoc = Date.now() - Date.parse(EPOCH_TIME);
  const inSeconds = ((millisSinceEpoc) / 1000).toFixed(0);
  return  parseInt(inSeconds);
};

const getBike = (client, account) => {
  // console.log("account:", account);

  return client.accounts.get({
    address: account.address
  }).then(response => {
    const bikes = response.data[0].asset;
    const thisBike = bikes.bikes[account.address];
    return thisBike;
  }).catch(err => {
    console.error("err1",err);
  });
}

module.exports = {getTimestamp, getBike}