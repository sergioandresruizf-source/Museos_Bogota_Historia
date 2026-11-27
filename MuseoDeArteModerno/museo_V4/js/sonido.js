// ===== SONIDO: efectos sintetizados con WebAudio (disparos, puertas, objetos, jefe...) =====
// No usa archivos: la música y el elevador siguen siendo los mp3 de la carpeta audio/.
const SONIDO = (() => {
  let ac = null, salida = null, ruidoB = null, silencio = false;
  function iniciar() {   // el navegador exige un primer clic/tecla
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try { ac = new AC(); } catch (e) { return; }
      salida = ac.createGain(); salida.gain.value = silencio ? 0 : CONFIG.volumenEfectos; salida.connect(ac.destination);
      ruidoB = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = ruidoB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
  }
  function silenciar(s) { silencio = s; if (salida) salida.gain.value = s ? 0 : CONFIG.volumenEfectos; }

  // piezas básicas: cada una se conecta a "dest" (con paneo y volumen según la distancia)
  function env(g, t, ata, dur, vol) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + ata);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function ruido(dest, t, dur, vol, filtro, f0, f1, q = 1) {
    const s = ac.createBufferSource(); s.buffer = ruidoB; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = filtro; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ac.createGain(); env(g, t, 0.004, dur, vol);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  function tono(dest, t, dur, vol, tipo, f0, f1, ata = 0.005) {
    const o = ac.createOscillator(); o.type = tipo;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
    const g = ac.createGain(); env(g, t, ata, dur, vol);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
  }
  const SON = {
    disparo(d, t) { ruido(d, t, .32, .9, 'lowpass', 5000, 300); tono(d, t, .22, .8, 'sine', 140, 40); ruido(d, t, .06, .5, 'highpass', 2000, 2000); },
    bombeo(d, t) { ruido(d, t + .05, .05, .35, 'bandpass', 2400, 1800, 4); ruido(d, t + .2, .06, .4, 'bandpass', 1500, 1200, 4); },
    recarga(d, t) { for (const k of [0, .3, .6]) ruido(d, t + k, .05, .3, 'bandpass', 3000, 2500, 5); ruido(d, t + 1.0, .08, .45, 'bandpass', 1600, 1100, 4); },
    vacio(d, t) { ruido(d, t, .03, .3, 'bandpass', 4000, 4000, 8); },
    puerta(d, t) { ruido(d, t, .7, .35, 'bandpass', 300, 900, 2); tono(d, t, .6, .12, 'sawtooth', 60, 90); },
    puertaCierra(d, t) { ruido(d, t, .6, .3, 'bandpass', 800, 250, 2); tono(d, t + .5, .12, .3, 'sine', 90, 50); },
    secreta(d, t) { ruido(d, t, 2.2, .5, 'lowpass', 220, 140, 3); tono(d, t, 2.1, .2, 'sawtooth', 42, 38, .3); ruido(d, t + 2, .3, .5, 'lowpass', 400, 80); },
    recoger(d, t) { tono(d, t, .07, .25, 'square', 880, 880); tono(d, t + .07, .1, .25, 'square', 1320, 1320); },
    arma(d, t) { tono(d, t, .1, .3, 'square', 440, 440); tono(d, t + .1, .1, .3, 'square', 660, 660); tono(d, t + .2, .18, .3, 'square', 880, 880); },
    despierta(d, t) { tono(d, t, 1.4, .5, 'sawtooth', 95, 48, .08); tono(d, t, 1.4, .3, 'square', 63, 40, .1); ruido(d, t, 1.2, .3, 'lowpass', 600, 150); },
    ataque(d, t) { ruido(d, t, .5, .5, 'bandpass', 400, 1800, 1.5); tono(d, t, .4, .25, 'sawtooth', 200, 520); },
    estallido(d, t) { ruido(d, t, .55, .8, 'lowpass', 2200, 90); tono(d, t, .35, .5, 'sine', 110, 35); },
    dolorJefe(d, t) { tono(d, t, .35, .45, 'sawtooth', 160, 70, .02); ruido(d, t, .25, .25, 'lowpass', 900, 300); },
    muerteJefe(d, t) { tono(d, t, 2.6, .6, 'sawtooth', 150, 28, .05); tono(d, t, 2.6, .4, 'square', 101, 22, .05); ruido(d, t + .4, 2.2, .7, 'lowpass', 1600, 60); },
    dolor(d, t) { tono(d, t, .22, .5, 'sawtooth', 220, 110, .01); ruido(d, t, .15, .3, 'lowpass', 1200, 400); },
    muerte(d, t) { tono(d, t, 1.1, .5, 'sawtooth', 260, 60, .02); ruido(d, t, .9, .3, 'lowpass', 1400, 200); },
    impacto(d, t) { ruido(d, t, .08, .25, 'bandpass', 2500, 900, 2); },
    secretoHallado(d, t) { [523, 659, 784, 1047].forEach((f, i) => tono(d, t + i * .09, .25, .2, 'triangle', f, f)); }
  };
  // reproduce un efecto; si se da la posición (x, y) suena más bajo lejos y hacia el lado correcto
  function sonar(nombre, pos) {
    if (!ac || silencio || !SON[nombre]) return;
    let dest = salida;
    if (pos && pos.jugador) {
      const j = pos.jugador, dx = pos.x - j.x, dy = pos.y - j.y, dist = Math.hypot(dx, dy);
      const g = ac.createGain(); g.gain.value = Math.max(.08, Math.min(1, 3 / (dist + 1.5)));
      if (ac.createStereoPanner) {
        const p = ac.createStereoPanner(), rel = Math.atan2(dy, dx) - j.a;
        p.pan.value = Math.max(-.9, Math.min(.9, Math.sin(rel))); g.connect(p); p.connect(salida);
      } else g.connect(salida);
      dest = g;
    }
    try { SON[nombre](dest, ac.currentTime + .01); } catch (e) { /* navegador sin alguna función de audio */ }
  }
  return { iniciar, silenciar, sonar };
})();
