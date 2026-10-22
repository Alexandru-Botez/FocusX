// =====================================================================
// FIAMMINE.JS: il codice comune delle fiammine
// È un modulo: non è collegato a una pagina, ma viene importato da
// js/obiettivi.js e js/home-obiettivo.js. Così il valore di una fiammina
// e il loro disegno sono scritti una volta sola: cambiandoli qui,
// cambiano in tutte le pagine.
//
// Sezioni, nell'ordine:
//   - IMPOSTAZIONI DELLE FIAMMINE
//   - TESTI
//   - DISEGNO DELLE FIAMMINE E DEL TEMPO
// =====================================================================


// =====================================================================
// SEZIONE IMPOSTAZIONI DELLE FIAMMINE
// I valori delle fiammine: export li rende disponibili ai file che li importano.
// La durata di una fiammina si sceglie nelle Impostazioni, quindi può cambiare
// mentre la pagina è aperta: per questo minutiPerFiammina e fiammineMassime sono let.
// =====================================================================

import { eventoImpostazioni, leggiImpostazioni } from "./impostazioni-salvate.js?v=imp-1";

// Quanti minuti vale una fiammina: 25 finché non si cambia nelle Impostazioni.
export let minutiPerFiammina = leggiImpostazioni().minutiFiammina;
// Le prime cinque fiammine si cliccano direttamente; dalla sesta si sceglie nella finestrella.
// Nelle liste, oltre cinque si vede una sola fiammina seguita dal numero.
export const fiammineVisibili = 5;
// Il limite è di tempo, non di fiammine: al massimo 16 ore, sia per la previsione
// sia per il tempo lavorato. Math.floor tiene solo le fiammine intere
// che ci stanno: con 25 minuti sono 38 (15 h 50 min), perché 39 supererebbero le 16 ore.
export const oreMassime = 16;
export let fiammineMassime = Math.floor(oreMassime * 60 / minutiPerFiammina);

// Quando la durata cambia nelle Impostazioni, aggiorniamo i due valori.
// Un let esportato è un collegamento, non una copia: i file che lo importano
// leggono subito il valore nuovo. Questo modulo parte prima delle pagine che lo importano,
// quindi il suo listener scatta per primo e le pagine trovano i valori già aggiornati.
window.addEventListener(eventoImpostazioni, () => {
  minutiPerFiammina = leggiImpostazioni().minutiFiammina;
  fiammineMassime = Math.floor(oreMassime * 60 / minutiPerFiammina);
});
// Per completare un obiettivo bisogna averci lavorato almeno un minuto (60 secondi).
export const minutiPerCompletare = 1;

// Dice se un obiettivo ha troppo poco tempo lavorato per essere completato.
// < e non <=: con 60 secondi esatti minutiLavorati vale 1, e 1 < 1 è falso, quindi si può.
// Con 59 secondi vale 0,98..., e 0,98 < 1 è vero: il cerchio resta disattivato.
export function lavoroInsufficiente(obiettivo) {
  return obiettivo.minutiLavorati < minutiPerCompletare;
}


// =====================================================================
// SEZIONE TESTI
// Trasformano un numero di fiammine nel testo che si legge nella pagina.
// =====================================================================

// Scrive un numero intero di minuti in ore e minuti: 50 → "50 min"; 75 → "1 h 15 min".
export function formattaMinuti(minuti) {
  // Math.floor arrotonda per difetto; % è il resto della divisione.
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  if (ore === 0) {
    return minuti + " min";
  }
  return resto === 0 ? ore + " h" : ore + " h " + resto + " min";
}

// Scrive il tempo di un certo numero di fiammine in ore e minuti.
export function formattaTempo(fiammine) {
  // 2 fiammine → "50 min"; 3 fiammine → "1 h 15 min"; 8 fiammine → "3 h 20 min".
  return formattaMinuti(fiammine * minutiPerFiammina);
}

// Scrive il numero di fiammine all'italiana, con al massimo un decimale.
export function formattaNumeroFiammine(fiammine) {
  // Il numero con al massimo un decimale e la virgola italiana: 12 → "12", 12.4 → "12,4".
  // Oggi le fiammine sono intere; il decimale servirà per il tempo trascorso "in corso".
  return fiammine.toLocaleString("it-IT", { maximumFractionDigits: 1 });
}


