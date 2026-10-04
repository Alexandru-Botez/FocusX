# Guida allo sviluppo di FocusX

Questa guida spiega come è organizzato il progetto e come modificarlo.
Per scaricarlo e avviarlo, parti dal [README](../README.md).

## Stato attuale

FocusX usa JavaScript: Avvia fa partire o riprende il conto alla rovescia, Pausa lo ferma
e Reset lo ferma riportando il tempo a 25 minuti.
Il timer ricomincia automaticamente da 25 minuti quando i secondi rimanenti arrivano a zero.
Gli obiettivi sono ancora da sviluppare.
Non c'è ancora una suite di test automatici nel repository.

## Responsabilità dei file

| File | Responsabilità |
| --- | --- |
| [index.html](../index.html) | Contenuti, struttura della pagina, pulsanti e attributi di accessibilità. |
| [styles.css](../styles.css) | Font, colori, layout, stati visivi e regole per gli schermi piccoli. |
| [script.js](../script.js) | Comportamento del timer, apertura e chiusura del menu con la sua icona. |
| [focusx-mark.svg](../assets/focusx-mark.svg) | Logo vettoriale compatto con fiamma bianca e occhi neri inclinati e concentrati. |
| [ADLaMDisplay-Regular.ttf](../assets/fonts/ADLaMDisplay-Regular.ttf) | Font usato per il nome dell'app e le voci del menu. |
| [ADLaMDisplay-OFL.txt](../assets/fonts/ADLaMDisplay-OFL.txt) | Licenza del font. |

Il browser legge `index.html`, carica il foglio CSS e il file JavaScript collegati
e mostra la pagina. L'attributo `defer` fa eseguire lo script dopo l'analisi dell'HTML.

## Struttura HTML

L'intestazione `header` contiene, nell'ordine, il pulsante Menu, il logo e il titolo principale `h1`.
Il pannello `nav`, dentro l'header, contiene le quattro voci destinate alla futura navigazione.
Ogni `li` contiene un'icona SVG decorativa e uno `span` con il testo.
Nel `head`, un `link` con `rel="icon"` riutilizza il logo SVG come favicon della scheda.
Il contenuto `main` contiene una `section` chiamata «Timer Pomodoro» tramite `aria-label`.
All'interno della sezione si trovano il tempo, il gruppo dei pulsanti e il messaggio di stato.

Gli identificatori da conoscere sono:

| Selettore | Elemento | Uso nel progetto |
| --- | --- | --- |
| `#menu-button` | Pulsante Menu | Collega il clic al cambio di stato dell'icona e del pannello. |
| `#sidebar-menu` | Pannello laterale | Contiene le voci Progetti, Obiettivi, Statistica e Impostazioni. |
| `.menu-icon` | Icone delle voci | Cartella, bersaglio, grafico a barre e cursori delle impostazioni. |
| `.brand-logo` | Immagine del logo | Dimensione e comportamento del logo nell'intestazione. |
| `#timer` | Paragrafo con `25:00` | Visualizzazione del tempo, aggiornata da JavaScript. |
| `.timer-controls` | Contenitore dei pulsanti | Disposizione dei controlli con Flexbox. |
| `#start-button` | Pulsante Avvia | Collegato ad avviaTimer; disponibile quando il timer è fermo. |
| `#pause-button` | Pulsante Pausa | Collegato a pausaTimer; disponibile durante il conteggio. |
| `#reset-button` | Pulsante Reset | Collegato a resetTimer; disponibile dopo l'avvio, anche in pausa. |
| `#timer-status` | Messaggio di stato | Visibile prima dell'avvio e dopo Reset; nascosto al clic su Avvia. |

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
| `--surface` | Sfondo del pannello laterale. |
| `--text` | Testo principale e sfondo del pulsante Avvia. |
| `--muted` | Testo secondario. |
| `--border` | Bordi dei pulsanti. |
| `--hover` | Sfondo comune al passaggio del mouse. |
| `--reset-hover` | Sfondo rosso chiaro al passaggio del mouse su Reset, con la stessa opacità dello sfondo comune. |

`--header-height` riserva lo spazio sopra le voci del pannello: 100 pixel
su desktop e 92 su mobile, più 12 pixel di separazione. Se cambi altezza del logo, del pulsante Menu o padding
verticale dell'header, aggiorna anche questa variabile.

Grid organizza la pagina in intestazione e contenuto e centra la sezione del timer.
Flexbox dispone il marchio e il gruppo dei pulsanti.
`clamp()` adatta la dimensione delle cifre alla larghezza del viewport entro due limiti.
I commenti in `styles.css` spiegano ogni dichiarazione e le unità utilizzate.

## Primo passo JavaScript

Il tempo viene conservato come un numero di secondi, non come il testo mostrato nella pagina.
`durataSessione` vale `25 * 60`, cioè 1500. `secondiRimanenti` parte da questo valore
e diminuisce durante il conto alla rovescia.

Le cinque funzioni hanno responsabilità distinte:

