const { APIClient } = require('@liskhq/lisk-client');

export const getObjectStatus = async (providerUrl, id) => {
  console.log("getObjectStatus: called with %s / %s", providerUrl, id);
  if(undefined==providerUrl) {
    console.warn("getObjectStatus: no provider url set");
    return undefined;
  }
  
  const client = new APIClient([providerUrl]);
  
  // let accountstatus = await client.accounts.get({address: id });
  // console.log("got accountstatus" , accountstatus);
  
  // let filter = (tx) => tx.asset.id == id;
  // let bikestatus = await client.transactions.get({ senderId: filter, sort: 'timestamp:desc', limit: 2 });
  try {
    let bikestatus = await client.accounts.get({address:id});
    if(bikestatus.data.length==1) {
      console.log("got bike account: %o", bikestatus.data[0]);
      return bikestatus.data[0];
    } else {
      console.log('getObjectStatus: not registered yet')
      return false;
    }
  } catch(ex) {
    console.log('getObjectStatus: error %o', ex)
    return false;
  }
}
