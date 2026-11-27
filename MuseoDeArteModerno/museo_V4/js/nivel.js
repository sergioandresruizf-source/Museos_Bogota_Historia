// ===== NIVEL: aquí editas pisos, mapas, salas, texturas, objetos y textos =====
// MÚSICA por espacio, según MusicaMIMAMBO.pdf. Cada espacio reproduce sus canciones una tras otra, en bucle.
// Una sala usa su "musica"; si no tiene, usa la del piso. Las canciones están en la carpeta audio/.
const MUSICA = {
  hall:         ["audio/a_walk.mp3"],                                // 1 · Hall de Entrada: Tycho – A Walk
  marta_traba:  ["audio/halcyon.mp3", "audio/looped.mp3"],           // 2 · Sala Marta Traba: Orbital – Halcyon + On + On / Kiasmos – Looped
  patios:       ["audio/an_ending.mp3"],                             // 3 · Patio de Esculturas: Brian Eno – An Ending (Ascent)
  obregon:      ["audio/rhubarb.mp3", "audio/immunity.mp3"],         // 4 · Sala Alejandro Obregón (Triángulo): Aphex Twin – Rhubarb / Jon Hopkins – Immunity
  multiple:     ["audio/xtal.mp3", "audio/lesalpx.mp3"],             // 5 · Sala Múltiple: Aphex Twin – Xtal / Floating Points – LesAlpx
  escalera:     ["audio/resonance.mp3", "audio/boc_1969.mp3"],       // 6 · Escalera Central / Rampas (aquí: Patio Cubierto): HOME – Resonance / Boards of Canada – 1969
  rojas:        ["audio/acid_rain.mp3", "audio/vortex.mp3"],         // 7 · Sala Carlos Rojas: Lorn – Acid Rain / John Carpenter – Vortex
  haime:        ["audio/eutow.mp3", "audio/crystals.mp3"],           // 8 · Sala Sonia y Carlos Haime: Autechre – Eutow / M.O.O.N. – Crystals
  pasillo:      ["audio/broken_date.mp3", "audio/untravel.mp3"],     // 9 · Pasillo Intermedio / Galería: Com Truise – Broken Date / Rival Consoles – Untravel
  mirador:      ["audio/nightcall.mp3", "audio/chrome_country.mp3"], // 10 · Mirador (Proyectos Especiales): Kavinsky – Nightcall / Oneohtrix Point Never – Chrome Country
  experimental: ["audio/repetition.mp3", "audio/forgive.mp3"],       // 11 · Espacio Experimental (Sala de Fotografía): Max Cooper – Repetition / Burial – Forgive
  tienda:       ["audio/solar_sailer.mp3", "audio/das_spiegel.mp3"], // 12 · Tienda / Salida (Sótano): Daft Punk – Solar Sailer / The Chemical Brothers – Das Spiegel
  // Espacios nuevos (no están en el PDF; usan canciones que ya existen, cámbialas si quieres):
  boveda:       ["audio/vortex.mp3", "audio/acid_rain.mp3"],         // Bóveda secreta (pelea con el jefe)
  final:        ["audio/an_ending.mp3"]                              // Pantalla de agradecimiento
};

