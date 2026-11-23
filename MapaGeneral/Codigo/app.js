/* ===== RUTA DE LOS MUSEOS: dos formas de recorrerlos =====
   · Pantalla de inicio: el visitante elige entre
       "Seguir la historia" (lineal): mapa del tesoro con candados; cada museo abre el siguiente y NO se puede volver al mapa hasta terminar la ruta.
       "Recorrido libre": cualquier museo, en cualquier orden; se puede volver cuando se quiera, pero la medalla solo se gana al TERMINAR el museo.
   · PRUEBA = true muestra abajo el panel de pruebas (en la ruta lineal permite entrar a cualquier museo ignorando los candados y volver al mapa).
     Pon false al terminar las pruebas: se oculta el panel y los enlaces directos (#museo) también respetan los candados.
   · El orden de la ruta lineal es el orden del arreglo M. Cada museo trae: id, n (nombre completo), s (nombre corto), x/y (posición en el mapa de 600×1100),
     a (dirección), c (color), t (frase del recuadro) y, opcional, logo: 'ruta/al/logo.png' para usar su propio logo en la medalla (si no, se dibuja un emblema).
   · Guardado en localStorage: 'museos.avance' (ruta lineal, 0…8), 'museos.logros' (medallas del recorrido libre) y 'museos.modo'.
   · Un museo avisa que ya terminó con:  parent.postMessage({tipo:'museo-completo',museo:'<id>'},'*')
       en la ruta lineal pasa solo al siguiente; en el recorrido libre otorga su medalla y vuelve a la galería. */
const PRUEBA=true;

const M=[
{id:'nacional',n:'Museo Nacional de Colombia',s:'Museo Nacional',x:130,y:100,a:'Cra. 7 #28-66',c:'#7fb3d5',t:'Capítulo 1 · Colombia: su territorio, su historia y su cultura.'},
{id:'oro',n:'Museo del Oro',s:'Museo del Oro',x:455,y:215,a:'Cra. 6 #15-88',c:'#e8b64c',t:'Capítulo 2 · La colonización española y el saqueo del oro.'},
{id:'florero',n:'Museo de la Independencia – Casa del Florero',s:'Museo de la Independencia',x:140,y:330,a:'Calle 11 #6-94',c:'#c9573f',t:'Capítulo 3 · La independencia de Colombia.'},
{id:'moneda',n:'Museo Casa de Moneda',s:'Casa de Moneda',x:440,y:445,a:'Calle 11 #4-93',c:'#e9ff6d',t:'Capítulo 4 · El Estado y la nación nacen con moneda propia.'},
{id:'botero',n:'Museo Botero',s:'Museo Botero',x:138,y:560,a:'Calle 11 #4-41',c:'#d9693f',t:'Capítulo 5 · Un arte propio que muestra la realidad del país.'},
{id:'mambo',n:'Museo de Arte Moderno de Bogotá',s:'MAMBO',x:455,y:675,a:'Calle 24 #6-00',c:'#e0838f',t:'Capítulo 6 · Nuevas formas de hacer arte y de mirarlo.'},
{id:'antimuseo',n:'Antimuseo',s:'Antimuseo',x:140,y:790,a:'Ubicación por definir',c:'#b36bff',t:'Capítulo 7 · La revolución contra el museo tradicional.'},
{id:'minecraft',n:'Museo sin censura',s:'Museo sin censura',x:450,y:905,a:'Museo en Minecraft',c:'#8fbf7a',t:'Capítulo 8 · La historia digitalizada y convertida en juego.'},
];

const L={nacional:'../../MuseoNacional/juego/index.html',
        oro:'../../MuseoDelOro/museo_oro_30_piezas/index.html',
        mambo:'../../MuseoDeArteModerno/museo V2/index.html',
        florero:'../../MuseoDeLaIndependencia/index.html',
        moneda:'../../MuseoCasaDeMoneda/index.html',
        botero:'../../MuseoDeBotero/index.html',
        antimuseo:'../../Antimuseo/index.html',
        minecraft:'../../MuseoMinecraft/index.html'};

/* ---------- estado ---------- */
const N=M.length,CH={x:300,y:985},P=[...M.map(m=>[m.x,m.y]),[336,1001]];
let avance=0;try{avance=Math.min(N,Math.max(0,parseInt(localStorage.getItem('museos.avance'),10)||0))}catch(e){}
const guardar=()=>{try{localStorage.setItem('museos.avance',avance)}catch(e){}};
const nuevos=new Set();let cofre=false,cumplido=false,aviso='',act=-1,svg,dyn,modo=null,desdePanel=false,nueva='';
const logros=new Set();try{JSON.parse(localStorage.getItem('museos.logros')||'[]').forEach(id=>M.some(m=>m.id===id)&&logros.add(id))}catch(e){}
const guardarLogros=()=>{try{localStorage.setItem('museos.logros',JSON.stringify([...logros]))}catch(e){}};
const guardarModo=()=>{try{localStorage.setItem('museos.modo',modo)}catch(e){}};
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const st=t=>{const e=document.getElementById('st');if(e)e.textContent=t};
const idx=h=>M.findIndex(m=>m.id===h.slice(1));
const prox=i=>{let j=i+1;while(j<N&&!L[M[j].id])j++;return j};   // siguiente museo que ya tiene enlace
const estado=i=>i<avance?'hecho':i===avance?'actual':'bloq';

/* ---------- geometría de la ruta ---------- */
const bz=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d};
/* sendero sinuoso: pasa por puntos intermedios (VIA) y se suaviza con curvas Catmull-Rom, en vez de ir de lado a lado */
const VIA=[
 [[215,66],[300,172],[385,150]],
 [[385,238],[300,292],[222,258],[196,298]],
 [[212,366],[298,346],[348,424]],
 [[372,486],[290,478],[214,522]],
 [[214,586],[306,600],[340,664],[396,640]],
 [[402,706],[332,702],[298,762],[228,742]],
 [[210,816],[285,846],[330,914],[400,926]],
 [[398,936],[350,948]]
];
const tramo=i=>{const pts=[P[i],...(VIA[i]||[]),P[i+1]],s=[];
 for(let k=0;k<pts.length-1;k++){const p0=pts[Math.max(0,k-1)],p1=pts[k],p2=pts[k+1],p3=pts[Math.min(pts.length-1,k+2)];
  s.push([p1,[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6],p2])}
 return s};
const dTramo=i=>{const s=tramo(i);return `M${s[0][0]}`+s.map(([,c1,c2,b])=>`C${c1} ${c2} ${b}`).join('')};
const RIO=[[566,52,470,90,300,140,300,270],[300,270,300,380,330,400,300,520],[300,520,270,630,330,640,300,770],[300,770,270,880,470,930,556,1046]];
const rnd=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

/* ---------- visor: abre el museo dentro de la página ---------- */
const ov=document.createElement('div');ov.id='mv';
ov.innerHTML='<button id="mvx" type="button">← Volver</button><button id="mvs" type="button"></button><iframe title="Museo" allow="autoplay; fullscreen"></iframe>';
document.body.appendChild(ov);
const fr=ov.querySelector('iframe'),sig=ov.querySelector('#mvs'),atras=ov.querySelector('#mvx');
/* en la ruta lineal no se vuelve al mapa hasta terminarla (o si se entró desde el panel de pruebas) */
const puedeVolver=()=>modo==='libre'||desdePanel||avance>=N;
function botones(i){
 if(modo==='libre'){
  atras.textContent='← Volver a los museos';atras.hidden=false;
  sig.hidden=logros.has(M[i].id);sig.textContent='Terminé este museo ✓';
 }else{
  atras.textContent='← Volver al mapa';atras.hidden=!puedeVolver();
  const j=prox(i);sig.hidden=false;sig.textContent=j<N?'Siguiente: '+M[j].s+' →':'Terminar recorrido ✓';
 }
}
function abrir(i,panel){
 act=i;cumplido=false;desdePanel=!!panel;const m=M[i];
 ov.className='';void ov.offsetWidth;ov.className='on';   // reinicia la animación de entrada
 fr.src=L[m.id];document.body.style.overflow='hidden';botones(i);
 if(location.hash!=='#'+m.id)history.pushState(null,'','#'+m.id);
}
function refrescar(){if(modo==='lineal')render();else if(modo==='libre')galeria()}
function cerrar(){
 /* al llegar desde la página de Minecraft (última parada) se completa la ruta y todos los museos quedan abiertos */
 if(modo==='lineal'&&act===N-1&&avance>=N-1&&avance<N){avance=N;cofre=true;guardar();aviso='¡Recorrido completo! Todos los museos están abiertos.'}
 ov.className='';fr.src='about:blank';document.body.style.overflow='';act=-1;desdePanel=false;
 if(location.hash)history.pushState(null,'',location.pathname+location.search);
 refrescar();if(aviso){st(aviso);aviso=''}
 setTimeout(enfocar,60);
}
/* ruta lineal: pasa al museo siguiente sin volver al mapa; si estaba en la parada actual, desbloquea la que sigue */
function siguiente(){
 if(act<0||modo!=='lineal')return;
 const j=prox(act),viejo=avance,saltados=[];
 for(let k=act+1;k<j&&k<N;k++)saltados.push(M[k].s);
 if(act===avance){
  avance=j;for(let k=viejo+1;k<=Math.min(avance,N-1);k++)nuevos.add(k);
  if(j>=N)cofre=true;
  guardar();
 }
 aviso=saltados.length?saltados.join(', ')+': su grupo aún no ha agregado el enlace, la ruta sigue.':'';
 if(j>=N){
  aviso=avance>=N?'¡Llegaste al tesoro! Recorrido completo.':'Fin de la ruta (modo prueba: tu avance no cambió).';
  cerrar();return;
 }
 transicion(act,j,()=>abrir(j,desdePanel));   // animación entre museos (solo ruta lineal)
}
/* recorrido libre: terminar el museo otorga su medalla y devuelve a la galería */
function completar(){
 if(act<0||modo!=='libre')return;const m=M[act];
 if(!logros.has(m.id)){logros.add(m.id);guardarLogros();nueva=m.id;aviso=logros.size>=N?'¡Colección completa! Ganaste las 8 medallas.':'Medalla conseguida: '+m.s+'.'}
 cerrar();
}
const hecho=()=>modo==='libre'?completar():siguiente();
atras.onclick=()=>{if(puedeVolver())cerrar()};
sig.onclick=hecho;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.className&&puedeVolver())cerrar()});
/* ---------- transición entre museos (SOLO en la ruta lineal) ----------
   Cuando un museo avisa 'museo-completo', el mapa tapa el visor con una animación, carga el siguiente museo POR DEBAJO
   y destapa cuando la animación termina y el museo ya cargó. Los museos NO participan: todo ocurre aquí.
   · El animador solo entrega archivos con este nombre (carpeta Transiciones/ en la raíz del repositorio):
        Transiciones/<desde>-<hasta>.webm      p. ej.  Transiciones/nacional-oro.webm     (opcional: .mp4 con el mismo nombre)
   · Si el archivo no existe, se usa la animación por defecto: el mapa del tesoro dibuja el tramo y un barco lo recorre.
   · TRANSICION.activa=false la desactiva (se vuelve al paso directo de antes). En el recorrido libre nunca se usa. */
