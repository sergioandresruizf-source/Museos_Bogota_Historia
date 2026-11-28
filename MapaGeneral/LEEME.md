# Ruta lineal: conexión entre museos y transiciones
Reemplaza `MapaGeneral/Codigo/app.js` por el de esta entrega. Estilos y HTML no cambian.

## Cómo avanza la ruta (sin botón de "Siguiente museo")
- Ya **no existe** el botón de arriba ("Siguiente: …" / "Terminé este museo"): no se puede saltar un museo sin terminarlo.
- Cada museo avisa SOLO cuando el visitante llega a su final, con esta línea (ver `CONEXION_MUSEOS.md` para el punto exacto de cada museo):

      parent.postMessage({tipo:'museo-completo',museo:'<id>'},'*')

  - Ruta lineal → el mapa pasa al siguiente museo (con la transición) y desbloquea la parada.
  - Recorrido libre → el mapa otorga la medalla y vuelve a la galería.
- ids de museo: `nacional`, `oro`, `florero` (Independencia), `moneda`, `botero`, `mambo`, `antimuseo`, `minecraft`.
- Ya no hay modo de prueba: los candados se respetan siempre. Cada recorrido tiene un botón **↺ Reiniciar** (con confirmación) que borra su avance y su bitácora.

## Animaciones entre museos (SOLO ruta lineal)
Carpeta `Videos/Transiciones/` en la RAÍZ del repo (ver también `Videos/LEEME.md`). El animador entrega un video `.webm` (opcional `.mp4` con el mismo nombre) por tramo, con este nombre exacto:

| Tramo | Archivo |
|---|---|
| Nacional → Oro | `nacional-oro.webm` |
| Oro → Independencia | `oro-florero.webm` |
| Independencia → Casa de Moneda | `florero-moneda.webm` |
| Casa de Moneda → Botero | `moneda-botero.webm` |
| Botero → MAMBO | `botero-mambo.webm` |
| MAMBO → Antimuseo | `mambo-antimuseo.webm` |
| Antimuseo → Minecraft | `antimuseo-minecraft.webm` |
| Minecraft → Tesoro (final de la ruta) | `minecraft-tesoro.webm` |

- Si un archivo no existe, se usa la animación por defecto (el barco recorre el tramo del mapa del tesoro). Se pueden ir subiendo de a uno.
- Mientras suena, el siguiente museo se carga por debajo; al terminar el video (y cargar el museo) se destapa. Botón "Saltar" y cierre automático a los 12 s (`maxMs`).
- Desactivar todas: `TRANSICION.activa=false` en `app.js`. Duración de la animación por defecto: `TRANSICION.ms`.
- Recomendado: videos cortos (3–6 s), sin audio, 16:9 o vertical, `.webm` (VP9) pesando < 5 MB cada uno.
- En el recorrido libre nunca hay transición. Los museos no participan: todo ocurre en el mapa.

## Experiencia del mapa (intro, salida y bitácora)
- **Intro de misterio selvático**: niebla, ojos entre la maleza, sonido de selva sintetizado y texto que aparece frase por frase. Sale una vez por sesión; se vuelve a ver con "Ver de nuevo la introducción". Video de fondo opcional: `Videos/Intro/intro.webm`.
- **Sonido**: botón 🔊 abajo a la derecha (se recuerda). Se apaga solo mientras hay un museo abierto.
- **Encabezado de la ruta**: barra con las 8 paradas (toca una para ir a ella en el mapa), botón grande **Empezar / Continuar** y **? Cómo funciona**.
- **Salir de un museo** (botón ✕, tecla Esc, botón Atrás del navegador o el enlace `mapa.html` del museo) SIEMPRE muestra: *"¿Usted prefiere permanecer en la ignorancia de su historia?"* con "Quedarme y conocer la verdad" / "Prefiero no saber · salir". En la ruta lineal salir NO salta el museo: la parada sigue abierta hasta terminarlo. Cerrar la pestaña con un museo abierto muestra el aviso del navegador.
- **Bitácora final**: al terminar Minecraft (transición al tesoro) aparece la escena "La selva se abre" y después la bitácora con, por museo: tiempo, entradas, veces que quiso salir y las estadísticas que el museo envía. También al juntar las 8 medallas del recorrido libre. Se puede imprimir.
- **Estadísticas de cada museo**: el aviso de fin acepta `stats` opcional:
      parent.postMessage({tipo:'museo-completo', museo:'<id>', stats:[['Obras vistas','30 / 30'], ['Tiempo','12:04']]}, '*')
  Nacional, Oro, Independencia, Casa de Moneda, Botero y MAMBO ya las envían (leen su propia pantalla final). Antimuseo y Minecraft solo registran tiempo y entradas
- Guardado: `museos.bitacora` (además de `museos.avance`, `museos.logros`, `museos.modo`, `museos.sonido`).
