// =====================================================================
// IMPOSTAZIONI-SALVATE.JS: il codice comune per le impostazioni dell'utente
// È un modulo: non è collegato a una pagina, ma viene importato da
// js/fiammine.js e js/timer-salvato.js, che usano le durate, e da
// js/impostazioni.js, la finestra che le fa cambiare.
// Per ora le impostazioni sono due: la durata della fiammina e quella della pausa.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - LIMITI E VALORI DI PARTENZA
//   - LETTURA E SCRITTURA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// =====================================================================

// Lo stesso ?v usato dagli altri file: così il modulo si carica una volta sola.
import { chiaveImpostazioni } from "./archivio.js?v=imp-1";


// =====================================================================
// SEZIONE LIMITI E VALORI DI PARTENZA
// =====================================================================

// Le durate che si possono scegliere, in minuti, e di quanto cambiano con − e +.
// La fiammina va da 10 a 60 minuti: anche con 60 ci stanno 16 fiammine nelle 16 ore.
export const limitiFiammina = { minimo: 10, massimo: 60, passo: 5 };
export const limitiPausa = { minimo: 1, massimo: 30, passo: 1 };

// Le durate di partenza, finché l'utente non le cambia: il classico Pomodoro.
const impostazioniIniziali = { minutiFiammina: 25, minutiPausa: 5 };

// Il nome dell'evento che js/impostazioni.js fa scattare su window dopo ogni cambio:
// chi lo ascolta ridisegna ciò che dipende dalle durate.
export const eventoImpostazioni = "impostazioni-cambiate";


// =====================================================================
// SEZIONE LETTURA E SCRITTURA
// =====================================================================

// Dice se un valore è un numero intero dentro i limiti indicati.
function dentroILimiti(valore, limiti) {
  return Number.isInteger(valore) && valore >= limiti.minimo && valore <= limiti.massimo;
}

// Rilegge le impostazioni salvate. Ogni valore mancante o fuori dai limiti
// torna a quello di partenza, senza toccare l'altro.
export function leggiImpostazioni() {
  let salvate = null;
  try {
    salvate = JSON.parse(localStorage.getItem(chiaveImpostazioni));
  } catch {
    // JSON.parse non è riuscito a leggere il testo: si usano i valori di partenza.
  }
  // ?. legge il campo solo se salvate esiste: con il cassetto vuoto dà undefined, senza errori.
  return {
    minutiFiammina: dentroILimiti(salvate?.minutiFiammina, limitiFiammina)
      ? salvate.minutiFiammina
      : impostazioniIniziali.minutiFiammina,
    minutiPausa: dentroILimiti(salvate?.minutiPausa, limitiPausa)
      ? salvate.minutiPausa
      : impostazioniIniziali.minutiPausa
  };
}

// Scrive le impostazioni nel browser; restituisce false se non ci riesce.
export function scriviImpostazioni(impostazioni) {
  try {
    localStorage.setItem(chiaveImpostazioni, JSON.stringify(impostazioni));
    return true;
  } catch {
    return false;
  }
}
