// registry/login_once.js

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

/*jslint node: true */
'use strict';

var backend = require("./backend.js");
var fs = require("fs");
var utils = require("./utils.js");

exports.servePage = function (request, response) {
    utils.servePath__("/html/login_once.html", response);
};

var handleRequest = function (request, response, matricola, token, hash) {
    backend.readStudentInfo(matricola, function (error, obj) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }
        if (obj.Token !== token) {
            console.info("login_once: wrong token");
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "text/html"
            });
            response.end(
                "La chiave inserita non e' quella corretta per questa matricola."
            );
            return;
        } else {
            console.info("login_once: right token --> saveUsers");
            backend.saveUsers(request, response, matricola, hash);
        }

    });
};

exports.handleToken = function (request, response) {
    console.info("handleToken: harvesting token");
    utils.readBodyJSON(request, response, function (stud) {
        if (!backend.hasValidKeys(stud) || !backend.validToken(stud.Token) ||
                !backend.validMatricola(stud.Matricola) || !backend.validPwdHash(
                stud.Hash)) {
            utils.internalError("login_once: invalid argument", request, response);
            return;
        }
        console.info("handleToken: ricevuto token %s", stud.Token);
        handleRequest(request, response, stud.Matricola, stud.Token, stud.Hash);
    });
};

exports.handleRequest = handleRequest;
