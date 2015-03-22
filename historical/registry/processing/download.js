// registry/processing/download.js

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
// Download an URL (handles http/https and redirections)
//

var http = require("http");
var https = require("https");
var url = require("url");

exports.downloadPost = function(matricola, link, redirections, callback) {

    console.info("download: GET %s", link);

    var request, parsed = url.parse(link);
    if (parsed.protocol === "https:") {
        request = https.get(link);
    } else if (parsed.protocol === "http:") {
        request = http.get(link);
    } else {
        callback("[ERR] invalid protocol");
        return;
    }

    request.on("error", function (error) {
        callback("[ERR] " + error);
    });

    request.on("response", function (response) {
        if (response.statusCode === 301 || response.statusCode === 302) {
            var location = response.headers["location"];
            if (!location) {
                console.warn("download: cannot follow redir");
                callback("[ERR] cannot follow redir");
                return;
            }
            if (redirections > 16) {
                console.warn("download: too many redirections");
                callback("[ERR] too many redirections");
                return;
            }
            setTimeout(function () {
                exports.downloadPost(matricola, location, redirections + 1,
                    callback);
            }, 1000.0);
            return;
        }

        if (response.statusCode !== 200) {
            console.warn("download: cannot download page");
            callback("[ERR] cannot download page");
            return;
        }

        response.setEncoding("utf-8");

        var pageChunks = [];

        response.on("data", function (chunk) {
            pageChunks.push(chunk);
        });

        response.on("end", function () {
            console.info("download: passing %s post to parent", matricola);
            callback(null, pageChunks.join(""));
        });
    });
}

if (require.main === module) {

    // Make sure that we correctly follow an http -> http redirection
    exports.downloadPost("201470", "http://wp.me/p4sK9W-2F", 0,
        function (error, body) {
        if (error) {
            console.info("download: %s", error);
            return
        }
        console.info("download: %d bytes", body.length);
    });

    //
    // Make sure that we correctly follow an http -> https redirection
    // Note: http://bit.ly/1n9SRYK => https://wp.me/p4sK9W-2F
    //
    exports.downloadPost("201470", "http://bit.ly/1n9SRYK", 0,
        function (error, body) {
        if (error) {
            console.info("download: %s", error);
            return
        }
        console.info("download: %d bytes", body.length);
    });

}
