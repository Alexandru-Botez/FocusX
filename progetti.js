// Troviamo i controlli della pagina Progetti, separati da quelli del timer.
const pulsanteNuovoProgetto = document.getElementById("new-project-button");
const moduloProgetto = document.getElementById("project-form");
const campoNomeProgetto = document.getElementById("project-name");
const pulsanteAnnullaProgetto = document.getElementById("cancel-project-button");
const elencoProgetti = document.getElementById("project-list");
const statoVuotoProgetti = document.getElementById("projects-empty");
const messaggioProgetti = document.getElementById("projects-message");

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

function mostraProgetti() {
  // Svuotiamo l'elenco prima di ricostruirlo, evitando righe duplicate.
  elencoProgetti.replaceChildren();
  statoVuotoProgetti.hidden = progetti.length > 0;

  for (const progetto of progetti) {
    const voce = document.createElement("li");
    // textContent mostra il nome come testo, anche se contiene caratteri come < o >.
    voce.textContent = progetto.nome;
    elencoProgetti.append(voce);
  }
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
  mostraProgetti();
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
