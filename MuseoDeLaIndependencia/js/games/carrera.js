// =====================================================================
// Carrera por Santafé: corredor lateral. Saltar guardias y barriles,
// recoger objetos; cada objeto muestra un dato de la obra.
// data: { runner: "Antonio Morales", collect: "flores", facts: ["...", ...] }
// Se recogen N = max(3, facts.length) objetos.
// =====================================================================
import { montar, el, esc, plural } from "./mg-comun.js";

export const meta = {
    id: "carrera",
    name: "Carrera por Santafé",
    instructions:
        "Corre por las calles de Santafé: salta a los guardias y barriles, y recoge los objetos. Cada objeto te cuenta un dato de la obra.",
    controles: "<kbd>Espacio</kbd> o <kbd>↑</kbd> para saltar · en celular, toca la pantalla",
};

// Mundo lógico: 300 unidades de alto; el suelo está en y = 250
const ALTO_MUNDO = 300;
const SUELO = 250;
const GRAVEDAD = 1900;
const IMPULSO = 660;
const X_JUGADOR = 90;

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

/** Qué dibujar según la palabra de `collect`. */
function tipoObjeto(texto) {
    const t = String(texto || "").toLowerCase();
    if (/flor|rosa|clavel/.test(t)) return "flor";
    if (/carta|document|acta|papel|peri[oó]dico|libro|mensaje|pliego|hoja|bando/.test(t)) return "pliego";
    if (/moneda|real|peso|oro/.test(t)) return "moneda";
    if (/llave/.test(t)) return "llave";
    return "estrella";
}

