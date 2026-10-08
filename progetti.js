// Troviamo i controlli della pagina Progetti, separati da quelli del timer.
const pulsanteNuovoProgetto = document.getElementById("new-project-button");
const moduloProgetto = document.getElementById("project-form");
const campoNomeProgetto = document.getElementById("project-name");
const pulsanteAnnullaProgetto = document.getElementById("cancel-project-button");
const elencoProgetti = document.getElementById("project-list");
const statoVuotoProgetti = document.getElementById("projects-empty");
const messaggioProgetti = document.getElementById("projects-message");
const modelloVoceProgetto = document.getElementById("project-item-template");
const pulsanteAltriColori = document.getElementById("more-colors-button");
const finestraAltriColori = document.getElementById("more-colors");
const titoloModuloProgetto = document.getElementById("project-form-title");
const pulsanteSalvaProgetto = document.getElementById("save-project-button");

// Questa chiave distingue i dati di FocusX da eventuali altri dati dello stesso sito.
const chiaveProgetti = "focusx.progetti.v1";

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

let progetti = caricaProgetti();

// null quando il modulo crea un progetto; altrimenti l'id del progetto in modifica.
let idInModifica = null;

// idNuovo indica il progetto appena creato, l'unico che compare con l'animazione.
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

    // I progetti salvati prima dei colori non hanno colore: la cartella resta bianca, come da CSS.
    if (typeof progetto.colore === "string") {
      // style.color imposta il colore solo di questo elemento; l'SVG lo usa con currentColor.
      voce.querySelector(".project-icon").style.color = progetto.colore;
    }

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

function nascondiVoceInModifica() {
  // children sono le voci li dell'elenco. Solo quella del progetto in modifica
  // riceve hidden; con idInModifica uguale a null nessuna voce corrisponde e tutte si vedono.
  for (const voce of elencoProgetti.children) {
    voce.hidden = voce.dataset.id === idInModifica;
  }
}

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

function apriModuloProgetto() {
  moduloProgetto.hidden = false;
  pulsanteNuovoProgetto.hidden = true;
  messaggioProgetti.textContent = "";
}

function apriModificaProgetto(id) {
  const progetto = progetti.find(progetto => progetto.id === id);
  if (progetto === undefined) {
    return;
  }

  // Chiudere e riaprire azzera una creazione o una modifica lasciata a metà.
  chiudiModuloProgetto();
  apriModuloProgetto();
  idInModifica = id;
  titoloModuloProgetto.textContent = "Modifica progetto";
  pulsanteSalvaProgetto.textContent = "Salva modifiche";

  // Il progetto compare già nel modulo: nell'elenco sarebbe un doppione.
  nascondiVoceInModifica();

  campoNomeProgetto.value = progetto.nome;
  // Assegnare value alla lista dei radio seleziona quello con lo stesso valore.
  // I progetti salvati prima dei colori non ne hanno uno: resta il bianco predefinito.
  if (typeof progetto.colore === "string") {
    moduloProgetto.elements.colore.value = progetto.colore;
    // Se il colore è nella finestrella, il + lo mostra; altrimenti il CSS lo ignora.
    pulsanteAltriColori.style.setProperty("--swatch", progetto.colore);
  }

  // focus porta il cursore nel campo e fa scorrere la pagina fino al modulo.
  campoNomeProgetto.focus();
}

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
}

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

  if (idInModifica === null) {
    creaProgetto(nome, colore);
  } else {
    modificaProgetto(idInModifica, nome, colore);
  }
}

function creaProgetto(nome, colore) {
  // Ogni progetto ha un identificatore indipendente dal nome: servirà a collegare gli obiettivi.
  const nuovoProgetto = { id: crypto.randomUUID(), nome: nome, colore: colore };
  // concat crea un nuovo array, aggiungendo il progetto a quelli già presenti.
  const elencoAggiornato = progetti.concat(nuovoProgetto);
  if (!salvaProgetti(elencoAggiornato)) {
    return;
  }

  progetti = elencoAggiornato;
  mostraProgetti(nuovoProgetto.id);
  chiudiModuloProgetto();
  messaggioProgetti.textContent = "Progetto creato: " + nome + ".";
}

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

function scegliAltroColore(evento) {
  // evento.target è il radio appena selezionato: il + ne mostra il colore tramite --swatch.
  pulsanteAltriColori.style.setProperty("--swatch", evento.target.value);
  // hidePopover chiude la finestrella, perché la scelta è fatta.
  finestraAltriColori.hidePopover();
}

function cancellaErroreNome() {
  // Un errore personalizzato va azzerato quando l'utente corregge il campo.
  campoNomeProgetto.setCustomValidity("");
}

pulsanteNuovoProgetto.addEventListener("click", apriModuloProgetto);
pulsanteAnnullaProgetto.addEventListener("click", chiudiModuloProgetto);
moduloProgetto.addEventListener("submit", inviaModuloProgetto);
campoNomeProgetto.addEventListener("input", cancellaErroreNome);
// change scatta quando un radio della finestrella viene selezionato e risale fino al div.
finestraAltriColori.addEventListener("change", scegliAltroColore);
mostraProgetti();
