// =====================================================================
// Utilidades compartidas por todos los minijuegos (prefijo .mg-)
// ---------------------------------------------------------------------
// `montar()` construye el marco común (encabezado con HUD, escena,
// pantalla de inicio y de cierre) y lleva la cuenta de TODO lo que se
// crea (listeners, timers, requestAnimationFrame, observadores, audio)
// para que `destroy()` no deje nada vivo.
// =====================================================================

const SVG_ESTRELLA =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';

/** Crea un elemento con clase y contenido opcional. */
export function el(tag, clase = "", html = "") {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (html) e.innerHTML = html;
    return e;
}

/** Escapa texto para insertarlo como HTML. */
export function esc(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Baraja un arreglo (Fisher-Yates) y devuelve una copia. */
export function barajar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** "1 error", "3 errores" */
export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export const limitar = (v, min, max) => Math.max(min, Math.min(max, v));

/** Formatea milisegundos como m:ss */
export function formatoTiempo(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** HTML de 3 estrellas (llenas según n). */
export function estrellasHTML(n, clase = "mg-estrellas") {
    let h = `<span class="${clase}" role="img" aria-label="${n} de 3 estrellas">`;
    for (let i = 1; i <= 3; i++) {
        h += `<span class="mg-estrella${i <= n ? " mg-llena" : ""}">${SVG_ESTRELLA}</span>`;
    }
    return h + "</span>";
}

/** ¿El jugador tiene activados los efectos de sonido? (lee el guardado sin romper nada) */
function sonidoActivo() {
    try {
        const raw = localStorage.getItem("cronista1810.v1");
        if (!raw) return true;
        const s = JSON.parse(raw);
        return !(s && s.settings && s.settings.sfx === false);
    } catch (e) {
        return true;
    }
}

// ---------------------------------------------------------------------
// Contexto de una partida: lleva la cuenta de recursos y ofrece efectos
// ---------------------------------------------------------------------
function crearContexto(container, work, meta, cb, opciones) {
    const limpiezas = [];
    const timeouts = new Set();
    const intervalos = new Set();
    const rafs = new Set();
    let destruido = false;
    let audio = null;

    const ctx = {
        work,
        meta,
        datos: (work && work.game && work.game.data) || {},
        get destruido() { return destruido; },
    };

    // ---------- Estructura DOM ----------
    const root = el("div", `mg-root mg-${meta.id}`);
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", `Minijuego: ${meta.name}`);
    root.innerHTML = `
      <header class="mg-cabecera">
        <div class="mg-titulo">
          <span class="mg-sello" aria-hidden="true">${esc(meta.name.charAt(0))}</span>
          <span class="mg-titulo-textos">
            <strong>${esc(meta.name)}</strong>
            <small>${esc(work.title || "")}</small>
          </span>
        </div>
        <div class="mg-hud">
          <span class="mg-chip mg-chip-contador" hidden></span>
          <span class="mg-chip mg-chip-tiempo" hidden><span class="mg-reloj-ico" aria-hidden="true"></span><b>0:00</b></span>
          <span class="mg-chip mg-chip-estrellas" hidden></span>
        </div>
        <button type="button" class="mg-btn mg-btn-salir" aria-label="Salir del minijuego">Salir</button>
      </header>
      <div class="mg-escena"></div>`;
    container.appendChild(root);
    ctx.root = root;
    ctx.escena = root.querySelector(".mg-escena");
    const chipContador = root.querySelector(".mg-chip-contador");
    const chipTiempo = root.querySelector(".mg-chip-tiempo");
    const chipTiempoTxt = chipTiempo.querySelector("b");
    const chipEstrellas = root.querySelector(".mg-chip-estrellas");

    // ---------- Recursos con limpieza automática ----------
    ctx.on = (objetivo, tipo, fn, opts) => {
        objetivo.addEventListener(tipo, fn, opts);
        limpiezas.push(() => objetivo.removeEventListener(tipo, fn, opts));
    };
    ctx.timeout = (fn, ms) => {
        const id = setTimeout(() => {
            timeouts.delete(id);
            if (!destruido) fn();
        }, ms);
        timeouts.add(id);
        return id;
    };
    ctx.cancelarTimeout = (id) => {
        clearTimeout(id);
        timeouts.delete(id);
    };
    ctx.intervalo = (fn, ms) => {
        const id = setInterval(() => { if (!destruido) fn(); }, ms);
        intervalos.add(id);
        return id;
    };
    ctx.cancelarIntervalo = (id) => {
        clearInterval(id);
        intervalos.delete(id);
    };
    /** Bucle de animación: fn(dt en segundos, ahora). Devuelve función para detenerlo. */
    ctx.bucle = (fn) => {
        let previo = performance.now();
        let id = 0;
        let vivo = true;
        const paso = (ahora) => {
            rafs.delete(id);
            if (!vivo || destruido) return;
            const dt = Math.min(0.05, (ahora - previo) / 1000);
            previo = ahora;
            fn(dt, ahora);
            if (vivo && !destruido) {
                id = requestAnimationFrame(paso);
                rafs.add(id);
            }
        };
        id = requestAnimationFrame(paso);
        rafs.add(id);
        return () => {
            vivo = false;
            cancelAnimationFrame(id);
            rafs.delete(id);
        };
    };
    ctx.alLimpiar = (fn) => limpiezas.push(fn);
    ctx.observarTamano = (elemento, fn) => {
        if (typeof ResizeObserver === "undefined") {
            ctx.on(window, "resize", fn);
            return;
        }
        const ro = new ResizeObserver(() => { if (!destruido) fn(); });
        ro.observe(elemento);
        limpiezas.push(() => ro.disconnect());
    };

    // ---------- Lienzo escalado por devicePixelRatio ----------
    ctx.lienzo = (padre, alRedimensionar) => {
        const canvas = el("canvas", "mg-lienzo");
        padre.appendChild(canvas);
        const g = canvas.getContext("2d");
        const info = { canvas, g, ancho: 1, alto: 1, dpr: 1 };
        const ajustar = (inicial) => {
            const r = padre.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            info.ancho = Math.max(1, r.width);
            info.alto = Math.max(1, r.height);
            info.dpr = dpr;
            canvas.width = Math.round(info.ancho * dpr);
            canvas.height = Math.round(info.alto * dpr);
            canvas.style.width = info.ancho + "px";
            canvas.style.height = info.alto + "px";
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            // La primera vez no se avisa: quien llama aún no recibe `info`
            if (alRedimensionar && inicial !== true) alRedimensionar(info);
        };
        ajustar(true);
        ctx.observarTamano(padre, () => ajustar(false));
        return info;
    };

    // ---------- Reloj de la partida ----------
    let inicio = 0;
    let acumulado = 0;
    let corriendo = false;
    let limiteMs = 0; // 0 = cronómetro ascendente; >0 = cuenta regresiva
    ctx.reloj = {
        iniciar() {
            inicio = performance.now();
            acumulado = 0;
            corriendo = true;
        },
        pausar() {
            if (corriendo) { acumulado += performance.now() - inicio; corriendo = false; }
        },
        reanudar() {
            if (!corriendo) { inicio = performance.now(); corriendo = true; }
        },
        ms() { return acumulado + (corriendo ? performance.now() - inicio : 0); },
        get corriendo() { return corriendo; },
    };
    /** Muestra el tiempo en el HUD. limite > 0 => cuenta regresiva con tiempo extra. */
    ctx.mostrarTiempo = (limite = 0) => {
        limiteMs = limite;
        chipTiempo.hidden = false;
        const pintar = () => {
            const t = ctx.reloj.ms();
            if (limiteMs > 0) {
                const resta = limiteMs - t;
                if (resta >= 0) {
                    chipTiempoTxt.textContent = formatoTiempo(resta + 999);
                    chipTiempo.classList.toggle("mg-urgente", resta < 10000);
                    chipTiempo.classList.remove("mg-extra");
                } else {
                    chipTiempoTxt.textContent = "+" + formatoTiempo(-resta);
                    chipTiempo.classList.remove("mg-urgente");
                    chipTiempo.classList.add("mg-extra");
                }
            } else {
                chipTiempoTxt.textContent = formatoTiempo(t);
            }
        };
        pintar();
        ctx.intervalo(pintar, 200);
    };
    ctx.contador = (html) => {
        chipContador.hidden = false;
        if (chipContador.innerHTML !== html) {
            chipContador.innerHTML = html;
            chipContador.classList.remove("mg-pulso");
            void chipContador.offsetWidth;
            chipContador.classList.add("mg-pulso");
        }
    };
    let estrellasPrevias = -1;
    /** Estrellas que se van ganando (vista previa en vivo). */
    ctx.estrellas = (n) => {
        chipEstrellas.hidden = false;
        if (n === estrellasPrevias) return;
        if (estrellasPrevias > n) {
            chipEstrellas.classList.remove("mg-pierde");
            void chipEstrellas.offsetWidth;
            chipEstrellas.classList.add("mg-pierde");
        }
        estrellasPrevias = n;
        chipEstrellas.innerHTML = estrellasHTML(n);
    };

    // ---------- Efectos ----------
    /** Convierte coordenadas de pantalla a coordenadas relativas a la raíz. */
    ctx.aRaiz = (clientX, clientY) => {
        const r = root.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    };
    /** Partículas de celebración en (x, y) relativos a la raíz. */
    ctx.chispas = (x, y, cantidad = 14) => {
        const colores = ["#b6533c", "#efa47f", "#d9a441", "#f5ead5", "#2c3a35"];
        for (let i = 0; i < cantidad; i++) {
            const p = el("span", "mg-chispa");
            const ang = (Math.PI * 2 * i) / cantidad + Math.random() * 0.6;
            const dist = 30 + Math.random() * 45;
            p.style.left = x + "px";
            p.style.top = y + "px";
            p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
            p.style.setProperty("--dy", Math.sin(ang) * dist - 10 + "px");
            p.style.setProperty("--rot", Math.random() * 360 + "deg");
            p.style.background = colores[i % colores.length];
            if (i % 3 === 0) p.classList.add("mg-chispa-estrella");
            root.appendChild(p);
            ctx.timeout(() => p.remove(), 800);
        }
    };
    /** Partículas centradas en un elemento. */
    ctx.chispasEn = (elemento, cantidad) => {
        const r = elemento.getBoundingClientRect();
        const p = ctx.aRaiz(r.left + r.width / 2, r.top + r.height / 2);
        ctx.chispas(p.x, p.y, cantidad);
    };
    /** Sacudida de error. */
    ctx.sacudir = (elemento = root) => {
        elemento.classList.remove("mg-sacudir");
        void elemento.offsetWidth;
        elemento.classList.add("mg-sacudir");
        ctx.timeout(() => elemento.classList.remove("mg-sacudir"), 450);
    };
    /** Destello de color sobre toda la escena. */
    ctx.destello = (tipo = "ok") => {
        const d = el("div", `mg-destello mg-destello-${tipo}`);
        ctx.escena.appendChild(d);
        ctx.timeout(() => d.remove(), 500);
    };
    /** Cartel breve en la parte superior de la escena. */
    let cartel = null;
    let cartelTimer = 0;
    ctx.cartel = (html, ms = 2600, tipo = "") => {
        if (!cartel) {
            cartel = el("div", "mg-cartel");
            cartel.setAttribute("role", "status");
            cartel.setAttribute("aria-live", "polite");
            ctx.escena.appendChild(cartel);
        }
        cartel.className = `mg-cartel mg-visible ${tipo ? "mg-cartel-" + tipo : ""}`;
        cartel.innerHTML = html;
        ctx.cancelarTimeout(cartelTimer);
        cartelTimer = ctx.timeout(() => cartel && cartel.classList.remove("mg-visible"), ms);
    };
    /** Sonidos cortos sintetizados (sin archivos). */
    ctx.sonido = (tipo) => {
        if (destruido || !sonidoActivo()) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            if (!audio) audio = new AC();
            const notas = {
                ok: [[660, 0, 0.08], [990, 0.07, 0.12]],
                error: [[180, 0, 0.18]],
                tap: [[520, 0, 0.05]],
                ganar: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1046, 0.3, 0.25]],
                salto: [[380, 0, 0.09]],
            }[tipo] || [[440, 0, 0.06]];
            const t0 = audio.currentTime;
            for (const [f, d, dur] of notas) {
                const o = audio.createOscillator();
                const v = audio.createGain();
                o.type = tipo === "error" ? "sawtooth" : "triangle";
                o.frequency.value = f;
                v.gain.setValueAtTime(0.0001, t0 + d);
                v.gain.exponentialRampToValueAtTime(0.12, t0 + d + 0.01);
                v.gain.exponentialRampToValueAtTime(0.0001, t0 + d + dur);
                o.connect(v).connect(audio.destination);
                o.start(t0 + d);
                o.stop(t0 + d + dur + 0.02);
            }
        } catch (e) { /* el audio es opcional */ }
    };

    // ---------- Capas (inicio y cierre) ----------
    function capa(html) {
        const c = el("div", "mg-capa");
        c.innerHTML = `<div class="mg-tarjeta" role="dialog" aria-modal="false">${html}</div>`;
        root.appendChild(c);
        return c;
    }

    /** Pantalla de instrucciones; llama a alEmpezar cuando el jugador pulsa el botón. */
    ctx.intro = (alEmpezar) => {
        if (opciones.saltarIntro) { alEmpezar(); return; }
        const imagen = work.image
            ? `<img class="mg-intro-img" src="${esc(work.image)}" alt="">`
            : "";
        const c = capa(`
          <div class="mg-intro">
            ${imagen}
            <div class="mg-intro-texto">
              <p class="mg-eyebrow">Minijuego</p>
              <h2>${esc(meta.name)}</h2>
              <p class="mg-instrucciones">${esc(meta.instructions)}</p>
              ${meta.controles ? `<p class="mg-controles">${meta.controles}</p>` : ""}
              <button type="button" class="mg-btn mg-btn-principal mg-btn-empezar">¡A jugar!</button>
            </div>
          </div>`);
        const btn = c.querySelector(".mg-btn-empezar");
        let hecho = false;
        const empezar = () => {
            if (hecho) return;
            hecho = true;
            c.classList.add("mg-saliendo");
            ctx.timeout(() => c.remove(), 260);
            ctx.sonido("tap");
            alEmpezar();
        };
        ctx.on(btn, "click", empezar);
        ctx.timeout(() => { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 50);
    };

    let terminado = false;
    /** Pantalla de victoria con estrellas, dato de la obra y botones. */
    ctx.ganar = ({ score, stars, resumen = "" }) => {
        if (terminado || destruido) return;
        terminado = true;
        ctx.reloj.pausar();
        const timeMs = Math.round(ctx.reloj.ms());
        const resultado = {
            score: Math.round(limitar(score, 0, 100)),
            stars: limitar(Math.round(stars), 1, 3),
            timeMs,
        };
        ctx.resultado = resultado;
        const dato = work.funFact || work.description || "";
        const titulos = ["¡Lo lograste!", "¡Muy bien!", "¡Excelente trabajo!"];
        ctx.timeout(() => {
            if (destruido) return;
            ctx.sonido("ganar");
            const c = capa(`
              <div class="mg-cierre">
                <p class="mg-eyebrow">Obra completada</p>
                <h2>${titulos[resultado.stars - 1]}</h2>
                ${estrellasHTML(resultado.stars, "mg-estrellas mg-estrellas-grandes")}
                <p class="mg-resumen">Puntaje <b>${resultado.score}</b> · Tiempo <b>${formatoTiempo(timeMs)}</b>${resumen ? " · " + resumen : ""}</p>
                ${dato ? `<div class="mg-dato"><span>¿Sabías que…?</span><p>${esc(dato)}</p></div>` : ""}
                <div class="mg-botones">
                  <button type="button" class="mg-btn mg-btn-secundario mg-btn-otra">Jugar otra vez</button>
                  <button type="button" class="mg-btn mg-btn-principal mg-btn-continuar">Continuar</button>
                </div>
              </div>`);
            c.classList.add("mg-capa-cierre");
            const r = c.querySelector(".mg-tarjeta").getBoundingClientRect();
            const p = ctx.aRaiz(r.left + r.width / 2, r.top + 60);
            ctx.chispas(p.x, p.y, 24);
            const btnC = c.querySelector(".mg-btn-continuar");
            ctx.on(btnC, "click", () => {
                if (cb.onComplete) cb.onComplete({ ...resultado });
            });
            ctx.on(c.querySelector(".mg-btn-otra"), "click", () => ctx.reiniciar && ctx.reiniciar());
            ctx.timeout(() => { try { btnC.focus({ preventScroll: true }); } catch (e) {} }, 60);
        }, 650);
    };
    Object.defineProperty(ctx, "terminado", { get: () => terminado });

    ctx.on(root.querySelector(".mg-btn-salir"), "click", () => {
        if (cb.onExit) cb.onExit();
    });

    // ---------- Destrucción ----------
    ctx.destruir = () => {
        if (destruido) return;
        destruido = true;
        for (const id of timeouts) clearTimeout(id);
        for (const id of intervalos) clearInterval(id);
        for (const id of rafs) cancelAnimationFrame(id);
        timeouts.clear(); intervalos.clear(); rafs.clear();
        while (limpiezas.length) {
            try { limpiezas.pop()(); } catch (e) { /* seguir limpiando */ }
        }
        if (audio) { try { audio.close(); } catch (e) {} audio = null; }
        root.remove();
    };
    return ctx;
}

