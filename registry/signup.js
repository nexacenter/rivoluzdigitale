// registry/signup.js

/*
 * Copyright (c) 2014
 *     Nexa Center for Internet & Society, Politecnico di Torino (DAUIN),
 *     Alessio Melandri <alessiom92@gmail.com> and
 *     Simone Basso <bassosimone@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//
// Handles the /signup and the /reset requests
//

var crypto = require("crypto");
var fs = require("fs");
var mailer = require("./mailer.js");
var utils = require("./utils.js");

//
// Invoked when the student navigates to the '/signup' URL. Returns
// the page that allows one to signup.
//
exports.servePage = function (request, response) {
    utils.servePath__("/html/signup.html", response);
};

//
// Invoked when the student sends us his/her matricola. Checks whether
// the student exists and, if so, asks he/she to confirm his/her identity.
//
exports.handleMatricola = function (request, response) {

    // Invoked when a user is already subscribed
    function alreadySubscribed() {
        utils.writeHeadVerboseCORS(response, 200, {
            "Content-Type": "text/html"
        });
        response.end("Risulti già iscritto al sito.");
    };

    // Write student info to disk and then invoke the callback
    function writeStudentInfo(student, callback) {
        var data;

        //
        // XXX: this function should make sure that the information
        // provided in student is correct, using regexps.
        //

        data = JSON.stringify(student, undefined, 4);
        fs.writeFile("./studenti/s" + student.Matricola + ".json", data,
          function (error) {
            if (error) {
                utils.internalError("signup: cannot write student file",
                  request, response);
                return;
            }
            console.log("signup: student file written");
            callback();
        });
    }

    // Fill and send the studentInfo template
    function fillAndSendTemplate(stud) {
        fs.readFile("./html/signup.tpl.html", "utf8", function (error, data) {
            var long_name = stud.Cognome + ", " + stud.Nome;
            console.info("signup: SEND_TEMPLATE");
            data = data.replace(/@MATRICOLA@/g, stud.Matricola);
            data = data.replace(/@NOME@/g, long_name);
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
            response.write(data);
            response.end();
        });
    }

    // If needed, generates a new token and sends the template back
    function possiblySendTemplate(message) {
        fs.readFile("./studenti/s" + message.matricola + ".json", "utf8",
          function (error, data) {

            if (error) {
                utils.internalError("signup: cannot read student file",
                  request, response);
                return;
            }
            var studentInfo = utils.safelyParseJSON(data);
            if (studentInfo === null) {
                utils.internalError("signup: cannot parse student file",
                  request, response);
                return;
            }

            try {
                studentInfo.Token = crypto.randomBytes(20).toString("hex");
            } catch (error) {
                utils.internalError(error, request, response);
                return;
            }

            writeStudentInfo(studentInfo, function () {
                fillAndSendTemplate(studentInfo);
            });
        });
    }

    // Creates the user file and send template
    function createFileAndSendToken(message, cognome, nome) {
        writeStudentInfo({
            "Nome": nome,
            "Cognome": cognome,
            "Matricola": message.matricola,
            "Token": "",
            "Blog": "Url blog non ancora presente.",
            "Twitter": "Account Twitter non ancora presente.",
            "Wikipedia": "Account Wikipedia non ancora presente.",
            "Video": "Video non ancora presente."
        },
        function () {
            possiblySendTemplate(message);
        });
    }

    utils.readBodyJSON(request, response, function (message) {
        fs.readFile("studenti-rd.json", "utf8", function (error, data) {
            var i, vector;

            if (error) {
                utils.internalError(error, request, response);
                return;
            }

            vector = utils.safelyParseJSON(data);
            if (vector === null) {
                utils.internalError("signup: students database parsing error",
                  request, response);
                return;
            }

            console.info("signup: VALID_STUDENTS_DATA");

            //
            // XXX: here we may want to organize the students database
            // by matricola to have O(1) lookup (rather than O(n)).
            //
            for (i = 0; i < vector.length; i++)
                if (vector[i].MATRICOLA === message.matricola)
                    break;
            if (i === vector.length) {
                utils.internalError("signup: matricola not found",
                  request, response);
                return;
            }

            console.info("signup: FOUND_STUDENT");

            fs.exists("./studenti/s" + message.matricola + ".json",
              function(exists) {
                if (!exists)
                    createFileAndSendToken(message, vector[i].COGNOME,
                      vector[i].NOME);
                else
                    possiblySendTemplate(message);
            });
        });
    });

};

//
// Invoked when the student confirms that his/her data is correct; should
// run the mailer to communicate to the user the token.
//
exports.handleConfirm = function (request, response) {
    utils.readBodyJSON(request, response, function (message) {

        if (message.matricola === undefined) {
            utils.internalError("signup: malformed input message",
              request, response);
            return;
        };

        console.info("signup: sending email to %s", message.matricola);
        mailer.sendToken(message.matricola);

        utils.writeHeadVerboseCORS(response, 200);
        response.end();
    });
};
