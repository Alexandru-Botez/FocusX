// Troviamo i controlli della pagina Obiettivi.
const pulsanteNuovoObiettivo = document.getElementById("new-goal-button");
const avvisoSenzaProgetti = document.getElementById("goals-no-projects");
const moduloObiettivo = document.getElementById("goal-form");
const campoNomeObiettivo = document.getElementById("goal-name");
const sceltaProgetto = document.getElementById("goal-project");
const iconaProgettoScelto = document.getElementById("goal-project-icon");
const campoData = document.getElementById("goal-date");
const testoFiammine = document.getElementById("goal-flames-output");
const radioPiuFiammine = document.getElementById("goal-flames-more");
const segnoPiuFiammine = document.getElementById("goal-flames-more-badge");
const finestrellaFiammine = document.getElementById("goal-flames-panel");
const campoNumeroFiammine = document.getElementById("goal-flames-number");
const iconaFinestrella = document.getElementById("goal-flames-panel-icon");
const pulsanteMenoFiammine = document.getElementById("goal-flames-less");
const pulsantePiuFiammine = document.getElementById("goal-flames-plus");
const pulsanteAnnullaObiettivo = document.getElementById("cancel-goal-button");
const elencoObiettivi = document.getElementById("goal-list");
const statoVuotoObiettivi = document.getElementById("goals-empty");
const messaggioObiettivi = document.getElementById("goals-message");
const modelloVoceObiettivo = document.getElementById("goal-item-template");

// Gli obiettivi hanno una chiave propria; i progetti vengono soltanto letti.
const chiaveObiettivi = "focusx.obiettivi.v1";
const chiaveProgetti = "focusx.progetti.v1";

// Per ora ogni fiammina vale 25 minuti: cambiando questo numero cambia tutto il calcolo.
const minutiPerFiammina = 25;
// Le prime otto fiammine si cliccano direttamente; dalla nona si sceglie nella finestrella.
const fiammineVisibili = 8;
// Il limite è di tempo, non di fiammine: al massimo 16 ore, per la previsione
// e in futuro anche per il tempo trascorso. Math.floor tiene solo le fiammine intere
// che ci stanno: con 25 minuti sono 38 (15 h 50 min), perché 39 supererebbero le 16 ore.
const oreMassime = 16;
const fiammineMassime = Math.floor(oreMassime * 60 / minutiPerFiammina);

// Un oggetto usato come dizionario: a ogni stato salvato associa il testo da mostrare.
const nomiStati = {
  "non-completato": "Non completato",
  "in-corso": "In corso",
  "completato": "Completato"
};

function leggiElenco(chiave) {
  // Restituisce l'array salvato con quella chiave, oppure un array vuoto se non c'è ancora.
  const testoSalvato = localStorage.getItem(chiave);
  if (testoSalvato === null) {
    return [];
  }
  const elenco = JSON.parse(testoSalvato);
  if (!Array.isArray(elenco)) {
    // throw interrompe la funzione con un errore, che il catch di chi la chiama riceve.
    throw new Error("Archivio non valido");
  }
  return elenco;
}

function caricaProgetti() {
  try {
    return leggiElenco(chiaveProgetti);
  } catch {
    messaggioObiettivi.textContent = "Non riesco a leggere i progetti salvati nel browser.";
    return [];
  }
}

function caricaObiettivi() {
  try {
    const archivio = leggiElenco(chiaveObiettivi);
    // every controlla che ogni obiettivo abbia tutti i dati, del tipo giusto.
    const valido = archivio.every(obiettivo =>
      obiettivo
      && typeof obiettivo.id === "string"
      && typeof obiettivo.nome === "string"
      && typeof obiettivo.progettoId === "string"
      && typeof obiettivo.data === "string"
      && Number.isInteger(obiettivo.fiammine)
      && obiettivo.fiammine >= 1
      && obiettivo.fiammine <= fiammineMassime
      // in controlla che lo stato sia una delle chiavi di nomiStati.
      && obiettivo.stato in nomiStati);
    if (!valido) {
      throw new Error("Archivio obiettivi non valido");
    }
    return archivio;
  } catch {
    // Come per i progetti, non sovrascriviamo un archivio illeggibile.
    pulsanteNuovoObiettivo.disabled = true;
    messaggioObiettivi.textContent = "Non riesco a leggere gli obiettivi salvati nel browser.";
    return [];
  }
}

