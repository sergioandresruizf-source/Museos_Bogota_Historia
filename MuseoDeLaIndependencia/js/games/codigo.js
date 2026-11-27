// =====================================================================
// Código secreto: descifrar un mensaje cifrado por sustitución.
// data: { message: "LIBERTAD Y ORDEN", hint: "Pista corta" }
// =====================================================================
import { montar, el, esc, barajar, plural } from "./mg-comun.js";

export const meta = {
    id: "codigo",
    name: "Código secreto",
    instructions:
        "Cada letra del mensaje fue cambiada por otra. Elige un símbolo y adivina qué letra esconde. Ya te damos algunas letras de ayuda.",
    controles: "Toca una casilla y luego una letra · también puedes escribir con el teclado · <kbd>←</kbd><kbd>→</kbd> cambian de casilla",
};

const ALFABETO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const FILAS_TECLADO = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

/** Mayúsculas sin tildes (la Ñ se conserva). */
function normalizar(t) {
    return String(t || "")
        .toUpperCase()
        .replace(/Ñ/g, "\u0001")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\u0001/g, "Ñ");
}

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

function jugar(ctx) {
    const { escena } = ctx;
    const mensaje = normalizar(ctx.datos.message || ctx.work.title || "LIBERTAD Y ORDEN").replace(/\s+/g, " ").trim();
    const pista = ctx.datos.hint || "";

    // Cifrado: permutación sin puntos fijos
    let destino;
    do { destino = barajar(ALFABETO); } while (destino.some((l, i) => l === ALFABETO[i]));
    const cifrar = Object.fromEntries(ALFABETO.map((l, i) => [l, destino[i]]));
    const descifrar = Object.fromEntries(ALFABETO.map((l, i) => [destino[i], l]));

    const letrasMensaje = [...new Set(mensaje.split("").filter((c) => ALFABETO.includes(c)))];
    const frecuencia = (l) => mensaje.split(l).length - 1;

    // Letras reveladas: 2 o 3 de las más frecuentes (con algo de azar)
    const cuantas = letrasMensaje.length > 8 ? 3 : 2;
    const candidatas = barajar(letrasMensaje)
        .sort((a, b) => frecuencia(b) - frecuencia(a))
        .slice(0, Math.max(cuantas, Math.min(5, letrasMensaje.length - 1)));
    const reveladas = new Set(barajar(candidatas).slice(0, Math.min(cuantas, letrasMensaje.length - 1)));

    const resuelto = new Set(); // letras reales ya resueltas
    reveladas.forEach((l) => resuelto.add(l));

    // ---------- DOM ----------
    escena.innerHTML = `
      ${pista ? `<p class="mg-cod-pista"><span>Pista</span>${esc(pista)}</p>` : ""}
      <div class="mg-cod-mensaje" aria-label="Mensaje cifrado"></div>
      <div class="mg-cod-teclado" role="group" aria-label="Teclado de letras"></div>`;
    const cajaMensaje = escena.querySelector(".mg-cod-mensaje");
    const teclado = escena.querySelector(".mg-cod-teclado");

    const celdas = [];
    mensaje.split(" ").forEach((palabra) => {
        const p = el("div", "mg-cod-palabra");
        for (const c of palabra) {
            if (ALFABETO.includes(c)) {
                const b = el("button", "mg-cod-celda");
                b.type = "button";
                b.innerHTML = `<span class="mg-cod-cifra">${cifrar[c]}</span><span class="mg-cod-letra"></span>`;
                const celda = { boton: b, real: c, cifra: cifrar[c], letra: b.querySelector(".mg-cod-letra") };
                celdas.push(celda);
                ctx.on(b, "click", () => seleccionar(celda.cifra));
                p.appendChild(b);
            } else {
                p.appendChild(el("span", "mg-cod-signo", esc(c)));
            }
        }
        cajaMensaje.appendChild(p);
    });

    const teclas = {};
    FILAS_TECLADO.forEach((fila) => {
        const f = el("div", "mg-cod-fila");
        for (const l of fila) {
            const k = el("button", "mg-cod-tecla", l);
            k.type = "button";
            k.setAttribute("aria-label", `Letra ${l}`);
            ctx.on(k, "click", () => probar(l));
            teclas[l] = k;
            f.appendChild(k);
        }
        teclado.appendChild(f);
    });
    const btnPista = el("button", "mg-cod-tecla mg-cod-tecla-pista", "Pista");
    btnPista.type = "button";
    btnPista.setAttribute("aria-label", "Revelar la letra seleccionada");
    teclado.lastChild.appendChild(btnPista);
    ctx.on(btnPista, "click", () => usarPista());

    // ---------- Tamaño de casillas según el espacio ----------
    function ajustar() {
        const r = cajaMensaje.getBoundingClientRect();
        const palabras = mensaje.split(" ").map((w) => w.length);
        let s = 48;
        for (; s > 18; s -= 2) {
            const ancho = s * 0.82;
            const gapPal = s * 0.5;
            let lineas = 1, actual = 0;
            let cabe = true;
            for (const len of palabras) {
                const w = len * (ancho + 4);
                if (w > r.width - 8) { cabe = false; break; }
                if (actual && actual + gapPal + w > r.width - 8) { lineas++; actual = w; }
                else actual += (actual ? gapPal : 0) + w;
            }
            if (cabe && lineas * (s * 1.45 + 10) <= r.height - 8) break;
        }
        cajaMensaje.style.setProperty("--mg-celda", s + "px");
    }
    ctx.observarTamano(cajaMensaje, ajustar);
    ajustar();

    // ---------- Lógica ----------
    let seleccion = null;
    let fallos = 0;
    let pistas = 0;
    let jugando = false;

    const pendientes = () => letrasMensaje.filter((l) => !resuelto.has(l));
    const estrellasActuales = () => {
        const p = fallos + pistas * 2;
        return p <= 4 ? 3 : p <= 10 ? 2 : 1;
    };
    function hud() {
        const total = letrasMensaje.length;
        ctx.contador(`<b>${total - pendientes().length}</b>/${total} letras`);
        ctx.estrellas(estrellasActuales());
    }

    function pintar() {
        celdas.forEach((c) => {
            const ok = resuelto.has(c.real);
            c.letra.textContent = ok ? c.real : "";
            c.boton.classList.toggle("mg-resuelta", ok);
            c.boton.classList.toggle("mg-revelada", reveladas.has(c.real));
            c.boton.classList.toggle("mg-seleccionada", !ok && c.cifra === seleccion);
            c.boton.setAttribute("aria-label", ok ? `Letra ${c.real}` : `Símbolo ${c.cifra}, sin resolver`);
        });
        for (const l of ALFABETO) teclas[l] && teclas[l].classList.toggle("mg-usada", resuelto.has(l));
    }

    function seleccionar(cifra) {
        if (!jugando) return;
        if (resuelto.has(descifrar[cifra])) return;
        seleccion = cifra;
        ctx.sonido("tap");
        pintar();
    }

    function siguiente(dir = 1) {
        const orden = [...new Set(celdas.filter((c) => !resuelto.has(c.real)).map((c) => c.cifra))];
        if (!orden.length) { seleccion = null; return; }
        const i = orden.indexOf(seleccion);
        seleccion = orden[(i + dir + orden.length) % orden.length] ?? orden[0];
        if (i === -1) seleccion = orden[0];
    }

    function resolver(letra) {
        resuelto.add(letra);
        const hechas = celdas.filter((c) => c.real === letra);
        siguiente(1);
        pintar();
        hechas.forEach((c) => {
            c.boton.classList.add("mg-pop");
            ctx.timeout(() => c.boton.classList.remove("mg-pop"), 500);
            ctx.chispasEn(c.boton, 6);
        });
        hud();
        if (!pendientes().length) {
            jugando = false;
            seleccion = null;
            pintar();
            cajaMensaje.classList.add("mg-cod-completo");
            ctx.cartel(`«${esc(mensaje)}»`, 3000, "ok");
            ctx.ganar({
                score: Math.max(15, 100 - fallos * 4 - pistas * 8),
                stars: estrellasActuales(),
                resumen: plural(fallos, "intento fallido", "intentos fallidos"),
            });
        }
    }

    function probar(letra) {
        if (!jugando) return;
        if (!seleccion) siguiente(1);
        if (!seleccion) return;
        const real = descifrar[seleccion];
        if (real === letra) {
            ctx.sonido("ok");
            resolver(letra);
        } else {
            fallos++;
            ctx.sonido("error");
            const k = teclas[letra];
            if (k) {
                k.classList.add("mg-mal");
                ctx.timeout(() => k.classList.remove("mg-mal"), 450);
            }
            celdas.filter((c) => c.cifra === seleccion).forEach((c) => ctx.sacudir(c.boton));
            hud();
        }
    }

    function usarPista() {
        if (!jugando) return;
        if (!seleccion) siguiente(1);
        if (!seleccion) return;
        pistas++;
        ctx.cartel(`El símbolo <b>${seleccion}</b> es la letra <b>${descifrar[seleccion]}</b>`, 1800);
        resolver(descifrar[seleccion]);
    }

    ctx.on(document, "keydown", (e) => {
        if (!jugando || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = normalizar(e.key);
        if (k.length === 1 && ALFABETO.includes(k)) {
            e.preventDefault();
            probar(k);
        } else if (e.key === "ArrowRight") {
            e.preventDefault(); siguiente(1); pintar();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault(); siguiente(-1); pintar();
        }
    });

    siguiente(1);
    pintar();
    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        pintar();
    });

    return {
        prueba: {
            // Letras reales en el orden en que conviene escribirlas
            solucion() {
                const orden = [];
                celdas.forEach((c) => { if (!resuelto.has(c.real) && !orden.includes(c.real)) orden.push(c.real); });
                return orden;
            },
        },
    };
}
