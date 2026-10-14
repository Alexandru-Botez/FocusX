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
// Il limite è di tempo, non di fiammine: al massimo 16 ore, sia per la previsione
// sia per il tempo lavorato. Math.floor tiene solo le fiammine intere
// che ci stanno: con 25 minuti sono 38 (15 h 50 min), perché 39 supererebbero le 16 ore.
export const oreMassime = 16;
export const fiammineMassime = Math.floor(oreMassime * 60 / minutiPerFiammina);


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

// Scrive il tempo che manca per finire le fiammine previste: scende mentre si lavora.
export function formattaTempoRimasto(obiettivo) {
  const minutiPrevisti = obiettivo.fiammine * minutiPerFiammina;
  // Un obiettivo completato non ha più niente da fare. Negli altri casi togliamo il lavorato,
  // e Math.max non scende sotto zero se si è lavorato più del previsto.
  const minutiRimasti = obiettivo.stato === "completato"
    ? 0
    : Math.max(0, minutiPrevisti - obiettivo.minutiLavorati);
  // Math.ceil arrotonda per eccesso: con 24 min e 30 s rimasti si legge ancora "25 min",
  // e il numero scende solo quando è passato un minuto intero.
  return formattaMinuti(Math.ceil(minutiRimasti));
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
  // azzurra e tremolante) o is-done (fatta, piena e accesa). Un obiettivo completato
  // ha tutte le fiammine fatte; negli altri una fiammina è fatta per ogni 25 minuti lavorati.
  // Math.floor tiene solo le fiammine intere: con 60 minuti lavorati ne sono fatte 2.
  // Math.min non ne fa contare più di quelle previste, se si lavora oltre.
  const fiammineFatte = obiettivo.stato === "completato"
    ? obiettivo.fiammine
    : Math.min(obiettivo.fiammine, Math.floor(obiettivo.minutiLavorati / minutiPerFiammina));
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
