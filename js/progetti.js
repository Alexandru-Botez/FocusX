// =====================================================================
// PROGETTI.JS: la pagina Progetti (progetti.html)
// Crea, mostra, modifica ed elimina i progetti, con il loro colore,
// e li salva nel browser.
//
// Sezioni, nell'ordine:
//   - ELEMENTI DELLA PAGINA
//   - SALVATAGGIO NEL BROWSER
//   - DATI IN MEMORIA
//   - ELENCO DEI PROGETTI
//   - COLORI
//   - MODULO: CREARE E MODIFICARE
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// Pulsanti e modulo.
const pulsanteNuovoProgetto = document.getElementById("new-project-button");
const moduloProgetto = document.getElementById("project-form");
const titoloModuloProgetto = document.getElementById("project-form-title");
const campoNomeProgetto = document.getElementById("project-name");
const pulsanteSalvaProgetto = document.getElementById("save-project-button");
const avvisoDoppione = document.getElementById("project-duplicate-warning");
const pulsanteAnnullaProgetto = document.getElementById("cancel-project-button");

// Colori.
const pulsanteAltriColori = document.getElementById("more-colors-button");
const finestraAltriColori = document.getElementById("more-colors");

// Elenco e messaggi.
const elencoProgetti = document.getElementById("project-list");
const statoVuotoProgetti = document.getElementById("projects-empty");
const messaggioProgetti = document.getElementById("projects-message");
const modelloVoceProgetto = document.getElementById("project-item-template");


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// Leggono e scrivono i progetti in localStorage,
// controllando che i dati salvati siano validi.
// =====================================================================

// Questa chiave distingue i dati di FocusX da eventuali altri dati dello stesso sito.
const chiaveProgetti = "focusx.progetti.v1";

// Restituisce i progetti salvati, solo se ognuno ha id e nome.
function caricaProgetti() {
  try {
    // localStorage conserva testo nel browser anche dopo una ricarica della pagina.
    const testoSalvato = localStorage.getItem(chiaveProgetti);
    if (testoSalvato === null) {
      return [];
    }

    // JSON.parse trasforma il testo JSON in un array di oggetti JavaScript.
    const archivio = JSON.parse(testoSalvato);
    if (!Array.isArray(archivio) || !archivio.every(progetto =>
      progetto && typeof progetto.id === "string" && typeof progetto.nome === "string")) {
      throw new Error("Archivio progetti non valido");
    }
    return archivio;
  } catch {
    // Non sovrascriviamo un archivio illeggibile o inaccessibile con un elenco vuoto.
    pulsanteNuovoProgetto.disabled = true;
    messaggioProgetti.textContent = "Non riesco a leggere i progetti salvati nel browser.";
    return [];
  }
}

// Scrive l'elenco dei progetti nel browser; restituisce false se non ci riesce.
function salvaProgetti(elenco) {
  try {
    // JSON.stringify compie la conversione inversa: array e oggetti diventano testo JSON.
    localStorage.setItem(chiaveProgetti, JSON.stringify(elenco));
    return true;
  } catch {
    messaggioProgetti.textContent = "Non riesco a salvare il progetto. Controlla lo spazio e le impostazioni del browser.";
    return false;
  }
}


// =====================================================================
// SEZIONE DATI IN MEMORIA
// I dati con cui lavora la pagina mentre è aperta.
// =====================================================================

let progetti = caricaProgetti();

// null quando il modulo crea un progetto; altrimenti l'id del progetto in modifica.
let idInModifica = null;


// =====================================================================
// SEZIONE ELENCO DEI PROGETTI
// Costruisce la lista, una voce per progetto copiata dal template,
// e gestisce il cestino che elimina un progetto.
// =====================================================================

