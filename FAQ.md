Frequently Asked Questions (FAQ)
================================

by Simone Basso, et al. &mdash; License: CC BY-SA 3.0 Unported

1.1. Sono iscritto alla lista, ricevo le email ma non riesco a mandarle
-----------------------------------------------------------------------

### Casistica

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

### Cos'e' un alias

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

### Perche` l'alias crea problemi

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

### Conclusioni

Riassumendo: dei due indirizzi (`nome.cognome` e `s12345@`), usa come mittente
l'indirizzo con cui sei iscritto alla lista, e non l'altro.

Puoi capire quale indirizzo e' iscritto alla lista guardando le email
che ricevi dalla lista. Trovi, infatti, l'indirizzo con cui sei iscritto
alla lista nel campo `To: ` della email.

Puoi cambiare l'indirizzo con cui scrivi abbastanza facilmente, sia con
l'interfaccia web del Poli sia usando Thundebird.

(P.S. Grazie a Matteo Di Placido per il feedback.)


1.2. Come aggiungo il supporto per i tag al tema Tumblr?
--------------------------------------------------------

Per aggiungere i tag al tema Tumblr devi modificare il template del
tema, andando su:

- Impostazioni;

- Personalizza Tema;

- Modifica HTML.

A questo punto inserisci il seguente blocco di codice pseudo-HTML dove vuoi
che compaiano i tags:

    {block:HasTags}
        {block:Tags}
            <li><a href="{TagURL}">{Tag}</a></li>
        {/block:Tags}
    {/block:HasTags}

Infine, ricordati di salvare le modifiche.

Soluzione originale by [Stefano Bitto][post-1001].

[post-1001]: http://server-nexa.polito.it/pipermail/rd/2013-May/001001.html

1.3. Come creo un blog su WordPress?
------------------------------------

Una buona risorsa che spiega come creare un blog su WordPress e' il
video ["How to Create a Blog on Wordpress Step by Step Tutorial"][wp-howto],
sottotitolato da [Fabio Vallone][fabio-vallone] per l'edizione 2013 del
corso.

[wp-howto]: http://www.youtube.com/watch?v=W0UJ0q-hJGw
[fabio-vallone]: https://twitter.com/FabioVallone

1.4. Come modificare una voce di Wikipedia?
-------------------------------------------

Il primo passo da fare è registrarsi. Passaggio importante e che richiede
pochi secondi. Volendo si può agire anche senza essere registrati, ma
le modifiche fatte da persone che non sono registrate sono sempre viste
con maggior sospetto dai wikipediani e rischiano di essere cancellate
facilmente.

Ma veniamo alle modifiche vere e proprie.

A livello base, ossia a livello della modifica dei soli contenuti, non
è particolarmente complesso agire su wikipedia.  Potrei anche scrivere
una guida più approfondita, ma temo richiederebbe una quantità di tempo
non indifferente.  In più sarebbe inutile in quanto su wikipedia, nella
sezione aiuto, c'è tutto (veramente tutto, forse addirittura troppo). In
fondo vi linkerò alcune pagine di aiuto di wikipedia fondamentali per
iniziare ad avventurarsi nell'editing più avanzato.

Ogni voce presenta in alto il tasto “modifica”.

<img src="http://casadigitale.files.wordpress.com/2013/05/immagine2.jpg"
     alt="modifica" />

Da qui si accede al sorgente della pagina. Tutto quello che scriverete o
modificherete qua, una volta salvati i cambiamenti, sarà immediatamente
disponibile nella voce editata.

Su Wikipedia sono molto severi, se aggiungete nuove informazioni dovete
sempre citare la fonte (possibilmente un poco autorevole). Per fare
ciò, aggiungete la seguente stringa alla fine della parte di testo che
avete editato:

    <ref>[url della pagina citata]</ref>

e nel caso (raro) in cui in fondo alla voce non ci fosse ancora la
sezione “Note” aggiungete:

    ==Note==
    <references />

