// Troviamo i controlli della pagina Obiettivi.
const pulsanteNuovoObiettivo = document.getElementById("new-goal-button");
const avvisoSenzaProgetti = document.getElementById("goals-no-projects");
const moduloObiettivo = document.getElementById("goal-form");
const campoNomeObiettivo = document.getElementById("goal-name");
const sceltaProgetto = document.getElementById("goal-project");
const campoData = document.getElementById("goal-date");
const testoFiammine = document.getElementById("goal-flames-output");
const pulsanteAnnullaObiettivo = document.getElementById("cancel-goal-button");
const elencoObiettivi = document.getElementById("goal-list");
const statoVuotoObiettivi = document.getElementById("goals-empty");
const messaggioObiettivi = document.getElementById("goals-message");
const modelloVoceObiettivo = document.getElementById("goal-item-template");

// Gli obiettivi hanno una chiave propria; i progetti vengono soltanto letti.
const chiaveObiettivi = "focusx.obiettivi.v1";
const chiaveProgetti = "focusx.progetti.v1";

// Per ora ogni fiammina vale 25 minuti: cambiando questo numero cambia tutto il calcolo.
const minutiPerFiammina = 25;

// Un oggetto usato come dizionario: a ogni stato salvato associa il testo da mostrare.
const nomiStati = {
  "non-completato": "Non completato",
  "in-corso": "In corso",
  "completato": "Completato"
};

function leggiElenco(chiave) {
  // Restituisce l'array salvato con quella chiave, oppure un array vuoto se non c'è ancora.
  const testoSalvato = localStorage.getItem(chiave);
  if (testoSalvato === null) {
    return [];
  }
  const elenco = JSON.parse(testoSalvato);
  if (!Array.isArray(elenco)) {
    // throw interrompe la funzione con un errore, che il catch di chi la chiama riceve.
    throw new Error("Archivio non valido");
  }
  return elenco;
}

function caricaProgetti() {
  try {
    return leggiElenco(chiaveProgetti);
  } catch {
    messaggioObiettivi.textContent = "Non riesco a leggere i progetti salvati nel browser.";
    return [];
  }
}

function caricaObiettivi() {
  try {
    const archivio = leggiElenco(chiaveObiettivi);
    // every controlla che ogni obiettivo abbia tutti i dati, del tipo giusto.
    const valido = archivio.every(obiettivo =>
      obiettivo
      && typeof obiettivo.id === "string"
      && typeof obiettivo.nome === "string"
      && typeof obiettivo.progettoId === "string"
      && typeof obiettivo.data === "string"
      && Number.isInteger(obiettivo.fiammine)
      // in controlla che lo stato sia una delle chiavi di nomiStati.
      && obiettivo.stato in nomiStati);
    if (!valido) {
      throw new Error("Archivio obiettivi non valido");
    }
    return archivio;
  } catch {
    // Come per i progetti, non sovrascriviamo un archivio illeggibile.
    pulsanteNuovoObiettivo.disabled = true;
    messaggioObiettivi.textContent = "Non riesco a leggere gli obiettivi salvati nel browser.";
    return [];
  }
}

function salvaObiettivi(elenco) {
  try {
    localStorage.setItem(chiaveObiettivi, JSON.stringify(elenco));
    return true;
  } catch {
    messaggioObiettivi.textContent = "Non riesco a salvare l'obiettivo. Controlla lo spazio e le impostazioni del browser.";
    return false;
  }
}

const progetti = caricaProgetti();
let obiettivi = caricaObiettivi();

function formattaTempo(fiammine) {
  // 2 fiammine → "50 min"; 3 fiammine → "1 h 15 min"; 8 fiammine → "3 h 20 min".
  const minuti = fiammine * minutiPerFiammina;
  // Math.floor arrotonda per difetto; % è il resto della divisione.
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  if (ore === 0) {
    return minuti + " min";
  }
  return resto === 0 ? ore + " h" : ore + " h " + resto + " min";
}

