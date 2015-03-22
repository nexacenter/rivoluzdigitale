// registry/processing/wikiUsername.js

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
// Harvesting Wikipedia student's username
//

var fs = require("fs");
var path = require("path");
var utils = require("../utils");

var CONTRIBUTIONS = "https://it.wikipedia.org/wiki/Speciale:Contributi/";
var SUPERCOUNT = "https://tools.wmflabs.org/supercount/index.php?user="; 
var SUPERCOUNTSUFFIX = "&project=it.wikipedia";
var GUC = "https://tools.wmflabs.org/guc/?user=";
var SUMMARY = "https://tools.wmflabs.org/xtools/editsummary/index.php?name="; 
var SUMMARYSUFFIX = "&lang=it&wiki=wikipedia";
var CREATED = "https://tools.wmflabs.org/xtools/pages/index.php?user="; 
var CREATEDSUFFIX = "&lang=it&wiki=wikipedia&namespace=all&redirects=none";
var FILEITWIKI = "https://it.wikipedia.org/w/index.php?title=Speciale:Registri/upload&user=";
var FILECOMMONS = "https://commons.wikimedia.org/w/index.php?title=Special:ListFiles/";

var SIMONE = "s178682.json";
var ALESSIO = "s180975.json";

var PATH = "/var/lib/rivoluz";
var DEST_PATH = "/var/lib/rivoluz/wikipedia";

var students = new Array ();
var lists = "Matricola,Nome utente\n";

if (!fs.existsSync(DEST_PATH)) {
    fs.mkdirSync(DEST_PATH, 0755);
}

fs.readdir(PATH, function(error, files) {
    if (error) return done(error);

    for(var i in files) {
        if(path.extname(files[i]) === ".json" && files[i] !== SIMONE
            && files[i] !== ALESSIO && files[i] !== "annotations.json") {

                var data = fs.readFileSync (path.join (PATH,files[i]))

                obj = utils.safelyParseJSON(data);

                if(obj.Wikipedia != "" && obj.Wikipedia != undefined) {
                    var username = obj.Wikipedia.replace(/(U|u)tente:( |)/g,'');
                    username = username.replace(/ /g,'_');
                    students[obj.Matricola] = username;
                }
        }
    }

    for(var key in students) {
        var usernameSC = students[key].replace(/_/g,'+');
        var summary = "Matricola: " + key + "<br />\n" 
                      + "Utente:" + students[key] + "<br /><br />\n\n"
                      + "<a href=\"" + GUC + students[key]
                      + "\">Edit globali</a><br />\n"
                      + "<a href=\"" + CONTRIBUTIONS + students[key]
                      + "\">Contributi</a><br />\n"
                      + "<a href=\"" + SUPERCOUNT + usernameSC
                      + SUPERCOUNTSUFFIX + "\">Panoramica</a><br />\n"
                      + "<a href=\"" + SUMMARY + students[key]
                      + SUMMARYSUFFIX + "\">Compilazione oggetto</a><br />\n"
                      + "<a href=\"" + CREATED + students[key]
                      + CREATEDSUFFIX + "\">Voci create</a><br />\n"
                      + "<a href=\"" + FILEITWIKI + students[key]
                      + "\">File caricati su itwiki</a><br />\n"
                      + "<a href=\"" + FILECOMMONS + students[key]
                      + "\">File caricati su commons</a><br />\n"

        writeWikiSummary(key, summary, function(matr) {
            console.info("studentWP: writing wiki summary for " + matr);
        });

        lists += key + "," + students[key] + "\n";
    }

    fs.writeFileSync(DEST_PATH + "/lista.csv", lists, {mode:0644});
});

function writeWikiSummary(matricola, data, callback) {
    fs.writeFile(path.join(DEST_PATH, "s" + matricola + ".html"),
                 data, {mode: 0644}, function (error) {
        if (error) {
            callback(error);
        }
        callback(matricola);
    });
}
