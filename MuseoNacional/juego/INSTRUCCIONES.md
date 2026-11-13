# Islas de la Contrarrevolución — cómo ponerlo en un HTML

## 1. Estructura de carpeta (todo junto)
```
mi-juego/
├── index.html      ← el juego completo (no hay que tocarlo)
├── obras.js        ← AQUÍ editas islas, obras y textos
└── obras/          ← AQUÍ pones tus imágenes
    ├── isla1_obra1.jpg
    └── ...
```
El barco pixel art (tus 8 sprites) ya va incrustado dentro de `index.html`.

## 2. Cómo abrirlo
- **PC:** doble clic en `index.html` (Chrome, Edge o Firefox).
- **Celular:** súbelo a un hosting estático gratuito (GitHub Pages, Netlify Drop, Vercel) y abre el enlace; funciona en vertical y horizontal con joystick táctil.
- Si quieres probar en red local: `python -m http.server` dentro de la carpeta.

## 3. Cómo agregar tus obras (solo en `obras.js`)
```js
{ titulo: "Nombre de la obra", descripcion: "Texto...", imagen: "obras/mi_cuadro.jpg", removida: false }  // presente
{ titulo: "Nombre de la obra", descripcion: "Texto...", removida: true }                                  // removida (sin imagen)
```
- Cambia `nombre` de cada isla: es el letrero que aparece en la entrada.
- Puedes poner las obras que quieras por isla (la sala se alarga sola).
- Las obras `removida:true` aparecen automáticamente también en la Isla Calavera.
- Si una imagen falta, el juego no se rompe: muestra la ruta que no encontró.

## 4. Controles
| Acción | Teclado | Táctil |
|---|---|---|
| Mover | Flechas / WASD | Joystick |
| Atracar, ver obra, abrir cofre | Espacio / Enter / E | Botón A |
| Cerrar obra | Esc / B | Botón B |
| Sonido | M | Botón ♪ |

## 5. Flujo del juego
1. Navegas con el barco; al acercarte a un muelle aparece **[A] Atracar**.
2. Llegada: letrero con el nombre de la exposición; caminas por el muelle hasta la puerta.
3. Sala: acércate a cada marco y pulsa A. Marco dorado = obra presente; marco negro punteado con "?" = obra removida (solo descripción).
4. Una isla suma al contador **ISLAS EXPLORADAS** al ver todas sus obras (cámbialo en `config.exigirVerTodas`).
5. Con las 10 exploradas la niebla se disipa y puedes entrar a la **Isla Calavera**.
6. Revisa las obras removidas y abre el cofre: cinemática del barco llevando las obras a cada isla y plantando la bandera.

## 6. Modo prueba (para mostrarle al profesor)
En `obras.js` pon `atajos: true`. Shift+E explora todas las islas; Shift+C lanza la cinemática.
El progreso se guarda en el navegador (botón NUEVO JUEGO lo reinicia).

## 7. Mapa de islas (orden en obras.js)
1 abajo-centro · 2 pequeña a la derecha del centro · 3 sureste · 4 sur · 5 suroeste · 6 oeste · 7 noroeste · 8 norte · 9 noreste · 10 este.


## 8. Novedades
- **Imágenes automáticas:** copia `obras/islaN_obraK.jpg|png|webp` (cuadros) o `obras/islaN_esculturaK.png` (esculturas) y aparecen solas. Numera sin saltos. Para título y descripción, agrégalas en `obras.js` con la misma ruta.
- **Formato de cuadros:** `formato: "auto" | "horizontal" | "vertical" | "cuadrado"` (auto se adapta a la imagen).
- **Esculturas/objetos:** `tipo: "escultura"` + PNG transparente; se paran sobre un pedestal en el piso (`alto`, `pixelado`).
- **Isla Calavera:** niebla en anillo (se ve la isla de cerca), tumbas, huesos, naufragio, bandera rota, ojos brillantes, almas en pena, aura oscura y rayos.

