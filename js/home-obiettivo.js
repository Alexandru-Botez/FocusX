// =====================================================================
// HOME-OBIETTIVO.JS: il blocco dell'obiettivo nella pagina Home (index.html)
// Sopra il timer mostra l'obiettivo scelto: nome, cerchio per completarlo
// e fiammine. Un clic sul blocco apre una finestrella con gli obiettivi
// da fare; premendo Avvia sul timer, l'obiettivo scelto va in corso.
//
// È un modulo, come gli altri file JavaScript: i suoi nomi sono privati,
// quindi può chiamare pulsanteAvvia anche se js/timer.js usa lo stesso nome.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - ELEMENTI DELLA PAGINA
//   - IMPOSTAZIONI
//   - SALVATAGGIO NEL BROWSER
//   - DATI IN MEMORIA
//   - BLOCCO DELL'OBIETTIVO
//   - FINESTRELLA DEGLI OBIETTIVI
//   - STATI DELL'OBIETTIVO
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// Il codice comune ad altre pagine, scritto una volta sola nei moduli.
// =====================================================================

import { chiaveProgetti, chiaveObiettivi, leggiElenco } from "./archivio.js?v=moduli-1";
import { formattaTempo, disegnaFiammine } from "./fiammine.js?v=moduli-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// Il blocco e i suoi pulsanti.
const bloccoObiettivo = document.getElementById("home-goal");
const pulsanteCompleta = document.getElementById("home-goal-complete");
const pulsanteScelta = document.getElementById("home-goal-picker");
const nomeObiettivo = document.getElementById("home-goal-name");

// Fiammine e tempo previsto.
const dettagliObiettivo = document.getElementById("home-goal-details");
const iconeFiammine = document.querySelectorAll("#home-goal-flames svg");
const numeroFiammine = document.getElementById("home-goal-flames-count");
const minutiPrevisti = document.getElementById("home-goal-minutes");

// Finestrella con l'elenco degli obiettivi.
const finestrellaObiettivi = document.getElementById("home-goal-panel");
const elencoSceltaObiettivi = document.getElementById("home-goal-options");
const avvisoNessunObiettivo = document.getElementById("home-goal-empty");
const modelloSceltaObiettivo = document.getElementById("home-goal-option-template");

// I pulsanti del timer, gli stessi che usa js/timer.js.
const pulsanteAvvia = document.getElementById("start-button");
const pulsantePausa = document.getElementById("pause-button");


// =====================================================================
// SEZIONE IMPOSTAZIONI
// La chiave con cui la Home ricorda l'obiettivo scelto.
// Le chiavi di progetti e obiettivi arrivano da js/archivio.js.
// =====================================================================

const chiaveObiettivoScelto = "focusx.home.obiettivo.v1";


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// Leggono progetti e obiettivi, scrivono gli obiettivi
// e ricordano quale obiettivo è scelto in Home.
// =====================================================================

// Restituisce i progetti salvati, che servono per il colore delle cartelle nella finestrella.
function caricaProgetti() {
  try {
    return leggiElenco(chiaveProgetti);
  } catch {
    return [];
  }
}

// Restituisce gli obiettivi salvati, oppure null se l'archivio non si legge:
// in quel caso il blocco non scrive niente, per non rovinare i dati.
function caricaObiettivi() {
  try {
    const archivio = leggiElenco(chiaveObiettivi);
    const valido = archivio.every(obiettivo =>
      obiettivo
      && typeof obiettivo.id === "string"
      && typeof obiettivo.nome === "string"
      && Number.isInteger(obiettivo.fiammine)
      && typeof obiettivo.stato === "string");
    if (!valido) {
      throw new Error("Archivio obiettivi non valido");
    }
    // Come nella pagina Obiettivi: chi non ha ancora minutiLavorati parte da 0.
    return archivio.map(obiettivo => ({ minutiLavorati: 0, ...obiettivo }));
  } catch {
    return null;
  }
}

// Scrive l'elenco degli obiettivi nel browser; restituisce false se non ci riesce.
function salvaObiettivi(elenco) {
  try {
    localStorage.setItem(chiaveObiettivi, JSON.stringify(elenco));
    return true;
  } catch {
    return false;
  }
}

// Ricorda l'id dell'obiettivo scelto in Home, così resta scelto anche dopo una ricarica.
function salvaObiettivoScelto(id) {
  try {
    localStorage.setItem(chiaveObiettivoScelto, id);
  } catch {
    // Se il browser non salva, la scelta vale solo finché la pagina resta aperta.
  }
}

// Restituisce l'id salvato dell'obiettivo scelto, oppure null.
function leggiObiettivoScelto() {
  try {
    return localStorage.getItem(chiaveObiettivoScelto);
  } catch {
    return null;
  }
}


// =====================================================================
// SEZIONE DATI IN MEMORIA
// I dati con cui lavora il blocco mentre la pagina è aperta.
// =====================================================================

