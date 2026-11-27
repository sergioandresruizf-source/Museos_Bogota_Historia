// Definición de las 5 salas como mapas de baldosas generados por código.
// La disposición imita una casa colonial: el patio (sala 1) en el centro y
// las demás salas alrededor (capilla al occidente, tienda al norte,
// sala de armas al oriente y archivo al sur).
//
// Códigos de baldosa:
//   '#' remate de muro (sólido)      'F' cara del muro encalado (sólido, ahí cuelgan cuadros)
//   '.' piso interior                'c' empedrado del patio
//   'D' vano de puerta (transitable si la sala destino está abierta)

export const TILE = 32;

// Conexiones: sala -> { lado: salaDestino }
const LINKS = {
  1: { left: 2, top: 3, right: 4, bottom: 5 },
  2: { right: 1 },
  3: { bottom: 1 },
  4: { left: 1 },
  5: { top: 1 },
};

const OPPOSITE = { left: "right", right: "left", top: "bottom", bottom: "top" };

const FLOORS = { 1: "barro", 2: "ajedrez", 3: "madera", 4: "piedra", 5: "tablon" };

class Builder {
  constructor(sala, w, h) {
    this.sala = sala;
    this.w = w;
    this.h = h;
    this.grid = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        let t = ".";
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) t = "#";
        else if (y <= 2) t = "F";
        row.push(t);
      }
      this.grid.push(row);
    }
    this.occ = new Set();
    this.objects = [];
    this.paintings = [];
    this.doors = [];
    this.lights = [];
    this.decals = [];
    this.faceDeco = [];
  }
  key(x, y) { return `${x},${y}`; }
  isFree(x, y, w = 1, h = 1) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (i < 1 || j < 3 || i > this.w - 2 || j > this.h - 2) return false;
        if (this.grid[j][i] !== "." && this.grid[j][i] !== "c") return false;
        if (this.occ.has(this.key(i, j))) return false;
      }
    }
    return true;
  }
  reserve(x, y, w = 1, h = 1) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.occ.add(this.key(i, j));
  }
  /** Agrega un objeto con huella en baldosas. `solid` define si colisiona. */
  add(type, tx, ty, tw = 1, th = 1, opts = {}) {
    if (!opts.force && !this.isFree(tx, ty, tw, th)) return null;
    this.reserve(tx, ty, tw, th);
    const o = {
      type, tx, ty, tw, th,
      x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE,
      solid: opts.solid !== false,
      seed: (tx * 7 + ty * 13 + this.sala * 31) % 97,
      ...opts,
    };
    // Colisión ligeramente más pequeña que la huella para que se sienta natural.
    const inset = opts.inset ?? 4;
    o.box = opts.box || { x: o.x + inset, y: o.y + inset + (opts.topFree || 0), w: o.w - inset * 2, h: o.h - inset * 2 - (opts.topFree || 0) };
    this.objects.push(o);
    return o;
  }
  door(side, to) {
    const { w, h } = this;
    let tiles = [];
    let cx, cy;
    if (side === "left" || side === "right") {
      const x = side === "left" ? 0 : w - 1;
      const r = this.sideDoorRow;
      tiles = [{ x, y: r }, { x, y: r + 1 }];
      cx = side === "left" ? TILE * 1.7 : (w - 1.7) * TILE;
      cy = (r + 1) * TILE + 6;
      // despeja el camino de entrada
      this.reserve(side === "left" ? 1 : w - 4, r - 1, 3, 4);
    } else if (side === "top") {
      const c = Math.floor(w / 2) - 1;
      tiles = [0, 1, 2].flatMap((y) => [{ x: c, y }, { x: c + 1, y }]);
      cx = (c + 1) * TILE;
      cy = 3 * TILE + 22;
      this.reserve(c - 1, 3, 4, 3);
    } else {
      const c = Math.floor(w / 2) - 1;
      tiles = [{ x: c, y: h - 1 }, { x: c + 1, y: h - 1 }];
      cx = (c + 1) * TILE;
      cy = (h - 1) * TILE - 14;
      this.reserve(c - 1, h - 4, 4, 3);
    }
    for (const t of tiles) this.grid[t.y][t.x] = "D";
    const xs = tiles.map((t) => t.x), ys = tiles.map((t) => t.y);
    const rect = {
      x: Math.min(...xs) * TILE, y: Math.min(...ys) * TILE,
      w: (Math.max(...xs) - Math.min(...xs) + 1) * TILE,
      h: (Math.max(...ys) - Math.min(...ys) + 1) * TILE,
    };
    const d = { side, to, tiles, rect, spawn: { x: cx, y: cy } };
    this.doors.push(d);
    return d;
  }
  build(extra) {
    return {
      sala: this.sala, w: this.w, h: this.h, pxW: this.w * TILE, pxH: this.h * TILE,
      grid: this.grid, objects: this.objects, paintings: this.paintings,
      doors: this.doors, lights: this.lights, decals: this.decals, faceDeco: this.faceDeco,
      floor: FLOORS[this.sala] || "barro",
      ...extra,
    };
  }
}

