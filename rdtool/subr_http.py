# rdtool/subr_http.py

#
# Copyright (c) 2013 Simone Basso <bassosimone@gmail.com>
#
# Permission to use, copy, modify, and distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
#

""" HTTP subroutines """

import httplib
import logging
import sys
import urlparse

MAXBODY = 1 << 22
MAXPIECE = 1 << 16

def parse_content_type(ctype):
    """ Parse Content-Type header value """
    index = ctype.find(";")
    if index >= 0:
        encoding = ctype[index + 1:].strip()
        encoding = encoding.replace("charset=", "")
        ctype = ctype[:index].strip()
    else:
        encoding = None
    return ctype, encoding

def retrieve(method, schema, site, page, bodyvec, real_link, headers):
    """ Retrieve page from site """

    for _ in range(10):
        del real_link[:]
        real_link.append(schema + "://" + site + page)

        logging.debug("")
        logging.debug("* Connect %s using %s...", site, schema)
        if schema == "https":
            connection = httplib.HTTPSConnection(site)
        else:
            connection = httplib.HTTPConnection(site)

        logging.debug("> %s %s HTTP/1.1", method, page)
        connection.putrequest(method, page)
        logging.debug("> Connection: close")
        connection.putheader("Connection", "close")
        logging.debug(">")
        connection.endheaders()

        headers.clear()

        response = connection.getresponse()
        logging.debug("< HTTP/1.1 %d %s", response.status, response.reason)
        for header, value in response.getheaders():
            logging.debug("< %s: %s", header, value)
            headers[header.lower()] = value
        logging.debug("<")

        logging.debug("* reading body...")
        total = 0
        del bodyvec[:]
        while total <= MAXBODY:
            piece = response.read(MAXPIECE)
            if not piece:
                break
            bodyvec.append(piece)
            total += len(piece)
        connection.close()
        if total > MAXBODY:
            logging.warning("subr_http: reading body... too large")
            return -1
        logging.debug("* reading body... %d bytes", total)

        if response.status == 301 or response.status == 302:
            location = response.getheader("Location")
            if not location:
                logging.warning("subr_http: missing location header")
                return -1
            logging.debug("subr_http: redirected to %s", location)
            parsed = urlparse.urlsplit(location)
            schema = parsed[0]
            if parsed[1]:
                site = parsed[1]
            if parsed[2]:
                page = parsed[2]
                if parsed[4]:
                    page += "?"
                    page += parsed[4]
            continue

        if response.status != 200:
            logging.warning("subr_http: bad status: %d", response.status)
        return response.status

    logging.warning("subr_http: too many redirections")
    return -1

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format="%(message)s")
    if len(sys.argv) == 5:
        retrieve(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], [], [], {})
        sys.exit(0)
    sys.stderr.write("usage: subr_http method schema site page\n")
    sys.exit(1)
