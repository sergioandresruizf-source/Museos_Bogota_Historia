// Diploma final: "Diploma de Cronista de 1810" (imprimible).
import { openModal, printElement } from "./modal.js";
import { ICONS, escapeHTML, formatDate, formatDuration } from "./icons.js";

export function openDiploma(app) {
  const s = app.store.state;
  const P = app.progress;
  const m = openModal({ className: "diploma-modal", label: "Diploma de Cronista de 1810" });
  app.audio.sfx("unlock");
  const passedAt = s.checkpoints["100"]?.at || Date.now();
  const cab = ["35", "70", "100"].map((t) => s.checkpoints[t]).filter((c) => c?.passed);
  const cabScore = cab.reduce((n, c) => n + (c.score || 0), 0);
  const cabTotal = cab.reduce((n, c) => n + (c.total || 0), 0);
  m.body.innerHTML = `
    <div class="diploma" id="diploma-sheet">
      <div class="diploma-border">
        <span class="eyebrow">Museo de la Independencia · Casa del Florero · Bogotá</span>
        <p class="diploma-pre">El Cabildo abierto otorga el</p>
        <h2 class="diploma-title">Diploma de Cronista <em>de 1810</em></h2>
        <p class="diploma-pre">a</p>
        <p class="diploma-name">${escapeHTML(s.player.name || "Cronista")}</p>
        <p class="diploma-text">por haber recorrido la Casa del Florero, examinado y documentado sus ${P.total} obras,
          y superado los tres Cabildos abiertos con honor y buena memoria.</p>
        <ul class="diploma-stats">
          <li><strong>${P.doneCount(s)}</strong><span>obras</span></li>
          <li><strong>${P.totalStars(s)}</strong><span>estrellas</span></li>
          <li><strong>${s.coins}</strong><span>monedas</span></li>
          <li><strong>${s.badges.length}</strong><span>insignias</span></li>
          <li><strong>${cabScore}/${cabTotal || 15}</strong><span>en los Cabildos</span></li>
          <li><strong>${formatDuration(s.playMs)}</strong><span>de recorrido</span></li>
        </ul>
        <div class="diploma-foot">
          <div class="diploma-sign"><span></span><small>El Cabildo abierto</small></div>
          <div class="diploma-wax" aria-hidden="true"><span>1810</span></div>
          <div class="diploma-sign"><span class="diploma-date">${formatDate(passedAt)}</span><small>Santafé de Bogotá</small></div>
        </div>
      </div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn btn-ghost" data-act="report">${ICONS.book}<span>Ver bitácora</span></button>
      <button type="button" class="btn btn-ghost" data-act="print">${ICONS.print}<span>Imprimir diploma</span></button>
      ${window.parent !== window ? '<button type="button" class="btn btn-primary" data-act="ruta">Finalizar y continuar →</button>' : ""}
      <button type="button" class="btn btn-ghost" data-act="close">Seguir explorando</button>
    </div>`;
  m.body.querySelector('[data-act="close"]').addEventListener("click", () => m.close());
  /* CONEXIÓN CON LA RUTA: avisa al mapa que este museo terminó */
  m.body.querySelector('[data-act="ruta"]')?.addEventListener("click", () => { try { window.parent.postMessage({ tipo: "museo-completo", museo: "florero" }, "*"); } catch (e) {} });
  m.body.querySelector('[data-act="report"]').addEventListener("click", () => { m.close(); app.actions.openReport(); });
  m.body.querySelector('[data-act="print"]').addEventListener("click", () => printElement(m.body.querySelector("#diploma-sheet"), "diploma"));
  return m;
}
