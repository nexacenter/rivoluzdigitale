# rdtool/rss_fetch.py

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

""" Main of rss_fetch """

from xml import sax

import getopt
import json
import logging
import os
import random
import re
import sys
import time
import urlparse

if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(
      os.path.abspath(__file__))))

from rdtool import sax_atom
from rdtool import sax_rss
from rdtool import subr_bitly
from rdtool import subr_http
from rdtool import subr_misc
from rdtool import subr_rss

def process_site(site, noisy):
    """ Process the feeds of a site """

    logging.info("")
    logging.info("* site: %s", site)
    logging.info("")

    result = subr_rss.fetch(site, noisy=noisy)
    if not result or not result[0]:
        return
    body = result[0]

    if "<rss" not in body:
        handler = sax_atom.AtomHandler()
    else:
        handler = sax_rss.RssHandler()
    sax.parseString(body, handler)

    content = zip(handler.links, handler.pub_dates)
    for link, date in content:

        parsed = urlparse.urlsplit(link)
        real_link = []
        result = subr_http.retrieve("HEAD", "http", parsed[1], parsed[2],
                                    [], real_link, {})
        if result != 200:
            logging.warning("rss_fetch: invalid link: %s", link)
        link = real_link[0]

        index = link.rfind("?")
        if index >= 0:
            link = link[:index]
        if link.startswith("https://"):
            link = link.replace("https://", "http://")

        logging.info("")
        logging.info("- <%s>", link)
        logging.info("")

        bitlink = subr_bitly.shorten(link, noisy=noisy)
        if not bitlink:
            logging.warning("rss_fetch: bitly API failed")
            continue

        bitlink = bitlink.replace("http://bit.ly/", "")
        bitlink = bitlink.replace("https://bit.ly/", "")

        if not re.search("^[A-Za-z0-9]+$", bitlink):
            logging.warning("rss_fetch: invalid bitlink <%s>; skip", bitlink)
            continue

        dirpath = subr_misc.make_post_folder(site, bitlink)
        if os.path.isdir(dirpath):
            logging.warning("rss_fetch: dup <%s>; skip", dirpath)
            continue

        subr_misc.mkdir_recursive_idempotent(dirpath)

        filename = "%02d-%02d-%02d.html" % (date[0], date[1], date[2])
        pathname = os.sep.join([dirpath, filename])

        # Pause a bit before the download so we sleep in any case
        time.sleep(random.random() + 0.5)

        bodyv = []
        result = subr_http.retrieve("GET", "http", parsed[1], parsed[2],
                                    bodyv, [], {})
        if result != 200:
            logging.warning("rss_fetch: cannot retrieve page: %s", link)
        link = real_link[0]

        filep = open(pathname, "w")
        for chunk in bodyv:
            filep.write(chunk)
        filep.close()

def main():
    """ Main function """
    try:
        options, arguments = getopt.getopt(sys.argv[1:], "d:v")
    except getopt.error:
        sys.exit("usage: rss_fetch [-v] [-d dir] [site...]")

    destdir = None
    level = logging.WARNING
    noisy = 0
    for name, value in options:
        if name == "-d":
            destdir = value
        elif name == "-v":
            if level == logging.WARNING:
                level = logging.INFO
            else:
                level = logging.DEBUG
            noisy = 1

    logging.basicConfig(level=level, format="%(message)s")

    if not arguments:
        filep = open("etc/rss/blogs.json", "r")
        arguments = json.load(filep)
        filep.close()

    if destdir:
        os.chdir(destdir)

    for site in arguments:
        try:
            process_site(site, noisy)
        except (KeyboardInterrupt, SystemExit):
            break
        except:
            logging.warning("rss_fetch: internal error", exc_info=1)

if __name__ == "__main__":
    main()
