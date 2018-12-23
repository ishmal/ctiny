#!/usr/bin/env node

const app = require("./app");

/**
app.listen(3000, () => {
	console.log("listening on 3000");
});
*/
const fs = require("fs");
const https = require("https");

const httpsOptions = {
	key: fs.readFileSync('./testing-server.key'),
	cert: fs.readFileSync('./testing-server.cert')
}

const server = https.createServer(httpsOptions, app).listen(3000, () => {
	console.log('server running at ' + 3000)
});
