// "Cabildo abierto": cuestionario en los umbrales 35/70/100.
// 5 preguntas tomadas SOLO de las obras ya completadas; se aprueba con 3/5.
import { CHECKPOINTS } from "./progress.js";
import { openModal } from "../ui/modal.js";
import { ICONS, escapeHTML, badgeEmblem } from "../ui/icons.js";

export const QUESTIONS_PER_CABILDO = 5;
export const PASS_SCORE = 3;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Preguntas de respaldo (solo si las obras completadas no traen ninguna). */
function fallbackQuestions(doneWorks, allWorks) {
  const out = [];
  for (const w of doneWorks) {
    if (!w.author) continue;
    const others = [...new Set(allWorks.map((x) => x.author).filter((a) => a && a !== w.author))];
    if (others.length < 3) continue;
    const opts = shuffle([w.author, ...shuffle(others).slice(0, 3)]);
    out.push({ q: `¿Quién es el autor de «${w.title}»?`, options: opts, answer: opts.indexOf(w.author), explain: `«${w.title}» es obra de ${w.author}.`, work: w });
  }
  return out;
}

/**
 * Arma el cuestionario: preguntas distintas de las obras completadas, evitando
 * repetir las del intento anterior cuando hay suficientes; si faltan, repite al azar.
 */
export function buildQuestionSet(works, state, previousKeys = []) {
  const done = works.filter((w) => state.works[w.id]?.done);
  let pool = [];
  for (const w of done) (w.questions || []).forEach((q, i) => {
    if (q && Array.isArray(q.options) && q.options.length >= 2) pool.push({ ...q, work: w, key: `${w.id}:${i}` });
  });
  if (!pool.length) pool = fallbackQuestions(done, works).map((q, i) => ({ ...q, key: `fb:${q.work.id}:${i}` }));
  if (!pool.length) return [];
  const prev = new Set(previousKeys);
  const fresh = shuffle(pool.filter((q) => !prev.has(q.key)));
  const used = shuffle(pool.filter((q) => prev.has(q.key)));
  let picked = fresh.concat(used).slice(0, QUESTIONS_PER_CABILDO);
  while (picked.length < QUESTIONS_PER_CABILDO) picked.push(pool[Math.floor(Math.random() * pool.length)]);
  picked = shuffle(picked);
  // barajar opciones conservando la respuesta correcta
  return picked.map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
  });
}

let lastKeys = {};

