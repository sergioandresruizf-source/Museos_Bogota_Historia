// =====================================================================
// El mensajero: llevar un documento por las calles de Santafé hasta su
// destino, esquivando patrullas. El laberinto se genera por código.
// data: { item: "el Acta", destination: "el Cabildo", facts: ["...", "..."] }
// =====================================================================
import { montar, el, esc, barajar, plural } from "./mg-comun.js";

export const meta = {
    id: "mensajero",
    name: "El mensajero",
    instructions:
        "Lleva el documento por las calles de Santafé hasta su destino. Esquiva las patrullas: si te atrapan, vuelves al inicio (el reloj sigue corriendo).",
    controles: "<kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> o <kbd>WASD</kbd> · en celular, toca hacia donde quieres ir",
};

const DIRS = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] };
const TECLAS = {
    ArrowUp: "arriba", w: "arriba", W: "arriba",
    ArrowDown: "abajo", s: "abajo", S: "abajo",
    ArrowLeft: "izquierda", a: "izquierda", A: "izquierda",
    ArrowRight: "derecha", d: "derecha", D: "derecha",
};

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

/** Laberinto por retroceso recursivo + algunos muros abiertos (para tener rutas alternas). */
function generarLaberinto(C, R) {
    const W = C * 2 + 1, H = R * 2 + 1;
    const g = Array.from({ length: H }, () => Array(W).fill(1));
    const visto = Array.from({ length: R }, () => Array(C).fill(false));
    const pila = [[0, 0]];
    visto[0][0] = true;
    g[1][1] = 0;
    while (pila.length) {
        const [cx, cy] = pila[pila.length - 1];
        const vecinos = barajar([[1, 0], [-1, 0], [0, 1], [0, -1]])
            .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
            .filter(([x, y]) => x >= 0 && y >= 0 && x < C && y < R && !visto[y][x]);
        if (!vecinos.length) { pila.pop(); continue; }
        const [nx, ny, dx, dy] = vecinos[0];
        visto[ny][nx] = true;
        g[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = 0;
        g[ny * 2 + 1][nx * 2 + 1] = 0;
        pila.push([nx, ny]);
    }
    // Abrir ~10 % de los muros internos restantes
    const muros = [];
    for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
            if (g[y][x] !== 1) continue;
            const horiz = g[y][x - 1] === 0 && g[y][x + 1] === 0 && (y % 2 === 1);
            const vert = g[y - 1][x] === 0 && g[y + 1][x] === 0 && (x % 2 === 1);
            if (horiz || vert) muros.push([x, y]);
        }
    }
    barajar(muros).slice(0, Math.round(muros.length * 0.1)).forEach(([x, y]) => (g[y][x] = 0));
    return g;
}

function bfs(g, desde, hasta) {
    const H = g.length, W = g[0].length;
    const previo = new Map();
    const clave = (x, y) => y * W + x;
    const cola = [desde];
    previo.set(clave(...desde), null);
    while (cola.length) {
        const [x, y] = cola.shift();
        if (x === hasta[0] && y === hasta[1]) break;
        for (const [dx, dy] of Object.values(DIRS)) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || g[ny][nx] || previo.has(clave(nx, ny))) continue;
            previo.set(clave(nx, ny), [x, y]);
            cola.push([nx, ny]);
        }
    }
    const camino = [];
    let p = hasta;
    if (!previo.has(clave(...hasta))) return [];
    while (p) { camino.unshift(p); p = previo.get(clave(...p)); }
    return camino;
}

