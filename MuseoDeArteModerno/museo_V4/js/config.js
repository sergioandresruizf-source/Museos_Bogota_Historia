// Ajustes generales del juego
const CONFIG = {
  ancho: 480, alto: 300,        // resolución interna (DOOM usaba 320 × 200; menor = más "retro" y más rápido)
  fov: 80 * Math.PI / 180,      // campo de visión horizontal
  velocidad: 3.2,               // casillas por segundo caminando
  correr: 1.75,                 // multiplicador con Shift (o con el joystick al máximo)
  aceleracion: 11,              // qué tan rápido arrancas (más = menos inercia)
  frenado: 8,                   // qué tan rápido te detienes (DOOM desliza un poco)
  giro: 2.6,                    // giro con flechas (rad/seg)
  radio: 0.24,                  // tamaño del visitante (choques con muros y objetos)
  balanceo: 0.04,               // "view bobbing": cuánto sube y baja la vista al caminar (0 = nada)
  balanceoArma: 7,              // cuánto se mueve el arma al caminar (píxeles)
  controlesTactiles: 'auto',    // 'auto' | true | false  (para probar en el PC: añade ?tactil a la URL)
  sensibilidadTactil: 0.006,    // arrastrar la pantalla para girar
  sensibilidadRaton: 0.0026,    // clic en la pantalla para mirar con el ratón
  alcance: 2.2,                 // distancia máxima para interactuar
  niebla: 34,                   // distancia a la que la luz baja al mínimo (museo bien iluminado)
  luzMinima: 0.42,              // lo más oscuro que se ve algo lejano (0 = negro)
  alturaTecho: 2,               // alto de los muros (1 = el doble de la altura de tus ojos)
  alturaOjos: 0.5,
  texturaSuperior: 'yeso',      // parte alta de las paredes interactivas (cuadros, placas...)
  puertaAbierta: 4,             // segundos que una puerta queda abierta antes de cerrarse sola
  umbralPiso: 0.65,             // parte de las obras de un piso que hay que ver para desbloquear el siguiente (0.65 = 65 %)
  volumenMusica: 0.35, volumenEfectos: 0.8,
  textoPista: 'Examinar',
  textoAyuda: 'WASD mover · ratón o ←/→ girar · Shift correr · E/Espacio usar · M/Tab mapa · N sonido · clic = ratón',
  // (como en DOOM también puedes dar pasos laterales con , y .)
  textoAyudaTactil: 'Joystick: moverte · arrastra la pantalla: girar · botón: interactuar',
  textoAyudaArma: 'Clic izquierdo disparar · R recargar · WASD moverte · Shift correr · M mapa',
  textoAyudaArmaTactil: 'Botón rojo: disparar · Recargar: botón de al lado · joystick: moverte',

  // Pelea con el jefe (sección secreta del Sótano)
  combate: {
    vida: 100, armaduraMax: 100,
    absorcion: 1 / 3,           // parte del daño que se queda la armadura (como la armadura verde de DOOM)
    cargador: 8,                // cartuchos que caben en la escopeta
    reserva: 16, reservaMax: 60,// cartuchos de repuesto al recogerla y máximo que puedes llevar
    perdigones: 7, danoPerdigon: [5, 15], dispersion: 0.085,   // cada disparo: 7 perdigones de 5 a 15
    cadencia: 0.85,             // segundos entre disparos (incluye bombear)
    recarga: 1.3,               // segundos que tarda en recargar
    botiquin: 25, armadura: 50, municion: 10,   // lo que da cada objeto del suelo
    reaparicion: 30,            // segundos para que un objeto recogido vuelva a aparecer (0 = nunca)
    danoProyectil: [8, 18], velocidadProyectil: 5.2
  }
};