function salvaObiettivi(elenco) {
  try {
    localStorage.setItem(chiaveObiettivi, JSON.stringify(elenco));
    return true;
  } catch {
    messaggioObiettivi.textContent = "Non riesco a salvare l'obiettivo. Controlla lo spazio e le impostazioni del browser.";
    return false;
  }
}

const progetti = caricaProgetti();
let obiettivi = caricaObiettivi();

function formattaTempo(fiammine) {
  // 2 fiammine → "50 min"; 3 fiammine → "1 h 15 min"; 8 fiammine → "3 h 20 min".
  const minuti = fiammine * minutiPerFiammina;
  // Math.floor arrotonda per difetto; % è il resto della divisione.
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  if (ore === 0) {
    return minuti + " min";
  }
  return resto === 0 ? ore + " h" : ore + " h " + resto + " min";
}

function formattaNumeroFiammine(fiammine) {
  // Il numero con al massimo un decimale e la virgola italiana: 12 → "12", 12.4 → "12,4".
  // Oggi le fiammine sono intere; il decimale servirà per il tempo trascorso "in corso".
  return fiammine.toLocaleString("it-IT", { maximumFractionDigits: 1 });
}

function formattaData(testo) {
  // "T00:00" fa leggere la data come mezzanotte locale: senza, il browser userebbe
  // l'ora di Greenwich e in alcuni fusi orari mostrerebbe il giorno prima.
  const data = new Date(testo + "T00:00");
  // toLocaleDateString scrive la data in italiano, per esempio "12 ott 2026".
  return data.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

function dataDiOggi() {
  // Costruiamo "2026-10-12", lo stesso formato del campo data, per poterle confrontare.
  const oggi = new Date();
  // getMonth parte da 0 per gennaio; padStart aggiunge uno zero davanti: 3 → "03".
  const mese = String(oggi.getMonth() + 1).padStart(2, "0");
  const giorno = String(oggi.getDate()).padStart(2, "0");
  return oggi.getFullYear() + "-" + mese + "-" + giorno;
}

function applicaStato(voce, obiettivo) {
  // data-stato sul li decide l'aspetto nel CSS: bordo, nome barrato, colori dei pulsanti.
  voce.dataset.stato = obiettivo.stato;
  voce.querySelector(".goal-state").textContent = nomiStati[obiettivo.stato];
  voce.querySelector(".goal-start").setAttribute("aria-pressed", String(obiettivo.stato === "in-corso"));
  voce.querySelector(".goal-complete").setAttribute("aria-pressed", String(obiettivo.stato === "completato"));

  // Le date nel formato "2026-10-12" si possono confrontare come testo: "minore" vuol dire prima.
  const inRitardo = obiettivo.data !== "" && obiettivo.data < dataDiOggi() && obiettivo.stato !== "completato";
  voce.querySelector(".goal-date").classList.toggle("is-late", inRitardo);
}

// idNuovo indica l'obiettivo appena creato, l'unico che compare con l'animazione.
function mostraObiettivi(idNuovo) {
  elencoObiettivi.replaceChildren();
  statoVuotoObiettivi.hidden = obiettivi.length > 0;

  for (const obiettivo of obiettivi) {
    const voce = modelloVoceObiettivo.content.firstElementChild.cloneNode(true);
    voce.dataset.id = obiettivo.id;
    voce.classList.toggle("is-new", obiettivo.id === idNuovo);
    voce.querySelector(".goal-name").textContent = obiettivo.nome;

    // L'obiettivo salva solo l'id del progetto: nome e colore si leggono dal progetto,
    // così restano aggiornati anche se il progetto viene modificato.
    const progetto = progetti.find(progetto => progetto.id === obiettivo.progettoId);
    if (progetto === undefined) {
      voce.querySelector(".goal-project-name").textContent = "Progetto eliminato";
    } else {
      voce.querySelector(".goal-project-name").textContent = progetto.nome;
      voce.querySelector(".goal-project-icon").style.color = progetto.colore;
    }

    // La data è facoltativa: senza data, la sua parte resta nascosta.
    const data = voce.querySelector(".goal-date");
    data.hidden = obiettivo.data === "";
    if (obiettivo.data !== "") {
      const testoData = voce.querySelector(".goal-date-text");
      testoData.dateTime = obiettivo.data;
      testoData.textContent = formattaData(obiettivo.data);
    }

    // Fino a otto fiammine si vedono tutte; oltre, una sola fiammina seguita dal numero: 🔥12.
    const tante = obiettivo.fiammine > fiammineVisibili;
    const fiammineDaMostrare = tante ? 1 : obiettivo.fiammine;
    const fiammine = voce.querySelectorAll(".goal-flame-icons svg");
    fiammine.forEach((fiammina, posizione) => {
      // Gli svg non hanno la proprietà hidden degli elementi HTML: toggleAttribute
      // aggiunge l'attributo hidden quando la condizione è vera e lo toglie quando è falsa.
      fiammina.toggleAttribute("hidden", posizione >= fiammineDaMostrare);
    });
    const numeroFiammine = voce.querySelector(".goal-flames-count");
    numeroFiammine.hidden = !tante;
    numeroFiammine.textContent = formattaNumeroFiammine(obiettivo.fiammine);
    voce.querySelector(".goal-minutes").textContent = formattaTempo(obiettivo.fiammine);

    applicaStato(voce, obiettivo);

    const pulsanteInCorso = voce.querySelector(".goal-start");
    pulsanteInCorso.setAttribute("aria-label", "Metti in corso " + obiettivo.nome);
    pulsanteInCorso.addEventListener("click", () => cambiaStato(obiettivo.id, "in-corso"));

    const pulsanteCompleta = voce.querySelector(".goal-complete");
    pulsanteCompleta.setAttribute("aria-label", "Segna come completato " + obiettivo.nome);
    pulsanteCompleta.addEventListener("click", () => cambiaStato(obiettivo.id, "completato"));

    elencoObiettivi.append(voce);
  }
}

function cambiaStato(id, statoScelto) {
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === id);
  if (obiettivo === undefined) {
    return;
  }

  // Premere di nuovo il pulsante dello stato attuale riporta l'obiettivo a "non completato".
  const nuovoStato = obiettivo.stato === statoScelto ? "non-completato" : statoScelto;
  const elencoAggiornato = obiettivi.map(elemento =>
    elemento.id === id ? { ...elemento, stato: nuovoStato } : elemento);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;

  // Aggiorniamo solo la voce cambiata: le altre non si muovono e il focus resta sul pulsante.
  for (const voce of elencoObiettivi.children) {
    if (voce.dataset.id === id) {
      // is-updated abilita la piccola animazione dei pulsanti, solo dopo un clic.
      voce.classList.add("is-updated");
      applicaStato(voce, { ...obiettivo, stato: nuovoStato });
    }
  }
  messaggioObiettivi.textContent = obiettivo.nome + ": " + nomiStati[nuovoStato] + ".";
}

