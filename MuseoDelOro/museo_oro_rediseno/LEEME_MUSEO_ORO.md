# Museo del Oro · rediseño (cómo instalarlo)

Reemplaza en `MuseoDelOro/museo_oro_juego_25d/` estos archivos (assets/ no se toca):
  index.html · css/game.css · data/obras.js · js/engine25d.js · js/minigames.js · js/audio.js (NUEVO)

## Qué cambió
- Mundo con profundidad: colisiones, Casita en corte (muro de fondo, columnas, viga de entrada), luces dinámicas, montañas con parallax, taller y muelle.
- Cada obra abre un MENÚ DE DECISIONES:
  · Interactuar: Pulir, Reconstruir (rompecabezas con la foto real), Descifrar (símbolos), Dialogar (pregunta del cacique)
  · Robar (solo Español): Sigilo, Ganzúa, Fuerza bruta (daña la pieza)
- Español: guardianes con cono de visión, barra de alerta, llevar la pieza al galeón, captura (pierdes lo que llevas).
- Indígena: las obras 5-8 se forjan en el Taller (minijuego de cera perdida); pedestal vacío "?" hasta entonces.
- Finales distintos (Embajador / Mercader / Saqueador · Maestro / Guardián), colección, sonidos, música y joystick táctil.
- Al pulsar "Continuar la ruta ▶" se envía UNA vez: parent.postMessage({tipo:'museo-completo',museo:'oro'},'*')

## Para editar
- data/obras.js: textos, imágenes (imagenesPosibles), audios, `pregunta` del cacique, `secreto`, `corto`.
- window.ORO_CONFIG: museoId y música de fondo (se usan archivos que YA tienes en assets/audio).
- La obra 8 (Tairona) no tiene foto propia: pon assets/img/08.jpg y se usará sola.

## IMPORTANTE en el mapa general
MapaGeneral/Codigo/app.js tenía  oro:'../../MuseoDelOro/galeriaInteractiva/index.html'
→ cámbialo por  oro:'../../MuseoDelOro/museo_oro_juego_25d/index.html'
