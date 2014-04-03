var fs = require ("fs");
var utils = require ("./utils.js");

function fixStringCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

var getUsers = function (callback) {
    fs.readFile("studenti/.htpasswd", "utf8", function (error, data) {
        console.info("getUsers: opening passwd file");
        var users = utils.safelyParseJSON(data);
        if (users === null) {
            console.error("getUsers: invalid passwd file");
            callback(error);
            return;
        }
        console.info("getUsers: imported %d users", Object.keys(users).length);
        callback(users);
    });
}

var saveUsers = function (request, response, matricola, hash) {
    fs.readFile ("studenti/.htpasswd", "utf8", function (error, data) {
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

        fs.writeFile("studenti/.htpasswd", data, function (error) {
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
    var data = fs.readFileSync("./studenti/s"+matricola+".json", "utf8");

    var stud = utils.safelyParseJSON(data);
    if (stud === null) {
        utils.internalError("readStudentInfo: student file parsing error", request, response);
        return;
    }

    console.info("readStudentInfo: personal data whitout error");

    callback(stud);
}

var writeStudentInfo = function(stud, callback) {
    readStudentInfo (stud.Matricola, function (dati) {
        
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
        fs.writeFileSync("./studenti/s" + stud.Matricola + ".json", data);
    
        console.log("writeStudentInfo: student file written");
        callback();
    });
}

exports.getUsers = getUsers;
exports.saveUsers = saveUsers;
exports.readStudentInfo = readStudentInfo;
exports.writeStudentInfo = writeStudentInfo;
