# FocusX

FocusX è un timer Pomodoro per lo studio, in bianco e nero, con pagine per organizzare progetti e obiettivi.

È un progetto didattico: usa soltanto HTML, CSS e JavaScript, senza librerie né compilazione,
e ogni file è commentato riga per riga per chi sta imparando lo sviluppo web e Git.

## Stato del progetto

Il timer, i progetti e la prima versione degli obiettivi funzionano. Statistiche e impostazioni
sono ancora da sviluppare: vedi [Funzioni da sviluppare](#funzioni-da-sviluppare).

### Timer

- Sopra il timer, un blocco mostra l'obiettivo su cui lavori: nome, cerchio per completarlo
  e fiammine. Un clic sul blocco apre una finestrella con gli obiettivi da fare;
  premendo Avvia, l'obiettivo scelto va in corso; Pausa e Stop lo fermano.
  Un obiettivo è in corso solo mentre il timer conta. La scelta resta dopo una ricarica.
- Conto alla rovescia di 25 minuti con i pulsanti Avvia, Pausa e Stop.
- Pausa conserva il tempo rimasto e Avvia riprende da lì; in pausa le cifre diventano grigie.
- Stop finisce la sessione: ferma il timer e lo riporta a `25:00`.
- Il timer continua anche cambiando pagina, ricaricando o chiudendo la scheda: tornando
  nella Home mostra il tempo giusto, e l'obiettivo in corso riceve i minuti passati altrove.
  Anche la pausa resta dopo una ricarica. Nella pagina Obiettivi il tempo e le fiammine
  dell'obiettivo in corso crescono in diretta, secondo per secondo.
- Dopo ogni fiammina viene una pausa (5 minuti, se non la cambi nelle Impostazioni). Arrivata a zero la fiammina, il timer
  passa a `05:00`, fermo: la pausa parte con Avvia. Finita la pausa, torna a una fiammina
  da `25:00`, ferma, pronta per Avvia. L'obiettivo in corso ha una fiammina in più e smette
  di essere in corso; durante la pausa nessun obiettivo riceve tempo.
- La modalità si riconosce a colpo d'occhio: sopra le cifre un'etichetta dice «Fiammina»,
  arancione con la fiammina, o «Pausa», lilla con una tazzina. In pausa anche le cifre
  e Avvia sono lilla e la pillola dell'obiettivo si attenua.
- In pausa Stop diventa «Salta la pausa», con l'icona ⏭: riporta subito a una fiammina.
  Anche il play della pagina Obiettivi salta la pausa e fa partire una fiammina.
- Ogni pulsante è disponibile solo quando ha senso usarlo:

| Stato | Avvia | Pausa | Stop |
| --- | --- | --- | --- |
| All'apertura e dopo Stop | Disponibile | Disabilitato | Disabilitato |
| Conteggio in corso | Disabilitato | Disponibile | Disponibile |
| In pausa | Disponibile | Disabilitato | Disponibile |
| Pausa tra fiammine, prima di Avvia | Disponibile | Disabilitato | Disponibile (salta) |

### Progetti

- Una pagina dedicata, raggiungibile dal menu.
- Crea progetto apre una barra compatta di una sola riga, come quella degli obiettivi:
  si scrive il nome, si sceglie il colore e si preme Invio. Il progetto compare in cima
  all'elenco e la barra resta aperta per aggiungerne un altro; la X o Esc la chiudono.
- Dodici colori principali, in piccoli cerchi nella barra; il + apre una finestrella con altri dodici colori.
  Tutti sono abbastanza chiari da vedersi bene sullo sfondo scuro.
- Un puntino segnala i colori già usati da altri progetti; restano comunque selezionabili.
- Due progetti non possono avere lo stesso nome e lo stesso colore: Salva si disattiva
  e un avviso spiega perché. Le maiuscole e gli spazi ai lati non contano.
- Una cartella del colore scelto compare a sinistra del nome di ogni progetto.
- Le voci sono compatte come quelle degli obiettivi. La matita a destra trasforma la voce
  nella stessa barra, già compilata: Invio salva, Esc annulla.
- Il cestino accanto lo elimina; al passaggio del mouse diventa rosso.
- I progetti restano dopo una ricarica: sono salvati in `localStorage`, nel browser
  e all'indirizzo usati, e non vengono sincronizzati tra dispositivi.

### Obiettivi

- Una pagina dedicata, raggiungibile dal menu; per creare un obiettivo serve almeno un progetto.
- Crea obiettivo apre una barra compatta, di una sola riga: nome, tempo previsto in fiammine,
  data e progetto. Si scrive il nome e si preme Invio; la data parte da oggi e il progetto
  è il primo. Dopo il salvataggio la barra resta aperta per aggiungerne subito un altro;
  la X o Esc la chiudono.
- La matita di un obiettivo trasforma la sua voce nella stessa barra, già compilata e con
  il cestino: Invio salva, Esc annulla.
- Il progetto si sceglie con la cartella colorata, che apre un elenco nello stile del sito:
  ogni voce ha la cartella del colore del progetto, e quella scelta ha la spunta.
  Il nome del progetto scelto si legge nel segnaposto della barra.
- La data si sceglie in un calendario nello stile del sito: si cambia mese con le frecce,
  oggi ha un anello arancione e il giorno scelto è pieno. Se la data è oggi, nella barra e nella
  lista degli obiettivi si legge «Oggi» invece della data.
- Elenco dei progetti e calendario funzionano anche da tastiera (frecce per muoversi,
  Invio per scegliere, Esc per chiudere).
- Il tempo si sceglie in fiammine intere: per ora ogni fiammina vale 25 minuti.
  Le prime otto si cliccano; la nona, con il +, apre una finestrella con − e +
  per sceglierne di più, fino a 16 ore (38 fiammine). Il numero nella finestrella
  si può anche scrivere direttamente. Nell'elenco, oltre le otto,
  la voce mostra una sola fiammina seguita dal numero, per esempio 🔥12;
  in corso anche il numero diventa azzurro, come la fiammina.
- Ogni obiettivo mostra, sotto il nome, le fiammine con il tempo lavorato e quello previsto
  (per esempio «10 min / 1 h 15 min»), la data e il suo progetto con il colore.
  Ogni fiammina ha tre aspetti: vuota (solo contorno) se è da fare, azzurra e tremolante
  se è quella da completare mentre l'obiettivo è in corso, piena e accesa quando è fatta:
  azzurra mentre l'obiettivo è in corso, arancione quando è completato.
  Una fiammina diventa fatta ogni 25 minuti lavorati, anche da completato: un obiettivo
  finito prima del previsto mostra solo le fiammine davvero lavorate. Quella dopo si riempie
  dal basso in parte: con 55 minuti su 4 fiammine, due sono piene, la terza al 20%
  e l'ultima vuota. Oltre otto, l'unica fiammina si riempie con tutto il tempo lavorato.
- Tre stati: non completato, in corso e completato. Il cerchio a sinistra del nome
  completa l'obiettivo; premuto di nuovo, lo riporta a non completato. Il cerchio è vuoto
  e la spunta compare, diventando verde, solo quando l'obiettivo è completato. Il "play" a destra
  porta alla Home, sceglie lì l'obiettivo e fa partire il timer: è in corso finché il timer conta. Lo stato si riconosce dai pulsanti, dal bordo e dalle fiammine.
- Un solo obiettivo alla volta è in corso: mettendone in corso un altro, il precedente si ferma
  e torna non completato.
- Ogni obiettivo ricorda il tempo lavorato: ogni secondo del timer della Home si aggiunge
  all'obiettivo in corso, fino a 16 ore. Si può lavorare oltre il previsto, finché non lo completi:
  il tempo lavorato è in evidenza, azzurro mentre l'obiettivo è in corso.
  Con meno di un minuto lavorato il cerchio è disattivato.
- La matita accanto al play apre lo stesso modulo con i dati dell'obiettivo, per modificare
  nome, progetto, data e fiammine; lo stato non cambia. Durante la modifica la voce è nascosta.
- Nel modulo di modifica, il pulsante rosso Elimina cancella l'obiettivo.
- Due obiettivi dello stesso progetto non possono avere lo stesso nome: Salva si disattiva
  e un avviso spiega perché. Le maiuscole e gli spazi ai lati non contano.
- Una data già passata diventa rossa finché l'obiettivo non è completato.
- Anche gli obiettivi sono salvati in `localStorage`, con una chiave separata dai progetti.

### Interfaccia

- Tema scuro in bianco e nero, adattato agli schermi piccoli.
- Menu laterale con icona hamburger animata; su telefono occupa tutto lo schermo.
  Si chiude con un secondo clic, con Esc o con un clic fuori dal pannello.
- Animazioni discrete in solo CSS, disattivate per chi preferisce ridurre il movimento.
- Uso da tastiera, indicatore di focus visibile e nomi accessibili per i pulsanti.
- Logo SVG e font ADLaM Display inclusi nel progetto: nessuna risorsa esterna.
- La voce Impostazioni del menu apre, su ogni pagina, una finestra al centro con lo sfondo
  oscurato: a sinistra le sezioni, a destra il contenuto. Nella sezione Durate si cambiano
  la durata della fiammina (da 10 a 60 minuti, a passi di 5) e della pausa (da 1 a 30 minuti).
  Le modifiche si salvano subito e si vedono subito: il timer, se non è partito, e il tempo
  previsto e le fiammine degli obiettivi. Una sessione già avviata finisce con la sua durata.
  Gli obiettivi tengono il loro numero di fiammine: con fiammine più lunghe prevedono più tempo.
  La finestra si chiude con la X, con Esc o con un clic fuori.

### Limiti attuali

- Nel menu Statistica non ha ancora una destinazione.
- Allungando la fiammina, un obiettivo con molte fiammine può prevedere più di 16 ore:
  resta valido, ma il modulo non permette di crearne di nuovi oltre il limite.
- I progetti hanno solo nome e colore, e l'eliminazione non chiede conferma.
- Eliminando un progetto, i suoi obiettivi restano e mostrano «Progetto eliminato».
- Il tempo lavorato si conta solo con la Home aperta, a ogni secondo del timer.

## Avvio locale

Servono un browser moderno, Git e Python 3.
Per scaricare il progetto per la prima volta:

```bash
git clone https://github.com/Alexandru-Botez/FocusX.git
cd FocusX
```

Se hai già il progetto, apri il terminale direttamente nella sua cartella.
Avvia quindi il server locale:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Apri [FocusX nel browser](http://127.0.0.1:8765/).
Lascia aperto il terminale mentre usi l'anteprima; premi `Ctrl+C` per fermare il server.
Dopo una modifica ai file, aggiorna la pagina del browser.

Se il comando `python` non è disponibile su Windows, prova a sostituirlo con `py`.
Se la porta 8765 è già occupata, usa una porta libera, per esempio 8766,
e apri l'indirizzo con lo stesso numero di porta.

## Struttura del progetto

```text
FocusX/
├── README.md
├── index.html              Pagina del timer
├── progetti.html           Pagina dei progetti
├── obiettivi.html          Pagina degli obiettivi
├── css/
│   └── styles.css          Stile di tutte le pagine
├── js/                    Moduli JavaScript (type="module")
│   ├── archivio.js         Comune: chiavi e lettura dei dati salvati
│   ├── fiammine.js         Comune: valore, testi e disegno delle fiammine
│   ├── timer.js            Timer: avvio, pausa, stop e fine della sessione
│   ├── timer-salvato.js    Comune: lettura e scrittura del timer salvato, conti sull'orologio
│   ├── impostazioni-salvate.js  Comune: durate scelte dall'utente, limiti, lettura e scrittura
│   ├── impostazioni.js     Finestra delle impostazioni, su tutte le pagine
│   ├── home-obiettivo.js   Home: obiettivo scelto sopra il timer
│   ├── calendario.js       Obiettivi: calendario della data prevista
│   ├── scelta-progetto.js  Obiettivi: elenco per scegliere il progetto
│   ├── menu.js             Menu laterale, condiviso da tutte le pagine
│   ├── progetti.js         Creazione, modifica, eliminazione e salvataggio dei progetti
│   └── obiettivi.js        Creazione, modifica, stati e salvataggio degli obiettivi
├── assets/
│   ├── focusx-mark.svg     Logo e favicon
│   └── fonts/
│       ├── ADLaMDisplay-Regular.ttf
│       └── ADLaMDisplay-OFL.txt
└── docs/
    ├── guida-sviluppo.md
    └── documentazione.md
```

## Documentazione

- [Guida allo sviluppo](docs/guida-sviluppo.md): organizzazione del codice, scelte e verifiche manuali.
- [Come scrivere e mantenere la documentazione](docs/documentazione.md): dove conservare le spiegazioni e quali convenzioni seguire.

## Funzioni da sviluppare

- [ ] Segnalazione della fine della sessione.
- [ ] Modifica ed eliminazione degli obiettivi.
- [ ] Continuità del timer nel passaggio da una pagina all'altra.
- [ ] Backend e database per il salvataggio dei progetti online.

Questa lista descrive il lavoro previsto, non funzionalità già disponibili.

## Segnalazioni e contributi

Per segnalare un problema, apri una [issue nel repository](https://github.com/Alexandru-Botez/FocusX/issues).
Indica i passaggi per riprodurlo, il risultato atteso, quello ottenuto e il browser usato.
Per una modifica al codice, segui la guida allo sviluppo e aggiorna la documentazione interessata.

## Licenze

Il codice del progetto non ha ancora un file `LICENSE`.
Il font ADLaM Display è distribuito con la SIL Open Font License 1.1:
il testo è incluso in [ADLaMDisplay-OFL.txt](assets/fonts/ADLaMDisplay-OFL.txt).
Questa licenza riguarda il font.
