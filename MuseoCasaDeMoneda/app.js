/* ===== IMÁGENES: pega la dirección de la foto entre las comillas. a = anverso (frente), r = reverso (al revés). Si lo dejas vacío se usa el dibujo. ===== */
const CARPETA = "assets/"; // carpeta de tus imágenes, relativa a este HTML[cite: 1]
const IMAGENES = {
  moneda_colonial_1810: { a: "monedas/1.png", r: "monedas/1.2.png" },
  medio_peso_1868: { a: "monedas/19.png", r: "monedas/19.2.png" },
  la_pelucona_carlos_iii_1789: { a: "monedas/18.png", r: "monedas/18.2.png" },
  dos_reales_cartagena_1812: { a: "monedas/2.png", r: "monedas/2.2.png" },
  real_cundinamarca_la_china_1813: {
    a: "monedas/12.png",
    r: "monedas/12.2.png",
  },
  ocho_reales_provincias_unidas_1819: {
    a: "monedas/17.png",
    r: "monedas/17.png",
  },
  ocho_reales_republica_1820: { a: "monedas/16.png", r: "monedas/16.2.png" },
  cuarto_real_nueva_granada_1839: {
    a: "monedas/11.png",
    r: "monedas/11.2.png",
  },
  diez_pesos_oro_el_condor_1858: { a: "monedas/8.png", r: "monedas/8.2.png" },
  ficha_1_tarro_la_amalia: { a: "monedas/7.png", r: "monedas/7.2.png" },
  cincuenta_centavos_la_cocobola_1887: {
    a: "monedas/5.2.png",
    r: "monedas/5.png",
  },
  cincuenta_centavos_cristobal_colon_1892: {
    a: "monedas/15.png",
    r: "monedas/15.2.png",
  },
  billete_1000_pesos_banco_nacional_1895: {
    a: "billetes/10.jpg",
    r: "billetes/10.2.jpg",
  },
  cinco_centavos_lazareto_1921: { a: "monedas/6.png", r: "monedas/6.2.png" },
  billete_5_pesos_oro_resellado_1923: {
    a: "billetes/9.jpg",
    r: "billetes/9.2.jpg",
  },

  billete_1000_gaitan_2006: {
    a: "billetes/Billete_1.000_Gaitán.png",
    r: "billetes/Billete_1.000_Gaitán_Reverso.png",
  },
  billete_1_peso_oro_1974: {
    a: "billetes/Billete_1_Peso.png",
    r: "billetes/Billete_1_Peso_Reverso.png",
  },
  billete_medio_peso_oro_narino: {
    a: "billetes/Billete_Medio_Peso.png",
    r: "billetes/Billete_Medio_Peso_Reverso.png",
  },
  billete_20000_garavito_2009: {
    a: "billetes/Billete_20.000_Garavito.png",
    r: "billetes/Billete_20.000_Garavito_Reverso.png",
  },
  billete_5000_silva_2013: {
    a: "billetes/Billete_5.000_Silva.png",
    r: "billetes/Billete_5.000_Silva_Reverso.png",
  },
  billete_500_peso_oro_santander_1984: {
    a: "billetes/Billete_500_Santander.png",
    r: "billetes/Billete_500_Santander_Reverso.png",
  },
  billete_10000_pola_2007: {
    a: "billetes/Billete_10.000_Policarpa.png",
    r: "billetes/Billete_10.000_Policarpa_Reverso.png",
  },
  billete_1000_bolivar_1995: {
    a: "billetes/Billete_1.000_Bolívar.png",
    r: "billetes/Billete_1.000_Bolívar_Reverso.png",
  },
  billete_2_pesos_oro_pola_1976: {
    a: "billetes/billete_2_pesos_oro.jpg",
    r: "billetes/billete_2_pesos_oro_Reverso.jpg",
  },
  billete_5_pesos_oro_cordova_1977: {
    a: "billetes/billete_5_pesos_oro.jpg",
    r: "billetes/billete_5_pesos_oro_Reverso.jpg",
  },
  billete_10000_pesos_oro_indigena_fauna: {
    a: "billetes/Billete_10.000_Embera.png",
    r: "billetes/Billete_10.000_Embera_Reverso.png",
  },
  billete_20_pesos_oro_caldas: {
    a: "billetes/billete_20_pesos_el_sabio_jose.jpg",
    r: "billetes/billete_20_pesos_el_sabio_jose_Reverso.jpg",
  },
  billete_50_pesos_oro_camilo_torres_1973: {
    a: "billetes/Billete_50_pesos_oro_Camilo.jpg",
    r: "billetes/Billete_50_pesos_oro_Camilo_Reverso.jpg",
  },
  billete_50000_jorge_isaacs_1996: {
    a: "billetes/Billete_50.000_Isaacs.png",
    r: "billetes/Billete_50.000_Isaacs_Reverso.png",
  },
  billete_100_pesos_oro_santander: {
    a: "billetes/Billete_100_pesos_oro_Nariño.jpg",
    r: "billetes/Billete_100_pesos_oro_Nariño_Reverso.jpg",
  },
  billete_200_pesos_oro_mutis_1991: {
    a: "billetes/Billete_200_pesos_oro_Jose.jpg",
    r: "billetes/Billete_200_pesos_oro_Jose_Reverso.jpg",
  },
  billete_2000_pesos_oro_historica: {
    a: "billetes/billete_2000_pesos_oro_Simoncin.jpg",
    r: "billetes/billete_2000_pesos_oro_Simoncin_Reverso.jpg",
  },
  billete_5000_pesos_oro_historica: {
    a: "billetes/billete_5000_pesos_oro_Rafael_nuñez.jpg",
    r: "billetes/billete_5000_pesos_oro_Rafael_nuñez_Reverso.jpg",
  },
  billete_50000_gabo_2016: {
    a: "billetes/Billete_50000_pesos_Gabriel.png",
    r: "billetes/Billete_50000_pesos_Gabriel_Reverso.png",
  },
  billete_2000_debora_arango_2016: {
    a: "billetes/Billete_de_2.000_Pesos_Débora_Arango_y_Caño_Cristales.jpg",
    r: "billetes/Billete_de_2.000_Pesos_Débora_Arango_y_Caño_Cristales_Reverso.jpg",
  },
  billete_2000_pesos_oro_anterior: {
    a: "billetes/Billete_de_2.000_Pesos_Santander.jpg",
    r: "billetes/Billete_de_2.000_Pesos_Santander_Reverso.jpg",
  },
  billete_10000_virginia_gutierrez_2016: {
    a: "billetes/Billete_de_10.000_Pesos_Virginia_Gutiérrez_de_Pineda.jpg",
    r: "billetes/Billete_de_10.000_Pesos_Virginia_Gutiérrez_de_Pineda_Reverso.jpg",
  },
  billete_20000_lopez_michelsen_2016: {
    a: "billetes/Billete_de_20.000_Pesos_Alfonso_López_Michelsen.jpg",
    r: "billetes/Billete_de_20.000_Pesos_Alfonso_López_Michelsen_Reverso.jpg",
  },
  moneda_1000_pesos_1996: { a: "monedas/1.2.png", r: "monedas/1.png" },
  moneda_5_pesos_oro_1924: { a: "monedas/20.png", r: "monedas/20.2.png" },
  moneda_50_centavos_1956: { a: "monedas/21.png", r: "monedas/21.2.png" },
  moneda_500_pesos_2010: { a: "monedas/10.2.png", r: "monedas/10.png" },
  moneda_5000_catedral_antioquia_2015: {
    a: "monedas/4.png",
    r: "monedas/4.2.png",
  },
  moneda_10_pesos_san_andres_cordoba_1985: {
    a: "monedas/22.png",
    r: "monedas/22.2.png",
  },
  moneda_20000_carriel_antioqueno_2024: {
    a: "monedas/13.png",
    r: "monedas/13.2.png",
  },
  moneda_50_pesos_1999: { a: "monedas/25.png", r: "monedas/25.2.png" },
  moneda_10000_pola_2012: { a: "monedas/23.2.png", r: "monedas/23.png" },
  moneda_bicentenario_independencia_2019: {
    a: "monedas/24.png",
    r: "monedas/24.2.png",
  },
  moneda_20000_centenario_banco_2023: {
    a: "monedas/26.png",
    r: "monedas/26.2.png",
  },
  moneda_20000_500_anos_santa_marta_2025: {
    a: "monedas/27.png",
    r: "monedas/27.2.png",
  },
  moneda_200_pesos_2005: { a: "monedas/28.png", r: "monedas/28.2.png" },
};

