# rss_fetch/sax_rss.py

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

""" SAX RSS content handler """

from xml import sax

import email.utils
import sys

class RssHandler(sax.ContentHandler):
    """ SAX RSS content handler """

    #
    # We want to gather (and strip) the content of the <title>, <pubDate>,
    # and <link> tags of each <item>.
    #
    # pylint: disable=C0103
    #

    def __init__(self):
        sax.ContentHandler.__init__(self)
        self.item = 0
        self.content = []
        self.current = None
        self.links = []
        self.pub_dates = []
        self.titles = []

    def startElement(self, name, attrs):
        self.current = name
        if name == "item":
            self.item = 1

    def characters(self, content):
        if self.item:
            self.content.append(content)

    def endElement(self, name):
        self.current = None
        if self.item:
            content = "".join(self.content)
            content = content.strip()
            if name == "pubDate":
                timestruct = email.utils.parsedate(content)
                self.pub_dates.append(timestruct)
            elif name == "title":
                self.titles.append(content)
            elif name == "link":
                self.links.append(content)
        self.content = []
        if name == "item":
            self.item = 0

if __name__ == "__main__":

    EXAMPLE = """
        <?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0">
        <channel>
         <title>My blog RSS feed</title>
         <description>This is the RSS feed of my blog</description>
         <link>http://www.example.org/my-blog</link>
         <lastBuildDate>Mon, 27 May 2013 18:43:39 +0000</lastBuildDate>
         <pubDate>Mon, 27 May 2013 13:34:41 +0000</pubDate>
         <ttl>1800</ttl>
         <item>
          <title>Node 1</title>
          <description>Description of the first entry.</description>
          <link>http://www.example.org/node/1</link>
          <pubDate>Mon, 27 May 2013 18:43:37 +0000</pubDate>
         </item>
         <item>
          <title>Node 2</title>
          <description>Description of the first entry.</description>
          <link>http://www.example.org/node/2</link>
          <pubDate>Mon, 27 May 2013 18:43:38 +0000</pubDate>
         </item>
        </channel>
        </rss>"""

    HANDLER = RssHandler()
    sax.parseString(EXAMPLE.strip(), HANDLER)
    for INDEX in range(len(HANDLER.titles)):
        sys.stdout.write("[%s] \"%s\" <%s>\n" % (HANDLER.pub_dates[INDEX],
          HANDLER.titles[INDEX], HANDLER.links[INDEX]))
