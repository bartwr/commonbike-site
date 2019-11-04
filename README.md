# Introduction: Lisk.bike

This is a technology demonstrator for the Lisk (Alpha) SDK. In this repository you find the code for running a Lisk sidechain meant for running Lisk.Bike.

The code is based on @JesusTheHun's work in [github.com/JesusTheHun/lisk-bike](https://github.com/JesusTheHun/lisk-bike)

# Overview: the process flow

## Preparing the blockchain

- dotenv error: do npm install in the file named 'client'
- make sure that node version 12 is running: nvm use 12

- pm2 start --name lisk-bike-blockchain-app index.js
- add to index.js: configDevnet.modules.http_api.access.public = true;
- run the blockchain: node index.js | npx bunyan -o short

## Preparing client
- in 'tests' edit .env file: HTTP_HOST=brainz.lisk.bike 
- TIME error: make sure that the time is sychronised. Check with time with command: date

## Preparing lock

- Charge lock

- Remove SIM PIN
- Disable SIM voicemail
- Send sms to self via SIM
- Put SIM in lock

- Send SMS to lock containing 'bladiebla-server-ip'

Now the lock is connected to a server running https://github.com/bartwr/commonbike-site/blob/feature/testing/zandbak/testbt10/index.js

## Onboarding lock to the Lisk.Bike blockchain

- Lock sends the 'login' command to server
- Server creates wallet for lock using `./tests/create-account.js`
- Server registers lock onto the blockchain using `./tests/create-bike.js`

Now there's a connection between the lock and the pubkey, in the Lisk blockchain.

### 1. Create bike account (wallet)

    cd tests
    node create-account.test.js renter1
    node create-account.test.js bike1

Based on account creation, you get an address (pubkey).

Administrator must fund his bike(s).

### 2. Register bike on the blockchain

First, check the balance of bike1:

    node balance.js bike1

Only proceed if bike1 has a balance.

    cd tests
    node create-bike.test.js bike1

The bike is registered using its pubkey. This is the bikes' bikeId.

The server stores the IMEI & bikeId (= pubkey) in its database.
This is how the server knows what bike transactions are related to this IMEI.

Administrators must run their own servers, storing IMEI, BikeID + BikePrivate key for their own bikes

## Update GPS location on blockchain

    cd tests
    node update-bike-location.test.js bike1 lat lon
    node update-bike-location.test.js bike1 51.9227954 4.4253305

Every x minutes the server receives the GPS location.
// This has changed. Server must actively poll the blockchain every X minutes to check for GPS and lockstatus updates//

The server looks up the account of the lock in its database, based on IMEI.
The locks privkey then signs the 'update-bike-location' transaction.

## Update lock status on blockchain

If lock opens/closed, the lock sends a command to the server.
The server looks up the account of the lock in its database, based on IMEI.
The locks privkey then signs the 'update-lock-status' transaction.

- Lock: Lock opened
- Lock: Lock closed

## Rent + return Bike
### 1. Get (max 10) bike locations

    cd tests
    node bike_locations.js

### 2. Rent bike command

    cd tests
    node rent-bike.test.js renter1 bike1

Sometimes you get the 'Invalid transaction timestamp. Timestamp is in the future' error.

If this is the case: Try the command again. Mostly the second time works.

### 3. Return bike

    cd tests
    node return-bike.test.js renter1 bike1

In Lisk.Bike version 0.1, rental is ended when user locks bike. Lock sends signal to lock-server, then lockserver runs return-bike and rental is ended.

//Check: does lock server also update lockstatus in blockchain?//

In future Lisk.Bike 2.0, it will be possible to reserve a bike, and also lock the bike without automatically ending rental. Besides an automatic lockstatus update in the blockchain when user closes the lock, user must also run returnbike/end-rental command.


## NOT USED/TESTED:



### allowing user to close and re-open lock without ending rental and starting new rental

User: manually close lock, do not end rental.
User: Please open lock command while previous rental active needed.



## live demo

http://app.lisk.bike/

## Custom transaction demo code JesusTheHun

https://github.com/JesusTheHun/lisk-bike

## Blockchain app bartwr

https://github.com/bartwr/lisk-bike-blockchain-app

This repo has been fully merged in current repo.
