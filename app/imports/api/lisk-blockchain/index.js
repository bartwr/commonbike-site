//index.js
const { Application, genesisBlockDevnet, configDevnet } = require('lisk-sdk'); // require application class, the default genesis block and the default config for the application
const CreateBikeTransaction = require('./transactions/create-bike'); // require the newly created transaction type 'HelloTransaction'
const FaucetTransaction = require('./transactions/faucet'); // require the newly created transaction type 'HelloTransaction'
const UpdateBikeLocationTransaction = require('./transactions/update-bike-location'); // require the newly created transaction type 'HelloTransaction'
const RentBikeTransaction = require('./transactions/rent-bike'); // require the newly created transaction type 'HelloTransaction'
const ReturnBikeTransaction = require('./transactions/return-bike');

configDevnet.app.label = 'lisk-bike-blockchain-app'; // change the label of the app
configDevnet.components.storage.password = 'lisk123'; // replace password with the password for your database user
configDevnet.components.logger.logFileName = '/storage/lisk.bike/lisk-logs/devnet/lisk.log'; // define name and path of the log file. Default: logs/lisk.log
configDevnet.components.fileLogLevel = "debug"; // Minimum loglevel, that should be logged in the log file. Available values: trace, debug, info(default), warn, error, fatal, none.
configDevnet.components.consoleLogLevel = "node";// Minimum loglevel, that should be logged in the console, when starting the node. Available values: trace, debug, info, warn, error, fatal, none(default).

configDevnet.modules.http_api.access.public = true;

// create the log folder
const path = require("path");
const fs = require("fs");

const launchBlockchain=false;

// use commandline parameter to lauch blockchain, prevent meteor from automatically starting this process
if(launchBlockchain==true) {
  let logdir = path.dirName(configDevnet.components.logger.logFileName);
  if (!fs.existsSync(logdir)){
    console.log("create lisk logdir %s", logdir);
    fs.mkdirSync(logdir);
  }

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
}
