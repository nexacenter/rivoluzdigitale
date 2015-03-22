// registry/videostud.js

/*
* Copyright (c) 2014
* Nexa Center for Internet & Society, Politecnico di Torino (DAUIN),
* Alessio Melandri <alessiom92@gmail.com> and
* Simone Basso <bassosimone@gmail.com>.
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

var fs = require("fs");
var path = require("path");
var utils = require("./utils");

var SIMONE = "s178682.json";
var ALESSIO = "s180975.json";

var PATH = "/var/lib/rivoluz";
var PATH_DEST_ALL = "lista_video_correzione_all.csv";
var PATH_DEST_MIN = "lista_video_correzione_min.csv";
var PATH_DEST_MAX = "lista_video_correzione_max.csv";

var PERC = 33;

var dati = "Matricola,Twitter,Video\n";
var dati_min = "Matricola,Twitter,Video\n";
var dati_max = "Matricola,Twitter,Video\n";


fs.readdir(PATH, function(error, files) {
    if (error) return done(error);

    for(var i in files) {

        if(path.extname(files[i]) === ".json" && files[i] !== SIMONE
            && files[i] !== ALESSIO) {

                var data = fs.readFileSync (path.join (PATH,files[i]));
                console.info("videostud: reading %s",path.join(PATH,files[i]));
                    
                obj = utils.safelyParseJSON(data);

                dati += obj.Matricola+","+obj.Twitter+","+obj.Video+"\n";

                num = random (0, 99);
                if (num <= PERC) {
                    dati_min += obj.Matricola+","+obj.Twitter+","+obj.Video+"\n";
                } else {
                    dati_max += obj.Matricola+","+obj.Twitter+","+obj.Video+"\n";
                }

        }
    }

    fs.writeFile(PATH_DEST_ALL, dati, function (error) {
        if (error){
            utils.internalError(error, request, response);
            return;
        }
    });

    fs.writeFile(PATH_DEST_MIN, dati_min, function (error) {
        if (error){
            utils.internalError(error, request, response);
            return;
        }
    });

    fs.writeFile(PATH_DEST_MAX, dati_max, function (error) {
        if (error){
            utils.internalError(error, request, response);
            return;
        }
    });

});


function random (low, high) {
    return Math.random() * (high - low) + low;
}