/** Ranuras de cuadros en el muro superior (columnas x, cada cuadro ocupa 2 baldosas). */
function wallSlots(b) {
  const top = b.doors.find((d) => d.side === "top");
  const doorCols = top ? top.tiles.map((t) => t.x) : [];
  const slots = [];
  for (let x = 2; x + 1 <= b.w - 3; x += 3) {
    if (doorCols.some((c) => c >= x - 1 && c <= x + 2)) continue;
    slots.push(x);
  }
  return slots;
}

function hangOnWall(b, work, x) {
  const p = {
    work, kind: "wall",
    // marco centrado sobre las dos baldosas, sobre la cara del muro
    fx: x * TILE + 6, fy: 1 * TILE + 5, fw: 2 * TILE - 12, fh: 2 * TILE - 22,
    stand: { x: (x + 1) * TILE, y: 3 * TILE + 14 },
  };
  b.paintings.push(p);
  b.reserve(x, 3, 2, 1);
  return p;
}

function hangOnEasel(b, work, tx, ty) {
  const o = b.add("easel", tx, ty, 1, 1, { inset: 6, topFree: 10 });
  if (!o) return null;
  const p = {
    work, kind: "easel",
    fx: tx * TILE - 8, fy: ty * TILE - 26, fw: TILE + 16, fh: 36,
    stand: { x: tx * TILE + TILE / 2, y: (ty + 1) * TILE + 18 },
  };
  o.painting = p;
  b.paintings.push(p);
  b.reserve(tx, ty + 1, 1, 1);
  return p;
}

/** Lámparas en los espacios del muro superior entre cuadros. */
function wallLanterns(b) {
  const used = new Set();
  for (const p of b.paintings) if (p.kind === "wall") { used.add(p.fx / TILE | 0); used.add((p.fx / TILE | 0) + 1); }
  const top = b.doors.find((d) => d.side === "top");
  const doorCols = new Set(top ? top.tiles.map((t) => t.x) : []);
  let n = 0;
  for (let x = 1; x < b.w - 1; x++) {
    if (used.has(x) || doorCols.has(x) || doorCols.has(x - 1) || doorCols.has(x + 1)) continue;
    if (b.grid[1][x] !== "F") continue;
    if (n++ % 2 === 0) {
      b.faceDeco.push({ type: "lantern", x: x * TILE + TILE / 2, y: TILE + 14 });
      b.lights.push({ x: x * TILE + TILE / 2, y: TILE + 18, r: 70, color: "255,196,120" });
    }
  }
}

function placeOverflow(b, works, candidates) {
  const rest = [];
  for (const w of works) {
    let placed = false;
    while (candidates.length) {
      const [tx, ty] = candidates.shift();
      if (hangOnEasel(b, w, tx, ty)) { placed = true; break; }
    }
    if (!placed) rest.push(w);
  }
  return rest;
}