const progetti = caricaProgetti();
let obiettivi = caricaObiettivi();
// L'id dell'obiettivo mostrato nel blocco; null quando non ne è scelto nessuno.
let idScelto = scegliObiettivoIniziale();

// All'apertura della Home: l'obiettivo scelto l'ultima volta, se esiste ancora;
// altrimenti quello in corso; altrimenti nessuno.
function scegliObiettivoIniziale() {
  if (obiettivi === null) {
    return null;
  }
  const salvato = leggiObiettivoScelto();
  if (obiettivi.some(obiettivo => obiettivo.id === salvato)) {
    return salvato;
  }
  const inCorso = obiettivi.find(obiettivo => obiettivo.stato === "in-corso");
  return inCorso === undefined ? null : inCorso.id;
}

// Restituisce l'obiettivo scelto, oppure undefined se non ce n'è uno.
function trovaObiettivoScelto() {
  if (obiettivi === null) {
    return undefined;
  }
  return obiettivi.find(obiettivo => obiettivo.id === idScelto);
}


// =====================================================================
// SEZIONE BLOCCO DELL'OBIETTIVO
// Mostra nel blocco sopra il timer nome, cerchio e fiammine
// dell'obiettivo scelto, oppure l'invito a sceglierne uno.
// =====================================================================

// Aggiorna tutto il blocco con l'obiettivo scelto.
function mostraBloccoObiettivo() {
  const obiettivo = trovaObiettivoScelto();

  if (obiettivo === undefined) {
    // data-stato="nessuno": il CSS mostra il blocco tratteggiato, come un posto ancora vuoto.
    bloccoObiettivo.dataset.stato = "nessuno";
    nomeObiettivo.textContent = obiettivi === null
      ? "Non riesco a leggere gli obiettivi"
      : "Scegli un obiettivo";
    pulsanteScelta.setAttribute("aria-label", "Scegli un obiettivo");
    pulsanteScelta.disabled = obiettivi === null;
    dettagliObiettivo.hidden = true;
    pulsanteCompleta.hidden = true;
    return;
  }

  // data-stato decide l'aspetto nel CSS, come nella lista degli obiettivi.
  bloccoObiettivo.dataset.stato = obiettivo.stato;
  nomeObiettivo.textContent = obiettivo.nome;
  pulsanteScelta.setAttribute("aria-label", "Obiettivo: " + obiettivo.nome + ". Cambia obiettivo");
  dettagliObiettivo.hidden = false;

  // Il cerchio segue le stesse regole della lista: senza tempo lavorato non si completa,
  // ma un obiettivo già completato si può sempre riaprire.
  pulsanteCompleta.hidden = false;
  pulsanteCompleta.setAttribute("aria-pressed", String(obiettivo.stato === "completato"));
  pulsanteCompleta.setAttribute("aria-label", "Segna come completato " + obiettivo.nome);
  const senzaTempo = obiettivo.minutiLavorati === 0 && obiettivo.stato !== "completato";
  pulsanteCompleta.disabled = senzaTempo;
  pulsanteCompleta.title = senzaTempo ? "Lavora sull'obiettivo prima di completarlo" : "Segna come completato";

  // Le fiammine si disegnano come nella lista, con la funzione comune di js/fiammine.js.
  disegnaFiammine(iconeFiammine, numeroFiammine, obiettivo);
  minutiPrevisti.textContent = formattaTempo(obiettivo.fiammine);
}


// =====================================================================
// SEZIONE FINESTRELLA DEGLI OBIETTIVI
// Il pannello che si apre sotto il blocco con gli obiettivi da fare.
// Si chiude scegliendo un obiettivo, con un clic fuori o con Esc.
// =====================================================================

// Riempie la finestrella con gli obiettivi non ancora completati.
function riempiFinestrellaObiettivi() {
  elencoSceltaObiettivi.replaceChildren();
  const daFare = obiettivi.filter(obiettivo => obiettivo.stato !== "completato");
  avvisoNessunObiettivo.hidden = daFare.length > 0;

  for (const obiettivo of daFare) {
    const voce = modelloSceltaObiettivo.content.firstElementChild.cloneNode(true);
    const pulsante = voce.querySelector(".home-goal-option");
    // aria-pressed segna l'obiettivo già scelto, che il CSS evidenzia.
    pulsante.setAttribute("aria-pressed", String(obiettivo.id === idScelto));
    pulsante.addEventListener("click", () => scegliObiettivo(obiettivo.id));

    voce.querySelector(".home-goal-option-name").textContent = obiettivo.nome;
    voce.querySelector(".home-goal-option-time").textContent = formattaTempo(obiettivo.fiammine);
    // La cartella prende il colore del progetto, se il progetto esiste ancora.
    const progetto = progetti.find(progetto => progetto.id === obiettivo.progettoId);
    if (progetto !== undefined) {
      voce.querySelector(".home-goal-option-icon").style.color = progetto.colore;
    }
    elencoSceltaObiettivi.append(voce);
  }
}

