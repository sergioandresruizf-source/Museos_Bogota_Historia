/* ===== IMÁGENES: pega la dirección de la foto entre las comillas. a = anverso (frente), r = reverso (al revés). Si lo dejas vacío se usa el dibujo. ===== */
const CARPETA = "assets/"; // carpeta de tus imágenes, relativa a este HTML[cite: 1]
const IMAGENES = {
  moneda_colonial_1810: { a: "monedas/1.png", r: "monedas/1.2.png" },

  medio_peso_1868: { a: "monedas/19.png", r: "monedas/19.2.png" },

  la_pelucona_carlos_iii_1789: { a: "monedas/18.png", r: "monedas/18.2.png" },
  dos_reales_cartagena_1812: { a: "monedas/2.png", r: "monedas/2.2.png" },
  real_cundinamarca_la_china_1813: {
    a: "monedas/12.png",
    r: "monedas/12.2.png",
  },
  ocho_reales_provincias_unidas_1819: {
    a: "monedas/17.png",
    r: "monedas/17.png",
  },
  ocho_reales_republica_1820: { a: "monedas/16.png", r: "monedas/16.2.png" },
  cuarto_real_nueva_granada_1839: {
    a: "monedas/11.png",
    r: "monedas/11.2.png",
  },
  diez_pesos_oro_el_condor_1858: { a: "monedas/8.png", r: "monedas/8.2.png" },
  ficha_1_tarro_la_amalia: { a: "monedas/7.png", r: "monedas/7.2.png" },
  cincuenta_centavos_la_cocobola_1887: {
    a: "monedas/5.2.png",
    r: "monedas/5.png",
  },
  cincuenta_centavos_cristobal_colon_1892: {
    a: "monedas/15.png",
    r: "monedas/15.2.png",
  },
  billete_1000_pesos_banco_nacional_1895: {
    a: "billetes/10.jpg",
    r: "billetes/10.2.jpg",
  },
  cinco_centavos_lazareto_1921: { a: "monedas/6.png", r: "monedas/6.2.png" },
  billete_5_pesos_oro_resellado_1923: {
    a: "billetes/9.jpg",
    r: "billetes/9.2.jpg",
  },
};

