// =====================================================================
// Línea de tiempo viva: arrastrar los hechos a su lugar cronológico.
// data: { events: [{ year: "1810", text: "..." }] } (4 a 6, en orden correcto)
// Los años permanecen ocultos hasta que la tarjeta se ubica bien.
// =====================================================================
import { montar, el, esc, barajar, hacerArrastrable, plural } from "./mg-comun.js";

export const meta = {
    id: "linea",
    name: "Línea de tiempo viva",
    instructions:
        "Arrastra cada tarjeta al lugar que le corresponde, del hecho más antiguo al más reciente. El año aparece cuando aciertas.",
    controles: "Arrastra con mouse o dedo · o toca una tarjeta y luego su lugar · <kbd>Tab</kbd> + <kbd>Enter</kbd> con teclado",
};

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

function jugar(ctx) {
    const { escena } = ctx;
    let eventos = Array.isArray(ctx.datos.events) ? ctx.datos.events.slice(0, 6) : [];
    if (eventos.length < 2) {
        eventos = [
            { year: "1781", text: "Revolución de los Comuneros" },
            { year: "1810", text: "Grito de Independencia en Santafé" },
            { year: "1819", text: "Batalla de Boyacá" },
            { year: "1821", text: "Congreso de Cúcuta" },
        ];
    }
    const n = eventos.length;

    escena.innerHTML = `
      <div class="mg-lin">
        <div class="mg-lin-eje-caja">
          <span class="mg-lin-rotulo mg-lin-antes">Más antiguo</span>
          <ol class="mg-lin-eje"></ol>
          <span class="mg-lin-rotulo mg-lin-despues">Más reciente</span>
        </div>
        <div class="mg-lin-mazo" aria-label="Tarjetas por ubicar"></div>
      </div>`;
    const raiz = escena.querySelector(".mg-lin");
    const eje = escena.querySelector(".mg-lin-eje");
    const mazo = escena.querySelector(".mg-lin-mazo");
    raiz.style.setProperty("--mg-n", n);

    // Huecos (uno por evento, en orden)
    const huecos = eventos.map((ev, i) => {
        const li = el("li", "mg-lin-paso");
        // El hueco es un <div>; dentro lleva un botón destino (no se anidan botones)
        const b = el("div", "mg-lin-hueco");
        b.innerHTML = `<span class="mg-lin-anio" aria-hidden="true">?</span>
          <button type="button" class="mg-lin-destino" aria-label="Lugar ${i + 1} de ${n}">${i + 1}</button>`;
        li.appendChild(b);
        eje.appendChild(li);
        const destino = b.querySelector(".mg-lin-destino");
        const h = { indice: i, boton: b, destino, anio: b.querySelector(".mg-lin-anio"), lleno: false };
        ctx.on(destino, "click", () => intentarSeleccion(h));
        return h;
    });

    // Tarjetas barajadas que "caen" al mazo
    let orden = barajar(eventos.map((_, i) => i));
    if (orden.every((v, i) => v === i)) orden.reverse();
    const tarjetas = orden.map((i, k) => {
        const t = el("button", "mg-lin-tarjeta");
        t.type = "button";
        t.style.animationDelay = `${k * 0.12}s`;
        t.innerHTML = `<span>${esc(eventos[i].text)}</span>`;
        t.setAttribute("aria-label", `Hecho: ${eventos[i].text}`);
        mazo.appendChild(t);
        const tarjeta = { indice: i, nodo: t, puesta: false };
        hacerArrastrable(ctx, t, {
            alEmpezar: () => empezarArrastre(tarjeta),
            alMover: (x, y) => moverArrastre(tarjeta, x, y),
            alSoltar: (x, y) => soltar(tarjeta, x, y),
            alTocar: () => alternarSeleccion(tarjeta),
        });
        return tarjeta;
    });

    // ---------- Estado ----------
    let fallos = 0;
    let colocadas = 0;
    let jugando = false;
    let seleccionada = null;
    let origen = null;

    const estrellasActuales = () => (fallos <= 1 ? 3 : fallos <= 3 ? 2 : 1);
    function hud() {
        ctx.contador(`<b>${colocadas}</b>/${n} hechos`);
        ctx.estrellas(estrellasActuales());
    }

    // ---------- Arrastre ----------
    function empezarArrastre(t) {
        if (!jugando || t.puesta) return;
        alternarSeleccion(null);
        const r = t.nodo.getBoundingClientRect();
        origen = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        t.nodo.classList.add("mg-arrastrando");
        raiz.classList.add("mg-lin-arrastrando");
    }
    function moverArrastre(t, x, y) {
        if (!origen || t.puesta) return;
        t.nodo.style.transform = `translate(${x - origen.x}px, ${y - origen.y}px) rotate(-3deg) scale(1.05)`;
        const h = huecoEn(x, y);
        huecos.forEach((k) => k.boton.classList.toggle("mg-encima", k === h));
    }
    function soltar(t, x, y) {
        if (!origen || t.puesta) return;
        origen = null;
        raiz.classList.remove("mg-lin-arrastrando");
        huecos.forEach((k) => k.boton.classList.remove("mg-encima"));
        const h = huecoEn(x, y);
        if (h) intentar(t, h);
        else volver(t);
    }
    function huecoEn(x, y) {
        return huecos.find((h) => {
            if (h.lleno) return false;
            const r = h.boton.getBoundingClientRect();
            return x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8;
        });
    }
    function volver(t) {
        t.nodo.classList.remove("mg-arrastrando");
        t.nodo.classList.add("mg-volviendo");
        t.nodo.style.transform = "";
        ctx.timeout(() => t.nodo.classList.remove("mg-volviendo"), 300);
    }

    // ---------- Selección por toque o teclado ----------
    function alternarSeleccion(t) {
        if (t && (!jugando || t.puesta)) return;
        if (seleccionada) seleccionada.nodo.classList.remove("mg-seleccionada");
        seleccionada = t && seleccionada !== t ? t : null;
        if (seleccionada) {
            seleccionada.nodo.classList.add("mg-seleccionada");
            ctx.sonido("tap");
        }
        raiz.classList.toggle("mg-lin-eligiendo", !!seleccionada);
    }
    function intentarSeleccion(h) {
        if (!jugando || !seleccionada || h.lleno) return;
        const t = seleccionada;
        alternarSeleccion(null);
        intentar(t, h);
    }

    // ---------- Validación ----------
    function intentar(t, h) {
        if (t.indice === h.indice) {
            t.puesta = true;
            h.lleno = true;
            colocadas++;
            t.nodo.classList.remove("mg-arrastrando", "mg-seleccionada");
            t.nodo.style.transform = "";
            t.nodo.classList.add("mg-puesta");
            t.nodo.disabled = true;
            h.destino.remove();
            h.boton.appendChild(t.nodo);
            h.boton.classList.add("mg-lleno");
            h.anio.textContent = eventos[h.indice].year;
            t.nodo.setAttribute("aria-label", `${eventos[h.indice].year}: ${eventos[h.indice].text}`);
            ctx.chispasEn(h.boton, 14);
            ctx.sonido("ok");
            hud();
            if (colocadas === n) {
                jugando = false;
                raiz.classList.add("mg-lin-completa");
                ctx.ganar({
                    score: Math.max(20, 100 - fallos * 12),
                    stars: estrellasActuales(),
                    resumen: plural(fallos, "error", "errores"),
                });
            } else {
                ctx.cartel(`¡Correcto! Pasó en <b>${esc(eventos[h.indice].year)}</b>`, 1400, "ok");
            }
        } else {
            fallos++;
            ctx.sacudir(h.boton);
            ctx.sacudir(t.nodo);
            ctx.sonido("error");
            const antes = t.indice < h.indice;
            ctx.cartel(antes ? "Ese hecho ocurrió <b>antes</b>" : "Ese hecho ocurrió <b>después</b>", 1400, "error");
            volver(t);
            hud();
        }
    }

    hud();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(0);
        raiz.classList.add("mg-lin-activa");
    });

    return {
        prueba: {
            // Centro de cada tarjeta pendiente y centro de su hueco correcto (coordenadas de pantalla)
            objetivos() {
                const centro = (n) => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
                return tarjetas.filter((t) => !t.puesta).map((t) => ({
                    de: centro(t.nodo),
                    a: centro(huecos[t.indice].boton),
                    mal: centro(huecos.find((h) => !h.lleno && h.indice !== t.indice)?.boton || huecos[t.indice].boton),
                }));
            },
        },
    };
}
