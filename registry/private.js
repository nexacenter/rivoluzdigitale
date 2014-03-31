var backend = require("./backend.js");
var fs = require("fs");
var utils = require("./utils.js");

var handleRequest = function (request, response, matricola) {
    backend.readStudentInfo(matricola, function(stud) {
        var nome = stud.Nome;
        var cognome = stud.Cognome;

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
