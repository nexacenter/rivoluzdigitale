var mailer = require("./mailer.js");
var mainServer = require("./server.js");
var mainRouter = require("./router.js");
var signup = require("./signup.js");

mailer.init(function() {
    //mainServer.start(signup.handleRequest);
    mainServer.start(mainRouter.handleRequest);
});
