// Motor tipo Doom (raycasting). Normalmente no necesitas tocar este archivo.
(() => {
  const C = CONFIG, N = NIVEL;
  let G, OBJ, piso = 0, pisoMapa = 0, modo = '';
  const $ = id => document.getElementById(id);
  const cv = $('pantalla'), ctx = cv.getContext('2d');
  cv.width = C.ancho; cv.height = C.alto; ctx.imageSmoothingEnabled = false;
  const imgs = {};
  const cargar = ruta => imgs[ruta] || (imgs[ruta] = Object.assign(new Image(), { src: ruta }));
  const listo = i => i.complete && i.naturalWidth > 0;
  const celda = (x, y) => (G[Math.floor(y)] || [])[Math.floor(x)];
  const solido = (x, y) => !!N.leyenda[celda(x, y)];
  const norm = a => Math.atan2(Math.sin(a), Math.cos(a));
  const p = { x: 0, y: 0, a: 0 };
  const teclas = {}, zbuf = new Array(C.ancho).fill(1e9);
  let objetivo = null;

  // Lanza un rayo con DDA; devuelve la primera pared que toca.
  function lanzar(ang) {
    const dx = Math.cos(ang), dy = Math.sin(ang), ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
    let mx = Math.floor(p.x), my = Math.floor(p.y), lado = 0;
    const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
    let sdx = (dx < 0 ? p.x - mx : mx + 1 - p.x) * ddx, sdy = (dy < 0 ? p.y - my : my + 1 - p.y) * ddy;
    for (let i = 0; i < 80; i++) {
      if (sdx < sdy) { sdx += ddx; mx += sx; lado = 0; } else { sdy += ddy; my += sy; lado = 1; }
      const ch = (G[my] || [])[mx];
      if (N.leyenda[ch]) {
        const dist = lado ? sdy - ddy : sdx - ddx;
        let wx = lado ? p.x + dist * dx : p.y + dist * dy; wx -= Math.floor(wx);
        if ((lado === 0 && dx > 0) || (lado === 1 && dy < 0)) wx = 1 - wx;
        return { dist, wx, lado, ch };
      }
    }
    return null;
  }

  // --- suelo y techo con textura: se pintan píxel a píxel (necesitan leer la imagen) ---
  const TS = 128, buf = ctx.createImageData(C.ancho, C.alto), buf32 = new Uint32Array(buf.data.buffer), datosTex = {};
  function datos(ruta) {   // píxeles de la textura (null mientras carga)
    if (datosTex[ruta]) return datosTex[ruta];
    const img = cargar(ruta); if (!img.complete) return null;
    const pix = dibujo => {
      const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = TS;
      g.fillStyle = '#6a5a48'; g.fillRect(0, 0, TS, TS); g.strokeStyle = '#3a2f24'; g.strokeRect(0, 0, TS, TS);
      if (dibujo) dibujo(g); return new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer);
    };
    try { return datosTex[ruta] = pix(g => listo(img) && g.drawImage(img, 0, 0, TS, TS)); }
    catch (e) { console.warn('Suelo/techo sin textura (abre el proyecto con Live Server):', ruta); return datosTex[ruta] = pix(); }
  }
  // pinta la pared entre las alturas z0 y z1 (1 = una repetición de la textura)
  function columna(nombre, wx, x, base, lh, z0, z1) {
    const img = cargar(N.texturas[nombre]), ok = listo(img);
    for (let z = z0; z < z1 - 1e-6; z++) {
      const f = Math.min(1, z1 - z), h = f * lh, y = base - (z + f) * lh, c0 = Math.max(0, y), c1 = Math.min(C.alto, y + h);
      if (c1 <= c0) continue;   // fuera de pantalla; solo se dibuja la parte visible
      if (ok) { const th = img.naturalHeight * f;
        ctx.drawImage(img, Math.min(img.naturalWidth - 1, Math.floor(wx * img.naturalWidth)), img.naturalHeight * (1 - f) + (c0 - y) / h * th, 1, (c1 - c0) / h * th, x, c0, 1, c1 - c0); }
      else { ctx.fillStyle = '#f0f'; ctx.fillRect(x, c0, 1, c1 - c0); }
    }
  }

  function dibujar() {
    const W = C.ancho, H = C.alto, hz = H / 2, tf = Math.tan(C.fov / 2), eh = C.alturaOjos, Hm = C.alturaTecho;
    const P = N.pisos[piso], sue = datos(P.suelo || N.suelo), tec = datos(P.techo || N.techo);
    const dx = Math.cos(p.a), dy = Math.sin(p.a), px = -dy * tf, py = dx * tf;
    for (let y = 0; y < H; y++) {   // suelo (abajo) y techo (arriba), fila por fila
      const abajo = y > hz, tex = abajo ? sue : tec, fila = y * W;
      if (!tex) { buf32.fill(0xff000000, fila, fila + W); continue; }
      const d = (abajo ? eh : Hm - eh) * H / Math.abs(y + .5 - hz), sh = 256 * (1 - Math.min(.9, d / C.niebla)) | 0;
      let fx = p.x + (dx - px) * d, fy = p.y + (dy - py) * d;
      const sx = 2 * px * d / W, sy = 2 * py * d / W;
      for (let x = 0; x < W; x++, fx += sx, fy += sy) {
        const c = tex[((fy * TS) & (TS - 1)) * TS + ((fx * TS) & (TS - 1))];
        buf32[fila + x] = 0xff000000 | ((((c >> 16) & 255) * sh >> 8) << 16) | ((((c >> 8) & 255) * sh >> 8) << 8) | ((c & 255) * sh >> 8);
      }
    }
    ctx.putImageData(buf, 0, 0);
    for (let x = 0; x < W; x++) {   // paredes
      const rel = Math.atan((2 * x / W - 1) * tf), r = lanzar(p.a + rel);
      if (!r) { zbuf[x] = 1e9; continue; }
      const d = r.dist * Math.cos(rel), lh = H / d, L = N.leyenda[r.ch], base = hz + eh * lh;
      zbuf[x] = d;
      if (L.estirar) columna(L.textura, r.wx, x, base, lh * Hm, 0, 1);
      else if (L.interaccion) { columna(L.textura, r.wx, x, base, lh, 0, 1); columna(L.superior || C.texturaSuperior, r.wx, x, base, lh, 1, Hm); }
      else columna(L.textura, r.wx, x, base, lh, 0, Hm);
      ctx.fillStyle = `rgba(0,0,0,${Math.min(.85, d / C.niebla + (r.lado ? .15 : 0))})`;
      ctx.fillRect(x, base - Hm * lh, 1, Hm * lh);
    }
    const lista = OBJ.map(o => ({ o, d: Math.hypot(o.x - p.x, o.y - p.y) })).sort((a, b) => b.d - a.d);
    for (const { o, d } of lista) {   // objetos (sprites)
      const rel = norm(Math.atan2(o.y - p.y, o.x - p.x) - p.a), pd = d * Math.cos(rel);
      if (Math.abs(rel) > C.fov || pd < .15) continue;
      const img = cargar(N.sprites[o.sprite]); if (!listo(img)) continue;
      const s = H / pd * (o.escala || 1), cx = (Math.tan(rel) / tf + 1) / 2 * W, y = hz + eh * H / pd - s;
      for (let x = Math.max(0, Math.floor(cx - s / 2)); x < Math.min(W, cx + s / 2); x++) {
        if (pd >= zbuf[x]) continue;
        ctx.drawImage(img, Math.max(0, Math.min(img.naturalWidth - 1, Math.floor((x + .5 - (cx - s / 2)) / s * img.naturalWidth))), 0, 1, img.naturalHeight, x, y, 1, s);
      }
    }
  }

  // ¿Qué hay justo delante (pared u objeto interactivo) al alcance?
  function buscarObjetivo() {
    objetivo = null;
    const r = lanzar(p.a), muro = r ? r.dist : 1e9; let mejor = C.alcance;
    if (r && N.leyenda[r.ch].interaccion && muro < mejor) {
      mejor = muro; objetivo = { id: N.leyenda[r.ch].interaccion, pista: N.leyenda[r.ch].pista };
    }
    for (const o of OBJ) {
      if (!o.interaccion) continue;
      const d = Math.hypot(o.x - p.x, o.y - p.y), rel = norm(Math.atan2(o.y - p.y, o.x - p.x) - p.a);
      if (d < mejor && d < muro && Math.abs(rel) < Math.atan(.4 * (o.escala || 1) / d)) {
        mejor = d; objetivo = { id: o.interaccion, pista: o.pista };
      }
    }
    $('pista').textContent = objetivo ? `[E] ${objetivo.pista || C.textoPista}` : '';
  }

  function actualizar(dt) {
    if (modo) return;
    const v = C.velocidad * (teclas.ShiftLeft ? 1.8 : 1) * dt, gi = C.giro * dt;
    if (teclas.ArrowLeft) p.a -= gi;
    if (teclas.ArrowRight) p.a += gi;
    const f = (teclas.KeyW || teclas.ArrowUp ? 1 : 0) - (teclas.KeyS || teclas.ArrowDown ? 1 : 0);
    const l = (teclas.KeyD ? 1 : 0) - (teclas.KeyA ? 1 : 0), m = .25;
    const dx = (Math.cos(p.a) * f - Math.sin(p.a) * l) * v, dy = (Math.sin(p.a) * f + Math.cos(p.a) * l) * v;
    if (!solido(p.x + dx + Math.sign(dx) * m, p.y)) p.x += dx;
    if (!solido(p.x, p.y + dy + Math.sign(dy) * m)) p.y += dy;
  }

  function irAPiso(i) {   // cambia de piso y te deja frente al elevador ("E") de ese piso
    piso = i; G = N.pisos[i].mapa.map(f => [...f]); OBJ = N.pisos[i].objetos;
    for (let y = 0; y < G.length; y++) for (let x = 0; x < G[y].length; x++) if (G[y][x] === 'E')
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]])
        if (!solido(x + dx + .5, y + dy + .5)) { p.x = x + dx + .5; p.y = y + dy + .5; p.a = Math.atan2(dy, dx); return; }
  }
  // --- audio: música por piso + sonido del elevador (el navegador exige una primera tecla/clic) ---
  const musica = new Audio(), sfx = new Audio(N.sonidoElevador); let audioOk = false, silencio = false; musica.loop = true;
  function sonar() {
    const src = N.pisos[piso].musica; if (!audioOk || !src) return;
    if (!musica.src.endsWith(src)) musica.src = src;
    musica.volume = C.volumenMusica; musica.play().catch(() => {});
  }
  function viaje() {
    musica.pause(); if (!audioOk) return;
    sfx.volume = C.volumenEfectos; sfx.currentTime = 0; sfx.onended = sonar; sfx.play().catch(sonar);
  }
  const iniciarAudio = () => { if (!audioOk) { audioOk = true; sonar(); } };
  function botones(id, activo, fn) {
    const c = $(id); c.innerHTML = '';
    N.pisos.forEach((P, i) => {
      const b = document.createElement('button'); b.textContent = `${i + 1} · ${P.nombre}`;
      if (i === activo) b.className = 'act'; b.onclick = () => fn(i); c.appendChild(b);
    });
  }
  function ui(m, id) { modo = m; $(id).hidden = false; document.exitPointerLock && document.exitPointerLock(); }
  function abrir(id) {
    const el = id === 'elevador', i = el ? { titulo: 'Elevador', texto: '¿A qué piso quieres ir?' } : N.interacciones[id];
    if (!i) return;
    $('p-titulo').textContent = i.titulo || ''; $('p-sub').textContent = i.subtitulo || ''; $('p-texto').textContent = i.texto || '';
    const im = $('p-img'); im.style.display = i.imagen ? 'inline-block' : 'none'; if (i.imagen) im.src = i.imagen;
    $('p-botones').innerHTML = ''; if (el) botones('p-botones', piso, elegir);
    ui(el ? 'elevador' : 'texto', 'panel');
  }
  const elegir = i => { cerrar(); if (i !== piso) { irAPiso(i); viaje(); } };
  const cerrar = () => { $('panel').hidden = $('mapa-ui').hidden = true; modo = ''; };

  function abrirMapa() { pisoMapa = piso; ui('mapa', 'mapa-ui'); dibujarMapa(); }
  function dibujarMapa() {   // mapa simple: paredes + nombres de salas (tecla M)
    botones('m-tabs', pisoMapa, i => { pisoMapa = i; dibujarMapa(); });
    const P = N.pisos[pisoMapa], M = P.mapa, c = $('m-canvas'), g = c.getContext('2d');
    const cs = Math.floor(Math.min(c.width / M[0].length, c.height / M.length));
    const ox = (c.width - cs * M[0].length) / 2, oy = (c.height - cs * M.length) / 2;
    g.fillStyle = '#0b0907'; g.fillRect(0, 0, c.width, c.height);
    M.forEach((f, y) => [...f].forEach((ch, x) => {
      if (!N.leyenda[ch]) return;
      g.fillStyle = ch === 'E' ? '#e0b84f' : '#6b5a3c'; g.fillRect(ox + x * cs, oy + y * cs, cs, cs);
    }));
    g.font = '12px sans-serif'; g.textAlign = 'center';
    P.salas.forEach(s => {
      g.fillStyle = 'rgba(224,184,79,.14)';
      s.r.forEach(([a, b, c2, d]) => g.fillRect(ox + a * cs, oy + b * cs, (c2 - a + 1) * cs, (d - b + 1) * cs));
      const [a, b, c2, d] = s.r[0]; g.fillStyle = '#fff';
      g.fillText(s.nombre, ox + (a + c2 + 1) / 2 * cs, oy + (b + d + 1) / 2 * cs);
    });
    if (pisoMapa === piso) {   // tu posición
      g.save(); g.translate(ox + p.x * cs, oy + p.y * cs); g.rotate(p.a); g.fillStyle = '#f33';
      g.beginPath(); g.moveTo(cs * .45, 0); g.lineTo(-cs * .3, -cs * .28); g.lineTo(-cs * .3, cs * .28); g.fill(); g.restore();
    }
    $('m-titulo').textContent = `Mapa · ${P.nombre}`;
  }
  function salaActual() {
    const P = N.pisos[piso], s = P.salas.find(s => s.r.some(([a, b, c, d]) => p.x >= a && p.x < c + 1 && p.y >= b && p.y < d + 1));
    $('sala').textContent = P.nombre + (s ? ' · ' + (s.grupo ? s.grupo + ' · ' : '') + s.nombre : '');
  }

  addEventListener('keydown', e => {
    teclas[e.code] = true; iniciarAudio();
    if (e.code === 'KeyN') { silencio = !silencio; musica.muted = sfx.muted = silencio; }
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    const n = /^Digit(\d)$/.exec(e.code), k = n && N.pisos[n[1] - 1] ? n[1] - 1 : -1;
    if (modo === 'mapa') {
      const d = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 }[e.code];
      if (k >= 0) pisoMapa = k; else if (d) pisoMapa = (pisoMapa + d + N.pisos.length) % N.pisos.length;
      if (k >= 0 || d) dibujarMapa();
    }
    if (e.code === 'KeyM') return modo === 'mapa' ? cerrar() : modo ? 0 : abrirMapa();
    if (e.code === 'Escape') cerrar();
    if (modo === 'elevador' && k >= 0) elegir(k);
    if (['KeyE', 'Space', 'Enter'].includes(e.code)) {
      if (!modo) objetivo && abrir(objetivo.id); else if (modo !== 'elevador') cerrar();
    }
  });
  addEventListener('keyup', e => { teclas[e.code] = false; });
  cv.addEventListener('click', () => { iniciarAudio(); cv.requestPointerLock && cv.requestPointerLock(); });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement === cv && !modo) p.a += e.movementX * C.sensibilidadRaton;
  });

  $('titulo').textContent = N.nombre; irAPiso(N.inicio.piso); $('ayuda').textContent = C.textoAyuda;
  let t0 = performance.now();
  (function bucle(t) {
    actualizar(Math.min(.05, (t - t0) / 1000)); t0 = t;
    buscarObjetivo(); salaActual(); dibujar(); requestAnimationFrame(bucle);
  })(t0);
})();
