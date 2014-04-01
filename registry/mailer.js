// registry/mailer.js

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
// The mailer
//

var nodemailer = require("nodemailer");
var fs = require("fs");
var utils = require("./utils.js");

/*-
 * Example JSON:
 *
 *   {
 *    "sender": "nobody@example.com",
 *    "auth" {
 *         "user": "nobody@example.com",
 *         "pass": "boydon"
 *     }
 *   }
 */
var mailConf = {};

exports.init = function (callback) {
    fs.readFile(".mailpasswd", "utf8", function (error, data) {
        console.info("mailer: opening config file");
        mailConf = utils.safelyParseJSON(data);
        if (mailConf === null) {
            console.error("mailer: invalid config file");
            process.exit(1);
        }
        callback();
    });
};

exports.sendToken = function (matricola) {
    fs.readFile("./studenti/s" + matricola + ".json",
      "utf8", function (error, data) {
        var address, student, token;

        if (error) {
            console.warn("mailer: cannot open student file");
            utils.internalError(error, request, response);
            return;
        }

        student = JSON.parse(data);
        if (student === null) {
            console.warn("mailer: cannot parse student json");
            utils.internalError("mailer: student json parsing error",
              request, response);
            return;
        }
        token = student.Token;

        address = "s" + matricola + "@studenti.polito.it";

        exports.reallySendToken__(address, token);
    });
};

// Separate semi-private function for testability
exports.reallySendToken__ = function(address, token) {
    var smtpTransport;

    smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: mailConf["auth"]
    });

    var mailOptions = {
        from: mailConf["sender"],
        to: address,
        bcc: mailConf["sender"],
        subject: "Registrazione sul server RD",
        text: "Questa e' una mail automatica proveniente dal server " +
              "del corso Rivoluzione Digitale:\n\n" +
              "Per completare la registrazione vai su: " +
              "http://kingslanding.polito.it:8080/login_once " +
              "e inserisci la chiave.\n\n" +
              "Chiave: " + token + "\n"
    };

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.warn(error);
        } else {
            console.info("mailer: message sent");
        }
        smtpTransport.close();
    });
};
