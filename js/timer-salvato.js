// =====================================================================
// TIMER-SALVATO.JS: il codice comune per il timer salvato nel browser
// È un modulo: non è collegato a una pagina, ma viene importato da
// js/timer.js, che fa contare il timer nella Home, e da js/obiettivi.js,
// che legge il timer per mostrare in diretta il tempo dell'obiettivo in corso.
// Qui non c'è niente della pagina: solo i dati salvati e i conti sull'orologio.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - DURATE
//   - LETTURA E SCRITTURA
//   - CONTI SULL'OROLOGIO
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// La durata di una fiammina e la chiave del timer arrivano dai moduli comuni.
// =====================================================================

// Gli stessi ?v usati dagli altri file: così ogni modulo si carica una volta sola.
import { minutiPerFiammina } from "./fiammine.js?v=imp-1";
import { chiaveTimer } from "./archivio.js?v=imp-1";
import { leggiImpostazioni } from "./impostazioni-salvate.js?v=imp-1";


// =====================================================================
// SEZIONE DURATE
// Il timer alterna due modalità: "fiammina", il lavoro, e "pausa", il riposo
// che segue ogni fiammina finita. Le loro durate si scelgono nelle Impostazioni.
// =====================================================================

// Restituisce la durata, in secondi, di una nuova sessione nella modalità indicata.
// Legge le durate di adesso: con fiammine da 25 minuti, 25 × 60 = 1500 secondi;
// con la pausa da 5 minuti, 5 × 60 = 300 secondi.
export function durataDi(modalita) {
  const minuti = modalita === "pausa" ? leggiImpostazioni().minutiPausa : minutiPerFiammina;
  return minuti * 60;
}


// =====================================================================
// SEZIONE LETTURA E SCRITTURA
// Il timer salvato è un oggetto con sei dati:
//   modalita    "fiammina" o "pausa"
//   durata      i secondi di questa sessione: restano gli stessi anche se nel frattempo
//               la durata cambia nelle Impostazioni, che vale dalla sessione dopo
//   fine        l'ora in cui la sessione finisce (millisecondi), o null se è fermo
//   rimanenti   i secondi che mancano, fermi durante la pausa del pulsante Pausa
//   avviata     true da Avvia fino a Stop o alla fine della sessione
//   annunciati  i secondi di questa fiammina già dati all'obiettivo (0 in pausa)
// =====================================================================

// Rilegge il timer salvato. Se manca o non è valido, restituisce una fiammina ferma a 25:00.
export function leggiTimer() {
  try {
    const dati = JSON.parse(localStorage.getItem(chiaveTimer));
    // ?. legge modalita solo se dati esiste: se il cassetto è vuoto (null) dà undefined
    // invece di un errore. ?? dà il valore a destra quando quello a sinistra manca
    // (null o undefined): un timer salvato prima che esistesse la pausa non ha modalita,
    // ed era una fiammina.
    const modalita = dati?.modalita ?? "fiammina";
    // Anche la durata manca nei timer salvati prima delle Impostazioni: era quella di sempre.
    const durata = dati?.durata ?? durataDi(modalita);
    // Number.isInteger controlla che sia un numero intero: niente testo, null o decimali.
    // I secondi rimanenti e quelli annunciati stanno tra 0 e la durata della sessione.
    const valido = dati !== null
      && (modalita === "fiammina" || modalita === "pausa")
      && Number.isInteger(durata) && durata > 0
      && (dati.fine === null || typeof dati.fine === "number")
      && Number.isInteger(dati.rimanenti) && dati.rimanenti >= 0 && dati.rimanenti <= durata
      && typeof dati.avviata === "boolean"
      && Number.isInteger(dati.annunciati) && dati.annunciati >= 0 && dati.annunciati <= durata;
    if (valido) {
      // ...dati copia i dati salvati; modalita e durata, scritte dopo, ci sono sempre.
      return { ...dati, modalita: modalita, durata: durata };
    }
  } catch {
    // JSON.parse non è riuscito a leggere il testo: si continua con il timer fermo qui sotto.
  }
  const durata = durataDi("fiammina");
  return { modalita: "fiammina", durata: durata, fine: null, rimanenti: durata, avviata: false, annunciati: 0 };
}

// Scrive il timer nel browser. Se non ci riesce, il timer funziona lo stesso,
// ma solo finché la pagina resta aperta.
export function scriviTimer(dati) {
  try {
    localStorage.setItem(chiaveTimer, JSON.stringify(dati));
  } catch {
    // Niente da fare: il timer resta in memoria.
  }
}


// =====================================================================
// SEZIONE CONTI SULL'OROLOGIO
// =====================================================================

// Calcola quanti secondi mancano all'ora di fine, guardando l'orologio.
export function calcolaSecondiRimanenti(fine) {
  // Date.now() è l'ora attuale in millisecondi: la differenza / 1000 dà i secondi.
  // Math.ceil arrotonda per eccesso, così si legge 25:00 per tutto il primo secondo;
  // Math.max non scende sotto zero se la fine è già passata, per esempio mentre eri altrove.
  return Math.max(0, Math.ceil((fine - Date.now()) / 1000));
}

// I secondi lavorati in questa fiammina che l'obiettivo non ha ancora ricevuto.
// Sono quelli che la Home darà all'obiettivo in corso la prossima volta che conta;
// la pagina Obiettivi li aggiunge solo a quello che mostra, per vederli crescere in diretta.
export function secondiNonAnnunciati(dati) {
  // In pausa non si lavora: non c'è niente da dare all'obiettivo.
  if (dati.modalita === "pausa") {
    return 0;
  }
  // Con il timer fermo i rimanenti salvati sono quelli giusti; mentre conta si guardano sull'orologio.
  const rimanenti = dati.fine === null ? dati.rimanenti : calcolaSecondiRimanenti(dati.fine);
  const trascorsi = dati.durata - rimanenti;
  return Math.max(0, trascorsi - dati.annunciati);
}
