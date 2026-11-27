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
4. Una isla suma al contador **ISLAS EXPLORADAS** al **pasar cerca de su última obra** (no hace falta abrir cada obra; cámbialo en `config.exigirPasarUltimaObra`: con `false` basta con entrar a la sala).
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

## 13. Pantalla de llegada
Ya no es un templo griego recoloreado: al atracar ves **la misma isla de cerca** (el Panóptico, las estatuas de San Agustín, la estación con la locomotora, el Capitolio, las terrazas de Ciudad Perdida, la iglesia de Villa de Leyva, el puente colgante, la mina, la ranchería Wayuu, Las Lajas y, en la Isla Calavera, la entrada por la boca de la calavera). La entrada se marca con una flecha que parpadea. El nombre de la exposición cuelga en un cartel arriba.

## 14. Sistema de entrega con el saco
- **Reto 2 (Tambores de la Memoria, juego de ritmo):** se juega dentro de la sala de la Isla Calavera. El pirata camina solo con el saco a la espalda y las obras removidas cuelgan de las paredes; el jugador pulsa A / Espacio / Enter / E (o toca) cuando una obra queda sobre la zona dorada, al golpe del tambor, y la obra vuela al saco (cada acierto suena como una nota). 3 secciones con ritmo cada vez más rápido y sincopado, 37 obras; cada obra que se escapa quita un corazón (5). La música de fondo baja durante el reto.
  - Ajustes en `gameDurante()`: `secs` (BPM y patrones), `WIN` (ventanas perfecto/bien/regular en segundos), `SPD` (velocidad al caminar).
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

## 13. Pantalla de llegada
Ya no es un templo griego recoloreado: al atracar ves **la misma isla de cerca** (el Panóptico, las estatuas de San Agustín, la estación con la locomotora, el Capitolio, las terrazas de Ciudad Perdida, la iglesia de Villa de Leyva, el puente colgante, la mina, la ranchería Wayuu, Las Lajas y, en la Isla Calavera, la entrada por la boca de la calavera). La entrada se marca con una flecha que parpadea. El nombre de la exposición cuelga en un cartel arriba.

## 14. Sistema de entrega con el saco
- **Reto 2 (Tambores de la Memoria, juego de ritmo):** las obras removidas avanzan por un pasillo de piedra al compás de un tambor. El jugador pulsa A / Espacio / Enter / E (o toca la pantalla) cuando la obra está sobre la zona dorada y el pirata la echa al SACO. Hay 3 secciones con ritmo cada vez más rápido y sincopado; cada obra que se cae quita un corazón (5 en total). La música de fondo baja mientras dura el reto.
  - Ajustes en `gameDurante()`: `secs` (BPM y patrones por compás), `WIN` (ventanas de acierto en segundos: perfecto/bien/regular), `SPD` (velocidad de las obras).
- **Cinemática final:** el barco zarpa con el saco y visita solo las islas con obras removidas. En cada una entra a la sala: el pirata camina hasta cada hueco, abre el saco, saca la obra y la cuelga en su marco (o pedestal). Al terminar se iza la bandera y el barco sigue.
- Se reutiliza `save.restored[i]`; no hay cambios en `obras.js`.

## 15. Ambientación (mejoras de calidad)
- **Interior de la Isla Calavera** ahora hace juego con la calavera de piedra de la fachada: muros de la misma piedra gris-azulada, friso y osario de calaveras, columnas de vértebras, antorchas con calavera de ojos verdes, costillas/columna vertebral entre cuadros, alfombra con calaveras, bancas de hueso, huesos y telarañas, puerta con dientes, niebla verde baja, luciérnagas y fantasmas.
- **Todas las salas:** polvo flotando y viñeta suave en los bordes.
- **Llegada a cada isla:** aves (murciélagos en la Calavera), espuma en la orilla y destellos en el agua; se eliminaron las sombras rectangulares que ensuciaban las fachadas.
- **Título:** el barco ya no queda debajo del texto.

## 16. Diálogos de historia y entrega manual de obras

**Diálogos estilo Undertale.** Antes de cada reto (y al ganar/perder) aparece una caja negra abajo con el texto escribiéndose letra a letra, retrato del personaje (Capitán, Chamán) y una flecha ▼. Se avanza con A / Espacio / Enter / E o tocando la caja; pulsar mientras escribe completa la línea. Los textos se editan en `index.html`: `RETOS.entrada.dialogo`, `RETOS.durante.dialogo`, `RETOS.salida.dialogo` (lista de `{ who, txt }`), `RETOS.*.derrota` (frase al perder) y `ok` (frase al ganar). `{ who:'', txt:'…', sys:true }` muestra una línea de controles en azul.

**El saco y la entrega manual.** Al vencer al Chamán el barco ya NO entrega nada solo: todas las obras quedan en el saco (`save.recovered = true`) y el jugador navega libremente.
- Botón **SACO** (abajo-izquierda) o tecla **I**: muestra todas las obras recuperadas, con imagen, título, descripción y de qué isla se las llevaron.
- Para entregar: entrar a una sala, acercarse a un **espacio vacío** y pulsar A; se abre el saco, se elige la obra y **COLOCAR AQUÍ**.
- Solo se acepta si la obra corresponde exactamente a ese espacio (`item.key === slot.key`). Si es de otra isla o de otro hueco de la misma sala, aparece un mensaje y no se deja colocar.
- Al colocar, el pirata saca la obra del saco y la cuelga con animación. Al completar una sala se iza su bandera; al entregar todas, arranca la cinemática final.
- En el mar, las islas con obras pendientes muestran una flecha dorada con el número que falta.
- El progreso se guarda (`save.placed`, `save.recovered`).

