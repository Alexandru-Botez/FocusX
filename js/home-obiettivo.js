// =====================================================================
// HOME-OBIETTIVO.JS: il blocco dell'obiettivo nella pagina Home (index.html)
// Sopra il timer mostra l'obiettivo scelto: nome, cerchio per completarlo
// e fiammine. Un clic sul blocco apre una finestrella con gli obiettivi
// da fare. L'obiettivo è in corso solo mentre il timer conta: Avvia lo mette
// in corso; Pausa, Stop e la fine della sessione lo fermano. Ogni secondo
// del timer si aggiunge al tempo lavorato dell'obiettivo in corso.
//
// È un modulo, come gli altri file JavaScript: i suoi nomi sono privati,
// quindi può chiamare pulsanteAvvia anche se js/timer.js usa lo stesso nome.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - ELEMENTI DELLA PAGINA
//   - SALVATAGGIO NEL BROWSER
//   - DATI IN MEMORIA
//   - BLOCCO DELL'OBIETTIVO
//   - FINESTRELLA DEGLI OBIETTIVI
//   - STATI DELL'OBIETTIVO
//   - TEMPO LAVORATO
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// Il codice comune ad altre pagine, scritto una volta sola nei moduli.
// =====================================================================

import {
  chiaveProgetti,
  chiaveObiettivi,
  chiaveObiettivoScelto,
  leggiElenco
} from "./archivio.js?v=avvia-1";
import {
  oreMassime,
  disegnaFiammine,
  mostraTempo,
  lavoroInsufficiente
} from "./fiammine.js?v=minuto-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// Il blocco e i suoi pulsanti.
const bloccoObiettivo = document.getElementById("home-goal");
const pulsanteCompleta = document.getElementById("home-goal-complete");
const pulsanteScelta = document.getElementById("home-goal-picker");
const nomeObiettivo = document.getElementById("home-goal-name");

// Fiammine e tempo, lavorato / previsto.
const dettagliObiettivo = document.getElementById("home-goal-details");
const iconeFiammine = document.querySelectorAll("#home-goal-flames svg");
const numeroFiammine = document.getElementById("home-goal-flames-count");
const tempoObiettivo = document.getElementById("home-goal-minutes");

// Finestrella con l'elenco degli obiettivi.
const finestrellaObiettivi = document.getElementById("home-goal-panel");
const elencoSceltaObiettivi = document.getElementById("home-goal-options");
const avvisoNessunObiettivo = document.getElementById("home-goal-empty");
const modelloSceltaObiettivo = document.getElementById("home-goal-option-template");

// Il tempo e i pulsanti del timer, gli stessi che usa js/timer.js.
const timer = document.getElementById("timer");
const pulsanteAvvia = document.getElementById("start-button");
const pulsantePausa = document.getElementById("pause-button");
const pulsanteStop = document.getElementById("stop-button");


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// Leggono progetti e obiettivi, scrivono gli obiettivi
// e ricordano quale obiettivo è scelto in Home.
// Le chiavi dei dati arrivano da js/archivio.js.
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

  // Il cerchio segue le stesse regole della lista: sotto il minuto lavorato non si completa,
  // ma un obiettivo già completato si può sempre riaprire. Mentre il timer conta questa
  // funzione gira a ogni secondo: al sessantesimo il cerchio si attiva da solo.
  pulsanteCompleta.hidden = false;
  pulsanteCompleta.setAttribute("aria-pressed", String(obiettivo.stato === "completato"));
  pulsanteCompleta.setAttribute("aria-label", "Segna come completato " + obiettivo.nome);
  const senzaTempo = lavoroInsufficiente(obiettivo) && obiettivo.stato !== "completato";
  pulsanteCompleta.disabled = senzaTempo;
  pulsanteCompleta.title = senzaTempo ? "Lavora almeno un minuto prima di completarlo" : "Segna come completato";

  // Le fiammine e il tempo si mostrano come nella lista, con le funzioni comuni
  // di js/fiammine.js: mentre l'obiettivo è in corso cambiano a ogni secondo lavorato.
  disegnaFiammine(iconeFiammine, numeroFiammine, obiettivo);
  mostraTempo(tempoObiettivo, obiettivo);
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
    mostraTempo(voce.querySelector(".home-goal-option-time"), obiettivo);
    // La cartella prende il colore del progetto, se il progetto esiste ancora.
    const progetto = progetti.find(progetto => progetto.id === obiettivo.progettoId);
    if (progetto !== undefined) {
      voce.querySelector(".home-goal-option-icon").style.color = progetto.colore;
    }
    elencoSceltaObiettivi.append(voce);
  }
}

