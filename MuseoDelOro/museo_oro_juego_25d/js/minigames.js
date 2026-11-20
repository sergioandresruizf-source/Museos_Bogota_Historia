// Lógica del Taller de Orfebrería, Vestidor y Visor de Esculturas

let piezaForjaActual = null;
let pasoForja = 1;
let progresoForja = 0;

function abrirTallerOrfebreria() {
    const modal = document.getElementById('modal-craft');
    const selector = document.getElementById('craft-selector');
    const workspace = document.getElementById('craft-workspace');
    workspace.classList.add('hidden');
    
    selector.innerHTML = window.OBRAS_MUSEO.map(obra => `
        <div class="craft-item-btn ${obra.creadaInicialmente ? 'done' : ''}" onclick="seleccionarObraForja('${obra.id}')">
            <span class="craft-item-emoji">${obra.emoji}</span>
            <span class="craft-item-name">${obra.titulo.split('(')[0]}</span>
            <span class="craft-item-status">${obra.creadaInicialmente ? '✅ En Casita Sagrada' : '🔨 Clic para forjar'}</span>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
}

function seleccionarObraForja(obraId) {
    piezaForjaActual = window.OBRAS_MUSEO.find(o => o.id === obraId);
    if (!piezaForjaActual) return;
    
    pasoForja = 1;
    progresoForja = 0;
    
    document.getElementById('craft-workspace').classList.remove('hidden');
    document.getElementById('craft-piece-title').textContent = piezaForjaActual.titulo;
    actualizarUICraft();
}

function actualizarUICraft() {
    document.getElementById('step-1').classList.toggle('active', pasoForja === 1);
    document.getElementById('step-2').classList.toggle('active', pasoForja === 2);
    document.getElementById('step-3').classList.toggle('active', pasoForja === 3);
    
    const emojiEl = document.getElementById('craft-visual-emoji');
    const instEl = document.getElementById('craft-instruction');
    const btnEl = document.getElementById('btn-craft-action');
    const fillEl = document.getElementById('craft-progress-fill');
    
    fillEl.style.width = progresoForja + '%';
    
    if (pasoForja === 1) {
        emojiEl.textContent = '🔥';
        instEl.textContent = 'Paso 1: Haz clic 3 veces para fundir el oro y el cobre en el crisol.';
        btnEl.textContent = '🔥 Avivar Fuego del Crisol';
    } else if (pasoForja === 2) {
        emojiEl.textContent = '🏺';
        instEl.textContent = 'Paso 2: Vierte el oro líquido en el molde de arcilla y cera perdida.';
        btnEl.textContent = '✨ Verter Oro Fundido';
    } else if (pasoForja === 3) {
        emojiEl.textContent = piezaForjaActual.emoji;
        instEl.textContent = 'Paso 3: ¡Pule la superficie hasta que brille como el sol!';
        btnEl.textContent = '🌟 Pulir y Terminar Obra';
    }
}

function avanzarPasoForja() {
    const emojiEl = document.getElementById('craft-visual-emoji');
    emojiEl.style.transform = 'scale(1.25)';
    setTimeout(() => emojiEl.style.transform = 'scale(1)', 150);
    
    progresoForja += 34;
    if (progresoForja >= 100) {
        progresoForja = 0;
        pasoForja++;
        if (pasoForja > 3) {
            // Obra terminada!
            piezaForjaActual.creadaInicialmente = true;
            if (window.Engine25D) {
                window.Engine25D.sincronizarPedestales();
                window.Engine25D.spawnFloatingText("¡Obra creada y enviada a la Casita Sagrada!", "#F7DC88");
            }
            abrirTallerOrfebreria();
            return;
        }
    }
    actualizarUICraft();
}

// VESTIDOR DEL INDÍGENA
function abrirVestidor() {
    const modal = document.getElementById('modal-wardrobe');
    const container = document.getElementById('wardrobe-items');
    
    container.innerHTML = window.JOYAS_INDIGENA.map(joya => `
        <div class="wardrobe-item ${joya.equipada ? 'equipped' : ''}" onclick="toggleJoya('${joya.id}')">
            <div>
                <strong style="color: var(--gold-light); font-size: 1rem;">${joya.emoji} ${joya.nombre}</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted);">${joya.desc}</div>
            </div>
            <span style="font-weight: 700; color: ${joya.equipada ? '#4ECCA3' : '#888'};">
                ${joya.equipada ? 'EQUIPADO' : 'Equipar'}
            </span>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
    dibujarPreviewIndigena();
}

function toggleJoya(joyaId) {
    const joya = window.JOYAS_INDIGENA.find(j => j.id === joyaId);
    if (joya) {
        joya.equipada = !joya.equipada;
        abrirVestidor();
    }
}