**Ajustes visuales.** HUD más compacto, carteles de isla con texto más pequeño (no se salen) y barco de llegada más abajo.

## 17. Chamán final y juego de ritmo (revisión)

**Chamán.** Sprite nuevo (el doble de grande): máscara de hueso con astas, abanico de plumas, hombreras de púas, bastón con cráneo, orbe y aura que cambia de color (morado = se teletransporta, rojo = lanza hechizos, dorado = agotado). Piensa que el pirata es un colono español: el diálogo está en `RETOS.salida.dialogo` (antes de pelear) y `RETOS.salida.final` (cuando desaparece).

**Pelea de un solo golpe.** El Chamán lanza 3 hechizos seguidos (cada uno más fuerte; 3 casillas rojas arriba). Solo entonces baja el escudo y queda agotado ~3,4 s: **un único golpe** lo deshace en polvo. Si se agota el tiempo sin golpearlo, vuelve a lanzar hechizos (desde el 2.º). Ajustes: `S.ts = 3.4` (ventana), `S.casts >= 3` (hechizos necesarios) en `gameSalida`.

**Arena.** Nuevo fondo `retoBackground('claro')`: claro de tierra irregular en la selva, piedras ceremoniales con musgo, árboles que cierran el espacio, braseros de piedra, luciérnagas y niebla.

**Ritmo.** Las obras que pasan por el pasillo son las **obras reales removidas** (con su imagen; si aún no hay, usa cualquiera con imagen) y abajo a la derecha se lee el título de la siguiente. La melodía (`MEL`, `BASS` en el código) suena programada exactamente en el compás de cada obra, con bajo y tambor; al pulsar a tiempo suena la misma nota más fuerte. Audio con antelación de 40 ms para que coincida con el toque.

## 18. Atajo de prueba: ir a la Isla Calavera
Con `atajos: true` en `obras.js`: **Shift + K** marca todas las islas como exploradas, quita la niebla y deja el barco junto a la Isla Calavera (pulsa A para atracar). Otros atajos: Shift+E (explorar todo), Shift+C (cinemática final), Shift+P (omitir reto). **Antes de publicar, pon `atajos: false`.**

## 19. Nuevo orden en la Isla Calavera
1. **Entrada:** reto de las trampas (sin cambios).
2. **Recorrido:** el jugador camina por el pasillo y ve las obras removidas colgadas (con sus imágenes).
3. **Final del pasillo:** junto al cofre pulsa A → empieza el **juego de ritmo** (la vista previa de las instrucciones ya muestra las obras reales). Al ganar, las obras van al saco (`save.recovered`) y **las paredes de la sala quedan vacías**.
4. **Al salir de la sala** (la puerta del inicio) aparece el **Chamán**: pelea final de **5 fases**. Desde la 3.ª se fatiga (sudor, aura más débil, jadeos entre hechizos en las fases 3 y 4). Tras la 5.ª queda agotado ~3,6 s: un solo golpe lo deshace. Si se agota la ventana, repite las fases 4 y 5.
5. Tras vencerlo, el barco zarpa con las obras en el saco y comienza la entrega manual (sección 16).

Ajustes en `gameSalida`: `S.casts >= 5` (fases), `S.ts = 3.6` (ventana de golpe), `S.ts = S.casts === 3 ? 1.1 : 1.5` (jadeos).

## 20. Puerta de salida y animación rápida
- **Puerta al final del pasillo** de la Isla Calavera, junto al cofre (`drawDoor`). Cerrada con barrotes hasta llevarse las obras; después brilla en verde con el rótulo SALIDA. Acercarse y pulsar A: aparece el Chamán (primera vez) o se vuelve al muelle. La puerta del inicio sigue funcionando.
- **Animación de colocar obras** reducida de ~4 s a ~1,5 s (`updEnt`: abrir 0,3 s, subir 0,3 s, volar 0,4 s, colocar 0,45 s).
- Tras el juego de ritmo, el fondo del mensaje «todas las obras están a salvo» ya no muestra cuadros.

## 21. Reporte final real
Al terminar la cinemática final aparece, bajo el mensaje de cierre, el **REPORTE FINAL** con datos reales de la partida:
- **Obras que miraste:** obras/esculturas abiertas con A (`save.viewed`) sobre el total de las 10 islas (incluye las que se detectan automáticamente en `obras/`).
- **Obras devueltas a su sala:** las colocadas manualmente en su espacio (`save.placed`/`save.restored`) sobre las que se llevó el saco.
- **Veces que moriste en los minijuegos:** cada derrota cuenta (`save.deaths`), con desglose Trampas · Ritmo · Chamán. Omitir un reto no cuenta como muerte.
Los datos se guardan en el progreso (`save.deaths`, `save.report`), así que sobreviven si se recarga la página a mitad de partida. «Empezar de nuevo» los reinicia.