/**
 * Monta un minijuego cumpliendo el contrato común.
 * `jugar(ctx)` construye la partida y puede devolver `{ prueba }` (ganchos para pruebas automáticas).
 */
export function montar(container, work, cb = {}, meta, jugar) {
    let actual = null;
    let prueba = null;
    const iniciar = (saltarIntro) => {
        actual = crearContexto(container, work || {}, meta, cb, { saltarIntro });
        actual.reiniciar = () => {
            actual.destruir();
            iniciar(true);
        };
        const r = jugar(actual) || {};
        prueba = r.prueba || null;
    };
    iniciar(false);
    return {
        destroy() { if (actual) actual.destruir(); },
        get _prueba() { return prueba; },
        get _ctx() { return actual; },
    };
}

/**
 * Arrastre con pointer events: llama a alSoltar(clientX, clientY) al terminar
 * y a alTocar() si fue un toque sin movimiento.
 * Usa captura de puntero, así que no deja listeners globales.
 */
export function hacerArrastrable(ctx, elemento, { alEmpezar, alMover, alSoltar, alTocar }) {
    let activo = null;
    ctx.on(elemento, "pointerdown", (e) => {
        if (e.button !== undefined && e.button > 0) return;
        if (elemento.disabled) return;
        activo = { id: e.pointerId, x0: e.clientX, y0: e.clientY, movido: false };
        try { elemento.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
    });
    ctx.on(elemento, "pointermove", (e) => {
        if (!activo || e.pointerId !== activo.id) return;
        const dx = e.clientX - activo.x0;
        const dy = e.clientY - activo.y0;
        if (!activo.movido && Math.hypot(dx, dy) > 6) {
            activo.movido = true;
            if (alEmpezar) alEmpezar(activo.x0, activo.y0);
        }
        if (activo.movido && alMover) alMover(e.clientX, e.clientY);
    });
    const fin = (e, cancelado) => {
        if (!activo || e.pointerId !== activo.id) return;
        const a = activo;
        activo = null;
        try { elemento.releasePointerCapture(e.pointerId); } catch (err) {}
        if (a.movido) { if (alSoltar) alSoltar(e.clientX, e.clientY, cancelado); }
        else if (!cancelado && alTocar) alTocar();
    };
    ctx.on(elemento, "pointerup", (e) => fin(e, false));
    ctx.on(elemento, "pointercancel", (e) => fin(e, true));
    // Evita que el clic sintético repita la acción de un toque.
    ctx.on(elemento, "click", (e) => {
        if (e.detail === 0 && alTocar) alTocar(); // activación por teclado (Enter/Espacio)
    });
}

/** Calcula el rectángulo (contain) de una imagen dentro de una caja. */
export function rectContain(cajaAncho, cajaAlto, imgAncho, imgAlto) {
    const escala = Math.min(cajaAncho / imgAncho, cajaAlto / imgAlto);
    const w = imgAncho * escala;
    const h = imgAlto * escala;
    return { x: (cajaAncho - w) / 2, y: (cajaAlto - h) / 2, w, h };
}

/** Carga una imagen y resuelve con sus dimensiones (o un tamaño por defecto si falla). */
export function cargarImagen(src) {
    return new Promise((resolve) => {
        if (!src) { resolve({ img: null, ancho: 4, alto: 3 }); return; }
        const img = new Image();
        img.onload = () => resolve({ img, ancho: img.naturalWidth || 4, alto: img.naturalHeight || 3 });
        img.onerror = () => resolve({ img: null, ancho: 4, alto: 3 });
        img.src = src;
    });
}