const ITEMS = [
  {
    id: "moneda_colonial_1810",
    t: "coin",
    n: "Moneda colonial y antecedentes de la Independencia (2 Reales de Fernando VII)",
    c: "#d9d2c0",
    a: ["1810", "FERNANDO VII"],
    r: ["👑", "2 REALES"],
    date: "1810 (Siglos XVI-1810; periodo colonial)",
    by: "La Corona española, las autoridades coloniales y las casas de moneda de Santafé y Popayán",
    h: "La economía utilizó monedas españolas y piezas acuñadas localmente. Circularon principalmente oro y plata, con valores y pesos regulados por la monarquía, expresando la autoridad del rey y facilitando el comercio, los tributos y los pagos.",
    cu: "Era un símbolo visible del poder colonial y no se identifica censura artística general, aunque la Corona controlaba estrictamente su acuñación, circulación y falsificación.",
  },

  {
    id: "medio_peso_1868",
    t: "coin",
    n: "Restablecimiento del patrón de plata (Medio Peso de los Estados Unidos de Colombia)",
    c: "#d9d2c0",
    a: ["1/2", "PESO"],
    r: ["🥈", "1868"],
    date: "1868 (Periodo 1864-1870)",
    by: "Gobierno de los Estados Unidos de Colombia y Congreso; casas de moneda nacionales y regionales",
    h: "Tras ensayos y rectificaciones sobre la ley monetaria, la ley del 24 de octubre de 1867 restableció el patrón plata (peso de 25 gramos y ley .900), circulando también medios pesos y fracciones.",
    cu: "Surgieron incentivos para llevar a la ceca monedas de menor pureza, lo que podía debilitar la calidad del dinero en circulación.",
  },

  {
    id: "la_pelucona_carlos_iii_1789",
    t: "coin",
    n: 'Escudos "La Pelucona" de Carlos III',
    c: "#ffd166",
    a: ["1789", "PELUCONA"],
    r: ["👑", "ESCUDOS"],
    date: "1789 (Reinado de Carlos III)",
    by: "La Corona española, durante el reinado de Carlos III, y las casas de moneda autorizadas",
    h: "Pieza de oro conocida como 'La Pelucona' que muestra el retrato del monarca en una cara y el escudo de la Corona en la otra, identificando la autoridad emisora y la pertenencia al sistema español.",
    cu: "El retrato del rey convertía la moneda cotidiana en un recordatorio constante de la autoridad política colonial.",
  },
  {
    id: "dos_reales_cartagena_1812",
    t: "coin",
    n: "2 Reales del Estado de Cartagena",
    c: "#c9b37e",
    a: ["2", "REALES"],
    r: ["⚔", "1812"],
    date: "1812 (Periodo de la Independencia)",
    by: "Las autoridades patriotas del Estado de Cartagena",
    h: "Emitida por Cartagena durante la independencia para atender necesidades económicas del gobierno patriota, con símbolos y leyendas del Estado de Cartagena que buscaban afirmar una autoridad distinta a la Corona.",
    cu: "Durante la Reconquista, las autoridades realistas combatieron los signos monetarios patriotas y restringieron su circulación.",
  },
  {
    id: "real_cundinamarca_la_china_1813",
    t: "coin",
    n: '1 Real de Cundinamarca "La China"',
    c: "#d9d2c0",
    a: ["1", "REAL"],
    r: ["🌿", "LA CHINA"],
    date: "1813 (Periodo de la Independencia)",
    by: "Gobierno de Cundinamarca; el diseño de 'La China' se relaciona con Antonio Nariño",
    h: "Moneda de un real de las emisiones de Cundinamarca conocida como 'La China', con perfil femenino en una cara y motivo vegetal con denominación en la otra, apartándose del retrato del monarca español.",
    cu: "Cambiar los símbolos monetarios era una forma de expresar un nuevo lenguaje político y una autoridad diferente.",
  },
  {
    id: "ocho_reales_provincias_unidas_1819",
    t: "coin",
    n: "8 Reales de las Provincias Unidas de la Nueva Granada",
    c: "#d9d2c0",
    a: ["8", "REALES"],
    r: ["🌱", "1819"],
    date: "1819 (Periodo de la Independencia)",
    by: "Las autoridades de las Provincias Unidas de la Nueva Granada",
    h: "Emitida en el contexto de las Provincias Unidas de la Nueva Granada, con busto femenino en el anverso y símbolo vegetal con letras y marcas de valor en el reverso para identificar emisiones propias.",
    cu: "La guerra, los cambios de autoridad y la escasez de recursos dificultaban la estabilidad monetaria y la confianza en las piezas.",
  },
  {
    id: "ocho_reales_republica_1820",
    t: "coin",
    n: "8 Reales de la República de Colombia",
    c: "#d9d2c0",
    a: ["8", "REALES"],
    r: ["🇨🇴", "1820"],
    date: "1820 (Periodo republicano inicial)",
    by: "Las autoridades de la República de Colombia en el proceso de organización republicana",
    h: "Conserva el formato metálico de ocho reales e incorpora referencias a la República de Colombia, con retrato y símbolos del reverso vinculados al nuevo orden político tras las victorias independentistas.",
    cu: "La transición desde las monedas coloniales no fue inmediata: coexistían piezas de distintos periodos y características.",
  },
  {
    id: "cuarto_real_nueva_granada_1839",
    t: "coin",
    n: "1¼ de Real de la Nueva Granada",
    c: "#d9d2c0",
    a: ["1/4", "REAL"],
    r: ["🌾", "1839"],
    date: "1839 (Periodo de la Nueva Granada)",
    by: "El gobierno de la Nueva Granada y las autoridades encargadas de la acuñación",
    h: "Moneda fraccionaria de un cuarto de real emitida en la Nueva Granada, con elementos vegetales y denominación en ambas caras, pensada para pagos de menor valor y transacciones cotidianas.",
    cu: "Las piezas de baja denominación eran clave para facilitar los intercambios pequeños en la vida económica diaria.",
  },
  {
    id: "diez_pesos_oro_el_condor_1858",
    t: "coin",
    n: '10 Pesos de Oro "El Cóndor"',
    c: "#ffd166",
    a: ["10", "PESOS"],
    r: ["🦅", "CÓNDOR"],
    date: "1858 (Periodo de la Nueva Granada)",
    by: "El gobierno de la Nueva Granada y las autoridades monetarias de la época",
    h: "Moneda de diez pesos de oro llamada 'El Cóndor', perteneciente a las emisiones republicanas de la Nueva Granada, con retrato en una cara y escudo con el cóndor en la otra.",
    cu: "Su denominación y material reflejan el peso del oro y los debates sobre el patrón monetario y el modelo económico.",
  },
  {
    id: "ficha_1_tarro_la_amalia",
    t: "coin",
    n: "Ficha 1 Tarro - Hacienda La Amalia",
    c: "#c9b37e",
    a: ["1", "TARRO"],
    r: ["🏡", "LA AMALIA"],
    date: "No indicado",
    by: "La Hacienda La Amalia (autoría individual o autoridad no identificada en el banco de imágenes)",
    h: "Ficha vinculada a la Hacienda La Amalia con denominación de un tarro, mostrando en ambas caras la inscripción del lugar y el valor señalado en lugar de ser una moneda nacional.",
    cu: "No se precisa fecha, lugar exacto ni condiciones de uso en el material suministrado; evidencia intercambios ligados a espacios o actividades particulares.",
  },
  {
    id: "cincuenta_centavos_la_cocobola_1887",
    t: "coin",
    n: '50 Centavos "La Cocobola"',
    c: "#d9d2c0",
    a: ["50", "CENTAVOS"],
    r: ["🛡", "COCOBOLA"],
    date: "1887 (Periodo de la Regeneración)",
    by: "Autoridad emisora no especificada en el banco de imágenes",
    h: "Pieza de cincuenta centavos identificada como 'La Cocobola', con retrato y escudo en sus caras, denominación y referencias a Bogotá, circulando durante la Regeneración.",
    cu: "Muestra que durante la Regeneración el efectivo no se limitaba al papel moneda, pese a la centralización de la emisión de billetes.",
  },
  {
    id: "cincuenta_centavos_cristobal_colon_1892",
    t: "coin",
    n: "50 Centavos de Cristóbal Colón",
    c: "#d9d2c0",
    a: ["50", "CENTAVOS"],
    r: ["🧭", "COLÓN"],
    date: "1892 (Periodo de la República de Colombia)",
    by: "Autoridad emisora no especificada en el banco de imágenes",
    h: "Moneda de cincuenta centavos con el retrato de Cristóbal Colón en una cara y un escudo en la otra, combinando figura histórica con símbolos institucionales y denominación.",
    cu: "El banco de imágenes no explica el motivo específico de elegir a Colón ni las condiciones de emisión de la pieza.",
  },
  {
    id: "billete_1000_pesos_banco_nacional_1895",
    t: "note",
    n: "Billete de 1.000 Pesos del Banco Nacional",
    c: "#bfe3c0",
    a: ["1.000", "PESOS"],
    r: ["🏦", "1895"],
    date: "1895 (Periodo de operación y liquidación del Banco Nacional)",
    by: "Banco Nacional (emisiones oficiales de la época)",
    h: "Billete de mil pesos impreso en ambas caras con elementos ornamentales, inscripciones y denominación, ubicado en los años finales del Banco Nacional antes de su liquidación y disolución efectiva.",
    cu: "La emisión excesiva y los problemas fiscales redujeron la confianza y el poder adquisitivo al financiar al Estado sin límites creíbles.",
  },
  {
    id: "cinco_centavos_lazareto_1921",
    t: "coin",
    n: "5 Centavos de Lazareto",
    c: "#d9d2c0",
    a: ["5", "CENTAVOS"],
    r: ["🏥", "LAZARETO"],
    date: "1921 (Periodo de la República de Colombia)",
    by: "Autoridad emisora no identificada en el banco de imágenes",
    h: "Moneda de cinco centavos con la denominación 'Lazareto', mostrando en ambas caras la identificación de la pieza y su valor como una emisión particular.",
    cu: "El material no detalla quién ordenó su emisión, dónde circuló ni su alcance, aunque muestra la existencia de emisiones especiales.",
  },
  {
    id: "billete_5_pesos_oro_resellado_1923",
    t: "note",
    n: "Billete de 5 Pesos Oro Resellado",
    c: "#ffe08a",
    a: ["5", "PESOS ORO"],
    r: ["🔖", "RESELLADO"],
    date: "1923 (Periodo de la República de Colombia)",
    by: "Autoridad emisora original y entidad del resello no especificadas en el banco de imágenes",
    h: "Billete de cinco pesos oro con un resello visible sobre el diseño impreso y elementos gráficos en ambas caras, señal de una intervención posterior a su impresión.",
    cu: "Sin información adicional no se precisan el motivo exacto, la fecha de la intervención ni la entidad que realizó el resello.",
  },
];

