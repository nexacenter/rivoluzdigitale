var fs = require ("fs");
var utils = require ("./utils.js");

function fixStringCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

exports.getUsers = function (callback) {
    var users;

    utils.readFileSync("studenti/.htpasswd", "utf8",
      function (error, data) {

        if (error) {
            console.error("backend: cannot read passwd file");
            callback(error);
            return;
        }

        console.info("backend: opening passwd file");

        users = utils.safelyParseJSON(data);
        if (users === null) {
            console.error("getUsers: invalid passwd file");
            callback(error);
            return;
        }

        console.info("backend: imported %d users", Object.keys(users).length);

        callback(null, users);
    });
};

exports.saveUsers = function (request, response, matricola, hash) {

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
};

exports.readStudentInfo = function(matricola, callback) {
    console.info("backend: sync reading stud file");

    utils.readFileSync("./studenti/s" + matricola + ".json", "utf8",
      function (error, data) {
        if (error) {
            console.error("backend: cannot read student's file");
            callback(error);
            return;
        }

        var stud = utils.safelyParseJSON(data);
        if (stud === null) {
            callback("json error");
            return;
        }

        console.info("backend: personal data whitout error");

        callback(null, stud);
    });
};

exports.writeStudentInfo = function(stud, callback) {
    exports.readStudentInfo(stud.Matricola, function (error, curInfo) {
        var data;

        if (error) {
            callback(error);
            return;
        }
        
        if (stud.Blog != undefined)
            curInfo.Blog = stud.Blog;
        if (stud.Twitter != undefined)
            curInfo.Twitter = stud.Twitter;
        if (stud.Video != undefined)
            curInfo.Video = stud.Video;
        if (stud.Wikipedia != undefined)
            curInfo.Wikipedia = stud.Wikipedia;

        // I hate all uppercase
        curInfo.Cognome = fixStringCase(curInfo.Cognome);
        curInfo.Nome = fixStringCase(curInfo.Nome);

        data = JSON.stringify(curInfo, undefined, 4);
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
};
