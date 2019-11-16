require('dotenv').config()
const fs = require('fs');
const { exec } = require('child_process');

const CreateBikeTransaction = require('../transactions/create-bike');

// const account = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json'));
const url = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}/api/transactions?type=${CreateBikeTransaction.TYPE}`;
// console.log(url);

exec(`curl ${url}`, (err, stdout, stderr) => {
	if (err) {
		console.error(err)
	} else {
		JSON.parse(stdout).data.forEach(bike => {
			const bikeId = bike.asset.id;
			const url = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}/api/accounts?address=${bikeId}`;
			exec(`curl ${url}`, (err, stdout, stderr) => {
				if (err) {
					console.error(err)
				} else {
					const bikeAsset = JSON.parse(stdout).data[0].asset.bikes[bikeId];
					console.log({
						bikeId,
						latitude: bikeAsset.location.latitude,
						longitude: bikeAsset.location.longitude,
					});
				}
			});
		}); // next bike
	}
});
