# Guida allo sviluppo di FocusX

Questa guida spiega come è organizzato il progetto e come modificarlo.
Per scaricarlo e avviarlo, parti dal [README](../README.md).

## Stato attuale

FocusX usa JavaScript: Avvia fa partire o riprende il conto alla rovescia, Pausa lo ferma
e Stop lo ferma riportando il tempo a 25 minuti.
Quando una fiammina arriva a zero, il timer passa a una pausa di 5 minuti; finita la pausa,
torna a una fiammina da 25 minuti. Ogni volta si ferma e aspetta Avvia.
La pagina Progetti consente di creare ed eliminare progetti con nome e colore, salvati nel browser.
La pagina Obiettivi consente di creare obiettivi legati a un progetto e di cambiarne lo stato.
Non c'è ancora una suite di test automatici nel repository.

## Responsabilità dei file

| File | Responsabilità |
| --- | --- |
| [index.html](../index.html) | Contenuti, struttura della pagina, pulsanti e attributi di accessibilità. |
| [css/styles.css](../css/styles.css) | Font, colori, layout, stati visivi e regole per gli schermi piccoli. |
| [js/archivio.js](../js/archivio.js) | Modulo comune: chiavi di `localStorage` e `leggiElenco`. |
| [js/fiammine.js](../js/fiammine.js) | Modulo comune: valore e limiti delle fiammine, `formattaMinuti`, `formattaTempo`, `disegnaFiammine`, `mostraTempo`. |
| [js/timer.js](../js/timer.js) | Comportamento del timer nella pagina principale. |
| [js/timer-salvato.js](../js/timer-salvato.js) | Modulo comune: `durataDi`, `leggiTimer`, `scriviTimer`, `calcolaSecondiRimanenti`, `secondiNonAnnunciati`. |
| [js/impostazioni-salvate.js](../js/impostazioni-salvate.js) | Modulo comune: `limitiFiammina`, `limitiPausa`, `eventoImpostazioni`, `leggiImpostazioni`, `scriviImpostazioni`. |
| [js/impostazioni.js](../js/impostazioni.js) | Finestra delle impostazioni, su tutte le pagine. |
| [js/home-obiettivo.js](../js/home-obiettivo.js) | Blocco dell'obiettivo scelto sopra il timer, nella pagina principale. |
| [js/menu.js](../js/menu.js) | Apertura e chiusura del menu, condivise da tutte le pagine. |
| [progetti.html](../progetti.html) | Pagina Progetti, modulo, lista e modello di una voce. |
| [js/progetti.js](../js/progetti.js) | Creazione, modifica, eliminazione, visualizzazione e salvataggio locale dei progetti. |
| [obiettivi.html](../obiettivi.html) | Pagina Obiettivi, modulo con le fiammine, lista e modello di una voce. |
| [js/obiettivi.js](../js/obiettivi.js) | Creazione, modifica, stati, visualizzazione e salvataggio locale degli obiettivi. |
| [js/calendario.js](../js/calendario.js) | Calendario della data prevista nel modulo degli obiettivi: `apriCalendario`, `chiudiCalendario`, `scriviData`. |
| [js/scelta-progetto.js](../js/scelta-progetto.js) | Elenco per scegliere il progetto nel modulo degli obiettivi: `riempiProgetti`, `scriviProgetto`, `apriProgetti`, `chiudiProgetti`. |
| [focusx-mark.svg](../assets/focusx-mark.svg) | Logo vettoriale compatto con fiamma bianca e occhi neri inclinati e concentrati. |
| [ADLaMDisplay-Regular.ttf](../assets/fonts/ADLaMDisplay-Regular.ttf) | Font usato per il nome dell'app e le voci del menu. |
| [ADLaMDisplay-OFL.txt](../assets/fonts/ADLaMDisplay-OFL.txt) | Licenza del font. |

Il browser legge `index.html`, carica il foglio CSS e il file JavaScript collegati
e mostra la pagina. Tutti i file JavaScript sono caricati come moduli, con
`<script type="module">`: ogni modulo ha i suoi nomi privati, quindi due file della stessa
pagina possono usare lo stesso nome senza scontrarsi, e parte dopo che l'HTML è stato letto,
come con `defer`. Il codice usato da più pagine sta in moduli comuni, `js/archivio.js`
e `js/fiammine.js`: lo esportano con `export` e le pagine lo prendono con `import`.
Anche negli `import` il percorso ha `?v=`, uguale in tutti i file che importano lo stesso
modulo: con due versioni diverse il browser lo caricherebbe due volte.
I moduli funzionano solo da un server, come `python -m http.server`, non aprendo il file
con un doppio clic.

Le pagine HTML restano nella cartella principale, così i loro indirizzi non cambiano;
il CSS sta in `css/`, il JavaScript in `js/`, logo e font in `assets/`.
Dentro il CSS i percorsi partono dalla cartella del file CSS: per questo il font
si raggiunge con `../assets/fonts/`.
Il tag `title` imposta il nome della scheda del browser: «Home» per il timer, «Progetti» per i progetti.

## Struttura HTML

L'intestazione `header` contiene, nell'ordine, il pulsante Menu, il logo e il titolo principale `h1`.
Il pannello `nav`, dentro l'header, contiene le cinque voci della navigazione.
Ogni `li` contiene un `button.menu-option` con un'icona SVG decorativa e uno `span` con il testo.
Le voci Home, Progetti e Obiettivi usano invece un `a.menu-option` con `href="index.html"`,
`href="progetti.html"` e `href="obiettivi.html"` per navigare; nella pagina aperta la voce ha `aria-current="page"`. Il nome FocusX e il logo sono link a `index.html`; il link del logo ha `tabindex="-1"` e
`aria-hidden="true"`, così tastiera e lettori di schermo trovano un solo link, quello del nome.
Nel `head`, un `link` con `rel="icon"` riutilizza il logo SVG come favicon della scheda.
Il contenuto `main` contiene una `section` chiamata «Timer Pomodoro» tramite `aria-label`.
All'interno della sezione si trovano il tempo e il gruppo dei pulsanti.

Gli identificatori da conoscere sono:

| Selettore | Elemento | Uso nel progetto |
| --- | --- | --- |
| `#menu-button` | Pulsante Menu | Collega il clic al cambio di stato dell'icona e del pannello. |
| `#sidebar-menu` | Pannello laterale | Contiene le voci Home, Progetti, Obiettivi, Statistica e Impostazioni. |
| `.menu-icon` | Icone delle voci | Casa, cartella, bersaglio, grafico a barre e ingranaggio delle impostazioni. |
| `.menu-option` | Pulsanti delle voci | Feedback di hover e pressione, utilizzabile anche con la tastiera. |
| `.brand-logo` | Immagine del logo | Dimensione e comportamento del logo nell'intestazione. |
| `#timer` | Paragrafo con `25:00` | Visualizzazione del tempo, aggiornata da JavaScript. |
| `.timer-controls` | Contenitore dei pulsanti | Disposizione dei controlli con Flexbox. |
| `#start-button` | Pulsante Avvia | Collegato ad avviaTimer; disponibile quando il timer è fermo. |
| `#pause-button` | Pulsante Pausa | Collegato a pausaTimer; disponibile durante il conteggio. |
| `#stop-button` | Pulsante Stop | Collegato a fermaSessione; disponibile dopo l'avvio, anche in pausa. |

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
8. La media query `max-width: 480px` adatta gli spazi e i pulsanti ai viewport fino a 480 pixel CSS.
9. L'ultima regola, `prefers-reduced-motion: reduce`, disattiva transizioni e animazioni
   delle rifiniture: è in fondo al file per prevalere sulle regole scritte prima.

Per cambiare la palette, parti dalle variabili in `:root`:

| Variabile | Uso |
| --- | --- |
| `--background` | Sfondo principale. |
| `--surface` | Sfondo del pannello laterale. |
| `--text` | Testo principale e sfondo del pulsante Avvia. |
| `--muted` | Testo secondario. |
| `--border` | Bordi dei pulsanti. |
| `--hover` | Sfondo comune al passaggio del mouse. |
| `--danger` | Sfondo rosso chiaro al passaggio del mouse su Stop, con la stessa opacità dello sfondo comune. |
| `--border-strong` | Bordo dei campi di testo al passaggio del mouse. |
| `--transition-fast` | Durata comune (180 millisecondi) dei cambi di colore, bordo, opacità e pressione. |
| `--ease-out` | Curva di accelerazione degli elementi che entrano: veloce all'inizio, lenta alla fine. |
| `--break` | Lilla della pausa tra le fiammine: scritta «Pausa», anello, cifre e Avvia. |

`--header-height` riserva lo spazio sopra le voci del pannello: 100 pixel
su desktop e 92 su mobile, più 12 pixel di separazione. Se cambi altezza del logo, del pulsante Menu o padding
verticale dell'header, aggiorna anche questa variabile.

Grid organizza la pagina in intestazione e contenuto e centra la sezione del timer.
Flexbox dispone il marchio e il gruppo dei pulsanti.
`clamp()` adatta la dimensione delle cifre alla larghezza del viewport entro due limiti.
I commenti in `css/styles.css` spiegano ogni dichiarazione e le unità utilizzate.

## Rifiniture visive in CSS

Queste rifiniture sono scritte soltanto in `css/styles.css`: non cambiano il comportamento
e non richiedono JavaScript. Dove serve conoscere lo stato, il CSS lo legge dall'HTML
con [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has).

