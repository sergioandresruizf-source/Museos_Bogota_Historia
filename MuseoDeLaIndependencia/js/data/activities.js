
export const activities = {

    puzzle: {
        id: "puzzle",
        name: "Rompecabezas",
        description: "Reconstruye la imagen de la obra.",
        instructions: "Selecciona dos piezas para intercambiar sus posiciones.",
        module: "puzzle.js"
    },

    quiz: {
        id: "quiz",
        name: "Preguntas históricas",
        description: "Demuestra tus conocimientos sobre la obra.",
        instructions: "Responde correctamente las preguntas para completar la actividad.",
        module: "quiz.js"
    },

    timeline: {
        id: "timeline",
        name: "Orden cronológico",
        description: "Organiza los acontecimientos históricos.",
        instructions: "Coloca los acontecimientos en el orden correcto.",
        module: "timeline.js"
    },

    hangman: {
        id: "hangman",
        name: "Ahorcado histórico",
        description: "Descubre una palabra relacionada con la obra.",
        instructions: "Usa la pista para adivinar la palabra antes de perder los seis sellos.",
        module: "hangman.js"
    },

    observation: {
        id: "observation",
        name: "Encuentra los detalles",
        description: "Explora la obra y descubre sus elementos.",
        instructions: "Identifica los detalles que se solicitan.",
        module: "observation.js"
    },

    memory: {
        id: "memory",
        name: "Juego de memoria",
        description: "Encuentra las parejas correspondientes.",
        instructions: "Voltea las tarjetas y encuentra todas las parejas.",
        module: "memory.js"
    },

    matching: {
        id: "matching",
        name: "Relacionar conceptos",
        description: "Relaciona personajes, acontecimientos y conceptos.",
        instructions: "Une correctamente cada elemento con su correspondencia.",
        module: "matching.js"
    }

};


export function getActivity(activityId) {
    return activities[activityId] || null;
}


export function validateActivity(activityId) {
    return Object.prototype.hasOwnProperty.call(
        activities,
        activityId
    );
}
