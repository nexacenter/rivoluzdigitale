var fs = require ("fs");
var utils = require ("./utils.js");

var MATRICOLA = /^[0-9]{6}$/;
var TOKEN = /^[A-Fa-f0-9]{20}$/;
var MAYBE_EMPTY_TOKEN = /^(|[A-Fa-f0-9]{20})$/;
var PWDHASH = /^[A-Fa-f0-9]{32}$/;

exports.validMatricola = function (maybeMatricola) {
    return maybeMatricola.match( MATRICOLA );
};

exports.validToken = function (maybeToken) {
    return maybeToken.match( TOKEN );
};

exports.validPwdHash = function (maybePwdHash) {
    return maybePwdHash.match( PWDHASH );
};

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
            console.error("backend: invalid passwd file");
            callback("backend error");
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

function doWriteInfo(curInfo, callback) {
    var data;

    // I hate all uppercase
    curInfo.Cognome = fixStringCase(curInfo.Cognome);
    curInfo.Nome = fixStringCase(curInfo.Nome);

    data = JSON.stringify(curInfo, undefined, 4);
    utils.writeFileSync("./studenti/s" + curInfo.Matricola + ".json", data,
      function (error) {
        if (error) {
            console.warn("backend: cannot write student's file");
            callback(error);
            return;
        }
    
        console.log("backend: student file written");
        callback();
    });
};

var KNOWN_KEYS = {
    "Nome": 17,
    "Cognome": 17,
    "Matricola": 17,
    "Token": 17,
    "Blog": 17,
    "Twitter": 17,
    "Wikipedia": 17,
    "Video": 17
};

var knownKeys = Object.keys(KNOWN_KEYS);

exports.hasValidKeys = function (something) {
    var index, key, keys = Object.keys(something);

    for (index = 0; index < keys.length; ++index) {
        key = keys[index];
        if (KNOWN_KEYS[key] !== 17) {
            return false;
        }
    }

    return true;
};

var knownRegExp = [
    /^[A-Za-z\'\- ]+$/,
    /^[A-Za-z\'\- ]+$/,
    MATRICOLA,
    MAYBE_EMPTY_TOKEN,
    /^(|http(|s)\:\/\/[A-Za-z0-9\.\-\_\%\?\=\/]+)$/,
    /^(|@[A-Za-z0-9_]{1,15})$/,
    /^(|(U|u)tente\:.*)$/,
    /^(|http(|s)\:\/\/[A-Za-z0-9\.\-\_\%\?\=\/]+)$/
];

exports.writeStudentInfo = function(newInfo, callback) {
    exports.readStudentInfo(newInfo.Matricola, function (error, savedInfo) {
        var index, key;

        if (error && error.code === "ENOENT") {
            doWriteInfo(newInfo, callback);
            return;
        }
        if (error) {
            callback(error);
            return;
        }

        for (index = 0; index < knownKeys.length; ++index) {
            key = knownKeys[index];
            if (newInfo[key] === undefined)
                continue;
            if (newInfo[key].match( knownRegExp[index] ) === null) {
                console.info("backend: regexp does not match");
                callback(error);
                return;
            }
            console.info("backend: regexp match");
            savedInfo[key] = newInfo[key];
        }

        doWriteInfo(savedInfo, callback);
    });
};
