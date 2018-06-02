
const express = require("express");
const bodyParser = require("body-parser");
const tiny = require("./src/tiny");
const ServeStatic = require("./src/serve-static");

const app = express();

const jsonParser = bodyParser.json();
const fileServer = new ServeStatic(__dirname + "/public");

/**
 * Routes
 */
app.post("/tiny", jsonParser, tiny.post);
app.get("/tiny/:url", tiny.get);
app.use("/", fileServer.serve);

module.exports = app;