| Funzione | Responsabilità |
| --- | --- |
| `avviaTimer()` | Disabilita Avvia, abilita Pausa e Reset, nasconde lo stato e avvia o riprende il conteggio. |
| `pausaTimer()` | Ferma l'intervallo, abilita Avvia e disabilita Pausa, conservando i secondi rimasti. |
| `resetTimer()` | Ferma il timer, ripristina 1500 secondi, disabilita Reset e mostra il messaggio iniziale. |
| `passaUnSecondo()` | Sottrae un secondo, ripristina 1500 quando arriva a zero e aggiorna il testo. |
| `aggiornaTimer()` | Converte i secondi rimanenti nel formato minuti:secondi. |

`addEventListener("click", avviaTimer)` collega il clic alla funzione di avvio.
`setInterval(passaUnSecondo, 1000)` richiede un'esecuzione ogni secondo e restituisce
un identificatore, che viene conservato in `intervalloTimer`.
Avvia viene disabilitato durante il conteggio; una condizione impedisce anche di creare
un secondo intervallo se la funzione viene richiamata mentre uno è già attivo.
Il messaggio «Pronto per iniziare.» scompare quando JavaScript aggiunge la classe `is-hidden`
con `statoTimer.classList.add("is-hidden")`.
Il CSS applica `visibility: hidden`: lo status conserva spazio e margini nel layout,
quindi il timer e i pulsanti non cambiano posizione quando il testo viene nascosto.

`clearInterval(intervalloTimer)` interrompe le chiamate periodiche quando premi Pausa.
Il valore `secondiRimanenti` resta intatto e `intervalloTimer` torna a `null`,
che nel progetto indica l'assenza di un intervallo attivo.
Premendo Avvia viene creato un nuovo intervallo a partire dal tempo conservato.

`resetTimer()` richiama `pausaTimer()` per fermare il conteggio senza duplicare quelle istruzioni.
Poi assegna `durataSessione` a `secondiRimanenti` e richiama `aggiornaTimer()`:
il testo torna subito a `25:00`, senza attendere un altro secondo.
Reset viene disabilitato e il messaggio iniziale torna visibile rimuovendo la classe
con `statoTimer.classList.remove("is-hidden")`.
Il conteggio riparte solo quando premi nuovamente Avvia.

| Stato | Avvia | Pausa | Reset |
| --- | --- | --- | --- |
| Prima del primo avvio | Disponibile | Disabilitato | Disabilitato |
| Conteggio in corso | Disabilitato | Disponibile | Disponibile |
| Timer in pausa dopo l'avvio | Disponibile | Disabilitato | Disponibile |
| Dopo Reset | Disponibile | Disabilitato | Disabilitato |

Reset si abilita al clic su Avvia, anche prima del primo aggiornamento del tempo.
La ripartenza automatica a `25:00` mantiene il conteggio attivo e Reset disponibile.

Per visualizzare il tempo, `Math.floor()` ricava i minuti interi e `%` ricava i secondi restanti.
`String()` converte i numeri in testo e `padStart(2, "0")` mantiene due cifre.
Infine `textContent` aggiorna il paragrafo del timer.

Al passaggio da un secondo rimanente a zero, il valore viene subito riportato a 1500:
la pagina passa quindi da `00:01` a `25:00`, senza fermarsi su `00:00`.
Ricaricare la pagina riporta il timer allo stato iniziale.

