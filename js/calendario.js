// =====================================================================
// CALENDARIO.JS: il calendario della data prevista, nel modulo degli obiettivi
// È un modulo: viene importato da js/obiettivi.js, che legge la data scelta
// dal campo nascosto #goal-date e usa scriviData e apriCalendario.
// Sostituisce il campo data del browser, che non si può adattare allo stile del sito.
//
// Sezioni, nell'ordine:
//   - ELEMENTI E STATO
//   - DATE
//   - DISEGNO DEL MESE
//   - APERTURA E CHIUSURA
//   - SCELTA DELLA DATA E TASTIERA
//   - EVENTI
// =====================================================================


// =====================================================================
// SEZIONE ELEMENTI E STATO
// =====================================================================

const contenitore = document.getElementById("goal-date-picker");
const pulsanteData = document.getElementById("goal-date-button");
const testoData = document.getElementById("goal-date-text");
// Il campo nascosto: il suo value, per esempio "2026-10-19", è la data salvata nell'obiettivo.
const campoData = document.getElementById("goal-date");
const finestrella = document.getElementById("goal-date-panel");
const titoloMese = document.getElementById("goal-date-month");
const pulsanteMesePrima = document.getElementById("goal-date-prev");
const pulsanteMeseDopo = document.getElementById("goal-date-next");
const grigliaGiorni = document.getElementById("goal-date-days");
const pulsanteOggi = document.getElementById("goal-date-today");

// Il mese mostrato nel calendario. Come in Date, i mesi partono da 0: gennaio è 0, ottobre è 9.
let annoMostrato = 0;
let meseMostrato = 0;

// Chi ha scelto di ridurre le animazioni nel sistema non vede i mesi scorrere.
const pocheAnimazioni = window.matchMedia("(prefers-reduced-motion: reduce)");


// =====================================================================
// SEZIONE DATE
// =====================================================================

// Scrive una data nel formato del campo: (2026, 9, 5) → "2026-10-05".
function comeTesto(anno, mese, giorno) {
  // Il mese del testo parte da 1, quello di Date da 0; padStart aggiunge lo zero: 5 → "05".
  return anno + "-" + String(mese + 1).padStart(2, "0") + "-" + String(giorno).padStart(2, "0");
}

