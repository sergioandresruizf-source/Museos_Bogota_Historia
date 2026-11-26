// HUD fijo: barra de progreso con marcas 35/70/100, monedas, insignias, sala y botones.
import { ICONS } from "./icons.js";
import { THRESHOLDS } from "../core/progress.js";

export function createHUD(app) {
  const el = document.getElementById("hud");
  el.innerHTML = `
    <div class="hud-card hud-progress" aria-label="Progreso del recorrido">
      <div class="hud-progress-head">
        <span class="hud-eyebrow" id="hud-sala">Patio colonial</span>
        <span class="hud-pct"><strong id="hud-pct">0</strong> %</span>
      </div>
      <div class="hud-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso del recorrido">
        <div class="hud-bar-fill" id="hud-fill"></div>
        ${THRESHOLDS.map((t) => `<span class="hud-mark" data-t="${t}" style="left:${t}%"><i></i><b>${t}</b></span>`).join("")}
      </div>
      <div class="hud-chips">
        <span class="hud-chip" title="Obras documentadas"><span class="hud-chip-k">Obras</span> <strong id="hud-works">0/50</strong></span>
        <span class="hud-chip" title="Monedas">${ICONS.coin}<strong id="hud-coins">0</strong></span>
        <span class="hud-chip" title="Insignias">${ICONS.badge}<strong id="hud-badges">0</strong></span>
      </div>
    </div>
    <button type="button" class="hud-cabildo" id="hud-cabildo" hidden>${ICONS.scroll}<span>Cabildo pendiente</span></button>
    <div class="hud-actions">
      <button type="button" class="icon-btn hud-btn" id="hud-report" aria-label="Bitácora del cronista" title="Bitácora">${ICONS.book}<span class="hud-btn-label">Bitácora</span></button>
      <button type="button" class="icon-btn hud-btn" id="hud-sound" aria-label="Silenciar sonido" title="Sonido">${ICONS.sound}</button>
      <button type="button" class="icon-btn hud-btn" id="hud-menu" aria-label="Menú y pausa" title="Menú">${ICONS.menu}</button>
    </div>`;

  const $ = (id) => el.querySelector("#" + id);
  const fill = $("hud-fill"), pct = $("hud-pct"), bar = el.querySelector(".hud-bar");
  let shownPct = -1;
  let countRaf = null;

  $("hud-report").addEventListener("click", () => app.actions.openReport());
  $("hud-menu").addEventListener("click", () => app.actions.openPause());
  $("hud-cabildo").addEventListener("click", () => app.actions.openPendingCabildo());
  $("hud-sound").addEventListener("click", () => app.actions.toggleSound());

  function animateNumber(node, from, to, ms = 1100) {
    if (countRaf) cancelAnimationFrame(countRaf);
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = Math.round(from + (to - from) * e);
      if (k < 1) countRaf = requestAnimationFrame(step);
    };
    countRaf = requestAnimationFrame(step);
  }

  function update({ animate = true } = {}) {
    const s = app.store.state;
    const p = app.progress.percent(s);
    const rounded = Math.round(p);
    fill.style.width = p + "%";
    bar.setAttribute("aria-valuenow", String(rounded));
    if (animate && shownPct >= 0 && rounded > shownPct) {
      animateNumber(pct, shownPct, rounded);
      el.querySelector(".hud-progress").classList.remove("is-bump");
      void el.offsetWidth;
      el.querySelector(".hud-progress").classList.add("is-bump");
    } else pct.textContent = rounded;
    shownPct = rounded;
    $("hud-works").textContent = `${app.progress.doneCount(s)}/${app.progress.total}`;
    $("hud-coins").textContent = s.coins;
    $("hud-badges").textContent = s.badges.length;
    for (const m of el.querySelectorAll(".hud-mark")) {
      const t = Number(m.dataset.t);
      m.classList.toggle("is-reached", p >= t);
      m.classList.toggle("is-passed", app.progress.checkpointPassed(s, t));
      m.title = `${t} %: ${app.progress.checkpointPassed(s, t) ? "Cabildo aprobado" : p >= t ? "Cabildo pendiente" : "Cabildo por alcanzar"}`;
    }
    const pending = app.progress.pendingCheckpoint(s);
    $("hud-cabildo").hidden = pending == null;
    const on = s.settings.music || s.settings.sfx;
    $("hud-sound").innerHTML = on ? ICONS.sound : ICONS.mute;
    $("hud-sound").setAttribute("aria-label", on ? "Silenciar sonido" : "Activar sonido");
    $("hud-sound").classList.toggle("is-off", !on);
  }

  return {
    el,
    update,
    setSala(sala) { $("hud-sala").textContent = sala ? sala.name : ""; },
    show(v) { el.hidden = !v; el.classList.toggle("is-visible", v); },
    coinTarget() { return $("hud-coins"); },
    bumpCoins() { const c = $("hud-coins").parentElement; c.classList.remove("is-bump"); void c.offsetWidth; c.classList.add("is-bump"); },
  };
}

/** Cartel con el nombre de la sala al entrar. */
export function showRoomBanner(sala) {
  const el = document.getElementById("room-banner");
  if (!el || !sala) return;
  const words = sala.name.split(" ");
  const last = words.pop();
  el.innerHTML = `
    <span class="eyebrow">Sala ${sala.id}</span>
    <h2>${words.join(" ")} <em>${last}</em></h2>
    <p>${sala.subtitle || ""}</p>`;
  el.classList.remove("is-in");
  void el.offsetWidth;
  el.classList.add("is-in");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("is-in"), 3200);
}
