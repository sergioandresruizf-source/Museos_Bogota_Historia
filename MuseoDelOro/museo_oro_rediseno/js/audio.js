/* Sonido del juego: efectos generados por código (no pesan nada) + música de fondo opcional */
const Sfx = (() => {
    let ac = null, muted = false, musica = null, musicaVol = 0.35, fadeT = null;

    function ctx() {
        if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
        if (ac && ac.state === 'suspended') ac.resume();
        return ac;
    }

    function tono(freq, dur, tipo = 'sine', vol = 0.12, delay = 0, slide = 0) {
        if (muted) return;
        const a = ctx(); if (!a) return;
        const t0 = a.currentTime + delay;
        const o = a.createOscillator(), g = a.createGain();
        o.type = tipo; o.frequency.setValueAtTime(freq, t0);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(a.destination);
        o.start(t0); o.stop(t0 + dur + 0.05);
    }

    function ruido(dur, vol = 0.1, delay = 0, filtro = 1800) {
        if (muted) return;
        const a = ctx(); if (!a) return;
        const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        s.buffer = buf; f.type = 'lowpass'; f.frequency.value = filtro; g.gain.value = vol;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + delay);
    }

    const efectos = {
        click: () => tono(520, 0.07, 'triangle', 0.08),
        ok: () => { tono(660, 0.12, 'triangle', 0.1); tono(880, 0.18, 'triangle', 0.1, 0.09); },
        gana: () => { [523, 659, 784, 1046].forEach((f, i) => tono(f, 0.22, 'triangle', 0.11, i * 0.1)); },
        mal: () => tono(180, 0.28, 'sawtooth', 0.09, 0, -90),
        alarma: () => { for (let i = 0; i < 4; i++) { tono(740, 0.12, 'square', 0.07, i * 0.22); tono(520, 0.1, 'square', 0.07, i * 0.22 + 0.11); } },
        pulir: () => ruido(0.12, 0.035, 0, 3500),
        martillo: () => { tono(210, 0.1, 'square', 0.1, 0, -120); ruido(0.08, 0.1, 0, 3000); },
        fuego: () => ruido(0.2, 0.05, 0, 900),
        rompe: () => { ruido(0.35, 0.18, 0, 4500); tono(120, 0.3, 'sawtooth', 0.1, 0, -60); },
        pin: () => { tono(900, 0.05, 'square', 0.07); tono(1300, 0.08, 'square', 0.06, 0.04); },
        paso: () => tono(110 + Math.random() * 30, 0.05, 'triangle', 0.03),
        coin: () => { tono(1200, 0.08, 'square', 0.06); tono(1600, 0.16, 'square', 0.06, 0.07); },
        simbolo: i => tono([392, 494, 587, 698][i % 4], 0.3, 'sine', 0.14)
    };

    function play(n, ...a) { try { if (efectos[n]) efectos[n](...a); } catch (e) { } }

    function musicaPlay(archivo, vol) {
        if (muted || !archivo) return;
        musicaStop(true);
        try {
            musica = new Audio('assets/audio/' + encodeURI(archivo));
            musica.loop = true; musica.volume = 0;
            musicaVol = vol || 0.35;
            const p = musica.play(); if (p && p.catch) p.catch(() => { musica = null; });
            fade(musicaVol);
        } catch (e) { musica = null; }
    }

    function fade(objetivo, fin) {
        clearInterval(fadeT);
        fadeT = setInterval(() => {
            if (!musica) { clearInterval(fadeT); return; }
            const d = objetivo - musica.volume;
            if (Math.abs(d) < 0.02) { musica.volume = Math.max(0, objetivo); clearInterval(fadeT); if (fin) fin(); return; }
            musica.volume = Math.max(0, Math.min(1, musica.volume + Math.sign(d) * 0.02));
        }, 60);
    }

    function musicaStop(rapido) {
        if (!musica) return;
        const m = musica;
        if (rapido) { try { m.pause(); } catch (e) { } musica = null; return; }
        fade(0, () => { try { m.pause(); } catch (e) { } if (musica === m) musica = null; });
    }

    // bajar la música mientras hay un minijuego y subirla al terminar
    function duck(sobre) { if (musica) fade(sobre ? musicaVol * 0.35 : musicaVol); }

    function toggleMute() {
        muted = !muted;
        if (muted) { if (musica) musica.pause(); }
        else if (musica) { musica.play().catch(() => { }); }
        return muted;
    }

    return { play, tono, musicaPlay, musicaStop, duck, toggleMute, get muted() { return muted; } };
})();
window.Sfx = Sfx;
