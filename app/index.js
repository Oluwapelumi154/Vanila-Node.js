// Dependecies

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
// const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
// Tesing
// _data.delete('test', 'newFile', (error) => {
//  console.log(`This was the ${error}}`);
// });
//Define the handlers

// Define a Request Router
const router = {
 sample: handlers.sample,
 users: handlers.users,
 tokens: handlers.tokens,
};
const server = http.createServer((req, res) => {
 const parsedUrl = url.parse(req.url, true);
 const path = parsedUrl.pathname;
 const trimmedPath = path.replace(/^\/+|\/+$/g, '');
 const method = req.method.toLowerCase();

 // Get the query String
 const queryString = parsedUrl.query;

 // Get the headers as an Object
 const headers = req.headers;
 //  console.log(headers);

 // Get the Payload

 const decoder = new StringDecoder('utf-8');
 let buffer = '';
 req.on('data', (data) => {
  buffer += decoder.write(data);
 });

 req.on('end', () => {
  buffer += decoder.end();
  // Construct Object to send to the handler
  var data = {
   trimmedPath: trimmedPath,
   queryStringObject: queryString,
   method: method,
   headers: headers,
   payload: helpers.parseJsonToObject(buffer),
  };
  if (router[trimmedPath]) {
   return router[trimmedPath](data, (statusCode, payload) => {
    //use statusCode called by the handler or use the default statusCode
    statusCode = typeof statusCode == 'number' ? statusCode : 200;
    payload = typeof payload == 'object' ? payload : {};
    // Convert payload to String
    const payloadString = JSON.stringify(payload);
    res.setHeader('Content-type', 'application/json');
    res.writeHead(statusCode);
    res.end(payloadString);
    console.log(`Returning this response ${statusCode} ${payloadString}`);
   });
  } else {
   return handlers.notFound(data, (statusCode) => {
    statusCode = typeof statusCode == 'number' ? statusCode : 200;
    payload = typeof payload == 'object' ? payload : {};
    // Convert payload to String
    const payloadString = JSON.stringify(payload);
    res.writeHead(statusCode);
    res.end(payloadString);
    console.log(`Returning this response ${statusCode} ${payloadString}`);
   });
  }
  //   const chosenHandler = typeof router[trimmedPath] !== undefined ? router[trimmedPath] : handlers.notFound;

  // Route Request to the handler specified in the handler
 });
});
server.listen(config.port, () => {
 console.log(`Server listening on port ${config.port} in ${config.envName} mode`);
});
//Start the server and listen on port 3000
