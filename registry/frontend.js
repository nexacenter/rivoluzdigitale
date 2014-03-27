var mainServer = require("./server.js");
var mainRouter = require("./router.js");
var signup = require("./signup.js");

//mainServer.start(signup.handleRequest);
mainServer.start(mainRouter.handleRequest);
