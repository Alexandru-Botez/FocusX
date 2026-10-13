// =====================================================================
// TIMER.JS: il timer della pagina Home (index.html)
// Conta 25 minuti alla rovescia, con i pulsanti Avvia, Pausa e Stop,
// e riparte da capo quando arriva a zero.
// È un modulo: i suoi nomi sono privati, non si scontrano con quelli
// degli altri file della pagina.
//
// Sezioni, nell'ordine:
//   - ELEMENTI DELLA PAGINA
//   - IMPOSTAZIONI E DATI DEL TIMER
//   - CONTEGGIO
//   - PULSANTI AVVIA, PAUSA E STOP
//   - AVVIO DELLA PAGINA
// =====================================================================


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
const statoTimer = document.getElementById("timer-status");


// =====================================================================
// SEZIONE IMPOSTAZIONI E DATI DEL TIMER
// La durata di una sessione e i valori che cambiano mentre il timer conta.
// =====================================================================

// Lavoriamo in secondi: 25 minuti sono 25 × 60 = 1500 secondi.
const durataSessione = 25 * 60;

// let permette di riassegnare il valore: questo numero diminuirà durante il timer.
let secondiRimanenti = durataSessione;

// Conserviamo l'identificatore restituito da setInterval per poter fermare l'intervallo.
// null significa che, all'inizio, non c'è un intervallo attivo.
let intervalloTimer = null;


// =====================================================================
// SEZIONE CONTEGGIO
// Ogni secondo toglie un secondo e aggiorna il testo "mm:ss".
// =====================================================================

// Scrive i secondi rimanenti nel formato "25:00".
// Una funzione raggruppa istruzioni che possiamo eseguire richiamando il suo nome.
function aggiornaTimer() {
  // La divisione calcola i minuti; Math.floor elimina la parte decimale.
  const minuti = Math.floor(secondiRimanenti / 60);

  // % dà il resto della divisione: sono i secondi che avanzano dopo i minuti interi.
  const secondi = secondiRimanenti % 60;

  // String converte un numero in testo; padStart aggiunge uno zero se manca una cifra.
  // Per esempio, il numero 9 diventa il testo "09".
  const minutiFormattati = String(minuti).padStart(2, "0");
  const secondiFormattati = String(secondi).padStart(2, "0");

  // + unisce i testi; textContent sostituisce il contenuto del paragrafo del timer.
  timer.textContent = minutiFormattati + ":" + secondiFormattati;
}

// Toglie un secondo; arrivato a zero, il timer riparte da 25 minuti.
function passaUnSecondo() {
  // Riassegniamo alla variabile il suo valore precedente meno un secondo.
  secondiRimanenti = secondiRimanenti - 1;

  // if esegue le istruzioni tra graffe solo quando la condizione è vera.
  // Quando i secondi arrivano a zero, ripartiamo subito da 25 minuti.
  if (secondiRimanenti === 0) {
    secondiRimanenti = durataSessione;
  }

  // Le parentesi tonde eseguono la funzione che aggiorna il testo visibile.
  aggiornaTimer();
}


// =====================================================================
// SEZIONE PULSANTI AVVIA, PAUSA E STOP
// Cosa succede premendo ciascun pulsante, e quali pulsanti
// restano attivi in ogni momento.
// =====================================================================

// Avvia il conteggio, o lo riprende dopo una pausa.
function avviaTimer() {
  // Se un intervallo è già attivo, return termina la funzione senza crearne un altro.
  if (intervalloTimer !== null) {
    return;
  }

  // true significa "vero": disabled impedisce altri clic e quindi altri intervalli.
  pulsanteAvvia.disabled = true;

  // false riabilita Pausa: adesso c'è un conteggio che possiamo fermare.
  pulsantePausa.disabled = false;

  // Dopo l'avvio possiamo riportare il timer al suo valore iniziale con Stop.
  pulsanteStop.disabled = false;

  // classList.add aggiunge una classe CSS all'elemento del messaggio.
  // La classe usa visibility: hidden: lo status scompare ma conserva il suo spazio.
  statoTimer.classList.add("is-hidden");

  // setInterval richiede di eseguire la funzione ogni 1000 millisecondi, cioè un secondo.
  // Passiamo passaUnSecondo senza (): dovrà essere eseguita dall'intervallo, non adesso.
  // Salviamo il suo identificatore; i secondi rimasti non vengono azzerati alla ripresa.
  intervalloTimer = setInterval(passaUnSecondo, 1000);
}

// Ferma il conteggio senza perdere i secondi rimasti.
function pausaTimer() {
  // clearInterval ferma le chiamate periodiche usando l'identificatore salvato.
  clearInterval(intervalloTimer);

  // Non c'è più un intervallo attivo: Avvia potrà crearne uno nuovo.
  intervalloTimer = null;

  // Permettiamo la ripresa con Avvia e disabilitiamo Pausa mentre il timer è fermo.
  pulsanteAvvia.disabled = false;
  pulsantePausa.disabled = true;
}

// Stop: finisce la sessione, ferma il conteggio e riporta il timer a 25:00.
function fermaSessione() {
  // Riutilizziamo Pausa per fermare l'intervallo e rendere di nuovo disponibile Avvia.
  pausaTimer();

  // Ripristiniamo i secondi della sessione e aggiorniamo subito il testo a 25:00.
  secondiRimanenti = durataSessione;
  aggiornaTimer();

  // Non serve un altro Stop finché non premiamo nuovamente Avvia.
  pulsanteStop.disabled = true;

  // classList.remove toglie la classe: il messaggio torna visibile senza spostare il timer.
  statoTimer.classList.remove("is-hidden");
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Il codice che parte subito al caricamento: collega i pulsanti alle funzioni.
// =====================================================================

// addEventListener collega un evento a una funzione: un clic eseguirà avviaTimer.
// Anche qui passiamo il nome della funzione senza eseguirla subito.
pulsanteAvvia.addEventListener("click", avviaTimer);

// Il clic su Pausa esegue la funzione che ferma il conteggio.
pulsantePausa.addEventListener("click", pausaTimer);

// Il clic su Stop finisce la sessione: ferma il conteggio e ripristina lo stato iniziale.
pulsanteStop.addEventListener("click", fermaSessione);
