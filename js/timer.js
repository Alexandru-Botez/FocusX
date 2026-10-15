// =====================================================================
// TIMER.JS: il timer della pagina Home (index.html)
// Conta alla rovescia la durata di una fiammina (25 minuti), con i pulsanti
// Avvia, Pausa e Stop. Arrivato a zero la sessione finisce: il timer si ferma
// e torna a 25:00, pronto per la prossima fiammina.
// Il timer continua anche cambiando pagina o ricaricando: salva nel browser
// l'ora in cui la sessione finirà, e a ogni apertura calcola quanto manca.
// È un modulo: i suoi nomi sono privati, non si scontrano con quelli
// degli altri file della pagina.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - ELEMENTI DELLA PAGINA
//   - DATI DEL TIMER
//   - SALVATAGGIO NEL BROWSER
//   - CONTEGGIO
//   - PULSANTI AVVIA, PAUSA E STOP
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// La durata, la lettura e la scrittura del timer e il conto dei secondi rimanenti
// arrivano da js/timer-salvato.js, che li condivide con la pagina Obiettivi.
// =====================================================================

// Lo stesso ?v usato da js/obiettivi.js: così il modulo si carica una volta sola.
import {
  durataSessione,
  leggiTimer,
  scriviTimer,
  calcolaSecondiRimanenti
} from "./timer-salvato.js?v=diretta-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// const dichiara un nome che non riassegneremo.
// getElementById trova l'elemento HTML che ha l'id indicato tra virgolette.
const timer = document.getElementById("timer");
const pulsanteAvvia = document.getElementById("start-button");
const pulsantePausa = document.getElementById("pause-button");
const pulsanteStop = document.getElementById("stop-button");


// =====================================================================
// SEZIONE DATI DEL TIMER
// I valori che cambiano mentre il timer conta: sono questi quattro
// che vengono salvati nel browser. La durata, 1500 secondi, arriva da js/timer-salvato.js.
// =====================================================================

// L'ora in cui la sessione finirà, in millisecondi (come Date.now()), mentre il timer conta.
// null quando il timer è fermo: in pausa, dopo Stop o prima di cominciare.
let fineSessione = null;

// I secondi che mancano alla fine. Mentre il timer conta si ricalcolano da fineSessione;
// in pausa restano fermi, ed è da qui che Avvia riparte.
let secondiRimanenti = durataSessione;

// true da Avvia fino a Stop o alla fine della sessione, anche in pausa: abilita Stop.
let sessioneAvviata = false;

// Quanti secondi di questa sessione sono già stati passati all'obiettivo in corso.
// La differenza con i secondi trascorsi dice quanti annunciarne ancora (vedi annunciaSecondiLavorati).
let secondiAnnunciati = 0;

// L'identificatore di setInterval, per poterlo fermare; null quando non c'è.
let intervalloTimer = null;


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// I dati del timer restano in localStorage: una ricarica o un'altra pagina
// non li perdono, e la Home li rilegge all'apertura.
// =====================================================================

// Mette i quattro dati in un oggetto e lo scrive nel browser con scriviTimer.
function salvaTimer() {
  scriviTimer({
    fine: fineSessione,
    rimanenti: secondiRimanenti,
    avviata: sessioneAvviata,
    annunciati: secondiAnnunciati
  });
}

// Rilegge i dati salvati con leggiTimer, che li controlla:
// se mancano o non sono validi, restituisce un timer fermo a 25:00.
function caricaTimer() {
  const dati = leggiTimer();
  fineSessione = dati.fine;
  secondiRimanenti = dati.rimanenti;
  sessioneAvviata = dati.avviata;
  secondiAnnunciati = dati.annunciati;
}


// =====================================================================
// SEZIONE CONTEGGIO
// Il tempo non si conta togliendo un secondo alla volta, ma guardando l'orologio:
// i secondi rimanenti sono la distanza tra adesso e fineSessione. Così il conto
// è giusto anche dopo una ricarica, un'altra pagina o una scheda in background.
// I secondi lavorati si annunciano con l'evento "secondi-lavorati";
// a zero la sessione finisce e lo annuncia con l'evento "sessione-finita".
// =====================================================================

// Scrive i secondi rimanenti nel formato "25:00".
function aggiornaTimer() {
  // La divisione calcola i minuti; Math.floor elimina la parte decimale.
  const minuti = Math.floor(secondiRimanenti / 60);
  // % dà il resto della divisione: sono i secondi che avanzano dopo i minuti interi.
  const secondi = secondiRimanenti % 60;
  // padStart aggiunge uno zero se manca una cifra: il numero 9 diventa il testo "09".
  timer.textContent = String(minuti).padStart(2, "0") + ":" + String(secondi).padStart(2, "0");
}

