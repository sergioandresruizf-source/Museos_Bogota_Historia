document.addEventListener("DOMContentLoaded", () => {
    
    // --- Lógica del Enrutador (Router) ---
    const mainContent = document.getElementById('main-content');
    
    const renderizarVistas = () => {
        const hash = window.location.hash || '#/';
        
        // Efecto de animación
        mainContent.classList.remove('fade-transition');
        void mainContent.offsetWidth; // Trigger reflow
        mainContent.classList.add('fade-transition');

        if (hash === '#/') {
            // VISTA: INICIO
            mainContent.innerHTML = `
                <div class="hero">
                    <h1>Descubre el Oro Sagrado</h1>
                    <p>Una experiencia inmersiva por el arte, la metalurgia y la cosmología de las sociedades prehispánicas de Colombia.</p>
                    <a href="#/mapa" class="btn-primary">Entrar a la Bóveda</a>
                </div>
            `;
        } 
        else if (hash === '#/mapa') {
            // VISTA: MAPA / SALAS
            const tarjetasHtml = window.MUSEO.salas.map(sala => `
                <a href="#/sala/${sala.id}" class="card">
                    <h2>${sala.nombre}</h2>
                    <p>${sala.region}</p>
                </a>
            `).join('');
            
            mainContent.innerHTML = `
                <h1 style="text-align:center; font-size: 3rem; margin-bottom: 10px;">Culturas Prehispánicas</h1>
                <p style="text-align:center; color: var(--texto-secundario); margin-bottom: 40px;">Selecciona una región para explorar sus tesoros</p>
                <div class="grid-container">${tarjetasHtml}</div>
            `;
        } 
        else if (hash.startsWith('#/sala/')) {
            // VISTA: SALA ESPECÍFICA
            const salaId = hash.split('/')[2];
            const sala = window.MUSEO.salas.find(s => s.id === salaId);
            const piezasSala = window.MUSEO.piezas.filter(p => p.sala === salaId);
            
            if (sala) {
                const piezasHtml = piezasSala.length > 0 
                    ? piezasSala.map(p => `
                        <a href="#/pieza/${p.id}" class="card">
                            <h3 style="font-size:1.5rem; margin-bottom:5px;">${p.titulo}</h3>
                            <p style="color:var(--oro-claro)">Ver detalle &rarr;</p>
                        </a>
                      `).join('')
                    : `<p style="text-align:center; grid-column: 1/-1; color: var(--texto-secundario);">No hay piezas registradas en esta sala aún.</p>`;

                mainContent.innerHTML = `
                    <a href="#/mapa" class="btn-back">&larr; Volver a las culturas</a>
                    <div class="sala-header">
                        <h1>Sala ${sala.nombre}</h1>
                        <p>${sala.intro}</p>
                    </div>
                    <div class="grid-container">${piezasHtml}</div>
                `;
            } else {
                mainContent.innerHTML = `<h2>Sala no encontrada</h2><a href="#/mapa" class="btn-back">&larr; Volver</a>`;
            }
        }
        else if (hash.startsWith('#/pieza/')) {
            // VISTA: PIEZA INDIVIDUAL
            const piezaId = hash.split('/')[2];
            const pieza = window.MUSEO.piezas.find(p => p.id === piezaId);
            
            if (pieza) {
                const htmlAudioBtn = pieza.audio 
                    ? `<button onclick="reproducirAudio('${pieza.audio}', '${pieza.titulo}')" class="btn-primary" style="margin-top:20px; font-size: 1.1rem; padding: 10px 25px;">🎵 Escuchar Relato</button>` 
                    : '';

                // AQUI ESTÁ EL ARREGLO: Se cambió el div por una etiqueta <img> real
                mainContent.innerHTML = `
                    <a href="#/sala/${pieza.sala}" class="btn-back">&larr; Volver a la sala</a>
                    <div class="pieza-container">
                        <div class="pieza-imagen" style="padding: 0; overflow: hidden;">
                            <img src="assets/img/${pieza.img}" alt="${pieza.titulo}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px; background: rgba(0,0,0,0.5);">
                        </div>
                        <div class="pieza-info">
                            <h1>${pieza.titulo}</h1>
                            <div class="meta-datos">${pieza.periodo} | ${pieza.tecnica}</div>
                            <p>${pieza.desc}</p>
                            ${htmlAudioBtn}
                        </div>
                    </div>
                `;
            } else {
                mainContent.innerHTML = `<h2>Pieza no encontrada</h2><a href="#/mapa" class="btn-back">&larr; Volver</a>`;
            }
        }
    };

    // Escuchar cambios en la URL (Navegación)
    window.addEventListener('hashchange', renderizarVistas);
    renderizarVistas(); // Renderizar al cargar la página


    // --- Lógica de UI Global (Luz y Audio) ---
    
    // Botón de Luz
    const btnLuz = document.getElementById('btn-luz');
    btnLuz.addEventListener('click', () => {
        document.body.classList.toggle('luz-encendida');
    });

    // Cursor interactivo para el fondo
    document.addEventListener('mousemove', (e) => {
        if(!document.body.classList.contains('luz-encendida')){
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            const luz = document.getElementById('luz-ambiente');
            luz.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(212, 166, 58, 0.06) 0%, transparent 50%)`;
        }
    });

    // Reproductor de Audio
    const audioElement = document.getElementById('audio-elemento');
    const panelAudio = document.getElementById('reproductor-audio');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnMute = document.getElementById('btn-mute');
    const trackName = document.getElementById('track-name');

    window.reproducirAudio = (archivo, titulo) => {
        trackName.textContent = titulo;
        panelAudio.classList.remove('colapsado');
        
        // AQUI ESTÁ EL ARREGLO 2: Descomenté las líneas para que el audio sí suene
        audioElement.src = 'assets/audio/' + archivo;
        audioElement.play();
        
        btnPlayPause.textContent = '⏸';
    };

    btnPlayPause.addEventListener('click', () => {
        if(btnPlayPause.textContent === '⏸') {
            btnPlayPause.textContent = '▶';
            audioElement.pause();
        } else {
            btnPlayPause.textContent = '⏸';
            audioElement.play(); 
        }
    });

    btnMute.addEventListener('click', () => {
        audioElement.muted = !audioElement.muted;
        btnMute.textContent = audioElement.muted ? '🔇' : '🔊';
    });
});
