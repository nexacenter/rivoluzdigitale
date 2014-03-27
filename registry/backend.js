var fs = require ("fs");
var utils = require ("./utils.js");

var getUsers = function (callback) {
    fs.readFile(".htpasswd", "utf8", function (error, data) {
        console.info("getUsers: opening passwd file");
        var users = utils.safelyParseJSON(data);
        if (users === null) {
            console.error("getUsers: invalid passwd file");
            process.exit(1);
        }
        console.info("getUsers: imported %d users", Object.keys(users).length);
        callback(users);
    });
}

var saveUsers = function (request, response, matricola, hash) {
    fs.readFile (".htpasswd", "utf8", function (error, data) {
        console.info("saveUsers: opening pw file");

        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        var users = utils.safelyParseJSON(data);

        if (users === null) {
            console.info("saveUsers: invalid passwd file");
            return;
        }

        users[matricola] = hash;

        data = JSON.stringify(users, undefined, 4);

        fs.writeFile(".htpasswd", data, function (error) {
            console.log("login_once: password stored for %s",matricola);

            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
            response.end("Password aggiunta con successo!");


        });

    });
}

exports.getUsers = getUsers;
exports.saveUsers = saveUsers;
