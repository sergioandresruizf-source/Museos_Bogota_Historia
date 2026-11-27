// =====================================================================
// Ojo de curador: encontrar detalles en la pintura contra reloj.
// data: { hotspots: [{ x:0..1, y:0..1, r:0.04..0.12, label }] }
// x, y son relativos a la imagen (0 = borde izquierdo/superior).
// r es una fracción del lado MÁS CORTO de la imagen mostrada.
// =====================================================================
import { montar, el, esc, cargarImagen, rectContain, limitar, plural } from "./mg-comun.js";

export const meta = {
    id: "curador",
    name: "Ojo de curador",
    instructions:
        "Busca en la obra los detalles de la lista y tócalos antes de que se acabe el minuto. Si te atascas, pide una pista.",
    controles: "Mouse o toque para señalar · <kbd>H</kbd> pista",
};

const LIMITE_MS = 60000;

export function start(container, work, callbacks) {
    return montar(container, work, callbacks, meta, jugar);
}

function jugar(ctx) {
    const { work, escena } = ctx;
    const hotspots = (Array.isArray(ctx.datos.hotspots) && ctx.datos.hotspots.length
        ? ctx.datos.hotspots
        : [{ x: 0.5, y: 0.5, r: 0.15, label: "el centro de la obra" }]
    ).map((h, i) => ({
        x: limitar(+h.x || 0, 0, 1),
        y: limitar(+h.y || 0, 0, 1),
        r: limitar(+h.r || 0.07, 0.02, 0.3),
        label: h.label || `Detalle ${i + 1}`,
        encontrado: false,
        indice: i,
    }));

    let fallos = 0;
    let pistas = 0;
    let jugando = false;
    let marcoRect = { x: 0, y: 0, w: 1, h: 1 };
    let natural = { ancho: 4, alto: 3 };

    // ---------- DOM ----------
    const zona = el("div", "mg-cur-zona");
    const marco = el("div", "mg-cur-marco");
    marco.innerHTML = `<img class="mg-cur-img" src="${esc(work.image || "")}" alt="${esc(work.title || "Obra")}" draggable="false">
        <div class="mg-cur-capa"></div><div class="mg-cur-lupa" aria-hidden="true"></div>`;
    zona.appendChild(marco);
    const capaMarcas = marco.querySelector(".mg-cur-capa");
    const lupa = marco.querySelector(".mg-cur-lupa");
    lupa.style.backgroundImage = `url("${work.image || ""}")`;

    const barra = el("div", "mg-cur-barra");
    const lista = el("ul", "mg-cur-lista");
    lista.setAttribute("aria-label", "Detalles por encontrar");
    hotspots.forEach((h) => {
        const li = el("li", "mg-cur-item", `<span class="mg-cur-check" aria-hidden="true"></span>${esc(h.label)}`);
        h.li = li;
        lista.appendChild(li);
    });
    const btnPista = el("button", "mg-btn mg-btn-secundario mg-cur-btn-pista", "Pista");
    btnPista.type = "button";
    btnPista.setAttribute("aria-label", "Pedir una pista (tecla H)");
    barra.append(lista, btnPista);
    escena.append(zona, barra);

    // ---------- Disposición: rectángulo real de la imagen ----------
    function ubicar() {
        const r = zona.getBoundingClientRect();
        // Margen para que se vea completo el marco dorado (sombra de 9 px)
        marcoRect = rectContain(r.width - 32, r.height - 28, natural.ancho, natural.alto);
        marcoRect.x += 16;
        marcoRect.y += 14;
        Object.assign(marco.style, {
            left: marcoRect.x + "px",
            top: marcoRect.y + "px",
            width: marcoRect.w + "px",
            height: marcoRect.h + "px",
        });
        lupa.style.backgroundSize = `${marcoRect.w * 2.4}px ${marcoRect.h * 2.4}px`;
        // Recolocar anillos ya dibujados
        hotspots.forEach((h) => h.anillo && colocarCirculo(h.anillo, h.x, h.y, radioPx(h)));
    }
    const radioPx = (h) => Math.max(h.r * Math.min(marcoRect.w, marcoRect.h), 18);

    function colocarCirculo(nodo, x, y, rpx) {
        Object.assign(nodo.style, {
            left: x * marcoRect.w + "px",
            top: y * marcoRect.h + "px",
            width: rpx * 2 + "px",
            height: rpx * 2 + "px",
        });
    }

    cargarImagen(work.image).then((info) => {
        if (ctx.destruido) return;
        natural = info;
        ubicar();
    });
    ctx.observarTamano(zona, ubicar);
    ubicar();

    // ---------- Puntuación ----------
    const encontrados = () => hotspots.filter((h) => h.encontrado).length;
    const extraSeg = () => Math.max(0, (ctx.reloj.ms() - LIMITE_MS) / 1000);
    function estrellasActuales() {
        if (extraSeg() > 0) return 1;
        const p = fallos + pistas * 2;
        return p <= 2 ? 3 : p <= 5 ? 2 : 1;
    }
    function actualizarHUD() {
        ctx.contador(`<b>${encontrados()}</b>/${hotspots.length} detalles`);
        ctx.estrellas(estrellasActuales());
    }

    // ---------- Interacción ----------
    function puntoEnImagen(e) {
        const r = marco.getBoundingClientRect();
        return { px: e.clientX - r.left, py: e.clientY - r.top };
    }

    function senalar(e) {
        if (!jugando) return;
        e.preventDefault();
        const { px, py } = puntoEnImagen(e);
        let mejor = null;
        let mejorD = Infinity;
        for (const h of hotspots) {
            if (h.encontrado) continue;
            const d = Math.hypot(px - h.x * marcoRect.w, py - h.y * marcoRect.h);
            if (d <= radioPx(h) && d < mejorD) { mejor = h; mejorD = d; }
        }
        if (mejor) acertar(mejor);
        else fallar(px, py);
    }

    function acertar(h) {
        h.encontrado = true;
        const anillo = el("div", "mg-cur-anillo", `<span>${esc(h.label)}</span>`);
        colocarCirculo(anillo, h.x, h.y, radioPx(h));
        capaMarcas.appendChild(anillo);
        h.anillo = anillo;
        h.li.classList.add("mg-hecho");
        quitarPista();
        const r = marco.getBoundingClientRect();
        const p = ctx.aRaiz(r.left + h.x * marcoRect.w, r.top + h.y * marcoRect.h);
        ctx.chispas(p.x, p.y, 16);
        ctx.sonido("ok");
        actualizarHUD();
        if (encontrados() === hotspots.length) {
            jugando = false;
            lupa.classList.remove("mg-visible");
            const extra = extraSeg();
            const score = 100 - fallos * 6 - pistas * 10 - extra * 1.5;
            ctx.ganar({ score: Math.max(10, score), stars: estrellasActuales(), resumen: plural(fallos, "fallo", "fallos") });
        } else {
            ctx.cartel(`¡Encontraste <b>${esc(h.label)}</b>!`, 1600, "ok");
        }
    }

    function fallar(px, py) {
        fallos++;
        const x = el("div", "mg-cur-fallo", "×");
        x.style.left = px + "px";
        x.style.top = py + "px";
        capaMarcas.appendChild(x);
        ctx.timeout(() => x.remove(), 700);
        ctx.sacudir(marco);
        ctx.sonido("error");
        actualizarHUD();
    }

    let pistaNodo = null;
    let pistaTimer = 0;
    function quitarPista() {
        if (pistaNodo) { pistaNodo.remove(); pistaNodo = null; }
        ctx.cancelarTimeout(pistaTimer);
    }
    function darPista() {
        if (!jugando) return;
        const h = hotspots.find((x) => !x.encontrado);
        if (!h) return;
        quitarPista();
        pistas++;
        // Zona aproximada: un círculo más grande y un poco desplazado
        const rp = radioPx(h) * 2.6;
        const ang = Math.random() * Math.PI * 2;
        const desp = radioPx(h) * 0.9;
        const cx = limitar(h.x + (Math.cos(ang) * desp) / marcoRect.w, 0, 1);
        const cy = limitar(h.y + (Math.sin(ang) * desp) / marcoRect.h, 0, 1);
        pistaNodo = el("div", "mg-cur-pista");
        colocarCirculo(pistaNodo, cx, cy, rp);
        capaMarcas.appendChild(pistaNodo);
        h.li.classList.add("mg-pista-activa");
        pistaTimer = ctx.timeout(() => {
            h.li.classList.remove("mg-pista-activa");
            quitarPista();
        }, 3000);
        ctx.cartel(`Busca <b>${esc(h.label)}</b> en la zona que brilla`, 2400);
        ctx.sonido("tap");
        actualizarHUD();
    }

    // Lupa que sigue al mouse (solo con mouse; en táctil estorbaría)
    function moverLupa(e) {
        if (!jugando || e.pointerType !== "mouse") { lupa.classList.remove("mg-visible"); return; }
        const { px, py } = puntoEnImagen(e);
        const t = 2.4;
        lupa.classList.add("mg-visible");
        lupa.style.left = px + "px";
        lupa.style.top = py + "px";
        lupa.style.backgroundPosition = `${-(px * t) + 55}px ${-(py * t) + 55}px`;
    }

    ctx.on(marco, "pointerdown", senalar);
    ctx.on(marco, "pointermove", moverLupa);
    ctx.on(marco, "pointerleave", () => lupa.classList.remove("mg-visible"));
    ctx.on(marco, "contextmenu", (e) => e.preventDefault());
    ctx.on(btnPista, "click", darPista);
    ctx.on(document, "keydown", (e) => {
        if (e.key === "h" || e.key === "H") { darPista(); }
    });

    // Aviso al terminarse el tiempo (no se pierde: se sigue en tiempo extra)
    let avisoExtra = false;
    ctx.intervalo(() => {
        if (jugando && !avisoExtra && ctx.reloj.ms() > LIMITE_MS) {
            avisoExtra = true;
            ctx.cartel("Se acabó el minuto, pero puedes seguir buscando", 2600, "aviso");
            actualizarHUD();
        }
    }, 300);

    actualizarHUD();
    ctx.intro(() => {
        jugando = true;
        ctx.reloj.iniciar();
        ctx.mostrarTiempo(LIMITE_MS);
        ctx.cartel(`Encuentra ${hotspots.length} detalles en la obra`, 2000);
    });

    return {
        prueba: {
            // Puntos en coordenadas de pantalla de los detalles pendientes
            pendientes() {
                const r = marco.getBoundingClientRect();
                return hotspots.filter((h) => !h.encontrado).map((h) => ({
                    x: r.left + h.x * marcoRect.w,
                    y: r.top + h.y * marcoRect.h,
                }));
            },
        },
    };
}
