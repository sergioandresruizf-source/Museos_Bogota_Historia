// Bucle del juego, cámara y render del mundo en <canvas> (HiDPI).
import { TILE } from "./rooms.js";
import { createPlayer, updatePlayer, drawPlayer, roundRect, isBlockedAt } from "./player.js";

const INTERACT_DIST = 40;

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

export function createEngine({ canvas, rooms, salas, progress, getState, input, hooks = {}, isTouch = () => false }) {
  const ctx = canvas.getContext("2d");
  let dpr = 1, vw = 0, vh = 0, zoom = 1;
  let room = null;
  let player = createPlayer(0, 0);
  const cam = { x: 0, y: 0 };
  let paused = true;
  let controllable = false;
  let target = null;
  let fade = { a: 0, dir: 0, cb: null };
  let floorCache = null;
  let last = performance.now();
  let time = 0;
  let pads = { top: 70, bottom: 20 };
  const thumbs = new Map(); // id -> canvas | "loading" | "error"

  // ---------- imágenes ----------
  function loadThumb(work) {
    if (!work?.image || thumbs.has(work.id)) return;
    thumbs.set(work.id, "loading");
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const max = 200;
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * s));
      c.height = Math.max(1, Math.round(img.naturalHeight * s));
      const g = c.getContext("2d");
      g.imageSmoothingQuality = "high";
      g.drawImage(img, 0, 0, c.width, c.height);
      thumbs.set(work.id, c);
    };
    img.onerror = () => thumbs.set(work.id, "error");
    img.src = work.image;
  }

  // ---------- tamaño ----------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    const a = Math.min(vw / (20 * TILE), vh / (13 * TILE));
    const b = Math.min(vw / (11 * TILE), vh / (18 * TILE));
    zoom = clamp(Math.max(a, b), 1, 2.1);
    const mobile = vw < 700;
    pads = { top: mobile ? 112 : 78, bottom: mobile ? 24 : 16 };
    floorCache = null;
    snapCamera();
  }

  // ---------- puertas ----------
  const doorAtTile = (tx, ty) => room?.doors.find((d) => d.tiles.some((t) => t.x === tx && t.y === ty));
  const isDoorUnlocked = (door) => progress.isSalaUnlocked(getState(), door.to);
  const isDoorOpenTile = (tx, ty) => { const d = doorAtTile(tx, ty); return d ? isDoorUnlocked(d) : false; };

  // ---------- salas ----------
  function enterRoom(sala, pos, { announce = true } = {}) {
    room = rooms[sala] || rooms[1];
    floorCache = null;
    const spawn = pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) ? pos : room.defaultSpawn;
    player = createPlayer(spawn.x, spawn.y);
    player.dir = "down";
    if (isBlockedAt(room, player.x, player.y, isDoorOpenTile)) {
      player.x = room.defaultSpawn.x; player.y = room.defaultSpawn.y;
    }
    for (const p of room.paintings) loadThumb(p.work);
    snapCamera();
    target = null;
    hooks.onEnterRoom?.(room.sala, { announce });
  }

  function useDoor(door) {
    if (fade.dir) return;
    const from = room.sala;
    startFade(() => {
      const next = rooms[door.to];
      enterRoom(door.to, next.spawnFrom[from] || next.defaultSpawn);
      hooks.onPositionChange?.(position());
    });
  }

  function startFade(cb) { fade.dir = 1; fade.cb = cb; }

  // ---------- cámara ----------
  function camTarget() {
    const viewW = vw / zoom, viewH = vh / zoom;
    const top = pads.top / zoom, bottom = pads.bottom / zoom;
    let x, y;
    if (room.pxW <= viewW) x = (room.pxW - viewW) / 2;
    else x = clamp(player.x - viewW / 2, -12, room.pxW - viewW + 12);
    const availH = viewH - top - bottom;
    if (room.pxH <= availH) y = (room.pxH - availH) / 2 - top;
    else y = clamp(player.y - 16 - viewH / 2, -top, room.pxH - viewH + bottom);
    return { x, y };
  }
  function snapCamera() { if (!room) return; const t = camTarget(); cam.x = t.x; cam.y = t.y; }

  // ---------- interacción ----------
  function findTarget() {
    let best = null, bestD = INTERACT_DIST;
    for (const p of room.paintings) {
      const d = Math.hypot(player.x - p.stand.x, player.y - p.stand.y);
      if (d < bestD) { best = { kind: "work", painting: p, work: p.work }; bestD = d; }
    }
    if (best) return best; // los cuadros tienen prioridad sobre las puertas
    for (const d of room.doors) {
      if (isDoorUnlocked(d)) continue;
      const cx = d.rect.x + d.rect.w / 2, cy = d.rect.y + d.rect.h / 2;
      const dd = Math.hypot(player.x - clamp(player.x, d.rect.x, d.rect.x + d.rect.w), player.y - clamp(player.y, d.rect.y, d.rect.y + d.rect.h + 8));
      if (dd < 30 && dd < bestD + 10) { best = { kind: "door", door: d, cx, cy }; bestD = dd; }
    }
    return best;
  }

  function action() {
    if (paused || !controllable || fade.dir) return;
    if (!target) return;
    if (target.kind === "work") hooks.onExamine?.(target.work);
    else if (target.kind === "door") hooks.onLockedDoor?.(target.door);
  }
  input.on("action", action);

  canvas.addEventListener("pointerdown", (e) => {
    if (paused || !controllable || !target || target.kind !== "work") return;
    const r = canvas.getBoundingClientRect();
    const wx = (e.clientX - r.left) / zoom + cam.x, wy = (e.clientY - r.top) / zoom + cam.y;
    const p = target.painting;
    if (wx > p.fx - 10 && wx < p.fx + p.fw + 10 && wy > p.fy - 10 && wy < p.fy + p.fh + 24) action();
  });

  // ---------- bucle ----------
  function update(dt) {
    time += dt;
    if (fade.dir) {
      fade.a += fade.dir * dt * 4.2;
      if (fade.dir > 0 && fade.a >= 1) { fade.a = 1; const cb = fade.cb; fade.cb = null; fade.dir = -1; cb?.(); }
      else if (fade.dir < 0 && fade.a <= 0) { fade.a = 0; fade.dir = 0; }
    }
    if (!room) return;
    if (!paused && controllable && fade.dir <= 0 && fade.a < 0.5) {
      const stepped = updatePlayer(player, input.axis(), dt, room, isDoorOpenTile);
      if (stepped) hooks.onStep?.();
      const tx = Math.floor(player.x / TILE), ty = Math.floor(player.y / TILE);
      const d = doorAtTile(tx, ty);
      if (d && isDoorUnlocked(d) && fade.dir === 0) useDoor(d);
    } else {
      player.moving = false;
    }
    const nt = controllable && !paused ? findTarget() : null;
    const changed = (nt?.work?.id ?? nt?.door?.to ?? null) !== (target?.work?.id ?? target?.door?.to ?? null);
    target = nt;
    if (changed) hooks.onTargetChange?.(target);

    const ct = camTarget();
    const k = 1 - Math.pow(0.0008, dt);
    cam.x += (ct.x - cam.x) * k;
    cam.y += (ct.y - cam.y) * k;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  // ============================================================
  // RENDER
  // ============================================================
  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#2b211a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!room) return;
    const s = zoom * dpr;
    const ox = Math.round(-cam.x * s), oy = Math.round(-cam.y * s);
    ctx.setTransform(s, 0, 0, s, ox, oy);

    // fondo exterior: tejado de barro que rodea la sala
    drawOutside();
    if (!floorCache) floorCache = buildStaticLayer();
    ctx.drawImage(floorCache.canvas, 0, 0, room.pxW, room.pxH);

    drawDoors();
    for (const fd of room.faceDeco) drawFaceDeco(fd);
    for (const p of room.paintings) if (p.kind === "wall") drawPainting(p);

    // objetos y jugador ordenados por profundidad
    const list = room.objects.map((o) => ({ y: o.y + o.h, o }));
    list.push({ y: player.y, player: true });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.player) drawPlayer(ctx, player, time);
      else drawObject(it.o);
    }

    drawLights();
    if (target?.kind === "work") drawHalo(target.painting);

    // capa de pantalla (textos nítidos)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawVignette();
    drawScreenLabels();
    if (fade.a > 0) {
      ctx.fillStyle = `rgba(30,22,16,${fade.a})`;
      ctx.fillRect(0, 0, vw, vh);
    }
  }

  function drawOutside() {
    const m = 3 * TILE;
    const g = ctx.createLinearGradient(0, -m, 0, room.pxH + m);
    g.addColorStop(0, "#3a2b20"); g.addColorStop(1, "#2b211a");
    ctx.fillStyle = g;
    ctx.fillRect(-m * 4, -m * 4, room.pxW + m * 8, room.pxH + m * 8);
    // tejas alrededor del muro (alero)
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(-8, -8, room.pxW + 16, room.pxH + 16);
  }

  // ---------- capa estática (piso, muros) ----------
  function buildStaticLayer() {
    const res = Math.min(zoom * dpr, 2.5);
    const c = document.createElement("canvas");
    c.width = Math.ceil(room.pxW * res); c.height = Math.ceil(room.pxH * res);
    const g = c.getContext("2d");
    g.scale(res, res);
    for (let ty = 0; ty < room.h; ty++) {
      for (let tx = 0; tx < room.w; tx++) {
        const t = room.grid[ty][tx];
        if (t === "." || t === "D" && room.doors.some((d) => d.side !== "top" && d.tiles.some((q) => q.x === tx && q.y === ty))) drawFloorTile(g, tx, ty, room.floor);
        else if (t === "c") drawCobble(g, tx, ty);
        else if (t === "D") drawFloorTile(g, tx, ty, room.floor);
      }
    }
    for (const dc of room.decals) drawDecal(g, dc);
    // sombras proyectadas por los muros sobre el piso
    for (let ty = 0; ty < room.h; ty++) {
      for (let tx = 0; tx < room.w; tx++) {
        const t = room.grid[ty][tx];
        if (t !== "." && t !== "c") continue;
        const up = room.grid[ty - 1]?.[tx], left = room.grid[ty]?.[tx - 1], right = room.grid[ty]?.[tx + 1];
        if (up === "F" || up === "#") {
          const gr = g.createLinearGradient(0, ty * TILE, 0, ty * TILE + 16);
          gr.addColorStop(0, "rgba(60,35,20,0.35)"); gr.addColorStop(1, "rgba(60,35,20,0)");
          g.fillStyle = gr; g.fillRect(tx * TILE, ty * TILE, TILE, 16);
        }
        if (left === "#") {
          const gr = g.createLinearGradient(tx * TILE, 0, tx * TILE + 10, 0);
          gr.addColorStop(0, "rgba(60,35,20,0.28)"); gr.addColorStop(1, "rgba(60,35,20,0)");
          g.fillStyle = gr; g.fillRect(tx * TILE, ty * TILE, 10, TILE);
        }
        if (right === "#") {
          const gr = g.createLinearGradient((tx + 1) * TILE, 0, (tx + 1) * TILE - 6, 0);
          gr.addColorStop(0, "rgba(60,35,20,0.18)"); gr.addColorStop(1, "rgba(60,35,20,0)");
          g.fillStyle = gr; g.fillRect((tx + 1) * TILE - 6, ty * TILE, 6, TILE);
        }
      }
    }
    for (let ty = 0; ty < room.h; ty++) {
      for (let tx = 0; tx < room.w; tx++) {
        const t = room.grid[ty][tx];
        if (t === "#") drawCap(g, tx, ty);
        else if (t === "F") drawFace(g, tx, ty);
      }
    }
    for (const d of room.doors) drawDoorFrame(g, d);
    // sombras de objetos sólidos
    for (const o of room.objects) {
      if (o.type === "fountain") continue;
      g.fillStyle = "rgba(50,30,18,0.22)";
      g.beginPath();
      g.ellipse(o.x + o.w / 2 + 2, o.y + o.h - 3, o.w / 2 - 1, Math.min(7, o.h / 3), 0, 0, Math.PI * 2);
      g.fill();
    }
    return { canvas: c, res };
  }

  const FLOOR_COL = {
    barro: ["#c47a52", "#b86d47", "#cd8660", "#bf7650"],
    ajedrez: ["#b8694a", "#eadcc0"],
    madera: ["#a8754a", "#9d6b42", "#b07d51", "#a06f45"],
    tablon: ["#7d5636", "#74502f", "#86603d", "#7a5333"],
    piedra: ["#b3a387", "#a89a7f", "#bcad91", "#ad9e83"],
  };

  function drawFloorTile(g, tx, ty, kind) {
    const x = tx * TILE, y = ty * TILE, r = hash(tx, ty);
    if (kind === "barro") {
      const cols = FLOOR_COL.barro;
      g.fillStyle = cols[(r * cols.length) | 0];
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle = "rgba(255,225,190,0.12)";
      g.fillRect(x + 1, y + 1, TILE - 2, 2);
      g.fillStyle = "rgba(90,40,20,0.12)";
      g.fillRect(x + 1, y + TILE - 3, TILE - 2, 2);
      if (r > 0.82) { g.fillStyle = "rgba(90,45,25,0.18)"; g.beginPath(); g.arc(x + 8 + r * 14, y + 10 + r * 9, 2.2, 0, 7); g.fill(); }
      g.strokeStyle = "#9b5a3b"; g.lineWidth = 1;
      g.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    } else if (kind === "ajedrez") {
      const half = TILE / 2;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const dark = (tx * 2 + i + ty * 2 + j) % 2 === 0;
        g.fillStyle = dark ? FLOOR_COL.ajedrez[0] : FLOOR_COL.ajedrez[1];
        g.fillRect(x + i * half, y + j * half, half, half);
        g.fillStyle = dark ? "rgba(0,0,0,0.06)" : "rgba(120,90,50,0.07)";
        g.fillRect(x + i * half, y + j * half + half - 2, half, 2);
      }
      g.strokeStyle = "rgba(110,70,45,0.35)"; g.lineWidth = 0.6;
      g.strokeRect(x + 0.3, y + 0.3, TILE - 0.6, TILE - 0.6);
    } else if (kind === "madera" || kind === "tablon") {
      const cols = FLOOR_COL[kind];
      const ph = kind === "madera" ? 8 : 10.67;
      for (let j = 0; j < TILE / ph; j++) {
        const rr = hash(tx, ty * 7 + j, 3);
        g.fillStyle = cols[(rr * cols.length) | 0];
        g.fillRect(x, y + j * ph, TILE, ph);
        g.fillStyle = "rgba(255,230,200,0.08)";
        g.fillRect(x, y + j * ph, TILE, 1);
        g.fillStyle = "rgba(40,20,10,0.35)";
        g.fillRect(x, y + j * ph + ph - 1, TILE, 1);
        if ((tx + j * 3 + ty) % 4 === 0) g.fillRect(x + ((rr * 20) | 0) + 6, y + j * ph, 1, ph);
        if (rr > 0.86) { g.fillStyle = "rgba(60,30,15,0.25)"; g.beginPath(); g.ellipse(x + 10 + rr * 10, y + j * ph + ph / 2, 2.4, 1.2, 0, 0, 7); g.fill(); }
      }
    } else {
      const cols = FLOOR_COL.piedra;
      g.fillStyle = cols[(r * cols.length) | 0];
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle = "rgba(255,250,235,0.1)";
      g.fillRect(x + 1, y + 1, TILE - 2, 3);
      g.fillStyle = "rgba(60,50,35,0.12)";
      if (r > 0.6) g.fillRect(x + 6 + r * 10, y + 12, 6, 1);
      g.strokeStyle = "#8c7d64"; g.lineWidth = 1.2;
      g.strokeRect(x + 0.6, y + 0.6, TILE - 1.2, TILE - 1.2);
    }
  }

  function drawCobble(g, tx, ty) {
    const x = tx * TILE, y = ty * TILE;
    g.fillStyle = "#a99a7c";
    g.fillRect(x, y, TILE, TILE);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const r = hash(tx * 3 + i, ty * 3 + j, 5);
      const cx = x + 5.5 + i * 10.5 + (r - 0.5) * 3, cy = y + 5.5 + j * 10.5 + (hash(i, j, tx + ty) - 0.5) * 3;
      g.fillStyle = r > 0.66 ? "#c9bc9f" : r > 0.33 ? "#bdae90" : "#b3a385";
      g.beginPath(); g.ellipse(cx, cy, 4.6, 4, r * 3, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,240,0.18)";
      g.beginPath(); g.ellipse(cx - 1, cy - 1.4, 2.2, 1.4, 0, 0, 7); g.fill();
    }
    if (hash(tx, ty, 9) > 0.8) {
      g.fillStyle = "rgba(110,140,70,0.55)";
      for (let k = 0; k < 4; k++) g.fillRect(x + hash(tx, k, 2) * 28, y + hash(ty, k, 4) * 28, 1.5, 3);
    }
  }

  function drawDecal(g, d) {
    if (d.type === "path") {
      g.fillStyle = "#cdbd9a";
      g.fillRect(d.x, d.y, d.w, d.h);
      const step = 16;
      for (let y = d.y; y < d.y + d.h; y += step) for (let x = d.x; x < d.x + d.w; x += step) {
        const r = hash(x, y, 11);
        g.fillStyle = r > 0.5 ? "#d6c7a6" : "#c4b390";
        g.fillRect(x + 1, y + 1, step - 2, step - 2);
      }
    } else if (d.type === "garden") {
      g.fillStyle = "#8a6a46";
      roundRect(g, d.x, d.y, d.w, d.h, 10); g.fill();
      g.fillStyle = "#6e8f4e";
      roundRect(g, d.x + 4, d.y + 4, d.w - 8, d.h - 8, 8); g.fill();
      for (let k = 0; k < 14; k++) {
        g.fillStyle = k % 3 ? "#7fa35a" : "#5d7f40";
        g.fillRect(d.x + 6 + hash(k, d.x) * (d.w - 12), d.y + 6 + hash(d.y, k) * (d.h - 12), 2, 4);
      }
      for (let k = 0; k < 5; k++) {
        g.fillStyle = ["#efa47f", "#f5ead5", "#e9c46a"][k % 3];
        g.beginPath(); g.arc(d.x + 8 + hash(k, 3, d.x) * (d.w - 16), d.y + 8 + hash(4, k, d.y) * (d.h - 16), 2, 0, 7); g.fill();
      }
    } else if (d.type === "rug") {
      g.fillStyle = "rgba(40,20,10,0.25)";
      g.fillRect(d.x + 2, d.y + 3, d.w, d.h);
      g.fillStyle = d.color;
      g.fillRect(d.x, d.y, d.w, d.h);
      g.strokeStyle = "#e9c46a"; g.lineWidth = 1.5;
      g.strokeRect(d.x + 4, d.y + 4, d.w - 8, d.h - 8);
      g.strokeStyle = "rgba(245,234,213,0.5)"; g.lineWidth = 1;
      g.setLineDash([3, 3]);
      g.strokeRect(d.x + 8, d.y + 8, d.w - 16, d.h - 16);
      g.setLineDash([]);
      g.fillStyle = "rgba(245,234,213,0.6)";
      for (let x = d.x + 2; x < d.x + d.w - 2; x += 4) { g.fillRect(x, d.y - 3, 1, 3); g.fillRect(x, d.y + d.h, 1, 3); }
    }
  }

  function drawCap(g, tx, ty) {
    // Remate del muro: tejas de barro vistas desde arriba
    const x = tx * TILE, y = ty * TILE;
    g.fillStyle = "#8f4a31";
    g.fillRect(x, y, TILE, TILE);
    const horiz = ty === 0 || ty === room.h - 1;
    g.save();
    g.beginPath(); g.rect(x, y, TILE, TILE); g.clip();
    if (horiz) {
      for (let i = -1; i < 4; i++) {
        const cx = x + i * 10 + (ty % 2) * 5;
        const gr = g.createLinearGradient(cx - 5, 0, cx + 5, 0);
        gr.addColorStop(0, "#9c5236"); gr.addColorStop(0.45, "#c06a46"); gr.addColorStop(1, "#7e3f29");
        g.fillStyle = gr;
        g.fillRect(cx - 5, y, 10, TILE);
        g.fillStyle = "rgba(50,20,10,0.25)";
        for (let j = 0; j < 4; j++) g.fillRect(cx - 5, y + j * 8 + ((i + tx) % 2) * 4, 10, 1.2);
      }
    } else {
      for (let j = -1; j < 4; j++) {
        const cy = y + j * 10 + (tx % 2) * 5;
        const gr = g.createLinearGradient(0, cy - 5, 0, cy + 5);
        gr.addColorStop(0, "#9c5236"); gr.addColorStop(0.45, "#c06a46"); gr.addColorStop(1, "#7e3f29");
        g.fillStyle = gr;
        g.fillRect(x, cy - 5, TILE, 10);
        g.fillStyle = "rgba(50,20,10,0.25)";
        for (let i = 0; i < 4; i++) g.fillRect(x + i * 8 + ((j + ty) % 2) * 4, cy - 5, 1.2, 10);
      }
    }
    g.restore();
    // borde interior encalado
    const inside = (ix, iy) => { const t = room.grid[iy]?.[ix]; return t === "." || t === "c" || t === "F" || t === "D"; };
    g.fillStyle = "#efe4cd";
    if (inside(tx + 1, ty)) g.fillRect(x + TILE - 3, y, 3, TILE);
    if (inside(tx - 1, ty)) g.fillRect(x, y, 3, TILE);
    if (inside(tx, ty + 1) && room.grid[ty + 1]?.[tx] !== "F") g.fillRect(x, y + TILE - 3, TILE, 3);
    if (inside(tx, ty - 1)) g.fillRect(x, y, TILE, 3);
  }

  function drawFace(g, tx, ty) {
    const x = tx * TILE, y = ty * TILE;
    const topRow = ty === 1;
    const gr = g.createLinearGradient(0, y, 0, y + TILE);
    gr.addColorStop(0, topRow ? "#f6efe0" : "#efe5d1");
    gr.addColorStop(1, topRow ? "#efe5d1" : "#e5d8bf");
    g.fillStyle = gr;
    g.fillRect(x, y, TILE, TILE);
    // textura de cal
    for (let k = 0; k < 3; k++) {
      const r = hash(tx, ty * 5 + k, 7);
      g.fillStyle = `rgba(160,130,90,${0.05 + r * 0.05})`;
      g.fillRect(x + r * 28, y + hash(k, tx, ty) * 28, 2 + r * 3, 1);
    }
    if (topRow) {
      // viga superior y canecillos
      g.fillStyle = "#5a3d28";
      g.fillRect(x, y, TILE, 5);
      g.fillStyle = "#6e4b31";
      g.fillRect(x, y, TILE, 2);
      if (tx % 2 === 0) { g.fillStyle = "#4a3120"; g.fillRect(x + 12, y + 5, 8, 4); }
    } else {
      // zócalo terracota
      g.fillStyle = "#b6533c";
      g.fillRect(x, y + TILE - 9, TILE, 9);
      g.fillStyle = "#8f3f2c";
      g.fillRect(x, y + TILE - 2, TILE, 2);
      g.fillStyle = "#d27a5c";
      g.fillRect(x, y + TILE - 10, TILE, 1.4);
    }
  }

  function drawDoorFrame(g, d) {
    const r = d.rect;
    g.fillStyle = "#5a3d28";
    if (d.side === "top") {
      // pasillo oscuro hacia la otra sala
      const gr = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      gr.addColorStop(0, "#1e1712"); gr.addColorStop(1, "#4a3628");
      g.fillStyle = gr;
      g.fillRect(r.x, r.y + TILE * 0.6, r.w, r.h - TILE * 0.6);
      g.fillStyle = "#5a3d28";
      g.fillRect(r.x - 4, r.y + TILE * 0.6, 5, r.h - TILE * 0.6);
      g.fillRect(r.x + r.w - 1, r.y + TILE * 0.6, 5, r.h - TILE * 0.6);
      g.fillRect(r.x - 6, r.y + TILE * 0.5, r.w + 12, 6);
      // umbral
      g.fillStyle = "#8c7d64";
      g.fillRect(r.x, r.y + r.h - 4, r.w, 4);
    } else if (d.side === "left" || d.side === "right") {
      g.fillRect(r.x, r.y - 5, TILE, 6);
      g.fillRect(r.x, r.y + r.h - 1, TILE, 6);
      g.fillStyle = "#8c7d64";
      g.fillRect(r.x + 4, r.y, TILE - 8, r.h);
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.fillRect(r.x + 4, r.y, TILE - 8, 2);
    } else {
      g.fillRect(r.x - 5, r.y, 6, TILE);
      g.fillRect(r.x + r.w - 1, r.y, 6, TILE);
      g.fillStyle = "#8c7d64";
      g.fillRect(r.x, r.y + 4, r.w, TILE - 8);
    }
  }

  // ---------- dinámicos ----------
  function drawDoors() {
    for (const d of room.doors) {
      const open = isDoorUnlocked(d);
      const r = d.rect;
      if (open) {
        // flecha suave que invita a pasar
        const a = 0.35 + Math.sin(time * 3) * 0.15;
        ctx.fillStyle = `rgba(245,234,213,${a})`;
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        ctx.save(); ctx.translate(cx, cy);
        const rot = { left: Math.PI, right: 0, top: -Math.PI / 2, bottom: Math.PI / 2 }[d.side];
        ctx.rotate(rot);
        const off = d.side === "top" ? 10 : 0;
        ctx.beginPath(); ctx.moveTo(6 + off, 0); ctx.lineTo(-3 + off, -6); ctx.lineTo(-3 + off, 6); ctx.closePath(); ctx.fill();
        ctx.restore();
        continue;
      }
      // Puerta cerrada de madera con candado
      ctx.save();
      let px, py, pw, ph;
      if (d.side === "top") { px = r.x; py = r.y + TILE * 0.6; pw = r.w; ph = r.h - TILE * 0.6; }
      else if (d.side === "left" || d.side === "right") { px = r.x + 8; py = r.y; pw = TILE - 16; ph = r.h; }
      else { px = r.x; py = r.y + 8; pw = r.w; ph = TILE - 16; }
      ctx.fillStyle = "#6b4529";
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      const vertical = d.side === "top" || d.side === "bottom";
      if (vertical) for (let i = 1; i < 6; i++) ctx.fillRect(px + (pw / 6) * i, py, 1, ph);
      else for (let i = 1; i < 6; i++) ctx.fillRect(px, py + (ph / 6) * i, pw, 1);
      ctx.fillStyle = "#3b2a1c";
      if (vertical) { ctx.fillRect(px, py + ph * 0.25, pw, 3); ctx.fillRect(px, py + ph * 0.7, pw, 3); ctx.fillRect(px + pw / 2 - 0.5, py, 1, ph); }
      else { ctx.fillRect(px + pw * 0.25, py, 3, ph); ctx.fillRect(px + pw * 0.7, py, 3, ph); }
      // candado
      const lx = px + pw / 2, ly = py + ph / 2;
      ctx.strokeStyle = "#c9a14a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lx, ly - 3, 4, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = "#d9b45a";
      roundRect(ctx, lx - 6, ly - 3, 12, 10, 2); ctx.fill();
      ctx.fillStyle = "#3b2a1c";
      ctx.beginPath(); ctx.arc(lx, ly + 1, 1.5, 0, 7); ctx.fill(); ctx.fillRect(lx - 0.6, ly + 1, 1.2, 3.5);
      ctx.restore();
    }
  }

  function drawFaceDeco(fd) {
    if (fd.type === "lantern") {
      const { x, y } = fd;
      ctx.fillStyle = "#3b2a1c";
      ctx.fillRect(x - 1, y - 8, 2, 6);
      ctx.fillRect(x - 5, y - 3, 10, 2);
      const fl = 0.75 + Math.sin(time * 9 + x) * 0.1 + Math.sin(time * 23 + x * 0.3) * 0.06;
      ctx.fillStyle = `rgba(255,${190 + fl * 30},110,${0.85 * fl})`;
      ctx.fillRect(x - 4, y - 1, 8, 9);
      ctx.strokeStyle = "#3b2a1c"; ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 4, y - 1, 8, 9);
      ctx.beginPath(); ctx.moveTo(x, y - 1); ctx.lineTo(x, y + 8); ctx.stroke();
      ctx.fillStyle = "#3b2a1c";
      ctx.beginPath(); ctx.moveTo(x - 5, y - 1); ctx.lineTo(x, y - 5); ctx.lineTo(x + 5, y - 1); ctx.fill();
      ctx.fillRect(x - 3, y + 8, 6, 2);
    }
  }

  function drawPainting(p) {
    const { fx, fy, fw, fh, work } = p;
    const st = getState();
    const done = !!st.works[work.id]?.done;
    // sombra del cuadro
    ctx.fillStyle = "rgba(60,35,20,0.28)";
    ctx.fillRect(fx + 2, fy + 3, fw, fh);
    // marco dorado
    const gr = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
    gr.addColorStop(0, "#e2bf6e"); gr.addColorStop(0.5, "#b8893a"); gr.addColorStop(1, "#8a6326");
    ctx.fillStyle = gr;
    ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = "#6b4a1e";
    ctx.fillRect(fx + 3, fy + 3, fw - 6, fh - 6);
    const ix = fx + 4, iy = fy + 4, iw = fw - 8, ih = fh - 8;
    const th = thumbs.get(work.id);
    if (th instanceof HTMLCanvasElement) {
      const sr = th.width / th.height, dr = iw / ih;
      let sx = 0, sy = 0, sw = th.width, sh = th.height;
      if (sr > dr) { sw = th.height * dr; sx = (th.width - sw) / 2; } else { sh = th.width / dr; sy = (th.height - sh) / 2; }
      ctx.drawImage(th, sx, sy, sw, sh, ix, iy, iw, ih);
    } else {
      const pg = ctx.createLinearGradient(ix, iy, ix, iy + ih);
      pg.addColorStop(0, "#d8c6a3"); pg.addColorStop(1, "#a88b62");
      ctx.fillStyle = pg; ctx.fillRect(ix, iy, iw, ih);
      ctx.fillStyle = "rgba(64,51,38,0.35)";
      ctx.beginPath(); ctx.moveTo(ix, iy + ih); ctx.lineTo(ix + iw * 0.35, iy + ih * 0.45); ctx.lineTo(ix + iw * 0.6, iy + ih * 0.75); ctx.lineTo(ix + iw * 0.8, iy + ih * 0.5); ctx.lineTo(ix + iw, iy + ih); ctx.fill();
    }
    // brillo del vidrio
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + iw * 0.4, iy); ctx.lineTo(ix, iy + ih * 0.6); ctx.fill();
    ctx.strokeStyle = "rgba(255,240,200,0.55)"; ctx.lineWidth = 0.8;
    ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
    // placa de latón
    if (p.kind === "wall") {
      const px = fx + fw / 2 - 9, py = fy + fh + 3;
      ctx.fillStyle = "#c9a14a"; ctx.fillRect(px, py, 18, 7);
      ctx.fillStyle = "#e6c67a"; ctx.fillRect(px, py, 18, 1.4);
    }
    if (done) drawSeal(fx + fw - 3, fy + 3, st.works[work.id].stars || 1);
  }

  function drawSeal(x, y, stars) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(40,10,5,0.3)";
    ctx.beginPath(); ctx.arc(1, 1.5, 9, 0, 7); ctx.fill();
    ctx.fillStyle = "#9e2b25";
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, rr = i % 2 ? 8.4 : 9.2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#c8443a"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.stroke();
    ctx.fillStyle = "#f3cf68";
    const n = Math.max(1, Math.min(3, stars));
    const sp = 4.6;
    for (let i = 0; i < n; i++) drawStar(ctx, (i - (n - 1) / 2) * sp, 0.3, 2.4);
    ctx.restore();
  }

  function drawHalo(p) {
    const pulse = 0.55 + Math.sin(time * 4) * 0.25;
    ctx.save();
    ctx.shadowColor = `rgba(255,214,120,${pulse})`;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = `rgba(255,222,140,${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.fx - 3, p.fy - 3, p.fw + 6, p.fh + 6);
    ctx.restore();
    // haz de luz en el piso
    const gr = ctx.createRadialGradient(p.stand.x, p.stand.y - 6, 2, p.stand.x, p.stand.y - 6, 26);
    gr.addColorStop(0, `rgba(255,220,140,${0.22 * pulse})`);
    gr.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(p.stand.x, p.stand.y - 4, 26, 12, 0, 0, 7); ctx.fill();
  }

  function drawLights() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const l of room.lights) {
      const fl = l.soft ? 1 : 0.85 + Math.sin(time * 7 + l.x) * 0.08 + Math.sin(time * 17 + l.y) * 0.05;
      const r = l.r * fl;
      const gr = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r);
      gr.addColorStop(0, `rgba(${l.color},${l.soft ? 0.1 : 0.2})`);
      gr.addColorStop(1, `rgba(${l.color},0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(l.x - r, l.y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function drawVignette() {
    const gr = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.35, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    gr.addColorStop(0, "rgba(40,25,15,0)");
    gr.addColorStop(1, "rgba(40,25,15,0.38)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, vw, vh);
  }

  const toScreen = (x, y) => ({ x: (x - cam.x) * zoom, y: (y - cam.y) * zoom });

  function pill(text, sx, sy, { bg = "rgba(64,51,38,0.92)", fg = "#f8f0e1", size = 13, bold = true, border = null } = {}) {
    ctx.font = `${bold ? "bold " : ""}${size}px Arial, sans-serif`;
    const w = ctx.measureText(text).width + 20, h = size + 12;
    const x = Math.round(sx - w / 2), y = Math.round(sy - h);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, x + 1, y + 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = bg;
    roundRect(ctx, x, y, w, h, h / 2); ctx.fill();
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = fg;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, sx, y + h / 2 + 0.5);
    return { x, y, w, h };
  }

  function drawScreenLabels() {
    // números de las placas
    const fsz = clamp(5.6 * zoom, 9, 12);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const p of room.paintings) {
      const nx = p.fx + p.fw / 2;
      const ny = p.kind === "wall" ? p.fy + p.fh + 6.5 : p.fy + p.fh + 6;
      const s = toScreen(nx, ny);
      if (s.x < -40 || s.x > vw + 40 || s.y < -40 || s.y > vh + 40) continue;
      if (p.kind === "easel") {
        ctx.font = `bold ${fsz}px Georgia, serif`;
        const w = ctx.measureText(String(p.work.id)).width + 8;
        ctx.fillStyle = "#c9a14a"; roundRect(ctx, s.x - w / 2, s.y - fsz / 2 - 2, w, fsz + 4, 2); ctx.fill();
      }
      ctx.font = `bold ${fsz}px Georgia, serif`;
      ctx.fillStyle = "#3b2a1c";
      ctx.fillText(String(p.work.id), s.x, s.y + 0.5);
    }
    // etiquetas de puertas cerradas
    const st = getState();
    for (const d of room.doors) {
      if (isDoorUnlocked(d)) continue;
      const sala = salas.find((x) => x.id === d.to);
      const need = sala?.unlockAt || 35;
      let ax = d.rect.x + d.rect.w / 2, ay = d.rect.y;
      if (d.side === "top") ay = d.rect.y + d.rect.h + 26;
      else if (d.side === "left") { ax = d.rect.x + TILE * 2.6; ay = d.rect.y - 4; }
      else if (d.side === "right") { ax = d.rect.x - TILE * 1.6; ay = d.rect.y - 4; }
      else ay = d.rect.y - 6;
      const s = toScreen(ax, ay);
      const reached = progress.percent(st) >= need;
      const t1 = `${sala?.name || "Sala"}`;
      const t2 = reached ? "El Cabildo te espera para abrirla" : `Se abre en el Cabildo del ${need} %`;
      ctx.font = "bold 12px Arial, sans-serif";
      const w = Math.max(ctx.measureText(t1).width, ctx.measureText(t2).width) + 26;
      const x = s.x - w / 2, y = s.y - 40;
      ctx.fillStyle = "rgba(0,0,0,0.2)"; roundRect(ctx, x + 1, y + 2, w, 38, 6); ctx.fill();
      ctx.fillStyle = "#f5ead5"; roundRect(ctx, x, y, w, 38, 6); ctx.fill();
      ctx.strokeStyle = "#b6533c"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      roundRect(ctx, x + 3, y + 3, w - 6, 32, 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#403326"; ctx.font = "bold 12px Georgia, serif";
      ctx.fillText(t1, s.x, y + 13);
      ctx.fillStyle = "#b6533c"; ctx.font = "11px Arial, sans-serif";
      ctx.fillText(t2, s.x, y + 27);
    }
    // aviso de interacción
    if (target && !fade.dir) {
      const touch = isTouch();
      if (target.kind === "work") {
        const p = target.painting;
        const s = toScreen(p.fx + p.fw / 2, p.fy - 6);
        const bounce = Math.sin(time * 4) * 2;
        pill(touch ? "Tocar: Examinar" : "E · Examinar", s.x, Math.max(pads.top + 34, s.y) + bounce, { bg: "#b6533c" });
      } else if (target.kind === "door") {
        const d = target.door;
        const sala = salas.find((x) => x.id === d.to);
        const reached = progress.percent(st) >= (sala?.unlockAt || 0);
        const s = toScreen(player.x, player.y - 58);
        s.y = Math.max(pads.top + 34, s.y);
        pill(reached ? (touch ? "Tocar: Presentar el Cabildo" : "E · Presentar el Cabildo") : "Puerta cerrada", s.x, s.y, { bg: reached ? "#b6533c" : "rgba(64,51,38,0.92)" });
      }
    }
  }

  // ---------- objetos ----------
  function drawObject(o) {
    const { x, y, w, h } = o;
    switch (o.type) {
      case "column": {
        const cx = x + w / 2, by = y + h - 4;
        ctx.fillStyle = "#8c7d64"; roundRect(ctx, cx - 10, by - 6, 20, 9, 2); ctx.fill();
        const gr = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
        gr.addColorStop(0, "#e8dcc3"); gr.addColorStop(0.5, "#fbf4e6"); gr.addColorStop(1, "#cfc0a2");
        ctx.fillStyle = gr; ctx.fillRect(cx - 7, by - 50, 14, 46);
        ctx.fillStyle = "#8c7d64"; roundRect(ctx, cx - 10, by - 56, 20, 8, 2); ctx.fill();
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(cx - 12, by - 60, 24, 5);
        break;
      }
      case "fountain": drawFountain(o); break;
      case "bush": {
        const cx = x + w / 2, cy = y + h / 2;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 + o.seed;
          ctx.fillStyle = i % 2 ? "#5d7f40" : "#6e9650";
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 14, cy - 8 + Math.sin(a) * 10, 12, 0, 7); ctx.fill();
        }
        ctx.fillStyle = "#86ad62"; ctx.beginPath(); ctx.arc(cx - 4, cy - 14, 10, 0, 7); ctx.fill();
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = ["#efa47f", "#f5ead5", "#e9c46a", "#d95f5f"][i % 4];
          ctx.beginPath(); ctx.arc(cx + Math.cos(i * 2.1 + o.seed) * 16, cy - 10 + Math.sin(i * 1.7) * 11, 2.6, 0, 7); ctx.fill();
        }
        break;
      }
      case "pot": drawPot(x + w / 2, y + h - 3, o.seed); break;
      case "bench": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 4, y + 18, 4, 10); ctx.fillRect(x + w - 8, y + 18, 4, 10);
        ctx.fillStyle = "#8a5a35"; roundRect(ctx, x + 1, y + 8, w - 2, 12, 2); ctx.fill();
        ctx.fillStyle = "#a06f45"; ctx.fillRect(x + 1, y + 8, w - 2, 3);
        ctx.fillStyle = "#6b4529"; ctx.fillRect(x + 1, y + 3, w - 2, 5);
        break;
      }
      case "bench-v": {
        ctx.fillStyle = "#6b4529"; ctx.fillRect(x + 8, y + 2, 16, h - 6);
        ctx.fillStyle = "#8a5a35"; ctx.fillRect(x + 9, y + 2, 14, h - 10);
        ctx.fillStyle = "rgba(255,230,200,0.12)"; for (let k = 0; k < 4; k++) ctx.fillRect(x + 10 + k * 3.5, y + 2, 1, h - 10);
        break;
      }
      case "easel": drawEasel(o); break;
      case "altar": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 4, y + 6, w - 8, h - 8);
        ctx.fillStyle = "#f8f0e1"; ctx.fillRect(x + 6, y + 6, w - 12, 12);
        ctx.fillStyle = "#b6533c"; ctx.fillRect(x + 6, y + 18, w - 12, 3);
        ctx.fillStyle = "#e9c46a"; ctx.fillRect(x + w / 2 - 1.5, y - 10, 3, 18); ctx.fillRect(x + w / 2 - 6, y - 5, 12, 3);
        break;
      }
      case "candles": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 14, y + 6, 4, 22); ctx.fillRect(x + 8, y + 26, 16, 3);
        ctx.fillStyle = "#c9a14a"; ctx.fillRect(x + 6, y + 4, 20, 3);
        for (const dx of [8, 16, 24]) {
          ctx.fillStyle = "#f8f0e1"; ctx.fillRect(x + dx - 1.5, y - 4, 3, 8);
          const f = Math.sin(time * 12 + dx) * 0.8;
          ctx.fillStyle = "#ffcc66"; ctx.beginPath(); ctx.ellipse(x + dx + f * 0.3, y - 6.5, 1.6, 3, 0, 0, 7); ctx.fill();
        }
        break;
      }
      case "counter": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 4, y + 2, w - 8, h - 4);
        ctx.fillStyle = "#8a5a35"; ctx.fillRect(x + 4, y + 2, w - 8, h - 10);
        ctx.fillStyle = "#a06f45"; ctx.fillRect(x + 4, y + 2, 3, h - 10);
        // mercancías: frascos y telas
        const items = ["#e9c46a", "#b6533c", "#f5ead5", "#2c3a35", "#efa47f"];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = items[i];
          if (i % 2) ctx.fillRect(x + 9, y + 10 + i * 22, 14, 8);
          else { ctx.beginPath(); ctx.arc(x + 16, y + 14 + i * 22, 4.5, 0, 7); ctx.fill(); }
        }
        break;
      }
      case "barrel": {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.fillStyle = "#7d5333"; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 12, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#9a6a41"; ctx.beginPath(); ctx.ellipse(cx, cy, 10, 10, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = "#3b2a1c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, 10, 10, 0, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, 6, 6, 0, 0, 7); ctx.stroke();
        break;
      }
      case "sacks": {
        for (let i = 0; i < 2; i++) {
          const sy = y + 10 + i * 26;
          ctx.fillStyle = "#c8b48a"; ctx.beginPath(); ctx.ellipse(x + w / 2, sy, 12, 13, 0, 0, 7); ctx.fill();
          ctx.fillStyle = "#a99366"; ctx.fillRect(x + w / 2 - 4, sy - 13, 8, 4);
          ctx.fillStyle = "#b6533c"; ctx.font = "bold 7px Georgia"; ctx.textAlign = "center"; ctx.fillText(i ? "CACAO" : "SAL", x + w / 2, sy + 3);
        }
        break;
      }
      case "crate": case "chest": {
        ctx.fillStyle = o.type === "chest" ? "#6b4529" : "#9a6a41"; roundRect(ctx, x + 3, y + 5, w - 6, h - 8, 2); ctx.fill();
        ctx.fillStyle = o.type === "chest" ? "#8a5a35" : "#b07d51"; ctx.fillRect(x + 3, y + 5, w - 6, 8);
        ctx.fillStyle = "#3b2a1c"; ctx.fillRect(x + 3, y + 13, w - 6, 2);
        if (o.type === "chest") { ctx.fillStyle = "#c9a14a"; ctx.fillRect(x + w / 2 - 2, y + 12, 4, 5); }
        break;
      }
      case "florero": {
        const cx = x + w / 2;
        ctx.fillStyle = "#8c7d64"; ctx.fillRect(cx - 9, y + 4, 18, h - 6);
        ctx.fillStyle = "#b3a387"; ctx.fillRect(cx - 11, y + 2, 22, 5);
        // el florero de Llorente (con su asa rota)
        ctx.fillStyle = "#f5ead5"; ctx.beginPath(); ctx.ellipse(cx, y - 6, 7, 9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#2f6c8f"; ctx.fillRect(cx - 6, y - 8, 12, 2.5); ctx.fillRect(cx - 5, y - 3, 10, 1.5);
        ctx.fillStyle = "#f5ead5"; ctx.fillRect(cx - 3.5, y - 18, 7, 5);
        ctx.strokeStyle = "#e3d6bb"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx + 7, y - 7, 3.5, -1.2, 1.2); ctx.stroke();
        ctx.fillStyle = "#e9c46a"; ctx.fillRect(cx - 9, y + 10, 18, 5);
        break;
      }
      case "cannon": {
        ctx.fillStyle = "#5a3d28";
        ctx.beginPath(); ctx.arc(x + 14, y + 22, 8, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 46, y + 22, 8, 0, 7); ctx.fill();
        ctx.fillStyle = "#3b3b3b"; roundRect(ctx, x + 4, y + 6, w - 10, 12, 6); ctx.fill();
        ctx.fillStyle = "#555"; ctx.fillRect(x + 8, y + 8, w - 18, 3);
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(x + w - 6, y + 12, 4, 0, 7); ctx.fill();
        for (let i = 0; i < 3; i++) { ctx.fillStyle = "#2b2b2b"; ctx.beginPath(); ctx.arc(x + 8 + i * 6, y + 30, 3, 0, 7); ctx.fill(); }
        break;
      }
      case "rack": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 6, y + 2, 20, h - 4);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = "#3b2a1c"; ctx.fillRect(x + 8, y + 6 + i * 14, 16, 3);
          ctx.fillStyle = "#8a8a8a"; ctx.fillRect(x + 8, y + 6 + i * 14, 9, 1.5);
        }
        break;
      }
      case "maptable": {
        ctx.fillStyle = "#4a3120"; ctx.fillRect(x + 6, y + 18, 5, 12); ctx.fillRect(x + w - 11, y + 18, 5, 12);
        ctx.fillStyle = "#6b4529"; roundRect(ctx, x + 2, y - 4, w - 4, 24, 3); ctx.fill();
        ctx.fillStyle = "#8a5a35"; ctx.fillRect(x + 2, y - 4, w - 4, 3);
        // mapa de la Nueva Granada sobre la mesa
        ctx.fillStyle = "#efe1c3"; ctx.save(); ctx.translate(x + w / 2, y + 8); ctx.rotate(-0.04);
        ctx.fillRect(-40, -10, 80, 20);
        ctx.strokeStyle = "#b6533c"; ctx.lineWidth = 0.8; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(-32, 6); ctx.quadraticCurveTo(-10, -8, 6, 2); ctx.quadraticCurveTo(18, 8, 32, -4); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#7fa35a"; ctx.beginPath(); ctx.ellipse(-14, -2, 9, 5, 0.4, 0, 7); ctx.fill();
        ctx.fillStyle = "#9e2b25"; ctx.beginPath(); ctx.arc(6, 2, 2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(32, -4, 2, 0, 7); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#f8f0e1"; ctx.fillRect(x + w - 22, y - 10, 3, 9);
        ctx.fillStyle = "#ffcc66"; ctx.beginPath(); ctx.ellipse(x + w - 20.5, y - 12, 1.6, 2.8 + Math.sin(time * 10) * 0.4, 0, 0, 7); ctx.fill();
        break;
      }
      case "drum": {
        const cx = x + w / 2, cy = y + h / 2;
        ctx.fillStyle = "#b6533c"; ctx.fillRect(cx - 10, cy - 6, 20, 14);
        ctx.fillStyle = "#f5ead5"; ctx.beginPath(); ctx.ellipse(cx, cy - 6, 10, 5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = "#e9c46a"; ctx.lineWidth = 1; for (let i = -8; i <= 8; i += 4) { ctx.beginPath(); ctx.moveTo(cx + i, cy - 2); ctx.lineTo(cx + i + 3, cy + 7); ctx.stroke(); }
        break;
      }
      case "shelf": {
        ctx.fillStyle = "#4a3120"; ctx.fillRect(x + 3, y + 1, w - 6, h - 2);
        const bookC = ["#b6533c", "#2c3a35", "#e9c46a", "#786b5c", "#8c2f2a", "#f5ead5"];
        for (let r = 0; r < 4; r++) {
          const by = y + 4 + r * 15;
          ctx.fillStyle = "#6b4529"; ctx.fillRect(x + 3, by + 11, w - 6, 3);
          for (let k = 0; k < 4; k++) {
            ctx.fillStyle = bookC[(r * 3 + k + o.seed) % bookC.length];
            ctx.fillRect(x + 6 + k * 5, by + 1 + ((k + r) % 2), 4, 10 - ((k + r) % 2));
          }
        }
        break;
      }
      case "desk": {
        ctx.fillStyle = "#5a3d28"; ctx.fillRect(x + 4, y + 16, 4, 12); ctx.fillRect(x + w - 8, y + 16, 4, 12);
        ctx.fillStyle = "#7d5333"; roundRect(ctx, x + 1, y + 2, w - 2, 18, 2); ctx.fill();
        ctx.fillStyle = "#f8f0e1"; ctx.save(); ctx.translate(x + 20, y + 10); ctx.rotate(-0.15); ctx.fillRect(-8, -5, 16, 11); ctx.restore();
        ctx.fillStyle = "#f5ead5"; ctx.fillRect(x + 34, y + 5, 12, 9);
        ctx.strokeStyle = "#786b5c"; ctx.lineWidth = 0.6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 36, y + 7 + i * 2.5); ctx.lineTo(x + 44, y + 7 + i * 2.5); ctx.stroke(); }
        ctx.fillStyle = "#f8f0e1"; ctx.fillRect(x + 52, y + 2, 3, 8);
        ctx.fillStyle = "#ffcc66"; ctx.beginPath(); ctx.ellipse(x + 53.5, y, 1.6, 2.8 + Math.sin(time * 10) * 0.4, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = "#f8f0e1"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 28, y + 14); ctx.lineTo(x + 34, y + 4); ctx.stroke();
        break;
      }
    }
  }

  function drawPot(cx, by, seed) {
    // matera de barro con planta
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.45;
      ctx.fillStyle = i % 2 ? "#5d7f40" : "#7fa35a";
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 9, by - 22 + Math.sin(a) * 9, 5, 9, a + Math.PI / 2, 0, 7); ctx.fill();
    }
    ctx.fillStyle = "#86ad62"; ctx.beginPath(); ctx.arc(cx, by - 22, 6, 0, 7); ctx.fill();
    if (seed % 3 === 0) { ctx.fillStyle = "#efa47f"; ctx.beginPath(); ctx.arc(cx + 4, by - 26, 2.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx - 5, by - 20, 2.2, 0, 7); ctx.fill(); }
    ctx.fillStyle = "#a8573a";
    ctx.beginPath(); ctx.moveTo(cx - 10, by - 15); ctx.lineTo(cx + 10, by - 15); ctx.lineTo(cx + 7, by); ctx.lineTo(cx - 7, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c06a46"; ctx.fillRect(cx - 11, by - 17, 22, 4);
    ctx.fillStyle = "rgba(255,230,200,0.18)"; ctx.fillRect(cx - 6, by - 12, 2, 10);
  }

  function drawEasel(o) {
    const { x, y, w, h } = o;
    const cx = x + w / 2;
    ctx.strokeStyle = "#5a3d28"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx - 10, y + h - 4); ctx.lineTo(cx - 2, y - 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 10, y + h - 4); ctx.lineTo(cx + 2, y - 28); ctx.stroke();
    ctx.strokeStyle = "#4a3120";
    ctx.beginPath(); ctx.moveTo(cx, y + h - 10); ctx.lineTo(cx, y - 20); ctx.stroke();
    ctx.lineCap = "butt";
    if (o.painting) drawPainting(o.painting);
    ctx.fillStyle = "#6b4529"; ctx.fillRect(cx - 14, y + 10, 28, 4);
  }

  function drawFountain(o) {
    const { cx, cy } = o;
    // base
    ctx.fillStyle = "rgba(50,30,18,0.25)";
    ctx.beginPath(); ctx.ellipse(cx + 3, cy + 8, 56, 40, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#b3a387";
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 54, 38, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#d2c4a6";
    ctx.beginPath(); ctx.ellipse(cx, cy, 54, 38, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#8c7d64";
    ctx.beginPath(); ctx.ellipse(cx, cy, 46, 31, 0, 0, 7); ctx.fill();
    const wg = ctx.createRadialGradient(cx - 10, cy - 8, 4, cx, cy, 46);
    wg.addColorStop(0, "#8fc3cf"); wg.addColorStop(1, "#4e8aa0");
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.ellipse(cx, cy + 1, 44, 29, 0, 0, 7); ctx.fill();
    // ondas
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const ph = (time * 0.6 + i / 3) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath(); ctx.ellipse(cx, cy + 1, 12 + ph * 30, 8 + ph * 19, 0, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // pila central
    ctx.fillStyle = "#c9bc9f"; ctx.beginPath(); ctx.ellipse(cx, cy - 2, 14, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#b3a387"; ctx.fillRect(cx - 5, cy - 26, 10, 24);
    ctx.fillStyle = "#d2c4a6"; ctx.beginPath(); ctx.ellipse(cx, cy - 26, 13, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#6fa9bb"; ctx.beginPath(); ctx.ellipse(cx, cy - 26, 10, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#b3a387"; ctx.beginPath(); ctx.arc(cx, cy - 32, 4, 0, 7); ctx.fill();
    // chorros
    ctx.fillStyle = "rgba(220,240,250,0.85)";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const ph = (time * 1.4 + i * 0.17) % 1;
      const r = 6 + ph * 11;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy - 30 + ph * ph * 14 + Math.sin(a) * r * 0.5, 1.4, 0, 7); ctx.fill();
    }
  }

  // ---------- API ----------
  function position() { return { sala: room?.sala || 1, x: Math.round(player.x), y: Math.round(player.y) }; }

  window.addEventListener("resize", resize);
  resize();

  return {
    start(sala, pos) { enterRoom(sala, pos, { announce: false }); requestAnimationFrame((t) => { last = t; frame(t); }); },
    enterRoom,
    setPaused(v) { paused = v; input.setEnabled(!v && controllable); },
    setControllable(v) { controllable = v; input.setEnabled(v && !paused); },
    get paused() { return paused; },
    get room() { return room; },
    get target() { return target; },
    position,
    refresh() { floorCache = null; },
    preload(works) { works.forEach(loadThumb); },
    /** Obra no completada más cercana al jugador en la sala actual. */
    nearestPendingWork(isDone) {
      let best = null, bd = Infinity;
      for (const p of room.paintings) {
        if (isDone(p.work.id)) continue;
        const d = Math.hypot(player.x - p.stand.x, player.y - p.stand.y);
        if (d < bd) { bd = d; best = p.work; }
      }
      return best;
    },
    /** Lleva al jugador frente a una obra (usado por pruebas y modo demo). */
    standAt(workId) {
      for (const r of Object.values(rooms)) {
        const p = r.paintings.find((q) => q.work.id === workId);
        if (p) { if (r !== room) enterRoom(r.sala, p.stand, { announce: false }); player.x = p.stand.x; player.y = p.stand.y; player.dir = "up"; snapCamera(); return true; }
      }
      return false;
    },
  };
}

export function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}