function jugar(ctx) {
    const { escena, work } = ctx;
    const datos = ctx.datos;
    const hechos = Array.isArray(datos.facts) ? datos.facts.filter(Boolean) : [];
    const META = Math.max(3, hechos.length);
    const corredor = datos.runner || "El cronista";
    const coleccion = datos.collect || "objetos";
    const tipo = tipoObjeto(coleccion);
    const nombreColeccion = coleccion.charAt(0).toUpperCase() + coleccion.slice(1);

    const zona = el("div", "mg-car-zona");
    escena.appendChild(zona);
    const lz = ctx.lienzo(zona);
    const g = lz.g;
    lz.canvas.setAttribute("role", "img");
    lz.canvas.setAttribute("aria-label", `${corredor} corre por las calles de Santafé`);

    // ---------- Estado ----------
    const jug = { y: SUELO, vy: 0, enSuelo: true, inv: 0, fase: 0, tropiezo: 0 };
    let velocidad = 230;
    let distancia = 0;
    let proximo = 380; // distancia hasta el siguiente "compás" de aparición
    let compases = 0;
    let ultimoObjeto = 0;
    const cosas = []; // { tipo:'guardia'|'barril'|'objeto', x, y, w, h, ... }
    let recogidos = 0;
    let golpes = 0;
    let jugando = false;
    let terminando = false;
    let lentitud = 0; // segundos de cámara lenta mientras se lee un dato
    let auto = false;

    // Fondo: casas coloniales generadas una vez
    const casas = [];
    let anchoCasas = 0;
    for (let i = 0; i < 9; i++) {
        const w = 70 + ((i * 37) % 50);
        casas.push({ x: anchoCasas, w, h: 70 + ((i * 53) % 45), balcon: i % 2 === 0, puerta: (i * 7) % 3 });
        anchoCasas += w + 4;
    }

    const estrellasActuales = () => (golpes <= 1 ? 3 : golpes <= 3 ? 2 : 1);
    function hud() {
        ctx.contador(`${esc(nombreColeccion)} <b>${recogidos}</b>/${META}`);
        ctx.estrellas(estrellasActuales());
    }

    // ---------- Controles ----------
    function saltar() {
        if (!jugando) return;
        if (jug.enSuelo) {
            jug.vy = -IMPULSO;
            jug.enSuelo = false;
            ctx.sonido("salto");
        }
    }
    ctx.on(document, "keydown", (e) => {
        if (e.repeat) return;
        if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            if (jugando) e.preventDefault();
            saltar();
        }
    });
    ctx.on(lz.canvas, "pointerdown", (e) => { e.preventDefault(); saltar(); });

    // ---------- Aparición de obstáculos y objetos ----------
    function anchoVista() {
        const esc_ = escala();
        return lz.ancho / esc_;
    }
    function aparecer() {
        compases++;
        const x = anchoVista() + 40;
        const faltan = META - recogidos - cosas.filter((c) => c.tipo === "objeto").length;
        const tocaObjeto = faltan > 0 && compases - ultimoObjeto >= 4 && !terminando;
        if (tocaObjeto) {
            ultimoObjeto = compases;
            if (Math.random() < 0.5) {
                // Objeto sobre un barril: hay que saltar para tomarlo
                cosas.push({ tipo: "barril", x, y: SUELO, w: 26, h: 30 });
                cosas.push({ tipo: "objeto", x: x + 2, y: SUELO - 105, w: 26, h: 26, t: 0 });
            } else {
                cosas.push({ tipo: "objeto", x, y: SUELO - (Math.random() < 0.5 ? 22 : 80), w: 26, h: 26, t: 0 });
            }
        } else if (!terminando) {
            if (Math.random() < 0.72) cosas.push({ tipo: "guardia", x, y: SUELO, w: 24, h: 58, paso: Math.random() * 6 });
            else cosas.push({ tipo: "barril", x, y: SUELO, w: 26, h: 30 });
        }
        proximo = 300 + Math.random() * 160 + velocidad * 0.25;
    }

    // ---------- Actualización ----------
    function actualizar(dt) {
        if (lentitud > 0) lentitud -= dt;
        const factor = (lentitud > 0 ? 0.6 : 1) * (jug.tropiezo > 0 ? 0.55 : 1);
        if (jug.tropiezo > 0) jug.tropiezo -= dt;
        velocidad = Math.min(320, velocidad + dt * 3);
        const v = velocidad * factor;
        distancia += v * dt;
        proximo -= v * dt;
        if (proximo <= 0) aparecer();

        // Física del salto
        jug.vy += GRAVEDAD * dt;
        jug.y += jug.vy * dt;
        if (jug.y >= SUELO) { jug.y = SUELO; jug.vy = 0; jug.enSuelo = true; }
        jug.fase += dt * (v / 22);
        if (jug.inv > 0) jug.inv -= dt;

        // Bot de pruebas
        if (auto && jug.enSuelo) {
            for (const c of cosas) {
                const d = c.x - X_JUGADOR;
                const necesitaSalto = c.tipo === "guardia" || c.tipo === "barril" || (c.tipo === "objeto" && c.y < SUELO - 60);
                if (necesitaSalto && d > 30 && d < 30 + v * 0.16) { saltar(); break; }
            }
        }

        // Mover y chocar
        const cajaJ = { x: X_JUGADOR - 10, y: jug.y - 50, w: 20, h: 48 };
        for (let i = cosas.length - 1; i >= 0; i--) {
            const c = cosas[i];
            c.x -= v * dt;
            if (c.tipo === "guardia") c.paso += dt * 6;
            if (c.tipo === "objeto") c.t += dt;
            // Los objetos se toman con margen generoso; los obstáculos perdonan un poco
            const m = c.tipo === "objeto" ? -10 : 3;
            const caja = { x: c.x - c.w / 2 + m, y: c.y - c.h + m, w: c.w - 2 * m, h: c.h - 2 * m };
            const choca = cajaJ.x < caja.x + caja.w && cajaJ.x + cajaJ.w > caja.x && cajaJ.y < caja.y + caja.h && cajaJ.y + cajaJ.h > caja.y;
            if (choca && c.tipo === "objeto") {
                cosas.splice(i, 1);
                recoger(c);
                continue;
            }
            if (choca && (c.tipo === "guardia" || c.tipo === "barril") && jug.inv <= 0) {
                golpear();
            }
            if (c.x < -60) cosas.splice(i, 1);
        }
    }

    function aPantalla(x, y) {
        const e = escala();
        const oy = lz.alto - ALTO_MUNDO * e;
        return { x: x * e, y: oy + y * e };
    }

    function recoger(c) {
        recogidos++;
        const p = aPantalla(c.x, c.y - c.h / 2);
        const r = lz.canvas.getBoundingClientRect();
        const pr = ctx.aRaiz(r.left + p.x, r.top + p.y);
        ctx.chispas(pr.x, pr.y, 16);
        ctx.sonido("ok");
        const dato = hechos[recogidos - 1];
        if (dato) {
            const ms = Math.min(6500, 2200 + dato.length * 38);
            ctx.cartel(`<span class="mg-car-num">${recogidos}/${META}</span>${esc(dato)}`, ms, "dato");
            lentitud = ms / 1000;
        } else {
            ctx.cartel(`¡${esc(nombreColeccion)}: ${recogidos} de ${META}!`, 1400, "ok");
        }
        hud();
        if (recogidos >= META && !terminando) {
            terminando = true;
            const espera = dato ? Math.min(6500, 2200 + dato.length * 38) * 0.6 : 900;
            ctx.timeout(() => {
                jugando = false;
                ctx.ganar({ score: Math.max(20, 100 - golpes * 8), stars: estrellasActuales(), resumen: plural(golpes, "tropiezo", "tropiezos") });
            }, espera);
        }
    }

    function golpear() {
        golpes++;
        jug.inv = 1.3;
        jug.tropiezo = 0.6;
        ctx.sacudir(zona);
        ctx.destello("error");
        ctx.sonido("error");
        if (golpes === 1) ctx.cartel("¡Uy! Un guardia. Salta a tiempo", 1300, "error");
        hud();
    }

    // ---------- Dibujo ----------
    function escala() {
        // En pantallas angostas se ve un poco menos de calle por delante (mín. 400 unidades)
        return Math.min(lz.alto / ALTO_MUNDO, lz.ancho / 400);
    }

    function dibujar(t) {
        const e = escala();
        const W = lz.ancho, H = lz.alto;
        const oy = H - ALTO_MUNDO * e;
        // Cielo
        const cielo = g.createLinearGradient(0, 0, 0, H);
        cielo.addColorStop(0, "#f7e3c4");
        cielo.addColorStop(0.6, "#f5ead5");
        cielo.addColorStop(1, "#efdcbf");
        g.fillStyle = cielo;
        g.fillRect(0, 0, W, H);

        // Nubes que se desplazan despacio (llenan el cielo en pantallas altas)
        g.fillStyle = "rgba(255,255,255,0.65)";
        for (let i = 0; i < 6; i++) {
            const anchoNube = 60 + (i % 3) * 26;
            const x = ((i * 173 - distancia * 0.04 * (1 + (i % 2))) % (W + 200) + W + 200) % (W + 200) - 100;
            const y = 24 + ((i * 47) % Math.max(40, oy + 70 * e));
            g.beginPath();
            g.ellipse(x, y, anchoNube * 0.5, 10, 0, 0, Math.PI * 2);
            g.ellipse(x + anchoNube * 0.18, y - 7, anchoNube * 0.28, 10, 0, 0, Math.PI * 2);
            g.fill();
        }
        // Aves lejanas
        g.strokeStyle = "rgba(64,51,38,0.35)";
        g.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const x = ((i * 240 + t * 0.02 * (i + 1)) % (W + 60)) - 30;
            const y = 40 + i * 22 + Math.sin(t / 400 + i) * 4;
            const a = Math.sin(t / 120 + i) * 3;
            g.beginPath();
            g.moveTo(x - 6, y - a);
            g.quadraticCurveTo(x - 3, y - 4, x, y);
            g.quadraticCurveTo(x + 3, y - 4, x + 6, y - a);
            g.stroke();
        }

        g.save();
        g.translate(0, oy);
        g.scale(e, e);
        const VW = W / e;

        // Sol suave
        g.fillStyle = "rgba(239,164,127,0.35)";
        g.beginPath();
        g.arc(VW * 0.78, 60, 26, 0, Math.PI * 2);
        g.fill();

        // Cerros orientales (Monserrate y Guadalupe), parallax lento
        const desM = (distancia * 0.08) % 700;
        g.fillStyle = "#9fae97";
        for (let k = -1; k < VW / 700 + 2; k++) {
            const bx = k * 700 - desM;
            g.beginPath();
            g.moveTo(bx, 190);
            g.quadraticCurveTo(bx + 120, 70, bx + 230, 120);
            g.quadraticCurveTo(bx + 320, 50, bx + 430, 110);
            g.quadraticCurveTo(bx + 560, 160, bx + 700, 190);
            g.closePath();
            g.fill();
            // Capilla en la cima
            g.fillStyle = "#f8f0e1";
            g.fillRect(bx + 222, 104, 14, 12);
            g.fillStyle = "#b6533c";
            g.fillRect(bx + 226, 96, 6, 8);
            g.fillStyle = "#9fae97";
        }

        // Casas coloniales, parallax medio
        const desC = (distancia * 0.45) % anchoCasas;
        for (let k = -1; k < VW / anchoCasas + 2; k++) {
            for (const c of casas) {
                const x = k * anchoCasas + c.x - desC;
                if (x > VW || x + c.w < 0) continue;
                const top = SUELO - 18 - c.h;
                g.fillStyle = "#f8f0e1";
                g.fillRect(x, top, c.w, c.h);
                g.fillStyle = "rgba(203,185,148,0.5)";
                g.fillRect(x, SUELO - 30, c.w, 12); // zócalo
                // Tejado
                g.fillStyle = "#b6533c";
                g.beginPath();
                g.moveTo(x - 5, top + 2);
                g.lineTo(x + c.w + 5, top + 2);
                g.lineTo(x + c.w - 4, top - 10);
                g.lineTo(x + 4, top - 10);
                g.closePath();
                g.fill();
                g.fillStyle = "rgba(64,51,38,0.18)";
                for (let tx = x; tx < x + c.w; tx += 7) g.fillRect(tx, top - 9, 1.2, 10);
                // Puerta
                g.fillStyle = "#6b4a2f";
                const px = x + c.w * (0.25 + c.puerta * 0.2);
                g.fillRect(px, SUELO - 48, 16, 30);
                g.beginPath();
                g.arc(px + 8, SUELO - 48, 8, Math.PI, 0);
                g.fill();
                // Ventanas / balcón
                g.fillStyle = "#2c3a35";
                if (c.balcon) {
                    g.fillRect(x + 8, top + 14, c.w - 16, 4);
                    for (let bx = x + 10; bx < x + c.w - 10; bx += 6) g.fillRect(bx, top + 18, 2, 12);
                    g.fillRect(x + 8, top + 30, c.w - 16, 3);
                } else {
                    g.fillRect(x + c.w - 26, top + 16, 12, 16);
                    g.fillStyle = "#f5ead5";
                    g.fillRect(x + c.w - 21, top + 16, 1.5, 16);
                }
            }
        }

        // Calle empedrada
        g.fillStyle = "#cbb994";
        g.fillRect(0, SUELO - 2, VW, ALTO_MUNDO - SUELO + 2);
        g.fillStyle = "#b9a57d";
        const desP = distancia % 18;
        for (let fila = 0; fila < 4; fila++) {
            const yy = SUELO + 4 + fila * 12;
            const off = fila % 2 ? 9 : 0;
            for (let x = -desP - off; x < VW + 20; x += 18) {
                g.beginPath();
                g.ellipse(x + 9, yy + 4, 7.5, 4.2, 0, 0, Math.PI * 2);
                g.fill();
            }
        }
        g.fillStyle = "#8f7a58";
        g.fillRect(0, SUELO - 2, VW, 3);

        // Cosas
        for (const c of cosas) {
            if (c.tipo === "guardia") dibujarGuardia(c);
            else if (c.tipo === "barril") dibujarBarril(c);
            else dibujarObjeto(c, t);
        }
        dibujarCorredor(t);

        g.restore();
    }

    function sombra(x, w) {
        g.fillStyle = "rgba(64,51,38,0.22)";
        g.beginPath();
        g.ellipse(x, SUELO + 2, w, 3.5, 0, 0, Math.PI * 2);
        g.fill();
    }

    function dibujarCorredor() {
        const x = X_JUGADOR;
        const y = jug.y;
        if (jug.inv > 0 && Math.floor(jug.inv * 12) % 2 === 0) return; // parpadeo
        sombra(x, 12 - Math.min(8, (SUELO - y) / 12));
        const p = jug.enSuelo ? Math.sin(jug.fase) : 0.6;
        g.lineCap = "round";
        // Piernas
        g.strokeStyle = "#2b2219";
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x, y - 20);
        g.lineTo(x + p * 9, y - 1);
        g.moveTo(x, y - 20);
        g.lineTo(x - p * 9, y - 1);
        g.stroke();
        // Levita
        g.fillStyle = "#2c3a35";
        g.beginPath();
        g.moveTo(x - 9, y - 44);
        g.lineTo(x + 9, y - 44);
        g.lineTo(x + 11, y - 16);
        g.lineTo(x - 13, y - 14);
        g.closePath();
        g.fill();
        // Chaleco y corbatín
        g.fillStyle = "#b6533c";
        g.fillRect(x - 3, y - 43, 7, 14);
        g.fillStyle = "#f8f0e1";
        g.fillRect(x - 2, y - 45, 5, 4);
        // Brazo
        g.strokeStyle = "#2c3a35";
        g.lineWidth = 4.5;
        g.beginPath();
        g.moveTo(x, y - 40);
        g.lineTo(x - p * 10 + 2, y - 26);
        g.stroke();
        // Cabeza
        g.fillStyle = "#e3b48f";
        g.beginPath();
        g.arc(x + 1, y - 52, 7.5, 0, Math.PI * 2);
        g.fill();
        // Sombrero de copa
        g.fillStyle = "#231b14";
        g.fillRect(x - 9, y - 59, 20, 3);
        g.fillRect(x - 5, y - 72, 13, 14);
        g.fillStyle = "#b6533c";
        g.fillRect(x - 5, y - 62, 13, 2.5);
    }

    function dibujarGuardia(c) {
        const x = c.x, y = c.y;
        sombra(x, 12);
        const p = Math.sin(c.paso) * 0.5;
        g.lineCap = "round";
        g.strokeStyle = "#f5ead5";
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x, y - 22); g.lineTo(x + p * 7, y - 1);
        g.moveTo(x, y - 22); g.lineTo(x - p * 7, y - 1);
        g.stroke();
        g.fillStyle = "#231b14";
        g.fillRect(x + p * 7 - 3, y - 4, 7, 4);
        g.fillRect(x - p * 7 - 3, y - 4, 7, 4);
        // Casaca azul con correaje blanco
        g.fillStyle = "#2f4a6e";
        g.fillRect(x - 10, y - 46, 20, 26);
        g.strokeStyle = "#f5ead5";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 9, y - 45); g.lineTo(x + 9, y - 22);
        g.moveTo(x + 9, y - 45); g.lineTo(x - 9, y - 22);
        g.stroke();
        g.fillStyle = "#b6533c";
        g.fillRect(x - 10, y - 22, 20, 3);
        // Fusil
        g.strokeStyle = "#5a3e26";
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - 14, y - 18); g.lineTo(x - 8, y - 66);
        g.stroke();
        g.strokeStyle = "#7d7d7d";
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x - 8, y - 66); g.lineTo(x - 7, y - 74);
        g.stroke();
        // Cabeza y chacó
        g.fillStyle = "#e0ad86";
        g.beginPath();
        g.arc(x, y - 52, 7, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#1d1a17";
        g.fillRect(x - 8, y - 70, 16, 13);
        g.fillStyle = "#d9a441";
        g.fillRect(x - 2, y - 67, 4, 5);
        g.fillStyle = "#b6533c";
        g.fillRect(x - 2, y - 76, 4, 6);
    }

    function dibujarBarril(c) {
        const x = c.x, y = c.y;
        sombra(x, 14);
        g.fillStyle = "#8a5a35";
        g.beginPath();
        g.ellipse(x, y - 15, 13, 15, 0, 0, Math.PI * 2);
        g.fill();
        g.fillRect(x - 12, y - 28, 24, 26);
        g.fillStyle = "#5e3c22";
        g.fillRect(x - 13, y - 24, 26, 3);
        g.fillRect(x - 13, y - 9, 26, 3);
        g.fillStyle = "rgba(255,255,255,0.15)";
        g.fillRect(x - 6, y - 27, 3, 24);
    }

    function dibujarObjeto(c, t) {
        const x = c.x;
        const y = c.y - 13 + Math.sin(c.t * 4) * 3;
        // Halo
        const halo = g.createRadialGradient(x, y, 2, x, y, 22);
        halo.addColorStop(0, "rgba(255,226,150,0.85)");
        halo.addColorStop(1, "rgba(255,226,150,0)");
        g.fillStyle = halo;
        g.beginPath();
        g.arc(x, y, 22, 0, Math.PI * 2);
        g.fill();
        if (tipo === "flor") {
            g.fillStyle = "#efa47f";
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + c.t;
                g.beginPath();
                g.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 3.5, a, 0, Math.PI * 2);
                g.fill();
            }
            g.fillStyle = "#d9a441";
            g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
            g.strokeStyle = "#5f7a4a"; g.lineWidth = 2;
            g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x, y + 15); g.stroke();
        } else if (tipo === "pliego") {
            g.fillStyle = "#f8f0e1";
            g.strokeStyle = "#8f7a58";
            g.lineWidth = 1.2;
            g.fillRect(x - 9, y - 11, 18, 22);
            g.strokeRect(x - 9, y - 11, 18, 22);
            g.fillStyle = "#8f7a58";
            for (let i = 0; i < 4; i++) g.fillRect(x - 6, y - 7 + i * 4.5, 12, 1.2);
            g.fillStyle = "#b6533c";
            g.beginPath(); g.arc(x + 5, y + 8, 4, 0, Math.PI * 2); g.fill();
        } else if (tipo === "moneda") {
            const s = Math.abs(Math.cos(c.t * 3));
            g.fillStyle = "#d9a441";
            g.beginPath(); g.ellipse(x, y, 10 * s + 1, 10, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = "#b78a2c";
            g.beginPath(); g.ellipse(x, y, 6 * s, 6, 0, 0, Math.PI * 2); g.fill();
        } else if (tipo === "llave") {
            g.strokeStyle = "#d9a441"; g.lineWidth = 3;
            g.beginPath(); g.arc(x - 5, y, 5, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(x, y); g.lineTo(x + 11, y); g.lineTo(x + 11, y + 5); g.moveTo(x + 7, y); g.lineTo(x + 7, y + 4); g.stroke();
        } else {
            g.fillStyle = "#d9a441";
            g.beginPath();
            for (let i = 0; i < 10; i++) {
                const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + c.t;
                const r = i % 2 ? 4.5 : 11;
                g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
            }
            g.closePath();
            g.fill();
        }
    }

    // ---------- Bucle ----------
    ctx.bucle((dt, t) => {
        if (jugando) actualizar(dt);
        dibujar(t);
    });

    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        ctx.cartel(`¡Corre, ${esc(corredor)}! Recoge ${META} ${esc(coleccion)}`, 2200);
        try { lz.canvas.focus({ preventScroll: true }); } catch (e) {}
    });

    return {
        prueba: {
            auto(v = true) { auto = v; },
            estado: () => ({ recogidos, golpes, meta: META }),
        },
    };
}
