#!/usr/bin/env python
# Public domain, 2014-2016 Simone Basso

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
    sys.stdout.write("<td>%d)</td>\n" % int(number))

def write_link(href, text):
    """ Write a link to stdout """
    if href and href != "#":
        parsed = urlparse.urlparse(href)
        assert parsed.scheme in ("http", "https")
        netloc = urllib.quote_plus(parsed.netloc, ":")
        path = urllib.quote_plus(parsed.path, "/")
        href = parsed.scheme + "://" + netloc + path
    if text:
        text = cgi.escape(text)
    sys.stdout.write("<td><a href='%s'>%s</a></td>\n" % (href, text))

def write_blog_name(href):
    """ Write blog name as a link """
    parsed = urlparse.urlsplit(href)
    name = parsed.netloc.split(".")[0]
    write_link(href, name)

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
    sys.stdout.write("<table style='font-size: 75%;'>\n")
    sys.stdout.write("<tbody>\n")
    for index, row in enumerate(csv.reader(sys.stdin)):
        if index == 0:
            continue
        sys.stdout.write("<tr>\n")
        write_blog_number(index)
        write_blog_name(row[3])
        write_student(row[4], row[5])
        write_student(row[6], row[7])
        write_student(row[8], row[9])
        write_student(row[10], row[11])
        write_blog_twitter(row[12])
        sys.stdout.write("</tr>\n\n")
    sys.stdout.write("</tbody>\n")
    sys.stdout.write("</table>\n")

if __name__ == "__main__":
    main()