const TRANSICION={activa:true,dir:'../../Transiciones/',ms:3400,maxMs:12000};
const tr=document.createElement('div');tr.id='mtr';
tr.innerHTML='<video muted playsinline preload="auto"></video>'
 +'<svg viewBox="0 0 600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="tr-r0"/><path class="tr-r"/>'
 +'<circle class="tr-a" r="16"/><circle class="tr-b" r="16"/><text class="tr-na" text-anchor="middle"></text><text class="tr-nb" text-anchor="middle"></text>'
 +'<g class="tr-barco"><path d="M-16 4H16L10 14H-10Z" fill="#5a3418"/><path d="M0 4V-22" stroke="#2a190c" stroke-width="2.5"/><path d="M1-20 15-2H1Z" fill="#fff6d6"/><path d="M-1-16-12-2H-1Z" fill="#f2e8c8"/></g></svg>'
 +'<p class="tr-t"></p><button type="button" class="tr-s">Saltar ▶▶</button>';
document.body.appendChild(tr);
const trV=tr.querySelector('video'),trT=tr.querySelector('.tr-t'),trS=tr.querySelector('.tr-s');
let trEnCurso=null;
function transicion(i,j,cargar){
 if(!TRANSICION.activa||rm||j>=N){cargar();return}
 if(trEnCurso)trEnCurso.cerrar(true);
 const a=M[i],b=M[j],base=TRANSICION.dir+a.id+'-'+b.id;
 let animListo=false,cargado=false,fin=false,raf=0;const tms=[];
 const T=(f,ms)=>{const t=setTimeout(f,ms);tms.push(t);return t};
 const cerrar=forzar=>{
  if(fin)return;fin=true;cancelAnimationFrame(raf);tms.forEach(clearTimeout);trV.pause();trV.removeAttribute('src');trEnCurso=null;
  fr.removeEventListener('load',alCargar);
  if(forzar){tr.className='';return}
  tr.classList.remove('on');tr.classList.add('fuera');setTimeout(()=>{if(!trEnCurso)tr.className=''},480);
 };
 const revisar=()=>{if(animListo&&cargado)cerrar()};
 const alCargar=()=>{cargado=true;revisar()};
 trEnCurso={cerrar};
 trT.textContent='De '+a.s+' a '+b.s;tr.className='on';
 trS.onclick=()=>{animListo=true;if(!cargado)T(()=>{cargado=true;revisar()},1500);revisar()};
 fr.addEventListener('load',alCargar);
 T(()=>{cargar()},380);                           // el siguiente museo se carga debajo de la animación
 T(()=>{cargado=true;animListo=true;revisar()},TRANSICION.maxMs);   // seguro: nunca se queda trabada
 const porDefecto=()=>{                           // animación por defecto: el barco recorre el tramo del mapa del tesoro
  tr.classList.remove('vid');const svgE=tr.querySelector('svg'),p=tr.querySelector('.tr-r'),p0=tr.querySelector('.tr-r0'),barco=tr.querySelector('.tr-barco');
  const d=dTramo(i),A=P[i],B=P[i+1]||P[i];p.setAttribute('d',d);p0.setAttribute('d',d);
  const ca=tr.querySelector('.tr-a'),cb=tr.querySelector('.tr-b');ca.setAttribute('cx',A[0]);ca.setAttribute('cy',A[1]);cb.setAttribute('cx',B[0]);cb.setAttribute('cy',B[1]);
  ca.style.fill=a.c;cb.style.fill=b.c;
  const na=tr.querySelector('.tr-na'),nb=tr.querySelector('.tr-nb');na.textContent=a.s;nb.textContent=b.s;na.setAttribute('x',A[0]);na.setAttribute('y',A[1]+40);nb.setAttribute('x',B[0]);nb.setAttribute('y',B[1]+40);
  const asp=innerHeight/Math.max(1,innerWidth),w=Math.max(400,Math.abs(A[0]-B[0])+330,(Math.abs(A[1]-B[1])+330)/asp),h=w*asp;
  svgE.setAttribute('viewBox',((A[0]+B[0])/2-w/2)+' '+((A[1]+B[1])/2-h/2)+' '+w+' '+h);
  const len=p.getTotalLength?p.getTotalLength():0,t0=performance.now(),dur=TRANSICION.ms,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  if(!len){T(()=>{animListo=true;revisar()},dur);return}
  p.style.strokeDasharray=len+' '+len;
  const paso=ahora=>{
   if(fin)return;const t=Math.min(1,(ahora-t0)/dur),e=ease(t),q=p.getPointAtLength(len*e);
   p.style.strokeDashoffset=len*(1-e);barco.setAttribute('transform','translate('+q.x+' '+q.y+')');
   if(t<1)raf=requestAnimationFrame(paso);else{animListo=true;revisar()}
  };
  raf=requestAnimationFrame(paso);
 };
 trV.onended=()=>{animListo=true;revisar()};
 trV.onerror=()=>{if(trV.dataset.mp4!=='1'&&/\.webm$/.test(trV.getAttribute('src')||'')){trV.dataset.mp4='1';trV.src=base+'.mp4';return}porDefecto()};
 trV.onloadeddata=()=>{tr.classList.add('vid');const pr=trV.play();if(pr&&pr.catch)pr.catch(()=>{tr.classList.remove('vid');porDefecto()})};
 trV.dataset.mp4='';
 if(typeof trV.canPlayType!=='function'||!trV.canPlayType('video/webm')){trV.dataset.mp4='1';porDefecto()}   // sin soporte de video → animación por defecto
 else trV.src=base+'.webm';
}
/* un museo puede traer su propio enlace "Volver al mapa" (mapa.html): lo conectamos con el visor, respetando las reglas del modo */
fr.onload=()=>{try{fr.contentDocument.querySelectorAll('a[href$="mapa.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(puedeVolver())cerrar()}))}catch(e){}};
/* aviso de "museo terminado" enviado por el propio museo:  parent.postMessage({tipo:'museo-completo',museo:'<id>'},'*')
   · ruta lineal → pasa al siguiente museo · recorrido libre → otorga la medalla y vuelve a la galería
   · se ignora si viene de otro museo (id distinto al abierto) o si se repite dentro del mismo museo */
addEventListener('message',e=>{
 if(e.source!==fr.contentWindow||act<0)return;
 const d=e.data;if(!d||(d!=='museo-completo'&&d.tipo!=='museo-completo'))return;
 if(d.museo&&d.museo!==M[act].id)return;
 if(cumplido)return;cumplido=true;hecho();
});
const permitido=k=>k>=0&&L[M[k].id]&&(modo==='libre'||PRUEBA||k<=avance);
addEventListener('popstate',()=>{
 if(ov.className&&!puedeVolver()){history.pushState(null,'','#'+M[act].id);return}   // en la ruta lineal el botón "atrás" del navegador no saca del museo
 const k=idx(location.hash);permitido(k)?abrir(k,desdePanel):cerrar();
});

/* ---------- interacción con el mapa ---------- */
function entrar(i,panel){const m=M[i];if(L[m.id]){st('');abrir(i,panel)}else st(m.s+': su grupo aún no ha agregado el enlace.')}
function tocar(i){
 if(i>avance){
  st('Candado cerrado: primero recorre '+M[avance].s+'.');
  const g=svg.querySelector('.mk[data-i="'+i+'"]');g.classList.remove('sacude');void g.getBoundingClientRect();g.classList.add('sacude');return;
 }
 entrar(i);
}
function enfocar(){
 if(!svg)return;const g=svg.querySelector('.mk.actual')||svg.querySelector('.cofre');
 if(g)g.scrollIntoView({block:'center',behavior:rm?'auto':'smooth'});
}

/* ---------- dibujo ---------- */
/* estilos del terreno detallado: van aquí para que el mapa se vea bien aunque estilos.css sea una versión anterior */
{const st=document.createElement('style');st.textContent=`/* ---------- terreno más detallado ---------- */
.rio-b{fill:none;stroke:#4f7468;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.rio{fill:none;stroke:#86b3b3;stroke-linecap:round;stroke-linejoin:round}
.rio-l{fill:none;stroke:#d6efe9;stroke-linecap:round;opacity:.6;stroke-dasharray:14 22;animation:flujo 5s linear infinite}
@keyframes flujo{to{stroke-dashoffset:-72}}
.mar-b{fill:#4f7468;opacity:.6}.mar{fill:#7fb0b6}
.gh{fill:#6b3a18;stroke:var(--tinta);stroke-width:1.6;stroke-linejoin:round}.gv{fill:#fbf1d6;stroke:var(--tinta);stroke-width:1.2;stroke-linejoin:round}
.mt{fill:#d3bd86;stroke:var(--tinta);stroke-width:2;stroke-linejoin:round}
.mt2{fill:#9c8350;opacity:.75}.mt3{fill:#b59b60;opacity:.55}
.nv{fill:#fbf3dc;stroke:var(--tinta);stroke-width:1.2;stroke-linejoin:round}
.nivel{fill:none;stroke:#8a6a3a;stroke-width:1;opacity:.28;stroke-dasharray:5 4}
.cq{fill:#6a8a3f;stroke:#3a4a20;stroke-width:1.6}.cr{fill:#86a24f;stroke:#46582a;stroke-width:1.6}
.cl2{fill:#b2cb78;opacity:.55}.cs2{fill:#3f5a28;opacity:.35}
.pn{fill:#4f7a3a;stroke:#2f4a22;stroke-width:1.5;stroke-linejoin:round}.pn2{fill:#38592a;opacity:.55}
.pa path{fill:none;stroke:#5d8a3a;stroke-width:3.2;stroke-linecap:round}
.hb{fill:none;stroke:#667d34;stroke-width:1.3;stroke-linecap:round;opacity:.6}
.ca{fill:none;stroke:#5f7a3c;stroke-width:1.3;stroke-linecap:round;opacity:.75}
.pu{fill:#a47a45;stroke:#4a3418;stroke-width:1.6}.pu-s{fill:#2a1a0a;opacity:.3}.pu-t{fill:none;stroke:#6b4a26;stroke-width:1.2}.pu-b{fill:none;stroke:#4a3418;stroke-width:2.6;stroke-linecap:round}
.roca{stroke-width:3}
`;document.head.appendChild(st)}
/* gradientes compartidos por las ilustraciones (mapa y medallas) */
{const g=document.createElement('div');g.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
 +'<linearGradient id="g-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6e6"/><stop offset="1" stop-color="#f7ebc6"/></linearGradient>'
 +'<linearGradient id="g-atar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c4a86"/><stop offset=".55" stop-color="#e08a4a"/><stop offset="1" stop-color="#ffd884"/></linearGradient>'
 +'<linearGradient id="g-lago" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa0a4"/><stop offset="1" stop-color="#1f4c58"/></linearGradient>'
 +'<linearGradient id="g-noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14062c"/><stop offset="1" stop-color="#3c1a68"/></linearGradient>'
 +'<linearGradient id="g-oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".4" stop-color="#e8b93e"/><stop offset="1" stop-color="#8f6212"/></linearGradient>'
 +'<linearGradient id="g-ladrillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cf6d44"/><stop offset="1" stop-color="#8d3d24"/></linearGradient>'
 +'<linearGradient id="g-teja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf5d33"/><stop offset="1" stop-color="#8a3a1d"/></linearGradient>'
 +'<linearGradient id="g-pasto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93b85d"/><stop offset="1" stop-color="#5d8238"/></linearGradient>'
 +'<radialGradient id="g-roca" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#b4b09c"/><stop offset="1" stop-color="#6d6a5a"/></radialGradient>'
 +'</defs></svg>';document.body.appendChild(g.firstChild)}
/* ---------- ilustraciones de cada museo (caja -41..41; se recortan en círculo) ---------- */
const S1='stroke="#4a3418" stroke-width="1.4" stroke-linejoin="round"';
const MONSE='<path d="M-41 6L-28 -12L-14 -2L4 -24L22 -6L41 -14V41H-41Z" fill="#8aa883" opacity=".85"/><path d="M4 -24L12 -16L-2 -14Z" fill="#6f8f6c" opacity=".7"/><path d="M3.5 -24V-31M1 -28.5H6" stroke="#fff" stroke-width="1.4"/>';
const TEJAS=(x1,x2,y)=>{let s='';for(let k=0;k<4;k++)s+=`M${x1+k*2} ${y+k*3}H${x2-k*2}`;return `<path d="${s}" stroke="#6e2d18" stroke-width=".7" opacity=".6" fill="none"/>`};
const ESC={
 nacional:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-cielo)"/>${MONSE}
  <rect x="-35" y="-2" width="70" height="27" fill="url(#g-ladrillo)" ${S1}/><path d="M-35 4H35M-35 10H35M-35 16H35M-35 22H35" stroke="#6e2d18" stroke-width=".6" opacity=".55"/>
  <g fill="#2a1a10">${[-28,-20,20,28].map(x=>`<path d="M${x-2.6} 11V6.5a2.6 2.6 0 0 1 5.2 0V11Z"/><path d="M${x-2.6} 21V16.5a2.6 2.6 0 0 1 5.2 0V21Z"/>`).join('')}</g>
  <rect x="-10" y="-22" width="20" height="46" fill="#e4d4a8" ${S1}/><path d="M-12 -22L0 -33L12 -22Z" fill="url(#g-teja)" ${S1}/>
  <path d="M-4 -10V-15a4 4 0 0 1 8 0V-10Z M-4 2V-3a4 4 0 0 1 8 0V2Z" fill="#2a1a10"/><path d="M0 -33V-41" stroke="#3a2410" stroke-width="1.2"/><rect x="0" y="-41" width="9" height="2.6" fill="#f2c200"/><rect x="0" y="-38.4" width="9" height="1.7" fill="#1d4fa0"/><rect x="0" y="-36.7" width="9" height="1.7" fill="#c8202a"/>
  <rect x="-41" y="25" width="82" height="16" fill="url(#g-pasto)"/><path d="M-6 25L-12 41H12L6 25Z" fill="#eadcb0"/><path d="M-4 25V19a4 4 0 0 1 8 0V25Z" fill="#3a2410"/>`,
 oro:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-atar)"/>
  <g stroke="#ffe58a" stroke-width="1.6" stroke-linecap="round" opacity=".8">${Array.from({length:14},(_,k)=>{const a=Math.PI+k*Math.PI/13,f=n=>n.toFixed(1);return `<path d="M${f(18*Math.cos(a))} ${f(6+18*Math.sin(a))}L${f(30*Math.cos(a))} ${f(6+30*Math.sin(a))}"/>`}).join('')}</g>
  <path d="M-41 8L-28 -3L-14 6L0 -2L16 6L30 -4L41 8V12H-41Z" fill="#5b4568" opacity=".85"/>
  <circle cx="0" cy="6" r="13" fill="#ffe58a" opacity=".95"/><rect x="-41" y="8" width="82" height="33" fill="url(#g-lago)"/>
  <path d="M-34 16Q-26 14 -18 16M10 19Q20 17 30 19M-24 30Q-10 28 4 30M14 34Q24 32 34 34" stroke="#bfe3e0" stroke-width="1.3" fill="none" opacity=".7"/>
  <ellipse cx="0" cy="30" rx="22" ry="3.5" fill="#ffd24a" opacity=".3"/>
  <path d="M-30 15H30L23 24H-23Z" fill="url(#g-oro)" ${S1}/><path d="M-26 18H26" stroke="#7a5200" stroke-width=".8"/>
  <g fill="url(#g-oro)" ${S1}><rect x="-3" y="-6" width="6" height="21" rx="2"/><circle cy="-10" r="4.4"/><path d="M-8 -13L0 -24L8 -13L4 -12L0 -17L-4 -12Z"/><path d="M-12 1L-3 -3M12 1L3 -3" fill="none"/>
   <rect x="-19" y="5" width="3.6" height="10" rx="1.4"/><circle cx="-17.2" cy="3" r="2.6"/><rect x="-12" y="7" width="3.6" height="8" rx="1.4"/><circle cx="-10.2" cy="5.2" r="2.4"/>
   <rect x="15.4" y="5" width="3.6" height="10" rx="1.4"/><circle cx="17.2" cy="3" r="2.6"/><rect x="8.4" y="7" width="3.6" height="8" rx="1.4"/><circle cx="10.2" cy="5.2" r="2.4"/></g>`,
 mambo:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-cielo)"/>
  <rect x="-38" y="-8" width="28" height="34" fill="url(#g-ladrillo)" ${S1}/><rect x="-10" y="4" width="28" height="22" fill="#a84e2c" ${S1}/><rect x="18" y="-18" width="20" height="44" fill="url(#g-ladrillo)" ${S1}/>
  <path d="M-38 -2H-10M-38 4H-10M-38 10H-10M-38 16H-10M-38 22H-10M-10 10H18M-10 16H18M-10 22H18M18 -12H38M18 -6H38M18 0H38M18 6H38M18 12H38M18 18H38" stroke="#5e2410" stroke-width=".6" opacity=".6"/>
  <g fill="#1d120a"><rect x="-33" y="-3" width="3" height="12"/><rect x="-26" y="-3" width="3" height="12"/><rect x="-19" y="-3" width="3" height="12"/><rect x="23" y="-12" width="3" height="14"/><rect x="30" y="-12" width="3" height="14"/></g>
  <circle cx="4" cy="-3" r="8" fill="#eadfc4" ${S1}/><circle cx="4" cy="-3" r="4" fill="#bfe0f2" stroke="#4a3418" stroke-width=".8"/>
  <rect x="-6" y="11" width="16" height="11" fill="#fff" ${S1}/><rect x="-6" y="11" width="6" height="6" fill="#c8202a"/><rect x="2" y="17" width="8" height="5" fill="#1d4fa0"/><rect x="2" y="11" width="8" height="3" fill="#f2c200"/>
  <rect x="-41" y="26" width="82" height="15" fill="#cfc7b2"/><path d="M-41 41L-41 34L-20 26L-12 26L-30 41Z" fill="#b8b09a"/><circle cx="25" cy="23" r="2" fill="#2a1a10"/><rect x="23.4" y="24.5" width="3.2" height="5" fill="#2a1a10"/>`,
 florero:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-cielo)"/>${MONSE}
  <path d="M-39 -12L-30 -24H30L39 -12Z" fill="url(#g-teja)" ${S1}/>${TEJAS(-34,34,-22)}
  <rect x="-34" y="-12" width="68" height="37" fill="#f6efdc" ${S1}/>
  <g fill="#3f6b4a" stroke="#fff" stroke-width="1.4"><rect x="-27" y="-8" width="9" height="12"/><rect x="-4.5" y="-8" width="9" height="12"/><rect x="18" y="-8" width="9" height="12"/></g>
  <rect x="-30" y="4" width="60" height="3.4" fill="#6b4524" ${S1}/><path d="M-28 7.4V13M-20 7.4V13M-12 7.4V13M-4 7.4V13M4 7.4V13M12 7.4V13M20 7.4V13M28 7.4V13" stroke="#6b4524" stroke-width="1.3"/><path d="M-30 13H30" stroke="#6b4524" stroke-width="1.3"/>
  <rect x="-6" y="13" width="12" height="12" fill="#3f6b4a" ${S1}/><circle cx="3" cy="19" r=".9" fill="#f2c200"/><g fill="#2a1a10"><rect x="-27" y="15" width="8" height="8"/><rect x="19" y="15" width="8" height="8"/></g>
  <rect x="-41" y="25" width="82" height="16" fill="#b9ad8c"/><path d="M-41 30H41M-41 35H41M-30 25V41M-8 25V41M14 25V41M32 25V41" stroke="#8c8064" stroke-width=".7" opacity=".7"/>
  <g transform="translate(27 31) scale(.55)"><path d="M-6 -16H6V-8C20 0 22 18 11 24H-11C-22 18 -20 0 -6 -8Z" fill="#6fa8c9" ${S1}/><path d="M-14 4H14" stroke="#fff" stroke-width="2" opacity=".7"/><circle cy="-20" r="5" fill="#e0583f" ${S1}/></g>`,
 moneda:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-cielo)"/>${MONSE}
  <path d="M-38 -8L-30 -20H30L38 -8Z" fill="url(#g-teja)" ${S1}/>${TEJAS(-33,33,-18)}
  <rect x="-34" y="-8" width="68" height="33" fill="#ecd9a6" ${S1}/>
  <g fill="#3a2410">${[-24,-8,8,24].map(x=>`<path d="M${x-4.5} 25V14a4.5 4.5 0 0 1 9 0V25Z"/>`).join('')}</g><g fill="#fffbea" ${S1}>${[-16,0,16,32,-32].map(x=>`<rect x="${x-1.4}" y="12" width="2.8" height="13"/>`).join('')}</g>
  <g fill="#3a2410">${[-24,-8,8,24].map(x=>`<rect x="${x-2.5}" y="-3" width="5" height="7"/>`).join('')}</g><rect x="-34" y="6" width="68" height="2.4" fill="#fffbea" ${S1}/>
  <rect x="-41" y="25" width="82" height="16" fill="#b9ad8c"/><path d="M-41 31H41M-41 36H41" stroke="#8c8064" stroke-width=".7" opacity=".7"/>
  <g ${S1}><circle cx="-22" cy="30" r="10" fill="url(#g-oro)"/><circle cx="-22" cy="30" r="7" fill="none" stroke="#7a5200" stroke-width="1"/><text x="-22" y="34.2" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="11" fill="#7a5200" stroke="none">$</text></g>
  <circle cx="-5" cy="36" r="4.6" fill="url(#g-oro)" ${S1}/><circle cx="3" cy="35" r="4.6" fill="url(#g-oro)" ${S1}/><circle cx="-1" cy="32" r="4.6" fill="url(#g-oro)" ${S1}/>`,
 botero:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-cielo)"/>${MONSE}
  <path d="M-39 -10L-30 -22H30L39 -10Z" fill="url(#g-teja)" ${S1}/>${TEJAS(-34,34,-20)}
  <rect x="-34" y="-10" width="68" height="35" fill="#e6c78a" ${S1}/>
  <g fill="#4c7f9e" stroke="#fff" stroke-width="1.2"><rect x="-29" y="-5" width="9" height="11"/><rect x="20" y="-5" width="9" height="11"/></g>
  <path d="M-13 25V4a13 13 0 0 1 26 0V25Z" fill="#2a1a10" ${S1}/>
  <g ${S1}><ellipse cx="0" cy="12" rx="10.5" ry="11.5" fill="#d9693f"/><circle cx="0" cy="-1" r="5.4" fill="#e8b48a"/><ellipse cx="0" cy="-5" rx="8.6" ry="2.1" fill="#2a1a10"/><rect x="-4.2" y="-12" width="8.4" height="7" rx="2" fill="#2a1a10"/><ellipse cx="-4" cy="23" rx="3.4" ry="1.8" fill="#2a1a10"/><ellipse cx="4" cy="23" rx="3.4" ry="1.8" fill="#2a1a10"/></g>
  <circle cx="-1.8" cy="-1" r=".8" fill="#2a1a10"/><circle cx="1.8" cy="-1" r=".8" fill="#2a1a10"/>
  <rect x="-41" y="25" width="82" height="16" fill="#b9ad8c"/><path d="M-41 31H41M-41 36H41" stroke="#8c8064" stroke-width=".7" opacity=".7"/>
  <g ${S1}><path d="M-31 25L-29 18H-24L-22 25Z" fill="#a8581e"/><circle cx="-26.5" cy="14" r="5" fill="#4f8a3a"/></g><g ${S1}><path d="M22 25L24 18H29L31 25Z" fill="#a8581e"/><circle cx="26.5" cy="14" r="5" fill="#4f8a3a"/></g>`,
 antimuseo:`<rect x="-41" y="-41" width="82" height="82" fill="url(#g-noche)"/>
  <g fill="#fff" opacity=".8"><rect x="-32" y="-32" width="2" height="2"/><rect x="22" y="-28" width="2" height="2"/><rect x="-8" y="-36" width="2" height="2"/><rect x="34" y="-14" width="2" height="2"/><rect x="-36" y="-8" width="2" height="2"/></g>
  <path d="M-30 25V-12L0 -28L30 -12V25Z" fill="#2a0f4a" stroke="#b36bff" stroke-width="2.2" stroke-linejoin="round"/>
  <ellipse cx="0" cy="8" rx="9" ry="14" fill="#05000d" stroke="#00e5ff" stroke-width="2"/><path d="M0 -4C8 0 6 8 0 8S-6 14 0 20M-5 2C-1 -2 5 2 1 6" fill="none" stroke="#ff3d6e" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="-34" y="-8" width="26" height="4" fill="#ff3d6e" opacity=".85"/><rect x="-2" y="-2" width="38" height="3" fill="#00e5ff" opacity=".85"/><rect x="-28" y="14" width="20" height="3" fill="#fff" opacity=".9"/><rect x="10" y="12" width="26" height="4" fill="#b36bff" opacity=".9"/><rect x="-36" y="-18" width="12" height="3" fill="#00e5ff" opacity=".7"/>
  <rect x="-41" y="25" width="82" height="16" fill="#12052a"/><path d="M-41 29H41M-41 34H41" stroke="#b36bff" stroke-width=".7" opacity=".5"/><path d="M-34 36L34 -34" stroke="#ff3d6e" stroke-width="3.4" stroke-linecap="round"/>`,
 minecraft:`<rect x="-41" y="-41" width="82" height="82" fill="#8fd0ff"/><rect x="-41" y="-41" width="82" height="42" fill="#b9e3ff"/>
  <rect x="14" y="-34" width="10" height="10" fill="#fff4a8"/><g fill="#fff" opacity=".95"><rect x="-34" y="-30" width="18" height="5"/><rect x="-28" y="-35" width="10" height="5"/><rect x="-4" y="-18" width="16" height="5"/><rect x="0" y="-23" width="8" height="5"/></g>
  ${(()=>{const h=[22,22,14,14,14,6,6,14,18,18];let s='';h.forEach((y,i)=>{const x=-41+i*8.2;s+=`<rect x="${x.toFixed(1)}" y="${y}" width="8.4" height="${41-y}" fill="#8a5a2c"/><rect x="${x.toFixed(1)}" y="${y}" width="8.4" height="4.4" fill="#6bb04a"/><rect x="${x.toFixed(1)}" y="${y+4.4}" width="8.4" height="1.6" fill="#4f8a3a"/><rect x="${(x+2).toFixed(1)}" y="${y+10}" width="2.2" height="2.2" fill="#6f4620"/><rect x="${(x+5).toFixed(1)}" y="${y+16}" width="2.2" height="2.2" fill="#a37140"/>`});return s})()}
  <rect x="-16" y="-3" width="4.4" height="17" fill="#6f4620"/><g fill="#3f8a34"><rect x="-24" y="-13" width="20.4" height="6.4"/><rect x="-21" y="-19.4" width="14.4" height="6.4"/><rect x="-24" y="-7" width="20.4" height="5"/></g><g fill="#4fa23f"><rect x="-21" y="-17" width="4" height="4"/><rect x="-12" y="-11" width="4" height="4"/></g>
  <rect x="14" y="0" width="22" height="14" fill="#a37140" stroke="#4a2c10" stroke-width="1"/><path d="M12 0L25 -10L38 0Z" fill="#7a2f1d" stroke="#4a2c10" stroke-width="1"/><rect x="21" y="5" width="6" height="9" fill="#3a2410"/><rect x="29" y="4" width="5" height="5" fill="#bfe3f5" stroke="#4a2c10" stroke-width=".8"/>`
};

