// registry/annotate.js

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
// Manage the '/annotate/ URL
//

/*jslint node:true */
"use strict";

var querystring = require("querystring");
var urllib = require("url");
var utils = require("./utils");

var ANNOTATIONS = {};
var ANNOTATIONS_DB = "/var/lib/rivoluz/annotations.json";

exports.handleRequest = function (request, response) {

    // Create - Update - Delete
    if (request.method === "POST" || request.method === "PUT" ||
            request.method === "DELETE") {

        // One must be authorized using SSL to CUD the annotations
        if (request.client === undefined || !request.client.authorized) {
            utils.internalError("unauthorized", request, response);
            return;
        }

        utils.readBodyJSON(request, response, function (message) {
            var state, ranges, globalState;

            console.info("annotate: BEGIN INCOMING MESSAGE");
            console.info("%s", JSON.stringify(message, undefined, 4));
            console.info("annotate: END INCOMING MESSAGE");

            state = ANNOTATIONS[message.uri];
            if (state === undefined) {
                ANNOTATIONS[message.uri] = state = {};
            }

            //
            // XXX Because we don't return the annotation ID, the client
            // sends us the whole annotation when it is updated.
            //
            // See: http://docs.annotatorjs.org/en/latest/storage.html
            //
            ranges = JSON.stringify(message.ranges);
            if (request.method === "POST" || request.method === "PUT") {
                state[ranges] = message;
            } else if (request.method === "DELETE") {
                delete state[ranges];
                if (Object.keys(state).length <= 0) {
                    delete ANNOTATIONS[message.uri];
                }
            } else {
                console.error("annotate: internal error");
                process.exit(1);
            }

            globalState = JSON.stringify(ANNOTATIONS, undefined, 4);

            console.info("annotate: BEGIN STATE AFTER CHANGE");
            console.info("%s", globalState);
            console.info("annotate: END STATE AFTER CHANGE");

            utils.writeFileSync(ANNOTATIONS_DB, globalState,
                function (error) {
                    if (error) {
                        utils.internalError(error, request, response);
                        return;
                    }
                    utils.writeHeadVerboseCORS(response, 200, {
                        "Content-Type": "application/json"
                    });
                    response.end("{}");
                });

        });
        return;
    }

    // Read
    if (request.method === "GET") {
        var body, parsed_url, parsed_query, state, serialized;

        utils.writeHeadVerboseCORS(response, 200, {
            "Content-Type": "application/json"
        });
        body = {
            "rows": []
        };

        parsed_url = urllib.parse(request.url);
        parsed_query = querystring.parse(parsed_url.query);
        state = ANNOTATIONS[parsed_query.uri];

        if (state !== undefined) {
            Object.keys(state).forEach(function (key) {
                body.rows.push(state[key]);
            });
        }

        serialized = JSON.stringify(body, undefined, 4);

        console.info("annotate: BEGIN OUTPUT MESSAGE");
        console.info("%s", serialized);
        console.info("annotate: END OUTPUT MESSAGE");

        response.end(serialized);
        return;
    }

    // OPTIONS
    utils.writeHeadVerboseCORS(response, 200, {
        "Content-Type": "application/json"
    });
    response.end("{}");
};

exports.init = function (callback) {
    utils.readFileSync(ANNOTATIONS_DB, "utf8", function (error, data) {
        console.info("annotate: read config...");
        if (error && error.code === "ENOENT") {
            console.info("annotate: read config... no config yet");
            callback();
            return;
        }
        if (error) {
            callback(error);
            return;
        }
        ANNOTATIONS = utils.safelyParseJSON(data);
        if (!ANNOTATIONS) {
            callback("annotate: invalid JSON");
            return;
        }
        console.info("annotate: read config... ok");
        callback();
    });
};