const ITEMS = [
  {
    id: "moneda_colonial_1810",
    t: "coin",
    n: "Moneda colonial y antecedentes de la Independencia (2 Reales de Fernando VII)",
    c: "#d9d2c0",
    a: ["1810", "FERNANDO VII"],
    r: ["👑", "2 REALES"],
    date: "1810 (Siglos XVI-1810; periodo colonial)",
    by: "La Corona española, las autoridades coloniales y las casas de moneda de Santafé y Popayán",
    h: "La economía utilizó monedas españolas y piezas acuñadas localmente. Circularon principalmente oro y plata, con valores y pesos regulados por la monarquía, expresando la autoridad del rey y facilitando el comercio, los tributos y los pagos.",
    cu: "Era un símbolo visible del poder colonial y no se identifica censura artística general, aunque la Corona controlaba estrictamente su acuñación, circulación y falsificación.",
  },

  {
    id: "medio_peso_1868",
    t: "coin",
    n: "Restablecimiento del patrón de plata (Medio Peso de los Estados Unidos de Colombia)",
    c: "#d9d2c0",
    a: ["1/2", "PESO"],
    r: ["🥈", "1868"],
    date: "1868 (Periodo 1864-1870)",
    by: "Gobierno de los Estados Unidos de Colombia y Congreso; casas de moneda nacionales y regionales",
    h: "Tras ensayos y rectificaciones sobre la ley monetaria, la ley del 24 de octubre de 1867 restableció el patrón plata (peso de 25 gramos y ley .900), circulando también medios pesos y fracciones.",
    cu: "Surgieron incentivos para llevar a la ceca monedas de menor pureza, lo que podía debilitar la calidad del dinero en circulación.",
  },

  {
    id: "la_pelucona_carlos_iii_1789",
    t: "coin",
    n: 'Escudos "La Pelucona" de Carlos III',
    c: "#ffd166",
    a: ["1789", "PELUCONA"],
    r: ["👑", "ESCUDOS"],
    date: "1789 (Reinado de Carlos III)",
    by: "La Corona española, durante el reinado de Carlos III, y las casas de moneda autorizadas",
    h: "Pieza de oro conocida como 'La Pelucona' que muestra el retrato del monarca en una cara y el escudo de la Corona en la otra, identificando la autoridad emisora y la pertenencia al sistema español.",
    cu: "El retrato del rey convertía la moneda cotidiana en un recordatorio constante de la autoridad política colonial.",
  },
  {
    id: "dos_reales_cartagena_1812",
    t: "coin",
    n: "2 Reales del Estado de Cartagena",
    c: "#c9b37e",
    a: ["2", "REALES"],
    r: ["⚔", "1812"],
    date: "1812 (Periodo de la Independencia)",
    by: "Las autoridades patriotas del Estado de Cartagena",
    h: "Emitida por Cartagena durante la independencia para atender necesidades económicas del gobierno patriota, con símbolos y leyendas del Estado de Cartagena que buscaban afirmar una autoridad distinta a la Corona.",
    cu: "Durante la Reconquista, las autoridades realistas combatieron los signos monetarios patriotas y restringieron su circulación.",
  },
  {
    id: "real_cundinamarca_la_china_1813",
    t: "coin",
    n: '1 Real de Cundinamarca "La China"',
    c: "#d9d2c0",
    a: ["1", "REAL"],
    r: ["🌿", "LA CHINA"],
    date: "1813 (Periodo de la Independencia)",
    by: "Gobierno de Cundinamarca; el diseño de 'La China' se relaciona con Antonio Nariño",
    h: "Moneda de un real de las emisiones de Cundinamarca conocida como 'La China', con perfil femenino en una cara y motivo vegetal con denominación en la otra, apartándose del retrato del monarca español.",
    cu: "Cambiar los símbolos monetarios era una forma de expresar un nuevo lenguaje político y una autoridad diferente.",
  },
  {
    id: "ocho_reales_provincias_unidas_1819",
    t: "coin",
    n: "8 Reales de las Provincias Unidas de la Nueva Granada",
    c: "#d9d2c0",
    a: ["8", "REALES"],
    r: ["🌱", "1819"],
    date: "1819 (Periodo de la Independencia)",
    by: "Las autoridades de las Provincias Unidas de la Nueva Granada",
    h: "Emitida en el contexto de las Provincias Unidas de la Nueva Granada, con busto femenino en el anverso y símbolo vegetal con letras y marcas de valor en el reverso para identificar emisiones propias.",
    cu: "La guerra, los cambios de autoridad y la escasez de recursos dificultaban la estabilidad monetaria y la confianza en las piezas.",
  },
  {
    id: "ocho_reales_republica_1820",
    t: "coin",
    n: "8 Reales de la República de Colombia",
    c: "#d9d2c0",
    a: ["8", "REALES"],
    r: ["🇨🇴", "1820"],
    date: "1820 (Periodo republicano inicial)",
    by: "Las autoridades de la República de Colombia en el proceso de organización republicana",
    h: "Conserva el formato metálico de ocho reales e incorpora referencias a la República de Colombia, con retrato y símbolos del reverso vinculados al nuevo orden político tras las victorias independentistas.",
    cu: "La transición desde las monedas coloniales no fue inmediata: coexistían piezas de distintos periodos y características.",
  },
  {
    id: "cuarto_real_nueva_granada_1839",
    t: "coin",
    n: "1¼ de Real de la Nueva Granada",
    c: "#d9d2c0",
    a: ["1/4", "REAL"],
    r: ["🌾", "1839"],
    date: "1839 (Periodo de la Nueva Granada)",
    by: "El gobierno de la Nueva Granada y las autoridades encargadas de la acuñación",
    h: "Moneda fraccionaria de un cuarto de real emitida en la Nueva Granada, con elementos vegetales y denominación en ambas caras, pensada para pagos de menor valor y transacciones cotidianas.",
    cu: "Las piezas de baja denominación eran clave para facilitar los intercambios pequeños en la vida económica diaria.",
  },
  {
    id: "diez_pesos_oro_el_condor_1858",
    t: "coin",
    n: '10 Pesos de Oro "El Cóndor"',
    c: "#ffd166",
    a: ["10", "PESOS"],
    r: ["🦅", "CÓNDOR"],
    date: "1858 (Periodo de la Nueva Granada)",
    by: "El gobierno de la Nueva Granada y las autoridades monetarias de la época",
    h: "Moneda de diez pesos de oro llamada 'El Cóndor', perteneciente a las emisiones republicanas de la Nueva Granada, con retrato en una cara y escudo con el cóndor en la otra.",
    cu: "Su denominación y material reflejan el peso del oro y los debates sobre el patrón monetario y el modelo económico.",
  },
  {
    id: "ficha_1_tarro_la_amalia",
    t: "coin",
    n: "Ficha 1 Tarro - Hacienda La Amalia",
    c: "#c9b37e",
    a: ["1", "TARRO"],
    r: ["🏡", "LA AMALIA"],
    date: "No indicado",
    by: "La Hacienda La Amalia (autoría individual o autoridad no identificada en el banco de imágenes)",
    h: "Ficha vinculada a la Hacienda La Amalia con denominación de un tarro, mostrando en ambas caras la inscripción del lugar y el valor señalado en lugar de ser una moneda nacional.",
    cu: "No se precisa fecha, lugar exacto ni condiciones de uso en el material suministrado; evidencia intercambios ligados a espacios o actividades particulares.",
  },
  {
    id: "cincuenta_centavos_la_cocobola_1887",
    t: "coin",
    n: '50 Centavos "La Cocobola"',
    c: "#d9d2c0",
    a: ["50", "CENTAVOS"],
    r: ["🛡", "COCOBOLA"],
    date: "1887 (Periodo de la Regeneración)",
    by: "Autoridad emisora no especificada en el banco de imágenes",
    h: "Pieza de cincuenta centavos identificada como 'La Cocobola', con retrato y escudo en sus caras, denominación y referencias a Bogotá, circulando durante la Regeneración.",
    cu: "Muestra que durante la Regeneración el efectivo no se limitaba al papel moneda, pese a la centralización de la emisión de billetes.",
  },
  {
    id: "cincuenta_centavos_cristobal_colon_1892",
    t: "coin",
    n: "50 Centavos de Cristóbal Colón",
    c: "#d9d2c0",
    a: ["50", "CENTAVOS"],
    r: ["🧭", "COLÓN"],
    date: "1892 (Periodo de la República de Colombia)",
    by: "Autoridad emisora no especificada en el banco de imágenes",
    h: "Moneda de cincuenta centavos con el retrato de Cristóbal Colón en una cara y un escudo en la otra, combinando figura histórica con símbolos institucionales y denominación.",
    cu: "El banco de imágenes no explica el motivo específico de elegir a Colón ni las condiciones de emisión de la pieza.",
  },
  {
    id: "billete_1000_pesos_banco_nacional_1895",
    t: "note",
    n: "Billete de 1.000 Pesos del Banco Nacional",
    c: "#bfe3c0",
    a: ["1.000", "PESOS"],
    r: ["🏦", "1895"],
    date: "1895 (Periodo de operación y liquidación del Banco Nacional)",
    by: "Banco Nacional (emisiones oficiales de la época)",
    h: "Billete de mil pesos impreso en ambas caras con elementos ornamentales, inscripciones y denominación, ubicado en los años finales del Banco Nacional antes de su liquidación y disolución efectiva.",
    cu: "La emisión excesiva y los problemas fiscales redujeron la confianza y el poder adquisitivo al financiar al Estado sin límites creíbles.",
  },
  {
    id: "cinco_centavos_lazareto_1921",
    t: "coin",
    n: "5 Centavos de Lazareto",
    c: "#d9d2c0",
    a: ["5", "CENTAVOS"],
    r: ["🏥", "LAZARETO"],
    date: "1921 (Periodo de la República de Colombia)",
    by: "Autoridad emisora no identificada en el banco de imágenes",
    h: "Moneda de cinco centavos con la denominación 'Lazareto', mostrando en ambas caras la identificación de la pieza y su valor como una emisión particular.",
    cu: "El material no detalla quién ordenó su emisión, dónde circuló ni su alcance, aunque muestra la existencia de emisiones especiales.",
  },
  {
    id: "billete_5_pesos_oro_resellado_1923",
    t: "note",
    n: "Billete de 5 Pesos Oro Resellado",
    c: "#ffe08a",
    a: ["5", "PESOS ORO"],
    r: ["🔖", "RESELLADO"],
    date: "1923 (Periodo de la República de Colombia)",
    by: "Autoridad emisora original y entidad del resello no especificadas en el banco de imágenes",
    h: "Billete de cinco pesos oro con un resello visible sobre el diseño impreso y elementos gráficos en ambas caras, señal de una intervención posterior a su impresión.",
    cu: "Sin información adicional no se precisan el motivo exacto, la fecha de la intervención ni la entidad que realizó el resello.",
  },
  {
    id: "billete_1000_gaitan_2006",
    t: "note",
    n: "Billete de 1.000 Pesos (Jorge Eliécer Gaitán)",
    c: "#bfe3c0",
    a: ["1.000", "GAITÁN"],
    r: ["🗣", "2006"],
    date: "2006 (fecha impresa: 9 de noviembre de 2006; familia emitida desde 2001)",
    by: "Banco de la República de Colombia; diseño de José Antonio Suárez",
    h: "Rinde homenaje al líder político Jorge Eliécer Gaitán, con su retrato y escena de manifestación popular en el anverso, y Gaitán ante la multitud con su firma y frases en el reverso; reemplazó al billete de $1.000 de Simón Bolívar y luego dio paso a la moneda de $1.000.",
    cu: "Incorporó figuras políticas del siglo XX en el papel moneda y salió gradualmente por razones técnicas y económicas de durabilidad del efectivo de uso masivo.",
  },
  {
    id: "billete_1_peso_oro_1974",
    t: "note",
    n: "Billete de 1 Peso Oro (Simón Bolívar y Francisco de Paula Santander)",
    c: "#bfe3c0",
    a: ["1", "PESO ORO"],
    r: ["🦅", "1974"],
    date: "1974 (fecha impresa: 7 de agosto de 1974)",
    by: "Banco de la República de Colombia (Imprenta de Billetes)",
    h: "Combina en el anverso los retratos de Simón Bolívar y Francisco de Paula Santander rodeados de laureles, y en el reverso un cóndor de los Andes sobre el Salto del Tequendama y el nevado del Tolima, coronado por la Libertad.",
    cu: "Representa cuando el peso aún conservaba la denominación 'oro' y perdió practicidad en papel por la inflación acumulada de los años setenta y ochenta.",
  },
  {
    id: "billete_medio_peso_oro_narino",
    t: "note",
    n: "Billete de ½ Peso Oro (Antonio Nariño)",
    c: "#ffe08a",
    a: ["1/2", "NARIÑO"],
    r: ["🛡", "1948"],
    date: "1948 (ficha técnica)",
    by: "República de Colombia; impreso por la American Bank Note Company",
    h: "Emitido en medio peso oro (50 centavos) con el retrato central de Antonio Nariño y firmas oficiales en el anverso, y el Escudo Nacional flanqueado por '1/2' en el reverso, ante la escasez de moneda metálica fraccionaria tras la Segunda Guerra Mundial.",
    cu: "Fue una emisión provisional de emergencia para el comercio menudo e ilustra la dependencia de imprentas extranjeras como la American Bank Note Company.",
  },
  {
    id: "billete_20000_garavito_2009",
    t: "note",
    n: "Billete de 20.000 Pesos (Julio Garavito Armero)",
    c: "#bfe3c0",
    a: ["20.000", "GARAVITO"],
    r: ["🌍", "2009"],
    date: "2009 (fecha impresa: 24 de agosto de 2009; familia emitida desde 1996)",
    by: "Banco de la República de Colombia (Imprenta de Billetes); diseño de Juan Cárdenas",
    h: "Homenajea al astrónomo, matemático e ingeniero Julio Garavito Armero, con su retrato y la Luna en el anverso y una vista de la Tierra desde el espacio, figuras geométricas euclidianas y elementos del Observatorio Astronómico Nacional en el reverso.",
    cu: "Amplió la identidad nacional en los billetes hacia la ciencia y fue blanco frecuente de falsificaciones antes de ser reemplazado por la familia de 2016.",
  },
  {
    id: "billete_5000_silva_2013",
    t: "note",
    n: "Billete de 5.000 Pesos (José Asunción Silva)",
    c: "#ffb4a2",
    a: ["5.000", "SILVA"],
    r: ["🌙", "2013"],
    date: "2013 (fecha impresa: 1.º de septiembre de 2013; familia emitida desde 1995)",
    by: "Banco de la República de Colombia (Imprenta de Billetes); diseño de Juan Cárdenas",
    h: "Dedicado al poeta modernista José Asunción Silva, con su retrato y paisaje de alamedas en el anverso y una escena inspirada en su poema 'Nocturno' bajo luna llena y monumento funerario en el reverso.",
    cu: "El monumento funerario del reverso incluye microimpreso el texto del poema 'Nocturno' y el billete cedió paso al de $5.000 emitido desde 2016.",
  },
  {
    id: "billete_500_peso_oro_santander_1984",
    t: "note",
    n: "Billete de 500 Pesos Oro (Francisco de Paula Santander)",
    c: "#bfe3c0",
    a: ["500", "SANTANDER"],
    r: ["🏛", "1984"],
    date: "1984 (fecha impresa: 20 de julio de 1984)",
    by: "Banco de la República de Colombia (Imprenta de Billetes)",
    h: "Muestra en el anverso a Francisco de Paula Santander con pluma y documentos por su rol como 'Hombre de las Leyes', y en el reverso el patio interior de la Casa de Moneda de Bogotá y una prensa histórica de volante.",
    cu: "Perdió relevancia para pagos mayores por el alza sostenida de precios y fue sustituido por la moneda de $500 a partir de 1993.",
  },
  {
    id: "billete_10000_pola_2007",
    t: "note",
    n: "Billete de 10.000 Pesos (Policarpa Salavarrieta)",
    c: "#ffb4a2",
    a: ["10.000", "POLA"],
    r: ["🏘", "2007"],
    date: "2007 (fecha impresa: 20 de agosto de 2007; familia emitida desde 1995)",
    by: "Banco de la República de Colombia (Imprenta de Billetes); diseño basado en retrato atribuido a José María Espinosa",
    h: "Conmemora a Policarpa Salavarrieta ('La Pola') con su retrato y franjas geométricas precolombinas en el anverso, y la plaza principal de Guaduas con escenas costumbristas del siglo XIX en el reverso.",
    cu: "Tras el robo al Banco de la República en Valledupar en 1994, impulsó mayores estándares de seguridad y luego fue reemplazado desde 2016 por el billete de Virginia Gutiérrez de Pineda.",
  },
  {
    id: "billete_1000_bolivar_1995",
    t: "note",
    n: "Billete de 1.000 Pesos (Simón Bolívar)",
    c: "#bfe3c0",
    a: ["1.000", "BOLÍVAR"],
    r: ["🐎", "1995"],
    date: "1995 (fecha impresa: 21 de abril de 1995; familia emitida entre 1982 y 1995)",
    by: "Banco de la República de Colombia (Imprenta de Billetes)",
    h: "Presenta en el anverso a Simón Bolívar junto al Puente de Boyacá y su monumento, y en el reverso el Monumento a los Lanceros del Pantano de Vargas (de Rodrigo Arenas Betancourt), la Libertad y motivos precolombinos.",
    cu: "Su alta rotación aceleraba el desgaste y encarecía la reposición, por lo que fue reemplazado por la moneda bimetálica de $1.000 (1996) y luego por el billete de Gaitán (2001).",
  },
  {
    id: "billete_2_pesos_oro_pola_1976",
    t: "note",
    n: "Billete de 2 Pesos Oro (Policarpa Salavarrieta)",
    c: "#ffe08a",
    a: ["2", "PESOS ORO"],
    r: ["⚓", "1976"],
    date: "1976",
    by: "Banco de la República de Colombia; diseño e impresión institucional de la época",
    h: "Presenta a Policarpa Salavarrieta en una cara y una composición alusiva al comercio marítimo en la otra, circulando como denominación baja de uso cotidiano.",
    cu: "Facilitaba pagos pequeños, pero su uso frecuente en papel provocaba rápido deterioro y requería reposición constante.",
  },
  {
    id: "billete_5_pesos_oro_cordova_1977",
    t: "note",
    n: "Billete de 5 Pesos Oro (José María Córdova)",
    c: "#ffe08a",
    a: ["5", "CÓRDOVA"],
    r: ["🏰", "1977"],
    date: "1977",
    by: "Banco de la República de Colombia; diseño e impresión institucional de la época",
    h: "Muestra el retrato del general José María Córdova y el Castillo de San Felipe de Barajas, vinculando a un protagonista de la Independencia con un escenario histórico y militar.",
    cu: "Evidencia cómo los referentes militares predominaron durante buena parte de la historia del billete colombiano frente a otros sectores sociales.",
  },
  {
    id: "billete_10000_pesos_oro_indigena_fauna",
    t: "note",
    n: "Billete de 10.000 Pesos Oro (motivos indígenas y fauna)",
    c: "#bfe3c0",
    a: ["10.000", "PESOS ORO"],
    r: ["🦜", "FAUNA"],
    date: "Sin fecha legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Exhibe una composición de fauna y elementos geográficos en una cara y el retrato de una mujer indígena en la otra, incorporando referencias a la diversidad natural y cultural.",
    cu: "El archivo no precisa el año, el nombre de la mujer retratada ni el contexto exacto de emisión, aunque amplía la memoria visual más allá de próceres militares.",
  },
  {
    id: "billete_20_pesos_oro_caldas",
    t: "note",
    n: "Billete de 20 Pesos Oro (Francisco José de Caldas)",
    c: "#ffe08a",
    a: ["20", "CALDAS"],
    r: ["📐", "PESOS ORO"],
    date: "Fecha no legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Presenta un retrato masculino asociado en registros históricos con Francisco José de Caldas y un diseño ornamental con elementos propios de la impresión de billetes de su época.",
    cu: "Recuerda el aporte de la ciencia y el conocimiento en la formación de la nación, aunque el año no se alcanza a leer en la imagen del documento.",
  },
  {
    id: "billete_50_pesos_oro_camilo_torres_1973",
    t: "note",
    n: "Billete de 50 Pesos Oro (Camilo Torres Tenorio)",
    c: "#ffb4a2",
    a: ["50", "CAMILO TORRES"],
    r: ["🌸", "1973"],
    date: "1973",
    by: "Banco de la República de Colombia; diseño e impresión institucional de la época",
    h: "Asociado a Camilo Torres Tenorio, protagonista de la Independencia, combinando su retrato con motivos florales y ornamentales del papel moneda de ese periodo.",
    cu: "Vincula la memoria de la Independencia con el dinero cotidiano, aunque la memoria oficial no abarca por sí sola toda la diversidad de experiencias históricas.",
  },
  {
    id: "billete_50000_jorge_isaacs_1996",
    t: "note",
    n: "Billete de 50.000 Pesos (Jorge Isaacs)",
    c: "#bfe3c0",
    a: ["50.000", "ISAACS"],
    r: ["🏡", "1996"],
    date: "1996",
    by: "Banco de la República de Colombia; diseño de la familia de billetes de la época",
    h: "Presenta al escritor Jorge Isaacs, autor de María, y en la otra cara un paisaje vinculado con el Valle del Cauca y la Hacienda El Paraíso, en una de las denominaciones más altas de su tiempo.",
    cu: "Difundió el patrimonio literario colombiano y respondió a mayores valores nominales, siendo reemplazado después por la nueva familia de billetes.",
  },
  {
    id: "billete_100_pesos_oro_santander",
    t: "note",
    n: "Billete de 100 Pesos Oro (Francisco de Paula Santander)",
    c: "#ffe08a",
    a: ["100", "SANTANDER"],
    r: ["🏛", "PESOS ORO"],
    date: "Año no legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Muestra una edificación en una cara y el retrato de Francisco de Paula Santander en la otra, combinando arquitectura y memoria republicana en un billete de uso diario.",
    cu: "El material gráfico no permite leer con claridad el año de impresión ni confirmar otros datos técnicos adicionales.",
  },
  {
    id: "billete_200_pesos_oro_mutis_1991",
    t: "note",
    n: "Billete de 200 Pesos Oro (José Celestino Mutis)",
    c: "#ffb4a2",
    a: ["200", "MUTIS"],
    r: ["🌿", "1991"],
    date: "1991",
    by: "Banco de la República de Colombia; diseño e impresión institucional",
    h: "Relacionado con José Celestino Mutis, naturalista, médico y promotor de la Expedición Botánica, con una composición arquitectónica y su retrato en sus caras.",
    cu: "Destaca el vínculo entre ciencia, naturaleza y biodiversidad, aunque los cambios económicos llevaron a sustituir progresivamente los billetes de bajo valor.",
  },
  {
    id: "billete_2000_pesos_oro_historica",
    t: "note",
    n: "Billete de 2.000 Pesos Oro (emisión histórica)",
    c: "#bfe3c0",
    a: ["2.000", "PESOS ORO"],
    r: ["📜", "HISTÓRICO"],
    date: "Fecha no legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Presenta una escena histórica en una cara y el retrato de un personaje de la historia republicana en la otra dentro de las emisiones de dos mil pesos oro.",
    cu: "La falta de nitidez en la imagen impide confirmar con seguridad el año y la identidad exacta del personaje retratado.",
  },
  {
    id: "billete_5000_pesos_oro_historica",
    t: "note",
    n: "Billete de 5.000 Pesos Oro (emisión histórica)",
    c: "#ffe08a",
    a: ["5.000", "PESOS ORO"],
    r: ["🗿", "PATRIMONIO"],
    date: "Fecha no legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Muestra el retrato de un personaje histórico y una composición vinculada al patrimonio cultural colombiano, con elementos ornamentales y una escena escultórica en el reverso.",
    cu: "Sin fecha visible ni identificación legible del retrato en la imagen aportada, no se precisa la emisión con total seguridad.",
  },
  {
    id: "billete_50000_gabo_2016",
    t: "note",
    n: "Billete de 50.000 Pesos (Gabriel García Márquez)",
    c: "#ffe08a",
    a: ["50.000", "GARCÍA MÁRQUEZ"],
    r: ["🦋", "2016"],
    date: "2016",
    by: "Banco de la República de Colombia; diseño de la nueva familia de billetes",
    h: "De la nueva familia de billetes, rinde homenaje a Gabriel García Márquez con el escritor, elementos asociados a su obra y paisajes del Caribe colombiano.",
    cu: "Reconoce la proyección internacional de la literatura colombiana y requiere controles de autenticidad por su alta denominación.",
  },
  {
    id: "billete_2000_debora_arango_2016",
    t: "note",
    n: "Billete de 2.000 Pesos (Débora Arango)",
    c: "#bfe3c0",
    a: ["2.000", "DÉBORA ARANGO"],
    r: ["🎨", "2016"],
    date: "2016",
    by: "Banco de la República de Colombia; diseño de la nueva familia de billetes",
    h: "De la nueva familia, está dedicado a la artista Débora Arango e incluye su retrato, elementos relacionados con su obra, paisajes y motivos naturales.",
    cu: "Amplía la presencia de mujeres creadoras en el dinero circulante, aunque una figura no abarca toda la diversidad artística del país.",
  },
  {
    id: "billete_2000_pesos_oro_anterior",
    t: "note",
    n: "Billete de 2.000 Pesos Oro (emisión anterior)",
    c: "#ffb4a2",
    a: ["2.000", "PESOS ORO"],
    r: ["🏛", "ANTERIOR"],
    date: "Fecha no legible en la imagen",
    by: "Banco de la República de Colombia (diseñador no identificado en la imagen)",
    h: "Emisión anterior de dos mil pesos oro con el retrato de un personaje masculino y una composición arquitectónica en la otra cara.",
    cu: "Permite comparar cambios gráficos y cromáticos del papel moneda, sin que la imagen permita establecer con certeza el año o el personaje.",
  },
  {
    id: "billete_10000_virginia_gutierrez_2016",
    t: "note",
    n: "Billete de 10.000 Pesos (Virginia Gutiérrez de Pineda)",
    c: "#ffb4a2",
    a: ["10.000", "VIRGINIA GUTIÉRREZ"],
    r: ["🌴", "2016"],
    date: "2016",
    by: "Banco de la República de Colombia; diseño de la nueva familia de billetes",
    h: "De la nueva familia, homenajea a la antropóloga Virginia Gutiérrez de Pineda por sus estudios sobre familia y cultura, con paisaje y biodiversidad amazónica en el reverso.",
    cu: "Visibiliza el aporte de las ciencias sociales y de una investigadora frente al predominio histórico de figuras políticas.",
  },
  {
    id: "billete_20000_lopez_michelsen_2016",
    t: "note",
    n: "Billete de 20.000 Pesos (Alfonso López Michelsen)",
    c: "#ffb4a2",
    a: ["20.000", "LÓPEZ MICHELSEN"],
    r: ["🌊", "2016"],
    date: "2016",
    by: "Banco de la República de Colombia; diseño de la nueva familia de billetes",
    h: "De la nueva familia, presenta a Alfonso López Michelsen y en la otra cara elementos del paisaje y la cultura del Caribe colombiano junto a motivos de biodiversidad y territorio.",
    cu: "Une memoria política con referencias regionales y naturales del Caribe colombiano.",
  },
  {
    id: "moneda_1000_pesos_1996",
    t: "coin",
    n: "Moneda de 1000 Pesos",
    c: "#c9b37e",
    a: ["100", "PESOS"],
    r: ["💠", "1996"],
    date: "1996 (año visible en la pieza)",
    by: "República de Colombia; acuñación oficial",
    h: "Muestra la denominación en una cara y motivos geométricos y ornamentales en la otra, con el año 1996 visible, dentro de las monedas fraccionarias de uso cotidiano.",
    cu: "Su diseño sencillo ayuda a identificar el valor rápido, aunque las monedas de uso frecuente se desgastan y pierden definición con el tiempo.",
  },
  {
    id: "moneda_5_pesos_oro_1924",
    t: "coin",
    n: "Moneda de 5 Pesos Oro",
    c: "#ffd166",
    a: ["5", "PESOS ORO"],
    r: ["🛡", "1924"],
    date: "1924 (año visible en la pieza)",
    by: "República de Colombia; autoridad de acuñación de la época",
    h: "Moneda de cinco pesos oro con el escudo nacional y un perfil masculino en sus caras, con fecha visible de 1924, propia del sistema monetario de comienzos del siglo XX.",
    cu: "El material gráfico no detalla el tiraje ni las circunstancias económicas concretas de esta emisión.",
  },
  {
    id: "moneda_50_centavos_1956",
    t: "coin",
    n: "Moneda de 50 Centavos",
    c: "#d9d2c0",
    a: ["50", "CENTAVOS"],
    r: ["🪶", "1956"],
    date: "1956 (año visible en la pieza)",
    by: "República de Colombia; acuñación oficial",
    h: "Presenta el escudo de Colombia en una cara y un perfil indígena en la otra, con el año 1956 visible, uniendo símbolo institucional y referencia a pueblos originarios.",
    cu: "La imagen no identifica a la persona retratada ni el criterio de selección, pero refleja diversidad cultural en la numismática.",
  },
  {
    id: "moneda_500_pesos_2010",
    t: "coin",
    n: "Moneda de 500 Pesos",
    c: "#c9b37e",
    a: ["500", "PESOS"],
    r: ["🌳", "2010"],
    date: "2010 (año visible en la pieza)",
    by: "Banco de la República de Colombia; acuñación en la Casa de Moneda",
    h: "Moneda bimetálica de quinientos pesos con el valor en una cara y el árbol de samán de Guacarí en la otra, reconociendo los esfuerzos de conservación ambiental.",
    cu: "Difunde un mensaje ambiental en un objeto cotidiano, aunque la protección del patrimonio natural requiere acciones más allá de su representación.",
  },
  {
    id: "moneda_5000_catedral_antioquia_2015",
    t: "coin",
    n: "Moneda conmemorativa de 5.000 Pesos (Catedral de Antioquia)",
    c: "#d9d2c0",
    a: ["5.000", "ANTIOQUIA"],
    r: ["⛪", "2015"],
    date: "2015 (año indicado en la pieza)",
    by: "Autoridad emisora y entidad acuñadora no especificadas en el archivo de imágenes",
    h: "Muestra la Catedral de Antioquia y la denominación de cinco mil pesos en una cara, y un retrato religioso en la otra, vinculando patrimonio arquitectónico y tradición religiosa.",
    cu: "El documento no aporta datos suficientes para confirmar si tuvo circulación general cotidiana o un carácter conmemorativo/numismático.",
  },
  {
    id: "moneda_10_pesos_san_andres_cordoba_1985",
    t: "coin",
    n: "Moneda de 10 Pesos (San Andrés y Córdoba)",
    c: "#c9b37e",
    a: ["10", "SAN ANDRÉS"],
    r: ["🏇", "1985"],
    date: "1985 (año visible en la pieza)",
    by: "República de Colombia; acuñación oficial",
    h: "Incluye referencias a San Andrés y Providencia en una cara y una figura ecuestre asociada con Córdoba en la otra, con el año 1985 visible.",
    cu: "Destaca regiones y referentes territoriales más allá de los próceres más conocidos, aunque el archivo no detalla toda la conmemoración.",
  },
  {
    id: "moneda_20000_carriel_antioqueno_2024",
    t: "coin",
    n: "Moneda conmemorativa de 20.000 Pesos (Guarniel-Carriel Antioqueño)",
    c: "#d9d2c0",
    a: ["20.000", "CARRIEL"],
    r: ["⛰", "2024"],
    date: "2024",
    by: "Banco de la República; diseño del Departamento de Comunicación y Educación Económica y fabricación de Royal Dutch Mint",
    h: "Pieza heptagonal conmemorativa que muestra el carriel antioqueño en una cara y un arriero mirando las montañas en la otra, evocando trabajo, viajes y cultura de Antioquia.",
    cu: "Tiene valor nominal de curso legal y celebra una tradición artesanal regional, aunque su significado histórico es más amplio que el objeto.",
  },
  {
    id: "moneda_50_pesos_1999",
    t: "coin",
    n: "Moneda de 50 Pesos",
    c: "#d9d2c0",
    a: ["50", "PESOS"],
    r: ["📜", "1999"],
    date: "1999 (año visible en la pieza)",
    by: "República de Colombia; acuñación oficial",
    h: "Muestra la denominación y el escudo nacional en una cara, y en la otra una edificación con leyenda conmemorativa vinculada a la Constitución, con el año 1999 visible.",
    cu: "Conecta la moneda cotidiana con la memoria constitucional, aunque la imagen no detalla todo el contexto de la conmemoración.",
  },
  {
    id: "moneda_10000_pola_2012",
    t: "coin",
    n: "Moneda conmemorativa de 10.000 Pesos (Policarpa Salavarrieta)",
    c: "#d9d2c0",
    a: ["10.000", "LA POLA"],
    r: ["🏛", "2012"],
    date: "2012 (año visible en la pieza)",
    by: "Banco de la República; emisión conmemorativa oficial",
    h: "Presenta el retrato de Policarpa Salavarrieta en una cara y una construcción histórica en la otra, con denominación de diez mil pesos vinculada a la memoria de la Independencia.",
    cu: "Reconoce la participación de las mujeres en la Independencia, sin reemplazar el estudio de las múltiples experiencias de ese proceso.",
  },
  {
    id: "moneda_bicentenario_independencia_2019",
    t: "coin",
    n: "Moneda conmemorativa del Bicentenario de la Independencia",
    c: "#d9d2c0",
    a: ["10.000", "INIRIDA"],
    r: ["🪶", "2019"],
    date: "2019",
    by: "Banco de la República; emisión conmemorativa oficial",
    h: "Muestra una flor de Inírida en una cara y el perfil de una mujer indígena en la otra, junto con la referencia 1819-2019, conmemorando el bicentenario de la Independencia.",
    cu: "Integra biodiversidad y comunidades originarias en la conmemoración, como una selección simbólica dentro de múltiples perspectivas históricas.",
  },
  {
    id: "moneda_20000_centenario_banco_2023",
    t: "coin",
    n: "Moneda conmemorativa de 20.000 Pesos (100 años del Banco de la República)",
    c: "#ffd166",
    a: ["20.000", "1923-2023"],
    r: ["🗽", "CENTENARIO"],
    date: "2023",
    by: "Banco de la República; emisión conmemorativa oficial",
    h: "Moneda de veinte mil pesos relacionada con el centenario del Banco de la República (1923-2023), incorporando elementos gráficos asociados a la institución y su trayectoria.",
    cu: "Convierte el centenario institucional en pieza de memoria y colección, aunque no resume por sí sola un siglo de cambios económicos y sociales.",
  },
  {
    id: "moneda_20000_500_anos_santa_marta_2025",
    t: "coin",
    n: "Moneda conmemorativa de 20.000 Pesos (500 años de Santa Marta)",
    c: "#c9b37e",
    a: ["20.000", "SANTA MARTA"],
    r: ["🏺", "2025"],
    date: "2025",
    by: "Banco de la República; diseño del Departamento de Comunicación y Educación Económica y fabricación de Royal Dutch Mint",
    h: "Presenta la Casa de la Aduana de Santa Marta y el islote El Morro en una cara, y un pectoral de la Sierra Nevada en la otra, conmemorando los 500 años de fundación (1525-2025).",
    cu: "Es una emisión conmemorativa de curso legal que une arquitectura y orfebrería regional, sin abarcar toda la diversidad de historias y comunidades.",
  },
  {
    id: "moneda_200_pesos_2005",
    t: "coin",
    n: "Moneda de 200 Pesos",
    c: "#d9d2c0",
    a: ["200", "PESOS"],
    r: ["✳", "2005"],
    date: "2005 (año visible en la pieza)",
    by: "República de Colombia; acuñación oficial",
    h: "Muestra la denominación en una cara y un diseño geométrico de líneas y formas en la otra, con el año 2005 visible, como parte de las monedas de uso cotidiano.",
    cu: "Prioriza formas abstractas y facilita distinguir la denominación, aportando menos información histórica directa que las monedas conmemorativas.",
  },
];

