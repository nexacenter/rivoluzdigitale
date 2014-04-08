// registry/backend.js

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
// Code to manage the backend
//

/*jslint node: true */
"use strict";

var fs = require("fs");
var utils = require("./utils");

var MATRICOLA = /^[0-9]{6}$/;
var TOKEN = /^[A-Fa-f0-9]{40}$/;
var MAYBE_EMPTY_TOKEN = /^(|[A-Fa-f0-9]{40})$/;
var PWDHASH = /^[A-Fa-f0-9]{32}$/;

exports.validMatricola = function (maybeMatricola) {
    return maybeMatricola.match(MATRICOLA);
};

exports.validToken = function (maybeToken) {
    return maybeToken.match(TOKEN);
};

exports.validPwdHash = function (maybePwdHash) {
    return maybePwdHash.match(PWDHASH);
};

function fixStringCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

exports.getUsers = function (callback) {

    console.info("backend: getUsers");

    // Note: sync so we don't need to deal with concurrent I/O
    utils.readFileSync("studenti/.htpasswd", "utf8",
        function (error, data) {
            var users;

            console.info("backend: getUsers callback");

            if (error) {
                console.warn("backend: can't read passwd file");
                callback(error);
                return;
            }

            console.info("backend: successfully read passwd file");

            users = utils.safelyParseJSON(data);
            if (users === null) {
                console.warn("backend: can't parse passwd file");
                callback("backend: safelyParseJSON failed");
                return;
            }

            // TODO: validate users?

            console.info("backend: imported %d users", Object.keys(users).length);
            callback(null, users);
        });
};

exports.saveUsers = function (matricola, hash, callback) {

    exports.getUsers(function (error, users) {
        var data;

        if (error) {
            callback(error);
            return;
        }

        users[matricola] = hash;

        data = JSON.stringify(users, undefined, 4);

        // Note: sync so we don't need to deal with concurrent I/O
        utils.writeFileSync("studenti/.htpasswd", data, function (error) {

            if (error) {
                callback(error);
                return;
            }
            console.log("backend: password stored for %s", matricola);
            callback();
        });

    });
};

exports.readStudentInfo = function (matricola, callback) {

    console.info("backend: readStudentInfo");

    // Note: sync so we don't need to deal with concurrent I/O
    utils.readFileSync("./studenti/s" + matricola + ".json", "utf8",
        function (error, data) {
            var stud;

            console.info("backend: readStudentInfo callback");

            if (error) {
                console.error("backend: readStudentInfo: read error");
                callback(error);
                return;
            }

            stud = utils.safelyParseJSON(data);
            if (stud === null) {
                callback("backend: readStudentInfo: invalid JSON");
                return;
            }

            // TODO: validate stud?

            console.info("backend: readStudentInfo: success");
            callback(null, stud);
        });
};

function doWriteInfo(curInfo, callback) {
    var data;

    // I hate all uppercase
    curInfo.Cognome = fixStringCase(curInfo.Cognome);
    curInfo.Nome = fixStringCase(curInfo.Nome);

    data = JSON.stringify(curInfo, undefined, 4);

    // Note: sync so we don't need to deal with concurrent I/O
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
}

var knownKeys = {
    "Nome": /^[A-Za-z\'\- ]+$/,
    "Cognome": /^[A-Za-z\'\- ]+$/,
    "Matricola": MATRICOLA,
    "Token": MAYBE_EMPTY_TOKEN,
    "Blog": /^(|http(|s)\:\/\/[A-Za-z0-9\.\-\_\%\?\=\/]+)$/,
    "Twitter": /^(|@[A-Za-z0-9_]{1,15})$/,
    "Wikipedia": /^(|(U|u)tente\:.*)$/,
    "Video": /^(|http(|s)\:\/\/[A-Za-z0-9\.\-\_\%\?\=\/]+)$/,
    "Hash": PWDHASH
};

exports.hasValidKeys = function (something) {

    Object.keys(something).forEach(function (key) {
        if (knownKeys[key] === undefined) {
            console.error("backend: missing key: %s", key);
            return false;
        }
    });

    return true;
};

exports.writeStudentInfo = function (newInfo, callback) {

    console.info("backend: writeStudentInfo");

    exports.readStudentInfo(newInfo.Matricola, function (error, savedInfo) {
        var index, key, keys;

        console.info("backend: writeStudentInfo after readStudentInfo");

        if (error && error.code === "ENOENT") {
            doWriteInfo(newInfo, callback);
            return;
        }
        if (error) {
            callback(error);
            return;
        }

        keys = Object.keys(newInfo);
        for (index = 0; index < keys.length; ++index) {
            key = keys[index];
            if (knownKeys[key] === undefined) {
                console.warn("backend: unknown key");
                callback("backend: unknown key");
                return;
            }
            if (newInfo[key].match(knownKeys[key]) === null) {
                console.info("backend: regexp does not match");
                callback("signup: regexp does not match");
                return;
            }
            console.info("backend: regexp match");
            savedInfo[key] = newInfo[key];
        }

        doWriteInfo(savedInfo, callback);
    });
};
