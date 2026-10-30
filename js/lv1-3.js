'use strict';
/* GOLDEN — niveaux 1 à 3 */

/* =========================================================
   NIVEAU 1 — JULES — Le Poids du Roi (plateformes piégées)
   ========================================================= */
class Dripper {
  constructor() { this.t = .3; this.drips = []; }
  update(dt, w) {
    this.t -= dt;
    const inv = w.blocks.filter(b => b.k === 'invis' && b.on);
    if (this.t <= 0 && inv.length) { this.t = .55; const b = U.pick(inv); this.drips.push({ x: b.x + U.rnd(8, b.w - 8), y: 30, b }); }
    for (const d of this.drips) {
      d.y += 560 * dt;
      if (d.y >= d.b.y) { d.b.rev = 1.5; d.done = true; P.burst(d.x, d.b.y, 6, '#c08a3a', 90, .4, 2); }
    }
    this.drips = this.drips.filter(d => !d.done);
  }
  draw(c) {
    c.save(); c.fillStyle = '#c08a3a'; c.shadowColor = COL.gold; c.shadowBlur = 8;
    for (const d of this.drips) { c.beginPath(); c.moveTo(d.x, d.y - 9); c.quadraticCurveTo(d.x + 4, d.y - 2, d.x, d.y); c.quadraticCurveTo(d.x - 4, d.y - 2, d.x, d.y - 9); c.fill(); }
    c.restore();
  }
}
function drawFlag(c, x, y, t) {
  c.save(); c.strokeStyle = '#efeaf7'; c.lineWidth = 2; seg(c, x, y, x, y - 56);
  c.fillStyle = '#3dff7a'; c.shadowColor = '#3dff7a'; c.shadowBlur = 10;
  c.beginPath(); c.moveTo(x, y - 56); c.lineTo(x + 26 + Math.sin(t * 6) * 2, y - 49); c.lineTo(x, y - 42); c.closePath(); c.fill();
  c.restore();
  txt(c, 'CHECKPOINT', x + 2, y - 64, { al: 'center', size: 10, col: '#3dff7a', w: 700, ls: 1 });
}