/* ===== MÁQUINA DE JUEGOS ===== */
// Para agregar un juego nuevo: crea la función y añádela aquí
const GAMES = [
  { n: "Cazamonedas", d: "Atrapa 5 piezas en 8 segundos", run: jAtrapa },
  {
    n: "Reflejos",
    d: "Detén el marcador en la zona dorada (3 rondas)",
    run: jReflejos,
  },
  {
    n: "Memoria",
    d: "Encuentra las 3 parejas con máximo 5 fallos",
    run: jMemoria,
  },
];

function insert(it, el) {
  cur = it;
  el.classList.add("gone");
  const g = GAMES[Math.floor(Math.random() * GAMES.length)]; // juego al azar
  const sc = $("#screen");
  sc.innerHTML = `<div class="msg"><div style="width:${it.t === "coin" ? 70 : 105}px;margin:0 auto 8px;animation:pop .4s">${face(it, "a")}</div>¡Insertaste: <b>${it.n}</b>!<br>🎮 <b>${g.n}</b> · ${g.d}<br><button class="btn" id="go">¡JUGAR!</button></div>`;
  $("#go").onclick = () => play(it, el, g);
}

function play(it, el, g) {
  clearInterval(timer);
  const sc = $("#screen");
  sc.innerHTML = "";
  $("#s").textContent = 0;
  $("#t").textContent = "--";
  $("#bar").style.width = "100%";
  $("#bar").className = "";
  g.run(sc, it, (win) => finish(win, it, el));
}

