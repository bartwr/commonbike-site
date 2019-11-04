const { APIClient } = require('@liskhq/lisk-client');

export const getObjectStatus = async (providerUrl, id) => {
  console.log("getObjectStatus: called with %s / %s", providerUrl, id);
  if(undefined==providerUrl) {
    console.warn("getObjectStatus: no provider url set");
    return undefined;
  }
  
  const client = new APIClient([providerUrl]);
  
  let accountstatus = await client.transactions.get({id: id });
  console.log("got accountstatus" , accountstatus);
  
  // let filter = (tx) => tx.asset.id == id;
  // // let bikestatus = await client.transactions.get({ senderId: filter, sort: 'timestamp:desc', limit: 2 });
  // let bikestatus = await client.transactions.get(filter);
  // console.log("got bike status: %o", bikestatus);
  // if(undefined!=bikestatus) {
  //   return bikestatus.asset
  // } else {
    return undefined;
  //}
}
