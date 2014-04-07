var backend = require("./backend.js");
var fs = require("fs");
var utils = require("./utils.js");

var generatePage = function (request, response, matricola) {
    backend.readStudentInfo(matricola, function(error, stud) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        fs.readFile("./html/private.tpl.html", "utf8", function (error, data) {
            console.info("private: sending personal page");
            data = data.replace(/@MATRICOLA@/g, matricola);
            data = data.replace(/@NOME@/g, stud.Nome);
            data = data.replace(/@COGNOME@/g, stud.Cognome);
    
            data = data.replace(/@BLOG@/g, stud.Blog);
            data = data.replace(/@TWITTER@/g, stud.Twitter);
            data = data.replace(/@WIKIPEDIA@/g, stud.Wikipedia);
            data = data.replace(/@VIDEO@/g, stud.Video);

            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
        
            response.write(data);
            response.end();
        });
    });
}

var modPage = function (request, response) {
    utils.readBodyJSON (request, response, function (stud) {
        if (!backend.hasValidKeys(stud) ||
            stud.Token !== undefined ||
            !backend.validMatricola(stud.Matricola)) {
            internalError("private: invalid argument", request, response);
            return;
        }
        backend.writeStudentInfo(stud, function (error) {
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(stud));
            response.end();
        })
    });
}

exports.generatePage = generatePage;
exports.modPage = modPage;
