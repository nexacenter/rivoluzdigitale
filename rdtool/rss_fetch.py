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
                                    [], real_link)
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

        folder = subr_misc.make_post_folder(date, site)
        subr_misc.mkdir_recursive_idempotent(folder)

        time.sleep(random.randrange(5, 8))
        link = subr_bitly.shorten(link, noisy=noisy)

        filename = subr_misc.bitlink_to_filename(link)
        pname = os.sep.join([folder, filename])
        if os.path.isfile(pname):
            logging.info("main: file already exists: %s", pname)
            continue

        time.sleep(random.randrange(5, 8))
        _, body = subr_http.fetch_url(link, noisy=noisy)

        filep = open(pname, "w")
        filep.write(body)
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
            level = logging.INFO
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
