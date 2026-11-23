
let currentWord = "";
let guessedLetters = [];
let mistakes = 0;
let onCompleteCallback = null;

const MAX_MISTAKES = 6;
const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function normalizeLetter(letter) {
    return letter.toUpperCase()
        .replace(/Ñ/g, "§")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/§/g, "Ñ");
}

export function initializeHangman(wordData, onComplete) {
    if (!wordData || !wordData.word || !wordData.clue) {
        console.error("Los datos del ahorcado están incompletos.");
        return false;
    }

    currentWord = normalizeLetter(wordData.word);
    guessedLetters = [];
    mistakes = 0;
    onCompleteCallback = onComplete;

    renderHangman(wordData);
    return true;
}

function renderHangman(wordData) {
    const container = document.getElementById("hangman-container");

    if (!container) {
        console.error("No se encontró hangman-container.");
        return;
    }

    const won = [...currentWord].every(letter =>
        guessedLetters.includes(letter)
    );

    const lost = mistakes >= MAX_MISTAKES;
    const finished = won || lost;

    const displayedWord = [...currentWord].map(letter =>
        guessedLetters.includes(letter) ? letter : "_"
    );

    const remainingSeals = MAX_MISTAKES - mistakes;

    container.innerHTML = `
        <div class="hangman-game">

            <div class="hangman-clue">
                <span>PISTA HISTÓRICA</span>
                <p>${wordData.clue}</p>
            </div>

            <div class="hangman-document">
                <p class="hangman-document-title">
                    DOCUMENTO HISTÓRICO
                </p>

                <div class="hangman-word">
                    ${displayedWord.map(letter => `
                        <span>${letter}</span>
                    `).join("")}
                </div>

                <div class="hangman-seals">
                    ${Array.from({ length: MAX_MISTAKES }, (_, index) => `
                        <span class="${index < remainingSeals ? "seal-active" : "seal-lost"}">
                            ✦
                        </span>
                    `).join("")}
                </div>

                <p class="hangman-attempts">
                    Sellos de conservación restantes:
                    <strong>${remainingSeals}</strong>
                </p>
            </div>

            ${finished ? `
                <div class="hangman-feedback">
                    <h3>${won ? "¡Palabra descubierta!" : "La palabra era: " + currentWord}</h3>

                    <p>
                        ${won
                            ? wordData.explanation
                            : "Puedes volver a intentarlo y descubrir el concepto histórico."
                        }
                    </p>

                    ${won
                        ? `<button id="hangman-finish">Finalizar actividad</button>`
                        : `<button id="hangman-retry">Intentar nuevamente</button>`
                    }
                </div>
            ` : `
                <p class="hangman-instruction">
                    Selecciona las letras para descubrir la palabra.
                </p>

                <div class="hangman-alphabet">
                    ${alphabet.map(letter => `
                        <button
                            class="hangman-letter"
                            data-letter="${letter}"
                            ${guessedLetters.includes(letter) ? "disabled" : ""}
                        >
                            ${letter}
                        </button>
                    `).join("")}
                </div>
            `}

        </div>
    `;

    if (finished) {
        if (won) {
            document.getElementById("hangman-finish")
                .addEventListener("click", () => {
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                });
        } else {
            document.getElementById("hangman-retry")
                .addEventListener("click", () => {
                    initializeHangman(wordData, onCompleteCallback);
                });
        }

        return;
    }

    container.querySelectorAll(".hangman-letter").forEach(button => {
        button.addEventListener("click", () => {
            selectLetter(button.dataset.letter, wordData);
        });
    });
}

function selectLetter(letter, wordData) {
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    if (!currentWord.includes(letter)) {
        mistakes++;
    }

    renderHangman(wordData);
}