LEVELS.push({
  id: 1, host: 'jules', title: 'Le Poids du Roi', sub: 'Plateformes piégées',
  quote: "J'suis pas gros. C'est le sol qui est faible.",
  controls: '← → ou Q D : bouger  ·  Espace, Z ou ↑ : sauter (maintiens pour sauter plus haut)',
  freed: 'Jules est libéré. Le sol, lui, ne s\'en remettra pas.',
  taunts: ['Le sol a cédé. Comme ta dignité.', 'Jules a cassé le sol. Le sol a gagné.', 'Une porte, ça bouge. Tout le monde sait ça.'],
  phases: [
    {
      name: 'Le Couloir', proph: 'Tu vas courir tout droit vers la porte. Tu ne devrais pas.',
      tip: 'Jules est lent. S\'il court plus de 4 secondes d\'affilée, il s\'essouffle et s\'arrête net. Les gouttes de sueur préviennent.',
      make: L => platPhase({
        char: 'jules', start: [60, 460],
        blocks: [Bk(0, 460, 700, 80), Bk(700, 460, 100, 80, 'fake'), Bk(800, 460, 160, 80)],
        spikes: [Sp(388, 460, 32, 'up', { hidden: true })],
        exit: [890, 460],
        triggers: [
          { x: 300, y: 0, w: 8, h: 540, fn: w => w.popSpike(w.spikes[0]) },
          { x: 838, y: 0, w: 10, h: 540, fn: w => { w.moveExit(60, 460); L.say('Une porte, ça bouge. Tout le monde sait ça.'); } }
        ]
      })
    },
    {
      name: 'Le Café Tombe', proph: 'Tu vas voir un checkpoint. Tu vas le toucher. Tout le monde le touche.',
      tip: 'Les plateformes fragiles cèdent vite sous le poids de Jules : ne t\'arrête pas dessus.',
      make: L => platPhase({
        char: 'jules', start: [50, 460],
        blocks: [Bk(0, 460, 150, 80), Bk(205, 420, 80, 16, 'fragile'), Bk(335, 390, 80, 16, 'fragile'), Bk(465, 410, 80, 16, 'fragile'), Bk(600, 460, 360, 80)],
        spikes: [Sp(150, 540, 450, 'up')],
        exit: [925, 460],
        triggers: [
          { x: 612, y: 0, w: 8, h: 540, fn: w => { w.ents.push(new Faller(762, -90, 74, 62)); L.say('Attention à la tête.', 1.6); } },
          { x: 843, y: 404, w: 10, h: 56, fn: w => w.kill('flag') }
        ],
        over: (c, w) => w.withCam(c, () => drawFlag(c, 848, 460, w.t))
      })
    },
    {
      name: 'Le Sol Menteur', proph: 'Tu vas faire confiance à ce que tu vois. Erreur classique.',
      tip: 'Le café qui goutte du plafond révèle ce qui est invisible.',
      make: L => platPhase({
        char: 'jules', start: [50, 460],
        blocks: [Bk(0, 460, 140, 80), Bk(200, 430, 70, 14, 'invis'), Bk(320, 400, 70, 14, 'invis'), Bk(440, 380, 70, 14, 'invis'),
          Bk(560, 440, 60, 14, 'invis'), Bk(570, 330, 80, 16, 'fake'), Bk(690, 410, 70, 14, 'invis'), Bk(800, 430, 60, 14, 'invis'), Bk(880, 460, 80, 80)],
        spikes: [Sp(140, 540, 740, 'up')],
        exit: [925, 460],
        init: w => w.ents.push(new Dripper())
      })
    },
    {
      name: 'La Vraie Porte', proph: 'Tu vas monter. Tu vas toucher la porte. Tu vas comprendre trop tard.',
      make: L => {
        const spawn = Bk(0, 460, 130, 80);
        const stairs = [Bk(400, 400, 80, 14), Bk(520, 340, 80, 14), Bk(640, 280, 80, 14), Bk(760, 220, 200, 14)];
        const sp = Sp(250, 460, 64, 'up', { hidden: true });
        return platPhase({
          char: 'jules', start: [60, 460], blocks: [spawn, Bk(130, 460, 830, 80), ...stairs], spikes: [sp],
          exit: [905, 220], exitFake: true,
          onFake: w => {
            A.oi(); G.shake = 10;
            L.say('oi oi oi. La vraie porte était sous tes pieds depuis le début.', 3.6);
            stairs.forEach(b => w.crumble(b));
            w.crumble(spawn); w.popSpike(sp);
            w.decoDoors.push(w.exit);
            w.exit = { x: 65, y: 540, w: 120, h: 56, fake: false, tx: null, ty: null };
          }
        });
      }
    }
  ]
});

/* =========================================================
   NIVEAU 2 — NONE — L'Afro de Sisyphe (vol à un bouton)
   ========================================================= */
