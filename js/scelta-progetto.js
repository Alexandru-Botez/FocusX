// =====================================================================
// SCELTA-PROGETTO.JS: la scelta del progetto, nel modulo degli obiettivi
// È un modulo: viene importato da js/obiettivi.js, che legge il progetto scelto
// dal campo nascosto #goal-project e usa riempiProgetti, scriviProgetto,
// apriProgetti e chiudiProgetti.
// Sostituisce il menu a tendina del browser (select), che non si può adattare
// allo stile del sito. Funziona come js/calendario.js: un pulsante, un campo
// nascosto con il valore e una finestrella che si apre sotto.
//
// Sezioni, nell'ordine:
//   - ELEMENTI E STATO
//   - VOCI DELL'ELENCO
//   - APERTURA E CHIUSURA
//   - SCELTA E TASTIERA
//   - EVENTI
// =====================================================================


// =====================================================================
// SEZIONE ELEMENTI E STATO
// =====================================================================

const contenitore = document.getElementById("goal-project-picker");
const pulsanteProgetto = document.getElementById("goal-project-button");
const iconaProgetto = document.getElementById("goal-project-icon");
const testoProgetto = document.getElementById("goal-project-text");
// Il campo nascosto: il suo value è l'id del progetto scelto, salvato nell'obiettivo.
const campoProgetto = document.getElementById("goal-project");
const elenco = document.getElementById("goal-project-list");
const modelloVoce = document.getElementById("goal-project-option-template");

// I progetti mostrati nell'elenco: servono a scriviProgetto per trovare nome e colore.
let progettiDaScegliere = [];


// =====================================================================
// SEZIONE VOCI DELL'ELENCO
// =====================================================================

// Crea una voce per ogni progetto e sceglie il primo, come faceva il select.
export function riempiProgetti(progetti) {
  progettiDaScegliere = progetti;
  elenco.replaceChildren();
  for (const progetto of progetti) {
    // cloneNode(true) copia il modello con tutto quello che ha dentro: cartella, nome e spunta.
    const voce = modelloVoce.content.firstElementChild.cloneNode(true);
    voce.dataset.id = progetto.id;
    // textContent e non innerHTML: un nome come "<b>Tesi</b>" resta testo, non diventa HTML.
    voce.querySelector(".project-option-name").textContent = progetto.nome;
    voce.querySelector(".project-option-folder").style.color = progetto.colore;
    elenco.append(voce);
  }
  // ?. e ?? evitano l'errore senza progetti: progetti[0] è undefined e si sceglie "".
  scriviProgetto(progetti[0]?.id ?? "");
}

// Scrive un progetto nel campo nascosto e nel pulsante, e segna la sua voce nell'elenco.
// Con un id che non esiste più, per esempio di un progetto eliminato, il campo si svuota.
export function scriviProgetto(id) {
  const progetto = progettiDaScegliere.find(progetto => progetto.id === id);
  campoProgetto.value = progetto === undefined ? "" : progetto.id;
  testoProgetto.textContent = progetto === undefined ? "Scegli un progetto" : progetto.nome;
  // is-empty rende grigio il testo "Scegli un progetto", come la data senza valore.
  testoProgetto.classList.toggle("is-empty", progetto === undefined);
  // La cartella del pulsante prende il colore del progetto; "" la riporta al colore del testo.
  iconaProgetto.style.color = progetto === undefined ? "" : progetto.colore;
  // Il pulsante mostra solo la cartella: passando sopra con il mouse si legge il nome.
  pulsanteProgetto.title = progetto === undefined ? "Scegli un progetto" : "Progetto: " + progetto.nome;

  // aria-selected segna la voce scelta: il CSS la mostra con la spunta.
  for (const voce of elenco.children) {
    voce.setAttribute("aria-selected", String(voce.dataset.id === campoProgetto.value));
  }
}


// =====================================================================
// SEZIONE APERTURA E CHIUSURA
// =====================================================================

// Apre l'elenco e mette il focus sulla voce scelta, o sulla prima se non ce n'è una.
export function apriProgetti() {
  elenco.hidden = false;
  pulsanteProgetto.setAttribute("aria-expanded", "true");
  const voce = elenco.querySelector('[aria-selected="true"]') ?? elenco.firstElementChild;
  voce?.focus();
}

export function chiudiProgetti() {
  elenco.hidden = true;
  pulsanteProgetto.setAttribute("aria-expanded", "false");
}

function alternaProgetti() {
  if (elenco.hidden) {
    apriProgetti();
  } else {
    chiudiProgetti();
  }
}

// Un clic fuori dal campo e dall'elenco lo chiude.
function chiudiProgettiFuori(evento) {
  if (!elenco.hidden && !contenitore.contains(evento.target)) {
    chiudiProgetti();
  }
}


// =====================================================================
// SEZIONE SCELTA E TASTIERA
// =====================================================================

// Sceglie un progetto, chiude l'elenco e riporta il focus sul campo.
function scegliProgetto(id) {
  scriviProgetto(id);
  // Scrivere value da JavaScript non genera eventi: input lo facciamo partire noi.
  // Risale fino al form, dove js/obiettivi.js controlla i doppioni (nome e progetto).
  campoProgetto.dispatchEvent(new Event("input", { bubbles: true }));
  chiudiProgetti();
  pulsanteProgetto.focus();
}

// Un clic su una voce: closest trova la voce anche se il clic arriva sul nome o sulla cartella.
function sceltaDaClic(evento) {
  const voce = evento.target.closest(".project-option");
  if (voce !== null) {
    scegliProgetto(voce.dataset.id);
  }
}

// Nell'elenco le frecce si muovono fra le voci, Home e Fine vanno alla prima e all'ultima.
// Invio e Spazio scelgono già da soli, perché le voci sono pulsanti.
function gestisciTastiElenco(evento) {
  const voci = [...elenco.children];
  const posizione = voci.indexOf(document.activeElement);
  const nuovePosizioni = {
    ArrowDown: Math.min(posizione + 1, voci.length - 1),
    ArrowUp: Math.max(posizione - 1, 0),
    Home: 0,
    End: voci.length - 1
  };
  const nuova = nuovePosizioni[evento.key];
  if (nuova !== undefined) {
    // preventDefault evita che le frecce facciano anche scorrere la pagina.
    evento.preventDefault();
    voci[nuova].focus();
  }
}

// Come nel select del browser, le frecce sul campo chiuso aprono l'elenco.
function gestisciTastiPulsante(evento) {
  if ((evento.key === "ArrowDown" || evento.key === "ArrowUp") && elenco.hidden) {
    evento.preventDefault();
    apriProgetti();
  }
}

// Esc chiude l'elenco e riporta il focus sul campo.
function chiudiProgettiConEsc(evento) {
  if (evento.key === "Escape" && !elenco.hidden) {
    chiudiProgetti();
    pulsanteProgetto.focus();
  }
}


// =====================================================================
// SEZIONE EVENTI
// =====================================================================

pulsanteProgetto.addEventListener("click", alternaProgetti);
pulsanteProgetto.addEventListener("keydown", gestisciTastiPulsante);
elenco.addEventListener("click", sceltaDaClic);
elenco.addEventListener("keydown", gestisciTastiElenco);
document.addEventListener("click", chiudiProgettiFuori);
document.addEventListener("keydown", chiudiProgettiConEsc);
