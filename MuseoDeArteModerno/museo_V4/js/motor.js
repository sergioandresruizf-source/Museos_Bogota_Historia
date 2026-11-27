// Motor estilo DOOM (raycasting con puertas que suben, luces por sala, cielo y "view bobbing").
// Normalmente no necesitas tocar este archivo: los mapas y textos están en js/nivel.js y los ajustes en js/config.js.
(() => {
  const C = CONFIG, N = NIVEL, R = RECURSOS, S = SONIDO;
  const $ = id => document.getElementById(id);
  const W = C.ancho, H = C.alto, HZ = H / 2, HM = C.alturaTecho;
  const TF = Math.tan(C.fov / 2), F = (W / 2) / TF;          // distancia focal en píxeles (píxeles cuadrados)
  const cv = $('pantalla'), ctx = cv.getContext('2d');
  cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false;
  const norm = a => Math.atan2(Math.sin(a), Math.cos(a));
  const cacheDom = {};
  const poner = (id, prop, v) => { const k = id + prop; if (cacheDom[k] !== v) { cacheDom[k] = v; $(id)[prop] = v; } };   // evita reescribir el DOM cada fotograma
  const tactil = C.controlesTactiles === true || (C.controlesTactiles !== false && (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)) || /[?&]tactil/.test(location.search);
  const p = { x: 0, y: 0, a: 0, vx: 0, vy: 0, eh: C.alturaOjos, bob: 0, fase: 0, vel: 0 };
  const teclas = {}, joy = { x: 0, y: 0 };
  let piso = 0, pisoMapa = 0, modo = '', D = null, G = null, MW = 0, MH = 0, OBJ = [], objetivo = null, tiempo = 0;

  // ---------- texturas de suelo y techo (por casilla) ----------
  const fuenteTex = nombre => N.texturas[(N.superficies || {})[nombre] || nombre] || nombre;
  const superficies = [];   // lista de rutas; cada casilla guarda un índice
  const indiceSup = src => { let i = superficies.indexOf(src); if (i < 0) { i = superficies.length; superficies.push(src); } return i; };
  const NIEBLA0 = [0, 0, 0];

  // ---------- preparación de cada piso (salas por casilla, puertas, luces) ----------
  const pisosD = N.pisos.map((P, i) => {
    const mh = P.mapa.length, mw = P.mapa[0].length, n = mw * mh;
    const sala = new Int16Array(n).fill(-1), suelo = new Int16Array(n), techo = new Int16Array(n);
    const esSolido = (x, y) => x < 0 || y < 0 || x >= mw || y >= mh || !!N.leyenda[P.mapa[y][x]];
    const puertas = {};
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const k = y * mw + x, s = P.salas.findIndex(s => s.r.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d));
      sala[k] = s;
      const S0 = s >= 0 ? P.salas[s] : {};
      suelo[k] = indiceSup(fuenteTex(S0.suelo || P.suelo || N.suelo));
      const tn = S0.techo || P.techo || N.techo;
      techo[k] = S0.cielo ? -1 : indiceSup(fuenteTex(tn === 'techo' && x % 3 === 1 && y % 3 === 1 ? 'luz' : tn));
      const L = N.leyenda[P.mapa[y][x]];
      if (L && L.puerta) puertas[k] = { x, y, k, L, eje: esSolido(x, y - 1) && esSolido(x, y + 1) ? 'x' : 'y', secreta: L.puerta === 'secreta',
        alto: L.alto || HM, abierto: 0, estado: 'cerrada', t: 0 };
    }
    const luzBase = P.salas.map(s => s.luz || 1), niebla = P.salas.map(s => s.niebla || NIEBLA0);
    return { P, i, mw, mh, sala, suelo, techo, puertas, luzBase, luz: Float32Array.from(luzBase), niebla, ultimaSala: -1 };
  });
  const salaEn = (x, y) => { if (x < 0 || y < 0 || x >= MW || y >= MH) return null; const s = D.sala[(y | 0) * MW + (x | 0)]; return s >= 0 ? D.P.salas[s] : null; };
  const luzEn = (x, y) => { if (x < 0 || y < 0 || x >= MW || y >= MH) return 1; const s = D.sala[(y | 0) * MW + (x | 0)]; return s >= 0 ? D.luz[s] : 1; };
  const nieblaEn = (x, y) => { if (x < 0 || y < 0 || x >= MW || y >= MH) return NIEBLA0; const s = D.sala[(y | 0) * MW + (x | 0)]; return s >= 0 ? D.niebla[s] : NIEBLA0; };
  const factorDist = d => 1 - (1 - C.luzMinima) * Math.min(1, d / C.niebla);

  // ---------- casillas y puertas ----------
  const leyendaEn = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? N.leyenda['#'] : N.leyenda[G[y][x]];
  const puertaEn = (x, y) => D.puertas[y * MW + x];
  const pasable = pu => pu.abierto * pu.alto > 0.62;
  function bloquea(cx, cy) {   // ¿la casilla impide pasar? (muros y puertas cerradas)
    const L = leyendaEn(cx, cy); if (!L) return false;
    if (L.puerta) { const pu = puertaEn(cx, cy); return !(pu && pasable(pu)); }
    return true;
  }
  function usarPuerta(pu) {
    if (pu.secreta || pu.estado === 'abriendo' || pu.estado === 'abierta') return;
    pu.estado = 'abriendo'; S.sonar('puerta', { x: pu.x + .5, y: pu.y + .5, jugador: p });
  }
  function abrirSecretas(D2, conSonido) {   // la "%" del piso se abre (al completarlo)
    for (const pu of Object.values(D2.puertas)) if (pu.secreta && pu.estado === 'cerrada') {
      pu.estado = 'abriendo'; if (conSonido) S.sonar('secreta', { x: pu.x + .5, y: pu.y + .5, jugador: p });
    }
  }
  function actualizarPuertas(dt, ocupadas) {
    for (const pu of Object.values(D.puertas)) {
      const vel = pu.secreta ? .45 : 1.6;
      if (pu.estado === 'abriendo') { pu.abierto = Math.min(1, pu.abierto + dt * vel); if (pu.abierto >= 1) { pu.estado = 'abierta'; pu.t = C.puertaAbierta; } }
      else if (pu.estado === 'abierta' && !pu.secreta) {
        pu.t -= dt;
        if (pu.t <= 0 && !ocupadas(pu)) { pu.estado = 'cerrando'; S.sonar('puertaCierra', { x: pu.x + .5, y: pu.y + .5, jugador: p }); }
      } else if (pu.estado === 'cerrando') {
        if (ocupadas(pu)) { pu.estado = 'abriendo'; continue; }   // como en DOOM: si algo la bloquea, vuelve a subir
        pu.abierto = Math.max(0, pu.abierto - dt * vel); if (pu.abierto <= 0) pu.estado = 'cerrada';
      }
    }
  }

  // ---------- RAYOS: DDA que atraviesa puertas (dintel, hoja y jambas) ----------
  const MAXG = 16, golpes = Array.from({ length: MAXG }, () => ({}));
  let nG = 0, cierraEn = 1e9;
  function golpe(d, wx, lado, tipo, L, z0, z1, luzK, extra) {
    if (nG >= MAXG) return;
    const g = golpes[nG++]; g.d = d; g.wx = wx; g.lado = lado; g.tipo = tipo; g.L = L; g.z0 = z0; g.z1 = z1; g.luzK = luzK; g.pu = extra || null;
  }
  const texU = (lado, d, dx, dy) => {   // coordenada horizontal de textura en una cara
    let u = lado ? p.x + d * dx : p.y + d * dy; u -= Math.floor(u);
    return (lado === 0 && dx > 0) || (lado === 1 && dy < 0) ? 1 - u : u;
  };
  function caraPuerta(pu, dEntr, lado, dx, dy, ddx, ddy, sdx, sdy, luzK) {
    // entrada: dintel; plano de la hoja (en el medio, o a ras del muro si es secreta); salida: dintel trasero
    if (pu.secreta && pu.abierto <= 0) {   // cerrada, la puerta secreta es un muro más (idéntico a los de al lado)
      golpe(dEntr, texU(lado, dEntr, dx, dy), lado, 0, N.leyenda['#'], 0, HM, luzK, null); return 2;
    }
    const ejeX = pu.eje === 'x', lad = ejeX ? 0 : 1, dd = ejeX ? ddx : ddy, sdLado = ejeX ? sdy : sdx;
    const L = pu.L, r = pu.abierto * pu.alto;
    if (pu.alto < HM) golpe(dEntr, texU(lad, dEntr, dx, dy), lad, 1, L, pu.alto, HM, luzK, pu);
    const tP = dEntr + (pu.secreta ? 0 : .5) * dd;
    let cerrada = false;
    if (tP < sdLado && r < pu.alto) { golpe(tP, texU(lad, tP, dx, dy), lad, 2, L, r, pu.alto, luzK, pu); cerrada = r <= .001; }
    const tS = dEntr + dd;
    if (tS < sdLado && pu.alto < HM) golpe(tS, texU(lad, tS, dx, dy), lad, 1, L, pu.alto, HM, luzK, pu);
    if (cerrada) cierraEn = Math.min(cierraEn, tP);
    return cerrada ? 1 : 0;
  }
  function lanzar(ang, maxD = 64) {
    nG = 0; cierraEn = 1e9;
    const dx = Math.cos(ang), dy = Math.sin(ang), ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
    let mx = Math.floor(p.x), my = Math.floor(p.y), lado = 0;
    const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
    let sdx = (dx < 0 ? p.x - mx : mx + 1 - p.x) * ddx, sdy = (dy < 0 ? p.y - my : my + 1 - p.y) * ddy;
    let prevK = my * MW + mx, prevPuerta = puertaEn(mx, my) || null;
    if (prevPuerta) {   // estás dentro del hueco de una puerta abierta: solo su hoja y su dintel de salida
      const pu = prevPuerta, ejeX = pu.eje === 'x', r = pu.abierto * pu.alto;
      const plano = ejeX ? mx + .5 : my + .5, t = ejeX ? (plano - p.x) / dx : (plano - p.y) / dy;
      if (!pu.secreta && t > 0 && t < (ejeX ? sdy : sdx) && r < pu.alto) golpe(t, texU(ejeX ? 0 : 1, t, dx, dy), ejeX ? 0 : 1, 2, pu.L, r, pu.alto, prevK, pu);
      const tS = ejeX ? sdx : sdy;
      if (tS < (ejeX ? sdy : sdx) && pu.alto < HM) golpe(tS, texU(ejeX ? 0 : 1, tS, dx, dy), ejeX ? 0 : 1, 1, pu.L, pu.alto, HM, prevK, pu);
    }
    let trasCerrada = false;   // tras una puerta cerrada solo falta su jamba (si el rayo sale por un lado)
    for (let i = 0; i < 128; i++) {
      let dEntr;
      if (sdx < sdy) { dEntr = sdx; sdx += ddx; mx += sx; lado = 0; } else { dEntr = sdy; sdy += ddy; my += sy; lado = 1; }
      if (dEntr > maxD || mx < 0 || my < 0 || mx >= MW || my >= MH) break;
      const k = my * MW + mx, L = N.leyenda[G[my][mx]];
      if (!L) { if (trasCerrada) break; prevK = k; prevPuerta = null; continue; }
      if (L.puerta) {
        if (trasCerrada) break;
        const pu = D.puertas[k], cara = pu ? caraPuerta(pu, dEntr, lado, dx, dy, ddx, ddy, sdx, sdy, prevK) : 0;
        if (cara === 2) break;
        if (cara === 1) trasCerrada = true;
        prevPuerta = pu; continue;   // la luz sigue siendo la de la sala de antes
      }
      // muro: si venimos del hueco de una puerta y la cara es lateral, es la jamba ("marco")
      const jamba = prevPuerta && ((prevPuerta.eje === 'x') === (lado === 1));
      golpe(dEntr, texU(lado, dEntr, dx, dy), lado, 0, jamba ? { textura: prevPuerta.L.marco || 'marco', zocalo: false } : L, 0, HM, prevK, null);
      break;
    }
    return nG;
  }

  // ---------- dibujo de columnas de pared ----------
  const buf = ctx.createImageData(W, H), buf32 = new Uint32Array(buf.data.buffer);
  const zbuf = new Float32Array(W), ocN = new Uint8Array(W), ocD = new Float32Array(W * 4), ocY = new Float32Array(W * 4);
  const colAng = new Float32Array(W), colCos = new Float32Array(W), cieloCol = new Int32Array(W);
  for (let x = 0; x < W; x++) { const rel = Math.atan((2 * (x + .5) / W - 1) * TF); colAng[x] = rel; colCos[x] = Math.cos(rel); }
  const texDe = nombre => R.fuente(N.texturas[nombre] || N.texturas.yeso);
  function tramo(img, u, x, base, lh, zA, zB, vA, vB) {   // pinta la textura entre las alturas zA (abajo, fila vA) y zB (arriba, fila vB)
    const Y0 = base - zB * lh, Y1 = base - zA * lh, span = Y1 - Y0;
    const c0 = Math.max(0, Y0), c1 = Math.min(H, Y1); if (c1 - c0 < .01 || span <= 0) return;
    if (!R.lista(img)) { ctx.fillStyle = '#d8d4cc'; ctx.fillRect(x, c0, 1, c1 - c0); return; }
    const iw = R.ancho(img), ih = R.alto(img), t0 = (c0 - Y0) / span, t1 = (c1 - Y0) / span;
    const s0 = (vB + (vA - vB) * t0) * ih, s1 = (vB + (vA - vB) * t1) * ih;
    ctx.drawImage(img, Math.min(iw - 1, Math.max(0, Math.floor(u * iw))), s0, 1, Math.max(.01, s1 - s0), x, c0, 1, c1 - c0);
  }
  function mosaico(img, u, x, base, lh, zA, zB) {   // repite la textura cada 1 de alto (anclada al suelo)
    for (let k = Math.floor(zA); k < zB - 1e-6; k++) {
      const a = Math.max(zA, k), b = Math.min(zB, k + 1);
      if (b > a) tramo(img, u, x, base, lh, a, b, k + 1 - a, k + 1 - b);
    }
  }
  const estilos = {};
  function sombra(x, y0, y1, osc, col) {   // oscurece la columna hacia el color de la niebla
    const k = Math.round(osc * 40); if (k <= 0) return;
    const c0 = Math.max(0, y0), c1 = Math.min(H, y1); if (c1 <= c0) return;
    const clave = col.join(',') + '|' + k;
    ctx.fillStyle = estilos[clave] || (estilos[clave] = `rgba(${col.join(',')},${k / 40})`);
    ctx.fillRect(x, c0, 1, c1 - c0);
  }
  let cielo = null;
  function columnaPared(x, g, eh) {
    const d = Math.max(.02, g.d * colCos[x]), lh = F / d, base = HZ + eh * lh, L = g.L;
    const sk = D.sala[g.luzK], luz = (sk >= 0 ? D.luz[sk] : 1) * factorDist(d) * (g.lado ? .9 : 1);
    const col = sk >= 0 ? D.niebla[sk] : NIEBLA0, z0 = g.z0, z1 = g.z1;
    if (g.tipo === 0) {
      const img = texDe(L.textura);
      if (L.ventana && cielo) {   // la ciudad se ve a través del vidrio
        const c0 = Math.max(0, base - HM * lh), c1 = Math.min(H, base);
        if (c1 > c0) ctx.drawImage(cielo.c, cieloCol[x], c0 * cielo.h / H, 1, (c1 - c0) * cielo.h / H, x, c0, 1, c1 - c0);
      }
      if (L.estirar) tramo(img, g.wx, x, base, lh, 0, HM, 1, 0);
      else if (L.interaccion) { tramo(img, g.wx, x, base, lh, 0, 1, 1, 0); mosaico(texDe(L.superior || C.texturaSuperior), g.wx, x, base, lh, 1, HM); }
      else mosaico(img, g.wx, x, base, lh, 0, HM);
      if (L.zocalo !== false && lh > 6) {   // zócalo oscuro y moldura arriba
        const zh = Math.max(1, .055 * lh);
        ctx.fillStyle = '#4b463f'; ctx.fillRect(x, base - zh, 1, zh);
        if (zh > 3) { ctx.fillStyle = '#8b857a'; ctx.fillRect(x, base - zh, 1, 1); }
        ctx.fillStyle = '#bdb7ab'; ctx.fillRect(x, base - HM * lh, 1, Math.max(1, .018 * lh));
      }
      sombra(x, base - HM * lh, base, 1 - Math.min(1, luz), col);
    } else if (g.tipo === 1) {   // dintel sobre la puerta (o parte alta de la puerta secreta)
      mosaico(texDe(g.pu && g.pu.secreta ? g.pu.L.textura : 'yeso'), g.wx, x, base, lh, z0, z1);
      sombra(x, base - z1 * lh, base - z0 * lh, 1 - Math.min(1, luz), col);
    } else {   // hoja de la puerta: sube hacia el dintel (la textura va pegada a su borde de abajo)
      const pu = g.pu, r = pu.abierto * pu.alto;
      tramo(texDe(pu.L.textura), g.wx, x, base, lh, z0, z1, 1, r / pu.alto);
      if (pu.secreta && lh > 6) { const zh = Math.max(1, .055 * lh); ctx.fillStyle = '#4b463f'; ctx.fillRect(x, base - z0 * lh - zh, 1, zh); }   // su zócalo sube con ella
      sombra(x, base - z1 * lh, base - z0 * lh, 1 - Math.min(1, luz), col);
    }
    return { d, yb: base - z0 * lh };
  }

  // ---------- suelo y techo (píxel a píxel, con textura y luz por casilla; cielo en los patios) ----------
  function suelosYTechos(eh) {
    const texs = superficies.map(s => R.pixeles(s)), TS = R.TS, M = TS - 1;
    const dx = Math.cos(p.a), dy = Math.sin(p.a), px = -dy * TF, py = dx * TF;
    const sala = D.sala, suelo = D.suelo, techo = D.techo, luzS = D.luz, nieS = D.niebla;
    const sp = cielo && cielo.pix, sw = cielo ? cielo.w : 1, shh = cielo ? cielo.h : 1;
    for (let y = 0; y < H; y++) {
      const abajo = y >= HZ, fila = y * W, dy0 = Math.abs(y + .5 - HZ);
      const dist = (abajo ? eh : HM - eh) * F / dy0, df = factorDist(dist);
      let fx = p.x + (dx - px) * dist, fy = p.y + (dy - py) * dist;
      const stx = 2 * px * dist / W, sty = 2 * py * dist / W, filaCielo = Math.min(shh - 1, (y * shh / H) | 0) * sw;
      for (let x = 0; x < W; x++, fx += stx, fy += sty) {
        const cx = Math.floor(fx), cy = Math.floor(fy);
        if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) { buf32[fila + x] = 0xff000000; continue; }
        const k = cy * MW + cx, ti = abajo ? suelo[k] : techo[k];
        if (ti < 0) { buf32[fila + x] = sp ? sp[filaCielo + cieloCol[x]] : 0xffe0c090; continue; }   // cielo abierto
        const tex = texs[ti]; if (!tex) { buf32[fila + x] = 0xff606060; continue; }
        const c = tex[((fy * TS) & M) * TS + ((fx * TS) & M)], s = sala[k];
        let b = df * (s >= 0 ? luzS[s] : 1); if (b > 1) b = 1;
        const sh = (b * 256) | 0, ish = 256 - sh, n = s >= 0 ? nieS[s] : NIEBLA0;
        buf32[fila + x] = 0xff000000 | ((((c >> 16) & 255) * sh + n[2] * ish) >> 8) << 16 | ((((c >> 8) & 255) * sh + n[1] * ish) >> 8) << 8 | (((c & 255) * sh + n[0] * ish) >> 8);
      }
    }
    ctx.putImageData(buf, 0, 0);
  }

  // ---------- sprites (objetos, jefe, proyectiles...) ----------
  const spriteDe = nombre => { const s = N.sprites[nombre]; return typeof s === 'string' ? { src: s } : s || {}; };
  function dibujarSprites(cosas, eh) {
    const lista = [];
    for (const o of cosas) {
      const dx = o.x - p.x, dy = o.y - p.y, d = Math.hypot(dx, dy), rel = norm(Math.atan2(dy, dx) - p.a), pd = d * Math.cos(rel);
      if (pd < .25 || Math.abs(rel) > C.fov / 2 + .6) continue;
      lista.push({ o, pd });
    }
    lista.sort((a, b) => b.pd - a.pd);
    for (const { o, pd } of lista) {
      const img = o.img; if (!img || !R.lista(img)) continue;
      const iw = R.ancho(img), ih = R.alto(img), alto = o.alto, ancho = o.ancho || alto * iw / ih;
      const rel = norm(Math.atan2(o.y - p.y, o.x - p.x) - p.a), cx = W / 2 + Math.tan(rel) * F;
      const h = alto * F / pd, w = ancho * F / pd, yb = HZ + (eh - (o.z || 0)) * F / pd, yt = yb - h;
      if (yb < 0 || yt > H) continue;
      const luz = o.brillo ? 1 : Math.min(1, luzEn(o.x, o.y) * factorDist(pd));
      const dib = o.brillo || luz > .97 ? img : R.sombreado(img, 1 - luz, nieblaEn(o.x, o.y).join(','));
      const x0 = Math.max(0, Math.floor(cx - w / 2)), x1 = Math.min(W, Math.ceil(cx + w / 2));
      if (o.alfa != null) ctx.globalAlpha = o.alfa;
      for (let x = x0; x < x1; x++) {
        if (pd >= zbuf[x]) continue;
        let top = yt;
        for (let k = 0; k < ocN[x]; k++) if (ocD[x * 4 + k] < pd && ocY[x * 4 + k] > top) top = ocY[x * 4 + k];
        const c0 = Math.max(0, top), c1 = Math.min(H, yb); if (c1 <= c0) continue;
        let u = (x + .5 - (cx - w / 2)) / w; if (o.espejo) u = 1 - u;
        const sx = Math.max(0, Math.min(iw - 1, Math.floor(u * iw)));
        ctx.drawImage(dib, sx, (c0 - yt) / h * ih, 1, (c1 - c0) / h * ih, x, c0, 1, c1 - c0);
      }
      if (o.alfa != null) ctx.globalAlpha = 1;
    }
  }

  // ---------- render completo ----------
  function dibujar() {
    D.luz.forEach((_, s) => {   // luz de cada sala (con parpadeo estilo DOOM donde toca)
      const S0 = D.P.salas[s]; let l = D.luzBase[s];
      if (S0.efecto === 'parpadeo') { const t = tiempo * 7.3, v = Math.sin(t) + Math.sin(t * 2.71 + 1) + Math.sin(t * 5.13); l *= v > 2.1 ? .7 : v < -2.2 ? .82 : 1; }
      D.luz[s] = l;
    });
    cielo = R.cielo();
    for (let x = 0; x < W; x++) { const a = p.a + colAng[x]; cieloCol[x] = ((Math.floor((a / Math.PI) * cielo.w) % cielo.w) + cielo.w) % cielo.w; }
    const eh = p.eh + CB.ajusteOjos();
    suelosYTechos(eh);
    for (let x = 0; x < W; x++) {
      const n = lanzar(p.a + colAng[x]);
      zbuf[x] = cierraEn * colCos[x]; ocN[x] = 0;
      for (let k = n - 1; k >= 0; k--) {
        const g = golpes[k], r = columnaPared(x, g, eh);
        if (g.tipo === 0) zbuf[x] = Math.min(zbuf[x], r.d);
        else if (ocN[x] < 4) { ocD[x * 4 + ocN[x]] = r.d; ocY[x * 4 + ocN[x]] = r.yb; ocN[x]++; }
      }
      if (!n) zbuf[x] = 1e9;
    }
    dibujarSprites(OBJ.concat(CB.cosas()), eh);
    CB.dibujar(ctx, eh);
  }

  // ---------- objetos del piso ----------
  function crearCosa(o) {
    const s = spriteDe(o.sprite);
    return { x: o.x, y: o.y, img: R.fuente(s.src), alto: (s.alto || .8) * (o.escala || 1), ancho: s.ancho, brillo: !!s.brillo,
      solido: o.solido != null ? o.solido : (s.solido || 0), interaccion: o.interaccion, pista: o.pista, z: o.z || 0 };
  }
  const objetosPiso = N.pisos.map(P => (P.objetos || []).filter(o => !o.tipo).map(crearCosa));

  // ---------- ¿qué hay delante al alcance? (obra, placa, puerta, objeto) ----------
  function buscarObjetivo() {
    objetivo = null;
    const n = lanzar(p.a, C.alcance + 1); let muro = 1e9;
    for (let k = 0; k < n; k++) {
      const g = golpes[k];
      if (g.tipo === 0) { muro = g.d; if (g.L.interaccion && g.d < C.alcance) objetivo = { id: g.L.interaccion, pista: g.L.pista }; break; }
      if (g.pu && !pasable(g.pu)) { muro = g.d; if (!g.pu.secreta && g.d < C.alcance) objetivo = { puerta: g.pu, pista: g.pu.L.pista || 'Abrir puerta' }; break; }
    }
    let mejor = Math.min(C.alcance, muro);
    for (const o of OBJ) {
      if (!o.interaccion) continue;
      const d = Math.hypot(o.x - p.x, o.y - p.y), rel = norm(Math.atan2(o.y - p.y, o.x - p.x) - p.a);
      if (d < mejor && Math.abs(rel) < Math.atan(.45 / d) + .05) { mejor = d; objetivo = { id: o.interaccion, pista: o.pista }; }
    }
    poner('pista', 'textContent', objetivo && !modo ? `${tactil ? '' : '[E] '}${objetivo.pista || C.textoPista}` : '');
  }

  // ---------- movimiento estilo DOOM: inercia, correr, deslizarse por los muros, balanceo ----------
  function libre(x, y, r) {
    for (let cy = Math.floor(y - r); cy <= Math.floor(y + r); cy++)
      for (let cx = Math.floor(x - r); cx <= Math.floor(x + r); cx++) if (bloquea(cx, cy)) return false;
    return true;
  }
  function empujar(cuerpo, r, solidos) {   // separa al jugador de objetos sólidos (estatuas, bancas, el jefe...)
    for (const o of solidos) {
      const rs = o.solido; if (!rs) continue;
      const dx = cuerpo.x - o.x, dy = cuerpo.y - o.y, d = Math.hypot(dx, dy), m = r + rs;
      if (d < m && d > 1e-4) {
        const nx = cuerpo.x + dx / d * (m - d), ny = cuerpo.y + dy / d * (m - d);
        if (libre(nx, cuerpo.y, r)) cuerpo.x = nx;
        if (libre(cuerpo.x, ny, r)) cuerpo.y = ny;
      }
    }
  }
  function actualizarMovimiento(dt) {
    const vivo = CB.puedeMoverse();
    const f = vivo ? Math.max(-1, Math.min(1, (teclas.KeyW || teclas.ArrowUp ? 1 : 0) - (teclas.KeyS || teclas.ArrowDown ? 1 : 0) - joy.y)) : 0;
    // A/D o , y . = paso lateral (como en DOOM); flechas = girar
    let l = vivo ? (teclas.KeyD || teclas.Period ? 1 : 0) - (teclas.KeyA || teclas.Comma ? 1 : 0) + joy.x : 0;
    l = Math.max(-1, Math.min(1, l));
    if (vivo) { const gi = C.giro * dt * (teclas.ShiftLeft || teclas.ShiftRight ? 1.4 : 1); if (teclas.ArrowLeft) p.a -= gi; if (teclas.ArrowRight) p.a += gi; }
    const mag = Math.min(1, Math.hypot(f, l)), corre = teclas.ShiftLeft || teclas.ShiftRight || (tactil && Math.hypot(joy.x, joy.y) > .92);
    const vmax = C.velocidad * (corre ? C.correr : 1) * mag;
    let wx = 0, wy = 0;
    if (mag > .01) { const k = 1 / Math.hypot(f, l); wx = (Math.cos(p.a) * f - Math.sin(p.a) * l) * k * vmax; wy = (Math.sin(p.a) * f + Math.cos(p.a) * l) * k * vmax; }
    const kk = 1 - Math.exp(-(mag > .01 ? C.aceleracion : C.frenado) * dt);
    p.vx += (wx - p.vx) * kk; p.vy += (wy - p.vy) * kk;
    const r = C.radio, mx = p.vx * dt, my = p.vy * dt;
    if (libre(p.x + mx, p.y, r)) p.x += mx; else p.vx = 0;
    if (libre(p.x, p.y + my, r)) p.y += my; else p.vy = 0;
    empujar(p, r, OBJ.concat(CB.solidos()));
    // view bobbing: como en DOOM la amplitud crece con la velocidad (al cuadrado) y la fase avanza con el tiempo
    const v = Math.hypot(p.vx, p.vy); p.vel = v;
    const amp = Math.min(1, (v / C.velocidad) ** 2);
    p.fase += dt * (5.6 + 2.2 * Math.min(1, v / (C.velocidad * C.correr)));
    p.bob += (amp - p.bob) * Math.min(1, dt * 10);
    p.eh = C.alturaOjos + Math.sin(p.fase * 2) * C.balanceo * p.bob;
  }

  // ---------- progreso: obras vistas (contador del museo y del piso) y pisos a los que te lleva el elevador ----------
  // Una obra cuenta como vista al abrirla. El elevador te lleva al siguiente piso del recorrido (N.recorrido)
  // cuando en el anterior has visto al menos C.umbralPiso de sus obras o su obra "principal".
  const vistas = new Set(), pct = Math.round(C.umbralPiso * 100), orden = N.recorrido || N.pisos.map((_, i) => i);
  const obrasPiso = N.pisos.map(P => [...new Set([...P.mapa.join('')].map(ch => N.leyenda[ch]).filter(L => L && L.obra).map(L => L.interaccion))]);
  const esObra = new Set(obrasPiso.flat()), totalObras = esObra.size;
  const vistasEn = i => obrasPiso[i].filter(id => vistas.has(id)).length;
  const meta = i => Math.ceil(obrasPiso[i].length * C.umbralPiso - 1e-9);   // 65 % de 15 = 9,75 → 10 obras
  const principales = i => [].concat(N.pisos[i].principal || []);
  const superado = i => vistasEn(i) >= meta(i) || principales(i).some(id => vistas.has(id));
  const siguiente = i => { const k = orden.indexOf(i); return k >= 0 && k + 1 < orden.length ? orden[k + 1] : -1; };
  const abierto = i => orden.indexOf(i) < 0 || orden.slice(0, orden.indexOf(i)).every(j => superado(j));
  const faltan = i => { const n = meta(i) - vistasEn(i); return n === 1 ? 'falta 1 obra' : `faltan ${n} obras`; };
  const tieneSecreta = i => Object.values(pisosD[i].puertas).some(pu => pu.secreta);
  N.pisos.forEach((P, i) => principales(i).forEach(id => obrasPiso[i].includes(id) || console.warn(`La obra principal "${id}" no está en el mapa de ${P.nombre}`)));
  function actualizarContador() {   // HUD: obras vistas en el museo y en el piso actual
    const v = vistasEn(piso), t = obrasPiso[piso].length, m = meta(piso), s = siguiente(piso), ok = superado(piso);
    $('c-total').textContent = `${vistas.size} / ${totalObras}`;
    $('c-nombre').textContent = N.pisos[piso].nombre; $('c-piso').textContent = `${v} / ${t}`;
    $('c-relleno').style.width = (t ? 100 * v / t : 100) + '%'; $('c-marca').style.left = (t ? 100 * m / t : 0) + '%';
    $('contador').classList.toggle('ok', ok);
    $('c-estado').textContent = orden.indexOf(piso) < 0 ? '' : ok ? (s >= 0 ? `✓ ${N.pisos[s].nombre} desbloqueado` : '✓ Recorrido completado')
      : `${s >= 0 ? `🔒 ${N.pisos[s].nombre}: ` : 'Para terminar: '}${faltan(piso)} o la obra principal`;
  }
  let pendiente = null, secretaPendiente = -1;   // aviso que aparece al cerrar la obra recién vista
  function ver(id) {   // primera vez que abres una obra: +1 en el contador del museo y en el del piso
    if (!esObra.has(id) || vistas.has(id)) return;
    const antes = orden.map(i => superado(i)); vistas.add(id);
    const nuevos = orden.filter((i, k) => !antes[k] && superado(i));
    const msj = nuevos.map(i => {
      const s = siguiente(i), P = N.pisos[i];
      return (principales(i).includes(id) ? `★ Obra principal del ${P.nombre}. ` : `Has visto el ${pct} % de las obras del ${P.nombre}. `)
        + (s >= 0 ? `¡${N.pisos[s].nombre} desbloqueado! Ve al elevador.` : '¡Recorrido completado!');
    });
    for (const i of nuevos) if (tieneSecreta(i)) { secretaPendiente = i; msj.push('Se oye un mecanismo pesado en la Sala de Cine…'); }
    if (vistas.size === totalObras) msj.push(`¡Has visto las ${totalObras} obras del museo!`);
    pendiente = msj.join('\n'); actualizarContador();
  }
  let tAviso = 0;
  function aviso(txt, seg = 6) {   // mensaje temporal en pantalla
    const a = $('aviso'); a.textContent = txt; a.hidden = false;
    clearTimeout(tAviso); tAviso = setTimeout(() => { a.hidden = true; }, seg * 1000);
  }
  let tMsj = 0;
  function mensaje(txt) {   // mensajes cortos arriba a la izquierda (como "Has recogido un botiquín" en DOOM)
    const m = $('mensajes'); m.textContent = txt; m.hidden = false;
    clearTimeout(tMsj); tMsj = setTimeout(() => { m.hidden = true; }, 3000);
  }
  function textoElevador() {   // qué falta para desbloquear el siguiente piso del recorrido
    const f = orden.find(i => !superado(i)), s = f === undefined ? -1 : siguiente(f);
    return '¿A qué piso quieres ir?' + (s < 0 ? '' : `\n\nPara desbloquear el ${N.pisos[s].nombre} tienes que ver al menos ${meta(f)} de las ` +
      `${obrasPiso[f].length} obras del ${N.pisos[f].nombre} (el ${pct} %) o su obra principal. Llevas ${vistasEn(f)}.`);
  }

  function irAPiso(i) {   // cambia de piso y te deja frente al elevador ("E") de ese piso
    piso = i; D = pisosD[i]; G = D.P.mapa.map(f => [...f]); MW = D.mw; MH = D.mh; OBJ = objetosPiso[i];
    for (const pu of Object.values(D.puertas)) if (!pu.secreta) { pu.abierto = 0; pu.estado = 'cerrada'; }   // la secreta recuerda si ya se abrió
    CB.entrarPiso(i); actualizarContador(); D.ultimaSala = -1;
    p.vx = p.vy = 0;
    for (let y = 0; y < G.length; y++) for (let x = 0; x < G[y].length; x++) if (G[y][x] === 'E')
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]])
        if (!bloquea(x + dx, y + dy)) { p.x = x + dx + .5; p.y = y + dy + .5; p.a = Math.atan2(dy, dx); return; }
  }

  // --- audio: música por sala + sonido del elevador (el navegador exige una primera tecla/clic) ---
  const musica = new Audio(), sfx = new Audio(N.sonidoElevador); let audioOk = false, silencio = false; musica.loop = false;
  let pista = 0, musAct = null, musForzada = null; musica.onended = () => { pista++; sonar(); };
  function sonar() {
    const l = [].concat(musForzada || musAct || N.pisos[piso].musica || []), src = l[pista % l.length]; if (!audioOk || !src || !sfx.paused) return;
    if (!musica.src.endsWith(src)) musica.src = src;
    musica.volume = C.volumenMusica; musica.play().catch(() => {});
  }
  function forzarMusica(lista) { musForzada = lista; pista = 0; musica.pause(); musica.removeAttribute('src'); sonar(); }
  function viaje() {
    musica.pause(); pista = 0; if (!audioOk) return;
    sfx.volume = C.volumenEfectos; sfx.currentTime = 0; sfx.onended = sonar; sfx.play().catch(sonar);
  }
  const iniciarAudio = () => { S.iniciar(); if (!audioOk) { audioOk = true; sonar(); } };
  function botones(id, activo, fn, elevador) {   // un botón por piso con sus obras vistas; en el elevador, 🔒 = bloqueado
    const c = $(id); c.innerHTML = '';
    N.pisos.forEach((P, i) => {
      const b = document.createElement('button'), bloq = elevador && !abierto(i);
      b.textContent = `${bloq ? '🔒 ' : ''}${i + 1} · ${P.nombre} · ${vistasEn(i)}/${obrasPiso[i].length}`;
      b.className = i === activo ? 'act' : bloq ? 'bloq' : ''; b.onclick = () => fn(i); c.appendChild(b);
    });
  }
  function ui(m, id) { modo = m; $(id).hidden = false; CB.gatillo(false); document.exitPointerLock && document.exitPointerLock(); }
  function abrir(id) {
    const el = id === 'elevador', i = el ? { titulo: 'Elevador', texto: textoElevador() } : N.interacciones[id];
    if (!i) return;
    $('p-titulo').textContent = i.titulo || ''; $('p-sub').textContent = i.subtitulo || ''; $('p-texto').textContent = i.texto || '';
    const im = $('p-img'); im.style.display = i.imagen ? 'inline-block' : 'none'; if (i.imagen) im.src = i.imagen;
    $('p-botones').innerHTML = ''; if (el) botones('p-botones', piso, elegir, true);
    ui(el ? 'elevador' : 'texto', 'panel'); ver(id);
  }
  const elegir = i => {
    if (!abierto(i)) return aviso(`🔒 El ${N.pisos[i].nombre} sigue bloqueado.`);
    cerrar(); if (i !== piso) { irAPiso(i); viaje(); }
  };
  const cerrar = () => {
    $('panel').hidden = $('mapa-ui').hidden = true; if (modo !== 'fin') modo = '';
    if (pendiente === null) return;   // acabas de ver una obra nueva: el contador parpadea y sale el aviso, si lo hay
    const c = $('contador'); c.classList.remove('sube'); void c.offsetWidth; c.classList.add('sube');
    if (pendiente) aviso(pendiente, secretaPendiente >= 0 ? 9 : 6); pendiente = null;
    if (secretaPendiente >= 0) { abrirSecretas(pisosD[secretaPendiente], secretaPendiente === piso); secretaPendiente = -1; }
  };

  // ---------- MAPA estilo DOOM (M o Tab). La sección secreta no aparece. ----------
  function abrirMapa() { pisoMapa = piso; ui('mapa', 'mapa-ui'); dibujarMapa(); }
  function dibujarMapa() {
    botones('m-tabs', pisoMapa, i => { pisoMapa = i; dibujarMapa(); });
    const Dm = pisosD[pisoMapa], P = Dm.P, M = P.mapa, c = $('m-canvas'), g = c.getContext('2d');
    const libreM = (x, y) => y >= 0 && x >= 0 && y < Dm.mh && x < Dm.mw && !N.leyenda[M[y][x]];
    const secreta = (x, y) => { const s = Dm.sala[y * Dm.mw + x]; return s >= 0 && P.salas[s].secreta; };
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < Dm.mh; y++) for (let x = 0; x < Dm.mw; x++) if (libreM(x, y) && !secreta(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    x0--; y0--; x1++; y1++;
    const cs = Math.floor(Math.min((c.width - 20) / (x1 - x0 + 1), (c.height - 44) / (y1 - y0 + 1)));
    const ox = (c.width - cs * (x1 - x0 + 1)) / 2 - x0 * cs, oy = (c.height - 34 - cs * (y1 - y0 + 1)) / 2 - y0 * cs;
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#141414'; g.lineWidth = 1;   // cuadrícula del automapa
    for (let x = x0; x <= x1 + 1; x++) { g.beginPath(); g.moveTo(ox + x * cs + .5, oy + y0 * cs); g.lineTo(ox + x * cs + .5, oy + (y1 + 1) * cs); g.stroke(); }
    for (let y = y0; y <= y1 + 1; y++) { g.beginPath(); g.moveTo(ox + x0 * cs, oy + y * cs + .5); g.lineTo(ox + (x1 + 1) * cs, oy + y * cs + .5); g.stroke(); }
    P.salas.forEach(s => { if (s.secreta) return; g.fillStyle = s.cielo ? 'rgba(60,110,190,.16)' : 'rgba(224,184,79,.07)'; s.r.forEach(([a, b, c2, d]) => g.fillRect(ox + a * cs, oy + b * cs, (c2 - a + 1) * cs, (d - b + 1) * cs)); });
    const seg = (ax, ay, bx, by, col, w = 2) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(ox + ax * cs, oy + ay * cs); g.lineTo(ox + bx * cs, oy + by * cs); g.stroke(); };
    for (let y = 0; y < Dm.mh; y++) for (let x = 0; x < Dm.mw; x++) {
      const L = N.leyenda[M[y][x]]; if (!L) continue;
      const pu = L.puerta && Dm.puertas[y * Dm.mw + x];
      if (pu && !pu.secreta) {   // puerta: línea amarilla
        if (pu.eje === 'x') seg(x + .5, y, x + .5, y + 1, '#e8d84a', 3); else seg(x, y + .5, x + 1, y + .5, '#e8d84a', 3);
        continue;
      }
      for (const [dx, dy, ax, ay, bx, by] of [[0, -1, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1], [-1, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 1]]) {
        const nx = x + dx, ny = y + dy;
        if (!libreM(nx, ny) && !(N.leyenda[(M[ny] || '')[nx]] || {}).puerta) continue;
        if (libreM(nx, ny) && secreta(nx, ny)) continue;
        const nL = N.leyenda[(M[ny] || '')[nx]];
        if (nL && nL.puerta) continue;
        let col = '#d23a2a', w = 2;
        if (L.obra) { col = vistas.has(L.interaccion) ? '#45d24a' : '#f2f2f2'; w = 4; }
        else if (M[y][x] === 'E') { col = '#e0b84f'; w = 5; }
        else if (L.ventana) col = '#6aa8ff';
        else if (L.interaccion) { col = '#8fd0ff'; w = 3; }
        seg(x + ax, y + ay, x + bx, y + by, col, w);
      }
    }
    g.font = `bold ${Math.max(10, Math.round(cs * .5))}px sans-serif`; g.textAlign = 'center';
    P.salas.forEach(s => {
      if (s.secreta) return;
      const [a, b, c2, d] = s.r[0], tx = ox + (a + c2 + 1) / 2 * cs, ty = oy + (b + d + 1) / 2 * cs;
      g.fillStyle = 'rgba(0,0,0,.7)'; const w = g.measureText(s.nombre).width; g.fillRect(tx - w / 2 - 4, ty - cs * .45, w + 8, cs * .65);
      g.fillStyle = '#e8e2d0'; g.fillText(s.nombre, tx, ty);
    });
    const enSecreto = pisoMapa === piso && (salaEn(p.x, p.y) || {}).secreta;
    if (pisoMapa === piso && !enSecreto) {   // tu posición (flecha blanca como en DOOM)
      g.save(); g.translate(ox + p.x * cs, oy + p.y * cs); g.rotate(p.a); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cs * .55, 0); g.lineTo(-cs * .35, -cs * .32); g.lineTo(-cs * .15, 0); g.lineTo(-cs * .35, cs * .32); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    g.textAlign = 'left'; g.font = '13px sans-serif'; let lx = 14; const ly = c.height - 14;
    for (const [col, t] of [['#45d24a', 'obra vista'], ['#f2f2f2', 'obra por ver'], ['#e8d84a', 'puerta'], ['#e0b84f', 'elevador'], ['#8fd0ff', 'placa'], ['#d23a2a', 'muro']]) {
      g.fillStyle = col; g.fillRect(lx, ly - 9, 14, 4); g.fillStyle = '#bbb'; g.fillText(t, lx + 18, ly - 3); lx += g.measureText(t).width + 40;
    }
    $('m-titulo').textContent = `Mapa · ${P.nombre}` + (enSecreto ? ' · ubicación desconocida' : '');
  }
  function salaActual() {
    const P = N.pisos[piso], k = D.sala[(p.y | 0) * MW + (p.x | 0)];
    if (k >= 0 && k !== D.ultimaSala) { D.ultimaSala = k; CB.entrarSala(P.salas[k]); }
    const s = D.ultimaSala >= 0 ? P.salas[D.ultimaSala] : null;   // en los pasos entre salas se mantiene la anterior
    poner('sala', 'textContent', P.nombre + (s ? ' · ' + (s.grupo ? s.grupo + ' · ' : '') + s.nombre : ''));
    const mus = (s && s.musica) || P.musica; if (mus !== musAct) { musAct = mus; pista = 0; if (!musForzada) sonar(); }   // la música cambia según la sala
    poner('contador', 'hidden', !!(s && s.secreta));
  }

  // ---------- combate (js/combate.js) ----------
  const CB = COMBATE({
    C, N, R, S, W, H, HZ, F, HM, p, ctx, tactil, $, norm,
    piso: () => piso, salaEn, luzEn, lanzar, golpes: () => golpes, bloquea, libre, empujar, aviso, mensaje, forzarMusica,
    pausado: () => !!modo, fin: () => { modo = 'fin'; document.exitPointerLock && document.exitPointerLock(); },
    seguir: () => { modo = ''; }, reiniciar: () => location.reload(), vistas: () => vistas.size, totalObras: () => totalObras
  });

  const accion = () => {
    if (modo === 'fin' || CB.usar()) return;
    if (!modo) { if (objetivo) { if (objetivo.puerta) usarPuerta(objetivo.puerta); else abrir(objetivo.id); } }
    else if (modo !== 'elevador') cerrar();
  };
  const alternarSonido = () => { silencio = !silencio; musica.muted = sfx.muted = silencio; S.silenciar(silencio); $('b-son').textContent = silencio ? '🔇' : '🔊'; };
  const alternarMapa = () => modo === 'mapa' ? cerrar() : modo ? 0 : abrirMapa();
  function iniciarTactil() {   // joystick (mover), arrastrar la pantalla (girar) y botones
    $('tactil').hidden = false; document.body.classList.add('tactil');
    const capturar = (el, id) => { try { el.setPointerCapture(id); } catch (e) { /* el dedo ya se levantó */ } };
    const base = $('joy'), knob = $('knob'); let id = null;
    const mover = e => {
      const r = base.getBoundingClientRect(), RR = r.width / 2;
      let dx = e.clientX - (r.left + RR), dy = e.clientY - (r.top + RR); const d = Math.hypot(dx, dy);
      if (d > RR) { dx *= RR / d; dy *= RR / d; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      joy.x = Math.hypot(dx, dy) < RR * .15 ? 0 : dx / RR; joy.y = Math.hypot(dx, dy) < RR * .15 ? 0 : dy / RR;
    };
    const soltar = e => { if (e.pointerId === id) { id = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
    base.addEventListener('pointerdown', e => { id = e.pointerId; capturar(base, id); mover(e); });
    base.addEventListener('pointermove', e => { if (e.pointerId === id) mover(e); });
    base.addEventListener('pointerup', soltar); base.addEventListener('pointercancel', soltar);
    // botón de usar: en la sección secreta, con el arma y sin nada delante, dispara (mantener = seguir disparando)
    const bAct = $('b-act');
    bAct.addEventListener('pointerdown', e => {
      e.preventDefault(); iniciarAudio();
      if (!modo && CB.armado() && !objetivo) { CB.gatillo(true); capturar(bAct, e.pointerId); }
      else accion();
    });
    const sueltaGatillo = () => CB.gatillo(false);
    bAct.addEventListener('pointerup', sueltaGatillo); bAct.addEventListener('pointercancel', sueltaGatillo);
    $('b-rec').addEventListener('pointerdown', e => { e.preventDefault(); CB.recargar(); });
    $('b-mapa').addEventListener('click', alternarMapa); $('b-son').addEventListener('click', alternarSonido);
    const fs = document.documentElement;
    if (!fs.requestFullscreen) $('b-full').hidden = true;
    $('b-full').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : fs.requestFullscreen());
    let gid = null, gx = 0;   // arrastrar sobre la imagen = girar
    cv.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { gid = e.pointerId; gx = e.clientX; } });
    cv.addEventListener('pointermove', e => { if (e.pointerId === gid && !modo) { p.a += (e.clientX - gx) * C.sensibilidadTactil; gx = e.clientX; } });
    const fg = e => { if (e.pointerId === gid) gid = null; };
    cv.addEventListener('pointerup', fg); cv.addEventListener('pointercancel', fg);
    addEventListener('contextmenu', e => e.preventDefault());
  }
  addEventListener('keydown', e => {
    teclas[e.code] = true; iniciarAudio();
    if (e.code === 'KeyN') alternarSonido();
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Tab') e.preventDefault();
    if (modo === 'fin') return;
    const n = /^Digit(\d)$/.exec(e.code), k = n && N.pisos[n[1] - 1] ? n[1] - 1 : -1;
    if (modo === 'mapa') {
      const d = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 }[e.code];
      if (k >= 0) pisoMapa = k; else if (d) pisoMapa = (pisoMapa + d + N.pisos.length) % N.pisos.length;
      if (k >= 0 || d) dibujarMapa();
    }
    if (e.code === 'KeyM' || e.code === 'Tab') return alternarMapa();
    if (e.code === 'Escape') cerrar();
    if (modo === 'elevador' && k >= 0) elegir(k);
    if (e.code === 'KeyR' && !modo) CB.recargar();
    if (['KeyE', 'Space', 'Enter'].includes(e.code) && !e.repeat) accion();
  });
  addEventListener('keyup', e => { teclas[e.code] = false; });
  addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; CB.gatillo(false); });
  cv.addEventListener('pointerdown', e => {   // clic izquierdo: dispara (con el arma) y captura el ratón para mirar
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    iniciarAudio();
    if (modo) return;
    if (CB.usar()) return;
    if (CB.armado()) CB.gatillo(true);
    if (document.pointerLockElement !== cv && cv.requestPointerLock) cv.requestPointerLock();
  });
  addEventListener('mouseup', e => { if (e.button === 0) CB.gatillo(false); });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement === cv && !modo) p.a += e.movementX * C.sensibilidadRaton;
  });

  $('titulo').textContent = N.nombre;
  $('p-cerrar').addEventListener('click', cerrar); $('m-cerrar').addEventListener('click', cerrar);
  addEventListener('pointerdown', iniciarAudio);   // el navegador exige un primer toque/clic para reproducir audio
  if (tactil) iniciarTactil();
  irAPiso(N.inicio.piso);
  let t0 = performance.now();
  function paso(dt) {
    if (!modo) {
      tiempo += dt;
      actualizarMovimiento(dt);
      actualizarPuertas(dt, pu => CB.ocupaCasilla(pu.x, pu.y) || (Math.abs(p.x - (pu.x + .5)) < .5 + C.radio && Math.abs(p.y - (pu.y + .5)) < .5 + C.radio));
      CB.actualizar(dt);
    }
    buscarObjetivo(); salaActual(); document.body.classList.toggle('modal', !!modo);
    poner('ayuda', 'textContent', CB.armado() ? (tactil ? C.textoAyudaArmaTactil : C.textoAyudaArma) : tactil ? C.textoAyudaTactil : C.textoAyuda);
    if (tactil) {
      const cierra = modo && modo !== 'elevador' && modo !== 'fin', dispara = !modo && CB.armado() && !objetivo;
      poner('b-act', 'className', dispara ? 'fuego' : objetivo || cierra ? 'lista' : '');
      poner('b-act', 'textContent', cierra ? 'Cerrar' : dispara ? 'Disparar' : 'Interactuar');
      poner('b-rec', 'hidden', !CB.armado());   // el botón de recargar solo existe en la sección secreta, con el arma
    }
    poner('mira', 'hidden', !!modo);
    document.body.classList.toggle('armado', CB.armado());   // sube los textos de abajo para que no tapen la barra de estado
  }
  (function bucle(t) {
    paso(Math.min(.05, (t - t0) / 1000)); t0 = t;
    dibujar(); requestAnimationFrame(bucle);
  })(t0);
})();