/* ===== MÁQUINA DE JUEGOS ===== */
// Para agregar un juego nuevo: crea la función y añádela aquí
const GAMES = [
  { n: "Cazamonedas", d: "Atrapa 5 piezas en 8 segundos", run: jAtrapa },
  {
    n: "Reflejos",
    d: "Detén el marcador en la zona dorada (3 rondas)",
    run: jReflejos,
  },
  {
    n: "Memoria",
    d: "Encuentra las 3 parejas con máximo 5 fallos",
    run: jMemoria,
  },
];

function insert(it, el) {
  cur = it;
  el.classList.add("gone");
  const g = GAMES[Math.floor(Math.random() * GAMES.length)]; // juego al azar
  const sc = $("#screen");
  sc.innerHTML = `<div class="msg"><div style="width:${it.t === "coin" ? 70 : 105}px;margin:0 auto 8px;animation:pop .4s">${face(it, "a")}</div>¡Insertaste: <b>${it.n}</b>!<br>🎮 <b>${g.n}</b> · ${g.d}<br><button class="btn" id="go">¡JUGAR!</button></div>`;
  $("#go").onclick = () => play(it, el, g);
}

function play(it, el, g) {
  clearInterval(timer);
  const sc = $("#screen");
  sc.innerHTML = "";
  $("#s").textContent = 0;
  $("#t").textContent = "--";
  $("#bar").style.width = "100%";
  $("#bar").className = "";
  g.run(sc, it, (win) => finish(win, it, el));
}

