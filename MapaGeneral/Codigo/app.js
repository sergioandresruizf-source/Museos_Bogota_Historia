/* ===== MAPA DEL TESORO: ruta de museos con candados =====
   · PRUEBA = true muestra abajo el panel con acceso libre a cualquier museo. Pon false al terminar las pruebas:
     se oculta el panel y los enlaces directos (#museo) también respetan los candados.
   · El orden de la ruta es el orden del arreglo M (de arriba abajo en el mapa).
   · Cada museo trae: id, n (nombre completo), s (nombre corto), x/y (posición en el mapa de 600×1100),
     a (dirección), c (color), t (frase del recuadro) y e (estilo de conexión: 'portal' | 'moneda').
   · El avance se guarda en localStorage ('museos.avance'): 0 = solo el Nacional abierto … 8 = recorrido completo.
   · Un museo puede avisar que ya terminó con:  parent.postMessage('museo-completo','*')  y el mapa pasa solo al siguiente. */
const PRUEBA=true;

const M=[
{id:'nacional',n:'Museo Nacional de Colombia',s:'Museo Nacional',x:130,y:100,a:'Cra. 7 #28-66',c:'#7fb3d5',t:'Fundado en 1823, el museo más antiguo del país.'},
{id:'oro',n:'Museo del Oro',s:'Museo del Oro',x:455,y:215,a:'Cra. 6 #15-88',c:'#e8b64c',t:'Más de 30.000 piezas de orfebrería prehispánica.'},
{id:'mambo',n:'Museo de Arte Moderno de Bogotá',s:'MAMBO',x:140,y:330,a:'Calle 24 #6-00',c:'#e0838f',t:'Arte moderno y contemporáneo en un edificio de ladrillo.'},
{id:'florero',n:'Museo de la Independencia – Casa del Florero',s:'Museo de la Independencia',x:440,y:445,a:'Calle 11 #6-94',c:'#c9573f',t:'Donde se cuenta lo ocurrido el 20 de julio de 1810.'},
{id:'moneda',n:'Museo Casa de Moneda',s:'Casa de Moneda',x:138,y:560,a:'Calle 11 #4-93',c:'#e9ff6d',t:'Historia del dinero y de la acuñación de monedas en Colombia.',e:'moneda'},
{id:'botero',n:'Museo Botero',s:'Museo Botero',x:455,y:675,a:'Calle 11 #4-41',c:'#d9693f',t:'La donación de Fernando Botero, en una casa colonial restaurada.'},
{id:'antimuseo',n:'Antimuseo',s:'Antimuseo',x:140,y:790,a:'Ubicación por definir',c:'#b36bff',t:'Lo que los museos no quisieron mostrar. Cruza el portal.',e:'portal'},
{id:'minecraft',n:'Museo Minecraft',s:'Museo Minecraft',x:450,y:905,a:'Museo en Minecraft',c:'#8fbf7a',t:'Servidor con museo construido bloque a bloque.'},
];

const L={nacional:'../../MuseoNacional/juego/index.html',
        oro:'../../MuseoDelOro/Banco de Imágenes - Proyecto Quimbaya.html',
        mambo:'../../MuseoDeArteModerno/museo/index.html',
        florero:'../../MuseoDeLaIndependencia/index.html',
        moneda:'../../MuseoCasaDeMoneda/museo-de-la-moneda.html',
        botero:'../../MuseoDeBotero/index.html',
        antimuseo:'../../Antimuseo/index.html',
        minecraft:'../../MuseoMinecraft/index.html'};

/* ---------- estado ---------- */
const N=M.length,CH={x:300,y:985},P=[...M.map(m=>[m.x,m.y]),[336,1001]];
let avance=0;try{avance=Math.min(N,Math.max(0,parseInt(localStorage.getItem('museos.avance'),10)||0))}catch(e){}
const guardar=()=>{try{localStorage.setItem('museos.avance',avance)}catch(e){}};
/* vista de conexiones: 'auto' (cada museo trae la suya) | 'pin' | 'portal' | 'moneda' */
let modo='auto';try{modo=localStorage.getItem('museos.vista')||'auto'}catch(e){}
const est=m=>modo==='auto'?(m.e||'pin'):modo;
const nuevos=new Set();let cofre=false,aviso='',act=-1,svg,dyn;
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

