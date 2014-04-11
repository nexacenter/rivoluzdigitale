/*
 * Copyright (c) 2014
 *     Nexa Center for Internet & Society, Politecnico di Torino (DAUIN),
 *     Alessio Melandri <alessiom92@gmail.com> and
 *     Simone Basso <bassosimone@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Rivoluz main
 */

#define _BSD_SOURCE 65537
#define _GNU_SOURCE 17

#include <sys/types.h>

#include <err.h>
#include <fcntl.h>
#include <grp.h>
#include <pwd.h>
#include <stdlib.h>
#include <unistd.h>

#define DEPLOYDIR "/usr/local/share/rivoluz/"
#define LOGFILE "/var/lib/rivoluz/log.txt"
#define UNPRIV_USER "_rivoluz"

int
main(void)
{
	struct passwd *credentials;
	pid_t pid;
	int result;

	char *const argv[] = {
		"./run.sh",
		NULL
	};
	char *const envp[] = {
		"USER=" UNPRIV_USER,
		"LOGNAME=" UNPRIV_USER,
		"HOME=/",
		"PATH=/usr/bin:/bin",
	};

	/*
	 * Drop privileges
	 */

	credentials = getpwnam(UNPRIV_USER);
	if (credentials == NULL)
		err(1, "getpwnam");

	result = setresgid(credentials->pw_gid, credentials->pw_gid,
	    credentials->pw_gid);
	if (result != 0)
		err(1, "setresgid");

	result = setgroups(0, NULL);
	if (result != 0)
		err(1, "setgroups");

	result = setresuid(credentials->pw_uid, credentials->pw_uid,
	    credentials->pw_uid);
	if (result != 0)
		err(1, "setresuid");

	/*
	 * Change directory
	 */

	result = chdir(DEPLOYDIR);
	if (result != 0)
		err(1, "chdir");

	/*
	 * Become a daemon
	 */

	pid = fork();
	if (pid == -1)
		err(1, "fork");
	if (pid != 0)
		exit(0);

	pid = setsid();
	if (pid == -1)
		err(1, "setsid");

	pid = fork();
	if (pid == -1)
		err(1, "fork");
	if (pid != 0)
		exit(0);

	/*
	 * Redirect stdio
	 */

	(void)close(0);
	result = open("/dev/null", O_RDONLY);
	if (result == -1)
		err(1, "open");

	(void)close(1);
	result = open(LOGFILE, O_WRONLY|O_APPEND|O_CREAT,
	    S_IRUSR|S_IWUSR|S_IRGRP);
	if (result == -1)
		err(1, "open");

	(void)close(2);
	result = dup(1);
	if (result == -1)
		exit(1);

	/*
	 * Execve
	 */

	result = execve(argv[0], argv, envp);
	if (result != 0)
		err(1, "execve");

	/* NOTREACHED */
	exit(1);
}