function aggiornaTestoFiammine() {
  // Il valore dei radio è testo: Number lo trasforma nel numero di fiammine.
  const fiammine = Number(moduloObiettivo.elements.fiammine.value);
  const parola = fiammine === 1 ? " fiammina" : " fiammine";
  testoFiammine.textContent = fiammine + parola + " · " + formattaTempo(fiammine);
  // Sulla nona fiammina: "+" finché non è scelta, poi quante fiammine ci sono oltre le otto.
  segnoPiuFiammine.textContent = radioPiuFiammine.checked ? "+" + (fiammine - fiammineVisibili) : "+";
}

function impostaPiuFiammine(fiammine) {
  // Il value della nona fiammina diventa il numero scelto: elements.fiammine.value lo leggerà.
  radioPiuFiammine.value = String(fiammine);
  radioPiuFiammine.setAttribute("aria-label", fiammine + " fiammine, " + formattaTempo(fiammine));
  campoNumeroFiammine.value = fiammine;
  // L'icona accanto al numero cresce con le fiammine: 1 con 9, fino a 1,5 al massimo.
  // La crescita è una proporzione dell'intervallo, così resta piccola qualunque sia il limite.
  const avanzamento = (fiammine - fiammineVisibili - 1) / (fiammineMassime - fiammineVisibili - 1);
  iconaFinestrella.style.setProperty("--crescita", 1 + avanzamento * 0.5);
  // − e + si disabilitano ai due estremi: non si scende sotto 9 né si supera il massimo.
  pulsanteMenoFiammine.disabled = fiammine <= fiammineVisibili + 1;
  pulsantePiuFiammine.disabled = fiammine >= fiammineMassime;
  aggiornaTestoFiammine();
}

