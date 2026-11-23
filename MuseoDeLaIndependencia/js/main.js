
import { initializeMap } from "./map/map.js";
import { works } from "./data/work.js";
import { getConnectedWorkIds } from "./map/map.js";
import { startActivity } from "./core/activityManager.js";
import {
    showCelebration,
    hideCelebration
} from "./core/celebration.js";

console.log("Museo interactivo iniciado");

// Elementos principales
const map = document.getElementById("museum-map");
const workView = document.getElementById("work-view");
const backButton = document.getElementById("back-to-map");
// Elementos del rompecabezas
const puzzleView = document.getElementById("puzzle-view");
// Elementos del Quiz
const quizView = document.getElementById("quiz-view");
const backToWorkQuizButton = document.getElementById("back-to-work-quiz");
//Elementos linea del tiempo
const timelineView = document.getElementById("timeline-view");
const backToWorkTimelineButton = document.getElementById("back-to-work-timeline");
// Elementos del ahorcado
const hangmanView = document.getElementById("hangman-view");
const backToWorkHangmanButton = document.getElementById("back-to-work-hangman");
// Elementos del Detective del Museo
const detectiveView = document.getElementById("detective-view");
const backToWorkDetectiveButton = document.getElementById("back-to-work-detective");
const backToWorkButton = document.getElementById("back-to-work");
const startGameButton = document.getElementById("start-game");



// Obra actualmente seleccionada
let currentWork = null;

// Elementos de la ficha
const workImage = document.getElementById("work-image");
const workTitle = document.getElementById("work-title");
const workType = document.getElementById("work-type");
const workAuthor = document.getElementById("work-author");
const workDate = document.getElementById("work-date");
const workDescription = document.getElementById("work-description");
const workAudio = document.getElementById("work-audio");

// Contador de monedas
const coinCounter = document.getElementById("coin-counter");

// ------------------------------------
// SISTEMA DE PROGRESO
// ------------------------------------

// Recuperar progreso guardado
const STORAGE_KEY = "independenciaMuseumProgress";
const savedProgress = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {
    completed: [],
    unlocked: [1, 2, 3],
    coins: 0
};

let completedWorks = savedProgress.completed;
let unlockedWorks = savedProgress.unlocked;
let coins = savedProgress.coins;
let goalReached = savedProgress.goalReached ?? false;

// Actualizar contador
function updateCoinCounter() {
    if (coinCounter) {
        coinCounter.textContent = coins;
    }
}

// Guardar progreso
function saveProgress() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            completed: completedWorks,
            unlocked: unlockedWorks,
            coins: coins,
            goalReached: goalReached
        })
    );
}

updateCoinCounter();

// ------------------------------------
// COMPLETAR UNA OBRA Y ENTREGAR MONEDAS
// ------------------------------------


function completeWork(workId) {
    const selectedWork = works.find(work => work.id === workId);

    if (!selectedWork) {
        console.warn("Esta obra todavía no está disponible.");
        return;
    }

    currentWork = selectedWork;

    if (completedWorks.includes(workId)) {
        console.log("Esta obra ya fue completada.");
        return;
    }

    // Marcar la obra como completada.
    completedWorks.push(workId);

    // Obtener las conexiones directas de esta obra.
    const connectedWorks = getConnectedWorkIds(workId);

    // Desbloquear las obras conectadas.
    connectedWorks.forEach(connectedId => {
        if (
            !completedWorks.includes(connectedId) &&
            !unlockedWorks.includes(connectedId)
        ) {
            unlockedWorks.push(connectedId);
            console.log(`¡Obra ${connectedId} desbloqueada!`);
        }
    });

    // Entregar las monedas.
    showCelebration();
    coins += 100;

    if (coins >= 300) {
        goalReached = true;
        console.log("¡Meta de monedas alcanzada!");
    }

    // Guardar y actualizar el progreso.
    saveProgress();
    updateCoinCounter();
    initializeMap({ completedWorks, unlockedWorks });

    console.log(`Obra ${workId} completada. Monedas: ${coins}`);
}

// Recibir avisos de los minijuegos
document.addEventListener("workCompleted", (event) => {

    const workId = Number(event.detail.workId);

    completeWork(workId);

});

// ------------------------------------
// CREAR MAPA
// ------------------------------------

