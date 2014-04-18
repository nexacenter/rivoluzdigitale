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

var fs = require("fs");
var path = require("path");
var utils = require("./utils");

var SIMONE = "s178682.json";
var ALESSIO = "s180975.json";

var PATH = "/var/lib/rivoluz";

var DEST_PATH = "blog-studenti.html";

var allinfo = new Array ();
var urlArray;
var urlArray2;
var nameArray;
var blogName;
var urlTwitter;
var blogNum = 0;
var add = 0;

var code = "<table style=\"font-size: 85%;\">\n <tbody>\n\n";

function Blog() {
    this.Blog = 0;
    this.Url = 0;
    this.StudCount = 0;
    this.Studente = new Array ();
}

fs.readdir(PATH, function(error, files) {
    if (error) return done(error);

    for(var i in files) {

        if(path.extname(files[i]) === ".json" && files[i] !== SIMONE
            && files[i] !== ALESSIO) {

                console.info("bloghtml: processing %s", path.join (PATH,files[i]));

                var data = fs.readFileSync (path.join (PATH,files[i])) 
                console.info("bloghtml: reading %s",path.join(PATH,files[i]));
                    
                obj = utils.safelyParseJSON(data);

                if(obj.Blog != "") {

                    urlArray = obj.Blog.split("//");
                    urlArray2 = urlArray[1].split("www.");
                    if(urlArray2[1] === undefined) {
                        nameArray = urlArray2[0].split(".");
                    } else {
                        nameArray = urlArray2[1].split(".");
                    }
                    blogName = nameArray[0];

                    for(var j in allinfo) {
                        if(blogName === allinfo[j].Blog) {
                            add = 1;
                            allinfo[j].StudCount++;
                            allinfo[j].Studente[allinfo[j].StudCount] = obj.Twitter;
                        }
                    }

                    if (add === 0) {
                        allinfo[blogNum] = new Blog();
                        console.info("bloghtml: add new blog %s",obj.Blog);

                        allinfo[blogNum].Blog = blogName;
                        allinfo[blogNum].Url = obj.Blog;
                        allinfo[blogNum].StudCount = 0;
                        allinfo[blogNum].Studente[allinfo[blogNum].StudCount] = obj.Twitter;
                        blogNum++;
                    }
                    add = 0;
                }
        }
    }

    for(var i in allinfo) {
        if(allinfo[i].Blog != "") {
            code += "  <tr>\n    <td>\n      <a href=\'";
            code += allinfo[i].Url;
            code += "\'>";
            code += allinfo[i].Blog;
            code += "</a>\n    </td>";

            allinfo[i].Studente.forEach(function(handleTwitter) {
                code += "\n    <td>\n      <a href=\'";
                code += "https://twitter.com/";

                urlTwitter = handleTwitter.split("@");

                code += urlTwitter[1];
                code += "\'>";
                code += handleTwitter;
                code += "</a>\n    </td>";
            });

            code += "\n  </tr>\n\n\n";
        }
    }

    code += " </tbody>\n</table>";
    console.info(code);

    fs.writeFile(DEST_PATH, code, function (error) {
        if (error) {
            utils.internalError(error, request, response);
            return;
        }
    });

});
