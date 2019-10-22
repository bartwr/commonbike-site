require('dotenv').config()
const fs = require('fs');
const { exec } = require('child_process');

const account = JSON.parse(fs.readFileSync('./accounts/'+process.argv[2]+'.json')); 
const url = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}/api/accounts?address=${account.address}`;
// console.log(url);

exec(`curl ${url}`, (err, stdout, stderr) => {
	if (err) {
		//some err occurred
		console.error(err)
	} else {
		// the *entire* stdout and stderr (buffered)
		console.log(JSON.parse(stdout).data[0].balance);
		//console.log(`stdout: ${stdout}`);
		//console.log(`stderr: ${stderr}`);
	}
});

