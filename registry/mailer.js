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

/*jslint node: true */
"use strict";

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
    fs.readFile("/etc/rivoluz/mailpasswd.json", "utf8", function (error, data) {
        console.info("mailer: config: opening file");
        mailConf = utils.safelyParseJSON(data);
        if (mailConf === null) {
            console.error("mailer: config: invalid file");
            process.exit(1);
        }
        if (mailConf.override !== undefined) {
            console.warn("mailer: config: OVERRIDE to <%s>", mailConf.override);
            console.warn(
                "mailer: config: assuming you are testing the registry...");
        }
        console.info("mailer: config: success");
        callback();
    });
};

exports.sendToken = function (matricola, callback) {
    fs.readFile("/var/lib/rivoluz/s" + matricola + ".json",
        "utf8", function (error, data) {
            var address, student, token;

            if (error) {
                console.warn("mailer: cannot open student file");
                callback(error);
                return;
            }

            student = JSON.parse(data);
            if (student === null) {
                console.warn("mailer: cannot parse student json");
                callback(error);
                return;
            }
            token = student.Token;

            address = "s" + matricola + "@studenti.polito.it";

            // Override the destination address for testing purpose
            if (mailConf.override !== undefined) {
                console.warn("mailer: honor OVERRIDE <%s>", mailConf.override);
                address = mailConf.override;
            }

            exports.reallySendToken__(address, token, callback);
        });
};

// Separate semi-private function for testability
exports.reallySendToken__ = function (address, token, callback) {
    var smtpTransport;

    smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: mailConf["auth"]
    });

    var mailOptions = {
        from: mailConf["sender"],
        to: address,
        bcc: mailConf["sender"],
        subject: "RivoluzDigitale: Registrazione su highgarden.polito.it",
        text: "Per completare la registrazione vai su:\n" +
            "\n" +
            "    https://highgarden.polito.it:4443/login_once " +
            "\n\n" +
            "e inserisci la seguente chiave:\n\n" +
            "    " + token + "\n" +
            "\n" +
            "Grazie!\n" +
            "-- \n" +
            "Docenti RivoluzDigitale\n"
    };

    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.info("mailer: cannot send message");
            callback(error);
            return;
        }
        console.info("mailer: message sent");
        smtpTransport.close();
        callback();
    });
};