function easelCandidates(b, rows, avoidCols = []) {
  const out = [];
  for (const ty of rows) {
    for (let tx = 3; tx <= b.w - 4; tx += 3) {
      if (avoidCols.some((c) => tx >= c - 1 && tx <= c + 2)) continue;
      out.push([tx, ty]);
    }
  }
  return out;
}

// ------------------------------------------------------------
// Patio colonial (sala 1)
// ------------------------------------------------------------
function buildPatio(works) {
  const w = 30;
  let h = 22;
  const b = new Builder(1, w, h);
  b.sideDoorRow = 10;
  b.door("left", LINKS[1].left);
  b.door("top", LINKS[1].top);
  b.door("right", LINKS[1].right);
  b.door("bottom", LINKS[1].bottom);

  // Patio empedrado central con arcada de columnas
  const cx0 = 6, cy0 = 7, cx1 = 23, cy1 = 17;
  for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) b.grid[y][x] = "c";
  const colPos = [];
  for (let x = cx0; x <= cx1 + 1; x += 3) { colPos.push([x, cy0 - 1]); colPos.push([x, cy1 + 1]); }
  for (let y = cy0 + 2; y <= cy1 - 1; y += 3) { colPos.push([cx0 - 1, y]); colPos.push([cx1 + 1, y]); }
  for (const [x, y] of colPos) {
    if (y === 10 || y === 11) continue; // no tapar el eje de las puertas laterales
    if (x === 14 || x === 15) continue;
    b.add("column", Math.min(x, w - 2), y, 1, 1, { inset: 7, topFree: 6 });
  }
  // Fuente en el centro
  const fcx = 15 * TILE, fcy = 12 * TILE + 8;
  b.add("fountain", 13, 10, 4, 4, { force: true, cx: fcx, cy: fcy, box: { x: fcx - 50, y: fcy - 40, w: 100, h: 76 } });
  b.lights.push({ x: fcx, y: fcy, r: 120, color: "180,220,255", soft: true });
  // Senderos de piedra hacia la fuente
  b.decals.push({ type: "path", x: 14 * TILE, y: cy0 * TILE, w: 2 * TILE, h: 3 * TILE });
  b.decals.push({ type: "path", x: 14 * TILE, y: 14 * TILE, w: 2 * TILE, h: (cy1 - 13) * TILE });
  b.decals.push({ type: "path", x: cx0 * TILE, y: 11 * TILE - 16, w: 7 * TILE, h: 2 * TILE });
  b.decals.push({ type: "path", x: 17 * TILE, y: 11 * TILE - 16, w: 7 * TILE, h: 2 * TILE });
  // Jardines con matas en el empedrado
  for (const [x, y] of [[7, 8], [21, 8], [7, 15], [21, 15]]) {
    b.decals.push({ type: "garden", x: x * TILE - 8, y: y * TILE - 8, w: 2 * TILE + 16, h: 2 * TILE + 16 });
    b.add("bush", x, y, 2, 2, { inset: 10 });
  }
  b.add("bench", 10, 8, 2, 1, { inset: 3 });
  b.add("bench", 18, 8, 2, 1, { inset: 3 });
  b.add("bench", 10, 16, 2, 1, { inset: 3 });
  b.add("bench", 18, 16, 2, 1, { inset: 3 });

  // Cuadros
  const slots = wallSlots(b);
  const list = works.slice();
  slots.forEach((x) => { if (list.length) hangOnWall(b, list.shift(), x); });
  const cand = [
    [3, 19], [6, 19], [9, 19], [20, 19], [23, 19], [26, 19],
    [3, 14], [26, 14], [3, 17], [26, 17], [3, 7], [26, 7],
  ];
  let rest = placeOverflow(b, list, cand);
  if (rest.length) rest = placeOverflow(b, rest, easelCandidates(b, [5], [14]));
  wallLanterns(b);

  // Materas en las esquinas del corredor
  for (const [x, y] of [[1, 3], [28, 3], [1, 20], [28, 20], [12, 20], [17, 20], [1, 8], [28, 8], [1, 13], [28, 13]]) {
    b.add(y === 20 || x === 1 || x === 28 ? "pot" : "pot", x, y, 1, 1, { inset: 6 });
  }
  for (const [x, y] of [[cx0 - 1, cy0 - 1], [cx1 + 1, cy0 - 1], [cx0 - 1, cy1 + 1], [cx1 + 1, cy1 + 1]]) {
    b.lights.push({ x: x * TILE + 16, y: y * TILE + 8, r: 80, color: "255,190,110" });
  }
  return b.build({ name: "patio", unplaced: rest });
}

