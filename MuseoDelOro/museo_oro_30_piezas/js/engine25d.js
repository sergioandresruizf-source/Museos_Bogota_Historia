/* =====================================================================
   MOTOR 2.5D · EL ORO DE LOS ANCESTROS
   · Mundo con colisiones, interior de la Casita en corte (muro de fondo, columnas, luces)
   · Dos perspectivas: Orfebre Guardián (indígena) y Expedicionario (español)
   · Cada obra se puede INTERACTUAR (pulir / reconstruir / descifrar / dialogar) o ROBAR (sigilo / ganzúa / fuerza)
   ===================================================================== */
const Engine25D = (() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const lc = document.createElement('canvas'), lctx = lc.getContext('2d');
    let width = 0, height = 0;
    const resize = () => { width = canvas.width = lc.width = window.innerWidth; height = canvas.height = lc.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);

    /* ---------- Geometría del mundo ---------- */
    const CASITA = { x: 100, y: -390, w: 940, h: 446 };            // piso interior ampliado para 30 obras
    const PUERTA = { x1: 530, x2: 610 };                           // hueco en el muro sur
    const TALLER = { x: -420, y: -230, w: 230, h: 160 };           // huella del taller
    const MURO_Y = 56;
    const MUROS = [
        { x: 88, y: -402, w: 964, h: 12 }, { x: 88, y: -402, w: 12, h: 472 }, { x: 1040, y: -402, w: 12, h: 472 },
        { x: 88, y: MURO_Y, w: PUERTA.x1 - 88, h: 14 }, { x: PUERTA.x2, y: MURO_Y, w: 1052 - PUERTA.x2, h: 14 },
        { x: TALLER.x, y: TALLER.y, w: TALLER.w, h: TALLER.h }
    ];
    const PIER = { x: -520, y: 236, w: 90, h: 84 };
    const AGUA_Y = 246;
    const ARBOLES = [{ x: -560, y: -190 }, { x: -600, y: 60 }, { x: 1120, y: -220 }, { x: 1110, y: 120 }, { x: 20, y: -250 }, { x: 70, y: 200 }, { x: -130, y: 130 }, { x: 860, y: 190 }, { x: -700, y: -60 }];
    const ROCAS = [{ x: 250, y: 150, r: 14 }, { x: -30, y: 20, r: 12 }, { x: 460, y: 110, r: 16 }];
    const SPAWN = { indigena: { x: 20, y: 130 }, espanol: { x: -470, y: 215 } };

    /* ---------- Estado ---------- */
    let role = null, gameActive = false, loopRunning = false, cineStep = 0, finalMostrado = false, finalEnviado = false;
    const player = { x: 0, y: 0, facing: 1, walk: 0, run: false };
    const camera = { x: 0, y: 0 };
    const keys = {};
    let target = null, joy = { x: 0, y: 0 }, interactable = null;
    let npcs = [], pedestals = [], guardias = [], textos = [], particulas = [], torchas = [];
    let carrying = null, galeonSway = 0, shake = 0, interior = 0, flash = 0, avisoT = 0;
    const S = { respeto: 0, sabiduria: 0, botin: 0, danos: 0, capturas: 0, alerta: 0 };
    let pat = {};                                                   // patrones pre-renderizados

    const R = id => window.OBRAS_MUSEO.find(o => o.id === id);
    const rec = o => o._r || (o._r = { creada: false, hecho: { pulir: 0, reconstruir: 0, descifrar: 0, dialogar: 0 }, resuelta: false, robada: false, entregada: false, danada: false, metodo: null });
    const titulo = o => o.titulo.split('(')[0].trim();
    const uiAbierta = () => !!document.querySelector('.modal-overlay:not(.hidden), .overlay-screen.active');
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------- Cinemática del español ---------- */
    const cinematicsEspanol = [
        { badge: 'Capítulo I · Puerto de Sevilla, 1536', title: 'La Ambición por El Dorado', visual: '🏰 📜 💰 ⚔️', text: 'En España se hablaba sin cesar de tierras al otro lado del mar donde un cacique se cubría de polvo de oro. Tú, capitán, obtienes permiso para cruzar el Atlántico. Pero en tierra firme tendrás que decidir qué haces con lo que encuentres: ¿conversar o saquear?', btn: 'Embarcar en el Galeón →' },
        { badge: 'Capítulo II · Costa de Colombia', title: 'Frente a la Casita Sagrada', visual: '⛵ 🌊 🧭 🌴', text: 'El galeón echa anclas junto a una aldea. En la Casita Sagrada brillan treinta obras de oro bajo la vigilancia de los guardianes. Cada obra te ofrecerá dos caminos: INTERACTUAR con ella o ROBARLA. Lo que elijas cambiará el final.', btn: 'Desembarcar →' }
    ];

    window.iniciarJuego = r => {
        role = r; Sfx.play('click');
        document.getElementById('screen-select').classList.remove('active');
        if (role === 'espanol') { cineStep = 0; mostrarCine(); document.getElementById('screen-cinematic').classList.add('active'); }
        else { montarMundo(); activar(); }
    };
    function mostrarCine() {
        const d = cinematicsEspanol[cineStep];
        document.getElementById('cine-badge').textContent = d.badge; document.getElementById('cine-title').textContent = d.title;
        document.getElementById('cine-visual').innerHTML = `<div class="cine-emoji">${d.visual}</div>`;
        document.getElementById('cine-text').textContent = d.text; document.getElementById('btn-cine-next').innerHTML = d.btn;
    }
    window.avanzarCinematica = () => {
        Sfx.play('click'); cineStep++;
        if (cineStep < cinematicsEspanol.length) mostrarCine();
        else { document.getElementById('screen-cinematic').classList.remove('active'); montarMundo(); activar(); }
    };
    function activar() {
        document.getElementById('game-hud').classList.remove('hidden'); document.getElementById('touch-ui').classList.toggle('hidden', !matchMedia('(pointer:coarse)').matches);
        gameActive = true; finalMostrado = false; finalEnviado = false;
        Sfx.musicaPlay(window.ORO_CONFIG.musica[role], 0.32);
        if (!loopRunning) { loopRunning = true; last = performance.now(); requestAnimationFrame(bucle); }
        hud();
        toast(role === 'indigena' ? 'Eres el guardián de la Casita Sagrada. Cada obra te ofrece varias maneras de interactuar.' : 'Cada obra tiene dos caminos: INTERACTUAR o ROBAR. ¡Cuidado con los guardianes!', '#F7DC88', 6000);
    }
    window.volverMenuInicio = () => {
        gameActive = false; Sfx.musicaStop(); document.getElementById('game-hud').classList.add('hidden'); document.getElementById('touch-ui').classList.add('hidden');
        document.getElementById('screen-final').classList.remove('active'); document.getElementById('screen-select').classList.add('active');
    };

    /* ---------- Montaje del mundo ---------- */
    function montarMundo() {
        const sp = SPAWN[role]; player.x = sp.x; player.y = sp.y; camera.x = sp.x; camera.y = sp.y; target = null; carrying = null;
        Object.assign(S, { respeto: 0, sabiduria: 0, botin: 0, danos: 0, capturas: 0, alerta: 0 });
        window.OBRAS_MUSEO.forEach(o => { delete o._r; const r = rec(o); r.creada = role === 'espanol' ? true : !!o.creadaInicialmente; });
        textos = []; particulas = []; construirPatrones();
        torchas = [{ x: 140, y: -384 }, { x: 570, y: -384 }, { x: 1000, y: -384 }, { x: 522, y: 64 }, { x: 618, y: 64 }, { x: -380, y: -64 }, { x: -230, y: -64 }];
        const filasY = [-300, -180, -60];
        pedestals = window.OBRAS_MUSEO.map((o, i) => ({
            obra: o,
            x: 155 + (i % 10) * 92,
            y: filasY[Math.floor(i / 10)] || -60
        }));

        if (role === 'indigena') {
            document.getElementById('hud-role-icon').textContent = '🌞'; document.getElementById('hud-role-name').textContent = 'Orfebre Guardián';
            document.getElementById('hud-zone-name').textContent = 'Aldea y Casita Sagrada';
            document.getElementById('btn-vestidor').classList.remove('hidden'); document.getElementById('txt-btn-exposicion').textContent = 'Ir a la Casita';
            npcs = [
                { id: 'sabio', name: 'Abuelo Sabio', rol: 'Guía Espiritual', x: -60, y: 70, tipo: 'sabio', dialog: 'Las obras no son adornos: guardan la memoria del sol, el agua y la transformación. En la Casita puedes PULIR, RECONSTRUIR o DESCIFRAR cada una. Las que aún no existen se forjan en el Taller, a la izquierda.', accion: 'Ir al Taller', fn: () => teleport(-305, -30) },
                { id: 'tejedora', name: 'Wayra', rol: 'Guardiana de los Atuendos', x: -250, y: 170, tipo: 'tejedora', dialog: 'El oro ilumina el espíritu de quien lo porta. Puedes vestirte con nuestras narigueras, diademas y pectorales sagrados cuando quieras.', accion: 'Abrir Vestidor de Oro', fn: () => { cerrarModal('modal-dialog'); abrirVestidor(); } },
                { id: 'guardian', name: 'Bochica', rol: 'Custodio de la Casita', x: 495, y: 112, tipo: 'guardian', dialog: 'Dentro reposan nuestras treinta obras sagradas. Si falta alguna, hay un hueco en su pedestal: es una obra que aún debe nacer en la fragua. Cuando todas estén vivas, la Casita brillará entera.' }
            ];
            guardias = []; galeon = null;
        } else {
            document.getElementById('hud-role-icon').textContent = '⚔️'; document.getElementById('hud-role-name').textContent = 'Capitán Expedicionario';
            document.getElementById('hud-zone-name').textContent = 'Costa y Casita Sagrada';
            document.getElementById('btn-vestidor').classList.add('hidden'); document.getElementById('txt-btn-exposicion').textContent = 'Ir a la Casita';
            npcs = [
                { id: 'marinero', name: 'Contramaestre Rodrigo', rol: 'Tripulación Española', x: -420, y: 190, tipo: 'marinero', dialog: '¡Capitán! Los guardianes patrullan: dentro y fuera de la Casita. Si te ven, la sospecha sube; si se llena, te atrapan y pierdes lo que lleves. Robar en SILENCIO es lento; la GANZÚA hace ruido; la FUERZA es rápida pero destroza la pieza. También podéis hablar con ellos…', accion: null },
                { id: 'cacique', name: 'Cacique Anciano', rol: 'Autoridad de la aldea', x: 455, y: 135, tipo: 'cacique', dialog: 'Extranjero… estas treinta piezas no son moneda. Cada una guarda una historia. Si la escuchas con respeto, quizá te dejemos admirarla.', accion: null }
            ];
            guardias = [
                { x: 160, y: -240, ruta: [[160, -240], [540, -240], [540, -120], [160, -120]], i: 1, a: 0, v: 54, dentro: true },
                { x: 600, y: -240, ruta: [[600, -240], [980, -240], [980, -120], [600, -120]], i: 1, a: 0, v: 54, dentro: true },
                { x: -160, y: 60, ruta: [[-160, 60], [220, 150], [530, 190], [-80, 200]], i: 1, a: 0, v: 58, dentro: false }
            ];
        }
    }
    let galeon = null;
    function teleport(x, y) { player.x = x; player.y = y; target = null; cerrarModal('modal-dialog'); }
    window.teletransportarZonaEspecial = () => { teleport(570, 20); toast('Entraste a la Casita Sagrada', '#F7DC88'); };

    /* ---------- Colisiones ---------- */
    const circRect = (x, y, r, b) => { const cx = Math.max(b.x, Math.min(x, b.x + b.w)), cy = Math.max(b.y, Math.min(y, b.y + b.h)); return (x - cx) ** 2 + (y - cy) ** 2 < r * r; };
    function libre(x, y) {
        const r = 11;
        if (x < -745 || x > 1160 || y < -382 || y > 312) return false;
        if (y > AGUA_Y && !(x > PIER.x + 6 && x < PIER.x + PIER.w - 6)) return false;
        for (const b of MUROS) if (circRect(x, y, r, b)) return false;
        for (const t of ARBOLES) if ((x - t.x) ** 2 + (y - t.y) ** 2 < (r + 9) ** 2) return false;
        for (const t of ROCAS) if ((x - t.x) ** 2 + (y - t.y) ** 2 < (r + t.r * 0.8) ** 2) return false;
        for (const p of pedestals) if (Math.abs(x - p.x) < 20 && y > p.y - 14 && y < p.y + 12 && Math.abs(y - p.y) < 20) return false;
        return true;
    }
    const dentroCasita = (x, y) => x > CASITA.x - 4 && x < CASITA.x + CASITA.w + 4 && y > CASITA.y && y < MURO_Y + 6;

    /* ---------- Entrada ---------- */
    window.addEventListener('keydown', e => {
        const k = e.key.toLowerCase(); if (uiAbierta()) return;
        keys[k] = true;
        if ((k === 'e' || k === ' ' || k === 'enter') && gameActive) { e.preventDefault(); ejecutarInteraccion(); }
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
        if (k === 'm') document.getElementById('btn-mute').click();
    });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    canvas.addEventListener('click', e => {
        if (!gameActive || uiAbierta()) return;
        const r = canvas.getBoundingClientRect(), wx = e.clientX - r.left - width / 2 + camera.x, wy = e.clientY - r.top - height / 2 + camera.y;
        target = { x: Math.max(-740, Math.min(1150, wx)), y: Math.max(-378, Math.min(308, wy)) };
        if (interactable && Math.hypot(wx - interactable.x, wy - interactable.y) < 70) ejecutarInteraccion();
    });
    // joystick táctil
    (() => {
        const z = document.getElementById('joy'), k = document.getElementById('joy-knob'); if (!z) return; let id = null, cx = 0, cy = 0;
        const mover = e => { const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.min(46, Math.hypot(dx, dy)), a = Math.atan2(dy, dx); k.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`; joy.x = d > 8 ? Math.cos(a) * d / 46 : 0; joy.y = d > 8 ? Math.sin(a) * d / 46 : 0; };
        z.addEventListener('pointerdown', e => { id = e.pointerId; const r = z.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; z.setPointerCapture(id); target = null; mover(e); });
        z.addEventListener('pointermove', e => { if (e.pointerId === id) mover(e); });
        const fin = e => { if (e.pointerId === id) { id = null; joy.x = joy.y = 0; k.style.transform = ''; } };
        z.addEventListener('pointerup', fin); z.addEventListener('pointercancel', fin);
        const run = document.getElementById('btn-run'); run.addEventListener('pointerdown', () => { player.run = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => run.addEventListener(ev, () => { player.run = false; }));
    })();

    /* ---------- Interacciones ---------- */
    window.ejecutarInteraccion = () => {
        if (!interactable || uiAbierta() || !gameActive) return;
        const it = interactable; Sfx.play('click');
        if (it.type === 'npc') {
            const n = it.data;
            document.getElementById('dialog-avatar').innerHTML = `<canvas id="dlg-face" width="60" height="60"></canvas>`;
            dibujarCara(document.getElementById('dlg-face').getContext('2d'), n);
            document.getElementById('dialog-name').textContent = n.name; document.getElementById('dialog-role').textContent = n.rol; document.getElementById('dialog-body').textContent = n.dialog;
            const b = document.getElementById('dialog-action-btn');
            if (n.accion) { b.textContent = n.accion; b.onclick = () => { cerrarModal('modal-dialog'); n.fn(); }; b.classList.remove('hidden'); } else b.classList.add('hidden');
            document.getElementById('modal-dialog').classList.remove('hidden');
        } else if (it.type === 'taller') abrirTaller();
        else if (it.type === 'galeon') entregar();
        else if (it.type === 'pedestal') abrirMenu(it.data);
    };

    /* ---------- Taller (Indígena) ---------- */
    function abrirTaller() {
        const g = document.getElementById('craft-selector'); document.getElementById('craft-workspace').classList.add('hidden');
        g.innerHTML = window.OBRAS_MUSEO.map(o => { const r = rec(o); return `<div class="craft-item-btn ${r.creada ? 'done' : ''}" onclick="Engine25D.forjar('${o.id}')"><span class="craft-item-emoji">${o.emoji}</span><span class="craft-item-name">${titulo(o)}</span><span class="craft-item-status">${r.creada ? '✅ En la Casita' : '🔨 Forjar (minijuego)'}</span></div>`; }).join('');
        document.getElementById('modal-craft').classList.remove('hidden');
    }
    async function forjar(id) {
        const o = R(id), r = rec(o); if (r.creada) { toast('Esa obra ya está en la Casita Sagrada.', '#BFB39F'); return; }
        cerrarModal('modal-craft');
        const res = await MG.jugar('forja', o);
        if (res.ok) { r.creada = true; S.sabiduria += res.estrellas; Sfx.play('coin'); toast(`¡${titulo(o)} nació en la fragua y fue llevada a la Casita!`, '#F7DC88', 4500); chequearFinal(); hud(); }
        else if (!res.cancel) toast('La fundición salió mal. Inténtalo de nuevo.', '#E05A4C');
        abrirTaller();
    }

    /* ---------- Menú de decisiones por obra ---------- */
    function abrirMenu(ped) {
        const o = ped.obra, r = rec(o), M = document.getElementById('choice-body');
        const cab = `<h2>${titulo(o)}</h2><div class="art-meta">${o.cultura} · ${o.tecnica}</div>`;
        const stars = n => n ? '<span class="st">' + '★'.repeat(n) + '</span>' : '';
        const btn = (cls, ico, nom, desc, tipo, extra) => `<button class="opcion ${cls}" onclick="Engine25D.elegir('${o.id}','${tipo}')"><span class="op-ico">${ico}</span><span class="op-txt"><strong>${nom}</strong> ${extra || ''}<small>${desc}</small></span></button>`;
        let h = cab, imgs = '';
        h += `<div class="choice-top"><img id="choice-img" alt="" src=""><div class="choice-info"></div></div>`;
        if (role === 'indigena') {
            if (!r.creada) h += `<p class="choice-msg">Este pedestal está vacío: <strong>la obra aún no existe</strong>. Fórjala en el Taller (a la izquierda de la aldea) para que ocupe su lugar.</p><div class="choice-row"><button class="opcion neutra" onclick="Engine25D.irTaller()"><span class="op-ico">🔥</span><span class="op-txt"><strong>Ir al Taller</strong><small>Forjar esta obra con cera perdida</small></span></button></div>`;
            else {
                h += `<p class="choice-q">¿Cómo quieres interactuar con esta obra?</p><div class="choice-row">`;
                h += btn('buena', '✨', 'Pulir', 'Frota la pátina para devolverle el brillo', 'pulir', stars(r.hecho.pulir));
                h += btn('buena', '🧩', 'Reconstruir', 'Reordena los fragmentos de su fotografía', 'reconstruir', stars(r.hecho.reconstruir));
                h += btn('buena', '🔣', 'Descifrar', 'Recuerda la secuencia de símbolos sagrados', 'descifrar', stars(r.hecho.descifrar));
                h += `</div>`;
            }
        } else {
            if (r.entregada) h += `<p class="choice-msg">Esta pieza ya viaja en tu galeón${r.danada ? ' (dañada)' : ''}.</p>`;
            else if (carrying === o) h += `<p class="choice-msg">La llevas encima. ¡Corre al galeón (abajo a la izquierda)!</p>`;
            else if (r.resuelta) h += `<p class="choice-msg">Ya te ganaste el respeto de sus guardianes: la obra permanece en su pedestal.</p>`;
            else {
                const ocupado = carrying && carrying !== o;
                h += `<p class="choice-q">Tienes dos caminos. ¿Qué haces con esta obra?</p>`;
                h += `<div class="choice-grupo"><div class="choice-tit buena">🤝 INTERACTUAR</div><div class="choice-row">`;
                h += btn('buena', '💬', 'Dialogar con el cacique', 'Responde sobre su significado. Ganas respeto.', 'dialogar', stars(r.hecho.dialogar));
                h += btn('buena', '🔣', 'Descifrar los símbolos', 'Recuerda la secuencia sagrada.', 'descifrar', stars(r.hecho.descifrar));
                h += `</div></div><div class="choice-grupo"><div class="choice-tit mala">🗡️ ROBAR ${ocupado ? '(entrega primero lo que llevas)' : ''}</div><div class="choice-row ${ocupado ? 'bloq' : ''}">`;
                h += btn('mala', '🤫', 'Sigilo', 'Sin ruido, pero exige paciencia', 'sigilo');
                h += btn('mala', '🔓', 'Ganzúa', 'Más rápido, algo de ruido', 'ganzua');
                h += btn('mala', '💥', 'Fuerza bruta', 'Muy rápido, muy ruidoso y daña la pieza', 'fuerza');
                h += `</div></div>`;
            }
        }
        h += `<div class="choice-pie"><button class="btn-role btn-neutral" onclick="Engine25D.ficha('${o.id}')">📖 Ver ficha y escuchar relato</button><button class="btn-role btn-neutral" onclick="cerrarModal('modal-choice')">Cerrar</button></div>`;
        M.innerHTML = h;
        OroAssets.imagen(o).then(im => { const el = document.getElementById('choice-img'); if (el && im) el.src = o._imgSrc; else if (el) el.style.display = 'none'; });
        M.querySelector('.choice-info').innerHTML = `<div class="art-meta">${o.periodo}</div><p style="font-size:.85rem;color:var(--text-muted);line-height:1.5">${o.descripcion.slice(0, 150)}…</p>`;
        document.getElementById('modal-choice').classList.remove('hidden');
    }
    function irTaller() { cerrarModal('modal-choice'); teleport(-305, -30); toast('Habla con la fragua: ¡a forjar!', '#F7DC88'); }
    function ficha(id) { cerrarModal('modal-choice'); abrirVisorObra(R(id), role === 'indigena' ? 'CASITA SAGRADA · OBRA' : 'FICHA · OBRA DE LA CASITA SAGRADA'); }

    async function elegir(id, tipo) {
        const o = R(id), r = rec(o); cerrarModal('modal-choice');
        const robar = ['sigilo', 'ganzua', 'fuerza'].includes(tipo);
        if (robar && carrying && carrying !== o) { toast('Ya llevas una pieza. Entrégala al galeón primero.', '#E05A4C'); return; }
        const res = await MG.jugar(tipo, o);
        if (res.cancel) return;
        if (!robar) {
            if (res.ok) {
                r.hecho[tipo] = Math.max(r.hecho[tipo], res.estrellas); r.resuelta = true;
                if (role === 'indigena') S.sabiduria += res.estrellas; else S.respeto += res.estrellas;
                Sfx.play('coin');
                if (tipo === 'descifrar') mostrarSecreto(o); else toast('El cacique te permite admirar la obra con respeto.', '#4ECCA3', 4000);
                chequearFinal();
            } else toast(tipo === 'descifrar' ? 'Los símbolos se te escaparon. Puedes intentarlo de nuevo.' : 'Aún no entiendes su significado. Puedes volver a intentarlo.', '#E05A4C');
        } else {
            if (res.ok) {
                carrying = o; r.robada = true; r.metodo = tipo; if (tipo === 'fuerza') { r.danada = true; S.danos++; shake = 14; }
                sumarAlerta(tipo === 'sigilo' ? 5 : tipo === 'ganzua' ? 28 : 65);
                toast('¡Tienes la pieza! Llévala al galeón (abajo a la izquierda) sin que te vean.', '#F7DC88', 5000);
            } else { sumarAlerta(tipo === 'sigilo' ? 45 : tipo === 'ganzua' ? 55 : 40); toast('La misión falló y los guardianes sospechan…', '#E05A4C'); }
        }
        hud();
    }
    function mostrarSecreto(o) {
        document.getElementById('dialog-avatar').innerHTML = '🔣'; document.getElementById('dialog-name').textContent = 'Secreto revelado'; document.getElementById('dialog-role').textContent = titulo(o);
        document.getElementById('dialog-body').textContent = o.secreto; document.getElementById('dialog-action-btn').classList.add('hidden'); document.getElementById('modal-dialog').classList.remove('hidden');
    }

    function entregar() {
        if (!carrying) return;
        const o = carrying, r = rec(o); r.entregada = true; r.robada = false; carrying = null; S.botin += r.danada ? 0.5 : 1;
        Sfx.play('coin'); toast(`${titulo(o)} ya viaja en la bodega del galeón${r.danada ? ' (dañada)' : ''}.`, '#F7DC88', 4500);
        for (let i = 0; i < 25; i++) particulas.push({ x: -440, y: 250, vx: rnd(-60, 60), vy: rnd(-140, -30), v: 1, tipo: 'oro' });
        chequearFinal(); hud();
    }

    function sumarAlerta(n) { S.alerta = Math.min(100, S.alerta + n); if (n >= 25) Sfx.play('alarma'); if (S.alerta >= 100) capturar(); hud(); }
    function capturar() {
        flash = 1; Sfx.play('alarma'); S.capturas++; S.alerta = 35;
        if (carrying) { const r = rec(carrying); r.robada = false; toast(`¡Te atraparon! Perdiste "${titulo(carrying)}": volvió a su pedestal.`, '#E05A4C', 5000); carrying = null; }
        else toast('¡Te atraparon! Los guardianes te devuelven a la costa.', '#E05A4C', 4500);
        const sp = SPAWN.espanol; player.x = sp.x; player.y = sp.y; target = null; hud();
    }

    /* ---------- Final ---------- */
    function chequearFinal() {
        if (finalMostrado) return;
        const todas = window.OBRAS_MUSEO.every(o => { const r = rec(o); return role === 'indigena' ? (r.creada && r.resuelta) : (r.entregada || r.resuelta); });
        if (todas) setTimeout(mostrarFinal, 1400);
    }
    function mostrarFinal() {
        if (finalMostrado) return; finalMostrado = true; gameActive = false;
        const obras = window.OBRAS_MUSEO, n = obras.length; let titulo_, txt, cls;
        if (role === 'indigena') {
            const est = obras.reduce((a, o) => a + Object.values(rec(o).hecho).reduce((x, y) => x + y, 0), 0);
            titulo_ = est >= 120 ? 'Maestro de la Memoria' : 'Guardián de la Casita';
            txt = `Las ${n} obras brillan en la Casita Sagrada. Conocerlas, pulirlas y reconstruirlas es la manera de cuidar un patrimonio: no se guarda solo, se mantiene vivo.`; cls = 'bueno';
            document.getElementById('final-stats').innerHTML = `<div><b>${n}/${n}</b><span>Obras en la Casita</span></div><div><b>${S.sabiduria}</b><span>Sabiduría</span></div><div><b>${est}</b><span>Estrellas</span></div>`;
        } else {
            const ent = obras.filter(o => rec(o).entregada).length, res = obras.filter(o => rec(o).resuelta).length;
            if (ent === 0) { titulo_ = 'Embajador del Oro'; txt = 'No te llevaste nada. Escuchaste, aprendiste y regresaste a Sevilla con historias en lugar de cofres. Así es como un patrimonio puede ser compartido sin ser despojado.'; cls = 'bueno'; }
            else if (res === 0) { titulo_ = 'Saqueador de la Casita'; txt = 'Tu bodega está llena, pero la Casita quedó vacía. Buena parte del oro precolombino que cruzó el Atlántico terminó fundido en lingotes: lo que se funde no se recupera.'; cls = 'malo'; }
            else { titulo_ = 'Mercader entre dos mundos'; txt = `Respetaste ${res} obras y te llevaste ${ent}. Cada decisión dejó una huella: unas piezas siguen en su lugar y otras viajan lejos de su gente.`; cls = 'mixto'; }
            document.getElementById('final-stats').innerHTML = `<div><b>${ent}</b><span>Robadas</span></div><div><b>${res}</b><span>Respetadas</span></div><div><b>${S.danos}</b><span>Dañadas</span></div><div><b>${S.capturas}</b><span>Capturas</span></div>`;
        }
        const f = document.getElementById('screen-final'); f.className = 'overlay-screen active ' + cls;
        document.getElementById('final-title').textContent = titulo_; document.getElementById('final-text').textContent = txt;
        document.getElementById('final-epilogo').textContent = role === 'espanol'
            ? 'Hoy: el Tesoro Quimbaya llegó a España en 1893, como regalo a la reina regente, y en 2017 la Corte Constitucional de Colombia ordenó gestionar su restitución.'
            : 'Cada obra que cuidas aquí es una razón más para pedir que las piezas exiliadas regresen a casa.';
        Sfx.musicaPlay(window.ORO_CONFIG.musica.final, 0.4);
    }
    window.continuarRuta = () => {
        if (!finalEnviado) {
            finalEnviado = true;
            try { if (window.parent && window.parent !== window) window.parent.postMessage({ tipo: 'museo-completo', museo: window.ORO_CONFIG.museoId }, '*'); } catch (e) { }
        }
        const b = document.getElementById('btn-continuar'); b.textContent = window.parent !== window ? '✔ Ruta continuada' : '✔ (Aviso enviado al mapa)'; b.disabled = true;
    };
    window.jugarDeNuevo = () => { document.getElementById('screen-final').classList.remove('active'); Sfx.musicaStop(); gameActive = false; document.getElementById('game-hud').classList.add('hidden'); document.getElementById('screen-select').classList.add('active'); };

    /* ---------- Colección ---------- */
    window.abrirColeccion = () => {
        document.getElementById('coleccion-grid').innerHTML = window.OBRAS_MUSEO.map(o => {
            const r = rec(o), est = Object.values(r.hecho).reduce((a, b) => a + b, 0);
            let tag = role === 'indigena' ? (!r.creada ? '🕳️ Por forjar' : r.resuelta ? '✅ Activa' : '⚪ Sin explorar') : (r.entregada ? (r.danada ? '💥 Robada (dañada)' : '🗡️ Robada') : r.resuelta ? '🤝 Respetada' : carrying === o ? '🎒 La llevas' : '⚪ Intacta');
            return `<div class="col-card ${r.resuelta ? 'ok' : ''} ${r.entregada ? 'rob' : ''}"><div class="col-ico">${o.emoji}</div><strong>${titulo(o)}</strong><small>${o.cultura.split('·')[0]}</small><span>${tag}</span><span class="st">${'★'.repeat(Math.min(est, 9))}</span></div>`;
        }).join('');
        document.getElementById('modal-coleccion').classList.remove('hidden');
    };
    window.toggleSonido = () => { const m = Sfx.toggleMute(); document.getElementById('btn-mute').textContent = m ? '🔇' : '🔊'; };

    /* ---------- HUD ---------- */
    function hud() {
        const os = window.OBRAS_MUSEO, n = os.length;
        let a = '', b = '';
        if (role === 'indigena') {
            const c = os.filter(o => rec(o).creada).length, v = os.filter(o => rec(o).creada && rec(o).resuelta).length;
            a = `🏛️ En la Casita: <b>${c}/${n}</b> · ✨ Activadas: <b>${v}/${n}</b> · 🌟 Sabiduría: <b>${S.sabiduria}</b>`;
            b = c < n ? 'Forja las obras que faltan en el Taller y explora cada una en la Casita Sagrada.' : v < n ? 'Todas las obras existen. Interactúa con cada una: pulir, reconstruir o descifrar.' : '¡La Casita brilla entera!';
        } else {
            const e = os.filter(o => rec(o).entregada).length, rs = os.filter(o => rec(o).resuelta).length;
            a = `🗡️ Robadas: <b>${e}</b> · 🤝 Respetadas: <b>${rs}</b> · 🎒 ${carrying ? titulo(carrying) : '—'} · Resueltas: <b>${e + rs}/${n}</b>`;
            b = carrying ? 'Llevas una pieza: ¡al galeón, abajo a la izquierda!' : 'Para cada obra decide: INTERACTUAR (respeto) o ROBAR (botín y riesgo).';
        }
        document.getElementById('hud-progress-text').innerHTML = a; document.getElementById('hud-mission-text').textContent = b;
        const ab = document.getElementById('hud-alerta'); ab.classList.toggle('hidden', role !== 'espanol');
        document.getElementById('alerta-fill').style.width = S.alerta + '%'; document.getElementById('alerta-fill').style.background = S.alerta > 70 ? '#E05A4C' : S.alerta > 35 ? '#E8B830' : '#4ECCA3';
    }
    function toast(txt, col, ms = 3500) {
        const t = document.getElementById('toast'); t.textContent = txt; t.style.borderColor = col || '#D4A63A'; t.classList.remove('hidden'); t.classList.add('show');
        clearTimeout(avisoT); avisoT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 300); }, ms);
    }
    function ftxt(t, c) { textos.push({ x: player.x, y: player.y - 70, t, c: c || '#fff', v: 110 }); }

    /* ---------- Patrones pre-renderizados ---------- */
    function construirPatrones() {
        const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); return ctx.createPattern(c, 'repeat'); };
        pat.pasto = mk(96, 96, c => {
            c.fillStyle = role === 'indigena' ? '#33452a' : '#3b4126'; c.fillRect(0, 0, 96, 96);
            for (let i = 0; i < 140; i++) { c.fillStyle = ['#2b3b23', '#3e5530', '#4b6236', '#2f4026'][i % 4]; c.globalAlpha = 0.6; c.fillRect(Math.random() * 96, Math.random() * 96, 2, rnd(3, 7)); }
        });
        pat.piso = mk(80, 40, c => {
            c.fillStyle = '#3a2a1b'; c.fillRect(0, 0, 80, 40);
            for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#47331f' : '#3f2d1b'; c.fillRect(i * 40 + 1, j * 20 + 1, 38, 18); }
            c.strokeStyle = 'rgba(212,166,58,0.25)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, 79, 39); c.beginPath(); c.moveTo(40, 0); c.lineTo(40, 40); c.moveTo(0, 20); c.lineTo(80, 20); c.stroke();
        });
        pat.tierra = mk(64, 64, c => { c.fillStyle = '#8a6a3f'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 70; i++) { c.fillStyle = ['#7a5c34', '#9a7a4c', '#6e5230'][i % 3]; c.fillRect(Math.random() * 64, Math.random() * 64, 3, 2); } });
    }

    /* ---------- Actualización ---------- */
    let last = 0;
    function bucle(ts) { const dt = Math.min(0.05, (ts - last) / 1000); last = ts; if (gameActive) update(dt); draw(); requestAnimationFrame(bucle); }

    function mover(dx, dy, v) {
        const nx = player.x + dx * v, ny = player.y + dy * v;
        if (libre(nx, player.y)) player.x = nx; if (libre(player.x, ny)) player.y = ny;
    }

    function update(dt) {
        if (uiAbierta()) { return; }
        const f = dt * 60;
        let dx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0), dy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
        if (!dx && !dy && (joy.x || joy.y)) { dx = joy.x; dy = joy.y; }
        const correr = keys['shift'] || keys['b'] || player.run, v = (3.4 + (correr ? 2.2 : 0)) * (carrying ? 0.82 : 1) * f; let moving = false;
        if (dx || dy) { target = null; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } mover(dx, dy, v); moving = true; if (dx) player.facing = dx > 0 ? 1 : -1; }
        else if (target) {
            const tx = target.x - player.x, ty = target.y - player.y, d = Math.hypot(tx, ty);
            if (d > 6) { const ox = player.x, oy = player.y; mover(tx / d, ty / d, Math.min(v, d)); moving = true; if (Math.abs(tx) > 1) player.facing = tx > 0 ? 1 : -1; if (Math.hypot(player.x - ox, player.y - oy) < 0.2 * f) target = null; } else target = null;
        }
        if (moving) { player.walk += (correr ? 0.4 : 0.26) * f; if (Math.floor(player.walk) % 2 === 0 && Math.random() < 0.06) Sfx.play('paso'); }
        // interior suave (para luces y techo)
        const dentro = dentroCasita(player.x, player.y) ? 1 : 0; interior += (dentro - interior) * Math.min(1, dt * 4);
        camera.x += (player.x - camera.x) * Math.min(1, dt * 6); camera.y += (player.y - camera.y) * Math.min(1, dt * 6);
        shake *= 0.9; flash *= 0.94; galeonSway += dt;

        // guardias
        let visto = false;
        guardias.forEach(g => {
            const p = g.ruta[g.i], d = Math.hypot(p[0] - g.x, p[1] - g.y);
            if (d < 4) g.i = (g.i + 1) % g.ruta.length; else { const a = Math.atan2(p[1] - g.y, p[0] - g.x); g.x += Math.cos(a) * g.v * dt; g.y += Math.sin(a) * g.v * dt; g.a = a; }
            const ex = player.x - g.x, ey = player.y - g.y, dist = Math.hypot(ex, ey);
            if (dist < 150 && dentroCasita(player.x, player.y) === g.dentro) { let da = Math.atan2(ey, ex) - g.a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 0.6) { visto = true; g.alerta = true; } else g.alerta = false; } else g.alerta = false;
        });
        if (role === 'espanol') {
            if (visto) { S.alerta = Math.min(100, S.alerta + (carrying ? 55 : 36) * dt); if (S.alerta >= 100) capturar(); }
            else S.alerta = Math.max(0, S.alerta - 3 * dt);
            if (Math.floor(S.alerta) !== update._a) { update._a = Math.floor(S.alerta); hud(); }
        }
        // partículas
        if (Math.random() < 0.25) particulas.push({ x: player.x + rnd(-380, 380), y: player.y + rnd(-260, 260), vx: rnd(-6, 6), vy: rnd(-22, -8), v: 1, tipo: 'polvo' });
        particulas.forEach(p => { p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; if (p.tipo === 'oro') p.vy += 220 * dt; p.v -= dt * (p.tipo === 'oro' ? 0.9 : 0.45); });
        particulas = particulas.filter(p => p.v > 0);
        textos.forEach(t => { t.y -= 30 * dt; t.v -= dt * 0.9; }); textos = textos.filter(t => t.v > 0);

        // objeto interactuable más cercano
        let best = null, md = 90;
        npcs.forEach(n => { const d = Math.hypot(player.x - n.x, player.y - n.y); if (d < md) { md = d; best = { type: 'npc', x: n.x, y: n.y, label: `Hablar con ${n.name}`, data: n }; } });
        pedestals.forEach(p => { const d = Math.hypot(player.x - p.x, player.y - p.y); if (d < 70 && d < md) { md = d; best = { type: 'pedestal', x: p.x, y: p.y, label: `Examinar ${titulo(p.obra)}`, data: p }; } });
        if (role === 'indigena') { const d = Math.hypot(player.x + 305, player.y + 52); if (d < 70 && d < md) { md = d; best = { type: 'taller', x: -305, y: -52, label: 'Entrar al Taller de Orfebrería', data: null }; } }
        else { const d = Math.hypot(player.x + 455, player.y - 262); if (d < 80 && d < md && carrying) { md = d; best = { type: 'galeon', x: -455, y: 262, label: `Subir "${titulo(carrying)}" al galeón`, data: null }; } }
        interactable = best;
        const pr = document.getElementById('interact-prompt');
        if (best) { document.getElementById('interact-label').textContent = best.label; pr.classList.remove('hidden'); } else pr.classList.add('hidden');
    }

    /* ---------- Dibujo ---------- */
    const lerp = (a, b, t) => a + (b - a) * t;

    function dibujarFondo() {
        const cielo = ctx.createLinearGradient(0, 0, 0, height);
        if (role === 'espanol') { cielo.addColorStop(0, '#2a1830'); cielo.addColorStop(0.5, '#a3503a'); cielo.addColorStop(1, '#2a1d15'); }
        else { cielo.addColorStop(0, '#2b3f5c'); cielo.addColorStop(0.45, '#e0a45a'); cielo.addColorStop(1, '#2a2417'); }
        ctx.fillStyle = cielo; ctx.fillRect(0, 0, width, height);
        const hz = height / 2 - (camera.y + 520);                      // línea del horizonte (y mundo = -520)
        const capas = [{ p: 0.15, a: 90, c: role === 'espanol' ? '#4a2c3c' : '#4d5c77', f: 0.004, o: 0 }, { p: 0.3, a: 70, c: role === 'espanol' ? '#38212d' : '#37485b', f: 0.007, o: 40 }, { p: 0.5, a: 45, c: role === 'espanol' ? '#25161e' : '#26382f', f: 0.011, o: 90 }];
        capas.forEach(l => {
            ctx.fillStyle = l.c; ctx.beginPath(); ctx.moveTo(0, hz + 20);
            for (let x = 0; x <= width; x += 12) { const wx = x + camera.x * l.p + l.o * 20; ctx.lineTo(x, hz - l.a * (0.55 + 0.45 * Math.sin(wx * l.f) * Math.cos(wx * l.f * 2.3 + l.o)) + (l.a * 0.1)); }
            ctx.lineTo(width, hz + 40); ctx.lineTo(0, hz + 40); ctx.closePath(); ctx.fill();
        });
        // sol
        const sx = width * 0.78 - camera.x * 0.05, sy = hz - 120;
        const sg = ctx.createRadialGradient(sx, sy, 5, sx, sy, 130); sg.addColorStop(0, 'rgba(255,230,150,0.9)'); sg.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = sg; ctx.fillRect(sx - 140, sy - 140, 280, 280);
    }

    function dibujarSuelo(time) {
        ctx.fillStyle = pat.pasto; ctx.fillRect(-1600, -520, 3600, 770);
        // sombra de profundidad en el horizonte
        const hg = ctx.createLinearGradient(0, -520, 0, -370); hg.addColorStop(0, 'rgba(10,8,4,0.55)'); hg.addColorStop(1, 'rgba(10,8,4,0)'); ctx.fillStyle = hg; ctx.fillRect(-1600, -520, 3600, 150);
        // sendero
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const camino = () => { ctx.beginPath(); ctx.moveTo(-470, 250); ctx.bezierCurveTo(-300, 190, -100, 190, 120, 130); ctx.bezierCurveTo(320, 70, 460, 120, 570, 70); ctx.lineTo(570, 56); };
        ctx.strokeStyle = 'rgba(40,28,14,0.55)'; ctx.lineWidth = 74; camino(); ctx.stroke();
        ctx.strokeStyle = pat.tierra; ctx.lineWidth = 62; camino(); ctx.stroke(); ctx.restore();
        // agua
        const ag = ctx.createLinearGradient(0, AGUA_Y, 0, 800); ag.addColorStop(0, role === 'espanol' ? '#1c4b5e' : '#1d5a64'); ag.addColorStop(1, '#0b2230'); ctx.fillStyle = ag; ctx.fillRect(-1600, AGUA_Y, 3200, 700);
        ctx.strokeStyle = 'rgba(150,220,240,0.22)'; ctx.lineWidth = 2;
        for (let wy = AGUA_Y + 22; wy < 480; wy += 30) { ctx.beginPath(); for (let wx = -900; wx < 900; wx += 36) ctx.lineTo(wx, wy + Math.sin(time * 1.6 + wx * 0.03 + wy) * 3.5); ctx.stroke(); }
        // orilla
        ctx.fillStyle = 'rgba(230,214,170,0.35)'; ctx.fillRect(-1600, AGUA_Y - 6, 3200, 8);
        // muelle
        ctx.fillStyle = '#5a3d22'; ctx.fillRect(PIER.x, PIER.y, PIER.w, PIER.h); ctx.strokeStyle = '#2f1e0f'; ctx.lineWidth = 1.5;
        for (let y = PIER.y; y < PIER.y + PIER.h; y += 9) { ctx.beginPath(); ctx.moveTo(PIER.x, y); ctx.lineTo(PIER.x + PIER.w, y); ctx.stroke(); }
        ctx.fillStyle = '#3a2614'; [PIER.x, PIER.x + PIER.w - 6].forEach(x => { for (let y = PIER.y + 6; y < PIER.y + PIER.h; y += 26) ctx.fillRect(x, y, 6, 10); });
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '600 12px "Plus Jakarta Sans"'; ctx.textAlign = 'center'; ctx.fillText(role === 'espanol' ? 'Mar Caribe' : 'Laguna Sagrada', 250, 296);
    }

    function dibujarCasitaInterior(time) {
        const C = CASITA;
        // sombra proyectada
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(C.x + 22, C.y + 12, C.w + 20, C.h + 22);
        // piso
        ctx.fillStyle = pat.piso; ctx.fillRect(C.x, C.y, C.w, C.h);
        const pg = ctx.createLinearGradient(0, C.y, 0, C.y + C.h); pg.addColorStop(0, 'rgba(0,0,0,0.5)'); pg.addColorStop(0.35, 'rgba(0,0,0,0)'); ctx.fillStyle = pg; ctx.fillRect(C.x, C.y, C.w, C.h);
        // alfombra
        ctx.fillStyle = '#7a2a1f'; ctx.fillRect(PUERTA.x1 + 6, C.y + 10, PUERTA.x2 - PUERTA.x1 - 12, C.h + 10); ctx.strokeStyle = '#D4A63A'; ctx.lineWidth = 2; ctx.strokeRect(PUERTA.x1 + 8, C.y + 12, PUERTA.x2 - PUERTA.x1 - 16, C.h + 6);
        ctx.fillStyle = 'rgba(212,166,58,0.5)'; for (let y = C.y + 30; y < C.y + C.h; y += 34) { ctx.beginPath(); ctx.moveTo(570, y - 8); ctx.lineTo(578, y); ctx.lineTo(570, y + 8); ctx.lineTo(562, y); ctx.closePath(); ctx.fill(); }
        // muro de fondo (cara extruida)
        const bh = 84, by = C.y - bh;
        const mg = ctx.createLinearGradient(0, by, 0, C.y); mg.addColorStop(0, '#2a1c10'); mg.addColorStop(1, '#4b3420'); ctx.fillStyle = mg; ctx.fillRect(C.x - 12, by, C.w + 24, bh + 12);
        ctx.strokeStyle = 'rgba(212,166,58,0.55)'; ctx.lineWidth = 2;
        for (let x = C.x + 8; x < C.x + C.w - 30; x += 40) { ctx.beginPath(); ctx.moveTo(x, by + 22); ctx.lineTo(x + 10, by + 22); ctx.lineTo(x + 10, by + 34); ctx.lineTo(x + 20, by + 34); ctx.lineTo(x + 20, by + 22); ctx.lineTo(x + 30, by + 22); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, by + 60); ctx.lineTo(x + 10, by + 60); ctx.lineTo(x + 10, by + 48); ctx.lineTo(x + 20, by + 48); ctx.lineTo(x + 20, by + 60); ctx.lineTo(x + 30, by + 60); ctx.stroke(); }
        ctx.fillStyle = '#D4A63A'; ctx.fillRect(C.x - 12, by, C.w + 24, 4); ctx.fillRect(C.x - 12, C.y - 4, C.w + 24, 4);
        // nichos de luz
        [200, 340, 480, 620, 760, 900].forEach(x => { const g = ctx.createRadialGradient(x, by + 38, 2, x, by + 38, 34); g.addColorStop(0, 'rgba(255,220,130,0.55)'); g.addColorStop(1, 'rgba(255,220,130,0)'); ctx.fillStyle = g; ctx.fillRect(x - 36, by + 2, 72, 72); ctx.fillStyle = '#17100a'; ctx.fillRect(x - 12, by + 18, 24, 40); ctx.strokeStyle = '#D4A63A'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 12, by + 18, 24, 40); });
        // letrero
        ctx.fillStyle = '#F7DC88'; ctx.font = '700 15px "Cinzel"'; ctx.textAlign = 'center'; ctx.fillText('CASITA SAGRADA · 30 PIEZAS', 570, by - 8);
        // muros laterales (cara visible)
        [C.x - 12, C.x + C.w].forEach(x => { const g = ctx.createLinearGradient(x, 0, x + 12, 0); g.addColorStop(0, '#2a1c10'); g.addColorStop(1, '#4b3420'); ctx.fillStyle = g; ctx.fillRect(x, by + bh, 12, C.h + 26); ctx.fillStyle = '#D4A63A'; ctx.fillRect(x, by + bh, 12, 3); });
    }

    function dibujarTaller(time) {
        const T = TALLER, fy = T.y + T.h;                                       // borde frontal
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.moveTo(T.x + 10, fy); ctx.lineTo(T.x + T.w + 60, fy + 10); ctx.lineTo(T.x + T.w + 40, fy - 120); ctx.lineTo(T.x + T.w, fy - 150); ctx.closePath(); ctx.fill();
        // cara frontal
        const wg = ctx.createLinearGradient(0, fy - 90, 0, fy); wg.addColorStop(0, '#6a4326'); wg.addColorStop(1, '#4a2e19'); ctx.fillStyle = wg; ctx.fillRect(T.x, fy - 90, T.w, 90);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; for (let x = T.x + 14; x < T.x + T.w; x += 14) { ctx.beginPath(); ctx.moveTo(x, fy - 90); ctx.lineTo(x, fy); ctx.stroke(); }
        // puerta con fragua
        const glow = 0.7 + Math.sin(time * 5) * 0.15;
        ctx.fillStyle = '#150b05'; ctx.fillRect(-340, fy - 66, 70 + 10, 66); ctx.fillStyle = `rgba(255,120,30,${glow})`; ctx.beginPath(); ctx.ellipse(-305, fy - 16, 28, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = `rgba(255,220,120,${glow})`; ctx.beginPath(); ctx.ellipse(-305, fy - 14, 14, 9, 0, 0, 7); ctx.fill();
        // techo (pirámide trunca vista de frente)
        ctx.fillStyle = '#9a5e30'; ctx.beginPath(); ctx.moveTo(T.x - 14, fy - 90); ctx.lineTo(T.x + T.w + 14, fy - 90); ctx.lineTo(T.x + T.w - 30, T.y - 6); ctx.lineTo(T.x + 30, T.y - 6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { const y = lerp(T.y - 6, fy - 90, i / 6), s = lerp(30, -14, i / 6); ctx.beginPath(); ctx.moveTo(T.x + s, y); ctx.lineTo(T.x + T.w - s, y); ctx.stroke(); }
        ctx.fillStyle = '#D4A63A'; ctx.fillRect(T.x - 14, fy - 94, T.w + 28, 5);
        // humo
        for (let i = 0; i < 4; i++) { const t = (time * 0.4 + i * 0.25) % 1; ctx.fillStyle = `rgba(200,190,180,${0.35 * (1 - t)})`; ctx.beginPath(); ctx.arc(T.x + T.w - 50 + Math.sin(t * 6 + i) * 8, T.y - 10 - t * 60, 8 + t * 14, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#F7DC88'; ctx.font = '700 14px "Cinzel"'; ctx.textAlign = 'center'; ctx.fillText('TALLER DE ORFEBRERÍA', T.x + T.w / 2, T.y - 20);
    }

    function persona(x, y, o, time, moving) {
        const bob = moving ? Math.abs(Math.sin(o.walk || 0)) * 3 : Math.sin(time * 2 + x) * 1;
        const f = o.facing || 1, paso = moving ? Math.sin((o.walk || 0) * 2) * 4 : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(x, y + 12, 17, 7, 0, 0, 7); ctx.fill();
        // piernas
        ctx.fillStyle = o.pantalon || '#5a3a22'; ctx.fillRect(x - 9, y - 2 - bob * 0.3, 7, 14 + paso * 0.5); ctx.fillRect(x + 2, y - 2 - bob * 0.3, 7, 14 - paso * 0.5);
        // torso
        ctx.fillStyle = o.ropa; ctx.beginPath(); ctx.roundRect(x - 13, y - 28 - bob, 26, 32, 7); ctx.fill();
        if (o.faja) { ctx.fillStyle = o.faja; ctx.fillRect(x - 13, y - 9 - bob, 26, 6); }
        if (o.cruz) { ctx.fillStyle = '#C0392B'; ctx.fillRect(x - 3, y - 27 - bob, 6, 30); ctx.fillRect(x - 9, y - 19 - bob, 18, 5); }
        if (o.pectoral) { ctx.fillStyle = '#E8B93E'; ctx.beginPath(); ctx.arc(x, y - 21 - bob, 8, 0, Math.PI); ctx.fill(); ctx.strokeStyle = '#7A5412'; ctx.lineWidth = 1; ctx.stroke(); }
        // cabeza
        ctx.fillStyle = o.piel; ctx.beginPath(); ctx.arc(x, y - 40 - bob, 12, 0, 7); ctx.fill();
        ctx.fillStyle = o.pelo || '#1A120B'; ctx.beginPath(); ctx.arc(x, y - 43 - bob, 12.5, Math.PI, 0); ctx.fill(); if (o.melena) ctx.fillRect(x - 12.5, y - 43 - bob, 5, 18);
        ctx.fillStyle = '#1A120B'; ctx.fillRect(x + f * 3 - 1, y - 40 - bob, 2.4, 3); ctx.fillRect(x + f * 8 - 1, y - 40 - bob, 2.4, 3);
        if (o.yelmo) { ctx.fillStyle = '#9AA6B4'; ctx.beginPath(); ctx.ellipse(x, y - 49 - bob, 16, 6, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x, y - 50 - bob, 11, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#5c6670'; ctx.lineWidth = 1; ctx.stroke(); }
        if (o.diadema) { ctx.fillStyle = '#F7DC88'; ctx.beginPath(); ctx.moveTo(x - 12, y - 49 - bob); ctx.lineTo(x - 6, y - 61 - bob); ctx.lineTo(x, y - 52 - bob); ctx.lineTo(x + 6, y - 61 - bob); ctx.lineTo(x + 12, y - 49 - bob); ctx.closePath(); ctx.fill(); }
        if (o.plumas) { ['#C0392B', '#F1C40F', '#3E8E75'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x - 8 + i * 8, y - 57 - bob, 3, 9, (i - 1) * 0.3, 0, 7); ctx.fill(); }); }
        if (o.nariguera) { ctx.strokeStyle = '#F7DC88'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + f * 5, y - 37 - bob, 4, 0.1, Math.PI - 0.1); ctx.stroke(); }
        if (o.lanza) { ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 18, y + 8); ctx.lineTo(x + 18, y - 56); ctx.stroke(); ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(x + 14, y - 56); ctx.lineTo(x + 18, y - 70); ctx.lineTo(x + 22, y - 56); ctx.closePath(); ctx.fill(); }
        if (o.cargado) { ctx.save(); ctx.translate(x, y - 78 - bob); ctx.shadowColor = '#F7DC88'; ctx.shadowBlur = 14; OroDraw.dibujar(ctx, o.cargado, 0, 0, 0.8); ctx.restore(); }
    }
    const ESTILOS = {
        sabio: { ropa: '#E5D3B3', faja: '#A63A2B', piel: '#9c6a42', pelo: '#d9d4cc', diadema: false, plumas: true, pectoral: true },
        tejedora: { ropa: '#3E8E75', faja: '#E8B930', piel: '#b07a4e', melena: true },
        guardian: { ropa: '#B04A32', faja: '#D4A63A', piel: '#a06c44', plumas: true, lanza: true, nariguera: true },
        marinero: { ropa: '#7a8a9c', pantalon: '#3a3a44', piel: '#e2b49a', cruz: true, pelo: '#5a3a1a', yelmo: false },
        cacique: { ropa: '#D8C7A0', faja: '#8c3a2a', piel: '#9a6a44', pelo: '#cfcac0', diadema: true, pectoral: true, nariguera: true }
    };
    function dibujarCara(c, n) { c.clearRect(0, 0, 60, 60); const e = ESTILOS[n.tipo] || ESTILOS.sabio; c.fillStyle = e.piel; c.beginPath(); c.arc(30, 32, 16, 0, 7); c.fill(); c.fillStyle = e.pelo || '#1A120B'; c.beginPath(); c.arc(30, 28, 17, Math.PI, 0); c.fill(); c.fillStyle = '#1A120B'; c.fillRect(23, 32, 3, 4); c.fillRect(34, 32, 3, 4); if (e.diadema) { c.fillStyle = '#F7DC88'; c.beginPath(); c.moveTo(14, 18); c.lineTo(22, 4); c.lineTo(30, 14); c.lineTo(38, 4); c.lineTo(46, 18); c.closePath(); c.fill(); } if (e.plumas) { ['#C0392B', '#F1C40F', '#3E8E75'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.ellipse(18 + i * 12, 8, 4, 10, (i - 1) * 0.3, 0, 7); c.fill(); }); } }

    function arbol(t, time) {
        const sw = Math.sin(time * 1.2 + t.x) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(t.x + 8, t.y + 10, 34, 13, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4A3219'; ctx.fillRect(t.x - 7, t.y - 40, 14, 50); ctx.fillStyle = '#2f1f0f'; ctx.fillRect(t.x + 2, t.y - 40, 5, 50);
        [['#1b4a22', 0, -62, 38], ['#26642e', -10, -72, 28], ['#348039', 10, -78, 22]].forEach(([c, ox, oy, r]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(t.x + ox + sw, t.y + oy, r, 0, 7); ctx.fill(); });
    }
    function roca(r) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(r.x + 4, r.y + 6, r.r * 1.3, r.r * 0.6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#6d6a64'; ctx.beginPath(); ctx.ellipse(r.x, r.y - 2, r.r, r.r * 0.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8c8982'; ctx.beginPath(); ctx.ellipse(r.x - 3, r.y - 6, r.r * 0.5, r.r * 0.35, 0, 0, 7); ctx.fill(); }
    function columna(x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 4, y + 4, 16, 6, 0, 0, 7); ctx.fill();
        const g = ctx.createLinearGradient(x - 8, 0, x + 8, 0); g.addColorStop(0, '#5a3f26'); g.addColorStop(0.5, '#8a6440'); g.addColorStop(1, '#4a3320'); ctx.fillStyle = g; ctx.fillRect(x - 8, y - 78, 16, 82);
        ctx.fillStyle = '#D4A63A'; ctx.fillRect(x - 11, y - 82, 22, 6); ctx.fillRect(x - 11, y, 22, 5);
        ctx.strokeStyle = 'rgba(212,166,58,0.6)'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 8, y - 66 + i * 16); ctx.lineTo(x, y - 58 + i * 16); ctx.lineTo(x + 8, y - 66 + i * 16); ctx.stroke(); }
    }
    function vigaPuerta() {
        ctx.fillStyle = '#4a3320'; ctx.fillRect(PUERTA.x1 - 6, MURO_Y - 84, PUERTA.x2 - PUERTA.x1 + 12, 12); ctx.fillStyle = '#D4A63A'; ctx.fillRect(PUERTA.x1 - 6, MURO_Y - 84, PUERTA.x2 - PUERTA.x1 + 12, 3);
        ctx.fillStyle = '#8c2f22'; ctx.fillRect(PUERTA.x1 + 14, MURO_Y - 72, PUERTA.x2 - PUERTA.x1 - 28, 14); ctx.fillStyle = '#F7DC88'; ctx.font = '700 9px "Cinzel"'; ctx.textAlign = 'center'; ctx.fillText('ENTRADA', 570, MURO_Y - 62);
    }
    function muroSur(a, b) { const g = ctx.createLinearGradient(0, MURO_Y - 20, 0, MURO_Y + 14); g.addColorStop(0, '#6a4a2e'); g.addColorStop(1, '#3a2614'); ctx.fillStyle = g; ctx.fillRect(a, MURO_Y - 22, b - a, 36); ctx.fillStyle = '#D4A63A'; ctx.fillRect(a, MURO_Y - 22, b - a, 3); }

    function pedestalDib(p, time) {
        const o = p.obra, r = rec(o), cerca = interactable && interactable.data === p, fy = Math.sin(time * 2 + p.x) * 3;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 12, 26, 11, 0, 0, 7); ctx.fill();
        const pg = ctx.createLinearGradient(p.x - 20, 0, p.x + 20, 0); pg.addColorStop(0, '#4a3828'); pg.addColorStop(0.5, '#7a604a'); pg.addColorStop(1, '#3c2c1e');
        ctx.fillStyle = pg; ctx.fillRect(p.x - 19, p.y - 14, 38, 26); ctx.fillStyle = '#9a7c5a'; ctx.fillRect(p.x - 21, p.y - 17, 42, 5); ctx.strokeStyle = cerca ? '#F7DC88' : '#D4A63A'; ctx.lineWidth = cerca ? 2.5 : 1; ctx.strokeRect(p.x - 19, p.y - 14, 38, 26);
        const vacio = (role === 'indigena' && !r.creada) || r.entregada || carrying === o;
        if (vacio) {
            ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(247,220,136,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(p.x, p.y - 34, 15, 15, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(247,220,136,0.35)'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(role === 'indigena' && !r.creada ? '?' : '∅', p.x, p.y - 29);
        } else {
            const g = ctx.createRadialGradient(p.x, p.y - 36 + fy, 3, p.x, p.y - 36 + fy, cerca ? 46 : 32); g.addColorStop(0, `rgba(255,225,130,${r.resuelta ? 0.75 : 0.5})`); g.addColorStop(1, 'rgba(255,225,130,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 36 + fy, cerca ? 46 : 32, 0, 7); ctx.fill();
            ctx.save(); ctx.globalAlpha = r.danada ? 0.7 : 1; OroDraw.dibujar(ctx, o.forma, p.x, p.y - 36 + fy, 0.95); ctx.restore();
            if (role === 'espanol' && !r.resuelta) { ctx.fillStyle = 'rgba(170,215,235,0.18)'; ctx.fillRect(p.x - 17, p.y - 66, 34, 52); ctx.strokeStyle = 'rgba(200,235,250,0.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(p.x - 17, p.y - 66, 34, 52); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(p.x - 14, p.y - 63, 5, 46); }
            if (r.resuelta) { ctx.fillStyle = '#4ECCA3'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✔', p.x + 15, p.y - 60); }
        }
        { const tx = o.corto || titulo(o); let fs = 10; ctx.font = '600 ' + fs + 'px "Plus Jakarta Sans"'; while (ctx.measureText(tx).width > 88 && fs > 6.5) { fs -= 0.5; ctx.font = '600 ' + fs + 'px "Plus Jakarta Sans"'; } ctx.textAlign = 'center'; ctx.fillStyle = cerca ? '#fff' : '#D9B14A'; ctx.fillText(tx, p.x, p.y + 25); }
    }

    function conoGuardia(g) {
        const gr = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, 150); gr.addColorStop(0, g.alerta ? 'rgba(255,90,60,0.5)' : 'rgba(255,240,170,0.38)'); gr.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.arc(g.x, g.y, 150, g.a - 0.6, g.a + 0.6); ctx.closePath(); ctx.fill();
    }

    function galeonDib(x, y, time) {
        const sw = Math.sin(time * 1.4) * 4; ctx.save(); ctx.translate(x, y + sw);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 36, 95, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4A2511'; ctx.beginPath(); ctx.moveTo(-85, -14); ctx.lineTo(85, -14); ctx.lineTo(62, 32); ctx.lineTo(-62, 32); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#6d3a1a'; ctx.fillRect(-85, -18, 170, 6); ctx.fillStyle = '#D4A63A'; ctx.fillRect(-72, 0, 144, 3);
        ctx.fillStyle = '#3a2010'; ctx.fillRect(-4, -130, 8, 118); ctx.fillRect(-52, -110, 6, 96);
        ctx.fillStyle = '#F4ECE1'; ctx.beginPath(); ctx.moveTo(-46, -108); ctx.quadraticCurveTo(-76, -64, -46, -26); ctx.lineTo(-46, -108); ctx.fill(); ctx.beginPath(); ctx.moveTo(-26, -124); ctx.quadraticCurveTo(-4, -76, -26, -34); ctx.lineTo(28, -34); ctx.quadraticCurveTo(52, -76, 28, -124); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#C0392B'; ctx.fillRect(-4, -92, 8, 36); ctx.fillRect(-14, -82, 28, 8);
        const carg = window.OBRAS_MUSEO.filter(o => rec(o).entregada).length; ctx.fillStyle = '#F7DC88'; ctx.font = '700 12px "Plus Jakarta Sans"'; ctx.textAlign = 'center'; ctx.fillText('Bodega: ' + carg + '/' + window.OBRAS_MUSEO.length, 0, 50);
        ctx.restore();
    }

    function iluminar() {
        const oscuro = lerp(0.2, 0.55, interior), tint = role === 'espanol' ? '26,10,28' : '30,16,4';
        lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, width, height); lctx.fillStyle = `rgba(${tint},${oscuro})`; lctx.fillRect(0, 0, width, height);
        lctx.globalCompositeOperation = 'destination-out';
        const luz = (wx, wy, r, i) => { const sx = wx - camera.x + width / 2, sy = wy - camera.y + height / 2; if (sx < -r || sx > width + r || sy < -r || sy > height + r) return; const g = lctx.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, `rgba(0,0,0,${i})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lctx.fillStyle = g; lctx.fillRect(sx - r, sy - r, r * 2, r * 2); };
        const t = performance.now() / 1000;
        luz(player.x, player.y - 20, 150 + interior * 20, 0.85);
        torchas.forEach((q, i) => luz(q.x, q.y - 30, 120 + Math.sin(t * 9 + i * 2) * 8, 0.8));
        pedestals.forEach(p => luz(p.x, p.y - 30, 78, 0.55));
        luz(320, -180, 320, 0.45 * interior); luz(570, -180, 320, 0.45 * interior); luz(820, -180, 320, 0.45 * interior);
        lctx.globalCompositeOperation = 'source-over'; ctx.drawImage(lc, 0, 0);
    }

    function draw() {
        if (!width) return;
        ctx.clearRect(0, 0, width, height);
        if (!role) { dibujarFondo(); return; }
        const time = performance.now() / 1000;
        dibujarFondo();
        ctx.save(); ctx.translate(Math.round(width / 2 - camera.x + rnd(-1, 1) * shake), Math.round(height / 2 - camera.y + rnd(-1, 1) * shake));
        dibujarSuelo(time);
        if (role === 'espanol') galeonDib(-340, 300, time);
        dibujarCasitaInterior(time);
        guardias.forEach(conoGuardia);
        // objetos ordenados en profundidad
        const lista = [];
        pedestals.forEach(p => lista.push({ y: p.y, f: () => pedestalDib(p, time) }));
        npcs.forEach(n => lista.push({ y: n.y, f: () => persona(n.x, n.y, Object.assign({ facing: n.x > player.x ? -1 : 1 }, ESTILOS[n.tipo]), time, false) }));
        guardias.forEach(g => lista.push({ y: g.y, f: () => persona(g.x, g.y, { ropa: '#B04A32', faja: '#D4A63A', piel: '#a06c44', plumas: true, lanza: true, nariguera: true, facing: Math.cos(g.a) >= 0 ? 1 : -1, walk: time * 4 }, time, true) }));
        ARBOLES.forEach(a => lista.push({ y: a.y + 8, f: () => arbol(a, time) }));
        ROCAS.forEach(r => lista.push({ y: r.y, f: () => roca(r) }));
        lista.push({ y: TALLER.y + TALLER.h, f: () => dibujarTaller(time) });
        lista.push({ y: MURO_Y + 14, f: () => { muroSur(88, PUERTA.x1); muroSur(PUERTA.x2, 1052); } });
        lista.push({ y: MURO_Y + 6, f: () => columna(PUERTA.x1 - 4, MURO_Y + 6) }); lista.push({ y: MURO_Y + 6, f: () => columna(PUERTA.x2 + 4, MURO_Y + 6) });
        lista.push({ y: MURO_Y + 8, f: vigaPuerta });
        lista.push({ y: player.y, f: () => { const est = role === 'indigena' ? { ropa: '#E5D3B3', faja: '#B83A2D', piel: '#B87A4B', diadema: J('diadema'), nariguera: J('nariguera'), pectoral: J('pectoral') } : { ropa: '#6b7a8c', pantalon: '#3a3a44', piel: '#E2B49A', cruz: true, yelmo: true }; persona(player.x, player.y, Object.assign(est, { facing: player.facing, walk: player.walk, cargado: carrying ? carrying.forma : null }), time, !!(target || keys.w || keys.a || keys.s || keys.d || joy.x || joy.y || keys.arrowup || keys.arrowdown || keys.arrowleft || keys.arrowright)); } });
        lista.sort((a, b) => a.y - b.y); lista.forEach(o => o.f());
        // antorchas
        torchas.forEach((q, i) => { ctx.fillStyle = '#3a2614'; ctx.fillRect(q.x - 2, q.y - 20, 4, 24); const fl = 8 + Math.sin(time * 10 + i * 2) * 2.5; const g = ctx.createRadialGradient(q.x, q.y - 26, 1, q.x, q.y - 26, 14); g.addColorStop(0, '#fff2b0'); g.addColorStop(0.5, '#ff9a2a'); g.addColorStop(1, 'rgba(255,100,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(q.x, q.y - 26, 7, fl + 4, 0, 0, 7); ctx.fill(); });
        // marcador de destino
        if (target) { ctx.strokeStyle = 'rgba(247,220,136,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(target.x, target.y, 15 + Math.sin(time * 6) * 2, 8, 0, 0, 7); ctx.stroke(); }
        if (interactable) { ctx.fillStyle = 'rgba(247,220,136,0.9)'; ctx.beginPath(); const ix = interactable.x, iy = interactable.y - 88 + Math.sin(time * 5) * 3; ctx.moveTo(ix - 7, iy); ctx.lineTo(ix + 7, iy); ctx.lineTo(ix, iy + 9); ctx.closePath(); ctx.fill(); }
        // partículas
        particulas.forEach(p => { if (p.tipo === 'oro') { ctx.fillStyle = `rgba(255,215,90,${Math.max(0, p.v)})`; ctx.fillRect(p.x, p.y, 3, 3); } else { ctx.fillStyle = `rgba(255,225,150,${Math.max(0, p.v) * 0.5})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill(); } });
        textos.forEach(t => { ctx.font = '700 14px "Plus Jakarta Sans"'; ctx.textAlign = 'center'; ctx.fillStyle = t.c; ctx.globalAlpha = Math.min(1, t.v); ctx.fillText(t.t, t.x, t.y); ctx.globalAlpha = 1; });
        ctx.restore();
        iluminar();
        // viñeta
        const vg = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.4, width / 2, height / 2, Math.max(width, height) * 0.78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, width, height);
        if (flash > 0.02) { ctx.fillStyle = `rgba(200,30,20,${flash * 0.45})`; ctx.fillRect(0, 0, width, height); }
        if (role === 'espanol' && S.alerta > 60) { ctx.fillStyle = `rgba(200,30,20,${(S.alerta - 60) / 40 * 0.18 * (0.6 + 0.4 * Math.sin(time * 8))})`; ctx.fillRect(0, 0, width, height); }
    }
    const J = id => !!window.JOYAS_INDIGENA.find(j => j.id === id)?.equipada;

    return {
        forjar, elegir, ficha, irTaller, abrirTaller,
        // gancho de pruebas
        _t: { get S() { return S; }, rec, teleport, get role() { return role; }, get carrying() { return carrying; }, set carrying(v) { carrying = v; }, chequearFinal, mostrarFinal, hud, sumarAlerta, get player() { return player; }, get pedestals() { return pedestals; }, get guardias() { return guardias; }, libre, entregar }
    };
})();
window.Engine25D = Engine25D;
