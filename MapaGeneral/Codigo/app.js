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
{id:'nacional',n:'Museo Nacional de Colombia',s:'Museo Nacional',x:130,y:100,a:'Cra. 7 #28-66',c:'#7fb3d5',t:'Fundado en 1823, el museo más antiguo del país.'},
{id:'oro',n:'Museo del Oro',s:'Museo del Oro',x:455,y:215,a:'Cra. 6 #15-88',c:'#e8b64c',t:'Más de 30.000 piezas de orfebrería prehispánica.'},
{id:'mambo',n:'Museo de Arte Moderno de Bogotá',s:'MAMBO',x:140,y:330,a:'Calle 24 #6-00',c:'#e0838f',t:'Arte moderno y contemporáneo en un edificio de ladrillo.'},
{id:'florero',n:'Museo de la Independencia – Casa del Florero',s:'Museo de la Independencia',x:440,y:445,a:'Calle 11 #6-94',c:'#c9573f',t:'Donde se cuenta lo ocurrido el 20 de julio de 1810.'},
{id:'moneda',n:'Museo Casa de Moneda',s:'Casa de Moneda',x:138,y:560,a:'Calle 11 #4-93',c:'#e9ff6d',t:'Historia del dinero y de la acuñación de monedas en Colombia.'},
{id:'botero',n:'Museo Botero',s:'Museo Botero',x:455,y:675,a:'Calle 11 #4-41',c:'#d9693f',t:'La donación de Fernando Botero, en una casa colonial restaurada.'},
{id:'antimuseo',n:'Antimuseo',s:'Antimuseo',x:140,y:790,a:'Ubicación por definir',c:'#b36bff',t:'Lo que los museos no quisieron mostrar. Cruza el portal.'},
{id:'minecraft',n:'Museo Minecraft',s:'Museo Minecraft',x:450,y:905,a:'Museo en Minecraft',c:'#8fbf7a',t:'Servidor con museo construido bloque a bloque.'},
];

