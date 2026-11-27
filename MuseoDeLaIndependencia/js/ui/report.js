// "Bitácora del cronista": informe completo, imprimible, con reinicio confirmado.
import { openModal, confirmDialog, printElement } from "./modal.js";
import { ICONS, starsHTML, escapeHTML, badgeEmblem, formatDate, formatDuration } from "./icons.js";
import { THRESHOLDS, CHECKPOINTS } from "../core/progress.js";

export function openReport(app) {
  const m = openModal({ className: "report-modal", label: "Bitácora del cronista" });
  const s = app.store.state;
  const P = app.progress;
  const pct = P.percent(s);
  const done = P.doneCount(s);
  const stars = P.totalStars(s);
  app.audio.sfx("page");

  const salaRows = app.salas.map((sala) => {
    const st = P.salaStats(s, sala.id);
    const salaStars = P.worksBySala(sala.id).reduce((n, w) => n + (s.works[w.id]?.done ? s.works[w.id].stars || 0 : 0), 0);
    const open = P.isSalaUnlocked(s, sala.id);
    const w = st.total ? (st.done / st.total) * 100 : 0;
    return `<tr>
      <th scope="row"><span class="r-sala-n">${sala.id}</span> ${escapeHTML(sala.name)}${open ? "" : ` <span class="r-lock">${ICONS.lock}<span>cerrada</span></span>`}</th>
      <td>${st.done}/${st.total}</td>
      <td>${salaStars} ★</td>
      <td class="r-bar-cell"><div class="mini-bar"><i style="width:${w}%"></i></div></td>
    </tr>`;
  }).join("");

  const cpRows = THRESHOLDS.map((t) => {
    const c = s.checkpoints[String(t)] || {};
    const state = c.passed ? `<span class="r-ok">${ICONS.check}Aprobado</span>` : c.attempts ? `<span class="r-bad">Por aprobar</span>` : pct >= t ? `<span class="r-pend">Pendiente</span>` : `<span class="r-muted">Aún no disponible</span>`;
    return `<tr>
      <th scope="row">${escapeHTML(CHECKPOINTS[t].name)} <small>(${t} %)</small></th>
      <td>${state}</td>
      <td>${c.attempts ? `${c.score}/${c.total}` : "—"}</td>
      <td>${c.attempts || 0}</td>
      <td>${c.passed && c.at ? formatDate(c.at) : "—"}</td>
    </tr>`;
  }).join("");

  const earned = app.badges.filter((b) => s.badges.includes(b.id));
  const missing = app.badges.filter((b) => !s.badges.includes(b.id));
  const badgeCard = (b, on) => `<li class="badge-card ${on ? "is-on" : "is-off"}">${badgeEmblem(b.icon)}<div><strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.desc)}</small></div></li>`;

  const doneWorks = app.works.filter((w) => s.works[w.id]?.done);
  const worksRows = doneWorks.map((w) => {
    const r = s.works[w.id];
    return `<tr><td>${w.id}</td><td>${escapeHTML(w.title)}</td><td>${escapeHTML(app.salas.find((x) => x.id === w.sala)?.name || "")}</td><td>${starsHTML(r.stars || 1)}</td><td>${r.attempts || 1}</td></tr>`;
  }).join("");

  m.body.innerHTML = `
    <div class="report" id="report-sheet">
      <header class="report-head">
        <div>
          <span class="eyebrow">— Museo de la Independencia · Casa del Florero</span>
          <h2 class="report-title">Bitácora <em>del cronista.</em></h2>
          <p class="report-sub">Cronista: <strong>${escapeHTML(s.player.name || "Cronista")}</strong> · Inicio: ${formatDate(s.startedAt)} · Corte: ${formatDate(Date.now())}</p>
        </div>
        <div class="report-seal" aria-hidden="true"><span>${Math.round(pct)}%</span></div>
      </header>

      <section class="report-progress" aria-label="Progreso del recorrido">
        <div class="report-progress-head"><span>Progreso del recorrido</span><strong>${Math.round(pct)} %</strong></div>
        <div class="report-bar"><i style="width:${pct}%"></i>${THRESHOLDS.map((t) => `<span style="left:${t}%" class="${P.checkpointPassed(s, t) ? "is-passed" : ""}"><b>${t}</b></span>`).join("")}</div>
      </section>

      <section class="report-stats">
        <div><span>Obras documentadas</span><strong>${done}<small>/${P.total}</small></strong></div>
        <div><span>Estrellas</span><strong>${stars}<small>/${P.total * 3}</small></strong></div>
        <div><span>Monedas</span><strong>${s.coins}</strong></div>
        <div><span>Insignias</span><strong>${earned.length}<small>/${app.badges.length}</small></strong></div>
        <div><span>Tiempo jugado</span><strong class="r-time">${formatDuration(s.playMs)}</strong></div>
      </section>

      <section class="report-section">
        <h3>Obras por sala</h3>
        <table class="report-table">
          <thead><tr><th scope="col">Sala</th><th scope="col">Obras</th><th scope="col">Estrellas</th><th scope="col" class="r-bar-cell">Avance</th></tr></thead>
          <tbody>${salaRows}</tbody>
        </table>
      </section>

      <section class="report-section">
        <h3>Cabildos abiertos</h3>
        <table class="report-table report-cabildos">
          <thead><tr><th scope="col">Cuestionario</th><th scope="col">Estado</th><th scope="col">Nota</th><th scope="col">Intentos</th><th scope="col">Fecha</th></tr></thead>
          <tbody>${cpRows}</tbody>
        </table>
      </section>

      <section class="report-section">
        <h3>Insignias ganadas <small>(${earned.length})</small></h3>
        ${earned.length ? `<ul class="badge-grid">${earned.map((b) => badgeCard(b, true)).join("")}</ul>` : `<p class="r-empty">Aún no tienes insignias. ¡Documenta tu primera obra!</p>`}
        <h3 class="r-sub">Insignias por ganar <small>(${missing.length})</small></h3>
        ${missing.length ? `<ul class="badge-grid">${missing.map((b) => badgeCard(b, false)).join("")}</ul>` : `<p class="r-empty">¡Las tienes todas!</p>`}
      </section>

      <section class="report-section">
        <h3>Obras documentadas <small>(${doneWorks.length})</small></h3>
        ${doneWorks.length ? `<table class="report-table report-works">
          <thead><tr><th scope="col">Nº</th><th scope="col">Obra</th><th scope="col">Sala</th><th scope="col">Estrellas</th><th scope="col">Intentos</th></tr></thead>
          <tbody>${worksRows}</tbody></table>` : `<p class="r-empty">Todavía no has documentado obras.</p>`}
      </section>
      <p class="report-foot">El cronista de 1810 · Proyecto académico, Universidad Distrital Francisco José de Caldas</p>
    </div>
    <div class="btn-row report-actions">
      <button type="button" class="btn btn-danger-ghost" data-act="reset">${ICONS.reset}<span>Reiniciar recorrido</span></button>
      <button type="button" class="btn btn-ghost" data-act="print">${ICONS.print}<span>Imprimir / Guardar PDF</span></button>
      <button type="button" class="btn btn-primary" data-act="close">Volver al museo</button>
    </div>`;

  m.body.querySelector('[data-act="close"]').addEventListener("click", () => m.close());
  m.body.querySelector('[data-act="print"]').addEventListener("click", () => printElement(m.body.querySelector("#report-sheet"), "report"));
  m.body.querySelector('[data-act="reset"]').addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "¿Reiniciar el recorrido?",
      text: "Se borrarán todas las obras documentadas, monedas, insignias y Cabildos. Tu bitácora quedará en blanco.",
      confirmText: "Sí, reiniciar", cancelText: "Cancelar", danger: true,
    });
    if (ok) { m.close(); app.actions.resetGame(); }
  });
  return m;
}
