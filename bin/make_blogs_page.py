#!/usr/bin/env python

""" Script to generate content of rivoluzionedigitale.polito.it/blog-studenti
    using the following, simple procedure:

        - Download `RivoluzGruppi20xy (Responses)` as CSV

        - Run `./bin/make_blogs_page.py < csv_file > antani.txt`

        - Open `antani.txt` and copy its content

        - Edit rivoluzionedigitale.polito.it/blog-studenti and replace
          its content with the content copied in the prev step """

import cgi, csv, sys, urllib, urlparse

def write_blog_number(number):
    """ Write the number of the blog """
    sys.stdout.write("<td>%d</td>\n" % int(number))

def write_link(href, text):
    """ Write a link to stdout """
    if href and href != "#":
        parsed = urlparse.urlparse(href)
        assert(parsed.scheme in ("http", "https"))
        netloc = urllib.quote_plus(parsed.netloc, ":")
        path = urllib.quote_plus(parsed.path, "/")
        href = parsed.scheme + "://" + netloc + path
    if text:
        text = cgi.escape(text)
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
    for index, row in enumerate(csv.reader(sys.stdin)):
        if index == 0:
            continue
        sys.stdout.write("<tr>\n")
        write_blog_number(index)
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
