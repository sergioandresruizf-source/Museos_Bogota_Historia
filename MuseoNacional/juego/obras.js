window.MUSEO = {

  titulo: "ISLAS DE LA CONTRARREVOLUCIÓN",
  subtitulo: "Recorre el Museo Nacional y recupera lo que fue removido",

  config: {
    exigirVerTodas: true,
    exigirVerTodasEnCalavera: true,
    velocidadBarco: 200,
    velocidadCorrer: 1.8,
    museoId: "nacional",
    urlSiguienteMuseo: "",
    huecoMuestraDescripcion: false,
    puzzlesOmitibles: true,
    puzzleOmitirSeg: 1,
    autoDescubrir: true,
    descripcionAuto: "Descripción pendiente: agrega esta obra en obras.js para ponerle título y texto.",
    atajos: false
  },

  musica: {
    volumen: 0.5,
    navegacion: "musica/navegacion.mp3",
    titulo: "",
    calavera: "musica/calavera.mp3",
    cinematica: "musica/cinematica.mp3"
  },

  orfebreria: [
    { id: "poporo", titulo: "Poporo Quimbaya", descripcion: "Pieza emblemática de orfebrería prehispánica utilizada para el mambeo de hoja de coca." },
    { id: "balsa", titulo: "Balsa Muisca", descripcion: "Representación en oro del ritual de El Dorado en la laguna de Guatavita." },
    { id: "tunjo", titulo: "Tunjo Antropomorfo", descripcion: "Figura votiva utilizada como ofrenda por los muiscas en lagunas y santuarios." },
    { id: "pectoral", titulo: "Pectoral Calima", descripcion: "Ornamento corporal de oro martillado con representaciones zoomorfas y geométricas." },
    { id: "diadema", titulo: "Diadema Zenú", descripcion: "Lámina de oro repujada para tocados ceremoniales de dignatarios." },
    { id: "nariguera", titulo: "Nariguera Quimbaya", descripcion: "Pieza de orfebrería fina que adorna el tabique nasal en rituales de rango." }
  ],

  textos: {
    botellaTitulo: "Una botella a la deriva",
    botellaMensaje: "Capitán: el oro de estas tierras zarpa hoy rumbo a España, bajo bandera de la Corona. Quien lo siga encontrará, en el Museo del Oro, la historia de lo que el mar no pudo devolver.\n\n— Un amigo del archivo",
    oroFinal: "El oro cruza el océano… pero la persecución continúa en el Museo del Oro.",
    nieblaBloqueada: "Una espesa niebla bloquea el paso a la Isla Calavera…",
    nieblaSeDisipa: "¡La niebla se disipa! La Isla Calavera ya es accesible.",
    cineInicio: "Las obras removidas vuelven a casa…",
    finalTitulo: "¡La contrarrevolución está completa!",
    finalTexto: "Cada obra removida regresó a su sala y la bandera de la revolución ondea en todas las islas. El museo es de quienes lo habitan."
  },

  calavera: {
    nombre: "Isla Calavera",
    descripcion: "Aquí se guardan todas las obras que fueron removidas el 15 de octubre de 2026 y restituidas tras orden judicial."
  },

  islas: [
    {
      nombre: "Sala 1 · La historia del museo",
      musica: "musica/isla1.mp3",
      obras: [
        {
          tipo: "escultura",
          titulo: "Aerolito de Santa Rosa de Viterbo",
          autor: "Objeto natural (hallado por Cecilia Corredor)",
          fecha: "Hallado en 1810; adquirido en 1823",
          descripcion: "Primera pieza de la colección fundacional del Museo Nacional. Hallado por Cecilia Corredor en la colina de Tocavita (Boyacá) en 1810 y adquirido en 1823 por los científicos Mariano Eduardo de Rivero y Jean-Baptiste Boussingault cuando se dirigían a Bogotá a fundar el museo.",
          reflexion: "El museo empezó con una roca caída del cielo y no con un cuadro o un documento, recordando que sus orígenes están en la ciencia y la historia natural antes que en la historia política de la nación.",
          imagen: "obras/estatuaIsla1.jpg",
          alto: 48,
          pixelado: false,
          removida: false
        },
        {
          titulo: "Tumba de Justus Wolfram Schottelius",
          autor: "Justus Wolfram Schottelius (trasladado por Luis Duque Gómez)",
          fecha: "1948 (reinhumación; arqueólogo: 1892–1941)",
          descripcion: "Lápida y sepultura del arqueólogo y antropólogo alemán Justus Wolfram Schottelius, quien huyó de la Alemania nazi por la ascendencia judía de su esposa y llegó a Colombia en 1938. Introdujo estudios estratigráficos e investigó en Santander; sus restos fueron trasladados al museo el 9 de abril de 1948.",
          reflexion: "Un exiliado acaba enterrado dentro del museo al que ayudó a darle forma: la ciencia también la construyen personas que huyen de la persecución y merecen memoria.",
          imagen: "obras/isla1_obra2.jpg",
          removida: false
        },
        {
          titulo: "Paso de la montaña de Barruecos (sic) (Colombia), efectuado por el Sr. de Rivero en 1823",
          autor: "Mariano Eduardo de Rivero y Ustáriz (atribuido)",
          fecha: "Viaje en 1823 / Litografía ca. 1857",
          descripcion: "Litografía sobre papel que registra el tránsito científico entre Popayán y Pasto realizado por el ingeniero de minas Mariano Eduardo de Rivero tras dirigir el Museo y la Escuela de Minas.",
          reflexion: "Muestra cómo se hacía la ciencia en la Colombia recién independizada: caminando, dibujando y recogiendo datos, aunque invisibiliza a quienes abrían trocha y cargaban el equipaje.",
          imagen: "obras/isla1_obra3.jpg",
          removida: false
        },
        {
          titulo: "El niño de la mariposa",
          autor: "Atribuido a Antonio Canova (1757–1822)",
          fecha: "Hacia 1790",
          descripcion: "Escultura neoclásica tallada en mármol de un niño dormido, donada por la Fundación Beatriz Osorio (creada en 1948 para fomentar los museos nacionales) junto con otros 219 objetos históricos y artísticos.",
          reflexion: "El sueño del niño y la mariposa —símbolo clásico del alma— transmiten calma y fragilidad, reflejando el coleccionismo y los gustos de las élites del siglo XX.",
          imagen: "obras/isla1_obra4.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Sala 2 · Tierra de historias",
      musica: "musica/isla2.mp3",
      obras: [
        {
          titulo: "Figura ceremonial con forma humana (tunjo)",
          autor: "Sociedades de la región arqueológica muisca (anónimo)",
          fecha: "600–1600 d. C.",
          descripcion: "Figura votiva pequeña elaborada en metal por las sociedades muiscas del altiplano cundiboyacense para ser depositada como ofrenda en sitios sagrados como lagunas y cuevas.",
          reflexion: "Pensada para entregarse a una laguna o espíritu, evidencia que ofrecer algo valioso era una forma de mantener el equilibrio espiritual con el territorio.",
          imagen: "obras/isla2_obra1.jpg",
          removida: false
        },
        {
          titulo: "Ofrendatario representante del poder",
          autor: "Sociedades de la región arqueológica muisca (anónimo)",
          fecha: "1000–1600 d. C.",
          descripcion: "Pieza cerámica del altiplano cundiboyacense que representa caciques asentados en sus cercados portando bastones de mando y sombreros adornados con cuentas de piedra y caracoles marinos.",
          reflexion: "El poder se expresaba mediante objetos, postura y redes de comercio a larga distancia —evidenciadas en los caracoles marinos— más que solo por la fuerza.",
          imagen: "obras/isla2_obra2.jpg",
          removida: false
        },
        {
          titulo: "Figura antropozoomorfa representante del poder",
          autor: "Sociedades de la región arqueológica Tumaco - La Tolita (Nariño)",
          fecha: "700 a. C. – 350 d. C.",
          descripcion: "Cerámica prehispánica que esquematiza un personaje en posición de combate con lanza, escudo y rasgos de jaguar, ejemplificando el poder simbólico y militar personificado en el chamán.",
          reflexion: "La fusión entre humano y jaguar expresa una cosmovisión donde el guerrero, el chamán, el animal y los ancestros forman una misma unidad de poder vital.",
          imagen: "obras/isla2_obra3.jpg",
          removida: false
        },
        {
          titulo: "Estatua figura antropomorfa",
          autor: "Sociedades del Alto Magdalena, San Agustín (Huila)",
          fecha: "1–900 d. C. (Período Clásico Regional)",
          descripcion: "Escultura monumental tallada y pulida en roca basáltica que representaba el poder espiritual e ideológico de los jefes de extensos clanes en el macizo colombiano.",
          reflexion: "La piedra volcánica volvía permanente la autoridad de quien gobernaba, trascendiendo al individuo para convertirse en memoria colectiva milenaria.",
          imagen: "obras/isla2_obra4.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Sala 3 · Memoria en movimiento",
      musica: "musica/isla3.mp3",
      obras: [
        {
          titulo: "Homenaje a un estudiante",
          autor: "Luis Ángel Rengifo Muñoz (1906–1986)",
          fecha: "1965",
          descripcion: "Acrilografía grabada con líneas ásperas que muestra un cadáver anónimo y silencioso, creada en memoria de Uriel Gutiérrez Restrepo y los estudiantes abatidos por la fuerza pública el 8 y 9 de junio de 1954.",
          reflexion: "El cadáver sin rostro simboliza a todos los estudiantes caídos en protestas y denuncia una violencia estatal que permaneció impune bajo el Frente Nacional.",
          imagen: "obras/isla3_obra1.jpg",
          removida: false
        },
        {
          titulo: "Máquina de escribir incinerada en la toma del Palacio de Justicia",
          autor: "Remington (donada por José Antonio Salazar Cruz)",
          fecha: "Hacia 1985",
          descripcion: "Máquina de escribir quemada durante la toma y retoma del Palacio de Justicia del 6 de noviembre de 1985, exhibida junto a una greca de cafetería abaleada y fotografía del operativo.",
          reflexion: "Un objeto cotidiano de oficina transformado en vestigio físico de la violencia recuerda a los trabajadores, magistrados y desaparecidos más allá de las cifras.",
          imagen: "obras/isla3_obra2.jpg",
          removida: false
        },
        {
          titulo: "Copia de la Declaración de Benidorm y Pacto de Sitges",
          autor: "Alberto Lleras Camargo y Laureano Gómez Castro",
          fecha: "24 de julio de 1956 / 1957",
          descripcion: "Documentos mecanografiados y manuscritos firmados por los jefes de los partidos Liberal y Conservador para poner fin al gobierno de Gustavo Rojas Pinilla y dar origen al Frente Nacional (1958–1974).",
          reflexion: "Muestra cómo dos rivales políticos pactaron por necesidad común, pero cerraron la participación a otras fuerzas políticas mediante un acuerdo exclusivo de élites.",
          imagen: "obras/isla3_obra3.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Isla 4 · Memoria y nación",
      musica: "musica/isla4.mp3",
      obras: [
        {
          titulo: "Vía crucis",
          autor: "Carlos Correa / Taller de grabado La Estampa",
          fecha: "Hacia 1953",
          registro: "Registro 5757",
          descripcion: "Grabado en aguafuerte, punta seca y buril (38 × 56 cm) que retoma el tema religioso del camino a la cruz con figuras amontonadas y en tensión, leído en el contexto de La Violencia de los años cincuenta. Retirado el 15 de octubre de 2026 y restituido tras orden judicial.",
          reflexion: "Traslada el sufrimiento de Cristo al lenguaje gráfico para representar el dolor colectivo de un país atravesado por la violencia bipartidista.",
          imagen: "obras/isla4_obra1.png",
          removida: true
        },
        {
          titulo: "Libertinaje y desorden",
          autor: "Carlos Correa / Taller de grabado La Estampa",
          fecha: "Hacia 1960",
          registro: "Registro 5777",
          descripcion: "Grabado en aguafuerte, punta seca y buril (38 × 56 cm) con figuras esqueléticas y gorra militar alrededor de un estandarte con la inscripción 'Libertinaje y desorden', ironizando el discurso autoritario contra la protesta. Retirado el 15 de octubre de 2026.",
          reflexion: "Las calaveras en torno al lema convierten la retórica oficial del 'orden' en una imagen de muerte y cuestionan quién define qué es el desorden.",
          imagen: "obras/isla4_obra2.png",
          removida: true
        },
        {
          titulo: "La cosecha de los violentos",
          autor: "Alfonso Quijano Acero",
          fecha: "1968",
          registro: "Registro 7243",
          descripcion: "Xilografía iluminada (65 × 93,5 cm) que muestra un árbol enorme bajo el cual reposan hileras ordenadas de cuerpos tendidos en camillas cubiertos con mantas de colores. Retirada el 15 de octubre de 2026.",
          reflexion: "Convierte la violencia en una cosecha sembrada y recogida, señalando cómo las muertes sistemáticas terminan normalizadas como cifras.",
          imagen: "obras/isla4_obra3.png",
          removida: true
        },
        {
          titulo: "La nueva bandera colombiana y sus autores",
          autor: "Augusto Rendón Sierra",
          fecha: "1972",
          registro: "Registro 5861",
          descripcion: "Aguafuerte (74,5 × 70,5 cm) que representa la bandera de Colombia como un telón rojo acompañado de cuadros con rostros dibujados y recortes superpuestos. Retirado el 15 de octubre de 2026.",
          reflexion: "Al hablar de 'sus autores', desmitifica los símbolos patrios como construcciones políticas abiertas al escrutinio crítico y no como dogmas intocables.",
          imagen: "obras/isla4_obra4.jpeg",
          removida: true
        },
        {
          titulo: "La muerte de un desconocido",
          autor: "Pedro Alcántara Herrán Martínez",
          fecha: "1973",
          registro: "Registro 6704",
          descripcion: "Dibujo en grafito sobre papel (73,3 × 51,8 cm) que retrata una figura oscura, caída o recostada, con el rostro desdibujado entre sombras profundas. Retirado el 15 de octubre de 2026.",
          reflexion: "Rinde homenaje silencioso a las víctimas anónimas de la violencia cuyas historias nunca llegan a los libros oficiales.",
          imagen: "obras/isla4_obra5.jpeg",
          removida: true
        },
        {
          titulo: "Cañón usado durante la Guerra de los Mil Días",
          autor: "Fabricación francesa (remitido por el Ministerio de Guerra en 1958)",
          fecha: "1897",
          descripcion: "Pieza de artillería en hierro, acero forjado y madera tallada utilizada en la Guerra de los Mil Días (1899–1902), conflicto entre liberales y conservadores que dejó cerca de cien mil muertos y precedió la separación de Panamá.",
          reflexion: "Recuerda que las guerras civiles colombianas se libraron con armamento importado y dejaron heridas profundas al iniciar el siglo XX.",
          imagen: "obras/isla4_obra6.jpg",
          removida: false
        },
        {
          titulo: "San Sebastián en las trincheras",
          autor: "Ignacio Gómez Jaramillo (1910–1970)",
          fecha: "Abril de 1957",
          descripcion: "Óleo sobre tela que reinterpreta el martirio de San Sebastián en un paisaje desolado cercado por estacas, trincheras y alambre de púas como crítica a la Violencia de los años cincuenta.",
          reflexion: "Traslada la guerra al cuerpo del mártir cristiano como símbolo de las víctimas civiles atrapadas en el conflicto bipartidista.",
          imagen: "obras/isla4_obra7.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Sala 5 · Ser territorio",
      musica: "musica/isla5.mp3",
      obras: [
        {
          titulo: "Copas rituales de varias regiones arqueológicas",
          autor: "Sociedades tairona, quimbaya, de Nariño, del Cauca y muisca",
          fecha: "700–1600 d. C.",
          descripcion: "Conjunto de copas ceremoniales de cerámica empleadas en celebraciones sociales y rituales para compartir alimentos y bebidas fermentadas entre parientes y vecinos.",
          reflexion: "Demuestra que compartir la bebida y el alimento alrededor de objetos ceremoniales tejía lazos comunitarios en diversas regiones del territorio.",
          imagen: "obras/isla5_obra1.jpg",
          removida: false
        },
        {
          titulo: "Cuenco, alcarraza, olla y múcuras de vasijas rituales",
          autor: "Sociedades quimbaya (Cauca Medio) y muisca (altiplano cundiboyacense)",
          fecha: "200–1600 d. C.",
          descripcion: "Recipientes cerámicos ricamente decorados, incluyendo alcarrazas de doble vertedera y asa de estribo destinados a contener bebidas fermentadas especiales en ceremonias.",
          reflexion: "La forma y el acabado de cada vasija revelan la importancia social y ritual otorgada a la hospitalidad y las celebraciones colectivas.",
          imagen: "obras/isla5_obra2.jpg",
          removida: false
        },
        {
          titulo: "Urna funeraria",
          autor: "Sociedades de la región arqueológica Calima (Valle del Cauca)",
          fecha: "650–1600 d. C.",
          descripcion: "Vasija funeraria de cerámica donde se depositaban los restos óseos exhumados en una segunda ceremonia de la muerte, simbolizando el útero materno y la morada de los ancestros.",
          reflexion: "Para estas sociedades la muerte no era un final definitivo sino un regreso al origen, preservando la memoria colectiva de la familia.",
          imagen: "obras/isla5_obra3.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Isla 6 · Hacer sociedad",
      musica: "musica/isla6.mp3",
      obras: [
        {
          titulo: "Marcha de la ciudadanía plena LGBT: Por una Colombia incluyente",
          autor: "Germán Humberto Rincón Perfetti",
          fecha: "2004",
          registro: "Registro 8142",
          descripcion: "Fotografía en color (copia digital en sala) de una movilización pacífica por los derechos de la población LGBT en Bogotá con banderas y pancartas. Retirada el 15 de octubre de 2026.",
          reflexion: "Evidencia que el reconocimiento de los derechos LGBT en Colombia se conquistó en las calles mediante la movilización ciudadana y no solo en los tribunales.",
          imagen: "obras/isla6_obra1.png",
          removida: true
        },
        {
          tipo: "escultura",
          titulo: "Bolígrafo de la firma del primer Acuerdo de Paz con las FARC",
          autor: "Fabricación industrial",
          fecha: "2016 (Ingreso 9387)",
          descripcion: "Bolígrafo histórico (13,6 × 1,5 cm) asociado a la firma del Acuerdo de Paz entre el Gobierno colombiano y las FARC. Retirado el 15 de octubre de 2026 tras declaraciones oficiales contra la exhibición de objetos vinculados a grupos armados.",
          reflexion: "Un objeto cotidiano convertido en testigo de un intento histórico por cerrar décadas de conflicto armado; retirarlo borra un hecho reciente del relato nacional.",
          imagen: "obras/estatuaIsla6.png",
          alto: 48,
          pixelado: false,
          removida: true
        },
        {
          titulo: "La séptima papeleta",
          autor: "Movimiento estudiantil y ciudadano (autor no precisado)",
          fecha: "1990",
          descripcion: "Facsímil de la papeleta ciudadana que circuló en las elecciones de marzo de 1990 para convocar una Asamblea Nacional Constituyente, impulsando la Constitución de 1991. Retirada el 15 de octubre de 2026.",
          reflexion: "Un pedazo de papel promovido por estudiantes demostró cómo la participación ciudadana pacífica puede transformar la Carta Política de un país.",
          imagen: "obras/isla6_obra2.png",
          removida: true
        },
        {
          titulo: "Afiche de homenaje a Carlos Pizarro",
          autor: "Centro de Memoria, Paz y Reconciliación",
          fecha: "2010",
          registro: "Registro 7434",
          descripcion: "Impreso en tinta sobre papel (9,4 × 49 cm) que rememora la candidatura presidencial de Carlos Pizarro Leongómez tras la desmovilización del M-19 en 1990 y antes de su asesinato el 26 de abril de ese año. Retirado el 15 de octubre de 2026.",
          reflexion: "Condensa el tránsito de las armas a la democracia y el alto costo humano de los procesos de paz y reconciliación en Colombia.",
          imagen: "obras/isla6_obra3.png",
          removida: true
        },
        {
          titulo: "Ideales feministas",
          autor: "Lucila Rubio de Laverde",
          fecha: "9 de abril de 1950",
          registro: "Registro 6824",
          descripcion: "Libro impreso de tapas rojas y lomo jaspeado (16 × 12,2 × 2 cm) fundamental en la historia del feminismo colombiano, publicado cuatro años antes de aprobarse el voto femenino. Retirado el 15 de octubre de 2026.",
          reflexion: "Recuerda que las mujeres colombianas ya debatían y exigían sus derechos civiles y políticos a mediados del siglo XX.",
          imagen: "obras/isla6_obra4.png",
          removida: true
        },
        {
          titulo: "Bandera del orgullo gay de Elizabeth Castillo",
          autor: "Fabricante desconocido (perteneció a Elizabeth Castillo)",
          fecha: "2010",
          registro: "Registro 8153",
          descripcion: "Bandera textil de rayón con los colores del arcoíris (30 × 66 cm) perteneciente a la activista Elizabeth Castillo, referente de la defensa de derechos de familias diversas y mujeres lesbianas. Retirada el 15 de octubre de 2026.",
          reflexion: "El paso de un emblema de movilización callejera a pieza de museo muestra la lucha por la visibilidad y la memoria de la comunidad LGBT.",
          imagen: "obras/isla6_obra5.png",
          removida: true
        },
        {
          titulo: "Cartas desde la cárcel",
          autor: "Diana Navarro",
          fecha: "2002",
          registro: "Registro 8184",
          descripcion: "Documento manuscrito en hoja de cuaderno (28 × 21 cm) vinculado a la memoria, resistencia y derechos de las personas trans en situación de reclusión. Retirado el 15 de octubre de 2026.",
          reflexion: "Un testimonio escrito de puño y letra que aporta al museo la voz directa, sin intermediarios, de una mujer trans privada de la libertad.",
          imagen: "obras/isla6_obra6.jpg",
          removida: true
        },
        {
          titulo: "Platea",
          autor: "Miguel Ángel Rojas",
          fecha: "1973",
          registro: "Registro 5798",
          descripcion: "Aguafuerte (70 × 99,5 cm) de atmósfera oscura y manchas de tinta vinculado a experiencias homoeróticas y de diversidad sexual en espacios clandestinos. Retirado el 15 de octubre de 2026.",
          reflexion: "Las sombras sugieren los espacios ocultos a los que fue relegada la disidencia sexual cuando no tenía cabida en la esfera pública.",
          imagen: "obras/isla6_obra7.jpg",
          removida: true
        },
        {
          titulo: "Zapatos diseñados para mujer trans (Proyecto Lafarota)",
          autor: "Diego Rubiano, Mayté Machado y Red Comunitaria Trans",
          fecha: "2016",
          registro: "Registro 8169",
          descripcion: "Par de zapatos de colores elaborados a medida en cuero sintético y PVC cosidos a máquina (9 × 10 × 28 cm) en trabajo colaborativo con la Red Comunitaria Trans. Retirado el 15 de octubre de 2026.",
          reflexion: "El diseño hecho a la medida para cuerpos históricamente excluidos por el mercado se convierte en un acto de dignidad y reconocimiento social.",
          imagen: "obras/isla6_obra8.jpg",
          removida: true
        }
      ]
    },
    {
      nombre: "Sala 7 · Conexiones",
      musica: "musica/isla7.mp3",
      obras: [
        {
          titulo: "Acta de Independencia de la Provincia de Cartagena en la Nueva Granada (copia)",
          autor: "Diputados del Colegio Constituyente y Junta de la Provincia de Cartagena",
          fecha: "11 de noviembre de 1811",
          descripcion: "Copia impresa del documento mediante el cual Cartagena declaró su independencia absoluta de España, difundido para articular la ruptura con la Corona y reprimido durante la Reconquista de 1815–1816.",
          reflexion: "Refleja el paso político de la élite criolla hacia la independencia escrita, aunque invisibiliza el papel decisivo de los artesanos y pardos de Getsemaní liderados por Pedro Romero.",
          imagen: "obras/isla7_obra1.jpg",
          removida: false
        },
        {
          titulo: "Placas y bajorrelieves del pedestal original de la estatua de Francisco de Paula Santander",
          autor: "Pietro Costa / Mario Lambardi (atribuido)",
          fecha: "1878 (remitidos al museo en 1963)",
          descripcion: "Placas de mármol del pedestal instalado en el Parque Santander de Bogotá, monumento que sufrió ataques a finales del siglo XIX debido a la rivalidad política entre bolivarianos y santanderistas.",
          reflexion: "Un monumento es una postura esculpida en piedra sobre quién merece ser recordado; estas placas demuestran que la memoria patria fue campo de disputa política.",
          imagen: "obras/isla7_obra2.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Sala 8 · Tierra como recurso",
      musica: "musica/isla8.mp3",
      obras: [
        {
          titulo: "Minería",
          autor: "Antonio José Caro Lopera",
          fecha: "2015",
          registro: "Registro 8166",
          descripcion: "Textil intervenido con la palabra 'MINERÍA' en letras amarillas sobre los colores de la bandera de Colombia, cuestionando el modelo extractivo sobre el territorio. Retirado el 15 de octubre de 2026 y restituido tras orden judicial.",
          reflexion: "Superpone la actividad extractiva al símbolo patrio para preguntar quién se beneficia realmente de los recursos naturales del país.",
          imagen: "obras/isla8_obra1.png",
          removida: true
        },
        {
          titulo: "Vaso de porcelana del virrey Amar y Borbón y olleta de cobre con escudo de armas",
          autor: "Fabricante desconocido",
          fecha: "Vaso: ca. 1760 / Olleta: ca. 1770",
          descripcion: "Objetos domésticos de porcelana y cobre martillado con heráldica de marquesados criollos y españoles del Nuevo Reino de Granada, reflejo de la compra de títulos nobiliarios y privilegios a la Corona.",
          reflexion: "Exhibe cómo el prestigio y las jerarquías coloniales —muchas veces compradas— se ostentaban cotidianamente hasta en los utensilios de la mesa.",
          imagen: "obras/isla8_obra2.jpg",
          removida: false
        },
        {
          titulo: "Abanico de María Francisca Villanova y zapato de la época colonial",
          autor: "Fabricante desconocido",
          fecha: "Abanico: ca. 1803 / Zapato: ca. 1790",
          descripcion: "Abanico de marfil tallado y papel pintado que perteneció a la esposa del virrey Antonio Amar y Borbón, junto a un zapato de cuero tinturado cosido a mano, testimonio de las normas suntuarias coloniales.",
          reflexion: "La indumentaria regulada por leyes funcionaba como mecanismo de control social para marcar jerarquías entre las élites importadoras y los sectores populares.",
          imagen: "obras/isla8_obra3.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Isla 9 · Ser y hacer",
      musica: "musica/isla9.mp3",
      obras: [
        {
          titulo: "Las aguadoras",
          autor: "Jorge Elías Triana (1921–1999)",
          fecha: "1968",
          descripcion: "Óleo sobre tela que retrata con pinceladas libres y colores cálidos a mujeres cargando cántaros de barro para transportar agua, dignificando las labores cotidianas del cuidado.",
          reflexion: "Convierte el esfuerzo físico y diario de acarrear agua en protagonista pictórico, aunque el color luminoso puede suavizar la dureza de la falta de acueducto.",
          imagen: "obras/isla9_obra1.jpg",
          removida: false
        },
        {
          titulo: "Retrato de María Teresa de Samper y su cuñada",
          autor: "Adolfo Samper Bernal (1900–1991)",
          fecha: "1940",
          descripcion: "Óleo sobre tela que muestra una escena íntima en la sala de una familia acomodada bogotana, donde dos mujeres leen y tejen en silencio.",
          reflexion: "Eleva lo doméstico a tema artístico, revelando los roles asignados a las mujeres de élite a mediados del siglo XX y dejando fuera de cuadro a quienes trabajaban en el servicio.",
          imagen: "obras/isla9_obra2.jpg",
          removida: false
        },
        {
          titulo: "Sin título (Collage)",
          autor: "Guillermo Wiedemann (1905–1969)",
          fecha: "1963",
          descripcion: "Collage geométrico elaborado con cartón, tela, lata de acero galvanizado, costal de fique y pigmentos, explorando relaciones cromáticas con materiales cotidianos.",
          reflexion: "Transforma materiales humildes como el fique y la hojalata en arte abstracto, dialogando con las tradiciones geométricas prehispánicas.",
          imagen: "obras/isla9_obra3.jpg",
          removida: false
        },
        {
          titulo: "Soledad dolorosa, para el monumento al poeta José Asunción Silva",
          autor: "Marco Tobón Mejía (1876–1933)",
          fecha: "1923–1930",
          descripcion: "Talla en mármol de estética simbolista realizada en París para un monumento estatal al poeta José Asunción Silva que nunca llegó a erigirse.",
          reflexion: "El contraste entre el mármol pulido y la base sin desbastar hace que la figura emerja de la roca como un lamento contenido.",
          imagen: "obras/isla9_obra4.jpg",
          removida: false
        },
        {
          titulo: "El silencio (Figura para una fuente)",
          autor: "Marco Tobón Mejía (1876–1933)",
          fecha: "1920–1926",
          descripcion: "Escultura en mármol premiada en París que generó una fuerte controversia y censura moral por parte de la Iglesia en El Catolicismo al exhibirse en la Avenida de las Américas en 1948.",
          reflexion: "El cuerpo desnudo se concibe como símbolo de recogimiento interior, chocando con el conservadurismo moral que buscaba regular el espacio público bogotano.",
          imagen: "obras/isla9_obra5.jpg",
          removida: false
        },
        {
          titulo: "Despertar",
          autor: "José Domingo Rodríguez (1895–1968)",
          fecha: "Hacia 1940",
          descripcion: "Vaciado en cemento que sintetiza las formas del cuerpo humano mediante un material urbano y moderno, rompiendo con los cánones académicos tradicionales.",
          reflexion: "Utilizar cemento para esculpir el despertar sugiere el esfuerzo de emerger de una materia pesada y cotidiana.",
          imagen: "obras/isla9_obra6.jpg",
          removida: false
        },
        {
          titulo: "Pedro",
          autor: "Fernando Botero Angulo (n. 1932)",
          fecha: "1971",
          descripcion: "Óleo sobre tela pintado en Nueva York en el que el artista retrata a su hijo pequeño Pedro con la monumentalidad volumétrica que definió su estilo maduro.",
          reflexion: "Lo íntimo y familiar adquiere escala monumental con ternura, contrastando con las series sobre la violencia que Botero donó posteriormente al museo.",
          imagen: "obras/isla9_obra7.jpg",
          removida: false
        }
      ]
    },
    {
      nombre: "Sala 10 · Fuerza, Fe y Sustancia",
      musica: "musica/isla10.mp3",
      obras: [
        {
          titulo: "Retablo portátil con figuras de la crucifixión en el monte del Calvario",
          autor: "Taller desconocido de Quito (artesanos españoles, mestizos e indígenas)",
          fecha: "Siglo XVIII",
          descripcion: "Altar portátil de madera tallada, policromada, estofada y esgrafiada llevado a Popayán, cuya decoración mezcla iconografía cristiana con flora, fauna y frutos americanos como cacaos y patillas.",
          reflexion: "Muestra el cruce cultural del Virreinato, donde artesanos anónimos indígenas y mestizos imprimieron el territorio americano dentro de un instrumento de evangelización.",
          imagen: "obras/isla10_obra1.jpg",
          removida: false
        },
        {
          titulo: "Bastón de jaibaná",
          autor: "Pueblo emberá chamí, región del Alto San Juan (Chocó)",
          fecha: "1945",
          descripcion: "Bastón de madera tallada utilizado por el jaibaná —médico tradicional emberá— para invocar a los jais, conectar con los ancestros y armonizar la salud física y espiritual.",
          reflexion: "Representa una medicina tradicional viva basada en el equilibrio con los espíritus y la naturaleza, aunque la vitrina tiende a presentarla como un vestigio del pasado.",
          imagen: "obras/isla10_obra2.jpg",
          removida: false
        },
        {
          titulo: "Tapiz de plumas",
          autor: "Autor desconocido (colección ICANH)",
          fecha: "Siglo XIX",
          descripcion: "Tela de algodón con plumas de aves adheridas mediante puntadas y resina que combina flora y fauna nativa (papagayos, begonias) con motivos europeos y asiáticos bajo el tema del árbol de la vida.",
          reflexion: "Una técnica plumaria prehispánica que consideraba sagradas a las aves sobrevive y dialoga con gustos decorativos transcontinentales.",
          imagen: "obras/isla10_obra3.jpg",
          removida: false
        },
        {
          titulo: "Custodia",
          autor: "Autor desconocido",
          fecha: "Siglo XVIII",
          descripcion: "Objeto litúrgico en plata fundida, cincelada, repujada y dorada con esmeraldas, amatistas, diamantes y perlas, exhibido junto a la Virgen del Apocalipsis y una espada de honor.",
          reflexion: "Refleja la alianza simbólica entre riqueza material, fe católica y poder en la Colonia, ocultando el trabajo indígena y esclavizado detrás de la extracción de metales y gemas.",
          imagen: "obras/isla10_obra4.jpg",
          removida: false
        },
        {
          titulo: "Imagen de la Divina Pastora",
          autor: "Francisco Benito de Miranda (m. 1793)",
          fecha: "1782",
          descripcion: "Grabado en cobre impreso sobre papel usado por los misioneros capuchinos bajo encargo del arzobispo Caballero y Góngora para pacificar las regiones sublevadas tras la rebelión de los Comuneros de 1781.",
          reflexion: "Ilustra el uso político de la estampa religiosa como herramienta de persuasión y control social tras una revuelta popular contra los impuestos virreinales.",
          imagen: "obras/isla10_obra5.jpg",
          removida: false
        }
      ]
    }
  ]
};
