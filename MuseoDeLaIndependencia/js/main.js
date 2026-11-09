
import { initializeMap } from "./map/map.js";
import { works } from "./data/work.js";
import { initializePuzzle } from "./games/puzzle.js";

console.log("Museo interactivo iniciado");

// Elementos principales
const map = document.getElementById("museum-map");
const workView = document.getElementById("work-view");
const backButton = document.getElementById("back-to-map");
// Elementos del rompecabezas
const puzzleView = document.getElementById("puzzle-view");
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

    // Comprobar que la obra existe
    const selectedWork = works.find(work => work.id === workId);

    if (!selectedWork) {
        console.warn("La obra no existe.");
        return;
    }

    // Evitar recompensas repetidas
    if (completedWorks.includes(workId)) {
        console.log("Esta obra ya fue completada.");
        return;
    }

    // Registrar obra completada
    completedWorks.push(workId);

    // Entregar recompensa
    coins += 100;

    // Comprobar si se alcanzó la meta
    if (coins >= 300) {
        goalReached = true;
        console.log("¡Meta de monedas alcanzada!");
    }

    // Guardar y actualizar
    saveProgress();
    updateCoinCounter();

    // Actualizar apariencia del mapa
    initializeMap({
        completedWorks,
        unlockedWorks
    });

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

    // Ocultar ficha de la obra
    workView.hidden = true;

    // Mostrar rompecabezas
    puzzleView.hidden = false;

    // Iniciar actividad
    initializePuzzle(currentWork.image, () => {

        document.dispatchEvent(
            new CustomEvent("workCompleted", {
                detail: {
                    workId: currentWork.id
                }
            })
        );

    });

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