/* ---------- visor: abre el museo dentro de la página, sin salir del mapa ---------- */
const ov=document.createElement('div');ov.id='mv';
ov.innerHTML='<button id="mvx" type="button">← Volver al mapa</button><button id="mvs" type="button"></button><iframe title="Museo" allow="autoplay; fullscreen"></iframe>';
document.body.appendChild(ov);
const fr=ov.querySelector('iframe'),sig=ov.querySelector('#mvs');
function abrir(i){
 act=i;const m=M[i];
 ov.className='';void ov.offsetWidth;ov.className='on fx-'+est(m);   // reinicia la animación de entrada
 fr.src=L[m.id];document.body.style.overflow='hidden';
 const j=prox(i);sig.textContent=j<N?'Siguiente: '+M[j].s+' →':'Terminar recorrido ✓';
 if(location.hash!=='#'+m.id)history.pushState(null,'','#'+m.id);
}
function cerrar(){
 ov.className='';fr.src='about:blank';document.body.style.overflow='';act=-1;
 if(location.hash)history.pushState(null,'',location.pathname+location.search);
 render();if(aviso){st(aviso);aviso=''}
 setTimeout(enfocar,60);
}
/* pasa al museo siguiente sin volver al mapa; si estaba en la parada actual, desbloquea la que sigue */
function siguiente(){
 if(act<0)return;
 const j=prox(act),viejo=avance,saltados=[];
 for(let k=act+1;k<j&&k<N;k++)saltados.push(M[k].s);
 if(act===avance){
  avance=j;for(let k=viejo+1;k<=Math.min(avance,N-1);k++)nuevos.add(k);
  if(j>=N)cofre=true;
  guardar();
 }
 aviso=saltados.length?saltados.join(', ')+': su grupo aún no ha agregado el enlace.':'';
 if(j>=N){
  aviso=avance>=N?'¡Llegaste al tesoro! Recorrido completo.':'Fin de la ruta (modo prueba: tu avance no cambió).';
  cerrar();return;
 }
 abrir(j);
}
ov.querySelector('#mvx').onclick=cerrar;
sig.onclick=siguiente;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.className)cerrar()});
/* un museo puede traer su propio enlace "Volver al mapa" (mapa.html): lo conectamos con el visor */
fr.onload=()=>{try{fr.contentDocument.querySelectorAll('a[href$="mapa.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();cerrar()}))}catch(e){}};
addEventListener('message',e=>{if(e.source===fr.contentWindow&&(e.data==='museo-completo'||(e.data&&e.data.tipo==='museo-completo')))siguiente()});
const permitido=k=>k>=0&&L[M[k].id]&&(PRUEBA||k<=avance);
addEventListener('popstate',()=>{const k=idx(location.hash);permitido(k)?abrir(k):cerrar()});

/* ---------- interacción con el mapa ---------- */
function entrar(i){const m=M[i];if(L[m.id]){st('');abrir(i)}else st(m.s+': su grupo aún no ha agregado el enlace.')}
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
const mk=(m,e)=>{
 if(e==='portal')return `<circle r="26" fill="#1b0b36"/><g transform="scale(2.1)"><circle class="pt2" r="12" fill="none" stroke="#b36bff" stroke-width="3" stroke-dasharray="16 9"/><circle class="pt1" r="8" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-dasharray="7 6"/><circle class="d pc" r="5.5" fill="#12002b"/></g>`;
 if(e==='moneda')return `<g transform="scale(2.7)"><g class="mo"><circle class="d mc" r="9" fill="#f2b705"/><text class="ms" y="4.5" text-anchor="middle">$</text></g></g>`;
 return `<circle class="d" r="25" fill="${m.c}"/><circle r="17" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`;
};
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
 const an=new Set(nuevos),cf=cofre;nuevos.clear();cofre=false;
 let s='';
 for(let i=0;i<N;i++)s+=`<path class="cam${i+1<=avance?' on':''}" d="${dTramo(i)}"/>`;
 s+=cofreSvg(avance>=N,cf);
 M.forEach((m,i)=>{
  const e=estado(i),ab=an.has(i),sts=e==='bloq'?', bloqueado':e==='hecho'?(L[m.id]?', visitado':', enlace pendiente'):', disponible';
  s+=`<g class="mk ${e}${ab?' abre':''}" data-i="${i}" transform="translate(${m.x} ${m.y})" tabindex="0" role="button" aria-label="${m.s}, parada ${i+1} de ${N}${sts}"${e==='bloq'?' aria-disabled="true"':''}>
  <circle class="hit" r="36"/><circle class="foco" r="33"/>${e==='actual'?'<circle class="pulso" r="26"/>':''}
  <g class="mkr">${e==='bloq'?roca:mk(m,est(m))}${ab?`<g class="cand">${roca}</g>`:''}</g>
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
function home(){
 app.innerHTML=`<header class="cartel"><h1>Ruta de los museos</h1><p>Ocho paradas, un solo recorrido. Cada candado se abre al terminar el museo anterior.</p><p id="prog" class="prog"></p><p id="st" role="status"></p></header>
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
 <div class="ctl"><label>Conexiones <select id="vm"><option value="auto">Por museo</option><option value="pin">Pines</option><option value="portal">Portales</option><option value="moneda">Monedas</option></select></label><button type="button" id="rs">Reiniciar recorrido</button></div></details>`:''}`;
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
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>entrar(+b.dataset.f));
  const vm=document.getElementById('vm');vm.value=modo;
  vm.onchange=()=>{modo=vm.value;try{localStorage.setItem('museos.vista',modo)}catch(e){}render()};
  document.getElementById('rs').onclick=()=>{avance=0;guardar();render();st('Recorrido reiniciado: solo el Museo Nacional está abierto.');enfocar()};
 }
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ajustar);
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
home();
{const k=idx(location.hash);if(permitido(k))abrir(k);else if(avance>0)setTimeout(enfocar,350)}
