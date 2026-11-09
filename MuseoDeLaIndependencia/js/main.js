
import { initializeMap } from "./map/map.js";
import { works } from "./data/work.js";

console.log("Museo interactivo iniciado");

// Elementos principales
const map = document.getElementById("museum-map");
const workView = document.getElementById("work-view");
const backButton = document.getElementById("back-to-map");

// Elementos de la ficha
const workImage = document.getElementById("work-image");
const workTitle = document.getElementById("work-title");
const workType = document.getElementById("work-type");
const workAuthor = document.getElementById("work-author");
const workDate = document.getElementById("work-date");
const workDescription = document.getElementById("work-description");
const workAudio = document.getElementById("work-audio");

// Contador de monedas

console.log("Museo interactivo iniciado");

const coinCounter = document.getElementById("coin-counter");

let coins = 0;

if (coinCounter) {
    coinCounter.textContent = coins;
}

// Crear el mapa
initializeMap();

// Mostrar una obra
function openWork(workId) {
    const selectedWork = works.find(work => work.id === workId);

    if (!selectedWork) {
        console.warn("Esta obra todavía no está disponible.");
        return;
    }

    // Cargar información
    workImage.src = selectedWork.image;
    workImage.alt = selectedWork.title;

    workTitle.textContent = selectedWork.title;
    workType.textContent = selectedWork.type;
    workAuthor.textContent = `Autor: ${selectedWork.author}`;
    workDate.textContent = `Fecha: ${selectedWork.date}`;
    workDescription.textContent = selectedWork.description;

    // Cargar y reproducir música automáticamente
    workAudio.src = selectedWork.music;
    workAudio.load();

    workAudio.play().catch(error => {
        console.log("El navegador requiere reproducción manual:", error);
    });

    // Cambiar de vista
    map.hidden = true;
    workView.hidden = false;

    window.scrollTo(0, 0);
}

// Detectar selección de salas

map.addEventListener("click", (event) => {
    const room = event.target.closest(".room");

    if (!room) return;

    // No permitir entrar a salas bloqueadas
    if (!room.classList.contains("available")) return;

    const roomId = Number(room.dataset.room);

    openWork(roomId);
});




// Regresar al mapa
backButton.addEventListener("click", () => {
    workAudio.pause();
    workAudio.removeAttribute("src");
    workAudio.load();

    workView.hidden = true;
    map.hidden = false;

    window.scrollTo(0, 0);
});
coinCounter.textContent = coins;

initializeMap();
