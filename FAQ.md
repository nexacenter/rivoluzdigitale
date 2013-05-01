Frequently Asked Questions
==========================

1.1. Sono iscritto alla lista, ricevo le email ma non riesco a mandarle
-----------------------------------------------------------------------

Se non sei iscritto alla lista con l'email del Politecnico (i.e. una email
`@studenti.polito.it`) non ricadi nella casistica descritta in
questa FAQ.

Se, invece, sei iscritto alla lista con l'email del Politecnico, ricevi le
email degli altri iscritti, ma non riesci a mandarle, e' molto probabile
che tu sia iscritto alla lista con il tuo *indirizzo vero* ma stia scrivendo
con l' *alias*, o viceversa.

Mi spiego meglio: per il Politecnico, l' *indirizzo vero* e'
questo qua:

    s000000@studenti.polito.it

Inolte, il Politecnico ti permette di associare un *alias* al tuo indirizzo.
Molto spesso l'alias e' fatto cosi':

    nome.cognome@studenti.polito.it

Di fatto, l'alias e' un altro indirizzo email, ma funziona in un modo
particolare.

(Da ora in poi per brevita' scrivo `s000000@` e `nome.cognome@`,
omettendo `studenti.polito.it`.)

Assegnare un alias, infatti, vuol dire che il server `studenti.polito.it` sa
che, quando arriva una email per `nome.cognome@`, deve mandarla a `s000000@`.

Il problema dell'alias e' che la *corrispondenza magica* che mappa
`nome.cognome@` in `s000000@` e' nota solo al server `studenti.polito.it`.
Per tutto il resto del mondo, incluso il server della mailing list,
`nome.cognome@` e `s000000@` sono due indirizzi email differenti.

Vediamo ora, quindi, com'e' possibile che tu ricevi le email dalla mailing
list ma non riesci a inviare email in mailing list.

Per la ricezione abbiamo due casi:

1. se sei iscritto come `s000000@`, allora, il server della mailing list
invia l'email a `s000000@` e tu ricevi l'email;

2. se sei iscritto come `nome.cognome@`, allora il server della mailing list
invia l'email a `nome.cognome@`, il server `studenti.polito.it` applica la
corrispondenza magica (i.e. mappa `nome.cognome@` in `s000000@`) e tu ricevi
comunque l'email.

Per l'invio di una email, invece, il discorso e' differente, perche' il server
della mailing list non sa nulla della corrispondenza magica. Quindi:

3.  se tu invii come `nome.cognome@` ma sei iscritto come `s12356@`,
l'email viene rifiutata, perche' il mittente non risulta iscritto alla
lista;

4. allo stesso modo, se tu invii come `s000000@` ma sei iscritto
come `nome.cognome@` l'email viene rifiutata, perche' il mittente non
risulta iscritto alla lista.

Riassumendo: dei due indirizzi (`nome.cognome` e `s12345@`), usa come mittente
l'indirizzo con cui sei iscritto alla lista, e non l'altro.

Puoi capire quale indirizzo e' iscritto alla lista guardando le email
che ricevi dalla lista. Trovi, infatti, l'indirizzo con cui sei iscritto
alla lista nel campo `To: ` della email.

Puoi cambiare l'indirizzo con cui scrivi abbastanza facilmente, sia con
l'interfaccia web del Poli sia usando Thundebird.
