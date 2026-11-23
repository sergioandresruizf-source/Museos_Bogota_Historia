
import { works } from "../data/work.js";

export function initializeMap({
    completedWorks = [],
    unlockedWorks = [1, 2, 3]
} = {}) {

    const map = document.getElementById("museum-map");

    // Posiciones de las siete salas principales.
    const mainRooms = [
        { x: 400, y: 150 },
        { x: 340, y: 400 },
        { x: 450, y: 650 },
        { x: 360, y: 900 },
        { x: 440, y: 1150 },
        { x: 350, y: 1400 },
        { x: 420, y: 1650 }
    ];

    // Posiciones irregulares de las seis salas secundarias.
    const branchOffsets = [
        { x: -250, y: 65 },
        { x: -130, y: 130 },
        { x: 130, y: 130 },
        { x: 250, y: 65 },
        { x: -180, y: 195 },
        { x: 180, y: 195 }
    ];

    const positions = [];

    // Construir las posiciones de las 49 obras.
    mainRooms.forEach((main, groupIndex) => {

        const mainId = groupIndex * 7 + 1;

        positions.push({
            id: mainId,
            x: main.x,
            y: main.y,
            main: true
        });

        branchOffsets.forEach((offset, branchIndex) => {
            const workId = mainId + branchIndex + 1;

            if (workId > works.length) return;

            positions.push({
                id: workId,
                x: main.x + offset.x,
                y: main.y + offset.y,
                main: false,
                parent: mainId
            });
        });
    });

    // Crear cada sala.
    const workNode = (id, x, y) => {

        let statusClass = "locked";

        if (completedWorks.includes(id)) {
            statusClass = "completed";
        } else if (unlockedWorks.includes(id)) {
            statusClass = "available";
        }

        const lockIcon = statusClass === "locked" ? `
            <g class="lock-icon" transform="translate(${x}, ${y})">
                <rect x="-6" y="-2" width="12" height="9" rx="2"/>
                <path d="M-4 -2 V-5 A4 4 0 0 1 4 -5 V-2"/>
                <circle cx="0" cy="2" r="1"/>
            </g>
        ` : "";

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

    // Conexiones del recorrido principal y sus ramificaciones.
    let paths = `
        <path d="M400 91 L400 118"/>
    `;

    mainRooms.forEach((main, groupIndex) => {

        const mainId = groupIndex * 7 + 1;

        // Conectar cada sala principal con sus seis ramificaciones.
        branchOffsets.forEach(offset => {
            paths += `
                <path d="M${main.x} ${main.y} L${main.x + offset.x} ${main.y + offset.y}"/>
            `;
        });

        // Conectar con la siguiente sala principal.
        if (groupIndex < mainRooms.length - 1) {
            const next = mainRooms[groupIndex + 1];

            paths += `
                <path d="M${main.x} ${main.y} L${next.x} ${next.y}"/>
            `;
        }
    });

    const nodes = positions
        .filter(position => position.id <= works.length)
        .map(position =>
            workNode(position.id, position.x, position.y)
        )
        .join("");

    map.innerHTML = `
        <svg
            viewBox="0 0 800 1800"
            class="museum-svg"
            xmlns="http://www.w3.org/2000/svg"
        >

            <g class="paths">
                ${paths}
            </g>

            <g class="entry-node">
                <circle class="entry-outer" cx="400" cy="65" r="33"/>
                <circle class="entry-inner" cx="400" cy="65" r="24"/>

                <text class="entry-symbol" x="400" y="72">✿</text>

                <text class="entry-label" x="400" y="112">
                    COMIENZA AQUÍ
                </text>
            </g>

            ${nodes}

        </svg>
    `;
}


export function getConnectedWorkIds(workId) {
    const groupIndex = Math.floor((workId - 1) / 7);
    const mainId = groupIndex * 7 + 1;

    // Si se completa una ramificación,
    // su única conexión es la sala principal.
    if (workId !== mainId) {
        return [mainId];
    }

    // Si se completa una sala principal,
    // desbloquea sus seis ramificaciones.
    const connectedWorks = [];

    for (let i = 1; i <= 6; i++) {
        const branchId = mainId + i;

        if (branchId <= works.length) {
            connectedWorks.push(branchId);
        }
    }

    // También conecta con la siguiente sala principal.
    const nextMainId = mainId + 7;

    if (nextMainId <= works.length) {
        connectedWorks.push(nextMainId);
    }

    return connectedWorks;
}
