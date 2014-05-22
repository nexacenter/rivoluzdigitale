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
# Init the CA to authenticate users
#

SYSCONFDIR=/etc/rivoluz

if [ $# -ge 2 ]; then
    echo "usage: $0 [user]" 1>&2
    exit 1
fi

(
    cd $SYSCONFDIR

    echo "* Create directories to manage the CA"
    install -d -m 700 demoCA
    install -d -m 700 demoCA/private
    install -d -m 700 demoCA/certs
    install -d -m 700 demoCA/newcerts
    install -d -m 700 demoCA/crl

    if [ ! -f demoCA/index.txt ]; then
        echo "* Create index.txt file in demoCA"
        install -m 600 /dev/null demoCA/index.txt
    fi

    if [ ! -f demoCA/serial ]; then
        echo "* Create serial file in demoCA"
        install -m 600 /dev/null demoCA/serial
        echo "01" > demoCA/serial
    fi

    if [ ! -f CA.key ]; then
        echo "* Create the private key of the CA"
        openssl genrsa -out CA.key 4096
        chmod 440 CA.key
    fi

    if [ ! -f CA.crt ]; then
        echo "* Create the certificate of the CA"
        openssl req -new -x509 -key CA.key -out CA.crt -days 120
        chmod 440 CA.crt
        chgrp _rivoluz CA.crt
    fi

    if [ $# -eq 0 ]; then
        exit 0
    fi

    USERNAME=$1

    echo "* Create the private key of $USERNAME"
    openssl genrsa -out u_$USERNAME.key 4096
    chmod 440 u_$USERNAME.key

    echo "* Create the CSR of $USERNAME"
    openssl req -new -key u_$USERNAME.key -out u_$USERNAME.csr
    chmod 440 u_$USERNAME.csr

    echo "* Create the certificate of $USERNAME"
    openssl ca -days 120 -in u_$USERNAME.csr -out u_$USERNAME.crt \
      -keyfile CA.key -cert CA.crt
    chmod 440 u_$USERNAME.crt

    echo "* Export the certificate of $USERNAME to PKCS#12"
    openssl pkcs12 -export -in u_$USERNAME.crt \
      -inkey u_$USERNAME.key -certfile CA.crt \
      -out u_$USERNAME.p12
    chmod 440 u_$USERNAME.p12
)