// Siempre abre la información al terminar
function finish(win, it, el) {
  clearInterval(timer);
  if (!cur) return;
  cur = null;
  $("#screen").innerHTML =
    `<div class="msg" style="font-size:22px">${win ? "🎉 ¡Excelente!" : "😅 ¡Buen intento!"}<br>Abriendo la pieza…</div>`;
  if (win) burst();
  setTimeout(() => reveal(it, el), 900);
}

/* ---- Juego 1: Cazamonedas (tu juego actual) ---- */
function jAtrapa(sc, it, done) {
  let score = 0,
    t = 80,
    over = false;
  const T0 = 80;
  $("#t").textContent = "8.0";
  const spawn = () => {
    if (over) return;
    const b = document.createElement("div");
    b.className = "target piece";
    b.style.width = (it.t === "coin" ? 54 : 86) + "px";
    b.innerHTML = face(it, "a");
    b.style.left = Math.random() * (sc.clientWidth - 90) + "px";
    b.style.top = Math.random() * (sc.clientHeight - 60) + "px";
    b.onpointerdown = () => {
      if (over || b.classList.contains("hit")) return;
      b.classList.add("hit");
      setTimeout(() => b.remove(), 300);
      $("#s").textContent = ++score;
      if (score >= 5) end(true);
      else spawn();
    };
    sc.appendChild(b);
    setTimeout(() => {
      if (!over && b.isConnected && !b.classList.contains("hit")) {
        b.remove();
        spawn();
      }
    }, 1100);
  };
  spawn();
  spawn();
  timer = setInterval(() => {
    t--;
    $("#t").textContent = (t / 10).toFixed(1);
    $("#bar").style.width = (t / T0) * 100 + "%";
    if (t < 25) $("#bar").className = "low";
    if (t <= 0) end(false);
  }, 100);
  function end(win) {
    if (over) return;
    over = true;
    clearInterval(timer);
    if (win) {
      const tt = (T0 - t) / 10;
      if (best === null || tt < best) {
        best = tt;
        $("#rec").textContent = tt.toFixed(1) + "s";
      }
    }
    done(win);
  }
}