// Ricostruisce tutta la lista; idNuovo indica il progetto appena creato,
// l'unico che compare con l'animazione.
function mostraProgetti(idNuovo) {
  // Svuotiamo l'elenco prima di ricostruirlo, evitando righe duplicate.
  elencoProgetti.replaceChildren();
  statoVuotoProgetti.hidden = progetti.length > 0;

  for (const progetto of progetti) {
    // cloneNode(true) copia il li del template insieme a tutto il suo contenuto.
    const voce = modelloVoceProgetto.content.firstElementChild.cloneNode(true);
    // dataset.id scrive l'attributo data-id: la voce ricorda a quale progetto appartiene.
    voce.dataset.id = progetto.id;
    // textContent mostra il nome come testo, anche se contiene caratteri come < o >.
    voce.querySelector(".project-name").textContent = progetto.nome;
    voce.classList.toggle("is-new", progetto.id === idNuovo);

    // style.color imposta il colore solo di questo elemento; l'SVG lo usa con currentColor.
    voce.querySelector(".project-icon").style.color = progetto.colore;

    const pulsanteModifica = voce.querySelector(".project-edit");
    pulsanteModifica.setAttribute("aria-label", "Modifica " + progetto.nome);
    pulsanteModifica.addEventListener("click", () => apriModificaProgetto(progetto.id));

    const pulsanteElimina = voce.querySelector(".project-delete");
    // Il pulsante mostra solo un'icona: aria-label dice quale progetto elimina.
    pulsanteElimina.setAttribute("aria-label", "Elimina " + progetto.nome);
    pulsanteElimina.addEventListener("click", () => eliminaProgetto(progetto.id));
    elencoProgetti.append(voce);
  }

  // Anche dopo una ricostruzione, il progetto in modifica resta nascosto.
  nascondiVoceInModifica();
}

// Nasconde dalla lista il progetto aperto nel modulo; con idInModifica null li mostra tutti.
function nascondiVoceInModifica() {
  // children sono le voci li dell'elenco. Solo quella del progetto in modifica
  // riceve hidden; con idInModifica uguale a null nessuna voce corrisponde e tutte si vedono.
  for (const voce of elencoProgetti.children) {
    voce.hidden = voce.dataset.id === idInModifica;
  }
}

// Elimina un progetto con il cestino e sposta il focus su un pulsante vicino.
function eliminaProgetto(id) {
  // findIndex restituisce la posizione del progetto, servirà a spostare il focus.
  const posizione = progetti.findIndex(progetto => progetto.id === id);
  if (posizione === -1) {
    return;
  }

  const nome = progetti[posizione].nome;
  // filter crea un nuovo array con tutti i progetti tranne quello da eliminare.
  const elencoAggiornato = progetti.filter(progetto => progetto.id !== id);
  if (!salvaProgetti(elencoAggiornato)) {
    return;
  }

  // Se il progetto eliminato era nel modulo, il modulo non ha più nulla da modificare.
  if (id === idInModifica) {
    chiudiModuloProgetto();
  }

  progetti = elencoAggiornato;
  mostraProgetti();
  messaggioProgetti.textContent = "Progetto eliminato: " + nome + ".";

  // Il pulsante premuto non esiste più: il focus passa al cestino vicino o a Crea progetto.
  const pulsantiElimina = elencoProgetti.querySelectorAll(".project-delete");
  const prossimo = pulsantiElimina[Math.min(posizione, pulsantiElimina.length - 1)];
  (prossimo || pulsanteNuovoProgetto).focus();
}


// =====================================================================
// SEZIONE COLORI
// I 12 colori del modulo, il + con altri 12 colori nella finestrella
// e il puntino sui colori già usati da altri progetti.
// =====================================================================

// Segna con un puntino i colori già usati dagli altri progetti.
function segnaColoriUsati() {
  // I colori degli altri progetti: quello in modifica è escluso, il suo colore resta "libero".
  const coloriUsati = progetti
    .filter(progetto => progetto.id !== idInModifica)
    .map(progetto => progetto.colore);

  for (const radio of moduloProgetto.elements.colore) {
    // includes controlla se il colore del cerchio è nell'elenco dei colori usati.
    const usato = coloriUsati.includes(radio.value);
    // La classe mostra il puntino; il colore resta comunque selezionabile.
    radio.classList.toggle("is-used", usato);
    // title resta il nome del colore; aria-label avvisa anche chi usa un lettore di schermo.
    radio.setAttribute("aria-label", usato ? radio.title + ", già usato" : radio.title);
  }
}

