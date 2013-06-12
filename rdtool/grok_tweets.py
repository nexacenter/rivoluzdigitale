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
import re
import sys
import textwrap

if __name__ == "__main__":
    sys.path.insert(0, ".")

from rdtool import subr_bitly
from rdtool import subr_http
from rdtool import subr_misc
from rdtool import subr_prompt

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
    text = text.replace(",", " ")
    text = text.replace(".", " ")
    text = text.replace(":", " ")
    text = text.replace("!", " ")
    text = text.replace("\"", " ")
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

def save_tweet(timest, student, real_link, bodyvec):
    """ Save a tweet """

    dirpath = os.sep.join(["blog", student, "%04d-%02d-%02d" % (
      timest[0], timest[1], timest[2])])
    subr_misc.mkdir_recursive_idempotent(dirpath)

    bitlink = subr_bitly.shorten(real_link[0])
    bitlink = bitlink.replace("http://bit.ly/", "")
    bitlink = bitlink.replace("https://bit.ly/", "")

    filepath = os.sep.join([dirpath, bitlink + ".html"])

    if os.path.exists(filepath):
        logging.warning("grok_tweets: filepath already exists")
        return

    filep = open(filepath, "w")
    for chunk in bodyvec:
        filep.write(chunk)
    filep.close()

def process_tweet(students, blogs, timest, account, text):
    """ Process a tweet """

    links = []
    handles = []
    tags = []
    if account in students:
        handles.append(account)
    analyze_tweet(students, text, links, handles, tags)

    index = subr_prompt.select_one("handle", handles)
    if index < 0:
        return
    handle = handles[index]
    handle = handle[1:]  # Skip either @ or #
    student = students.get(handle)
    if not student:
        logging.warning("grok_tweets: cannot find student from %s", handle)
        return

    index = subr_prompt.select_one("link", links)
    if index < 0:
        return
    link = links[index]

    bodyvec = []
    real_link = []
    result = subr_http.retrieve("http", "t.co", link, bodyvec, real_link)
    if result != 200:
        return

    base_url = blogs[handle]
    if not base_url:
        logging.warning("grok_tweets: cannot find url from %s", handle)
        return
    if base_url not in real_link[0]:
        logging.warning("grok_tweets: foreign link <%s>; skip", real_link[0])
        return

    if not subr_prompt.prompt_yes_no("Save content of <%s>?" % real_link[0]):
        return

    save_tweet(timest, student, real_link, bodyvec)

def filter_tweet(students, blogs, tweet):
    """ Filter a tweet """

    sys.stdout.write("\n\n\n")
    for line in textwrap.wrap(tweet):
        sys.stdout.write("    %s\n" % line)
    sys.stdout.write("\n")

    timest = tweet_ctime(tweet)
    account = tweet_account(tweet)
    text = tweet_text(tweet)

    if text.startswith("RT "):
        logging.warning("grok_tweets: skip RT")
        return
    if "@rivoluzdigitale" not in text.lower():
        logging.warning("grok_tweets: does not mention @RivoluzDigitale; skip")
        return
    if not "t.co/" in text.lower():
        logging.warning("grok_tweets: does not include links; skip")
        return

    if timest[0] != 2013 or timest[1] != 6:
        logging.warning("grok_tweets: skip old tweet")
        return

    if not subr_prompt.prompt_yes_no("Process this tweet?"):
        return

    process_tweet(students, blogs, timest, account, text)

def main():
    """ Main function """

    level = logging.WARNING
    try:
        options, arguments = getopt.getopt(sys.argv[1:], "v")
    except getopt.error:
        sys.exit("usage: grok_tweets [-v] file...")
    if not arguments:
        sys.exit("usage: grok_tweets [-v] file...")
    for name, _ in options:
        if name == "-v":
            level = logging.DEBUG

    logging.basicConfig(level=level, format="%(message)s")

    logging.info("grok_tweets: open config files...")
    filep = open("etc/twitter/students.json", "r")
    students = json.load(filep)
    filep.close()
    filep = open("etc/twitter/blogs.json", "r")
    blogs = json.load(filep)
    filep.close()
    logging.info("grok_tweets: open config files... done")

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
                filter_tweet(students, blogs, tweet)
                vector = []
                continue
            vector.append(line)

if __name__ == "__main__":
    main()
