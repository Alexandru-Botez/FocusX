// const dichiara un nome che non riassegneremo.
// getElementById trova l'elemento HTML che ha l'id indicato tra virgolette.
const timer = document.getElementById("timer");
const pulsanteAvvia = document.getElementById("start-button");
const pulsantePausa = document.getElementById("pause-button");
const pulsanteReset = document.getElementById("reset-button");
const statoTimer = document.getElementById("timer-status");

// Lavoriamo in secondi: 25 minuti sono 25 × 60 = 1500 secondi.
const durataSessione = 25 * 60;

// let permette di riassegnare il valore: questo numero diminuirà durante il timer.
let secondiRimanenti = durataSessione;

// Conserviamo l'identificatore restituito da setInterval per poter fermare l'intervallo.
// null significa che, all'inizio, non c'è un intervallo attivo.
let intervalloTimer = null;

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
  // Se un intervallo è già attivo, return termina la funzione senza crearne un altro.
  if (intervalloTimer !== null) {
    return;
  }

  // true significa "vero": disabled impedisce altri clic e quindi altri intervalli.
  pulsanteAvvia.disabled = true;

  // false riabilita Pausa: adesso c'è un conteggio che possiamo fermare.
  pulsantePausa.disabled = false;

  // Dopo l'avvio possiamo riportare il timer al suo valore iniziale con Reset.
  pulsanteReset.disabled = false;

  // classList.add aggiunge una classe CSS all'elemento del messaggio.
  // La classe usa visibility: hidden: lo status scompare ma conserva il suo spazio.
  statoTimer.classList.add("is-hidden");

  // setInterval richiede di eseguire la funzione ogni 1000 millisecondi, cioè un secondo.
  // Passiamo passaUnSecondo senza (): dovrà essere eseguita dall'intervallo, non adesso.
  // Salviamo il suo identificatore; i secondi rimasti non vengono azzerati alla ripresa.
  intervalloTimer = setInterval(passaUnSecondo, 1000);
}

function pausaTimer() {
  // clearInterval ferma le chiamate periodiche usando l'identificatore salvato.
  clearInterval(intervalloTimer);

  // Non c'è più un intervallo attivo: Avvia potrà crearne uno nuovo.
  intervalloTimer = null;

  // Permettiamo la ripresa con Avvia e disabilitiamo Pausa mentre il timer è fermo.
  pulsanteAvvia.disabled = false;
  pulsantePausa.disabled = true;
}

function resetTimer() {
  // Riutilizziamo Pausa per fermare l'intervallo e rendere di nuovo disponibile Avvia.
  pausaTimer();

  // Ripristiniamo i secondi della sessione e aggiorniamo subito il testo a 25:00.
  secondiRimanenti = durataSessione;
  aggiornaTimer();

  // Non serve un altro Reset finché non premiamo nuovamente Avvia.
  pulsanteReset.disabled = true;

  // classList.remove toglie la classe: il messaggio torna visibile senza spostare il timer.
  statoTimer.classList.remove("is-hidden");
}

// addEventListener collega un evento a una funzione: un clic eseguirà avviaTimer.
// Anche qui passiamo il nome della funzione senza eseguirla subito.
pulsanteAvvia.addEventListener("click", avviaTimer);

// Il clic su Pausa esegue la funzione che ferma il conteggio.
pulsantePausa.addEventListener("click", pausaTimer);

// Il clic su Reset ferma il conteggio e ripristina lo stato iniziale.
pulsanteReset.addEventListener("click", resetTimer);

// Questa parte collega l'icona nell'header al pannello laterale.
const pulsanteMenu = document.getElementById("menu-button");
const menuLaterale = document.getElementById("sidebar-menu");

function alternaMenu() {
  // toggle aggiunge active se manca, oppure la rimuove se è già presente.
  // Restituisce true quando la classe è presente, false quando viene rimossa.
  const menuAperto = pulsanteMenu.classList.toggle("active");

  // Il secondo argomento forza lo stesso stato sul pannello: true aggiunge, false rimuove.
  menuLaterale.classList.toggle("is-open", menuAperto);

  // String converte il valore in testo; aria-expanded comunica se il pannello è aperto.
  pulsanteMenu.setAttribute("aria-expanded", String(menuAperto));

  // ! inverte il booleano: il menu è inert soltanto quando è chiuso.
  menuLaterale.inert = !menuAperto;
}

function chiudiMenuFuori(evento) {
  // contains controlla se il clic è dentro il pulsante o il pannello, anche nei loro figli.
  // && significa "e": chiudiamo soltanto se tutte e tre le condizioni sono vere.
  if (pulsanteMenu.classList.contains("active")
      && !pulsanteMenu.contains(evento.target)
      && !menuLaterale.contains(evento.target)) {
    alternaMenu();
  }
}

function gestisciTastoMenu(evento) {
  // key contiene il tasto premuto. Esc chiude il menu.
  if (evento.key === "Escape" && pulsanteMenu.classList.contains("active")) {
    alternaMenu();
  }
}

// Il browser genera click anche quando attiviamo il button con Invio o Spazio.
pulsanteMenu.addEventListener("click", alternaMenu);

// document ascolta gli eventi dell'intera pagina, compresi quelli dei suoi elementi figli.
document.addEventListener("click", chiudiMenuFuori);
document.addEventListener("keydown", gestisciTastoMenu);