// Quando si sceglie un colore nella finestrella, il + lo mostra e la finestrella si chiude.
function scegliAltroColore(evento) {
  // evento.target è il radio appena selezionato: il + ne mostra il colore tramite --swatch.
  pulsanteAltriColori.style.setProperty("--swatch", evento.target.value);
  // hidePopover chiude la finestrella, perché la scelta è fatta.
  finestraAltriColori.hidePopover();
}


// =====================================================================
// SEZIONE MODULO: CREARE E MODIFICARE
// Lo stesso modulo serve per un progetto nuovo e per modificarne uno:
// idInModifica dice quale dei due lavori sta facendo.
// =====================================================================

// Mostra il modulo vuoto per creare un progetto.
function apriModuloProgetto() {
  moduloProgetto.hidden = false;
  pulsanteNuovoProgetto.hidden = true;
  messaggioProgetti.textContent = "";
  segnaColoriUsati();
  controllaDoppione();
}

// Apre il modulo con nome e colore di un progetto, pronto per modificarlo.
function apriModificaProgetto(id) {
  const progetto = progetti.find(progetto => progetto.id === id);
  if (progetto === undefined) {
    return;
  }

  // Chiudere e riaprire azzera una creazione o una modifica lasciata a metà.
  chiudiModuloProgetto();
  apriModuloProgetto();
  idInModifica = id;
  // Ora che il progetto è in modifica, il suo colore non conta più come usato.
  segnaColoriUsati();
  titoloModuloProgetto.textContent = "Modifica progetto";
  pulsanteSalvaProgetto.textContent = "Salva modifiche";

  // Il progetto compare già nel modulo: nell'elenco sarebbe un doppione.
  nascondiVoceInModifica();

  campoNomeProgetto.value = progetto.nome;
  // Assegnare value alla lista dei radio seleziona quello con lo stesso valore.
  moduloProgetto.elements.colore.value = progetto.colore;
  // Se il colore è nella finestrella, il + lo mostra; altrimenti il CSS lo ignora.
  pulsanteAltriColori.style.setProperty("--swatch", progetto.colore);
  // Scrivere value da JavaScript non genera eventi: il controllo lo chiamiamo noi.
  controllaDoppione();

  // focus porta il cursore nel campo e fa scorrere la pagina fino al modulo.
  campoNomeProgetto.focus();
}

// Chiude il modulo, lo svuota e lo riporta alla creazione di un progetto nuovo.
function chiudiModuloProgetto() {
  moduloProgetto.hidden = true;
  pulsanteNuovoProgetto.hidden = false;
  moduloProgetto.reset();
  campoNomeProgetto.setCustomValidity("");

  // Il modulo torna alla creazione, pronto per il prossimo Crea progetto.
  idInModifica = null;
  // Il progetto che era in modifica torna visibile nell'elenco.
  nascondiVoceInModifica();
  titoloModuloProgetto.textContent = "Nuovo progetto";
  pulsanteSalvaProgetto.textContent = "Salva progetto";
  controllaDoppione();
}

// Al salvataggio: controlla il nome, legge il colore e sceglie fra creare e modificare.
function inviaModuloProgetto(evento) {
  // submit invierebbe il form e ricaricherebbe la pagina: gestiamo noi il salvataggio.
  evento.preventDefault();

  // trim rimuove gli spazi iniziali e finali; un nome composto solo da spazi non va bene.
  const nome = campoNomeProgetto.value.trim();
  if (nome === "") {
    campoNomeProgetto.setCustomValidity("Inserisci un nome per il progetto.");
    campoNomeProgetto.reportValidity();
    return;
  }

  // elements.colore raccoglie i radio con name="colore", anche quelli della finestrella;
  // value è quello selezionato.
  const colore = moduloProgetto.elements.colore.value;
  // Salva è già disattivato per un doppione; il controllo resta anche qui, per sicurezza.
  if (esisteDoppione(nome, colore)) {
    return;
  }

  if (idInModifica === null) {
    creaProgetto(nome, colore);
  } else {
    modificaProgetto(idInModifica, nome, colore);
  }
}

