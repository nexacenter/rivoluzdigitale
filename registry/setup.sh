#!/bin/sh -e

#
# Copyright (c) 2014
#     Nexa Center for Internet & Society, Politecnico di Torino (DAUIN),
#     Alessio Melandri <alessiom92@gmail.com> and
#     Simone Basso <bassosimone@gmail.com>.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#

#
# Install the registry software
#

BINDIR=/usr/local/bin
SYSCONFDIR=/etc/rivoluz
DATADIR=/var/lib/rivoluz
SRCDIR=/usr/local/share/rivoluz

#
# Create user _rivoluz
#

sudo adduser --disabled-password --disabled-login --force-badname _rivoluz

#
# BINDIR
#

echo "setup: compile rivoluz.c..."
gcc -Wall -Wextra -pedantic -o rivoluz rivoluz.c

echo "setup: install 'rivoluz' into $BINDIR..."
install rivoluz $BINDIR

#
# SYSCONFDIR
#

echo "setup: create $SYSCONFDIR..."
install -d $SYSCONFDIR

(
    sudo -ku _rivoluz nodejs ./init_students.js > $SYSCONFDIR/iscritti.json
    chmod 640 $SYSCONFDIR/iscritti.json
    chown root:_rivoluz $SYSCONFDIR/iscritti.json

    openssl genrsa -out $SYSCONFDIR/privkey.pem 4096
    chmod 440 $SYSCONFDIR/privkey.pem
    chgrp _rivoluz $SYSCONFDIR/privkey.pem

    openssl req -new -x509 -key $SYSCONFDIR/privkey.pem \
      -out $SYSCONFDIR/cert.pem -days 365
    chmod 440 $SYSCONFDIR/cert.pem
    chgrp _rivoluz $SYSCONFDIR/cert.pem

    openssl x509 -in $SYSCONFDIR/cert.pem -sha1 -noout -fingerprint \
        > $SYSCONFDIR/finger.txt
    chmod 440 $SYSCONFDIR/finger.txt
    chgrp _rivoluz $SYSCONFDIR/finger.txt

    echo "{}" > $SYSCONFDIR/mailpasswd.json
    chmod 640 $SYSCONFDIR/mailpasswd.json
    chgrp _rivoluz $SYSCONFDIR/mailpasswd.json

    chmod 550 $SYSCONFDIR
    chgrp _rivoluz $SYSCONFDIR
)

#
# DATADIR
#

echo "setup: create $DATADIR..."
install -d $DATADIR

echo "setup: create git repository into $DATADIR..."
(
    cd $DATADIR
    git init
    echo "{}" > .htpasswd
    git add .htpasswd
    git config user.name "Root"
    git config user.email "root@localhost"
    git commit -am 'Initial commit'
)

echo "setup: give $DATADIR ownership to _rivoluz:_rivoluz..."
find $DATADIR -exec chown _rivoluz:_rivoluz {} \;

#
# SRCDIR
#

echo "setup: install into $SRCDIR..."

install -d $SRCDIR
install -d $SRCDIR/html

for SCRIPT in backend.js frontend.js git.js index.js login.js login_once.js \
  logout.js mailer.js private.js router.js server.js signup.js utils.js; do
    install -m444 $SCRIPT $SRCDIR
done
install -m555 run.sh $SRCDIR

for FILE in html/*.html; do
    install -m444 $FILE $SRCDIR/html
done

for DEPENDENCY in csvtojson http-digest-auth nodemailer; do
    npm install -g $DEPENDENCY
done