| Rifinitura | Come funziona |
| --- | --- |
| Transizioni dei pulsanti | `button` anima colore, bordo, opacità e `transform` in `--transition-fast`. |
| Pressione | `button:active` riduce il pulsante al 94% (97% per i pulsanti dei progetti); il Menu è escluso. |
| Hover solo con puntatore | Gli hover sono dentro `@media (hover: hover)`: su touch l'evidenziazione non resta dopo il tocco. |
| Cifre grigie in pausa | `#timer-section[data-conteggio="sospeso"] #timer` usa `--muted`; `data-conteggio` lo scrive `aggiornaPulsanti()`. |
| Fiammina e pausa | `#timer-section[data-modalita="pausa"]` colora di `--break` la scritta «Pausa», l'anello, le cifre e Avvia, mostra l'icona «salta» su Stop e attenua `.home-goal`. |
| Velo dietro il menu | `body::after` copre la pagina sotto l'header con opacità 0.6 quando il pannello ha `is-open`. |
| Ingresso delle voci | Le `li` del menu entrano da sinistra con ritardi da 80 a 240 millisecondi. |
| Pagina corrente | La voce con `aria-current="page"` ha lo sfondo `--hover`; 8px separano le voci. |
| Ingresso dei contenuti | L'animazione `compari` fa salire di 8 pixel la sezione, il modulo e il progetto appena creato (`li.is-new`). |
| Cambio di pagina | `@view-transition` chiede una dissolvenza di 200 millisecondi fra Timer e Progetti. |
| Selezione e barre | `::selection` inverte bianco e nero; `scrollbar-color` scurisce le barre di scorrimento. |

Il velo ha `pointer-events: none`: un clic fuori dal menu raggiunge l'elemento sottostante,
come prima. `@view-transition` e `:has()` sono miglioramenti progressivi: un browser che non
li supporta mostra la pagina senza queste rifiniture. Se aggiungi una voce al menu,
aggiungi anche il suo `transition-delay`. Lo stato «in pausa» dipende dagli attributi
`disabled` di Avvia e Stop: se cambi la tabella degli stati, aggiorna anche quel selettore.
Il `meta` `theme-color` nei tre file HTML colora la barra del browser su mobile con lo stesso
grigio scuro della pagina (`#141414`): se cambi `--background`, aggiorna anche lui.

I colori di base sono variabili in `:root`. Lo sfondo non è il nero puro: `--background` è
`#141414`, in stile Notion (che usa `#191919`), e le schede (`--surface`) sono `#1f1f1f`, un gradino
più chiare, con `--hover` a `#2a2a2a` e il testo `--text` a `#ededed`. È la stessa idea di Linear,
Vercel e Notion: un grigio scuro abbaglia meno accanto al testo chiaro (il contrasto testo/sfondo resta circa 15:1,
ben sopra il 4,5:1 richiesto) e la differenza fra pagina e schede si vede anche senza bordi.
I pulsanti rotondi e i campi usano `--background`, quindi dentro le schede sembrano «scavati»,
un gradino più scuri.

## Primo passo JavaScript

Il tempo viene conservato come un numero di secondi, non come il testo mostrato nella pagina.
Il timer alterna due modalità, salvate in `modalita`: `"fiammina"` e `"pausa"`.
`durataDi(modalita)` restituisce la durata di una nuova sessione, in secondi, leggendo le
durate scelte nelle Impostazioni: `minutiPerFiammina * 60` (1500 secondi con 25 minuti) oppure
`leggiImpostazioni().minutiPausa * 60` (300 secondi con 5 minuti). Ogni sessione ricorda la sua
durata in `durataSessione`, salvata come `durata`: cambiando le Impostazioni a sessione avviata,
quella sessione finisce con la sua durata e la nuova vale dalla successiva.

Quando una fiammina arriva a zero, `finisciSessione()` chiama `impostaModalita("pausa")`:
il timer va a 05:00, fermo, e la pausa parte solo con Avvia. Poi annuncia `"sessione-finita"`.
Quando arriva a zero la pausa, `impostaModalita("fiammina")` riporta a 25:00, fermo.
Stop (`fermaSessione()`) chiama sempre `impostaModalita("fiammina")`: in una fiammina la chiude,
in pausa la salta. In pausa Stop è disponibile anche prima di Avvia e si chiama «Salta la pausa».
Durante la pausa `annunciaSecondiLavorati()` esce subito: nessun secondo va all'obiettivo.
`mostraModalita()` scrive `data-modalita` sulla sezione `#timer-section` e il testo dell'etichetta
`#timer-mode` («Fiammina» o «Pausa», annunciato dai lettori di schermo con `aria-live="polite"`).
Si vede scritto solo «Pausa»: nella fiammina l'etichetta riceve la classe `.solo-lettori`.

Intorno alle cifre c'è l'anello `.timer-ring`: un `svg` con due cerchi, il binario grigio e
`#timer-ring-progress`, che ha `pathLength="100"`, così la sua lunghezza vale 100 qualunque sia la
misura vera. `aggiornaTimer()` calcola `consumato = 1 - secondiRimanenti / durataSessione` (da 0 a 1)
e lo scrive nella variabile `--consumato` del cerchio; il CSS usa `stroke-dasharray: 100` e
`stroke-dashoffset: calc(var(--consumato) * -100)`, quindi con 0,4 i primi 40 centesimi dall'alto,
in senso orario, restano vuoti. L'svg è ruotato di -90° perché un cerchio parte dalle 3, e la
transizione da 250ms segue i controlli del timer. Il colore segue `data-conteggio` e `data-modalita`:
grigio (`--border-strong`) da fermo; con Avvia, `data-conteggio="attivo"`, si accende di arancione
(lilla in pausa) con una transizione di 500ms; grigio chiaro (`--muted`) se è sospeso. L'obiettivo in corso
usa lo stesso arancione: `--goal-progress` vale `var(--flame)`, così «sto lavorando» ha un solo colore.

Mentre è in corso, la pillola `.home-goal` ha un bordo di 2px trasparente e due sfondi: sopra un
`linear-gradient` del colore `--sfondo-pillola`, solo nell'interno (`padding-box`), sotto un
`conic-gradient` che copre anche il bordo (`border-box`) e quindi si vede solo lì. Il gradiente è
arancione tenue quasi ovunque e pieno a 315°: una scia, come una cometa. `@keyframes giro-luce`
porta `--giro` da 0° a 360° in 3 secondi, e `from var(--giro)` fa ruotare il gradiente. Per animare
una variabile serve `@property --giro` con `syntax: "<angle>"`: senza, il browser la cambierebbe
di colpo. Il passaggio del mouse cambia `--sfondo-pillola` invece di `background-color`, così vale
anche con i due sfondi. Con `prefers-reduced-motion` la luce non gira e il bordo resta arancione pieno.
L'anello misura `2.9em` del font del timer (`clamp(4.5rem, 23vw, 7.5rem)`), quindi cresce e
rimpicciolisce con le cifre; `aspect-ratio: 1` lo fa quadrato.

Durante la pausa avviata (`data-conteggio="attivo"` e `data-modalita="pausa"`) dietro alle cifre
respira un alone lilla: è `.timer-ring::before`, un cerchio con `radial-gradient` invisibile di base,
che `@keyframes respira` fa crescere e schiarire in 4 secondi e tornare indietro in altri 4.
`isolation: isolate` sull'anello e `z-index: -1` sull'alone lo tengono dietro alle cifre ma dentro
l'anello. Con `prefers-reduced-motion` l'animazione è tolta e l'alone non compare.

Il timer non conta togliendo un secondo alla volta, ma guardando l'orologio. Avvia salva in
`fineSessione` l'ora in cui la sessione finirà, `Date.now() + secondiRimanenti * 1000`, in
millisecondi. Mentre conta, `calcolaSecondiRimanenti()` ricava i secondi che mancano con
`Math.ceil((fineSessione - Date.now()) / 1000)`: il risultato è giusto anche se il browser
ritarda l'intervallo, in una scheda in background, dopo una ricarica o un cambio di pagina.
`fineSessione` vale `null` quando il timer è fermo: in pausa `secondiRimanenti` resta fisso,
ed è da lì che Avvia ricalcola la nuova fine.

I cinque valori del timer (`modalita`, `fineSessione`, `secondiRimanenti`, `sessioneAvviata`,
`secondiAnnunciati`) sono salvati in `localStorage` con la chiave `focusx.timer.v1`
(`chiaveTimer`, da `js/archivio.js`) a ogni cambiamento, con `salvaTimer()`. All'apertura
della Home `caricaTimer()` li rilegge. Lettura, controllo e scrittura stanno nel modulo comune
`js/timer-salvato.js` (`leggiTimer`, `scriviTimer`), insieme alle durate e a
`calcolaSecondiRimanenti(fine)`, perché li usa anche la pagina Obiettivi: `leggiTimer()`
controlla ogni campo e, se qualcosa manca o non è valido, restituisce una fiammina ferma a 25:00.
Un timer salvato prima della pausa non ha `modalita`: `dati?.modalita ?? "fiammina"` lo legge
come una fiammina. Allo stesso modo, uno salvato prima delle Impostazioni non ha `durata`:
`dati?.durata ?? durataDi(modalita)` gli dà quella attuale. `rimanenti` e `annunciati` si
controllano rispetto a `durata`, la durata della sessione salvata.

| Funzione | Responsabilità |
| --- | --- |
| `avviaTimer()` | Calcola `fineSessione`, segna la sessione come avviata, salva e fa partire l'intervallo. |
| `pausaTimer()` | Ricalcola i secondi rimasti, annuncia quelli lavorati, ferma l'intervallo e mette `fineSessione` a `null`. |
| `fermaSessione()` | Stop: richiama `pausaTimer()`, poi `impostaModalita("fiammina")`. |
| `finisciSessione()` | A zero: dopo una fiammina passa alla pausa e annuncia `"sessione-finita"`; dopo la pausa torna alla fiammina. |
| `impostaModalita(nuova)` | Prepara una sessione nuova, ferma e piena, nella modalità indicata. |
| `mostraModalita()` | Scrive `data-modalita`, il testo dell'etichetta e il nome di Stop. |
| `aggiornaConteggio()` | Ricalcola i secondi dall'orologio, aggiorna il testo, annuncia i secondi lavorati; a zero chiude la sessione. |
| `annunciaSecondiLavorati()` | Fa scattare `"secondi-lavorati"` con i secondi trascorsi non ancora annunciati. |
| `aggiornaPulsanti()` | Abilita e disabilita Avvia, Pausa e Stop secondo lo stato e scrive `data-conteggio`. |
| `aggiornaTimer()` | Converte i secondi rimanenti nel formato minuti:secondi. |

