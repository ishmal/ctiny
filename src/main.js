const express = require("express");
const bodyParser = require("body-parser");
const tiny = require("./tiny");
const index = require("./index");

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: false })

/**
 * Routes
 */
app.get("/", index);
app.get("/tiny/:url", tiny.get);
app.post("/tiny", urlencodedParser, tiny.post);

app.listen(8080, () => {
  console.log("listening on 8080");
});
