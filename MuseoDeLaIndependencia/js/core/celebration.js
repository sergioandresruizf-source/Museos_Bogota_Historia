
export function showCelebration() {

    const overlay = document.getElementById("celebration-overlay");
    const particlesContainer = document.getElementById("celebration-particles");

    console.log("Celebración ejecutada");
    console.log("Overlay:", overlay);
    console.log("Partículas:", particlesContainer);


    if (!overlay || !particlesContainer) {
        console.warn("No se encontró la pantalla de celebración.");
        return;
    }

    // Limpiar partículas anteriores
    particlesContainer.innerHTML = "";

    // Mostrar celebración
    overlay.hidden = false;

    // Crear explosión de estrellas y monedas
    const symbols = ["★", "✦", "✧", "●", "✺"];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("span");

        particle.classList.add("celebration-particle");

        particle.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 300;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty("--x", `${x}px`);
        particle.style.setProperty("--y", `${y}px`);

        particle.style.setProperty(
            "--size",
            `${12 + Math.random() * 20}px`
        );

        particle.style.setProperty(
            "--duration",
            `${1.2 + Math.random() * 1.3}s`
        );

        particlesContainer.appendChild(particle);
    }
}

// Cerrar celebración
export function hideCelebration() {

    const overlay = document.getElementById("celebration-overlay");

    if (overlay) {
        overlay.hidden = true;
    }

}
