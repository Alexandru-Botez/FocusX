// =====================================================================
// OBIETTIVI.JS: la pagina Obiettivi (obiettivi.html)
// Crea, mostra, modifica ed elimina gli obiettivi, ne cambia lo stato
// e li salva nel browser. I progetti vengono soltanto letti.
// È un modulo: i suoi nomi sono privati e il codice comune lo importa.
//
// Sezioni, nell'ordine:
//   - IMPORTAZIONI
//   - ELEMENTI DELLA PAGINA
//   - IMPOSTAZIONI
//   - SALVATAGGIO NEL BROWSER
//   - DATI IN MEMORIA
//   - FORMATTAZIONE DELLE DATE
//   - ELENCO DEGLI OBIETTIVI
//   - STATI DEGLI OBIETTIVI
//   - SCELTA DELLE FIAMMINE
//   - FINESTRELLA DELLE FIAMMINE
//   - CONTROLLO DEI DOPPIONI
//   - MODULO: CREARE, MODIFICARE, ELIMINARE
//   - AVVIO DELLA PAGINA
// =====================================================================


// =====================================================================
// SEZIONE IMPORTAZIONI
// Il codice comune ad altre pagine, scritto una volta sola nei moduli.
// =====================================================================

import { chiaveProgetti, chiaveObiettivi, leggiElenco } from "./archivio.js?v=moduli-1";
import {
  fiammineVisibili,
  oreMassime,
  fiammineMassime,
  formattaTempo,
  disegnaFiammine
} from "./fiammine.js?v=moduli-1";


// =====================================================================
// SEZIONE ELEMENTI DELLA PAGINA
// Gli elementi HTML che il codice legge o modifica, trovati con il loro id.
// =====================================================================

// Pulsanti e modulo.
const pulsanteNuovoObiettivo = document.getElementById("new-goal-button");
const avvisoSenzaProgetti = document.getElementById("goals-no-projects");
const moduloObiettivo = document.getElementById("goal-form");
const titoloModuloObiettivo = document.getElementById("goal-form-title");
const pulsanteSalvaObiettivo = document.getElementById("save-goal-button");
const pulsanteEliminaObiettivo = document.getElementById("delete-goal-button");
// L'avviso che compare sopra Salva quando l'obiettivo sarebbe un doppione.
const avvisoDoppione = document.getElementById("goal-duplicate-warning");
const pulsanteAnnullaObiettivo = document.getElementById("cancel-goal-button");

// Campi del modulo.
const campoNomeObiettivo = document.getElementById("goal-name");
const sceltaProgetto = document.getElementById("goal-project");
const iconaProgettoScelto = document.getElementById("goal-project-icon");
const campoData = document.getElementById("goal-date");

// Fiammine e finestrella.
const testoFiammine = document.getElementById("goal-flames-output");
const radioPiuFiammine = document.getElementById("goal-flames-more");
const segnoPiuFiammine = document.getElementById("goal-flames-more-badge");
const finestrellaFiammine = document.getElementById("goal-flames-panel");
const campoNumeroFiammine = document.getElementById("goal-flames-number");
const iconaFinestrella = document.getElementById("goal-flames-panel-icon");
const pulsanteMenoFiammine = document.getElementById("goal-flames-less");
const pulsantePiuFiammine = document.getElementById("goal-flames-plus");

// Elenco e messaggi.
const elencoObiettivi = document.getElementById("goal-list");
const statoVuotoObiettivi = document.getElementById("goals-empty");
const messaggioObiettivi = document.getElementById("goals-message");
const modelloVoceObiettivo = document.getElementById("goal-item-template");


// =====================================================================
// SEZIONE IMPOSTAZIONI
// Valori fissi che decidono il comportamento della pagina.
// Le chiavi dei dati arrivano da js/archivio.js; il valore di una fiammina
// e i limiti (fiammineVisibili, oreMassime, fiammineMassime) da js/fiammine.js.
// =====================================================================

// Gli unici stati che un obiettivo può avere: servono a controllare l'archivio salvato.
const statiValidi = ["non-completato", "in-corso", "completato"];


// =====================================================================
// SEZIONE SALVATAGGIO NEL BROWSER
// Leggono e scrivono progetti e obiettivi in localStorage,
// controllando che i dati salvati siano validi. La lettura vera e propria
// è leggiElenco, importata da js/archivio.js.
// =====================================================================

