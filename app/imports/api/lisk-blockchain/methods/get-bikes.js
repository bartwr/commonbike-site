const { APIClient } = require('@liskhq/lisk-client');
const transactions = require('@liskhq/lisk-transactions');

const getObjectStatus = async (client, id) => {
  if(! id) {
    console.error('You called getObjectStatus in get-bikes.js, but the id/address you sent was incorrect. You gave me: ' + id)
    return false;
  }
  try {
    let bikestatus = await client.accounts.get({address:id});
    if(bikestatus.data.length==1) {
      return bikestatus.data[0];
    } else if(bikestatus.data.length>1) {
      return false;
    } else {
      return false;
    }
  } catch(ex) {
    console.error('get-bikes.getObjectStatus: error %o', ex)
    return false;
  }
}

const validateBike = (bike) => {
  if(bike.id == 'NaN')
    return false
  return true
}

export const getAllBikes = async (providerUrl) => {
  try {
    if(undefined==providerUrl) return [];
    const client = new APIClient([providerUrl]);
    let createbiketxs = await client.transactions.get({
      type: '1001',
      offset: 0,
      limit: 20,
      sort: 'timestamp:desc'
    });
    bikes=[];
    for(let i=0; i<createbiketxs.data.length;i++) {
      // Validate that bike object is valid
      if(("asset" in createbiketxs.data[i]==true)&&validateBike(createbiketxs.data[i].asset)==true) {
        // Get bike status
        // console.log("get bike status for %o", createbiketxs.data[i]);
        
        let status = await getObjectStatus(client, createbiketxs.data[i].asset.id);
        bikes.push({
          id: createbiketxs.data[i].asset.id,
          title: createbiketxs.data[i].asset.title,
          balance: transactions.utils.convertBeddowsToLSK(status.balance||"0"),
          asset: status.asset
        });
      }
    }
    
    return bikes;
  } catch(ex) {
    console.error('get-bikes.getAllBikes: error %o', ex)
    return [];
  }
}
