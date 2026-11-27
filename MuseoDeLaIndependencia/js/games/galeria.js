// =====================================================================
// Galería de parejas: juego de memoria (4 a 6 parejas).
// data: { pairs: [{ a: "texto" | "img:<id>", b: "texto" | "img:<id>" }] }
// =====================================================================
import { montar, el, esc, barajar, plural } from "./mg-comun.js";

export const meta = {
    id: "galeria",
    name: "Galería de parejas",
    instructions:
        "Voltea dos cartas a la vez y encuentra las que van juntas. ¡Recuerda dónde estaba cada una!",
    controles: "Clic o toque en las cartas · <kbd>Tab</kbd> + <kbd>Enter</kbd> con teclado",
};

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

// Carga perezosa de las obras para resolver "img:<id>" (si el archivo falta, se usa el texto).
let obrasPromesa = null;
function obtenerObras() {
    if (!obrasPromesa) {
        obrasPromesa = import("../data/works.js")
            .then((m) => (Array.isArray(m.works) ? m.works : []))
            .catch(() => []);
    }
    return obrasPromesa;
}

function jugar(ctx) {
    const { escena, work } = ctx;
    let pares = Array.isArray(ctx.datos.pairs) ? ctx.datos.pairs.slice(0, 6) : [];
    if (pares.length < 2) {
        pares = [
            { a: work.title || "La obra", b: work.author || "Su autor" },
            { a: "Técnica", b: work.technique || work.type || "Pintura" },
        ];
    }
    const n = pares.length;

    // Cartas: dos por pareja
    const cartas = barajar(
        pares.flatMap((p, i) => [
            { pareja: i, valor: String(p.a ?? "") },
            { pareja: i, valor: String(p.b ?? "") },
        ])
    );

    const tablero = el("div", "mg-gal-tablero");
    escena.appendChild(tablero);

    cartas.forEach((c, idx) => {
        const b = el("button", "mg-gal-carta");
        b.type = "button";
        b.setAttribute("aria-label", `Carta ${idx + 1}, boca abajo`);
        b.innerHTML = `<span class="mg-gal-giro">
            <span class="mg-gal-cara mg-gal-reverso" aria-hidden="true"><span class="mg-gal-sello">1810</span></span>
            <span class="mg-gal-cara mg-gal-frente"></span>
          </span>`;
        c.boton = b;
        c.frente = b.querySelector(".mg-gal-frente");
        pintarFrente(c, null);
        tablero.appendChild(b);
        ctx.on(b, "click", () => voltear(c));
    });

    // Resolver imágenes "img:<id>"
    if (cartas.some((c) => /^img:/i.test(c.valor))) {
        obtenerObras().then((obras) => {
            if (ctx.destruido) return;
            cartas.forEach((c) => pintarFrente(c, obras));
        });
    }

    function pintarFrente(c, obras) {
        const m = /^img:\s*(.+)$/i.exec(c.valor);
        if (m) {
            const obra = (obras || []).find((o) => String(o.id) === m[1].trim() || o.slug === m[1].trim());
            if (obra && obra.image) {
                c.etiqueta = obra.title || "Obra";
                c.frente.innerHTML = `<img src="${esc(obra.image)}" alt="${esc(obra.title || "")}" draggable="false"><span class="mg-gal-pie">${esc(obra.title || "")}</span>`;
                c.frente.classList.add("mg-gal-con-img");
            } else {
                c.etiqueta = obras ? `Obra ${m[1]}` : "…";
                c.frente.innerHTML = `<span class="mg-gal-texto">${esc(c.etiqueta)}</span>`;
            }
        } else {
            c.etiqueta = c.valor;
            const largo = c.valor.length > 42 ? " mg-largo" : c.valor.length > 22 ? " mg-medio" : "";
            c.frente.innerHTML = `<span class="mg-gal-texto${largo}">${esc(c.valor)}</span>`;
        }
    }

    // ---------- Distribución en cuadrícula según el espacio ----------
    function distribuir() {
        const r = escena.getBoundingClientRect();
        const total = cartas.length;
        const hueco = r.width < 500 ? 8 : 12;
        let mejor = null;
        for (let cols = 2; cols <= total; cols++) {
            const filas = Math.ceil(total / cols);
            if (filas * cols - total >= cols) continue;
            const w = (r.width - 24 - hueco * (cols - 1)) / cols;
            const h = (r.height - 24 - hueco * (filas - 1)) / filas;
            // Preferimos cartas un poco más altas que anchas
            const tam = Math.min(w, h / 1.15);
            const puntaje = tam - (filas * cols - total) * 4;
            if (!mejor || puntaje > mejor.puntaje) mejor = { cols, filas, puntaje, w, h };
        }
        const ancho = Math.min(mejor.w, mejor.h / 0.9);
        const alto = Math.min(mejor.h, ancho * 1.3);
        // Flex centrado: una fila incompleta queda en el medio
        tablero.style.width = mejor.cols * Math.floor(ancho) + (mejor.cols - 1) * hueco + 24 + "px";
        tablero.style.gap = hueco + "px";
        cartas.forEach((c) => {
            c.boton.style.width = Math.floor(ancho) + "px";
            c.boton.style.height = Math.floor(alto) + "px";
        });
        tablero.classList.toggle("mg-gal-compacto", ancho < 110);
    }
    ctx.observarTamano(escena, distribuir);
    distribuir();

    // ---------- Lógica ----------
    let abiertas = [];
    let bloqueo = false;
    let fallos = 0;
    let movimientos = 0;
    let hechas = 0;
    let jugando = false;

    const estrellasActuales = () => (fallos <= n ? 3 : fallos <= n * 2 ? 2 : 1);
    function hud() {
        ctx.contador(`<b>${hechas}</b>/${n} parejas`);
        ctx.estrellas(estrellasActuales());
    }

    function voltear(c) {
        if (!jugando || bloqueo || c.hecha || abiertas.includes(c)) return;
        c.boton.classList.add("mg-volteada");
        c.boton.setAttribute("aria-label", `Carta: ${c.etiqueta}`);
        ctx.sonido("tap");
        abiertas.push(c);
        if (abiertas.length < 2) return;

        movimientos++;
        const [x, y] = abiertas;
        bloqueo = true;
        if (x.pareja === y.pareja) {
            ctx.timeout(() => {
                [x, y].forEach((k) => {
                    k.hecha = true;
                    k.boton.classList.add("mg-pareja");
                    k.boton.setAttribute("aria-disabled", "true");
                    ctx.chispasEn(k.boton, 10);
                });
                hechas++;
                abiertas = [];
                bloqueo = false;
                ctx.sonido("ok");
                hud();
                if (hechas === n) {
                    jugando = false;
                    ctx.ganar({
                        score: Math.max(20, 100 - fallos * 5),
                        stars: estrellasActuales(),
                        resumen: plural(movimientos, "jugada", "jugadas"),
                    });
                } else {
                    ctx.cartel("¡Pareja encontrada!", 1100, "ok");
                }
            }, 380);
        } else {
            fallos++;
            ctx.timeout(() => {
                [x, y].forEach((k) => ctx.sacudir(k.boton));
                ctx.sonido("error");
            }, 450);
            ctx.timeout(() => {
                [x, y].forEach((k) => {
                    k.boton.classList.remove("mg-volteada");
                    k.boton.setAttribute("aria-label", "Carta boca abajo");
                });
                abiertas = [];
                bloqueo = false;
                hud();
            }, 1050);
        }
    }

    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        // Vistazo inicial: todas las cartas se muestran un instante
        bloqueo = true;
        cartas.forEach((c, i) => ctx.timeout(() => c.boton.classList.add("mg-volteada"), i * 40));
        ctx.timeout(() => {
            cartas.forEach((c) => c.boton.classList.remove("mg-volteada"));
            bloqueo = false;
        }, 1400 + cartas.length * 40);
        ctx.cartel("¡Mira bien! Las cartas se voltean en un momento", 1600);
    });

    return {
        prueba: {
            // Índices (en orden del DOM) de las cartas de cada pareja
            parejas() {
                return pares.map((_, i) =>
                    cartas.map((c, idx) => (c.pareja === i ? idx : -1)).filter((v) => v >= 0)
                );
            },
        },
    };
}
