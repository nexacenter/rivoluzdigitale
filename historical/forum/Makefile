#
#
#   Copyright (C) 2013 Simone Basso <bassosimone@gmail.com>
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
#

.PHONY: all install_nginx_debian

INSTALL = install -o root -g root
INSTALL_PHP = install -o root -g www-data -m 440
CSSDIR = /usr/share/nginx/www/css
PHPDIR = /usr/share/nginx/www/RiDi

all:
	@echo "Available targets:"
	@echo "  install_nginx_debian - install on nginx and debian"

install_nginx_debian:
	$(INSTALL) -m 555 -d $(PHPDIR)
	$(INSTALL_PHP) index.php $(PHPDIR)
	test -f $(PHPDIR)/mysql.php || $(INSTALL_PHP) mysql.php $(PHPDIR)
	$(INSTALL) -m 555 -d $(CSSDIR)
	$(INSTALL) -m 444 RiDi.css $(CSSDIR)
