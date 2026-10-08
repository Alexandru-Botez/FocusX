# FocusX

FocusX è un timer Pomodoro per lo studio, in bianco e nero, con una pagina per organizzare i progetti.

È un progetto didattico: usa soltanto HTML, CSS e JavaScript, senza librerie né compilazione,
e ogni file è commentato riga per riga per chi sta imparando lo sviluppo web e Git.

## Stato del progetto

Il timer, la creazione e l'eliminazione dei progetti funzionano. Obiettivi, statistiche e impostazioni
sono ancora da sviluppare: vedi [Funzioni da sviluppare](#funzioni-da-sviluppare).

### Timer

- Conto alla rovescia di 25 minuti con i pulsanti Avvia, Pausa e Reset.
- Pausa conserva il tempo rimasto e Avvia riprende da lì; in pausa le cifre diventano grigie.
- Reset ferma il timer e lo riporta a `25:00`.
- Arrivato a zero, il timer riparte da `25:00` e continua da solo.
- Ogni pulsante è disponibile solo quando ha senso usarlo:

| Stato | Avvia | Pausa | Reset |
| --- | --- | --- | --- |
| All'apertura e dopo Reset | Disponibile | Disabilitato | Disabilitato |
| Conteggio in corso | Disabilitato | Disponibile | Disponibile |
| In pausa | Disponibile | Disabilitato | Disponibile |

### Progetti

- Una pagina dedicata, raggiungibile dal menu.
- Crea progetto apre un modulo per il nome e il colore; Salva progetto aggiunge la voce all'elenco.
- Oltre agli otto colori predefiniti, il cerchio arcobaleno apre il selettore di colore del browser.
- Una cartella del colore scelto compare a sinistra del nome di ogni progetto.
- Il cestino a destra di ogni progetto lo elimina; al passaggio del mouse diventa rosso.
- I progetti restano dopo una ricarica: sono salvati in `localStorage`, nel browser
  e all'indirizzo usati, e non vengono sincronizzati tra dispositivi.

### Interfaccia

- Tema scuro in bianco e nero, adattato agli schermi piccoli.
- Menu laterale con icona hamburger animata; su telefono occupa tutto lo schermo.
  Si chiude con un secondo clic, con Esc o con un clic fuori dal pannello.
- Animazioni discrete in solo CSS, disattivate per chi preferisce ridurre il movimento.
- Uso da tastiera, indicatore di focus visibile e nomi accessibili per i pulsanti.
- Logo SVG e font ADLaM Display inclusi nel progetto: nessuna risorsa esterna.

### Limiti attuali

- Nel menu soltanto Progetti apre una pagina: Obiettivi, Statistica e Impostazioni
  non hanno ancora una destinazione.
- Cambiare pagina interrompe il timer: tornando si riparte da `25:00`.
- I progetti hanno solo nome e colore: non si possono modificare e l'eliminazione non chiede conferma.

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
├── styles.css              Stile di entrambe le pagine
├── script.js               Timer: avvio, pausa, reset e ripartenza
├── menu.js                 Menu laterale, condiviso dalle due pagine
├── progetti.js             Creazione, eliminazione e salvataggio dei progetti
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
- [ ] Inserimento e completamento degli obiettivi di studio.
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
