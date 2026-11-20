/* =====================================================================
   MINIJUEGOS DEL MUSEO DEL ORO
   Cada minijuego devuelve una promesa: { ok, estrellas (1-3), errores, cancel }
   Interactuar:  pulir · reconstruir · descifrar · dialogar
   Robar:        sigilo · ganzua · fuerza
   Taller:       forja
   ===================================================================== */

/* ---------- Dibujo de las piezas de oro (procedural, sin imágenes) ---------- */
const OroDraw = (() => {
    const grad = (c, x, y, w, h) => {
        const g = c.createLinearGradient(x, y, x + w, y + h);
        g.addColorStop(0, '#FFF3B8'); g.addColorStop(0.35, '#E8B93E'); g.addColorStop(0.7, '#B8841E'); g.addColorStop(1, '#7A5412');
        return g;
    };
    const rel = (c, fn, x, y, w, h) => {
        c.beginPath(); fn(); c.fillStyle = grad(c, x, y, w, h); c.fill();
        c.strokeStyle = '#6B4709'; c.lineWidth = 0.9; c.stroke();
    };
    const brillo = (c, x, y, r) => {
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(x, y, r, r * 0.55, -0.6, 0, 6.3); c.fill();
    };
    const E = c => (x, y, rx, ry) => { c.moveTo(x + rx, y); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); };

    const FORMAS = {
        poporo(c) {
            const e = E(c);
            rel(c, () => e(0, 8, 13, 14), -13, -6, 26, 28);
            rel(c, () => c.rect(-4, -14, 8, 12), -4, -14, 8, 12);
            rel(c, () => e(0, -15, 8, 3), -8, -18, 16, 6);
            rel(c, () => e(0, 21, 8, 2.6), -8, 18, 16, 6);
            brillo(c, -6, 4, 3.2);
        },
        crisalida(c) {
            const e = E(c);
            rel(c, () => e(0, 0, 10, 19), -10, -19, 20, 38);
            c.strokeStyle = 'rgba(80,50,6,0.7)'; c.lineWidth = 1.2;
            for (let y = -12; y <= 12; y += 5) { c.beginPath(); c.moveTo(-9 + Math.abs(y) * 0.12, y); c.quadraticCurveTo(0, y + 3, 9 - Math.abs(y) * 0.12, y); c.stroke(); }
            rel(c, () => e(0, -22, 3, 3), -3, -25, 6, 6);
            brillo(c, -4, -6, 2.6);
        },
        caracol(c) {
            c.lineCap = 'round';
            const espiral = () => { c.beginPath(); for (let a = 0; a < 12.6; a += 0.15) { const r = 1.5 + a * 1.35, x = Math.cos(a) * r, y = Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); } };
            c.strokeStyle = '#6B4709'; c.lineWidth = 7.2; espiral(); c.stroke();
            c.strokeStyle = grad(c, -18, -18, 36, 36); c.lineWidth = 5.4; espiral(); c.stroke();
            rel(c, () => E(c)(0, -21, 3, 3), -3, -24, 6, 6);
        },
        mascara(c) {
            const e = E(c);
            rel(c, () => c.rect(-17, -20, 34, 5), -17, -20, 34, 5);
            rel(c, () => { c.moveTo(-10, -15); c.lineTo(10, -15); c.lineTo(11, 6); c.quadraticCurveTo(0, 16, -11, 6); c.closePath(); }, -11, -15, 22, 30);
            c.fillStyle = '#4A2E08'; c.beginPath(); c.ellipse(-4.5, -5, 2.2, 1.6, 0, 0, 6.3); c.ellipse(4.5, -5, 2.2, 1.6, 0, 0, 6.3); c.fill();
            c.fillRect(-3, 3, 6, 1.6);
            for (let i = 0; i < 4; i++) rel(c, () => c.rect(-15 + i * 10, 13, 5, 8), -15 + i * 10, 13, 5, 8);
            rel(c, () => e(-16, -4, 3, 5), -19, -9, 6, 10); rel(c, () => e(16, -4, 3, 5), 13, -9, 6, 10);
        },
        balsa(c) {
            const e = E(c);
            rel(c, () => { c.moveTo(-22, 8); c.quadraticCurveTo(0, 20, 22, 8); c.lineTo(18, 3); c.lineTo(-18, 3); c.closePath(); }, -22, 3, 44, 14);
            rel(c, () => c.rect(-2.5, -12, 5, 15), -3, -12, 6, 15); rel(c, () => e(0, -15, 3.6, 3.6), -4, -19, 8, 8);
            [-14, -8, 8, 14].forEach(x => { rel(c, () => c.rect(x - 1.5, -4, 3, 7), x - 2, -4, 4, 7); rel(c, () => e(x, -6, 2, 2), x - 2, -8, 4, 4); });
            c.strokeStyle = '#6B4709'; c.lineWidth = 1; c.beginPath(); c.moveTo(-22, 4); c.lineTo(-27, -2); c.moveTo(22, 4); c.lineTo(27, -2); c.stroke();
        },
        pectoral(c) {
            const e = E(c);
            rel(c, () => { c.moveTo(-20, -8); c.quadraticCurveTo(-18, -18, -6, -14); c.lineTo(0, -10); c.lineTo(6, -14); c.quadraticCurveTo(18, -18, 20, -8); c.quadraticCurveTo(22, 12, 0, 18); c.quadraticCurveTo(-22, 12, -20, -8); c.closePath(); }, -20, -18, 40, 36);
            c.strokeStyle = 'rgba(80,50,6,0.75)'; c.lineWidth = 1.4;
            [-8, 8].forEach(x => { c.beginPath(); c.ellipse(x, 2, 6.5, 6.5, 0, 0, 6.3); c.stroke(); c.beginPath(); c.ellipse(x, 2, 2.6, 2.6, 0, 0, 6.3); c.stroke(); });
            brillo(c, -12, -8, 2.6);
        },
        hombrejaguar(c) {
            const e = E(c);
            rel(c, () => c.rect(-18, -6, 36, 5), -18, -6, 36, 5);
            rel(c, () => c.rect(-4, -17, 8, 34), -4, -17, 8, 34);
            rel(c, () => c.rect(-11, 12, 22, 4), -11, 12, 22, 4);
            rel(c, () => e(0, -21, 5.5, 5.5), -6, -26, 12, 12);
            rel(c, () => { c.moveTo(-5, -25); c.lineTo(-8, -31); c.lineTo(-2, -26); c.closePath(); }, -8, -31, 6, 6);
            rel(c, () => { c.moveTo(5, -25); c.lineTo(8, -31); c.lineTo(2, -26); c.closePath(); }, 2, -31, 6, 6);
            c.fillStyle = '#4A2E08'; c.fillRect(-3, -22, 2, 2); c.fillRect(1, -22, 2, 2);
            c.strokeStyle = 'rgba(80,50,6,0.7)'; c.lineWidth = 1;
            for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 5, -6); c.lineTo(i * 5, -1); c.stroke(); }
        },
        tairona(c) {
            c.strokeStyle = grad(c, -20, -22, 40, 40); c.lineWidth = 2; c.lineCap = 'round';
            for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 3.4, -4); c.lineTo(i * 5.2, -22 + Math.abs(i) * 1.4); c.stroke(); }
            rel(c, () => { c.moveTo(-20, -4); c.quadraticCurveTo(0, 24, 20, -4); c.quadraticCurveTo(0, 8, -20, -4); c.closePath(); }, -20, -4, 40, 22);
            rel(c, () => { c.moveTo(-6, -4); c.lineTo(0, -12); c.lineTo(6, -4); c.closePath(); }, -6, -12, 12, 8);
            c.fillStyle = '#4A2E08'; c.beginPath(); c.arc(0, -6, 1.4, 0, 6.3); c.fill();
        }
    };

    function dibujar(c, forma, x, y, s) {
        const f = FORMAS[forma] || FORMAS.poporo;
        c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; f(c); c.restore();
    }
    return { dibujar, FORMAS };
})();
window.OroDraw = OroDraw;

