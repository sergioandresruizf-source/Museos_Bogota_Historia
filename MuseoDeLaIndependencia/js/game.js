// Punto de entrada de "El cronista de 1810": carga datos, arma el mundo y conecta la interfaz.
import { store } from "./core/state.js";
import { createProgress } from "./core/progress.js";
import { buildBadges, applyWorkResult, applyCheckpointPass, evaluateBadges } from "./core/rewards.js";
import { openCabildo } from "./core/checkpoint.js";
import { buildRooms } from "./world/rooms.js";
import { createEngine } from "./world/engine.js";
import { createInput } from "./world/input.js";
import { createHUD, showRoomBanner } from "./ui/hud.js";
import { createAudio } from "./ui/audio.js";
import { onModalStackChange, modalCount, closeTopModal, toast } from "./ui/modal.js";
import { showStartScreen, openPause, openHelp } from "./ui/menu.js";
import { openWorkModal, flyCoins } from "./ui/workModal.js";
import { openReport } from "./ui/report.js";
import { openDiploma } from "./ui/diploma.js";
import { ICONS, escapeHTML } from "./ui/icons.js";

const DEMO = new URLSearchParams(location.search).get("demo") === "1";

async function loadModule(path) {
  try { return await import(path); } catch (err) { console.error(`No se pudo cargar ${path}`, err); return null; }
}

function fatal(msg) {
  const el = document.getElementById("loading");
  if (el) { el.hidden = false; el.classList.add("is-error"); el.innerHTML = `<div class="loading-card"><span class="eyebrow">— Algo salió mal</span><h2>No pudimos abrir <em>el museo.</em></h2><p>${msg}</p></div>`; }
}