// Restituisce i progetti salvati, che servono per il menu e per nome e colore delle voci.
function caricaProgetti() {
  try {
    return leggiElenco(chiaveProgetti);
  } catch {
    messaggioObiettivi.textContent = "Non riesco a leggere i progetti salvati nel browser.";
    return [];
  }
}

// Restituisce gli obiettivi salvati, solo se ognuno ha tutti i dati giusti.
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
      // La data è obbligatoria: un testo vuoto non è valido.
      && obiettivo.data !== ""
      && Number.isInteger(obiettivo.fiammine)
      && obiettivo.fiammine >= 1
      && obiettivo.fiammine <= fiammineMassime
      // includes controlla che lo stato sia uno di quelli dell'array statiValidi.
      && statiValidi.includes(obiettivo.stato)
      // I minuti lavorati possono avere decimali (12,5 = 12 min 30 s), ma non superano le 16 ore.
      // Gli obiettivi salvati prima di questo campo non lo hanno: undefined va bene, vale 0.
      && (obiettivo.minutiLavorati === undefined
        || (typeof obiettivo.minutiLavorati === "number"
          && obiettivo.minutiLavorati >= 0
          && obiettivo.minutiLavorati <= oreMassime * 60)));
    if (!valido) {
      throw new Error("Archivio obiettivi non valido");
    }
    // minutiLavorati: 0 è il valore di partenza; ...obiettivo, scritto dopo,
    // lo sostituisce con quello salvato quando c'è.
    return archivio.map(obiettivo => ({ minutiLavorati: 0, ...obiettivo }));
  } catch {
    // Come per i progetti, non sovrascriviamo un archivio illeggibile.
    pulsanteNuovoObiettivo.disabled = true;
    messaggioObiettivi.textContent = "Non riesco a leggere gli obiettivi salvati nel browser.";
    return [];
  }
}

// Scrive l'elenco degli obiettivi nel browser; restituisce false se non ci riesce.
function salvaObiettivi(elenco) {
  try {
    localStorage.setItem(chiaveObiettivi, JSON.stringify(elenco));
    return true;
  } catch {
    messaggioObiettivi.textContent = "Non riesco a salvare l'obiettivo. Controlla lo spazio e le impostazioni del browser.";
    return false;
  }
}


// =====================================================================
// SEZIONE DATI IN MEMORIA
// I dati con cui lavora la pagina mentre è aperta.
// =====================================================================

const progetti = caricaProgetti();
let obiettivi = caricaObiettivi();
// L'id dell'obiettivo aperto nel modulo per la modifica; null quando il modulo crea un obiettivo nuovo.
let idInModifica = null;


// =====================================================================
// SEZIONE FORMATTAZIONE DELLE DATE
// Trasformano le date nel testo che si legge nella pagina.
// Il testo del tempo delle fiammine, formattaTempo, arriva da js/fiammine.js.
// =====================================================================