/* ---------- Carga de imágenes y audios de las obras ---------- */
const OroAssets = {
    imagen(obra) {
        if (obra._imgP) return obra._imgP;
        obra._imgP = new Promise(res => {
            const lista = (obra.imagenesPosibles || []).slice(); let i = 0;
            const sig = () => {
                if (i >= lista.length) { obra._img = null; res(null); return; }
                const im = new Image(); const nombre = lista[i++];
                im.onload = () => { obra._img = im; obra._imgSrc = 'assets/img/' + nombre; res(im); };
                im.onerror = sig; im.src = 'assets/img/' + nombre;
            };
            sig();
        });
        return obra._imgP;
    }
};
window.OroAssets = OroAssets;

/* ---------- Marco común de minijuegos ---------- */
const MG = (() => {
    const $ = id => document.getElementById(id);
    let actual = null;

    function abrir(cfg, juego, obra) {
        return new Promise(resolve => {
            if (actual) actual.cerrar({ ok: false, cancel: true });
            const stage = $('mg-stage'); stage.innerHTML = '';
            $('mg-badge').textContent = cfg.badge || 'MINIJUEGO';
            $('mg-title').textContent = cfg.titulo;
            $('mg-help').innerHTML = cfg.ayuda || '';
            $('mg-status').textContent = ''; $('mg-status').style.color = '';
            $('modal-mg').classList.remove('hidden');
            Sfx.duck(true);

            const offs = [], timers = []; let raf = 0, done = false, last = 0;
            const ctl = {
                stage,
                on(t, e, f, o) { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); },
                t(f, ms) { const id = setTimeout(() => { if (!done) f(); }, ms); timers.push(id); return id; },
                status(txt, col) { const s = $('mg-status'); s.textContent = txt; s.style.color = col || ''; },
                loop(fn) {
                    const paso = ts => { if (done) return; const dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts; fn(dt); raf = requestAnimationFrame(paso); };
                    raf = requestAnimationFrame(paso);
                },
                canvas(w, h) {
                    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.className = 'mg-canvas';
                    stage.appendChild(cv);
                    cv.pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; };
                    return cv;
                },
                fin(res, msg) {
                    if (done) return; done = true; cancelAnimationFrame(raf);
                    const b = document.createElement('div'); b.className = 'mg-banner ' + (res.ok ? 'ok' : 'mal');
                    b.innerHTML = (res.ok ? '★'.repeat(res.estrellas || 1) + '<br>' : '') + (msg || '');
                    stage.appendChild(b);
                    Sfx.play(res.ok ? 'gana' : 'mal');
                    setTimeout(() => ctl.cerrar(res), res.ok ? 1100 : 1300);
                },
                cerrar(res) {
                    if (ctl._cerrado) return; ctl._cerrado = true; done = true;
                    cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach(f => f());
                    $('modal-mg').classList.add('hidden'); stage.innerHTML = '';
                    $('mg-x').onclick = null; Sfx.duck(false);
                    if (actual === ctl) actual = null;
                    resolve(res);
                }
            };
            actual = ctl;
            $('mg-x').onclick = () => ctl.cerrar({ ok: false, cancel: true });
            ctl.on(window, 'keydown', e => { if (e.key === 'Escape') ctl.cerrar({ ok: false, cancel: true }); });
            juego(ctl, obra);
        });
    }

    const estr = (e, a, b) => e <= a ? 3 : e <= b ? 2 : 1;
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ============ INTERACTUAR 1: PULIR ============ */
    function pulir(ctl, obra) {
        const W = 560, H = 340, cv = ctl.canvas(W, H), c = cv.getContext('2d');
        const pt = document.createElement('canvas'); pt.width = W; pt.height = H; const pc = pt.getContext('2d');
        pc.fillStyle = '#4b5a3b'; pc.fillRect(0, 0, W, H);
        const cols = ['#3a4a2f', '#5c6b45', '#6e5a35', '#2f3d2a', '#7a6a40'];
        for (let i = 0; i < 700; i++) { pc.fillStyle = cols[i % cols.length]; pc.globalAlpha = 0.55; pc.beginPath(); pc.arc(Math.random() * W, Math.random() * H, rnd(3, 20), 0, 7); pc.fill(); }
        pc.globalAlpha = 1; pc.globalCompositeOperation = 'destination-in';
        OroDraw.dibujar(pc, obra.forma, W / 2, H / 2 + 6, 6.6);
        pc.globalCompositeOperation = 'source-over';
        const mini = document.createElement('canvas'); mini.width = 140; mini.height = 85; const mc = mini.getContext('2d');
        const cuenta = () => { mc.clearRect(0, 0, 140, 85); mc.drawImage(pt, 0, 0, 140, 85); const d = mc.getImageData(0, 0, 140, 85).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 90) n++; return n; };
        const total = Math.max(1, cuenta());
        let down = false, lx = 0, ly = 0, limpio = 0, tt = 0, fr = 0, chispas = [], sfxT = 0;
        const borrar = (x, y) => {
            pc.globalCompositeOperation = 'destination-out'; pc.lineCap = 'round'; pc.lineWidth = 46;
            pc.beginPath(); pc.moveTo(lx, ly); pc.lineTo(x, y); pc.stroke(); pc.globalCompositeOperation = 'source-over';
            for (let i = 0; i < 2; i++) chispas.push({ x: x + rnd(-18, 18), y: y + rnd(-18, 18), v: rnd(0.4, 1), r: rnd(1.5, 3.5) });
            if (performance.now() - sfxT > 110) { Sfx.play('pulir'); sfxT = performance.now(); }
        };
        ctl.on(cv, 'pointerdown', e => { down = true; const p = cv.pos(e); lx = p.x; ly = p.y; borrar(p.x, p.y); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); });
        ctl.on(cv, 'pointermove', e => { if (!down) return; const p = cv.pos(e); borrar(p.x, p.y); lx = p.x; ly = p.y; });
        ctl.on(window, 'pointerup', () => { down = false; });
        ctl.status('Frota la pieza con el dedo o el ratón hasta quitar toda la pátina…');
        ctl.loop(dt => {
            tt += dt; fr++;
            const g = c.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 330); g.addColorStop(0, '#2a1d10'); g.addColorStop(1, '#0a0705');
            c.fillStyle = g; c.fillRect(0, 0, W, H);
            const glow = limpio;
            c.save(); c.shadowColor = 'rgba(255,215,100,' + (0.15 + glow * 0.7) + ')'; c.shadowBlur = 20 + glow * 40;
            OroDraw.dibujar(c, obra.forma, W / 2, H / 2 + 6, 6.6); c.restore();
            c.drawImage(pt, 0, 0);
            chispas.forEach(s => { s.v -= dt * 1.8; c.fillStyle = 'rgba(255,245,190,' + Math.max(0, s.v) + ')'; c.beginPath(); c.arc(s.x, s.y, s.r * s.v + 0.5, 0, 7); c.fill(); });
            chispas = chispas.filter(s => s.v > 0);
            if (fr % 10 === 0) {
                limpio = 1 - cuenta() / total; ctl.status('Brillo: ' + Math.min(100, Math.round(limpio / 0.94 * 100)) + '%', '#F7DC88');
                if (limpio >= 0.94) ctl.fin({ ok: true, estrellas: tt < 22 ? 3 : tt < 45 ? 2 : 1, errores: 0 }, '¡Brilla como el sol!');
            }
        });
    }

    /* ============ INTERACTUAR 2: RECONSTRUIR (rompecabezas con la foto real) ============ */
    function reconstruir(ctl, obra) {
        const N = 3, S = 360, T = S / N;
        const cv = ctl.canvas(S, S), c = cv.getContext('2d');
        cv.style.maxWidth = '360px';
        OroAssets.imagen(obra).then(img => {
            const src = document.createElement('canvas'); src.width = src.height = S; const sc = src.getContext('2d');
            sc.fillStyle = '#080604'; sc.fillRect(0, 0, S, S);
            if (img) { const r = Math.min(S / img.width, S / img.height), w = img.width * r, h = img.height * r; sc.drawImage(img, (S - w) / 2, (S - h) / 2, w, h); }
            else OroDraw.dibujar(sc, obra.forma, S / 2, S / 2, 7.5);
            let orden = [...Array(N * N).keys()];
            do { for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[orden[i], orden[j]] = [orden[j], orden[i]]; } }
            while (orden.filter((k, p) => k !== p).length < 6);
            let sel = -1, mov = 0, terminado = false;
            const pintar = () => {
                c.fillStyle = '#080604'; c.fillRect(0, 0, S, S);
                orden.forEach((k, p) => {
                    const x = (p % N) * T, y = Math.floor(p / N) * T, sx = (k % N) * T, sy = Math.floor(k / N) * T;
                    c.drawImage(src, sx, sy, T, T, x, y, T, T);
                    c.lineWidth = 3; c.strokeStyle = k === p ? 'rgba(78,204,163,0.9)' : 'rgba(212,166,58,0.45)'; c.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
                    if (p === sel) { c.fillStyle = 'rgba(247,220,136,0.28)'; c.fillRect(x, y, T, T); c.strokeStyle = '#F7DC88'; c.lineWidth = 5; c.strokeRect(x + 3, y + 3, T - 6, T - 6); }
                });
            };
            ctl.on(cv, 'pointerdown', e => {
                if (terminado) return; const p = cv.pos(e), i = Math.floor(p.y / T) * N + Math.floor(p.x / T);
                if (i < 0 || i >= N * N) return;
                if (sel < 0) { sel = i; Sfx.play('click'); }
                else if (sel === i) { sel = -1; }
                else { [orden[sel], orden[i]] = [orden[i], orden[sel]]; sel = -1; mov++; Sfx.play('pin'); }
                pintar();
                const bien = orden.filter((k, p) => k === p).length;
                ctl.status('Movimientos: ' + mov + ' · Fragmentos en su lugar: ' + bien + '/' + N * N, '#F7DC88');
                if (bien === N * N) { terminado = true; ctl.fin({ ok: true, estrellas: mov <= 11 ? 3 : mov <= 18 ? 2 : 1, errores: mov }, '¡Pieza reconstruida!'); }
            });
            ctl.status('Toca dos fragmentos para intercambiarlos. Verde = en su lugar.');
            pintar();
        });
    }

    /* ============ INTERACTUAR 3: DESCIFRAR (secuencia de símbolos sagrados) ============ */
    function descifrar(ctl, obra) {
        const SIM = [{ n: 'Sol', e: '☀️', c: '#E8B830' }, { n: 'Serpiente', e: '🐍', c: '#3E8E75' }, { n: 'Jaguar', e: '🐆', c: '#C7792C' }, { n: 'Ave', e: '🦅', c: '#6AA0D8' }];
        const caja = document.createElement('div'); caja.className = 'simbolos'; ctl.stage.appendChild(caja);
        const info = document.createElement('div'); info.className = 'sim-info'; ctl.stage.appendChild(info);
        const bt = SIM.map((s, i) => { const b = document.createElement('button'); b.className = 'simbolo'; b.style.setProperty('--c', s.c); b.innerHTML = '<span>' + s.e + '</span><small>' + s.n + '</small>'; b.disabled = true; caja.appendChild(b); return b; });
        const rondas = [3, 4, 5]; let ronda = 0, seq = [], pos = 0, errores = 0, turno = false;
        const luz = (i, ms = 420) => { bt[i].classList.add('on'); Sfx.play('simbolo', i); ctl.t(() => bt[i].classList.remove('on'), ms); };
        const mostrar = () => {
            turno = false; bt.forEach(b => b.disabled = true); pos = 0;
            info.textContent = 'Ronda ' + (ronda + 1) + '/' + rondas.length + ' · Observa el orden de los símbolos…'; ctl.status('');
            seq.forEach((s, k) => ctl.t(() => luz(s), 700 + k * 780));
            ctl.t(() => { turno = true; bt.forEach(b => b.disabled = false); info.textContent = 'Ahora repítelos en el mismo orden.'; }, 700 + seq.length * 780 + 200);
        };
        const nueva = () => { seq = []; for (let i = 0; i < rondas[ronda]; i++) seq.push(Math.floor(Math.random() * 4)); mostrar(); };
        bt.forEach((b, i) => b.onclick = () => {
            if (!turno) return; luz(i, 260);
            if (i === seq[pos]) {
                pos++;
                if (pos === seq.length) {
                    turno = false; bt.forEach(x => x.disabled = true);
                    if (++ronda >= rondas.length) ctl.fin({ ok: true, estrellas: errores === 0 ? 3 : errores === 1 ? 2 : 1, errores }, '¡Símbolos descifrados!');
                    else { info.textContent = '¡Bien! Ronda siguiente…'; Sfx.play('ok'); ctl.t(nueva, 900); }
                }
            } else {
                errores++; turno = false; bt.forEach(x => x.disabled = true); Sfx.play('mal');
                if (errores >= 3) ctl.fin({ ok: false, errores }, 'Los símbolos se borraron de tu memoria…');
                else { info.textContent = 'Ese no era. Observa otra vez (errores: ' + errores + '/3)'; ctl.t(mostrar, 1100); }
            }
        });
        ctl.t(nueva, 500);
    }

    /* ============ INTERACTUAR 4: DIALOGAR (preguntas del cacique) ============ */
    function dialogar(ctl, obra) {
        const q = obra.pregunta; let fallos = 0;
        const t = document.createElement('div'); t.className = 'quiz-q'; t.textContent = q.q; ctl.stage.appendChild(t);
        const nota = document.createElement('div'); nota.className = 'sim-info'; nota.textContent = 'Pista: la respuesta está en la ficha de la obra. Respeta su historia.'; ctl.stage.appendChild(nota);
        const l = document.createElement('div'); l.className = 'quiz-ops'; ctl.stage.appendChild(l);
        q.opciones.forEach((o, i) => {
            const b = document.createElement('button'); b.className = 'quiz-op'; b.textContent = o; l.appendChild(b);
            b.onclick = () => {
                if (b.disabled) return;
                if (i === q.correcta) { b.classList.add('bien'); [...l.children].forEach(x => x.disabled = true); ctl.fin({ ok: true, estrellas: fallos === 0 ? 3 : 2, errores: fallos }, 'El cacique asiente con respeto.'); }
                else { b.classList.add('mal'); b.disabled = true; fallos++; Sfx.play('mal'); if (fallos >= 2) { [...l.children].forEach(x => x.disabled = true); ctl.fin({ ok: false, errores: fallos }, 'El cacique se aleja ofendido…'); } else ctl.status('No es esa. Te queda un intento.', '#E05A4C'); }
            };
        });
    }

    /* ============ ROBAR 1: SIGILO ============ */
    function sigilo(ctl, obra) {
        const W = 560, H = 340, cv = ctl.canvas(W, H), c = cv.getContext('2d');
        const P = { x: 36, y: 300, r: 7 }, TG = { x: 505, y: 62 };
        const cajas = [{ x: 140, y: 210, w: 56, h: 44 }, { x: 290, y: 78, w: 64, h: 54 }, { x: 380, y: 232, w: 54, h: 52 }, { x: 215, y: 30, w: 40, h: 40 }];
        const keys = {}; let ptr = null, t = 0, det = 0, vistas = 0, estabaVisto = false, agarre = 0, limite = 34;
        ctl.on(window, 'keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault(); });
        ctl.on(window, 'keyup', e => { keys[e.key.toLowerCase()] = false; });
        ctl.on(cv, 'pointerdown', e => { ptr = cv.pos(e); });
        ctl.on(cv, 'pointermove', e => { if (ptr) ptr = cv.pos(e); });
        ctl.on(window, 'pointerup', () => { ptr = null; });
        const enCaja = (x, y, r = 0) => cajas.some(b => x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r);
        const guardia = () => ({ x: 290 + Math.sin(t * 0.55) * 150, y: 170 + Math.cos(t * 0.37) * 36, a: Math.PI * 0.5 + Math.sin(t * 0.95) * 1.25 });
        const visible = g => {
            const dx = P.x - g.x, dy = P.y - g.y, d = Math.hypot(dx, dy); if (d > 215) return false;
            let da = Math.atan2(dy, dx) - g.a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > 0.52) return false;
            for (let k = 0; k <= d; k += 7) if (enCaja(g.x + dx * k / d, g.y + dy * k / d)) return false;
            return true;
        };
        ctl.status('Muévete (WASD / flechas / arrastra) y mantente cerca de la pieza sin entrar en la luz del guardia.');
        ctl.loop(dt => {
            t += dt; limite -= dt;
            let dx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0), dy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
            if (!dx && !dy && ptr) { const ex = ptr.x - P.x, ey = ptr.y - P.y, d = Math.hypot(ex, ey); if (d > 8) { dx = ex / d; dy = ey / d; } }
            const l = Math.hypot(dx, dy) || 1, v = 95 * dt;
            const nx = Math.max(10, Math.min(W - 10, P.x + dx / l * v * (dx || dy ? 1 : 0))), ny = Math.max(10, Math.min(H - 10, P.y + dy / l * v * (dx || dy ? 1 : 0)));
            if (!enCaja(nx, P.y, P.r)) P.x = nx; if (!enCaja(P.x, ny, P.r)) P.y = ny;
            const g = guardia(), visto = visible(g);
            det = Math.max(0, Math.min(1, det + (visto ? 1.5 : -0.45) * dt));
            if (det > 0.55 && !estabaVisto) { vistas++; estabaVisto = true; Sfx.play('pin'); } if (det < 0.2) estabaVisto = false;
            const cerca = Math.hypot(P.x - TG.x, P.y - TG.y) < 30;
            agarre = Math.max(0, Math.min(1, agarre + (cerca ? dt / 1.2 : -dt * 2)));
            // dibujo
            c.fillStyle = '#17110b'; c.fillRect(0, 0, W, H);
            c.strokeStyle = 'rgba(212,166,58,0.07)'; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
            cajas.forEach(b => { c.fillStyle = '#4a3320'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#6a4a2e'; c.fillRect(b.x, b.y, b.w, 9); c.strokeStyle = '#2a1b0f'; c.strokeRect(b.x, b.y, b.w, b.h); });
            const cone = c.createRadialGradient(g.x, g.y, 5, g.x, g.y, 215); cone.addColorStop(0, 'rgba(255,240,170,' + (0.5 + det * 0.2) + ')'); cone.addColorStop(1, 'rgba(255,240,170,0)');
            c.fillStyle = cone; c.beginPath(); c.moveTo(g.x, g.y); c.arc(g.x, g.y, 215, g.a - 0.52, g.a + 0.52); c.closePath(); c.fill();
            c.fillStyle = '#B83A2D'; c.beginPath(); c.arc(g.x, g.y, 11, 0, 7); c.fill(); c.fillStyle = '#E8D5B0'; c.beginPath(); c.arc(g.x + Math.cos(g.a) * 6, g.y + Math.sin(g.a) * 6, 4, 0, 7); c.fill();
            c.fillStyle = '#2A1B0F'; c.fillRect(TG.x - 22, TG.y + 16, 44, 18);
            c.save(); c.shadowColor = '#F7DC88'; c.shadowBlur = 16; OroDraw.dibujar(c, obra.forma, TG.x, TG.y, 1.1); c.restore();
            if (agarre > 0) { c.strokeStyle = '#4ECCA3'; c.lineWidth = 4; c.beginPath(); c.arc(P.x, P.y, 15, -1.57, -1.57 + agarre * 6.283); c.stroke(); }
            c.fillStyle = visto ? '#E05A4C' : '#E5D3B3'; c.beginPath(); c.arc(P.x, P.y, P.r, 0, 7); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 1.5; c.stroke();
            c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(10, 10, 160, 12); c.fillStyle = det > 0.6 ? '#E05A4C' : '#E8B830'; c.fillRect(11, 11, 158 * det, 10);
            c.fillStyle = '#fff'; c.font = '600 11px sans-serif'; c.fillText('Sospecha del guardia', 14, 33); c.fillText('Tiempo: ' + Math.max(0, Math.ceil(limite)) + ' s', W - 90, 22);
            if (det >= 1) ctl.fin({ ok: false, errores: vistas }, '¡El guardia te vio!');
            else if (agarre >= 1) ctl.fin({ ok: true, estrellas: vistas === 0 ? 3 : vistas === 1 ? 2 : 1, errores: vistas }, '¡Pieza en tus manos!');
            else if (limite <= 0) ctl.fin({ ok: false, errores: vistas }, 'Se acabó el tiempo.');
        });
    }

    /* ============ ROBAR 2: GANZÚA (3 pasadores) ============ */
    function ganzua(ctl, obra) {
        const W = 560, H = 300, cv = ctl.canvas(W, H), c = cv.getContext('2d');
        const anchos = [0.22, 0.16, 0.115], vel = [0.7, 0.95, 1.25];
        let pin = 0, m = 0, dir = 1, errores = 0, puestos = [false, false, false], zona = [], flash = 0, bloq = 0;
        const nuevaZona = i => { const w = anchos[i]; return { a: rnd(0.12, 0.88 - w), w }; };
        zona = [nuevaZona(0), nuevaZona(1), nuevaZona(2)];
        const pulsa = () => {
            if (bloq > 0 || pin > 2) return;
            const z = zona[pin];
            if (m >= z.a && m <= z.a + z.w) { puestos[pin] = true; pin++; Sfx.play('pin'); flash = 1; if (pin > 2) ctl.fin({ ok: true, estrellas: errores === 0 ? 3 : errores === 1 ? 2 : 1, errores }, '¡Cerradura abierta!'); }
            else { errores++; Sfx.play('mal'); bloq = 0.5; flash = -1; puestos = [false, false, false]; pin = 0; if (errores >= 3) ctl.fin({ ok: false, errores }, '¡Saltó la alarma!'); }
        };
        ctl.on(window, 'keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pulsa(); } });
        ctl.on(cv, 'pointerdown', pulsa);
        ctl.status('Pulsa ESPACIO (o toca) cuando la aguja pase por la zona verde. 3 fallos = alarma.');
        ctl.loop(dt => {
            bloq = Math.max(0, bloq - dt); flash *= 0.9;
            if (!bloq) { m += dir * vel[Math.min(pin, 2)] * dt; if (m > 1) { m = 1; dir = -1; } if (m < 0) { m = 0; dir = 1; } }
            c.fillStyle = flash < -0.1 ? '#2a0f0c' : '#120c07'; c.fillRect(0, 0, W, H);
            for (let i = 0; i < 3; i++) {
                const x = 150 + i * 130, up = puestos[i] ? 40 : 0;
                c.fillStyle = '#2b2118'; c.fillRect(x - 24, 40, 48, 150);
                c.fillStyle = puestos[i] ? '#4ECCA3' : '#B8841E'; c.fillRect(x - 12, 70 - up, 24, 90); c.fillStyle = '#F7DC88'; c.fillRect(x - 12, 70 - up, 24, 6);
                c.fillStyle = i === pin ? '#fff' : '#8c7a5a'; c.font = '700 13px sans-serif'; c.textAlign = 'center'; c.fillText('Pasador ' + (i + 1), x, 210);
            }
            const tx = 40, tw = W - 80, ty = 245; c.fillStyle = '#2b2118'; c.fillRect(tx, ty, tw, 22);
            if (pin < 3) { const z = zona[pin]; c.fillStyle = '#3E8E75'; c.fillRect(tx + z.a * tw, ty, z.w * tw, 22); }
            c.fillStyle = bloq > 0 ? '#E05A4C' : '#F7DC88'; c.fillRect(tx + m * tw - 3, ty - 8, 6, 38);
            c.fillStyle = '#E05A4C'; c.textAlign = 'left'; c.font = '700 13px sans-serif'; c.fillText('Fallos: ' + errores + '/3', 16, 24);
            c.textAlign = 'start';
        });
    }

    /* ============ ROBAR 3: FUERZA (machacar) — daña la pieza ============ */
    function fuerza(ctl, obra) {
        const W = 560, H = 300, cv = ctl.canvas(W, H), c = cv.getContext('2d');
        let prog = 0, limite = 7, sacudida = 0, grietas = [];
        const golpe = () => {
            prog += 8; sacudida = 8; Sfx.play('martillo');
            if (grietas.length < 40) { const a = rnd(0, 6.28), l = rnd(20, 70); grietas.push({ x: W / 2 + rnd(-40, 40), y: 130 + rnd(-30, 30), a, l }); }
            if (prog >= 100) { Sfx.play('rompe'); ctl.fin({ ok: true, estrellas: 1, errores: 0 }, '¡La vitrina estalla! (la pieza quedó dañada)'); }
        };
        ctl.on(window, 'keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) golpe(); } });
        ctl.on(cv, 'pointerdown', golpe);
        ctl.status('¡Machaca ESPACIO (o toca) muy rápido! Hará mucho ruido y dañará la obra.', '#E05A4C');
        ctl.loop(dt => {
            limite -= dt; prog = Math.max(0, prog - 17 * dt); sacudida *= 0.85;
            c.fillStyle = '#140c08'; c.fillRect(0, 0, W, H); c.save(); c.translate(rnd(-1, 1) * sacudida, rnd(-1, 1) * sacudida);
            c.fillStyle = '#2b2118'; c.fillRect(W / 2 - 80, 190, 160, 60);
            OroDraw.dibujar(c, obra.forma, W / 2, 130, 2.6);
            c.fillStyle = 'rgba(160,210,230,0.18)'; c.fillRect(W / 2 - 90, 40, 180, 160); c.strokeStyle = 'rgba(190,230,250,0.65)'; c.lineWidth = 3; c.strokeRect(W / 2 - 90, 40, 180, 160);
            c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.5;
            grietas.forEach(g => { c.beginPath(); c.moveTo(g.x, g.y); c.lineTo(g.x + Math.cos(g.a) * g.l, g.y + Math.sin(g.a) * g.l); c.stroke(); });
            c.restore();
            c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(60, 268, W - 120, 16); c.fillStyle = prog > 70 ? '#E05A4C' : '#E8B830'; c.fillRect(60, 268, (W - 120) * Math.min(1, prog / 100), 16);
            c.fillStyle = '#fff'; c.font = '700 13px sans-serif'; c.fillText('Tiempo: ' + Math.max(0, Math.ceil(limite)) + ' s', 16, 24);
            if (limite <= 0) ctl.fin({ ok: false, errores: 1 }, 'No lograste romperla a tiempo.');
        });
    }

    /* ============ TALLER: FORJA (cera perdida) ============ */
    function forja(ctl, obra) {
        const W = 560, H = 320, cv = ctl.canvas(W, H), c = cv.getContext('2d');
        let etapa = 0, temp = 0, enBanda = 0, lim = 16, calor = false, m = 0, dir = 1, errores = 0, golpes = 0, zona = null, bloq = 0, anim = 0, chispas = [];
        const nombres = ['1 · Fundir el oro y el cobre', '2 · Verter en el molde', '3 · Martillar y dar forma'];
        const nuevaZona = w => ({ a: rnd(0.15, 0.85 - w), w });
        const empezarBarra = () => { zona = nuevaZona(etapa === 1 ? 0.2 : 0.14); m = 0; dir = 1; };
        const accion = () => {
            if (etapa === 0) return;
            if (bloq > 0) return;
            if (m >= zona.a && m <= zona.a + zona.w) {
                Sfx.play(etapa === 1 ? 'fuego' : 'martillo'); for (let i = 0; i < 14; i++) chispas.push({ x: W / 2, y: 190, vx: rnd(-120, 120), vy: rnd(-200, -40), v: 1 });
                if (etapa === 1) { etapa = 2; golpes = 0; empezarBarra(); ctl.status(nombres[2]); }
                else { golpes++; if (golpes >= 3) ctl.fin({ ok: true, estrellas: errores <= 1 ? 3 : errores <= 3 ? 2 : 1, errores }, '¡Obra forjada!'); else empezarBarra(); }
            } else { errores++; bloq = 0.4; Sfx.play('mal'); }
        };
        ctl.on(window, 'keydown', e => { if (e.key === ' ') { e.preventDefault(); if (etapa === 0) calor = true; else if (!e.repeat) accion(); } });
        ctl.on(window, 'keyup', e => { if (e.key === ' ') calor = false; });
        ctl.on(cv, 'pointerdown', () => { if (etapa === 0) calor = true; else accion(); });
        ctl.on(window, 'pointerup', () => { calor = false; });
        ctl.status(nombres[0] + ' — mantén ESPACIO (o pulsa) para avivar el fuego y deja la temperatura en la franja dorada.');
        ctl.loop(dt => {
            anim += dt; bloq = Math.max(0, bloq - dt);
            if (etapa === 0) {
                temp = Math.max(0, Math.min(1, temp + (calor ? 0.5 : -0.3) * dt)); lim -= dt;
                if (temp > 0.55 && temp < 0.78) enBanda += dt; else enBanda = Math.max(0, enBanda - dt * 0.5);
                if (calor && Math.random() < 0.3) Sfx.play('fuego');
                if (enBanda >= 3) { etapa = 1; empezarBarra(); ctl.status(nombres[1]); Sfx.play('ok'); }
                if (lim <= 0) { lim = 16; enBanda = 0; temp = 0; errores++; ctl.status('Se enfrió el crisol. Inténtalo de nuevo.', '#E05A4C'); }
            } else if (!bloq) { m += dir * (etapa === 1 ? 0.8 : 1.05 + golpes * 0.2) * dt; if (m > 1) { m = 1; dir = -1; } if (m < 0) { m = 0; dir = 1; } }
            c.fillStyle = '#150d08'; c.fillRect(0, 0, W, H);
            const g = c.createRadialGradient(W / 2, 200, 10, W / 2, 200, 220); g.addColorStop(0, 'rgba(255,120,30,' + (0.15 + temp * 0.5) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
            // crisol / molde / pieza
            if (etapa === 0) {
                c.fillStyle = '#3a2a1c'; c.beginPath(); c.moveTo(W / 2 - 60, 150); c.lineTo(W / 2 + 60, 150); c.lineTo(W / 2 + 40, 215); c.lineTo(W / 2 - 40, 215); c.closePath(); c.fill();
                const col = temp < 0.4 ? '#7a5a3a' : temp < 0.55 ? '#d9772c' : temp < 0.78 ? '#FFD35A' : '#fff6cf';
                c.fillStyle = col; c.beginPath(); c.ellipse(W / 2, 152, 56, 11, 0, 0, 7); c.fill();
                for (let i = 0; i < 5; i++) { const fx = W / 2 - 50 + i * 25, h = 20 + temp * 40 + Math.sin(anim * 9 + i) * 8; c.fillStyle = 'rgba(255,' + (100 + i * 20) + ',30,0.8)'; c.beginPath(); c.moveTo(fx - 10, 235); c.quadraticCurveTo(fx, 235 - h, fx + 10, 235); c.fill(); }
                // termómetro
                c.fillStyle = '#2b2118'; c.fillRect(W - 90, 40, 26, 190); c.fillStyle = 'rgba(247,220,136,0.35)'; c.fillRect(W - 90, 40 + 190 * (1 - 0.78), 26, 190 * 0.23);
                c.fillStyle = '#E05A4C'; c.fillRect(W - 86, 40 + 190 * (1 - temp), 18, 190 * temp);
                c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.fillText('Constante: ' + Math.round(enBanda / 3 * 100) + '%', 40, 40); c.fillText('Tiempo: ' + Math.max(0, Math.ceil(lim)) + ' s', 40, 60);
            } else {
                c.fillStyle = '#4a3320'; c.fillRect(W / 2 - 80, 170, 160, 70);
                c.save(); c.globalAlpha = etapa === 1 ? 0.4 : 1; OroDraw.dibujar(c, obra.forma, W / 2, 160, 2.8); c.restore();
                const tx = 50, tw = W - 100, ty = 275; c.fillStyle = '#2b2118'; c.fillRect(tx, ty, tw, 22); c.fillStyle = '#3E8E75'; c.fillRect(tx + zona.a * tw, ty, zona.w * tw, 22);
                c.fillStyle = bloq > 0 ? '#E05A4C' : '#F7DC88'; c.fillRect(tx + m * tw - 3, ty - 8, 6, 38);
                c.fillStyle = '#fff'; c.font = '700 12px sans-serif'; c.fillText(etapa === 1 ? 'Pulsa cuando la aguja esté en la zona verde para verter' : 'Golpes: ' + golpes + '/3 — pulsa en la zona verde', 40, 40);
            }
            chispas.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 400 * dt; s.v -= dt * 1.4; c.fillStyle = 'rgba(255,210,90,' + Math.max(0, s.v) + ')'; c.fillRect(s.x, s.y, 3, 3); }); chispas = chispas.filter(s => s.v > 0);
            c.fillStyle = '#E05A4C'; c.font = '700 12px sans-serif'; c.fillText('Errores: ' + errores, W - 100, H - 12);
        });
    }

    /* ---------- API pública ---------- */
    const DEF = {
        pulir: { f: pulir, badge: 'INTERACTUAR · PULIR', titulo: 'Pulir la obra', ayuda: 'Devuélvele su brillo ancestral retirando la pátina.' },
        reconstruir: { f: reconstruir, badge: 'INTERACTUAR · RECONSTRUIR', titulo: 'Reconstruir la pieza', ayuda: 'La obra se fragmentó: reordena los pedazos de su fotografía.' },
        descifrar: { f: descifrar, badge: 'INTERACTUAR · DESCIFRAR', titulo: 'Descifrar los símbolos', ayuda: 'Los sabios guardaron su secreto en una secuencia de símbolos sagrados. Recuérdala.' },
        dialogar: { f: dialogar, badge: 'INTERACTUAR · DIÁLOGO', titulo: 'Dialogar con el cacique', ayuda: 'Para que te muestre la obra, demuestra que conoces su significado.' },
        sigilo: { f: sigilo, badge: 'ROBAR · SIGILO', titulo: 'Robar en silencio', ayuda: 'Acércate a la pieza sin ser visto. Usa las cajas como cobertura.' },
        ganzua: { f: ganzua, badge: 'ROBAR · GANZÚA', titulo: 'Forzar la cerradura', ayuda: 'Abre la vitrina con precisión: cada pasador exige más pulso.' },
        fuerza: { f: fuerza, badge: 'ROBAR · FUERZA BRUTA', titulo: 'Romper la vitrina', ayuda: 'Rápido y ruidoso. La pieza no saldrá intacta.' },
        forja: { f: forja, badge: 'TALLER · CERA PERDIDA', titulo: 'Forjar la obra', ayuda: 'Funde el oro, vierte el molde y martilla con ritmo.' }
    };

    function jugar(tipo, obra) {
        const d = DEF[tipo]; if (!d) return Promise.resolve({ ok: false });
        return abrir({ badge: d.badge, titulo: d.titulo + ' · ' + obra.titulo.split('(')[0].trim(), ayuda: d.ayuda }, d.f, obra);
    }
    return { jugar, get activo() { return !!actual; } };
})();
window.MG = MG;

