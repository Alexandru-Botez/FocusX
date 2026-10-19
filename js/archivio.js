// =====================================================================
// ARCHIVIO.JS: il codice comune per leggere i dati salvati nel browser
// È un modulo: non è collegato a una pagina, ma viene importato da
// js/progetti.js, js/obiettivi.js, js/home-obiettivo.js, js/timer-salvato.js
// e js/impostazioni-salvate.js.
// Solo i nomi scritti con export si possono importare dagli altri file.
//
// Sezioni, nell'ordine:
//   - CHIAVI DEI DATI
//   - LETTURA
// =====================================================================


// =====================================================================
// SEZIONE CHIAVI DEI DATI
// I nomi con cui progetti, obiettivi, timer e impostazioni sono salvati in localStorage.
// "focusx." li distingue da eventuali altri dati dello stesso sito.
// =====================================================================

export const chiaveProgetti = "focusx.progetti.v1";
export const chiaveObiettivi = "focusx.obiettivi.v1";
// L'obiettivo scelto nella Home: lo scrive anche il play della pagina Obiettivi.
export const chiaveObiettivoScelto = "focusx.home.obiettivo.v1";
// Il timer della Home: quando finisce la sessione, i secondi rimasti, se è avviata.
export const chiaveTimer = "focusx.timer.v1";
// Le impostazioni dell'utente: per ora le durate della fiammina e della pausa.
export const chiaveImpostazioni = "focusx.impostazioni.v1";


// =====================================================================
// SEZIONE LETTURA
// Legge un elenco salvato. Ogni pagina poi controlla i dati a modo suo
// e decide cosa fare se l'archivio non si legge.
// =====================================================================

// Legge un elenco salvato in localStorage; se il testo non è un array, lancia un errore.
export function leggiElenco(chiave) {
  // Restituisce l'array salvato con quella chiave, oppure un array vuoto se non c'è ancora.
  const testoSalvato = localStorage.getItem(chiave);
  if (testoSalvato === null) {
    return [];
  }
  // JSON.parse trasforma il testo JSON in un array di oggetti JavaScript.
  const elenco = JSON.parse(testoSalvato);
  if (!Array.isArray(elenco)) {
    // throw interrompe la funzione con un errore, che il catch di chi la chiama riceve.
    throw new Error("Archivio non valido");
  }
  return elenco;
}
