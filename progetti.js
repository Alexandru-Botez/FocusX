// Troviamo i controlli della pagina Progetti, separati da quelli del timer.
const pulsanteNuovoProgetto = document.getElementById("new-project-button");
const moduloProgetto = document.getElementById("project-form");
const campoNomeProgetto = document.getElementById("project-name");
const pulsanteAnnullaProgetto = document.getElementById("cancel-project-button");
const elencoProgetti = document.getElementById("project-list");
const statoVuotoProgetti = document.getElementById("projects-empty");
const messaggioProgetti = document.getElementById("projects-message");
const modelloVoceProgetto = document.getElementById("project-item-template");

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

// idNuovo indica il progetto appena creato, l'unico che compare con l'animazione.
function mostraProgetti(idNuovo) {
  // Svuotiamo l'elenco prima di ricostruirlo, evitando righe duplicate.
  elencoProgetti.replaceChildren();
  statoVuotoProgetti.hidden = progetti.length > 0;

  for (const progetto of progetti) {
    // cloneNode(true) copia il li del template insieme a tutto il suo contenuto.
    const voce = modelloVoceProgetto.content.firstElementChild.cloneNode(true);
    // textContent mostra il nome come testo, anche se contiene caratteri come < o >.
    voce.querySelector(".project-name").textContent = progetto.nome;
    voce.classList.toggle("is-new", progetto.id === idNuovo);

    const pulsanteElimina = voce.querySelector(".project-delete");
    // Il pulsante mostra solo un'icona: aria-label dice quale progetto elimina.
    pulsanteElimina.setAttribute("aria-label", "Elimina " + progetto.nome);
    pulsanteElimina.addEventListener("click", () => eliminaProgetto(progetto.id));
    elencoProgetti.append(voce);
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

function chiudiModuloProgetto() {
  moduloProgetto.hidden = true;
  pulsanteNuovoProgetto.hidden = false;
  moduloProgetto.reset();
  campoNomeProgetto.setCustomValidity("");
}

function creaProgetto(evento) {
  // submit invierebbe il form e ricaricherebbe la pagina: gestiamo noi l'inserimento.
  evento.preventDefault();

  // trim rimuove gli spazi iniziali e finali; un nome composto solo da spazi non va bene.
  const nome = campoNomeProgetto.value.trim();
  if (nome === "") {
    campoNomeProgetto.setCustomValidity("Inserisci un nome per il progetto.");
    campoNomeProgetto.reportValidity();
    return;
  }

  // Ogni progetto ha un identificatore indipendente dal nome: servirà a collegare gli obiettivi.
  const nuovoProgetto = { id: crypto.randomUUID(), nome: nome };
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

function cancellaErroreNome() {
  // Un errore personalizzato va azzerato quando l'utente corregge il campo.
  campoNomeProgetto.setCustomValidity("");
}

pulsanteNuovoProgetto.addEventListener("click", apriModuloProgetto);
pulsanteAnnullaProgetto.addEventListener("click", chiudiModuloProgetto);
moduloProgetto.addEventListener("submit", creaProgetto);
campoNomeProgetto.addEventListener("input", cancellaErroreNome);
mostraProgetti();
