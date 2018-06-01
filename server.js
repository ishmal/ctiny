
const express = require("express");
const bodyParser = require("body-parser");
const tiny = require("./src/tiny");
const app = express();

const jsonParser = bodyParser.json();

/**
 * Routes
 */
let public = express.static('public');
app.get("/index.html", public);
app.get("/client.js", public);
app.get("/styles.css", public);

app.post("/tiny", jsonParser, tiny.post);
app.get("/tiny/:url", tiny.get);


app.listen(3000, () => {
  console.log("listening on 3000");
});
