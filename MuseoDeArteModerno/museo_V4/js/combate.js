// ===== COMBATE: escopeta, jefe, proyectiles, objetos del suelo, barra de estado y pantalla final =====
// Solo se usa en la sección secreta del Sótano. El motor (js/motor.js) lo crea con COMBATE(api).
const COMBATE = api => {
  const { C, N, R, S, W, H, F, p, $ } = api, CC = C.combate;
  const azar = (a, b) => a + Math.random() * (b - a), entero = (a, b) => Math.floor(azar(a, b + 1));
  const TIPOS = {   // objetos que se recogen al pasar por encima
    arma:     { img: 'gen:arma',     alto: .13, texto: '¡Has recogido la escopeta!' },
    botiquin: { img: 'gen:botiquin', alto: .22, texto: 'Has recogido un botiquín.' },
    armadura: { img: 'gen:armadura', alto: .27, texto: 'Has recogido una armadura.' },
    municion: { img: 'gen:municion', alto: .2,  texto: 'Has recogido una caja de cartuchos.' }
  };
  const cuadrosJefe = N.jefe ? R.jefe(N.jefe) : {};
  if (N.jefe) $('jb-nombre').textContent = N.jefe.nombre;
  const A = R.arma();
  const st = {
    tieneArma: false, vida: CC.vida, armadura: 0, cargador: 0, reserva: 0,
    enSecreto: false, hallado: false, piso: -1, gatillo: false, espera: 0, anim: 'quieta', animT: 0, recarga: 0,
    rojo: 0, oro: 0, fogonazo: 0, retroceso: 0, muerto: false, tMuerte: 0, final: false, tFinal: 0,
    disparos: 0, aciertos: 0, recogidos: 0, inicio: performance.now()
  };
  const pisos = {};   // estado de cada piso con objetos de combate
  N.pisos.forEach((P, i) => {
    const lista = (P.objetos || []).filter(o => o.tipo);
    if (!lista.length) return;
    const def = lista.find(o => o.tipo === 'jefe'), arma = lista.find(o => o.tipo === 'arma');
    pisos[i] = {
      objetos: lista.filter(o => TIPOS[o.tipo]).map(o => ({ ...o, img: R.fuente(TIPOS[o.tipo].img), alto: TIPOS[o.tipo].alto, activo: true, tRe: 0 })),
      jefeDef: def, jefe: null, proyectiles: [], efectos: [],
      reaparecer: arma ? { x: arma.x - 1, y: arma.y, a: def ? Math.atan2(def.y - arma.y, def.x - arma.x) : 0 } : null
    };
  });
  const E = () => pisos[st.piso];
  function nuevoJefe(def) {
    return { x: def.x, y: def.y, x0: def.x, y0: def.y, z: .3, vida: N.jefe.vida, max: N.jefe.vida, estado: 'dormido', t: 0, tAnim: 0,
      dir: Math.PI, decide: 0, espera: azar(1.5, 2.5), cuadro: 'quieto', lateral: 0, rafaga: 0, mueve: false, tiembla: 0 };
  }

  // ---------- utilidades ----------
  function vista(ax, ay, bx, by) {   // ¿hay línea de visión entre dos puntos? (muros y puertas cerradas tapan)
    const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d * 4);
    for (let i = 1; i < n; i++) { const t = i / n; if (api.bloquea(Math.floor(ax + (bx - ax) * t), Math.floor(ay + (by - ay) * t))) return false; }
    return true;
  }
  function efecto(x, y, z, cuadros, dur, alto, brillo = true) { const e = E(); if (e) e.efectos.push({ x, y, z, cuadros: cuadros.map(c => R.fuente('gen:' + c)), t: 0, dur, alto, brillo }); }
  function danarJugador(dano, ox, oy) {
    if (st.muerto || st.final) return;
    const guarda = Math.min(st.armadura, Math.floor(dano * CC.absorcion));
    st.armadura -= guarda; st.vida -= dano - guarda; st.rojo = Math.min(1, st.rojo + dano / 40);
    if (ox != null) { const a = Math.atan2(p.y - oy, p.x - ox); p.vx += Math.cos(a) * 2.2; p.vy += Math.sin(a) * 2.2; }   // empujón
    if (st.vida <= 0) {
      st.vida = 0; st.muerto = true; st.tMuerte = 0; st.gatillo = false; S.sonar('muerte');
      const j = E() && E().jefe; if (j && j.estado !== 'muere') { j.estado = 'celebra'; j.t = 0; }
      api.aviso('Has caído en la bóveda…\nPulsa E, clic o el botón para intentarlo de nuevo.', 30);
    } else S.sonar('dolor');
  }
  function revivir() {   // vuelve a la antesala con la vida llena; el jefe y los objetos se reinician
    const e = E(); if (!e) return;
    st.muerto = false; st.vida = CC.vida; st.armadura = 0; st.cargador = CC.cargador; st.reserva = CC.reserva;
    st.rojo = 0; st.recarga = 0; st.anim = 'quieta'; st.espera = .3;
    e.proyectiles.length = 0; e.efectos.length = 0;
    e.objetos.forEach(o => { if (o.tipo !== 'arma') { o.activo = true; o.tRe = 0; } });
    if (e.jefeDef) e.jefe = nuevoJefe(e.jefeDef);
    if (e.reaparecer) { p.x = e.reaparecer.x; p.y = e.reaparecer.y; p.a = e.reaparecer.a; }
    p.vx = p.vy = 0; $('aviso').hidden = true; $('jefe-barra').hidden = true;
  }

  // ---------- escopeta ----------
  function disparar() {
    if (st.cargador <= 0) {
      if (st.reserva > 0) return recargar();
      st.espera = .45; S.sonar('vacio'); api.mensaje('¡Sin cartuchos! Busca cajas de munición.'); return;
    }
    st.cargador--; st.espera = CC.cadencia; st.anim = 'fuego'; st.animT = 0; st.fogonazo = 1; st.retroceso = 1; st.disparos++;
    S.sonar('disparo'); setTimeout(() => S.sonar('bombeo'), 180);
    const e = E(), j = e && e.jefe;
    if (j && j.estado === 'dormido') despertar(j);
    let acierto = false;
    for (let i = 0; i < CC.perdigones; i++) {
      const a = p.a + (Math.random() - Math.random()) * CC.dispersion, dx = Math.cos(a), dy = Math.sin(a);
      // distancia al muro (o puerta cerrada) en esa dirección
      const n = api.lanzar(a, 40), gs = api.golpes(); let muro = 40;
      for (let k = 0; k < n; k++) { const g = gs[k]; if (g.tipo === 0 || (g.tipo === 2 && g.z0 < .45)) { muro = g.d; break; } }
      // ¿toca al jefe? (intersección rayo-círculo)
      let t = 1e9;
      if (j && j.estado !== 'muere' && j.estado !== 'muerto') {
        const ox = j.x - p.x, oy = j.y - p.y, b = ox * dx + oy * dy, c = ox * ox + oy * oy - .62 * .62, disc = b * b - c;
        if (disc >= 0 && b > 0) t = b - Math.sqrt(disc);
      }
      if (t < muro) {
        acierto = true; herirJefe(j, entero(CC.danoPerdigon[0] / 5, CC.danoPerdigon[1] / 5) * 5);
        if (i % 2 === 0) efecto(p.x + dx * (t - .05), p.y + dy * (t - .05), j.z + azar(.3, 1.1), ['sangre0', 'sangre1', 'sangre2'], .3, .18, false);
      } else if (i % 2 === 0 && muro < 40) {
        efecto(p.x + dx * (muro - .04), p.y + dy * (muro - .04), azar(.25, .75), ['humo0', 'humo1', 'humo2'], .35, .14, false);
      }
    }
    if (acierto) st.aciertos++;
  }
  function recargar() {
    if (!armado() || st.muerto || st.recarga > 0 || st.cargador >= CC.cargador) return;
    if (st.reserva <= 0) { api.mensaje('No te quedan cartuchos de repuesto.'); return; }
    st.recarga = CC.recarga; st.anim = 'recarga'; st.animT = 0; S.sonar('recarga');
  }

  // ---------- jefe ----------
  function despertar(j) {
    if (j.estado !== 'dormido') return;
    j.estado = 'alerta'; j.t = 0; S.sonar('despierta', { x: j.x, y: j.y, jugador: p });
    api.aviso(`¡${N.jefe.nombre} ha despertado!`, 3.5);
  }
  function herirJefe(j, dano) {
    if (j.estado === 'muere' || j.estado === 'muerto') return;
    if (j.estado === 'dormido') despertar(j);
    j.vida -= dano; j.tiembla = .12;
    if (j.vida <= 0) { j.vida = 0; j.estado = 'muere'; j.t = 0; S.sonar('muerteJefe', { x: j.x, y: j.y, jugador: p }); return; }
    if (j.estado !== 'alerta' && j.estado !== 'dolor' && Math.random() < .045) {   // probabilidad de dolor por perdigón (≈ 30 % por disparo)
      j.estado = 'dolor'; j.t = 0; S.sonar('dolorJefe', { x: j.x, y: j.y, jugador: p });
    }
  }
  const fase = j => j.vida > j.max * .66 ? 1 : j.vida > j.max * .33 ? 2 : 3;
  function lanzarBola(j, ang, vel) {
    const e = E(), z0 = j.z + N.jefe.alto * .35;
    e.proyectiles.push({ x: j.x + Math.cos(ang) * .7, y: j.y + Math.sin(ang) * .7, z: z0, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
      vz: (.3 - z0) / Math.max(.5, Math.hypot(p.x - j.x, p.y - j.y) / vel), t: 0 });
  }
  function atacar(j) {
    const a = Math.atan2(p.y - j.y, p.x - j.x), f = fase(j), v = CC.velocidadProyectil * (f === 3 ? 1.2 : 1);
    S.sonar('ataque', { x: j.x, y: j.y, jugador: p });
    if (f === 1) lanzarBola(j, a, v);
    else if (f === 2) for (const da of [-.2, 0, .2]) lanzarBola(j, a + da, v);
    else if (Math.random() < .5) for (const da of [-.36, -.18, 0, .18, .36]) lanzarBola(j, a + da, v);
    else { lanzarBola(j, a, v); j.rafaga = 2; j.tRafaga = .28; }
  }
  function moverJefe(j, dt) {
    const dx = p.x - j.x, dy = p.y - j.y, dist = Math.hypot(dx, dy), aJ = Math.atan2(dy, dx), f = fase(j);
    j.decide -= dt;
    if (j.decide <= 0) {   // como A_Chase de DOOM: elige una dirección cada cierto tiempo
      j.decide = azar(.6, 1.3);
      const lado = Math.random() < .5 ? -1 : 1;
      j.dir = dist > 7 ? aJ + azar(-.5, .5) : dist < 3.2 ? aJ + Math.PI + azar(-.8, .8) : aJ + lado * Math.PI / 2 + azar(-.4, .4);
      j.quieto = Math.random() < .15;
    }
    j.mueve = false;
    if (j.quieto) return;
    const vel = (1.5 + .35 * (f - 1)) * dt, r = .6;
    for (const d of [0, .6, -.6, 1.2, -1.2, 2, -2, Math.PI]) {
      const a = j.dir + d, nx = j.x + Math.cos(a) * vel, ny = j.y + Math.sin(a) * vel;
      if (api.libre(nx, ny, r) && Math.hypot(nx - p.x, ny - p.y) > r + C.radio) { j.x = nx; j.y = ny; j.dir = a; j.mueve = true; break; }
    }
    // hacia qué lado se ve que se mueve (para usar "mira izquierda / derecha")
    const lat = Math.sin(j.dir - p.a);   // >0: se mueve hacia tu derecha en pantalla
    const avanza = Math.cos(j.dir - aJ) > .5;
    j.lateral = avanza ? 0 : lat > .35 ? 1 : lat < -.35 ? -1 : 0;
  }
  function actualizarJefe(j, dt) {
    j.t += dt; j.tAnim += dt; j.tiembla = Math.max(0, j.tiembla - dt);
    const dist = Math.hypot(p.x - j.x, p.y - j.y), ve = vista(j.x, j.y, p.x, p.y);
    const flota = .3 + Math.sin(j.tAnim * 2.2) * .07;
    switch (j.estado) {
      case 'dormido': {   // mira a un lado y a otro hasta que te ve
        const k = Math.floor(j.t / .9) % 4; j.cuadro = ['quieto', 'mira_izq', 'quieto', 'mira_der'][k]; j.z = flota;
        // despierta si te ve o en cuanto entras a la bóveda (también al oír un disparo)
        if (st.enSecreto && !st.muerto && ((ve && dist < 15) || Math.abs(p.x - j.x0) < 13 && Math.abs(p.y - j.y0) < 13)) despertar(j);
        break;
      }
      case 'alerta': j.cuadro = 'sonrisa'; j.z = flota + .05; if (j.t > 1.3) { j.estado = 'persigue'; j.t = 0; } break;
      case 'persigue': {
        moverJefe(j, dt); j.z = flota;
        j.cuadro = j.mueve ? (j.lateral < 0 ? 'mira_izq' : j.lateral > 0 ? 'mira_der' : (Math.floor(j.tAnim / .22) % 2 ? 'camina_b' : 'camina_a')) : 'quieto';
        j.espera -= dt;
        const blanco = !st.muerto && ve && st.enSecreto;   // fuera de la bóveda no te ataca (allí no puedes disparar)
        if (blanco && dist < 1.6 && j.espera < 1) { j.estado = 'muerde'; j.t = 0; }
        else if (blanco && j.espera <= 0) { j.estado = 'ataca'; j.t = 0; j.disparo = false; }
        break;
      }
      case 'ataca': {   // sonríe, lanza y vuelve a perseguirte
        j.cuadro = 'sonrisa'; j.z = flota;
        if (!j.disparo && j.t > .45) { j.disparo = true; atacar(j); }
        if (j.rafaga > 0 && j.disparo) { j.tRafaga -= dt; if (j.tRafaga <= 0) { j.rafaga--; j.tRafaga = .28; lanzarBola(j, Math.atan2(p.y - j.y, p.x - j.x), CC.velocidadProyectil * 1.2); S.sonar('ataque', { x: j.x, y: j.y, jugador: p }); } }
        if (j.t > .8 && j.rafaga <= 0) { j.estado = 'persigue'; j.t = 0; const f = fase(j); j.espera = f === 1 ? azar(2, 2.8) : f === 2 ? azar(1.5, 2.2) : azar(1, 1.6); }
        break;
      }
      case 'muerde':
        j.cuadro = 'sonrisa';
        if (j.t > .3 && !j.mordio) { j.mordio = true; if (Math.hypot(p.x - j.x, p.y - j.y) < 1.8) danarJugador(entero(10, 18), j.x, j.y); }
        if (j.t > .7) { j.estado = 'persigue'; j.t = 0; j.mordio = false; j.espera = azar(.8, 1.4); }
        break;
      case 'dolor': j.cuadro = j.vida > j.max / 2 ? 'dolor_leve' : 'dolor_grave'; if (j.t > .28) { j.estado = 'persigue'; j.t = 0; } break;
      case 'celebra': j.cuadro = 'sonrisa'; j.z = flota; break;   // te ganó: sonrisa como en DOOM
      case 'muere': {   // cae, tiembla y estalla
        j.cuadro = 'dolor_grave'; j.z = Math.max(0, j.z - dt * .25); j.tiembla = .1;
        if (Math.random() < dt * 6) efecto(j.x + azar(-.5, .5), j.y + azar(-.5, .5), j.z + azar(.2, 1.2), ['impacto0', 'impacto1', 'impacto2'], .45, .7);
        if (j.t > 2.6) {
          j.estado = 'muerto'; j.t = 0;
          for (let i = 0; i < 8; i++) efecto(j.x + azar(-.6, .6), j.y + azar(-.6, .6), azar(0, 1.2), ['impacto0', 'impacto1', 'impacto2'], azar(.5, .9), 1.1);
          S.sonar('estallido', { x: j.x, y: j.y, jugador: p });
        }
        break;
      }
      case 'muerto': if (j.t > 1.8 && !st.final) mostrarFinal(); break;
    }
  }

  // ---------- proyectiles, efectos y objetos ----------
  function actualizarProyectiles(e, dt) {
    for (let i = e.proyectiles.length - 1; i >= 0; i--) {
      const b = e.proyectiles[i]; b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z = Math.max(.08, b.z + b.vz * dt);
      let fin = api.bloquea(Math.floor(b.x), Math.floor(b.y)) || b.t > 8;
      if (!fin && !st.muerto && Math.hypot(b.x - p.x, b.y - p.y) < .36) { fin = true; danarJugador(entero(CC.danoProyectil[0], CC.danoProyectil[1]), b.x - b.vx * .1, b.y - b.vy * .1); }
      if (fin) {
        e.proyectiles.splice(i, 1);
        efecto(b.x - b.vx * .03, b.y - b.vy * .03, b.z - .2, ['impacto0', 'impacto1', 'impacto2'], .4, .55);
        S.sonar('estallido', { x: b.x, y: b.y, jugador: p });
      }
    }
    for (let i = e.efectos.length - 1; i >= 0; i--) { const f = e.efectos[i]; f.t += dt; if (f.t >= f.dur) e.efectos.splice(i, 1); }
  }
  function recoger(e, dt) {
    for (const o of e.objetos) {
      if (!o.activo) { if (o.tRe > 0 && (o.tRe -= dt) <= 0) { o.activo = true; efecto(o.x, o.y, 0, ['humo0', 'humo1', 'humo2'], .5, .5, true); } continue; }
      if (st.muerto || Math.hypot(o.x - p.x, o.y - p.y) > .55) continue;
      let ok = true;
      if (o.tipo === 'arma') { st.tieneArma = true; st.cargador = CC.cargador; st.reserva = Math.max(st.reserva, CC.reserva); st.anim = 'subir'; st.animT = 0;
        api.aviso(api.tactil ? '¡Una escopeta!\nBotón «Disparar» para disparar · botón «Recargar» para recargar' : '¡Una escopeta!\nClic izquierdo para disparar · R para recargar', 6); }
      else if (o.tipo === 'botiquin') { if (st.vida >= CC.vida) ok = false; else st.vida = Math.min(CC.vida, st.vida + CC.botiquin); }
      else if (o.tipo === 'armadura') { if (st.armadura >= CC.armaduraMax) ok = false; else st.armadura = Math.min(CC.armaduraMax, st.armadura + CC.armadura); }
      else if (o.tipo === 'municion') { if (st.reserva >= CC.reservaMax) ok = false; else st.reserva = Math.min(CC.reservaMax, st.reserva + CC.municion); }
      if (!ok) continue;
      o.activo = false; o.tRe = o.tipo === 'arma' ? 0 : CC.reaparicion; st.oro = 1; st.recogidos++;
      S.sonar(o.tipo === 'arma' ? 'arma' : 'recoger'); api.mensaje(TIPOS[o.tipo].texto);
    }
  }

  // ---------- pantalla final ----------
  function mostrarFinal() {
    st.final = true; st.gatillo = false; api.fin(); $('jefe-barra').hidden = true;
    const seg = Math.round((performance.now() - st.inicio) / 1000), mm = Math.floor(seg / 60), ss = String(seg % 60).padStart(2, '0');
    $('f-stats').innerHTML = '';
    for (const [k, v] of [['Obras vistas', `${api.vistas()} / ${api.totalObras()}`], ['Secretos', '1 / 1'],
      ['Puntería', st.disparos ? Math.round(100 * st.aciertos / st.disparos) + ' %' : '—'], ['Objetos recogidos', st.recogidos], ['Tiempo', `${mm}:${ss}`]]) {
      const f = document.createElement('div'); f.className = 'f-fila'; f.innerHTML = '<span></span><b></b>';
      f.firstChild.textContent = k; f.lastChild.textContent = v; $('f-stats').appendChild(f);
    }
    $('fin').hidden = false; api.forzarMusica(MUSICA.final || null);
  }
  $('f-seguir').addEventListener('click', () => { $('fin').hidden = true; api.seguir(); api.forzarMusica(null); });
  $('f-reiniciar').addEventListener('click', () => api.reiniciar());

  // ---------- interfaz pública para el motor ----------
  const armado = () => st.tieneArma && st.enSecreto && !st.muerto && !st.final;
  function actualizar(dt) {
    const e = E(); if (!e) return;
    st.rojo = Math.max(0, st.rojo - dt * .9); st.oro = Math.max(0, st.oro - dt * 2.5);
    st.fogonazo = Math.max(0, st.fogonazo - dt * 9); st.retroceso = Math.max(0, st.retroceso - dt * 5);
    st.espera -= dt; st.animT += dt;
    if (st.muerto) st.tMuerte += dt;
    if (st.recarga > 0) {
      st.recarga -= dt;
      if (st.recarga <= 0) { const n = Math.min(CC.cargador - st.cargador, st.reserva); st.cargador += n; st.reserva -= n; st.anim = 'quieta'; }
    } else if (st.anim === 'fuego' && st.animT > .1) { st.anim = 'bombeo'; st.animT = 0; }
    else if (st.anim === 'bombeo' && st.animT > .32) { st.anim = 'quieta'; }
    else if (st.anim === 'subir' && st.animT > .4) { st.anim = 'quieta'; }
    if (armado() && st.gatillo && st.espera <= 0 && st.recarga <= 0 && st.anim !== 'subir') disparar();
    if (e.jefeDef && !e.jefe) e.jefe = nuevoJefe(e.jefeDef);
    if (e.jefe && !st.final) actualizarJefe(e.jefe, dt);
    actualizarProyectiles(e, dt);
    recoger(e, dt);
    const j = e.jefe, barra = $('jefe-barra');
    const ver = !!(j && st.enSecreto && !st.final && j.estado !== 'dormido' && j.estado !== 'muerto');
    if (barra.hidden === ver) barra.hidden = !ver;
    if (ver) { $('jb-relleno').style.width = (100 * j.vida / j.max).toFixed(1) + '%'; }
  }
  function cosas() {
    const e = E(); if (!e) return [];
    const out = [];
    for (const o of e.objetos) if (o.activo) out.push(o);
    const j = e.jefe;
    if (j && j.estado !== 'muerto' && cuadrosJefe[j.cuadro]) {
      const tx = j.tiembla > 0 ? azar(-.04, .04) : 0;
      out.push({ x: j.x + tx, y: j.y, z: j.z, alto: N.jefe.alto, img: cuadrosJefe[j.cuadro] });
    }
    const bola = [R.fuente('gen:bola'), R.fuente('gen:bola2')];
    for (const b of e.proyectiles) out.push({ x: b.x, y: b.y, z: b.z - .12, alto: .26, img: bola[Math.floor(b.t * 12) % 2], brillo: true });
    for (const f of e.efectos) out.push({ x: f.x, y: f.y, z: f.z - f.alto / 2, alto: f.alto, img: f.cuadros[Math.min(f.cuadros.length - 1, Math.floor(f.t / f.dur * f.cuadros.length))], brillo: f.brillo });
    return out;
  }
  function solidos() { const e = E(), j = e && e.jefe; return j && j.estado !== 'muerto' ? [{ x: j.x, y: j.y, solido: .6 }] : []; }

  // ---------- dibujo: arma con balanceo, destellos y barra de estado ----------
  const FUENTE = {   // números grandes (5 × 7) y letras pequeñas (4 × 5) para la barra estilo DOOM
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'], '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    A: ['0110', '1001', '1111', '1001', '1001'], C: ['0111', '1000', '1000', '1000', '0111'], D: ['1110', '1001', '1001', '1001', '1110'],
    E: ['1111', '1000', '1110', '1000', '1111'], I: ['111', '010', '010', '010', '111'], L: ['1000', '1000', '1000', '1000', '1111'],
    M: ['10001', '11011', '10101', '10001', '10001'], N: ['1001', '1101', '1011', '1001', '1001'], O: ['0110', '1001', '1001', '1001', '0110'],
    Ó: ['0110', '1001', '1001', '1001', '0110'], P: ['1110', '1001', '1110', '1000', '1000'], R: ['1110', '1001', '1110', '1010', '1001'],
    S: ['0111', '1000', '0110', '0001', '1110'], T: ['11111', '00100', '00100', '00100', '00100'], U: ['1001', '1001', '1001', '1001', '0110'], ' ': ['00', '00', '00', '00', '00']
  };
  function letras(g, txt, x, y, esc, col, sombra) {
    for (const ch of txt) {
      const gl = FUENTE[ch] || FUENTE[' '];
      for (let fy = 0; fy < gl.length; fy++) for (let fx = 0; fx < gl[fy].length; fx++) if (gl[fy][fx] === '1') {
        if (sombra) { g.fillStyle = sombra; g.fillRect(x + fx * esc + 1, y + fy * esc + 1, esc, esc); }
        g.fillStyle = typeof col === 'function' ? col(fy / gl.length) : col; g.fillRect(x + fx * esc, y + fy * esc, esc, esc);
      }
      if (ch === 'Ó') { g.fillStyle = col; g.fillRect(x + 2 * esc, y - 2 * esc, esc, esc); }
      x += (gl[0].length + 1) * esc;
    }
    return x;
  }
  const anchoTxt = (txt, esc) => [...txt].reduce((s, ch) => s + ((FUENTE[ch] || FUENTE[' '])[0].length + 1) * esc, 0) - esc;
  const rojo = t => `rgb(${Math.round(250 - t * 90)},${Math.round(40 - t * 30)},${Math.round(30 - t * 20)})`;
  const barra = document.createElement('canvas'); let claveBarra = '';
  function dibujarBarra() {   // se redibuja solo cuando cambian los números
    const ancho = api.tactil ? 272 : W, alto = 32, clave = [ancho, st.cargador, st.reserva, st.vida, st.armadura].join();
    if (clave === claveBarra) return barra; claveBarra = clave;
    barra.width = ancho; barra.height = alto; const g = barra.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, alto); grad.addColorStop(0, '#5b5650'); grad.addColorStop(1, '#2d2a27');
    g.fillStyle = grad; g.fillRect(0, 0, ancho, alto); g.fillStyle = '#8a847b'; g.fillRect(0, 0, ancho, 1); g.fillStyle = '#141210'; g.fillRect(0, alto - 1, ancho, 1);
    const sec = ancho / 4, secciones = [
      ['MUNICIÓN', String(st.cargador), `/${st.reserva}`], ['SALUD', st.vida + '%'], null, ['ARMADURA', st.armadura + '%']];
    secciones.forEach((s, i) => {
      const x0 = i * sec;
      g.fillStyle = '#1e1b19'; g.fillRect(x0 + 2, 3, sec - 4, alto - 6); g.fillStyle = '#6e685f'; g.fillRect(x0 + 2, alto - 4, sec - 4, 1);
      if (!s) { const ar = R.fuente('gen:arma'); g.imageSmoothingEnabled = false; g.drawImage(ar, x0 + (sec - 56) / 2, 6, 56, 16); letras(g, 'ESCOPETA', x0 + (sec - anchoTxt('ESCOPETA', 1)) / 2, 23, 1, '#cfc6b4'); return; }
      const [et, num, extra] = s;
      letras(g, et, x0 + (sec - anchoTxt(et, 1)) / 2, 6, 1, '#d8b25a');
      const wN = anchoTxt(num, 2), wE = extra ? anchoTxt(extra, 1) + 3 : 0, xx = x0 + (sec - wN - wE) / 2;
      const fin = letras(g, num, xx, 13, 2, rojo, '#000');
      if (extra) letras(g, extra, fin + 3, 20, 1, '#e8e2d0');
    });
    return barra;
  }
  function dibujar(g, eh) {
    const e = E(); if (!e) return;
    // arma en primera persona (con el balanceo de DOOM: un arco en forma de U)
    if (st.tieneArma && st.enSecreto && !st.final) {
      const amp = C.balanceoArma * p.bob, bx = Math.cos(p.fase) * amp, by = Math.abs(Math.sin(p.fase)) * amp;
      let baja = 0;
      if (st.anim === 'recarga') { const t = 1 - st.recarga / CC.recarga; baja = (t < .3 ? t / .3 : t > .75 ? (1 - t) / .25 : 1) * 70; }
      if (st.anim === 'subir') baja = Math.max(0, 1 - st.animT / .4) * 120;
      if (st.muerto) baja = Math.min(1, st.tMuerte * 2) * 160;
      const img = st.anim === 'fuego' ? A.fuego : st.anim === 'bombeo' ? A.bombeo : A.quieta;
      const esc = H / 150, w = 80 * esc, h = 84 * esc, luz = st.fogonazo > .2 ? 1 : Math.max(.55, Math.min(1, api.luzEn(p.x, p.y)));
      const dib = luz > .97 ? img : R.sombreado(img, 1 - luz, '0,0,0');
      g.drawImage(dib, Math.round(W / 2 - w / 2 + bx + 6), Math.round(H - h + 26 + by + st.retroceso * 10 + baja), w, h);
    }
    // destellos de pantalla (como los cambios de paleta de DOOM)
    if (st.fogonazo > 0) { g.fillStyle = `rgba(255,220,150,${st.fogonazo * .12})`; g.fillRect(0, 0, W, H); }
    if (st.oro > 0) { g.fillStyle = `rgba(255,210,90,${st.oro * .22})`; g.fillRect(0, 0, W, H); }
    if (st.rojo > 0 || st.muerto) { g.fillStyle = `rgba(200,0,0,${Math.min(.55, st.rojo * .5 + (st.muerto ? .3 : 0))})`; g.fillRect(0, 0, W, H); }
    if (st.tieneArma && st.enSecreto && !st.final) { const b = dibujarBarra(); g.drawImage(b, Math.round((W - b.width) / 2), H - b.height); }
  }
  return {
    entrarPiso(i) { st.piso = i; st.enSecreto = false; st.gatillo = false; },
    entrarSala(s) {
      st.enSecreto = !!(s && s.secreta);
      if (st.enSecreto && !st.hallado) { st.hallado = true; api.mensaje('¡Has encontrado un área secreta!'); S.sonar('secretoHallado'); }
    },
    actualizar, cosas, solidos, dibujar, armado,
    ajusteOjos: () => st.muerto ? -Math.min(1, st.tMuerte / .6) * .36 : 0,
    puedeMoverse: () => !st.muerto,   // durante la pantalla final el motor ya está en pausa (modo 'fin')
    gatillo(b) { if (b && st.muerto) { if (st.tMuerte > 1) revivir(); return; } st.gatillo = b && armado(); },
    usar() { if (st.muerto) { if (st.tMuerte > 1) revivir(); return true; } return false; },
    recargar,
    ocupaCasilla(x, y) { const e = E(), j = e && e.jefe; return !!(j && j.estado !== 'muerto' && Math.abs(j.x - (x + .5)) < 1.1 && Math.abs(j.y - (y + .5)) < 1.1); }
  };
};
