
let events = [];
let onCompleteCallback = null;

export function initializeTimeline(timelineData, onComplete) {

    if (!timelineData || timelineData.length !== 5) {
        console.error("La línea del tiempo necesita cinco acontecimientos.");
        return false;
    }

    events = timelineData.map((event, index) => ({
        ...event,
        originalIndex: index
    }));

    // Desordenar acontecimientos
    events.sort(() => Math.random() - 0.5);

    onCompleteCallback = onComplete;

    renderTimeline();

    return true;
}

function renderTimeline() {

    const container = document.getElementById("timeline-container");

    if (!container) {
        console.error("No se encontró timeline-container.");
        return;
    }

    container.innerHTML = `
        <div class="timeline-instructions">
            Organiza los acontecimientos desde el más antiguo
            hasta el más reciente.
        </div>

        <div class="timeline-events">

            ${events.map((event, index) => `
                <article class="timeline-event">

                    <span class="timeline-number">
                        ${index + 1}
                    </span>

                    <div class="timeline-event-info">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                    </div>

                    <div class="timeline-controls">

                        <button
                            data-index="${index}"
                            data-direction="-1"
                            ${index === 0 ? "disabled" : ""}
                            aria-label="Subir acontecimiento">
                            ↑
                        </button>

                        <button
                            data-index="${index}"
                            data-direction="1"
                            ${index === events.length - 1 ? "disabled" : ""}
                            aria-label="Bajar acontecimiento">
                            ↓
                        </button>

                    </div>

                </article>
            `).join("")}

        </div>

        <button id="timeline-check">
            Comprobar orden
        </button>

        <div id="timeline-feedback" aria-live="polite"></div>
    `;

    container.querySelectorAll(".timeline-controls button").forEach(button => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);
            const direction = Number(button.dataset.direction);

            moveEvent(index, direction);

        });

    });

    document.getElementById("timeline-check")
        .addEventListener("click", checkTimeline);
}

function moveEvent(index, direction) {

    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= events.length) return;

    [events[index], events[newIndex]] =
        [events[newIndex], events[index]];

    renderTimeline();
}

function checkTimeline() {

    const correct = events.every(
        (event, index) => event.originalIndex === index
    );

    const feedback = document.getElementById("timeline-feedback");

    if (correct) {

        feedback.innerHTML = `
            <h3>¡Excelente trabajo!</h3>
            <p>Has organizado correctamente los acontecimientos históricos.</p>
            <button id="timeline-finish">Finalizar actividad</button>
        `;

        document.getElementById("timeline-finish")
            .addEventListener("click", () => {

                if (onCompleteCallback) {
                    onCompleteCallback();
                }

            });

    } else {

        feedback.innerHTML = `
            <h3>El orden todavía no es correcto.</h3>
            <p>Revisa las fechas y vuelve a intentarlo.</p>
        `;

    }
}