questa semplice formula inserirà automaticamente in fondo alla voce ogni
collegamento alle fonti sparse nel testo.  Inoltre, dopo aver modificato
una voce, prima di salvare, è buona abitudine aggiungere nel campo
“Oggetto” in cosa consiste la vostra modifica. Così contribuirete
anche a rendere più fluidi eventuali controlli sulla pagina.

<img src="http://casadigitale.files.wordpress.com/2013/05/immagine.jpg"
     alt="oggetto" />


Vi invito anche a notare il tasto “Questa è una modifica minore”
subito sotto il campo oggetto. Esso è da selezionare soltanto quando vi
siete limitati a correggere un errore ortografico, una formattazione o
comunque qualcosa che non aggiunga o modifichi le informazioni della voce.

Qualche piccolo aiuto riguardo alla sintassi e alla formattazione (e
cose più basilari):

    == Intestazione ==
    === Sezione ===
    ==== Sottosezione ====

    * liste
    ** iniziare ogni linea con un asterisco
    *** altri asterischi fanno iniziare altri livelli
    # liste numerate
    
    ''corsivo'', '''grassetto''', ''''grassetto e corsivo''''
    
    Collegamenti interni: [[nome della voce che si vuole linkare]]
    Collegamenti esterni: [url della pagina]

Bene, è ovvio che mancano ancora tantissime cose, ma almeno ora
dovreste riuscire a muovere i primi passi senza combinare pasticci, o più
probabilmente, senza che i vostri sforzi vengano vanificati. I wikipediani
cercano di mantenere un buon livello di accuratezza dell'enciclopedia,
e non citare le fonti o fare una modifica senza la formattazione adeguata,
il più delle volte vuol dire veder cancellati i propri contributi. Quindi
occhio!


Vi lascio come promesso qualche link utile, nel caso voleste approfondire
l'editing di Wikipedia:

- Guida per principianti:
http://it.wikipedia.org/wiki/Aiuto:Guida_essenziale

- Creare una nuova voce ex novo:
http://it.wikipedia.org/wiki/Aiuto:Tour_guidato/Tutorial_4

- Tradurre una voce da un'altra wiki:
http://it.wikipedia.org/wiki/Aiuto:Come_tradurre_una_voce

- Inserire le citazioni (expert mode: on):
http://it.wikipedia.org/wiki/Aiuto:Note

- Approfondimenti sull'uso delle fonti:
http://it.wikipedia.org/wiki/Aiuto:Uso_delle_fonti

- Usare le immagini: http://it.wikipedia.org/wiki/Aiuto:Immagini

- Copyright immagini:
http://it.wikipedia.org/wiki/Wikipedia:Copyright_immagini

- Mi hanno cancellato una voce:
http://it.wikipedia.org/wiki/Aiuto:Voci_cancellate

Entry contribuita da [Alessandro Garelli].

[Alessandro Garelli]: https://twitter.com/Gare_1993

1.5. Come citare una fonte su Wikipedia?
-----------------------------------------------------

Per citare una fonte, è necessario seguire il relativo
template, utilizzando un formato standard e omogeneo, conforme a quanto
previsto dalle convenzioni bibliografiche di Wikipedia.

Il modo più semplice per citare è scrivere questo:

    <ref>{{cita web|url=...|titolo=...|accesso=...}}</ref>
    
Ovviamente, al posto dei puntini che ci sono dopo i 3 parametri (‘url’,
’titolo’ e’accesso’) bisogna inserire rispettivamente l’URL del sito
web usato come fonte, il titolo del documento (per esempio, il titolo
dell’articolo), la data dell’ultimo accesso al documento (di solito è
la data in cui state scrivendo la fonte).

Esempio:

    “Il [[13 febbraio]] [[2012]], Comrie annuncia il ritiro dall'attività
    professionistica.<ref>{{Cita web 
    |url=http://www.tsn.ca/nhl/story/?id=387700 |titolo=Former Oiler,
    senator Comrie retires after 10 NHL seasons |accesso=25 maggio 2013}}</ref>”
    
