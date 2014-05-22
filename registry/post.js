// registry/post.js

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
// Manage the '/post' URL 
//

/*jslint node: true */
"use strict";

var backend = require("./backend");
var fs = require("fs");
var utils = require("./utils");

var DIGIT = /^[0-9]$/;

exports.handleRequest = function (request, response) {

    var composedPath, urlPath, contentType, params;

    //
    // Check the request
    //

    params = request.url.split("/");

    if (params[0] !== "") {
        console.warn("post: invalid params[0]");
        utils.badRequest(response);
        return;
    }

    if (params[1] !== "post") {
        console.warn("post: params[1] should be 'post'");
        utils.badRequest(response);
        return;
    }

    if (params[2] !== "read" && params[2] !== "annotate" &&
            params[2] !== "view-source") {
        console.warn("annotator: params[2] (the action) is invalid");
        utils.badRequest(response);
        return;
    }

    if (!params[3].match(backend.MATRICOLA)) {
        console.warn("annotator: params[3] (the matricola) is invalid");
        utils.badRequest(response);
        return;
    }

    if (!params[4].match(DIGIT)) {
        console.warn("annotator: params[4] (the post number) is invalid");
        utils.badRequest(response);
        return;
    }

    //
    // Serve the request
    //

    if (params[2] === "read" || params[2] === "view-source") {
        composedPath = "/var/lib/rivoluz/Post" + params[4] + "/s"
            + params[3] + ".html";
        if (params[2] !== "view-source") {
            utils.serveAbsolutePath__(composedPath, response,
                "text/html; charset=utf-8");
        } else {
            utils.serveAbsolutePath__(composedPath, response,
                "text/plain; charset=utf-8");
        }
        return;
    }

    fs.readFile("./html/annotate.tpl.html", "utf8", function (error, data) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }
        urlPath = params[3] + "/" + params[4];
        data = data.replace(/@URL_PATH@/g, urlPath);
        utils.writeHeadVerbose(response, 200, {
            "Content-Type": "text/html"
        });
        response.end(data);
    });
};
