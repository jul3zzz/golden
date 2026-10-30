'use strict';
/* GOLDEN — moteur : canvas, entrées, son, sauvegarde, petits outils d'interface */

const W = 960, H = 540;
const COL = {
  bg: '#060509', ink: '#ece8f4', dim: '#6d6579', gold: '#f2c14e', gold2: '#a07a24',
  red: '#ff2b3a', blood: '#5a0710', panel: 'rgba(11,9,15,.94)', line: 'rgba(242,193,78,.32)'
};
const FD = '"Grenze Gotisch", Georgia, serif';
const FU = '"Chakra Petch", "Segoe UI", system-ui, sans-serif';
const LEVELS = [];

const U = {
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  rnd: (a = 0, b = 1) => a + Math.random() * (b - a),
  ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: a => a[Math.floor(Math.random() * a.length)],
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  rr: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  inR: (px, py, x, y, w, h) => px >= x && px <= x + w && py >= y && py <= y + h,
  dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
  eo: t => 1 - Math.pow(1 - t, 3),
  circRect(cx, cy, r, b) {
    const nx = U.clamp(cx, b.x, b.x + b.w), ny = U.clamp(cy, b.y, b.y + b.h);
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  },
  distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    const t = l ? U.clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  },
  distPoly(px, py, pts) {
    let m = Infinity;
    for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, U.distSeg(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return m;
  },
  fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + 'h' : '') + String(m).padStart(h ? 2 : 1, '0') + 'min' + String(x).padStart(2, '0'); }
};

function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

/* ---------- état global + entrées ---------- */
const G = {
  cv: null, c: null, k: 1, t: 0, dt: 0, last: 0, down: {}, hit: {}, anyHit: false,
  mouse: { x: -999, y: -999, down: false, click: false, wheel: 0, type: 'mouse' },
  scene: null, next: null, fade: 1, shake: 0, flash: 0, flashCol: '#fff', hover: false, cursorNone: false, gp: null
};
G.go = s => { if (!G.next) G.next = s; };
G.touchUI = on => { const el = document.getElementById('touch'); if (el) el.classList.toggle('on', !!on); };

const K = {
  left: () => !!(G.down.ArrowLeft || G.down.KeyA),
  right: () => !!(G.down.ArrowRight || G.down.KeyD),
  jump: () => !!(G.down.Space || G.down.ArrowUp || G.down.KeyW),
  jumpHit: () => !!(G.hit.Space || G.hit.ArrowUp || G.hit.KeyW),
  actHit: () => !!(G.hit.KeyX || G.hit.KeyJ || G.hit.KeyK || G.hit.ShiftLeft || G.hit.ShiftRight),
  any: () => (G.anyHit && !G.hit.Escape) || G.mouse.click
};

const BLOCK_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);
addEventListener('keydown', e => {
  if (BLOCK_KEYS.has(e.code)) e.preventDefault();
  A.init();
  if (!e.repeat) { G.hit[e.code] = true; if (!/^(Shift|Control|Alt|Meta)/.test(e.code)) G.anyHit = true; else G.anyHit = G.anyHit || false; }
  G.down[e.code] = true;
});
addEventListener('keyup', e => { G.down[e.code] = false; });
addEventListener('blur', () => { G.down = {}; G.mouse.down = false; });