Questa è la versione in assoluto più striminzita del template, dove ci sono
soltanto i 3 parametri obbligatori.

I parametri esistenti sono molti di più (per esempio, ‘autore’,’nome’,
’cognome’,’data’, ‘anno’, ecc).

Più parametri inserite, più è dettagliata la fonte. Ovviamente non bisogna
esagerare con parametri inutili, e soprattutto non bisogna inserire due 
parametri equivalenti (se inserite ‘data’, è completamente inutile
inserire ‘anno’).

Il mio consiglio è scegliere questi parametri: url, titolo, autore (o,
in alternativa, cognome e nome),editore, accesso e data.

Vi lascio il link della pagina di Wikipedia sul template {{Cita web}}:
    https://it.wikipedia.org/wiki/Template:Cita_web
    
Entry contribuita da [LorenzoCutelle] con l'aiuto di [Alessandro Garelli].

[LorenzoCutelle]: https://twitter.com/LorenzoCutelle


1.6. Dove trovo il work in progress delle correzioni?
-----------------------------------------------------

Trovi i post che sono gia' stati scaricati, indipendentemente dal
fatto che siano gia' stati corretti o no, qui:

    http://shelob.polito.it/rd/<anno>/b/

Ad esempio:

    http://shelob.polito.it/rd/2013/b/

Nota che scarico i post ogni 15 giorni, tipicamente il primo giorno
di ogni mese e il 15 di ogni mese.

Invece, trovi le bozze della correzione dei blog post all'interno
di questa cartella:

    https://github.com/bassosimone/rivoluzionedigitale/tree/master/post

La cartella contiene un file per ogni periodo di correzione, che
corrisponde circa ai post di 15 giorni.

Nota che, ogni volta che correggo 3-5 blog post, invio un tweet a
chi ha scritto i post per informarli, linkando anche la versione
piu' aggiornata del file che contiene le correzioni.

Infine, quando ho corretto tutti i post relativi ad un certo periodo,
invio in lista il file che contiene le correzioni.


1.7. Cosa devo controllare prima di pubblicare una traduzione sul blog?
-----------------------------------------------------------------------

Prima di pubblicare una traduzione sul blog accertati riguardo al
tipo di licenze utilizzate nel sito da cui stai traducendo.

In una pagina web coperta da copyright (indicato con il simbolo ‘©’
solitamente alla fine della pagina), un articolo può essere tradotto
solamente dietro consenso dell’autore che ne è detentore dei
diritti. Puoi, però, controllare in alcuni siti come
http://internazionale.it/ se una traduzione dello stesso articolo
è stata rilasciata in Creative Commons.

Per quanto riguarda le pagine web che adottano una licenza CC, devi solamente
controllare che questa non includa la clausola 'ND - Non opere derivate',
poiche' essa non consente di trarre opere derivate (come appunto una
traduzione) a partire dai contenuti distribuiti con detta licenza.

Puoi, inoltre, tradurre articoli in PD (pubblico dominio).

FAQ contribuita da [Alessandro Cannone] rielaborando i messaggi [1087]
e [1092] della lista del corso.  Revisione giuridica e contributi ulteriori
by [Claudio Artusio][cartusio].

[1087]: http://server-nexa.polito.it/pipermail/rd/2013-May/001087.html
[1092]: http://server-nexa.polito.it/pipermail/rd/2013-May/001092.html
[Alessandro Cannone]: https://twitter.com/Ale_Cannone
[cartusio]: http://nexa.polito.it/people/cartusio

1.8. Quali sono gli aspetti piu' importanti della correzione della lista?
-------------------------------------------------------------------------

Gli aspetti piu' importanti sono il subject e i paragrafi. E' anche
abbastanza importante che In-Reply-To sia presente se e solo se il
Subject inizia con 'Re: ' (cioe' se il messaggio e' una risposta), e
che le righe non siano troppo lunghe.