function dibujarPreviewIndigena() {
    const canvas = document.getElementById('previewCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = 90, cy = 135;
    // Aura dorada
    const grad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy - 20, 85);
    grad.addColorStop(0, 'rgba(212, 166, 58, 0.35)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 180, 220);
    
    // Cuerpo / Túnica ancestral
    ctx.fillStyle = '#D9C7A3';
    ctx.beginPath();
    ctx.roundRect(cx - 24, cy - 28, 48, 68, 12);
    ctx.fill();
    
    // Banda roja/terracota
    ctx.fillStyle = '#A63A2B';
    ctx.fillRect(cx - 24, cy + 5, 48, 10);
    
    // Cabeza
    ctx.fillStyle = '#B87A4B';
    ctx.beginPath();
    ctx.arc(cx, cy - 48, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Cabello
    ctx.fillStyle = '#1A120B';
    ctx.beginPath();
    ctx.arc(cx, cy - 52, 23, Math.PI, 0);
    ctx.fill();
    
    // Ojos
    ctx.fillStyle = '#1A120B';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 48, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 48, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    const hasDiadema = window.JOYAS_INDIGENA.find(j => j.id === 'diadema')?.equipada;
    const hasNariguera = window.JOYAS_INDIGENA.find(j => j.id === 'nariguera')?.equipada;
    const hasPectoral = window.JOYAS_INDIGENA.find(j => j.id === 'pectoral')?.equipada;
    const hasPoporo = window.JOYAS_INDIGENA.find(j => j.id === 'poporo')?.equipada;
    
    if (hasDiadema) {
        ctx.fillStyle = '#F7DC88';
        ctx.strokeStyle = '#D4A63A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 64);
        ctx.lineTo(cx - 12, cy - 84);
        ctx.lineTo(cx, cy - 72);
        ctx.lineTo(cx + 12, cy - 84);
        ctx.lineTo(cx + 22, cy - 64);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    if (hasNariguera) {
        ctx.strokeStyle = '#F7DC88';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy - 41, 8, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    }
    
    if (hasPectoral) {
        ctx.fillStyle = '#D4A63A';
        ctx.beginPath();
        ctx.arc(cx, cy - 12, 16, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#F7DC88';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    if (hasPoporo) {
        ctx.fillStyle = '#F7DC88';
        ctx.beginPath();
        ctx.arc(cx + 34, cy - 2, 10, 0, Math.PI * 2);
        ctx.arc(cx + 34, cy - 13, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// VISOR DE ESCULTURA AL ACERCARSE
let audioObraActual = null;

function abrirVisorObra(obra, contextoTexto) {
    document.getElementById('art-context-badge').textContent = contextoTexto;
    document.getElementById('art-title').textContent = obra.titulo;
    document.getElementById('art-meta').textContent = `${obra.cultura} · ${obra.periodo} · ${obra.tecnica}`;
    document.getElementById('art-desc').textContent = obra.descripcion;
    
    const imgEl = document.getElementById('art-img');
    const fallbackEl = document.getElementById('art-fallback-svg');
    imgEl.classList.remove('hidden');
    fallbackEl.classList.add('hidden');
    
    // Intentar cargar las posibles rutas de imagen en assets/img/
    let idx = 0;
    const intentarCargarImagen = () => {
        if (idx >= obra.imagenesPosibles.length) {
            imgEl.classList.add('hidden');
            fallbackEl.classList.remove('hidden');
            fallbackEl.innerHTML = `<div style="font-size: 5rem; filter: drop-shadow(0 0 20px #D4A63A);">${obra.emoji}</div><p style="font-size:0.8rem; color:#B9AE98; margin-top:10px;">Coloca <strong>${obra.imagenesPosibles[0]}</strong> en assets/img/</p>`;
            return;
        }
        imgEl.src = 'assets/img/' + obra.imagenesPosibles[idx];
        idx++;
    };
    imgEl.onerror = intentarCargarImagen;
    intentarCargarImagen();
    
    // Preparar audio
    const audioEl = document.getElementById('bg-audio');
    audioEl.pause();
    audioObraActual = obra.audioPosibles || [];
    document.getElementById('btn-art-audio').textContent = '🎵 Escuchar Relato de la Obra';
    document.getElementById('art-audio-status').textContent = '';
    
    document.getElementById('modal-artifact').classList.remove('hidden');
}

function toggleAudioObra() {
    const audioEl = document.getElementById('bg-audio');
    const statusEl = document.getElementById('art-audio-status');
    const btnEl = document.getElementById('btn-art-audio');
    
    if (!audioEl.paused) {
        audioEl.pause();
        btnEl.textContent = '🎵 Escuchar Relato de la Obra';
        statusEl.textContent = 'Audio en pausa.';
        return;
    }
    
    if (!audioObraActual || audioObraActual.length === 0) return;
    
    let aIdx = 0;
    const probarAudio = () => {
        if (aIdx >= audioObraActual.length) {
            statusEl.textContent = `Para escuchar el audio, asegúrate de tener ${audioObraActual[0]} en assets/audio/`;
            return;
        }
        audioEl.src = 'assets/audio/' + audioObraActual[aIdx];
        aIdx++;
        audioEl.play().then(() => {
            btnEl.textContent = '⏸ Pausar Relato';
            statusEl.textContent = 'Reproduciendo relato ancestral...';
        }).catch(() => {
            probarAudio();
        });
    };
    probarAudio();
}

function cerrarModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'modal-artifact') {
        const audioEl = document.getElementById('bg-audio');
        audioEl.pause();
    }
}