// Trasforma "2026-10-12" in una data leggibile, come "12 ott 2026".
function formattaData(testo) {
  // "T00:00" fa leggere la data come mezzanotte locale: senza, il browser userebbe
  // l'ora di Greenwich e in alcuni fusi orari mostrerebbe il giorno prima.
  const data = new Date(testo + "T00:00");
  // toLocaleDateString scrive la data in italiano, per esempio "12 ott 2026".
  return data.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

// Restituisce la data di oggi nello stesso formato del campo data.
function dataDiOggi() {
  // Costruiamo "2026-10-12", lo stesso formato del campo data, per poterle confrontare.
  const oggi = new Date();
  // getMonth parte da 0 per gennaio; padStart aggiunge uno zero davanti: 3 → "03".
  const mese = String(oggi.getMonth() + 1).padStart(2, "0");
  const giorno = String(oggi.getDate()).padStart(2, "0");
  return oggi.getFullYear() + "-" + mese + "-" + giorno;
}


// =====================================================================
// SEZIONE ELENCO DEGLI OBIETTIVI
// Costruisce la lista: una voce, copiata dal template, per ogni obiettivo.
// =====================================================================

// Ricostruisce tutta la lista; idNuovo indica l'obiettivo appena creato,
// l'unico che compare con l'animazione.
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

    // Ogni obiettivo ha una data: la scriviamo leggibile e, in datetime, nel formato 2026-10-12.
    const testoData = voce.querySelector(".goal-date-text");
    testoData.dateTime = obiettivo.data;
    testoData.textContent = formattaData(obiettivo.data);

    // Le fiammine le disegna applicaStato, che le aggiorna anche a ogni cambio di stato.
    voce.querySelector(".goal-minutes").textContent = formattaTempo(obiettivo.fiammine);

    applicaStato(voce, obiettivo);

    const pulsanteModifica = voce.querySelector(".goal-edit");
    pulsanteModifica.setAttribute("aria-label", "Modifica " + obiettivo.nome);
    pulsanteModifica.addEventListener("click", () => apriModificaObiettivo(obiettivo.id));

    const pulsanteInCorso = voce.querySelector(".goal-start");
    pulsanteInCorso.setAttribute("aria-label", "Metti in corso " + obiettivo.nome);
    pulsanteInCorso.addEventListener("click", () => cambiaStato(obiettivo.id, "in-corso"));

    const pulsanteCompleta = voce.querySelector(".goal-complete");
    pulsanteCompleta.setAttribute("aria-label", "Segna come completato " + obiettivo.nome);
    pulsanteCompleta.addEventListener("click", () => cambiaStato(obiettivo.id, "completato"));

    elencoObiettivi.append(voce);
  }
  // Anche dopo una ricostruzione, l'obiettivo in modifica resta nascosto.
  nascondiVoceInModifica();
}

// Nasconde dalla lista l'obiettivo aperto nel modulo; con idInModifica null le mostra tutte.
function nascondiVoceInModifica() {
  // Come nei progetti: solo la voce dell'obiettivo in modifica riceve hidden,
  // perché i suoi dati sono già nel modulo. Con idInModifica uguale a null si vedono tutte.
  for (const voce of elencoObiettivi.children) {
    voce.hidden = voce.dataset.id === idInModifica;
  }
}


// =====================================================================
// SEZIONE STATI DEGLI OBIETTIVI
// Non completato, in corso e completato: come si vedono nella voce
// e cosa succede premendo il cerchio o il play.
// =====================================================================

// Mostra lo stato di un obiettivo nella sua voce: pulsanti, data in ritardo e fiammine.
function applicaStato(voce, obiettivo) {
  // data-stato sul li decide l'aspetto nel CSS: bordo, nome barrato, colori dei pulsanti.
  voce.dataset.stato = obiettivo.stato;
  voce.querySelector(".goal-start").setAttribute("aria-pressed", String(obiettivo.stato === "in-corso"));
  const pulsanteCompleta = voce.querySelector(".goal-complete");
  pulsanteCompleta.setAttribute("aria-pressed", String(obiettivo.stato === "completato"));
  // Senza tempo lavorato non si può completare. Un obiettivo già completato resta
  // cliccabile, così si può sempre riaprire.
  const senzaTempo = obiettivo.minutiLavorati === 0 && obiettivo.stato !== "completato";
  pulsanteCompleta.disabled = senzaTempo;
  pulsanteCompleta.title = senzaTempo ? "Lavora sull'obiettivo prima di completarlo" : "Segna come completato";

  // Le date nel formato "2026-10-12" si possono confrontare come testo: "minore" vuol dire prima.
  const inRitardo = obiettivo.data < dataDiOggi() && obiettivo.stato !== "completato";
  voce.querySelector(".goal-date").classList.toggle("is-late", inRitardo);

  // Quante fiammine si vedono e l'aspetto di ognuna (vuota, da completare o fatta):
  // lo decide la funzione comune di js/fiammine.js, usata anche dalla Home.
  disegnaFiammine(
    voce.querySelectorAll(".goal-flame-icons svg"),
    voce.querySelector(".goal-flames-count"),
    obiettivo
  );
}