// Passa all'obiettivo i secondi trascorsi che non ha ancora ricevuto.
// Di solito è 1, ma tornando da un'altra pagina possono essere molti di più.
function annunciaSecondiLavorati() {
  const secondiTrascorsi = durataSessione - secondiRimanenti;
  const secondiNuovi = secondiTrascorsi - secondiAnnunciati;
  if (secondiNuovi <= 0) {
    return;
  }
  secondiAnnunciati = secondiTrascorsi;
  salvaTimer();
  // CustomEvent è un evento con un dato allegato: detail porta il numero di secondi.
  // js/home-obiettivo.js lo ascolta e li aggiunge all'obiettivo in corso.
  timer.dispatchEvent(new CustomEvent("secondi-lavorati", { detail: secondiNuovi }));
}

// Aggiorna il timer guardando l'orologio; a zero, finisce la sessione.
// Gira più volte al secondo e all'apertura della pagina.
function aggiornaConteggio() {
  secondiRimanenti = calcolaSecondiRimanenti(fineSessione);
  aggiornaTimer();
  // Prima si annunciano i secondi, poi si chiude la sessione: così l'obiettivo,
  // ancora in corso, riceve anche l'ultimo secondo.
  annunciaSecondiLavorati();
  if (secondiRimanenti === 0) {
    fermaSessione();
    // js/home-obiettivo.js ferma l'obiettivo in corso, come dopo Pausa o Stop.
    timer.dispatchEvent(new Event("sessione-finita"));
  }
}

// Fa partire il controllo dell'orologio.
function avviaIntervallo() {
  // Quattro controlli al secondo: il numero cambia appena scatta il secondo,
  // anche ses il browser ritarda un po' l'intervallo.
  intervalloTimer = setInterval(aggiornaConteggio, 250);
}


// =====================================================================
// SEZIONE PULSANTI AVVIA, PAUSA E STOP
// Cosa succede premendo ciascun pulsante, e quali pulsanti
// restano attivi in ogni momento.
// =====================================================================

// Abilita e disabilita i pulsanti secondo lo stato del timer.
function aggiornaPulsanti() {
  // Il timer conta quando c'è un'ora di fine.
  const staContando = fineSessione !== null;
  pulsanteAvvia.disabled = staContando;
  pulsantePausa.disabled = !staContando;
  pulsanteStop.disabled = !sessioneAvviata;
}

// Avvia il conteggio, o lo riprende dopo una pausa.
function avviaTimer() {
  // Se il timer sta già contando, return termina la funzione senza crearne un altro.
  if (fineSessione !== null) {
    return;
  }
  // La fine è adesso più i secondi che mancano: dopo una pausa sono quelli rimasti.
  fineSessione = Date.now() + secondiRimanenti * 1000;
  sessioneAvviata = true;
  salvaTimer();
  aggiornaPulsanti();
  avviaIntervallo();
}

// Ferma il conteggio senza perdere i secondi rimasti.
function pausaTimer() {
  if (fineSessione === null) {
    return;
  }
  // Un ultimo sguardo all'orologio: i secondi rimasti e quelli lavorati sono esatti.
  secondiRimanenti = calcolaSecondiRimanenti(fineSessione);
  aggiornaTimer();
  annunciaSecondiLavorati();

  // clearInterval ferma i controlli; senza fineSessione il timer resta fermo.
  clearInterval(intervalloTimer);
  intervalloTimer = null;
  fineSessione = null;
  salvaTimer();
  aggiornaPulsanti();
}

// Stop, e la fine della sessione: ferma il conteggio e riporta il timer a 25:00.
function fermaSessione() {
  // Riutilizziamo Pausa per fermare il conteggio; in pausa non fa niente.
  pausaTimer();

  // Una sessione nuova: tutti i secondi da contare, nessuno ancora annunciato.
  secondiRimanenti = durataSessione;
  secondiAnnunciati = 0;
  sessioneAvviata = false;
  salvaTimer();
  aggiornaTimer();
  aggiornaPulsanti();
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Rilegge il timer salvato e collega i pulsanti alle funzioni.
// =====================================================================

// Subito: il timer e i pulsanti come erano prima di lasciare la pagina.
// Così js/home-obiettivo.js, che parte dopo, sa già se il timer sta contando.
caricaTimer();
if (fineSessione !== null) {
  secondiRimanenti = calcolaSecondiRimanenti(fineSessione);
}
aggiornaTimer();
aggiornaPulsanti();

pulsanteAvvia.addEventListener("click", avviaTimer);
pulsantePausa.addEventListener("click", pausaTimer);
pulsanteStop.addEventListener("click", fermaSessione);

// Se stava contando, riprende. Lo facciamo a DOMContentLoaded, che scatta dopo
// che tutti i moduli della pagina sono partiti: così js/home-obiettivo.js ascolta già
// "secondi-lavorati" e riceve il tempo passato mentre eri su un'altra pagina.
// Se la sessione è finita nel frattempo, aggiornaConteggio la chiude subito.
document.addEventListener("DOMContentLoaded", () => {
  if (fineSessione !== null) {
    aggiornaConteggio();
    if (fineSessione !== null) {
      avviaIntervallo();
    }
  }
});