`setInterval(aggiornaConteggio, 250)` guarda l'orologio quattro volte al secondo, così il numero
cambia appena scatta il secondo. `clearInterval(intervalloTimer)` lo ferma con Pausa e Stop.

| Stato | Avvia | Pausa | Stop |
| --- | --- | --- | --- |
| Prima del primo avvio | Disponibile | Disabilitato | Disabilitato |
| Conteggio in corso | Disabilitato | Disponibile | Disponibile |
| Timer in pausa dopo l'avvio | Disponibile | Disabilitato | Disponibile |
| Dopo Stop | Disponibile | Disabilitato | Disabilitato |
| Pausa tra fiammine, prima di Avvia | Disponibile | Disabilitato | Disponibile («Salta la pausa») |

Il timer conta quando `fineSessione` non è `null`; Stop è disponibile finché `sessioneAvviata`
è vero, anche in pausa, e sempre durante la pausa tra fiammine.

Per visualizzare il tempo, `Math.floor()` ricava i minuti interi e `%` ricava i secondi restanti.
`String()` converte i numeri in testo e `padStart(2, "0")` mantiene due cifre.
Infine `textContent` aggiorna il paragrafo del timer.

I secondi lavorati passano all'obiettivo con un evento. `secondiAnnunciati` ricorda quanti
secondi della sessione sono già stati annunciati: `annunciaSecondiLavorati()` calcola i secondi
trascorsi (`durataDi(modalita) - secondiRimanenti`), toglie quelli già annunciati e fa scattare
`new CustomEvent("secondi-lavorati", { detail: secondiNuovi })`. Di solito `detail` vale 1;
tornando da un'altra pagina vale tutti i secondi passati via. Quando i secondi arrivano a zero,
`aggiornaConteggio()` annuncia prima gli ultimi secondi, così l'obiettivo riceve tutti i 25 minuti,
poi chiama `finisciSessione()`.