// Siempre abre la información al terminar
function finish(win, it, el) {
  clearInterval(timer);
  if (!cur) return;
  cur = null;
  $("#screen").innerHTML =
    `<div class="msg" style="font-size:22px">${win ? "🎉 ¡Excelente!" : "😅 ¡Buen intento!"}<br>Abriendo la pieza…</div>`;
  if (win) burst();
  setTimeout(() => reveal(it, el), 900);
}

/* ---- Juego 1: Cazamonedas (tu juego actual) ---- */
function jAtrapa(sc, it, done) {
  let score = 0,
    t = 80,
    over = false;
  const T0 = 80;
  $("#t").textContent = "8.0";
  const spawn = () => {
    if (over) return;
    const b = document.createElement("div");
    b.className = "target piece";
    b.style.width = (it.t === "coin" ? 54 : 86) + "px";
    b.innerHTML = face(it, "a");
    b.style.left = Math.random() * (sc.clientWidth - 90) + "px";
    b.style.top = Math.random() * (sc.clientHeight - 60) + "px";
    b.onpointerdown = () => {
      if (over || b.classList.contains("hit")) return;
      b.classList.add("hit");
      setTimeout(() => b.remove(), 300);
      $("#s").textContent = ++score;
      if (score >= 5) end(true);
      else spawn();
    };
    sc.appendChild(b);
    setTimeout(() => {
      if (!over && b.isConnected && !b.classList.contains("hit")) {
        b.remove();
        spawn();
      }
    }, 1100);
  };
  spawn();
  spawn();
  timer = setInterval(() => {
    t--;
    $("#t").textContent = (t / 10).toFixed(1);
    $("#bar").style.width = (t / T0) * 100 + "%";
    if (t < 25) $("#bar").className = "low";
    if (t <= 0) end(false);
  }, 100);
  function end(win) {
    if (over) return;
    over = true;
    clearInterval(timer);
    if (win) {
      const tt = (T0 - t) / 10;
      if (best === null || tt < best) {
        best = tt;
        $("#rec").textContent = tt.toFixed(1) + "s";
      }
    }
    done(win);
  }
}