## 9. Cambios nuevos
- **Formato en la descripción:** la imagen de la ventana de cada obra usa el formato elegido (`horizontal`, `vertical`, `cuadrado`); con `auto` toma la proporción real de la imagen, sin franjas negras.
- **Cinemática final con puzzles:** el cofre de la Isla Calavera dispara el *embarque* de cajas al barco; el barco navega isla por isla y en cada una el jugador resuelve un puzzle (faroles de memoria, cartas, faroles del muelle, torre de cajas, candado con pistas, mapa deslizante). Al resolverlo, las obras removidas de esa isla **regresan a la sala** como "OBRA RESTITUIDA" y se planta la bandera. El progreso queda guardado. Si una obra removida tiene `imagen`, se muestra al regresar.
  - Botón OMITIR PUZZLE tras 45 s (`puzzlesOmitibles`, `puzzleOmitirSeg` en `obras.js`).
  - Con `atajos: true`: Shift+P resuelve el puzzle actual.
- **Música:** en `obras.js` → `musica` (navegación, título, calavera, cinemática, volumen) y `musica: "musica/islaN.mp3"` dentro de cada isla. Pon los archivos en la carpeta `musica/` (ver `musica/LEAME.txt`). Si un archivo no existe, no suena. Los navegadores solo reproducen audio después del primer clic/toque (el botón ZARPAR).

## 10. Islas temáticas, cierre con el oro y orfebrería
- **Islas con identidad propia:** 1 Panóptico (Museo Nacional) · 2 San Agustín · 3 Ferrocarril · 4 Capitolio y Puente de Boyacá · 5 Ciudad Perdida (Tayrona) · 6 Villa de Leyva · 7 Puente colgante sobre el río · 8 Mina y café · 9 Ranchería Wayuu · 10 Santuario de Las Lajas. Cada una cambia paleta, edificio, vegetación y detalles, y su pantalla de llegada tiene fachada y emblema propios.
- **Objeto de cierre:** al terminar la cinemática de los puzzles y pulsar SEGUIR NAVEGANDO aparece una **botella con un mensaje** (se ve un haz de luz y un punto en el minimapa). Al leerla empieza la cinemática: un **galeón español** carga el oro de «Tierra como recurso» y el **barco pirata** lo persigue; el galeón deja caer **6 piezas de orfebrería indígena** (poporo Quimbaya, balsa Muisca, tunjo Muisca, pectoral Tairona, diadema Calima, nariguera Zenú) que quedan flotando y se pueden examinar con A.
- **Redirección:** al terminar esa cinemática se envía `{ tipo: "museo-completo", museo: "nacional" }` a la página contenedora (`config.museoId`). La botella pasa a ser una **boya**: al interactuar de nuevo se vuelve a enviar el aviso. Si el juego se abre solo, `config.urlSiguienteMuseo` puede redirigir a otra dirección.
- **Textos de la orfebrería y de la botella:** `obras.js` → `orfebreria` y `textos.botellaMensaje`.
- **Esculturas anchas** (por ejemplo una espada horizontal): `ancho: 90` en la obra permite más ancho que el límite de 64.

## 11. Correr y banderas
- **Correr en los museos (y en la llegada a cada isla):** mantén **Shift** (PC) o el botón **B** (celular). La velocidad se cambia con `velocidadCorrer` en `obras.js` (1.8 = 80 % más rápido). Con `atajos: true`, Shift+E y Shift+C siguen siendo atajos de prueba, así que para jugar normal déjalo en `false`.
- **Banderas al devolver las obras:** durante la entrega ya no aparece ninguna bandera en las islas pendientes. La de cada isla se iza una sola vez, cuando las cajas llegan, después de resolver el puzzle.

## 12. Obras removidas: dónde se ven
- **En la sala de su isla:** NO se ven mientras estén removidas.
- **En la Isla Calavera:** sí, como marcos negros con su título y descripción (y desaparecen de ahí al restituirlas).
- **Después de devolverlas:** aparecen en su sala como obras presentes ("OBRA RESTITUIDA"), con su imagen si la agregaste.
- Las obras removidas no cuentan para marcar una isla como explorada; solo las presentes.
- Si una isla solo tiene obras removidas, su sala queda vacía hasta que las restituyas (cuenta como explorada al entrar).
