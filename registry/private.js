// registry/private.js

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
// Generates the pages you see when you're logged in
//

/*jslint node: true */
"use strict";

var backend = require("./backend");
var fs = require("fs");
var utils = require("./utils");

var generatePage = function (request, response, matricola) {
    console.info("priv: generatePage");
    backend.readStudentInfo(matricola, function (error, stud) {
        console.info("priv: generatePage callback");
        if (error) {
            utils.internalError(error, request, response);
            return;
        }

        fs.readFile("./html/private.tpl.html", "utf8",
            function (error, data) {
                console.info("priv: generatePage: readFile callback");

                if (error) {
                    utils.internalError(error, request, response);
                    return;
                }

                console.info("priv: sending personal page");

                // XXX: better to do this on the client side
                data = data.replace(/@MATRICOLA@/g, matricola);
                data = data.replace(/@NOME@/g, stud.Nome);
                data = data.replace(/@COGNOME@/g, stud.Cognome);
                data = data.replace(/@BLOG@/g, stud.Blog);
                data = data.replace(/@TWITTER@/g, stud.Twitter);
                data = data.replace(/@WIKIPEDIA@/g, stud.Wikipedia);
                data = data.replace(/@VIDEO@/g, stud.Video);

                utils.writeHeadVerboseCORS(response, 200, {
                    "Content-Type": "text/html"
                });

                response.write(data);
                response.end();
            });
    });
};

var modPage = function (request, response) {
    utils.readBodyJSON(request, response, function (stud) {
        if (!backend.hasValidKeys(stud) || stud.Token !== undefined
                || !backend.validMatricola(stud.Matricola)) {
            utils.internalError("private: invalid argument", request, response);
            return;
        }
        backend.writeStudentInfo(stud, function (error) {
            //
            // FIXME: here we ignore the error
            //
            utils.writeHeadVerboseCORS(response, 200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(stud));
            response.end();
        });
    });
};

exports.generatePage = generatePage;
exports.modPage = modPage;