const roca=`<circle class="roca" r="31" fill="url(#g-roca)"/><path d="M-14 -18L-6 -8L-12 2M12 -20L6 -10L14 0" fill="none" stroke="#4d4a3c" stroke-width="1.4" opacity=".6"/><g><rect x="-9" y="-3" width="18" height="14" rx="3" fill="#3d3a30"/><path d="M-6 -3V-8a6 6 0 0 1 12 0V-3" fill="none" stroke="#3d3a30" stroke-width="3.5" stroke-linecap="round"/><circle cy="4" r="2" fill="#a9a592"/></g>`;
const mk=m=>`<circle cy="5" r="31" fill="#000" opacity=".3"/><circle class="d" r="32" fill="${m.c}"/><g clip-path="url(#cm-${m.id})"><g transform="scale(.66)">${ESC[m.id]||''}</g></g><circle r="27" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>`;
const check=`<circle cx="24" cy="24" r="10" fill="#3f8a3f" stroke="#fff" stroke-width="2"/><path d="M19.5 24l3.5 3.5 6-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const cofreSvg=(abierto,nuevo)=>`<g class="cofre${abierto?' abierto':''}${nuevo?' nuevo':''}" transform="translate(${CH.x} ${CH.y})"><title>${abierto?'Tesoro encontrado':'El tesoro'}</title>
<path class="equis" d="M-17 42L17 68M17 42L-17 68"/>
<circle class="brillo" cy="-6" r="62" fill="url(#glow)"/>
<g class="monedas"><circle cx="-12" cy="-4" r="7"/><circle cx="2" cy="-9" r="7"/><circle cx="14" cy="-3" r="7"/></g>
<rect class="cu" x="-32" y="0" width="64" height="34" rx="4"/><rect class="ba" x="-21" y="0" width="9" height="34"/><rect class="ba" x="12" y="0" width="9" height="34"/><rect class="ba" x="-6" y="10" width="12" height="14" rx="2"/>
<g class="tapa"><path class="cu" d="M-32 0Q-32 -30 0 -30Q32 -30 32 0Z"/><path class="ba" d="M-21 -4Q-21 -25 -17 -27L-12 -27L-12 -1ZM21 -4Q21 -25 17 -27L12 -27L12 -1Z"/></g></g>`;

/* terreno fijo del mapa: río, montañas y árboles repartidos esquivando la ruta y los rótulos */
/* ---------- elementos del terreno ---------- */
const arbol=(x,y,k,R)=>{
 const t=R(),v=['cp','cq','cr'][(R()*3)|0],sh='<ellipse cx="3" cy="3" rx="13" ry="4.5" fill="#3a2a10" opacity=".22"/>';let c;
 if(t<.52)c=`${sh}<path class="tk" d="M0 2V-9"/><circle class="${v}" cx="-7" cy="-11" r="7"/><circle class="${v}" cx="7" cy="-11" r="7"/><circle class="${v}" cy="-17" r="9"/><circle class="cl2" cx="-3" cy="-20" r="5"/><circle class="cs2" cx="8" cy="-8" r="4"/>`;
 else if(t<.78)c=`${sh}<path class="tk" d="M0 2V-6"/><path class="pn" d="M-10 -5L0 -20L10 -5Z"/><path class="pn" d="M-8 -13L0 -28L8 -13Z"/><path class="pn" d="M-6 -21L0 -36L6 -21Z"/><path class="pn2" d="M0 -20L10 -5H3ZM0 -28L8 -13H2ZM0 -36L6 -21H1Z"/>`;
 else if(t<.9)c=`${sh}<path class="tk" d="M0 2Q-4 -10 2 -21"/><g class="pa"><path d="M2 -21Q-9 -30 -19 -21"/><path d="M2 -21Q-4 -34 -14 -33"/><path d="M2 -21Q8 -34 17 -30"/><path d="M2 -21Q13 -28 21 -19"/><path d="M2 -21Q2 -31 4 -37"/></g><circle cx="1" cy="-20" r="2" fill="#7a4a1c"/><circle cx="4" cy="-19" r="2" fill="#7a4a1c"/>`;
 else c=`<ellipse cx="2" cy="1" rx="10" ry="3.2" fill="#3a2a10" opacity=".22"/><circle class="${v}" cx="-5" cy="-4" r="5.5"/><circle class="${v}" cx="4" cy="-5" r="6.5"/><circle class="cl2" cx="2" cy="-8" r="3"/>`;
 return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})">${c}</g>`;
};
const monte=(x,y,k,R)=>{
 const w=50+R()*14,h1=48+R()*22,h2=30+R()*14,f=n=>n.toFixed(1);let hl='';
 for(let n=0;n<7;n++){const hx=w*.12+n*6.5;hl+=`M${f(hx)} ${f(-h1*.3+n*3)}l4 9`}
 for(let n=0;n<4;n++)hl+=`M${f(-w*.5+n*7)} ${f(-h2*.5+n*4)}l-3 8`;
 const pico=-w*.05,nieve=`M${f(pico)} ${f(-h1)}L${f(pico+10)} ${f(-h1+14)}L${f(pico+4)} ${f(-h1+11)}L${f(pico-1)} ${f(-h1+17)}L${f(pico-6)} ${f(-h1+11)}L${f(pico-11)} ${f(-h1+14)}Z`;
 return `<g transform="translate(${f(x)} ${f(y)}) scale(${k.toFixed(2)})"><ellipse cy="3" rx="${f(w+12)}" ry="9" fill="#5b3a14" opacity=".2"/>
 <path class="mt" d="M${f(-w)} 0L${f(-w*.55)} ${f(-h2)}L${f(-w*.35)} ${f(-h2*.7)}L${f(pico)} ${f(-h1)}L${f(w*.3)} ${f(-h2*1.1)}L${f(w*.45)} ${f(-h2*.95)}L${f(w)} 0Z"/>
 <path class="mt2" d="M${f(pico)} ${f(-h1)}L${f(w*.3)} ${f(-h2*1.1)}L${f(w*.45)} ${f(-h2*.95)}L${f(w)} 0L${f(w*.1)} 0L${f(w*.14)} ${f(-h1*.45)}Z"/>
 <path class="mt3" d="M${f(-w)} 0L${f(-w*.55)} ${f(-h2)}L${f(-w*.35)} ${f(-h2*.7)}L${f(-w*.5)} 0Z"/><path class="tr-l" d="${hl}"/><path class="nv" d="${nieve}"/>
 <g transform="translate(${f(-w*.75)} 2) scale(.55)"><path class="pn" d="M-10 -5L0 -20L10 -5Z"/><path class="pn" d="M-8 -13L0 -28L8 -13Z"/></g><g transform="translate(${f(w*.8)} 3) scale(.5)"><path class="pn" d="M-10 -5L0 -20L10 -5Z"/><path class="pn" d="M-8 -13L0 -28L8 -13Z"/></g></g>`;
};
const galeon=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path class="gh" d="M-22 0H22L15 11H-15Z"/><path d="M0 0V-30M-12 0V-20M12 0V-20" stroke="#2a190c" stroke-width="2"/><path class="gv" d="M-1 -29Q-17 -16 -1 -3ZM1 -29Q17 -16 1 -3Z"/><path class="gv" d="M-13 -19Q-22 -10 -13 -3ZM13 -19Q22 -10 13 -3Z"/><path d="M0 -30V-36" stroke="#2a190c" stroke-width="2"/><path d="M0 -36L9 -33L0 -30Z" fill="#a8321c"/></g>`;

/* terreno fijo del mapa: río, montañas, bosque y puentes, esquivando la ruta y los rótulos */
function terreno(){
 const R=rnd(7),ruta=[],rio=[],tr=[];
 for(let i=0;i<N;i++)tramo(i).forEach(([a,c1,c2,b])=>{for(let t=0;t<=1.001;t+=.04){const p=[bz(a[0],c1[0],c2[0],b[0],t),bz(a[1],c1[1],c2[1],b[1],t)];ruta.push(p);tr.push([i,p])}});
 RIO.forEach(r=>{for(let t=0;t<=1.001;t+=.05)rio.push([bz(r[0],r[2],r[4],r[6],t),bz(r[1],r[3],r[5],r[7],t)])});
 const cerca=(a,x,y,d)=>a.some(p=>Math.hypot(p[0]-x,p[1]-y)<d);
 const libre=(x,y,dr,dw,pad)=>x>55&&x<545&&y>55&&y<1055
  &&!cerca(ruta,x,y,dr)&&!cerca(rio,x,y,dw)
  &&!M.some(m=>Math.abs(x-m.x)<135+pad&&y>m.y-52-pad&&y<m.y+104+pad)   // rótulos de las paradas
  &&Math.hypot(x-CH.x,y-CH.y)>=85+pad                                   // cofre
  &&Math.hypot(x-88,y-1022)>=64+pad                                     // brújula
  &&!(x>420&&y>990);                                                    // mar
 const mont=[],arb=[],hie=[];
 for(let n=0;n<900&&mont.length<5;n++){const x=110+R()*380,y=100+R()*940;if(libre(x,y,70,45,34)&&!mont.some(q=>Math.hypot(q[0]-x,q[1]-y)<140))mont.push([x,y,.8+R()*.45])}
 for(let n=0;n<4000&&arb.length<125;n++){const x=60+R()*480,y=70+R()*980;if(libre(x,y,44,30,0)&&!arb.some(q=>Math.hypot(q[0]-x,q[1]-y)<27)&&!mont.some(q=>Math.hypot(q[0]-x,q[1]-y)<80))arb.push([x,y,.75+R()*.5])}
 for(let n=0;n<3000&&hie.length<260;n++){const x=60+R()*480,y=70+R()*980;if(libre(x,y,30,14,0)&&!mont.some(q=>Math.hypot(q[0]-x,q[1]-y)<62))hie.push([x,y])}
 arb.sort((a,b)=>a[1]-b[1]);
 let s='';
 /* hierba y matas sueltas */
 hie.forEach(([x,y])=>s+=`<path class="hb" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" d="M0 0l-2.4-5M0 0v-6M0 0l2.4-5"/>`);
 /* curvas de nivel alrededor de las montañas */
 mont.forEach(([x,y,k])=>s+=`<ellipse class="nivel" cx="${x.toFixed(1)}" cy="${(y+4).toFixed(1)}" rx="${(88*k).toFixed(1)}" ry="${(20*k).toFixed(1)}"/><ellipse class="nivel" cx="${x.toFixed(1)}" cy="${(y+6).toFixed(1)}" rx="${(104*k).toFixed(1)}" ry="${(27*k).toFixed(1)}"/>`);
 /* río: orilla, agua, brillo y juncos */
 const anch=[9,11,13,17],seg=r=>`M${r[0]} ${r[1]}C${r[2]} ${r[3]} ${r[4]} ${r[5]} ${r[6]} ${r[7]}`;
 RIO.forEach((r,i)=>s+=`<path class="rio-b" d="${seg(r)}" style="stroke-width:${anch[i]+9}"/>`);
 RIO.forEach((r,i)=>s+=`<path class="rio" d="${seg(r)}" style="stroke-width:${anch[i]}"/>`);
 RIO.forEach((r,i)=>s+=`<path class="rio-l" d="${seg(r)}" style="stroke-width:${Math.max(2,anch[i]*.28).toFixed(1)}"/>`);
 rio.forEach((p,k)=>{if(k%3===0&&R()<.5){const sg=R()<.5?-1:1,d=14+R()*4;s+=`<path class="ca" transform="translate(${(p[0]+sg*d).toFixed(1)} ${(p[1]+R()*6-3).toFixed(1)})" d="M0 0l-1.6-8M0 0v-10M0 0l1.6-8"/>`}});
 /* mar donde desemboca el río, con un galeón */
 s+=`<path class="mar-b" d="M432 1062C446 1030 484 1010 526 1008C546 1007 558 1010 562 1014V1062Z"/><path class="mar" d="M438 1060C452 1032 486 1016 526 1014C544 1013 556 1015 560 1018V1058Z"/><path class="rio-l" d="M470 1040Q490 1034 510 1040T552 1038M456 1052Q480 1046 500 1052T548 1050" style="stroke-width:2"/>${galeon(518,1042,.55)}`;
 /* montañas, luego árboles (de arriba hacia abajo, así los de abajo tapan a los de arriba) */
 mont.sort((a,b)=>a[1]-b[1]).forEach(([x,y,k])=>s+=monte(x,y,k,R));
 arb.forEach(([x,y,k])=>s+=arbol(x,y,k,R));
 /* puentes: en cada cruce de la ruta con el río */
 const puestos=[];
 for(let i=0;i<N;i++){
  const pts=tr.filter(q=>q[0]===i).map(q=>q[1]),dd=pts.map(p=>Math.min(...rio.map(q=>Math.hypot(p[0]-q[0],p[1]-q[1]))));
  pts.forEach((p,k)=>{
   if(k<1||k>=pts.length-1||dd[k]>=20||dd[k]>dd[k-1]||dd[k]>=dd[k+1]+0.001&&false||dd[k]>dd[k+1])return;
   if(M.some(m=>Math.abs(p[0]-m.x)<145&&p[1]>m.y-48&&p[1]<m.y+110)||puestos.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<60))return;
   puestos.push(p);const q=pts[k-1],r2=pts[k+1],ang=Math.atan2(r2[1]-q[1],r2[0]-q[0])*180/Math.PI;
   s+=`<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${ang.toFixed(1)})"><rect class="pu-s" x="-25" y="-8" width="50" height="18" rx="3"/><rect class="pu" x="-25" y="-9" width="50" height="16" rx="2"/><path class="pu-t" d="M-20 -9V7M-14 -9V7M-8 -9V7M-2 -9V7M4 -9V7M10 -9V7M16 -9V7M22 -9V7"/><path class="pu-b" d="M-25 -9H25M-25 7H25"/></g>`})
 }
 /* brújula con rosa de los vientos */
 let tk='';for(let k=0;k<24;k++){const an=k*Math.PI/12,r1=k%6===0?36:38,r2=42;tk+=`M${(r1*Math.cos(an)).toFixed(1)} ${(r1*Math.sin(an)).toFixed(1)}L${(r2*Math.cos(an)).toFixed(1)} ${(r2*Math.sin(an)).toFixed(1)}`}
 s+=`<g transform="translate(88 1022)"><circle class="br" r="46"/><circle class="br" r="34" stroke-dasharray="2 4"/><path class="br" d="${tk}"/><path class="rs2" d="M0-32L6-6L32 0L6 6L0 32L-6 6L-32 0L-6-6Z" transform="rotate(45) scale(.72)"/><path class="rs" d="M0-50L8-8L0 0L-8-8Z" fill="#a8321c"/><path class="rs2" d="M0 50L8 8L0 0L-8 8ZM50 0L8-8L0 0L8 8ZM-50 0L-8-8L0 0L-8 8Z"/><circle r="4" fill="#f6ead0" stroke="#4a3418" stroke-width="1.6"/><text class="nn" y="-56" text-anchor="middle">N</text></g>`;
 return s;
}