const NIVEL = {
  nombre: 'Museo de Arte Moderno de Bogotá',
  inicio: { piso: 1 },
  // RECORRIDO: orden en que se desbloquean los pisos (índices de "pisos"; el primero es el piso inicial).
  // Para ir al siguiente hay que ver CONFIG.umbralPiso de las obras del piso anterior o su obra "principal".
  // Al completar el último (el Sótano) se abre la puerta secreta "%".
  recorrido: [1, 2, 3, 0],   // Nivel 1 → Nivel 2 → Nivel 3 → Sótano
  suelo: "ladrillo",          // texturas por defecto de suelo y techo (cada piso o sala puede cambiarlas)
  techo: "techo",
  sonidoElevador: "audio/elevador.mp3",

  // LEYENDA del mapa (compartida por todos los pisos). "." o espacio = suelo.
  //   textura      nombre en "texturas"            interaccion  id en "interacciones" (se examina con E)
  //   puerta       true = puerta estilo DOOM (se abre con E y se cierra sola) · "secreta" = se abre al completar el Sótano
  //   alto         alto del hueco de la puerta (el muro llega a CONFIG.alturaTecho)
  //   estirar      la textura ocupa todo el alto del muro      ventana  se ve el cielo/la ciudad a través
  //   zocalo:false sin zócalo oscuro abajo
  leyenda: {
    "#": { textura: "yeso" },                         // muro blanco
    "L": { textura: "yeso" },                         // columnas y paneles
    "W": { textura: "madera" },
    "E": { textura: "elevador", interaccion: "elevador", pista: "Usar elevador", zocalo: false },
    "T": { textura: "placa", interaccion: "placa_bienvenida", pista: "Leer placa" },
    "P": { textura: "placa", interaccion: "auditorio", pista: "Leer cartel" },
    "V": { textura: "ventana", interaccion: "calle26", pista: "Mirar por la ventana", estirar: true, ventana: true, zocalo: false },
    "~": { textura: "pantalla", estirar: true, zocalo: false },     // pantalla de cine
    "|": { textura: "telon", estirar: true, zocalo: false },        // telón rojo
    "+": { puerta: true, textura: "puerta", marco: "marco", alto: 1.25, pista: "Abrir puerta" },
    "%": { puerta: "secreta", textura: "yeso", alto: 1, marco: "piedra" },   // parece un muro más
    "&": { textura: "piedra", zocalo: false },        // muros de la bóveda secreta
    "$": { textura: "ladrillo", zocalo: false }       // pilares de la bóveda
  },

  // Texturas: archivo de imagen o "gen:<nombre>" = dibujada por js/recursos.js.
  // Todas las paredes del museo son de yeso (muro blanco); el suelo es de ladrillo.
  texturas: {
    yeso: "textures/paredes/yeso.png", piedra: "textures/paredes/piedra.png",
    ladrillo: "textures/paredes/ladrillo.png", madera: "textures/paredes/madera.png",
    placa: "textures/paredes/placa_yeso.png", elevador: "textures/paredes/elevador_yeso.png",
    ventana: "gen:ventana", pantalla: "gen:pantalla", telon: "gen:telon",
    puerta: "gen:puerta", marco: "gen:marco",
    // suelos y techos (128 × 128)
    suelo_ladrillo: "textures/suelos/ladrillo.png", concreto: "textures/suelos/concreto.png",
    techo: "textures/suelos/techo.png", luz: "gen:luz", claraboya: "gen:claraboya", techo_boveda: "gen:techo_boveda"
  },
  // Suelos y techos usan estos nombres (pueden apuntar a otra textura)
  superficies: { ladrillo: "suelo_ladrillo", concreto: "concreto", techo: "techo", claraboya: "claraboya", techo_boveda: "techo_boveda" },

  // SPRITES: alto en casillas (los ojos están a CONFIG.alturaOjos); solido = radio que bloquea el paso.
  sprites: {
    jarron:  { src: "textures/objetos/jarron.png",  alto: 0.42, solido: 0.18 },
    estatua: { src: "textures/objetos/estatua.png", alto: 0.8,  solido: 0.25 },
    cofre:   { src: "textures/objetos/cofre.png",   alto: 0.4,  solido: 0.25 },
    planta:  { src: "textures/objetos/planta.png",  alto: 0.62, solido: 0.22 },
    atril:   { src: "gen:atril",    alto: 0.5,  solido: 0.15 },   // tótem con información de la sala
    banca:   { src: "gen:banca",    alto: 0.2,  solido: 0.3 },
    butaca:  { src: "gen:butaca",   alto: 0.3,  solido: 0.18 },
    lampara: { src: "gen:lampara",  alto: 0.95, solido: 0.15, brillo: true },
    caja:    { src: "gen:caja",     alto: 0.45, solido: 0.3 },
    cubierta:{ src: "gen:cubierta", alto: 0.75, solido: 0.25 }    // escultura tapada con una sábana
  },

  // PISOS. "salas": rectángulos [x1,y1,x2,y2] en casillas (inclusive); si dos se solapan manda la primera.
  // Sirven para el nombre en pantalla, la música y el mapa (tecla M o Tab). "grupo" es opcional (sala madre).
  // Opcional por sala: suelo, techo, luz (1 = normal), cielo (al aire libre), secreta (no sale en el mapa),
  //   niebla [r,g,b] (color con la distancia) y efecto: "parpadeo".
  // "principal": obra (su "img") que, al verla, desbloquea el siguiente piso aunque no llegues al umbral.
  pisos: [
    { nombre: "Sótano", musica: MUSICA.tienda,
      principal: "obra_33",   // «Cantándole a las plantas», Naufus Ramírez-Figueroa
      // la "%" del muro este del Auditorio es la puerta secreta; detrás está la bóveda (no sale en el mapa)
      mapa: [
        "####g#######d###E#######e#########&&&&&&&&&&&&&&&&&&&&&&&&&&&&",
        "#................................#&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&................&",
        "#.....L.............L.......L....i&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&...$$......$$...&",
        "#................................#&&&&&&&&&&&...$$......$$...&",
        "########+################+########&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&................&",
        "#...L........................L...#&&&&&.....&................&",
        "k................................#&&&&&.....&.......$$.......&",
        "#................................%..................$$.......&",
        "#................................#&&&&&.....&................&",
        "#................................#&&&&&.....&................&",
        "#...L........................L...#&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&................&",
        "#................................h&&&&&&&&&&&................&",
        "#................................#&&&&&&&&&&&...$$......$$...&",
        "#................................#&&&&&&&&&&&...$$......$$...&",
        "#................................#&&&&&&&&&&&................&",
        "#####f#####|~~~~~~~~~~|P####j#####&&&&&&&&&&&................&",
        "##################################&&&&&&&&&&&................&",
        "##################################&&&&&&&&&&&................&",
        "##################################&&&&&&&&&&&................&",
        "##################################&&&&&&&&&&&&&&&&&&&&&&&&&&&&"],
      salas: [
        { nombre: "Vestíbulo", r: [[1, 1, 32, 6]] },
        { nombre: "Auditorio / Sala de Cine", r: [[1, 8, 32, 20]], luz: 0.85 },
        { nombre: "Bóveda secreta", r: [[45, 1, 60, 24], [34, 12, 44, 12], [39, 10, 43, 14]], secreta: true,
          musica: MUSICA.boveda, suelo: "concreto", techo: "techo_boveda", luz: 0.8, niebla: [70, 8, 6], efecto: "parpadeo" }],
      objetos: [
        { x: 2.5, y: 1.5, sprite: "planta" }, { x: 31.5, y: 1.5, sprite: "planta" },
        { x: 10.5, y: 4.5, sprite: "banca" }, { x: 22.5, y: 4.5, sprite: "banca" },
        { x: 2.5, y: 5.5, sprite: "jarron" }, { x: 31.5, y: 5.5, sprite: "jarron" },
        // butacas del cine (mirando a la pantalla)
        ...[12, 14, 16].flatMap(y => [9, 10, 11, 12, 13, 14, 19, 20, 21, 22, 23, 24].map(x => ({ x: x + 0.5, y: y + 0.5, sprite: "butaca" }))),
        { x: 2.5, y: 19.5, sprite: "planta" }, { x: 31.5, y: 19.5, sprite: "planta" },
        // ---- sección secreta ----
        { x: 41.5, y: 12.5, tipo: "arma" },                 // la escopeta, en la antesala
        { x: 40.5, y: 10.5, tipo: "municion" }, { x: 42.5, y: 14.5, tipo: "armadura" },
        { x: 39.5, y: 14.5, sprite: "caja" }, { x: 43.5, y: 10.5, sprite: "caja" },
        { x: 57.5, y: 12.5, tipo: "jefe" },                 // el jefe espera al fondo de la bóveda
        { x: 46.5, y: 2.5, tipo: "botiquin" }, { x: 59.5, y: 22.5, tipo: "botiquin" },
        { x: 52.5, y: 2.5, tipo: "botiquin" }, { x: 52.5, y: 22.5, tipo: "botiquin" },
        { x: 59.5, y: 2.5, tipo: "armadura" }, { x: 46.5, y: 22.5, tipo: "armadura" },
        { x: 50.5, y: 9.5, tipo: "municion" }, { x: 50.5, y: 15.5, tipo: "municion" },
        { x: 59.5, y: 8.5, tipo: "municion" }, { x: 59.5, y: 16.5, tipo: "municion" },
        { x: 46.5, y: 8.5, tipo: "municion" }, { x: 46.5, y: 16.5, tipo: "botiquin" },
        { x: 47.5, y: 1.5, sprite: "lampara" }, { x: 59.5, y: 1.5, sprite: "lampara" },
        { x: 47.5, y: 24.5, sprite: "lampara" }, { x: 59.5, y: 24.5, sprite: "lampara" },
        { x: 54.5, y: 6.5, sprite: "cubierta" }, { x: 54.5, y: 18.5, sprite: "cubierta" },
        { x: 50.5, y: 5.5, sprite: "caja" }, { x: 50.5, y: 19.5, sprite: "caja" }, { x: 58.5, y: 10.5, sprite: "caja" }] },

    { nombre: "Nivel 1", musica: MUSICA.hall,
      principal: "obra_1",    // «De una vida a otra», Ana María Devis (la más cercana al elevador)
      mapa: [
        "###A#####1######E########B####m###",
        "#...........#........#...........#",
        "#...........#........#...........C",
        "#....................#...........#",
        "9...L...L...L........+...........#",
        "#....................#...........#",
        "#...........#........#...........l",
        "#...........#........#...........#",
        "2...L...L...#T###+#########+######",
        "#...........##......##...........#",
        "#...........##......#3...........#",
        "#...........##......##...........4",
        "######+#######......##...........#",
        "#...........##......##########.###",
        "#...........##......##...........#",
        "#...........##......##...........#",
        "8...........##......##...........#",
        "#....................+...........5",
        "#...........##......##...........#",
        "#...........##......##...........#",
        "#...........##......##...........#",
        "#####7###T######n#######T##6######"],
      salas: [
        { nombre: "Hall", r: [[13, 1, 20, 7]], musica: MUSICA.hall },
        { nombre: "Sala Marta Traba", r: [[1, 1, 11, 11]], musica: MUSICA.marta_traba },
        { nombre: "Sala Sonia y Carlos Haime", r: [[22, 1, 32, 7]], musica: MUSICA.haime },
        { nombre: "Sala de Fotografía", r: [[22, 9, 32, 12]], musica: MUSICA.experimental, luz: 0.72 },
        { nombre: "Salón Múltiple", r: [[22, 14, 32, 20]], musica: MUSICA.multiple },
        { nombre: "Patio de Esculturas I", r: [[1, 13, 11, 20]], musica: MUSICA.patios, cielo: true, luz: 1.1 },
        { nombre: "Patio de Esculturas II", r: [[14, 9, 19, 20]], musica: MUSICA.patios, cielo: true, luz: 1.1 }],
      objetos: [
        { x: 13.5, y: 1.5, sprite: "planta" }, { x: 20.5, y: 1.5, sprite: "planta" },
        { x: 16.5, y: 5.5, sprite: "banca" },
        { x: 6.5, y: 6.5, sprite: "estatua" },
        { x: 6.5, y: 3.5, sprite: "atril", interaccion: "marta_traba" },
        { x: 2.5, y: 10.5, sprite: "banca" }, { x: 10.5, y: 10.5, sprite: "banca" },
        { x: 25.5, y: 4.5, sprite: "atril", interaccion: "haime" },
        { x: 29.5, y: 4.5, sprite: "jarron" }, { x: 31.5, y: 7.5, sprite: "jarron" }, { x: 22.5, y: 1.5, sprite: "planta" },
        { x: 24.5, y: 10.5, sprite: "atril", interaccion: "fotografia" }, { x: 29.5, y: 10.5, sprite: "banca" },
        { x: 25.5, y: 17.5, sprite: "atril", interaccion: "multiple" },
        { x: 28.5, y: 15.5, sprite: "banca" }, { x: 28.5, y: 19.5, sprite: "banca" }, { x: 32.5, y: 20.5, sprite: "planta" },
        { x: 6.5, y: 14.5, sprite: "atril", interaccion: "patios" },
        { x: 3.5, y: 17.5, sprite: "estatua" }, { x: 9.5, y: 17.5, sprite: "estatua" }, { x: 6.5, y: 19.5, sprite: "estatua" },
        { x: 1.5, y: 20.5, sprite: "planta" }, { x: 11.5, y: 13.5, sprite: "planta" },
        { x: 16.5, y: 13.5, sprite: "estatua" }, { x: 17.5, y: 18.5, sprite: "estatua" },
        { x: 14.5, y: 20.5, sprite: "planta" }, { x: 19.5, y: 9.5, sprite: "planta" }] },

    { nombre: "Nivel 2", musica: MUSICA.obregon,
      principal: "obra_13",   // «El revés de la armadura», Silvia Rivas
      // la Sala Triángulo es el triángulo del sureste (muro diagonal escalonado)
      mapa: [
        "###F####o#####D##E####O#####q#####",
        "#................................#",
        "#................................#",
        "#.....L....L...........L.....L...N",
        "p................................#",
        "#................................#",
        "#................................#",
        "#.................#########+######",
        "#..................#####M##.######",
        "#...................##...........#",
        "#....L....L..........##..........#",
        "#.....................##.........#",
        "#......................##........Q",
        "G..............L........#K.......#",
        "#........................##......#",
        "#.........................##.....#",
        "#....L....L................##....J",
        "#..................L........##...#",
        "#............................##..#",
        "#.............................##.#",
        "#..............................###",
        "###H####T####I##########T#########"],
      salas: [
        { nombre: "Sala Triángulo", grupo: "Sala Alejandro Obregón", r: [[22, 9, 32, 11], [25, 12, 32, 14], [28, 15, 32, 17], [30, 18, 32, 19], [27, 8, 27, 8]], musica: MUSICA.obregon },
        { nombre: "Patio Cubierto", grupo: "Sala Alejandro Obregón", r: [[1, 1, 32, 20]], musica: MUSICA.escalera, techo: "claraboya", luz: 1.08 }],
      objetos: [
        { x: 15.5, y: 1.5, sprite: "planta" }, { x: 19.5, y: 1.5, sprite: "planta" },
        { x: 8.5, y: 5.5, sprite: "atril", interaccion: "obregon" },
        { x: 17.5, y: 9.5, sprite: "atril", interaccion: "patio_cubierto" },
        { x: 7.5, y: 13.5, sprite: "estatua" }, { x: 12.5, y: 18.5, sprite: "jarron" }, { x: 3.5, y: 18.5, sprite: "planta" },
        { x: 7.5, y: 10.5, sprite: "banca" }, { x: 7.5, y: 16.5, sprite: "banca" }, { x: 26.5, y: 4.5, sprite: "banca" },
        { x: 29.5, y: 12.5, sprite: "atril", interaccion: "triangulo" },
        { x: 31.5, y: 9.5, sprite: "jarron" }, { x: 23.5, y: 9.5, sprite: "planta" }] },

    { nombre: "Nivel 3", musica: MUSICA.rojas,
      principal: "obra_47",   // «Annemiek (I Wanna Be With You)», Rineke Dijkstra (junto al elevador)
      mapa: [
        "##X##T##s##R####E#r###b###T##t####",
        "#................................#",
        "#................................#",
        "#............L......L............a",
        "#................................#",
        "#................................#",
        "########+################+########",
        "#................................#",
        "#....L......................L....#",
        "#................................#",
        "U........#S#..........#Z#........u",
        "#................................#",
        "#................................#",
        "#....L......................L....#",
        "#................................#",
        "############..L....L..############",
        "#................................#",
        "#................................#",
        "Y................................c",
        "#................................#",
        "#................................#",
        "#VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV#"],
      salas: [{ nombre: "Galería Tercer Piso", r: [[1, 1, 32, 5]], musica: MUSICA.pasillo },
        { nombre: "Sala Carlos Rojas", r: [[1, 7, 32, 14]], musica: MUSICA.rojas },
        { nombre: "Mirador", r: [[1, 15, 32, 20]], musica: MUSICA.mirador, luz: 1.1 }],
      objetos: [
        { x: 15.5, y: 1.5, sprite: "planta" }, { x: 17.5, y: 1.5, sprite: "planta" },
        { x: 9.5, y: 3.5, sprite: "banca" }, { x: 24.5, y: 3.5, sprite: "banca" },
        { x: 16.5, y: 10.5, sprite: "atril", interaccion: "carlos_rojas" },
        { x: 12.5, y: 12.5, sprite: "jarron" }, { x: 20.5, y: 8.5, sprite: "jarron" },
        { x: 1.5, y: 7.5, sprite: "planta" }, { x: 32.5, y: 14.5, sprite: "planta" },
        { x: 8.5, y: 18.5, sprite: "banca" }, { x: 16.5, y: 18.5, sprite: "banca" }, { x: 24.5, y: 18.5, sprite: "banca" },
        { x: 1.5, y: 16.5, sprite: "planta" }, { x: 32.5, y: 16.5, sprite: "planta" }] }
  ],

  // JEFE de la bóveda. La imagen es una hoja de 4 × 2 cuadros con rótulos encima de cada cara;
  // "cuadros" recorta cada estado sin el rótulo y el fondo gris se vuelve transparente al cargar.
  jefe: {
    nombre: "ROGELIO SALMONA", imagen: "textures/jefe.jpeg",
    cuadros: {               // [x, y, ancho, alto] en píxeles de jefe.jpeg
      quieto:      [44, 62, 256, 298],     // IDLE (FRONT)
      mira_izq:    [388, 62, 256, 298],    // IDLE (LOOK LEFT)
      mira_der:    [732, 62, 256, 298],    // IDLE (LOOK RIGHT)
      dolor_leve:  [1076, 62, 256, 298],   // DAMAGE (LIGHT)
      dolor_grave: [44, 438, 256, 298],    // DAMAGE (HEAVY)
      sonrisa:     [388, 438, 256, 298],   // GRIN / ACTIVE
      camina_a:    [732, 438, 256, 298],   // WALKING (FRONT)
      camina_b:    [1076, 438, 256, 298]   // WALKING (BOB)
    },
    alto: 1.45,              // tamaño en casillas (es una cabeza gigante que flota; los muros miden 2)
    vida: 1200
  },

  // TEXTOS (reemplaza los de ejemplo). "imagen" opcional = se muestra grande (zoom).
  interacciones: {
    placa_bienvenida: { titulo: "Bienvenido", texto: "Acércate a las obras y pulsa E (o Espacio) para verlas.\nLas puertas se abren igual. Pulsa M o Tab para el mapa.\n\n" +
      "Cada obra que examinas suma en el contador del museo y en el del piso. Para que el elevador te lleve al " +
      `siguiente piso tienes que ver al menos el ${Math.round(CONFIG.umbralPiso * 100)} % de las obras del piso, o su obra principal.` },
    auditorio: { titulo: "Auditorio / Sala de Cine", texto: "Espacio para proyecciones y charlas. (texto de ejemplo)" },
    calle26: { titulo: "Vista a la Calle 26", texto: "Los ventanales dan hacia la Calle 26 y la ciudad." },
    marta_traba: { titulo: "Sala Marta Traba", texto: "Sala principal del Nivel 1, en honor a la crítica de arte argentino-colombiana que fundó el museo en 1955." },
    haime: { titulo: "Sala Sonia y Carlos Haime", texto: "Espacio de exhibición más recogido, nombrado en honor a dos importantes benefactores." },
    fotografia: { titulo: "Sala de Fotografía", texto: "Dedicada a exposiciones fotográficas y piezas sensibles a la luz." },
    multiple: { titulo: "Salón Múltiple", texto: "Utilizado para conferencias y eventos." },
    patios: { titulo: "Patios de Esculturas", texto: "Dos espacios al aire libre para obra escultórica." },
    obregon: { titulo: "Sala Alejandro Obregón", texto: "En honor al icónico pintor colombo-español. Se compone del Patio Cubierto y la Sala Triángulo." },
    patio_cubierto: { titulo: "Patio Cubierto", texto: "Espacio de Salmona donde la luz natural entra desde arriba." },
    triangulo: { titulo: "Sala Triángulo", texto: "Sección de geometría particular que rompe con la ortogonalidad." },
    carlos_rojas: { titulo: "Sala Carlos Rojas", texto: "En honor a un pionero del arte abstracto y geométrico en Colombia, con ventanales hacia la Calle 26." }
  }
};

// Las OBRAS (js/obras.js) se convierten en paredes interactivas con zoom.
// La pared con el cuadro es textures/paredes/<img>.png (cuadro sobre yeso);
// las versiones sobre ladrillo siguen en textures/paredes/obras_ladrillo/.
OBRAS.forEach(o => {
  NIVEL.leyenda[o.car] = { textura: o.img, superior: 'yeso', interaccion: o.img, pista: 'Ver obra', obra: true };   // obra: cuenta en los contadores
  NIVEL.texturas[o.img] = `textures/paredes/${o.img}.png`;
  NIVEL.interacciones[o.img] = { titulo: o.titulo, subtitulo: o.artista + (o.serie ? ' · ' + o.serie : ''),
                                 texto: o.texto, imagen: `textures/obras/${o.img}.jpg` };
});
