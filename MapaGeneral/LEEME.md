# Ruta lineal: conexión entre museos y transiciones
Reemplaza `MapaGeneral/Codigo/app.js` por el de esta entrega. Estilos y HTML no cambian.

## Cómo avanza la ruta (sin botón de "Siguiente museo")
- Ya **no existe** el botón de arriba ("Siguiente: …" / "Terminé este museo"): no se puede saltar un museo sin terminarlo.
- Cada museo avisa SOLO cuando el visitante llega a su final, con esta línea (ver `CONEXION_MUSEOS.md` para el punto exacto de cada museo):

      parent.postMessage({tipo:'museo-completo',museo:'<id>'},'*')

  - Ruta lineal → el mapa pasa al siguiente museo (con la transición) y desbloquea la parada.
  - Recorrido libre → el mapa otorga la medalla y vuelve a la galería.
- ids de museo: `nacional`, `oro`, `florero` (Independencia), `moneda`, `botero`, `mambo`, `antimuseo`, `minecraft`.
- Para PROBAR la cadena sin jugar cada museo (solo con `PRUEBA=true`): abre la consola del navegador (F12) y escribe `simularFin()`.

## Animaciones entre museos (SOLO ruta lineal)
Carpeta `Transiciones/` en la RAÍZ del repo. El animador entrega un video `.webm` (opcional `.mp4` con el mismo nombre) por tramo, con este nombre exacto:

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