/* pinta lo que cambia con el avance: tramos del camino, paradas, candados y cofre */
function render(){
 if(!dyn)return;
 const an=new Set(nuevos),cf=cofre;nuevos.clear();cofre=false;
 let s='';
 for(let i=0;i<N;i++)s+=`<path class="cam${i+1<=avance?' on':''}" d="${dTramo(i)}"/>`;
 s+=cofreSvg(avance>=N,cf);
 M.forEach((m,i)=>{
  const e=estado(i),ab=an.has(i),sts=e==='bloq'?', bloqueado':e==='hecho'?(L[m.id]?', visitado':', enlace pendiente'):', disponible';
  s+=`<g class="mk f-${m.id} ${e}${ab?' abre':''}" data-i="${i}" transform="translate(${m.x} ${m.y})" tabindex="0" role="button" aria-label="${m.s}, parada ${i+1} de ${N}${sts}"${e==='bloq'?' aria-disabled="true"':''}>
  <circle class="hit" r="38"/><circle class="foco" r="36"/>${e==='actual'?'<circle class="pulso" r="31"/>':''}
  <g class="mkr">${e==='bloq'?roca:mk(m)}${ab?`<g class="cand">${roca}</g>`:''}</g>
  <g class="nb"><circle cx="-26" cy="-26" r="11.5"/><text x="-26" y="-20.7" text-anchor="middle">${i+1}</text></g>
  ${e==='hecho'&&L[m.id]?check:''}
  <g class="pl" transform="translate(0 56)"><rect x="-70" y="-21" width="140" height="36" rx="7"/><text y="6" text-anchor="middle">${m.s}</text></g></g>`;
 });
 dyn.innerHTML=s;ajustar();
 const pg=document.getElementById('prog');
 if(pg)pg.textContent=avance>=N?'Recorrido completo: tesoro encontrado':`Parada ${avance+1} de ${N}: ${M[avance].s}`;
}
function ajustar(){   // el rótulo se ajusta al ancho real del texto
 try{svg.querySelectorAll('.pl').forEach(g=>{const b=g.querySelector('text').getBBox(),r=g.querySelector('rect');r.setAttribute('x',(b.x-14).toFixed(1));r.setAttribute('width',(b.width+28).toFixed(1));const mx=M[+g.parentNode.dataset.i].x,h=(b.width+28)/2,dx=Math.max(22-(mx-h),0)||Math.min(578-(mx+h),0);g.setAttribute('transform','translate('+dx.toFixed(1)+' 56)')})}catch(e){}
}

