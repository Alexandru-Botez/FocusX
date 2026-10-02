// const dichiara un nome che non riassegneremo.
// getElementById trova l'elemento HTML che ha l'id indicato tra virgolette.
const timer = document.getElementById("timer");
const pulsanteAvvia = document.getElementById("start-button");
const statoTimer = document.getElementById("timer-status");

// Lavoriamo in secondi: 25 minuti sono 25 × 60 = 1500 secondi.
const durataSessione = 25 * 60;

// let permette di riassegnare il valore: questo numero diminuirà durante il timer.
let secondiRimanenti = durataSessione;

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

function avviaTimer() {
  // true significa "vero": disabled impedisce altri clic e quindi altri intervalli.
  pulsanteAvvia.disabled = true;
  statoTimer.textContent = "Timer in corso.";

  // setInterval richiede di eseguire la funzione ogni 1000 millisecondi, cioè un secondo.
  // Passiamo passaUnSecondo senza (): dovrà essere eseguita dall'intervallo, non adesso.
  setInterval(passaUnSecondo, 1000);
}

// addEventListener collega un evento a una funzione: un clic eseguirà avviaTimer.
// Anche qui passiamo il nome della funzione senza eseguirla subito.
pulsanteAvvia.addEventListener("click", avviaTimer);
