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
