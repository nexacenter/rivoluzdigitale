<html>
<head>
  <link rel="stylesheet" type="text/css" href="/css/RiDi.css">
<title>
Rivoluzione Digitale ~ Elenco argomenti
</title>
</head>
<body>
<center>

<?php
/*
 *
 *   http://darkjoker.voidsec.com
 *
 *   RiDi ~ Piattaforma per Rivoluzione Digitale
 *   Copyright (C) 2013 Flavio 'darkjoker' Giobergia
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

error_reporting (E_ALL ^ E_NOTICE);

include "mysql.php";

function message ($message, $k, $die) {
	$kind = ($k) ? 'error' : 'info';
	echo "<div class = '{$kind}'><div class = 'msg'>{$message}</div></div>";
	if ($die) {
		die ("</center></body></html>");
	}
}

/* Il cookie viene salvato come
 * id_md5(username:password)
 */
$data = $_COOKIE['data'];
if (empty ($data)) {
	$username = mysql_real_escape_string ($_POST['username']);
	$password = md5 ($_POST['password']);
	if (!empty ($username) && !empty ($password)) {
		$query = "SELECT id FROM users WHERE (username = '{$username}' AND password = '{$password}')";
		$row = mysql_fetch_row (mysql_query ($query));
		if (!empty ($row[0])) {
			$data = "{$row[0]}_".md5("{$username}:{$password}");
			setcookie ("data",$data);
		}
		else {
			message ("Login fallito. <a href = 'index.php'>Riprova</a>",1,1);
		}
	}
	else {
		if (isset ($_GET['register'])) {
			$user = mysql_real_escape_string ($_POST['uname']);
			$pass = md5 ($_POST['pword']);
			$mail = $_POST['email'];
			if (!empty ($user) && !empty ($pass) && preg_match ("|^[a-z0-9\._]{1,}@[a-z0-9\.]{1,}\.[a-z]{2,4}$|",$mail)) {
				// Si controlla che non ci sia un utente con la stessa password
				$query = "SELECT id FROM users WHERE username = '{$user}' OR email = '{$mail}'";
				$row = mysql_fetch_row (mysql_query ($query));
				if (!empty ($row[0])) {
					// Username/mail gia' in uso
					message ("Username/email gia' in uso. <a href = 'index.php'>Riprova</a>",1,1);
				}
				$query = "INSERT INTO users (username, password, email) VALUES ('{$user}','{$pass}','{$mail}')";
				mysql_query ($query);
				message ("Registrazione effettuata. Procedi al <a href = 'index.php'>login</a> :)",0,1);
			}
?>
<form method = 'POST'>
<b>Registrati</b>
<table>
<tr><td>Username:</td><td><input name = 'uname'></td></tr>
<tr><td>Password:</td><td><input name = 'pword' type = 'password'></td></tr>
<tr><td>Email:</td><td><input name = 'email'></td></tr>
<tr><td><input type = 'submit' value = 'Registrati'></td></tr>
</table>
<a href = 'index.php'>Login</a>
</form>
<?php
		}
		else {
?>
<form method = 'POST'>
<table>
<tr><td>Username:</td><td><input name = 'username'></td></tr>
<tr><td>Password:</td><td><input name = 'password' type = 'password'></td></tr>
<tr><td><input type = 'submit' value = 'Login'></td></tr>
</table>
<a href = 'index.php?register'>Registrati</a>
</form>
<?php
		}
	}
	/* Parte di login - registrazione */
}
// Non uso l'else perche', in questo modo, una volta effettuato
// il login non si dovra' ricaricare la pagina
if (!empty ($data)) {
	if (!preg_match ("|^([0-9]{1,})_([a-f0-9]{32})$|",$data,$info)) {
		message ("Si &egrave; verificato un errore con i cookie!",1,1); 
	}
	array_shift($info);
	list ($id,$hash) = $info; // Controlli su $id per SQLi non necessari, visto che arrivano da un preg_match()
	$query = "SELECT username,password FROM users WHERE id = '{$id}'";
	$row = mysql_fetch_row (mysql_query ($query));
	if (empty ($row[0]) || md5("{$row[0]}:{$row[1]}")!=$hash) {
		message ("Dai, almeno ci hai provato :)",1,1);
	}
?>
<a href = 'index.php'>Pagina principale</a><pre>

</pre>
<?php
	// A seconda di cosa si e' scelto di fare, viene visualizzata la relativa pagina
	if (isset($_GET['new'])) {
		$title = trim(mysql_real_escape_string (utf8_encode($_POST['title'])));
		$descr = trim(mysql_real_escape_string (utf8_encode($_POST['descr'])));
		if (!empty ($title) && !empty($descr)) {
			$query = "INSERT INTO topics (title,description,author) VALUES ('{$title}','{$descr}',{$id})";
			mysql_query ($query);
			message ("Argomento pubblicato.",0,1);
		}
		else {
?>
<form method = 'POST'>
<b>Pubblica un nuovo argomento</b><br>
Titolo: <input name = 'title'><br>
<textarea name = 'descr' style = 'width: 500px; height: 300px;'>Descrizione</textarea><br>
<input type = 'submit' value = 'Invia'>
</form>
<?php
		}
	}
	// Per iscriversi ad un argomento
	else if (isset($_GET['join'])) {
		$tid = intval($_GET['tid']);
		$query = "SELECT title FROM topics WHERE id = '{$tid}'";
		$row = mysql_fetch_row (mysql_query ($query));
		if ($row[0]) {
			// Esiste
			// Si controlla che non sia gia' registrato
			$query = "SELECT author FROM topics WHERE id = {$tid}";
			$row = mysql_fetch_row(mysql_query($query));
			if ($row[0]==$id) {
				message ("Stai provando ad iscriverti ad un argomento che hai creato!",1,1);
			}
			$query = "SELECT id FROM selected WHERE uid = {$id} AND tid = {$tid}";
			$row = mysql_fetch_row (mysql_query ($query));
			if (!empty($row[0])) {
				message ("Hai gia' dato la tua disponibilita' per questo corso.",1,1);
			}
			$query = "SELECT COUNT(*) FROM selected WHERE tid = {$tid}";
			$row = mysql_fetch_row (mysql_query($query));
			// Si confronta con 3, perche' il quarto e' l'utente
			// che ha creato il gruppo
			if ($row[0]==3) {
				message ("L'argomento ha gi&agrave; raggiunto 4 partecipanti.",1,1);
			}
			$query = "INSERT INTO selected (uid,tid) VALUES ({$id},{$tid})";
			mysql_query ($query);
			message ("Registrato con successo all'argomento.",0,1);
		}
		else {
			message ("Stai provando ad iscriverti ad un argomento inesistente.",1,1);
		}
	}

	// Mostra un corso proposto
	else if (isset($_GET['show'])) {
		$tid = intval ($_GET['tid']);
		$query = "SELECT * FROM topics WHERE id = {$tid}";
		$row = mysql_fetch_row (mysql_query ($query));
		if (empty ($row[0])) {
			message ("Argomento inesistente.",1,1);
		}
?>
<b>Titolo:</b> <?php echo htmlentities (utf8_decode($row[1])); ?><br>
<b>Descrizione:</b>
<div class = 'descr'>
<pre>
<?php echo htmlentities (wordwrap (utf8_decode($row[2]))); ?>
</pre>
</div>
<?php
		$query = "SELECT uid FROM selected WHERE tid = {$tid} UNION SELECT author FROM topics WHERE id = {$tid}";
		$res = mysql_query ($query);
		$users = array ();
		while ($row=mysql_fetch_row($res)) {
			array_push ($users,$row[0]);
		}
		if (in_array ($id,$users)) {
			// L'utente fa parte di chi ha dato
			// disponibilita' per il corso, quindi
			// gli vengono visualizzati gli altri utenti
			echo "<pre>\n\n</pre><b>Utenti iscritti:</b><br>";
			for ($i=0;$i<count($users);$i++) {
				$query = "SELECT username,email FROM users WHERE id = {$users[$i]}";
				$row = mysql_fetch_row (mysql_query($query));
				echo "<a href = 'mailto:".htmlentities(utf8_decode($row[1]))."'>".htmlentities(utf8_decode($row[0]))."</a>";
				if ($users[$i]==$id) {
					echo " <b>[you]</b>";
				}
				echo "<br>";
			}
			echo "<pre>\n\n</pre><a href = 'index.php?leave&tid={$tid}'>Lascia questo argomento</a>";
		}
		else {
			echo "<pre>\n\n</pre><a href = 'index.php?join&tid={$tid}'>Dai la tua disponibilit&agrave;</a>";
		}		
	}
	else if (isset($_GET['leave'])) {
		$tid = intval ($_GET['tid']);
		$query = "DELETE FROM selected WHERE uid = {$id} AND tid = {$tid}";
		mysql_query ($query);
		// Se l'utente che ha creato il gruppo cerca di togliersi
		// se c'e' qualcun'altro che ha dato la disponibilita' viene
		// messo come creatore, altrimenti il gruppo viene cancellato
		$query = "SELECT author FROM topics WHERE id = {$tid}";
		$row = mysql_fetch_row (mysql_query ($query));
		if ($row[0]==$id) {
			$query = "SELECT uid FROM selected WHERE tid = {$tid}";
			$row = mysql_fetch_row (mysql_query ($query));
			if (!empty ($row[0])) {
				$query = "UPDATE topics SET author = {$row[0]} WHERE id = {$tid}";
				mysql_query ($query);
				$query = "DELETE FROM selected WHERE uid = {$row[0]} AND tid = {$tid}";
				mysql_query ($query);
			}
			else {
				$query = "DELETE FROM topics WHERE id = {$tid}";
				mysql_query ($query);
			}
		}
		message ("Hai lasciato l'argomento.",0,1);
	}
	else if (isset($_GET['logout'])) {
		setcookie ("data","");
		header ("Location: index.php");
		message ("Logout effettuato con successo!",0,1);
	}
	// Mostra l'elenco dei corsi
	else {
		echo "<a href = 'index.php?logout'>Logout</a><br>";
		echo "<a href = 'index.php?new'>Proponi un argomento!" .
                    "</a><pre>\n\n</pre>";
		echo "<b>Elenco argomenti:</b><br>\n";
		$query = "SELECT id, title FROM topics";
		$res = mysql_query($query);
		while (($row = mysql_fetch_row($res))) {
			$tid = intval($row[0]);
			$title = htmlentities(utf8_decode($row[1]));
			$query = "SELECT COUNT(*) FROM selected " .
			    "WHERE tid = {$tid}";
			$count = intval(mysql_fetch_row(mysql_query($query)));
			echo "<a href = 'index.php?show&tid={$row[0]}'>" .
			    $title . "</a> [{$count} iscritti]<br>";
		}
	}
	
}
?>
</center>
</body>
</html>