// Aggiunge un progetto nuovo in cima alla lista e lo salva.
function creaProgetto(nome, colore) {
  // Ogni progetto ha un identificatore indipendente dal nome: servirà a collegare gli obiettivi.
  const nuovoProgetto = { id: crypto.randomUUID(), nome: nome, colore: colore };
  // Le parentesi quadre creano un nuovo array: prima il nuovo progetto, poi con ...progetti
  // tutti quelli già presenti. Così il progetto appena creato è sempre il primo della lista.
  const elencoAggiornato = [nuovoProgetto, ...progetti];
  if (!salvaProgetti(elencoAggiornato)) {
    return;
  }

  progetti = elencoAggiornato;
  mostraProgetti(nuovoProgetto.id);
  chiudiModuloProgetto();
  messaggioProgetti.textContent = "Progetto creato: " + nome + ".";
}

// Cambia nome e colore di un progetto esistente e lo salva.
function modificaProgetto(id, nome, colore) {
  // map crea un nuovo array della stessa lunghezza, trasformando ogni elemento.
  // Solo il progetto in modifica cambia; gli altri vengono copiati così come sono.
  const elencoAggiornato = progetti.map(progetto => {
    if (progetto.id !== id) {
      return progetto;
    }
    // ...progetto copia tutte le sue proprietà; nome e colore le sostituiscono.
    return { ...progetto, nome: nome, colore: colore };
  });
  if (!salvaProgetti(elencoAggiornato)) {
    return;
  }

  progetti = elencoAggiornato;
  mostraProgetti();
  chiudiModuloProgetto();
  messaggioProgetti.textContent = "Progetto modificato: " + nome + ".";

  // Il focus torna alla matita dello stesso progetto, nella sua posizione nell'elenco.
  const posizione = progetti.findIndex(progetto => progetto.id === id);
  elencoProgetti.querySelectorAll(".project-edit")[posizione].focus();
}

// Dice se un altro progetto ha già questo nome e questo colore.
function esisteDoppione(nome, colore) {
  // trim e toLowerCase: "Studio", "studio" e " Studio " contano come lo stesso nome.
  const nomeNormale = nome.trim().toLowerCase();
  // some restituisce true appena trova un elemento che rispetta la condizione.
  // Il progetto in modifica è escluso: confrontarlo con sé stesso darebbe sempre un doppione.
  return progetti.some(progetto =>
    progetto.id !== idInModifica
    && progetto.nome.trim().toLowerCase() === nomeNormale
    && progetto.colore === colore);
}

// A ogni cambio di nome o colore disattiva Salva e mostra l'avviso se il progetto è un doppione.
function controllaDoppione() {
  const doppione = esisteDoppione(campoNomeProgetto.value, moduloProgetto.elements.colore.value);
  pulsanteSalvaProgetto.disabled = doppione;
  avvisoDoppione.hidden = !doppione;
}

// Toglie l'avviso "Inserisci un nome" appena si scrive nel campo.
function cancellaErroreNome() {
  // Un errore personalizzato va azzerato quando l'utente corregge il campo.
  campoNomeProgetto.setCustomValidity("");
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Il codice che parte subito al caricamento: collega i pulsanti
// e i campi alle funzioni e mostra la lista.
// =====================================================================

pulsanteNuovoProgetto.addEventListener("click", apriModuloProgetto);
pulsanteAnnullaProgetto.addEventListener("click", chiudiModuloProgetto);
moduloProgetto.addEventListener("submit", inviaModuloProgetto);
campoNomeProgetto.addEventListener("input", cancellaErroreNome);
// input risale dal campo del nome e da tutti i radio dei colori, anche quelli della finestrella.
moduloProgetto.addEventListener("input", controllaDoppione);
// change scatta quando un radio della finestrella viene selezionato e risale fino al div.
finestraAltriColori.addEventListener("change", scegliAltroColore);

// La lista compare subito, con i progetti salvati.
mostraProgetti();
