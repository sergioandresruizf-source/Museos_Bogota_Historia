// Datos de cada museo: id, nombre, coordenadas (la, lo), dirección (a), color (c) y frase del recuadro (t).
// El contenido de cada museo (obras, historia) va en la página de su grupo, no aquí.
const M=[
{id:'oro',n:'Museo del Oro',la:4.6019,lo:-74.0720,a:'Cra. 6 #15-88',c:'#e8b64c',t:'Más de 30.000 piezas de orfebrería prehispánica.'},
{id:'botero',n:'Museo Botero',la:4.5968,lo:-74.0735,a:'Calle 11 #4-41',c:'#d9693f',t:'La donación de Fernando Botero, en una casa colonial restaurada.'},
{id:'florero',n:'Museo de la Independencia – Casa del Florero',la:4.5977,lo:-74.0757,a:'Calle 11 #6-94',c:'#c9573f',t:'Donde se cuenta lo ocurrido el 20 de julio de 1810.'},
{id:'nacional',n:'Museo Nacional de Colombia',la:4.6155,lo:-74.0678,a:'Cra. 7 #28-66',c:'#7fb3d5',t:'Fundado en 1823, el museo más antiguo del país.'},
{id:'mambo',n:'Museo de Arte Moderno de Bogotá',la:4.6124,lo:-74.0683,a:'Calle 24 #6-00',c:'#e0838f',t:'Arte moderno y contemporáneo en un edificio de ladrillo.'},
{id:'quinta',n:'Quinta de Bolívar',la:4.6024,lo:-74.0641,a:'Calle 20 #2-91 Este',c:'#8fbf7a',t:'La casa que Bogotá regaló a Simón Bolívar en 1820.'},
{id:'moneda',n:'Museo Casa de Moneda',la:4.5965,lo:-74.0729,a:'Calle 11 #4-93',c:'#e9ff6d',t:'Historia del dinero y de la acuñación de monedas en Colombia.',e:'moneda'},
{id:'antimuseo',n:'Antimuseo',la:4.6070,lo:-74.0720,a:'Ubicación por definir',c:'#b36bff',t:'Lo que los museos no quisieron mostrar. Cruza el portal.',e:'portal'},
];
/* ENLACES: cada grupo pega aquí la URL de su museo (https://...). Si queda vacío, el mapa avisa que falta. */
const L={oro:'',botero:'../../MuseoDeBotero/index.html',florero:'',nacional:'../../MuseoNacional/Codigo/index.html',mambo:'',quinta:'',moneda:'../../MuseoCasaDeMoneda/museo-de-la-moneda.html',antimuseo:'../../Antimuseo/index.html'};
const go=i=>{const u=L[M[i].id],s=document.getElementById('st');if(u){s.textContent='';abrir(i)}else s.textContent=M[i].n.split(' – ')[0]+': su grupo aún no ha agregado el enlace.'};
/* ===== VISTA DE CONEXIONES: 'pin' | 'portal' | 'moneda'. Cada museo trae su estilo en M (campo e); el selector del mapa puede forzar uno para todos ===== */
let modo='auto';try{modo=localStorage.getItem('museos.vista')||'auto'}catch(e){}
const est=m=>modo==='auto'?(m.e||'pin'):modo;
const mk=m=>{const s=est(m);
 if(s==='portal')return `<circle class="pt2" r="12" fill="none" stroke="#b36bff" stroke-width="3" stroke-dasharray="16 9"/><circle class="pt1" r="8" fill="none" stroke="#00e5ff" stroke-width="2.5" stroke-dasharray="7 6"/><circle class="d pc" r="5.5" fill="#12002b"/>`;
 if(s==='moneda')return `<g class="mo"><circle class="d mc" r="9" fill="#f2b705"/><text class="ms" y="4.5" text-anchor="middle">$</text></g>`;
 return `<circle class="d" r="7" fill="${m.c}"/>`};