A proposito di In-Reply-To, e' grave che sia presente solo In-Reply-To
e non 'Re: '. Questo, infatti, indica che per scrivere un nuovo messaggio,
hai fatto 'Rispondi' ad un messaggio precedente e poi hai cancellato e
riscritto il Subject.

E' molto meno grave, invece, che il messaggio sia di risposta e sia
presente 'Re: ' ma non In-Reply-To. Questo generalmente indica soltanto
che chi risponde non ha ricevuto il messaggio cui vuole rispondere, ad
esempio perche' segue la lista in digest.

Infine, nella correzione della lista ho inserito anche altri aspetti (e.g.
`List-Address-in-To`) perche' possono essere rilevanti su alcune liste
piu' di puristi. Si tratta, comunque, di aspetti minori rispetto a
quelli menzionati nel paragrafo precedente.

1.9. Come posso gestire l'indirizzo email del Politecnico usando un mio client di posta?
----------------------------------------------------------------------------------------

0 - Si consiglia l'utilizzo di 'Mozilla Thunderbird', poichè questo preciso
client permette una gestione friendly delle email e risulta particolarmente
efficace se si fa parte di una mailing list

1 - Una volta installato Mozilla Thunderbird devi aprire la finestra di 
gestione degli account di posta elettronica selezionando la voce 
"Impostazioni account" nel menù "Strumenti" (se usi sistema operativo Windows;
"Modifica" invece per un sistema operativo GNU/Linux).

2 - Seleziona "Aggiungi account di posta" nel menù a tendina "Azioni account"
e inserisci il tuo nome e cognome nel campo "Nome:"

3 - Specifica il tuo indirizzo di posta elettronica nella forma 
s<numero matricola>@studenti.polito.it, oppure, se attivo, il tuo
alias di posta elettronica nella forma <nome>.<cognome>@studenti.polito.it
nel campo "Indirizzo email:"

4 - Inserisci in seguito la tua password (la stessa che utilizzi per 
accedere ai box self-service) nel campo "Password:".
Metti infine la spunta su "Ricorda password", se lo desideri, e premi
il pulsante "Continua".

5 - Nella riga "In entrata:" seleziona "POP3" nel primo menù a tendina;
nel campo "Nome server" inserisci "pop.studenti.polito.it".
Nel menù a tendina "Porta" seleziona "995", nel menù a tendina "SSL" seleziona
"SSL/TLS" e nel menu a tendina "Autenticazione" seleziona "Password normale".

6 - Nella riga "In uscita:" inserisci "smtp.studenti.polito.it" nel campo 
"Nome server", nel menù a tendina "Porta" seleziona "465", nel menù a 
tendina "SSL" seleziona "SSL/TLS" e nel menù a tendina "Autenticazione"
seleziona "Password normale"

7 - Specifica poi il tuo indirizzo di posta elettronica nella forma 
s<numero matricola>@studenti.polito.it, oppure, se attivo, il tuo
alias di posta elettronica nella forma <nome>.<cognome>@studenti.polito.it
nel campo "Nome utente:"

8 - Premi infine il pulsante "Riesaminare" e verifica che le impostazioni 
inserite siano corrette: in caso di errore, procedi ad una correzione.
Premi il pulsante "Fatto" per terminare la procedura di configurazione.

9 - Goditi la semplicità di Mozilla Thunderbird

10 - Puoi seguire gli stessi passaggi per la configurazione della posta 
elettronica del Politecnico di Torino su Smartphone e/o Tablet seguendo
gli stessi passaggi nei configuratori di account email del tuo dispositivo


FAQ contribuita da [Davide Palermo] basandosi sulla guida online presente
sul portale della didattica del Politecnico di Torino
https://didattica.polito.it/mail/pop3/thunderbird.html

[Davide Palermo]: https://twitter.com/DavidePalermo2
