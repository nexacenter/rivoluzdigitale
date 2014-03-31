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
    var data = JSON.stringify(stud, undefined, 4);
    fs.writeFileSync("./studenti/s" + stud.Matricola + ".json", data,
      function (error) {
          if (error) {
              utils.internalError("writeStudentInfo: cannot write student file",
                request, response);
              return;
          }
          console.log("writeStudentInfo: student file written");
          callback();
    });
}

exports.getUsers = getUsers;
exports.saveUsers = saveUsers;
exports.readStudentInfo = readStudentInfo;
exports.writeStudentInfo = writeStudentInfo;
