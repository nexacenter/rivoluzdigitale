# rdtool/grok_tweets.py

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

""" Grok tweets looking for blog posts """

import email.utils
import getopt
import json
import logging
import os
import random
import re
import shutil
import sys
import textwrap
import time
import urlparse

if __name__ == "__main__":
    sys.path.insert(0, ".")

from rdtool import subr_bitly
from rdtool import subr_http
from rdtool import subr_misc
from rdtool import subr_prompt

SETTINGS = {
            "dry": False,
            "force": False,
            "prefix": ".",
            "rss_cache": "./RSS_CACHE",
           }

#
# [Wed May 15 14:18:49 +0000 2013]
# <https://twitter.com/arduinoallinclu/status/334674230635548672>
# @arduinoallinclu: @RivoluzDigitale Nuovo articolo di @SoFranchy:
# "#Stampa_3D e #makers: una terza rivoluzione industriale?" Leggi:
# http://t.co/Kj7EhkXNMn
#

def tweet_ctime(tweet):
    """ Get the time when the tweet was created """
    if not tweet.startswith("["):
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    index = tweet.find("]")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    when = tweet[1:index]
    return email.utils.parsedate(when)

def tweet_id(tweet):
    """ Get the identifier of the tweet """
    index = tweet.find("<")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    tweet = tweet[index + 1:]
    index = tweet.find(">")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    tweet = tweet[:index]
    if not tweet.startswith("https://twitter.com/"):
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    index = tweet.find("/status/")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    tweet = tweet[index + len("/status/"):]
    return int(tweet)

def tweet_account(tweet):
    """ Get the account that generated the tweet """
    index = tweet.find(">")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    tweet = tweet[index + 1:]
    index = tweet.find(":")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    return tweet[:index].strip().lower()

def tweet_text(tweet):
    """ Get the text of the tweet """
    index = tweet.find(">")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    tweet = tweet[index + 1:]
    index = tweet.find(":")
    if index == -1:
        logging.warning("grok_tweets: invalid tweet: %s", tweet)
        return
    return tweet[index + 1:].strip()

def analyze_tweet(students, text, links, handles, tags):
    """ Analyze tweet text and fill links, handles and tags """

    text = text.replace("http://t.co/", "__t_c_o__")
    text = text.replace("https://t.co/", "__t_c_o__")
    text = text.replace("(", " ")
    text = text.replace(")", " ")
    text = text.replace(";", " ")
    text = text.replace(",", " ")
    text = text.replace(".", " ")
    text = text.replace(":", " ")
    text = text.replace("!", " ")
    text = text.replace("\"", " ")
    text = text.replace("/", " ")
    text = text.replace("__t_c_o__", "http://t.co/")  # Force http
    text = text.split()

    for elem in text:
        if elem.startswith("http://t.co"):  # We forced http above
            elem = elem.replace("http://t.co", "")
            links.append(elem)
        elif elem.startswith("@"):
            elem = elem.lower()
            if elem[1:] in students:
                handles.append(elem)
        elif elem.startswith("#"):
            elem = elem.lower()
            tags.append(elem)

def rss_cache_find(bitlink):
    """ Search bitlink in RSS cache """
    # XXX could be written to be O(N) rather than to be O(N^2)
    for dirname in os.listdir(SETTINGS["rss_cache"]):
        fullpath = os.sep.join([SETTINGS["rss_cache"], dirname])
        if not os.path.isdir(fullpath):
            continue
        for inner_dirname in os.listdir(fullpath):
            inner_fullpath = os.sep.join([fullpath, inner_dirname])
            if not os.path.isdir(inner_fullpath):
                continue
            if inner_dirname == bitlink:
                return inner_fullpath

def rss_cache_filename(dirpath):
    """ Given the dirpath, returns the file name """
    for filename in os.listdir(dirpath):
        filepath = os.sep.join([dirpath, filename])
        if not os.path.isfile(filepath):
            continue
        return filename

def save_tweet(student, link):
    """ Save a tweet """

    # Pause a bit before the download so we sleep in any case
    time.sleep(random.random() + 0.5)

    bitlink = subr_bitly.shorten(link)
    if not bitlink:
        logging.warning("grok_tweets: bitlink API failed")
        return

    bitlink = bitlink.replace("http://bit.ly/", "")
    bitlink = bitlink.replace("https://bit.ly/", "")

    if not re.search("^[A-Za-z0-9]+$", bitlink):
        logging.warning("grok_tweets: invalid bitlink <%s>; skip", bitlink)
        return

    dirpath = os.sep.join([SETTINGS["prefix"], student, bitlink])
    if os.path.isdir(dirpath):
        logging.warning("grok_tweets: dup <%s>; skip", dirpath)
        return

    cached_dirpath = rss_cache_find(bitlink)
    if not cached_dirpath:
        logging.warning("grok_tweets: can't find %s in RSS cache", bitlink)
        return
    cached_filename = rss_cache_filename(cached_dirpath)
    if not cached_filename:
        logging.warning("grok_tweets: empty %s", cached_dirpath)
        return
    cached_filepath = os.sep.join([cached_dirpath, cached_filename])

    subr_misc.mkdir_recursive_idempotent(dirpath)

    # Note: we use the time from RSS, which is more accurate
    filepath = os.sep.join([dirpath, cached_filename])

    logging.info("grok_tweets: cp '%s' '%s'", cached_filepath, filepath)
    shutil.copy(cached_filepath, filepath)