function formattaData(testo) {
  // "T00:00" fa leggere la data come mezzanotte locale: senza, il browser userebbe
  // l'ora di Greenwich e in alcuni fusi orari mostrerebbe il giorno prima.
  const data = new Date(testo + "T00:00");
  // toLocaleDateString scrive la data in italiano, per esempio "12 ott 2026".
  return data.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

function dataDiOggi() {
  // Costruiamo "2026-10-12", lo stesso formato del campo data, per poterle confrontare.
  const oggi = new Date();
  // getMonth parte da 0 per gennaio; padStart aggiunge uno zero davanti: 3 → "03".
  const mese = String(oggi.getMonth() + 1).padStart(2, "0");
  const giorno = String(oggi.getDate()).padStart(2, "0");
  return oggi.getFullYear() + "-" + mese + "-" + giorno;
}

function applicaStato(voce, obiettivo) {
  // data-stato sul li decide l'aspetto nel CSS: bordo, nome barrato, colori dei pulsanti.
  voce.dataset.stato = obiettivo.stato;
  voce.querySelector(".goal-state").textContent = nomiStati[obiettivo.stato];
  voce.querySelector(".goal-start").setAttribute("aria-pressed", String(obiettivo.stato === "in-corso"));
  voce.querySelector(".goal-complete").setAttribute("aria-pressed", String(obiettivo.stato === "completato"));

  // Le date nel formato "2026-10-12" si possono confrontare come testo: "minore" vuol dire prima.
  const inRitardo = obiettivo.data !== "" && obiettivo.data < dataDiOggi() && obiettivo.stato !== "completato";
  voce.querySelector(".goal-date").classList.toggle("is-late", inRitardo);
}

// idNuovo indica l'obiettivo appena creato, l'unico che compare con l'animazione.
function mostraObiettivi(idNuovo) {
  elencoObiettivi.replaceChildren();
  statoVuotoObiettivi.hidden = obiettivi.length > 0;

  for (const obiettivo of obiettivi) {
    const voce = modelloVoceObiettivo.content.firstElementChild.cloneNode(true);
    voce.dataset.id = obiettivo.id;
    voce.classList.toggle("is-new", obiettivo.id === idNuovo);
    voce.querySelector(".goal-name").textContent = obiettivo.nome;

    // L'obiettivo salva solo l'id del progetto: nome e colore si leggono dal progetto,
    // così restano aggiornati anche se il progetto viene modificato.
    const progetto = progetti.find(progetto => progetto.id === obiettivo.progettoId);
    if (progetto === undefined) {
      voce.querySelector(".goal-project-name").textContent = "Progetto eliminato";
    } else {
      voce.querySelector(".goal-project-name").textContent = progetto.nome;
      voce.querySelector(".goal-project-icon").style.color = progetto.colore;
    }

    // La data è facoltativa: senza data, la sua parte resta nascosta.
    const data = voce.querySelector(".goal-date");
    data.hidden = obiettivo.data === "";
    if (obiettivo.data !== "") {
      const testoData = voce.querySelector(".goal-date-text");
      testoData.dateTime = obiettivo.data;
      testoData.textContent = formattaData(obiettivo.data);
    }

    // Nel modello ci sono otto fiammine: restano visibili solo le prime, quante ne servono.
    const fiammine = voce.querySelectorAll(".goal-flame-icons svg");
    fiammine.forEach((fiammina, posizione) => {
      // Gli svg non hanno la proprietà hidden degli elementi HTML: toggleAttribute
      // aggiunge l'attributo hidden quando la condizione è vera e lo toglie quando è falsa.
      fiammina.toggleAttribute("hidden", posizione >= obiettivo.fiammine);
    });
    voce.querySelector(".goal-minutes").textContent = formattaTempo(obiettivo.fiammine);

    applicaStato(voce, obiettivo);

    const pulsanteInCorso = voce.querySelector(".goal-start");
    pulsanteInCorso.setAttribute("aria-label", "Metti in corso " + obiettivo.nome);
    pulsanteInCorso.addEventListener("click", () => cambiaStato(obiettivo.id, "in-corso"));

    const pulsanteCompleta = voce.querySelector(".goal-complete");
    pulsanteCompleta.setAttribute("aria-label", "Segna come completato " + obiettivo.nome);
    pulsanteCompleta.addEventListener("click", () => cambiaStato(obiettivo.id, "completato"));

    elencoObiettivi.append(voce);
  }
}

function cambiaStato(id, statoScelto) {
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === id);
  if (obiettivo === undefined) {
    return;
  }

  // Premere di nuovo il pulsante dello stato attuale riporta l'obiettivo a "non completato".
  const nuovoStato = obiettivo.stato === statoScelto ? "non-completato" : statoScelto;
  const elencoAggiornato = obiettivi.map(elemento =>
    elemento.id === id ? { ...elemento, stato: nuovoStato } : elemento);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;

  // Aggiorniamo solo la voce cambiata: le altre non si muovono e il focus resta sul pulsante.
  for (const voce of elencoObiettivi.children) {
    if (voce.dataset.id === id) {
      // is-updated abilita la piccola animazione dei pulsanti, solo dopo un clic.
      voce.classList.add("is-updated");
      applicaStato(voce, { ...obiettivo, stato: nuovoStato });
    }
  }
  messaggioObiettivi.textContent = obiettivo.nome + ": " + nomiStati[nuovoStato] + ".";
}