Questo primo esempio usa un intervallo semplice. Il browser può ritardare le esecuzioni,
per esempio in una scheda in background: non è ancora un conteggio basato sul tempo reale trascorso.
Vedi [setInterval su MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
e [clearInterval su MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval)
e [padStart su MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart).

## Menu laterale e icona hamburger

L'icona riprende i sei tracciati SVG e le transizioni dei file `hamburgermenu.html`
e `hamburgermenu.css` forniti come riferimento. È integrata in un `button` nell'header.
I selettori CSS sono limitati a `#menu-button`, così non modificano il logo,
le icone del timer o lo sfondo della pagina.

Il pannello riprende lo scorrimento da sinistra del riferimento
[Pure CSS Sidebar Toggle Menu](https://codepen.io/plavookac/pen/qomrMw),
adattato al tema nero e bianco. È largo 250 pixel, inizia dal bordo superiore e usa
`position: fixed`, quindi non sposta il timer. `translateX(-100%)` lo porta fuori
dalla finestra; la classe `is-open` lo riporta a `translateX(0)` in 250 millisecondi.
`visibility` lo nasconde dopo l'animazione di chiusura.

Il pannello è dentro l'header: il suo `z-index: 1` lo sovrappone a logo e titolo,
mentre il pulsante Menu ha `position: relative` e `z-index: 2` per restare sopra.
Quando è attivo, il pulsante usa lo stesso sfondo del pannello anche in hover.
Le voci non hanno bordi divisori; il padding superiore le separa dalla X.
Le righe usano una griglia con due colonne laterali uguali da 22 pixel: quella
sinistra ospita l'icona e quella destra resta vuota, mantenendo il testo al centro
del pannello. Il font ADLaM Display riprende quello del titolo.

`alternaMenu()` usa `classList.toggle("active")` sul pulsante e conserva il booleano
restituito in `menuAperto`. Passando quel booleano come secondo argomento di
`menuLaterale.classList.toggle("is-open", menuAperto)`, imposta il medesimo stato
sul pannello. Le transizioni dell'icona conservano la durata di 500 millisecondi.

`aria-expanded` comunica lo stato aperto o chiuso e `aria-controls` identifica
il pannello. La proprietà `inert` vale `!menuAperto`: il menu chiuso non è
interattivo ed è escluso dai lettori di schermo, anche durante la chiusura.
Vedi il [riferimento MDN su inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert).

`chiudiMenuFuori(evento)` controlla il bersaglio del clic con `contains()`:
chiude solo se il clic è fuori sia dal pulsante sia dal pannello.
`gestisciTastoMenu(evento)` riconosce Esc e chiude senza chiamare `focus()`.
Le quattro voci sono per ora elementi di lista senza collegamenti: le destinazioni
verranno aggiunte quando saranno disponibili le rispettive sezioni.

Invio e Spazio attivano il pulsante tramite il suo comportamento HTML nativo.
La preferenza `prefers-reduced-motion` disattiva le transizioni mantenendo il cambio di stato.

## Accessibilità

Le scelte presenti nel codice sono:

- `lang="it"` dichiara la lingua del documento.
- `header`, `main`, `section` e `h1` descrivono la struttura dei contenuti.
- Il logo ha `alt=""` perché il nome FocusX è già scritto accanto.
- Avvia e Pausa hanno `aria-label`, dato che mostrano soltanto un'icona.
- Menu ha `aria-label`, `aria-expanded` e `aria-controls` per descrivere il pannello controllato.
- Il pannello usa `nav` con un nome accessibile e `inert` quando è chiuso.
- Le icone SVG sono decorative e hanno `aria-hidden="true"` e `focusable="false"`.
- I controlli sono elementi `button`, utilizzabili anche con la tastiera.
- `:focus-visible` rende visibile il pulsante selezionato da tastiera.
- Il timer usa `role="timer"` e `aria-live="off"` per evitare annunci continui.
- Il messaggio informativo usa `role="status"`, è nascosto dopo l'avvio e torna visibile dopo Reset.

Se nelle prossime funzioni servirà mostrare un nuovo messaggio, rendi prima visibile
l'elemento con `statoTimer.classList.remove("is-hidden")`. Evita annunci continui a ogni secondo.

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

Per il menu laterale controlla che:

- Il pulsante si trovi a sinistra del logo e resti allineato con il titolo.
- Il clic animi l'icona e apra il pannello con le quattro voci richieste.
- Un secondo clic, Esc e un clic fuori chiudano il pannello.
- Un clic dentro il pannello lo lasci aperto; Esc lo chiuda senza spostare esplicitamente il focus.
- Il pannello copra logo e titolo, lasciando la X visibile sullo stesso sfondo del menu.
- Le quattro voci non mostrino bordi divisori e abbiano testo centrato e icone visibili.
- La favicon usi il logo dell'app e il relativo file sia caricato senza errori.
- `aria-expanded`, `active`, `is-open` e `inert` restino coerenti dopo più aperture e chiusure.
- Invio e Spazio eseguano lo stesso cambio di stato.
- L'animazione non modifichi il tempo o lo stato dei pulsanti del timer.
- Su uno schermo piccolo l'header non crei scorrimento orizzontale.
- Con la preferenza di movimento ridotto, il cambio avvenga senza transizioni.

Per il timer attuale controlla anche che:

- Il tempo resti a `25:00` prima di premere Avvia.
- Il primo aggiornamento mostri `24:59`, poi `24:58`.
- Avvia sia disabilitato durante il conto alla rovescia.
- Pausa sia disabilitato all'apertura e abilitato durante il conteggio.
- Dopo un clic su Pausa, il tempo resti fermo e Avvia torni disponibile.
- Premendo Avvia dopo una pausa, il timer continui dal valore rimasto.
- Più cicli di pausa e ripresa non accelerino il conteggio.
- Reset sia disabilitato all'apertura e abilitato dopo Avvia, anche in pausa.
- Premendo Reset durante il conteggio o in pausa, il tempo torni a `25:00` e resti fermo.
- Dopo Reset, Avvia sia disponibile e Pausa e Reset siano disabilitati.
- Avvia dopo Reset riparta da `25:00` con un solo intervallo.
- Passando il mouse su Reset abilitato, lo sfondo diventi rosso chiaro e il testo nero, senza cambiare l'opacità.
- Il messaggio di stato sia visibile prima dell'avvio e nascosto dopo il clic.
- Il messaggio di stato torni visibile dopo Reset.
- La posizione del timer e dei pulsanti resti invariata quando lo status scompare o riappare.
- Il formato mantenga due cifre per minuti e secondi.
- Dopo 25 minuti il timer torni a `25:00` e continui.

## Aggiornamento della guida

Modifica questa guida quando cambiano la struttura, i nomi degli elementi, le convenzioni
o le modalità di verifica. Per le regole di scrittura e conservazione,
consulta [Come mantenere la documentazione](documentazione.md).