/* ---- Juego 2: Reflejos (3 rondas, gana con 2 aciertos) ---- */
function jReflejos(sc, it, done) {
  const speed = [1.6, 2.3, 3.2];
  let round = 0,
    hits = 0,
    x = 0,
    dir = 1,
    zl = 0,
    zw = 0,
    over = false;
  sc.innerHTML = `<div style="width:84%;text-align:center">
    <div class="msg" id="rmsg"></div>
    <div class="rbar"><div class="rzone" id="rz"></div><i class="rmk" id="rmk"></i></div>
    <button class="btn" id="rstop">¡YA!</button></div>`;
  const zone = $("#rz"),
    mk = $("#rmk"),
    msg = $("#rmsg");
  const newRound = () => {
    zw = 22 - round * 4; // la zona se hace más pequeña
    zl = 8 + Math.random() * (84 - zw);
    zone.style.left = zl + "%";
    zone.style.width = zw + "%";
    msg.innerHTML = `Ronda ${round + 1}/3 · Aciertos: ${hits}`;
  };
  newRound();
  timer = setInterval(() => {
    x += dir * speed[round];
    if (x >= 100) {
      x = 100;
      dir = -1;
    }
    if (x <= 0) {
      x = 0;
      dir = 1;
    }
    mk.style.left = x + "%";
  }, 16);
  $("#rstop").onclick = () => {
    if (over) return;
    if (x >= zl && x <= zl + zw) hits++;
    round++;
    if (round >= 3) {
      over = true;
      clearInterval(timer);
      done(hits >= 2);
    } else newRound();
  };
}

