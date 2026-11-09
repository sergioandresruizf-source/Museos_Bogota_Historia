
export function initializeMap() {
    const map = document.getElementById("museum-map");

    const workNode = (id, x, y) => `
        <g class="room ${id <= 3 ? "available" : "locked"}" data-room="${id}">

            <!-- Aro exterior -->
            <circle class="outer-ring" cx="${x}" cy="${y}" r="32"/>

            <!-- Aro interior -->
            <circle class="inner-ring" cx="${x}" cy="${y}" r="25"/>

            <!-- Centro -->
            <circle class="node-center" cx="${x}" cy="${y}" r="19"/>

            <!-- Candado -->
            <g class="lock-icon" transform="translate(${x}, ${y})">
                <rect x="-6" y="-2" width="12" height="9" rx="2"/>
                <path d="M-4 -2 V-5 A4 4 0 0 1 4 -5 V-2"/>
                <circle cx="0" cy="2" r="1"/>
            </g>

            <!-- Nombre -->
            <text class="work-label" x="${x}" y="${y + 43}">
                OBRA ${id}
            </text>

        </g>
    `;

    map.innerHTML = `
        <svg
            viewBox="0 0 800 460"
            class="museum-svg"
            xmlns="http://www.w3.org/2000/svg"
        >

            <!-- CONEXIONES -->
            <g class="paths">

                <path d="M400 91 L200 168"/>
                <path d="M400 91 L600 168"/>

                <path d="M200 232 L100 345"/>
                <path d="M200 232 L300 345"/>

                <path d="M600 232 L500 345"/>
                <path d="M600 232 L700 345"/>

            </g>

            <!-- ENTRADA -->
            <g class="entry-node">

                <circle class="entry-outer" cx="400" cy="65" r="33"/>
                <circle class="entry-inner" cx="400" cy="65" r="24"/>

                <text class="entry-symbol" x="400" y="72">✿</text>

                <text class="entry-label" x="400" y="112">
                    COMIENZA AQUÍ
                </text>

            </g>

            <!-- SALAS INTERMEDIAS -->
            ${workNode(1, 200, 200)}
            ${workNode(2, 600, 200)}

            <!-- SALAS INFERIORES -->
            ${workNode(3, 100, 345)}
            ${workNode(4, 300, 345)}
            ${workNode(5, 500, 345)}
            ${workNode(6, 700, 345)}

        </svg>
    `;
}
