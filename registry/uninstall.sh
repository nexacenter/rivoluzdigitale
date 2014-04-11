#!/bin/sh -e
rm -rf /etc/rivoluz/ /var/lib/rivoluz/ /usr/local/bin/rivoluz \
    /usr/local/share/rivoluz

sudo userdel _rivoluz