const L={nacional:'../../MuseoNacional/juego/index.html',
        oro:'../../MuseoDelOro/galeriaInteractiva/index.html',
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
const tramo=i=>{const a=P[i],b=P[i+1],dir=Math.sign(b[0]-a[0])||1,k=i===N-1?110:170;return[a,[a[0]+dir*k,a[1]],[b[0]-dir*k,b[1]],b]};
const dTramo=i=>{const[a,c1,c2,b]=tramo(i);return `M${a}C${c1} ${c2} ${b}`};
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
 abrir(j,desdePanel);
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
const roca=`<circle class="roca" r="26"/><g><rect x="-9" y="-3" width="18" height="14" rx="3" fill="#3d3a30"/><path d="M-6 -3V-8a6 6 0 0 1 12 0V-3" fill="none" stroke="#3d3a30" stroke-width="3.5" stroke-linecap="round"/><circle cy="4" r="2" fill="#a9a592"/></g>`;
const mk=m=>`<circle class="d" r="25" fill="${m.c}"/><circle r="17" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`;
const check=`<circle cx="19" cy="19" r="10" fill="#3f8a3f" stroke="#fff" stroke-width="2"/><path d="M14.5 19l3.5 3.5 6-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const cofreSvg=(abierto,nuevo)=>`<g class="cofre${abierto?' abierto':''}${nuevo?' nuevo':''}" transform="translate(${CH.x} ${CH.y})"><title>${abierto?'Tesoro encontrado':'El tesoro'}</title>
<path class="equis" d="M-17 42L17 68M17 42L-17 68"/>
<circle class="brillo" cy="-6" r="62" fill="url(#glow)"/>
<g class="monedas"><circle cx="-12" cy="-4" r="7"/><circle cx="2" cy="-9" r="7"/><circle cx="14" cy="-3" r="7"/></g>
<rect class="cu" x="-32" y="0" width="64" height="34" rx="4"/><rect class="ba" x="-21" y="0" width="9" height="34"/><rect class="ba" x="12" y="0" width="9" height="34"/><rect class="ba" x="-6" y="10" width="12" height="14" rx="2"/>
<g class="tapa"><path class="cu" d="M-32 0Q-32 -30 0 -30Q32 -30 32 0Z"/><path class="ba" d="M-21 -4Q-21 -25 -17 -27L-12 -27L-12 -1ZM21 -4Q21 -25 17 -27L12 -27L12 -1Z"/></g></g>`;

/* terreno fijo del mapa: río, montañas y árboles repartidos esquivando la ruta y los rótulos */
function terreno(){
 const R=rnd(7),ruta=[],rio=[];
 for(let i=0;i<N;i++){const[a,c1,c2,b]=tramo(i);for(let t=0;t<=1.001;t+=.04)ruta.push([bz(a[0],c1[0],c2[0],b[0],t),bz(a[1],c1[1],c2[1],b[1],t)])}
 RIO.forEach(r=>{for(let t=0;t<=1.001;t+=.05)rio.push([bz(r[0],r[2],r[4],r[6],t),bz(r[1],r[3],r[5],r[7],t)])});
 const cerca=(a,x,y,d)=>a.some(p=>Math.hypot(p[0]-x,p[1]-y)<d);
 const libre=(x,y,dr,dw,pad)=>x>55&&x<545&&y>55&&y<1055
  &&!cerca(ruta,x,y,dr)&&!cerca(rio,x,y,dw)
  &&!M.some(m=>Math.abs(x-m.x)<135+pad&&y>m.y-45-pad&&y<m.y+104+pad)   // rótulos de las paradas
  &&Math.hypot(x-CH.x,y-CH.y)>=85+pad                                   // cofre
  &&Math.hypot(x-88,y-1022)>=62+pad;                                    // brújula
 const mont=[],arb=[];
 for(let n=0;n<600&&mont.length<4;n++){const x=110+R()*380,y=100+R()*940;if(libre(x,y,78,48,30)&&!mont.some(q=>Math.hypot(q[0]-x,q[1]-y)<170))mont.push([x,y,.85+R()*.4])}
 for(let n=0;n<3000&&arb.length<85;n++){const x=60+R()*480,y=70+R()*980;if(libre(x,y,46,28,0)&&!arb.some(q=>Math.hypot(q[0]-x,q[1]-y)<30)&&!mont.some(q=>Math.hypot(q[0]-x,q[1]-y)<75))arb.push([x,y,.8+R()*.45])}
 arb.sort((a,b)=>a[1]-b[1]);
 const rd='M'+RIO[0][0]+' '+RIO[0][1]+RIO.map(r=>`C${r[2]} ${r[3]} ${r[4]} ${r[5]} ${r[6]} ${r[7]}`).join('');
 let s=`<path class="rio-b" d="${rd}"/><path class="rio" d="${rd}"/>`;
 mont.forEach(([x,y,k])=>s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})"><path class="mt" d="M-40 0L-12 -46L4 -22L20 -52L52 0Z"/><path class="mt2" d="M20 -52L52 0L16 0L26 -26ZM-12 -46L4 -22L-4 0L-22 0Z"/><path class="tr-l" d="M-30 -8L-22 -12M-14 -4L-6 -9M30 -10L38 -6"/></g>`);
 arb.forEach(([x,y,k])=>s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})"><path class="tk" d="M0 2V-9"/><circle class="cp" cx="-7" cy="-11" r="7"/><circle class="cp" cx="7" cy="-11" r="7"/><circle class="cp" cy="-17" r="9"/></g>`);
 s+=`<g transform="translate(88 1022)"><circle class="br" r="37"/><circle class="br" r="29" stroke-dasharray="3 4"/><path class="rs" d="M0-46L7-7L0 0L-7-7Z"/><path class="rs2" d="M0 46L7 7L0 0L-7 7ZM46 0L7-7L0 0L7 7ZM-46 0L-7-7L0 0L-7 7Z"/><text class="nn" y="-52" text-anchor="middle">N</text></g>`;
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
  <circle class="hit" r="36"/><circle class="foco" r="33"/>${e==='actual'?'<circle class="pulso" r="26"/>':''}
  <g class="mkr">${e==='bloq'?roca:mk(m)}${ab?`<g class="cand">${roca}</g>`:''}</g>
  <g class="nb"><circle cx="-22" cy="-22" r="11.5"/><text x="-22" y="-16.7" text-anchor="middle">${i+1}</text></g>
  ${e==='hecho'&&L[m.id]?check:''}
  <g class="pl" transform="translate(0 56)"><rect x="-70" y="-21" width="140" height="36" rx="7"/><text y="6" text-anchor="middle">${m.s}</text></g></g>`;
 });
 dyn.innerHTML=s;ajustar();
 const pg=document.getElementById('prog');
 if(pg)pg.textContent=avance>=N?'Recorrido completo: tesoro encontrado':`Parada ${avance+1} de ${N}: ${M[avance].s}`;
}
function ajustar(){   // el rótulo se ajusta al ancho real del texto
 try{svg.querySelectorAll('.pl').forEach(g=>{const b=g.querySelector('text').getBBox(),r=g.querySelector('rect');r.setAttribute('x',(b.x-14).toFixed(1));r.setAttribute('width',(b.width+28).toFixed(1))})}catch(e){}
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
const medalla=(m)=>`<svg class="med" viewBox="-60 -60 120 120" aria-hidden="true"><defs><clipPath id="cl-${m.id}"><circle r="41"/></clipPath></defs><circle class="mr" r="56"/><circle class="md" r="47"/>${m.logo?`<image href="${m.logo}" x="-41" y="-41" width="82" height="82" clip-path="url(#cl-${m.id})" preserveAspectRatio="xMidYMid slice"/>`:`<g class="emb">${EMB[m.id]||''}</g>`}</svg>`;

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
  <radialGradient id="perg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#f1e2b6"/><stop offset=".7" stop-color="#e3cd96"/><stop offset="1" stop-color="#c9a965"/></radialGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffe58a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd24a" stop-opacity="0"/></radialGradient>
 </defs>
 <g filter="url(#rough)"><rect x="16" y="16" width="568" height="1068" fill="url(#perg)"/><rect x="16" y="16" width="568" height="1068" filter="url(#fibra)" opacity=".5"/>
  <ellipse cx="460" cy="160" rx="90" ry="60" fill="#8a5f22" opacity=".1"/><ellipse cx="120" cy="690" rx="80" ry="110" fill="#8a5f22" opacity=".09"/><ellipse cx="420" cy="880" rx="110" ry="70" fill="#8a5f22" opacity=".1"/>
  <rect x="42" y="42" width="516" height="1016" fill="none" stroke="#5b3a14" stroke-width="20" opacity=".6" filter="url(#suave)"/></g>
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
