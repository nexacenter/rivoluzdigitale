// registry/utils.js

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
// Utils
//

var authlib = require("http-digest-auth");
var fs = require("fs");

var internalError = function (error, request, response) {
    console.error(error);
    writeHeadVerboseCORS(response, 500);
    response.end();
};

exports.safelyLogin = function (request, response, realm, users) {
    try {
        return authlib.login(request, response, realm, users);
    } catch (error) {
        return false;
    }
};

exports.safelyLogout = function (request) {
    try {
        return authlib.logout(request);
    } catch (error) {
        return false;
    }
};

var safelyParseJSON = function (data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

exports.logRequest = function (request) {
    console.info("< %s %s HTTP/%s", request.method, request.url,
      request.httpVersion);
    for (key in request.headers) {
        console.info("< %s: %s", key, request.headers[key]);
    }
    console.info("<");
};

var writeHeadVerbose = function (response, status, headers) {
    if (headers === undefined) {
        headers = {};
    }
    console.info("> HTTP/1.1 %d ...", status);
    for (key in headers) {
        console.info("> %s: %s", key, headers[key]);
    }
    console.info(">");
    response.writeHead(status, headers);
};

var writeHeadVerboseCORS = function (response, status, headers) {
    if (headers === undefined) {
        headers = {};
    }
    headers["Access-Control-Allow-Method"] = "GET, HEAD, POST";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Accept";
    headers["Access-Control-Allow-Origin"] = "*";
    writeHeadVerbose(response, status, headers);
};

exports.readBodyJSON = function (request, response, callback) {
    var body = [];

    console.info("readBodyJSON: REQUEST");

    if (request.method === "OPTIONS") {
        writeHeadVerboseCORS(response, 200);
        response.end();
        return;
    }

    //if (request["Content-Type"] !== "application/json") {
    //    internalError("readBodyJSON: invalid content type", request, response);
    //    return;
    //}

    request.setEncoding('utf8');

    console.info("readBodyJSON: BODY_BEGIN");

    request.on("data", function (data) {
        // TODO: make sure that the body cannot be too large
        console.info("readBodyJSON: BODY_CHUNK");
        body.push(data);
    });

    request.on("end", function () {
        var bodyString;

        console.info("readBodyJSON: BODY_END");

        bodyString = body.join("");

        var stud = safelyParseJSON(bodyString);
        if (stud === null) {
            internalError("readBodyJSON: request-body parsing error",
              request, response);
            return;
        }

        console.info("readBodyJSON: VALID_JSON");

        callback(stud);
    });
};

//
// This function has a ugly name (terminated by two underscores) to
// remark that it does not check whether the file that we serve is
// below the document root. Use with care and always provide to such
// function a file path hardcoded in the program source code.
//
exports.servePath__ = function (filename, response) {
    var localPath = __dirname + filename;

    fs.exists(localPath, function(exists) {
        var stream;

        if (!exists) {
            console.warn("servePath__: file not found: " + localPath);
            writeHeadVerboseCORS(response, 404);
            response.end();
            return;
        }

        console.info("servePath__: serving file: " + localPath);
        writeHeadVerboseCORS(response, 200);
        stream = fs.createReadStream(localPath);
        stream.pipe(response);
    });
};

//
// Note: the following functions are used inside this module, so they
// cannot be directly exported.
//
exports.writeHeadVerboseCORS = writeHeadVerboseCORS;
exports.internalError = internalError;
exports.safelyParseJSON = safelyParseJSON;
