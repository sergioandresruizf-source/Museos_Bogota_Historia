
export const detectiveCases = {

    billeteManumision: {
        title: "El documento de la libertad",
        subtitle: "Expediente 011 · Año 1853",
        introduction:
            "Ha llegado al museo un documento emitido por el Gobierno de la Nueva Granada. Su función no es evidente a primera vista. Investiga las pistas y descubre qué representaba.",

        clues: [
            {
                title: "Pista 1 · El emisor",
                text: "El documento fue emitido por el Gobierno de la Nueva Granada el 27 de junio de 1853."
            },
            {
                title: "Pista 2 · Una ley anterior",
                text: "La ley del 21 de mayo de 1851 estableció que la libertad de las personas esclavizadas sería efectiva desde el 1 de enero de 1852."
            },
            {
                title: "Pista 3 · El propósito",
                text: "Las juntas de manumisión entregaban estos billetes a los propietarios. La Nación reconocía el valor indicado en ellos."
            }
        ],

        question:
            "¿Cuál era la función principal de estos billetes?",

        options: [
            "Servían como dinero de circulación comercial.",
            "Reconocían el valor asumido por la Nación en el proceso de manumisión.",
            "Eran permisos para transportar mercancías.",
            "Representaban títulos de propiedad sobre tierras."
        ],

        correctAnswer: 1,

        resolution:
            "Los billetes de manumisión formaban parte del mecanismo mediante el cual el Gobierno reconocía el valor correspondiente a la liberación de las personas esclavizadas. No eran billetes de circulación comercial.",

        historicalNote:
            "La abolición legal de la esclavitud en Colombia fue establecida por la ley de 1851 y se hizo efectiva el 1 de enero de 1852."
    },

    boqueronSanFrancisco: {
        title: "El río desaparecido",
        subtitle: "Expediente 012 · Año 1837",
        introduction:
            "Una antigua pintura muestra un paisaje atravesado por un río. Hoy, ese paisaje urbano es muy diferente. Investiga las pistas y reconstruye el destino del río.",

        clues: [
            {
                title: "Pista 1 · El autor",
                text: "La obra fue realizada por Ramón Torres Méndez, pintor costumbrista nacido en Bogotá en 1809."
            },
            {
                title: "Pista 2 · El recorrido",
                text: "El río San Francisco nace en los cerros orientales y atraviesa el centro de Bogotá."
            },
            {
                title: "Pista 3 · La transformación",
                text: "Con el crecimiento urbano, el cauce del río fue canalizado y hoy pasa bajo la avenida Jiménez."
            }
        ],

        question:
            "¿Qué ocurrió con el cauce del río San Francisco?",

        options: [
            "Fue desviado hacia los Llanos Orientales.",
            "Se secó completamente durante el siglo XIX.",
            "Fue canalizado y actualmente pasa bajo la avenida Jiménez.",
            "Fue convertido en un lago artificial."
        ],

        correctAnswer: 2,

        resolution:
            "El río San Francisco no desapareció simplemente: su cauce fue canalizado y hoy transcurre bajo la avenida Jiménez, en el centro de Bogotá.",

        historicalNote:
            "La obra permite comparar el paisaje de Bogotá del siglo XIX con las transformaciones urbanas que experimentó posteriormente."
    }

};