/* ===== VISOR: abre el museo dentro del mapa (iframe), sin salir de esta página ===== */
const ov=document.createElement('div');ov.id='mv';ov.innerHTML='<button id="mvx" type="button">← Volver al mapa</button><iframe title="Museo" allow="autoplay; fullscreen"></iframe>';document.body.appendChild(ov);
const fr=ov.querySelector('iframe');
function abrir(i){const m=M[i];ov.className='on fx-'+est(m);fr.src=L[m.id];document.body.style.overflow='hidden';if(location.hash!=='#'+m.id)history.pushState(null,'','#'+m.id)}
function cerrar(){ov.className='';fr.src='about:blank';document.body.style.overflow='';if(location.hash)history.pushState(null,'',location.pathname+location.search)}
ov.querySelector('#mvx').onclick=cerrar;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.className)cerrar()});
/* si un museo trae su propio enlace "Volver al mapa" (mapa.html), lo conectamos con el visor */
fr.onload=()=>{try{fr.contentDocument.querySelectorAll('a[href$="mapa.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();cerrar()}))}catch(e){}};
window.addEventListener('popstate',()=>{const k=M.findIndex(m=>m.id===location.hash.slice(1));k>=0&&L[M[k].id]?abrir(k):cerrar()});
const P=(a,o)=>[322+(o+74.055)*1630,45+(4.82-a)*1630];
const app=document.getElementById('app');let svg,vb,raf;
function home(){
 app.innerHTML=`<div class="top"><h1>Museos de Bogotá</h1><p>Cada museo tiene dos caras: lo que se exhibe hoy y lo que fue retirado por razones sociales, políticas o culturales. Acerca el mapa y toca un museo para entrar a la página de su grupo.</p><p id="st" role="status" style="margin-top:.4rem;min-height:1.5em;color:#e8b64c"></p></div>
 <div class="home"><div class="mapw"><svg id="m" viewBox="0 0 468 656" style="--s:1" role="img" aria-label="Mapa estilizado de Bogotá con museos">
 <image href="../mapa.jpg" x="0" y="0" width="468" height="656" preserveAspectRatio="none"/>
 ${M.map((m,i)=>{const p=P(m.la,m.lo);return `<g class="mk" data-i="${i}" data-x="${p[0].toFixed(2)}" data-y="${p[1].toFixed(2)}" tabindex="0" role="link" aria-label="${m.n}"><circle class="hit" r="15"/>${mk(m)}<text class="l" x="11" y="4">${m.n.split(' – ')[0]}</text></g>`}).join('')}
 </svg><div id="tip" role="tooltip"></div><label class="vs">Conexiones <select id="vm"><option value="auto">Por museo</option><option value="pin">Pines</option><option value="portal">Portales</option><option value="moneda">Monedas</option></select></label><div class="zb"><button aria-label="Acercar" id="zi">+</button><button aria-label="Alejar" id="zo">−</button><button aria-label="Ver toda la ciudad" id="zr">⌂</button></div></div>
 <ul class="li">${M.map((m,i)=>`<li><button data-f="${i}">${m.n.split(' – ')[0]}<small>${m.a}</small></button><a href="${L[m.id]||'#'}" data-g="${i}">Visitar</a></li>`).join('')}</ul></div>`;
 svg=document.getElementById('m');vb=[0,0,468,656];
 const W0=document.querySelector('.mapw');let dr=null,moved=false;
 const pt=(x,y)=>{const q=svg.createSVGPoint();q.x=x;q.y=y;return q.matrixTransform(svg.getScreenCTM().inverse())};
 const zoom=(f,c)=>{const nw=Math.min(468,Math.max(24,vb[2]*f)),r=nw/vb[2];vb=[c.x-(c.x-vb[0])*r,c.y-(c.y-vb[1])*r,nw,nw*1.4017];set()};
 const ctr=()=>({x:vb[0]+vb[2]/2,y:vb[1]+vb[3]/2});
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.25:.8,pt(e.clientX,e.clientY))},{passive:false});
 svg.addEventListener('pointerdown',e=>{dr={x:e.clientX,y:e.clientY,v:vb.slice()};moved=false});
 svg.addEventListener('pointermove',e=>{if(!dr)return;const s=svg.getScreenCTM().a,dx=e.clientX-dr.x,dy=e.clientY-dr.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;if(moved){vb[0]=dr.v[0]-dx/s;vb[1]=dr.v[1]-dy/s;set()}});
 window.addEventListener('pointerup',()=>dr=null);
 svg.addEventListener('click',e=>{const g=e.target.closest('.mk');if(g&&!moved)go(g.dataset.i)});
 document.querySelectorAll('[data-g]').forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.g)});
 svg.addEventListener('keydown',e=>{const g=e.target.closest('.mk');if(g&&e.key==='Enter')go(g.dataset.i)});
 const tip=document.getElementById('tip');
 const showTip=g=>{const m=M[g.dataset.i],r=g.querySelector('.d').getBoundingClientRect(),w=W0.getBoundingClientRect();tip.innerHTML='<b>'+m.n+'</b>'+m.a+'<br>'+m.t+'<i>'+(L[m.id]?'Clic para entrar al museo':'Enlace pendiente de su grupo')+'</i>';tip.style.setProperty('--tc',m.c);tip.style.display='block';let x=r.left-w.left+r.width/2-tip.offsetWidth/2,y=r.top-w.top-tip.offsetHeight-10;if(y<4)y=r.bottom-w.top+10;x=Math.max(6,Math.min(x,w.width-tip.offsetWidth-6));tip.style.left=x+'px';tip.style.top=y+'px'};
 svg.addEventListener('pointerover',e=>{const g=e.target.closest('.mk');if(g&&e.pointerType!=='touch')showTip(g)});
 svg.addEventListener('pointerout',e=>{if(e.target.closest('.mk'))tip.style.display='none'});
 svg.addEventListener('focusin',e=>{const g=e.target.closest('.mk');if(g)showTip(g)});
 svg.addEventListener('focusout',()=>tip.style.display='none');
 document.getElementById('zi').onclick=()=>zoom(.6,ctr());document.getElementById('zo').onclick=()=>zoom(1.6,ctr());
 document.getElementById('zr').onclick=()=>fly([0,0,468,656]);
 const vm=document.getElementById('vm');vm.value=modo;vm.onchange=()=>{modo=vm.value;try{localStorage.setItem('museos.vista',modo)}catch(e){}svg.querySelectorAll('.mk').forEach(g=>{const m=M[g.dataset.i];g.querySelectorAll('circle:not(.hit),g.mo').forEach(n=>n.remove());g.querySelector('.hit').insertAdjacentHTML('afterend',mk(m))})};
 document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const m=M[b.dataset.f],p=P(m.la,m.lo);document.querySelectorAll('.mk').forEach(g=>g.classList.toggle('on',g.dataset.i===b.dataset.f));fly([p[0]-20,p[1]-28,40,56])});
 set();
}
function set(){vb[0]=Math.max(0,Math.min(vb[0],468-vb[2]));vb[1]=Math.max(0,Math.min(vb[1],656-vb[3]));svg.style.touchAction=vb[2]>=467?'pan-y':'none';svg.setAttribute('viewBox',vb.map(v=>v.toFixed(2)).join(' '));const tp=document.getElementById('tip');if(tp)tp.style.display='none';svg.classList.toggle('z',vb[2]<150);const s=vb[2]/468;svg.querySelectorAll('.mk').forEach(g=>g.setAttribute('transform','translate('+g.dataset.x+' '+g.dataset.y+') scale('+s+')'))}
function fly(t){cancelAnimationFrame(raf);const a=vb.slice();let k=0;(function f(){k+=.08;const u=Math.min(1,k),e=u*(2-u);vb=a.map((v,i)=>v+(t[i]-v)*e);set();if(u<1)raf=requestAnimationFrame(f)})()}
home();
{const k=M.findIndex(m=>m.id===location.hash.slice(1));if(k>=0&&L[M[k].id])abrir(k)}
 