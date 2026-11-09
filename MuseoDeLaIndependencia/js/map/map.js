export function initializeMap({
    completedWorks = [],
    unlockedWorks = [1, 2, 3]
} = {}) {

    const map = document.getElementById("museum-map");

    const workNode = (id, x, y) => {

        // Determinar el estado de la sala
        let statusClass = "locked";

        if (completedWorks.includes(id)) {
            statusClass = "completed";
        } else if (unlockedWorks.includes(id)) {
            statusClass = "available";
        }

        // Mostrar el candado únicamente si está bloqueada
        const lockIcon = statusClass === "locked" ? `
            <g class="lock-icon" transform="translate(${x}, ${y})">
                <rect x="-6" y="-2" width="12" height="9" rx="2"/>
                <path d="M-4 -2 V-5 A4 4 0 0 1 4 -5 V-2"/>
                <circle cx="0" cy="2" r="1"/>
            </g>
        ` : "";

        // Mostrar una marca si está completada
        const completedIcon = statusClass === "completed" ? `
            <text class="completed-icon" x="${x}" y="${y + 7}">
                ✓
            </text>
        ` : "";

        return `
            <g class="room ${statusClass}" data-room="${id}">

                <circle class="outer-ring" cx="${x}" cy="${y}" r="32"/>

                <circle class="inner-ring" cx="${x}" cy="${y}" r="25"/>

                <circle class="node-center" cx="${x}" cy="${y}" r="19"/>

                ${lockIcon}
                ${completedIcon}

                <text class="work-label" x="${x}" y="${y + 43}">
                    OBRA ${id}
                </text>

            </g>
        `;
    };

    map.innerHTML = `
        <svg
            viewBox="0 0 800 460"
            class="museum-svg"
            xmlns="http://www.w3.org/2000/svg"
        >

            <g class="paths">

                <path d="M400 91 L200 168"/>
                <path d="M400 91 L600 168"/>

                <path d="M200 232 L100 345"/>
                <path d="M200 232 L300 345"/>

                <path d="M600 232 L500 345"/>
                <path d="M600 232 L700 345"/>

            </g>

            <g class="entry-node">

                <circle class="entry-outer" cx="400" cy="65" r="33"/>
                <circle class="entry-inner" cx="400" cy="65" r="24"/>

                <text class="entry-symbol" x="400" y="72">✿</text>

                <text class="entry-label" x="400" y="112">
                    COMIENZA AQUÍ
                </text>

            </g>

            ${workNode(1, 200, 200)}
            ${workNode(2, 600, 200)}

            ${workNode(3, 100, 345)}
            ${workNode(4, 300, 345)}
            ${workNode(5, 500, 345)}
            ${workNode(6, 700, 345)}

        </svg>
    `;
}