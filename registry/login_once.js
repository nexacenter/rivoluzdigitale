var backend = require ("./backend.js");
var fs = require("fs");
var utils = require("./utils.js");

exports.servePage = function (request, response) {
    utils.servePath__("/html/login_once.html", response);
};

var handleRequest = function (request, response, matricola, token, hash) {
    backend.readStudentInfo(matricola, function(error, obj) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }
        if (obj.Token != token) {
            console.info("login_once: wrong token");
            utils.writeHeadVerboseCORS(response, 200, {
               "Content-Type": "text/html"
            });
            response.end("La chiave inserita non e' quella corretta per questa matricola.");
            return;
        }
        else {
            console.info("login_once: right token --> saveUsers");
            backend.saveUsers(request, response, matricola, hash);
        }
        
    });
}

exports.handleToken = function (request, response) {
    console.info("handleToken: harvesting token");
    utils.readBodyJSON(request, response, function(stud) {
        if (!backend.hasValidKeys(stud) ||
            !backend.validToken(stud.token) ||
            !backend.validMatricola(stud.matricola) ||
            !backend.validPwdHash(stud.hash)) {
            internalError("login_once: invalid argument", request, response);
            return;
        }
        console.info("handleToken: ricevuto token %s", stud.token);
        handleRequest(request, response, stud.matricola, stud.token, stud.hash);
    });
};

exports.handleRequest = handleRequest;
