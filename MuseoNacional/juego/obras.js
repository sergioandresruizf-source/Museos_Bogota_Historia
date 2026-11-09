/* =====================================================================
   obras.js  —  ESTE ES EL ÚNICO ARCHIVO QUE TIENES QUE EDITAR
   ---------------------------------------------------------------------
   Aquí defines: el título del juego, el nombre de cada isla (sala del
   museo) y las obras de cada una (presentes y removidas).

   CÓMO AGREGAR IMÁGENES
   1) Crea una carpeta llamada  obras  junto a index.html
   2) Mete ahí tus imágenes (.jpg .png .webp)
   3) En cada obra escribe la ruta:  imagen: "obras/mi_cuadro.jpg"

   - Obra PRESENTE  → removida: false  (lleva imagen)
   - Obra REMOVIDA  → removida: true   (NO lleva imagen: se muestra un
                       recuadro negro con su título y su descripción)

   Puedes poner las obras que quieras por isla (recomendado 2 a 8).
   Si una imagen no existe o la ruta está mal, el juego no se rompe:
   muestra un aviso con la ruta que falta.

   ── AÑADIR IMÁGENES SIN EDITAR ESTE ARCHIVO (auto-descubrimiento) ──
   Copia a la carpeta obras/ archivos con estos nombres y aparecen solos:
     obras/isla3_obra1.jpg, isla3_obra2.png ...       → cuadros de la isla 3
     obras/isla3_escultura1.png, isla3_escultura2.png → esculturas/objetos de la isla 3
   (se aceptan jpg, jpeg, png y webp; las esculturas: png o webp con fondo transparente).
   Numera sin saltos (1, 2, 3...): el juego se detiene en el primer número que falta.
   Salen con título "Obra 1", "Escultura 1"... Para ponerles título y descripción
   agrégalas aquí abajo con esa misma ruta de imagen.

   ── OBRAS REMOVIDAS QUE REGRESAN ──
   Una obra removida (removida: true) no muestra imagen. Al final del juego, cuando el jugador
   resuelve el puzzle de la isla, esas obras REGRESAN a la sala y quedan como obras presentes
   ("OBRA RESTITUIDA"). Si quieres que se vea su imagen al regresar, agrega  imagen: "obras/..."
   en la obra removida: se mantiene oculta hasta que la restituyan.

   ── FORMATO DEL CUADRO ──
   formato: "auto" (por defecto: se adapta a la imagen), "horizontal", "vertical" o "cuadrado"

   ── ESCULTURAS / OBJETOS (PNG sin fondo) ──
   { tipo: "escultura", titulo: "...", descripcion: "...", imagen: "obras/estatua.png",
     alto: 48, pixelado: false, removida: false }
   · Se paran sobre un pedestal en el piso de la sala (no en la pared).
   · alto = altura en píxeles del juego (la sala mide 64 de alto en pared; 40 a 60 funciona bien).
   · pixelado: true si tu PNG es pixel art (evita que se suavice).
   · Con removida: true se ve un pedestal vacío con su silueta punteada.
   · Ejemplo de PNG transparente incluido: obras/ejemplo_escultura.png
   ===================================================================== */

