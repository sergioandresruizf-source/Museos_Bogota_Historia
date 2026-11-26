// Las 5 salas del recorrido. Cada sala turna 3 canciones (playlist); `music` es la primera.
const S = "./assets/sounds/";

export const salas = [
  { id:1, name:"Patio colonial", subtitle:"Bogotá colonial y escenas de la época", unlockAt:0,
    playlist:[S+"jose-a-morales-pueblito-viejo.mp3", S+"pedro-morales-pino-bochica.mp3", S+"jose-a-morales-campesina-santandereana.mp3"] },
  { id:2, name:"Capilla", subtitle:"Arte religioso y objetos", unlockAt:0,
    playlist:[S+"luis-a-calvo-lejano-azul.mp3", S+"luis-a-calvo-malvaloca.mp3", S+"pedro-morales-pino-cuatro-preguntas.mp3"] },
  { id:3, name:"Tienda de Llorente", subtitle:"El 20 de julio de 1810", unlockAt:35,
    playlist:[S+"beethoven-obertura-egmont.mp3", S+"alberto-castilla-el-bunde-tolimense.mp3", S+"elias-m-soto-brisas-del-pamplonita.mp3"] },
  { id:4, name:"Sala de armas", subtitle:"La guerra de Independencia y sus protagonistas", unlockAt:35,
    playlist:[S+"beethoven-sinfonia-3-heroica.mp3", S+"anselmo-duran-plazas-el-sanjuanero.mp3", S+"jorge-villamil-espumas.mp3"] },
  { id:5, name:"Archivo", subtitle:"Memoria, documentos y símbolos", unlockAt:70,
    playlist:[S+"oreste-sindici-himno-nacional.mp3", S+"garzon-y-collazos-soy-colombiano.mp3", S+"lucho-bermudez-colombia-tierra-querida.mp3"] },
];

for (const s of salas) s.music = s.playlist[0];
