// =====================================================================
// IMPOSTAZIONI.JS: la finestra delle impostazioni, su tutte le pagine
// La voce Impostazioni del menu apre una finestra al centro, con lo sfondo
// oscurato: a sinistra le sezioni, a destra il loro contenuto.
// Per ora c'è una sezione sola, Fiammina, con le durate della fiammina e della pausa.
// Ogni cambio si salva subito e viene annunciato con l'evento "impostazioni-cambiate".
// È un modulo: i suoi nomi sono privati, non si scontrano con quelli
// degli altri file della pagina.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - ELEMENTI DELLA PAGINA
//   - APERTURA E CHIUSURA
//   - DURATE
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// =====================================================================

// Lo stesso ?v usato dagli altri file: così il modulo si carica una volta sola.
import {
  limitiFiammina,
  limitiPausa,
  eventoImpostazioni,
  leggiImpostazioni,
  scriviImpostazioni
} from "./impostazioni-salvate.js?v=imp-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// =====================================================================

// La voce del menu e il pulsante del menu, per chiuderlo quando si apre la finestra.
const pulsanteImpostazioni = document.getElementById("settings-button");
const pulsanteMenu = document.getElementById("menu-button");

// La finestra e il suo pulsante di chiusura.
const finestra = document.getElementById("settings-dialog");
const pulsanteChiudi = document.getElementById("settings-close");

// I due regolatori: ognuno ha −, il valore e +.
const valoreFiammina = document.getElementById("settings-flame-value");
const menoFiammina = document.getElementById("settings-flame-less");
const piuFiammina = document.getElementById("settings-flame-more");
const valorePausa = document.getElementById("settings-break-value");
const menoPausa = document.getElementById("settings-break-less");
const piuPausa = document.getElementById("settings-break-more");


// =====================================================================
// SEZIONE APERTURA E CHIUSURA
// <dialog> è un elemento HTML fatto apposta per le finestre: showModal() la apre
// sopra la pagina, oscura lo sfondo con ::backdrop, tiene il focus dentro
// e la chiude da solo con Esc.
// =====================================================================

// Apre la finestra con le durate attuali, e chiude il menu laterale se è aperto.
function apriImpostazioni() {
  if (pulsanteMenu.classList.contains("active")) {
    // click() preme il pulsante del menu: js/menu.js lo chiude come farebbe l'utente.
    pulsanteMenu.click();
  }
  mostraDurate();
  finestra.showModal();
}

// Chiude la finestra.
function chiudiImpostazioni() {
  finestra.close();
}

// Chiude la finestra con un clic sullo sfondo oscurato.
function chiudiImpostazioniFuori(evento) {
  // Lo sfondo (::backdrop) fa parte del dialog: un clic lì ha come target il dialog stesso,
  // mentre un clic sul contenuto ha come target un elemento al suo interno.
  if (evento.target === finestra) {
    chiudiImpostazioni();
  }
}


// =====================================================================
// SEZIONE DURATE
// I regolatori della fiammina e della pausa: − e + cambiano il valore
// di un passo, entro i limiti, e lo salvano subito.
// =====================================================================

// Scrive nella finestra le durate salvate e disattiva − e + agli estremi.
function mostraDurate() {
  const impostazioni = leggiImpostazioni();
  valoreFiammina.textContent = impostazioni.minutiFiammina + " min";
  menoFiammina.disabled = impostazioni.minutiFiammina <= limitiFiammina.minimo;
  piuFiammina.disabled = impostazioni.minutiFiammina >= limitiFiammina.massimo;
  valorePausa.textContent = impostazioni.minutiPausa + " min";
  menoPausa.disabled = impostazioni.minutiPausa <= limitiPausa.minimo;
  piuPausa.disabled = impostazioni.minutiPausa >= limitiPausa.massimo;
}

// Cambia una durata di un passo (direzione: -1 per −, +1 per +), la salva e lo annuncia.
// campo è il nome della durata: "minutiFiammina" o "minutiPausa".
function cambiaDurata(campo, limiti, direzione) {
  const impostazioni = leggiImpostazioni();
  // Math.min e Math.max tengono il nuovo valore dentro i limiti.
  const nuovoValore = Math.min(Math.max(impostazioni[campo] + direzione * limiti.passo, limiti.minimo), limiti.massimo);
  if (nuovoValore === impostazioni[campo]) {
    return;
  }
  // Le parentesi quadre usano il contenuto di campo come nome della proprietà:
  // con campo = "minutiPausa", [campo]: 6 equivale a minutiPausa: 6.
  if (!scriviImpostazioni({ ...impostazioni, [campo]: nuovoValore })) {
    return;
  }
  mostraDurate();
  // Le pagine aperte ascoltano questo evento: le fiammine, il timer e gli obiettivi
  // si aggiornano subito con le durate nuove.
  window.dispatchEvent(new Event(eventoImpostazioni));
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// =====================================================================

// Apertura e chiusura.
pulsanteImpostazioni.addEventListener("click", apriImpostazioni);
pulsanteChiudi.addEventListener("click", chiudiImpostazioni);
finestra.addEventListener("click", chiudiImpostazioniFuori);

// I regolatori: ogni pulsante chiama cambiaDurata con la sua durata e la sua direzione.
menoFiammina.addEventListener("click", () => cambiaDurata("minutiFiammina", limitiFiammina, -1));
piuFiammina.addEventListener("click", () => cambiaDurata("minutiFiammina", limitiFiammina, 1));
menoPausa.addEventListener("click", () => cambiaDurata("minutiPausa", limitiPausa, -1));
piuPausa.addEventListener("click", () => cambiaDurata("minutiPausa", limitiPausa, 1));