// La data di oggi, nel formato del campo.
function oggiComeTesto() {
  const oggi = new Date();
  return comeTesto(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
}

// Da "2026-10-05" a un oggetto Date. "T00:00" la legge come mezzanotte locale,
// come formattaData in js/obiettivi.js.
function daTesto(testo) {
  return new Date(testo + "T00:00");
}

// Quante caselle vuote vanno prima del giorno 1 e quanti giorni ha il mese.
// La settimana parte dal lunedì, come nei calendari italiani.
// Esempio: ottobre 2026 (anno 2026, mese 9) inizia di giovedì e ha 31 giorni → { vuoti: 3, giorni: 31 }.
function giorniDelMese(anno, mese) {
  // getDay conta dalla domenica: domenica 0, lunedì 1 ... sabato 6.
  // + 6 e % 7 spostano l'inizio al lunedì: lunedì 0 ... sabato 5, domenica 6.
  const vuoti = (new Date(anno, mese, 1).getDay() + 6) % 7;
  // Il giorno 0 di un mese è l'ultimo giorno del mese prima:
  // il giorno 0 di novembre è il 31 ottobre, quindi ottobre ha 31 giorni.
  const giorni = new Date(anno, mese + 1, 0).getDate();
  return { vuoti, giorni };
}


// =====================================================================
// SEZIONE DISEGNO DEL MESE
// =====================================================================

// Ridisegna il titolo e i giorni del mese mostrato. direzione è 1 andando avanti,
// -1 tornando indietro e 0 all'apertura: decide da che lato scorrono i giorni.
function disegnaMese(direzione = 0) {
  const { vuoti, giorni } = giorniDelMese(annoMostrato, meseMostrato);
  const oggi = oggiComeTesto();

  // "ottobre 2026": il CSS mette la maiuscola alla prima lettera.
  titoloMese.textContent = new Date(annoMostrato, meseMostrato)
    .toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  grigliaGiorni.replaceChildren();
  // Le caselle vuote spingono il giorno 1 sotto il suo giorno della settimana.
  for (let casella = 0; casella < vuoti; casella++) {
    grigliaGiorni.append(document.createElement("span"));
  }

  for (let giorno = 1; giorno <= giorni; giorno++) {
    const valore = comeTesto(annoMostrato, meseMostrato, giorno);
    const pulsante = document.createElement("button");
    pulsante.type = "button";
    pulsante.className = "date-day";
    pulsante.textContent = giorno;
    // data-data ricorda la data del pulsante: al clic sappiamo quale giorno è stato scelto.
    pulsante.dataset.data = valore;
    // Il lettore di schermo legge "19 ottobre 2026" invece del solo "19".
    pulsante.setAttribute("aria-label", daTesto(valore)
      .toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }));
    // aria-pressed segna il giorno scelto, aria-current="date" quello di oggi: il CSS li colora.
    pulsante.setAttribute("aria-pressed", String(valore === campoData.value));
    if (valore === oggi) {
      pulsante.setAttribute("aria-current", "date");
    }
    // I testi "2026-10-05" si confrontano come le date: "2026-10-05" < "2026-10-19" è vero.
    pulsante.classList.toggle("is-past", valore < oggi);
    // Solo un giorno si raggiunge con Tab: gli altri con le frecce (vedi spostaFocus).
    pulsante.tabIndex = -1;
    grigliaGiorni.append(pulsante);
  }

  // Il primo giorno raggiungibile con Tab: quello scelto, altrimenti oggi, altrimenti il giorno 1.
  const raggiungibile = grigliaGiorni.querySelector('[aria-pressed="true"]')
    ?? grigliaGiorni.querySelector('[aria-current="date"]')
    ?? grigliaGiorni.querySelector(".date-day");
  raggiungibile.tabIndex = 0;

  // animate fa scorrere i giorni nuovi dal lato giusto: da destra andando avanti.
  if (direzione !== 0 && !pocheAnimazioni.matches) {
    grigliaGiorni.animate(
      [{ opacity: 0, translate: direzione * 24 + "px 0" }, { opacity: 1, translate: "0 0" }],
      { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
  }
}

// Passa al mese prima (-1) o dopo (1). new Date sistema da solo i mesi fuori misura:
// il mese 12 del 2026 diventa gennaio 2027, il mese -1 diventa dicembre dell'anno prima.
function cambiaMese(direzione) {
  const primoDelMese = new Date(annoMostrato, meseMostrato + direzione, 1);
  annoMostrato = primoDelMese.getFullYear();
  meseMostrato = primoDelMese.getMonth();
  disegnaMese(direzione);
}


// =====================================================================
// SEZIONE APERTURA E CHIUSURA
// =====================================================================

// Apre il calendario sul mese della data scelta o, se non c'è, sul mese di oggi.
export function apriCalendario() {
  const data = daTesto(campoData.value || oggiComeTesto());
  annoMostrato = data.getFullYear();
  meseMostrato = data.getMonth();
  disegnaMese();

  finestrella.hidden = false;
  pulsanteData.setAttribute("aria-expanded", "true");
  // Il focus va sul giorno raggiungibile: con la tastiera si sceglie subito con le frecce.
  grigliaGiorni.querySelector('[tabindex="0"]').focus();
}

export function chiudiCalendario() {
  finestrella.hidden = true;
  pulsanteData.setAttribute("aria-expanded", "false");
}

function alternaCalendario() {
  if (finestrella.hidden) {
    apriCalendario();
  } else {
    chiudiCalendario();
  }
}

// Un clic fuori dal campo e dal calendario lo chiude.
function chiudiCalendarioFuori(evento) {
  if (!finestrella.hidden && !contenitore.contains(evento.target)) {
    chiudiCalendario();
  }
}


// =====================================================================
// SEZIONE SCELTA DELLA DATA E TASTIERA
// =====================================================================

// Scrive una data nel campo nascosto e nel pulsante. Con "" il campo si svuota.
// js/obiettivi.js la usa per riempire il modulo in modifica e per svuotarlo.
export function scriviData(valore) {
  campoData.value = valore;
  const vuota = valore === "";
  if (vuota) {
    testoData.textContent = "Scegli una data";
  } else if (valore === oggiComeTesto()) {
    // Se la data scelta è oggi si legge "Oggi", come nella lista degli obiettivi.
    testoData.textContent = "Oggi";
  } else {
    // Nella barra c'è poco spazio: "3 nov". L'anno si aggiunge solo se non è quello di adesso.
    const data = daTesto(valore);
    const opzioni = data.getFullYear() === new Date().getFullYear()
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "short", year: "numeric" };
    testoData.textContent = data.toLocaleDateString("it-IT", opzioni);
  }
  // is-empty rende grigio il testo "Scegli una data", come il segnaposto di un campo.
  testoData.classList.toggle("is-empty", vuota);
}

