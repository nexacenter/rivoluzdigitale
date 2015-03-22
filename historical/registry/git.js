// registry/git.js

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
// Periodically run Git
//

"use strict";

var child_process = require("child_process");

//
// Note: Git does not like it, if we write into the log file while we
// prepare to commit. For this reason, the log statements below have
// been commented out by me.
//

// Would be dangerous to use this function w/o static command
function execGit__(command, callback) {
    //console.info("git: about to run '%s'", command);
    child_process.exec(command, {
        "cwd": "/var/lib/rivoluz/",
        "timeout": 10,
        "env": {
            "HOME": "/",
            "LOGNAME": process.env["LOGNAME"],
            "PATH": "/usr/local/bin:/usr/bin:/bin",
            "TMPDIR": "/tmp",
            "USER": process.env["USER"]
        }},
        function (error, stdout, stderr) {
            if (error) {
                //console.warn("git: '%s' failed: %s", command, error);
                return;
            }
            //console.info("git: '%s' succeeded", command);
            if (callback !== undefined) {
                callback(stdout, stderr);
            }
        });
}

function gitCommit() {
    execGit__("git commit -am Sync");
}

function parseGitStatus(stdout) {
    if (stdout.length === 0) {
        //console.info("git: nothing to commit");
        return;
    }
    gitCommit();
}

function gitStatus() {
    execGit__("git status --porcelain", parseGitStatus);
}

function gitAddCommit() {
    execGit__("git add .", gitStatus);
}

exports.runGit = function () {
    gitAddCommit();
};

exports.start = function () {
    setInterval(exports.runGit, 150000);
};