// ------------------------------------------------------------
// Salas alrededor del patio
// ------------------------------------------------------------
function buildRoom(sala, works) {
  const n = works.length;
  const w = Math.max(20, Math.min(32, 3 * Math.ceil(n / 2) + 7));
  const rowsNeeded = Math.max(0, Math.ceil((n - Math.floor((w - 4) / 3)) / Math.floor((w - 5) / 3)));
  const h = 16 + Math.max(0, rowsNeeded - 2) * 3;
  const b = new Builder(sala, w, h);
  b.sideDoorRow = 6;
  const links = LINKS[sala];
  for (const side of Object.keys(links)) b.door(side, links[side]);
  const vertDoor = b.doors.find((d) => d.side === "top" || d.side === "bottom");
  const avoid = vertDoor ? [vertDoor.tiles[0].x] : [];

  // Decoración específica (antes de los caballetes para reservar rincones)
  decorate(b, sala);

  const list = works.slice();
  for (const x of wallSlots(b)) { if (list.length) hangOnWall(b, list.shift(), x); }
  const rows = [];
  for (let y = 10; y <= h - 3; y += 3) rows.push(y);
  let rest = placeOverflow(b, list, easelCandidates(b, rows, avoid));
  if (rest.length) rest = placeOverflow(b, rest, easelCandidates(b, [7, 8, 9], avoid));
  wallLanterns(b);
  fillDecor(b, sala);
  return b.build({ unplaced: rest });
}

