# Videos de la ruta (animaciones)

Aquí van **todas** las animaciones del mapa general. Ninguna es obligatoria: si un archivo no existe, el mapa usa su animación dibujada por defecto, así que se pueden ir subiendo de a una.

```
Videos/
├── Intro/intro.webm          → fondo de la introducción de misterio (al abrir la página)
├── Final/final.webm          → fondo de la escena "La selva se abre" (al terminar la ruta), antes de la bitácora
└── Transiciones/             → un video por tramo de la ruta lineal
    ├── nacional-oro.webm
    ├── oro-florero.webm
    ├── florero-moneda.webm
    ├── moneda-botero.webm
    ├── botero-mambo.webm
    ├── mambo-antimuseo.webm
    ├── antimuseo-minecraft.webm
    └── minecraft-tesoro.webm   (último museo → cofre del tesoro)
```

## Reglas para el animador
- **Nombre exacto** (minúsculas, sin tildes, con guion). Los ids son: `nacional`, `oro`, `florero` (Independencia), `moneda`, `botero`, `mambo`, `antimuseo`, `minecraft`, `tesoro`.
- Formato `.webm` (VP9). Las transiciones también aceptan un `.mp4` con el mismo nombre como respaldo (Safari).
- **Sin audio** (el navegador solo deja reproducir videos silenciados sin que el usuario toque nada).
- Transiciones: 3–6 s. Intro y final: un bucle de 8–15 s que se vea bien oscurecido (se muestra al 55 % de opacidad, con el texto encima).
- 1280×720 o 1920×1080; idealmente menos de 5 MB cada uno (GitHub Pages tarda en cargar videos pesados).
- Las transiciones solo se ven en **Seguir la historia** (ruta lineal). En el recorrido libre no hay transiciones.

## Dónde se configura
`MapaGeneral/Codigo/app.js`:
- `TRANSICION={activa:true, dir:'../../Videos/Transiciones/', ms:3400, maxMs:12000}` (poner `activa:false` las desactiva).
- `ESC_INTRO.video` y el `video` de `finalRuta()` para la intro y el final.
