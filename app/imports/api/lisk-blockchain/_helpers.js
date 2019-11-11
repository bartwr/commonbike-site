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
    // console.log("bikes:", bikes);
    const thisBike = bikes.bikes[account.address];
    // console.log("thisBike:", thisBike);
    return thisBike;
  }).catch(err => {
    console.error("err1",err);
  });
}

module.exports = {getTimestamp, getBike}