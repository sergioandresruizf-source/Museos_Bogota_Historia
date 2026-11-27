// Las 50 obras del recorrido "El cronista de 1810".
// Fuente principal: ficha técnica del Museo de la Independencia Casa del Florero
// (datos publicados por el museo en Google Arts & Culture). El id coincide con la
// numeración 1..50 de la ficha. "Sin datos" = la ficha no publica ese dato.
// Hotspots de "curador": x, y relativos al ancho y alto de la imagen; r relativo
// al lado MENOR de la imagen.

export const works = [
  // ───────────────────────── SALA 1 · PATIO COLONIAL ─────────────────────────
  {
    id: 1,
    slug: "plaza-mayor-de-bogota",
    title: "Plaza Mayor de Bogotá",
    author: "Francisco Castillo",
    date: "Ca. 1840",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 61",
    sala: 1,
    image: "./assets/artworks/plaza-mayor-de-bogota.jpg",
    description: "Francisco Castillo pintó la Plaza Mayor de Bogotá, hoy plaza de Bolívar, hacia 1840, cuando se llamaba plaza de la Constitución. Es día de mercado y se ven la Catedral Primada, la Capilla del Sagrario, el Colegio de San Bartolomé y la fuente del Mono de la Pila. El comercio seguía por la calle Real, donde estaba la tienda de José González Llorente.",
    funFact: "La Casa del Florero, sede del museo, está en la esquina nororiental de esta misma plaza.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.30, y: 0.62, r: 0.10, label: "Catedral Primada" },
      { x: 0.733, y: 0.785, r: 0.05, label: "Fuente del Mono de la Pila" },
      { x: 0.606, y: 0.873, r: 0.06, label: "Jinete en caballo blanco" },
      { x: 0.413, y: 0.89, r: 0.06, label: "Mula de carga" }
    ] } },
    questions: [
      { q: "¿Cómo se llamaba la Plaza Mayor hacia 1840?", options: ["Plaza de la Constitución", "Plaza de San Victorino", "Plaza de las Yerbas", "Plaza de Santander"], answer: 0, explain: "Hacia 1840 se llamaba plaza de la Constitución; hoy es la plaza de Bolívar." },
      { q: "¿Qué fuente aparece en la plaza?", options: ["La fuente de Neptuno", "La fuente del Mono de la Pila", "El Chorro de Quevedo", "La fuente de los Leones"], answer: 1, explain: "La fuente del Mono de la Pila estaba en la Plaza Mayor." },
      { q: "¿Qué comerciante tenía su tienda en la calle Real, junto a la plaza?", options: ["Antonio Nariño", "Antonio Villavicencio", "José González Llorente", "José Celestino Mutis"], answer: 2, explain: "La tienda de José González Llorente estaba en la calle Real." }
    ]
  },
  {
    id: 2,
    slug: "calle-de-la-moneda",
    title: "Calle de la Moneda",
    author: "Autor desconocido",
    date: "1850",
    type: "Sin datos",
    technique: "Óleo",
    registro: "Reg. 21",
    sala: 1,
    image: "./assets/artworks/calle-de-la-moneda.jpg",
    description: "Óleo de autor desconocido, fechado en 1850, que muestra la calle de la Moneda en Santafé de Bogotá, con casas de balcones, iglesias y gente que camina por la calle empedrada. La calle debe su nombre a la histórica Casa de Moneda de Santafé, que funcionaba en ella.",
    funFact: "El edificio de la antigua Casa de Moneda, en La Candelaria, es hoy el Museo Casa de Moneda del Banco de la República.",
    game: { type: "restaurador", data: { grid: 3 } },
    questions: [
      { q: "¿A qué debe su nombre la calle de la Moneda?", options: ["A un comerciante llamado Moneda", "A un mercado de monedas antiguas", "A una iglesia dedicada a la moneda", "A la Casa de Moneda de Santafé, que funcionaba en ella"], answer: 3, explain: "La calle tomó el nombre de la Casa de Moneda de Santafé." },
      { q: "¿Qué funciona hoy en el edificio de la antigua Casa de Moneda?", options: ["El Museo Casa de Moneda del Banco de la República", "La Alcaldía de Bogotá", "El Teatro Colón", "La Catedral Primada"], answer: 0, explain: "Hoy es el Museo Casa de Moneda del Banco de la República." }
    ]
  },
  {
    id: 3,
    slug: "capilla-del-humilladero",
    title: "Capilla del Humilladero",
    author: "Autor desconocido",
    date: "1850",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 94",
    sala: 1,
    image: "./assets/artworks/capilla-del-humilladero.jpg",
    description: "Imagen de 1850 de la capilla del Humilladero, considerada la primera iglesia de Bogotá. Estaba en la antigua plaza de las Yerbas, hoy parque Santander, y fue demolida en 1877. La ficha del museo no publica la técnica ni las medidas de la obra.",
    funFact: "Después de la demolición, la plaza se convirtió en parque y en 1878 se inauguró allí el monumento a Francisco de Paula Santander.",
    game: { type: "codigo", data: { message: "LA PRIMERA IGLESIA", hint: "Así se considera a esta capilla en la historia de Bogotá." } },
    questions: [
      { q: "¿Dónde estaba la capilla del Humilladero?", options: ["En la cima de Monserrate", "En la plaza de las Yerbas, hoy parque Santander", "En la Plaza Mayor, junto a la Catedral", "En el pueblo de Guatavita"], answer: 1, explain: "Estaba en la plaza de las Yerbas, que hoy es el parque Santander." },
      { q: "¿En qué año fue demolida la capilla?", options: ["1810", "1877", "1948", "1960"], answer: 1, explain: "La capilla del Humilladero fue demolida en 1877." }
    ]
  },
  {
    id: 4,
    slug: "el-humilladero-la-veracruz-y-san-francisco",
    title: "El Humilladero, La Veracruz y San Francisco",
    author: "Alfredo Gustin",
    date: "1876",
    type: "Sin datos",
    technique: "Óleo",
    registro: "Reg. 93",
    sala: 1,
    image: "./assets/artworks/el-humilladero-la-veracruz-y-san-francisco.jpg",
    description: "Óleo de Alfredo Gustin, de 1876, que muestra tres iglesias coloniales de la antigua calle Real de Bogotá: el Humilladero, La Veracruz y San Francisco. Es una vista de la calle poco antes de que el Humilladero fuera demolido, en 1877.",
    funFact: "Las iglesias de San Francisco y La Veracruz todavía se pueden visitar en la carrera Séptima con avenida Jiménez.",
    game: { type: "restaurador", data: { grid: 4 } },
    questions: [
      { q: "¿Cuántas iglesias coloniales muestra la pintura de Alfredo Gustin?", options: ["Una", "Dos", "Cinco", "Tres"], answer: 3, explain: "Muestra el Humilladero, La Veracruz y San Francisco." },
      { q: "¿Cuál de estas iglesias de la pintura ya no existe?", options: ["El Humilladero", "San Francisco", "La Veracruz", "Todas siguen en pie"], answer: 0, explain: "El Humilladero fue demolido en 1877." },
      { q: "¿Quién pintó esta obra?", options: ["Ramón Torres Méndez", "Alfredo Gustin", "Francisco Castillo", "José María Espinosa"], answer: 1, explain: "Es un óleo de Alfredo Gustin, de 1876." }
    ]
  },
  {
    id: 5,
    slug: "boqueron-del-rio-san-francisco",
    title: "Boquerón del río San Francisco",
    author: "Ramón Torres Méndez",
    date: "Ca. 1837",
    type: "Pintura",
    technique: "Óleo sobre lienzo",
    registro: "Sin datos",
    sala: 1,
    image: "./assets/artworks/boqueron-del-rio-san-francisco.jpg",
    description: "Ramón Torres Méndez pintó hacia 1837 el boquerón por donde el río San Francisco sale entre los cerros de Monserrate y Guadalupe. Al fondo se alcanza a ver la fachada de la Quinta de Bolívar. La obra une el paisaje con la mirada costumbrista de su autor.",
    funFact: "Hoy el río San Francisco corre canalizado bajo la avenida Jiménez, en el centro de Bogotá.",
    game: { type: "carrera", data: {
      runner: "un arriero de Santafé",
      collect: "flores silvestres",
      facts: [
        "El río San Francisco sale entre los cerros de Monserrate y Guadalupe.",
        "Al fondo de la pintura se ve la fachada de la Quinta de Bolívar.",
        "Hoy el río corre canalizado bajo la avenida Jiménez."
      ]
    } },
    questions: [
      { q: "¿Entre qué cerros sale el río San Francisco?", options: ["Suba y La Conejera", "Monserrate y el Tolima", "Monserrate y Guadalupe", "Guadalupe y el Nevado del Ruiz"], answer: 2, explain: "El boquerón está entre los cerros de Monserrate y Guadalupe." },
      { q: "¿Qué edificio se ve al fondo de la pintura?", options: ["La Casa de Moneda", "El Palacio de San Carlos", "La Catedral Primada", "La Quinta de Bolívar"], answer: 3, explain: "Al fondo aparece la fachada de la Quinta de Bolívar." },
      { q: "¿Por dónde corre hoy el río San Francisco?", options: ["Canalizado bajo la avenida Jiménez", "Por la avenida Boyacá", "Por el parque Simón Bolívar", "Ya no existe ningún rastro del río"], answer: 0, explain: "Su cauce está canalizado bajo la avenida Jiménez." }
    ]
  },
  {
    id: 6,
    slug: "plaza-del-desaparecido-pueblo-de-guatavita",
    title: "La plaza del desaparecido pueblo de Guatavita",
    author: "Pablo Emilio Achury",
    date: "1900",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 84",
    sala: 1,
    image: "./assets/artworks/plaza-del-desaparecido-pueblo-de-guatavita.jpg",
    description: "Pablo Emilio Achury representó la plaza del antiguo pueblo de Guatavita, en Cundinamarca, con su iglesia, sus casas de teja y una fuente en el centro. Ese pueblo desapareció: fue trasladado por la construcción del embalse de Tominé, que abastece de agua a Bogotá y a poblaciones cercanas.",
    funFact: "Achury también pintó la Casa Museo del 20 de Julio, otra obra de este recorrido que está en el Archivo.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.598, y: 0.805, r: 0.08, label: "Fuente de la plaza" },
      { x: 0.487, y: 0.283, r: 0.04, label: "Campana de la torre" },
      { x: 0.239, y: 0.078, r: 0.04, label: "Cruz en la cima del cerro" },
      { x: 0.333, y: 0.553, r: 0.07, label: "Balcones verdes" }
    ] } },
    questions: [
      { q: "¿Por qué desapareció el antiguo pueblo de Guatavita?", options: ["Por un terremoto", "Fue trasladado por la construcción del embalse de Tominé", "Fue destruido en una batalla", "Lo abandonaron por una epidemia"], answer: 1, explain: "El pueblo se trasladó por la construcción del embalse de Tominé." },
      { q: "¿Qué hay en el centro de la plaza pintada por Achury?", options: ["Una estatua de Bolívar", "Un kiosco de música", "Una fuente", "Un mercado"], answer: 2, explain: "En el centro de la plaza hay una fuente." }
    ]
  },
  {
    id: 7,
    slug: "baile-de-campesinos",
    title: "Baile de campesinos",
    author: "Ramón Torres Méndez; impreso por A. De la Rue",
    date: "1878",
    type: "Litografía coloreada",
    technique: "Litografía coloreada con acuarela",
    registro: "Reg. 116",
    sala: 1,
    image: "./assets/artworks/baile-de-campesinos.jpg",
    description: "Litografía coloreada de Ramón Torres Méndez, impresa en 1878 por la casa A. De la Rue. Muestra una fiesta campesina con músicos, parejas que bailan y curiosos asomados a la ventana. Refleja cómo la música y la danza populares hacían parte de la vida campesina de los siglos XVIII y XIX.",
    funFact: "El letrero al pie de la lámina dice «Baile de campesinos. Sabana de Bogotá».",
    game: { type: "curador", data: { hotspots: [
      { x: 0.806, y: 0.738, r: 0.06, label: "Perro" },
      { x: 0.284, y: 0.463, r: 0.06, label: "Músico con instrumento de cuerda" },
      { x: 0.756, y: 0.257, r: 0.07, label: "Curiosos en la ventana" },
      { x: 0.289, y: 0.15, r: 0.06, label: "Sombreros colgados" }
    ] } },
    questions: [
      { q: "¿Qué región nombra el letrero al pie de la lámina?", options: ["Valle del Cauca", "Costa Caribe", "Llanos Orientales", "Sabana de Bogotá"], answer: 3, explain: "El letrero dice «Baile de campesinos. Sabana de Bogotá»." },
      { q: "¿Qué muestra esta litografía sobre la vida campesina?", options: ["Cómo la música y la danza hacían parte de su vida", "El trabajo en las minas", "Una batalla de la Independencia", "Una procesión religiosa"], answer: 0, explain: "Muestra una fiesta con músicos y parejas bailando." }
    ]
  },
  {
    id: 8,
    slug: "tipos-de-muchachos-del-pueblo",
    title: "Tipos de muchachos del pueblo",
    author: "Ramón Torres Méndez; impreso por A. De la Rue",
    date: "1878",
    type: "Litografía coloreada",
    technique: "Litografía coloreada sobre papel",
    registro: "Reg. 109",
    sala: 1,
    image: "./assets/artworks/tipos-de-muchachos-del-pueblo.jpg",
    description: "Lámina de costumbres neogranadinas de Ramón Torres Méndez que la imprenta A. De la Rue publicó hacia 1878 en París, para el álbum Scènes de la vie colombienne. Muestra a un grupo de niños en la calle, posiblemente jugando a «la taba».",
    funFact: "La taba es un juego antiguo en el que se lanza un hueso pequeño y se gana o se pierde según el lado sobre el que cae.",
    game: { type: "carrera", data: {
      runner: "un muchacho del pueblo",
      collect: "tabas",
      facts: [
        "La lámina se publicó hacia 1878 en París.",
        "Hizo parte del álbum Scènes de la vie colombienne.",
        "Los niños de la escena parecen jugar a «la taba»."
      ]
    } },
    questions: [
      { q: "¿A qué parecen jugar los niños de la lámina?", options: ["Al fútbol", "A la taba", "Al ajedrez", "A las cartas"], answer: 1, explain: "La ficha dice que posiblemente juegan a «la taba»." },
      { q: "¿En qué ciudad se publicó esta lámina?", options: ["Bogotá", "Madrid", "París", "Cartagena"], answer: 2, explain: "La imprenta A. De la Rue la publicó en París hacia 1878." },
      { q: "¿Para qué álbum se hizo la lámina?", options: ["Papel Periódico Ilustrado", "Flora de Bogotá", "Correo Curioso", "Scènes de la vie colombienne"], answer: 3, explain: "Hizo parte del álbum Scènes de la vie colombienne." }
    ]
  },
  {
    id: 36,
    slug: "reyerta-de-aguadores",
    title: "Reyerta de aguadores",
    author: "Ramón Torres Méndez; impreso por A. De la Rue",
    date: "1878",
    type: "Litografía coloreada",
    technique: "Litografía coloreada con acuarela",
    registro: "Reg. 104",
    sala: 1,
    image: "./assets/artworks/reyerta-de-aguadores.jpg",
    description: "Litografía coloreada de Ramón Torres Méndez, impresa en 1878 por A. De la Rue. Muestra una riña entre aguadores junto a una fuente pública. Los aguadores eran trabajadores populares de la Bogotá del siglo XIX que llevaban el agua de las fuentes a las casas.",
    funFact: "Los aguadores cargaban el agua en vasijas de barro llamadas múcuras.",
    game: { type: "carrera", data: {
      runner: "un aguador",
      collect: "múcuras de agua",
      facts: [
        "Los aguadores llevaban agua de las fuentes públicas a las casas.",
        "La escena muestra una riña junto a una fuente.",
        "La lámina fue impresa en 1878 por A. De la Rue."
      ]
    } },
    questions: [
      { q: "¿Qué hacían los aguadores en la Bogotá del siglo XIX?", options: ["Llevaban agua de las fuentes a las casas", "Vendían periódicos", "Cuidaban los caballos del ejército", "Tocaban música en las fiestas"], answer: 0, explain: "Eran trabajadores que repartían el agua de las fuentes públicas." },
      { q: "¿Dónde ocurre la riña de esta lámina?", options: ["Dentro de una iglesia", "Junto a una fuente pública", "En un campo de batalla", "En una imprenta"], answer: 1, explain: "La pelea ocurre junto a una fuente." }
    ]
  },
  {
    id: 40,
    slug: "jose-celestino-mutis",
    title: "José Celestino Mutis",
    author: "Salvador Rizo Blanco",
    date: "1800",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 48",
    sala: 1,
    image: "./assets/artworks/jose-celestino-mutis.jpg",
    description: "Retrato del sabio José Celestino Mutis, director de la Real Expedición Botánica, pintado por Salvador Rizo Blanco. Mutis aparece como un busto sobre un pedestal, rodeado de libros, un globo terráqueo y plantas con flores.",
    funFact: "Salvador Rizo fue uno de los pintores de la Expedición Botánica que dirigía Mutis.",
    game: { type: "galeria", data: { pairs: [
      { a: "img:40", b: "José Celestino Mutis" },
      { a: "Real Expedición Botánica", b: "La dirigió Mutis" },
      { a: "Salvador Rizo Blanco", b: "Pintó este retrato" },
      { a: "Globo terráqueo", b: "Símbolo de la ciencia en el retrato" }
    ] } },
    questions: [
      { q: "¿Qué dirigió José Celestino Mutis?", options: ["La Casa de Moneda", "El ejército de la Campaña del Sur", "La Real Expedición Botánica", "La Junta de Manumisión"], answer: 2, explain: "Mutis fue el director de la Real Expedición Botánica." },
      { q: "¿Quién pintó este retrato de Mutis?", options: ["José María Espinosa", "Ramón Torres Méndez", "Francisco Castillo", "Salvador Rizo Blanco"], answer: 3, explain: "El retrato es de Salvador Rizo Blanco." },
      { q: "¿Qué objeto aparece junto al busto de Mutis?", options: ["Un globo terráqueo", "Una espada", "Un florero", "Un cañón"], answer: 0, explain: "Junto al busto hay libros, plantas y un globo terráqueo." }
    ]
  },

  // ───────────────────────────── SALA 2 · CAPILLA ─────────────────────────────
  {
    id: 9,
    slug: "triptico-de-nuestra-senora-de-las-angustias",
    title: "Tríptico de Nuestra Señora de las Angustias",
    author: "Autor desconocido",
    date: "1700",
    type: "Tríptico",
    technique: "Óleo, pan de oro y metal",
    registro: "Reg. 53",
    sala: 2,
    image: "./assets/artworks/triptico-de-nuestra-senora-de-las-angustias.jpg",
    description: "Retablo portátil de tres paneles, fechado en 1700, dedicado a la Virgen de las Angustias. En el panel central la Virgen sostiene a Cristo muerto, y las puertas laterales tienen escenas más pequeñas. Está hecho con óleo, pan de oro y metal.",
    funFact: "Un tríptico portátil podía cerrarse sobre sí mismo, como un libro, para protegerlo y llevarlo de un lugar a otro.",
    game: { type: "restaurador", data: { grid: 3 } },
    questions: [
      { q: "¿Cuántos paneles tiene un tríptico?", options: ["Dos", "Tres", "Cuatro", "Seis"], answer: 1, explain: "Un tríptico es un retablo de tres paneles." },
      { q: "¿Qué material dorado se usó en este tríptico?", options: ["Bronce fundido", "Pintura amarilla", "Pan de oro", "Latón pulido"], answer: 2, explain: "Está hecho con óleo, pan de oro y metal." },
      { q: "¿A qué advocación de la Virgen está dedicado?", options: ["Virgen de Chiquinquirá", "Virgen del Carmen", "Virgen de la Candelaria", "Virgen de las Angustias"], answer: 3, explain: "Es el Tríptico de Nuestra Señora de las Angustias." }
    ]
  },
  {
    id: 10,
    slug: "virgen-de-la-inmaculada-concepcion",
    title: "Virgen de la Inmaculada Concepción",
    author: "Autor desconocido",
    date: "1900",
    type: "Escultura",
    technique: "Madera, oro y metal",
    registro: "Reg. 4509",
    sala: 2,
    image: "./assets/artworks/virgen-de-la-inmaculada-concepcion.jpg",
    description: "Escultura de la Virgen de la Inmaculada Concepción hecha en madera, oro y metal. La Virgen tiene alas doradas y un resplandor sobre la cabeza, y se apoya sobre una esfera oscura colocada en una base de madera. La ficha del museo no publica texto descriptivo sobre la obra.",
    funFact: "",
    game: { type: "curador", data: { hotspots: [
      { x: 0.459, y: 0.089, r: 0.07, label: "Resplandor sobre la cabeza" },
      { x: 0.228, y: 0.291, r: 0.08, label: "Ala dorada" },
      { x: 0.508, y: 0.62, r: 0.05, label: "Criatura alada bajo sus pies" },
      { x: 0.517, y: 0.734, r: 0.08, label: "Esfera oscura" }
    ] } },
    questions: [
      { q: "¿De qué materiales está hecha esta escultura?", options: ["Madera, oro y metal", "Mármol y bronce", "Yeso y vidrio", "Porcelana"], answer: 0, explain: "La ficha indica madera, oro y metal." },
      { q: "¿Sobre qué se apoya la Virgen en esta escultura?", options: ["Sobre una nube", "Sobre una esfera oscura", "Sobre un trono", "Sobre un barco"], answer: 1, explain: "La figura se apoya sobre una esfera oscura colocada en una base." }
    ]
  },
  {
    id: 11,
    slug: "reloj-de-mesa-o-pared",
    title: "Reloj de mesa o pared",
    author: "Autor desconocido",
    date: "S. XX",
    type: "Objeto",
    technique: "Sin datos",
    registro: "Reg. 528",
    sala: 2,
    image: "./assets/artworks/reloj-de-mesa-o-pared.jpg",
    description: "Reloj de mesa o pared del siglo XX que hace parte de la colección del museo. La ficha no publica datos sobre su técnica, sus medidas ni su historia. Aquí lo ves en una ilustración, porque no contamos con una fotografía de la pieza.",
    funFact: "",
    game: { type: "codigo", data: { message: "MEDIR EL TIEMPO", hint: "¿Para qué sirve este objeto?" } },
    questions: [
      { q: "¿De qué siglo es el reloj de la colección?", options: ["Siglo XVI", "Siglo XVIII", "Siglo XIX", "Siglo XX"], answer: 3, explain: "La ficha lo fecha en el siglo XX." },
      { q: "¿Qué tipo de obra es el reloj según la ficha?", options: ["Una pintura", "Una litografía", "Una partitura", "Un objeto"], answer: 3, explain: "La ficha lo clasifica como objeto." }
    ]
  },
  {
    id: 33,
    slug: "santa-librada",
    title: "Santa Librada",
    author: "Escuela quiteña",
    date: "1750",
    type: "Escultura",
    technique: "Madera, metal, pan de oro",
    registro: "Reg. 157",
    sala: 2,
    image: "./assets/artworks/santa-librada.jpg",
    description: "Escultura de Santa Librada de la Escuela quiteña, fechada en 1750 y hecha en madera, metal y pan de oro. La santa aparece crucificada. En Colombia, Santa Librada se asoció con la gesta de independencia.",
    funFact: "La fiesta de Santa Librada se celebra el 20 de julio, el mismo día de los hechos de 1810 en Santafé.",
    game: { type: "codigo", data: { message: "VEINTE DE JULIO", hint: "Es el día de la fiesta de esta santa." } },
    questions: [
      { q: "¿Con qué se asoció a Santa Librada en Colombia?", options: ["Con la gesta de independencia", "Con la fundación de Bogotá", "Con la Expedición Botánica", "Con la abolición de la esclavitud"], answer: 0, explain: "Santa Librada se asoció con la gesta de independencia." },
      { q: "¿A qué escuela de arte pertenece esta escultura?", options: ["Escuela de París", "Escuela quiteña", "Escuela flamenca", "Escuela de Bellas Artes de Bogotá"], answer: 1, explain: "La ficha la atribuye a la Escuela quiteña." },
      { q: "¿Qué día se celebra la fiesta de Santa Librada?", options: ["7 de agosto", "11 de noviembre", "20 de julio", "25 de diciembre"], answer: 2, explain: "Su fiesta es el 20 de julio, como el grito de 1810." }
    ]
  },
  {
    id: 42,
    slug: "san-jose",
    title: "San José",
    author: "Autor desconocido",
    date: "1600",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 19",
    sala: 2,
    image: "./assets/artworks/san-jose.jpg",
    description: "Óleo de autor desconocido, fechado en 1600, que representa a San José, santo muy venerado y tenido como modelo de hombre religioso. En una mano lleva un libro y en la otra una vara florida. Según la tradición, ese atributo lo señaló como el esposo indicado para la Virgen María.",
    funFact: "Según su fecha, es la obra más antigua de las 50 de este recorrido.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.877, y: 0.213, r: 0.07, label: "Vara florida" },
      { x: 0.406, y: 0.369, r: 0.06, label: "Libro" },
      { x: 0.471, y: 0.113, r: 0.07, label: "Aureola" },
      { x: 0.90, y: 0.75, r: 0.07, label: "Edificio al fondo" }
    ] } },
    questions: [
      { q: "¿Qué atributo lleva San José en la mano?", options: ["Una espada", "Una llave", "Un florero", "Una vara florida"], answer: 3, explain: "Lleva una vara florida, además de un libro." },
      { q: "Según la tradición, ¿qué señaló la vara florida?", options: ["Que era el esposo indicado para la Virgen María", "Que sería rey", "Que sería carpintero", "Que viajaría a América"], answer: 0, explain: "La vara florida lo señaló como esposo indicado de la Virgen." }
    ]
  },
  {
    id: 18,
    slug: "la-india-de-la-libertad",
    title: "La India de la Libertad",
    author: "Autor desconocido",
    date: "1819",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 18",
    sala: 2,
    image: "./assets/artworks/la-india-de-la-libertad.jpg",
    description: "Alegoría de América pintada en 1819, con apariencia criolla, para expresar el mestizaje y los derechos de los americanos sobre su territorio. Lleva un gran tocado de plumas, arco y flechas. Presidió ceremonias cívicas en Santafé en reemplazo de los retratos del rey Fernando VII.",
    funFact: "En la esquina superior izquierda se lee: «La India de la Libertad. Año de 1819».",
    game: { type: "codigo", data: { message: "LA INDIA DE LA LIBERTAD", hint: "Está escrito en la esquina de la pintura." } },
    questions: [
      { q: "¿Qué retratos reemplazó esta pintura en las ceremonias cívicas de Santafé?", options: ["Los de Simón Bolívar", "Los de Fernando VII", "Los de Antonio Nariño", "Los de los virreyes Amar y Villanova"], answer: 1, explain: "Presidió ceremonias en reemplazo de los retratos de Fernando VII." },
      { q: "¿Qué representa la figura de la India de la Libertad?", options: ["A una reina española", "A Policarpa Salavarrieta", "Una alegoría de América", "A la Virgen María"], answer: 2, explain: "Es una alegoría de América que expresa el mestizaje y los derechos americanos." }
    ]
  },
  {
    id: 24,
    slug: "sixta-ponton-de-santander",
    title: "Sixta Pontón de Santander",
    author: "Zilia Barriga",
    date: "1856",
    type: "Pintura (miniatura)",
    technique: "Sin datos",
    registro: "Reg. 2997",
    sala: 2,
    image: "./assets/artworks/sixta-ponton-de-santander.jpg",
    description: "Miniatura pintada por Zilia Barriga en 1856 que retrata a Sixta Pontón, esposa del general Francisco de Paula Santander. Aparece vestida de negro, con un cuello blanco. Tras la muerte de su esposo se dedicó a la educación y fundó el Colegio del Sagrado Corazón.",
    funFact: "Zilia Barriga, autora de esta miniatura, es una de las mujeres artistas de la colección.",
    game: { type: "galeria", data: { pairs: [
      { a: "img:24", b: "Sixta Pontón, esposa de Santander" },
      { a: "img:25", b: "Josefa Santander, hermana del general" },
      { a: "img:31", b: "Bolívar y Santander" },
      { a: "Colegio del Sagrado Corazón", b: "Lo fundó Sixta Pontón" },
      { a: "Zilia Barriga", b: "Pintó la miniatura de Sixta" }
    ] } },
    questions: [
      { q: "¿De quién fue esposa Sixta Pontón?", options: ["De Simón Bolívar", "De Antonio Nariño", "De José María Córdoba", "De Francisco de Paula Santander"], answer: 3, explain: "Sixta Pontón fue la esposa del general Santander." },
      { q: "¿Qué hizo Sixta Pontón tras la muerte de su esposo?", options: ["Fundó el Colegio del Sagrado Corazón", "Se fue a vivir a Europa", "Dirigió un periódico", "Fue presidenta"], answer: 0, explain: "Se dedicó a la educación y fundó el Colegio del Sagrado Corazón." }
    ]
  },
  {
    id: 25,
    slug: "josefa-santander-de-briceno",
    title: "Josefa Santander de Briceño",
    author: "José María Espinosa (atribuido)",
    date: "1850",
    type: "Pintura",
    technique: "Acuarela",
    registro: "Reg. 2995",
    sala: 2,
    image: "./assets/artworks/josefa-santander-de-briceno.jpg",
    description: "Retrato en acuarela de Josefa Santander de Briceño, hermana del general Francisco de Paula Santander, atribuido a José María Espinosa y fechado en 1850. Tiene forma ovalada y la muestra con flores en el cabello, collar de perlas y vestido rojo.",
    funFact: "José María Espinosa, a quien se atribuye el retrato, fue pintor y también soldado de la Independencia.",
    game: { type: "restaurador", data: { grid: 3 } },
    questions: [
      { q: "¿Qué parentesco tenía Josefa con Francisco de Paula Santander?", options: ["Era su esposa", "Era su hermana", "Era su madre", "Era su hija"], answer: 1, explain: "Josefa Santander de Briceño era hermana del general." },
      { q: "¿Con qué técnica está hecho este retrato?", options: ["Óleo", "Esmalte", "Acuarela", "Carboncillo"], answer: 2, explain: "Es un retrato en acuarela." }
    ]
  },
  {
    id: 32,
    slug: "madre-y-hermanas-de-jose-maria-cordoba",
    title: "Madre y hermanas de José María Córdoba",
    author: "Autor desconocido",
    date: "1800",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 581",
    sala: 2,
    image: "./assets/artworks/madre-y-hermanas-de-jose-maria-cordoba.jpg",
    description: "Retrato de grupo de la madre y las hermanas del prócer José María Córdoba. Las tres mujeres llevan vestidos amplios: dos están sentadas y una de pie. La ficha del museo no publica texto descriptivo ni la técnica de la obra.",
    funFact: "José María Córdoba fue general de la Independencia; el departamento de Córdoba lleva su nombre.",
    game: { type: "restaurador", data: { grid: 4 } },
    questions: [
      { q: "¿De qué prócer son familiares las mujeres del retrato?", options: ["Antonio Nariño", "Francisco José de Caldas", "Jorge Tadeo Lozano", "José María Córdoba"], answer: 3, explain: "Son la madre y las hermanas de José María Córdoba." },
      { q: "¿Cuántas mujeres aparecen en el retrato?", options: ["Tres", "Dos", "Cuatro", "Cinco"], answer: 0, explain: "Aparecen tres mujeres: dos sentadas y una de pie." }
    ]
  },
  {
    id: 35,
    slug: "francisco-jose-de-caldas-miniatura",
    title: "Francisco José de Caldas (miniatura)",
    author: "Luis Felipe Uscátegui",
    date: "1940",
    type: "Miniatura en esmalte",
    technique: "Esmalte vítreo",
    registro: "Reg. 4045",
    sala: 2,
    image: "./assets/artworks/francisco-jose-de-caldas-miniatura.jpg",
    description: "Retrato en miniatura de Francisco José de Caldas hecho en esmalte vítreo por Luis Felipe Uscátegui en 1940. Tiene forma ovalada, fondo azul y la firma del artista a la derecha.",
    funFact: "A Caldas se le conoce como «el Sabio Caldas» por sus trabajos científicos.",
    game: { type: "codigo", data: { message: "EL SABIO CALDAS", hint: "Así se conoce a Francisco José de Caldas." } },
    questions: [
      { q: "¿En qué material está hecha esta miniatura de Caldas?", options: ["Carboncillo", "Esmalte vítreo", "Porcelana", "Madera"], answer: 1, explain: "Uscátegui la hizo en esmalte vítreo." },
      { q: "¿Cómo se le conoce a Francisco José de Caldas?", options: ["El Precursor", "El Libertador", "El Sabio Caldas", "El Hombre de las Leyes"], answer: 2, explain: "Por sus trabajos científicos se le llama «el Sabio Caldas»." }
    ]
  },

  // ──────────────────────── SALA 3 · TIENDA DE LLORENTE ────────────────────────
  {
    id: 12,
    slug: "base-del-florero-del-20-de-julio",
    title: "Base del florero del 20 de julio de 1810",
    author: "Real Fábrica del Buen Retiro (Madrid)",
    date: "Ca. 1780",
    type: "Objeto",
    technique: "Porcelana",
    registro: "Reg. 260",
    sala: 3,
    image: "./assets/artworks/base-del-florero-del-20-de-julio.jpg",
    description: "Es el fragmento que se conserva del florero del 20 de julio de 1810, una pieza de porcelana de la Real Fábrica del Buen Retiro, en Madrid. Lleva el escudo real con las flores de lis borbónicas y el Toisón de Oro. Con el tiempo se volvió un símbolo de la Independencia.",
    funFact: "La disputa por el préstamo de este florero, el 20 de julio de 1810, encendió los hechos que llevaron al Acta de Independencia de Santafé.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.517, y: 0.181, r: 0.07, label: "Corona real" },
      { x: 0.512, y: 0.542, r: 0.05, label: "Flores de lis borbónicas" },
      { x: 0.423, y: 0.443, r: 0.05, label: "Castillo del escudo" },
      { x: 0.504, y: 0.873, r: 0.07, label: "Collar del Toisón de Oro" }
    ] } },
    questions: [
      { q: "¿De qué material es la base del florero?", options: ["Vidrio", "Plata", "Barro cocido", "Porcelana"], answer: 3, explain: "Es una pieza de porcelana." },
      { q: "¿Dónde se fabricó la pieza?", options: ["En la Real Fábrica del Buen Retiro, en Madrid", "En un taller de Santafé", "En Quito", "En París, en la imprenta A. De la Rue"], answer: 0, explain: "Es de la Real Fábrica del Buen Retiro, en Madrid." },
      { q: "¿Qué flores aparecen en el escudo real del florero?", options: ["Rosas", "Flores de lis", "Orquídeas", "Girasoles"], answer: 1, explain: "Lleva las flores de lis borbónicas." }
    ]
  },
  {
    id: 13,
    slug: "reyerta-del-20-de-julio-de-1810",
    title: "Reyerta del 20 de julio de 1810",
    author: "Pedro Alcántara Quijano",
    date: "Ca. 1940",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 27",
    sala: 3,
    image: "./assets/artworks/reyerta-del-20-de-julio-de-1810.jpg",
    description: "Pedro Alcántara Quijano pintó hacia 1940 el momento en que Antonio Morales abofetea al comerciante español José González Llorente. Llorente se había negado a prestar un florero para recibir al comisionado Antonio Villavicencio. Los criollos usaron el incidente para pedir un cabildo abierto y formar la Junta de Gobierno.",
    funFact: "Quijano también pintó la salida de Policarpa Salavarrieta hacia el patíbulo, que está en la Sala de armas.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.74, y: 0.308, r: 0.06, label: "Farol colgante" },
      { x: 0.578, y: 0.59, r: 0.07, label: "La bofetada" },
      { x: 0.179, y: 0.704, r: 0.06, label: "Niño descalzo" },
      { x: 0.527, y: 0.93, r: 0.06, label: "Bastón en el suelo" }
    ] } },
    questions: [
      { q: "¿Quién abofeteó a José González Llorente?", options: ["Antonio Nariño", "Antonio Villavicencio", "Antonio Morales", "Antonio Amar y Borbón"], answer: 2, explain: "Antonio Morales abofeteó a Llorente." },
      { q: "¿Para recibir a quién se pidió prestado el florero?", options: ["Al virrey Amar", "A Simón Bolívar", "Al rey Fernando VII", "Al comisionado Antonio Villavicencio"], answer: 3, explain: "El florero era para recibir al comisionado Antonio Villavicencio." },
      { q: "¿Qué pidieron los criollos después del incidente?", options: ["Un cabildo abierto", "La llegada de un nuevo virrey", "Cerrar la tienda de Llorente", "Una procesión"], answer: 0, explain: "Pidieron un cabildo abierto y formaron la Junta de Gobierno." }
    ]
  },
  {
    id: 14,
    slug: "salida-del-virrey-amar-y-su-esposa",
    title: "Salida del virrey Amar y su esposa del palacio",
    author: "Autor desconocido",
    date: "1800",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 211",
    sala: 3,
    image: "./assets/artworks/salida-del-virrey-amar-y-su-esposa.jpg",
    description: "Representa la salida del virrey Antonio Amar y Borbón y de su esposa, Francisca Villanova, del palacio virreinal de Santafé. Tras el 20 de julio de 1810 el virrey fue depuesto y, ante el rumor de un contraataque, fue obligado a salir de la Nueva Granada. La ficha del museo fecha la pintura en 1800, aunque la escena ocurrió después de 1810.",
    funFact: "La superficie de la pintura tiene grietas y dobleces visibles: huellas del paso del tiempo.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.512, y: 0.60, r: 0.07, label: "Dama de vestido verde" },
      { x: 0.61, y: 0.175, r: 0.06, label: "Escudo tallado sobre la columna" },
      { x: 0.72, y: 0.306, r: 0.06, label: "Cuadro en la pared" },
      { x: 0.424, y: 0.375, r: 0.05, label: "Sombrero de tres picos" }
    ] } },
    questions: [
      { q: "¿Cómo se llamaba el virrey que salió del palacio?", options: ["Juan de Sámano", "Antonio Amar y Borbón", "Pablo Morillo", "José González Llorente"], answer: 1, explain: "Era el virrey Antonio Amar y Borbón." },
      { q: "¿Cómo se llamaba la esposa del virrey?", options: ["Manuela Sáenz", "Sixta Pontón", "Francisca Villanova", "Carmen Rodríguez"], answer: 2, explain: "Su esposa era Francisca Villanova." }
    ]
  },
  {
    id: 15,
    slug: "firma-del-acta-de-independencia",
    title: "Firma del Acta de Independencia",
    author: "Autor desconocido",
    date: "1928",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 210",
    sala: 3,
    image: "./assets/artworks/firma-del-acta-de-independencia.jpg",
    description: "Óleo de 1928, de autor desconocido, que representa la firma del Acta de Independencia de Santafé del 20 de julio de 1810. Muestra a un grupo de hombres reunidos en un salón alrededor de la mesa donde se firma el documento.",
    funFact: "El Acta del 20 de julio dejó constancia de la formación de la Junta de Gobierno de Santafé.",
    game: { type: "linea", data: { events: [
      { year: "1781", text: "Levantamiento de los Comuneros" },
      { year: "1794", text: "Nariño es procesado por imprimir los Derechos del Hombre" },
      { year: "1810", text: "Firma del Acta del 20 de julio en Santafé" },
      { year: "1819", text: "Batalla de Boyacá" },
      { year: "1821", text: "Congreso de Cúcuta" }
    ] } },
    questions: [
      { q: "¿Qué hecho representa esta pintura de 1928?", options: ["La batalla de Boyacá", "La muerte de Santander", "El Congreso de Cúcuta", "La firma del Acta de Independencia de Santafé"], answer: 3, explain: "Representa la firma del Acta del 20 de julio de 1810." },
      { q: "¿Qué ocurrió primero?", options: ["El levantamiento de los Comuneros", "La batalla de Boyacá", "El Congreso de Cúcuta", "La firma del Acta del 20 de julio"], answer: 0, explain: "Los Comuneros se levantaron en 1781, antes que los demás hechos." }
    ]
  },
  {
    id: 37,
    slug: "juramento-del-acta",
    title: "Juramento del Acta",
    author: "Inés Acevedo Biester",
    date: "S. XX",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 75",
    sala: 3,
    image: "./assets/artworks/juramento-del-acta.jpg",
    description: "Óleo del siglo XX de Inés Acevedo Biester que representa el juramento del Acta de la Revolución del 20 de julio de 1810. Se ve a un grupo de hombres que jura con la mano sobre un libro abierto, iluminados por una vela.",
    funFact: "Inés Acevedo Biester es una de las tres mujeres artistas de esta selección, junto con Zilia Barriga y Juliana Caldas.",
    game: { type: "mensajero", data: {
      item: "la noticia del cabildo abierto",
      destination: "la Plaza Mayor",
      facts: [
        "Tras la reyerta del 20 de julio de 1810, los criollos pidieron un cabildo abierto.",
        "En la pintura, los hombres juran con la mano sobre un libro abierto."
      ]
    } },
    questions: [
      { q: "¿Quién pintó el Juramento del Acta?", options: ["Zilia Barriga", "Inés Acevedo Biester", "Pedro Alcántara Quijano", "José María Espinosa"], answer: 1, explain: "Es un óleo de Inés Acevedo Biester." },
      { q: "¿Sobre qué ponen la mano los hombres que juran?", options: ["Sobre una espada", "Sobre el florero", "Sobre un libro abierto", "Sobre una bandera"], answer: 2, explain: "Juran con la mano sobre un libro abierto." }
    ]
  },
  {
    id: 48,
    slug: "acta-de-la-revolucion-del-20-de-julio",
    title: "Acta de la Revolución del 20 de julio de 1810",
    author: "Autor desconocido",
    date: "1910",
    type: "Documento",
    technique: "Sin datos",
    registro: "Reg. 396",
    sala: 3,
    image: "./assets/artworks/acta-de-la-revolucion-del-20-de-julio.jpg",
    description: "Reproducción del Acta de la Revolución del 20 de julio de 1810, fechada en 1910, año del primer centenario de la Independencia. El Acta dejó constancia de la formación de la Junta de Gobierno de Santafé. El texto está rodeado por una orla decorativa con medallones.",
    funFact: "El acta original se perdió en el incendio de las Galerías Arrubla, en 1900; su texto se conoce por copias.",
    game: { type: "mensajero", data: {
      item: "el Acta",
      destination: "el Cabildo",
      facts: [
        "El Acta del 20 de julio de 1810 registró la formación de la Junta de Gobierno de Santafé.",
        "Esta reproducción es de 1910, el año del primer centenario."
      ]
    } },
    questions: [
      { q: "¿Por qué es importante el año 1910 para esta reproducción del Acta?", options: ["Fue el año de la batalla de Boyacá", "Fue cuando abrió el museo", "Fue el año del Himno Nacional", "Fue el primer centenario de la Independencia"], answer: 3, explain: "1910 fue el primer centenario del 20 de julio de 1810." },
      { q: "¿De qué dejó constancia el Acta del 20 de julio?", options: ["De la formación de la Junta de Gobierno de Santafé", "De la abolición de la esclavitud", "De la elección de Bolívar como presidente", "De la fundación de Bogotá"], answer: 0, explain: "Registró la formación de la Junta de Gobierno de Santafé." },
      { q: "¿Qué pasó con el acta original?", options: ["Está en Madrid", "Se perdió en el incendio de las Galerías Arrubla, en 1900", "Se la llevó el virrey Amar", "Está enterrada bajo la Catedral"], answer: 1, explain: "El original se perdió en el incendio de las Galerías Arrubla." }
    ]
  },
  {
    id: 27,
    slug: "antonio-morales-y-familia",
    title: "Antonio Morales y familia",
    author: "José María Espinosa (atribuido)",
    date: "Ca. 1850",
    type: "Pintura",
    technique: "Óleo sobre lienzo",
    registro: "Sin datos",
    sala: 3,
    image: "./assets/artworks/antonio-morales-y-familia.jpg",
    description: "Retrato de familia atribuido a José María Espinosa, de hacia 1850. Muestra a Antonio Morales, protagonista del 20 de julio de 1810, con su esposa, Ana María Espinosa Prieto, y su hija, Gertrudis Morales.",
    funFact: "El retrato se pintó unos cuarenta años después de los hechos del 20 de julio de 1810.",
    game: { type: "galeria", data: { pairs: [
      { a: "Antonio Morales", b: "Protagonista del 20 de julio" },
      { a: "Ana María Espinosa Prieto", b: "Su esposa" },
      { a: "Gertrudis Morales", b: "Su hija" },
      { a: "José María Espinosa", b: "Pintor al que se atribuye" },
      { a: "img:43", b: "Antonio Morales Galavis en uniforme" }
    ] } },
    questions: [
      { q: "¿Cómo se llamaba la hija de Antonio Morales que aparece en el retrato?", options: ["Policarpa", "Josefa", "Gertrudis", "Manuela"], answer: 2, explain: "Su hija era Gertrudis Morales." },
      { q: "¿Quién era la esposa de Antonio Morales?", options: ["Sixta Pontón", "Francisca Villanova", "Carmen Rodríguez", "Ana María Espinosa Prieto"], answer: 3, explain: "Su esposa era Ana María Espinosa Prieto." }
    ]
  },
  {
    id: 43,
    slug: "antonio-morales-galavis",
    title: "Antonio Morales Galavis",
    author: "Autor desconocido",
    date: "1900",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 3979",
    sala: 3,
    image: "./assets/artworks/antonio-morales-galavis.jpg",
    description: "Retrato de Antonio Morales Galavis, nacido en Santafé en 1784, abogado de la Real Audiencia y uno de los principales protagonistas de los hechos del 20 de julio de 1810. Aparece con uniforme militar, charreteras doradas, condecoraciones y los brazos cruzados.",
    funFact: "Es el mismo Antonio Morales que abofeteó a Llorente en la reyerta del florero.",
    game: { type: "carrera", data: {
      runner: "Antonio Morales",
      collect: "flores",
      facts: [
        "Antonio Morales nació en Santafé en 1784.",
        "Fue abogado de la Real Audiencia.",
        "Fue uno de los protagonistas de la reyerta del 20 de julio de 1810."
      ]
    } },
    questions: [
      { q: "¿En qué año nació Antonio Morales Galavis?", options: ["1765", "1784", "1810", "1819"], answer: 1, explain: "Nació en Santafé en 1784." },
      { q: "¿Qué profesión tenía Antonio Morales?", options: ["Pintor", "Abogado de la Real Audiencia", "Comerciante de porcelana", "Sacerdote"], answer: 1, explain: "Fue abogado de la Real Audiencia." }
    ]
  },
  {
    id: 38,
    slug: "narino-y-la-impresion-de-los-derechos-del-hombre",
    title: "Nariño supervisando la impresión de los Derechos del Hombre",
    author: "Luis Cancino Fernández",
    date: "1840",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 579",
    sala: 3,
    image: "./assets/artworks/narino-y-la-impresion-de-los-derechos-del-hombre.jpg",
    description: "Escena de Antonio Nariño supervisando la impresión de los Derechos del Hombre y del Ciudadano, obra de Luis Cancino Fernández. En el taller se ven la prensa de madera, los pliegos impresos y los trabajadores. Por traducir e imprimir ese texto, Nariño fue procesado en 1794.",
    funFact: "El primer artículo de esa declaración dice que los hombres nacen y permanecen libres e iguales en derechos.",
    game: { type: "imprenta", data: {
      phrase: "LOS HOMBRES NACEN LIBRES",
      facts: [
        "Nariño tradujo e imprimió los Derechos del Hombre y del Ciudadano.",
        "Por ese hecho fue procesado en 1794."
      ]
    } },
    questions: [
      { q: "¿Qué documento hizo imprimir Antonio Nariño?", options: ["El Acta de Independencia", "El Himno Nacional", "Los Derechos del Hombre y del Ciudadano", "La Constitución de Cúcuta"], answer: 2, explain: "Nariño tradujo e imprimió los Derechos del Hombre y del Ciudadano." },
      { q: "¿Qué máquina aparece en el taller de la escena?", options: ["Un telar", "Un reloj de pared", "Un cañón", "Una prensa de imprenta"], answer: 3, explain: "En el taller se ve la prensa de madera." },
      { q: "¿En qué año fue procesado Nariño por imprimir ese texto?", options: ["1781", "1794", "1810", "1819"], answer: 1, explain: "Fue procesado en 1794." }
    ]
  },
  {
    id: 45,
    slug: "jorge-tadeo-lozano",
    title: "Jorge Tadeo Lozano",
    author: "Constancio Franco Vargas",
    date: "1880",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 47",
    sala: 3,
    image: "./assets/artworks/jorge-tadeo-lozano.jpg",
    description: "Retrato de Jorge Tadeo Lozano, prócer de la Independencia, pintado por Constancio Franco Vargas en 1880. Lozano fue el primer presidente del Estado de Cundinamarca, en 1811, y fue fusilado en Santafé en 1816, durante la Reconquista.",
    funFact: "Una universidad de Bogotá, la Jorge Tadeo Lozano, lleva su nombre.",
    game: { type: "imprenta", data: {
      phrase: "PRESIDENTE DE CUNDINAMARCA",
      facts: [
        "En 1811 Lozano fue el primer presidente del Estado de Cundinamarca.",
        "Fue fusilado en Santafé en 1816, durante la Reconquista."
      ]
    } },
    questions: [
      { q: "¿Qué cargo ocupó Jorge Tadeo Lozano en 1811?", options: ["Virrey de la Nueva Granada", "Primer presidente del Estado de Cundinamarca", "Director de la Expedición Botánica", "Alcalde de Cartagena"], answer: 1, explain: "Fue el primer presidente del Estado de Cundinamarca." },
      { q: "¿Qué le ocurrió a Lozano en 1816?", options: ["Ganó la batalla de Boyacá", "Viajó a Europa", "Fue fusilado en Santafé durante la Reconquista", "Fundó el museo"], answer: 2, explain: "Fue fusilado en Santafé en 1816." }
    ]
  },

  // ─────────────────────────── SALA 4 · SALA DE ARMAS ───────────────────────────
  {
    id: 16,
    slug: "batalla-del-alto-palace",
    title: "Batalla del Alto Palacé",
    author: "José María Espinosa",
    date: "1830",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 24",
    sala: 4,
    image: "./assets/artworks/batalla-del-alto-palace.jpg",
    description: "José María Espinosa representó la batalla del Alto Palacé, en el Cauca, cerca de Popayán. Allí, el 30 de diciembre de 1813, tropas patriotas de la Campaña del Sur de Antonio Nariño vencieron a las fuerzas realistas de Juan de Sámano. Espinosa, pintor y soldado de la Independencia, dedicó buena parte de su carrera a pintar líderes, héroes y batallas patriotas.",
    funFact: "Espinosa contó sus recuerdos de la guerra en un libro llamado «Memorias de un abanderado».",
    game: { type: "carrera", data: {
      runner: "un soldado de Nariño",
      collect: "provisiones",
      facts: [
        "La batalla del Alto Palacé fue el 30 de diciembre de 1813.",
        "Hizo parte de la Campaña del Sur de Antonio Nariño.",
        "El pintor José María Espinosa también fue soldado de la Independencia."
      ]
    } },
    questions: [
      { q: "¿Quién dirigía la Campaña del Sur a la que perteneció la batalla del Alto Palacé?", options: ["Simón Bolívar", "Francisco de Paula Santander", "José María Córdoba", "Antonio Nariño"], answer: 3, explain: "Fue parte de la Campaña del Sur de Antonio Nariño." },
      { q: "Además de pintor, ¿qué fue José María Espinosa?", options: ["Soldado de la Independencia", "Virrey", "Comerciante español", "Obispo"], answer: 0, explain: "Espinosa fue pintor y soldado de la Independencia." }
    ]
  },
  {
    id: 17,
    slug: "batalla-de-calibio",
    title: "Batalla de Calibío",
    author: "José María Espinosa",
    date: "1845",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 23",
    sala: 4,
    image: "./assets/artworks/batalla-de-calibio.jpg",
    description: "Óleo de José María Espinosa sobre la batalla de Calibío, librada el 15 de enero de 1814 cerca de Popayán, durante la Campaña del Sur de Nariño. Destaca un grupo de mujeres detrás de la tropa que auxilia a un soldado herido y lleva provisiones. Podrían ser «juanas», mujeres que se unieron al ejército republicano.",
    funFact: "Espinosa pintó también la batalla del Alto Palacé, ocurrida un par de semanas antes.",
    game: { type: "curador", data: { hotspots: [
      { x: 0.106, y: 0.71, r: 0.08, label: "Mujeres auxiliando a un herido" },
      { x: 0.19, y: 0.48, r: 0.06, label: "Bandera" },
      { x: 0.62, y: 0.50, r: 0.06, label: "Cañón disparando" },
      { x: 0.71, y: 0.43, r: 0.05, label: "Casa al fondo" }
    ] } },
    questions: [
      { q: "¿Cómo se llamaba a las mujeres que se unieron al ejército republicano?", options: ["Aguadoras", "Juanas", "Comuneras", "Virreinas"], answer: 1, explain: "Las mujeres que acompañaron al ejército republicano eran llamadas «juanas»." },
      { q: "¿Cerca de qué ciudad fue la batalla de Calibío?", options: ["Cartagena", "Tunja", "Popayán", "Cúcuta"], answer: 2, explain: "Calibío está cerca de Popayán." },
      { q: "¿Qué hacen las mujeres que aparecen detrás de la tropa?", options: ["Disparan cañones", "Firman un acta", "Bailan", "Auxilian a un herido y llevan provisiones"], answer: 3, explain: "Auxilian a un soldado herido y llevan provisiones." }
    ]
  },
  {
    id: 19,
    slug: "policarpa-salavarrieta",
    title: "Policarpa Salavarrieta",
    author: "Roberto Páramo Tirado",
    date: "1890",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 79",
    sala: 4,
    image: "./assets/artworks/policarpa-salavarrieta.jpg",
    description: "Retrato de la heroína Policarpa Salavarrieta hecho por Roberto Páramo Tirado en 1890. La inscripción al pie recuerda que fue fusilada en Bogotá el 14 de noviembre de 1817, durante la Reconquista.",
    funFact: "A Policarpa Salavarrieta también se la conoce como «La Pola».",
    game: { type: "galeria", data: { pairs: [
      { a: "img:19", b: "Policarpa: fusilada en Santafé en 1817" },
      { a: "img:23", b: "Manuela Sáenz: compañera de Bolívar" },
      { a: "img:44", b: "Carmen Rodríguez: desterrada a Tocaima" },
      { a: "img:21", b: "Antonia Santos: fusilada en el Socorro" },
      { a: "img:24", b: "Sixta Pontón: fundó un colegio" }
    ] } },
    questions: [
      { q: "¿En qué año fue fusilada Policarpa Salavarrieta?", options: ["1810", "1817", "1821", "1830"], answer: 1, explain: "Fue fusilada el 14 de noviembre de 1817." },
      { q: "¿Con qué apodo se conoce a Policarpa Salavarrieta?", options: ["La Libertadora", "La Pola", "La Juana", "La India"], answer: 1, explain: "Se la conoce como «La Pola»." }
    ]
  },
  {
    id: 20,
    slug: "salida-de-policarpa-hacia-el-patibulo",
    title: "Salida de Policarpa Salavarrieta hacia el patíbulo",
    author: "Pedro Alcántara Quijano",
    date: "1944",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 22",
    sala: 4,
    image: "./assets/artworks/salida-de-policarpa-hacia-el-patibulo.jpg",
    description: "Óleo de Pedro Alcántara Quijano, de 1944, que representa a Policarpa Salavarrieta camino a su ejecución, rodeada de soldados y de otras personas. Policarpa fue fusilada en Santafé el 14 de noviembre de 1817, durante la Reconquista.",
    funFact: "Quijano también pintó la Reyerta del 20 de julio de 1810, que está en la Tienda de Llorente.",
    game: { type: "mensajero", data: {
      item: "un mensaje para los patriotas",
      destination: "el campamento patriota",
      facts: [
        "Durante la Reconquista, Policarpa apoyó en secreto la causa patriota.",
        "Fue fusilada en Santafé el 14 de noviembre de 1817."
      ]
    } },
    questions: [
      { q: "¿Quién pintó la salida de Policarpa hacia el patíbulo?", options: ["Roberto Páramo Tirado", "Luis Ángel Rengifo", "Pedro Alcántara Quijano", "José María Espinosa"], answer: 2, explain: "Es un óleo de Pedro Alcántara Quijano, de 1944." },
      { q: "¿Durante qué periodo fue fusilada Policarpa?", options: ["La guerra civil de 1854", "La Gran Colombia", "El virreinato de Amar", "La Reconquista"], answer: 3, explain: "Fue fusilada en 1817, durante la Reconquista." }
    ]
  },
  {
    id: 21,
    slug: "ejecucion-de-antonia-santos",
    title: "Escena de la ejecución de Antonia Santos",
    author: "Luis Ángel Rengifo",
    date: "1950",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 3330",
    sala: 4,
    image: "./assets/artworks/ejecucion-de-antonia-santos.jpg",
    description: "Óleo de Luis Ángel Rengifo, de 1950, que representa la ejecución de la heroína Antonia Santos, fusilada en el Socorro en 1819. La escena muestra a soldados realistas, a la heroína y a otros condenados en una calle empedrada.",
    funFact: "Ese mismo año, 1819, el ejército patriota ganó la batalla de Boyacá.",
    game: { type: "linea", data: { events: [
      { year: "1810", text: "Grito del 20 de julio en Santafé" },
      { year: "1816", text: "La Reconquista: empiezan los fusilamientos de patriotas" },
      { year: "1817", text: "Fusilamiento de Policarpa Salavarrieta" },
      { year: "1819", text: "Ejecución de Antonia Santos en el Socorro" },
      { year: "1821", text: "Congreso de Cúcuta" }
    ] } },
    questions: [
      { q: "¿Dónde fue fusilada Antonia Santos?", options: ["En el Socorro", "En Santafé", "En Cartagena", "En Popayán"], answer: 0, explain: "Antonia Santos fue fusilada en el Socorro." },
      { q: "¿En qué año fue ejecutada Antonia Santos?", options: ["1810", "1816", "1819", "1854"], answer: 2, explain: "Fue fusilada en 1819." }
    ]
  },
  {
    id: 23,
    slug: "manuela-saenz",
    title: "Manuela Sáenz",
    author: "José María Espinosa",
    date: "1830",
    type: "Pintura",
    technique: "Acuarela",
    registro: "Reg. 580",
    sala: 4,
    image: "./assets/artworks/manuela-saenz.jpg",
    description: "Retrato en acuarela de Manuela Sáenz, compañera de Simón Bolívar, pintado por José María Espinosa en 1830. La muestra con vestido blanco, un manto rojo y un tocado en el cabello.",
    funFact: "Bolívar la llamó «Libertadora del Libertador» después de que ella lo ayudó a escapar de un atentado en Bogotá, en 1828.",
    game: { type: "galeria", data: { pairs: [
      { a: "img:23", b: "Manuela Sáenz" },
      { a: "img:34", b: "Simón Bolívar" },
      { a: "Libertadora del Libertador", b: "Así la llamó Bolívar" },
      { a: "José María Espinosa", b: "Pintó este retrato" },
      { a: "Acuarela", b: "Técnica del retrato" }
    ] } },
    questions: [
      { q: "¿De quién fue compañera Manuela Sáenz?", options: ["De Antonio Nariño", "De Francisco de Paula Santander", "De Simón Bolívar", "De José María Córdoba"], answer: 2, explain: "Manuela Sáenz fue compañera de Simón Bolívar." },
      { q: "¿Cómo la llamó Bolívar?", options: ["La Pola", "La India de la Libertad", "La Juana", "Libertadora del Libertador"], answer: 3, explain: "La llamó «Libertadora del Libertador»." },
      { q: "¿Con qué técnica está hecho el retrato?", options: ["Acuarela", "Óleo", "Esmalte", "Litografía"], answer: 0, explain: "Es un retrato en acuarela." }
    ]
  },
  {
    id: 31,
    slug: "bolivar-y-santander",
    title: "Bolívar y Santander",
    author: "Luis Antonio Cano",
    date: "1890",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 4038",
    sala: 4,
    image: "./assets/artworks/bolivar-y-santander.jpg",
    description: "Retrato doble de Simón Bolívar y Francisco de Paula Santander, obra de Luis Antonio Cano, de 1890. Los dos aparecen de pie, con uniformes militares de gala, junto a una cortina.",
    funFact: "En 1821 el Congreso de Cúcuta eligió a Bolívar presidente y a Santander vicepresidente de la República de Colombia.",
    game: { type: "linea", data: { events: [
      { year: "1816", text: "Reconquista española en Santafé" },
      { year: "1819", text: "Batalla de Boyacá, 7 de agosto" },
      { year: "1821", text: "Congreso de Cúcuta: Bolívar presidente, Santander vicepresidente" },
      { year: "1830", text: "Muere Simón Bolívar" },
      { year: "1840", text: "Muere Francisco de Paula Santander" }
    ] } },
    questions: [
      { q: "¿Qué cargo recibió Santander en el Congreso de Cúcuta de 1821?", options: ["Presidente", "Vicepresidente", "Virrey", "Alcalde de Bogotá"], answer: 1, explain: "Bolívar fue elegido presidente y Santander vicepresidente." },
      { q: "¿Qué batalla ocurrió el 7 de agosto de 1819?", options: ["Calibío", "Alto Palacé", "Boyacá", "Cartagena"], answer: 2, explain: "La batalla de Boyacá fue el 7 de agosto de 1819." }
    ]
  },
  {
    id: 34,
    slug: "simon-bolivar-esmalte",
    title: "Simón Bolívar",
    author: "Luis Felipe Uscátegui",
    date: "1938",
    type: "Esmalte",
    technique: "Esmalte vítreo",
    registro: "Reg. 4044",
    sala: 4,
    image: "./assets/artworks/simon-bolivar-esmalte.jpg",
    description: "Retrato de Simón Bolívar realizado en esmalte vítreo por Luis Felipe Uscátegui en 1938. Lo muestra de perfil, con uniforme rojo bordado en oro y charreteras doradas.",
    funFact: "Uscátegui también hizo en esmalte un retrato de Francisco José de Caldas, que está en la Capilla.",
    game: { type: "restaurador", data: { grid: 3 } },
    questions: [
      { q: "¿En qué material está hecho este retrato de Bolívar?", options: ["Acuarela", "Carboncillo", "Porcelana", "Esmalte vítreo"], answer: 3, explain: "Uscátegui lo hizo en esmalte vítreo." },
      { q: "¿Cómo aparece Bolívar en este retrato?", options: ["De perfil, con uniforme rojo bordado en oro", "De frente, a caballo", "De pie junto a Santander", "En su cama"], answer: 0, explain: "Aparece de perfil, con uniforme rojo bordado en oro." }
    ]
  },
  {
    id: 41,
    slug: "antonio-narino",
    title: "Antonio Nariño",
    author: "José María Espinosa (atribuido)",
    date: "1840",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 4",
    sala: 4,
    image: "./assets/artworks/antonio-narino.jpg",
    description: "Retrato del prócer Antonio Nariño atribuido a José María Espinosa. Nariño tradujo e imprimió los Derechos del Hombre y del Ciudadano, por lo que fue procesado en 1794. Más tarde presidió el Estado de Cundinamarca y dirigió la Campaña del Sur.",
    funFact: "Por haber difundido los Derechos del Hombre, a Nariño se le llama «el Precursor».",
    game: { type: "codigo", data: { message: "EL PRECURSOR", hint: "Así se le dice a Antonio Nariño." } },
    questions: [
      { q: "¿Cómo se le llama a Antonio Nariño?", options: ["El Libertador", "El Precursor", "El Sabio", "El Hombre de las Leyes"], answer: 1, explain: "A Nariño se le llama «el Precursor»." },
      { q: "¿Qué campaña militar dirigió Nariño?", options: ["La Campaña Libertadora de 1819", "La campaña de Cartagena", "La Campaña del Sur", "La campaña de 1854"], answer: 2, explain: "Nariño dirigió la Campaña del Sur." }
    ]
  },
  {
    id: 44,
    slug: "carmen-rodriguez-de-gaitan",
    title: "Carmen Rodríguez de Gaitán",
    author: "Ignacio Castillo Cervantes",
    date: "1900",
    type: "Pintura",
    technique: "Óleo",
    registro: "Reg. 69",
    sala: 4,
    image: "./assets/artworks/carmen-rodriguez-de-gaitan.jpg",
    description: "Retrato de Carmen Rodríguez de Gaitán (1777-1852), pintado por Ignacio Castillo Cervantes. Participó en el movimiento de independencia y durante la Reconquista de Pablo Morillo fue desterrada a Tocaima y condenada a muerte. Tras la victoria de Boyacá se levantaron los cargos en su contra.",
    funFact: "En el retrato lleva un gran cuello blanco de encaje sobre un vestido negro.",
    game: { type: "restaurador", data: { grid: 4 } },
    questions: [
      { q: "¿A dónde fue desterrada Carmen Rodríguez de Gaitán?", options: ["A Cartagena", "A Quito", "A España", "A Tocaima"], answer: 3, explain: "Fue desterrada a Tocaima durante la Reconquista." },
      { q: "¿Qué pasó con los cargos contra ella tras la victoria de Boyacá?", options: ["Se levantaron", "Fue fusilada", "Se duplicaron", "La enviaron a Madrid"], answer: 0, explain: "Tras la victoria de Boyacá se levantaron los cargos." }
    ]
  },

  // ───────────────────────────── SALA 5 · ARCHIVO ─────────────────────────────
  {
    id: 22,
    slug: "entrada-del-ejercito-republicano",
    title: "Entrada del ejército republicano al norte de Bogotá",
    author: "Martínez Hermanos",
    date: "Ca. 1854",
    type: "Litografía",
    technique: "Litografía sobre papel",
    registro: "Reg. 132",
    sala: 5,
    image: "./assets/artworks/entrada-del-ejercito-republicano.jpg",
    description: "Litografía de Martínez Hermanos que representa uno de los hechos de la guerra civil de 1854, con oficiales a caballo. Esa guerra empezó con el golpe de Estado del general José María Melo y terminó el 4 de diciembre de ese año.",
    funFact: "La ficha del museo la fecha en 1800, pero la escena corresponde a la guerra de 1854.",
    game: { type: "mensajero", data: {
      item: "un parte de guerra",
      destination: "el Ejército del Norte",
      facts: [
        "La guerra civil de 1854 empezó con el golpe de Estado del general José María Melo.",
        "La guerra terminó el 4 de diciembre de 1854."
      ]
    } },
    questions: [
      { q: "¿Quién dio el golpe de Estado que inició la guerra civil de 1854?", options: ["Antonio Nariño", "José María Melo", "Francisco de Paula Santander", "Pablo Morillo"], answer: 1, explain: "La guerra empezó con el golpe del general José María Melo." },
      { q: "¿En qué año ocurrió la guerra que representa esta litografía?", options: ["1810", "1819", "1854", "1887"], answer: 2, explain: "Representa la guerra civil de 1854." }
    ]
  },
  {
    id: 26,
    slug: "muerte-de-santander",
    title: "Muerte de Santander",
    author: "Marin Lavignet; impreso por Lemercier (París)",
    date: "Mediados del s. XIX",
    type: "Litografía",
    technique: "Litografía sobre papel",
    registro: "Reg. 139",
    sala: 5,
    image: "./assets/artworks/muerte-de-santander.jpg",
    description: "Litografía de Marin Lavignet, impresa por Lemercier en París, que representa la muerte del general Francisco de Paula Santander, rodeado de personas junto a su cama. En 1960 la obra pasó de la Academia Colombiana de Historia a la Casa del Florero.",
    funFact: "Santander murió en Bogotá en 1840.",
    game: { type: "linea", data: { events: [
      { year: "1819", text: "Batalla de Boyacá" },
      { year: "1821", text: "Santander es elegido vicepresidente en Cúcuta" },
      { year: "1832", text: "Santander asume la presidencia de la Nueva Granada" },
      { year: "1840", text: "Muere Santander en Bogotá" },
      { year: "1960", text: "La litografía llega a la Casa del Florero" }
    ] } },
    questions: [
      { q: "¿De qué institución pasó esta litografía a la Casa del Florero en 1960?", options: ["Del Banco de la República", "De la Biblioteca Nacional de París", "Del Palacio de Justicia", "De la Academia Colombiana de Historia"], answer: 3, explain: "En 1960 pasó de la Academia Colombiana de Historia." },
      { q: "¿En qué año murió Francisco de Paula Santander?", options: ["1819", "1830", "1840", "1854"], answer: 2, explain: "Santander murió en Bogotá en 1840." }
    ]
  },
  {
    id: 28,
    slug: "guillermo-hernandez-de-alba",
    title: "Guillermo Hernández de Alba",
    author: "Sin datos",
    date: "Sin datos",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Sin datos",
    sala: 5,
    image: "./assets/artworks/guillermo-hernandez-de-alba.jpg",
    description: "Retrato del historiador Guillermo Hernández de Alba, que asesoró la reconstrucción de la Casa del Florero como museo, inaugurado el 20 de julio de 1960. Aparece de traje y corbata roja, junto a estantes de libros y una ventana con plantas y una cúpula al fondo. La ficha del museo no publica el autor ni la fecha.",
    funFact: "La reconstrucción de la casa como museo se hizo por orden del presidente Alberto Lleras Camargo.",
    game: { type: "imprenta", data: {
      phrase: "CASA DEL FLORERO",
      facts: [
        "Hernández de Alba asesoró la reconstrucción de la casa como museo.",
        "El museo abrió sus puertas el 20 de julio de 1960."
      ]
    } },
    questions: [
      { q: "¿Qué hizo Guillermo Hernández de Alba por la Casa del Florero?", options: ["Pintó la Reyerta", "Asesoró su reconstrucción como museo", "Fabricó el florero", "Fotografió la fachada en 1949"], answer: 1, explain: "Asesoró la reconstrucción de la casa como museo." },
      { q: "¿En qué año abrió el museo?", options: ["1910", "1948", "1960", "2010"], answer: 2, explain: "Se inauguró el 20 de julio de 1960." },
      { q: "¿Qué presidente ordenó la reconstrucción de la casa?", options: ["Rafael Núñez", "José María Melo", "Francisco de Paula Santander", "Alberto Lleras Camargo"], answer: 3, explain: "Fue por orden del presidente Alberto Lleras Camargo." }
    ]
  },
  {
    id: 29,
    slug: "casa-museo-del-20-de-julio",
    title: "Casa museo del 20 de julio",
    author: "Pablo Emilio Achury",
    date: "1960",
    type: "Sin datos",
    technique: "Sin datos",
    registro: "Reg. 83",
    sala: 5,
    image: "./assets/artworks/casa-museo-del-20-de-julio.jpg",
    description: "Pablo Emilio Achury pintó la Casa Museo del 20 de Julio, hoy Museo de la Independencia Casa del Florero, en 1960, el año de su apertura. La casa aparece con balcones verdes y techos de teja, rodeada de gente y con los cerros de Bogotá al fondo.",
    funFact: "El museo fue renovado por completo en 2010, para el Bicentenario de la Independencia.",
    game: { type: "linea", data: { events: [
      { year: "1810", text: "La disputa por el florero en la tienda de Llorente" },
      { year: "1948", text: "La casa queda muy deteriorada tras el 9 de abril" },
      { year: "1949", text: "Fotografía de la fachada antes de la reconstrucción" },
      { year: "1960", text: "Abre la Casa Museo del 20 de Julio" },
      { year: "2010", text: "Renovación total para el Bicentenario" }
    ] } },
    questions: [
      { q: "¿En qué año abrió la Casa Museo del 20 de Julio?", options: ["1810", "1910", "1960", "2010"], answer: 2, explain: "Abrió en 1960, el año en que Achury la pintó." },
      { q: "¿Por qué se renovó el museo en 2010?", options: ["Por un incendio", "Por el Bicentenario de la Independencia", "Para cambiarlo de ciudad", "Por la llegada del Himno"], answer: 1, explain: "Se renovó por completo para el Bicentenario." }
    ]
  },
  {
    id: 30,
    slug: "fotografia-del-frente-de-la-casa-del-florero",
    title: "Fotografía del frente de la Casa del Florero",
    author: "Autor desconocido",
    date: "1949",
    type: "Fotografía",
    technique: "Sin datos",
    registro: "Reg. 3047",
    sala: 5,
    image: "./assets/artworks/fotografia-del-frente-de-la-casa-del-florero.jpg",
    description: "Fotografía en blanco y negro de la fachada de la Casa del Florero en 1949, poco después de los daños del 9 de abril de 1948 y antes de su reconstrucción como museo. Se ven el balcón de madera de la casa y personas que pasan por la calle.",
    funFact: "La casa está en la esquina de la carrera Séptima con calle 11, frente a la plaza de Bolívar.",
    game: { type: "restaurador", data: { grid: 4 } },
    questions: [
      { q: "¿Qué hecho dejó muy deteriorada la Casa del Florero?", options: ["El terremoto de 1785", "La guerra civil de 1854", "Los hechos del 9 de abril de 1948", "El incendio de 1900"], answer: 2, explain: "La casa quedó muy deteriorada tras el 9 de abril de 1948." },
      { q: "¿Qué tipo de obra es esta pieza de 1949?", options: ["Una pintura al óleo", "Una litografía", "Un dibujo al carboncillo", "Una fotografía"], answer: 3, explain: "Es una fotografía en blanco y negro." }
    ]
  },
  {
    id: 39,
    slug: "plomada-sobre-carbon-palacio-de-justicia",
    title: "Plomada sobre carbón del Palacio de Justicia de Colombia",
    author: "Omar Alonso García Martínez",
    date: "2015",
    type: "Obra contemporánea",
    technique: "Carbón y concreto",
    registro: "Reg. 1106",
    sala: 5,
    image: "./assets/artworks/plomada-sobre-carbon-palacio-de-justicia.jpg",
    description: "Obra contemporánea de Omar Alonso García Martínez, de 2015, hecha con carbón y concreto. Reconstruye la fachada anterior del Palacio de Justicia de Bogotá, destruida durante la toma del 6 y 7 de noviembre de 1985. Es una pieza de memoria histórica dentro de una colección dedicada a la Independencia.",
    funFact: "Es la obra más reciente de las 50 de este recorrido.",
    game: { type: "codigo", data: { message: "PALACIO DE JUSTICIA", hint: "Edificio cuya fachada reconstruye esta obra." } },
    questions: [
      { q: "¿Con qué materiales está hecha esta obra?", options: ["Carbón y concreto", "Óleo y lienzo", "Porcelana", "Madera y pan de oro"], answer: 0, explain: "Está hecha con carbón y concreto." },
      { q: "¿Qué hecho recuerda esta obra?", options: ["La batalla de Boyacá", "La toma del Palacio de Justicia en 1985", "El 9 de abril de 1948", "La guerra civil de 1854"], answer: 1, explain: "Reconstruye la fachada destruida en la toma del 6 y 7 de noviembre de 1985." }
    ]
  },
  {
    id: 46,
    slug: "francisco-jose-de-caldas-juliana-caldas",
    title: "Francisco José de Caldas (Juliana Caldas)",
    author: "Juliana Caldas",
    date: "Mediados del s. XIX",
    type: "Dibujo",
    technique: "Carboncillo",
    registro: "Reg. 3357",
    sala: 5,
    image: "./assets/artworks/francisco-jose-de-caldas-juliana-caldas.jpg",
    description: "Retrato al carboncillo de Francisco José de Caldas hecho por su hija Juliana a mediados del siglo XIX. Muestra a un hombre delgado, de tez clara y con ojeras, rasgos que se asocian a la malaria que padeció en 1803.",
    funFact: "Caldas fue fusilado en Santafé en 1816, durante la Reconquista.",
    game: { type: "galeria", data: { pairs: [
      { a: "img:46", b: "Caldas al carboncillo, por su hija" },
      { a: "img:35", b: "Caldas en esmalte, por Uscátegui" },
      { a: "img:40", b: "José Celestino Mutis" },
      { a: "img:41", b: "Antonio Nariño" },
      { a: "img:45", b: "Jorge Tadeo Lozano" }
    ] } },
    questions: [
      { q: "¿Quién dibujó este retrato de Caldas?", options: ["Luis Felipe Uscátegui", "Salvador Rizo Blanco", "Su hija Juliana", "José María Espinosa"], answer: 2, explain: "Lo hizo su hija, Juliana Caldas." },
      { q: "¿Con qué técnica está hecho?", options: ["Óleo", "Esmalte", "Acuarela", "Carboncillo"], answer: 3, explain: "Es un retrato al carboncillo." },
      { q: "¿Con qué enfermedad se asocian las ojeras de Caldas en el retrato?", options: ["Malaria", "Viruela", "Gripa", "Fiebre amarilla"], answer: 0, explain: "Se asocian a la malaria que padeció en 1803." }
    ]
  },
  {
    id: 47,
    slug: "capitulacion-de-cartagena",
    title: "Capitulación de Cartagena",
    author: "C. M. Gill",
    date: "1800",
    type: "Litografía",
    technique: "Litografía sobre papel periódico",
    registro: "Reg. 379",
    sala: 5,
    image: "./assets/artworks/capitulacion-de-cartagena.jpg",
    description: "Litografía de C. M. Gill, impresa sobre papel periódico, que recrea la batalla librada en el puerto de Cartagena entre 1820 y 1821, con cañones, balas, espadas y hachas. En el centro tiene un texto conmemorativo de la capitulación, rodeado de cuatro retratos en medallones; la ficha la fecha en 1800, aunque los hechos son de 1820 y 1821.",
    funFact: "Con la capitulación de 1821, Cartagena quedó en manos de los patriotas.",
    game: { type: "imprenta", data: {
      phrase: "CAPITULACION DE CARTAGENA",
      facts: [
        "La batalla en el puerto de Cartagena se libró entre 1820 y 1821.",
        "La litografía está impresa sobre papel periódico."
      ]
    } },
    questions: [
      { q: "¿Sobre qué tipo de papel está impresa esta litografía?", options: ["Pergamino", "Papel periódico", "Papel moneda", "Cartón"], answer: 1, explain: "Es una litografía sobre papel periódico." },
      { q: "¿Entre qué años se libró la batalla en el puerto de Cartagena?", options: ["1781 y 1782", "1810 y 1811", "1820 y 1821", "1853 y 1854"], answer: 2, explain: "Se libró entre 1820 y 1821." }
    ]
  },
  {
    id: 49,
    slug: "billete-de-manumision",
    title: "Billete de manumisión",
    author: "Gobierno de la Nueva Granada",
    date: "1853",
    type: "Documento",
    technique: "Sin datos",
    registro: "Reg. 3446",
    sala: 5,
    image: "./assets/artworks/billete-de-manumision.jpg",
    description: "Billete expedido el 27 de junio de 1853 por la Junta de Manumisión a los propietarios de personas esclavizadas que quedaban libres. Indicaba la región de las personas liberadas y su valor, que la nación asumía y reconocía. No era dinero para el comercio diario.",
    funFact: "La ley del 21 de mayo de 1851 abolió la esclavitud en la Nueva Granada; la libertad se hizo efectiva el 1 de enero de 1852.",
    game: { type: "mensajero", data: {
      item: "el billete de manumisión",
      destination: "la Junta de Manumisión",
      facts: [
        "La ley de 1851 abolió la esclavitud en la Nueva Granada.",
        "Este billete se expidió el 27 de junio de 1853."
      ]
    } },
    questions: [
      { q: "¿Quién expedía los billetes de manumisión?", options: ["El virrey", "El Banco de la República", "La Real Audiencia", "La Junta de Manumisión"], answer: 3, explain: "Los expedía la Junta de Manumisión." },
      { q: "¿En qué año se abolió la esclavitud en la Nueva Granada?", options: ["1810", "1821", "1851", "1887"], answer: 2, explain: "La ley de abolición es del 21 de mayo de 1851." },
      { q: "¿Quién asumía el valor indicado en el billete?", options: ["Las personas liberadas", "La nación", "La Iglesia", "Los comerciantes españoles"], answer: 1, explain: "La nación asumía y reconocía ese valor." }
    ]
  },
  {
    id: 50,
    slug: "himno-nacional-partitura",
    title: "Himno Nacional de la República de Colombia",
    author: "Oreste Síndici (música) y Rafael Núñez (letra)",
    date: "1887",
    type: "Partitura",
    technique: "Sin datos",
    registro: "Reg. 3292",
    sala: 5,
    image: "./assets/artworks/himno-nacional-partitura.jpg",
    description: "Partitura manuscrita del Himno Nacional, compuesto por Oreste Sindici sobre la letra que Rafael Núñez había escrito para conmemorar la independencia de Cartagena. La versión original, más extensa que la actual, tenía coro, tres estrofas y final, y duraba unos ocho minutos.",
    funFact: "El Himno fue adoptado oficialmente como himno nacional por la Ley 33 de 1920.",
    game: { type: "imprenta", data: {
      phrase: "OH GLORIA INMARCESIBLE",
      facts: [
        "La música es de Oreste Sindici y la letra de Rafael Núñez.",
        "Núñez escribió la letra para conmemorar la independencia de Cartagena."
      ]
    } },
    questions: [
      { q: "¿Quién compuso la música del Himno Nacional?", options: ["Rafael Núñez", "Luis A. Calvo", "Oreste Sindici", "Pedro Morales Pino"], answer: 2, explain: "La música es de Oreste Sindici; la letra, de Rafael Núñez." },
      { q: "¿Para qué escribió Rafael Núñez la letra?", options: ["Para la batalla de Boyacá", "Para el Bicentenario", "Para la apertura del museo", "Para conmemorar la independencia de Cartagena"], answer: 3, explain: "La escribió para conmemorar la independencia de Cartagena." },
      { q: "¿Cuánto duraba la versión original del Himno?", options: ["Unos ocho minutos", "Un minuto", "Media hora", "Una hora"], answer: 0, explain: "La versión original duraba unos ocho minutos." }
    ]
  }
];