function jugar(ctx) {
    const { escena } = ctx;
    const item = ctx.datos.item || "el documento";
    const destino = ctx.datos.destination || "el Cabildo";
    const hechos = Array.isArray(ctx.datos.facts) ? ctx.datos.facts.filter(Boolean) : [];

    const zona = el("div", "mg-men-zona");
    escena.appendChild(zona);

    // Tamaño del laberinto según la forma del espacio (se decide una vez)
    const r0 = escena.getBoundingClientRect();
    const asp = Math.max(0.5, Math.min(2.4, (r0.width || 900) / (r0.height || 460)));
    const R = Math.max(5, Math.min(10, Math.round(Math.sqrt(66 / asp))));
    const C = Math.max(5, Math.min(12, Math.round(66 / R)));
    const g = generarLaberinto(C, R);
    const GW = g[0].length, GH = g.length;
    const INICIO = [1, 1];
    const META_T = [GW - 2, GH - 2];
    const abierto = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH && g[y][x] === 0;

    // Datos en el camino (puntos de información sobre la ruta más corta)
    const ruta = bfs(g, INICIO, META_T);
    const marcas = hechos.map((texto, i) => {
        const idx = Math.round(((i + 1) / (hechos.length + 1)) * (ruta.length - 1));
        const [x, y] = ruta[Math.max(1, Math.min(ruta.length - 2, idx))];
        return { x, y, texto, tomado: false };
    });

    // Patrullas sobre corredores rectos lejos del inicio
    const ocupado = new Set();
    const segmentos = [];
    for (const horizontal of [true, false]) {
        const L1 = horizontal ? GH : GW, L2 = horizontal ? GW : GH;
        for (let a = 1; a < L1 - 1; a++) {
            let tramo = [];
            for (let b = 0; b <= L2; b++) {
                const x = horizontal ? b : a, y = horizontal ? a : b;
                if (b < L2 && abierto(x, y)) tramo.push([x, y]);
                else {
                    if (tramo.length >= 4) segmentos.push(tramo);
                    tramo = [];
                }
            }
        }
    }
    const nPatrullas = C * R > 60 ? 4 : 3;
    const patrullas = [];
    // Para que siempre sea justo: una patrulla puede cruzar la ruta más corta (como una
    // calle transversal que hay que atravesar a tiempo), pero nunca recorrerla a lo largo.
    const enRuta = new Set(ruta.map(([x, y]) => x + "," + y));
    const cruces = (s) => s.filter(([x, y]) => enRuta.has(x + "," + y)).length;
    const candidatos = barajar(segmentos)
        .filter((s) => cruces(s) <= 2)
        .map((s) => (s.length > 7 ? s.slice(0, 7) : s))
        .sort((a, b) => (cruces(b) > 0) - (cruces(a) > 0));
    for (const s of candidatos) {
        if (patrullas.length >= nPatrullas) break;
        if (cruces(s) > 2) continue;
        const lejos = s.every(([x, y]) => x + y > 6 && !(x === META_T[0] && y === META_T[1]));
        const libre = s.every(([x, y]) => !ocupado.has(x + "," + y));
        if (!lejos || !libre) continue;
        s.forEach(([x, y]) => ocupado.add(x + "," + y));
        patrullas.push({ tramo: s, pos: Math.random() * (s.length - 1), dir: Math.random() < 0.5 ? 1 : -1, vel: 1.7 + Math.random() * 0.8 });
    }

    // ---------- Estado del jugador ----------
    const jug = { tx: INICIO[0], ty: INICIO[1], fx: INICIO[0], fy: INICIO[1], k: 1, dir: null, deseo: null, inv: 0, mirar: "derecha" };
    let sostenida = null;
    let atrapadas = 0;
    let jugando = false;
    let llegado = false;
    let auto = false;
    const VEL = 5.5; // casillas por segundo

    const lz = ctx.lienzo(zona);
    const gc = lz.g;
    lz.canvas.setAttribute("role", "img");
    lz.canvas.setAttribute("aria-label", `Laberinto de calles: lleva ${item} a ${destino}`);

    let T = 20, OX = 0, OY = 0;
    function medidas() {
        T = Math.floor(Math.min(lz.ancho / GW, lz.alto / GH));
        OX = Math.floor((lz.ancho - T * GW) / 2);
        OY = Math.floor((lz.alto - T * GH) / 2);
    }

    const estrellasActuales = () => {
        const base = atrapadas === 0 ? 3 : atrapadas <= 2 ? 2 : 1;
        return ctx.reloj.ms() > 120000 ? Math.min(2, base) : base;
    };
    function hud() {
        ctx.contador(hechos.length ? `Datos <b>${marcas.filter((m) => m.tomado).length}</b>/${hechos.length}` : `Atrapado <b>${atrapadas}</b>`);
        ctx.estrellas(estrellasActuales());
    }

    // ---------- Movimiento ----------
    const posActual = () => ({
        x: jug.fx + (jug.tx - jug.fx) * jug.k,
        y: jug.fy + (jug.ty - jug.fy) * jug.k,
    });

    function intentarPaso(nombre) {
        const [dx, dy] = DIRS[nombre];
        if (!abierto(jug.tx + dx, jug.ty + dy)) return false;
        jug.fx = jug.tx; jug.fy = jug.ty;
        jug.tx += dx; jug.ty += dy;
        jug.k = 0;
        jug.dir = nombre;
        if (dx) jug.mirar = dx > 0 ? "derecha" : "izquierda";
        return true;
    }

    function esCruce(x, y, nombre) {
        // ¿Hay una salida lateral? (para detenerse en las esquinas)
        const [dx, dy] = DIRS[nombre];
        return abierto(x + dy, y + dx) || abierto(x - dy, y - dx);
    }

    function alLlegar() {
        const m = marcas.find((q) => !q.tomado && q.x === jug.tx && q.y === jug.ty);
        if (m) {
            m.tomado = true;
            const i = marcas.indexOf(m);
            ctx.cartel(`<span class="mg-car-num">Dato ${i + 1}</span>${esc(m.texto)}`, Math.min(6500, 2200 + m.texto.length * 38), "dato");
            ctx.sonido("ok");
            chispasEnCasilla(m.x, m.y);
            hud();
        }
        if (jug.tx === META_T[0] && jug.ty === META_T[1]) {
            llegado = true;
            jugando = false;
            chispasEnCasilla(jug.tx, jug.ty, 26);
            ctx.cartel(`¡Entregaste ${esc(item)} en ${esc(destino)}!`, 2500, "ok");
            ctx.ganar({
                score: Math.max(20, 100 - atrapadas * 12 - Math.max(0, ctx.reloj.ms() / 1000 - 60) * 0.4),
                stars: estrellasActuales(),
                resumen: atrapadas === 0 ? "sin ser atrapado" : plural(atrapadas, "vez atrapado", "veces atrapado"),
            });
            return;
        }
        if (auto) { jug.dir = null; return; }
        // Giro pedido de antemano
        if (jug.deseo && jug.deseo !== jug.dir && intentarPaso(jug.deseo)) { jug.deseo = null; return; }
        // Seguir derecho si la tecla sigue presionada o si no hay cruce
        if (jug.dir) {
            const seguir = sostenida === jug.dir || !esCruce(jug.tx, jug.ty, jug.dir);
            if (seguir && intentarPaso(jug.dir)) return;
        }
        jug.dir = null;
        jug.deseo = null;
    }

    function pedir(nombre) {
        if (!jugando) return;
        if (jug.k >= 1) {
            if (!intentarPaso(nombre)) { jug.deseo = null; }
        } else {
            jug.deseo = nombre;
            // Media vuelta inmediata
            const [dx, dy] = DIRS[nombre];
            const [cx, cy] = DIRS[jug.dir] || [0, 0];
            if (dx === -cx && dy === -cy) {
                [jug.fx, jug.tx] = [jug.tx, jug.fx];
                [jug.fy, jug.ty] = [jug.ty, jug.fy];
                jug.k = 1 - jug.k;
                jug.dir = nombre;
                jug.deseo = null;
                if (dx) jug.mirar = dx > 0 ? "derecha" : "izquierda";
            }
        }
    }

    function atrapar() {
        atrapadas++;
        jug.tx = jug.fx = INICIO[0];
        jug.ty = jug.fy = INICIO[1];
        jug.k = 1;
        jug.dir = jug.deseo = null;
        jug.inv = 1.4;
        ctx.sacudir(zona);
        ctx.destello("error");
        ctx.sonido("error");
        ctx.cartel("¡La patrulla te atrapó! Vuelves al inicio", 1600, "error");
        hud();
    }

    function chispasEnCasilla(x, y, n = 14) {
        const r = lz.canvas.getBoundingClientRect();
        const p = ctx.aRaiz(r.left + OX + (x + 0.5) * T, r.top + OY + (y + 0.5) * T);
        ctx.chispas(p.x, p.y, n);
    }

    // ---------- Controles ----------
    ctx.on(document, "keydown", (e) => {
        const d = TECLAS[e.key];
        if (!d || !jugando) return;
        e.preventDefault();
        sostenida = d;
        if (!e.repeat) pedir(d);
    });
    ctx.on(document, "keyup", (e) => {
        const d = TECLAS[e.key];
        if (d && sostenida === d) sostenida = null;
    });
    ctx.on(lz.canvas, "pointerdown", (e) => {
        if (!jugando) return;
        e.preventDefault();
        const r = lz.canvas.getBoundingClientRect();
        const p = posActual();
        const dx = e.clientX - r.left - (OX + (p.x + 0.5) * T);
        const dy = e.clientY - r.top - (OY + (p.y + 0.5) * T);
        if (Math.hypot(dx, dy) < T * 0.4) return;
        const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "derecha" : "izquierda") : (dy > 0 ? "abajo" : "arriba");
        pedir(d);
        // Toque sostenido = seguir caminando en esa dirección
        sostenida = d;
    });
    const soltar = () => { sostenida = null; };
    ctx.on(lz.canvas, "pointerup", soltar);
    ctx.on(lz.canvas, "pointercancel", soltar);

    // ---------- Actualización ----------
    function actualizar(dt) {
        if (jug.inv > 0) jug.inv -= dt;
        if (jug.k < 1) {
            jug.k = Math.min(1, jug.k + VEL * dt);
            if (jug.k >= 1) alLlegar();
        } else if (auto && jugando) {
            pasoBot();
        }
        for (const p of patrullas) {
            p.pos += p.dir * p.vel * dt;
            if (p.pos >= p.tramo.length - 1) { p.pos = p.tramo.length - 1; p.dir = -1; }
            if (p.pos <= 0) { p.pos = 0; p.dir = 1; }
        }
        if (!jugando || jug.inv > 0) return;
        const yo = posActual();
        for (const p of patrullas) {
            const q = posPatrulla(p);
            if (Math.hypot(q.x - yo.x, q.y - yo.y) < 0.62) { atrapar(); break; }
        }
    }

    function posPatrulla(p) {
        const i = Math.floor(p.pos);
        const f = p.pos - i;
        const a = p.tramo[i], b = p.tramo[Math.min(i + 1, p.tramo.length - 1)];
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
    }

    function pasoBot() {
        const camino = bfs(g, [jug.tx, jug.ty], META_T);
        if (camino.length < 2) return;
        const [nx, ny] = camino[1];
        const peligro = patrullas.some((p) => {
            const q = posPatrulla(p);
            return Math.hypot(q.x - nx, q.y - ny) < 1.9;
        });
        if (peligro) return;
        const nombre = Object.keys(DIRS).find((k) => DIRS[k][0] === nx - jug.tx && DIRS[k][1] === ny - jug.ty);
        intentarPaso(nombre);
    }

    // ---------- Dibujo ----------
    function dibujar(t) {
        medidas();
        const W = lz.ancho, H = lz.alto;
        gc.fillStyle = "#e9dcc0";
        gc.fillRect(0, 0, W, H);
        // Calles
        for (let y = 0; y < GH; y++) {
            for (let x = 0; x < GW; x++) {
                const px = OX + x * T, py = OY + y * T;
                if (g[y][x] === 0) {
                    gc.fillStyle = (x + y) % 2 ? "#d8c6a3" : "#d3bf9a";
                    gc.fillRect(px, py, T, T);
                    gc.fillStyle = "rgba(143,122,88,0.25)";
                    gc.fillRect(px + T * 0.2, py + T * 0.3, T * 0.18, T * 0.12);
                    gc.fillRect(px + T * 0.6, py + T * 0.65, T * 0.2, T * 0.12);
                }
            }
        }
        // Manzanas (muros): casas encaladas con tejado
        for (let y = 0; y < GH; y++) {
            for (let x = 0; x < GW; x++) {
                if (g[y][x] !== 1) continue;
                const px = OX + x * T, py = OY + y * T;
                gc.fillStyle = "#f8f0e1";
                gc.fillRect(px, py, T + 0.5, T + 0.5);
                gc.fillStyle = "#c46a50";
                gc.fillRect(px + 1, py + 1, T - 1.5, T * 0.62);
                gc.fillStyle = "rgba(64,51,38,0.15)";
                for (let k = 1; k < 4; k++) gc.fillRect(px + (k * T) / 4, py + 1, 1, T * 0.62);
                // Sombra hacia la calle
                if (abierto(x, y + 1)) { gc.fillStyle = "rgba(64,51,38,0.18)"; gc.fillRect(px, py + T, T, T * 0.12); }
            }
        }
        // Marco
        gc.strokeStyle = "#8f7a58";
        gc.lineWidth = 2;
        gc.strokeRect(OX + 1, OY + 1, GW * T - 2, GH * T - 2);

        // Destino: edificio con bandera
        const mx = OX + META_T[0] * T, my = OY + META_T[1] * T;
        const brillo = 0.5 + Math.sin(t / 250) * 0.25;
        gc.fillStyle = `rgba(217,164,65,${brillo})`;
        gc.beginPath(); gc.arc(mx + T / 2, my + T / 2, T * 0.62, 0, Math.PI * 2); gc.fill();
        gc.fillStyle = "#f8f0e1";
        gc.fillRect(mx + T * 0.15, my + T * 0.35, T * 0.7, T * 0.5);
        gc.fillStyle = "#b6533c";
        gc.beginPath(); gc.moveTo(mx + T * 0.08, my + T * 0.38); gc.lineTo(mx + T * 0.5, my + T * 0.12); gc.lineTo(mx + T * 0.92, my + T * 0.38); gc.fill();
        gc.fillStyle = "#6b4a2f";
        gc.fillRect(mx + T * 0.42, my + T * 0.58, T * 0.16, T * 0.27);
        // Bandera
        gc.fillStyle = "#403326";
        gc.fillRect(mx + T * 0.7, my - T * 0.15, 1.5, T * 0.4);
        gc.fillStyle = "#d9a441"; gc.fillRect(mx + T * 0.7, my - T * 0.15, T * 0.28, T * 0.08);
        gc.fillStyle = "#2f4a6e"; gc.fillRect(mx + T * 0.7, my - T * 0.07, T * 0.28, T * 0.05);
        gc.fillStyle = "#b6533c"; gc.fillRect(mx + T * 0.7, my - T * 0.02, T * 0.28, T * 0.05);

        // Marcas de datos
        for (const m of marcas) {
            if (m.tomado) continue;
            const cx = OX + (m.x + 0.5) * T, cy = OY + (m.y + 0.5) * T + Math.sin(t / 300 + m.x) * T * 0.06;
            gc.fillStyle = "#b6533c";
            gc.beginPath(); gc.arc(cx, cy, T * 0.26, 0, Math.PI * 2); gc.fill();
            gc.fillStyle = "#f8f0e1";
            gc.font = `bold ${Math.round(T * 0.34)}px Georgia, serif`;
            gc.textAlign = "center"; gc.textBaseline = "middle";
            gc.fillText("i", cx, cy + 1);
        }

        // Patrullas
        for (const p of patrullas) {
            const q = posPatrulla(p);
            const cx = OX + (q.x + 0.5) * T, cy = OY + (q.y + 0.5) * T;
            const a = p.tramo[0], b = p.tramo[p.tramo.length - 1];
            const horizontal = a[1] === b[1];
            const vx = horizontal ? p.dir : 0, vy = horizontal ? 0 : p.dir;
            // Cono de vista
            gc.fillStyle = "rgba(182,83,60,0.18)";
            gc.beginPath();
            gc.moveTo(cx, cy);
            gc.lineTo(cx + vx * T * 1.2 - vy * T * 0.45, cy + vy * T * 1.2 - vx * T * 0.45);
            gc.lineTo(cx + vx * T * 1.2 + vy * T * 0.45, cy + vy * T * 1.2 + vx * T * 0.45);
            gc.closePath(); gc.fill();
            gc.fillStyle = "rgba(64,51,38,0.25)";
            gc.beginPath(); gc.ellipse(cx, cy + T * 0.3, T * 0.3, T * 0.1, 0, 0, Math.PI * 2); gc.fill();
            gc.fillStyle = "#2f4a6e";
            gc.beginPath(); gc.arc(cx, cy, T * 0.32, 0, Math.PI * 2); gc.fill();
            gc.strokeStyle = "#f5ead5"; gc.lineWidth = Math.max(1, T * 0.06);
            gc.beginPath(); gc.moveTo(cx - T * 0.22, cy - T * 0.2); gc.lineTo(cx + T * 0.22, cy + T * 0.2); gc.stroke();
            gc.fillStyle = "#1d1a17";
            gc.fillRect(cx - T * 0.17, cy - T * 0.42, T * 0.34, T * 0.28);
            gc.fillStyle = "#d9a441";
            gc.fillRect(cx - T * 0.05, cy - T * 0.36, T * 0.1, T * 0.1);
        }

        // Jugador
        const yo = posActual();
        const parpadeo = jug.inv > 0 && Math.floor(jug.inv * 10) % 2 === 0;
        if (!parpadeo) {
            const cx = OX + (yo.x + 0.5) * T, cy = OY + (yo.y + 0.5) * T;
            const rebote = jug.k < 1 ? Math.abs(Math.sin(jug.k * Math.PI)) * T * 0.08 : 0;
            gc.fillStyle = "rgba(64,51,38,0.25)";
            gc.beginPath(); gc.ellipse(cx, cy + T * 0.32, T * 0.28, T * 0.1, 0, 0, Math.PI * 2); gc.fill();
            gc.fillStyle = "#2c3a35";
            gc.beginPath(); gc.arc(cx, cy - rebote, T * 0.3, 0, Math.PI * 2); gc.fill();
            gc.fillStyle = "#e3b48f";
            gc.beginPath(); gc.arc(cx, cy - T * 0.18 - rebote, T * 0.16, 0, Math.PI * 2); gc.fill();
            gc.fillStyle = "#231b14";
            gc.fillRect(cx - T * 0.2, cy - T * 0.34 - rebote, T * 0.4, T * 0.07);
            gc.fillRect(cx - T * 0.11, cy - T * 0.5 - rebote, T * 0.22, T * 0.17);
            // Documento en la mano
            const lado = jug.mirar === "derecha" ? 1 : -1;
            gc.fillStyle = "#f8f0e1";
            gc.strokeStyle = "#b6533c";
            gc.lineWidth = 1;
            gc.fillRect(cx + lado * T * 0.22 - T * 0.09, cy - T * 0.02 - rebote, T * 0.18, T * 0.24);
            gc.strokeRect(cx + lado * T * 0.22 - T * 0.09, cy - T * 0.02 - rebote, T * 0.18, T * 0.24);
        }
        // Inicio
        if (!jugando && !llegado) {
            gc.strokeStyle = "rgba(182,83,60,0.8)";
            gc.setLineDash([3, 3]);
            gc.strokeRect(OX + INICIO[0] * T + 2, OY + INICIO[1] * T + 2, T - 4, T - 4);
            gc.setLineDash([]);
        }
    }

    ctx.bucle((dt, t) => {
        actualizar(dt);
        dibujar(t);
    });

    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        ctx.cartel(`Lleva <b>${esc(item)}</b> hasta <b>${esc(destino)}</b> (la casa que brilla)`, 2600);
    });

    return {
        prueba: {
            auto(v = true) { auto = v; },
            estado: () => ({ atrapadas, llegado, x: jug.tx, y: jug.ty }),
        },
    };
}
