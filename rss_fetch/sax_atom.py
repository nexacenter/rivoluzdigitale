# rss_fetch/sax_atom.py

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

""" SAX Atom content handler """

from xml import sax

import getopt
import json
import sys
import time

class AtomHandler(sax.ContentHandler):
    """ Atom RSS content handler """

    #
    # We want to gather (and strip) the content of the <title>, <published>,
    # and <link> tags of each <entry>.
    #
    # pylint: disable=C0103
    #

    def __init__(self):
        sax.ContentHandler.__init__(self)
        self.entry = 0
        self.content = []
        self.current = None
        self.links = []
        self.pub_dates = []
        self.titles = []

    def startElement(self, name, attrs):
        self.current = name
        if name == "entry":
            self.entry = 1
        elif name == "link":
            if self.entry:
                attrs = dict(attrs)
                if (
                    attrs.get("rel") == "alternate" and
                    attrs.get("type") == "text/html"
                   ):
                    self.links.append(attrs["href"])

    def characters(self, content):
        if self.entry:
            self.content.append(content)

    def endElement(self, name):
        self.current = None
        if self.entry:
            content = "".join(self.content)
            content = content.strip()
            if name == "published":
                # Example: 2013-05-12T12:57:40.531+02:00
                # XXX Ignoring the timezone
                index = content.find(".")
                if index <= 0:
                    raise RuntimeError("atom_handler: unexpected time format")
                content = content[:index]
                timestruct = time.strptime(content, "%Y-%m-%dT%H:%M:%S")
                timestruct = tuple(timestruct)
                self.pub_dates.append(timestruct)
            elif name == "title":
                self.titles.append(content)
        self.content = []
        if name == "entry":
            self.entry = 0

def each_post(data):
    """ Parse content and yield a dictionary for each entry """
    data = data.strip()
    handler = AtomHandler()
    sax.parseString(data, handler)
    for index in range(len(handler.titles)):
        yield({
               'year': handler.pub_dates[index][0],
               'month': handler.pub_dates[index][1],
               'day': handler.pub_dates[index][2],
               'hour': handler.pub_dates[index][3],
               'minute': handler.pub_dates[index][4],
               'second': handler.pub_dates[index][5],
               'title': handler.titles[index],
               'link': handler.links[index],
              })

def main():
    """ Main function """
    try:
        options, arguments = getopt.getopt(sys.argv[1:], "")
    except getopt.error:
        sys.exit("usage: sax_atom.py")
    if options or arguments:
        sys.exit("usage: sax_atom.py")

    data = sys.stdin.read()
    for post in each_post(data):
        json.dump(post, sys.stdout, indent=4)
        sys.stdout.write("\n\n")

if __name__ == "__main__":
    main()