function decorate(b, sala) {
  const { w, h } = b;
  if (sala === 2) {
    // Capilla: alfombra roja hacia el altar lateral, cirios y bancas
    b.decals.push({ type: "rug", x: 3 * TILE, y: 6 * TILE + 4, w: (w - 4) * TILE, h: 2 * TILE - 8, color: "#8c2f2a" });
    b.add("altar", 1, 4, 2, 2, { inset: 2 });
    b.add("candles", 1, 3, 1, 1, { inset: 8 });
    b.add("candles", w - 2, 3, 1, 1, { inset: 8 });
    b.lights.push({ x: 1.5 * TILE, y: 3.5 * TILE, r: 90, color: "255,200,120" });
    b.lights.push({ x: (w - 1.5) * TILE, y: 3.5 * TILE, r: 90, color: "255,200,120" });
  } else if (sala === 3) {
    // Tienda de Llorente: mostrador, barriles, costales, el florero en su pedestal
    b.add("counter", 1, 4, 1, 4, { inset: 3 });
    b.add("barrel", w - 2, 3, 1, 1, { inset: 5 });
    b.add("barrel", w - 2, 4, 1, 1, { inset: 5 });
    b.add("sacks", w - 2, 6, 1, 2, { inset: 4 });
    b.add("crate", 1, 9, 1, 1, { inset: 4 });
    const cx = Math.floor(w / 2) - 1;
    b.add("florero", cx - 3, 6, 1, 1, { inset: 6 });
    b.lights.push({ x: (cx - 2.5) * TILE, y: 6.2 * TILE, r: 70, color: "255,220,150" });
    b.decals.push({ type: "rug", x: (cx - 4) * TILE + 8, y: 5 * TILE + 8, w: 3 * TILE - 16, h: 3 * TILE - 16, color: "#6d4a2e" });
  } else if (sala === 4) {
    // Sala de armas: cañón, estantes de fusiles, estandartes
    b.add("cannon", w - 4, 4, 2, 1, { inset: 3 });
    b.add("rack", w - 2, 7, 1, 2, { inset: 3 });
    b.add("rack", w - 2, 10, 1, 2, { inset: 3 });
    b.add("chest", 1, 9, 1, 1, { inset: 4 });
    b.add("drum", 1, 11, 1, 1, { inset: 6 });
    const mx = Math.floor(w / 2) - 2;
    b.decals.push({ type: "rug", x: (mx - 1) * TILE, y: 6 * TILE - 4, w: 6 * TILE, h: 3 * TILE, color: "#2c3a35" });
    b.add("maptable", mx, 7, 4, 1, { inset: 3 });
    b.lights.push({ x: (mx + 2) * TILE, y: 7.3 * TILE, r: 80, color: "255,210,140" });
  } else if (sala === 5) {
    // Archivo: estanterías con libros, escritorio con vela y baúles
    for (let y = 3; y <= h - 4; y += 2) {
      b.add("shelf", 1, y, 1, 2, { inset: 2 });
      b.add("shelf", w - 2, y, 1, 2, { inset: 2 });
    }
    b.add("desk", 3, 6, 2, 1, { inset: 3 });
    b.add("chest", w - 4, 6, 1, 1, { inset: 4 });
    b.lights.push({ x: 4 * TILE, y: 6.3 * TILE, r: 80, color: "255,200,120" });
    b.decals.push({ type: "rug", x: 6 * TILE, y: 5 * TILE, w: (w - 12) * TILE, h: 3 * TILE, color: "#7a3a2c" });
  }
}

function fillDecor(b, sala) {
  const { w, h } = b;
  // Materas en las esquinas libres y algunas a lo largo de los muros
  for (const [x, y] of [[1, h - 2], [w - 2, h - 2], [1, 3], [w - 2, 3]]) b.add("pot", x, y, 1, 1, { inset: 6 });
  if (sala !== 5) {
    for (let y = 9; y <= h - 4; y += 3) {
      b.add(y % 2 ? "pot" : "bench-v", 1, y, 1, y % 2 ? 1 : 2, { inset: 4 });
      b.add(y % 2 ? "bench-v" : "pot", w - 2, y, 1, y % 2 ? 2 : 1, { inset: 4 });
    }
  }
}

/** Construye las 5 salas a partir de las obras. Devuelve { [sala]: room }. */
export function buildRooms(works, salas) {
  const rooms = {};
  const byId = (a, b) => a.id - b.id;
  for (const s of salas) {
    const list = works.filter((w) => w.sala === s.id).sort(byId);
    rooms[s.id] = s.id === 1 ? buildPatio(list) : buildRoom(s.id, list);
    rooms[s.id].info = s;
    if (rooms[s.id].unplaced?.length) {
      console.warn(`Sala ${s.id}: ${rooms[s.id].unplaced.length} obras sin lugar`);
    }
  }
  // Puntos de llegada: al entrar a una sala desde otra, aparecer junto a la puerta que conecta
  for (const r of Object.values(rooms)) {
    r.spawnFrom = {};
    for (const d of r.doors) r.spawnFrom[d.to] = d.spawn;
    const center = r.sala === 1 ? { x: 15 * TILE, y: 18 * TILE + 10 } : { x: r.pxW / 2, y: r.pxH / 2 + TILE };
    r.defaultSpawn = r.sala === 1 ? center : (r.doors[0]?.spawn || center);
  }
  return rooms;
}

export { OPPOSITE };
