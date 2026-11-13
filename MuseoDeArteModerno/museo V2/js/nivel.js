// ===== NIVEL: aquí editas pisos, mapas, salas, texturas y textos =====
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
  tienda:       ["audio/solar_sailer.mp3", "audio/das_spiegel.mp3"]  // 12 · Tienda / Salida (Sótano): Daft Punk – Solar Sailer / The Chemical Brothers – Das Spiegel
};

const NIVEL = {
  nombre: 'Museo de Arte Moderno de Bogotá',
  inicio: { piso: 1 },
  suelo: "textures/suelos/parquet.png",   // por defecto; cada piso puede definir su propio suelo/techo/musica
  techo: "textures/suelos/techo.png",
  sonidoElevador: "audio/elevador.mp3",   // índice del piso inicial (0 = Sótano). Se aparece frente al elevador.

  // LEYENDA de paredes (compartida por todos los pisos). "." o espacio = suelo.
  // Con "interaccion" la pared se examina como un objeto. "E" = elevador (en cada piso).
  leyenda: {
    "#": { textura: "piedra" },
    "L": { textura: "ladrillo" },
    "W": { textura: "madera" },
    "E": { textura: "elevador", interaccion: "elevador", pista: "Usar elevador" },
    "T": { textura: "placa", interaccion: "placa_bienvenida", pista: "Leer placa" },
    "P": { textura: "placa", interaccion: "auditorio", pista: "Leer cartel" },
    "V": { textura: "ventana", interaccion: "calle26", pista: "Mirar por la ventana", estirar: true }
  },

  texturas: {
    piedra: "textures/paredes/piedra.png", ladrillo: "textures/paredes/ladrillo.png",
    madera: "textures/paredes/madera.png", yeso: "textures/paredes/yeso.png",
    placa: "textures/paredes/placa.png", elevador: "textures/paredes/elevador.png",
    ventana: "textures/paredes/ventana.png"
  },
  sprites: {
    jarron: "textures/objetos/jarron.png", estatua: "textures/objetos/estatua.png",
    cofre: "textures/objetos/cofre.png", planta: "textures/objetos/planta.png"
  },

  // PISOS. "salas": rectángulos [x1,y1,x2,y2] en casillas (inclusive). Sirven para el nombre
  // en pantalla y para el mapa (tecla M). "grupo" es opcional (nombre de la sala madre).
  pisos: [
    { nombre: "Sótano", suelo: "textures/suelos/concreto.png", musica: MUSICA.tienda,
      mapa: [
        "#g#######E###d######",
        "#..................#",
        "#..................#",
        "#..................#",
        "#######e..##########",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................h",
        "######f##P##########"],
      salas: [
        { nombre: "Vestíbulo", r: [[1, 1, 18, 3]] },
        { nombre: "Auditorio / Sala de Cine", r: [[1, 5, 18, 10]] }],
      objetos: [
        { x: 2.5, y: 2.5, sprite: "planta" }, { x: 16.5, y: 2.5, sprite: "planta" }] },

    { nombre: "Nivel 1", musica: MUSICA.hall,
      mapa: [
        "#A#####1#E###B######",
        "#.......L..L.......#",
        "#..................#",
        "#.......L..L.......C",
        "9.......L..L##..####",
        "#.......2..........#",
        "#.......L..L.......#",
        "###..###L..L3#..4###",
        "8.......L..L.......#",
        "#..................#",
        "#.......L..L.......5",
        "####T#7#######6#T###"],
      salas: [
        { nombre: "Sala Marta Traba", r: [[1, 1, 7, 6]], musica: MUSICA.marta_traba },
        { nombre: "Sala Sonia y Carlos Haime", r: [[12, 1, 18, 3]], musica: MUSICA.haime },
        { nombre: "Sala de Fotografía", r: [[12, 5, 18, 6]], musica: MUSICA.experimental },
        { nombre: "Salón Múltiple", r: [[12, 8, 18, 10]], musica: MUSICA.multiple },
        { nombre: "Patio de Esculturas I", r: [[1, 8, 7, 10]], musica: MUSICA.patios },
        { nombre: "Patio de Esculturas II", r: [[9, 5, 10, 10]], musica: MUSICA.patios },
        { nombre: "Hall", r: [[9, 1, 10, 4]], musica: MUSICA.hall }],
      objetos: [
        { x: 4.5, y: 3.5, sprite: "estatua", interaccion: "marta_traba", pista: "Examinar" },
        { x: 15.5, y: 2.5, sprite: "jarron", interaccion: "haime" },
        { x: 15.5, y: 5.5, sprite: "cofre", interaccion: "fotografia" },
        { x: 15.5, y: 9.5, sprite: "planta", interaccion: "multiple" },
        { x: 3.5, y: 9.5, sprite: "planta", interaccion: "patios" },
        { x: 9.5, y: 8.5, sprite: "planta" }] },

    { nombre: "Nivel 2", musica: MUSICA.obregon,
      mapa: [
        "#F#####D#E###O######",
        "#..................#",
        "#..................#",
        "#..................N",
        "#..........LLLLML..#",
        "#..........LLLL....#",
        "#..........KL......#",
        "G..................#",
        "#..........L.......#",
        "#..........L.......#",
        "#..........L.......Q",
        "#H###TI#####TJ######"],
      salas: [
        { nombre: "Patio Cubierto", grupo: "Sala Alejandro Obregón", r: [[1, 1, 18, 3], [1, 4, 10, 10]], musica: MUSICA.escalera },
        { nombre: "Sala Triángulo", grupo: "Sala Alejandro Obregón", r: [[11, 4, 18, 10]], musica: MUSICA.obregon }],
      objetos: [
        { x: 5.5, y: 6.5, sprite: "estatua", interaccion: "obregon" },
        { x: 5.5, y: 2.5, sprite: "jarron", interaccion: "patio_cubierto" },
        { x: 15.5, y: 9.5, sprite: "cofre", interaccion: "triangulo" }] },

    { nombre: "Nivel 3", musica: MUSICA.rojas,
      mapa: [
        "#X#T###R#E###b#T####",
        "#..................#",
        "#..................#",
        "#..................a",
        "U..................#",
        "#...S..........Z...#",
        "#..................#",
        "#..................#",
        "#...L..........L...#",
        "#..................#",
        "Y..................c",
        "#VVVVVVVVVVVVVVVVVV#"],
      salas: [{ nombre: "Galería Tercer Piso", r: [[1, 1, 18, 3]], musica: MUSICA.pasillo },
        { nombre: "Sala Carlos Rojas", r: [[1, 4, 18, 8]], musica: MUSICA.rojas },
        { nombre: "Mirador", r: [[1, 9, 18, 10]], musica: MUSICA.mirador }],
      objetos: [
        { x: 7.5, y: 6.5, sprite: "estatua", interaccion: "carlos_rojas" },
        { x: 12.5, y: 6.5, sprite: "jarron" }] }
  ],

  // TEXTOS (reemplaza los de ejemplo). "imagen" opcional = se muestra grande (zoom).
  interacciones: {
    placa_bienvenida: { titulo: "Bienvenido", texto: "Acércate a los objetos y paredes y pulsa E.\nPulsa M para abrir el mapa." },
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

// Las OBRAS (js/obras.js) se convierten en paredes interactivas con zoom
OBRAS.forEach(o => {
  NIVEL.leyenda[o.car] = { textura: o.img, superior: 'yeso', interaccion: o.img, pista: 'Ver obra' };
  NIVEL.texturas[o.img] = `textures/paredes/${o.img}.png`;
  NIVEL.interacciones[o.img] = { titulo: o.titulo, subtitulo: o.artista + (o.serie ? ' · ' + o.serie : ''),
                                 texto: o.texto, imagen: `textures/obras/${o.img}.jpg` };
});