function flightPhase(cfg) {
  return L => ({
    init() {
      this.y = 270; this.vy = 0; this.x = 220; this.af = 13; this.pil = []; this.spawn = .9; this.pass = 0; this.t = 0;
      this.gs = 1; this.flipT = cfg.flip || 0; this.warned = false; this.las = []; this.lasT = 2.4; this.hist = [];
      this.gap = cfg.gap + (L.pity ? 30 : 0); this.scroll = 0; this.started = false;
    },
    rad() { return this.af * .82 + 4; },
    update(dt) {
      this.t += dt; this.scroll += cfg.spd * dt;
      if (K.jumpHit() || G.mouse.click) { G.mouse.click = false; this.vy = -430 * this.gs; this.started = true; A.jump(.8); P.burst(this.x - 4, this.y + 30 * this.gs, 4, '#b57bff', 80, .4, 2); }
      if (!this.started) { this.y = 270 + Math.sin(this.t * 3) * 8; return; }
      this.vy += 1350 * this.gs * dt; this.vy = U.clamp(this.vy, -700, 700); this.y += this.vy * dt;
      this.hist.push(this.y); if (this.hist.length > 60) this.hist.shift();
      if (cfg.flip) {
        this.flipT -= dt;
        if (this.flipT < 1.1 && !this.warned) { this.warned = true; A.warn(); }
        if (this.flipT <= 0) { this.gs *= -1; this.flipT = cfg.flip; this.warned = false; G.flash = .2; G.flashCol = '#b57bff'; this.vy *= .3; }
      }
      this.spawn -= dt;
      if (this.spawn <= 0 && this.pass + this.pil.length < cfg.need) {
        this.spawn = cfg.every;
        const m = this.gap / 2 + 50;
        this.pil.push({ x: W + 40, gy: U.rnd(m, H - m), mv: cfg.move ? U.rnd(40, 80) * (Math.random() < .5 ? -1 : 1) : 0, ph: U.rnd(0, 6) });
      }
      for (const p of this.pil) {
        p.x -= cfg.spd * dt;
        p.cy = p.gy + (p.mv ? Math.sin(this.t * 1.5 + p.ph) * p.mv : 0);
        if (!p.passed && p.x + 70 < this.x) {
          p.passed = true; this.pass++; this.af += cfg.grow; A.blip(660 + this.pass * 12);
          if (this.pass === 5) L.say("Ton afro grossit à chaque pilier. Je l'avais prévu.", 2.6);
          if (this.pass >= cfg.need) return L.win();
        }
      }
      this.pil = this.pil.filter(p => p.x > -100);
      const r = this.rad();
      if (this.y - r < 32 || this.y + r > H) return L.die(this.y < 100 ? "Le plafond aussi, c'est un mur." : 'Le sol était là depuis le début.');
      for (const p of this.pil) {
        const top = { x: p.x, y: -10, w: 70, h: p.cy - this.gap / 2 + 10 }, bot = { x: p.x, y: p.cy + this.gap / 2, w: 70, h: H };
        if (U.circRect(this.x, this.y, r, top) || U.circRect(this.x, this.y, r, bot)) return L.die("L'afro a touché un pilier. L'afro est trop grande.");
      }
      if (cfg.laser) {
        this.lasT -= dt;
        if (this.lasT <= 0) {
          this.lasT = L.pity ? 3.3 : 2.5;
          const avg = this.hist.reduce((a, b) => a + b, 0) / this.hist.length;
          const py = U.clamp(.55 * avg + .45 * (this.y + this.vy * .35), 50, H - 30);
          this.las.push({ y: py, t: 0 }); A.warn();
        }
        for (const l of this.las) {
          l.t += dt;
          if (l.t > .85 && l.t < 1.1) {
            if (!l.fired) { l.fired = true; A.zap(); G.shake = 6; }
            if (Math.abs(this.y - l.y) < r + 4) return L.die('Golden a tiré là où tu allais être. Évidemment.');
          }
        }
        this.las = this.las.filter(l => l.t < 1.25);
      }
    },
    draw(c) {
      c.fillStyle = '#08060d'; c.fillRect(0, 0, W, H);
      c.save(); c.translate(-(this.scroll * .3 % 160), 0);
      for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(181,123,255,.05)'; c.fillRect(i * 160, 0, 2, H); }
      c.restore();
      txt(c, 'oi oi oi', W - ((this.scroll * .5) % (W + 300)), 300, { size: 120, f: 'd', col: 'rgba(242,193,78,.035)', w: 900 });
      for (const p of this.pil) {
        for (const [y0, y1] of [[-10, p.cy - this.gap / 2], [p.cy + this.gap / 2, H + 10]]) {
          c.fillStyle = '#100d16'; c.fillRect(p.x, y0, 70, y1 - y0);
          c.fillStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 10;
          c.fillRect(p.x, y0, 2, y1 - y0); c.fillRect(p.x + 68, y0, 2, y1 - y0);
          c.fillRect(p.x - 4, y0 < 0 ? y1 - 6 : y0, 78, 6); c.shadowBlur = 0;
        }
      }
      if (cfg.laser) {
        drawStick(c, 'golden', W - 40, 120, { s: 1.4, t: this.t, face: -1, noCape: true });
        for (const l of this.las) {
          if (l.t < .85) { c.save(); c.setLineDash([10, 8]); c.strokeStyle = `rgba(255,43,58,${.4 + .4 * Math.sin(l.t * 30)})`; c.lineWidth = 2; seg(c, 0, l.y, W, l.y); c.restore(); txt(c, 'PRÉDICTION', 40, l.y - 8, { size: 11, col: COL.red, w: 700, ls: 2 }); }
          else if (l.t < 1.1) { c.save(); c.fillStyle = 'rgba(255,43,58,.5)'; c.shadowColor = '#ff2b3a'; c.shadowBlur = 30; c.fillRect(0, l.y - 10, W, 20); c.fillStyle = '#fff'; c.fillRect(0, l.y - 2, W, 4); c.restore(); }
        }
      }
      c.save(); c.translate(this.x, this.y);
      if (this.gs < 0) c.scale(1, -1);
      c.rotate(U.clamp(this.vy * this.gs / 1400, -.5, .5));
      drawStick(c, 'none', 0, 42, { afro: this.af, air: true, t: this.t });
      c.restore();
      c.save(); c.strokeStyle = 'rgba(181,123,255,.18)'; c.setLineDash([3, 5]); c.beginPath(); c.arc(this.x, this.y, this.rad(), 0, 7); c.stroke(); c.restore();
      const pr = this.pass / cfg.need;
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(200, 516, 560, 6); c.fillStyle = '#b57bff'; c.fillRect(200, 516, 560 * pr, 6);
      txt(c, `${this.pass} / ${cfg.need} piliers`, 480, 508, { al: 'center', size: 12, col: COL.dim, w: 600 });
      if (!this.started) txt(c, 'Espace ou clic : gonfler l\'afro', 480, 200, { al: 'center', size: 20, col: COL.ink, a: .6 + .4 * Math.sin(this.t * 4) });
      if (cfg.flip && this.warned) txt(c, 'LA GRAVITÉ CHANGE', 480, 90, { al: 'center', size: 30, f: 'd', col: '#b57bff', w: 900, glow: '#b57bff', a: .5 + .5 * Math.sin(this.t * 20) });
    }
  });
}

