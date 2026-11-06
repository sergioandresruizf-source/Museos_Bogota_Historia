// ===== OBRAS: edita aquí título, artista y texto de cada obra =====
// car   = letra/número que pones en el mapa de un piso (js/nivel.js) para colocar la obra en esa pared.
// img   = nombre de los archivos: textures/paredes/<img>.png (la pared con el cuadro)
//         y textures/obras/<img>.jpg (la imagen grande que se ve al hacer zoom).
// serie = opcional, se muestra junto al artista.
const OBRAS = [
  { car: "1", img: "obra_1", titulo: "Leaking Subjects and Bounding Boxes (2020)", artista: "Elisa Giardina Papa",
    texto: "En esta pieza, Giardina Papa aborda el trabajo invisible de las personas dedicadas al entrenamiento y limpieza de datos (data-cleaning) para la inteligencia artificial. Las pantallas y carteles dispuestos sobre superficies térmicas de aluminio reflejan las tareas repetitivas (como etiquetado de imágenes, clasificación de emociones y resolución de sistemas de verificación/CAPTCHA)." },
  { car: "2", img: "obra_2", titulo: "El caos sensible", artista: "Ana María Rueda", serie: "Exposición antológica",
    texto: "En estas piezas, las pinturas reposan sobre ramas curvadas, haciendo que el lienzo no quede fijado a una pared plana convencional, sino suspendido. La artista trabaja la dualidad de los lados de la tela (el anverso y el reverso), explorando temas como el flujo del agua, las formas vegetales, los mapas, las conexiones orgánicas y la fragilidad del entorno natural." },
  { car: "3", img: "obra_3", titulo: "De una vida a otra: Umbrales afectivos y materias sorprendentes", artista: "Ana María Devis",
    texto: "La muestra surgió a partir de una infestación microscópica (hongos, bacterias y levaduras) ocurrida en un espacio doméstico tras una humedad no detectada. La artista registró fotográficamente las manchas e improntas dejadas por la actividad microbiana y luego intervino manualmente las telas impresas con bordados, tejidos e hilos." },
  { car: "4", img: "obra_4", titulo: "Construcción con serruchos (2013)", artista: "Patrick Hamilton",
    texto: "Hamilton suele recurrir al uso del cobre (recurso clave en la economía e historia contemporánea de Chile) y a herramientas de trabajo manual/construcción (como serruchos, llanas o mallas)." },
  { car: "5", img: "obra_5", titulo: "El ladrillo", artista: "Patrick Hamilton",
    texto: "Toma su nombre directamente del libro «El ladrillo», un documento clave de la historia económica latinoamericana redactado a principios de los años 70 por un grupo de economistas chilenos (conocidos como los Chicago Boys) que estructuraron las bases del modelo neoliberal implementado en Chile durante la dictadura." },
  { car: "6", img: "obra_6", titulo: "La presencia como promesa", artista: "Ernesto Bautista",
    texto: "La obra de Bautista investiga la relación entre el tiempo, la fragilidad, el territorio, la memoria histórica y la luz (el fuego como vela o llama votiva), creando una tensión poética entre la permanencia de la materia y su inevitable desgaste o transformación." },
  { car: "7", img: "obra_7", titulo: "De una vida a otra: Umbrales afectivos y materias sorprendentes", artista: "Ana María Devis",
    texto: "La imagen nace a partir de una infestación masiva de hongos, bacterias y levaduras que colonizó el mobiliario de un apartamento en Bogotá tras una fuga de agua inadvertida. Al registrar fotográficamente el desastre —específicamente una cama doble cuyas sábanas y colchón quedaron marcados por los rastros biológicos y fluidos de los cuerpos que la habitaron—, la artista vio en ello una metáfora profunda sobre la vida y el fin del dominio humano." },
  { car: "8", img: "obra_8", titulo: "Axolotls", artista: "Ana María Devis", serie: "De una vida a otra",
    texto: "Explora la obsesión por los vínculos íntimos y la simbiosis entre el cuerpo, los microorganismos y la naturaleza, desdibujando las fronteras entre lo humano, lo animal y lo celular mediante un trazo manual minucioso y obsesivo." },
  { car: "9", img: "obra_9", titulo: "El caos sensible", artista: "Ana María Rueda", serie: "Exposición antológica",
    texto: "A diferencia de otras piezas de la exposición donde predomina el agua o la botánica, esta obra utiliza un degradado de rojos, naranjas e incandescencias envueltos en negro para abordar el fuego. Funciona como símbolo de energía vital, luz en la penumbra y principio de transformación de la materia." },
  { car: "A", img: "obra_10", titulo: "Tumba No. 11 (Felipe II) (1963)", artista: "Juan Antonio Roda",
    texto: "La composición evoca un espacio claustrofóbico, una cámara funeraria o un sarcófago estilizado. No busca retratar la figura de Felipe II de forma realista, sino plasmar la atmósfera del encierro, el peso de la historia, la decadencia del poder imperial y la solemnidad del silencio sepulcral." }
];
