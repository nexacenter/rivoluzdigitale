# rss_fetch/main.py

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

import email.utils
import getopt
import logging
import os
import random
import sys
import time

if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(
      os.path.abspath(__file__))))

from rss_fetch import rss_handler
from rss_fetch import subr_bitly
from rss_fetch import subr_http
from rss_fetch import subr_misc
from rss_fetch import subr_rss

def process_site(site, noisy):
    """ Process the feeds of a site """

    logging.info("")
    logging.info("* site: %s", site)
    logging.info("")

    body = subr_rss.fetch(site, noisy=noisy)
    if not body:
        return

    handler = rss_handler.RssHandler()
    sax.parseString(body, handler)

    content = zip(handler.links, handler.pub_dates)
    for link, date in content:

        date = email.utils.parsedate(date)
        if date[0] < 2013 and date[1] < 5 and date[2] <= 15:  # XXX
            continue

        logging.info("")
        logging.info("- <%s>", link)
        logging.info("")

        folder = subr_misc.time_to_folder(date)
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
        sys.exit("usage: rss_fetch [-v] [-d dir] site...")
    if not arguments:
        sys.exit("usage: rss_fetch [-v] [-d dir] site...")

    destdir = None
    level = logging.WARNING
    noisy = 0
    for name, value in options:
        if name == "-d":
            destdir = value
        elif name == "-v":
            level = logging.INFO
            noisy = 1

    if destdir:
        os.chdir(destdir)

    logging.basicConfig(level=level, format="%(message)s")

    for site in arguments:
        try:
            process_site(site, noisy)
        except (KeyboardInterrupt, SystemExit):
            break
        except:
            logging.warning("rss_fetch: internal error", exc_info=1)

if __name__ == "__main__":
    main()
