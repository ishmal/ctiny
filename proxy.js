#!/usr/bin/env node

const app = require("./app");

app.set("trust proxy", true);

app.listen(3000, () => {
	console.log("listening on 3000");
});
