const { APIClient } = require('@liskhq/lisk-client');

export const getObjectStatus = async (providerUrl, address) => {
  if(undefined==providerUrl) {
    console.warn("getObjectStatus: no provider url set");
    return undefined;
  }
  
  const client = new APIClient([providerUrl]);
  
  try {
    console.log('GOS: id ', address)
    const bikestatus = await client.accounts.get({address: address});
    if(bikestatus.indexOf('error') > -1) {
      console.error('An error appeared: ', bikestatus)
      return;
    }
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