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

'use strict';

var backend = require ("./backend.js");
var fs = require("fs");
var http = require("http");
var priv = require("./private.js");
var utils = require("./utils.js");

var realm = "Area studenti";

function verifyLogin (request, response, callback) {

    backend.getUsers(function (error, users) {

        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        var user = utils.safelyLogin(request, response, realm, users);
        if (user === false) {
            console.log("login: unauthorized");
            response.writeHead(401, {
                'Content-Type': 'text/html',
                'WWW-Authenticate': 'Digest realm="' + realm + '",qop="auth"'
            });
            response.end();
            return;
        }

        console.log("login: logged in as: %s", user);
        callback(user);
    });
}

exports.handleRequest = function(request, response) {
    verifyLogin(request, response, function (user) {
        priv.generatePage(request, response, user);
    });
};

exports.modPage = function(request, response) {
    verifyLogin(request, response, function () {
        priv.modPage(request, response);
    });
};