/* ---------- son (WebAudio, tout est synthétisé) ---------- */
const A = {
  ac: null, out: null, muted: false, dr: null, nb: null,
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ac = new AC();
      this.out = this.ac.createGain(); this.out.gain.value = .55;
      const comp = this.ac.createDynamicsCompressor();
      this.out.connect(comp); comp.connect(this.ac.destination);
      this.drone();
      if (S.d && S.d.muted) this.setMute(true);
    } catch (e) { this.ac = null; }
  },
  ok() { return !!this.ac && !this.muted; },
  setMute(m) {
    this.muted = m; if (S.d) { S.d.muted = m; S.save(); }
    if (this.out) this.out.gain.value = m ? 0 : .55;
    try { if (m) speechSynthesis.cancel(); } catch (e) { }
  },
  tone(f, d = .12, type = 'square', v = .1, f2 = 0, delay = 0) {
    if (!this.ok()) return;
    const ac = this.ac, t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + d + .05);
  },
  noise(d = .2, v = .2, f = 1200, delay = 0, type = 'lowpass') {
    if (!this.ok()) return;
    const ac = this.ac, t = ac.currentTime + delay;
    if (!this.nb) { const len = ac.sampleRate; this.nb = ac.createBuffer(1, len, ac.sampleRate); const ch = this.nb.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(); s.buffer = this.nb;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f;
    const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(this.out); s.start(t); s.stop(t + d + .05);
  },
  drone() {
    const ac = this.ac, g = ac.createGain(); g.gain.value = .045;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 4;
    [55, 55.6, 82.4].forEach((f, i) => { const o = ac.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'sine'; o.frequency.value = f; o.connect(lp); o.start(); });
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .07; lg.gain.value = 140;
    lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    lp.connect(g); g.connect(this.out); this.dr = g;
  },
  amb(v) { if (this.dr && this.ac) this.dr.gain.setTargetAtTime(v, this.ac.currentTime, .6); },
  click() { this.tone(720, .05, 'square', .04); },
  jump(m = 1) { this.tone(260 * m, .1, 'square', .03, 520 * m); },
  land() { this.tone(90, .08, 'sine', .1, 50); },
  step() { this.tone(70, .16, 'sine', .3, 32); this.noise(.09, .1, 260); },
  pant() { for (let i = 0; i < 4; i++) this.noise(.17, .16, 1600, i * .33, 'bandpass'); },
  die() { this.tone(200, .55, 'sawtooth', .12, 35); this.noise(.45, .25, 700); this.tone(55, .6, 'sine', .3, 30); },
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .22, 'triangle', .08, 0, i * .07)); },
  blip(f = 880) { this.tone(f, .06, 'square', .03); },
  zap() { this.tone(1400, .18, 'sawtooth', .045, 180); },
  warn() { this.tone(330, .12, 'square', .045); this.tone(330, .12, 'square', .045, 0, .18); },
  punch() { this.noise(.22, .5, 500); this.tone(130, .25, 'sine', .35, 40); },
  crack() { this.noise(.18, .25, 2200, 0, 'bandpass'); },
  boom() { this.tone(80, .6, 'sine', .45, 28); this.noise(.5, .35, 380); },
  bell() { this.tone(196, 1.6, 'sine', .08); this.tone(392.5, 1.2, 'sine', .03); },
  beat() { this.tone(70, .22, 'sine', .32, 38); },
  oi(text) {
    if (this.muted) return;
    for (let i = 0; i < 3; i++) this.tone(150, .16, 'sawtooth', .06, 95, i * .24);
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text || 'oï, oï, oï');
      u.lang = 'fr-FR'; u.pitch = .1; u.rate = .8;
      const v = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang)); if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { }
  }
};

/* ---------- sauvegarde ---------- */
const S = {
  key: 'golden-ragebait-v1', d: null,
  fresh() { return { unlocked: 1, phase: {}, deaths: 0, time: 0, lvDeaths: {}, done: {}, finished: false, muted: false, free: { un: 1, done: {}, last: 'jules' } }; },
  load() { try { this.d = JSON.parse(localStorage.getItem(this.key)); } catch (e) { this.d = null; } this.d = Object.assign(this.fresh(), this.d || {}); },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { } },
  reset() { const m = this.d.muted; this.d = this.fresh(); this.d.muted = m; this.save(); }
};

/* ---------- particules ---------- */
const P = {
  list: [],
  burst(x, y, n, col, spd = 200, life = .7, size = 3, g = 600) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = spd * (.3 + Math.random() * .7);
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * .3, life: life * (.6 + Math.random() * .6), max: life, col, size: size * (.6 + Math.random() * .8), g });
    }
  },
  pop(x, y, s, col = COL.gold, size = 18) { this.list.push({ x, y, vx: 0, vy: -45, life: 1.1, max: 1.1, txt: s, col, size, g: 0 }); },
  update(dt) { for (const p of this.list) { p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; } this.list = this.list.filter(p => p.life > 0); },
  draw(c) {
    for (const p of this.list) {
      const a = Math.max(0, Math.min(1, p.life / p.max * 1.4));
      if (p.txt) { txt(c, p.txt, p.x, p.y, { al: 'center', size: p.size, col: p.col, a, w: 700, glow: p.col }); continue; }
      c.globalAlpha = a; c.fillStyle = p.col; c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    c.globalAlpha = 1;
  }
};

