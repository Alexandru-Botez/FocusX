# Guida allo sviluppo di FocusX

Questa guida spiega come è organizzato il progetto e come modificarlo.
Per scaricarlo e avviarlo, parti dal [README](../README.md).

## Stato attuale

FocusX ha un primo comportamento JavaScript: Avvia fa partire il conto alla rovescia
e il timer ricomincia automaticamente da 25 minuti quando i secondi rimanenti arrivano a zero.
Pausa, Reset e gli obiettivi sono ancora da sviluppare.
Non c'è ancora una suite di test automatici nel repository.

## Responsabilità dei file

| File | Responsabilità |
| --- | --- |
| [index.html](../index.html) | Contenuti, struttura della pagina, pulsanti e attributi di accessibilità. |
| [styles.css](../styles.css) | Font, colori, layout, stati visivi e regole per gli schermi piccoli. |
| [script.js](../script.js) | Avvio, conto alla rovescia, formattazione del tempo e ripartenza automatica. |
| [focusx-mark.svg](../assets/focusx-mark.svg) | Disegno vettoriale del logo. |
| [ADLaMDisplay-Regular.ttf](../assets/fonts/ADLaMDisplay-Regular.ttf) | Font usato per il nome dell'app. |
| [ADLaMDisplay-OFL.txt](../assets/fonts/ADLaMDisplay-OFL.txt) | Licenza del font. |

Il browser legge `index.html`, carica il foglio CSS e il file JavaScript collegati
e mostra la pagina. L'attributo `defer` fa eseguire lo script dopo l'analisi dell'HTML.

## Struttura HTML

L'intestazione `header` contiene il logo e il titolo principale `h1`.
Il contenuto `main` contiene una `section` chiamata «Timer Pomodoro» tramite `aria-label`.
All'interno della sezione si trovano il tempo, il gruppo dei pulsanti e il messaggio di stato.

Gli identificatori da conoscere sono:

| Selettore | Elemento | Uso nel progetto |
| --- | --- | --- |
| `.brand-logo` | Immagine del logo | Dimensione e comportamento del logo nell'intestazione. |
| `#timer` | Paragrafo con `25:00` | Visualizzazione del tempo, aggiornata da JavaScript. |
| `.timer-controls` | Contenitore dei pulsanti | Disposizione dei controlli con Flexbox. |
| `#start-button` | Pulsante Avvia | Collegato ad avviaTimer; viene disabilitato dopo il primo clic. |
| `#pause-button` | Pulsante Pausa | Futuro collegamento alla funzione di pausa. |
| `#reset-button` | Pulsante Reset | Stile dedicato e futuro collegamento al ripristino. |
| `#timer-status` | Messaggio di stato | Visibile prima dell'avvio; viene nascosto al clic su Avvia. |

Una `class` può essere condivisa da più elementi. Un `id` deve identificare un solo elemento
nel documento. Se cambi un nome, aggiorna anche i selettori CSS, gli eventuali riferimenti
JavaScript e questa tabella.

## Organizzazione del CSS

Le regole sono organizzate dal contesto generale ai componenti e alle loro varianti:

1. `@font-face` registra il font locale ADLaM Display.
2. `:root` raccoglie le variabili dei colori e dichiara il tema scuro.
3. Il selettore `*` imposta il box model con `border-box`.
4. `body`, `header` e `main` definiscono la disposizione principale.
5. I selettori del logo, del titolo e del timer definiscono la tipografia e le dimensioni.
6. I pulsanti condividono una regola di base e hanno alcune personalizzazioni tramite `id`.
7. Le pseudo-classi definiscono gli stati hover, focus e disabilitato.
8. La media query finale adatta gli spazi e i pulsanti ai viewport fino a 480 pixel CSS.

Per cambiare la palette, parti dalle variabili in `:root`:

| Variabile | Uso |
| --- | --- |
| `--background` | Sfondo principale. |
| `--text` | Testo principale e sfondo del pulsante Avvia. |
| `--muted` | Testo secondario. |
| `--border` | Bordi dei pulsanti. |
| `--hover` | Sfondo comune al passaggio del mouse. |

Grid organizza la pagina in intestazione e contenuto e centra la sezione del timer.
Flexbox dispone il marchio e il gruppo dei pulsanti.
`clamp()` adatta la dimensione delle cifre alla larghezza del viewport entro due limiti.
I commenti in `styles.css` spiegano ogni dichiarazione e le unità utilizzate.

## Primo passo JavaScript

Il tempo viene conservato come un numero di secondi, non come il testo mostrato nella pagina.
`durataSessione` vale `25 * 60`, cioè 1500. `secondiRimanenti` parte da questo valore
e diminuisce durante il conto alla rovescia.

Le tre funzioni hanno responsabilità distinte:

