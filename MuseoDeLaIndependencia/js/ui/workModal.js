// Ficha de la obra + lanzamiento del minijuego + animación de recompensa.
import { openModal } from "./modal.js";
import { ICONS, starsHTML, escapeHTML, badgeEmblem } from "./icons.js";

export function openWorkModal(app, work) {
  const m = openModal({
    className: "work-modal", label: `Ficha: ${work.title}`,
    onClose: () => { cleanupGame(); app.actions.afterWorkModal(); },
  });
  let game = null;
  let playStarted = 0;
  app.audio.sfx("open");

  function cleanupGame() {
    if (game) { try { game.destroy?.(); } catch (e) { console.error(e); } game = null; }
    app.audio.duck(false);
  }

  function setPlaying(on) {
    m.el.classList.toggle("is-playing", on);
    m.dismissible = !on;
    const close = m.el.querySelector(".modal-close");
    if (close) close.hidden = on;
  }

  // ---------------- Ficha ----------------
  function renderSheet() {
    setPlaying(false);
    const s = app.store.state;
    const rec = s.works[work.id];
    const done = !!rec?.done;
    const type = work.game?.type;
    const mod = type ? app.GAMES?.[type] : null;
    const meta = mod?.meta;
    const sala = app.salas.find((x) => x.id === work.sala);
    const metaRows = [
      ["Autor", work.author], ["Fecha", work.date], ["Tipo", work.type], ["Técnica", work.technique],
      ["Registro", work.registro], ["Sala", sala?.name],
    ].filter(([, v]) => v && !/^sin datos$/i.test(String(v).trim()));
    const typeLabel = work.type && !/^sin datos$/i.test(work.type.trim()) ? work.type : "";

    m.body.innerHTML = `
      <article class="work-sheet">
        <figure class="work-figure">
          <div class="work-frame">
            <img src="${escapeHTML(work.image)}" alt="${escapeHTML(work.title)}${work.author ? ", de " + escapeHTML(work.author) : ""}" loading="eager">
            ${done ? `<span class="work-seal" title="Obra documentada">${starsHTML(rec.stars || 1, 3, "seal-stars")}</span>` : ""}
          </div>
          <figcaption>Obra Nº ${work.id}${work.registro ? " · " + escapeHTML(work.registro) : ""}</figcaption>
        </figure>
        <div class="work-info">
          <span class="eyebrow">— Obra Nº ${work.id}${typeLabel ? " · " + escapeHTML(typeLabel) : ""}</span>
          <h2 class="work-title">${escapeHTML(work.title)}</h2>
          <dl class="work-meta">${metaRows.map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}</dl>
          <p class="work-desc">${escapeHTML(work.description || "")}</p>
          ${done && work.funFact ? `<p class="work-fact"><strong>Dato curioso.</strong> ${escapeHTML(work.funFact)}</p>` : ""}
          <section class="game-card ${done ? "is-done" : ""}" aria-label="Reto de la obra">
            <div class="game-card-head">
              <span class="eyebrow">Reto de la obra</span>
              ${done ? `<span class="game-card-stars">${starsHTML(rec.stars || 1)}<small>${rec.attempts} ${rec.attempts === 1 ? "intento" : "intentos"}</small></span>` : ""}
            </div>
            ${meta ? `
              <h3>${escapeHTML(meta.name)}</h3>
              <p>${escapeHTML(meta.instructions || "")}</p>` : `
              <h3>Reto en preparación</h3>
              <p class="game-missing">El reto de esta obra todavía se está preparando. Mientras tanto, disfruta su ficha y vuelve pronto.</p>`}
            <div class="btn-row btn-row-left">
              ${meta ? `<button type="button" class="btn btn-primary" data-act="play">${ICONS.play}<span>${done ? "Jugar de nuevo" : "Jugar"}</span></button>` : ""}
              <button type="button" class="btn btn-ghost" data-act="close">Cerrar</button>
            </div>
            ${done && (rec.stars || 0) < 3 && meta ? `<p class="game-hint">Juega de nuevo para conseguir más estrellas.</p>` : ""}
          </section>
        </div>
      </article>`;
    m.body.querySelector('[data-act="close"]').addEventListener("click", () => m.close("close"));
    m.body.querySelector('[data-act="play"]')?.addEventListener("click", () => startGame(mod));
    m.body.scrollTop = 0;
    m.focusFirst();
  }

  // ---------------- Minijuego ----------------
  function startGame(mod) {
    setPlaying(true);
    app.audio.sfx("click");
    app.audio.duck(true);
    m.body.innerHTML = `
      <div class="game-view">
        <div class="game-bar">
          <button type="button" class="btn btn-text game-back" data-act="back" aria-label="Volver a la ficha">${ICONS.back}<span class="game-back-label">Volver a la ficha</span></button>
          <div class="game-bar-title"><span class="eyebrow">${escapeHTML(mod.meta?.name || "Reto")}</span><strong>${escapeHTML(work.title)}</strong></div>
        </div>
        <div class="game-host" id="game-host"></div>
      </div>`;
    const host = m.body.querySelector("#game-host");
    m.body.querySelector('[data-act="back"]').addEventListener("click", () => { cleanupGame(); renderSheet(); });
    playStarted = performance.now();
    let finished = false;
    try {
      game = mod.start(host, work, {
        onComplete: (result) => {
          if (finished) return;
          finished = true;
          const r = { ...result };
          if (!r.timeMs) r.timeMs = Math.round(performance.now() - playStarted);
          cleanupGame();
          const summary = app.actions.completeWork(work, r);
          renderReward(summary);
        },
        onExit: () => { if (finished) return; cleanupGame(); renderSheet(); },
      }) || null;
    } catch (err) {
      console.error(err);
      cleanupGame();
      host.innerHTML = `<div class="game-error"><h3>Ups, este reto tuvo un problema</h3><p>No pudimos abrir el minijuego. Puedes volver a la ficha e intentarlo más tarde.</p></div>`;
    }
    m.body.scrollTop = 0;
  }

  // ---------------- Recompensa ----------------
  function renderReward(sum) {
    setPlaying(false);
    m.el.classList.add("is-reward");
    const pending = app.progress.pendingCheckpoint(app.store.state);
    const crossed = pending != null && sum.pctBefore < pending;
    const heading = sum.firstTime ? "¡Obra documentada!" : sum.improved ? "¡Mejoraste tus estrellas!" : "Reto superado otra vez";
    m.body.innerHTML = `
      <div class="reward">
        <div class="reward-rays" aria-hidden="true"></div>
        <div class="reward-seal" aria-hidden="true"><span>${work.id}</span></div>
        <span class="eyebrow">— ${escapeHTML(work.title)}</span>
        <h2 class="modal-title">${heading}</h2>
        <div class="reward-stars">${starsHTML(sum.stars, 3, "stars stars-big")}</div>
        ${sum.coins > 0 ? `<p class="reward-coins">${ICONS.coin}<strong>+${sum.coins}</strong> monedas</p>` : `<p class="reward-note">Tu mejor marca sigue siendo de ${sum.starsAfter} ${sum.starsAfter === 1 ? "estrella" : "estrellas"}.</p>`}
        ${sum.newBadges.length ? `<div class="reward-badges">${sum.newBadges.map((b) => `
          <div class="badge-card is-new">${badgeEmblem(b.icon)}<div><span class="eyebrow">Nueva insignia</span><strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.desc)}</small></div></div>`).join("")}</div>` : ""}
        <div class="reward-progress">
          <div class="reward-progress-head"><span>Recorrido</span><strong><span class="rp-num">${Math.round(sum.pctBefore)}</span> %</strong></div>
          <div class="mini-bar"><i style="width:${sum.pctBefore}%"></i></div>
        </div>
        ${crossed ? `<p class="reward-cabildo">${ICONS.scroll}<span>¡Llegaste al ${pending} % del recorrido! El <strong>Cabildo abierto</strong> te espera.</span></p>` : ""}
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" data-act="sheet">Ver ficha</button>
          <button type="button" class="btn btn-primary" data-act="go">${crossed ? "Ir al Cabildo" : "Continuar recorrido"}</button>
        </div>
      </div>`;
    m.body.querySelector('[data-act="sheet"]').addEventListener("click", () => { m.el.classList.remove("is-reward"); renderSheet(); });
    m.body.querySelector('[data-act="go"]').addEventListener("click", () => m.close("done"));
    m.body.scrollTop = 0;

    // animaciones encadenadas
    app.audio.sfx("ding");
    const stars = m.body.querySelectorAll(".stars-big .star");
    stars.forEach((st, i) => {
      st.style.animationDelay = `${0.35 + i * 0.25}s`;
      if (i < sum.stars) setTimeout(() => app.audio.sfx("star"), 350 + i * 250);
    });
    setTimeout(() => {
      const fillEl = m.body.querySelector(".mini-bar i");
      if (fillEl) fillEl.style.width = sum.pctAfter + "%";
      const num = m.body.querySelector(".rp-num");
      if (num) countUp(num, Math.round(sum.pctBefore), Math.round(sum.pctAfter), 900);
      app.hud.update({ animate: true });
    }, 700);
    if (sum.coins > 0) setTimeout(() => flyCoins(app, m.body.querySelector(".reward-coins"), Math.min(8, 2 + Math.round(sum.coins / 8))), 1000);
    setTimeout(() => m.body.querySelector('[data-act="go"]')?.focus({ preventScroll: true }), 400);
  }

  renderSheet();
  return m;
}

function countUp(node, from, to, ms) {
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    node.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Monedas que vuelan desde la recompensa hasta el contador del HUD. */
export function flyCoins(app, fromEl, n = 5) {
  const target = app.hud.coinTarget();
  if (!fromEl || !target) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const layer = document.getElementById("fx-layer");
  for (let i = 0; i < n; i++) {
    const c = document.createElement("span");
    c.className = "fly-coin";
    c.innerHTML = ICONS.coin;
    const sx = a.left + 20 + Math.random() * 30, sy = a.top + a.height / 2;
    c.style.left = sx + "px"; c.style.top = sy + "px";
    layer.appendChild(c);
    const dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy;
    const mid = { x: dx * 0.4 + (Math.random() - 0.5) * 120, y: dy * 0.4 - 60 - Math.random() * 60 };
    const anim = c.animate([
      { transform: "translate(0,0) scale(0.6)", opacity: 0 },
      { transform: `translate(${mid.x}px, ${mid.y}px) scale(1.15)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0.9 },
    ], { duration: 900 + i * 70, delay: i * 90, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" });
    anim.onfinish = () => { c.remove(); app.hud.bumpCoins(); if (i % 2 === 0) app.audio.sfx("coin"); };
  }
}