// =====================================================================
// SEZIONE DISEGNO DELLE FIAMMINE E DEL TEMPO
// Mostra le fiammine di un obiettivo nei cinque svg di una voce,
// quante se ne vedono e quale aspetto ha ognuna, e il suo tempo:
// lavorato / previsto.
// =====================================================================

// Disegna le fiammine di un obiettivo: icone sono i cinque svg, numero lo span del 🔥12.
export function disegnaFiammine(icone, numero, obiettivo) {
  // Fino a cinque fiammine si vedono tutte; oltre, una sola fiammina seguita dal numero: 🔥12.
  const tante = obiettivo.fiammine > fiammineVisibili;
  const fiammineDaMostrare = tante ? 1 : obiettivo.fiammine;
  // Ogni fiammina ha uno di tre aspetti: vuota (da fare), is-current (quella da completare,
  // azzurra e tremolante) o is-done (fatta, piena e accesa). Una fiammina è fatta per ogni
  // 25 minuti lavorati, anche da completato: si può finire un obiettivo prima del previsto,
  // e le fiammine mostrano il tempo davvero lavorato. Quella dopo le fatte si riempie
  // in parte con il tempo che non arriva a una fiammina intera.
  // Math.floor tiene solo le fiammine intere: con 60 minuti lavorati e fiammine da 25 ne sono fatte 2.
  // Math.min non ne fa contare più di quelle previste, se si lavora oltre.
  const fiammineFatte = Math.min(obiettivo.fiammine, Math.floor(obiettivo.minutiLavorati / minutiPerFiammina));
  // Oltre cinque, la sola fiammina visibile le rappresenta tutte: è fatta solo quando
  // lo sono tutte, e altrimenti è lei quella da completare.
  const posizioneDaCompletare = tante ? 0 : fiammineFatte;

  icone.forEach((fiammina, posizione) => {
    // Gli svg non hanno la proprietà hidden degli elementi HTML: toggleAttribute
    // aggiunge l'attributo hidden quando la condizione è vera e lo toglie quando è falsa.
    fiammina.toggleAttribute("hidden", posizione >= fiammineDaMostrare);
    const fatta = tante ? fiammineFatte === obiettivo.fiammine : posizione < fiammineFatte;
    // Come hidden, anche classList funziona sugli svg.
    fiammina.classList.toggle("is-done", fatta);
    fiammina.classList.toggle("is-current",
      obiettivo.stato === "in-corso" && !fatta && posizione === posizioneDaCompletare);

    // Quanto è piena la fiammina, da 0 a 1, con il tempo lavorato oltre le fiammine fatte.
    // Con 55 minuti su 4 fiammine: le prime 2 sono fatte, la terza ha 55 - 50 = 5 minuti
    // su 25, cioè 0.2, e la quarta resta vuota. Oltre cinque, la sola fiammina visibile
    // si riempie con tutto il lavorato rispetto a tutto il previsto: 1 h su 5 h è 0.2.
    let riempimento = 0;
    if (tante) {
      riempimento = Math.min(1, obiettivo.minutiLavorati / (obiettivo.fiammine * minutiPerFiammina));
    } else if (posizione === fiammineFatte) {
      riempimento = (obiettivo.minutiLavorati - fiammineFatte * minutiPerFiammina) / minutiPerFiammina;
    }
    // setProperty scrive una variabile CSS nello stile della fiammina: il CSS la legge
    // con var(--riempimento) e taglia il riempimento a quell'altezza. 0.2 diventa "20%".
    fiammina.style.setProperty("--riempimento", riempimento * 100 + "%");
  });

  numero.hidden = !tante;
  numero.textContent = formattaNumeroFiammine(obiettivo.fiammine);
}

// Scrive il tempo di un obiettivo come "lavorato / previsto", per esempio "10 min / 1 h 15 min".
// contenitore è lo span che ha dentro .goal-worked e .goal-planned.
export function mostraTempo(contenitore, obiettivo) {
  // Math.floor conta solo i minuti interi: con 10 min e 40 s lavorati si legge "10 min".
  // Il lavorato può superare il previsto: si può continuare finché non si completa.
  contenitore.querySelector(".goal-worked").textContent =
    formattaMinuti(Math.floor(obiettivo.minutiLavorati));
  contenitore.querySelector(".goal-planned").textContent = formattaTempo(obiettivo.fiammine);
}