// Cambia lo stato di un obiettivo dopo un clic sul cerchio o sul play, e lo salva.
function cambiaStato(id, statoScelto) {
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === id);
  if (obiettivo === undefined) {
    return;
  }

  // Premere di nuovo il pulsante dello stato attuale riporta l'obiettivo a "non completato".
  const nuovoStato = obiettivo.stato === statoScelto ? "non-completato" : statoScelto;
  // Il cerchio è disattivato senza tempo lavorato; il controllo resta anche qui, per sicurezza.
  if (nuovoStato === "completato" && obiettivo.minutiLavorati === 0) {
    return;
  }

  const elencoAggiornato = obiettivi.map(elemento => {
    if (elemento.id === id) {
      return { ...elemento, stato: nuovoStato };
    }
    // Un solo obiettivo alla volta può essere in corso: quello che lo era si ferma.
    if (nuovoStato === "in-corso" && elemento.stato === "in-corso") {
      return { ...elemento, stato: "non-completato" };
    }
    return elemento;
  });
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }
  obiettivi = elencoAggiornato;

  // Aggiorniamo solo le voci cambiate: quella cliccata e, se c'era, quella che si è fermata.
  // Le altre non si muovono e il focus resta sul pulsante.
  for (const voce of elencoObiettivi.children) {
    const aggiornato = obiettivi.find(elemento => elemento.id === voce.dataset.id);
    if (voce.dataset.stato !== aggiornato.stato) {
      applicaStato(voce, aggiornato);
    }
    // is-updated abilita la piccola animazione dei pulsanti, solo dopo un clic.
    if (voce.dataset.id === id) {
      voce.classList.add("is-updated");
    }
  }
}


// =====================================================================
// SEZIONE SCELTA DELLE FIAMMINE
// Il tempo previsto nel modulo. Le prime otto fiammine sono radio da cliccare;
// la nona, con il +, vale da 9 al massimo e si regola con − e +
// o scrivendo il numero nella finestrella.
// =====================================================================

// Aggiorna il testo sotto le fiammine ("3 fiammine · 1 h 15 min") e il segno sulla nona.
function aggiornaTestoFiammine() {
  // Il valore dei radio è testo: Number lo trasforma nel numero di fiammine.
  const fiammine = Number(moduloObiettivo.elements.fiammine.value);
  const parola = fiammine === 1 ? " fiammina" : " fiammine";
  testoFiammine.textContent = fiammine + parola + " · " + formattaTempo(fiammine);
  // Sulla nona fiammina: "+" finché non è scelta, poi quante fiammine ci sono oltre le otto.
  segnoPiuFiammine.textContent = radioPiuFiammine.checked ? "+" + (fiammine - fiammineVisibili) : "+";
}

// Dà alla nona fiammina un numero (da 9 al massimo) e aggiorna tutto ciò che lo mostra.
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

// Toglie o aggiunge una fiammina con i pulsanti − e + della finestrella.
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

// Mentre si scrive nel numero della finestrella: tiene solo le cifre e applica i numeri validi.
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

// Quando si esce dal numero o si preme Invio: riporta il numero dentro i limiti.
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

// Invio nel numero della finestrella conferma il numero invece di salvare il modulo.
function gestisciTastiNumeroFiammine(evento) {
  // Invio dentro un campo invierebbe il modulo: qui conferma soltanto il numero.
  if (evento.key === "Enter") {
    evento.preventDefault();
    confermaNumeroFiammine();
  }
}

// Dopo ogni scelta di fiammine aggiorna il testo; con una delle prime otto chiude la finestrella.
function gestisciSceltaFiammine(evento) {
  // Scegliendo una delle prime otto fiammine, la finestrella non serve più
  // e la nona fiammina torna a 9: riaprendola si riparte da lì.
  if (evento.target.name === "fiammine" && evento.target !== radioPiuFiammine) {
    chiudiFinestrellaFiammine();
    impostaPiuFiammine(fiammineVisibili + 1);
  }
  aggiornaTestoFiammine();
}


// =====================================================================
// SEZIONE FINESTRELLA DELLE FIAMMINE
// Apertura e chiusura del piccolo pannello accanto alla nona fiammina:
// con un clic sulla nona, un clic fuori o il tasto Esc.
// =====================================================================

// Apre o chiude la finestrella con un clic sulla nona fiammina.
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

// Chiude la finestrella.
function chiudiFinestrellaFiammine() {
  finestrellaFiammine.hidden = true;
}

