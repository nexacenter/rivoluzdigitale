# rdtool/main_rss.py

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

""" Main of the `rss` command """

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

def _getfeed(site):
    """ Get the RSS feed of site """
    #
    # Note: here we must not change the encoding of body, because the
    # SAX library already performs this operation.
    #
    bodyvec = []
    status = subr_rss.fetch(site, bodyvec, [])
    if status != 0:
        return
    body = "".join(bodyvec)
    return body

def _select_generator(body):
    """ Select the right generator """
    if "<rss" not in body:
        return sax_atom.each_post
    return sax_rss.each_post

def _get_final_url(link):
    """ Returns the final URL that contains the content """
    parsed = urlparse.urlsplit(link)
    real_link = []
    status = subr_http.retrieve("HEAD", "http", parsed[1], parsed[2],
                                [], real_link, {})
    if status != 200:
        logging.warning("main_rss: invalid link: %s", link)
        return
    if len(real_link) != 1:
        logging.warning("main_rss: internal error")
        return
    return real_link[0]

def _canonicalize(link):
    """ Put the final URL in canonical form """
    index = link.rfind("?")
    if index >= 0:
        link = link[:index]
    if link.startswith("https://"):
        link = link.replace("https://", "http://")
    return link

def _to_bitpath(link):
    """ Convert URL to bitpath """
    bitlink = subr_bitly.shorten(link)
    if not bitlink:
        logging.warning("main_rss: bitly API failed")
        return
    bitlink = bitlink.replace("http://bit.ly/", "")
    bitlink = bitlink.replace("https://bit.ly/", "")
    if not re.search("^[A-Za-z0-9]+$", bitlink):
        logging.warning("main_rss: invalid bitlink <%s>; skip", bitlink)
        return
    return bitlink

def _savepost(link, pathname):
    """ Save post content into pathname """
    parsed = urlparse.urlsplit(link)
    bodyvec = []
    status = subr_http.retrieve("GET", "http", parsed[1], parsed[2],
                                bodyvec, [], {})
    if status != 200:
        logging.warning("main_rss: cannot retrieve page: %s", link)
        return
    filep = open(pathname, "w")
    for chunk in bodyvec:
        filep.write(chunk)
    filep.close()

def process_site(site):
    """ Process the feeds of a site """

    logging.info("")
    logging.info("* site: %s", site)
    logging.info("")

    body = _getfeed(site)
    if not body:
        logging.warning("main_rss: empty feed")
        return
    each_post = _select_generator(body)

    for post in each_post(body):

        # Pause a bit before we process each post
        time.sleep(random.random() + 0.5)

        link = _get_final_url(post["link"])
        if not link:
            continue
        link = _canonicalize(link)
        path = _to_bitpath(link)
        if not path:
            continue
        path = subr_misc.make_post_folder(site, path)

        logging.info("")
        logging.info("- <%s> => .../%s", link, path)
        logging.info("")

        if os.path.isdir(path):
            logging.warning("main_rss: dup <.../%s>; skip", path)
            continue

        success = subr_misc.mkdir_recursive_idempotent(path)
        if not success:
            continue
        path += os.sep
        path += "%02d-%02d-%02d.html" % (post["year"], post["month"],
                                         post["day"])
        _savepost(link, path)

def main():
    """ Main function """
    try:
        options, arguments = getopt.getopt(sys.argv[1:], "d:v")
    except getopt.error:
        sys.exit("usage: rss [-v] [-d dir] [site...]")

    destdir = None
    level = logging.WARNING
    for name, value in options:
        if name == "-d":
            destdir = value
        elif name == "-v":
            if level == logging.WARNING:
                level = logging.INFO
            else:
                level = logging.DEBUG

    logging.basicConfig(level=level, format="%(message)s")

    if not arguments:
        filep = open("etc/rss/blogs.json", "r")
        arguments = json.load(filep)
        filep.close()

    if destdir:
        os.chdir(destdir)

    for site in arguments:
        try:
            process_site(site)
        except (KeyboardInterrupt, SystemExit):
            break
        except:
            logging.warning("main_rss: internal error", exc_info=1)

if __name__ == "__main__":
    main()