function cambiaPiuFiammine(differenza) {
  // differenza vale -1 per il pulsante − e +1 per il pulsante +.
  const fiammine = Number(radioPiuFiammine.value) + differenza;
  if (fiammine <= fiammineVisibili || fiammine > fiammineMassime) {
    return;
  }
  radioPiuFiammine.checked = true;
  impostaPiuFiammine(fiammine);

  // animate esegue una breve animazione da JavaScript: l'icona fa un guizzo a ogni clic.
  // matchMedia legge la stessa preferenza del CSS: niente animazione per chi riduce il movimento.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    iconaFinestrella.animate(
      [{ translate: "0 0" }, { translate: "0 -3px" }, { translate: "0 0" }],
      { duration: 250, easing: "ease-out" }
    );
  }
}

function scriviNumeroFiammine() {
  // replace con /\D/g toglie tutto ciò che non è una cifra: "1a2" diventa "12".
  campoNumeroFiammine.value = campoNumeroFiammine.value.replace(/\D/g, "");
  const fiammine = Number(campoNumeroFiammine.value);
  // Mentre si scrive "12", per un attimo il campo contiene "1": lo applichiamo solo
  // quando è un numero valido. Gli altri casi li sistema confermaNumeroFiammine.
  if (fiammine > fiammineVisibili && fiammine <= fiammineMassime) {
    radioPiuFiammine.checked = true;
    impostaPiuFiammine(fiammine);
  }
}

function confermaNumeroFiammine() {
  // Quando si esce dal campo o si preme Invio, un numero fuori dai limiti viene corretto:
  // sotto 9 diventa 9, oltre il massimo diventa il massimo. Un campo vuoto torna al valore scelto.
  const scritto = Number(campoNumeroFiammine.value);
  let fiammine = Number(radioPiuFiammine.value);
  if (campoNumeroFiammine.value !== "") {
    fiammine = Math.min(Math.max(scritto, fiammineVisibili + 1), fiammineMassime);
  }
  radioPiuFiammine.checked = true;
  impostaPiuFiammine(fiammine);
}

function gestisciTastiNumeroFiammine(evento) {
  // Invio dentro un campo invierebbe il modulo: qui conferma soltanto il numero.
  if (evento.key === "Enter") {
    evento.preventDefault();
    confermaNumeroFiammine();
  }
}

function alternaFinestrellaFiammine(evento) {
  // Il clic sulla nona fiammina la seleziona e apre la finestrella; un secondo clic la chiude.
  finestrellaFiammine.hidden = !finestrellaFiammine.hidden;
  // Con il mouse o il dito (detail > 0) il cursore va subito nel numero, già selezionato:
  // basta scrivere. Con le frecce della tastiera detail è 0 e il focus resta sulle fiammine.
  if (!finestrellaFiammine.hidden && evento.detail > 0) {
    campoNumeroFiammine.focus();
    campoNumeroFiammine.select();
  }
}

function chiudiFinestrellaFiammine() {
  finestrellaFiammine.hidden = true;
}

function gestisciSceltaFiammine(evento) {
  // Scegliendo una delle prime otto fiammine, la finestrella non serve più
  // e la nona fiammina torna a 9: riaprendola si riparte da lì.
  if (evento.target.name === "fiammine" && evento.target !== radioPiuFiammine) {
    chiudiFinestrellaFiammine();
    impostaPiuFiammine(fiammineVisibili + 1);
  }
  aggiornaTestoFiammine();
}

function chiudiFinestrellaFuori(evento) {
  // Come per il menu: chiudiamo solo se il clic è fuori dalla finestrella e dalla nona fiammina.
  if (!finestrellaFiammine.hidden
      && !finestrellaFiammine.contains(evento.target)
      && !radioPiuFiammine.parentElement.contains(evento.target)) {
    chiudiFinestrellaFiammine();
  }
}

function chiudiFinestrellaConEsc(evento) {
  if (evento.key === "Escape" && !finestrellaFiammine.hidden) {
    chiudiFinestrellaFiammine();
    // Il focus torna sulla nona fiammina, da cui la finestrella si era aperta.
    radioPiuFiammine.focus();
  }
}

function aggiornaIconaProgetto() {
  // value del select è l'id del progetto scelto: cerchiamo il progetto per leggerne il colore.
  const progetto = progetti.find(progetto => progetto.id === sceltaProgetto.value);
  if (progetto !== undefined) {
    iconaProgettoScelto.style.color = progetto.colore;
  }
}

