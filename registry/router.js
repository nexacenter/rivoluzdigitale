var fs = require("fs");
var http = require("http");
var login = require("./login.js");
var login_once = require("./login_once.js");
var logout = require("./logout.js");
var mailer = require("./mailer.js");
var path = require("path");
var signup = require("./signup.js");
var url = require("url");
var utils = require("./utils.js");

var router = {
    "/": function (request, response) {
        utils.servePath__("/html/index.html", response);
    },

    "/login": login.handleRequest,
    "/mod_sent": login.modPage,
    "/logout": logout.handleRequest,

    "/signup": signup.servePage,
    "/reset": signup.servePage,
    "/matr_sent": signup.handleMatricola,
    "/confirm_sent": signup.handleConfirm,
    "/login_once": login_once.servePage,
    "/token_sent": login_once.handleToken
};

exports.handleRequest = function(request, response) {

    utils.logRequest(request);

    if (request.method === "OPTIONS") {
        utils.writeHeadVerboseCORS(response, 200);
        response.end();
        return;
    }

    var handler = router[request.url];

    if (handler === undefined) {
        utils.writeHeadVerboseCORS(response, 404);
        response.end();
        return;
    }

    try {
        handler(request, response);
    } catch (error) {
        /* ??? */
    }
};
