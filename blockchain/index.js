//index.js
const { Application, genesisBlockDevnet, configDevnet } = require('lisk-sdk'); // require application class, the default genesis block and the default config for the application
const CreateBikeTransaction = require('../app/imports/api/lisk-blockchain/transactions/create-bike'); // require the newly created transaction type 'HelloTransaction'
const FaucetTransaction = require('../app/imports/api/lisk-blockchain/transactions/faucet'); // require the newly created transaction type 'HelloTransaction'
const UpdateBikeLocationTransaction = require('../app/imports/api/lisk-blockchain/transactions/update-bike-location'); // require the newly created transaction type 'HelloTransaction'
const RentBikeTransaction = require('../app/imports/api/lisk-blockchain/transactions/rent-bike'); // require the newly created transaction type 'HelloTransaction'
const ReturnBikeTransaction = require('../app/imports/api/lisk-blockchain/transactions/return-bike');

configDevnet.app.label = 'lisk-bike-blockchain-app'; // change the label of the app
configDevnet.components.storage.password = 'lisk123'; // replace password with the password for your database user

configDevnet.modules.http_api.access.public = true;

// Create the application instance
const app = new Application(genesisBlockDevnet, configDevnet);

// Register custom transactions
app.registerTransaction(CreateBikeTransaction);
app.registerTransaction(FaucetTransaction);
app.registerTransaction(UpdateBikeLocationTransaction);
app.registerTransaction(RentBikeTransaction);
app.registerTransaction(ReturnBikeTransaction);

// the code block below starts the application and doesn't need to be changed
app
    .run()
    .then(() => app.logger.info('App started...'))
    .catch(error => {
        console.error('Faced error in application', error);
        process.exit(1);
    });
