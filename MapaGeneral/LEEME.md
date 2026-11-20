# Transición entre museos (solo ruta lineal)
Reemplaza MapaGeneral/Codigo/app.js y estilos.css por estos. No se toca ningún museo.

- Carpeta `Transiciones/` en la RAÍZ del repo. El animador entrega `<desde>-<hasta>.webm` (opcional `.mp4`):
  nacional-oro, oro-mambo, mambo-florero, florero-moneda, moneda-botero, botero-antimuseo, antimuseo-minecraft.
- Si el archivo no existe: animación por defecto (el barco recorre el tramo del mapa del tesoro).
- Desactivar: `TRANSICION.activa=false` en app.js. Recorrido libre: nunca hay transición.
- Contrato con los museos (sin cambios): `parent.postMessage({tipo:'museo-completo',museo:'<id>'},'*')`.
- Seguro: si algo falla, la animación se cierra sola a los 12 s (`maxMs`). Botón "Saltar".