/* ---------- texte + interface ---------- */
function txt(c, s, x, y, o = {}) {
  c.save();
  c.font = `${o.it ? 'italic ' : ''}${o.w || 600} ${o.size || 16}px ${o.f === 'd' ? FD : FU}`;
  c.textAlign = o.al || 'left'; c.textBaseline = o.bl || 'alphabetic';
  if (o.ls && 'letterSpacing' in c) c.letterSpacing = o.ls + 'px';
  c.globalAlpha *= (o.a == null ? 1 : o.a);
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = o.blur || 14; }
  if (o.stroke) { c.lineWidth = o.sw || 4; c.strokeStyle = o.stroke; c.lineJoin = 'round'; o.max ? c.strokeText(s, x, y, o.max) : c.strokeText(s, x, y); }
  c.fillStyle = o.col || COL.ink;
  o.max ? c.fillText(s, x, y, o.max) : c.fillText(s, x, y);
  c.restore();
}
function lines(c, s, maxW, o = {}) {
  c.save();
  c.font = `${o.it ? 'italic ' : ''}${o.w || 600} ${o.size || 16}px ${o.f === 'd' ? FD : FU}`;
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  c.restore();
  return out;
}
function wrap(c, s, x, y, maxW, lh, o = {}) {
  const ls = lines(c, s, maxW, o);
  ls.forEach((l, i) => txt(c, l, x, y + i * lh, o));
  return ls.length * lh;
}
function panel(c, x, y, w, h, o = {}) {
  const k = o.cut == null ? 8 : o.cut;
  c.save();
  c.beginPath();
  c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.lineTo(x + w, y + k); c.lineTo(x + w, y + h - k);
  c.lineTo(x + w - k, y + h); c.lineTo(x + k, y + h); c.lineTo(x, y + h - k); c.lineTo(x, y + k); c.closePath();
  c.fillStyle = o.fill || COL.panel; c.fill();
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = o.blur || 16; }
  c.strokeStyle = o.line || COL.line; c.lineWidth = o.lw || 1; c.stroke();
  c.restore();
}
/* bouton dessiné seulement (les clics sont gérés dans update) */
function drawBtn(c, x, y, w, h, label, o = {}) {
  const m = G.mouse, hov = !o.dis && U.inR(m.x, m.y, x, y, w, h);
  const ac = o.col || COL.gold;
  if (hov) G.hover = true;
  panel(c, x, y, w, h, { fill: o.fill || (hov ? hexA(ac, .16) : 'rgba(12,10,16,.94)'), line: hov ? ac : hexA(ac, o.dis ? .15 : .5), lw: hov ? 2 : 1, glow: hov ? ac : null, cut: o.cut });
  txt(c, label, x + w / 2, y + h / 2 + 1, { al: 'center', bl: 'middle', size: o.size || 18, col: o.tcol || (o.dis ? COL.dim : (hov ? '#fff' : COL.ink)), w: o.w || 600, f: o.f, max: w - 12 });
  return hov;
}
/* bouton qui agit (menus uniquement) */
function btn(c, x, y, w, h, label, o = {}) {
  const hov = drawBtn(c, x, y, w, h, label, o);
  if (hov && G.mouse.click) { G.mouse.click = false; A.click(); return true; }
  return false;
}
function clicked(x, y, w, h) {
  const m = G.mouse;
  if (m.click && U.inR(m.x, m.y, x, y, w, h)) { m.click = false; A.click(); return true; }
  return false;
}
function skull(c, x, y, s = 1, col = COL.red) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 8;
  c.beginPath(); c.arc(0, -2, 7, Math.PI, 0); c.lineTo(5, 4); c.lineTo(-5, 4); c.closePath(); c.fill();
  c.fillRect(-4, 4, 8, 3);
  c.fillStyle = '#060509'; c.shadowBlur = 0; c.beginPath(); c.arc(-2.7, -1.5, 2, 0, 7); c.arc(2.7, -1.5, 2, 0, 7); c.fill();
  c.restore();
}

