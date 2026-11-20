// Motor Gráfico 2.5D Interactivo - El Oro de los Ancestros

const Engine25D = (() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Estado del Juego
    let role = null; // 'indigena' | 'espanol'
    let gameActive = false;
    let cineStep = 0;
    
    // Jugador en coordenadas del mundo 2.5D
    const player = {
        x: 0,
        y: 120,
        targetX: null,
        targetY: null,
        speed: 4.2,
        facing: 1, // 1 derecha, -1 izquierda
        walkCycle: 0
    };

    const camera = { x: 0, y: 0 };
    const keys = {};
    let interactableNearby = null;
    let floatingTexts = [];
    let particles = [];

    // Entidades del Mapa
    let npcs = [];
    let buildings = [];
    let pedestals = [];
    let trees = [];
    let waterZones = [];
    let galeon = null;

    // --- CINEMÁTICA DEL ESPAÑOL ---
    const cinematicsEspanol = [
        {
            badge: "Capítulo I · Puerto de Sevilla, España",
            title: "La Ambición por El Dorado",
            visual: "🏰 📜 💰 ⚔️",
            text: "En España se hablaba sin cesar de tierras al otro lado del mar donde los caciques se bañaban cubiertos en polvo de oro. Decidido a obtener riquezas, el capitán reúne a su tripulación y obtiene permiso para cruzar el Atlántico.",
            btn: "Embarcar en el Galeón &rarr;"
        },
        {
            badge: "Capítulo II · Travesía por el Océano",
            title: "Zarpando hacia las Costas de Colombia",
            visual: "⛵ 🌊 🧭 🌴",
            text: "Tras semanas navegando por aguas turbulentas, los vigías divisan las costas del Caribe y las montañas de Colombia. El galeón echa anclas cerca de una aldea indígena repleta de templos y talleres dorados.",
            btn: "Desembarcar y Explorar &rarr;"
        }
    ];

    window.iniciarJuego = (selectedRole) => {
        role = selectedRole;
        document.getElementById('screen-select').classList.remove('active');
        
        if (role === 'espanol') {
            cineStep = 0;
            mostrarCinematica();
            document.getElementById('screen-cinematic').classList.add('active');
        } else {
            configurarMundoIndigena();
            iniciarPartidaActiva();
        }
    };

    function mostrarCinematica() {
        const data = cinematicsEspanol[cineStep];
        document.getElementById('cine-badge').textContent = data.badge;
        document.getElementById('cine-title').textContent = data.title;
        document.getElementById('cine-visual').innerHTML = `<div style="animation: bouncePrompt 2s infinite; position:static; transform:none; border:none; background:none; box-shadow:none;">${data.visual}</div>`;
        document.getElementById('cine-text').textContent = data.text;
        document.getElementById('btn-cine-next').innerHTML = data.btn;
    }

    window.avanzarCinematica = () => {
        cineStep++;
        if (cineStep < cinematicsEspanol.length) {
            mostrarCinematica();
        } else {
            document.getElementById('screen-cinematic').classList.remove('active');
            configurarMundoEspanol();
            iniciarPartidaActiva();
        }
    };

    function iniciarPartidaActiva() {
        document.getElementById('game-hud').classList.remove('hidden');
        gameActive = true;
        actualizarHUD();
        if (!loopRunning) {
            loopRunning = true;
            requestAnimationFrame(gameLoop);
        }
    }

    window.volverMenuInicio = () => {
        gameActive = false;
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('screen-select').classList.add('active');
    };

    // --- CONFIGURACIÓN MAPA INDÍGENA ---
    function configurarMundoIndigena() {
        player.x = 0;
        player.y = 140;
        player.targetX = null;
        
        document.getElementById('hud-role-icon').textContent = '🌞';
        document.getElementById('hud-role-name').textContent = 'Maestro Orfebre Indígena';
        document.getElementById('hud-zone-name').textContent = 'Aldea Ancestral y Casita Sagrada';
        document.getElementById('btn-vestidor').classList.remove('hidden');
        document.getElementById('txt-btn-exposicion').textContent = 'Ir a Casita Sagrada';

        waterZones = [
            { x: -750, y: 280, w: 1500, h: 160, label: "Río Sagrado" }
        ];

        // Edificios 2.5D: Taller de Orfebrería y Casita Sagrada (Exposición)
        buildings = [
            {
                id: 'taller',
                name: 'Taller de Orfebrería (Fragua)',
                x: -360, y: -120, w: 230, h: 170,
                roofColor: '#8C522B', wallColor: '#5C3A21',
                isHouse: false,
                actionLabel: 'Forjar Obras de Oro',
                onInteract: () => abrirTallerOrfebreria()
            },
            {
                id: 'casita-sagrada',
                name: 'Casita Sagrada (Esculturas Expuestas)',
                x: 160, y: -230, w: 460, h: 310,
                roofColor: '#B68622', wallColor: '#4A3219',
                isHouse: true // Su techo se vuelve transparente cuando el jugador entra!
            }
        ];

        // NPCs Indígenas para conversar
        npcs = [
            {
                id: 'sabio', name: 'Abuelo Sabio Quimbaya', role: 'Guía Espiritual',
                x: -110, y: 60, emoji: '🧓', color: '#D4A63A',
                dialog: '¡Bienvenido! Nuestras esculturas no son simples adornos: guardan la memoria del sol, el agua y la transformación. Entra a la Casita Sagrada a la derecha para ver nuestras obras expuestas, o ve al Taller a la izquierda para crear más.',
                actionText: 'Abrir Taller de Oro',
                actionFn: () => { cerrarModal('modal-dialog'); abrirTallerOrfebreria(); }
            },
            {
                id: 'tejedora', name: 'Wayra, Artesana del Río', role: 'Guardiana de los Atuendos',
                x: -220, y: 200, emoji: '👩🏽', color: '#3E8E75',
                dialog: 'El oro ilumina el espíritu de quien lo porta. Puedes vestirte con nuestras narigueras, diademas y pectorales sagrados en cualquier momento.',
                actionText: 'Abrir Vestidor de Oro',
                actionFn: () => { cerrarModal('modal-dialog'); abrirVestidor(); }
            },
            {
                id: 'guardian', name: 'Bochica, Guardián de la Casita', role: 'Custodio del Templo',
                x: 130, y: 110, emoji: '🧔🏽', color: '#E07A5F',
                dialog: 'Dentro de la Casita Sagrada reposan todas nuestras esculturas expuestas. Acércate a cada pedestal para contemplar su forma y escuchar su historia.',
                actionText: null
            }
        ];

        // Pedestales dentro de la Casita Sagrada
        sincronizarPedestales();

        trees = [
            { x: -520, y: -200 }, { x: -480, y: 180 }, { x: 680, y: -180 },
            { x: 670, y: 150 }, { x: -50, y: -260 }, { x: 40, y: 220 }
        ];
        galeon = null;
    }

    function sincronizarPedestales() {
        if (role !== 'indigena') return;
        pedestals = [];
        const obrasCreadas = window.OBRAS_MUSEO.filter(o => o.creadaInicialmente);
        obrasCreadas.forEach((obra, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            pedestals.push({
                x: 215 + col * 105,
                y: -140 + row * 125,
                obra: obra,
                mode: 'exposicion-indigena'
            });
        });
        actualizarHUD();
    }

    // --- CONFIGURACIÓN MAPA ESPAÑOL (SAQUEO Y LA BODEGA) ---
    function configurarMundoEspanol() {
        window.OBRAS_MUSEO.forEach(o => o.robada = false);
        player.x = -380;
        player.y = 180;
        player.targetX = null;

        document.getElementById('hud-role-icon').textContent = '⚔️';
        document.getElementById('hud-role-name').textContent = 'Capitán Expedicionario';
        document.getElementById('hud-zone-name').textContent = 'Costa Colombiana y La Bodega';
        document.getElementById('btn-vestidor').classList.add('hidden');
        document.getElementById('txt-btn-exposicion').textContent = 'Ir a La Bodega';

        waterZones = [
            { x: -950, y: 240, w: 1900, h: 240, label: "Mar Caribe · Desembarco" }
        ];

        galeon = { x: -560, y: 310 };

        // La Bodega / Zona de Carga (donde se exponen las obras robadas)
        buildings = [
            {
                id: 'bodega-carga',
                name: 'La Bodega · Zona de Carga del Galeón',
                x: -660, y: -250, w: 470, h: 310,
                roofColor: '#5A2A22', wallColor: '#361914',
                isHouse: true
            }
        ];

        npcs = [
            {
                id: 'marinero', name: 'Contramaestre Rodrigo', role: 'Tripulación Española',
                x: -290, y: 210, emoji: '🧔🏻', color: '#B83A2D',
                dialog: '¡Capitán! Hemos desembarcado en la costa. Los indígenas tienen sus esculturas de oro en los altares de la aldea hacia la derecha. ¡Saquéalas todas y llévalas a La Bodega (zona de carga) arriba a la izquierda!',
                actionText: null
            },
            {
                id: 'indigena-alerta', name: 'Guardián de la Aldea', role: 'Defensor Ancestral',
                x: 110, y: 80, emoji: '🏹', color: '#D4A63A',
                dialog: '¡Extranjeros! Estas figuras son sagradas para nuestros dioses y ancestros, no son monedas ni mercancía...',
                actionText: null
            }
        ];

        // Altares en la aldea indígena listos para ser saqueados
        pedestals = [];
        window.OBRAS_MUSEO.forEach((obra, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            pedestals.push({
                x: 180 + col * 115,
                y: -140 + row * 130,
                obra: obra,
                mode: 'saqueo'
            });
        });

        trees = [
            { x: -120, y: -220 }, { x: 50, y: -180 }, { x: 660, y: -160 },
            { x: 640, y: 160 }, { x: 20, y: 190 }
        ];
    }

    function trasladarObraABodega(pedestal) {
        pedestal.obra.robada = true;
        const robadas = window.OBRAS_MUSEO.filter(o => o.robada);
        const idx = robadas.length - 1;
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        
        // Mover el pedestal dentro de La Bodega / Zona de Carga
        pedestal.x = -605 + col * 105;
        pedestal.y = -150 + row * 125;
        pedestal.mode = 'exposicion-bodega';
        
        spawnFloatingText(`¡Saquedada: ${pedestal.obra.titulo.split('(')[0]}! Enviada a La Bodega`, '#E05A4C');
        actualizarHUD();
        
        if (robadas.length === window.OBRAS_MUSEO.length) {
            setTimeout(() => {
                spawnFloatingText("¡Todas las obras están en La Bodega! Entra a inspeccionarlas.", "#F7DC88");
            }, 900);
        }
    }

    window.teletransportarZonaEspecial = () => {
        if (role === 'indigena') {
            player.x = 360;
            player.y = -60;
            spawnFloatingText("Entraste a la Casita Sagrada", "#F7DC88");
        } else {
            player.x = -430;
            player.y = -60;
            spawnFloatingText("Entraste a La Bodega · Zona de Carga", "#F7DC88");
        }
        player.targetX = null;
    };

    function actualizarHUD() {
        if (role === 'indigena') {
            const creadas = window.OBRAS_MUSEO.filter(o => o.creadaInicialmente).length;
            const total = window.OBRAS_MUSEO.length;
            document.getElementById('hud-progress-icon').textContent = '🏛️';
            document.getElementById('hud-progress-text').textContent = `Obras en Casita Sagrada: ${creadas} / ${total}`;
            document.getElementById('hud-mission-text').textContent = creadas < total
                ? 'Habla con los indígenas, forja las esculturas restantes en el Taller y míralas en la Casita Sagrada.'
                : '¡Todas las esculturas brillan en la Casita Sagrada! Acércate a cada una para admirarla.';
        } else {
            const robadas = window.OBRAS_MUSEO.filter(o => o.robada).length;
            const total = window.OBRAS_MUSEO.length;
            document.getElementById('hud-progress-icon').textContent = '📦';
            document.getElementById('hud-progress-text').textContent = `Obras en La Bodega: ${robadas} / ${total}`;
            document.getElementById('hud-mission-text').textContent = robadas < total
                ? 'Camina hacia la aldea indígena (derecha) y róbate todas las esculturas para llevarlas a La Bodega.'
                : '¡Saqueo completado! Entra a La Bodega (arriba a la izquierda) y acércate a las obras expuestas.';
        }
    }

    // --- CONTROLES DE TECLADO Y RATÓN ---
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if ((e.key.toLowerCase() === 'e' || e.key === ' ') && gameActive) {
            ejecutarInteraccion();
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('click', (e) => {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const clickScreenX = e.clientX - rect.left;
        const clickScreenY = e.clientY - rect.top;
        
        // Convertir clic de pantalla a coordenadas del mundo
        const worldX = clickScreenX - width / 2 + camera.x;
        const worldY = clickScreenY - height / 2 + camera.y;
        
        player.targetX = Math.max(-750, Math.min(750, worldX));
        player.targetY = Math.max(-320, Math.min(340, worldY));
        
        // Si hizo clic muy cerca de un objeto interactuable y el jugador ya está cerca, interactuar
        if (interactableNearby) {
            const distToObj = Math.hypot(worldX - interactableNearby.x, worldY - interactableNearby.y);
            if (distToObj < 70) {
                ejecutarInteraccion();
            }
        }
    });

    window.ejecutarInteraccion = () => {
        if (!interactableNearby) return;
        const item = interactableNearby;
        
        if (item.type === 'npc') {
            document.getElementById('dialog-avatar').textContent = item.data.emoji;
            document.getElementById('dialog-name').textContent = item.data.name;
            document.getElementById('dialog-role').textContent = item.data.role;
            document.getElementById('dialog-body').textContent = item.data.dialog;
            
            const actionBtn = document.getElementById('dialog-action-btn');
            if (item.data.actionText && item.data.actionFn) {
                actionBtn.textContent = item.data.actionText;
                actionBtn.onclick = item.data.actionFn;
                actionBtn.classList.remove('hidden');
            } else {
                actionBtn.classList.add('hidden');
            }
            document.getElementById('modal-dialog').classList.remove('hidden');
        } 
        else if (item.type === 'building') {
            item.data.onInteract();
        }
        else if (item.type === 'pedestal') {
            const ped = item.data;
            if (ped.mode === 'exposicion-indigena') {
                abrirVisorObra(ped.obra, 'CASITA SAGRADA · ESCULTURA EXPUESTA');
            } else if (ped.mode === 'saqueo') {
                trasladarObraABodega(ped);
            } else if (ped.mode === 'exposicion-bodega') {
                abrirVisorObra(ped.obra, 'LA BODEGA · OBRA SAQUEADA EXPUESTA');
            }
        }
    };

    function spawnFloatingText(text, color) {
        floatingTexts.push({
            x: player.x,
            y: player.y - 65,
            text: text,
            color: color || '#FFF',
            life: 110
        });
    }

    // --- ACTUALIZACIÓN Y RENDERIZADO 2.5D ---
    let loopRunning = false;

    function update() {
        if (!gameActive) return;

        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            player.targetX = null;
            const len = Math.hypot(dx, dy);
            dx /= len; dy /= len;
            player.x += dx * player.speed;
            player.y += dy * player.speed;
            if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
            player.walkCycle += 0.22;
        } else if (player.targetX !== null) {
            const tdx = player.targetX - player.x;
            const tdy = player.targetY - player.y;
            const dist = Math.hypot(tdx, tdy);
            if (dist > 5) {
                player.x += (tdx / dist) * player.speed;
                player.y += (tdy / dist) * player.speed;
                if (Math.abs(tdx) > 1) player.facing = tdx > 0 ? 1 : -1;
                player.walkCycle += 0.22;
            } else {
                player.targetX = null;
            }
        }

        // Límites del mapa
        player.x = Math.max(-740, Math.min(740, player.x));
        player.y = Math.max(-310, Math.min(310, player.y));

        // Cámara suave
        camera.x += (player.x - camera.x) * 0.1;
        camera.y += (player.y - camera.y) * 0.1;

        // Partículas de oro flotantes
        if (Math.random() < 0.15) {
            particles.push({
                x: player.x + (Math.random() - 0.5) * 600,
                y: player.y + (Math.random() - 0.5) * 400,
                vy: -0.4 - Math.random() * 0.5,
                life: 80 + Math.random() * 60
            });
        }
        particles.forEach(p => { p.y += p.vy; p.life--; });
        particles = particles.filter(p => p.life > 0);

        floatingTexts.forEach(ft => { ft.y -= 0.5; ft.life--; });
        floatingTexts = floatingTexts.filter(ft => ft.life > 0);

        // Detectar objeto cercano para interactuar
        let closest = null;
        let minDist = 85;

        npcs.forEach(npc => {
            const d = Math.hypot(player.x - npc.x, player.y - npc.y);
            if (d < minDist) {
                minDist = d;
                closest = { type: 'npc', x: npc.x, y: npc.y, label: `Hablar con ${npc.name}`, data: npc };
            }
        });

        buildings.forEach(b => {
            if (b.onInteract) {
                const bx = b.x + b.w / 2;
                const by = b.y + b.h + 15;
                const d = Math.hypot(player.x - bx, player.y - by);
                if (d < 95 && d < minDist) {
                    minDist = d;
                    closest = { type: 'building', x: bx, y: by, label: b.actionLabel, data: b };
                }
            }
        });

        pedestals.forEach(ped => {
            const d = Math.hypot(player.x - ped.x, player.y - ped.y);
            if (d < 72 && d < minDist) {
                minDist = d;
                let lbl = `Ver ${ped.obra.titulo.split('(')[0]}`;
                if (ped.mode === 'saqueo') lbl = `Robar ${ped.obra.titulo.split('(')[0]}`;
                closest = { type: 'pedestal', x: ped.x, y: ped.y, label: lbl, data: ped };
            }
        });

        interactableNearby = closest;
        const promptEl = document.getElementById('interact-prompt');
        if (closest) {
            document.getElementById('interact-label').textContent = closest.label;
            promptEl.classList.remove('hidden');
        } else {
            promptEl.classList.add('hidden');
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2 - camera.x, height / 2 - camera.y);

        // 1. SUELO 2.5D CON CUADRÍCULA DE PROFUNDIDAD
        const groundGrad = ctx.createRadialGradient(0, 0, 100, 0, 0, 1100);
        groundGrad.addColorStop(0, role === 'indigena' ? '#2B3A24' : '#383024');
        groundGrad.addColorStop(1, '#120E0A');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(-1100, -650, 2200, 1300);

        // Líneas sutiles de perspectiva en el suelo
        ctx.strokeStyle = 'rgba(212, 166, 58, 0.06)';
        ctx.lineWidth = 1;
        for (let gx = -900; gx <= 900; gx += 90) {
            ctx.beginPath(); ctx.moveTo(gx, -500); ctx.lineTo(gx, 500); ctx.stroke();
        }
        for (let gy = -450; gy <= 450; gy += 65) {
            ctx.beginPath(); ctx.moveTo(-900, gy); ctx.lineTo(900, gy); ctx.stroke();
        }

        // Senderos de tierra
        ctx.fillStyle = 'rgba(139, 105, 65, 0.28)';
        ctx.beginPath();
        ctx.roundRect(-550, 40, 1050, 95, 40);
        ctx.fill();

        // 2. ZONAS DE AGUA ANIMADA (Río o Mar)
        const time = Date.now() * 0.003;
        waterZones.forEach(w => {
            ctx.fillStyle = '#143B4D';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeStyle = 'rgba(100, 200, 230, 0.25)';
            ctx.lineWidth = 2;
            for (let wy = w.y + 25; wy < w.y + w.h; wy += 35) {
                ctx.beginPath();
                for (let wx = w.x; wx < w.x + w.w; wx += 40) {
                    ctx.lineTo(wx, wy + Math.sin(time + wx * 0.03) * 4);
                }
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '600 13px "Plus Jakarta Sans"';
            ctx.fillText(w.label, w.x + 30, w.y + 30);
        });

        // Galeón en la costa (para el español)
        if (galeon) {
            drawGaleon25D(galeon.x, galeon.y, time);
        }

        // 3. PISO INTERIOR DE EDIFICIOS (Casita Sagrada o La Bodega)
        buildings.forEach(b => {
            // Sombra proyectada 2.5D
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(b.x + 14, b.y + 14, b.w, b.h);

            // Piso interior
            ctx.fillStyle = b.id === 'bodega-carga' ? '#261510' : '#2E1F12';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = '#D4A63A';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            // Cartel identificador
            ctx.fillStyle = '#F7DC88';
            ctx.font = '700 14px "Cinzel"';
            ctx.textAlign = 'center';
            ctx.fillText(b.name, b.x + b.w / 2, b.y - 14);
        });

        // Marcador de destino al hacer clic
        if (player.targetX !== null) {
            ctx.strokeStyle = 'rgba(247, 220, 136, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(player.targetX, player.targetY, 16, 9, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 4. ORDENAMIENTO EN PROFUNDIDAD 2.5D (Y-Sorting)
        const renderables = [];

        pedestals.forEach(ped => {
            renderables.push({ y: ped.y, draw: () => drawPedestal25D(ped, time) });
        });

        npcs.forEach(npc => {
            renderables.push({ y: npc.y, draw: () => drawNPC25D(npc, time) });
        });

        trees.forEach(tr => {
            renderables.push({ y: tr.y, draw: () => drawTree25D(tr.x, tr.y) });
        });

        renderables.push({ y: player.y, draw: () => drawPlayer25D() });

        renderables.sort((a, b) => a.y - b.y);
        renderables.forEach(r => r.draw());

        // 5. TECHOS 2.5D (Se vuelven translúcidos cuando el jugador entra para ver las esculturas)
        buildings.forEach(b => {
            const playerInside = player.x > b.x - 10 && player.x < b.x + b.w + 10 &&
                                 player.y > b.y - 10 && player.y < b.y + b.h + 20;
            
            ctx.save();
            ctx.globalAlpha = (b.isHouse && playerInside) ? 0.14 : 0.92;
            
            // Techo piramidal 2.5D
            ctx.fillStyle = b.roofColor;
            ctx.beginPath();
            ctx.moveTo(b.x - 12, b.y);
            ctx.lineTo(b.x + b.w + 12, b.y);
            ctx.lineTo(b.x + b.w - 25, b.y - 55);
            ctx.lineTo(b.x + 25, b.y - 55);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#D4A63A';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (!b.isHouse) {
                // Fachada frontal del Taller de Orfebrería
                ctx.fillStyle = b.wallColor;
                ctx.fillRect(b.x, b.y, b.w, b.h);
                // Fragua brillante en el centro
                const glow = 0.6 + Math.sin(time * 3) * 0.3;
                ctx.fillStyle = `rgba(255, 120, 20, ${glow})`;
                ctx.beginPath();
                ctx.arc(b.x + b.w / 2, b.y + b.h - 35, 28, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔥', b.x + b.w / 2, b.y + b.h - 26);
            }
            ctx.restore();
        });

        // 6. PARTÍCULAS DORADAS Y TEXTOS FLOTANTES
        particles.forEach(p => {
            ctx.fillStyle = `rgba(247, 220, 136, ${p.life / 140})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        });

        floatingTexts.forEach(ft => {
            ctx.font = '700 14px "Plus Jakarta Sans"';
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);
        });

        ctx.restore();
    }

    // --- FUNCIONES DE DIBUJO 2.5D ---
    function drawPedestal25D(ped, time) {
        const isNear = interactableNearby && interactableNearby.data === ped;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(ped.x, ped.y + 12, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Base del pedestal 2.5D
        ctx.fillStyle = ped.mode === 'exposicion-bodega' ? '#6E472B' : '#4E3B28';
        ctx.fillRect(ped.x - 18, ped.y - 16, 36, 26);
        ctx.strokeStyle = isNear ? '#F7DC88' : '#D4A63A';
        ctx.lineWidth = isNear ? 2.5 : 1;
        ctx.strokeRect(ped.x - 18, ped.y - 16, 36, 26);

        // Aura de luz sobre la escultura
        const floatY = Math.sin(time * 2 + ped.x) * 4;
        const grad = ctx.createRadialGradient(ped.x, ped.y - 32 + floatY, 4, ped.x, ped.y - 32 + floatY, isNear ? 42 : 28);
        grad.addColorStop(0, 'rgba(247, 220, 136, 0.55)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ped.x, ped.y - 32 + floatY, isNear ? 42 : 28, 0, Math.PI * 2);
        ctx.fill();

        // Escultura
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ped.obra.emoji, ped.x, ped.y - 22 + floatY);

        // Etiqueta corta
        ctx.font = '600 11px "Plus Jakarta Sans"';
        ctx.fillStyle = isNear ? '#FFF' : '#D4A63A';
        ctx.fillText(ped.obra.titulo.split('(')[0].trim(), ped.x, ped.y + 26);
    }

    function drawNPC25D(npc, time) {
        const bob = Math.sin(time * 2 + npc.x) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(npc.x, npc.y + 12, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.roundRect(npc.x - 14, npc.y - 26 + bob, 28, 36, 8);
        ctx.fill();

        // Cabeza / Emoji
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(npc.emoji, npc.x, npc.y - 28 + bob);

        // Indicador de diálogo
        ctx.fillStyle = '#FFF';
        ctx.font = '700 11px "Plus Jakarta Sans"';
        ctx.fillText(npc.name, npc.x, npc.y - 56 + bob);
    }

    function drawPlayer25D() {
        const bob = Math.abs(Math.sin(player.walkCycle)) * 4;
        
        // Sombra 2.5D
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 14, 22, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        if (role === 'indigena') {
            // Túnica ancestral
            ctx.fillStyle = '#E5D3B3';
            ctx.beginPath();
            ctx.roundRect(player.x - 15, player.y - 28 - bob, 30, 38, 9);
            ctx.fill();

            // Faja terracota
            ctx.fillStyle = '#B83A2D';
            ctx.fillRect(player.x - 15, player.y - 10 - bob, 30, 7);

            // Cabeza
            ctx.fillStyle = '#B87A4B';
            ctx.beginPath();
            ctx.arc(player.x, player.y - 40 - bob, 14, 0, Math.PI * 2);
            ctx.fill();

            // Joyas equipadas en tiempo real
            const hasDiadema = window.JOYAS_INDIGENA.find(j => j.id === 'diadema')?.equipada;
            const hasNariguera = window.JOYAS_INDIGENA.find(j => j.id === 'nariguera')?.equipada;
            const hasPectoral = window.JOYAS_INDIGENA.find(j => j.id === 'pectoral')?.equipada;
            const hasPoporo = window.JOYAS_INDIGENA.find(j => j.id === 'poporo')?.equipada;

            if (hasDiadema) {
                ctx.fillStyle = '#F7DC88';
                ctx.beginPath();
                ctx.moveTo(player.x - 14, player.y - 50 - bob);
                ctx.lineTo(player.x, player.y - 64 - bob);
                ctx.lineTo(player.x + 14, player.y - 50 - bob);
                ctx.closePath();
                ctx.fill();
            }
            if (hasNariguera) {
                ctx.strokeStyle = '#F7DC88';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(player.x + player.facing * 4, player.y - 36 - bob, 5, 0, Math.PI);
                ctx.stroke();
            }
            if (hasPectoral) {
                ctx.fillStyle = '#D4A63A';
                ctx.beginPath();
                ctx.arc(player.x, player.y - 18 - bob, 10, 0, Math.PI);
                ctx.fill();
            }
            if (hasPoporo) {
                ctx.fillStyle = '#F7DC88';
                ctx.beginPath();
                ctx.arc(player.x + player.facing * 20, player.y - 14 - bob, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Personaje Español (Armadura / Jubón y Yelmo Morrión)
            ctx.fillStyle = '#4A5568';
            ctx.beginPath();
            ctx.roundRect(player.x - 16, player.y - 30 - bob, 32, 40, 8);
            ctx.fill();

            // Cruz/Banda carmesí
            ctx.fillStyle = '#B83A2D';
            ctx.fillRect(player.x - 4, player.y - 28 - bob, 8, 36);

            // Cabeza
            ctx.fillStyle = '#E2B49A';
            ctx.beginPath();
            ctx.arc(player.x, player.y - 41 - bob, 13, 0, Math.PI * 2);
            ctx.fill();

            // Yelmo español
            ctx.fillStyle = '#A0AEC0';
            ctx.beginPath();
            ctx.ellipse(player.x, player.y - 50 - bob, 18, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawTree25D(x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y + 10, 28, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tronco
        ctx.fillStyle = '#4A3219';
        ctx.fillRect(x - 7, y - 35, 14, 42);

        // Copa en capas 2.5D
        ctx.fillStyle = '#1E4620';
        ctx.beginPath(); ctx.arc(x, y - 48, 34, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2D6A30';
        ctx.beginPath(); ctx.arc(x - 6, y - 56, 26, 0, Math.PI * 2); ctx.fill();
    }

    function drawGaleon25D(x, y, time) {
        const sway = Math.sin(time * 1.5) * 4;
        ctx.save();
        ctx.translate(x, y + sway);
        // Casco del barco
        ctx.fillStyle = '#4A2511';
        ctx.beginPath();
        ctx.moveTo(-75, -10);
        ctx.lineTo(75, -10);
        ctx.lineTo(50, 28);
        ctx.lineTo(-50, 28);
        ctx.closePath();
        ctx.fill();
        // Mástil y velas
        ctx.fillStyle = '#F4ECE1';
        ctx.fillRect(-35, -85, 30, 65);
        ctx.fillRect(10, -75, 26, 55);
        ctx.fillStyle = '#B83A2D';
        ctx.fillRect(-25, -62, 10, 20);
        ctx.restore();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    return {
        sincronizarPedestales,
        spawnFloatingText
    };
})();

window.Engine25D = Engine25D;
