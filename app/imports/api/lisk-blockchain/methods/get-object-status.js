const { APIClient } = require('@liskhq/lisk-client');

export const getObjectStatus = async (providerUrl, address) => {
  if(undefined==providerUrl) {
    console.warn("getObjectStatus: no provider url set");
    return undefined;
  }
  
  const client = new APIClient([providerUrl]);
  
  try {
    const bikestatus = await client.accounts.get({address: address});
    if(bikestatus.data.length==1) {
      return bikestatus.data[0];
    } else if(bikestatus.data.length>1) {
      return false;
    } else {
      return false;
    }
  } catch(ex) {
    console.log('getObjectStatus: error %o', ex)
    return false;
  }
}
