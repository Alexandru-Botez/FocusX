// =====================================================================
// TIMER.JS: il timer della pagina Home (index.html)
// Alterna due modalità: la fiammina, 25 minuti di lavoro, e la pausa, 5 minuti
// di riposo (le durate si cambiano nelle Impostazioni). Arrivata a zero una fiammina, il timer passa alla pausa; finita la
// pausa, torna alla fiammina. Ogni volta si ferma e aspetta Avvia.
// Stop chiude la fiammina, o salta la pausa, e riporta a una fiammina da 25:00.
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
//   - FIAMMINA E PAUSA
//   - PULSANTI AVVIA, PAUSA E STOP
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// Le durate, la lettura e la scrittura del timer e il conto dei secondi rimanenti
// arrivano da js/timer-salvato.js, che li condivide con la pagina Obiettivi.
// =====================================================================

// Lo stesso ?v usato da js/obiettivi.js: così il modulo si carica una volta sola.
import {
  durataDi,
  leggiTimer,
  scriviTimer,
  calcolaSecondiRimanenti
} from "./timer-salvato.js?v=cinque-1";
import { eventoImpostazioni } from "./impostazioni-salvate.js?v=imp-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// const dichiara un nome che non riassegneremo.
// getElementById trova l'elemento HTML che ha l'id indicato tra virgolette.
const sezioneTimer = document.getElementById("timer-section");
const testoModalita = document.getElementById("timer-mode-text");
const timer = document.getElementById("timer");
const pulsanteAvvia = document.getElementById("start-button");
const pulsantePausa = document.getElementById("pause-button");
const pulsanteStop = document.getElementById("stop-button");


// =====================================================================
// SEZIONE DATI DEL TIMER
// I valori che cambiano mentre il timer conta: sono questi sei
// che vengono salvati nel browser. Le durate arrivano da js/timer-salvato.js.
// =====================================================================

// "fiammina" mentre si lavora, "pausa" mentre ci si riposa.
let modalita = "fiammina";

// Quanti secondi dura questa sessione. Si decide quando la sessione viene preparata
// e non cambia più, anche se nel frattempo si cambia la durata nelle Impostazioni.
let durataSessione = durataDi(modalita);

// L'ora in cui la sessione finirà, in millisecondi (come Date.now()), mentre il timer conta.
// null quando il timer è fermo: con il pulsante Pausa, dopo Stop o prima di cominciare.
let fineSessione = null;

// I secondi che mancano alla fine. Mentre il timer conta si ricalcolano da fineSessione;
// quando è fermo restano fermi, ed è da qui che Avvia riparte.
let secondiRimanenti = durataSessione;

// true da Avvia fino a Stop o alla fine della sessione, anche da fermo: abilita Stop.
let sessioneAvviata = false;

// Quanti secondi di questa fiammina sono già stati passati all'obiettivo in corso.
// La differenza con i secondi trascorsi dice quanti annunciarne ancora (vedi annunciaSecondiLavorati).
let secondiAnnunciati = 0;

// L'identificatore di setInterval, per poterlo fermare; null quando non c'è.
let intervalloTimer = null;


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// I dati del timer restano in localStorage: una ricarica o un'altra pagina
// non li perdono, e la Home li rilegge all'apertura.
// =====================================================================

// Mette i sei dati in un oggetto e lo scrive nel browser con scriviTimer.
function salvaTimer() {
  scriviTimer({
    modalita: modalita,
    durata: durataSessione,
    fine: fineSessione,
    rimanenti: secondiRimanenti,
    avviata: sessioneAvviata,
    annunciati: secondiAnnunciati
  });
}

// Rilegge i dati salvati con leggiTimer, che li controlla:
// se mancano o non sono validi, restituisce una fiammina ferma a 25:00.
function caricaTimer() {
  const dati = leggiTimer();
  modalita = dati.modalita;
  durataSessione = dati.durata;
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
// I secondi lavorati si annunciano con l'evento "secondi-lavorati", solo in una fiammina;
// a zero la sessione finisce (vedi la sezione FIAMMINA E PAUSA).
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
  // In pausa non si lavora: nessun secondo va all'obiettivo.
  if (modalita !== "fiammina") {
    return;
  }
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
    finisciSessione();
  }
}

// Fa partire il controllo dell'orologio.
function avviaIntervallo() {
  // Quattro controlli al secondo: il numero cambia appena scatta il secondo,
  // anche se il browser ritarda un po' l'intervallo.
  intervalloTimer = setInterval(aggiornaConteggio, 250);
}


