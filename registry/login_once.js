var backend = require ("./backend.js");
var fs = require("fs");
var utils = require("./utils.js");

var handleRequest = function (request, response, matricola, token, hash) {
    backend.readStudentInfo(matricola, function(obj) {
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
        if(stud.token != "null"){
            console.log("handleToken: ricevuto token %s",stud.token);
            handleRequest(request, response, stud.matricola, stud.token, stud.hash);
        }
        else{
            console.log("handleToken: problem finding token %s", stud.token);
            res.writeHead(500);
            response.end();
        }
    });

}

exports.handleRequest = handleRequest;