/* ---------- effets plein écran ---------- */
let VIG = null;
function makeFX() {
  const gr = document.createElement('canvas'); gr.width = gr.height = 192;
  const g = gr.getContext('2d'), id = g.createImageData(192, 192);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  G.gp = G.c.createPattern(gr, 'repeat');
  VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H;
  const v = VIG.getContext('2d'), rg = v.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .98);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.8)');
  v.fillStyle = rg; v.fillRect(0, 0, W, H);
}

function fit() {
  const vw = innerWidth, vh = innerHeight;
  const s = Math.max(.2, Math.min((vw - 8) / W, (vh - 8) / H));
  G.cv.style.width = Math.floor(W * s) + 'px'; G.cv.style.height = Math.floor(H * s) + 'px';
  G.k = Math.min(2.5, s * (devicePixelRatio || 1));
  G.cv.width = Math.round(W * G.k); G.cv.height = Math.round(H * G.k);
}

function frame(ts) {
  requestAnimationFrame(frame);
  const now = ts / 1000;
  G.dt = Math.min(1 / 30, Math.max(0, now - (G.last || now))); G.last = now; G.t += G.dt;
  const c = G.c; c.setTransform(G.k, 0, 0, G.k, 0, 0);
  G.hover = false; G.cursorNone = false;
  if (G.next) {
    G.fade = Math.min(1, G.fade + G.dt * 5);
    if (G.fade >= 1) { G.scene && G.scene.exit && G.scene.exit(); G.scene = G.next; G.next = null; P.list = []; G.scene.enter && G.scene.enter(); }
  } else G.fade = Math.max(0, G.fade - G.dt * 3.5);
  const sc = G.scene;
  if (sc && !G.next) sc.update(G.dt);
  c.fillStyle = COL.bg; c.fillRect(0, 0, W, H);
  c.save();
  if (G.shake > 0) { c.translate((Math.random() - .5) * G.shake, (Math.random() - .5) * G.shake); G.shake = Math.max(0, G.shake - G.dt * 40); }
  sc && sc.draw(c);
  c.restore();
  c.drawImage(VIG, 0, 0, W, H);
  c.save(); c.globalAlpha = .05; c.fillStyle = G.gp; const ox = Math.random() * 192 | 0, oy = Math.random() * 192 | 0; c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
  if (G.flash > 0) { c.globalAlpha = Math.min(.6, G.flash); c.fillStyle = G.flashCol; c.fillRect(0, 0, W, H); c.globalAlpha = 1; G.flash -= G.dt * 2.5; }
  if (G.fade > 0) { c.globalAlpha = G.fade; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  G.cv.style.cursor = G.cursorNone ? 'none' : (G.hover ? 'pointer' : 'default');
  G.hit = {}; G.anyHit = false; G.mouse.click = false; G.mouse.wheel = 0;
}

G.boot = first => {
  S.load();
  G.cv = document.getElementById('cv'); G.c = G.cv.getContext('2d');
  makeFX(); fit(); addEventListener('resize', fit);
  const cv = G.cv;
  const ptr = e => { const r = cv.getBoundingClientRect(); G.mouse.x = (e.clientX - r.left) / r.width * W; G.mouse.y = (e.clientY - r.top) / r.height * H; G.mouse.type = e.pointerType; };
  cv.addEventListener('pointermove', ptr);
  cv.addEventListener('pointerdown', e => { ptr(e); A.init(); G.mouse.down = true; G.mouse.click = true; try { cv.setPointerCapture(e.pointerId); } catch (_) { } });
  addEventListener('pointerup', () => { G.mouse.down = false; });
  cv.addEventListener('pointerleave', () => { if (!G.mouse.down) { G.mouse.x = -999; G.mouse.y = -999; } });
  cv.addEventListener('wheel', e => { G.mouse.wheel += e.deltaY; e.preventDefault(); }, { passive: false });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  document.querySelectorAll('#touch [data-k]').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); A.init(); G.down[k] = true; G.hit[k] = true; G.anyHit = true; };
    const off = e => { e.preventDefault(); G.down[k] = false; };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
  });
  try { speechSynthesis.getVoices(); } catch (e) { }
  G.scene = first; first.enter && first.enter();
  requestAnimationFrame(frame);
};
