// Estado de la partida y guardado en localStorage (clave cronista1810.v1).
// Todo acceso a localStorage va dentro de try/catch: el juego sigue aunque falle.

export const STORAGE_KEY = "cronista1810.v1";
const THRESHOLDS = ["35", "70", "100"];

export function defaultState() {
  const checkpoints = {};
  for (const t of THRESHOLDS) {
    checkpoints[t] = { passed: false, score: 0, total: 5, attempts: 0, at: null };
  }
  return {
    version: 1,
    player: { name: "Cronista" },
    startedAt: Date.now(),
    playMs: 0,
    works: {},
    coins: 0,
    badges: [],
    checkpoints,
    position: { sala: 1, x: null, y: null },
    settings: { music: true, sfx: true },
  };
}

function sanitize(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object" || raw.version !== 1) return base;
  const s = { ...base, ...raw };
  s.player = { ...base.player, ...(raw.player || {}) };
  s.works = raw.works && typeof raw.works === "object" ? raw.works : {};
  s.coins = Number.isFinite(raw.coins) ? raw.coins : 0;
  s.playMs = Number.isFinite(raw.playMs) ? raw.playMs : 0;
  s.badges = Array.isArray(raw.badges) ? raw.badges.slice() : [];
  s.checkpoints = { ...base.checkpoints };
  for (const t of THRESHOLDS) {
    s.checkpoints[t] = { ...base.checkpoints[t], ...((raw.checkpoints || {})[t] || {}) };
  }
  s.position = { ...base.position, ...(raw.position || {}) };
  s.settings = { ...base.settings, ...(raw.settings || {}) };
  return s;
}

const listeners = new Set();
let memoryOnly = false;

export const store = {
  state: defaultState(),
  hadSave: false,

  load() {
    let raw = null;
    try {
      const txt = localStorage.getItem(STORAGE_KEY);
      raw = txt ? JSON.parse(txt) : null;
    } catch (err) {
      memoryOnly = true;
      raw = null;
    }
    this.state = sanitize(raw);
    this.hadSave = !!raw && (Object.keys(this.state.works).length > 0 || this.state.playMs > 5000);
    return this.state;
  },

  save() {
    if (memoryOnly) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch (err) {
      return false;
    }
  },

  /** Aplica un cambio, guarda y avisa a los suscriptores. */
  update(mutator, reason = "update") {
    mutator(this.state);
    this.save();
    this.emit(reason);
  },

  reset(keepSettings = true) {
    const settings = this.state.settings;
    this.state = defaultState();
    if (keepSettings) this.state.settings = { ...settings };
    this.hadSave = false;
    this.save();
    this.emit("reset");
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  emit(reason) {
    for (const fn of listeners) {
      try { fn(this.state, reason); } catch (err) { console.error(err); }
    }
  },
};
