// =====================================================================
// TIMER-SALVATO.JS: il codice comune per il timer salvato nel browser
// È un modulo: non è collegato a una pagina, ma viene importato da
// js/timer.js, che fa contare il timer nella Home, e da js/obiettivi.js,
// che legge il timer per mostrare in diretta il tempo dell'obiettivo in corso.
// Qui non c'è niente della pagina: solo i dati salvati e i conti sull'orologio.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - DURATA
//   - LETTURA E SCRITTURA
//   - CONTI SULL'OROLOGIO
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// La durata di una fiammina e la chiave del timer arrivano dai moduli comuni.
// =====================================================================

// Gli stessi ?v usati dagli altri file: così ogni modulo si carica una volta sola.
import { minutiPerFiammina } from "./fiammine.js?v=minuto-1";
import { chiaveTimer } from "./archivio.js?v=timer-1";


// =====================================================================
// SEZIONE DURATA
// =====================================================================

// Una sessione dura quanto una fiammina, così ogni sessione finita è una fiammina fatta.
// Lavoriamo in secondi: 25 minuti sono 25 × 60 = 1500 secondi.
export const durataSessione = minutiPerFiammina * 60;


// =====================================================================
// SEZIONE LETTURA E SCRITTURA
// Il timer salvato è un oggetto con quattro dati:
//   fine        l'ora in cui la sessione finisce (millisecondi), o null se è fermo
//   rimanenti   i secondi che mancano, fermi durante la pausa
//   avviata     true da Avvia fino a Stop o alla fine della sessione
//   annunciati  i secondi di questa sessione già dati all'obiettivo
// =====================================================================

// Rilegge il timer salvato. Se manca o non è valido, restituisce un timer fermo a 25:00.
export function leggiTimer() {
  try {
    const dati = JSON.parse(localStorage.getItem(chiaveTimer));
    // Number.isInteger controlla che sia un numero intero: niente testo, null o decimali.
    // I secondi devono stare tra 0 e la durata: se un giorno la durata cambia,
    // una sessione salvata più lunga non è più valida.
    const valido = dati !== null
      && (dati.fine === null || typeof dati.fine === "number")
      && Number.isInteger(dati.rimanenti) && dati.rimanenti >= 0 && dati.rimanenti <= durataSessione
      && typeof dati.avviata === "boolean"
      && Number.isInteger(dati.annunciati) && dati.annunciati >= 0 && dati.annunciati <= durataSessione;
    if (valido) {
      return dati;
    }
  } catch {
    // JSON.parse non è riuscito a leggere il testo: si continua con il timer fermo qui sotto.
  }
  return { fine: null, rimanenti: durataSessione, avviata: false, annunciati: 0 };
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

// I secondi lavorati in questa sessione che l'obiettivo non ha ancora ricevuto.
// Sono quelli che la Home darà all'obiettivo in corso la prossima volta che conta;
// la pagina Obiettivi li aggiunge solo a quello che mostra, per vederli crescere in diretta.
export function secondiNonAnnunciati(dati) {
  // In pausa i rimanenti salvati sono quelli giusti; mentre conta si guardano sull'orologio.
  const rimanenti = dati.fine === null ? dati.rimanenti : calcolaSecondiRimanenti(dati.fine);
  const trascorsi = durataSessione - rimanenti;
  return Math.max(0, trascorsi - dati.annunciati);
}