/** Abre el Cabildo del umbral dado. */
export function openCabildo(app, threshold) {
  const info = CHECKPOINTS[threshold];
  if (!info) return null;
  const m = openModal({ className: "cabildo-modal", label: info.name, onClose: () => app.actions.afterCabildo?.() });
  let questions = [];
  let idx = 0, score = 0;
  app.audio.sfx("page");

  const unlocks = app.progress.salasUnlockedBy(threshold);
  const unlockText = threshold === 100
    ? "Al aprobar recibirás tu <strong>Diploma de Cronista de 1810</strong>."
    : unlocks.length
      ? `Al aprobar se abrirán: <strong>${unlocks.map((s) => escapeHTML(s.name)).join("</strong> y <strong>")}</strong>.`
      : "";

  function intro() {
    const rec = app.store.state.checkpoints[String(threshold)];
    m.body.innerHTML = `
      <div class="parchment">
        <div class="parchment-head">
          <span class="eyebrow">— Cabildo abierto · ${threshold} %</span>
          <h2 class="modal-title">${escapeHTML(info.name)}</h2>
        </div>
        <p class="parchment-text">${escapeHTML(info.intro)}</p>
        <ul class="parchment-rules">
          <li>${QUESTIONS_PER_CABILDO} preguntas sobre las obras que ya documentaste.</li>
          <li>Apruebas con ${PASS_SCORE} respuestas correctas.</li>
          <li>Si no lo logras, puedes volver a intentarlo con otras preguntas, sin perder tu avance.</li>
        </ul>
        ${unlockText ? `<p class="parchment-unlock">${unlockText}</p>` : ""}
        ${rec?.attempts ? `<p class="parchment-prev">Intentos anteriores: ${rec.attempts} · última nota ${rec.score}/${rec.total}</p>` : ""}
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" data-act="later">Más tarde</button>
          <button type="button" class="btn btn-primary" data-act="begin">${ICONS.scroll}<span>Presentarme ante el Cabildo</span></button>
        </div>
      </div>`;
    m.body.querySelector('[data-act="later"]').addEventListener("click", () => m.close("later"));
    m.body.querySelector('[data-act="begin"]').addEventListener("click", begin);
    m.focusFirst();
  }

  function begin() {
    questions = buildQuestionSet(app.works, app.store.state, lastKeys[threshold] || []);
    lastKeys[threshold] = questions.map((q) => q.key);
    idx = 0; score = 0;
    if (!questions.length) {
      // Sin preguntas disponibles en los datos: se aprueba para no bloquear el recorrido.
      finish(true);
      return;
    }
    ask();
  }

  function dots() {
    return `<ol class="q-dots" aria-hidden="true">${questions.map((_, i) => `<li class="${i < idx ? (questions[i]._ok ? "ok" : "bad") : i === idx ? "now" : ""}"></li>`).join("")}</ol>`;
  }

  function ask() {
    const q = questions[idx];
    m.body.innerHTML = `
      <div class="parchment">
        <div class="q-top">
          <span class="eyebrow">Pregunta ${idx + 1} de ${questions.length}</span>
          ${dots()}
        </div>
        <p class="q-work">Sobre la obra Nº ${q.work.id}: <em>${escapeHTML(q.work.title)}</em></p>
        <h3 class="q-text">${escapeHTML(q.q)}</h3>
        <div class="q-options" role="group" aria-label="Opciones">
          ${q.options.map((o, i) => `<button type="button" class="q-opt" data-i="${i}"><span class="q-letter">${"ABCD"[i] || i + 1}</span><span>${escapeHTML(o)}</span></button>`).join("")}
        </div>
        <div class="q-feedback" aria-live="polite"></div>
      </div>`;
    m.body.querySelectorAll(".q-opt").forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.i))));
    m.focusFirst();
  }

  function answer(i) {
    const q = questions[idx];
    const ok = i === q.answer;
    q._ok = ok;
    if (ok) score++;
    app.audio.sfx(ok ? "right" : "wrong");
    m.body.querySelectorAll(".q-opt").forEach((b) => {
      const k = Number(b.dataset.i);
      b.disabled = true;
      if (k === q.answer) b.classList.add("is-right");
      else if (k === i) b.classList.add("is-wrong");
    });
    const fb = m.body.querySelector(".q-feedback");
    const last = idx === questions.length - 1;
    fb.innerHTML = `
      <div class="q-explain ${ok ? "ok" : "bad"}">
        <strong>${ok ? "¡Correcto!" : "No es esa."}</strong>
        ${q.explain ? `<span>${escapeHTML(q.explain)}</span>` : ok ? "" : `<span>La respuesta correcta es: ${escapeHTML(q.options[q.answer])}.</span>`}
      </div>
      <div class="btn-row"><button type="button" class="btn btn-primary" data-act="next">${last ? "Ver el veredicto" : "Siguiente pregunta"}</button></div>`;
    const next = fb.querySelector('[data-act="next"]');
    next.addEventListener("click", () => { idx++; if (idx < questions.length) ask(); else finish(score >= PASS_SCORE); });
    next.focus({ preventScroll: true });
  }

  function finish(passed) {
    const total = questions.length || QUESTIONS_PER_CABILDO;
    const s = questions.length ? score : total;
    const res = app.actions.recordCabildo(threshold, { passed, score: s, total });
    const unlockNames = unlocks.map((x) => escapeHTML(x.name));
    m.body.innerHTML = `
      <div class="parchment verdict ${passed ? "is-pass" : "is-fail"}">
        <span class="eyebrow">— Veredicto del ${escapeHTML(info.name)}</span>
        <div class="verdict-score"><strong>${s}</strong><span>/ ${total}</span></div>
        ${passed ? `<div class="stamp" aria-hidden="true"><span>Aprobado</span></div>` : ""}
        <h2 class="modal-title">${passed ? "El Cabildo <em>aprueba</em> tu crónica." : "Te faltó <em>poco.</em>"}</h2>
        ${passed ? `
          ${res.coins ? `<p class="reward-coins">${ICONS.coin}<strong>+${res.coins}</strong> monedas</p>` : ""}
          ${threshold < 100 && unlockNames.length ? `<p class="verdict-unlock">${ICONS.lock}<span>Se abrieron las puertas de <strong>${unlockNames.join("</strong> y <strong>")}</strong>. Búscalas desde el patio.</span></p>` : ""}
          ${res.newBadges.length ? `<div class="reward-badges">${res.newBadges.map((b) => `<div class="badge-card is-new">${badgeEmblem(b.icon)}<div><span class="eyebrow">Nueva insignia</span><strong>${escapeHTML(b.name)}</strong></div></div>`).join("")}</div>` : ""}
        ` : `<p class="parchment-text">Necesitas ${PASS_SCORE} respuestas correctas. Repasa las fichas de las obras y vuelve a intentarlo: te haremos otras preguntas.</p>`}
        <div class="btn-row">
          ${passed
            ? threshold === 100
              ? `<button type="button" class="btn btn-primary" data-act="diploma">Recibir el diploma</button>`
              : `<button type="button" class="btn btn-primary" data-act="close">Volver al museo</button>`
            : `<button type="button" class="btn btn-ghost" data-act="close">Volver al museo</button>
               <button type="button" class="btn btn-primary" data-act="retry">Intentar de nuevo</button>`}
        </div>
      </div>`;
    app.audio.sfx(passed ? "seal" : "page");
    if (passed && threshold < 100) setTimeout(() => app.audio.sfx("unlock"), 600);
    if (passed && res.coins) setTimeout(() => app.actions.flyCoins(m.body.querySelector(".reward-coins"), 6), 700);
    m.body.querySelector('[data-act="close"]')?.addEventListener("click", () => m.close("done"));
    m.body.querySelector('[data-act="retry"]')?.addEventListener("click", begin);
    m.body.querySelector('[data-act="diploma"]')?.addEventListener("click", () => { m.close("diploma"); app.actions.openDiploma(); });
    m.focusFirst();
  }

  intro();
  return m;
}
