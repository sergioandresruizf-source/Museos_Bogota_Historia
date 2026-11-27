// Pantalla de inicio, menú de pausa y ayuda ("Cómo se juega").
import { openModal, confirmDialog } from "./modal.js";
import { ICONS, escapeHTML } from "./icons.js";

export function showStartScreen(app, { onStart }) {
  const el = document.getElementById("start-screen");
  const s = app.store.state;
  const hasSave = app.store.hadSave;
  const done = app.progress.doneCount(s);
  el.innerHTML = `
    <div class="start-inner">
      <span class="diamond diamond-left" aria-hidden="true"></span>
      <span class="diamond diamond-right" aria-hidden="true"></span>
      <div class="start-seal" aria-hidden="true"><span>1810</span></div>
      <span class="eyebrow">— Museo de la Independencia · Casa del Florero</span>
      <h1 class="start-title">El cronista<br><em>de 1810.</em></h1>
      <p class="start-intro">
        Eres aprendiz de cronista en la Casa del Florero. Recorre sus salas,
        examina cada obra y supera su reto para documentar las <strong>${app.progress.total} obras</strong>
        del museo. El Cabildo abierto revisará tu bitácora en el camino.
      </p>
      <form class="start-form" id="start-form" autocomplete="off">
        <label for="start-name" class="start-label">Tu nombre de cronista <span>(opcional)</span></label>
        <input id="start-name" name="name" type="text" maxlength="40" placeholder="Escribe tu nombre"
          value="${escapeHTML(s.player.name !== "Cronista" ? s.player.name : "")}">
        <div class="start-buttons">
          ${hasSave ? `
            <button type="submit" class="btn btn-primary btn-lg" data-act="continue">${ICONS.play}<span>Continuar</span></button>
            <button type="button" class="btn btn-ghost" data-act="new">Comenzar de nuevo</button>` : `
            <button type="submit" class="btn btn-primary btn-lg" data-act="start">${ICONS.play}<span>Comenzar recorrido</span></button>`}
        </div>
        ${hasSave ? `<p class="start-save">Partida guardada: ${done} de ${app.progress.total} obras documentadas.</p>` : ""}
      </form>
      <div class="start-links">
        <button type="button" class="link-btn" data-act="help">${ICONS.help}<span>Cómo se juega</span></button>
        <a class="link-btn" href="./acerca.html">${ICONS.info}<span>Sobre el proyecto</span></a>
      </div>
      <p class="start-keys" aria-hidden="true"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> caminar · <kbd>E</kbd> examinar · <kbd>Esc</kbd> pausa</p>
    </div>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("is-in"));
  const form = el.querySelector("#start-form");
  const nameInput = el.querySelector("#start-name");

  const go = (fresh) => {
    const name = nameInput.value.trim().slice(0, 40);
    el.classList.remove("is-in");
    el.classList.add("is-out");
    setTimeout(() => { el.hidden = true; el.classList.remove("is-out"); }, 450);
    onStart({ fresh, name });
  };
  form.addEventListener("submit", (e) => { e.preventDefault(); go(!hasSave); });
  el.querySelector('[data-act="new"]')?.addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "¿Comenzar de nuevo?",
      text: "Se borrará tu avance guardado: obras, monedas, insignias y Cabildos. Esta acción no se puede deshacer.",
      confirmText: "Sí, comenzar de nuevo", cancelText: "Conservar mi partida", danger: true,
    });
    if (ok) go(true);
  });
  el.querySelector('[data-act="help"]').addEventListener("click", () => openHelp(app));
  setTimeout(() => el.querySelector(".btn-primary")?.focus({ preventScroll: true }), 300);
}

export function openPause(app) {
  const s = app.store.state;
  const m = openModal({ className: "modal-small pause-modal", label: "Pausa" });
  const demo = app.demo;
  m.body.innerHTML = `
    <span class="eyebrow">— Pausa</span>
    <h2 class="modal-title">El recorrido <em>espera.</em></h2>
    <div class="menu-list">
      <button type="button" class="btn btn-primary" data-act="resume">${ICONS.play}<span>Continuar</span></button>
      <button type="button" class="btn btn-ghost" data-act="report">${ICONS.book}<span>Bitácora del cronista</span></button>
      <button type="button" class="btn btn-ghost" data-act="help">${ICONS.help}<span>Cómo se juega</span></button>
      <div class="toggle-row">
        <button type="button" class="toggle ${s.settings.music ? "is-on" : ""}" data-act="music" aria-pressed="${s.settings.music}">${ICONS.music}<span>Música</span><i></i></button>
        <button type="button" class="toggle ${s.settings.sfx ? "is-on" : ""}" data-act="sfx" aria-pressed="${s.settings.sfx}">${ICONS.bolt}<span>Efectos</span><i></i></button>
      </div>
      ${demo ? `<button type="button" class="btn btn-demo" data-act="demo">Completar obra cercana <small>(modo de prueba)</small></button>` : ""}
      <a class="btn btn-ghost" href="./acerca.html">${ICONS.info}<span>Sobre el proyecto</span></a>
      <button type="button" class="btn btn-text" data-act="home">Volver a la pantalla de inicio</button>
    </div>`;
  const on = (act, fn) => m.body.querySelector(`[data-act="${act}"]`)?.addEventListener("click", fn);
  on("resume", () => m.close());
  on("report", () => { m.close(); app.actions.openReport(); });
  on("help", () => openHelp(app));
  const toggle = (key) => (e) => {
    app.store.update((st) => { st.settings[key] = !st.settings[key]; }, "settings");
    const b = e.currentTarget;
    b.classList.toggle("is-on", app.store.state.settings[key]);
    b.setAttribute("aria-pressed", String(app.store.state.settings[key]));
    app.audio.refresh();
  };
  on("music", toggle("music"));
  on("sfx", toggle("sfx"));
  on("demo", () => { m.close(); app.actions.demoCompleteNearest(); });
  on("home", () => { m.close(); app.actions.goHome(); });
  return m;
}

export function openHelp(app) {
  const m = openModal({ className: "help-modal", label: "Cómo se juega" });
  m.body.innerHTML = `
    <span class="eyebrow">— Cómo se juega</span>
    <h2 class="modal-title">Tu oficio: <em>documentar.</em></h2>
    <ol class="help-steps">
      <li><span>01</span><div><strong>Recorre la casa.</strong> Camina por el patio y las salas. Cada cuadro tiene una placa con su número.</div></li>
      <li><span>02</span><div><strong>Examina una obra.</strong> Acércate hasta que brille y pulsa <kbd>E</kbd> (o toca <em>Examinar</em>). Verás su ficha.</div></li>
      <li><span>03</span><div><strong>Supera su reto.</strong> Cada obra tiene un minijuego. Ganas monedas y hasta 3 estrellas; puedes repetirlo para mejorar.</div></li>
      <li><span>04</span><div><strong>Preséntate al Cabildo.</strong> Al 35 %, 70 % y 100 % del recorrido responde 5 preguntas sobre lo que documentaste (aprueba con 3). Así se abren nuevas salas.</div></li>
    </ol>
    <div class="help-grid">
      <div class="help-box">
        <h3>Computador</h3>
        <p><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> para caminar</p>
        <p><kbd>E</kbd>, <kbd>Espacio</kbd> o <kbd>Enter</kbd> para examinar</p>
        <p><kbd>Esc</kbd> para pausar</p>
      </div>
      <div class="help-box">
        <h3>Celular</h3>
        <p>Joystick abajo a la izquierda para caminar.</p>
        <p>Botón redondo abajo a la derecha para examinar.</p>
        <p>Botón ☰ arriba para pausar.</p>
      </div>
      <div class="help-box">
        <h3>Recompensas</h3>
        <p>10 monedas por obra y 5 por cada estrella. Cada Cabildo aprobado da 50 monedas.</p>
        <p>Gana insignias y revisa todo en tu <strong>Bitácora</strong>.</p>
      </div>
    </div>
    <div class="btn-row"><button type="button" class="btn btn-primary" data-act="ok">Entendido</button></div>`;
  m.body.querySelector('[data-act="ok"]').addEventListener("click", () => m.close());
  return m;
}