| Funzione | Responsabilità |
| --- | --- |
| `avviaTimer()` | Disabilita Avvia, nasconde il messaggio di stato e avvia un intervallo. |
| `passaUnSecondo()` | Sottrae un secondo, ripristina 1500 quando arriva a zero e aggiorna il testo. |
| `aggiornaTimer()` | Converte i secondi rimanenti nel formato minuti:secondi. |

`addEventListener("click", avviaTimer)` collega il clic alla funzione di avvio.
`setInterval(passaUnSecondo, 1000)` richiede un'esecuzione ogni secondo.
Avvia viene disabilitato per evitare che più clic creino più intervalli.
Il messaggio «Pronto per iniziare.» scompare impostando `statoTimer.hidden = true`.

Per visualizzare il tempo, `Math.floor()` ricava i minuti interi e `%` ricava i secondi restanti.
`String()` converte i numeri in testo e `padStart(2, "0")` mantiene due cifre.
Infine `textContent` aggiorna il paragrafo del timer.

Al passaggio da un secondo rimanente a zero, il valore viene subito riportato a 1500:
la pagina passa quindi da `00:01` a `25:00`, senza fermarsi su `00:00`.
Ricaricare la pagina riporta il timer allo stato iniziale.

Questo primo esempio usa un intervallo semplice. Il browser può ritardare le esecuzioni,
per esempio in una scheda in background: non è ancora un conteggio basato sul tempo reale trascorso.
Vedi [setInterval su MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
e [padStart su MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart).

## Accessibilità

Le scelte presenti nel codice sono:

- `lang="it"` dichiara la lingua del documento.
- `header`, `main`, `section` e `h1` descrivono la struttura dei contenuti.
- Il logo ha `alt=""` perché il nome FocusX è già scritto accanto.
- Avvia e Pausa hanno `aria-label`, dato che mostrano soltanto un'icona.
- Le icone SVG sono decorative e hanno `aria-hidden="true"` e `focusable="false"`.
- I controlli sono elementi `button`, utilizzabili anche con la tastiera.
- `:focus-visible` rende visibile il pulsante selezionato da tastiera.
- Il timer usa `role="timer"` e `aria-live="off"` per evitare annunci continui.
- Il messaggio informativo usa `role="status"` ed è nascosto dopo l'avvio.

Se nelle prossime funzioni servirà mostrare un nuovo messaggio, rendi prima visibile
l'elemento con `hidden = false`. Evita annunci continui a ogni secondo.

## Convenzioni del codice

- Usa due spazi per l'indentazione, come nei file esistenti.
- Scrivi i tag HTML in minuscolo.
- Usa nomi descrittivi in kebab-case per classi e identificatori, per esempio `timer-status`.
- Nel CSS scrivi una dichiarazione per riga e riutilizza le variabili dei colori.
- Mantieni HTML per la struttura, CSS per lo stile e JavaScript per il comportamento.
- In JavaScript usa nomi descrittivi in camelCase, `const` per i nomi non riassegnati
  e `let` per i valori che cambiano.
- Scrivi commenti in italiano, vicino al codice a cui si riferiscono.
- Conserva le spiegazioni che coinvolgono più file nella cartella `docs/`.

Il progetto usa tecnologie native per facilitare l'apprendimento.
I file del font sono locali e il logo è SVG, così il disegno resta nitido quando viene ingrandito.

## Verifica di una modifica

Prima di considerare pronta una modifica all'interfaccia:

1. Avvia il progetto seguendo il README e aggiorna la pagina.
2. Controlla che logo, font e icone siano caricati.
3. Verifica il layout su un viewport largo e su uno fino a 480 pixel CSS.
4. Controlla che non compaiano sovrapposizioni o scorrimento orizzontale indesiderato.
5. Usa `Tab` per passare fra i pulsanti e verifica che il focus sia visibile.
6. Controlla la console del browser per eventuali errori.
7. Leggi il diff con `git diff` e aggiorna le guide coinvolte dalla modifica.

Per il timer attuale controlla anche che:

- Il tempo resti a `25:00` prima di premere Avvia.
- Il primo aggiornamento mostri `24:59`, poi `24:58`.
- Avvia sia disabilitato durante il conto alla rovescia.
- Il messaggio di stato sia visibile prima dell'avvio e nascosto dopo il clic.
- Il formato mantenga due cifre per minuti e secondi.
- Dopo 25 minuti il timer torni a `25:00` e continui.

Quando Pausa e Reset saranno implementati, aggiungi le relative verifiche.

## Aggiornamento della guida

Modifica questa guida quando cambiano la struttura, i nomi degli elementi, le convenzioni
o le modalità di verifica. Per le regole di scrittura e conservazione,
consulta [Come mantenere la documentazione](documentazione.md).

