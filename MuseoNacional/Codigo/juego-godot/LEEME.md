# Islas de la Contrarrevolución — proyecto Godot 4

Versión del juego para **Godot 4.3 o superior** (probada en 4.3). Mismo juego que la versión web:
mapa de 10 islas + Isla Calavera con niebla, salas con obras presentes/removidas, contador de
"Islas exploradas", cinemática final con la bandera de Luffy.

## Cómo abrirlo
1. Abre Godot → **Importar** → elige `project.godot` → **Editar**.
2. La primera vez Godot importa las imágenes (unos segundos).
3. Pulsa **F5** (▶) para jugar.

## Qué editar
| Quieres… | Edita |
|---|---|
| Nombres de islas, obras, descripciones, textos | `data/museo.json` |
| Agregar imágenes de obras | Copia el archivo a `obras/` y escribe `"imagen": "obras/mi_cuadro.jpg"` en `museo.json` |
| Cambiar el barco | Reemplaza `assets/ship/ship_0..7.png` (0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SO, 6=O, 7=NO) |
| Cambiar el arte (islas, agua, sala, personaje, botones) | Reemplaza los PNG de `assets/` (mismo nombre y tamaño) |
| Velocidad del barco, modo atajos | `config` dentro de `data/museo.json` |
| Posición de islas | `data/world.json` (+ `assets/world/island_XX.png`) |

Obra presente: `"removida": false` + `imagen`. Obra removida: `"removida": true` (sin imagen).
Las removidas aparecen solas en la Isla Calavera. Orden de las islas: 1 abajo-centro, 2 derecha del
centro, 3 sureste, 4 sur, 5 suroeste, 6 oeste, 7 noroeste, 8 norte, 9 noreste, 10 este.

## Controles
Mover: flechas / WASD (o joystick táctil) · Acción: Espacio / Enter / E (botón A) ·
Cerrar: Esc / B (botón B) · Sonido: M · Atajos de prueba (`"atajos": true`): Shift+E explora todo, Shift+C lanza la cinemática.

## Estructura
```
project.godot            configuración (400x300 pixelado, escala x3)
scenes/main.tscn         escena principal
scripts/game.gd          (autoload "Game") datos, guardado, colisiones, rutas
scripts/main.gd          cambia entre escenas con fundido
scripts/sea.gd           mar y navegación
scripts/arrival.gd       llegada a la isla (letrero + muelle)
scripts/museum.gd        sala con marcos, cofre de la Isla Calavera
scripts/cine.gd          cinemática final
scripts/ui.gd            HUD, diálogo de obra, título, final, controles táctiles
scripts/world_draw.gd    dibujo compartido (mar, islas, barco, niebla)
```
El progreso se guarda en `user://progreso.json`. Para exportar a Android/Web usa
**Proyecto → Exportar**; los controles táctiles aparecen solos en pantallas táctiles.

## Notas
- Las escenas se construyen por código (no hay `.tscn` por escena); para cambiar colores/tamaños de
  la interfaz ve a `scripts/ui.gd`.
- Las imágenes dentro de `obras/` se importan automáticamente al abrir el proyecto en el editor.
