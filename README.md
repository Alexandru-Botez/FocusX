# FocusX

FocusX è un progetto didattico per costruire un'app web Pomodoro con obiettivi di studio.
Il progetto usa HTML, CSS e JavaScript per imparare lo sviluppo web e il lavoro con Git.

## Stato del progetto

Il pulsante Avvia fa partire il conto alla rovescia da `25:00`.
Pausa ferma il conteggio; premendo di nuovo Avvia si riprende dal tempo rimasto.
Quando i secondi rimanenti arrivano a zero, il tempo torna subito a `25:00`
e il conto alla rovescia continua automaticamente.
Reset e la gestione degli obiettivi sono ancora da sviluppare.

Già presenti:

- Struttura HTML con intestazione, timer e controlli.
- Tema scuro in bianco e nero, adattato anche a schermi piccoli.
- Logo SVG con testa di profilo e occhio a mirino.
- Font ADLaM Display incluso nel progetto.
- Nomi accessibili per i pulsanti e indicatore di focus da tastiera.
- Avvio del timer con aggiornamento del tempo e ripartenza automatica.
- Pausa e ripresa dal tempo rimanente, con aggiornamento dei pulsanti disponibili.
- Sfondo rosso chiaro con testo nero al passaggio del mouse sul pulsante Reset.
- Commenti didattici nell'HTML, nel CSS e nel JavaScript.

## Tecnologie e requisiti

- **HTML:** struttura e significato dei contenuti.
- **CSS:** colori, tipografia, disposizione e adattamento allo schermo.
- **JavaScript:** avvio, pausa, ripresa, conto alla rovescia e ripartenza automatica del timer.
- **Git:** cronologia delle modifiche.

Per seguire la procedura di avvio servono un browser moderno, Git e Python 3.
L'app non richiede un gestore di pacchetti o una procedura di compilazione.

## Avvio locale

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
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── focusx-mark.svg
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

- [ ] Ripristino del timer.
- [ ] Segnalazione della fine della sessione.
- [ ] Inserimento e completamento degli obiettivi di studio.

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

