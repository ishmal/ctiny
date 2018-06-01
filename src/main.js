const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const reload = require("express-reload");


const tiny = require("./tiny");
const index = require("./index");
const styles = require("./styles");

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: false })
const filePath = path.join(__dirname, "index.js");

app.use(reload(filePath));

/**
 * Routes
 */
app.get("/", index.index);
app.get("/styles.css", styles);
app.get("/tiny/:url", tiny.get);
app.post("/tiny", urlencodedParser, tiny.post);

app.listen(3000, () => {
  console.log("listening on 3000");
});