async function main() {
  const [worksMod, salasMod, gamesMod] = await Promise.all([
    loadModule("./data/works.js"), loadModule("./data/salas.js"), loadModule("./games/index.js"),
  ]);
  const works = (worksMod?.works || worksMod?.default || []).slice().sort((a, b) => a.id - b.id);
  const salas = (salasMod?.salas || salasMod?.default || []).slice().sort((a, b) => a.id - b.id);
  const GAMES = gamesMod?.GAMES || gamesMod?.default || {};
  if (!works.length || !salas.length) {
    fatal("Faltan los datos de las obras o de las salas. Recarga la página en un momento.");
    return;
  }

  store.load();
  const progress = createProgress(works, salas);
  const badges = buildBadges(salas);
  const isTouch = () => document.body.classList.contains("is-touch");

  const audio = createAudio({ getSettings: () => store.state.settings });
  const input = createInput({
    joystickEl: document.getElementById("joystick"),
    knobEl: document.querySelector("#joystick .joy-knob"),
    actionEl: document.getElementById("action-btn"),
  });

  const app = { store, works, salas, progress, badges, GAMES, audio, demo: DEMO, started: false, actions: {} };
  const rooms = buildRooms(works, salas);
  app.rooms = rooms;

  const actionBtn = document.getElementById("action-btn");
  const engine = createEngine({
    canvas: document.getElementById("world"), rooms, salas, progress, input, isTouch,
    getState: () => store.state,
    hooks: {
      onExamine: (work) => app.actions.openWork(work),
      onLockedDoor: (door) => {
        const sala = salas.find((s) => s.id === door.to);
        const need = sala?.unlockAt || 35;
        if (progress.percent(store.state) >= need && !progress.checkpointPassed(store.state, need)) app.actions.openCabildo(need);
        else {
          const next = progress.nextGoal(store.state);
          toast(`${ICONS.lock}<span><strong>${escapeHTML(sala?.name || "Sala")}</strong> se abre en el Cabildo del ${need} %.${next?.worksNeeded ? ` Te faltan ${next.worksNeeded} ${next.worksNeeded === 1 ? "obra" : "obras"}.` : ""}</span>`);
        }
      },
      onEnterRoom: (salaId, { announce }) => {
        const sala = salas.find((s) => s.id === salaId);
        hud.setSala(sala);
        audio.playMusic(sala?.playlist || sala?.music);
        if (announce && app.started) showRoomBanner(sala);
        savePosition();
      },
      onStep: () => audio.sfx("step"),
      onTargetChange: (t) => {
        actionBtn.classList.toggle("is-ready", !!t);
        let label = "Examinar";
        if (t?.kind === "door") {
          const need = salas.find((s) => s.id === t.door.to)?.unlockAt || 0;
          label = progress.percent(store.state) >= need ? "Cabildo" : "Puerta";
        }
        actionBtn.querySelector(".action-label").textContent = label;
        actionBtn.setAttribute("aria-label", label === "Examinar" ? "Examinar la obra" : label === "Cabildo" ? "Presentar el Cabildo" : "Ver la puerta cerrada");
      },
      onPositionChange: () => savePosition(),
    },
  });
  app.engine = engine;

  const hud = createHUD(app);
  app.hud = hud;
  // El botón de sonido del HUD refleja los ajustes (HUD o menú de pausa)
  store.subscribe((_, reason) => { if (reason === "settings") hud.update({ animate: false }); });

  // --- pausa automática cuando hay ventanas abiertas ---
  onModalStackChange((n) => {
    engine.setPaused(n > 0 || !app.started);
    document.body.classList.toggle("has-modal", n > 0);
  });

  function savePosition() {
    if (!app.started) return;
    store.state.position = engine.position();
    store.save();
  }

  // --- tiempo jugado ---
  let lastTick = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = now - lastTick;
    lastTick = now;
    if (app.started && !document.hidden) {
      store.state.playMs += Math.min(dt, 5000);
      store.state.position = engine.position();
      store.save();
    }
  }, 5000);
  window.addEventListener("pagehide", savePosition);
  document.addEventListener("visibilitychange", () => { if (document.hidden) savePosition(); });

  // --- detección de táctil ---
  const markTouch = () => document.body.classList.add("is-touch");
  if (matchMedia("(pointer: coarse)").matches) markTouch();
  window.addEventListener("touchstart", markTouch, { once: true, passive: true });

  input.on("firstInteraction", () => audio.unlock());
  input.on("pause", () => {
    if (modalCount() > 0) { closeTopModal(); return; }
    if (app.started) app.actions.openPause();
  });

  // ------------------------------------------------------------
  // Acciones compartidas
  // ------------------------------------------------------------
  let pendingBefore = progress.pendingCheckpoint(store.state);

  Object.assign(app.actions, {
    openWork: (work) => openWorkModal(app, work),
    openReport: () => openReport(app),
    openPause: () => openPause(app),
    openHelp: () => openHelp(app),
    openDiploma: () => openDiploma(app),
    flyCoins: (el, n) => flyCoins(app, el, n),
    openCabildo: (t) => openCabildo(app, t),
    openPendingCabildo: () => { const t = progress.pendingCheckpoint(store.state); if (t != null) openCabildo(app, t); },
    toggleSound: () => {
      const on = store.state.settings.music || store.state.settings.sfx;
      store.update((s) => { s.settings.music = !on; s.settings.sfx = !on; }, "settings");
      audio.unlock();
      audio.refresh();
      toast(on ? "Sonido desactivado" : "Sonido activado", { ms: 1600 });
    },

    /** Registra el resultado de un minijuego. Devuelve el resumen para la recompensa. */
    completeWork(work, result, { silent = false } = {}) {
      const sum = applyWorkResult(store.state, work, result, progress, badges);
      store.save();
      engine.refresh();
      if (!silent) hud.update({ animate: true });
      return sum;
    },

    /** Tras cerrar la ficha: abrir el Cabildo si se acaba de alcanzar un umbral. */
    afterWorkModal() {
      const p = progress.pendingCheckpoint(store.state);
      if (p != null && p !== pendingBefore) {
        pendingBefore = p;
        setTimeout(() => { if (modalCount() === 0) openCabildo(app, p); }, 450);
      }
      hud.update({ animate: false });
    },

    recordCabildo(t, { passed, score, total }) {
      let res = { coins: 0, newBadges: [] };
      store.update((s) => {
        const c = s.checkpoints[String(t)];
        c.attempts = (c.attempts || 0) + 1;
        c.score = score;
        c.total = total;
        if (passed && !c.passed) { c.passed = true; c.at = Date.now(); }
        if (passed) res = applyCheckpointPass(s, t, progress, badges);
      }, "cabildo");
      engine.refresh();
      hud.update({ animate: true });
      pendingBefore = progress.pendingCheckpoint(store.state);
      return res;
    },

    afterCabildo() { hud.update({ animate: false }); },

    resetGame() {
      store.reset(true);
      try { localStorage.removeItem("cronista1810.v1"); } catch (e) { /* sin almacenamiento */ }
      location.reload();
    },

    goHome() {
      savePosition();
      app.started = false;
      engine.setControllable(false);
      engine.setPaused(true);
      hud.show(false);
      document.body.classList.remove("is-playing");
      store.hadSave = true;
      showStartScreen(app, { onStart: start });
    },

    demoCompleteNearest() {
      const w = engine.nearestPendingWork((id) => progress.isDone(store.state, id));
      if (!w) { toast("Todas las obras de esta sala ya están documentadas."); return; }
      const sum = app.actions.completeWork(w, { score: 100, stars: 3, timeMs: 1000 });
      audio.sfx("ding");
      toast(`<span><strong>Modo de prueba:</strong> obra Nº ${w.id} documentada (+${sum.coins} monedas).</span>`);
      app.actions.afterWorkModal();
    },
  });

  // ------------------------------------------------------------
  // Inicio
  // ------------------------------------------------------------
  function start({ fresh, name }) {
    if (fresh) {
      store.reset(true);
      pendingBefore = null;
      engine.refresh();
    }
    if (name) store.state.player.name = name;
    else if (!store.state.player.name) store.state.player.name = "Cronista";
    // insignias que pudieran faltar (p. ej. datos actualizados)
    evaluateBadges(store.state, progress, badges);
    store.save();
    audio.unlock();
    app.started = true;
    document.body.classList.add("is-playing");
    hud.show(true);
    hud.update({ animate: false });
    const pos = store.state.position;
    const sala = progress.isSalaUnlocked(store.state, pos?.sala) ? pos.sala : 1;
    const usePos = !fresh && pos && Number.isFinite(pos.x) && pos.sala === sala ? pos : null;
    engine.enterRoom(sala, usePos, { announce: false });
    engine.setControllable(true);
    engine.setPaused(modalCount() > 0);
    showRoomBanner(salas.find((s) => s.id === sala));
    if (fresh) toast(`<span>¡Bienvenido, <strong>${escapeHTML(store.state.player.name)}</strong>! Acércate a un cuadro y examínalo.</span>`, { ms: 4200 });
    const pend = progress.pendingCheckpoint(store.state);
    pendingBefore = pend;
    if (pend != null) setTimeout(() => toast(`${ICONS.scroll}<span>Tienes un <strong>Cabildo pendiente</strong>. Búscalo arriba en la barra.</span>`, { ms: 4200 }), 1200);
  }

  const startPos = store.state.position;
  engine.start(progress.isSalaUnlocked(store.state, startPos?.sala) ? startPos.sala : 1, startPos);
  engine.setControllable(false);
  engine.setPaused(true);
  hud.show(false);
  document.getElementById("loading").hidden = true;
  showStartScreen(app, { onStart: start });

  // Precarga suave de miniaturas de todas las obras
  setTimeout(() => engine.preload(works), 1500);

  if (DEMO) {
    window.cronistaDemo = {
      app,
      complete(id, stars = 3) { const w = works.find((x) => x.id === id); if (w) { app.actions.completeWork(w, { score: 100, stars, timeMs: 1000 }); } },
      completeMany(n, stars = 3) {
        let k = 0;
        for (const w of works) {
          if (k >= n) break;
          if (progress.isDone(store.state, w.id) || !progress.isSalaUnlocked(store.state, w.sala)) continue;
          app.actions.completeWork(w, { score: 100, stars, timeMs: 1000 }, { silent: true });
          k++;
        }
        hud.update({ animate: true });
        app.actions.afterWorkModal();
        return k;
      },
      standAt: (id) => engine.standAt(id),
      state: () => store.state,
    };
  }
}

main().catch((err) => { console.error(err); fatal("Ocurrió un error inesperado al iniciar el juego."); });
