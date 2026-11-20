/* =====================================================================
   DATOS DEL MUSEO DEL ORO  (edita aquí textos, imágenes y audios)
   - imagenesPosibles: se prueba en orden dentro de assets/img/
   - audioPosibles:    se prueba en orden dentro de assets/audio/
   - forma:            dibujo dorado que aparece sobre el pedestal (ver dibujarOro en engine25d.js)
   - secreto:          dato que se revela al descifrar los símbolos
   - pregunta:         lo que "pregunta el cacique" al dialogar (opción correcta = índice)
   ===================================================================== */
window.ORO_CONFIG = {
    museoId: 'oro',            // id que el mapa general espera en el aviso 'museo-completo'
    musica: {                  // música de fondo (se carga solo al empezar)
        indigena: 'Viento_en_la_Filigrana.mp3',
        espanol:  'Patrimonio en Cautiverio.mp3',
        final:    'Retorno y Memoria Viva.mp3'
    }
};

window.OBRAS_MUSEO = [
    {
        id: "poporo-quimbaya", corto: "Poporo Quimbaya", numero: 1, forma: "poporo",
        titulo: "Recipiente fitomorfo para cal (Poporo Quimbaya)",
        cultura: "Quimbaya · Cauca Medio", periodo: "Período Temprano · 500 a. C. – 700 d. C.",
        tecnica: "Tumbaga fundida a la cera perdida con núcleo", emoji: "🏺",
        imagenesPosibles: ["01.jpg", "01_Poporo_quimbaya.jpg"],
        audioPosibles: ["Poporo_Ritual_y_Memoria.mp3", "01.mp3"],
        descripcion: "Este emblemático recipiente ritual, diseñado con la delicada forma de un fruto, es una obra fundamental del período Temprano de la cultura Quimbaya. Servía para guardar la cal obtenida de conchas marinas quemadas que se usaba en el mambeo, el ritual sagrado de mascar hojas de coca.",
        secreto: "El mambeo no era un vicio: era un acto de pensamiento y de conversación. El poporo era el 'cuaderno' del sabio, y la cal que guardaba venía del mar.",
        pregunta: { q: "El cacique pregunta: ¿para qué servía el poporo?", opciones: ["Guardar la cal del mambeo", "Guardar agua para el viaje", "Guardar semillas de maíz", "Iluminar el templo"], correcta: 0 },
        creadaInicialmente: true
    },
    {
        id: "colgante-crisalida", corto: "Crisálida", numero: 2, forma: "crisalida",
        titulo: "Colgante en forma de crisálida de insecto",
        cultura: "Quimbaya · Cauca Medio", periodo: "Período Temprano · 500 a. C. – 700 d. C.",
        tecnica: "Tumbaga a la cera perdida", emoji: "🦋",
        imagenesPosibles: ["02_Colgante_en_forma_de_cris_lida_de_insecto.jpg", "02.jpg"],
        audioPosibles: ["Eco_Ancestral_y_Viento_de_los_Andes.mp3"],
        descripcion: "Representa con gran detalle a un insecto en plena metamorfosis. Para las sociedades prehispánicas simbolizaba la transformación espiritual, el renacimiento y la capacidad del chamán para cambiar de estado.",
        secreto: "Un cuerpo quieto que por dentro se está transformando: así entendían al chamán, que 'cambiaba de estado' para hablar con otros mundos.",
        pregunta: { q: "El cacique pregunta: ¿qué simboliza la crisálida?", opciones: ["La guerra y la conquista", "La transformación y el renacimiento", "La riqueza del comercio", "La llegada de las lluvias"], correcta: 1 },
        creadaInicialmente: true
    },
    {
        id: "colgante-caracol", corto: "Caracol", numero: 3, forma: "caracol",
        titulo: "Colgante en forma de caracol",
        cultura: "Quimbaya · Cauca Medio", periodo: "Período Temprano · 500 a. C. – 700 d. C.",
        tecnica: "Fundición a la cera perdida", emoji: "🐚",
        imagenesPosibles: ["03_Colgante_en_forma_de_caracol.jpg", "03.jpg"],
        audioPosibles: ["Viento_en_la_Filigrana.mp3"],
        descripcion: "La espiral del caracol evocaba el movimiento del agua, el tiempo cíclico y la conexión con el mar, de donde provenían las conchas usadas para obtener la cal del mambeo.",
        secreto: "La espiral no tiene principio ni final: para ellos el tiempo volvía sobre sí mismo, como el agua y como las estaciones.",
        pregunta: { q: "El cacique pregunta: ¿qué evocaba la espiral del caracol?", opciones: ["Una montaña sagrada", "El agua, el tiempo cíclico y el mar", "El vuelo de las aves", "El fuego de la fragua"], correcta: 1 },
        creadaInicialmente: true
    },
    {
        id: "colgante-antropomorfo", corto: "Colgante con placas", numero: 4, forma: "mascara",
        titulo: "Colgante antropomorfo con placas colgantes",
        cultura: "Tolima / Calima", periodo: "1 a. C. – 700 d. C.",
        tecnica: "Martillado y repujado en oro", emoji: "🎭",
        imagenesPosibles: ["04_Colgante_antropomorfo_con_colgantes.jpg", "04.jpg"],
        audioPosibles: ["Rostros_de_Tierra_y_Luz.mp3"],
        descripcion: "Figura humana estilizada con pequeñas placas móviles que destellaban con la luz del sol y producían un suave tintineo metálico con cada paso durante las ceremonias.",
        secreto: "El oro no solo se veía: se oía. Quien lo llevaba anunciaba su llegada con un tintineo que formaba parte del ritual.",
        pregunta: { q: "El cacique pregunta: ¿qué producían las placas móviles al caminar?", opciones: ["Humo ceremonial", "Un tintineo metálico y destellos", "Un olor a resina", "Una melodía de flauta"], correcta: 1 },
        creadaInicialmente: true
    },
    {
        id: "balsa-muisca", corto: "Balsa Muisca", numero: 5, forma: "balsa",
        titulo: "La Balsa Muisca (Figura votiva ceremonial)",
        cultura: "Muisca · Altiplano Cundiboyacense", periodo: "600 – 1600 d. C.",
        tecnica: "Cera perdida en una sola pieza", emoji: "🛶",
        imagenesPosibles: ["05_Balsa_muisca_figura_votiva_en_forma_de_ceremonia.jpg", "05.jpg"],
        audioPosibles: ["El_Canto_de_la_Laguna.mp3", "Lamento del Dorado.mp3"],
        descripcion: "Obra maestra de la orfebrería muisca. Representa la ceremonia de investidura del nuevo cacique en la laguna sagrada de Guatavita, rodeado de sacerdotes y remeros, ofrendando oro a los dioses del agua.",
        secreto: "Esta pequeña balsa es probablemente la raíz de la leyenda de El Dorado: un rito real que los europeos convirtieron en un reino imaginario de oro.",
        pregunta: { q: "El cacique pregunta: ¿qué ceremonia representa la balsa?", opciones: ["Una cosecha de maíz", "Un funeral en la montaña", "La investidura del nuevo cacique en la laguna de Guatavita", "Una batalla naval"], correcta: 2 },
        creadaInicialmente: false
    },
    {
        id: "pectoral-calima", corto: "Pectoral Calima", numero: 6, forma: "pectoral",
        titulo: "Gran Pectoral Ceremonial Martillado",
        cultura: "Calima · Valle del Cauca", periodo: "Período Yotoco",
        tecnica: "Lámina de oro martillada y repujada", emoji: "🛡️",
        imagenesPosibles: ["06.jpg", "06_Pectoral.jpg"],
        audioPosibles: ["El_Resplandor_del_Cobre_y_el_Oro.mp3"],
        descripcion: "Adorno monumental que cubría el pecho del líder. Al reflejar la luz solar, transformaba al gobernante en una figura radiante vinculada directamente con el astro rey.",
        secreto: "Una lámina martillada hasta ser casi tan delgada como una hoja: pesa poco, pero brilla como un espejo al sol.",
        pregunta: { q: "El cacique pregunta: ¿con qué astro vinculaba al gobernante este pectoral?", opciones: ["La luna", "El sol", "El trueno", "La estrella polar"], correcta: 1 },
        creadaInicialmente: false
    },
    {
        id: "hombre-jaguar", corto: "Hombre-Jaguar", numero: 7, forma: "hombrejaguar",
        titulo: "Colgante Hombre-Jaguar Alado",
        cultura: "Tolima · Magdalena Medio", periodo: "1 a. C. – 700 d. C.",
        tecnica: "Fundición y martillado", emoji: "🐆",
        imagenesPosibles: ["07.jpg", "07_Colgante_Tolima.jpg"],
        audioPosibles: ["El_Rugido_del_Sol.mp3"],
        descripcion: "Pieza esquemática y geométrica donde se fusionan rasgos humanos, de jaguar y de ave rapaz, representando el vuelo chamánico y la fuerza felina.",
        secreto: "Humano, felino y ave en un solo cuerpo: el chamán se imaginaba volando y cazando al mismo tiempo cuando viajaba en trance.",
        pregunta: { q: "El cacique pregunta: ¿qué rasgos se fusionan en esta pieza?", opciones: ["Humano, jaguar y ave rapaz", "Serpiente, pez y venado", "Humano, caimán y mono", "Ave, rana y murciélago"], correcta: 0 },
        creadaInicialmente: false
    },
    {
        id: "pectoral-tairona", corto: "Pectoral Tairona", numero: 8, forma: "tairona",
        titulo: "Pectoral y Diadema del Cacique Tairona",
        cultura: "Tairona · Sierra Nevada de Santa Marta", periodo: "900 – 1600 d. C.",
        tecnica: "Cera perdida y falsa filigrana", emoji: "👑",
        imagenesPosibles: ["08.jpg", "08_Pectoral_Tairona.jpg", "17_Pectoral_antropozoomorfo.jpg"],
        audioPosibles: ["El Canto de los Guardianes de Piedra.mp3", "El_Canto_de_los_Guardianes_de_Piedra.mp3"],
        descripcion: "Elaborado con intrincados detalles de serpientes bicéfalas y aves. Simbolizaba el equilibrio cósmico de la Sierra Nevada, considerada el corazón del mundo.",
        secreto: "Para los pueblos de la Sierra Nevada, el mundo se mantiene en equilibrio si se cuida el territorio: cada pieza es también un mapa del cosmos.",
        pregunta: { q: "El cacique pregunta: ¿cómo se considera la Sierra Nevada de Santa Marta?", opciones: ["Un mercado del oro", "El corazón del mundo", "Una frontera del imperio", "Un volcán dormido"], correcta: 1 },
        creadaInicialmente: false
    }
];

window.JOYAS_INDIGENA = [
    { id: "diadema", nombre: "Diadema Solar de Oro", emoji: "👑", desc: "Corona ceremonial que irradia autoridad y sabiduría.", equipada: true },
    { id: "nariguera", nombre: "Nariguera Semilunar", emoji: "🌙", desc: "Adorno facial que transforma el rostro del portador.", equipada: true },
    { id: "pectoral", nombre: "Pectoral del Sol", emoji: "☀️", desc: "Placa dorada que protege el corazón y refleja la luz.", equipada: false },
    { id: "poporo", nombre: "Poporo Ritual en Mano", emoji: "🏺", desc: "Recipiente sagrado del mambeo ancestral.", equipada: false }
];
