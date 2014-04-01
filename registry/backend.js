var fs = require ("fs");
var utils = require ("./utils.js");

function fixStringCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

var getUsers = function (callback) {

    utils.readFileSync("studenti/.htpasswd", "utf8",
      function (error, data) {

        if (error) {
            console.error("backend: cannot read passwd file");
            callback(error);
            return;
        }

        console.info("getUsers: opening passwd file");

        var users = utils.safelyParseJSON(data);
        if (users === null) {
            console.error("getUsers: invalid passwd file");
            callback(error);
            return;
        }

        console.info("getUsers: imported %d users", Object.keys(users).length);

        callback(null, users);
    });
}

var saveUsers = function (request, response, matricola, hash) {

    exports.getUsers(function (error, users) {

        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        users[matricola] = hash;

        data = JSON.stringify(users, undefined, 4);

        utils.writeFileSync("studenti/.htpasswd", data, function (error) {
            if (error) {
                utils.internalError(error, request, response);
                return;
            }
            console.log("login_once: password stored for %s",matricola);
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
            response.end("Password aggiunta con successo!");
        });

    });
}

var readStudentInfo = function(matricola, callback) {
    console.info("readStudentInfo: sync reading stud file");

    utils.readFileSync("./studenti/s" + matricola + ".json", "utf8",
      function (error, data) {
        if (error) {
            console.error("readStudentInfo: cannot read student's file");
            callback(error);
            return;
        }

        var stud = utils.safelyParseJSON(data);
        if (stud === null) {
            utils.internalError("readStudentInfo: student file parsing error", request, response);
            return;
        }

        console.info("readStudentInfo: personal data whitout error");

        callback(null, stud);
    });
}

var writeStudentInfo = function(stud, callback) {
    readStudentInfo(stud.Matricola, function (error, dati) {

        if (error) {
            callback(error);
            return;
        }
        
        if(stud.Blog != undefined)
            dati.Blog = stud.Blog;
        if(stud.Twitter != undefined)
            dati.Twitter = stud.Twitter;
        if(stud.Video != undefined)
            dati.Video = stud.Video;
        if(stud.Wikipedia != undefined)
            dati.Wikipedia = stud.Wikipedia;

        // I hate all uppercase
        dati.Cognome = fixStringCase(dati.Cognome);
        dati.Nome = fixStringCase(dati.Nome);

        var data = JSON.stringify(dati, undefined, 4);
        utils.writeFileSync("./studenti/s" + stud.Matricola + ".json", data,
          function (error) {
            if (error) {
                console.warn("backend: cannot write student's file");
                callback(error);
                return;
            }
    
            console.log("backend: student file written");
            callback(null);
        });
    });
}

exports.getUsers = getUsers;
exports.saveUsers = saveUsers;
exports.readStudentInfo = readStudentInfo;
exports.writeStudentInfo = writeStudentInfo;