function apriModuloObiettivo() {
  // Il menu a tendina riceve un option per ogni progetto: value è l'id, il testo è il nome.
  sceltaProgetto.replaceChildren();
  for (const progetto of progetti) {
    // new Option(testo, valore) crea un elemento option già pronto.
    sceltaProgetto.append(new Option(progetto.nome, progetto.id));
  }
  // Il primo progetto è già selezionato: la cartella prende subito il suo colore.
  aggiornaIconaProgetto();

  moduloObiettivo.hidden = false;
  pulsanteNuovoObiettivo.hidden = true;
  messaggioObiettivi.textContent = "";
  campoNomeObiettivo.focus();
}

function chiudiModuloObiettivo() {
  moduloObiettivo.hidden = true;
  pulsanteNuovoObiettivo.hidden = false;
  // reset riporta nome e data vuoti e la scelta su una fiammina, come scritto nell'HTML.
  moduloObiettivo.reset();
  // reset non riporta il value della nona fiammina, cambiato da JavaScript: lo facciamo noi.
  chiudiFinestrellaFiammine();
  impostaPiuFiammine(fiammineVisibili + 1);
  campoNomeObiettivo.setCustomValidity("");
}

function creaObiettivo(evento) {
  evento.preventDefault();

  const nome = campoNomeObiettivo.value.trim();
  if (nome === "") {
    campoNomeObiettivo.setCustomValidity("Inserisci un nome per l'obiettivo.");
    campoNomeObiettivo.reportValidity();
    return;
  }

  const nuovoObiettivo = {
    id: crypto.randomUUID(),
    nome: nome,
    progettoId: sceltaProgetto.value,
    // Il campo data vuoto vale "": la data è facoltativa.
    data: campoData.value,
    fiammine: Number(moduloObiettivo.elements.fiammine.value),
    // Ogni obiettivo nasce "non completato".
    stato: "non-completato"
  };

  // Come per i progetti, il nuovo obiettivo va in cima alla lista.
  const elencoAggiornato = [nuovoObiettivo, ...obiettivi];
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }

  obiettivi = elencoAggiornato;
  mostraObiettivi(nuovoObiettivo.id);
  chiudiModuloObiettivo();
  messaggioObiettivi.textContent = "Obiettivo creato: " + nome + ".";
}

function cancellaErroreNome() {
  campoNomeObiettivo.setCustomValidity("");
}

// Senza progetti non si può scegliere a chi appartiene l'obiettivo: mostriamo l'avviso.
if (progetti.length === 0) {
  pulsanteNuovoObiettivo.hidden = true;
  avvisoSenzaProgetti.hidden = false;
}

pulsanteNuovoObiettivo.addEventListener("click", apriModuloObiettivo);
pulsanteAnnullaObiettivo.addEventListener("click", chiudiModuloObiettivo);
moduloObiettivo.addEventListener("submit", creaObiettivo);
campoNomeObiettivo.addEventListener("input", cancellaErroreNome);
// change scatta quando l'utente sceglie un altro progetto nel menu a tendina.
sceltaProgetto.addEventListener("change", aggiornaIconaProgetto);
// change risale dai radio delle fiammine fino al form.
moduloObiettivo.addEventListener("change", gestisciSceltaFiammine);
radioPiuFiammine.addEventListener("click", alternaFinestrellaFiammine);
pulsanteMenoFiammine.addEventListener("click", () => cambiaPiuFiammine(-1));
pulsantePiuFiammine.addEventListener("click", () => cambiaPiuFiammine(1));
// Il massimo dipende da minutiPerFiammina: lo scriviamo qui invece che nell'HTML.
campoNumeroFiammine.setAttribute("aria-label", "Numero di fiammine, da " + (fiammineVisibili + 1) + " a " + fiammineMassime);
// input scatta a ogni cifra scritta; change quando si esce dal campo dopo averlo cambiato.
campoNumeroFiammine.addEventListener("input", scriviNumeroFiammine);
campoNumeroFiammine.addEventListener("change", confermaNumeroFiammine);
campoNumeroFiammine.addEventListener("keydown", gestisciTastiNumeroFiammine);
document.addEventListener("click", chiudiFinestrellaFuori);
document.addEventListener("keydown", chiudiFinestrellaConEsc);
mostraObiettivi();