// Chiude la finestrella quando si clicca fuori da lei e dalla nona fiammina.
function chiudiFinestrellaFuori(evento) {
  // Come per il menu: chiudiamo solo se il clic è fuori dalla finestrella e dalla nona fiammina.
  if (!finestrellaFiammine.hidden
      && !finestrellaFiammine.contains(evento.target)
      && !radioPiuFiammine.parentElement.contains(evento.target)) {
    chiudiFinestrellaFiammine();
  }
}

// Chiude la finestrella con Esc e riporta il focus sulla nona fiammina.
function chiudiFinestrellaConEsc(evento) {
  if (evento.key === "Escape" && !finestrellaFiammine.hidden) {
    chiudiFinestrellaFiammine();
    // Il focus torna sulla nona fiammina, da cui la finestrella si era aperta.
    radioPiuFiammine.focus();
  }
}


// =====================================================================
// SEZIONE CONTROLLO DEI DOPPIONI
// Due obiettivi dello stesso progetto non possono avere lo stesso nome:
// finché il modulo descrive un doppione, Salva è disattivato
// e un avviso spiega perché. Maiuscole e spazi ai lati non contano.
// =====================================================================

// Dice se un altro obiettivo dello stesso progetto ha già questo nome.
function esisteDoppione(nome, progettoId) {
  // trim e toLowerCase: "Ripasso", "ripasso" e " Ripasso " contano come lo stesso nome.
  const nomeNormale = nome.trim().toLowerCase();
  // some restituisce true appena trova un elemento che rispetta la condizione.
  // L'obiettivo in modifica è escluso: confrontarlo con sé stesso darebbe sempre un doppione.
  return obiettivi.some(obiettivo =>
    obiettivo.id !== idInModifica
    && obiettivo.nome.trim().toLowerCase() === nomeNormale
    && obiettivo.progettoId === progettoId);
}

// A ogni cambio di nome o progetto disattiva Salva e mostra l'avviso se l'obiettivo è un doppione.
function controllaDoppione() {
  const doppione = esisteDoppione(campoNomeObiettivo.value, sceltaProgetto.value);
  pulsanteSalvaObiettivo.disabled = doppione;
  avvisoDoppione.hidden = !doppione;
}


// =====================================================================
// SEZIONE MODULO: CREARE, MODIFICARE, ELIMINARE
// Lo stesso modulo serve per un obiettivo nuovo e per modificarne uno:
// idInModifica dice quale dei due lavori sta facendo. Aprendo, chiudendo
// e salvando, il modulo richiama il controllo dei doppioni.
// =====================================================================

// Colora la cartella accanto al menu con il colore del progetto scelto.
function aggiornaIconaProgetto() {
  // value del select è l'id del progetto scelto: cerchiamo il progetto per leggerne il colore.
  const progetto = progetti.find(progetto => progetto.id === sceltaProgetto.value);
  if (progetto !== undefined) {
    iconaProgettoScelto.style.color = progetto.colore;
  }
}

// Mostra il modulo vuoto e riempie il menu con i progetti.
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
  controllaDoppione();
  campoNomeObiettivo.focus();
}

// Apre il modulo con i dati di un obiettivo, pronto per modificarlo.
function apriModificaObiettivo(id) {
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === id);
  if (obiettivo === undefined) {
    return;
  }

  // Chiudere e riaprire azzera una creazione o una modifica lasciata a metà
  // e riempie il menu dei progetti.
  chiudiModuloObiettivo();
  apriModuloObiettivo();
  idInModifica = id;

  // Il modulo si riempie con i dati dell'obiettivo.
  campoNomeObiettivo.value = obiettivo.nome;
  // Se il progetto è stato eliminato, nel menu non c'è: il select resta vuoto
  // e required chiede di sceglierne un altro prima di salvare.
  sceltaProgetto.value = obiettivo.progettoId;
  aggiornaIconaProgetto();
  campoData.value = obiettivo.data;

  if (obiettivo.fiammine > fiammineVisibili) {
    // Oltre otto il radio con quel valore non esiste: si sceglie la nona fiammina
    // e impostaPiuFiammine le dà il numero giusto, come farebbero − e +.
    radioPiuFiammine.checked = true;
    impostaPiuFiammine(obiettivo.fiammine);
  } else {
    // Scrivere value su un gruppo di radio seleziona quello con quel valore.
    moduloObiettivo.elements.fiammine.value = String(obiettivo.fiammine);
    aggiornaTestoFiammine();
  }

  titoloModuloObiettivo.textContent = "Modifica obiettivo";
  pulsanteSalvaObiettivo.textContent = "Salva modifiche";
  // Elimina ha senso solo per un obiettivo che esiste già.
  pulsanteEliminaObiettivo.hidden = false;
  // L'obiettivo compare già nel modulo: nell'elenco sarebbe un doppione.
  nascondiVoceInModifica();
  // Scrivere value da JavaScript non genera eventi: il controllo lo chiamiamo noi.
  controllaDoppione();
  campoNomeObiettivo.focus();
}

