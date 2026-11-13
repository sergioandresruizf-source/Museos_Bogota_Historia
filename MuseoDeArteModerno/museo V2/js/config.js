// Ajustes generales del juego
const CONFIG = {
  ancho: 640, alto: 400,        // resolución interna (menor = más "retro" y más rápido)
  fov: Math.PI / 3,             // campo de visión
  velocidad: 3,                 // casillas por segundo
  giro: 2.2,                    // giro con flechas (rad/seg)
  controlesTactiles: 'auto',    // 'auto' | true | false  (para probar en el PC: añade ?tactil a la URL)
  sensibilidadTactil: 0.006,    // arrastrar la pantalla para girar
  textoAyudaTactil: 'Joystick: moverte · arrastra la pantalla: girar · botón: interactuar',
  sensibilidadRaton: 0.003,     // clic en la pantalla para mirar con el ratón
  alcance: 2.5,                 // distancia máxima para interactuar
  niebla: 14,                   // distancia a la que todo se ve oscuro
  alturaTecho: 2,               // alto de los muros (1 = el doble de la altura de tus ojos)
  alturaOjos: 0.5,
  texturaSuperior: 'piedra',    // parte alta de las paredes interactivas (cuadros, placas...)
  volumenMusica: 0.35, volumenEfectos: 0.8,
  textoPista: 'Examinar',
  textoAyuda: 'WASD mover · ←/→ girar · Shift correr · E interactuar · M mapa · N sonido · clic = ratón'
};
