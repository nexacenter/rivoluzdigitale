# rdtool/valutaz.py

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

""" Computes the final mark of each student """

import csv
import logging
import sys

def process_csv(students, pathname, fail_if_missing):
    """ Helper function to process a single CSV file """
    filep = open(pathname, "r")
    reader = csv.reader(filep)
    for index, record in enumerate(reader):
        if len(record) < 2:
            logging.warning("%s:%d: invalid number of columns", pathname, index)
            return
        if index == 0:
            if record[0] != "Studente" and record[1] != "Totale":
                logging.warning("%s:%d: invalid columns", pathname, index)
                return
            continue
        name, mark = record[0:2]
        if name not in students:
            if fail_if_missing:
                logging.warning("%s:%d: missing \"%s\"", pathname, index, name)
                continue
            students.setdefault(name, 0.0)
        students[name] += float(mark)
    filep.close()

def main():
    """ Main function """

    #
    # TODO The algorithm is not completely correct: in fact, the mark of
    # part A + part B must be greater than 6.
    #

    students = {}
    process_csv(students, "RivoluzValutaz - 2012-online.csv", False)
    process_csv(students, "RivoluzValutaz - 2013-online.csv", False)
    process_csv(students, "RivoluzValutaz - 2013-06-28_A.csv", True)
    process_csv(students, "RivoluzValutaz - 2013-06-28_B1.csv", True)
    process_csv(students, "RivoluzValutaz - 2013-06-28_B2.csv", True)
    process_csv(students, "RivoluzValutaz - 2013-06-28_B3.csv", True)

    for name in sorted(students):
        mark = students[name]
        mark = round(mark)
        if mark < 18:
            sys.stdout.write("%s: insuff.\n" % name)
            continue
        sys.stdout.write("%s: %d\n" % (name, mark))

if __name__ == "__main__":
    main()