/* ---- Juego 3: Memoria (tu pieza + 2 piezas al azar) ---- */
function jMemoria(sc, it, done) {
  const others = ITEMS.filter((o) => o.id !== it.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const deck = [it, ...others]
    .flatMap((o) => [o, o])
    .sort(() => Math.random() - 0.5);
  let first = null,
    lock = false,
    found = 0,
    fails = 0,
    over = false;
  sc.innerHTML = `<div style="width:92%"><div class="msg" id="mmsg"></div><div class="mgrid" id="mg"></div></div>`;
  const msg = $("#mmsg"),
    mg = $("#mg");
  const upd = () =>
    (msg.innerHTML = `Encuentra las 3 parejas · Fallos: ${fails}/5`);
  upd();
  deck.forEach((o) => {
    const c = document.createElement("div");
    c.className = "mcard";
    c.dataset.id = o.id;
    c.innerHTML = `<div class="mi"><div class="mf mb">?</div><div class="mf mfr">${face(o, "a")}</div></div>`;
    c.onclick = () => {
      if (lock || over || c.classList.contains("up")) return;
      c.classList.add("up");
      if (!first) {
        first = c;
        return;
      }
      if (first.dataset.id === c.dataset.id) {
        first = null;
        if (++found === 3) {
          over = true;
          setTimeout(() => done(true), 500);
        }
      } else {
        lock = true;
        fails++;
        upd();
        const a = first;
        first = null;
        setTimeout(() => {
          a.classList.remove("up");
          c.classList.remove("up");
          lock = false;
          if (fails >= 5) {
            over = true;
            done(false);
          }
        }, 800);
      }
    };
    mg.appendChild(c);
  });
}

const $ = (s) => document.querySelector(s);
const faceArt = (it, side) => {
  const [big, sm] = it[side === "a" ? "a" : "r"];
  if (it.t === "coin")
    return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3b2a4a"/><circle cx="50" cy="50" r="45" fill="${it.c}"/><circle cx="50" cy="50" r="37" fill="none" stroke="#3b2a4a" stroke-width="2" stroke-dasharray="3 3"/><ellipse cx="34" cy="28" rx="14" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 34 28)"/><text x="50" y="${big.length > 2 ? 52 : 56}" text-anchor="middle" font-size="${big.length > 2 ? 24 : 30}" font-weight="800" fill="#3b2a4a">${big}</text><text x="50" y="74" text-anchor="middle" font-size="9" font-weight="800" fill="#3b2a4a">${sm}</text></svg>`;
  return `<svg viewBox="0 0 160 100"><rect x="2" y="2" width="156" height="96" rx="12" fill="#3b2a4a"/><rect x="7" y="7" width="146" height="86" rx="9" fill="${it.c}"/><rect x="13" y="13" width="134" height="74" rx="6" fill="none" stroke="#3b2a4a" stroke-width="2" stroke-dasharray="4 3"/><circle cx="46" cy="50" r="22" fill="#fff" opacity=".6" stroke="#3b2a4a" stroke-width="2"/><text x="46" y="58" text-anchor="middle" font-size="22">${side === "a" ? "🧑" : "✨"}</text><text x="108" y="48" text-anchor="middle" font-size="${big.length > 4 ? 17 : 20}" font-weight="800" fill="#3b2a4a">${big}</text><text x="108" y="66" text-anchor="middle" font-size="9" font-weight="800" fill="#3b2a4a">${sm}</text></svg>`;
};
const face = (it, side) => {
  const u0 = (IMAGENES[it.id] || {})[side];
  if (!u0) return faceArt(it, side);
  const u = /^(https?:|data:|\/)/.test(u0) ? u0 : CARPETA + u0;
  if (it.t === "coin") {
    return `<svg viewBox="0 0 100 100"><image href="${u}" x="2" y="2" width="96" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`;
  }
  return `<svg viewBox="0 0 160 100"><image href="${u}" x="2" y="2" width="156" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`;
};
const done = new Set();
let cur = null,
  timer = null;
const grid = $("#grid");
ITEMS.forEach((it) => {
  const d = document.createElement("div");
  d.className = "item " + it.t;
  d.dataset.id = it.id;
  d.innerHTML = face(it, "a") + '<span class="star">⭐</span>';
  grid.appendChild(d);
  d.addEventListener("pointerdown", (e) => {
    if (cur) return;
    e.preventDefault();
    const sx = e.clientX,
      sy = e.clientY;
    let g = null;
    const slot = $("#slot");
    const mv = (ev) => {
      if (!g && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        g = document.createElement("div");
        g.className = "ghost";
        g.innerHTML = face(it, "a");
        document.body.appendChild(g);
        d.classList.add("gone");
      }
      if (g) {
        g.style.left = ev.clientX - 50 + "px";
        g.style.top = ev.clientY - 40 + "px";
        const r = slot.getBoundingClientRect();
        slot.classList.toggle(
          "hot",
          ev.clientX > r.left - 30 &&
            ev.clientX < r.right + 30 &&
            ev.clientY > r.top - 60 &&
            ev.clientY < r.bottom + 30,
        );
      }
    };
    const up = (ev) => {
      removeEventListener("pointermove", mv);
      removeEventListener("pointerup", up);
      const hot = slot.classList.contains("hot");
      slot.classList.remove("hot");
      if (g) {
        g.remove();
        d.classList.remove("gone");
      }
      if (!g || hot) insert(it, d);
    };
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
  });
});
let best = null;
const trk = $("#grid");
let hov = false;
$("#pv").onclick = () => trk.scrollBy({ left: -200 });
$("#nx").onclick = () => trk.scrollBy({ left: 200 });
trk.onmouseenter = () => (hov = true);
trk.onmouseleave = () => (hov = false);
setInterval(() => {
  if (hov || cur) return;
  if (trk.scrollLeft + trk.clientWidth >= trk.scrollWidth - 4)
    trk.scrollTo({ left: 0 });
  else trk.scrollBy({ left: 200 });
}, 2600);

function burst() {
  for (let i = 0; i < 26; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = ["🪙", "⭐", "✨", "🎉"][i % 4];
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}
function reveal(it, el) {
  done.add(it.id);
  el.classList.add("done");
  el.classList.remove("gone");
  $("#cnt").textContent = done.size;
  $("#panel").innerHTML =
    `<h2 style="margin:0 0 10px;text-align:center">${it.n}</h2>
<div class="flip" id="fl"><div class="in"><div class="f">${face(it, "a")}</div><div class="f r">${face(it, "r")}</div></div></div>
<div class="hint">👆 Toca la pieza para ver anverso y reverso</div>
<div class="facts"><div class="fact"><b>Fecha</b><span>${it.date}</span></div><div class="fact"><b>Autor</b><span>${it.by}</span></div><div class="fact"><b>Historia</b><span>${it.h}</span></div><div class="fact"><b>Curiosidad</b><span>${it.cu}</span></div></div>
<div style="text-align:center"><button class="btn" id="cl">¡Seguir jugando!</button></div>`;
  $("#fl").onclick = (e) => e.currentTarget.classList.toggle("back");
  $("#cl").onclick = close;
  $("#modal").classList.add("on");
  if (done.size === ITEMS.length) setTimeout(burst, 800);
}
function close() {
  $("#modal").classList.remove("on");
  $("#screen").innerHTML =
    done.size === ITEMS.length
      ? '<div class="msg">🏆 ¡Completaste la colección!' + (window.parent !== window ? '<br><button class="btn" id="ruta">Finalizar y continuar →</button>' : '') + '</div>'
      : '<div class="msg">Elige otra pieza para jugar 👇</div>';
  /* CONEXIÓN CON LA RUTA: avisa al mapa que este museo terminó */
  const rutaBtn = $("#ruta");
  if (rutaBtn) rutaBtn.onclick = () => { try { window.parent.postMessage({ tipo: "museo-completo", museo: "moneda", stats: [["Piezas completadas", done.size + " / " + ITEMS.length]] }, "*"); } catch (e) {} };
  $("#t").textContent = "--";
  $("#s").textContent = 0;
}
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") close();
});
(() => {
  const bg = $("#bg"),
    n = innerWidth < 600 ? 16 : 30,
    ps = [];
  for (let i = 0; i < n; i++) {
    const it = ITEMS[i % ITEMS.length],
      z = Math.random(),
      w = it.t === "coin" ? 50 + z * 90 : 90 + z * 150;
    const p = document.createElement("div");
    p.className = "p";
    p.style.cssText = `width:${w}px;left:${Math.random() * 100 - 5}%;top:${Math.random() * 100 - 5}%;opacity:${0.25 + z * 0.4};z-index:${Math.round(z * 10)};filter:${z < 0.4 ? "url(#wob) blur(2.5px)" : z < 0.7 ? "blur(1px)" : "none"};transform:rotateX(${Math.random() * 24 - 12}deg) rotateY(${Math.random() * 24 - 12}deg) rotateZ(${Math.random() * 20 - 10}deg) skewX(${Math.random() * 6 - 3}deg)`;
    p.innerHTML = face(it, Math.random() < 0.5 ? "a" : "r");
    p.firstChild.style.animation = `drift ${5 + Math.random() * 6}s ease-in-out ${-Math.random() * 8}s infinite`;
    bg.appendChild(p);
    ps.push([p, z]);
  }
  let mx = 0,
    my = 0;
  const upd = () =>
    ps.forEach(
      ([p, z]) =>
        (p.style.translate = `${mx * z * 50}px ${my * z * 50 - scrollY * z * 0.35}px`),
    );
  addEventListener("pointermove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
    upd();
  });
  addEventListener("scroll", upd, { passive: true });
  upd();
})();

