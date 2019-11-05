const { APIClient } = require('@liskhq/lisk-client');

export const getAllBikes = async (providerUrl) => {
  if(undefined==providerUrl) return [];
  
  const client = new APIClient([providerUrl]);
  let createbiketxs = await client.transactions.get({ type: '1001' });
  let bikes = createbiketxs.data.map(
    (createbiketx) => { return createbiketx.asset}
  )
  // console.log("got bikes: %o", bikes);
  return bikes;
}
