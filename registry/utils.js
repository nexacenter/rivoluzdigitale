// registry/utils.js

/*-
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

/*jslint node: true */
"use strict";

var authlib = require("http-digest-auth");
var fs = require("fs");

var writeHeadVerbose = function (response, status, headers) {
    if (headers === undefined) {
        headers = {};
    }
    console.info("> HTTP/1.1 %d ...", status);
    Object.keys(headers).forEach(function (key) {
        console.info("> %s: %s", key, headers[key]);
    });
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

var internalError = function (error, request, response) {
    console.error("Internal error:", error);
    writeHeadVerboseCORS(response, 500);
    response.end("500 - Internal error");
};

exports.badRequest = function (response) {
    console.error("Bad request");
    writeHeadVerboseCORS(response, 400);
    response.end("400 - Bad request");
};

exports.notFound = function (response) {
    console.error("File not found");
    writeHeadVerboseCORS(response, 404);
    response.end("404 - File not found");
};

exports.safelyLogin = function (request, response, realm, users) {
    console.info("utils: safelyLogin");
    try {
        return authlib.login(request, response, realm, users);
    } catch (error) {
        // Note: because autlib.login() returns indeed false on error
        return false;
    }
};

exports.safelyLogout = function (request) {
    try {
        return authlib.logout(request);
    } catch (error) {
        // Note: because autlib.login() returns indeed false on error
        return false;
    }
};

var safelyParseJSON = function (data) {
    console.info("utils: safelyParseJSON");
    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

exports.logRequest = function (request) {
    console.info("< %s %s HTTP/%s", request.method, request.url,
        request.httpVersion);
    Object.keys(request.headers).forEach(function (key) {
        console.info("< %s: %s", key, request.headers[key]);
    });
    console.info("<");
};

exports.readBodyJSON = function (request, response, callback) {
    var body = [];

    console.info("readBodyJSON: REQUEST");

    if (request.method === "OPTIONS") {
        writeHeadVerboseCORS(response, 200);
        response.end();
        return;
    }

    //
    // We don't check the value of the content type and we assume that
    // the client sends us valid JSON. If not, the JSON parser will fail
    // and we will return an error to the client.
    //

    request.setEncoding('utf8');

    console.info("readBodyJSON: BODY_BEGIN");

    request.on("data", function (data) {
        // TODO: make sure that the body cannot be too large
        console.info("readBodyJSON: BODY_CHUNK");
        body.push(data);
    });

    request.on("end", function () {
        var bodyString, stud;

        console.info("readBodyJSON: BODY_END");

        bodyString = body.join("");

        stud = safelyParseJSON(bodyString);
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
exports.servePath__ = function (filename, response, mimetype) {
    var localPath = __dirname + filename;
    exports.serveAbsolutePath__(localPath, response, mimetype);
};

//
// This function has a ugly name (terminated by two underscores) to
// remark that it does not check whether the file that we serve is
// below the document root. Use with care and always provide to such
// function a file path hardcoded in the program source code.
//
exports.serveAbsolutePath__ = function (localPath, response, mimetype) {

    fs.exists(localPath, function (exists) {
        var stream;

        if (!exists) {
            console.warn("serveAbsolutePath__: file not found: " + localPath);
            exports.notFound(response);
            return;
        }

        console.info("serveAbsolutePath__: serving file: " + localPath);
        if (mimetype) {
            writeHeadVerboseCORS(response, 200, {"Content-Type": mimetype});
        } else {
            writeHeadVerboseCORS(response, 200);
        }
        stream = fs.createReadStream(localPath);
        stream.pipe(response);
    });
};

exports.readFileSync = function (pathname, encoding, callback) {
    var data;
    console.info("utils: readFileSync");
    try {
        data = fs.readFileSync(pathname, encoding);
    } catch (error) {
        console.warn("utils: readFileSync error: %s", error);
        callback(error);
        return;
    }
    console.info("utils: readFileSync success");
    callback(null, data);
};

exports.writeFileSync = function (pathname, data, callback) {
    try {
        fs.writeFileSync(pathname, data);
    } catch (error) {
        console.warn("writeFileSync: %s", error);
        callback(error);
        return;
    }
    callback();
};

//
// Note: the following functions are used inside this module, so they
// cannot be directly exported.
//
exports.writeHeadVerboseCORS = writeHeadVerboseCORS;
exports.writeHeadVerbose = writeHeadVerbose;
exports.internalError = internalError;
exports.safelyParseJSON = safelyParseJSON;