/* ---------- Visor de ficha de obra (foto real + relato en audio) ---------- */
let audioObraActual = null;
function abrirVisorObra(obra, contextoTexto) {
    document.getElementById('art-context-badge').textContent = contextoTexto;
    document.getElementById('art-title').textContent = obra.titulo;
    document.getElementById('art-meta').textContent = `${obra.cultura} · ${obra.periodo} · ${obra.tecnica}`;
    document.getElementById('art-desc').textContent = obra.descripcion;
    const imgEl = document.getElementById('art-img'), fb = document.getElementById('art-fallback-svg');
    imgEl.classList.remove('hidden'); fb.classList.add('hidden');
    let idx = 0;
    const probar = () => {
        if (idx >= obra.imagenesPosibles.length) { imgEl.classList.add('hidden'); fb.classList.remove('hidden'); fb.innerHTML = `<div style="font-size:5rem;filter:drop-shadow(0 0 20px #D4A63A)">${obra.emoji}</div><p style="font-size:.8rem;color:#B9AE98;margin-top:10px">Coloca <strong>${obra.imagenesPosibles[0]}</strong> en assets/img/</p>`; return; }
        imgEl.src = 'assets/img/' + obra.imagenesPosibles[idx++];
    };
    imgEl.onerror = probar; probar();
    const a = document.getElementById('bg-audio'); a.pause();
    audioObraActual = obra.audioPosibles || [];
    document.getElementById('btn-art-audio').textContent = '🎵 Escuchar Relato de la Obra';
    document.getElementById('art-audio-status').textContent = '';
    document.getElementById('modal-artifact').classList.remove('hidden');
}
function toggleAudioObra() {
    const a = document.getElementById('bg-audio'), st = document.getElementById('art-audio-status'), bt = document.getElementById('btn-art-audio');
    if (!a.paused) { a.pause(); bt.textContent = '🎵 Escuchar Relato de la Obra'; st.textContent = 'Audio en pausa.'; Sfx.duck(false); return; }
    if (!audioObraActual || !audioObraActual.length) return;
    let i = 0;
    const probar = () => {
        if (i >= audioObraActual.length) { st.textContent = 'Para escuchar el audio, pon ' + audioObraActual[0] + ' en assets/audio/'; return; }
        a.src = 'assets/audio/' + encodeURI(audioObraActual[i++]);
        a.play().then(() => { bt.textContent = '⏸ Pausar Relato'; st.textContent = 'Reproduciendo relato ancestral…'; Sfx.duck(true); }).catch(probar);
    };
    probar();
}
function cerrarModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'modal-artifact') { document.getElementById('bg-audio').pause(); Sfx.duck(false); }
}
window.abrirVisorObra = abrirVisorObra; window.toggleAudioObra = toggleAudioObra; window.cerrarModal = cerrarModal;

