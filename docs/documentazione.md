# Scrivere e mantenere la documentazione

La documentazione aiuta una persona a capire il progetto, avviarlo e modificarlo.
Qui seguiamo le convenzioni dei repository su GitHub: README iniziale, guide in Markdown
e commenti vicino alle parti di codice che richiedono una spiegazione.

## Dove si conserva

La documentazione di FocusX vive nello stesso repository del codice:

| Posizione | Cosa contiene |
| --- | --- |
| [README.md](../README.md), nella cartella principale | Presentazione, stato del progetto, requisiti, avvio e collegamenti alle guide. |
| [docs/guida-sviluppo.md](guida-sviluppo.md) | Organizzazione del codice, scelte, convenzioni e verifiche. |
| Questo file, `docs/documentazione.md` | Regole per scrivere e aggiornare la documentazione. |
| Commenti in [index.html](../index.html) e [styles.css](../styles.css) | Spiegazioni vicine agli elementi e alle regole interessate. |

Git registra le modifiche dei documenti come quelle del codice.
Dopo un commit e un push sul ramo `main`, i documenti aggiornati sono disponibili
anche nel repository GitHub. Chi scarica il progetto riceve insieme codice e guide.

Abbiamo scelto di mettere il README nella cartella principale perché è il punto di ingresso
del progetto. GitHub lo mostra nella pagina del repository:
vedi la [documentazione ufficiale sui README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).

## Formato Markdown

L'estensione `.md` indica un file Markdown: è testo semplice con alcuni simboli
per titoli, elenchi, collegamenti e codice. Puoi modificarlo con un editor di testo;
GitHub ne mostra una versione formattata.

Esempi di sintassi:

| Contenuto | Come scriverlo |
| --- | --- |
| Titolo del documento | `# Titolo` |
| Sezione | `## Avvio locale` |
| Parola in grassetto | `**Importante**` |
| Comando dentro una frase | Racchiudi il comando tra due backtick, come `git status`. |
| Elemento di un elenco | `- Descrizione` |
| Collegamento a un'altra guida | `[Guida allo sviluppo](guida-sviluppo.md)` |

Per più righe di codice usa un blocco delimitato da tre backtick, indicando il linguaggio,
per esempio `bash`, `html` o `css`. La
[guida alla sintassi di GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
mostra gli esempi completi.

## Convenzioni dei documenti

1. Usa un solo titolo principale e organizza gli argomenti con sezioni descrittive.
2. Spiega prima lo scopo, poi i passaggi necessari e infine gli approfondimenti.
3. Indica requisiti e cartella di lavoro prima dei comandi; spiega anche cosa aspettarsi.
4. Separa le funzioni disponibili da quelle previste. Una funzione prevista va indicata come da sviluppare.
5. Usa collegamenti relativi fra i file del progetto, così funzionano anche dopo averlo scaricato.
6. Scrivi con termini chiari e spiega quelli nuovi alla prima comparsa.
7. Mantieni le informazioni in un posto principale: collega le altre guide senza copiare intere sezioni.
8. Usa UTF-8 per conservare correttamente gli accenti e lascia spazi fra titoli, paragrafi e liste.

Queste sono le convenzioni adottate per FocusX. Se in futuro il progetto avrà requisiti
di documentazione specifici, dovremo adattare le guide a quei requisiti.

## Commenti e guide

Un commento spiega una scelta locale: perché un attributo è presente, perché una regola
è necessaria o quale problema risolve. Una guida spiega il funzionamento complessivo
e le relazioni fra più file.

In questo progetto i commenti sono volutamente dettagliati per aiutare nello studio.
Le spiegazioni generali e le procedure si trovano invece nei file Markdown.
Per organizzare e commentare un foglio di stile, puoi consultare
[Organizzare il CSS su MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing).

## Quando aggiornare la documentazione

| Modifica al progetto | Documentazione da aggiornare |
| --- | --- |
| Cambia il modo di avviare l'app o un requisito | README. |
| Viene completata una funzione | Stato del progetto e lista delle funzioni nel README. |
| Cambiano struttura o identificatori HTML | Guida allo sviluppo e commenti interessati. |
| Cambiano palette, layout o regole per schermi piccoli | Guida allo sviluppo e commenti CSS interessati. |
| Cambiano le convenzioni di scrittura | Questa guida. |

Aggiorna codice e relativa documentazione nello stesso commit quando descrivono
la stessa modifica: la cronologia permetterà di leggere le istruzioni coerenti con quella versione.
Per includere README e guide fra i file da salvare puoi usare:

```bash
git add README.md docs
```

Aggiungi anche i file di codice modificati, se presenti, poi crea il commit e invialo
a GitHub con il flusso Git del progetto.

## Controllo prima di salvare

- I comandi e i percorsi corrispondono ai file reali?
- Le funzioni descritte come disponibili sono effettivamente implementate?
- I collegamenti interni aprono il documento corretto?
- I termini e i nomi dei file sono coerenti fra le guide?
- Gli esempi distinguono chiaramente codice esistente e lavoro futuro?

Per tornare alla presentazione del progetto, apri il [README](../README.md).

