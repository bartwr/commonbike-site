require('dotenv').config()
const fs = require('fs');
const { exec } = require('child_process');

const account = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json')); 
const url = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}/api/accounts?address=${account.address}`;

exec(`curl ${url}`, (err, stdout, stderr) => {
	if (err) {
		console.error(err)
	} else {
		console.log(JSON.parse(stdout).data[0].balance);
	}
});