/* ---- Juego 2: Reflejos (3 rondas, gana con 2 aciertos) ---- */
function jReflejos(sc, it, done) {
  const speed = [1.6, 2.3, 3.2];
  let round = 0,
    hits = 0,
    x = 0,
    dir = 1,
    zl = 0,
    zw = 0,
    over = false;
  sc.innerHTML = `<div style="width:84%;text-align:center">
    <div class="msg" id="rmsg"></div>
    <div class="rbar"><div class="rzone" id="rz"></div><i class="rmk" id="rmk"></i></div>
    <button class="btn" id="rstop">¡YA!</button></div>`;
  const zone = $("#rz"),
    mk = $("#rmk"),
    msg = $("#rmsg");
  const newRound = () => {
    zw = 22 - round * 4; // la zona se hace más pequeña
    zl = 8 + Math.random() * (84 - zw);
    zone.style.left = zl + "%";
    zone.style.width = zw + "%";
    msg.innerHTML = `Ronda ${round + 1}/3 · Aciertos: ${hits}`;
  };
  newRound();
  timer = setInterval(() => {
    x += dir * speed[round];
    if (x >= 100) {
      x = 100;
      dir = -1;
    }
    if (x <= 0) {
      x = 0;
      dir = 1;
    }
    mk.style.left = x + "%";
  }, 16);
  $("#rstop").onclick = () => {
    if (over) return;
    if (x >= zl && x <= zl + zw) hits++;
    round++;
    if (round >= 3) {
      over = true;
      clearInterval(timer);
      done(hits >= 2);
    } else newRound();
  };
}

