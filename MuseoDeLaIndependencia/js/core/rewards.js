// Monedas e insignias.
// Monedas: 10 por obra + 5 por estrella (al mejorar estrellas se pagan solo las nuevas). Cabildo: +50.

export const COINS_PER_WORK = 10;
export const COINS_PER_STAR = 5;
export const COINS_PER_CHECKPOINT = 50;

export function buildBadges(salas) {
  const list = [
    { id: "primera-obra", name: "Primer apunte", desc: "Documentaste tu primera obra.", icon: "pluma" },
    { id: "diez-obras", name: "Pluma constante", desc: "Documentaste 10 obras.", icon: "libro" },
    { id: "tres-estrellas-5", name: "Ojo experto", desc: "Lograste 3 estrellas en 5 obras.", icon: "estrella" },
  ];
  for (const s of salas) {
    list.push({ id: `sala-${s.id}`, name: `Sala completa: ${s.name}`, desc: `Documentaste todas las obras de ${s.name}.`, icon: "llave" });
  }
  list.push(
    { id: "cabildo-35", name: "Vocero del Cabildo", desc: "Aprobaste el Cabildo del 20 de julio.", icon: "sello" },
    { id: "cabildo-70", name: "Testigo del Acta", desc: "Aprobaste el Juramento del Acta.", icon: "sello" },
    { id: "cabildo-100", name: "Cronista examinado", desc: "Aprobaste el Examen del cronista.", icon: "sello" },
    { id: "recorrido-completo", name: "Cronista de 1810", desc: "Documentaste las 50 obras del museo.", icon: "corona" },
  );
  return list;
}

/**
 * Aplica el resultado de un minijuego sobre el estado (lo muta).
 * Devuelve un resumen para la animación de recompensa.
 */
export function applyWorkResult(state, work, result, progress, badges) {
  const stars = Math.max(1, Math.min(3, Math.round(result?.stars || 1)));
  const score = Math.max(0, Math.min(100, Math.round(result?.score ?? stars * 33)));
  const timeMs = Math.max(0, Math.round(result?.timeMs || 0));
  const prev = state.works[work.id];
  const firstTime = !prev?.done;
  const starsBefore = prev?.done ? prev.stars || 0 : 0;

  let coins = 0;
  if (firstTime) coins += COINS_PER_WORK + COINS_PER_STAR * stars;
  else if (stars > starsBefore) coins += COINS_PER_STAR * (stars - starsBefore);

  const pctBefore = progress.percent(state);
  state.works[work.id] = {
    done: true,
    stars: Math.max(stars, starsBefore),
    score: Math.max(score, prev?.score || 0),
    attempts: (prev?.attempts || 0) + 1,
    timeMs: prev?.timeMs ? Math.min(prev.timeMs, timeMs || prev.timeMs) : timeMs,
  };
  state.coins += coins;
  const newBadges = evaluateBadges(state, progress, badges);
  return {
    firstTime, stars, starsBefore, starsAfter: state.works[work.id].stars,
    improved: !firstTime && stars > starsBefore, coins, newBadges,
    pctBefore, pctAfter: progress.percent(state),
  };
}

export function applyCheckpointPass(state, threshold, progress, badges) {
  const key = `cabildo-${threshold}`;
  let coins = 0;
  const newBadges = [];
  if (!state.badges.includes(key)) {
    coins = COINS_PER_CHECKPOINT;
    state.coins += coins;
    state.badges.push(key);
    const b = badges.find((x) => x.id === key);
    if (b) newBadges.push(b);
  }
  newBadges.push(...evaluateBadges(state, progress, badges));
  return { coins, newBadges };
}

export function evaluateBadges(state, progress, badges) {
  const earned = [];
  const give = (id) => {
    if (state.badges.includes(id)) return;
    const b = badges.find((x) => x.id === id);
    if (!b) return;
    state.badges.push(id);
    earned.push(b);
  };
  const done = progress.doneCount(state);
  if (done >= 1) give("primera-obra");
  if (done >= 10) give("diez-obras");
  const three = Object.values(state.works).filter((w) => w.done && w.stars >= 3).length;
  if (three >= 5) give("tres-estrellas-5");
  for (const b of badges) {
    if (b.id.startsWith("sala-")) {
      const id = Number(b.id.slice(5));
      const st = progress.salaStats(state, id);
      if (st.total > 0 && st.done >= st.total) give(b.id);
    }
  }
  if (done >= progress.total) give("recorrido-completo");
  return earned;
}
