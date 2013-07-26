<?php

// Dati per la connessione al DBMS

$hostname = 'localhost';
$username = 'username';
$password = 'password';
$database = 'database';

mysql_connect ($hostname, $username, $password);
mysql_select_db ($database);

?>
