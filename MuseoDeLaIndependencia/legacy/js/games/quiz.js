
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let answered = false;
let onCompleteCallback = null;

export function initializeQuiz(questions, onComplete) {

    if (!questions || questions.length !== 5) {
        console.error("El quiz necesita exactamente cinco preguntas.");
        return false;
    }

    currentQuestions = questions;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    answered = false;
    onCompleteCallback = onComplete;

    renderQuestion();

    return true;
}

function renderQuestion() {

    const container = document.getElementById("quiz-container");

    if (!container) {
        console.error("No se encontró quiz-container.");
        return;
    }

    const question = currentQuestions[currentQuestionIndex];

    answered = false;

    container.innerHTML = `
        <div class="quiz-progress">
            <span>Pregunta ${currentQuestionIndex + 1} de 5</span>
            <div class="quiz-progress-track">
                <div class="quiz-progress-fill"
                     style="width: ${(currentQuestionIndex + 1) * 20}%">
                </div>
            </div>
        </div>

        <h2 class="quiz-question">${question.question}</h2>

        <div class="quiz-options">
            ${question.options.map((option, index) => `
                <button class="quiz-option" data-index="${index}">
                    ${option}
                </button>
            `).join("")}
        </div>

        <div id="quiz-feedback" aria-live="polite"></div>
    `;

    container.querySelectorAll(".quiz-option").forEach(button => {
        button.addEventListener("click", () => {
            checkAnswer(Number(button.dataset.index));
        });
    });
}

function checkAnswer(selectedIndex) {

    if (answered) return;

    answered = true;

    const question = currentQuestions[currentQuestionIndex];
    const feedback = document.getElementById("quiz-feedback");
    const buttons = document.querySelectorAll(".quiz-option");

    const correct = selectedIndex === question.correct;

    if (correct) {
        correctAnswers++;
    }

    buttons.forEach((button, index) => {

        button.disabled = true;

        if (index === question.correct) {
            button.classList.add("correct");
        } else if (index === selectedIndex) {
            button.classList.add("incorrect");
        }

    });

    feedback.innerHTML = `
        <p class="${correct ? "correct-text" : "incorrect-text"}">
            ${correct ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
        </p>
        <p>${question.explanation}</p>

        <button id="quiz-next">
            ${currentQuestionIndex === 4 ? "Finalizar actividad" : "Siguiente pregunta →"}
        </button>
    `;

    document.getElementById("quiz-next").addEventListener("click", nextQuestion);
}

function nextQuestion() {

    currentQuestionIndex++;

    if (currentQuestionIndex >= currentQuestions.length) {

        const container = document.getElementById("quiz-container");

        container.innerHTML = `
            <div class="quiz-results">
                <h2>¡Actividad completada!</h2>
                <p>Has respondido correctamente ${correctAnswers} de 5 preguntas.</p>
                <p>¡Gracias por seguir descubriendo nuestra historia!</p>
            </div>
        `;

        if (onCompleteCallback) {
            onCompleteCallback();
        }

        return;
    }

    renderQuestion();
}