/* ---------- página ---------- */
const app=document.getElementById('app');

/* emblemas de las medallas (se pueden reemplazar con el logo real de cada museo usando el campo logo) */
const T='stroke="#4a3418" stroke-width="2.5" stroke-linejoin="round"';
const RAYOS=Array.from({length:12},(_,k)=>{const a=k*Math.PI/6,f=n=>n.toFixed(1);return `M${f(22*Math.cos(a))} ${f(22*Math.sin(a))}L${f(33*Math.cos(a))} ${f(33*Math.sin(a))}`}).join('');
const EMB={
 nacional:`<path d="M-34 -10L0 -32L34 -10Z" fill="#d9c9a0" ${T}/><rect x="-32" y="-10" width="64" height="6" fill="#b9a77a" ${T}/><g fill="#efe3c0" ${T}><rect x="-27" y="-4" width="9" height="28"/><rect x="-12" y="-4" width="9" height="28"/><rect x="3" y="-4" width="9" height="28"/><rect x="18" y="-4" width="9" height="28"/></g><rect x="-36" y="24" width="72" height="9" fill="#b9a77a" ${T}/>`,
 oro:`<path d="${RAYOS}" stroke="#f2b705" stroke-width="5" stroke-linecap="round" fill="none"/><circle r="18" fill="#f2b705" ${T}/><circle r="9" fill="none" stroke="#b8860b" stroke-width="3"/>`,
 mambo:`<circle cx="-8" cy="-8" r="19" fill="#e0838f" ${T}/><rect x="4" y="2" width="27" height="27" fill="#4b8fb8" ${T}/><path d="M-30 28L-10 -2L10 28Z" fill="#f2c94c" ${T}/>`,
 florero:`<g transform="translate(0 4)"><path d="M-8 -22H8V-9C24 0 26 22 13 30H-13C-26 22 -24 0 -8 -9Z" fill="#6fa8c9" ${T}/><path d="M-18 8H18" stroke="#fff" stroke-width="3" stroke-opacity=".7"/><path d="M0 -22V-31" stroke="#3f6b2a" stroke-width="3" stroke-linecap="round"/><circle cy="-35" r="5.5" fill="#e0583f" ${T}/></g>`,
 moneda:`<circle r="31" fill="#f2b705" ${T}/><circle r="23" fill="none" stroke="#b8860b" stroke-width="3"/><text y="12" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="34" fill="#7a5200">$</text>`,
 botero:`<g transform="translate(0 6)"><ellipse cy="8" rx="25" ry="24" fill="#d9693f" ${T}/><circle cy="-22" r="11" fill="#e8b48a" ${T}/><ellipse cy="-31" rx="17" ry="4" fill="#4a3418"/><rect x="-9" y="-42" width="18" height="11" rx="3" fill="#4a3418"/><circle cx="-4" cy="-22" r="1.6" fill="#4a3418"/><circle cx="4" cy="-22" r="1.6" fill="#4a3418"/></g>`,
 antimuseo:`<rect x="-30" y="-30" width="60" height="60" fill="#1b0b36" stroke="#b36bff" stroke-width="5"/><rect x="-22" y="-16" width="32" height="6" fill="#00e5ff"/><rect x="-6" y="-2" width="30" height="6" fill="#b36bff"/><rect x="-20" y="12" width="24" height="6" fill="#fff"/><path d="M-32 32L32 -32" stroke="#ff3d6e" stroke-width="5" stroke-linecap="round"/>`,
 minecraft:`<path d="M0 -34L30 -18L0 -2L-30 -18Z" fill="#7bbf4a" ${T}/><path d="M-30 -18L0 -2V34L-30 18Z" fill="#8a5a2c" ${T}/><path d="M30 -18L0 -2V34L30 18Z" fill="#6f4620" ${T}/><path d="M-8 -22l8 4-8 4-8-4Z" fill="#5a9a34"/><path d="M-22 4l8 4v8l-8-4Z" fill="#6f4620"/><path d="M10 12l8-4v8l-8 4Z" fill="#583616"/>`
};
const medalla=(m)=>`<svg class="med" viewBox="-60 -60 120 120" aria-hidden="true"><defs><clipPath id="cl-${m.id}"><circle r="41"/></clipPath></defs><circle class="mr" r="56"/><circle class="md" r="47"/>${m.logo?`<image href="${m.logo}" x="-41" y="-41" width="82" height="82" clip-path="url(#cl-${m.id})" preserveAspectRatio="xMidYMid slice"/>`:`<g clip-path="url(#cl-${m.id})">${ESC[m.id]||EMB[m.id]||''}</g><circle r="41" fill="none" stroke="#7a5200" stroke-width="1.6" opacity=".55"/>`}</svg>`;

