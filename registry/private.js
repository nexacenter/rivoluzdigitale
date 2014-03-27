var fs = require("fs");
var utils = require("./utils.js");

var handleRequest = function (request, response, matricola) {

    fs.readFile("./studenti/s"+matricola+".json", "utf8", function (error, data) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        var obj = utils.safelyParseJSON(data);
                       
        if (obj === null) {
            utils.internalError("private: student file parsing error", request, response);
            return;
        }

        console.info("private: personal data whitout error");

        var nome = obj.Nome;
        var cognome = obj.Cognome;


        fs.readFile("./html/private.tpl.html", "utf8", function (error, data) {
            console.info("private: sending personal page");
            data = data.replace(/@MATRICOLA@/g, matricola);
            data = data.replace(/@NOME@/g, nome);
            data = data.replace(/@COGNOME@/g, cognome);
                        
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
        
            response.write(data);
            response.end();
        });
    });
}

exports.handleRequest = handleRequest;