// Apre la finestrella, o la chiude se è già aperta.
function alternaFinestrellaObiettivi() {
  if (!finestrellaObiettivi.hidden) {
    chiudiFinestrellaObiettivi();
    return;
  }
  riempiFinestrellaObiettivi();
  finestrellaObiettivi.hidden = false;
  pulsanteScelta.setAttribute("aria-expanded", "true");
  // Il focus va sull'obiettivo già scelto, oppure sul primo: si sceglie anche da tastiera.
  const daSelezionare = elencoSceltaObiettivi.querySelector('[aria-pressed="true"]')
    || elencoSceltaObiettivi.querySelector(".home-goal-option");
  if (daSelezionare !== null) {
    daSelezionare.focus();
  }
}

// Chiude la finestrella.
function chiudiFinestrellaObiettivi() {
  finestrellaObiettivi.hidden = true;
  pulsanteScelta.setAttribute("aria-expanded", "false");
}

// Chiude la finestrella quando si clicca fuori dal blocco.
function chiudiFinestrellaFuori(evento) {
  if (!finestrellaObiettivi.hidden && !bloccoObiettivo.contains(evento.target)) {
    chiudiFinestrellaObiettivi();
  }
}

// Chiude la finestrella con Esc e riporta il focus sul blocco.
function chiudiFinestrellaConEsc(evento) {
  if (evento.key === "Escape" && !finestrellaObiettivi.hidden) {
    chiudiFinestrellaObiettivi();
    pulsanteScelta.focus();
  }
}

// Sceglie un obiettivo dalla finestrella, lo ricorda e chiude la finestrella.
function scegliObiettivo(id) {
  idScelto = id;
  salvaObiettivoScelto(id);
  chiudiFinestrellaObiettivi();
  // Se il timer sta già contando, si sta lavorando sul nuovo obiettivo: va subito in corso.
  if (!pulsantePausa.disabled) {
    mettiInCorso(id);
  }
  mostraBloccoObiettivo();
  pulsanteScelta.focus();
}


// =====================================================================
// SEZIONE STATI DELL'OBIETTIVO
// Avvia mette in corso l'obiettivo scelto; il cerchio lo completa.
// Valgono le regole della pagina Obiettivi: un solo obiettivo in corso
// e niente completato senza tempo lavorato.
// =====================================================================

// Mette in corso un obiettivo: quello che era in corso si ferma, come nella pagina Obiettivi.
function mettiInCorso(id) {
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === id);
  // Un obiettivo completato non riparte da solo; uno già in corso non cambia.
  if (obiettivo === undefined || obiettivo.stato !== "non-completato") {
    return;
  }
  const elencoAggiornato = obiettivi.map(elemento => {
    if (elemento.id === id) {
      return { ...elemento, stato: "in-corso" };
    }
    if (elemento.stato === "in-corso") {
      return { ...elemento, stato: "non-completato" };
    }
    return elemento;
  });
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;
  mostraBloccoObiettivo();
}

// Premendo Avvia sul timer, l'obiettivo scelto va in corso.
function avviaConObiettivo() {
  if (idScelto !== null) {
    mettiInCorso(idScelto);
  }
}

// Il cerchio completa l'obiettivo scelto; premuto di nuovo lo riporta a non completato.
function alternaCompletato() {
  const obiettivo = trovaObiettivoScelto();
  if (obiettivo === undefined) {
    return;
  }
  const nuovoStato = obiettivo.stato === "completato" ? "non-completato" : "completato";
  // Il cerchio è disattivato senza tempo lavorato; il controllo resta anche qui, per sicurezza.
  if (nuovoStato === "completato" && obiettivo.minutiLavorati === 0) {
    return;
  }
  const elencoAggiornato = obiettivi.map(elemento =>
    elemento.id === obiettivo.id ? { ...elemento, stato: nuovoStato } : elemento);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;
  // is-updated abilita il piccolo salto dell'icona, come nella lista.
  bloccoObiettivo.classList.add("is-updated");
  mostraBloccoObiettivo();
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Collega il blocco, la finestrella e il pulsante Avvia alle funzioni
// e mostra subito l'obiettivo scelto.
// =====================================================================

// Blocco e finestrella.
pulsanteScelta.addEventListener("click", alternaFinestrellaObiettivi);
document.addEventListener("click", chiudiFinestrellaFuori);
document.addEventListener("keydown", chiudiFinestrellaConEsc);

// Stati: il cerchio e il pulsante Avvia del timer.
pulsanteCompleta.addEventListener("click", alternaCompletato);
pulsanteAvvia.addEventListener("click", avviaConObiettivo);

// Il blocco compare subito, con l'obiettivo scelto l'ultima volta.
mostraBloccoObiettivo();
