
window.MUSEO = window.MUSEO || {};

window.MUSEO.salas = [
    { id: "quimbaya", nombre: "Quimbaya", region: "Cauca Medio", intro: "Los orfebres quimbayas del período Temprano (500 a. C. – 700 d. C.) son famosos por sus piezas de tumbaga fundidas a la cera perdida, de formas redondeadas y superficies muy pulidas." },
    { id: "muisca", nombre: "Muisca", region: "Cordillera Oriental", intro: "Los muiscas (600 – 1600 d. C.) habitaron el altiplano cundiboyacense. Muchas de sus piezas de oro no eran joyas, sino ofrendas —llamadas tunjos— que se depositaban en lagunas, cuevas y templos para pedir favores a los dioses." },
    { id: "calima", nombre: "Calima", region: "Valle del Cauca", intro: "Con el nombre Calima se agrupan varias sociedades que vivieron en el Valle del Cauca. Las piezas de esta sección pertenecen a dos de sus períodos, Yotoco y Malagana, conocidos por sus grandes adornos de oro martillado que cubrían el rostro y el pecho." },
    { id: "tolima", nombre: "Tolima", region: "Magdalena Medio", intro: "La orfebrería Tolima (1 a. C. – 700 d. C.) se reconoce por sus figuras planas y estilizadas, con brazos y piernas abiertos, en las que se mezclan rasgos humanos y animales." },
    { id: "zenu", nombre: "Zenú", region: "Llanuras del Caribe", intro: "Los zenúes vivieron en las tierras inundables del Caribe, donde construyeron un enorme sistema de canales para controlar las crecientes de los ríos y cultivar." },
    { id: "tairona", nombre: "Tairona", region: "Sierra Nevada de Santa Marta", intro: "Los taironas (900 – 1600 d. C.) construyeron ciudades de piedra en la Sierra Nevada, como Ciudad Perdida. Sus descendientes aún habitan la Sierra." }
];
window.MUSEO.piezas = [
    { 
        id: "poporo", 
        sala: "quimbaya", 
        titulo: "Poporo Quimbaya", 
        periodo: "Período Temprano · 500 a. C. – 700 d. C.", 
        tecnica: "Cera perdida con núcleo", 
        img: "01.jpg", 
        audio: "Poporo_Ritual.mp3", 
        desc: "Este emblemático recipiente ritual, diseñado con la delicada forma de un fruto, es una obra fundamental del período Temprano de la cultura Quimbaya en el Cauca Medio. Fue hallado en Angostura, Antioquia, y tiene un valor histórico enorme: con esta pieza el Banco de la República inició su colección de orfebrería prehispánica en 1939. Fue elaborado mediante fundición a la cera perdida con núcleo, en una tumbaga con un alto contenido de oro.\n\nLejos de ser un simple adorno, servía para guardar la cal que se usaba en el mambeo, el ritual de mascar hojas de coca. La cal, obtenida de conchas marinas quemadas, se sacaba con un palillo y se mezclaba con la hoja en la boca. La pieza refleja la profunda conexión simbólica de estas sociedades con la naturaleza." 
    },
       { 
        id: "colgante-crisalida", 
        sala: "quimbaya", 
        titulo: "Colgante en Forma de Crisálida de Insecto", 
        periodo: "Período Temprano · 500 a. C. – 700 d. C.", 
        tecnica: "Cera perdida con núcleo", 
        img: "02.jpg", 
        audio: null, 
        desc: "Este sutil colgante representa con gran detalle a un insecto inmaduro en plena metamorfosis, como una ninfa o una crisálida. Esta figura está asociada a las ideas de cambio y renacimiento dentro de la cosmología indígena. La obra muestra cómo las sociedades prehispánicas plasmaban los ciclos de la vida natural en adornos corporales cargados de significado. Quien lo llevaba quizá buscaba asociarse con esa capacidad de transformarse." 
    },
{ 
        id: "colgante-caracol", 
        sala: "quimbaya", 
        titulo: "Colgante en Forma de Caracol", 
        periodo: "Período Temprano · 500 a. C. – 700 d. C.", 
        tecnica: "Cera perdida", 
        img: "03.jpg", 
        audio: null, 
        desc: "La espiral del caracol marino sirvió de inspiración para este colgante quimbaya, una forma geométrica recurrente en la naturaleza que simboliza el infinito, los ciclos del tiempo y el agua. La maestría técnica en el manejo de los volúmenes metálicos permite capturar la tridimensionalidad del caparazón con elegancia y proporción." 
    },
{ 
        id: "colgante-antropomorfo", 
        sala: "quimbaya", 
        titulo: "Colgante Antropomorfo", 
        periodo: "Período Temprano · 500 a. C. – 700 d. C.", 
        tecnica: "Fundición y laminado", 
        img: "04.jpg", 
        audio: null, 
        desc: "Esta pieza representa una figura humana estilizada de cuyos brazos y torso cuelgan láminas delgadas que tintineaban con el movimiento. El sonido metálico jugaba un papel sensorial clave en las ceremonias chamánicas, ayudando a inducir estados alterados de conciencia y atrayendo la atención de los espíritus." 
    },   
{ 
        id: "balsa-muisca", 
        sala: "muisca", 
        titulo: "Balsa Muisca", 
        periodo: "600 – 1600 d. C.", 
        tecnica: "Cera perdida", 
        img: "05.jpg", 
        audio: "Canto_Laguna.mp3", 
        desc: "La famosa Balsa Muisca es la representación en oro más clara del ritual de investidura del cacique en la laguna de Guatavita, acontecimiento histórico que dio origen al mito europeo de El Dorado. En la balsa se observa al jerarca cubierto de polvo de oro, rodeado de sus sacerdotes y nobles.\n\nEste tunjo u ofrenda metálica sintetiza la cosmovisión muisca sobre el poder político legitimado a través del agua y la ofrenda sagrada a las deidades." 
    },
    { id: "pectoral", sala: "calima", titulo: "Pectoral Acorazonado", periodo: "Período Yotoco", tecnica: "Martillado y repujado", img: "06.jpg", audio: null, desc: "Gran adorno de pecho que reflejaba la luz del sol, otorgando a su portador un aspecto divino e imponente en las ceremonias." }
];
