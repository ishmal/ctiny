const restify = require('restify');
const tiny = require("./tiny");
const index = require("./index");

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

const server = restify.createServer();

/**
 * Routes
 */
server.get("/", index);
server.get('/hello/:name', respond);
server.get('/tiny/:url', tiny);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
