// =====================================================================
// La imprenta de Nariño: juego de ritmo. Los tipos (letras) bajan por
// 3 carriles; hay que tocarlos al pasar por la platina, en el orden de
// la frase, para imprimirla.
// data: { phrase: "LOS HOMBRES NACEN LIBRES", facts: ["..."] }
// =====================================================================
import { montar, el, esc } from "./mg-comun.js";

export const meta = {
    id: "imprenta",
    name: "La imprenta",
    instructions:
        "Las letras bajan por tres carriles. Cuando la letra que sigue en la frase llegue a la franja dorada, toca su carril para imprimirla.",
    controles: "<kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> o <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> · también tocando el carril",
};

const ZONA_Y = 0.8; // posición de la platina (fracción del alto)
const TOLERANCIA = 0.085;
const TECLAS = {
    a: 0, A: 0, j: 0, J: 0, ArrowLeft: 0, 1: 0,
    s: 1, S: 1, k: 1, K: 1, ArrowDown: 1, 2: 1,
    d: 2, D: 2, l: 2, L: 2, ArrowRight: 2, 3: 2,
};
const ROTULOS = ["A", "S", "D"];

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

const esLetra = (c) => /[\p{L}\p{N}]/u.test(c);

function jugar(ctx) {
    const { escena } = ctx;
    const frase = String(ctx.datos.phrase || "LIBERTAD Y ORDEN").toUpperCase().replace(/\s+/g, " ").trim();
    const hechos = Array.isArray(ctx.datos.facts) ? ctx.datos.facts.filter(Boolean) : [];
    const letras = [...frase];
    const totalLetras = letras.filter(esLetra).length;
    const alfabeto = [...new Set(letras.filter(esLetra))];
    const relleno = "ABCDEFGILMNOPRSTUV".split("");

    // ---------- DOM: pliego con la frase ----------
    const pliego = el("div", "mg-imp-pliego");
    pliego.setAttribute("aria-label", "Frase por imprimir");
    const spans = [];
    frase.split(" ").forEach((palabra, wi, arr) => {
        const p = el("span", "mg-imp-palabra");
        for (const c of palabra) {
            const s = el("span", esLetra(c) ? "mg-imp-letra" : "mg-imp-signo", esc(c));
            p.appendChild(s);
            spans.push(s);
        }
        pliego.appendChild(p);
        if (wi < arr.length - 1) spans.push(null); // el espacio
    });
    const zona = el("div", "mg-imp-zona");
    escena.append(pliego, zona);
    const lz = ctx.lienzo(zona);
    const g = lz.g;
    // Los carteles aparecen debajo del pliego para no tapar la frase
    const ubicarCartel = () => escena.style.setProperty("--mg-cartel-top", pliego.offsetTop + pliego.offsetHeight + 8 + "px");
    ctx.observarTamano(pliego, ubicarCartel);
    ubicarCartel();
    lz.canvas.setAttribute("role", "img");
    lz.canvas.setAttribute("aria-label", "Prensa con tres carriles de letras");

    // ---------- Estado ----------
    let indice = 0; // posición en `letras`
    let aciertos = 0, fallos = 0, perdidas = 0;
    let jugando = false;
    let auto = false;
    const bloques = [];
    const pads = [0, 0, 0]; // brillo de cada carril (positivo: acierto, negativo: fallo)
    let proximoSpawn = 0.4;
    let ultimoEnCarril = [-1, -1, -1];
    let hechosMostrados = 0;
    let fin = false;

    function avanzarSignos() {
        while (indice < letras.length && !esLetra(letras[indice])) {
            if (spans[indice]) spans[indice].classList.add("mg-impreso");
            indice++;
        }
    }
    avanzarSignos();
    const necesaria = () => letras[indice];
    const progreso = () => aciertos / totalLetras;
    const precision = () => (aciertos + fallos + perdidas === 0 ? 1 : aciertos / (aciertos + fallos + perdidas * 0.5));
    const estrellasActuales = () => (precision() >= 0.85 ? 3 : precision() >= 0.65 ? 2 : 1);

    function marcarSiguiente() {
        spans.forEach((s, i) => s && s.classList.toggle("mg-siguiente", i === indice));
    }
    function hud() {
        ctx.contador(`<b>${aciertos}</b>/${totalLetras} letras`);
        ctx.estrellas(estrellasActuales());
    }

    // ---------- Aparición ----------
    function velocidad() {
        // fracción de alto por segundo: de ~2,6 s a ~1,9 s para llegar a la platina
        return (ZONA_Y / (2.6 - progreso() * 0.7));
    }
    function aparecer() {
        const libres = [0, 1, 2].filter((c) => ultimoEnCarril[c] < 0 || ultimoEnCarril[c] > 0.26);
        if (!libres.length) return;
        const carril = libres[Math.floor(Math.random() * libres.length)];
        const objetivo = necesaria();
        const objetivoEnJuego = bloques.some((b) => b.letra === objetivo && b.y < ZONA_Y && !b.estado);
        let letra;
        if (!objetivoEnJuego || Math.random() < 0.35) letra = objetivo;
        else {
            const pool = alfabeto.length > 3 ? alfabeto : relleno;
            do { letra = pool[Math.floor(Math.random() * pool.length)]; } while (letra === objetivo && pool.length > 1);
        }
        bloques.push({ carril, letra, y: -0.08, estado: null, t: 0 });
    }

    // ---------- Golpe en un carril ----------
    function tocar(carril) {
        if (!jugando) return;
        let mejor = null, d = Infinity;
        for (const b of bloques) {
            if (b.carril !== carril || b.estado) continue;
            const dist = Math.abs(b.y - ZONA_Y);
            if (dist < TOLERANCIA && dist < d) { mejor = b; d = dist; }
        }
        if (mejor && mejor.letra === necesaria()) {
            mejor.estado = "ok";
            mejor.t = 0;
            aciertos++;
            pads[carril] = 1;
            const s = spans[indice];
            if (s) {
                s.classList.add("mg-impreso", "mg-golpe");
                ctx.timeout(() => s.classList.remove("mg-golpe"), 450);
            }
            indice++;
            avanzarSignos();
            marcarSiguiente();
            const p = posBloque(mejor);
            const r = lz.canvas.getBoundingClientRect();
            const q = ctx.aRaiz(r.left + p.x, r.top + p.y);
            ctx.chispas(q.x, q.y, 12);
            ctx.sonido("ok");
            // Datos a lo largo de la impresión
            if (hechosMostrados < hechos.length && progreso() >= (hechosMostrados + 1) / (hechos.length + 1)) {
                const h = hechos[hechosMostrados++];
                ctx.cartel(esc(h), Math.min(6000, 2200 + h.length * 35), "dato");
            }
            if (indice >= letras.length) terminar();
        } else {
            fallos++;
            pads[carril] = -1;
            if (mejor) { mejor.estado = "mal"; mejor.t = 0; }
            ctx.sacudir(pliego);
            ctx.sonido("error");
        }
        hud();
    }

    function terminar() {
        fin = true;
        jugando = false;
        pliego.classList.add("mg-imp-completo");
        ctx.cartel("¡Frase impresa!", 2000, "ok");
        ctx.ganar({
            score: Math.round(40 + precision() * 60),
            stars: estrellasActuales(),
            resumen: `precisión ${Math.round(precision() * 100)} %`,
        });
    }

    // ---------- Controles ----------
    ctx.on(document, "keydown", (e) => {
        if (!jugando || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const c = TECLAS[e.key];
        if (c === undefined) return;
        e.preventDefault();
        tocar(c);
    });
    ctx.on(lz.canvas, "pointerdown", (e) => {
        e.preventDefault();
        // El carril se calcula sobre la prensa dibujada (centrada), no sobre todo el lienzo
        const r = lz.canvas.getBoundingClientRect();
        const { x0, carril } = geometria();
        const c = Math.max(0, Math.min(2, Math.floor((e.clientX - r.left - x0) / carril)));
        tocar(c);
    });

    // ---------- Geometría ----------
    function geometria() {
        const W = lz.ancho, H = lz.alto;
        const anchoPrensa = Math.min(W - 16, 460);
        const x0 = (W - anchoPrensa) / 2;
        const carril = anchoPrensa / 3;
        const tam = Math.min(carril * 0.62, H * 0.15, 64);
        return { W, H, x0, carril, tam, anchoPrensa };
    }
    function posBloque(b) {
        const { x0, carril, H } = geometria();
        return { x: x0 + carril * (b.carril + 0.5), y: b.y * H };
    }

    // ---------- Actualización ----------
    function actualizar(dt) {
        for (let i = 0; i < 3; i++) pads[i] *= Math.pow(0.02, dt);
        if (!jugando) return;
        proximoSpawn -= dt;
        if (proximoSpawn <= 0) {
            aparecer();
            proximoSpawn = 0.55 + Math.random() * 0.35 - progreso() * 0.15;
        }
        const v = velocidad();
        ultimoEnCarril = [-1, -1, -1];
        for (let i = bloques.length - 1; i >= 0; i--) {
            const b = bloques[i];
            if (b.estado) {
                b.t += dt;
                if (b.estado === "mal") b.y += v * dt * 1.6;
                if (b.t > 0.4) bloques.splice(i, 1);
                continue;
            }
            b.y += v * dt;
            if (ultimoEnCarril[b.carril] < 0 || b.y < ultimoEnCarril[b.carril]) ultimoEnCarril[b.carril] = b.y;
            if (b.y > ZONA_Y + TOLERANCIA && !b.pasada) {
                b.pasada = true;
                if (b.letra === necesaria()) { perdidas++; hud(); }
            }
            if (b.y > 1.1) bloques.splice(i, 1);
        }
        if (auto) {
            for (const b of bloques) {
                if (!b.estado && b.letra === necesaria() && Math.abs(b.y - ZONA_Y) < 0.03) { tocar(b.carril); break; }
            }
        }
    }

    // ---------- Dibujo ----------
    function rectRedondo(x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y, x + w, y + h, r);
        g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r);
        g.arcTo(x, y, x + w, y, r);
        g.closePath();
    }

    function dibujar() {
        const { W, H, x0, carril, tam, anchoPrensa } = geometria();
        // Fondo: taller
        g.fillStyle = "#efe2c6";
        g.fillRect(0, 0, W, H);
        // Mesa de la prensa (madera)
        const madera = g.createLinearGradient(x0, 0, x0 + anchoPrensa, 0);
        madera.addColorStop(0, "#6b4a2f");
        madera.addColorStop(0.5, "#7d5737");
        madera.addColorStop(1, "#6b4a2f");
        g.fillStyle = madera;
        g.fillRect(x0, 0, anchoPrensa, H);
        g.fillStyle = "rgba(0,0,0,0.12)";
        for (let y = 8; y < H; y += 23) g.fillRect(x0, y, anchoPrensa, 1);
        // Separadores de carril
        g.strokeStyle = "rgba(239,164,127,0.55)";
        g.setLineDash([6, 8]);
        g.lineWidth = 2;
        for (let i = 1; i < 3; i++) {
            g.beginPath();
            g.moveTo(x0 + carril * i, 0);
            g.lineTo(x0 + carril * i, H);
            g.stroke();
        }
        g.setLineDash([]);
        // Brillo de carril al tocar
        for (let i = 0; i < 3; i++) {
            if (Math.abs(pads[i]) < 0.03) continue;
            g.fillStyle = pads[i] > 0 ? `rgba(217,164,65,${pads[i] * 0.35})` : `rgba(182,83,60,${-pads[i] * 0.45})`;
            g.fillRect(x0 + carril * i, 0, carril, H);
        }
        // Platina dorada
        const zy = ZONA_Y * H;
        const alto = TOLERANCIA * H * 2;
        g.fillStyle = "rgba(217,164,65,0.28)";
        g.fillRect(x0, zy - alto / 2, anchoPrensa, alto);
        g.fillStyle = "#d9a441";
        g.fillRect(x0, zy - 1.5, anchoPrensa, 3);
        // Tipos
        for (const b of bloques) {
            const p = posBloque(b);
            let s = tam, alpha = 1, dy = 0;
            if (b.estado === "ok") { s = tam * (1 + b.t * 1.5); alpha = 1 - b.t / 0.4; dy = -b.t * 60; }
            if (b.estado === "mal") alpha = 1 - b.t / 0.4;
            g.globalAlpha = Math.max(0, alpha);
            g.fillStyle = "rgba(0,0,0,0.25)";
            rectRedondo(p.x - s / 2 + 3, p.y - s / 2 + 4 + dy, s, s, 6);
            g.fill();
            g.fillStyle = b.estado === "mal" ? "#b6533c" : b.estado === "ok" ? "#d9a441" : "#f5ead5";
            rectRedondo(p.x - s / 2, p.y - s / 2 + dy, s, s, 6);
            g.fill();
            g.strokeStyle = "#403326";
            g.lineWidth = 2;
            g.stroke();
            g.fillStyle = b.estado === "mal" ? "#f8f0e1" : "#403326";
            g.font = `bold ${Math.round(s * 0.62)}px Georgia, serif`;
            g.textAlign = "center";
            g.textBaseline = "middle";
            g.fillText(b.letra, p.x, p.y + dy + s * 0.04);
            g.globalAlpha = 1;
        }
        // Botones de carril
        for (let i = 0; i < 3; i++) {
            const cx = x0 + carril * (i + 0.5);
            const by = Math.min(H - 16, zy + alto / 2 + 18);
            g.fillStyle = pads[i] > 0.1 ? "#d9a441" : pads[i] < -0.1 ? "#b6533c" : "rgba(248,240,225,0.9)";
            g.beginPath();
            g.arc(cx, by, 12, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#403326";
            g.font = "bold 12px Arial, sans-serif";
            g.textAlign = "center";
            g.textBaseline = "middle";
            g.fillText(ROTULOS[i], cx, by + 0.5);
        }
    }

    ctx.bucle((dt) => {
        actualizar(dt);
        dibujar();
    });

    marcarSiguiente();
    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        ctx.cartel("Imprime la frase letra por letra", 1800);
    });

    return {
        prueba: {
            auto(v = true) { auto = v; },
            estado: () => ({ aciertos, fallos, perdidas, fin }),
        },
    };
}