LEVELS.push({
  id: 2, host: 'none', title: "L'Afro de Sisyphe", sub: 'Vol à un seul bouton',
  quote: "Mon afro plane. Le problème, c'est qu'elle grossit quand je stresse.",
  controls: 'Espace, Z, ↑ ou clic : gonfler l\'afro pour remonter',
  freed: 'None est libéré. Son afro mesure désormais 2 mètres.',
  taunts: ["L'afro a gagné. Toi, non.", 'Plus ton afro grossit, plus tu perds. Comme dans la vie.', 'Flap. Flap. Mort.'],
  phases: [
    { name: 'Les Piliers', proph: "Tu vas réussir les cinq premiers piliers. Ensuite, ton afro va te trahir.", make: flightPhase({ spd: 220, every: 1.55, gap: 175, grow: 1.5, need: 15 }) },
    { name: 'La Gravité Menteuse', proph: "La gravité va changer de sens. Tu vas appuyer exactement au mauvais moment.", tip: 'Quand la gravité s\'inverse, ton bouton pousse vers le bas.', make: flightPhase({ spd: 225, every: 1.6, gap: 182, grow: 1.1, need: 15, flip: 5.5 }) },
    { name: "L'Œil de Golden", proph: "Je vais tirer là où tu seras. Pas là où tu es.", tip: 'Le laser vise ta position future. Change de hauteur quand la ligne apparaît.', make: flightPhase({ spd: 225, every: 1.7, gap: 190, grow: .9, need: 16, move: true, laser: true }) }
  ]
});