const iconoRuta='<svg class="ico" viewBox="0 0 80 80" aria-hidden="true"><path d="M14 14C62 14 18 44 62 44S30 68 56 66" fill="none" stroke="#a8321c" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round"/><circle cx="14" cy="14" r="8" fill="#e3a82b" stroke="#3a2a12" stroke-width="2.5"/><path d="M50 60l12 12M62 60L50 72" stroke="#a8321c" stroke-width="5" stroke-linecap="round"/></svg>';
const iconoMedalla='<svg class="ico" viewBox="0 0 80 80" aria-hidden="true"><path d="M26 48L18 76L32 69Z" fill="#a8321c"/><path d="M54 48L62 76L48 69Z" fill="#7a1f10"/><circle cx="40" cy="34" r="26" fill="#e3a82b" stroke="#3a2a12" stroke-width="2.5"/><circle cx="40" cy="34" r="19" fill="#f6ead0" stroke="#7a5200" stroke-width="2"/><path d="M40 21l4.5 9.5 10.3 1.2-7.6 7 2.1 10.2L40 43.6 30.7 48.9l2.1-10.2-7.6-7 10.3-1.2Z" fill="#e3a82b" stroke="#3a2a12" stroke-width="2" stroke-linejoin="round"/></svg>';

/* ----- pantalla de inicio: elegir cómo recorrer ----- */
function inicio(){
 modo=null;svg=dyn=null;window.scrollTo(0,0);
 const pl=avance>=N?'Ruta completada':avance>0?`Vas en la parada ${avance+1} de ${N}`:'Sin empezar';
 app.innerHTML=`<header class="cartel"><h1>Ruta de los museos</h1><p>Ocho museos por recorrer. ¿Cómo quieres hacerlo?</p></header>
 <main class="opciones">
  <button type="button" class="opcion" data-m="lineal">${iconoRuta}<span class="kick">Línea de tiempo</span><span class="t">Seguir la historia</span><span class="ds">Ocho paradas en un orden fijo sobre el mapa del tesoro. Cada museo abre el siguiente y no puedes volver al mapa hasta llegar al cofre.</span><span class="chip">${pl}</span></button>
  <button type="button" class="opcion" data-m="libre">${iconoMedalla}<span class="kick">A tu ritmo</span><span class="t">Recorrido libre</span><span class="ds">Entra a cualquier museo, en el orden que quieras, y vuelve cuando quieras. Al terminar un museo ganas su medalla; si sales antes, no cuenta.</span><span class="chip">${logros.size} de ${N} medallas</span></button>
 </main>`;
 app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>b.dataset.m==='lineal'?(guardarModo(modo='lineal'),lineal()):(guardarModo(modo='libre'),libre()));
}

