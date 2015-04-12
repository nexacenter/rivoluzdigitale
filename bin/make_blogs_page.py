#!/usr/bin/env python

import csv, sys, urlparse

def write_link(href, text):
    """ Write a link to stdout """
    sys.stdout.write("<td><a href='%s'>%s</a></td>\n" % (href, text))

def write_blog_name(href):
    """ Write blog name as a link """
    parsed = urlparse.urlsplit(href)
    write_link(href, parsed.netloc)

def write_student(idnum, twitter):
    """ Write student as a link """
    if twitter:
        href = "https://twitter.com/" + twitter[1:]
        write_link(href, twitter)
    elif idnum:
        write_link("#", "s" + idnum)
    else:
        write_link("#", idnum)

def write_blog_twitter(twitter):
    """ Write blog as a link """
    write_student("", twitter)

def main():
    """ Main function """
    sys.stdout.write("<table>\n")
    for index, row in enumerate(csv.reader(open("RivoluzGruppi.csv"))):
        if index == 0:
            continue
        sys.stdout.write("<tr>\n")
        write_blog_name(row[2])
        write_student(row[3], row[4])
        write_student(row[5], row[6])
        write_student(row[7], row[8])
        write_student(row[9], row[10])
        write_blog_twitter(row[11])
        sys.stdout.write("</tr>\n\n")
    sys.stdout.write("</table>\n")

if __name__ == "__main__":
    main()
