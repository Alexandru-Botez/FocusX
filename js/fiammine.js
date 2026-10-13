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
//   - DISEGNO DELLE FIAMMINE
// =====================================================================


// =====================================================================
// SEZIONE IMPOSTAZIONI DELLE FIAMMINE
// Valori fissi: export li rende disponibili ai file che li importano.
// =====================================================================

// Per ora ogni fiammina vale 25 minuti: cambiando questo numero cambia tutto il calcolo.
export const minutiPerFiammina = 25;
// Le prime otto fiammine si cliccano direttamente; dalla nona si sceglie nella finestrella.
// Nelle liste, oltre otto si vede una sola fiammina seguita dal numero.
export const fiammineVisibili = 8;
// Il limite è di tempo, non di fiammine: al massimo 16 ore, per la previsione
// e in futuro anche per il tempo trascorso. Math.floor tiene solo le fiammine intere
// che ci stanno: con 25 minuti sono 38 (15 h 50 min), perché 39 supererebbero le 16 ore.
export const oreMassime = 16;
export const fiammineMassime = Math.floor(oreMassime * 60 / minutiPerFiammina);


// =====================================================================
// SEZIONE TESTI
// Trasformano un numero di fiammine nel testo che si legge nella pagina.
// =====================================================================

// Scrive il tempo di un certo numero di fiammine in ore e minuti.
export function formattaTempo(fiammine) {
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

// Scrive il numero di fiammine all'italiana, con al massimo un decimale.
export function formattaNumeroFiammine(fiammine) {
  // Il numero con al massimo un decimale e la virgola italiana: 12 → "12", 12.4 → "12,4".
  // Oggi le fiammine sono intere; il decimale servirà per il tempo trascorso "in corso".
  return fiammine.toLocaleString("it-IT", { maximumFractionDigits: 1 });
}


// =====================================================================
// SEZIONE DISEGNO DELLE FIAMMINE
// Mostra le fiammine di un obiettivo negli otto svg di una voce:
// quante se ne vedono e quale aspetto ha ognuna.
// =====================================================================

// Disegna le fiammine di un obiettivo: icone sono gli otto svg, numero lo span del 🔥12.
export function disegnaFiammine(icone, numero, obiettivo) {
  // Fino a otto fiammine si vedono tutte; oltre, una sola fiammina seguita dal numero: 🔥12.
  const tante = obiettivo.fiammine > fiammineVisibili;
  const fiammineDaMostrare = tante ? 1 : obiettivo.fiammine;
  // Ogni fiammina ha uno di tre aspetti: vuota (da fare), is-current (quella da completare,
  // azzurra e tremolante) o is-done (fatta, piena e accesa). Il tempo lavorato non lo misuriamo
  // ancora: un obiettivo completato ha tutte le fiammine fatte, gli altri nessuna.
  const fiammineFatte = obiettivo.stato === "completato" ? obiettivo.fiammine : 0;
  // Oltre otto, la sola fiammina visibile le rappresenta tutte: è fatta solo quando
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
  });

  numero.hidden = !tante;
  numero.textContent = formattaNumeroFiammine(obiettivo.fiammine);
}