// Apre la finestrella, o la chiude se è già aperta.
function alternaFinestrellaObiettivi(evento) {
  if (!finestrellaObiettivi.hidden) {
    chiudiFinestrellaObiettivi();
    return;
  }
  riempiFinestrellaObiettivi();
  finestrellaObiettivi.hidden = false;
  pulsanteScelta.setAttribute("aria-expanded", "true");
  // Con il mouse o il dito (detail > 0) si sceglie direttamente con un clic: il focus resta
  // dov'è e non compare il contorno bianco. Da tastiera (Invio o Spazio, detail vale 0)
  // il focus va sull'obiettivo già scelto, oppure sul primo, così si sceglie con le frecce e Tab.
  if (evento.detail > 0) {
    return;
  }
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
// In corso vuol dire "ci sto lavorando adesso": vale solo mentre il timer conta.
// Avvia mette in corso l'obiettivo scelto; Pausa, Stop, la fine della sessione
// e l'apertura della pagina, quando il timer è fermo, lo fermano. Il cerchio lo completa.
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

// Il timer si è fermato: l'obiettivo in corso torna non completato.
// Serve per Pausa, Stop e la fine della sessione, e all'apertura della pagina,
// quando il timer parte fermo:
// un "in corso" rimasto salvato da prima (una ricarica, o il play della pagina Obiettivi)
// non deve far sembrare che si stia lavorando.
function fermaObiettivoInCorso() {
  if (obiettivi === null || !obiettivi.some(obiettivo => obiettivo.stato === "in-corso")) {
    return;
  }
  const elencoAggiornato = obiettivi.map(elemento =>
    elemento.stato === "in-corso" ? { ...elemento, stato: "non-completato" } : elemento);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;
  mostraBloccoObiettivo();
}

// Il cerchio completa l'obiettivo scelto; premuto di nuovo lo riporta a non completato.
function alternaCompletato() {
  const obiettivo = trovaObiettivoScelto();
  if (obiettivo === undefined) {
    return;
  }
  const nuovoStato = obiettivo.stato === "completato" ? "non-completato" : "completato";
  // Il cerchio è disattivato sotto il minuto lavorato; il controllo resta anche qui, per sicurezza.
  if (nuovoStato === "completato" && lavoroInsufficiente(obiettivo)) {
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
// SEZIONE TEMPO LAVORATO
// js/timer.js annuncia ogni secondo con l'evento "secondo": il secondo
// si aggiunge ai minuti lavorati dell'obiettivo in corso e viene salvato.
// Così il tempo lavorato cresce e, ogni 25 minuti, una fiammina diventa fatta.
// =====================================================================

// Aggiunge un secondo di lavoro all'obiettivo in corso, se ce n'è uno.
function aggiungiSecondoLavorato() {
  if (obiettivi === null) {
    return;
  }
  // Senza un obiettivo in corso (nessuno scelto, o uno già completato) il timer conta da solo.
  const obiettivo = obiettivi.find(obiettivo => obiettivo.stato === "in-corso");
  if (obiettivo === undefined) {
    return;
  }
  // I minuti hanno decimali: 1 secondo è 1/60 di minuto. Sommare 1/60 ogni volta
  // accumulerebbe piccoli errori di arrotondamento, quindi passiamo dai secondi interi:
  // Math.round riporta i minuti salvati a secondi, poi aggiungiamo 1.
  // Math.min ferma il conto a 16 ore, il limite che la pagina Obiettivi accetta.
  const secondi = Math.min(Math.round(obiettivo.minutiLavorati * 60) + 1, oreMassime * 60 * 60);
  const elencoAggiornato = obiettivi.map(elemento =>
    elemento.id === obiettivo.id ? { ...elemento, minutiLavorati: secondi / 60 } : elemento);
  // Salviamo a ogni secondo: chiudendo la scheda all'improvviso si perde al massimo un secondo.
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;
  mostraBloccoObiettivo();
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Collega il blocco, la finestrella, il cerchio e il timer alle funzioni
// e mostra subito l'obiettivo scelto.
// =====================================================================

// Blocco e finestrella.
pulsanteScelta.addEventListener("click", alternaFinestrellaObiettivi);
document.addEventListener("click", chiudiFinestrellaFuori);
document.addEventListener("keydown", chiudiFinestrellaConEsc);

// Stati: il cerchio e i pulsanti del timer. Questi listener si aggiungono a quelli
// di js/timer.js: prima il timer parte o si ferma, poi cambia lo stato dell'obiettivo.
pulsanteCompleta.addEventListener("click", alternaCompletato);
pulsanteAvvia.addEventListener("click", avviaConObiettivo);
pulsantePausa.addEventListener("click", fermaObiettivoInCorso);
pulsanteStop.addEventListener("click", fermaObiettivoInCorso);

// Tempo lavorato: l'evento "secondo" arriva da js/timer.js mentre il timer conta.
timer.addEventListener("secondo", aggiungiSecondoLavorato);
// A zero il timer si ferma da solo e annuncia "sessione-finita": l'obiettivo non è più
// in corso e le fiammine fatte tornano arancioni. Con Avvia si lavora sulla prossima.
timer.addEventListener("sessione-finita", fermaObiettivoInCorso);

// Uscendo dalla Home (un link del menu, un'altra pagina, la scheda chiusa) il timer
// si ferma con la pagina: pagehide scatta proprio in quel momento e ferma l'obiettivo.
window.addEventListener("pagehide", fermaObiettivoInCorso);

// All'apertura il timer è fermo: nessun obiettivo può essere in corso.
// idScelto è già stato calcolato, quindi l'obiettivo che era in corso resta scelto.
fermaObiettivoInCorso();
// Il blocco compare subito, con l'obiettivo scelto l'ultima volta.
mostraBloccoObiettivo();

// Arrivando dal play della pagina Obiettivi l'indirizzo è index.html?avvia:
// URLSearchParams legge la parte dopo il ?, e has dice se c'è "avvia".
const parametri = new URLSearchParams(location.search);
if (parametri.has("avvia") && idScelto !== null) {
  // replaceState toglie ?avvia dall'indirizzo, senza ricaricare: così una ricarica
  // della pagina non fa ripartire il timer da solo.
  history.replaceState(null, "", location.pathname);
  // click() preme Avvia come farebbe l'utente: partono sia il timer di js/timer.js
  // sia avviaConObiettivo, che mette in corso l'obiettivo scelto.
  pulsanteAvvia.click();
}
