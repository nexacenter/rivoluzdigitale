# rss_fetch/subr_rss.py

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

""" Fetch the RSS feeds of a website """

import logging
import sys

if __name__ == "__main__":
    sys.path.insert(0, ".")

from rss_fetch import subr_http

PATHS = (
         "/rss",      # tumblr.com
         "/feed/",    # wordpress.com
         "/rss.xml",  # blogspot.it
        )

def fetch(site, noisy=0):
    """ Fetch RSS feeds of a website """

    for path in PATHS:
        logging.info("subr_rss: try with %s for %s", path, site)

        result = subr_http.fetch(site, path, noisy=noisy)
        if not result:
            continue
        response, body = result

        ctype = response.getheader("Content-Type")
        if not ctype:
            logging.warning("subr_rss: no content-type")
            continue

        ctype, _ = subr_http.parse_content_type(ctype)
        if (
            ctype != "application/atom+xml" and
            ctype != "application/rss+xml" and
            ctype != "text/xml" and
            ctype != "application/xml"
           ):
            logging.warning("subr_rss: bad content type: %s", ctype)
            continue

        #
        # Here we MUST NOT decode the body, because the XML reader tries
        # to decode the body before processing it.
        #
        #if encoding:
        #    body = body.decode(encoding)

        return body

    logging.error("subr_rss: can't fetch RSS for %s", site)

if __name__ == "__main__":
    logging.getLogger().setLevel(logging.DEBUG)
    if len(sys.argv) == 2:
        fetch(sys.argv[1], noisy=1)
        sys.exit(0)
    sys.stderr.write("usage: subr_rss site\n")
    sys.exit(1)