function aggiornaTestoFiammine() {
  // Il valore dei radio è testo: Number lo trasforma nel numero di fiammine.
  const fiammine = Number(moduloObiettivo.elements.fiammine.value);
  const parola = fiammine === 1 ? " fiammina" : " fiammine";
  testoFiammine.textContent = fiammine + parola + " · " + formattaTempo(fiammine);
}

function apriModuloObiettivo() {
  // Il menu a tendina riceve un option per ogni progetto: value è l'id, il testo è il nome.
  sceltaProgetto.replaceChildren();
  for (const progetto of progetti) {
    // new Option(testo, valore) crea un elemento option già pronto.
    sceltaProgetto.append(new Option(progetto.nome, progetto.id));
  }

  moduloObiettivo.hidden = false;
  pulsanteNuovoObiettivo.hidden = true;
  messaggioObiettivi.textContent = "";
  campoNomeObiettivo.focus();
}

function chiudiModuloObiettivo() {
  moduloObiettivo.hidden = true;
  pulsanteNuovoObiettivo.hidden = false;
  // reset riporta nome e data vuoti e la scelta su una fiammina, come scritto nell'HTML.
  moduloObiettivo.reset();
  aggiornaTestoFiammine();
  campoNomeObiettivo.setCustomValidity("");
}

function creaObiettivo(evento) {
  evento.preventDefault();

  const nome = campoNomeObiettivo.value.trim();
  if (nome === "") {
    campoNomeObiettivo.setCustomValidity("Inserisci un nome per l'obiettivo.");
    campoNomeObiettivo.reportValidity();
    return;
  }

  const nuovoObiettivo = {
    id: crypto.randomUUID(),
    nome: nome,
    progettoId: sceltaProgetto.value,
    // Il campo data vuoto vale "": la data è facoltativa.
    data: campoData.value,
    fiammine: Number(moduloObiettivo.elements.fiammine.value),
    // Ogni obiettivo nasce "non completato".
    stato: "non-completato"
  };

  // Come per i progetti, il nuovo obiettivo va in cima alla lista.
  const elencoAggiornato = [nuovoObiettivo, ...obiettivi];
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }

  obiettivi = elencoAggiornato;
  mostraObiettivi(nuovoObiettivo.id);
  chiudiModuloObiettivo();
  messaggioObiettivi.textContent = "Obiettivo creato: " + nome + ".";
}

function cancellaErroreNome() {
  campoNomeObiettivo.setCustomValidity("");
}

// Senza progetti non si può scegliere a chi appartiene l'obiettivo: mostriamo l'avviso.
if (progetti.length === 0) {
  pulsanteNuovoObiettivo.hidden = true;
  avvisoSenzaProgetti.hidden = false;
}

pulsanteNuovoObiettivo.addEventListener("click", apriModuloObiettivo);
pulsanteAnnullaObiettivo.addEventListener("click", chiudiModuloObiettivo);
moduloObiettivo.addEventListener("submit", creaObiettivo);
campoNomeObiettivo.addEventListener("input", cancellaErroreNome);
// change risale dai radio delle fiammine fino al form.
moduloObiettivo.addEventListener("change", aggiornaTestoFiammine);
mostraObiettivi();