/* ---- Juego 3: Memoria (tu pieza + 2 piezas al azar) ---- */
function jMemoria(sc, it, done) {
  const others = ITEMS.filter((o) => o.id !== it.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const deck = [it, ...others]
    .flatMap((o) => [o, o])
    .sort(() => Math.random() - 0.5);
  let first = null,
    lock = false,
    found = 0,
    fails = 0,
    over = false;
  sc.innerHTML = `<div style="width:92%"><div class="msg" id="mmsg"></div><div class="mgrid" id="mg"></div></div>`;
  const msg = $("#mmsg"),
    mg = $("#mg");
  const upd = () =>
    (msg.innerHTML = `Encuentra las 3 parejas · Fallos: ${fails}/5`);
  upd();
  deck.forEach((o) => {
    const c = document.createElement("div");
    c.className = "mcard";
    c.dataset.id = o.id;
    c.innerHTML = `<div class="mi"><div class="mf mb">?</div><div class="mf mfr">${face(o, "a")}</div></div>`;
    c.onclick = () => {
      if (lock || over || c.classList.contains("up")) return;
      c.classList.add("up");
      if (!first) {
        first = c;
        return;
      }
      if (first.dataset.id === c.dataset.id) {
        first = null;
        if (++found === 3) {
          over = true;
          setTimeout(() => done(true), 500);
        }
      } else {
        lock = true;
        fails++;
        upd();
        const a = first;
        first = null;
        setTimeout(() => {
          a.classList.remove("up");
          c.classList.remove("up");
          lock = false;
          if (fails >= 5) {
            over = true;
            done(false);
          }
        }, 800);
      }
    };
    mg.appendChild(c);
  });
}

const $ = (s) => document.querySelector(s);
const faceArt = (it, side) => {
  const [big, sm] = it[side === "a" ? "a" : "r"];
  if (it.t === "coin")
    return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3b2a4a"/><circle cx="50" cy="50" r="45" fill="${it.c}"/><circle cx="50" cy="50" r="37" fill="none" stroke="#3b2a4a" stroke-width="2" stroke-dasharray="3 3"/><ellipse cx="34" cy="28" rx="14" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 34 28)"/><text x="50" y="${big.length > 2 ? 52 : 56}" text-anchor="middle" font-size="${big.length > 2 ? 24 : 30}" font-weight="800" fill="#3b2a4a">${big}</text><text x="50" y="74" text-anchor="middle" font-size="9" font-weight="800" fill="#3b2a4a">${sm}</text></svg>`;
  return `<svg viewBox="0 0 160 100"><rect x="2" y="2" width="156" height="96" rx="12" fill="#3b2a4a"/><rect x="7" y="7" width="146" height="86" rx="9" fill="${it.c}"/><rect x="13" y="13" width="134" height="74" rx="6" fill="none" stroke="#3b2a4a" stroke-width="2" stroke-dasharray="4 3"/><circle cx="46" cy="50" r="22" fill="#fff" opacity=".6" stroke="#3b2a4a" stroke-width="2"/><text x="46" y="58" text-anchor="middle" font-size="22">${side === "a" ? "🧑" : "✨"}</text><text x="108" y="48" text-anchor="middle" font-size="${big.length > 4 ? 17 : 20}" font-weight="800" fill="#3b2a4a">${big}</text><text x="108" y="66" text-anchor="middle" font-size="9" font-weight="800" fill="#3b2a4a">${sm}</text></svg>`;
};
const face = (it, side) => {
  const u0 = (IMAGENES[it.id] || {})[side];
  if (!u0) return faceArt(it, side);
  const u = /^(https?:|data:|\/)/.test(u0) ? u0 : CARPETA + u0;
  if (it.t === "coin") {
    return `<svg viewBox="0 0 100 100"><image href="${u}" x="2" y="2" width="96" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`;
  }
  return `<svg viewBox="0 0 160 100"><image href="${u}" x="2" y="2" width="156" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`;
};
const done = new Set();
let cur = null,
  timer = null;
const grid = $("#grid");
ITEMS.forEach((it) => {
  const d = document.createElement("div");
  d.className = "item " + it.t;
  d.dataset.id = it.id;
  d.innerHTML = face(it, "a") + '<span class="star">⭐</span>';
  grid.appendChild(d);
  d.addEventListener("pointerdown", (e) => {
    if (cur) return;
    e.preventDefault();
    const sx = e.clientX,
      sy = e.clientY;
    let g = null;
    const slot = $("#slot");
    const mv = (ev) => {
      if (!g && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        g = document.createElement("div");
        g.className = "ghost";
        g.innerHTML = face(it, "a");
        document.body.appendChild(g);
        d.classList.add("gone");
      }
      if (g) {
        g.style.left = ev.clientX - 50 + "px";
        g.style.top = ev.clientY - 40 + "px";
        const r = slot.getBoundingClientRect();
        slot.classList.toggle(
          "hot",
          ev.clientX > r.left - 30 &&
            ev.clientX < r.right + 30 &&
            ev.clientY > r.top - 60 &&
            ev.clientY < r.bottom + 30,
        );
      }
    };
    const up = (ev) => {
      removeEventListener("pointermove", mv);
      removeEventListener("pointerup", up);
      const hot = slot.classList.contains("hot");
      slot.classList.remove("hot");
      if (g) {
        g.remove();
        d.classList.remove("gone");
      }
      if (!g || hot) insert(it, d);
    };
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
  });
});
let best = null;
const trk = $("#grid");
let hov = false;
$("#pv").onclick = () => trk.scrollBy({ left: -200 });
$("#nx").onclick = () => trk.scrollBy({ left: 200 });
trk.onmouseenter = () => (hov = true);
trk.onmouseleave = () => (hov = false);
setInterval(() => {
  if (hov || cur) return;
  if (trk.scrollLeft + trk.clientWidth >= trk.scrollWidth - 4)
    trk.scrollTo({ left: 0 });
  else trk.scrollBy({ left: 200 });
}, 2600);

function burst() {
  for (let i = 0; i < 26; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = ["🪙", "⭐", "✨", "🎉"][i % 4];
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}
function reveal(it, el) {
  done.add(it.id);
  el.classList.add("done");
  el.classList.remove("gone");
  $("#cnt").textContent = done.size;
  $("#panel").innerHTML =
    `<h2 style="margin:0 0 10px;text-align:center">${it.n}</h2>
<div class="flip" id="fl"><div class="in"><div class="f">${face(it, "a")}</div><div class="f r">${face(it, "r")}</div></div></div>
<div class="hint">👆 Toca la pieza para ver anverso y reverso</div>
<div class="facts"><div class="fact"><b>Fecha</b><span>${it.date}</span></div><div class="fact"><b>Autor</b><span>${it.by}</span></div><div class="fact"><b>Historia</b><span>${it.h}</span></div><div class="fact"><b>Curiosidad</b><span>${it.cu}</span></div></div>
<div style="text-align:center"><button class="btn" id="cl">¡Seguir jugando!</button></div>`;
  $("#fl").onclick = (e) => e.currentTarget.classList.toggle("back");
  $("#cl").onclick = close;
  $("#modal").classList.add("on");
  if (done.size === ITEMS.length) setTimeout(burst, 800);
}
function close() {
  $("#modal").classList.remove("on");
  $("#screen").innerHTML =
    done.size === ITEMS.length
      ? '<div class="msg">🏆 ¡Completaste la colección!</div>'
      : '<div class="msg">Elige otra pieza para jugar 👇</div>';
  $("#t").textContent = "--";
  $("#s").textContent = 0;
}
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") close();
});
(() => {
  const bg = $("#bg"),
    n = innerWidth < 600 ? 16 : 30,
    ps = [];
  for (let i = 0; i < n; i++) {
    const it = ITEMS[i % ITEMS.length],
      z = Math.random(),
      w = it.t === "coin" ? 50 + z * 90 : 90 + z * 150;
    const p = document.createElement("div");
    p.className = "p";
    p.style.cssText = `width:${w}px;left:${Math.random() * 100 - 5}%;top:${Math.random() * 100 - 5}%;opacity:${0.25 + z * 0.4};z-index:${Math.round(z * 10)};filter:${z < 0.4 ? "url(#wob) blur(2.5px)" : z < 0.7 ? "blur(1px)" : "none"};transform:rotateX(${Math.random() * 24 - 12}deg) rotateY(${Math.random() * 24 - 12}deg) rotateZ(${Math.random() * 20 - 10}deg) skewX(${Math.random() * 6 - 3}deg)`;
    p.innerHTML = face(it, Math.random() < 0.5 ? "a" : "r");
    p.firstChild.style.animation = `drift ${5 + Math.random() * 6}s ease-in-out ${-Math.random() * 8}s infinite`;
    bg.appendChild(p);
    ps.push([p, z]);
  }
  let mx = 0,
    my = 0;
  const upd = () =>
    ps.forEach(
      ([p, z]) =>
        (p.style.translate = `${mx * z * 50}px ${my * z * 50 - scrollY * z * 0.35}px`),
    );
  addEventListener("pointermove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
    upd();
  });
  addEventListener("scroll", upd, { passive: true });
  upd();
})();

