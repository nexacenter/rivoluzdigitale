// registry/processing/studentPost.js

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
// List student post and create html page for each one
//

var download = require("./download");
var fs = require("fs");
var path = require("path");
var utils = require("../utils");

if (process.argv.length != 3 || (process.argv[2] !== "Post1" &&
    process.argv[2] !== "Post2" && process.argv[2] !== "Post3")) {
    console.error("Usage: nodejs studentPost.js Post1|Post2|Post3");
    process.exit(1);
}

var ALESSIO = "s180975.json";
var DATADIR = "/var/lib/rivoluz";
var POST_FIELD = process.argv[2];
var SIMONE = "s178682.json";

var OUTDIR = path.join("/var/lib/rivoluz/", POST_FIELD);

fs.stat(OUTDIR, function (error, stats) {
    if (error && error.code !== "ENOENT") {
        console.error("studentPost: %s", error);
        process.exit(1);
    }

    if (error) {
        fs.mkdir(OUTDIR, 0755, function (error) {
            if (error) {
                console.error("studentPost: %s", error);
                process.exit(1);
            }
            kickOff();
        });
        return;
    }

    if (!stats.isDirectory()) {
        console.error("studentPost: not a directory");
        process.exit(1);
    }

    kickOff();
});

function kickOff() {
    var outfile = fs.createWriteStream(path.join(OUTDIR, "/summary.csv"), {
        flags: "w",
        encoding: "utf-8",
        mode: 0644
    });

    outfile.on("error", function (error) {
        console.error("studentPost: %s", error);
        process.exit(1);
    });

    outfile.write("Matricola," + POST_FIELD + "\n", function () {
        fs.readdir(DATADIR, function (error, files) {
            if (error) {
                console.error("studentPost: %s", error);
                process.exit(1);
            }
            processStudentInfo(outfile, files, 0);
        });
    });
}

function processStudentInfo (outfile, filesVector, index) {
    while (index < filesVector.length) {
        var fileName = filesVector[index++];

        if (path.extname(fileName) !== ".json")
            continue;
        if (fileName === SIMONE || fileName === ALESSIO)
            continue;

        console.info("studentPost: reading %s", fileName);

        var data = fs.readFileSync(path.join(DATADIR, fileName));
        var studentInfo = utils.safelyParseJSON(data);

        if (!studentInfo || !studentInfo[POST_FIELD])
            continue;

        download.downloadPost(studentInfo.Matricola, studentInfo[POST_FIELD],
                              0, function (error, body) {
            if (error) {
                console.warn("studentInfo: %s", error);
                //
                // XXX: Write the error in the student post file, so that we
                // can easily grep for [ERR] later.
                //
                writePost(studentInfo.Matricola, error, function () {
                    setTimeout(function () {
                        processStudentInfo(outfile, filesVector, index);
                    }, 0.0);
                });
                return;
            }
            writePost(studentInfo.Matricola, body, function () {
                outfile.write(studentInfo.Matricola + "," + studentInfo[
                              POST_FIELD] + "\n", function () {
                    console.info("studentPost: deferred processStudentInfo");
                    processStudentInfo(outfile, filesVector, index);
                });
            });
        });

        break;  /* Let the writable stream breathe */
    }
}

function writePost(matricola, data, callback) {
    fs.writeFile(path.join(OUTDIR, "s" + matricola + ".html"),
                 data, {mode: 0644}, function (error) {
        callback(error);
    });
}
