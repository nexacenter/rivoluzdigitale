# rdtool/subr_prompt.py

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

""" Subroutines for prompting the user """

import logging
import sys

def prompt_range(prompt, minimum, maximum):
    """ Prompt the user to choose a number in a given range """

    while True:
        sys.stdout.write(prompt)
        sys.stdout.write(" (%d-%d)? [skip] " % (minimum, maximum))
        sys.stdout.flush()

        line = sys.stdin.readline()
        if not line:
            logging.warning("subr_prompt: EOF\n")
            continue

        line = line.strip()
        if not line:
            return -1

        try:
            number = int(line)
        except ValueError:
            logging.warning("subr_prompt: invalid input: %s\n", line)
            continue

        if number >= minimum and number <= maximum:
            return number

        logging.warning("subr_prompt: not in range: %d\n", number)

def prompt_yes_no(prompt):
    """ Prompt the user to answer yes or no """

    while True:
        sys.stdout.write(prompt)
        sys.stdout.write(" (y/n)? [y] ")
        sys.stdout.flush()

        line = sys.stdin.readline()
        if not line:
            logging.warning("subr_prompt: EOF\n")
            continue

        line = line.strip().lower()
        line = line.lower()
        if not line:
            return True

        if line == "y":
            return True
        if line == "n":
            return False

        logging.warning("subr_prompt: invalid input: %s\n", line)

def select_one(thing, vector):
    """ Ask help to select one element in vector """

    if len(vector) > 1:
        sys.stdout.write("\nWhich %s do you want to use?\n" % thing)
        for index, elem in enumerate(vector):
            sys.stdout.write("    %d. %s\n" % (index, elem))
        sys.stdout.write("\n")
        return prompt_range("Your choice", 0, len(vector) - 1)

    if len(vector) == 1:
        return 0

    logging.warning("subr_prompt: passed an empty vector")
    return -1
