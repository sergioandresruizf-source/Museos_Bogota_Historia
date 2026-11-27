// =====================================================================
// Taller del restaurador: 1) limpiar el polvo de la obra (≥70 %)
// 2) armar el rompecabezas arrastrando las piezas a su sitio.
// data: { grid: 3 } (3 o 4)
// =====================================================================
import { montar, el, esc, cargarImagen, rectContain, barajar, limitar, hacerArrastrable, plural } from "./mg-comun.js";

export const meta = {
    id: "restaurador",
    name: "Taller del restaurador",
    instructions:
        "Primero pasa el paño para quitar el polvo de la obra. Después, arma el rompecabezas llevando cada pieza a su lugar.",
    controles: "Arrastra con mouse o dedo · o toca una pieza y luego su lugar",
};

const META_LIMPIEZA = 0.7;

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

function jugar(ctx) {
    const { escena, work } = ctx;
    const N = limitar(parseInt(ctx.datos.grid, 10) || 3, 3, 4);
    const tiempoMeta = N === 3 ? 65 : 95;

    let fase = "inicio"; // inicio | limpiar | armar | fin
    let fallos = 0;
    let natural = { ancho: 4, alto: 3, img: null };

    const zona = el("div", "mg-res-zona");
    escena.appendChild(zona);

    const estrellasActuales = () => {
        const t = ctx.reloj.ms() / 1000;
        if (fallos <= 2 && t <= tiempoMeta) return 3;
        if (fallos <= 6 && t <= tiempoMeta * 1.8) return 2;
        return 1;
    };
    ctx.intervalo(() => { if (fase === "limpiar" || fase === "armar") ctx.estrellas(estrellasActuales()); }, 500);

    // =================================================================
    // FASE 1: LIMPIEZA
    // =================================================================
    const marco = el("div", "mg-res-marco");
    marco.innerHTML = `<img src="${esc(work.image || "")}" alt="${esc(work.title || "Obra")}" draggable="false">`;
    zona.appendChild(marco);
    const barra = el("div", "mg-res-progreso", `<span class="mg-res-relleno"></span><b>Limpieza 0 %</b>`);
    zona.appendChild(barra);
    const relleno = barra.querySelector(".mg-res-relleno");
    const barraTxt = barra.querySelector("b");

    // Máscara de baja resolución: blanco = limpio. Es la fuente de verdad del progreso.
    const MW = 160;
    let MH = 120;
    const mascara = document.createElement("canvas");
    const gm = mascara.getContext("2d", { willReadFrequently: true });
    // Textura de polvo, generada una vez
    const polvo = document.createElement("canvas");

    function generarPolvo(aspecto) {
        MH = Math.max(40, Math.round(MW / aspecto));
        mascara.width = MW;
        mascara.height = MH;
        gm.clearRect(0, 0, MW, MH);
        polvo.width = 640;
        polvo.height = Math.round(640 / aspecto);
        const g = polvo.getContext("2d");
        const W = polvo.width, H = polvo.height;
        const grad = g.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, "#cdb68d");
        grad.addColorStop(0.5, "#bfa47a");
        grad.addColorStop(1, "#a98d66");
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        // Motas y manchas
        for (let i = 0; i < 2600; i++) {
            g.fillStyle = `rgba(${Math.random() < 0.5 ? "90,70,45" : "245,234,213"},${Math.random() * 0.18})`;
            const s = Math.random() * 3 + 0.5;
            g.fillRect(Math.random() * W, Math.random() * H, s, s);
        }
        for (let i = 0; i < 14; i++) {
            const x = Math.random() * W, y = Math.random() * H, r = 20 + Math.random() * 70;
            const m = g.createRadialGradient(x, y, 0, x, y, r);
            m.addColorStop(0, "rgba(110,85,55,0.25)");
            m.addColorStop(1, "rgba(110,85,55,0)");
            g.fillStyle = m;
            g.fillRect(x - r, y - r, r * 2, r * 2);
        }
        // Telarañas en las esquinas
        g.strokeStyle = "rgba(250,245,235,0.35)";
        g.lineWidth = 1.2;
        for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, H, -1, -1]]) {
            for (let a = 0; a < 5; a++) {
                const ang = (a / 4) * (Math.PI / 2);
                g.beginPath();
                g.moveTo(cx, cy);
                g.lineTo(cx + sx * Math.cos(ang) * 110, cy + sy * Math.sin(ang) * 110);
                g.stroke();
            }
            for (let k = 1; k <= 4; k++) {
                g.beginPath();
                for (let a = 0; a <= 4; a++) {
                    const ang = (a / 4) * (Math.PI / 2);
                    const px = cx + sx * Math.cos(ang) * k * 25, py = cy + sy * Math.sin(ang) * k * 25;
                    a ? g.lineTo(px, py) : g.moveTo(px, py);
                }
                g.stroke();
            }
        }
        // Rótulo
        g.fillStyle = "rgba(64,51,38,0.55)";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `italic ${Math.round(W / 16)}px Georgia, serif`;
        g.fillText("Pasa el paño", W / 2, H / 2 - W / 30);
        g.font = `${Math.round(W / 30)}px Arial, sans-serif`;
        g.fillText("para quitar el polvo", W / 2, H / 2 + W / 28);
    }

    const lienzo = ctx.lienzo(marco, () => pintarPolvo());
    lienzo.canvas.classList.add("mg-res-polvo");

    function pintarPolvo() {
        const { g, ancho, alto } = lienzo;
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, ancho, alto);
        if (!polvo.width) return;
        g.drawImage(polvo, 0, 0, ancho, alto);
        g.globalCompositeOperation = "destination-out";
        g.imageSmoothingEnabled = true;
        g.drawImage(mascara, 0, 0, ancho, alto);
        g.globalCompositeOperation = "source-over";
    }

    let ultimo = null;
    let porcentaje = 0;
    function pasarPano(x, y) {
        // x, y en píxeles CSS del marco → coordenadas de máscara
        const mx = (x / lienzo.ancho) * MW;
        const my = (y / lienzo.alto) * MH;
        const radio = MW * 0.07;
        gm.fillStyle = "#fff";
        gm.strokeStyle = "#fff";
        gm.lineCap = "round";
        gm.lineWidth = radio * 2;
        if (ultimo) {
            gm.beginPath();
            gm.moveTo(ultimo.x, ultimo.y);
            gm.lineTo(mx, my);
            gm.stroke();
        }
        gm.beginPath();
        gm.arc(mx, my, radio, 0, Math.PI * 2);
        gm.fill();
        ultimo = { x: mx, y: my };
        pintarPolvo();
        // Motas que salen volando de vez en cuando
        if (Math.random() < 0.25) {
            const r = marco.getBoundingClientRect();
            const p = ctx.aRaiz(r.left + x, r.top + y);
            const m = el("span", "mg-res-mota");
            m.style.left = p.x + "px";
            m.style.top = p.y + "px";
            m.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px");
            ctx.root.appendChild(m);
            ctx.timeout(() => m.remove(), 700);
        }
    }

    function medirLimpieza() {
        const d = gm.getImageData(0, 0, MW, MH).data;
        let limpio = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 128) limpio++;
        porcentaje = limpio / (MW * MH);
        const pct = Math.min(100, Math.round((porcentaje / META_LIMPIEZA) * 70));
        relleno.style.width = Math.min(100, (porcentaje / META_LIMPIEZA) * 100) + "%";
        barraTxt.textContent = `Limpieza ${Math.round(porcentaje * 100)} % (meta 70 %)`;
        ctx.contador(`Limpieza <b>${Math.round(porcentaje * 100)}</b>%`);
        if (pct >= 70 && fase === "limpiar") terminarLimpieza();
    }

    let pasando = false;
    let ultimaMedida = 0;
    ctx.on(lienzo.canvas, "pointerdown", (e) => {
        if (fase !== "limpiar") return;
        e.preventDefault();
        pasando = true;
        ultimo = null;
        try { lienzo.canvas.setPointerCapture(e.pointerId); } catch (err) {}
        const r = lienzo.canvas.getBoundingClientRect();
        pasarPano(e.clientX - r.left, e.clientY - r.top);
    });
    ctx.on(lienzo.canvas, "pointermove", (e) => {
        if (!pasando || fase !== "limpiar") return;
        const r = lienzo.canvas.getBoundingClientRect();
        pasarPano(e.clientX - r.left, e.clientY - r.top);
        const ahora = performance.now();
        if (ahora - ultimaMedida > 120) { ultimaMedida = ahora; medirLimpieza(); }
    });
    const soltarPano = () => {
        if (!pasando) return;
        pasando = false;
        ultimo = null;
        if (fase === "limpiar") medirLimpieza();
    };
    ctx.on(lienzo.canvas, "pointerup", soltarPano);
    ctx.on(lienzo.canvas, "pointercancel", soltarPano);

    function terminarLimpieza() {
        fase = "transicion";
        lienzo.canvas.classList.add("mg-desvanecer");
        relleno.style.width = "100%";
        barraTxt.textContent = "¡Obra limpia!";
        ctx.chispasEn(marco, 26);
        ctx.destello("ok");
        ctx.sonido("ok");
        ctx.cartel("¡Quedó como nueva! Ahora arma el rompecabezas", 2200, "ok");
        ctx.timeout(empezarRompecabezas, 1500);
    }

    // =================================================================
    // FASE 2: ROMPECABEZAS
    // =================================================================
    let tablero = null;
    let huecos = [];
    let piezas = [];
    let seleccionada = null;
    let colocadas = 0;
    let disp = null; // disposición calculada

    function empezarRompecabezas() {
        fase = "armar";
        marco.remove();
        barra.remove();
        zona.classList.add("mg-res-armando");
        tablero = el("div", "mg-res-tablero");
        tablero.style.backgroundImage = `url("${work.image || ""}")`;
        zona.appendChild(tablero);
        huecos = [];
        for (let i = 0; i < N * N; i++) {
            const h = el("button", "mg-res-hueco");
            h.type = "button";
            h.setAttribute("aria-label", `Lugar fila ${Math.floor(i / N) + 1}, columna ${(i % N) + 1}`);
            tablero.appendChild(h);
            const hueco = { indice: i, nodo: h, lleno: false };
            ctx.on(h, "click", () => {
                if (seleccionada) { const p = seleccionada; elegir(null); intentar(p, hueco); }
            });
            huecos.push(hueco);
        }
        const orden = barajar([...Array(N * N).keys()]);
        piezas = orden.map((indice, k) => {
            const p = el("button", "mg-res-pieza");
            p.type = "button";
            p.setAttribute("aria-label", `Pieza ${k + 1}`);
            p.style.backgroundImage = `url("${work.image || ""}")`;
            p.style.backgroundSize = `${N * 100}% ${N * 100}%`;
            p.style.backgroundPosition = `${((indice % N) / (N - 1)) * 100}% ${(Math.floor(indice / N) / (N - 1)) * 100}%`;
            p.style.animationDelay = `${k * 0.04}s`;
            zona.appendChild(p);
            const pieza = { indice, nodo: p, puesta: false, lugar: k };
            hacerArrastrable(ctx, p, {
                alEmpezar: () => empezarArrastre(pieza),
                alMover: (x, y) => moverArrastre(pieza, x, y),
                alSoltar: (x, y) => soltarPieza(pieza, x, y),
                alTocar: () => elegir(pieza),
            });
            return pieza;
        });
        disponer();
        ctx.contador(`<b>0</b>/${N * N} piezas`);
    }

    /** Calcula tablero y bandeja según el espacio disponible. */
    function disponer() {
        if (!tablero) return;
        const r = zona.getBoundingClientRect();
        const W = r.width, H = r.height, pad = 16;
        const asp = natural.ancho / natural.alto;
        const horizontal = W / H > 1.15;
        let areaT, areaB;
        if (horizontal) {
            areaT = { x: pad, y: pad, w: W * 0.6 - pad * 1.5, h: H - pad * 2 };
            areaB = { x: W * 0.6 + pad / 2, y: pad, w: W * 0.4 - pad * 1.5, h: H - pad * 2 };
        } else {
            areaT = { x: pad, y: pad, w: W - pad * 2, h: H * 0.58 - pad * 1.5 };
            areaB = { x: pad, y: H * 0.58 + pad / 2, w: W - pad * 2, h: H * 0.42 - pad * 1.5 };
        }
        const t = rectContain(areaT.w, areaT.h, natural.ancho, natural.alto);
        t.x += areaT.x;
        t.y += areaT.y;
        Object.assign(tablero.style, { left: t.x + "px", top: t.y + "px", width: t.w + "px", height: t.h + "px" });
        const cw = t.w / N, ch = t.h / N;
        huecos.forEach((h, i) => {
            Object.assign(h.nodo.style, {
                left: (i % N) * cw + "px", top: Math.floor(i / N) * ch + "px",
                width: cw + "px", height: ch + "px",
            });
        });
        // Bandeja: cuadrícula que quepa con piezas de la misma proporción
        const total = N * N;
        let mejor = null;
        for (let cols = 1; cols <= total; cols++) {
            const filas = Math.ceil(total / cols);
            const pw = Math.min((areaB.w - (cols - 1) * 6) / cols, ((areaB.h - (filas - 1) * 6) / filas) * (cw / ch));
            if (!mejor || pw > mejor.pw) mejor = { cols, filas, pw };
        }
        const pw = Math.min(mejor.pw, cw * 1.0);
        const ph = pw * (ch / cw);
        const anchoUsado = mejor.cols * pw + (mejor.cols - 1) * 6;
        const altoUsado = mejor.filas * ph + (mejor.filas - 1) * 6;
        const ox = areaB.x + (areaB.w - anchoUsado) / 2;
        const oy = areaB.y + (areaB.h - altoUsado) / 2;
        disp = { t, cw, ch, pw, ph, cols: mejor.cols, ox, oy };
        piezas.forEach(ubicarPieza);
    }

    function ubicarPieza(p) {
        if (!disp) return;
        let x, y, w, h;
        if (p.puesta) {
            x = disp.t.x + (p.indice % N) * disp.cw;
            y = disp.t.y + Math.floor(p.indice / N) * disp.ch;
            w = disp.cw; h = disp.ch;
        } else {
            x = disp.ox + (p.lugar % disp.cols) * (disp.pw + 6);
            y = disp.oy + Math.floor(p.lugar / disp.cols) * (disp.ph + 6);
            w = disp.pw; h = disp.ph;
        }
        p.base = { x, y, w, h };
        Object.assign(p.nodo.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px", transform: "" });
    }

    let arrastre = null;
    function empezarArrastre(p) {
        if (fase !== "armar" || p.puesta) return;
        elegir(null);
        const z = zona.getBoundingClientRect();
        arrastre = { p, zx: z.left, zy: z.top };
        p.nodo.classList.add("mg-arrastrando");
        // Al arrastrar, la pieza toma el tamaño de una casilla del tablero
        Object.assign(p.nodo.style, { width: disp.cw + "px", height: disp.ch + "px" });
    }
    function moverArrastre(p, x, y) {
        if (!arrastre || arrastre.p !== p) return;
        p.nodo.style.left = x - arrastre.zx - disp.cw / 2 + "px";
        p.nodo.style.top = y - arrastre.zy - disp.ch / 2 + "px";
        const h = huecoEn(x, y);
        huecos.forEach((k) => k.nodo.classList.toggle("mg-encima", k === h));
    }
    function soltarPieza(p, x, y) {
        if (!arrastre || arrastre.p !== p) return;
        arrastre = null;
        p.nodo.classList.remove("mg-arrastrando");
        huecos.forEach((k) => k.nodo.classList.remove("mg-encima"));
        const h = huecoEn(x, y);
        if (h) intentar(p, h);
        else ubicarPieza(p);
    }
    function huecoEn(x, y) {
        return huecos.find((h) => {
            if (h.lleno) return false;
            const r = h.nodo.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });
    }
    function elegir(p) {
        if (p && (fase !== "armar" || p.puesta)) return;
        if (seleccionada) seleccionada.nodo.classList.remove("mg-seleccionada");
        seleccionada = p && seleccionada !== p ? p : null;
        if (seleccionada) { seleccionada.nodo.classList.add("mg-seleccionada"); ctx.sonido("tap"); }
        zona.classList.toggle("mg-res-eligiendo", !!seleccionada);
    }

    function intentar(p, h) {
        if (p.indice === h.indice) {
            p.puesta = true;
            h.lleno = true;
            colocadas++;
            p.nodo.classList.add("mg-puesta");
            p.nodo.disabled = true;
            p.nodo.tabIndex = -1;
            h.nodo.tabIndex = -1;
            ubicarPieza(p);
            ctx.chispasEn(h.nodo, 10);
            ctx.sonido("ok");
            ctx.contador(`<b>${colocadas}</b>/${N * N} piezas`);
            if (colocadas === N * N) {
                fase = "fin";
                tablero.classList.add("mg-res-completo");
                const t = ctx.reloj.ms() / 1000;
                ctx.ganar({
                    score: Math.max(20, 100 - fallos * 5 - Math.max(0, t - tiempoMeta) * 0.5),
                    stars: estrellasActuales(),
                    resumen: plural(fallos, "error", "errores"),
                });
            }
        } else {
            fallos++;
            ctx.sacudir(h.nodo);
            ctx.sonido("error");
            ubicarPieza(p);
            ctx.sacudir(p.nodo);
            ctx.estrellas(estrellasActuales());
        }
    }

    // ---------- Disposición general ----------
    function ubicarMarco() {
        if (fase === "armar" || fase === "fin") { disponer(); return; }
        const r = zona.getBoundingClientRect();
        const m = rectContain(r.width - 36, r.height - 70, natural.ancho, natural.alto);
        Object.assign(marco.style, {
            left: m.x + 18 + "px", top: m.y + 16 + "px", width: m.w + "px", height: m.h + "px",
        });
    }
    ctx.observarTamano(zona, ubicarMarco);

    cargarImagen(work.image).then((info) => {
        if (ctx.destruido) return;
        natural = info;
        generarPolvo(info.ancho / info.alto);
        ubicarMarco();
        pintarPolvo();
    });
    generarPolvo(4 / 3);
    ubicarMarco();

    ctx.contador(`Limpieza <b>0</b>%`);
    ctx.intro(() => {
        fase = "limpiar";
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        ctx.estrellas(3);
    });

    return {
        prueba: {
            fase: () => fase,
            marco: () => { const r = lienzo.canvas.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; },
            piezas() {
                return piezas.filter((p) => !p.puesta).map((p) => {
                    const a = p.nodo.getBoundingClientRect();
                    const b = huecos[p.indice].nodo.getBoundingClientRect();
                    return { de: { x: a.left + a.width / 2, y: a.top + a.height / 2 }, a: { x: b.left + b.width / 2, y: b.top + b.height / 2 } };
                });
            },
        },
    };
}
