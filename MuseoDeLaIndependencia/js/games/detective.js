
let currentCase = null;
let revealedClues = 0;
let selectedAnswer = null;
let onCompleteCallback = null;
let caseFinished = false;

export function initializeDetective(caseData, onComplete) {

    if (
        !caseData ||
        !caseData.clues ||
        !caseData.options ||
        typeof caseData.correctAnswer !== "number"
    ) {
        console.error("El expediente del detective está incompleto.");
        return false;
    }

    currentCase = caseData;
    revealedClues = 0;
    selectedAnswer = null;
    onCompleteCallback = onComplete;
    caseFinished = false;

    renderDetective();

    return true;
}

// ------------------------------------
// MOSTRAR EL EXPEDIENTE
// ------------------------------------

function renderDetective() {

    const container = document.getElementById("detective-container");

    if (!container) {
        console.error("No se encontró detective-container.");
        return;
    }

    container.innerHTML = `
        <div class="detective-game">

            <div class="detective-case-header">
                <p>ARCHIVO DE INVESTIGACIÓN</p>
                <h2>${currentCase.title}</h2>
                <span>${currentCase.subtitle}</span>
            </div>

            <div class="detective-introduction">
                <p>${currentCase.introduction}</p>
            </div>

            <div class="detective-progress">
                <span>PISTAS DESCUBIERTAS</span>
                <strong>${revealedClues} / ${currentCase.clues.length}</strong>
            </div>

            <div class="detective-clues">

                ${currentCase.clues.slice(0, revealedClues).map(clue => `
                    <div class="detective-clue">
                        <h3>${clue.title}</h3>
                        <p>${clue.text}</p>
                    </div>
                `).join("")}

            </div>

            ${!caseFinished ? renderInvestigation() : renderResolution()}

        </div>
    `;

    if (!caseFinished) {
        connectInvestigationEvents();
    } else {
        connectResolutionEvents();
    }
}

// ------------------------------------
// MOSTRAR INVESTIGACIÓN
// ------------------------------------

function renderInvestigation() {

    if (revealedClues < currentCase.clues.length) {

        return `
            <div class="detective-action">

                <p>
                    Examina el expediente y descubre nuevas pistas
                    antes de emitir tu conclusión.
                </p>

                <button id="reveal-clue">
                    Revelar siguiente pista
                </button>

            </div>
        `;
    }

    return `
        <div class="detective-question">

            <h3>VEREDICTO DEL INVESTIGADOR</h3>

            <p>${currentCase.question}</p>

            <div class="detective-options">

                ${currentCase.options.map((option, index) => `
                    <button
                        class="detective-option"
                        data-answer="${index}"
                        ${selectedAnswer !== null ? "disabled" : ""}
                    >
                        ${option}
                    </button>
                `).join("")}

            </div>

            ${selectedAnswer !== null ? `
                <div class="detective-feedback">
                    <p>
                        ${selectedAnswer === currentCase.correctAnswer
                            ? "¡Conclusión correcta! Has resuelto el expediente."
                            : "Esa conclusión no coincide con las pruebas. Examina nuevamente las pistas."}
                    </p>

                    <button id="detective-confirm">
                        ${selectedAnswer === currentCase.correctAnswer
                            ? "Consultar resolución"
                            : "Volver a investigar"}
                    </button>
                </div>
            ` : ""}

        </div>
    `;
}

// ------------------------------------
// CONECTAR EVENTOS
// ------------------------------------

function connectInvestigationEvents() {

    const revealButton = document.getElementById("reveal-clue");

    if (revealButton) {
        revealButton.addEventListener("click", () => {

            revealedClues++;

            renderDetective();

        });
    }

    document.querySelectorAll(".detective-option").forEach(button => {

        button.addEventListener("click", () => {

            selectedAnswer = Number(button.dataset.answer);

            renderDetective();

        });

    });

    const confirmButton = document.getElementById("detective-confirm");

    if (confirmButton) {

        confirmButton.addEventListener("click", () => {

            if (selectedAnswer === currentCase.correctAnswer) {

                caseFinished = true;

            } else {

                selectedAnswer = null;

            }

            renderDetective();

        });

    }
}

// ------------------------------------
// MOSTRAR RESOLUCIÓN
// ------------------------------------

function renderResolution() {

    return `
        <div class="detective-resolution">

            <p class="detective-stamp">EXPEDIENTE RESUELTO</p>

            <h3>Resolución histórica</h3>

            <p>${currentCase.resolution}</p>

            <div class="detective-historical-note">

                <h4>ARCHIVO HISTÓRICO</h4>

                <p>${currentCase.historicalNote}</p>

            </div>

            <button id="detective-finish">
                Finalizar investigación
            </button>

        </div>
    `;
}

// ------------------------------------
// FINALIZAR ACTIVIDAD
// ------------------------------------

function connectResolutionEvents() {

    const finishButton = document.getElementById("detective-finish");

    if (finishButton) {

        finishButton.addEventListener("click", () => {

            if (onCompleteCallback) {
                onCompleteCallback();
            }

        });

    }

}