window.MUSEO = {

  titulo: "ISLAS DE LA CONTRARREVOLUCIÓN",
  subtitulo: "Recorre el Museo Nacional y recupera lo que fue removido",

  config: {
    // true  = una isla cuenta como "explorada" cuando viste TODAS sus obras
    // false = cuenta apenas entras a la sala
    exigirVerTodas: true,
    // true = en la Isla Calavera debes ver todas las obras antes de usar el cofre
    exigirVerTodasEnCalavera: true,
    velocidadBarco: 110,
    // true = busca solo las imágenes obras/islaN_obraK.* e islaN_esculturaK.* (ver arriba)
    // Puzzles de la cinemática final: aparece el botón OMITIR tras estos segundos (false = nunca)
    puzzlesOmitibles: true,
    puzzleOmitirSeg: 45,
    autoDescubrir: true,
    descripcionAuto: "Descripción pendiente: agrega esta obra en obras.js para ponerle título y texto.",
    // true = activa atajos de prueba: Shift+E (explorar todo), Shift+C (cinemática)
    atajos: false
  },

  // ---------------------------------------------------------------
  // MÚSICA — pon tus archivos (mp3, ogg o wav) en la carpeta  musica/
  //   Cada ruta puede cambiarse. Si un archivo no existe, simplemente no suena.
  //   · navegacion : suena mientras navegas el barco por el mar
  //   · titulo     : pantalla de inicio (si la dejas vacía usa "navegacion")
  //   · calavera   : llegada y sala de la Isla Calavera
  //   · cinematica : embarque y viaje final con los puzzles
  //   · La música de CADA ISLA va dentro de la isla (campo  musica  en islas[ ... ], más abajo)
  //   Los cambios de pista se hacen con fundido. Volumen: 0 a 1. La tecla M silencia todo.
  // ---------------------------------------------------------------
  musica: {
    volumen: 0.5,
    navegacion: "musica/navegacion.mp3",
    titulo: "",
    calavera: "musica/calavera.mp3",
    cinematica: "musica/cinematica.mp3"
  },

  textos: {
    nieblaBloqueada: "Una espesa niebla bloquea el paso a la Isla Calavera…",
    nieblaSeDisipa: "¡La niebla se disipa! La Isla Calavera ya es accesible.",
    cineInicio: "Las obras removidas vuelven a casa…",
    finalTitulo: "¡La contrarrevolución está completa!",
    finalTexto: "Cada obra removida regresó a su sala y la bandera de la revolución ondea en todas las islas. El museo es de quienes lo habitan."
  },

  // ---------------------------------------------------------------
  // ISLA CALAVERA (la del centro, bloqueada por niebla).
  // Aquí aparecen automáticamente TODAS las obras con removida:true
  // ---------------------------------------------------------------
  calavera: {
    nombre: "Isla Calavera",
    descripcion: "Aquí se guardan todas las obras que fueron removidas."
  },

  // ---------------------------------------------------------------
  // LAS 10 ISLAS (en este orden). Posición en el mapa:
  //  1 = pequeña, abajo-centro (la más cercana al inicio)
  //  2 = pequeña y alargada, a la derecha del centro
  //  3 = abajo a la derecha (sureste)
  //  4 = la de más abajo (sur)
  //  5 = abajo a la izquierda (suroeste)
  //  6 = izquierda (oeste)
  //  7 = arriba a la izquierda (noroeste)
  //  8 = la de más arriba (norte)
  //  9 = arriba a la derecha (noreste)
  // 10 = derecha (este)
  // ---------------------------------------------------------------
  islas: [
    {
      nombre: "Sala 1 · La historia del museo",
      musica: "musica/isla1.mp3",
      obras: [
        { tipo: "escultura", titulo: "Aerolito de Santa ROsa de Viterbo", descripcion: "Exhibición temporal", imagen: "obras/estatuaIsla1.jpg",
     alto: 48, pixelado: false, removida: false },
        { titulo: "Obra 1 (presente)", descripcion: "Escribe aquí la descripción de esta obra: autor, año, técnica y por qué importa.", imagen: "obras/isla1_obra1.jpg", removida: false },
        { titulo: "Obra 2 (presente)", descripcion: "Descripción de la segunda obra que sí se exhibe actualmente.", imagen: "obras/isla1_obra2.jpg", removida: false },
        { titulo: "Obra 3 (removida)", descripcion: "Esta obra fue removida. Explica cuándo y por qué razón social, política o cultural dejó de exhibirse.", removida: true }
      ]
    },
    {
      nombre: "Sala 2 · Tierra de historias",
      musica: "musica/isla2.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla2_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 3 · Memoria en movimiento",
      musica: "musica/isla3.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla3_obra1.jpg", removida: false },
        { titulo: "Obra 2 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla3_obra2.jpg", removida: false },
        { titulo: "Obra 3 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 4 · Memoria y nación",
      musica: "musica/isla4.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla4_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 5 · Ser territorio",
      musica: "musica/isla5.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla5_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 6 · Hacer sociedad",
      musica: "musica/isla6.mp3",
      obras: [
        { titulo: "Marcha de la ciudadanía plena LGBT: Por una Colombia incluyente", descripcion: "Descripción de la obra.", imagen: "obras/isla6_obra1.png", removida: true },
        { tipo: "escultura", titulo: "Espada de Bolívar", descripcion: "Exhibición temporal", imagen: "obras/estatuaIsla6.png",
     alto: 48, pixelado: false, removida: true },
        { titulo: "La séptima papeleta", descripcion: "Descripción de la obra.", imagen: "obras/isla6_obra2.png", removida: true },
        { titulo: "Afiche de homenaje a Carlos Pizarro", descripcion: "Descripción de la obra.", imagen: "obras/isla6_obra3.png", removida: true },
        { titulo: "Ideales feministas", descripcion: "Descripción de la obra.", imagen: "obras/isla6_obra4.png", removida: true },
        { titulo: " Bandera del orgullo gay de Elizabeth Castillo", descripcion: "Descripción de la obra.", imagen: "obras/isla6_obra5.png", removida: true },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 7 · Conexiones",
      musica: "musica/isla7.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla7_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 8 · Tierra como recurso",
      musica: "musica/isla8.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla8_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 9 · Ser y hacer",
      musica: "musica/isla9.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla9_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    },
    {
      nombre: "Sala 10 · Fuerza,Fe y Sustancia",
      musica: "musica/isla10.mp3",
      obras: [
        { titulo: "Obra 1 (presente)", descripcion: "Descripción de la obra.", imagen: "obras/isla10_obra1.jpg", removida: false },
        { titulo: "Obra 2 (removida)", descripcion: "Descripción de la obra removida.", removida: true }
      ]
    }
  ]
};
