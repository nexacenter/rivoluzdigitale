// registry/init_students.js

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
// Init the students database
//

"use strict";

var csvtojson = require("csvtojson");
var fs = require("fs");
var https = require("https");

var url = "https://didattica.polito.it/pls/portal30/sviluppo.public_iscritti.elenco_csv?p_a_acc=2014&p_cod_ins=01OWCLZ%2001OWCJM%2001OWCLI%2001OWCLJ%2001OWCLL%2001OWCLM%2001OWCLN%2001OWCLS%2001OWCLU%2001OWCLX%2001OWCMA%2001OWCMB%2001OWCMC%2001OWCMH%2001OWCMK%2001OWCMN%2001OWCMO%2001OWCMQ%2001OWCNX%2001OWCNZ%2001OWCOA%2001OWCOD%2001OWCPC%2001OWCPI%2001OWCPL%2001OWCPM%2001OWCPN%2001OWCPW&p_id_inc=197322&p_id_ins=98372&p_id_comm_esa=&p_alfa=AA-ZZ&p_periodo=2";

var request = https.get(url);

request.on("response", function (response) {
    var data = [];

    if (response.statusCode != 200) {
        console.error("invalid response: %d", response.statusCode);
        process.exit(1);
    }

    response.on("data", function (chunk) {
        data.push(chunk);
    });

    response.on("end", function () {
        var body = data.join("");
        var converter = new csvtojson.core.Converter(false);
        var output = process.stdout;
        var started = false;

        converter.on("record_parsed", function (info) {
            if (started) {
                output.write(",\n");
            }
            output.write(JSON.stringify(info, undefined, 4));
            if (!started) {
                started = true;
            }
        });

        output.write("[");

        converter.on("end", function () {
            output.write("]\n");
        });

        converter.from(body);
    });
});
