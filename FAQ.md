Frequently Asked Questions (FAQ)
================================

1.1. Sono iscritto alla lista, ricevo le email ma non riesco a mandarle
-----------------------------------------------------------------------

Se non sei iscritto alla lista con l'email del Politecnico (i.e. una email
`@studenti.polito.it`) non ricadi nella casistica descritta in
questa FAQ.

Se, invece, sei iscritto alla lista con l'email del Politecnico, ricevi
le email degli altri iscritti, ma ricevi una email indicante un errore
quando scrivi un messaggio in lista, allora e' molto probabile che tu sia
iscritto alla lista con il tuo *indirizzo vero* (`s000000@studenti.polito.it`)
ma stia scrivendo con l' *alias* (`nome.cognome@studenti.polito.it`), o
viceversa.

Prima di entrare nei dettagli, vediamo per prima cosa il messaggio di errore
che dovresti ricevere:

    Your request to the rd mailing list

        Posting of your message titled "..."

    has been rejected by the list moderator.  The moderator gave the
    following reason for rejecting your request:

    "Non-members are not allowed to post messages to this list."

    Any questions or comments should be directed to the list administrator
    at:

        rd-owner@server-nexa.polito.it

Adessso vediamo di capire meglio il problema. Per il Politecnico,
l' *indirizzo vero* e' questo qua:

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

Il problema dell'alias e' che la corrispondenza tra
`nome.cognome@` in `s000000@` e' nota solo al server `studenti.polito.it`.
Per tutto il resto del mondo, incluso il server della mailing list,
`nome.cognome@` e `s000000@` sono due indirizzi email differenti.

Vediamo ora, quindi, com'e' possibile che tu ricevi le email dalla mailing
list ma non riesci a inviare email in mailing list.

Per la ricezione abbiamo due casi:

1. se sei iscritto come `s000000@`, allora, il server della mailing list
invia l'email a `s000000@` e tu ricevi l'email;

2. se sei iscritto come `nome.cognome@`, allora il server della mailing list
invia l'email a `nome.cognome@`, il server `studenti.polito.it`
mappa `nome.cognome@` in `s000000@` e tu ricevi comunque l'email.

Per l'invio di una email, invece, il discorso e' differente, perche' il server
della mailing list non sa nulla della corrispondenza tra `nome.cognome@` e
s000000@`. Quindi:

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