// Chiude il modulo, lo svuota e lo riporta alla creazione di un obiettivo nuovo.
function chiudiModuloObiettivo() {
  moduloObiettivo.hidden = true;
  pulsanteNuovoObiettivo.hidden = false;
  // reset riporta nome e data vuoti e la scelta su una fiammina, come scritto nell'HTML.
  moduloObiettivo.reset();
  // reset non riporta il value della nona fiammina, cambiato da JavaScript: lo facciamo noi.
  chiudiFinestrellaFiammine();
  impostaPiuFiammine(fiammineVisibili + 1);
  campoNomeObiettivo.setCustomValidity("");

  // Il modulo torna alla creazione e l'obiettivo che era in modifica ricompare nell'elenco.
  idInModifica = null;
  nascondiVoceInModifica();
  titoloModuloObiettivo.textContent = "Nuovo obiettivo";
  pulsanteSalvaObiettivo.textContent = "Salva obiettivo";
  pulsanteEliminaObiettivo.hidden = true;
  controllaDoppione();
}

// Al salvataggio: controlla il nome, raccoglie i dati e sceglie fra creare e modificare.
function inviaModuloObiettivo(evento) {
  // submit invierebbe il form e ricaricherebbe la pagina: gestiamo noi il salvataggio.
  evento.preventDefault();

  const nome = campoNomeObiettivo.value.trim();
  if (nome === "") {
    campoNomeObiettivo.setCustomValidity("Inserisci un nome per l'obiettivo.");
    campoNomeObiettivo.reportValidity();
    return;
  }

  // I dati scritti nel modulo, uguali per la creazione e per la modifica.
  const dati = {
    nome: nome,
    progettoId: sceltaProgetto.value,
    // required nell'HTML garantisce che qui la data ci sia sempre.
    data: campoData.value,
    fiammine: Number(moduloObiettivo.elements.fiammine.value)
  };
  // Salva è già disattivato per un doppione; il controllo resta anche qui, per sicurezza.
  if (esisteDoppione(dati.nome, dati.progettoId)) {
    return;
  }

  if (idInModifica === null) {
    creaObiettivo(dati);
  } else {
    modificaObiettivo(idInModifica, dati);
  }
}

// Aggiunge un obiettivo nuovo in cima alla lista e lo salva.
function creaObiettivo(dati) {
  // ...dati copia nome, progetto, data e fiammine; aggiungiamo id, stato e tempo.
  // Ogni obiettivo nasce "non completato" e senza minuti lavorati.
  const nuovoObiettivo = { id: crypto.randomUUID(), ...dati, stato: "non-completato", minutiLavorati: 0 };

  // Come per i progetti, il nuovo obiettivo va in cima alla lista.
  const elencoAggiornato = [nuovoObiettivo, ...obiettivi];
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }

  obiettivi = elencoAggiornato;
  mostraObiettivi(nuovoObiettivo.id);
  chiudiModuloObiettivo();
  messaggioObiettivi.textContent = "Obiettivo creato: " + dati.nome + ".";
}

// Sostituisce i dati di un obiettivo esistente, tenendo id, stato e minuti lavorati.
function modificaObiettivo(id, dati) {
  // map copia l'elenco: solo l'obiettivo in modifica riceve i dati nuovi.
  // ...obiettivo tiene id e stato; ...dati, scritto dopo, sostituisce gli altri campi.
  const elencoAggiornato = obiettivi.map(obiettivo =>
    obiettivo.id === id ? { ...obiettivo, ...dati } : obiettivo);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }

  obiettivi = elencoAggiornato;
  mostraObiettivi();
  chiudiModuloObiettivo();
  messaggioObiettivi.textContent = "Obiettivo modificato: " + dati.nome + ".";

  // Il focus torna alla matita dello stesso obiettivo, nella sua posizione nell'elenco.
  const posizione = obiettivi.findIndex(obiettivo => obiettivo.id === id);
  elencoObiettivi.querySelectorAll(".goal-edit")[posizione].focus();
}