//MUSICA

/* ===== MÚSICA DE FONDO (sin controles) ===== */
const MUSICA_CARPETA = "assets/musica/";
const CANCIONES = ["cancion1.mp3", "cancion2.mp3", "cancion3.mp3"]; // tus nombres exactos
const MEZCLAR = false; // true = orden aleatorio
const VOLUMEN = 0.7; // de 0 a 1

const audio = new Audio();
audio.volume = VOLUMEN;
audio.preload = "auto";
let idx = MEZCLAR ? Math.floor(Math.random() * CANCIONES.length) : 0;
let fallos = 0;

function cargar(i) {
  idx =
    MEZCLAR && CANCIONES.length > 1
      ? Math.floor(Math.random() * CANCIONES.length)
      : (i + CANCIONES.length) % CANCIONES.length;
  audio.src = MUSICA_CARPETA + encodeURI(CANCIONES[idx]);
}
function sonar() {
  audio
    .play()
    .then(() => (fallos = 0))
    .catch(() => {});
}
function siguiente() {
  cargar(idx + 1);
  sonar();
}

cargar(idx);
audio.addEventListener("ended", siguiente); // al terminar pasa a la siguiente; tras la última vuelve a la primera
audio.addEventListener("error", () => {
  // si un archivo falla, salta al siguiente
  if (++fallos < CANCIONES.length) siguiente();
});

// Intenta arrancar de una vez. Si el navegador lo bloquea, arranca en la primera interacción
sonar();
["pointerdown", "keydown", "touchstart"].forEach((ev) =>
  addEventListener(
    ev,
    () => {
      if (audio.paused) sonar();
    },
    { once: true },
  ),
);

// Buena práctica: silencio al salir de la pestaña, y continúa al volver
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.pause();
  else sonar();
});
