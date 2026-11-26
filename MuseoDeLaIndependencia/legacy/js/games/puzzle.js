
export function initializePuzzle(image, onComplete) {

    const board = document.getElementById("puzzle-board");
    const message = document.getElementById("puzzle-message");

    // Crear las nueve posiciones originales
    let pieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    let selectedSlot = null;
    let completed = false;

    // ------------------------------------
    // DESORDENAR LAS PIEZAS
    // ------------------------------------

    function shufflePieces() {

        for (let i = pieces.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }

        // Evitar que el rompecabezas aparezca resuelto
        if (pieces.every((piece, index) => piece === index)) {
            [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
        }
    }

    // ------------------------------------
    // DIBUJAR EL TABLERO
    // ------------------------------------

    function renderPuzzle() {

        board.innerHTML = "";

        pieces.forEach((piece, slot) => {

            const button = document.createElement("button");

            button.classList.add("puzzle-piece");
            button.type = "button";

            // Imagen de fondo
            button.style.backgroundImage = `url("${image}")`;

            // Calcular la posición de la pieza original
            const column = piece % 3;
            const row = Math.floor(piece / 3);

            const x = column * 50;
            const y = row * 50;

            button.style.backgroundPosition = `${x}% ${y}%`;

            button.setAttribute(
                "aria-label",
                `Pieza ${slot + 1}`
            );

            button.addEventListener("click", () => {
                selectPiece(slot);
            });

            board.appendChild(button);
        });
    }

    // ------------------------------------
    // SELECCIONAR E INTERCAMBIAR
    // ------------------------------------

    function selectPiece(slot) {

        if (completed) return;

        const buttons = board.querySelectorAll(".puzzle-piece");

        // Primera selección
        if (selectedSlot === null) {

            selectedSlot = slot;

            buttons[slot].classList.add("selected");

            message.textContent = "Ahora selecciona otra pieza.";

            return;
        }

        // Seleccionar la misma pieza cancela la selección
        if (selectedSlot === slot) {

            buttons[slot].classList.remove("selected");

            selectedSlot = null;

            message.textContent = "Selecciona dos piezas para intercambiarlas.";

            return;
        }

        // Intercambiar posiciones
        [pieces[selectedSlot], pieces[slot]] =
            [pieces[slot], pieces[selectedSlot]];

        selectedSlot = null;

        renderPuzzle();

        // Comprobar si se resolvió
        checkCompletion();
    }

    // ------------------------------------
    // COMPROBAR SI ESTÁ RESUELTO
    // ------------------------------------

    function checkCompletion() {

        const solved = pieces.every(
            (piece, index) => piece === index
        );

        if (!solved) {

            message.textContent = "¡Bien! Sigue ordenando las piezas.";

            return;
        }

        completed = true;

        message.textContent = "¡Felicidades! Has reconstruido la pintura.";

        // Avisar al sistema principal
        if (typeof onComplete === "function") {
            onComplete();
        }
    }

    // ------------------------------------
    // INICIAR
    // ------------------------------------

    shufflePieces();

    renderPuzzle();

    message.textContent =
        "Selecciona dos piezas para intercambiar sus posiciones.";
}