// Elimina l'obiettivo aperto nel modulo di modifica.
function eliminaObiettivo() {
  // Elimina si vede solo durante una modifica: l'obiettivo da eliminare è quello in idInModifica.
  const obiettivo = obiettivi.find(obiettivo => obiettivo.id === idInModifica);
  if (obiettivo === undefined) {
    return;
  }

  // filter crea un nuovo array con tutti gli obiettivi tranne quello da eliminare.
  const elencoAggiornato = obiettivi.filter(elemento => elemento.id !== obiettivo.id);
  if (!salvaObiettivi(elencoAggiornato)) {
    return;
  }

  obiettivi = elencoAggiornato;
  // Prima chiudiamo il modulo, che riporta idInModifica a null; poi ridisegniamo la lista.
  chiudiModuloObiettivo();
  mostraObiettivi();
  messaggioObiettivi.textContent = "Obiettivo eliminato: " + obiettivo.nome + ".";
  // Il pulsante premuto è sparito insieme al modulo: il focus va su Crea obiettivo.
  pulsanteNuovoObiettivo.focus();
}

// Toglie l'avviso "Inserisci un nome" appena si scrive nel campo.
function cancellaErroreNome() {
  campoNomeObiettivo.setCustomValidity("");
}


// =====================================================================
// SEZIONE AVVIO DELLA PAGINA
// Il codice che parte subito al caricamento: collega i pulsanti
// e i campi alle funzioni e mostra la lista.
// =====================================================================

// Senza progetti non si può scegliere a chi appartiene l'obiettivo: mostriamo l'avviso.
if (progetti.length === 0) {
  pulsanteNuovoObiettivo.hidden = true;
  avvisoSenzaProgetti.hidden = false;
}

// Modulo.
pulsanteNuovoObiettivo.addEventListener("click", apriModuloObiettivo);
pulsanteAnnullaObiettivo.addEventListener("click", chiudiModuloObiettivo);
pulsanteEliminaObiettivo.addEventListener("click", eliminaObiettivo);
moduloObiettivo.addEventListener("submit", inviaModuloObiettivo);
campoNomeObiettivo.addEventListener("input", cancellaErroreNome);
// change scatta quando l'utente sceglie un altro progetto nel menu a tendina.
sceltaProgetto.addEventListener("change", aggiornaIconaProgetto);

// Controllo dei doppioni.
// input risale dal campo del nome e dal menu dei progetti fino al form.
moduloObiettivo.addEventListener("input", controllaDoppione);

// Fiammine.
// change risale dai radio delle fiammine fino al form.
moduloObiettivo.addEventListener("change", gestisciSceltaFiammine);
radioPiuFiammine.addEventListener("click", alternaFinestrellaFiammine);
pulsanteMenoFiammine.addEventListener("click", () => cambiaPiuFiammine(-1));
pulsantePiuFiammine.addEventListener("click", () => cambiaPiuFiammine(1));
// Il massimo dipende da minutiPerFiammina (in js/fiammine.js): lo scriviamo qui invece che nell'HTML.
campoNumeroFiammine.setAttribute("aria-label", "Numero di fiammine, da " + (fiammineVisibili + 1) + " a " + fiammineMassime);
// input scatta a ogni cifra scritta; change quando si esce dal campo dopo averlo cambiato.
campoNumeroFiammine.addEventListener("input", scriviNumeroFiammine);
campoNumeroFiammine.addEventListener("change", confermaNumeroFiammine);
campoNumeroFiammine.addEventListener("keydown", gestisciTastiNumeroFiammine);

// Finestrella: un clic fuori o Esc la chiudono.
document.addEventListener("click", chiudiFinestrellaFuori);
document.addEventListener("keydown", chiudiFinestrellaConEsc);

// La lista compare subito, con gli obiettivi salvati.
mostraObiettivi();
