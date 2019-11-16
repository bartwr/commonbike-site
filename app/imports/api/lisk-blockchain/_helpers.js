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

const getProviderURL = () => {
  // use local development blockchain
  return 'http://localhost:4000';
  
  // use online development blockchain
  // return 'https://brainz.lisk.bike';
}

const getBaseLocation = () => {
  let base = [52.090621, 5.121474] // put bike at a random location near utrecht
  // let base = [52.499752, 13.376343] // put bike at a random location in berlin
  return base;
}

const prefix = (text, prefix) => {
  return text.split("\n").map((line)=>{ return prefix + line}).join("\n");
}

module.exports = {getTimestamp, getBike, getProviderURL, prefix, getBaseLocation}