// Sceglie una data, chiude il calendario e riporta il focus sul campo.
function scegliData(valore) {
  scriviData(valore);
  chiudiCalendario();
  pulsanteData.focus();
}

// Un clic su un giorno. closest trova il pulsante anche se il clic arriva su un suo figlio;
// sulle caselle vuote dà null e non succede niente.
function sceltaDaClic(evento) {
  const giorno = evento.target.closest(".date-day");
  if (giorno !== null) {
    scegliData(giorno.dataset.data);
  }
}

// Sposta il focus di alcuni giorni: -1 a sinistra, 7 in giù. Se si esce dal mese,
// il calendario passa a quello giusto. new Date(2026, 9, 32) è il 1° novembre.
function spostaFocus(giorni) {
  const attuale = daTesto(document.activeElement.dataset.data);
  const nuova = new Date(attuale.getFullYear(), attuale.getMonth(), attuale.getDate() + giorni);
  const direzione = Math.sign(nuova - attuale);
  if (nuova.getMonth() !== meseMostrato || nuova.getFullYear() !== annoMostrato) {
    annoMostrato = nuova.getFullYear();
    meseMostrato = nuova.getMonth();
    disegnaMese(direzione);
  }
  const valore = comeTesto(nuova.getFullYear(), nuova.getMonth(), nuova.getDate());
  const pulsante = grigliaGiorni.querySelector(`[data-data="${valore}"]`);
  grigliaGiorni.querySelector('[tabindex="0"]').tabIndex = -1;
  pulsante.tabIndex = 0;
  pulsante.focus();
}

// Le frecce si muovono fra i giorni; Invio e Spazio li scelgono già da soli, perché sono pulsanti.
const passiDelleFrecce = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

function gestisciTastiGiorni(evento) {
  const passo = passiDelleFrecce[evento.key];
  if (passo !== undefined && evento.target.matches(".date-day")) {
    // preventDefault evita che le frecce facciano anche scorrere la pagina.
    evento.preventDefault();
    spostaFocus(passo);
  }
}

// Esc chiude il calendario e riporta il focus sul campo.
function chiudiCalendarioConEsc(evento) {
  if (evento.key === "Escape" && !finestrella.hidden) {
    chiudiCalendario();
    pulsanteData.focus();
  }
}


// =====================================================================
// SEZIONE EVENTI
// =====================================================================

pulsanteData.addEventListener("click", alternaCalendario);
pulsanteMesePrima.addEventListener("click", () => cambiaMese(-1));
pulsanteMeseDopo.addEventListener("click", () => cambiaMese(1));
pulsanteOggi.addEventListener("click", () => scegliData(oggiComeTesto()));
grigliaGiorni.addEventListener("click", sceltaDaClic);
grigliaGiorni.addEventListener("keydown", gestisciTastiGiorni);
document.addEventListener("click", chiudiCalendarioFuori);
document.addEventListener("keydown", chiudiCalendarioConEsc);