/* ----- recorrido libre: galería de medallas ----- */
function libre(){
 modo='libre';svg=dyn=null;window.scrollTo(0,0);
 app.innerHTML=`<header class="cartel"><h1>Recorrido libre</h1><p>Entra al museo que quieras y vuelve cuando quieras. La medalla solo se gana al terminar el museo.</p><p id="prog" class="prog"></p><p id="st" role="status"></p><button type="button" class="cambiar" id="cambiar">← Elegir otro recorrido</button></header>
 <main class="tablero"><ul class="galeria" id="gal"></ul></main>
 ${PRUEBA?`<details class="prueba" open><summary>Modo de prueba</summary><p>Herramientas para probar. Este panel se quita cuando termine la fase de pruebas.</p><div class="ctl"><button type="button" id="rsm">Reiniciar medallas</button></div></details>`:''}`;
 galeria();
 document.getElementById('cambiar').onclick=inicio;
 if(PRUEBA)document.getElementById('rsm').onclick=()=>{logros.clear();guardarLogros();galeria();st('Medallas reiniciadas.')};
}
function galeria(){
 const g=document.getElementById('gal');if(!g)return;
 const nv=nueva;nueva='';
 g.innerHTML=M.map((m,i)=>{const ok=logros.has(m.id);
  return `<li><button type="button" class="slot f-${m.id} ${ok?'ok':'vacio'}${nv===m.id?' nueva':''}" data-i="${i}" aria-label="${m.n}: ${ok?'medalla obtenida':'medalla por conseguir'}">${medalla(m)}<span class="nm">${m.s}</span><span class="es">${ok?'✓ Completado':L[m.id]?'Por completar':'Enlace pendiente'}</span></button></li>`}).join('');
 g.querySelectorAll('.slot').forEach(b=>b.onclick=()=>entrar(+b.dataset.i));
 const pg=document.getElementById('prog');
 if(pg)pg.textContent=logros.size>=N?'¡Colección completa!':`Medallas: ${logros.size} de ${N}`;
 if(nv){const e=g.querySelector('.nueva');if(e)e.scrollIntoView({block:'center',behavior:rm?'auto':'smooth'})}
}