/* ---------- Vestidor del indígena (sin cambios de lógica) ---------- */
function abrirVestidor() {
    const cont = document.getElementById('wardrobe-items');
    cont.innerHTML = window.JOYAS_INDIGENA.map(j => `<div class="wardrobe-item ${j.equipada ? 'equipped' : ''}" onclick="toggleJoya('${j.id}')"><div><strong style="color:var(--gold-light);font-size:1rem">${j.emoji} ${j.nombre}</strong><div style="font-size:.82rem;color:var(--text-muted)">${j.desc}</div></div><span style="font-weight:700;color:${j.equipada ? '#4ECCA3' : '#888'}">${j.equipada ? 'EQUIPADO' : 'Equipar'}</span></div>`).join('');
    document.getElementById('modal-wardrobe').classList.remove('hidden'); dibujarPreviewIndigena();
}
function toggleJoya(id) { const j = window.JOYAS_INDIGENA.find(x => x.id === id); if (j) { j.equipada = !j.equipada; abrirVestidor(); } }
function dibujarPreviewIndigena() {
    const cv = document.getElementById('previewCanvas'); if (!cv) return; const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    const cx = 90, cy = 135, g = c.createRadialGradient(cx, cy - 20, 10, cx, cy - 20, 85); g.addColorStop(0, 'rgba(212,166,58,.35)'); g.addColorStop(1, 'transparent'); c.fillStyle = g; c.fillRect(0, 0, 180, 220);
    c.fillStyle = '#D9C7A3'; c.beginPath(); c.roundRect(cx - 24, cy - 28, 48, 68, 12); c.fill(); c.fillStyle = '#A63A2B'; c.fillRect(cx - 24, cy + 5, 48, 10);
    c.fillStyle = '#B87A4B'; c.beginPath(); c.arc(cx, cy - 48, 22, 0, 7); c.fill(); c.fillStyle = '#1A120B'; c.beginPath(); c.arc(cx, cy - 52, 23, Math.PI, 0); c.fill();
    c.beginPath(); c.arc(cx - 7, cy - 48, 2.5, 0, 7); c.arc(cx + 7, cy - 48, 2.5, 0, 7); c.fill();
    const has = id => window.JOYAS_INDIGENA.find(j => j.id === id)?.equipada;
    if (has('diadema')) { c.fillStyle = '#F7DC88'; c.strokeStyle = '#D4A63A'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 22, cy - 64); c.lineTo(cx - 12, cy - 84); c.lineTo(cx, cy - 72); c.lineTo(cx + 12, cy - 84); c.lineTo(cx + 22, cy - 64); c.closePath(); c.fill(); c.stroke(); }
    if (has('nariguera')) { c.strokeStyle = '#F7DC88'; c.lineWidth = 3.5; c.beginPath(); c.arc(cx, cy - 41, 8, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    if (has('pectoral')) { c.fillStyle = '#D4A63A'; c.beginPath(); c.arc(cx, cy - 12, 16, 0, Math.PI); c.fill(); c.strokeStyle = '#F7DC88'; c.lineWidth = 2; c.stroke(); }
    if (has('poporo')) { c.fillStyle = '#F7DC88'; c.beginPath(); c.arc(cx + 34, cy - 2, 10, 0, 7); c.arc(cx + 34, cy - 13, 6, 0, 7); c.fill(); }
}
window.abrirVestidor = abrirVestidor; window.toggleJoya = toggleJoya;
