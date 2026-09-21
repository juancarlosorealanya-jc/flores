(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';

  /* ==========================================================
     TEXTOS  (cámbialos aquí si quieres)
  ========================================================== */
  const TEXTO_1 = 'CON MUCHO CARIÑO PARA TI MI AMORCITA, TE AMOOO';
  const TEXTO_2 = 'AUNQUE NO ESTAMOS JUNTOS HOY, TE ENVÍO ESTAS FLORES VIRTUALES';

  /* ==========================================================
     FONDO: estrellas + luciérnagas
  ========================================================== */
  const cv = $('#fondo');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, estrellas = [], luciernagas = [];

  function nuevaLuciernaga() {
    const amarilla = Math.random() < 0.6;
    return {
      x: Math.random() * W,
      y: H * (0.3 + Math.random() * 0.6),
      r: 1 + Math.random() * 1.8,
      fase: Math.random() * 6.28,
      vel: 0.2 + Math.random() * 0.5,
      deriva: (Math.random() - 0.5) * 0.4,
      color: amarilla ? '255,211,26' : '40,220,230'
    };
  }

  function ajustar() {
    const d = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    estrellas = Array.from({ length: Math.round((W * H) / 8000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.85,
      r: Math.random() * 1.1 + 0.3,
      f: Math.random() * 6.28,
      v: 0.5 + Math.random() * 1.5
    }));
    luciernagas = Array.from({ length: 28 }, nuevaLuciernaga);
  }

  function dibujarFondo(t) {
    ctx.clearRect(0, 0, W, H);
    const s = t / 1000;

    for (const e of estrellas) {
      const a = 0.25 + 0.5 * Math.abs(Math.sin(s * e.v + e.f));
      ctx.fillStyle = `rgba(90,230,235,${a * 0.7})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283); ctx.fill();
    }

    for (const l of luciernagas) {
      l.y -= l.vel * 0.35;
      l.x += Math.sin(s * l.vel + l.fase) * 0.35 + l.deriva * 0.2;
      if (l.y < -10) { l.y = H + 10; l.x = Math.random() * W; }
      const a = 0.35 + 0.65 * Math.abs(Math.sin(s * 1.3 + l.fase));
      ctx.shadowColor = `rgba(${l.color},1)`;
      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(${l.color},${a})`;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(dibujarFondo);
  }

  window.addEventListener('resize', ajustar);
  ajustar();
  requestAnimationFrame(dibujarFondo);

  /* ==========================================================
     JARDÍN: hojas, arbusto y pasto (generados en SVG)
  ========================================================== */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // Aleatorio con semilla: el jardín siempre se ve igual
  let semilla = 11;
  const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };

  // Hojas verdes sobre los tallos
  function hojaVerde(parent, x, y, rot, escala, retraso) {
    const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${escala})` }, parent);
    const p = el('path', {
      d: 'M0 0 C8 -13 30 -14 42 0 C30 13 8 12 0 0Z',
      fill: 'url(#gVerde)', class: 'hoja'
    }, g);
    p.style.setProperty('--d', retraso + 's');
    el('path', { d: 'M2 0 L36 0', stroke: 'rgba(200,255,200,.35)', 'stroke-width': 1, fill: 'none' }, g);
  }

  // ---------- 9 flores amarillas ----------
  const plantas = $('#plantas');
  const BASE_Y = 452;
  const FLORES = [
    { hx: 58,  hy: 292, s: 0.85, bx: 206 },
    { hx: 88,  hy: 352, s: 0.90, bx: 208 },
    { hx: 140, hy: 226, s: 0.95, bx: 210 },
    { hx: 142, hy: 292, s: 1.05, bx: 212 },
    { hx: 201, hy: 222, s: 1.15, bx: 214 },
    { hx: 262, hy: 200, s: 0.95, bx: 216 },
    { hx: 270, hy: 268, s: 1.05, bx: 218 },
    { hx: 318, hy: 356, s: 0.90, bx: 220 },
    { hx: 352, hy: 285, s: 0.85, bx: 222 }
  ].sort((p, q) => p.hy - q.hy);   // las más altas al fondo

  FLORES.forEach((f, i) => {
    const bx = f.bx, by = BASE_Y;
    const ex = f.hx, ey = f.hy + 16 * f.s;
    const dx = ex - bx, dy = by - ey;
    const c1 = { x: bx + dx * 0.08, y: by - dy * 0.38 };
    const c2 = { x: ex - dx * 0.28, y: ey + dy * 0.32 };
    const bez = (t) => {
      const u = 1 - t;
      return {
        x: u*u*u*bx + 3*u*u*t*c1.x + 3*u*t*t*c2.x + t*t*t*ex,
        y: u*u*u*by + 3*u*u*t*c1.y + 3*u*t*t*c2.y + t*t*t*ey
      };
    };
    const r1 = (n) => Math.round(n * 10) / 10;

    const planta = el('g', { class: 'planta' }, plantas);
    planta.style.setProperty('--m', (5 + rnd() * 2.5).toFixed(1) + 's');
    planta.style.animationDelay = '-' + (rnd() * 4).toFixed(1) + 's';

    // tallo
    const retraso = 0.3 + i * 0.25;
    const tallo = el('path', {
      class: 'tallo', pathLength: 1, fill: 'none',
      d: `M${bx} ${by} C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(ex)} ${r1(ey)}`,
      stroke: 'url(#gTallo)', 'stroke-width': (5 + f.s * 1.2).toFixed(1), 'stroke-linecap': 'round'
    }, planta);
    tallo.style.setProperty('--d', retraso.toFixed(2) + 's');

    // hojas a lo largo del tallo
    [0.42, 0.62, 0.8].forEach((t, k) => {
      if (k === 2 && f.hy > 300) return;
      const p = bez(t);
      const derecha = (i + k) % 2 === 0;
      hojaVerde(planta, r1(p.x), r1(p.y), derecha ? -35 + rnd() * 12 : -145 - rnd() * 12,
        0.75 + rnd() * 0.25, (retraso + t * 2 + 0.2).toFixed(2));
    });

    // cabeza de la flor (se inclina según el tallo)
    let rot = Math.atan2(ex - c2.x, -(ey - c2.y)) * 180 / Math.PI;
    rot = Math.max(-35, Math.min(35, rot));
    const gh = el('g', { transform: `translate(${f.hx} ${f.hy}) rotate(${r1(rot)}) scale(${f.s})` }, planta);
    const cab = el('g', { class: 'cabeza' }, gh);
    cab.style.setProperty('--d', (retraso + 1.9).toFixed(2) + 's');
    el('use', { href: '#flor' }, cab);
  });

  // Arbusto azul-turquesa de la base
  const arbusto = $('#arbusto');
  for (let i = 0; i < 36; i++) {
    const ang = -195 + rnd() * 210;
    const largo = 45 + rnd() * 70;
    const ox = 130 + rnd() * 160;
    const oy = 468 + rnd() * 45;
    const ancho = largo * (0.2 + rnd() * 0.12);
    const g = el('g', { transform: `translate(${ox.toFixed(1)} ${oy.toFixed(1)}) rotate(${ang.toFixed(1)})` }, arbusto);
    const p = el('path', {
      d: `M0 0 C${largo * .25} ${-ancho} ${largo * .8} ${-ancho} ${largo} 0 C${largo * .8} ${ancho} ${largo * .25} ${ancho} 0 0Z`,
      fill: `url(#gAzul${i % 3})`, class: 'hojaAzul'
    }, g);
    p.style.setProperty('--d', (1.6 + rnd() * 1.6).toFixed(2) + 's');
    el('path', { d: `M2 0 L${largo * .9} 0`, stroke: 'rgba(160,255,255,.22)', 'stroke-width': 1.2, fill: 'none' }, g);
  }

  // Pasto
  function pasto(grupo, x0, x1, n, hMin, hMax, oscuro) {
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0);
      const h = hMin + rnd() * (hMax - hMin);
      const lean = (rnd() - 0.5) * 70 * (h / 200 + 0.3);
      const w = 4 + rnd() * 4;
      const y = 535;
      const d =
        `M${x} ${y} C${x + lean * .1} ${y - h * .4} ${x + lean * .5} ${y - h * .75} ${x + lean} ${y - h} ` +
        `C${x + lean * .5 + w * .4} ${y - h * .7} ${x + w} ${y - h * .35} ${x + w} ${y}Z`;
      const p = el('path', { d, fill: oscuro || rnd() < 0.3 ? 'url(#gPasto2)' : 'url(#gPasto)', class: 'brizna' }, grupo);
      p.style.setProperty('--m', (3 + rnd() * 3).toFixed(1) + 's');
      p.style.setProperty('--r', '-' + (rnd() * 5).toFixed(1) + 's');
    }
  }
  const atras = $('#pastoAtras'), frente = $('#pastoFrente');
  pasto(atras, 0, 140, 22, 110, 300, true);
  pasto(atras, 270, 411, 22, 110, 280, true);
  pasto(frente, 0, 120, 14, 40, 200, false);
  pasto(frente, 290, 411, 14, 40, 190, false);
  pasto(frente, 0, 411, 26, 18, 70, false);

  /* ==========================================================
     MÚSICA
     - Si existe "musica(1).mp3" en esta carpeta, suena SOLO ese archivo.
     - Si no lo encuentra, suena una melodía suave de respaldo.
  ========================================================== */
  let musica = null; // { pausar(), seguir(), sonando }

  function musicaSintetizada() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ac = new AC();
    ac.resume();

    // volumen bajo + filtro que quita los agudos ásperos
    const master = ac.createGain(); master.gain.value = 0.16;
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass'; filtro.frequency.value = 1500; filtro.Q.value = 0.3;
    master.connect(filtro); filtro.connect(ac.destination);

    // eco corto y suave (sin acumulación)
    const eco = ac.createDelay(); eco.delayTime.value = 0.3;
    const fb = ac.createGain(); fb.gain.value = 0.15;
    const ecoVol = ac.createGain(); ecoVol.gain.value = 0.3;
    eco.connect(fb); fb.connect(eco); eco.connect(ecoVol); ecoVol.connect(master);

    const acordes = [
      [220.00, 261.63, 329.63, 440.00],   // La menor
      [174.61, 220.00, 261.63, 349.23],   // Fa
      [261.63, 329.63, 392.00, 523.25],   // Do
      [196.00, 246.94, 293.66, 392.00]    // Sol
    ];
    const patron = [0, 1, 2, 3, 2, 1, 2, 1];

    function nota(f, t, dur) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); g.connect(eco);
      o.start(t); o.stop(t + dur + 0.05);
    }

    let t = ac.currentTime + 0.1, paso = 0;
    function programar() {
      while (t < ac.currentTime + 1.5) {
        const acorde = acordes[Math.floor(paso / 8) % acordes.length];
        nota(acorde[patron[paso % 8]], t, 1.1);
        t += 0.5; paso++;
      }
    }
    programar();
    setInterval(programar, 500);

    return {
      sonando: true,
      pausar() { ac.suspend(); this.sonando = false; },
      seguir() { ac.resume(); this.sonando = true; }
    };
  }

  function iniciarMusica() {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.85;
    let usandoRespaldo = false;

    const respaldo = () => {
      if (usandoRespaldo || musica) return;
      usandoRespaldo = true;
      console.warn('No se encontró musica(1).mp3 en la carpeta: suena la melodía de respaldo.');
      musica = musicaSintetizada();
    };

    audio.addEventListener('error', respaldo);
    audio.src = 'musica.mp3';

    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        musica = {
          sonando: true,
          pausar() { audio.pause(); this.sonando = false; },
          seguir() { audio.play(); this.sonando = true; }
        };
      }).catch(respaldo);
    }
  }

  /* ==========================================================
     ENTRADA  →  FLORES
  ========================================================== */
  const entrada = $('#entrada');
  const flores = $('#flores');
  const btnPlay = $('#btnPlay');
  const barra = $('#barra');
  const tiempo = $('#tiempo');
  const btnSonido = $('#btnSonido');
  let iniciado = false;

  function escribir(nodo, texto, vel) {
    return new Promise((ok) => {
      let i = 0;
      const t = setInterval(() => {
        nodo.textContent = texto.slice(0, ++i);
        if (i >= texto.length) { clearInterval(t); ok(); }
      }, vel);
    });
  }

  function corazonesFlotantes() {
    const emojis = ['❤', '❤', '💖', '💛'];
    setInterval(() => {
      const c = document.createElement('span');
      c.className = 'flota';
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.fontSize = 12 + Math.random() * 20 + 'px';
      c.style.animationDuration = 6 + Math.random() * 5 + 's';
      c.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 12000);
    }, 700);
  }

  async function mostrarFlores() {
    entrada.classList.remove('activa');
    flores.classList.add('activa', 'crecer');

    await new Promise((r) => setTimeout(r, 1200));
    await escribir($('#txt1'), TEXTO_1, 65);
    $('#emojis').classList.add('ver');
    await new Promise((r) => setTimeout(r, 400));
    await escribir($('#txt2'), TEXTO_2, 40);
    corazonesFlotantes();
  }

  btnPlay.addEventListener('click', () => {
    if (iniciado) return;
    iniciado = true;

    btnPlay.classList.add('reproduciendo');
    document.querySelector('.clic').textContent = 'Reproduciendo…';
    iniciarMusica();

    // La barra del reproductor avanza 3 segundos y entra a las flores
    const dur = 3000, t0 = performance.now();
    (function paso(ahora) {
      const p = Math.min((ahora - t0) / dur, 1);
      barra.style.width = p * 100 + '%';
      tiempo.textContent = '0:0' + Math.floor(p * 3);
      if (p < 1) requestAnimationFrame(paso);
      else mostrarFlores();
    })(t0);
  });

  btnSonido.addEventListener('click', () => {
    if (!musica) return;
    if (musica.sonando) { musica.pausar(); btnSonido.textContent = '🔇'; }
    else { musica.seguir(); btnSonido.textContent = '🔊'; }
  });
})();
