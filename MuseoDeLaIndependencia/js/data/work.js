
export const works = [
    {
        id: 1,
        title: "Policarpa Salavarrieta",
        author: "Roberto Páramo Tirado",
        date: "1890",
        type: "Pintura",
        activity: "quiz",
        collection: "Museo de la Independencia Casa del Florero",

        description:
            "La inscripción de la obra indica que Policarpa Salavarrieta fue fusilada en Bogotá el 14 de noviembre de 1817, durante la Reconquista española. La pieza fue realizada 73 años después de su muerte.",

        image: "./assets/artworks/policarpa-salavarrieta.jpg",
        music: "./assets/sounds/Soy_Colombiano_Garzon.mp3",
        coins: null,
        quizKey: "policarpa",
    },

    {
        id: 2,
        title: "Entrada del ejército republicano por el norte de Bogotá",
        author: "Martínez Hermanos",
        date: "No precisada (registro: 1800)",
        type: "Litografía",
        activity: "timeline",
        collection: "Museo de la Independencia Casa del Florero",

        description:
            "La litografía representa un episodio de la revolución de 1854, conflicto contra el golpe de Estado del general José María Melo. El rótulo de la lámina, Ejército del Norte, se refiere a la orden de ocupar las colinas de San Diego y forzar la entrada a Bogotá el 3 de diciembre de 1854.",

        historicalPeriod: "Historia republicana de Colombia",

        image: "./assets/artworks/entrada-ejercito.jpg",
        music: "./assets/sounds/Beethoven_Heroica.mp3",
        coins: null,
        timelineKey: "entradaEjercito"
    },

    {
        id: 3,
        title: "Antonio Morales y familia",
        author: "José María Espinosa (atribuido)",
        date: "1850",
        type: "Pintura al óleo",
        activity: "puzzle",
        collection: "Museo de la Independencia Casa del Florero",

        description:
            "Antonio Morales Galavís fue miembro del cabildo de Santafé, participó en los acontecimientos del 20 de julio de 1810, integró la Junta de Gobierno y firmó el Acta de Independencia. El retrato fue pintado aproximadamente 40 años después de esos hechos.",

        image: "./assets/artworks/antonio-morales-y-familia.jpg",
        music: "./assets/sounds/Malvaloca_Luis_Calvo.mp3",
        coins: null
    }
];


const additionalArtworkFiles = [
    "Acta de la Revolución del 20 de julio de 1810 .jpeg",
    "Antonio Morales Galvis.jpeg",
    "Antonio Narinio.jpeg",
    "Baile de campesinos.png",
    "Base del florero del 20 de julio de 1810.png",
    "Batalla de Calibo.png",
    "Batalla del Alto Palacio.png",
    "Billete de manumisión. Segunda clase .jpeg",
    "Boqueron del rio San Francisco.png",
    "CArmen Rodriguez de Gaitán.jpeg",
    "Calle de la Moneda.png",
    "Capilla del Humilladero.png",
    "Casa museo del 20 de julio.png",
    "Documento conmemorativo de la capitulación de Cartagena .jpeg",
    "El Humilladero, La Veracruz y San Francisco.png",
    "Escena de la ejecucion de Antonia Santos.png",
    "Firma del Acta de Independencia.png",
    "Fotografia del frente de la Casa del Florero.png",
    "Francisco Jose de Caldas.jpeg",
    "Guillermo Hernndez de Alba.png",
    "Himno Nacional de la República de Colombia. Partitura manuscrita .jpeg",
    "Jorge Tadeo Lozano.jpeg",
    "Jose Celestino Mutis.jpeg",
    "Josefa Santander de Bricenio.png",
    "Juramento del acta.jpeg",
    "La India de la Libertad.png",
    "La plaza del desaparecido pueblo de Guatavita.png",
    "Madre y hermanas de Jose Maria Cordoba.jpeg",
    "Manuela Saienz.png",
    "Muerte de Santander.png",
    "Nariño dirigiendo la impresión de los Derechos del Hombre .jpeg",
    "Plaza Mayor de Bogota.png",
    "Plomo sobre carbon (Palacio de justicia).jpeg",
    "Retrato Francisco Jose de Caldas.jpeg",
    "Reyerta de aguadores .jpeg",
    "Reyerta del 20 de julio de 1810.png",
    "Salida de Policarpa Salavarrieta hacia el pat├¡bulo.png",
    "Salida del virrey Amar y su esposa del palacio.png",
    "San Jose.jpeg",
    "Santa Librada.jpeg",
    "Simon Bolivar y Santander.jpeg",
    "Simon Bolivar.jpeg",
    "Sixta Pontin de Santander.png",
    "Tipos de muchachos del pueblo.png",
    "Triptico de Nuestra Seniora de las Angustias.png",
    "Virgen de la Inmaculada Concepcion.png"
];

const additionalWorks = additionalArtworkFiles.map((filename, index) => ({
    id: index + 4,
    title: filename.replace(/\.[^/.]+$/, "").trim(),
    author: "No identificado",
    date: "No precisada",
    type: "Obra de la colección",
    activity: "puzzle",
    collection: "Museo de la Independencia Casa del Florero",
    description: "Información histórica pendiente de completar.",
    image: `./assets/artworks/${filename}`,
    music: null,
    coins: null
}));

works.push(...additionalWorks);
