// ===== RECURSOS: imágenes, texturas dibujadas por código ("gen:...") y fotogramas del jefe =====
// Normalmente no necesitas tocar este archivo. Las texturas "gen:" se dibujan aquí píxel a píxel,
// así funcionan aunque abras index.html sin servidor.
const RECURSOS = (() => {
  const TS = 128;   // tamaño de las texturas de suelo y techo
  const imgs = {}, gen = {}, pix = {};
  const cargar = ruta => imgs[ruta] || (imgs[ruta] = Object.assign(new Image(), { src: ruta }));
  const lista = d => !!d && (d instanceof HTMLCanvasElement || (d.complete && d.naturalWidth > 0));
  const ancho = d => d.naturalWidth || d.width, alto = d => d.naturalHeight || d.height;
  const rgba = (r, g, b, a = 255) => ((a << 24) | (Math.max(0, Math.min(255, b | 0)) << 16) | (Math.max(0, Math.min(255, g | 0)) << 8) | Math.max(0, Math.min(255, r | 0))) >>> 0;
  function azar(semilla) {   // números pseudoaleatorios repetibles (mulberry32)
    let s = semilla >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // Lienzo de píxeles con utilidades de dibujo
  function lienzo(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), im = g.createImageData(w, h), d = new Uint32Array(im.data.buffer);
    const P = {
      w, h, d,
      set(x, y, col) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = col; },
      rect(x0, y0, x1, y1, col) {
        for (let y = Math.max(0, y0 | 0); y <= Math.min(h - 1, y1 | 0); y++)
          for (let x = Math.max(0, x0 | 0); x <= Math.min(w - 1, x1 | 0); x++) d[y * w + x] = typeof col === 'function' ? col(x, y) : col;
      },
      elipse(cx, cy, rx, ry, col) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
          for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
            const u = (x + .5 - cx) / rx, v = (y + .5 - cy) / ry;
            if (u * u + v * v <= 1) P.set(x, y, typeof col === 'function' ? col(x, y, u, v) : col);
          }
      },
      poli(pts, col) {   // polígono relleno (barrido por filas)
        const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
        for (let y = y0; y <= y1; y++) {
          const cy = y + .5, xs = [];
          for (let i = 0; i < pts.length; i++) {
            const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
            if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + (cy - ay) / (by - ay) * (bx - ax));
          }
          xs.sort((a, b) => a - b);
          for (let k = 0; k + 1 < xs.length; k += 2)
            for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) P.set(x, y, typeof col === 'function' ? col(x, y) : col);
        }
      },
      linea(x0, y0, x1, y1, col) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
        for (let i = 0; i <= n; i++) P.set(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), col);
      },
      fin() { g.putImageData(im, 0, 0); return c; }
    };
    return P;
  }
  const ruido = (r, g, b, k, rnd) => () => { const f = 1 + (rnd() - .5) * k; return rgba(r * f, g * f, b * f); };

  // ---------- TEXTURAS GENERADAS ----------
  const GEN = {
    puerta() {   // puerta doble de madera (64 × 80 = 1 × 1,25 casillas)
      const P = lienzo(64, 80), R = azar(7);
      P.rect(0, 0, 63, 79, (x, y) => { const v = .82 + .18 * Math.sin(x * .9 + Math.sin(y * .15) * 2) + (R() - .5) * .12; return rgba(92 * v, 58 * v, 34 * v); });
      for (const x0 of [3, 34]) {
        for (const [y0, y1] of [[6, 34], [40, 68]]) {
          P.rect(x0 + 3, y0, x0 + 24, y1, (x, y) => { const v = .9 + (R() - .5) * .1; return rgba(78 * v, 48 * v, 28 * v); });
          P.rect(x0 + 3, y0, x0 + 24, y0, rgba(40, 24, 14)); P.rect(x0 + 3, y0, x0 + 3, y1, rgba(40, 24, 14));
          P.rect(x0 + 3, y1, x0 + 24, y1, rgba(140, 96, 60)); P.rect(x0 + 24, y0, x0 + 24, y1, rgba(140, 96, 60));
        }
      }
      P.rect(31, 0, 32, 79, rgba(28, 16, 10));                     // junta central
      P.rect(0, 0, 1, 79, rgba(40, 26, 16)); P.rect(62, 0, 63, 79, rgba(40, 26, 16)); P.rect(0, 0, 63, 1, rgba(40, 26, 16));
      for (const x of [27, 36]) { P.rect(x, 32, x + 1, 46, rgba(214, 172, 74)); P.rect(x, 32, x, 46, rgba(250, 220, 130)); }   // tiradores de bronce
      P.rect(2, 72, 61, 79, (x, y) => rgba(150 - (y - 72) * 6, 150 - (y - 72) * 6, 156 - (y - 72) * 6));                  // placa metálica
      P.rect(2, 72, 61, 72, rgba(200, 200, 205));
      return P.fin();
    },
    marco() {   // jamba metálica de la puerta (el "DOORTRAK" de DOOM)
      const P = lienzo(64, 64), R = azar(3);
      P.rect(0, 0, 63, 63, ruido(104, 106, 112, .12, R));
      for (let x = 0; x < 64; x += 8) { P.rect(x, 0, x, 63, rgba(62, 64, 70)); P.rect(x + 1, 0, x + 1, 63, rgba(150, 152, 160)); }
      for (let y = 6; y < 64; y += 16) for (let x = 4; x < 64; x += 8) P.set(x, y, rgba(190, 190, 196));
      return P.fin();
    },
    ventana() {   // ventanal (estirado a todo el alto): el vidrio deja ver la ciudad
      const P = lienzo(64, 128), R = azar(11);
      const muro = ruido(236, 233, 224, .05, R), alu = rgba(196, 200, 206), aluO = rgba(118, 122, 130), aluC = rgba(236, 238, 242);
      P.rect(0, 0, 63, 7, muro); P.rect(0, 103, 63, 127, muro);
      P.rect(0, 10, 63, 98, (x, y) => rgba(185, 215, 240, 26 + ((x + y * 2) % 37 < 3 ? 40 : 0)));   // vidrio con reflejos
      P.rect(0, 8, 63, 9, alu); P.rect(0, 8, 63, 8, aluC); P.rect(0, 44, 63, 46, alu); P.rect(0, 44, 63, 44, aluC); P.rect(0, 46, 63, 46, aluO);
      for (const [x, c] of [[0, aluO], [1, aluC], [2, alu], [61, alu], [62, aluC], [63, aluO]]) P.rect(x, 8, x, 102, c);
      P.rect(0, 99, 63, 102, rgba(214, 214, 208)); P.rect(0, 99, 63, 99, rgba(250, 250, 246)); P.rect(0, 102, 63, 102, rgba(160, 160, 154));
      return P.fin();
    },
    pantalla() {   // pantalla de cine sobre un escenario de madera
      const P = lienzo(64, 128), R = azar(5);
      P.rect(0, 0, 63, 127, rgba(16, 16, 18));
      P.rect(0, 16, 63, 88, (x, y) => { const v = .93 + .07 * Math.sin(y / 72 * Math.PI) + ((x + y) % 4 === 0 ? -.03 : 0); return rgba(236 * v, 238 * v, 240 * v); });
      P.rect(0, 96, 63, 99, rgba(150, 104, 66)); P.rect(0, 96, 63, 96, rgba(196, 146, 98));
      P.rect(0, 100, 63, 127, (x, y) => { const v = (x % 16 === 0 ? .7 : 1) * (.9 + (R() - .5) * .12); return rgba(84 * v, 54 * v, 34 * v); });
      return P.fin();
    },
    telon() {   // telón de terciopelo rojo
      const P = lienzo(64, 128), R = azar(9);
      P.rect(0, 0, 63, 127, (x, y) => { const s = Math.sin(x / 64 * Math.PI * 6), v = (.55 + .45 * s * s) * (.94 + (R() - .5) * .08); return rgba(168 * v, 22 * v, 30 * v); });
      P.rect(0, 0, 63, 13, (x, y) => { const v = .7 + .3 * Math.sin(x / 8); return rgba(130 * v, 14 * v, 22 * v); });
      P.rect(0, 13, 63, 15, rgba(214, 170, 70)); P.rect(0, 13, 63, 13, rgba(250, 214, 120));
      for (let x = 0; x < 64; x += 2) P.rect(x, 121, x, 124 + (x % 4 ? 0 : 2), rgba(200, 156, 60));
      return P.fin();
    },
    luz() {   // techo con panel de luz
      const P = lienzo(TS, TS), R = azar(13);
      P.rect(0, 0, TS - 1, TS - 1, ruido(230, 230, 226, .04, R));
      P.rect(0, 0, TS - 1, 0, rgba(168, 168, 164)); P.rect(0, 0, 0, TS - 1, rgba(168, 168, 164));
      P.rect(0, 64, TS - 1, 64, rgba(180, 180, 176)); P.rect(64, 0, 64, TS - 1, rgba(180, 180, 176));
      P.rect(22, 34, 105, 93, rgba(176, 176, 172));
      P.rect(25, 37, 102, 90, (x, y) => (y - 37) % 9 === 0 ? rgba(236, 236, 226) : rgba(255, 254, 242));
      return P.fin();
    },
    claraboya() {   // techo de vidrio del Patio Cubierto
      const P = lienzo(TS, TS), R = azar(17);
      P.rect(0, 0, TS - 1, TS - 1, (x, y) => { const v = y / TS; const nube = Math.sin(x * .07 + y * .03) + Math.sin(x * .021 - y * .05) > 1.3; return nube ? rgba(236, 244, 252) : rgba(150 + 50 * v, 196 + 30 * v, 238 + 12 * v); });
      for (const [a, b] of [[0, 5], [61, 66], [122, 127]]) { P.rect(a, 0, b, TS - 1, rgba(238, 238, 232)); P.rect(0, a, TS - 1, b, rgba(238, 238, 232)); }
      P.rect(0, 5, TS - 1, 5, rgba(170, 170, 166)); P.rect(5, 0, 5, TS - 1, rgba(170, 170, 166));
      return P.fin();
    },
    techo_boveda() {   // techo de hormigón de la bóveda
      const P = lienzo(TS, TS), R = azar(19);
      P.rect(0, 0, TS - 1, TS - 1, ruido(84, 80, 78, .16, R));
      for (const a of [0, 64]) { P.rect(a, 0, a + 9, TS - 1, ruido(54, 50, 48, .1, R)); P.rect(0, a, TS - 1, a + 9, ruido(54, 50, 48, .1, R)); P.rect(a + 9, 0, a + 9, TS - 1, rgba(110, 104, 100)); }
      return P.fin();
    },
    // --- respaldos de suelo/techo por si el navegador no deja leer los PNG (abriendo sin servidor) ---
    suelo_ladrillo() {
      const P = lienzo(TS, TS), R = azar(23);
      P.rect(0, 0, TS - 1, TS - 1, ruido(92, 86, 82, .2, R));
      for (let f = 0; f < 8; f++) for (let k = -1; k < 4; k++) {
        const x0 = k * 32 + (f % 2) * 16, v = .8 + R() * .3;
        P.rect(x0 + 2, f * 16 + 2, x0 + 29, f * 16 + 13, () => { const n = v * (.9 + R() * .2); return rgba(150 * n, 58 * n, 48 * n); });
      }
      return P.fin();
    },
    techo() {
      const P = lienzo(TS, TS), R = azar(29);
      P.rect(0, 0, TS - 1, TS - 1, ruido(232, 232, 228, .05, R));
      for (const a of [0, 64]) { P.rect(a, 0, a + 1, TS - 1, rgba(160, 160, 156)); P.rect(0, a, TS - 1, a + 1, rgba(160, 160, 156)); }
      return P.fin();
    },
    concreto() {
      const P = lienzo(TS, TS), R = azar(31);
      P.rect(0, 0, TS - 1, TS - 1, ruido(150, 150, 148, .14, R));
      for (const a of [0, 64]) { P.rect(a, 0, a, TS - 1, rgba(112, 112, 110)); P.rect(0, a, TS - 1, a, rgba(112, 112, 110)); }
      return P.fin();
    },

    // ---------- SPRITES ----------
    atril() {   // tótem con información
      const P = lienzo(32, 48);
      P.rect(8, 44, 23, 47, rgba(46, 46, 52)); P.rect(8, 44, 23, 44, rgba(92, 92, 100));
      P.rect(14, 22, 17, 43, rgba(70, 70, 78)); P.rect(14, 22, 14, 43, rgba(110, 110, 120));
      P.rect(3, 4, 28, 22, rgba(34, 34, 40)); P.rect(4, 5, 27, 21, rgba(240, 238, 230)); P.rect(4, 5, 27, 5, rgba(255, 255, 250));
      P.elipse(16, 12, 5.5, 5.5, rgba(36, 92, 176)); P.rect(15, 9, 16, 9, rgba(255, 255, 255)); P.rect(15, 11, 16, 15, rgba(255, 255, 255));
      for (const y of [18, 20]) P.rect(7, y, 24, y, rgba(150, 150, 156));
      return P.fin();
    },
    banca() {   // banca de museo
      const P = lienzo(64, 20);
      for (const [y0, y1] of [[3, 5], [7, 9]]) { P.rect(2, y0, 61, y1, rgba(156, 104, 58)); P.rect(2, y0, 61, y0, rgba(196, 140, 84)); }
      P.rect(2, 10, 61, 11, rgba(98, 62, 34));
      for (const x of [6, 54]) { P.rect(x, 12, x + 3, 18, rgba(42, 42, 48)); P.rect(x - 1, 19, x + 4, 19, rgba(30, 30, 34)); P.rect(x, 12, x, 18, rgba(90, 90, 98)); }
      return P.fin();
    },
    butaca() {   // butaca de cine vista desde atrás
      const P = lienzo(24, 30);
      P.rect(4, 0, 19, 20, rgba(40, 8, 10));
      P.rect(5, 1, 18, 19, (x, y) => { const v = .75 + .25 * Math.sin((x - 4) / 15 * Math.PI); return rgba(176 * v, 30 * v, 36 * v); });
      P.set(4, 0, 0); P.set(19, 0, 0); P.set(5, 1, rgba(40, 8, 10)); P.set(18, 1, rgba(40, 8, 10));
      P.rect(0, 12, 3, 22, rgba(44, 34, 32)); P.rect(20, 12, 23, 22, rgba(44, 34, 32)); P.rect(0, 12, 3, 12, rgba(90, 70, 64)); P.rect(20, 12, 23, 12, rgba(90, 70, 64));
      P.rect(4, 21, 19, 24, rgba(120, 18, 24)); P.rect(8, 25, 15, 29, rgba(36, 36, 40));
      return P.fin();
    },
    lampara() {   // lámpara de pie (brilla sola)
      const P = lienzo(16, 64);
      P.poli([[4, 0], [12, 0], [15, 13], [1, 13]], (x, y) => rgba(255, 238 - y * 3, 186 - y * 5));
      P.rect(1, 13, 15, 14, rgba(170, 130, 70));
      P.rect(7, 15, 8, 60, rgba(52, 52, 58)); P.rect(7, 15, 7, 60, rgba(98, 98, 106));
      P.rect(3, 60, 12, 63, rgba(40, 40, 44)); P.rect(3, 60, 12, 60, rgba(90, 90, 96));
      return P.fin();
    },
    caja() {   // caja de embalaje de obras
      const P = lienzo(48, 40), R = azar(37);
      P.rect(0, 0, 47, 39, ruido(178, 138, 84, .14, R));
      P.rect(0, 0, 47, 1, rgba(120, 88, 50)); P.rect(0, 38, 47, 39, rgba(110, 80, 46)); P.rect(0, 0, 1, 39, rgba(120, 88, 50)); P.rect(46, 0, 47, 39, rgba(110, 80, 46));
      for (const y of [13, 26]) P.rect(2, y, 45, y, rgba(132, 98, 58));
      for (let i = 0; i < 44; i++) { const x = 2 + i, y = 37 - Math.round(i * 35 / 43); P.rect(x, y - 1, x, y + 1, rgba(146, 108, 62)); }
      P.rect(6, 4, 22, 10, rgba(186, 42, 38)); P.rect(7, 5, 21, 9, rgba(178, 138, 84)); P.rect(9, 7, 19, 7, rgba(186, 42, 38));
      for (const x of [32, 39]) { P.rect(x, 4, x + 1, 10, rgba(30, 24, 20)); P.rect(x - 2, 6, x + 3, 6, rgba(30, 24, 20)); P.rect(x - 1, 5, x + 2, 5, rgba(30, 24, 20)); }
      return P.fin();
    },
    cubierta() {   // escultura tapada con una sábana
      const P = lienzo(40, 56);
      P.rect(8, 46, 31, 55, rgba(70, 70, 76)); P.rect(8, 46, 31, 46, rgba(120, 120, 128));
      const tela = (x, y) => { const v = .82 + .12 * Math.sin(x * .9 + y * .12) - (x - 20) * .006; return rgba(228 * v, 224 * v, 214 * v); };
      P.elipse(20, 11, 9, 10, tela); P.poli([[11, 12], [29, 12], [36, 46], [4, 46]], tela);
      for (const x of [13, 19, 25, 31]) P.linea(x - 1, 20, x + (x - 20) * .3, 45, rgba(176, 172, 162));
      return P.fin();
    },
    // --- objetos de la sección secreta ---
    botiquin() {
      const P = lienzo(28, 20);
      P.rect(10, 1, 17, 3, rgba(70, 70, 76));
      P.rect(1, 4, 26, 19, rgba(110, 110, 112)); P.rect(2, 5, 25, 18, rgba(238, 238, 232)); P.rect(2, 16, 25, 18, rgba(196, 196, 190));
      P.rect(11, 6, 16, 16, rgba(208, 24, 24)); P.rect(6, 9, 21, 13, rgba(208, 24, 24)); P.rect(11, 6, 16, 6, rgba(255, 90, 90)); P.rect(6, 9, 10, 9, rgba(255, 90, 90));
      return P.fin();
    },
    armadura() {   // chaleco verde (como en DOOM)
      const P = lienzo(32, 26);
      const verde = (x, y) => { const v = 1.15 - x / 40 + ((x === 15 || x === 16) ? -.25 : 0); return rgba(46 * v, 160 * v, 52 * v); };
      P.poli([[3, 2], [11, 2], [13, 7], [18, 7], [20, 2], [28, 2], [31, 10], [27, 12], [27, 25], [4, 25], [4, 12], [0, 10]], rgba(12, 52, 14));
      P.poli([[4, 3], [10, 3], [12, 8], [19, 8], [21, 3], [27, 3], [29, 9], [26, 11], [26, 24], [5, 24], [5, 11], [2, 9]], verde);
      P.rect(7, 14, 24, 15, rgba(26, 100, 30)); P.rect(7, 19, 24, 20, rgba(26, 100, 30));
      return P.fin();
    },
    municion() {   // caja de cartuchos
      const P = lienzo(28, 20);
      for (let i = 0; i < 5; i++) { const x = 3 + i * 5; P.rect(x, 1, x + 3, 9, rgba(196, 30, 30)); P.rect(x, 1, x, 9, rgba(250, 96, 90)); P.rect(x, 1, x + 3, 1, rgba(120, 16, 16)); }
      P.rect(1, 8, 26, 19, rgba(70, 30, 20)); P.rect(2, 9, 25, 18, rgba(150, 44, 32)); P.rect(2, 12, 25, 15, rgba(226, 192, 116)); P.rect(2, 9, 25, 9, rgba(196, 80, 60));
      return P.fin();
    },
    arma() {   // escopeta tirada en el suelo
      const P = lienzo(56, 16);
      P.rect(2, 4, 40, 5, rgba(64, 64, 72)); P.rect(2, 4, 40, 4, rgba(120, 120, 132));
      P.rect(12, 7, 38, 8, rgba(50, 50, 56));
      P.rect(20, 6, 32, 9, rgba(134, 82, 42)); for (let x = 22; x < 32; x += 3) P.rect(x, 6, x, 9, rgba(96, 58, 28));
      P.rect(38, 4, 45, 10, rgba(46, 46, 52)); P.rect(38, 4, 45, 4, rgba(96, 96, 106));
      P.poli([[45, 5], [55, 3], [55, 13], [45, 10]], rgba(140, 90, 46)); P.linea(45, 5, 55, 3, rgba(186, 128, 70));
      P.rect(40, 11, 42, 12, rgba(40, 40, 44));
      return P.fin();
    },
    bola() { return bola(0); }, bola2() { return bola(1); },
    impacto0() { return estallido(0); }, impacto1() { return estallido(1); }, impacto2() { return estallido(2); },
    humo0() { return nube(0, [235, 235, 230]); }, humo1() { return nube(1, [190, 190, 186]); }, humo2() { return nube(2, [150, 150, 146]); },
    sangre0() { return nube(0, [220, 30, 30]); }, sangre1() { return nube(1, [170, 16, 16]); }, sangre2() { return nube(2, [120, 8, 8]); }
  };
  function bola(k) {   // proyectil del jefe
    const P = lienzo(24, 24), R = azar(41 + k);
    P.elipse(12, 12, 11, 11, (x, y, u, v) => {
      const r = Math.hypot(u, v) + (R() - .5) * .25;
      if (r > .95) return 0;
      if (r < .3) return rgba(255, 255, 214);
      if (r < .5) return rgba(255, 226, 90);
      if (r < .72) return rgba(255, 140, 30);
      return rgba(214, 46, 20, 230);
    });
    return P.fin();
  }
  function estallido(k) {
    const P = lienzo(32, 32), R = azar(53 + k), r0 = 5 + k * 5;
    P.elipse(16, 16, r0 + 4, r0 + 4, (x, y, u, v) => {
      const r = Math.hypot(u, v) + (R() - .5) * .3;
      if (r > .98) return 0;
      if (k === 2) return r < .6 ? rgba(120, 40, 20, 150) : rgba(80, 30, 20, 110);
      return r < .4 ? rgba(255, 250, 200) : r < .7 ? rgba(255, 170, 40) : rgba(220, 60, 20, 220);
    });
    return P.fin();
  }
  function nube(k, [r, g, b]) {
    const P = lienzo(12, 12), R = azar(61 + k), rad = 2.5 + k * 1.4;
    P.elipse(6, 6, rad, rad, () => R() < .8 - k * .2 ? rgba(r, g, b, 230 - k * 60) : 0);
    return P.fin();
  }

  // ---------- CIELO (Bogotá: cerros orientales y la Calle 26) ----------
  // Panorama que se ve por las ventanas y sobre los patios al aire libre (como el cielo de DOOM).
  let cieloC = null;
  function cielo() {
    if (cieloC) return cieloC;
    const W = 1024, H = 256, hz = 128, P = lienzo(W, H), R = azar(71);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = Math.min(1, y / hz);
      P.d[y * W + x] = rgba(70 + 120 * t, 118 + 100 * t, 196 + 44 * t);
    }
    for (let i = 0; i < 26; i++) {   // nubes
      const cx = R() * W, cy = 12 + R() * 70, rx = 20 + R() * 46, ry = 5 + R() * 9;
      for (let j = 0; j < 5; j++) P.elipse((cx + (R() - .5) * rx) % W, cy + (R() - .5) * ry, rx * (.4 + R() * .4), ry * (.6 + R() * .5), rgba(244, 246, 250));
    }
    const per = (x, f, s) => Math.sin(x / W * Math.PI * 2 * f + s);
    for (let x = 0; x < W; x++) {   // cerros: lejanos (azulados) y cercanos (verdes)
      const a = hz - 34 - 18 * per(x, 2, .5) - 9 * per(x, 5, 1.2) - 4 * per(x, 13, 2);
      for (let y = Math.floor(a); y < hz + 6; y++) P.set(x, y, rgba(112, 146, 156));
      const b = hz - 16 - 10 * per(x, 3, 2.1) - 5 * per(x, 9, .3) - 2 * per(x, 23, 1);
      for (let y = Math.floor(b); y < hz + 8; y++) P.set(x, y, rgba(62 - (y - b) * .3, 104 - (y - b) * .5, 70 - (y - b) * .3));
    }
    for (let x = 0; x < W;) {   // edificios
      const w = 8 + Math.floor(R() * 22), h = 6 + Math.floor(R() * 34), tono = R();
      const col = tono < .45 ? [150, 82, 62] : tono < .8 ? [170, 168, 172] : [214, 206, 190];
      P.rect(x, hz + 10 - h, x + w - 1, hz + 26, (px, py) => rgba(col[0] * (px === x ? .8 : 1), col[1] * (px === x ? .8 : 1), col[2] * (px === x ? .8 : 1)));
      for (let wy = hz + 13 - h; wy < hz + 24; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) P.set(wx, wy, R() < .5 ? rgba(250, 232, 160) : rgba(60, 70, 90));
      x += w + Math.floor(R() * 4);
    }
    for (let x = 0; x < W; x += 2) { const r = 3 + R() * 6; P.elipse(x * 7 % W, hz + 28 + R() * 6, r, r * .8, rgba(48 + R() * 20, 98 + R() * 30, 52)); }   // árboles
    P.rect(0, hz + 36, W - 1, hz + 62, rgba(70, 72, 78));                     // Calle 26
    for (let x = 0; x < W; x += 24) P.rect(x, hz + 48, x + 11, hz + 49, rgba(236, 236, 220));
    P.rect(0, hz + 63, W - 1, H - 1, (x, y) => rgba(150 - (y - hz - 63) * .4, 146 - (y - hz - 63) * .4, 136 - (y - hz - 63) * .4));
    for (let x = 0; x < W; x += 16) P.rect(x, hz + 63, x, H - 1, rgba(120, 118, 110));
    const c = P.fin();
    cieloC = { c, w: W, h: H, pix: new Uint32Array(P.d) };
    return cieloC;
  }

  // ---------- ARMA EN PRIMERA PERSONA (escopeta) ----------
  let armaC = null;
  function arma() {
    if (armaC) return armaC;
    const cuadro = (bombeo, fuego) => {
      const P = lienzo(80, 84), b = bombeo ? 6 : 0;
      const piel = (x, y) => rgba(222 - (x % 3 === 0 ? 14 : 0), 164 - (y % 4 === 0 ? 12 : 0), 118);
      P.poli([[37, 24], [43, 24], [47, 66], [33, 66]], rgba(70, 72, 82));
      P.linea(37, 24, 33, 66, rgba(150, 154, 166)); P.linea(39, 24, 37, 66, rgba(112, 114, 124)); P.linea(43, 24, 47, 66, rgba(36, 36, 42));
      P.rect(38, 21, 42, 23, rgba(206, 206, 196)); P.rect(37, 24, 43, 25, rgba(40, 40, 46));
      P.poli([[31, 37 + b], [49, 37 + b], [52, 56 + b], [28, 56 + b]], rgba(144, 88, 46));
      for (let y = 40 + b; y < 56 + b; y += 3) P.linea(30, y, 50, y, rgba(102, 60, 30));
      P.linea(31, 37 + b, 28, 56 + b, rgba(184, 122, 70));
      P.poli([[29, 60], [51, 60], [56, 84], [24, 84]], rgba(56, 58, 66)); P.linea(29, 60, 51, 60, rgba(104, 106, 116));
      P.rect(43, 64, 48, 69, rgba(24, 24, 28));
      P.elipse(29, 49 + b, 8, 10, piel); P.elipse(27, 52 + b, 7, 9, rgba(186, 130, 90));
      for (let i = 0; i < 3; i++) { P.rect(30, 41 + b + i * 4, 38, 43 + b + i * 4, piel); P.rect(30, 44 + b + i * 4, 38, 44 + b + i * 4, rgba(150, 96, 64)); }
      P.elipse(54, 78, 10, 9, piel); P.elipse(57, 81, 8, 7, rgba(186, 130, 90)); P.rect(46, 71, 52, 74, piel);
      if (fuego) {
        P.elipse(40, 12, 9, 8, (x, y, u, v) => { const r = Math.hypot(u, v); return r < .45 ? rgba(255, 255, 230) : r < .75 ? rgba(255, 220, 90) : rgba(255, 140, 30, 220); });
        for (const [dx, dy] of [[-12, -4], [12, -4], [-8, -10], [8, -10], [0, -12], [-13, 6], [13, 6]]) P.linea(40, 12, 40 + dx, 12 + dy, rgba(255, 200, 80));
        P.linea(37, 24, 43, 24, rgba(255, 210, 120));
      }
      return P.fin();
    };
    armaC = { quieta: cuadro(false, false), fuego: cuadro(false, true), bombeo: cuadro(true, false) };
    return armaC;
  }

  // ---------- JEFE: recorta cada cuadro de la hoja y vuelve transparente el fondo ----------
  function jefe(def) {
    const out = {}, img = cargar(def.imagen);
    let avisado = false;
    const procesar = () => {
      for (const [n, [x, y, w, h]] of Object.entries(def.cuadros)) {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d'); g.drawImage(img, x, y, w, h, 0, 0, w, h);
        try { quitarFondo(g, w, h); }
        catch (e) {   // sin servidor el navegador no deja leer los píxeles: recorte ovalado
          g.globalCompositeOperation = 'destination-in'; g.beginPath(); g.ellipse(w / 2, h * .54, w * .42, h * .46, 0, 0, Math.PI * 2); g.fill();
          if (!avisado) { avisado = true; console.warn('Jefe sin fondo transparente (abre el proyecto con Live Server):', def.imagen); }
        }
        out[n] = c;
      }
    };
    if (lista(img)) procesar(); else img.addEventListener('load', procesar);
    return out;
  }
  function quitarFondo(g, w, h) {
    const im = g.getImageData(0, 0, w, h), d = im.data, n = w * h;
    const borde = [];
    for (let x = 0; x < w; x++) borde.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) borde.push(y * w, y * w + w - 1);
    const med = k => { const v = borde.map(i => d[i * 4 + k]).sort((a, b) => a - b); return v[v.length >> 1]; };
    const fr = med(0), fg = med(1), fb = med(2), tol = 16;
    const fondo = i => Math.abs(d[i * 4] - fr) <= tol && Math.abs(d[i * 4 + 1] - fg) <= tol && Math.abs(d[i * 4 + 2] - fb) <= tol;
    const quita = new Uint8Array(n), cola = new Int32Array(n);
    let a = 0, b = 0;
    for (const i of borde) if (!quita[i] && fondo(i)) { quita[i] = 1; cola[b++] = i; }
    while (a < b) {   // relleno desde los bordes: todo el gris conectado es fondo
      const i = cola[a++], x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w])
        if (j >= 0 && j < n && !quita[j] && fondo(j)) { quita[j] = 1; cola[b++] = j; }
    }
    // se queda solo con la mancha más grande (quita motas sueltas de la compresión JPEG)
    const comp = new Int32Array(n).fill(-1); let mejor = -1, tamMejor = 0, id = 0;
    for (let s = 0; s < n; s++) {
      if (quita[s] || comp[s] >= 0) continue;
      a = 0; b = 0; cola[b++] = s; comp[s] = id;
      while (a < b) {
        const i = cola[a++], x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w])
          if (j >= 0 && j < n && !quita[j] && comp[j] < 0) { comp[j] = id; cola[b++] = j; }
      }
      if (b > tamMejor) { tamMejor = b; mejor = id; }
      id++;
    }
    // cierre morfológico (dilatar y erosionar 2 px): tapa agujeritos donde el pelo gris toca el fondo
    let m = new Uint8Array(n);
    for (let i = 0; i < n; i++) m[i] = !quita[i] && comp[i] === mejor ? 1 : 0;
    const pasada = (src, dil, horiz) => {
      const o = new Uint8Array(n), r = 2;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = dil ? 0 : 1;
        for (let k = -r; k <= r; k++) {
          const xx = horiz ? x + k : x, yy = horiz ? y : y + k;
          const s = xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : src[yy * w + xx];
          if (dil ? s : !s) { v = dil ? 1 : 0; break; }
        }
        o[y * w + x] = v;
      }
      return o;
    };
    const cerrado = pasada(pasada(pasada(pasada(m, true, true), true, false), false, true), false, false);
    for (let i = 0; i < n; i++) if (!(m[i] || cerrado[i])) d[i * 4 + 3] = 0;
    g.putImageData(im, 0, 0);
  }

  // ---------- acceso común ----------
  function fuente(src) {   // imagen o lienzo listo para drawImage
    if (src && src.startsWith('gen:')) { const k = src.slice(4); return gen[k] || (gen[k] = GEN[k] ? GEN[k]() : GEN.concreto()); }
    return cargar(src);
  }
  const respaldo = { 'textures/suelos/ladrillo.png': 'suelo_ladrillo', 'textures/suelos/techo.png': 'techo', 'textures/suelos/concreto.png': 'concreto' };
  let avisoPix = false;
  function pixeles(src) {   // píxeles de una textura de suelo/techo (TS × TS); null mientras carga
    if (pix[src]) return pix[src];
    const d = fuente(src);
    const leer = dib => {
      const c = document.createElement('canvas'); c.width = c.height = TS;
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(dib, 0, 0, TS, TS);
      return new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer);
    };
    const gen2 = () => leer(fuente('gen:' + (respaldo[src] || 'concreto')));
    if (!lista(d)) return d.complete ? (pix[src] = gen2()) : null;   // imagen rota → textura de respaldo
    try { return pix[src] = leer(d); }
    catch (e) {
      if (!avisoPix) { avisoPix = true; console.warn('Suelo/techo con textura de respaldo (abre el proyecto con Live Server para usar los PNG):', src); }
      return pix[src] = gen2();
    }
  }
  const sombras = new WeakMap();
  function sombreado(d, f, col) {   // versión oscurecida de un sprite (f de 0 a 1), guardada en caché
    const k = Math.round(f * 10); if (k <= 0) return d;
    let m = sombras.get(d); if (!m) sombras.set(d, m = {});
    const clave = k + col;
    if (m[clave]) return m[clave];
    const c = document.createElement('canvas'); c.width = ancho(d); c.height = alto(d);
    const g = c.getContext('2d'); g.drawImage(d, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${col},${k / 10})`; g.fillRect(0, 0, c.width, c.height);
    return m[clave] = c;
  }
  return { TS, rgba, cargar, fuente, lista, ancho, alto, pixeles, cielo, arma, jefe, sombreado };
})();