/* ----- ruta lineal: mapa del tesoro ----- */
function lineal(){
 modo='lineal';window.scrollTo(0,0);
 app.innerHTML=`<header class="cartel"><h1>Ruta de los museos</h1><p>Ocho paradas, un solo recorrido. Cada candado se abre al terminar el museo anterior.</p><p id="prog" class="prog"></p><p id="st" role="status"></p><button type="button" class="cambiar" id="cambiar">← Elegir otro recorrido</button></header>
 <main class="mapw"><svg id="m" viewBox="0 0 600 1100" role="group" aria-label="Mapa del tesoro con la ruta de los ocho museos">
 <defs>
  <filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".02 .018" numOctaves="4" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" result="d1"/><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="2" result="n2"/><feDisplacementMap in="d1" in2="n2" scale="9"/></filter>
  <filter id="fibra"><feTurbulence type="fractalNoise" baseFrequency=".9 .04" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .08  0 0 0 .9 -.2"/></filter>
  <filter id="suave"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="papel" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="5" seed="3" result="n"/><feDiffuseLighting in="n" lighting-color="#f3e6bd" surfaceScale="2.2"><feDistantLight azimuth="40" elevation="58"/></feDiffuseLighting></filter>
  <linearGradient id="plv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3c1e05" stop-opacity="0"/><stop offset=".44" stop-color="#3c1e05" stop-opacity=".26"/><stop offset=".5" stop-color="#fff5d2" stop-opacity=".3"/><stop offset=".58" stop-color="#3c1e05" stop-opacity=".08"/><stop offset="1" stop-color="#3c1e05" stop-opacity="0"/></linearGradient>
  <linearGradient id="plh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c1e05" stop-opacity="0"/><stop offset=".44" stop-color="#3c1e05" stop-opacity=".22"/><stop offset=".5" stop-color="#fff5d2" stop-opacity=".26"/><stop offset=".58" stop-color="#3c1e05" stop-opacity=".07"/><stop offset="1" stop-color="#3c1e05" stop-opacity="0"/></linearGradient>
  ${M.map(m=>`<clipPath id="cm-${m.id}"><circle r="27"/></clipPath>`).join("")}
  <radialGradient id="perg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#f1e2b6"/><stop offset=".7" stop-color="#e3cd96"/><stop offset="1" stop-color="#c9a965"/></radialGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffe58a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd24a" stop-opacity="0"/></radialGradient>
 </defs>
 <g filter="url(#rough)"><rect x="16" y="16" width="568" height="1068" fill="url(#perg)"/><rect x="16" y="16" width="568" height="1068" filter="url(#fibra)" opacity=".5"/>
  <ellipse cx="460" cy="160" rx="90" ry="60" fill="#8a5f22" opacity=".1"/><ellipse cx="120" cy="690" rx="80" ry="110" fill="#8a5f22" opacity=".09"/><ellipse cx="420" cy="880" rx="110" ry="70" fill="#8a5f22" opacity=".1"/>
  <rect x="16" y="16" width="568" height="1068" filter="url(#papel)" style="mix-blend-mode:multiply" opacity=".6"/>
  <ellipse cx="478" cy="560" rx="64" ry="42" fill="#9a6a2a" opacity=".13" filter="url(#suave)"/><circle cx="92" cy="262" r="34" fill="none" stroke="#7a4a18" stroke-width="3.2" opacity=".2" filter="url(#suave)"/><ellipse cx="190" cy="905" rx="52" ry="30" fill="#8a5a22" opacity=".12" filter="url(#suave)"/>
  <rect x="296" y="16" width="9" height="1068" fill="url(#plv)"/><rect x="16" y="366" width="568" height="9" fill="url(#plh)"/><rect x="16" y="732" width="568" height="9" fill="url(#plh)"/>
  <rect x="42" y="42" width="516" height="1016" fill="none" stroke="#2f1704" stroke-width="52" opacity=".5" filter="url(#suave)"/><rect x="42" y="42" width="516" height="1016" fill="none" stroke="#8a4a14" stroke-width="22" opacity=".4" filter="url(#suave)"/><rect x="42" y="42" width="516" height="1016" fill="none" stroke="#5b3a14" stroke-width="20" opacity=".5" filter="url(#suave)"/></g>
 <g id="ter"></g><g id="dyn"></g></svg><div id="tip" role="tooltip"></div></main>
 ${PRUEBA?`<details class="prueba" open><summary>Modo de prueba</summary><p>Entra a cualquier museo sin respetar los candados. Este panel se quita cuando termine la fase de pruebas.</p>
 <ul class="at">${M.map((m,i)=>`<li><button type="button" data-f="${i}"><b>${i+1}</b><span>${m.s}${L[m.id]?'':'<small>enlace pendiente</small>'}</span></button></li>`).join('')}</ul>
 <div class="ctl"><button type="button" id="rs">Reiniciar recorrido</button></div></details>`:''}`;
 svg=document.getElementById('m');dyn=document.getElementById('dyn');
 document.getElementById('ter').innerHTML=terreno();
 render();
 const W0=document.querySelector('.mapw'),tip=document.getElementById('tip');
 svg.addEventListener('click',e=>{const g=e.target.closest('.mk');if(g)tocar(+g.dataset.i)});
 svg.addEventListener('keydown',e=>{const g=e.target.closest('.mk');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();tocar(+g.dataset.i)}});
 const showTip=g=>{
  const i=+g.dataset.i,m=M[i],r=g.querySelector('.mkr').getBoundingClientRect(),w=W0.getBoundingClientRect();
  const s=i>avance?'Bloqueado hasta recorrer '+M[i-1].s:(L[m.id]?'Clic para entrar al museo':'Enlace pendiente de su grupo');
  tip.innerHTML='<b>'+m.n+'</b>'+m.a+'<br>'+m.t+'<i>'+s+'</i>';tip.style.setProperty('--tc',m.c);tip.style.display='block';
  let x=r.left-w.left+r.width/2-tip.offsetWidth/2,y=r.top-w.top-tip.offsetHeight-10;
  if(y<4)y=r.bottom-w.top+10;x=Math.max(6,Math.min(x,w.width-tip.offsetWidth-6));tip.style.left=x+'px';tip.style.top=y+'px';
 };
 svg.addEventListener('pointerover',e=>{const g=e.target.closest('.mk');if(g&&e.pointerType!=='touch')showTip(g)});
 svg.addEventListener('pointerout',e=>{if(e.target.closest('.mk'))tip.style.display='none'});
 svg.addEventListener('focusin',e=>{const g=e.target.closest('.mk');if(g)showTip(g)});
 svg.addEventListener('focusout',()=>tip.style.display='none');
 if(PRUEBA){
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>entrar(+b.dataset.f,true));
  document.getElementById('rs').onclick=()=>{avance=0;guardar();render();st('Recorrido reiniciado: solo el Museo Nacional está abierto.');enfocar()};
 }
 document.getElementById('cambiar').onclick=inicio;
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ajustar);
 if(avance>0&&avance<N)setTimeout(enfocar,350);
}

/* ---------- ambientación de selva ---------- */
function fronda(len,cols,vn,R){
 let s=`<path d="M0 0Q${len/2} ${-len*.08} ${len} ${len*.04}" fill="none" stroke="${vn}" stroke-width="${Math.max(2,len*.016).toFixed(1)}" stroke-linecap="round"/>`;
 const n=11;
 for(let k=1;k<=n;k++){
  const t=k/(n+1),x=len*t,y=len*(-.16*t*(1-t)+.04*t*t),l=len*.3*(1-.68*t)+5,w=l*.24,ang=58-24*t;
  for(const sg of[-1,1])s+=`<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${sg*ang})" d="M0 0Q${l*.45} ${-w} ${l} 0Q${l*.45} ${w} 0 0Z" fill="${cols[(R()*cols.length)|0]}"/>`;
 }
 return s;
}
const hoja=(l,fill,vn)=>`<path d="M0 0C${l*.2} ${-l*.3} ${l*.72} ${-l*.3} ${l} 0C${l*.72} ${l*.3} ${l*.2} ${l*.3} 0 0Z" fill="${fill}"/><path d="M0 0H${l}" stroke="${vn}" stroke-width="${Math.max(1.5,l*.012).toFixed(1)}"/>`;
let dim=[0,0];
function selva(){
 const W=innerWidth,H=innerHeight,u=Math.min(W,H),R=rnd(11),lg=Math.max(120,Math.min(300,u*.38));dim=[W,H];
 const ver=['#0a2f1a','#0d3a21','#104526'],vena='#061a0e',ver2=['#14602f','#1b7a3b','#25914a'],vena2='#0b3a1b';
 let bg='';
 [[0,.08],[0,.36],[0,.64],[0,.92],[1,.2],[1,.5],[1,.78]].forEach(([lado,fy])=>{
  const x=lado?W:0,y=fy*H,base=lado?180:0,nf=7;
  for(let f=0;f<nf;f++){const ang=base-78+156*f/(nf-1)+(R()-.5)*10,len=lg*(.72+R()*.5);
   bg+=`<g transform="translate(${x} ${y}) rotate(${ang.toFixed(1)})">${fronda(len,ver,vena,R)}</g>`}
  bg+=`<g transform="translate(${x} ${y}) rotate(${(base+(R()-.5)*60).toFixed(1)})">${hoja(lg*.85,'#0b3320',vena)}</g>`;
 });
 const sv=document.getElementById('selva');sv.setAttribute('viewBox',`0 0 ${W} ${H}`);sv.innerHTML=bg;
 /* primer plano: frondas en las esquinas de arriba y lianas colgando */
 let fg='';
 [[-8,-8,5,85],[W+8,-8,95,175]].forEach(([x,y,a0,a1],q)=>{
  let g='';const nf=5;
  for(let f=0;f<nf;f++){const ang=a0+(a1-a0)*f/(nf-1),len=lg*(.55+R()*.4);g+=`<g transform="rotate(${ang.toFixed(1)})">${fronda(len,ver2,vena2,R)}</g>`}
  fg+=`<g class="mece" style="transform-origin:${x}px ${y}px;--dl:${-q*3.5}s"><g transform="translate(${x} ${y})">${g}</g></g>`;
 });
 const nv=W<600?3:6;
 for(let v=0;v<nv;v++){
  const vx=(v+.5)*W/nv+(R()-.5)*60,h=70+R()*130;
  let g=`<path d="M${vx} -10C${vx+14} ${h*.3} ${vx-14} ${h*.65} ${vx+4} ${h}" fill="none" stroke="#1c5a2c" stroke-width="3" stroke-linecap="round"/>`;
  [.3,.55,.8,1].forEach((t,k)=>{const cx=bz(vx,vx+14,vx-14,vx+4,t),cy=bz(-10,h*.3,h*.65,h,t),sg=k%2?1:-1;
   g+=`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="10" ry="4.5" transform="rotate(${sg*38} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="#237a3a"/>`});
  fg+=`<g class="mece" style="transform-origin:${vx.toFixed(0)}px -10px;--dl:${(-v*1.7).toFixed(1)}s">${g}</g>`;
 }
 const pr=document.getElementById('primer');pr.setAttribute('viewBox',`0 0 ${W} ${H}`);pr.innerHTML=fg;
 /* luciérnagas */
 let lu='';
 for(let k=0;k<14;k++)lu+=`<span class="lu" style="left:${(R()*100).toFixed(1)}%;top:${(15+R()*80).toFixed(1)}%;--dx:${((R()-.5)*90).toFixed(0)}px;--dy:${((R()-.5)*70).toFixed(0)}px;--t:${(4+R()*5).toFixed(1)}s;--r:${(-R()*9).toFixed(1)}s"></span>`;
 document.getElementById('lu').innerHTML=lu;
}
let tmr;addEventListener('resize',()=>{clearTimeout(tmr);tmr=setTimeout(()=>{if(Math.abs(innerWidth-dim[0])>60||Math.abs(innerHeight-dim[1])>160)selva()},250)});

selva();
{
 const k=idx(location.hash);let guardado=null;try{guardado=localStorage.getItem('museos.modo')}catch(e){}
 if(k>=0&&L[M[k].id]){modo=guardado==='lineal'?'lineal':'libre';modo==='lineal'?lineal():libre();if(permitido(k))abrir(k)}
 else inicio();
}