All'apertura della pagina `js/timer.js` rimette subito testo e pulsanti come erano, così
`js/home-obiettivo.js`, che parte dopo, sa se il timer sta contando. Il conteggio riprende invece
a `DOMContentLoaded`, che scatta dopo che tutti i moduli sono partiti: a quel punto
`js/home-obiettivo.js` ascolta già `"secondi-lavorati"` e riceve il tempo passato altrove.
Se la sessione è finita nel frattempo, `aggiornaConteggio()` la chiude subito.
Vedi [Date.now su MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now),
[CustomEvent su MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent),
[setInterval su MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
e [padStart su MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart).

## Menu laterale e icona hamburger

L'icona riprende i sei tracciati SVG e le transizioni dei file `hamburgermenu.html`
e `hamburgermenu.css` forniti come riferimento. È integrata in un `button` nell'header.
I selettori CSS sono limitati a `#menu-button`, così non modificano il logo,
le icone del timer o lo sfondo della pagina.

Il pannello riprende lo scorrimento da sinistra del riferimento
[Pure CSS Sidebar Toggle Menu](https://codepen.io/plavookac/pen/qomrMw),
adattato al tema nero e bianco. Su desktop è largo 250 pixel, inizia dal bordo superiore e usa
`position: fixed`, quindi non sposta il timer. `translateX(-100%)` lo porta fuori
dalla finestra; la classe `is-open` lo riporta a `translateX(0)` in 250 millisecondi.
`visibility` lo nasconde dopo l'animazione di chiusura.

Il pannello è dentro l'header: il suo `z-index: 1` lo sovrappone a logo e titolo,
mentre il pulsante Menu ha `position: relative` e `z-index: 2` per restare sopra.
Quando è attivo, il pulsante usa lo stesso sfondo del pannello anche in hover.
Le voci non hanno bordi divisori; il padding superiore le separa dalla X.
Su desktop i pulsanti delle voci usano una griglia con due colonne laterali uguali da 22 pixel: quella
sinistra ospita l'icona e quella destra resta vuota, mantenendo il testo al centro
del pannello. Il font ADLaM Display riprende quello del titolo.

Fino a 480 pixel di larghezza, il pannello occupa tutta la finestra. La lista usa
Flexbox per centrare verticalmente il gruppo nello spazio sotto la X; ogni
pulsante centra insieme icona e testo con `justify-content: center`.
Su mobile il testo usa `1.375rem` (22 pixel con la dimensione di base a 16), le icone
misurano 26 pixel e le voci sono separate da 16 pixel. Il padding inferiore della
lista è di 88 pixel: aumenta lo spazio sotto il gruppo e lo colloca leggermente più in alto.
Il pannello può scorrere se la finestra è troppo bassa per mostrare tutte le voci.

Su dispositivi con `hover: hover`, il puntatore mostra uno sfondo grigio e solleva
la voce di 2 pixel. Durante la pressione, `:active` la riduce al 96%; al rilascio
torna alla dimensione normale grazie a una transizione di 180 millisecondi.
Questi effetti sono CSS e non richiedono nuovo JavaScript.
Con `prefers-reduced-motion: reduce` restano solo i cambi di colore.
Riferimenti: [hover](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover)
e [:active](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:active) su MDN.

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
Home, Progetti e Obiettivi sono collegamenti alle loro pagine; le altre due voci sono pulsanti
con solo feedback visivo, in attesa delle rispettive sezioni.

## Prima versione dei progetti

`progetti.html` carica `js/menu.js` e `js/progetti.js`, mentre `index.html` carica
`js/menu.js` e `js/timer.js`. Non carichiamo il timer dove i suoi elementi non sono presenti.
L'header è attualmente ripetuto nei tre file HTML: quando lo modifichi, aggiornali tutti.

Il pulsante Crea progetto mostra `#project-form`, una barra di una riga con le stesse classi
di quella degli obiettivi (`.goal-bar`, `.goal-bar-row`, `.goal-bar-actions`), più `.project-bar`
per le differenze su telefono: icona (+ o matita, con `data-modo`), nome, colori, Salva e la X.
Etichette, legenda e titolo hanno la classe `.solo-lettori`. Il campo `#project-name` è
obbligatorio e ammette al massimo 80 caratteri. L'evento `submit` (anche Invio nel nome) chiama
`inviaModuloProgetto(evento)`: `preventDefault()` evita la ricarica e `trim()` rimuove gli spazi
alle estremità. Un nome composto solo da spazi viene rifiutato. Dopo `creaProgetto` la barra resta
aperta: `reset()` svuota il nome e riporta il colore al bianco, e `segnaColoriUsati()` mette il
puntino sul colore appena usato. La X e Esc chiamano `annullaModulo()`. `chiudiModuloConEsc` è un
ascoltatore sul form: se la finestrella degli altri colori è aperta (`:popover-open`), non fa
niente, e Esc chiude solo quella, perché i popover si chiudono da soli con Esc.

Accanto al nome, il `fieldset.project-colors` contiene dodici `input type="radio"` con
`name="colore"`: avendo lo stesso `name`, se ne può selezionare uno solo, anche con le frecce.
Il `value` di ciascuno è il colore esadecimale salvato; `aria-label` e `title` ne danno il nome.
Il CSS toglie il pallino nativo con `appearance: none` e colora ogni cerchio con la variabile
`--swatch`, scritta nell'attributo `style`. Il radio `:checked` ha un doppio anello.
Il bianco ha `checked` nell'HTML: è il colore predefinito, che `reset()` ripristina.
Per aggiungere un colore basta un nuovo radio con `value` e `--swatch` uguali.

Il tredicesimo cerchio, `#more-colors-button`, mostra un + e apre `#more-colors`
tramite l'attributo [`popovertarget`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover):
il browser gestisce apertura, chiusura con Esc o clic fuori e ritorno del focus.
La finestrella contiene altri dodici radio con lo stesso `name="colore"`, quindi la scelta
resta una sola e `inviaModuloProgetto` legge il colore sempre da `elements.colore.value`.
All'evento `change` della finestrella, `scegliAltroColore(evento)` scrive il colore scelto
nella variabile `--swatch` del pulsante + e chiude la finestrella con `hidePopover()`.
Con `:has()` il CSS colora il + e gli dà il doppio anello solo se è selezionato un colore
della finestrella; dopo `reset()` torna un + tratteggiato.
Tutti i colori hanno un contrasto di circa 4,5:1 o più con lo sfondo delle schede.

All'apertura del modulo, `segnaColoriUsati()` raccoglie con `filter` e `map` i colori
degli altri progetti (escluso quello in modifica)
e, con `includes`, dà la classe `is-used` ai cerchi di quei colori. Il CSS disegna
un puntino scuro al centro con `radial-gradient`; il colore resta selezionabile.
L'`aria-label` diventa, per esempio, «Azzurro, già usato», mentre `title` resta il nome.

Il nuovo progetto va in cima all'elenco: `creaProgetto` crea `[nuovoProgetto, ...progetti]`.
Un progetto ha la forma `{ id, nome, colore }`. L'id viene generato con
[`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)
e servirà a collegare gli obiettivi; il nome può coincidere con quello di un altro progetto.
`mostraProgetti(idNuovo)` ricostruisce `#project-list` copiando il `li` del
`template#project-item-template` e usando `textContent`, così i nomi sono testo e non HTML
da eseguire. Solo la voce con `idNuovo` riceve la classe `is-new` e compare con l'animazione.
La cartella `.project-icon` a sinistra del nome riceve il colore con `style.color`
e l'SVG lo usa tramite `fill: currentColor`.

Ogni voce ha a destra un pulsante `.project-delete` con l'icona del cestino:
il suo `aria-label` contiene il nome del progetto. Il clic chiama `eliminaProgetto(id)`,
che salva l'elenco senza quel progetto e lo ricostruisce. Il focus passa al cestino
della voce successiva, o a Crea progetto quando l'elenco è vuoto. Al passaggio del mouse
il pulsante usa lo stesso rosso di Stop, `--danger`. Non c'è richiesta di conferma.

Prima del cestino, il pulsante `.project-edit` con la matita chiama `apriModificaProgetto(id)`.
Lo stesso `#project-form` serve per creare e per modificare: la variabile `idInModifica`
vale `null` durante una creazione e contiene l'id del progetto durante una modifica.
`apriModificaProgetto` cambia il titolo in «Modifica progetto», `data-modo` in `"modifica"`
e il nome nascosto di Salva in «Salva le modifiche», scrive il nome nel campo e seleziona il
colore assegnando `elements.colore.value`. Poi `mettiModuloNellaVoce()` sposta la barra nella
lista, in un `li.goal-edit-slot` subito prima della voce nascosta, e `rimettiModuloAlSuoPosto()`
la riporta sopra la lista alla chiusura, come negli obiettivi. Nella lista dei progetti quel `li`
annulla bordo, sfondo e flex di `.project-list li`, altrimenti la barra starebbe in un riquadro.
Al salvataggio, `inviaModuloProgetto` controlla il nome e chiama `creaProgetto(nome, colore)`
oppure `modificaProgetto(id, nome, colore)`. Quest'ultima usa `map` per creare un nuovo elenco
in cui solo quel progetto cambia, copiato con `{ ...progetto, nome, colore }`: l'id resta
lo stesso e le altre proprietà, come i futuri obiettivi, non vanno perse.
`chiudiModuloProgetto()` riporta il modulo alla creazione; se elimini il progetto
che stai modificando, il modulo si chiude.
Durante una modifica, il progetto non compare nell'elenco, perché è già nella barra.
Le voci sono compatte come quelle degli obiettivi: `padding: 8px`, cartella da 18px (il suo centro
cade sotto il + della barra), matita e cestino da 32px senza bordo e grigi; il cestino diventa
rosso al passaggio del mouse.
Ogni `li` ha un attributo `data-id`, scritto con `voce.dataset.id`;
`nascondiVoceInModifica()` dà `hidden` alla voce con l'id uguale a `idInModifica`.
La chiamano `apriModificaProgetto`, `chiudiModuloProgetto` e `mostraProgetti`,
così la voce resta nascosta anche quando l'elenco viene ricostruito.

Due progetti non possono avere lo stesso nome e lo stesso colore. `esisteDoppione(nome, colore)`
usa `some` sugli altri progetti (quello in modifica è escluso) e confronta i nomi con
`trim().toLowerCase()`, così «Studio» e « studio» contano come uguali. `controllaDoppione()`
disattiva `#save-project-button` e mostra `#project-duplicate-warning`; la chiamano l'evento
`input` del modulo, che risale dal nome e da tutti i radio dei colori, e le funzioni che aprono
e chiudono il modulo, perché scrivere `value` da JavaScript non genera eventi.
`inviaModuloProgetto` ripete il controllo prima di salvare.

`caricaProgetti()` e `salvaProgetti(elenco)` concentrano l'accesso a
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
con chiave `focusx.progetti.v1`. `JSON.parse` legge l'array salvato e `JSON.stringify`
lo converte in testo. Il nuovo progetto compare solo dopo un salvataggio riuscito.
Se l'archivio non è leggibile, la creazione viene disabilitata per non sovrascriverlo;
se il salvataggio fallisce, il modulo mantiene il nome e mostra un messaggio.
Creare, modificare o eliminare un progetto o un obiettivo non mostra conferme: il risultato
si vede già nella lista. Il paragrafo `#projects-message` (e `#goals-message` nella pagina
Obiettivi) resta vuoto e si riempie solo con gli errori di lettura o salvataggio.
Queste funzioni potranno essere adattate alle richieste verso un futuro backend.

Il cambio di pagina non interrompe il timer: tornando a `index.html` riprende dal tempo giusto.

## Prima versione degli obiettivi

`obiettivi.html` carica `js/menu.js` e `js/obiettivi.js` e riutilizza le classi di layout,
modulo e pulsanti della pagina Progetti (`.projects-section`, `.project-form`, `.project-action`,
`.project-item-action`), così le due pagine restano coerenti.
Anche qui il modulo è una barra di una riga, come nella pagina Progetti (vedi sotto).

Un obiettivo ha la forma `{ id, nome, progettoId, data, fiammine, stato, minutiLavorati }` ed è salvato
con la chiave `focusx.obiettivi.v1`. Del progetto salva solo l'id: nome e colore si leggono
da `focusx.progetti.v1` a ogni visualizzazione, quindi restano aggiornati se il progetto cambia.
Se il progetto non esiste più, la voce mostra «Progetto eliminato».
Senza progetti, il pulsante Crea obiettivo è nascosto e un avviso porta alla pagina Progetti.

Il modulo dell'obiettivo è una barra, `form.project-form.goal-bar`, con una riga `.goal-bar-row`:
un'icona (il + o la matita, scelta dal CSS con `data-modo="nuovo"` o `"modifica"`), il nome
senza bordo che prende lo spazio libero, il tempo previsto («1 h 15 min») e le fiammine, la data,
la cartella del progetto e, dopo una riga sottile, le azioni: cestino (solo in modifica), Salva
(il pulsante di invio, quindi anche Invio nel nome) e la X. Etichette e titolo ci sono ancora,
ma con la classe `.solo-lettori`: invisibili, letti dai lettori di schermo. Il bordo della barra
si schiarisce con `:focus-within`, quando il focus è su un suo elemento. `aggiornaSegnaposto()`
scrive nel nome «Aggiungi un obiettivo a "Matematica"» a ogni cambio
di progetto. `apriModuloObiettivo` sceglie il primo progetto e la data di oggi; dopo
`creaObiettivo` la barra resta aperta, con il nome vuoto e una fiammina, per aggiungerne un altro.
Esc la chiude con `chiudiModuloConEsc`, un ascoltatore sul form: parte prima di quelli sul
documento, quindi vede ancora aperte le finestrelle di calendario, progetti e fiammine, e in quel
caso lascia che Esc chiuda solo quelle. Sotto i 480px la barra va su tre righe: nome; fiammine
e tempo; data, progetto e azioni.

Le fiammine sono cinque radio `name="fiammine"`, più la sesta (vedi sotto). Ogni radio è dentro un `label.flame-option` con un'icona
`<use href="#flame-icon">`, che richiama un unico `symbol` definito all'inizio del `body`.
Il radio è invisibile ma resta usabile con Tab e frecce; il CSS spegne le fiammine dopo quella
scelta con `.flame-option:has(input:checked) ~ .flame-option`. `minutiPerFiammina`, in `js/fiammine.js`, vale 25:
`formattaTempo(fiammine)` scrive il totale, per esempio «2 h 5 min», nell'`output` prima
delle fiammine (con «3 fiammine · 1 h 15 min» nel suo `title`) e nelle voci. L'`output` sta a
sinistra apposta: quando il testo si allunga (da «50 min» a «1 h 15 min») cresce verso il nome,
e le fiammine non si spostano sotto il mouse.

Per la data prevista, il campo data del browser (`input type="date"`) ha un calendario che
il CSS non può cambiare.
Al suo posto c'è `#goal-date-picker`, gestito da `js/calendario.js`: un pulsante
`#goal-date-button`, che mostra la data scelta, e un campo nascosto `#goal-date`, che ne tiene
il valore nel formato `2026-10-19`, lo stesso salvato negli obiettivi. Un campo nascosto non
può essere `required`: `inviaModuloObiettivo` controlla `campoData.value === ""` e, se manca,
apre il calendario. `form.reset()` non svuota un campo nascosto, quindi `chiudiModuloObiettivo`
chiama `scriviData("")`; `apriModificaObiettivo` chiama `scriviData(obiettivo.data)`.

La finestrella `#goal-date-panel` ha il mese, i giorni della settimana dal lunedì e la griglia
`#goal-date-days`, che `disegnaMese` riempie a ogni cambio: `giorniDelMese(anno, mese)` dice
quante caselle vuote vanno prima del giorno 1 e quanti giorni ha il mese. Ogni giorno è un
pulsante con `data-data`, `aria-pressed` (il giorno scelto) e `aria-current="date"` (oggi),
che il CSS colora. Solo un giorno ha `tabIndex = 0`: gli altri si raggiungono con le frecce
(`spostaFocus`), e `new Date(anno, mese, giorno + passo)` passa da solo al mese vicino.
Il cambio di mese fa scorrere i giorni con `element.animate()`, saltato se il sistema chiede
meno animazioni (`prefers-reduced-motion`).

Anche il progetto non usa il menu a tendina del browser (`select`): il suo elenco non si può
adattare allo stile del sito e le sue voci possono contenere solo testo. Al suo posto c'è
`#goal-project-picker`, gestito da `js/scelta-progetto.js` con lo stesso schema del calendario:
un pulsante `#goal-project-button` (solo la cartella colorata: il nome è `.solo-lettori` e nel
`title`), un campo nascosto
`#goal-project` con l'id del progetto scelto e un elenco `#goal-project-list` (`role="listbox"`).
`apriModuloObiettivo` chiama `riempiProgetti(progetti)`, che crea una voce per progetto dal
`<template id="goal-project-option-template">` e sceglie il primo; `apriModificaObiettivo` chiama
`scriviProgetto(obiettivo.progettoId)`, che con un progetto eliminato svuota il campo e mostra
«Scegli un progetto». Al salvataggio, senza progetto si apre l'elenco. Ogni voce è un pulsante
`role="option"` con `aria-selected`, che il CSS mostra con la spunta. Scrivere `value` da
JavaScript non genera eventi: a ogni scelta il modulo fa partire `input`, che risale al form e
richiama `controllaDoppione`. Sul campo chiuso le frecce aprono l'elenco; dentro, frecce, Home e
Fine si muovono fra le voci.

Oltre le prime cinque fiammine (`fiammineVisibili`, in `js/fiammine.js`), la sesta `#goal-flames-more`
è un radio come le altre, ma il suo `value` cambia: è il numero scelto, da 6 a `fiammineMassime`, quindi
`elements.fiammine.value` funziona senza casi speciali. Il clic la seleziona e apre o chiude
`#goal-flames-panel`, una finestrella con `−`, il numero con la sua icona e `+`.
Il numero è un campo di testo, `#goal-flames-number` (`inputmode="numeric"`, non `type="number"`,
così il browser non blocca mai l'invio del modulo). Aprendo la finestrella con il mouse
(`evento.detail > 0`) il campo riceve il focus con il numero selezionato, pronto da riscrivere.
`scriviNumeroFiammine()` toglie i caratteri non numerici con `replace(/\D/g, "")` e applica
il numero mentre si scrive, solo se è valido; `confermaNumeroFiammine()`, all'evento `change`
o con Invio, porta un numero fuori dai limiti a 6 o al massimo e un campo vuoto al valore
precedente. Invio nel campo non invia il modulo: `preventDefault()` lo ferma.
`cambiaPiuFiammine(differenza)` aggiorna il valore con `impostaPiuFiammine`, che disabilita
`−` a 6 e `+` al massimo, fa crescere l'icona con `--crescita` e le dà un guizzo con `animate()`,
saltato se `matchMedia` trova `prefers-reduced-motion`. Il segno sulla sesta diventa «+7» per 12.
Il limite è di tempo: `oreMassime`, in `js/fiammine.js`, vale 16 e `fiammineMassime` si calcola con
`Math.floor(oreMassime * 60 / minutiPerFiammina)`, cioè 38 fiammine con 25 minuti (15 h 50 min).
Le 16 ore varranno anche per il tempo trascorso, quando ci sarà lo stato «in corso».
La finestrella si chiude con Esc, con un clic fuori o scegliendo una delle prime cinque,
che riporta la sesta a 6. `reset()` non ripristina un `value` cambiato da JavaScript:
`chiudiModuloObiettivo` richiama `impostaPiuFiammine(fiammineVisibili + 1)`. Su telefono le fiammine sono da 28px
e la finestrella si apre sotto la sesta.

`mostraObiettivi(idNuovo)` copia il `template#goal-item-template`. Nella voce restano visibili
solo tante fiammine quante quelle scelte (`toggleAttribute("hidden")`, perché gli `svg` non hanno
la proprietà `hidden`). Ogni fiammina ha tre aspetti, decisi da `applicaStato` con due classi:
- vuota, se è da fare: `fill: transparent` e `stroke: currentColor`, solo il contorno arancione;
- `is-current`, la fiammina da completare quando l'obiettivo è in corso: si colora con
  `--goal-progress`, ha un riempimento leggero con `color-mix` e si anima con `@keyframes tremola`,
  che oscilla dalla base grazie a `transform-origin: 50% 90%`;
- `is-done`, se è fatta: piena, con un alone `filter: drop-shadow` dello stesso colore, senza animazione.
  È arancione sia da completato sia in corso (`--goal-progress` vale `var(--flame)`).

Oltre cinque fiammine il numero `.goal-flames-count` (🔥12) è arancione come la fiammina;
mentre l'obiettivo è in corso prende il colore di «in corso» insieme a lei, nella lista e nella pillola della Home.

Le prime `fiammineFatte` sono fatte e quella in posizione `fiammineFatte` è da completare.
`fiammineFatte` vale `Math.floor(minutiLavorati / minutiPerFiammina)`, cioè una fiammina ogni
25 minuti lavorati, senza superare le fiammine previste (`Math.min`). Vale anche da completato:
chi finisce prima del previsto vede solo le fiammine davvero lavorate.
Ogni fiammina della lista e della Home ha due `use`: il primo disegna il contorno, il secondo,
`.flame-fill`, è pieno e senza contorno. `disegnaFiammine` calcola per ogni fiammina un
`riempimento` da 0 a 1: per quella in posizione `fiammineFatte` è il tempo lavorato oltre le
fiammine fatte diviso 25 (55 minuti su 4 fiammine: 5 / 25 = 0,2); oltre cinque, per l'unica
fiammina, è il lavorato diviso il previsto. Lo scrive come variabile CSS con
`style.setProperty("--riempimento", "20%")`, e il CSS taglia `.flame-fill` dall'alto con
`clip-path: inset(calc(100% - var(--riempimento)) 0 0 0)`: resta visibile solo la parte bassa.
Nella Home, mentre si lavora, il riempimento sale a ogni secondo. Oltre cinque fiammine se ne vede una sola: è fatta solo quando lo sono
tutte, altrimenti è lei quella da completare. La data è mostrata con `formattaData`, che aggiunge `T00:00` per leggerla
come mezzanotte locale, e diventa rossa (`is-late`) se è passata e l'obiettivo non è completato:
`dataDiOggi()` produce lo stesso formato `AAAA-MM-GG`, così le date si confrontano come testo.
Se la data è proprio oggi (`obiettivo.data === dataDiOggi()`) si legge «Oggi» invece di
`formattaData`; lo stesso fa `scriviData` nel pulsante del calendario.

Gli stati sono `non-completato`, `in-corso` e `completato`, elencati nell'array `statiValidi`:
`caricaObiettivi` usa `statiValidi.includes(stato)` per controllare l'archivio. I pulsanti `.goal-start` e `.goal-complete` chiamano `cambiaStato(id, stato)`:
premere il pulsante dello stato attuale riporta l'obiettivo a `non-completato`.
Un solo obiettivo alla volta può essere in corso: nel `map` di `cambiaStato`, se il nuovo stato è
`in-corso`, l'obiettivo che lo era torna `non-completato`; poi il ciclo sulle voci richiama
`applicaStato` solo su quelle il cui `data-stato` è diverso dal nuovo stato.

`minutiLavorati` è il tempo lavorato (anche con decimali, al massimo `oreMassime * 60`).
Lo aumenta il timer della Home (vedi sotto); `creaObiettivo` lo imposta a 0 e `caricaObiettivi`
dà 0 agli obiettivi salvati prima che esistesse, con `{ minutiLavorati: 0, ...obiettivo }`.
Accanto alle fiammine `mostraTempo(contenitore, obiettivo)` scrive «lavorato / previsto», per
esempio «10 min / 1 h 15 min», nei due `span` `.goal-worked` e `.goal-planned` del contenitore.
Il lavorato usa `Math.floor`, quindi conta solo i minuti interi, e può superare il previsto:
si continua a lavorare finché non si completa. Nel CSS `.goal-worked` è chiaro, in grassetto e con
`font-variant-numeric: tabular-nums`, che dà a tutte le cifre la stessa larghezza; in corso è
arancione (`--goal-progress`). La barra e il previsto restano grigi. `applicaStato` lo riscrive
a ogni cambio di stato.
`applicaStato` disattiva il cerchio (`disabled`) quando `lavoroInsufficiente(obiettivo)`, da
`js/fiammine.js`, dice che i minuti lavorati sono meno di `minutiPerCompletare` (1 minuto)
e l'obiettivo non è completato; un obiettivo completato si può sempre riaprire. `cambiaStato` ripete il controllo.
`cambiaStato` aggiorna solo la voce interessata con `applicaStato(voce, obiettivo)`,
che scrive `data-stato` sul `li` e `aria-pressed` sui pulsanti. Il CSS legge `data-stato`:
in corso il bordo è arancione (`--goal-progress`); completato il nome viene barrato da uno sfondo che passa
da 0% a 100% di larghezza. Non c'è un'etichetta scritta dello stato: `.goal-complete` è il primo
elemento del `li`, un cerchio a sinistra del nome (`border-radius: 50%`), e `.goal-start` sta a destra.
Le voci sono compatte come la barra: `padding: 8px`, nome e dettagli a 2px l'uno dall'altro,
dettagli in `0.8125rem` con icone da 14px, cerchio da 28px (il suo centro cade sotto il + della barra)
e matita e play da 32px con angoli da 8px, come le azioni della barra. La lista ha `gap: 8px`.
Nei dettagli le fiammine stanno a 8px dal tempo, e fra tempo, data e progetto c'è un puntino grigio:
`.goal-list .goal-details > * + *::before` con `content: "·"` (`* + *` sono tutti i figli tranne
il primo). Sotto i 480px i dettagli vanno a capo, quindi il puntino sparisce (`content: none`)
e resta uno spazio di 12px.
Il cerchio è vuoto come una casella da spuntare: la spunta ha `opacity: 0` e `scale: 0.6`, e solo con
`aria-pressed="true"` diventa visibile e cresce fino a `scale: 1`. L'anello è spesso 2px e del
grigio chiaro `--muted`, così si vede subito sul fondo scuro; al passaggio del mouse diventa verde
con un velo verde al 15% (`color-mix`). Disattivato, sotto il minuto lavorato, non usa l'`opacity: 0.5`
degli altri pulsanti, che lo renderebbe quasi invisibile, ma `border-style: dashed`. La stessa regola, con
`:is(.goal-list, .home-goal)`, vale per il cerchio della Home.

La matita `.goal-edit`, discreta (grigia, senza bordo), chiama `apriModificaObiettivo(id)`: chiude
e riapre il modulo, salva l'id in `idInModifica`, compila nome, progetto, data e fiammine, cambia
il titolo in «Modifica obiettivo» e `data-modo` in `"modifica"`. Poi `mettiModuloNellaVoce()` sposta
la barra dentro la lista, subito prima della voce nascosta: un `ul` può contenere solo `li`, quindi
la barra sta in `postoModifica`, un `li.goal-edit-slot` creato una volta sola. `mostraObiettivi`
svuota la lista con `replaceChildren`, ma `postoModifica` resta in memoria e viene rimesso al suo
posto; `rimettiModuloAlSuoPosto()`, chiamata da `chiudiModuloObiettivo`, riporta la barra sopra la
lista con `insertBefore` (il posto è ricordato in `casaDelModulo` e `dopoIlModulo`).
Fino a 5 fiammine basta `elements.fiammine.value = String(n)`; oltre, si seleziona la sesta e si chiama
`impostaPiuFiammine(n)`. `nascondiVoceInModifica()` nasconde la voce in modifica, anche dopo
`mostraObiettivi`. Il submit chiama `inviaModuloObiettivo`, che raccoglie i dati e sceglie fra
`creaObiettivo(dati)` e `modificaObiettivo(id, dati)`; quest'ultima usa `map` e
`{ ...obiettivo, ...dati }`, così id e stato restano gli stessi. `chiudiModuloObiettivo` riporta
`idInModifica` a `null` e il modulo alla creazione. Dopo il salvataggio, e dopo Annulla
(`annullaModulo`, con la X o con Esc), il focus torna sulla matita.
Un obiettivo in corso non si modifica: `applicaStato` disattiva la sua matita, con il title «Ferma il
timer per modificarlo», e `apriModificaObiettivo` controlla di nuovo lo stato prima di aprire la barra.
Quando il timer si ferma, l'obiettivo torna non completato e la matita si riattiva.

Per eliminare un obiettivo si apre la sua modifica: il cestino `#delete-goal-button` è `hidden` in
creazione e visibile solo in modifica, fra le azioni della barra, e rosso al passaggio del mouse.
Serve un passaggio in più rispetto a un cestino nella lista, così un clic sbagliato non
cancella niente e la scheda resta con due soli pulsanti. `eliminaObiettivo()` toglie l'obiettivo
in `idInModifica` con `filter`, salva, chiude il modulo, ridisegna la lista e sposta il focus su
Crea obiettivo.

Come per i progetti, due obiettivi dello stesso progetto non possono avere lo stesso nome.
`esisteDoppione(nome, progettoId)` usa `some` sugli altri obiettivi (quello in modifica è escluso)
e confronta i nomi con `trim().toLowerCase()`. `controllaDoppione()` disattiva `#save-goal-button`
e mostra `#goal-duplicate-warning`, che usa la stessa classe `.project-form-warning` dei progetti.
La chiamano l'evento `input` del modulo (nome e menu dei progetti) e le funzioni che aprono
e chiudono il modulo; `inviaModuloObiettivo` ripete il controllo prima di salvare.

Invio e Spazio attivano il pulsante tramite il suo comportamento HTML nativo.
La preferenza `prefers-reduced-motion` disattiva le transizioni mantenendo il cambio di stato.

## Obiettivo scelto nella Home

Sopra il timer, `#home-goal` mostra l'obiettivo su cui si lavora. Lo gestisce
`js/home-obiettivo.js`, caricato dopo `js/timer.js`. Essendo moduli, i due file possono
chiamare entrambi `pulsanteAvvia` lo stesso pulsante: i nomi di un modulo sono privati.

Il blocco è una pillola snella (`border-radius: 999px`, larga al massimo 340px) con il cerchio
`.goal-complete` a sinistra e un unico pulsante `#home-goal-picker` con nome e fiammine.
Passando il mouse sul nome diventa grigia tutta la pillola, con
`.home-goal:has(.home-goal-picker:hover)`; il cerchio resta nero, con il suo hover separato.
Aprendo la finestrella con il mouse il focus non si sposta (`evento.detail > 0`); da tastiera
va sull'obiettivo già scelto o sul primo, come per la finestrella delle fiammine. Usa le stesse classi della lista (`goal-name`, `goal-flame-icons`,
`goal-complete`) e lo stesso `<symbol id="flame-icon">`: nel CSS gli stati condivisi sono scritti
con `:is(.goal, .home-goal)`, così fiammine, nome barrato e cerchio hanno lo stesso aspetto.
`data-stato="nessuno"` dà al blocco vuoto un bordo tratteggiato.
Il cerchio ha `margin-left: 5px`: così dista 11px dal bordo a sinistra come sopra e sotto,
e sta al centro della curva sinistra della pillola invece di sembrare spinto verso il bordo.

Un clic sul pulsante apre `#home-goal-panel` appena sotto il blocco (`position: absolute`),
riempito da `riempiFinestrellaObiettivi()` con gli obiettivi non completati, copiando
`template#home-goal-option-template`. La finestrella si chiude scegliendo un obiettivo,
con un clic fuori o con Esc. Non ha un titolo: la lista ha già il nome accessibile
«Obiettivi da fare» (`aria-label`). L'id scelto è salvato con la chiave `focusx.home.obiettivo.v1`;
aprendo la Home si mostra quello, oppure l'obiettivo in corso.

In corso vuol dire che il timer sta contando su quell'obiettivo. Avvia mette in corso
l'obiettivo scelto: `js/home-obiettivo.js` aggiunge un proprio listener al pulsante, senza
modificare `js/timer.js`. Pausa e Stop chiamano `fermaObiettivoInCorso()`, che riporta
l'obiettivo in corso a non completato. La stessa funzione parte all'apertura della pagina,
ma solo se non si sta lavorando: un «in corso» salvato da prima sarebbe falso.
`staLavorando()` lo dice guardando il timer: Pausa attivo (il timer conta) e
`data-modalita="fiammina"` sulla sezione del timer. Durante la pausa tra fiammine nessun
obiettivo va in corso: `avviaConObiettivo` e `scegliObiettivo` controllano `staLavorando()`.
Il play della pagina Obiettivi, se il timer è in pausa, preme prima Stop per saltarla.
Se il timer sta contando l'obiettivo resta in corso, anche dopo una ricarica o un'altra pagina.
L'obiettivo resta comunque scelto, perché `idScelto` viene calcolato prima.

Il play della pagina Obiettivi chiama `avviaNellaHome(id)`: riapre l'obiettivo se era completato,
salva il suo id con `chiaveObiettivoScelto` (esportata da `js/archivio.js`) e apre
`index.html?avvia`. La Home, a `DOMContentLoaded`, legge il parametro con `URLSearchParams` e
lo toglie dall'indirizzo con `history.replaceState`, così una ricarica non fa ripartire il timer.
Se il timer è fermo preme Avvia con `pulsanteAvvia.click()`: partono il timer e `avviaConObiettivo`.
Se sta già contando chiama `mettiInCorso(idScelto)`: il timer continua sul nuovo obiettivo,
dopo aver dato a quello di prima i secondi passati sulla pagina Obiettivi. Se il timer sta già contando, anche scegliere
un altro obiettivo lo mette in corso. Valgono le regole della pagina Obiettivi: un solo
obiettivo in corso e cerchio disattivato sotto il minuto lavorato. Le fiammine si disegnano
con `disegnaFiammine`, la stessa funzione della lista, importata da `js/fiammine.js`.

Il tempo lavorato lo conta la Home. `js/timer.js` fa scattare sul paragrafo `#timer` l'evento
`"secondi-lavorati"`, con il numero di secondi in `detail`. `js/home-obiettivo.js` lo ascolta con
`timer.addEventListener("secondi-lavorati", aggiungiSecondiLavorati)`: così i due moduli restano
separati e c'è un solo `setInterval`. Alla fine della sessione
`timer.addEventListener("sessione-finita", fermaObiettivoInCorso)` ferma l'obiettivo in corso,
come Pausa e Stop: la fiammina appena finita è fatta e, non più in corso, torna arancione. `aggiungiSecondiLavorati(evento)`
cerca l'obiettivo in corso e aggiunge `evento.detail` secondi ai suoi `minutiLavorati`. Per evitare
gli errori di arrotondamento delle frazioni, passa dai secondi interi:
`Math.round(minuti * 60) + evento.detail`, poi divide per 60. `Math.min` ferma il conto a 16 ore, il limite che `caricaObiettivi` accetta.
Il dato si salva a ogni annuncio, poi `mostraBloccoObiettivo()` ridisegna fiammine e tempo.
Il tempo lo conta solo la Home, ma la pagina Obiettivi lo mostra in diretta. Ogni secondo
`aggiornaObiettivoInCorso()` ridisegna la voce dell'obiettivo in corso con
`conTempoInDiretta(obiettivo)`, che aggiunge ai minuti salvati i secondi del timer non ancora
dati all'obiettivo: `secondiNonAnnunciati(leggiTimer())`, cioè secondi trascorsi meno
`annunciati`. È solo da mostrare: non salva niente, così la Home resta l'unica a contare.
Prima di cambiare uno stato con il cerchio, `cambiaStato` chiama `salvaTempoInDiretta()`:
salva quei secondi nell'obiettivo e alza `annunciati` nel timer salvato della stessa quantità,
così la Home non li conta una seconda volta. Senza questo passaggio, completando l'obiettivo
in corso dalla pagina Obiettivi i suoi ultimi secondi andrebbero persi.
Anche la finestrella degli obiettivi mostra «lavorato / previsto».

## Impostazioni

La voce Impostazioni del menu (`#settings-button`) apre la finestra `dialog#settings-dialog`,
uguale in tutte e tre le pagine e gestita da `js/impostazioni.js`. `<dialog>` è l'elemento HTML
per le finestre: `showModal()` la apre al centro, oscura lo sfondo con `::backdrop`, tiene il
focus dentro e la chiude con Esc. La X chiama `close()`; un clic sullo sfondo arriva al dialog
stesso (`evento.target === finestra`), perché il dialog non ha padding e il layout ne copre
tutto lo spazio. Aprendo la finestra il menu laterale si chiude con `pulsanteMenu.click()`.

Il layout `.settings-layout` è una griglia a due colonne: a sinistra `.settings-nav` con le
sezioni (per ora solo Durate, con l'icona di un orologio e `aria-current="true"`), a destra `.settings-content`. Ogni
impostazione è una riga `.settings-row`, con il testo a sinistra e il regolatore
`.settings-stepper` (−, valore, +) a destra, con `user-select: none` perché tenendo
premuto e trascinando non si selezionino i segni come testo. Sotto i 600px le sezioni vanno sopra, in riga,
e il regolatore sotto il testo. La regola generale `section` centra il testo e limita la
larghezza: `.settings-content` la annulla.

Le durate stanno in `js/impostazioni-salvate.js`, con la chiave `focusx.impostazioni.v1`
(`chiaveImpostazioni`): `{ minutiFiammina, minutiPausa }`. `leggiImpostazioni()` controlla ogni
valore con `dentroILimiti` e, se manca o è fuori da `limitiFiammina` (10-60, passo 5) o
`limitiPausa` (1-30, passo 1), usa quello di partenza (25 e 5). `cambiaDurata(campo, limiti,
direzione)` cambia un valore di un passo, lo salva con `scriviImpostazioni` e fa scattare
`window.dispatchEvent(new Event("impostazioni-cambiate"))`.

Chi dipende dalle durate ascolta quell'evento:
- `js/fiammine.js` aggiorna `minutiPerFiammina` e `fiammineMassime`, che ora sono `export let`:
  un `let` esportato è un collegamento, quindi chi lo importa legge subito il valore nuovo.
  Questo modulo parte prima delle pagine, quindi il suo listener scatta per primo;
- `js/timer.js`, se la sessione non è avviata, la prepara di nuovo con `impostaModalita`;
- `js/home-obiettivo.js` ridisegna il blocco e la finestrella degli obiettivi;
- `js/obiettivi.js` (`applicaNuoveDurate`) ridisegna la lista, aggiorna il limite della
  finestrella delle fiammine e riporta la sesta fiammina entro il nuovo massimo.

Gli obiettivi tengono il loro numero di fiammine: cambiando la durata cambia il tempo previsto,
e le fiammine fatte si ricalcolano dai minuti lavorati. `caricaObiettivi` non controlla più il
massimo di fiammine: allungando la fiammina il massimo scende, e gli obiettivi creati prima
devono restare validi.

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
- I messaggi d'errore di Progetti e Obiettivi usano `role="status"`, così vengono annunciati.

Se nelle prossime funzioni servirà mostrare un nuovo messaggio, evita annunci continui a ogni secondo.

## Convenzioni del codice

- Usa due spazi per l'indentazione, come nei file esistenti.
- Scrivi i tag HTML in minuscolo.
- Usa nomi descrittivi in kebab-case per classi e identificatori, per esempio `stop-button`.
- Nel CSS scrivi una dichiarazione per riga e riutilizza le variabili dei colori.
- Mantieni HTML per la struttura, CSS per lo stile e JavaScript per il comportamento.
- In JavaScript usa nomi descrittivi in camelCase, `const` per i nomi non riassegnati
  e `let` per i valori che cambiano.
- Scrivi commenti in italiano, vicino al codice a cui si riferiscono.
- Ogni file JavaScript inizia con un'intestazione che dice a quale pagina serve ed elenca
  le sue sezioni. Ogni sezione si apre con un titolo, per esempio
  `SEZIONE SCELTA DELLE FIAMMINE`, e due righe su cosa contiene; ogni funzione ha sopra
  una riga che dice cosa fa. Una funzione nuova va nella sezione del suo argomento.
- Nei file JavaScript l'ordine delle sezioni è sempre: importazioni, elementi della pagina,
  impostazioni, salvataggio, dati in memoria, funzioni per argomento, avvio della pagina. Il codice che parte
  subito (dati in memoria e avvio) deve stare dopo le costanti che usa.
- Anche i file HTML iniziano con un'intestazione (pagina, file collegati, elenco delle sezioni)
  e hanno un commento `SEZIONE ...` prima di ogni parte: head, intestazione e menu, poi le parti
  della pagina. Nell'HTML l'ordine degli elementi è quello della pagina, quindi le sezioni
  seguono quell'ordine. Dove serve, il titolo indica la sezione del file JavaScript che usa
  quella parte, per esempio «JavaScript: sezione MODULO di js/obiettivi.js».
- L'intestazione e il menu sono uguali nei tre file HTML, commenti compresi: cambia solo
  la voce con `aria-current="page"`.
- Nei file HTML i commenti spiegano le scelte del progetto (perché un attributo c'è, cosa
  ci fa JavaScript), non cosa fa un tag o un attributo in generale: per quello c'è MDN.
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
- Il clic animi l'icona e apra il pannello con le cinque voci richieste.
- Un secondo clic, Esc e un clic fuori chiudano il pannello.
- Un clic dentro il pannello lo lasci aperto; Esc lo chiuda senza spostare esplicitamente il focus.
- Il pannello copra logo e titolo, lasciando la X visibile sullo stesso sfondo del menu.
- Le cinque voci non mostrino bordi divisori e abbiano testo centrato e icone visibili.
- Su telefono il pannello occupi tutta la finestra e ogni coppia icona-testo sia centrata.
- Hover e pressione mostrino gli effetti previsti; solo Home e Progetti navighino alla loro pagina.
- Le voci si possano raggiungere con Tab solo quando il menu è aperto.
- La favicon usi il logo dell'app e il relativo file sia caricato senza errori.
- `aria-expanded`, `active`, `is-open` e `inert` restino coerenti dopo più aperture e chiusure.
- Invio e Spazio eseguano lo stesso cambio di stato.
- L'animazione non modifichi il tempo o lo stato dei pulsanti del timer.
- Su uno schermo piccolo l'header non crei scorrimento orizzontale.
- Con la preferenza di movimento ridotto, il cambio avvenga senza transizioni.
- A menu aperto la pagina sotto l'header si scurisca e le voci entrino una dopo l'altra.
- Nella pagina Progetti la voce Progetti abbia lo sfondo grigio della pagina corrente.

Per i progetti controlla che:

- Il collegamento dal menu apra `progetti.html` e FocusX riporti al timer.
- Crea progetto apra il modulo; Annulla lo chiuda senza creare una voce.
- Un nome vuoto o composto solo da spazi non venga accettato.
- Un nome valido venga aggiunto una sola volta e rimanga dopo una ricarica.
- Si possano aggiungere più progetti, compresi nomi con accenti o caratteri come `<` e `>`.
- Su mobile il modulo e i nomi lunghi non allarghino la pagina.
- Creando, modificando o eliminando un progetto non compaia nessun messaggio sotto la lista.
- Il modulo e il progetto appena creato compaiano salendo di pochi pixel.
- Matita e cestino restino all'estremità destra di ogni voce, anche con nomi lunghi e su mobile.
- La matita apra il modulo con titolo «Modifica progetto», nome e colore del progetto;
  Salva modifiche aggiorni solo quel progetto, nella stessa posizione, anche dopo una ricarica.
- Annulla durante una modifica non cambi nulla e Crea progetto riapra un modulo vuoto.
- Durante una modifica il progetto sparisca dall'elenco e ricompaia dopo Annulla o il salvataggio.
- Con lo stesso nome (anche con maiuscole diverse) e lo stesso colore di un altro progetto,
  Salva sia disattivato e compaia l'avviso; cambiando nome o colore torni attivo.
  Modificando un progetto senza cambiarlo, Salva resti attivo.
- I colori degli altri progetti abbiano il puntino, anche nella finestrella; in modifica
  il colore del progetto stesso non lo abbia.
- Il colore scelto nel modulo compaia nella cartella a sinistra del nome, anche dopo una ricarica.
- Dopo Annulla o un salvataggio, il modulo torni al colore bianco; i cerchi vadano a capo su mobile.
- Il + apra la finestrella, che si chiuda con Esc, con un clic fuori o scegliendo un colore;
  il + prenda il colore scelto con l'anello, e il colore venga salvato nel progetto.
- Al passaggio del mouse il cestino diventi rosso; il clic elimini solo quel progetto,
  anche dopo una ricarica, senza animare di nuovo le altre voci.
- Non compaiano errori JavaScript né nella pagina Progetti né nel timer.

Per gli obiettivi controlla che:

- Senza progetti compaia l'avviso con il link alla pagina Progetti, al posto di Crea obiettivo.
- Il menu a tendina elenchi tutti i progetti e un nome vuoto non venga accettato.
- La cartella nel campo del progetto abbia il colore del progetto scelto e cambi con la scelta.
- Le fiammine si accendano fino a quella scelta e il testo mostri il tempo, per esempio «3 fiammine · 1 h 15 min».
- Le sei fiammine stiano in una riga anche su un viewport di 375 pixel.
- La sesta apra la finestrella; − sia disabilitato a 6 e + a 38; il testo mostri, per esempio,
  «5 h» (e «12 fiammine · 5 h» passandoci sopra) e la sesta «+7». Esc, un clic fuori o una delle prime cinque la chiudano.
- Scrivendo nel numero della finestrella il valore cambi subito; 50 diventi 38, 3 diventi 9,
  un campo vuoto torni al numero precedente, e Invio non salvi l'obiettivo.
- Un obiettivo da 12 fiammine mostri nell'elenco una sola fiammina seguita da «12»;
  fino a 5 fiammine si vedano tutte. Le fiammine siano vuote; in corso la prima si riempia appena
  e tremoli; da completato siano piene e accese solo quelle lavorate, senza animazione.
- Con 55 minuti lavorati su 4 fiammine si vedano due fiammine piene, la terza piena per
  un quinto dal basso e l'ultima vuota; nella Home il riempimento salga mentre il timer conta.
- Con più di 5 fiammine, in corso fiammina e numero abbiano lo stesso colore,
  nella lista e nella pillola della Home.
- Il nuovo obiettivo compaia in cima con nome e colore del progetto, data, fiammine e tempo.
- Senza data il modulo non venga inviato e il browser segnali il campo; una data passata sia rossa
  finché l'obiettivo non è completato.
- La spunta cambi lo stato, anche dopo una ricarica; premuta di nuovo, torni a non completato.
- Il play apra la Home con quell'obiettivo scelto e il timer già partito, e l'indirizzo torni
  `index.html` senza `?avvia`; su un obiettivo completato lo riapra.
- Uscendo dalla Home con il timer avviato, l'obiettivo non resti in corso nella pagina Obiettivi.
- Rinominando o ricolorando un progetto, i suoi obiettivi si aggiornino.
- Crea obiettivo apra la barra con il segnaposto del progetto e «Oggi»; scrivendo il nome e premendo
  Invio l'obiettivo compaia in cima e la barra resti aperta, vuota; Esc o la X la chiudano.
- La matita trasformi la voce nella barra compilata, nello stesso punto della lista, anche con più
  di 5 fiammine; con un calendario o un elenco aperto Esc chiuda solo quello, poi Esc annulli
  e la voce ricompaia. Su telefono la barra vada su tre righe senza uscire dallo schermo. Salvando cambino nome, progetto, data e fiammine ma non stato e posizione.
- Mettendo in corso un obiettivo, quello che era in corso torni non completato.
- La matita di un obiettivo in corso sia disattivata e non apra la barra; a timer fermo torni attiva.
- Con meno di 60 secondi lavorati il cerchio sia disattivato e al sessantesimo si attivi; un obiettivo già completato si possa riaprire,
  e poi il cerchio si disattivi.
- Con lo stesso nome (anche con maiuscole diverse) e lo stesso progetto di un altro obiettivo,
  Salva sia disattivato e compaia l'avviso; cambiando nome o progetto torni attivo.
  Modificando un obiettivo senza cambiarlo, Salva resti attivo.
- Elimina si veda solo in modifica e cancelli l'obiettivo, anche dopo una ricarica; eliminando l'ultimo
  ricompaia «Non hai ancora creato obiettivi».

Per l'obiettivo nella Home controlla che:

- Senza obiettivo scelto il blocco sia tratteggiato e dica «Scegli un obiettivo».
- Il clic apra la finestrella sotto il blocco, sopra il timer, con i soli obiettivi da fare
  e la cartella del colore del progetto; Esc, un clic fuori o una scelta la chiudano.
- Avvia metta in corso l'obiettivo scelto (bordo arancione insieme all'anello, fiammina tremolante) e fermi l'altro;
  a timer avviato, scegliere un altro obiettivo lo metta in corso.
- A timer avviato i minuti lavorati crescano di un secondo alla volta e il tempo accanto alle
  fiammine scenda di un minuto ogni minuto intero; Pausa e Stop fermino il conto.
- Dopo 25 minuti lavorati la prima fiammina diventi fatta e la seconda tremoli; nella pagina
  Obiettivi la voce mostri la stessa fiammina fatta e lo stesso tempo.
- Il tempo si legga «lavorato / previsto», con il lavorato in evidenza (arancione in corso),
  e cresca di un minuto ogni minuto intero; superato il previsto continui a crescere.
- Completando o riaprendo un obiettivo il tempo lavorato non cambi.
- Il tempo lavorato non superi 16 ore (960 minuti).
- Dopo una ricarica resti scelto lo stesso obiettivo; su un telefono il blocco non esca dallo schermo.

Per il timer attuale controlla anche che:

- Il tempo resti a `25:00` prima di premere Avvia.
- Il primo aggiornamento mostri `24:59`, poi `24:58`, senza saltare secondi.
- Avvia sia disabilitato durante il conto alla rovescia.
- Pausa sia disabilitato all'apertura e abilitato durante il conteggio.
- Dopo un clic su Pausa, il tempo resti fermo e Avvia torni disponibile.
- Premendo Avvia dopo una pausa, il timer continui dal valore rimasto.
- Più cicli di pausa e ripresa non accelerino il conteggio.
- Stop sia disabilitato all'apertura e abilitato dopo Avvia, anche in pausa.
- Premendo Stop durante il conteggio o in pausa, il tempo torni a `25:00` e resti fermo.
- Dopo Stop, Avvia sia disponibile e Pausa e Stop siano disabilitati.
- Avvia dopo Stop riparta da `25:00` con un solo intervallo.
- Ricaricando la pagina mentre il timer conta, il tempo continui da dove deve essere
  e l'obiettivo resti in corso; ricaricando in pausa, il tempo resti fermo e Stop disponibile.
- Andando nella pagina Obiettivi e tornando dopo qualche secondo, il timer sia avanzato
  di quei secondi e l'obiettivo in corso li abbia ricevuti.
- Se la sessione finisce mentre sei su un'altra pagina, tornando il timer sia a `25:00`, fermo,
  e l'obiettivo abbia la sua fiammina e non sia più in corso.
- Il play della pagina Obiettivi, a timer avviato, metta in corso il nuovo obiettivo
  senza far ripartire il timer.
- Con il timer avviato, nella pagina Obiettivi il tempo e la fiammina dell'obiettivo in corso
  crescano ogni secondo, e il cerchio si attivi al sessantesimo secondo lavorato.
- Completando dalla pagina Obiettivi l'obiettivo in corso, il suo tempo salvato includa
  i secondi in diretta e, tornando nella Home, non cresca di nuovo.
- Passando il mouse su Stop abilitato, lo sfondo diventi rosso chiaro e il testo nero, senza cambiare l'opacità.
- In pausa le cifre diventino grigie e tornino bianche con Avvia o Stop.
- Alla fine di una fiammina il timer passi a `05:00`, fermo, con la scritta «Pausa» lilla,
  l'anello pieno, cifre e Avvia lilla, Stop con l'icona «salta» e la pillola attenuata.
- Avviato, l'anello si consumi in senso orario dall'alto; con Pausa diventi grigio; con Stop
  o a fine sessione torni pieno.
- Nella pausa avviata un alone lilla si gonfi e si sgonfi dietro alle cifre ogni 8 secondi;
  con la pausa ferma o sospesa, e nella fiammina, l'alone non ci sia.
- Avviando la pausa nessun obiettivo vada in corso e nessun secondo venga aggiunto.
- «Salta la pausa» riporti a una fiammina da `25:00`; alla fine della pausa il timer
  torni a `25:00`, fermo, con l'anello arancione pieno e nessuna scritta.
- Ricaricando durante la pausa, la pausa continui; il play della pagina Obiettivi la salti
  e faccia partire una fiammina sull'obiettivo.
- Su un dispositivo touch nessun pulsante resti evidenziato dopo il tocco.
- Il formato mantenga due cifre per minuti e secondi.
- Dopo 25 minuti il timer passi alla pausa e si fermi, con Avvia e «Salta la pausa» disponibili.

Per il calendario della data controlla che:

- La barra parta da «Oggi» e, cliccando la data, apra il calendario sul mese di oggi.
- Le frecce ‹ › cambino mese e il giorno 1 cada sotto il giorno della settimana giusto.
- Un clic su un giorno lo scriva nella barra («3 nov», con l'anno solo se non è quello di adesso)
  e chiuda il calendario.
- Da tastiera le frecce si muovano fra i giorni, anche oltre la fine del mese; Esc chiuda.
- Salvando senza data il calendario si apra e l'obiettivo non venga creato.
- Annulla svuoti la data; la matita di un obiettivo la riempia.
- Scegliendo oggi, il campo e la voce nella lista mostrino «Oggi».

Per la scelta del progetto controlla che:

- La cartella abbia il colore del primo progetto; un clic apra l'elenco con la spunta
  sul progetto scelto.
- Un clic su una voce la scelga, cambi il colore della cartella e il segnaposto della barra
  e chiuda l'elenco.
- Con un nome già usato in un progetto, cambiare progetto faccia sparire l'avviso dei doppioni.
- Da tastiera la freccia giù sul campo apra l'elenco, le frecce si muovano, Invio scelga ed Esc chiuda.
- Modificando un obiettivo con il progetto eliminato, la cartella sia grigia («Scegli un progetto»
  passandoci sopra) e Salva apra l'elenco.

Per le impostazioni controlla che:

- Impostazioni nel menu, su ogni pagina, chiuda il menu e apra la finestra al centro
  con lo sfondo oscurato; la X, Esc e un clic sullo sfondo la chiudano, un clic dentro no.
- − e + cambino la durata di un passo, si disattivino ai limiti e restino dopo una ricarica.
- Nella Home, a timer non partito, il tempo cambi subito (25:00 diventa 30:00), e il tempo
  previsto e le fiammine dell'obiettivo si ricalcolino.
- A sessione avviata, cambiare la durata non cambi la sessione; dopo Stop valga la nuova.
- Con la fiammina da 60 minuti, un obiettivo vecchio da 38 fiammine resti nella lista.
- Su telefono le sezioni vadano sopra e la finestra non esca dallo schermo.
- Con un obiettivo in corso, alla fine della sessione la fiammina sia fatta e arancione,
  l'obiettivo non sia più in corso e Avvia lo rimetta in corso sulla fiammina successiva.

## Aggiornamento della guida

Modifica questa guida quando cambiano la struttura, i nomi degli elementi, le convenzioni
o le modalità di verifica. Per le regole di scrittura e conservazione,
consulta [Come mantenere la documentazione](documentazione.md).

