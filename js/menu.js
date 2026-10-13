// =====================================================================
// MENU.JS: il menu laterale, condiviso da tutte le pagine
// Apre e chiude il pannello con il pulsante nell'header,
// con un clic fuori dal pannello o con il tasto Esc.
// È un modulo: i suoi nomi sono privati, non si scontrano con quelli
// degli altri file della pagina.
//
// Sezioni, nell'ordine:
//   - ELEMENTI DELLA PAGINA
//   - APERTURA E CHIUSURA
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Il pulsante nell'header e il pannello laterale che controlla.
// =====================================================================

// Questa parte collega l'icona nell'header al pannello laterale.
const pulsanteMenu = document.getElementById("menu-button");
const menuLaterale = document.getElementById("sidebar-menu");


// =====================================================================
// SEZIONE APERTURA E CHIUSURA
// Le tre strade per aprire o chiudere il menu: il pulsante, un clic fuori, Esc.
// =====================================================================

// Apre il menu se è chiuso, lo chiude se è aperto.
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

// Chiude il menu aperto quando si clicca fuori dal pulsante e dal pannello.
function chiudiMenuFuori(evento) {
  // contains controlla se il clic è dentro il pulsante o il pannello, anche nei loro figli.
  // && significa "e": chiudiamo soltanto se tutte e tre le condizioni sono vere.
  if (pulsanteMenu.classList.contains("active")
      && !pulsanteMenu.contains(evento.target)
      && !menuLaterale.contains(evento.target)) {
    alternaMenu();
  }
}

// Chiude il menu aperto con il tasto Esc.
function gestisciTastoMenu(evento) {
  // key contiene il tasto premuto. Esc chiude il menu.
  if (evento.key === "Escape" && pulsanteMenu.classList.contains("active")) {
    alternaMenu();
  }
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Collega il pulsante e la pagina alle funzioni del menu.
// =====================================================================

// Il browser genera click anche quando attiviamo il button con Invio o Spazio.
pulsanteMenu.addEventListener("click", alternaMenu);

// document ascolta gli eventi dell'intera pagina, compresi quelli dei suoi elementi figli.
document.addEventListener("click", chiudiMenuFuori);
document.addEventListener("keydown", gestisciTastoMenu);