// =====================================================================
// SEZIONE FIAMMINA E PAUSA
// Il passaggio da una modalità all'altra e come si vede nella pagina.
// =====================================================================

// Prepara una sessione nuova nella modalità indicata: ferma, piena, da avviare con Avvia.
function impostaModalita(nuovaModalita) {
  modalita = nuovaModalita;
  // La durata di adesso, scelta nelle Impostazioni: tutti i suoi secondi da contare,
  // nessuno ancora annunciato.
  durataSessione = durataDi(modalita);
  secondiRimanenti = durataSessione;
  secondiAnnunciati = 0;
  sessioneAvviata = false;
  salvaTimer();
  aggiornaTimer();
  aggiornaPulsanti();
  mostraModalita();
}

// Il tempo è arrivato a zero: dopo una fiammina viene la pausa, dopo la pausa una fiammina.
function finisciSessione() {
  // Lo ricordiamo prima di cambiare modalità: dopo, modalita dice già quella nuova.
  const eraFiammina = modalita === "fiammina";
  pausaTimer();
  impostaModalita(eraFiammina ? "pausa" : "fiammina");
  if (eraFiammina) {
    // js/home-obiettivo.js ferma l'obiettivo in corso, come dopo Pausa o Stop:
    // la fiammina appena finita è fatta, e durante la pausa non si lavora.
    timer.dispatchEvent(new Event("sessione-finita"));
  }
}

// Mostra nella pagina in quale modalità è il timer.
function mostraModalita() {
  // data-modalita sulla sezione decide i colori nel CSS: arancione per la fiammina,
  // lilla per la pausa. js/home-obiettivo.js lo legge per sapere se si sta lavorando.
  sezioneTimer.dataset.modalita = modalita;
  testoModalita.textContent = modalita === "pausa" ? "Pausa" : "Fiammina";
  // In pausa Stop serve a saltarla: il nome lo dice ai lettori di schermo e nel suggerimento.
  const nomeStop = modalita === "pausa" ? "Salta la pausa" : "Stop";
  pulsanteStop.setAttribute("aria-label", nomeStop);
  pulsanteStop.title = nomeStop;
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
  // Stop serve dopo Avvia; in pausa serve sempre, per saltarla anche senza avviarla.
  pulsanteStop.disabled = !sessioneAvviata && modalita !== "pausa";
  // data-conteggio dice al CSS se il timer conta, è fermo con il pulsante Pausa o non è partito:
  // "sospeso" fa diventare grigie le cifre.
  if (staContando) {
    sezioneTimer.dataset.conteggio = "attivo";
  } else if (sessioneAvviata) {
    sezioneTimer.dataset.conteggio = "sospeso";
  } else {
    sezioneTimer.dataset.conteggio = "fermo";
  }
}

// Avvia il conteggio, o lo riprende dopo il pulsante Pausa.
function avviaTimer() {
  // Se il timer sta già contando, return termina la funzione senza crearne un altro.
  if (fineSessione !== null) {
    return;
  }
  // La fine è adesso più i secondi che mancano: dopo il pulsante Pausa sono quelli rimasti.
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

// Stop: chiude la fiammina, o salta la pausa, e prepara una fiammina nuova da 25:00.
function fermaSessione() {
  // Riutilizziamo Pausa per fermare il conteggio; da fermo non fa niente.
  pausaTimer();
  impostaModalita("fiammina");
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Rilegge il timer salvato e collega i pulsanti alle funzioni.
// =====================================================================

// Subito: il timer, i pulsanti e la modalità come erano prima di lasciare la pagina.
// Così js/home-obiettivo.js, che parte dopo, sa già se il timer sta contando e su cosa.
caricaTimer();
if (fineSessione !== null) {
  secondiRimanenti = calcolaSecondiRimanenti(fineSessione);
}
aggiornaTimer();
aggiornaPulsanti();
mostraModalita();

pulsanteAvvia.addEventListener("click", avviaTimer);
pulsantePausa.addEventListener("click", pausaTimer);
pulsanteStop.addEventListener("click", fermaSessione);

// Cambiando una durata nelle Impostazioni: se la sessione non è ancora partita,
// la prepariamo di nuovo con la durata nuova (25:00 diventa 30:00, per esempio).
// Una sessione già avviata invece finisce con la sua durata.
window.addEventListener(eventoImpostazioni, () => {
  if (!sessioneAvviata) {
    impostaModalita(modalita);
  }
});

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
