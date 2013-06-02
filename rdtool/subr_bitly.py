# rdtool/subr_bitly.py

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

""" Extract tags from student posts """

import json
import logging
import os
import sys
import urllib

if __name__ == "__main__":
    sys.path.insert(0, ".")

from rdtool import subr_http

#
# You cannot shorten URLs using /v3/shorten unless you are authenticated;
# the documentation recommends to use OAUTH, but you can get away with the
# API key as well (even if this feature is depricated).
#
# See: <http://dev.bitly.com/links.html#v3_shorten>.
#

MAXLENGTH = 1 << 18

def readconf():
    """ Read configuration """

    rcfile = os.sep.join([os.environ["HOME"], ".bitly"])

    filep = open(rcfile, "r")
    filep.seek(0, os.SEEK_END)
    total = filep.tell()
    filep.seek(0, os.SEEK_SET)
    if total > MAXLENGTH:
        logging.warning("subr_bitly: configuration file too large")
        return

    data = filep.read()
    filep.close()
    return json.loads(data)

def shorten(url, noisy=0):
    """ Shorten URLs using bit.ly """

    authdata = readconf()
    if not authdata:
        return

    orig_url = url

    url = urllib.quote(url, safe="")
    path = "/v3/shorten?login=%s&apiKey=%s&longUrl=%s" % (
      authdata["login"], authdata["api_key"], url)
    result = subr_http.fetch("api-ssl.bitly.com", path, noisy=noisy)
    if not result:
        logging.warning("subr_bitly.py: can't shorten %s", orig_url)
        return

    response, body = result

    ctype = response.getheader("Content-Type")
    if not ctype:
        logging.warning("subr_bitly.py: no content type")
        return
    ctype, encoding = subr_http.parse_content_type(ctype)
    if ctype != "application/json":
        logging.warning("subr_bitly.py: bad content type")
        return

    if encoding:
        body = body.decode(encoding)

    dictionary = json.loads(body)
    if not "data" in dictionary or not "url" in dictionary["data"]:
        logging.warning("subr_bitly.py: invalid dictionary")
        return

    return dictionary["data"]["url"]

if __name__ == "__main__":
    logging.getLogger().setLevel(logging.DEBUG)
    if len(sys.argv) == 2:
        result = shorten(sys.argv[1], noisy=1)
        sys.stdout.write("%s\n" % result)
        sys.exit(0)
    sys.stderr.write("usage: subr_bitly.py url\n")
    sys.exit(1)
