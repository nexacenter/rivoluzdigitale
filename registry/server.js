// registry/server.js

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
// The HTTP server
//

/*jslint node: true */
"use strict";

var dns = require("dns");
var fs = require("fs");
var https = require("https");
var os = require("os");

exports.start = function (route, port) {

    var server = https.createServer({
        "key": fs.readFileSync("ssl/privkey.pem"),
        "cert": fs.readFileSync("ssl/cert.pem")
    }, route);

    if (port === undefined) {
        port = 4443;
    }

    function listeningHandler() {
        var fingerprint, interfaces = os.networkInterfaces();

        function runningAt(address, port) {
            console.info("server: running at https://" + address + ":" + port +
                "/");
        }

        Object.keys(interfaces).forEach(function (key) {
            var iface, i, j, address;

            iface = interfaces[key];
            for (i = 0; i < iface.length; i += 1) {
                if (iface[i]["family"] !== "IPv4") {
                    continue;
                }
                if (iface[i]["internal"]) {
                    continue;
                }
                address = iface[i]["address"];
                dns.reverse(address, function (error, domains) {
                    if (error) {
                        runningAt(address, port);
                        return;
                    }
                    for (j = 0; j < domains.length; ++j) {
                        runningAt(domains[j], port);
                    }
                });
            }
        });

        fingerprint = fs.readFileSync("ssl/finger.txt", "utf-8");
        fingerprint = fingerprint.trim();
        console.info("server: %s", fingerprint);
    }

    //
    // Note: Node.js automatically deals with clientError (e.g., connection
    // reset by peer): it silently closes the socket.
    //

    server.on("listening", listeningHandler);
    server.listen(port, "0.0.0.0");
};