/* =========================================================
   NIVEAU 3 — FANTA — Trop de Muscle (jauges, pression, bras de fer)
   ========================================================= */
const WALLS = [{ zw: .22, sp: .75 }, { zw: .18, sp: .95 }, { zw: .15, sp: 1.15 }, { zw: .14, sp: 1.15, rev: 1 }, { zw: .13, sp: 1.0, mv: 1 }, { zw: .12, sp: 1.45 }, { zw: .11, sp: 1.1, fake: 1 }];

function gymBg(c, t) {
  c.fillStyle = '#09070c'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(480, 120, 10, 480, 120, 420); g.addColorStop(0, 'rgba(255,138,31,.10)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#0f0c13'; c.fillRect(0, 440, W, 100); c.fillStyle = 'rgba(255,138,31,.6)'; c.fillRect(0, 440, W, 2);
}

const gaugePhase = L => ({
  init() { this.k = 0; this.t = 0; this.setup(); },
  setup() {
    const w = WALLS[this.k];
    this.zw = w.zw * (L.pity ? 1.45 : 1); this.sp = w.sp * (L.pity ? .8 : 1);
    this.z = U.rnd(.12, .88 - this.zw); this.u = 0; this.dir = 1; this.revT = U.rnd(.3, .8); this.anim = 0; this.fz = null;
    if (w.fake) { this.fz = this.z; this.z = this.fz > .45 ? U.rnd(.05, .28) : U.rnd(.62, .86); }
    if (this.k === 6) L.say('Le vert est un mensonge. Comme tout le reste.', 3);
  },
  update(dt) {
    this.t += dt;
    if (this.anim > 0) { this.anim -= dt; if (this.anim <= 0) { this.k++; if (this.k >= WALLS.length) return L.win(); this.setup(); } return; }
    const w = WALLS[this.k];
    this.u += this.dir * this.sp * dt;
    if (this.u > 1) { this.u = 1; this.dir = -1; } if (this.u < 0) { this.u = 0; this.dir = 1; }
    if (w.rev) { this.revT -= dt; if (this.revT <= 0) { this.dir *= -1; this.revT = U.rnd(.25, .7); } }
    if (w.mv) this.z = .5 - this.zw / 2 + Math.sin(this.t * 1.7) * (.45 - this.zw / 2);
    if (K.jumpHit() || K.actHit() || G.mouse.click) {
      G.mouse.click = false;
      if (this.u >= this.z && this.u <= this.z + this.zw) { this.anim = .75; A.punch(); G.shake = 14; P.burst(560, 330, 46, '#ff8a1f', 420); P.pop(560, 220, U.pick(['BOUM', 'PAF', 'CRAC', 'PULVÉRISÉ']), '#ff8a1f', 30); }
      else if (this.fz != null && this.u >= this.fz && this.u <= this.fz + this.zw) L.die('Tu as visé le vert. Golden avait repeint la jauge.');
      else L.die(this.u < this.z ? 'Trop faible. Le mur a rebondi sur Fanta.' : 'Trop fort. Fanta a traversé le sol.');
    }
  },
  draw(c) {
    gymBg(c, this.t);
    const pun = this.anim > 0 ? 1 : 0;
    softAura(c, 300, 360, '#ff8a1f', 160, .18);
    drawStick(c, 'fanta', 320, 440, { s: 3, t: this.t, punch: pun });
    const left = WALLS.length - this.k;
    for (let i = 0; i < left; i++) {
      const x = 500 + i * 30, sh = i === 0 && this.anim > 0 ? (1 - this.anim / .75) : 0;
      c.save(); c.globalAlpha = i === 0 ? 1 - sh : .5 - i * .05; c.translate(sh * 120, -sh * 60);
      c.fillStyle = '#1c0f06'; c.fillRect(x, 200, 28, 240); c.strokeStyle = 'rgba(255,138,31,.55)'; c.lineWidth = 1;
      for (let y = 200; y < 440; y += 20) c.strokeRect(x + .5, y + .5, 27, 20);
      c.restore();
    }
    const gx = 180, gw = 600, gy = 478;
    panel(c, gx - 10, gy - 14, gw + 20, 44, { line: 'rgba(255,255,255,.14)' });
    c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(gx, gy, gw, 16);
    if (this.fz != null) { c.fillStyle = 'rgba(61,255,122,.55)'; c.fillRect(gx + this.fz * gw, gy, this.zw * gw, 16); c.fillStyle = 'rgba(242,193,78,.75)'; }
    else c.fillStyle = 'rgba(61,255,122,.6)';
    c.fillRect(gx + this.z * gw, gy, this.zw * gw, 16);
    c.save(); c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 10; c.fillRect(gx + this.u * gw - 2, gy - 6, 4, 28); c.restore();
    txt(c, 'FAIBLE', gx, gy - 20, { size: 10, col: COL.dim, ls: 2 }); txt(c, 'TROP FORT', gx + gw, gy - 20, { al: 'right', size: 10, col: COL.dim, ls: 2 });
    txt(c, `MUR ${Math.min(this.k + 1, WALLS.length)} / ${WALLS.length}`, 480, 70, { al: 'center', size: 13, col: '#ff8a1f', w: 700, ls: 3 });
    txt(c, 'Arrête la jauge dans la bonne zone : Espace, X ou clic', 480, 96, { al: 'center', size: 15, col: COL.ink });
    if (this.fz != null) txt(c, 'Golden a repeint la jauge.', 480, 120, { al: 'center', size: 14, it: true, col: COL.red });
  }
});

const canPhase = L => ({
  init() { this.p = 18; this.hold = 0; this.t = 0; this.jolt = 1.6; this.need = 7; this.shakeA = 0; },
  band() { const c = 65 + (this.t > 4 ? Math.sin((this.t - 4) * .7) * 14 : 0), h = L.pity ? 14 : 10; return [c - h, c + h]; },
  update(dt) {
    this.t += dt;
    if (K.jumpHit() || K.actHit() || G.mouse.click) { G.mouse.click = false; this.p += 7.5; A.blip(300 + this.p * 6); this.shakeA = 1; }
    this.p -= 22 * dt;
    this.jolt -= dt;
    if (this.jolt <= 0) { this.jolt = U.rnd(1.1, 1.9); const j = U.rnd(-14, 20); this.p += j; this.shakeA = 1.5; if (j > 12) P.pop(480, 150, 'Golden secoue la canette', COL.red, 14); }
    this.p = Math.max(0, this.p); this.shakeA = Math.max(0, this.shakeA - dt * 3);
    const [lo, hi] = this.band();
    if (this.p >= 100) { G.shake = 20; P.burst(480, 300, 80, '#ff8a1f', 500); return L.die('La canette a explosé. Fanta aussi.'); }
    if (this.p >= lo && this.p <= hi) this.hold += dt;
    if (this.hold >= this.need) return L.win();
    if (this.t > 45) L.die('Trop lent. La canette est devenue tiède.');
  },
  draw(c) {
    gymBg(c, this.t);
    drawStick(c, 'fanta', 260, 440, { s: 2.6, t: this.t * (1 + this.shakeA * 3), run: this.shakeA > .2 ? .3 : 0 });
    const sx = (Math.random() - .5) * this.shakeA * 8;
    c.save(); c.translate(480 + sx, 300);
    c.fillStyle = '#ff8a1f'; c.shadowColor = '#ff8a1f'; c.shadowBlur = 20 + this.p * .3;
    c.beginPath(); c.roundRect ? c.roundRect(-45, -110, 90, 220, 14) : c.rect(-45, -110, 90, 220); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#c0c0c8'; c.fillRect(-40, -118, 80, 10); c.fillRect(-40, 108, 80, 8);
    c.fillStyle = '#1a0f05'; c.fillRect(-45, -30, 90, 60);
    txt(c, 'SODA', 0, 10, { al: 'center', f: 'd', size: 34, col: '#ff8a1f', w: 900 });
    c.restore();
    const [lo, hi] = this.band(), gx = 640, gy = 120, gh = 320;
    panel(c, gx - 12, gy - 12, 60, gh + 24, { line: 'rgba(255,255,255,.14)' });
    c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(gx, gy, 36, gh);
    c.fillStyle = 'rgba(61,255,122,.35)'; c.fillRect(gx, gy + gh * (1 - hi / 100), 36, gh * (hi - lo) / 100);
    c.fillStyle = 'rgba(255,43,58,.35)'; c.fillRect(gx, gy, 36, gh * .08);
    const py = gy + gh * (1 - Math.min(100, this.p) / 100);
    c.save(); c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 10; c.fillRect(gx - 6, py - 2, 48, 4); c.restore();
    txt(c, 'PRESSION', gx + 18, gy - 20, { al: 'center', size: 11, col: COL.dim, ls: 2 });
    txt(c, 'BOUM', gx + 60, gy + 14, { size: 11, col: COL.red, w: 700 });
    const pr = this.hold / this.need;
    c.save(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 8; c.beginPath(); c.arc(800, 280, 46, 0, 7); c.stroke();
    c.strokeStyle = '#3dff7a'; c.shadowColor = '#3dff7a'; c.shadowBlur = 12; c.beginPath(); c.arc(800, 280, 46, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); c.stroke(); c.restore();
    txt(c, (this.need - this.hold).toFixed(1) + ' s', 800, 286, { al: 'center', size: 18, col: COL.ink, w: 700 });
    txt(c, 'Tapote Espace / clic pour garder la pression dans la zone verte', 480, 70, { al: 'center', size: 15, col: COL.ink });
    txt(c, `${Math.max(0, 45 - this.t).toFixed(0)} s avant que la canette tiédisse`, 480, 94, { al: 'center', size: 12, col: COL.dim });
  }
});

const wrestlePhase = L => ({
  init() { this.v = 0; this.last = null; this.times = []; this.pred = false; this.t = 0; },
  update(dt) {
    this.t += dt;
    const l = G.hit.ArrowLeft || G.hit.KeyA, r = G.hit.ArrowRight || G.hit.KeyD;
    const k = l && !r ? 'L' : r && !l ? 'R' : null;
    if (k && k !== this.last) {
      this.last = k; this.v += 6.5; this.times.push(this.t); if (this.times.length > 8) this.times.shift();
      A.blip(k === 'L' ? 520 : 620);
    }
    this.pred = false;
    if (this.times.length >= 7 && this.t - this.times[this.times.length - 1] < .5) {
      const iv = []; for (let i = 1; i < this.times.length; i++) iv.push(this.times[i] - this.times[i - 1]);
      const m = iv.reduce((a, b) => a + b, 0) / iv.length, sd = Math.sqrt(iv.reduce((a, b) => a + (b - m) ** 2, 0) / iv.length);
      this.pred = sd / m < .2;
    }
    if (this.t > 1.5) this.v -= (this.pred ? 74 : (L.pity ? 24 : 31)) * dt;
    if (this.v >= 100) return L.win();
    if (this.v <= -100) L.die(this.pred ? 'Golden a lu ton rythme. Trop régulier.' : 'Bras plié. Golden n\'a même pas posé son café.');
  },
  draw(c) {
    gymBg(c, this.t);
    const hx = 480 + this.v * 1.4;
    softAura(c, 240, 300, '#ff8a1f', 150, .2);
    goldenAura(c, 740, 440, 2.2, this.t, .8);
    drawStick(c, 'fanta', 240, 440, { s: 2.6, t: this.t });
    drawStick(c, 'golden', 740, 440, { s: 2.6, t: this.t, face: -1, drink: Math.sin(this.t * .8) > .6 });
    c.fillStyle = '#140f0a'; c.fillRect(270, 372, 420, 16); c.fillStyle = 'rgba(242,193,78,.45)'; c.fillRect(270, 372, 420, 2);
    c.fillRect(300, 388, 8, 52); c.fillRect(652, 388, 8, 52);
    c.save(); c.lineCap = 'round'; c.shadowColor = '#ff8a1f'; c.shadowBlur = 10;
    c.strokeStyle = '#efeaf7'; c.lineWidth = 12; seg(c, 268, 358, hx - 6, 352);
    c.strokeStyle = '#f7d27c'; c.shadowColor = COL.gold; c.lineWidth = 7; seg(c, 734, 358, hx + 6, 352);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, 352, 11, 0, 7); c.fill(); c.restore();
    const bx = 230, bw = 500;
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(bx, 470, bw, 12);
    c.fillStyle = this.v >= 0 ? '#ff8a1f' : COL.gold; const mid = bx + bw / 2;
    c.fillRect(Math.min(mid, mid + this.v / 100 * bw / 2), 470, Math.abs(this.v / 100 * bw / 2), 12);
    c.fillStyle = '#fff'; c.fillRect(mid - 1, 464, 2, 24);
    txt(c, 'FANTA', bx, 462, { size: 11, col: '#ff8a1f', w: 700, ls: 2 }); txt(c, 'GOLDEN', bx + bw, 462, { al: 'right', size: 11, col: COL.gold, w: 700, ls: 2 });
    txt(c, 'Alterne ← → (ou Q D) le plus vite possible', 480, 70, { al: 'center', size: 16, col: COL.ink });
    txt(c, 'Golden prédit les rythmes trop réguliers.', 480, 94, { al: 'center', size: 13, col: COL.dim });
    if (this.pred) txt(c, 'PRÉDIT : TON RYTHME EST RÉGULIER', 480, 150, { al: 'center', size: 26, f: 'd', col: COL.red, w: 900, glow: COL.red, a: .6 + .4 * Math.sin(this.t * 20) });
    if (this.t < 1.5) txt(c, 'PRÊT…', 480, 200, { al: 'center', size: 40, f: 'd', col: COL.gold, w: 900 });
  }
});

LEVELS.push({
  id: 3, host: 'fanta', title: 'Trop de Muscle', sub: 'Jauges, pression et bras de fer',
  quote: "J'ai trop de force. C'est ça, mon vrai problème.",
  controls: 'Espace, X ou clic : frapper / secouer  ·  ← → (ou Q D) : bras de fer',
  freed: 'Fanta est libéré. Il a cassé la porte en sortant.',
  taunts: ['Trop fort, trop faible. Jamais juste.', 'Des muscles, zéro timing.', 'Même ta force est prévisible.'],
  phases: [
    { name: 'Les Sept Murs', proph: 'Tu vas réussir les trois premiers murs. Au quatrième, la jauge va te mentir.', make: gaugePhase },
    { name: 'La Canette', proph: 'Tu vas trop secouer. Je le sais parce que je vais secouer avec toi.', make: canPhase },
    { name: 'Bras de Fer', proph: 'Ton rythme est un livre ouvert. Je le lis en buvant mon café.', tip: 'Varie ta cadence : un rythme parfaitement régulier double la force de Golden.', make: wrestlePhase }
  ]
});
