// Música por sala (con fundido entre pistas) y efectos generados con Web Audio.

const MUSIC_VOLUME = 0.4;

export function createAudio({ getSettings }) {
  const tracks = new Map();
  let current = null;      // { src, el }
  let wanted = null;       // src deseado
  let playlist = [];       // canciones de la sala actual (se turnan)
  let idx = 0;
  let unlocked = false;
  let actx = null;
  let master = null;

  function ensureCtx() {
    if (actx) return actx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0.6;
      master.connect(actx.destination);
    } catch (e) { actx = null; }
    return actx;
  }

  function getTrack(src) {
    if (tracks.has(src)) return tracks.get(src);
    const el = new Audio();
    el.src = src;
    el.loop = true;
    el.preload = "none";
    el.volume = 0;
    el.addEventListener("error", () => { el.dataset.failed = "1"; });
    // Al terminar una canción de la sala, pasa a la siguiente de su lista.
    el.addEventListener("ended", () => {
      if (current?.el !== el || playlist.length < 2) return;
      idx = (idx + 1) % playlist.length;
      wanted = playlist[idx];
      el.currentTime = 0;
      apply();
    });
    tracks.set(src, el);
    return el;
  }

  function fadeTo(el, target, ms, then) {
    const start = el.volume, t0 = performance.now();
    if (el._fadeRaf) cancelAnimationFrame(el._fadeRaf);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      try { el.volume = Math.max(0, Math.min(1, start + (target - start) * k)); } catch (e) { /* iOS */ }
      if (k < 1) el._fadeRaf = requestAnimationFrame(step);
      else { el._fadeRaf = null; then?.(); }
    };
    el._fadeRaf = requestAnimationFrame(step);
  }

  function apply() {
    const on = getSettings().music && unlocked;
    const src = on ? wanted : null;
    if (current && current.src !== src) {
      const old = current.el;
      fadeTo(old, 0, 1100, () => old.pause());
      current = null;
    }
    if (src && !current) {
      const el = getTrack(src);
      el.loop = playlist.length < 2;
      current = { src, el };
      if (el.dataset.failed) return;
      const p = el.play();
      if (p?.catch) p.catch(() => {});
      fadeTo(el, MUSIC_VOLUME, 1400);
    }
  }

  // ---- efectos ----
  function tone({ f = 440, f2 = null, type = "sine", dur = 0.2, vol = 0.2, delay = 0, attack = 0.005 }) {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise({ dur = 0.1, vol = 0.1, freq = 800, q = 1, type = "lowpass", delay = 0 }) {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(); s.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = freq; fl.Q.value = q;
    const g = c.createGain(); g.gain.value = vol;
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t);
  }

  const SFX = {
    step: () => noise({ dur: 0.06, vol: 0.05, freq: 520 }),
    click: () => tone({ f: 660, dur: 0.06, vol: 0.06, type: "triangle" }),
    open: () => { noise({ dur: 0.25, vol: 0.06, freq: 1800, type: "bandpass", q: 0.8 }); tone({ f: 520, f2: 780, dur: 0.18, vol: 0.05, type: "triangle" }); },
    ding: () => { tone({ f: 880, dur: 0.6, vol: 0.16 }); tone({ f: 1320, dur: 0.8, vol: 0.1, delay: 0.09 }); tone({ f: 1760, dur: 0.9, vol: 0.05, delay: 0.18 }); },
    coin: () => { tone({ f: 1200, f2: 1800, dur: 0.09, vol: 0.07, type: "square" }); tone({ f: 1800, dur: 0.18, vol: 0.06, type: "square", delay: 0.08 }); },
    star: () => tone({ f: 1046, f2: 1568, dur: 0.25, vol: 0.1, type: "triangle" }),
    seal: () => { tone({ f: 140, f2: 60, dur: 0.35, vol: 0.4 }); noise({ dur: 0.12, vol: 0.25, freq: 400 }); },
    right: () => { tone({ f: 660, dur: 0.14, vol: 0.12, type: "triangle" }); tone({ f: 990, dur: 0.3, vol: 0.12, type: "triangle", delay: 0.1 }); },
    wrong: () => { tone({ f: 260, f2: 180, dur: 0.32, vol: 0.12, type: "sawtooth" }); },
    unlock: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ f, dur: 0.5, vol: 0.1, type: "triangle", delay: i * 0.11 })); },
    page: () => noise({ dur: 0.3, vol: 0.07, freq: 2400, type: "bandpass", q: 0.6 }),
  };

  return {
    unlock() {
      if (unlocked) return;
      unlocked = true;
      const c = ensureCtx();
      if (c && c.state === "suspended") c.resume().catch(() => {});
      apply();
    },
    // Acepta una ruta o una lista de rutas (la sala va turnando sus canciones).
    playMusic(src) {
      const list = (Array.isArray(src) ? src : [src]).filter(Boolean);
      const same = list.length === playlist.length && list.every((x, i) => x === playlist[i]);
      if (!same) { playlist = list; idx = 0; }
      wanted = playlist[idx] || null;
      apply();
    },
    refresh() { apply(); },
    sfx(name) {
      if (!getSettings().sfx || !unlocked) return;
      const c = ensureCtx(); if (!c) return;
      if (c.state === "suspended") c.resume().catch(() => {});
      try { SFX[name]?.(); } catch (e) { /* silencio */ }
    },
    /** Baja la música mientras se juega un minijuego. */
    duck(on) { if (current?.el && getSettings().music) fadeTo(current.el, on ? MUSIC_VOLUME * 0.35 : MUSIC_VOLUME, 600); },
  };
}
