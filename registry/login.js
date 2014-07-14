// registry/login.js

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
// Manage the '/login' URL.
//

/*jslint node: true */
'use strict';

var backend = require("./backend");
var fs = require("fs");
var http = require("http");
var priv = require("./private");
var utils = require("./utils");

var REALM = "RivoluzPaginaPersonale";

function verifyLogin(request, response, callback) {

    console.info("login: verifyLogin");
    backend.getUsers(function (error, users) {
        console.info("login: verifyLogin callback");

        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        var user = utils.safelyLogin(request, response, REALM, users);
        if (user === false) {
            console.warn("login: unauthorized");
            utils.writeHeadVerboseCORS(response, 401, {
                'WWW-Authenticate': 'Digest realm="' + REALM +
                    '",qop="auth"'
            });
            response.end();
            return;
        }

        // Just in case, should not really happen
        if (!backend.validMatricola(user)) {
            console.warn("login: invalid user");
            utils.internalError("login: invalid user", request, response);
            return;
        }

        console.info("login: logged in as: %s", user);
        callback(user);
    });
}

exports.handleRequest = function (request, response) {
    console.info("login: handleRequest");
    verifyLogin(request, response, function (user) {
        console.info("login: handleRequest callback");
        priv.generatePage(request, response, user);
    });
};

exports.modPage = function (request, response) {
    console.info("login: modPage");
    verifyLogin(request, response, function (user) {
        console.info("login: modPage callback");
        priv.modPage(request, response, user);
    });
};