initializeMap({
    completedWorks,
    unlockedWorks
});

// ------------------------------------
// MOSTRAR UNA OBRA
// ------------------------------------

function openWork(workId) {

    const selectedWork = works.find(work => work.id === workId);
    currentWork = selectedWork;

    if (!selectedWork) {
        console.warn("Esta obra todavía no está disponible.");
        return;
    }

    workImage.src = selectedWork.image;
    workImage.alt = selectedWork.title;

    workTitle.textContent = selectedWork.title;
    workType.textContent = selectedWork.type;
    workAuthor.textContent = `Autor: ${selectedWork.author}`;
    workDate.textContent = `Fecha: ${selectedWork.date}`;
    workDescription.textContent = selectedWork.description;

    workAudio.src = selectedWork.music;
    workAudio.load();

    workAudio.play().catch(error => {
        console.log("El navegador requiere reproducción manual:", error);
    });

    map.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);
}

// ------------------------------------
// SELECCIÓN DE SALAS
// ------------------------------------

map.addEventListener("click", (event) => {

    const room = event.target.closest(".room");

    if (!room) return;

    if (
        !room.classList.contains("available") &&
        !room.classList.contains("completed")
    ) return;

    const roomId = Number(room.dataset.room);

    openWork(roomId);
});

// ------------------------------------
// INICIAR ROMPECABEZAS
// ------------------------------------



startGameButton.addEventListener("click", () => {

    if (!currentWork) return;

    const started = startActivity(currentWork, () => {

        document.dispatchEvent(
            new CustomEvent("workCompleted", {
                detail: {
                    workId: currentWork.id
                }
            })
        );

    });

    if (!started) return;

    // Ocultar ficha de la obra
    workView.hidden = true;

    // Mostrar la actividad correspondiente
    if (currentWork.activity === "puzzle") {

        puzzleView.hidden = false;
        quizView.hidden = true;

    } else if (currentWork.activity === "quiz") {

        puzzleView.hidden = true;
        quizView.hidden = false;

    } else if (currentWork.activity === "timeline") {
        puzzleView.hidden = true;
        quizView.hidden = true;
        timelineView.hidden = false;
    } else if (currentWork.activity === "hangman") {

        puzzleView.hidden = true;
        quizView.hidden = true;
        timelineView.hidden = true;
        hangmanView.hidden = false;

    } else if (currentWork.activity === "detective") {

        puzzleView.hidden = true;
        quizView.hidden = true;
        timelineView.hidden = true;
        hangmanView.hidden = true;
        detectiveView.hidden = false;

    }

    window.scrollTo(0, 0);

});


// ------------------------------------
// REGRESAR A LA OBRA
// ------------------------------------

backToWorkButton.addEventListener("click", () => {

    puzzleView.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);

});

// ------------------------------------
// REGRESAR A LA OBRA DESDE EL QUIZ
// ------------------------------------

backToWorkQuizButton.addEventListener("click", () => {

    quizView.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);

});


// ------------------------------------
// REGRESAR A LA OBRA DESDE LA LINEA DE TIEMPO
// ------------------------------------

backToWorkTimelineButton.addEventListener("click", () => {
    timelineView.hidden = true;
    workView.hidden = false;
    window.scrollTo(0, 0);
});

// ------------------------------------
// REGRESAR A LA OBRA DESDE EL AHORCADO
// ------------------------------------

backToWorkHangmanButton.addEventListener("click", () => {

    hangmanView.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);

});

// ------------------------------------
// REGRESAR A LA OBRA DESDE EL DETECTIVE
// ------------------------------------

backToWorkDetectiveButton.addEventListener("click", () => {

    detectiveView.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);

});

// ------------------------------------
// REGRESAR AL MAPA
// ------------------------------------

backButton.addEventListener("click", () => {

    workAudio.pause();
    workAudio.removeAttribute("src");
    workAudio.load();

    workView.hidden = true;
    map.hidden = false;

    window.scrollTo(0, 0);
});

// ------------------------------------
// CERRAR CELEBRACIÓN
// ------------------------------------

const celebrationContinue = document.getElementById(
    "celebration-continue"
);

celebrationContinue.addEventListener("click", () => {

    hideCelebration();

    window.scrollTo(0, 0);

});