def process_student_tweet(blogs, links, handle, student):
    """ Process a tweet from the point of view of one student """

    base_url = blogs[handle]
    if not base_url:
        logging.warning("grok_tweets: cannot find url from %s", handle)
        return

    # Pause a bit before the download so we sleep in any case
    time.sleep(random.random() + 0.5)

    # Expand links before possibly prompting the operator
    for link in links:
        expanded_link = []
        result = subr_http.retrieve("HEAD", "http", "t.co", link, [],
          expanded_link)
        if result != 200:
            logging.warning("grok_tweets: broken link")
            continue

        if base_url not in expanded_link[0]:
            logging.warning("grok_tweets: foreign link <%s>; skip",
                            expanded_link[0])
            continue

        parsed = urlparse.urlsplit(expanded_link[0])
        if not parsed[2] or parsed[2] == "/":
            logging.warning("grok_tweets: homepage link <%s>; skip",
                            expanded_link[0])
            continue

        # Otherwise there are cases of duplicate posts
        index = expanded_link[0].rfind("?")
        if index >= 0:
            expanded_link[0] = expanded_link[0][:index]
        if expanded_link[0].startswith("https://"):
            expanded_link[0] = expanded_link[0].replace("https://", "http://")

        logging.info("grok_tweets: process link %s", expanded_link[0])

        if SETTINGS["dry"]:
            continue

        save_tweet(student, expanded_link[0])

def process_tweet(students, blogs, account, text):
    """ Process a tweet """

    links = []
    handles = []
    tags = []
    if account[1:] in students:  # handles do not start with @
        handles.append(account)
    analyze_tweet(students, text, links, handles, tags)

    handles = list(set(handles))  # collapse duplicates, if needed
    index = subr_prompt.select_one("handle", handles)
    if index == -1:
        logging.warning("grok_tweets: ignoring the tweet")
        return
    handle = handles[index]
    handle = handle[1:]  # Skip either @ or #
    student = students.get(handle)
    if not student:
        logging.warning("grok_tweets: cannot find student from %s", handle)
        return
    logging.info("grok_tweets: process student %s (@%s)", student, handle)
    process_student_tweet(blogs, links, handle, student)

def really_filter_tweet(students, blogs, account, text):
    """ Really filter a tweet """

    if text.startswith("RT "):
        logging.warning("grok_tweets: skip RT")
        return
    if "@rivoluzdigitale" not in text.lower():
        logging.warning("grok_tweets: does not mention @RivoluzDigitale; skip")
        return
    if not "t.co/" in text.lower():
        logging.warning("grok_tweets: does not include links; skip")
        return

    process_tweet(students, blogs, account, text)
    time.sleep(3)

def filter_tweet(students, blogs, tweet):
    """ Filter a tweet """

    logging.info("\n\n")
    for line in textwrap.wrap(tweet):
        logging.info("    %s", line)
    logging.info("")

    #timest = tweet_ctime(tweet)  # commented out because it's unused
    twid = tweet_id(tweet)
    account = tweet_account(tweet)
    text = tweet_text(tweet)

    statedir = os.sep.join([os.environ.get("HOME", "/"), ".grok_tweets"])
    statefile = os.sep.join([statedir, account[1:]])

    prev = 0
    if not SETTINGS["force"] and os.path.isfile(statefile):
        filep = open(statefile, "r")
        data = filep.read()
        filep.close()
        try:
            prev = int(data.strip())
        except ValueError:
            pass

    if twid > prev:
        really_filter_tweet(students, blogs, account, text)

        if not SETTINGS["force"] and os.path.isdir(statedir):
            filep = open(statefile, "w")
            filep.write(str(twid))
            filep.write("\n")
            filep.close()

    else:
        logging.warning("grok_tweets: old tweet <%d>; skip", twid)

def filter_tweet_safe(students, blogs, tweet):
    """ Filter a tweet """
    try:
        filter_tweet(students, blogs, tweet)
    except KeyboardInterrupt:
        sys.exit(1)
    except:
        logging.warning("unhandled exception", exc_info=1)

USAGE = """\
usage: grok_tweets [-fnv] [-R rss_cache] [-d destdir] [-u handle] file..."""

def main():
    """ Main function """

    handle = None
    level = logging.WARNING
    try:
        options, arguments = getopt.getopt(sys.argv[1:], "d:fnR:u:v")
    except getopt.error:
        sys.exit(USAGE)
    if not arguments:
        sys.exit(USAGE)
    for name, value in options:
        if name == "-d":
            SETTINGS["prefix"] = value
        elif name == "-f":
            SETTINGS["force"] = True
        elif name == "-n":
            SETTINGS["dry"] = True
        elif name == "-R":
            SETTINGS["rss_cache"] = value
        elif name == "-u":
            handle = value
        elif name == "-v":
            if level == logging.WARNING:
                level = logging.INFO
            else:
                level = logging.DEBUG

    logging.basicConfig(level=level, format="%(message)s", stream=sys.stdout)

    logging.debug("grok_tweets: open config files...")
    filep = open("etc/twitter/students.json", "r")
    students = json.load(filep)
    filep.close()
    filep = open("etc/twitter/blogs.json", "r")
    blogs = json.load(filep)
    filep.close()
    logging.debug("grok_tweets: open config files... done")

    if handle:
        if handle.startswith("@"):
            logging.warning("grok_tweets: handle starts with @; fixing")
            handle = handle[1:]
        for student in list(students.keys()):
            if student != handle:
                del students[student]

    for argument in arguments:
        filep = open(argument, "r")
        vector = []
        for line in filep:
            line = line.strip()
            if not line:
                if not vector:
                    continue
                tweet = " ".join(vector)
                tweet = re.sub(r"[\0-\31]", " ", tweet)
                tweet = re.sub(r"[\x7f-\xff]", " ", tweet)
                filter_tweet_safe(students, blogs, tweet)
                vector = []
                continue
            vector.append(line)

if __name__ == "__main__":
    main()