//MUSICA

/* ===== MÚSICA DE FONDO (sin controles) ===== */
const MUSICA_CARPETA = "assets/musica/";
const CANCIONES = ["cancion1.mp3", "cancion2.mp3", "cancion3.mp3"]; // tus nombres exactos
const MEZCLAR = false; // true = orden aleatorio
const VOLUMEN = 0.7; // de 0 a 1

const audio = new Audio();
audio.volume = VOLUMEN;
audio.preload = "auto";
let idx = MEZCLAR ? Math.floor(Math.random() * CANCIONES.length) : 0;
let fallos = 0;

function cargar(i) {
  idx =
    MEZCLAR && CANCIONES.length > 1
      ? Math.floor(Math.random() * CANCIONES.length)
      : (i + CANCIONES.length) % CANCIONES.length;
  audio.src = MUSICA_CARPETA + encodeURI(CANCIONES[idx]);
}
function sonar() {
  audio
    .play()
    .then(() => (fallos = 0))
    .catch(() => {});
}
function siguiente() {
  cargar(idx + 1);
  sonar();
}

cargar(idx);
audio.addEventListener("ended", siguiente); // al terminar pasa a la siguiente; tras la última vuelve a la primera
audio.addEventListener("error", () => {
  // si un archivo falla, salta al siguiente
  if (++fallos < CANCIONES.length) siguiente();
});

// Intenta arrancar de una vez. Si el navegador lo bloquea, arranca en la primera interacción
sonar();
["pointerdown", "keydown", "touchstart"].forEach((ev) =>
  addEventListener(
    ev,
    () => {
      if (audio.paused) sonar();
    },
    { once: true },
  ),
);

// Buena práctica: silencio al salir de la pestaña, y continúa al volver
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.pause();
  else sonar();
});
