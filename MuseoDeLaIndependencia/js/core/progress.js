// Cálculo de progreso del recorrido, umbrales 35/70/100 y desbloqueo de salas.

export const THRESHOLDS = [35, 70, 100];

export const CHECKPOINTS = {
  35: { id: 35, name: "Cabildo del 20 de julio", short: "Cabildo del 35 %",
        intro: "La noticia del florero corre por la plaza. El cabildo se reúne en sesión abierta y quiere saber si tu crónica es fiel a lo que has visto." },
  70: { id: 70, name: "Juramento del Acta", short: "Cabildo del 70 %",
        intro: "Los vocales se preparan para jurar el Acta. Antes de firmar como testigo, demuestra lo que has documentado en las salas." },
  100: { id: 100, name: "Examen del cronista", short: "Cabildo del 100 %",
         intro: "Tu bitácora está completa. El cabildo en pleno te examina para entregarte el diploma de Cronista de 1810." },
};

export function createProgress(works, salas) {
  const total = works.length || 50;

  const doneCount = (state) => works.reduce((n, w) => n + (state.works[w.id]?.done ? 1 : 0), 0);

  const percent = (state) => Math.min(100, (doneCount(state) / total) * 100);

  const isDone = (state, id) => !!state.works[id]?.done;

  const starsOf = (state, id) => state.works[id]?.stars || 0;

  const totalStars = (state) => Object.values(state.works).reduce((n, w) => n + (w.done ? (w.stars || 0) : 0), 0);

  const worksBySala = (salaId) => works.filter((w) => w.sala === salaId);

  const salaStats = (state, salaId) => {
    const list = worksBySala(salaId);
    const done = list.filter((w) => isDone(state, w.id)).length;
    return { total: list.length, done };
  };

  const checkpointPassed = (state, t) => !!state.checkpoints[String(t)]?.passed;

  const isSalaUnlocked = (state, salaId) => {
    const sala = salas.find((s) => s.id === salaId);
    if (!sala) return false;
    const need = sala.unlockAt || 0;
    if (need <= 0) return true;
    return checkpointPassed(state, need);
  };

  /** Umbral más bajo alcanzado y no aprobado (o null). */
  const pendingCheckpoint = (state) => {
    const p = percent(state);
    for (const t of THRESHOLDS) {
      if (p + 1e-9 >= t && !checkpointPassed(state, t)) return t;
    }
    return null;
  };

  /** Siguiente meta: { threshold, worksNeeded }. */
  const nextGoal = (state) => {
    const d = doneCount(state);
    for (const t of THRESHOLDS) {
      const need = Math.ceil((t / 100) * total - 1e-9);
      if (d < need) return { threshold: t, worksNeeded: need - d };
      if (!checkpointPassed(state, t)) return { threshold: t, worksNeeded: 0 };
    }
    return null;
  };

  const salasUnlockedBy = (t) => salas.filter((s) => s.unlockAt === t);

  return {
    total, doneCount, percent, isDone, starsOf, totalStars, worksBySala, salaStats,
    checkpointPassed, isSalaUnlocked, pendingCheckpoint, nextGoal, salasUnlockedBy,
  };
}
