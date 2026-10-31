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
  tcontrols: '◀ ▶ : bouger  ·  ▲ : sauter (garde le doigt pour sauter plus haut)',
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
        const sp = Sp(258, 460, 48, 'up', { hidden: true });
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
   NIVEAU 2 — NONE — Le Cerveau en Surchauffe (énigmes)
   ========================================================= */
const NEUR = [
  { x: 480, y: 152, col: '#ff5fa2', f: 330, keys: ['ArrowUp', 'KeyW', 'Digit1'] },
  { x: 650, y: 300, col: '#29f0ff', f: 440, keys: ['ArrowRight', 'KeyD', 'Digit2'] },
  { x: 480, y: 448, col: '#ffd23f', f: 550, keys: ['ArrowDown', 'KeyS', 'Digit3'] },
  { x: 310, y: 300, col: '#5dff9e', f: 660, keys: ['ArrowLeft', 'KeyA', 'Digit4'] }
];

function brainBg(c, t) {
  c.fillStyle = '#07050c'; c.fillRect(0, 0, W, H);
  c.save(); c.strokeStyle = 'rgba(181,123,255,.07)'; c.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const x1 = (i * 173) % W, y1 = (i * 97) % H, x2 = (i * 311 + 200) % W, y2 = (i * 59 + 140) % H;
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + Math.sin(t * .4 + i) * 40, (y1 + y2) / 2, x2, y2); c.stroke();
    c.fillStyle = `rgba(181,123,255,${.12 + .1 * Math.sin(t * 2 + i)})`; c.beginPath(); c.arc(x1, y1, 2.5, 0, 7); c.fill();
  }
  c.restore();
}
/* None dans un coin, le cerveau grossit avec la difficulté */
function brainHost(c, t, k, x = 92, y = 500) {
  softAura(c, x, y - 50, CH.none.col, 90, .18);
  drawStick(c, 'none', x, y, { s: 2.2, t, brain: 14 + k * 9 });
  if (k > .55) txt(c, 'surchauffe…', x, y - 150 - k * 30, { al: 'center', size: 11, it: true, col: COL.red, a: .5 + .5 * Math.sin(t * 9) });
}

/* --- Phase : Simon (neurones) --- */
function simonPhase(cfg) {
  return L => ({
    init() {
      this.seq = []; this.r = 0; this.st = 'wait'; this.t = 0; this.at = 0; this.lit = -1; this.litT = 0; this.inp = 0; this.inT = 0;
      this.pos = [0, 1, 2, 3]; this.rot = 0; this.anim = 0; this.lie = false;
    },
    start() { this.next(); },
    next() {
      while (this.seq.length < cfg.lens[this.r]) this.seq.push(U.ri(0, 3));
      this.st = 'show'; this.at = 0; this.k = 0; this.inp = 0; this.lit = -1;
      this.pos = [0, 1, 2, 3]; this.anim = 0; this.pfrom = null;
      this.lie = cfg.lie === this.r;
      const sp = (cfg.spd || 1) * (L.pity ? 1.35 : 1) * (1 - this.r * .05);
      this.on = .46 * sp; this.gap = .2 * sp;
      if (this.lie) L.say('Cette fois, je chante faux. N\'écoute pas. Regarde.', 2.4);
    },
    // emplacement (0 haut, 1 droite, 2 bas, 3 gauche) où se trouve le neurone n
    slot(n) { return this.pos.indexOf(n); },
    xy(n) {
      const a = NEUR[this.slot(n)], b = NEUR[this.pfrom ? this.pfrom.indexOf(n) : this.slot(n)], k = U.eo(Math.min(1, this.anim));
      return [U.lerp(b.x, a.x, k), U.lerp(b.y, a.y, k)];
    },
    flash(n, d = .32) { this.lit = n; this.litT = d; const f = NEUR[this.lie ? (n + 2) % 4 : n].f; A.tone(f, d * .9, 'triangle', .14); },
    press(n) {
      const want = cfg.rev ? this.seq[cfg.lens[this.r] - 1 - this.inp] : this.seq[this.inp];
      this.flash(n, .22);
      if (n !== want) return L.die(cfg.rev ? 'À l\'envers. Tu l\'as fait à l\'endroit. Par réflexe.' : 'Mauvais neurone. Ton cerveau a menti.');
      this.inp++; this.inT = 0;
      if (this.inp >= cfg.lens[this.r]) {
        A.blip(880); this.st = 'ok'; this.at = 0;
      }
    },
    update(dt) {
      this.t += dt; if (this.litT > 0) { this.litT -= dt; if (this.litT <= 0) this.lit = -1; }
      if (this.anim < 1 && this.pfrom) this.anim += dt * 1.6;
      if (this.st === 'show') {
        this.at += dt;
        const per = this.on + this.gap, i = Math.floor(this.at / per);
        if (i < cfg.lens[this.r] && this.k === i && this.at - i * per < this.on) { this.flash(this.seq[i], this.on); this.k++; }
        if (this.at > per * cfg.lens[this.r] + .25) {
          this.st = 'input'; this.inT = 0;
          if (cfg.rotate === this.r || (cfg.rotateFrom != null && this.r >= cfg.rotateFrom)) {
            this.pfrom = this.pos.slice(); const s = this.r % 2 ? 1 : 3;
            this.pos = this.pos.map((_, j) => this.pfrom[(j + s) % 4]); this.anim = 0; A.zap();
            L.say('Les neurones ont bougé. Les couleurs, elles, n\'ont pas menti.', 2.2);
          } else this.pfrom = null;
        }
      } else if (this.st === 'input') {
        this.inT += dt;
        if (this.inT > (L.pity ? 6 : 4.2)) return L.die('Trop lent. Ton cerveau a surchauffé.');
        for (let s = 0; s < 4; s++) if (NEUR[s].keys.some(k => G.hit[k])) { this.press(this.pos[s]); return; }
        const m = G.mouse;
        if (m.click) for (let n = 0; n < 4; n++) { const [x, y] = this.xy(n); if (U.dist(m.x, m.y, x, y) < 50) { m.click = false; this.press(n); return; } }
      } else if (this.st === 'ok') {
        this.at += dt;
        if (this.at > .8) { this.r++; if (this.r >= cfg.lens.length) return L.win(); this.next(); }
      }
    },
    draw(c) {
      brainBg(c, this.t);
      c.save(); c.translate(480, 360); drawBrain(c, 0, 8, 46 + (this.st === 'input' ? 2 * Math.sin(this.t * 6) : 0), CH.none.col, this.t, null); c.restore();
      for (let n = 0; n < 4; n++) {
        const [x, y] = this.xy(n), nr = NEUR[n], on = this.lit === n;
        c.save(); c.strokeStyle = hexA(nr.col, on ? .8 : .22); c.lineWidth = on ? 3 : 1.5;
        c.beginPath(); c.moveTo(480, 300); c.quadraticCurveTo((480 + x) / 2 + 30, (300 + y) / 2 - 20, x, y); c.stroke();
        c.fillStyle = on ? nr.col : '#120d1a'; c.shadowColor = nr.col; c.shadowBlur = on ? 40 : 8;
        c.beginPath(); c.arc(x, y, on ? 48 : 42, 0, 7); c.fill();
        c.strokeStyle = nr.col; c.lineWidth = 3; c.stroke(); c.restore();
        if (!on) { c.save(); c.fillStyle = hexA(nr.col, .5); c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.restore(); }
      }
      const total = cfg.lens[this.r] || cfg.lens[cfg.lens.length - 1];
      txt(c, `Série ${Math.min(this.r + 1, cfg.lens.length)} / ${cfg.lens.length}   ·   ${total} neurones`, 480, 62, { al: 'center', size: 14, col: COL.dim, w: 600 });
      const msg = this.st === 'show' ? 'Regarde…' : this.st === 'input' ? (cfg.rev ? 'À TON TOUR — À L\'ENVERS' : 'À ton tour') : this.st === 'ok' ? 'Correct.' : '';
      txt(c, msg, 480, 92, { al: 'center', size: 22, f: 'd', col: this.st === 'input' ? COL.gold : COL.ink, w: 900 });
      if (this.st === 'input') {
        for (let i = 0; i < total; i++) { c.fillStyle = i < this.inp ? COL.gold : 'rgba(255,255,255,.15)'; c.fillRect(480 - total * 9 + i * 18, 104, 12, 4); }
        const k = 1 - this.inT / (L.pity ? 6 : 4.2); c.fillStyle = k < .3 ? COL.red : hexA(COL.gold, .6); c.fillRect(380, 116, 200 * k, 3);
      }
      txt(c, 'Clic, flèches ou 1-4', 940, 528, { al: 'right', size: 11, col: COL.dim });
      brainHost(c, this.t, (this.r + (this.inp / total)) / cfg.lens.length);
    }
  });
}

/* --- Phase : Synapses (tout allumer) --- */
function lightsPhase(boards) {
  return L => ({
    init() { this.b = 0; this.t = 0; this.setup(); },
    setup() {
      const cf = boards[this.b], n = cf.n;
      this.n = n; this.cell = n === 3 ? 96 : 80; this.moves = 0; this.limit = cf.limit + (L.pity ? 8 : 0); this.sabo = false; this.fx = 0;
      this.on = Array(n * n).fill(true); this.sol = Array(n * n).fill(false);
      const idx = U.shuffle([...Array(n * n).keys()]).slice(0, cf.k);
      idx.forEach(i => this.toggle(i));
    },
    toggle(i) {
      const n = this.n, x = i % n, y = Math.floor(i / n);
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < n && yy < n) this.on[yy * n + xx] = !this.on[yy * n + xx]; }
      this.sol[i] = !this.sol[i];
    },
    org() { const s = this.n * this.cell; return [480 - s / 2, 300 - s / 2 + 10]; },
    update(dt) {
      this.t += dt; if (this.fx > 0) this.fx -= dt;
      const m = G.mouse;
      if (m.click) {
        const [ox, oy] = this.org(), x = Math.floor((m.x - ox) / this.cell), y = Math.floor((m.y - oy) / this.cell);
        if (x >= 0 && y >= 0 && x < this.n && y < this.n) {
          m.click = false; this.toggle(y * this.n + x); this.moves++; A.tone(380 + (this.on.filter(Boolean).length) * 30, .08, 'triangle', .1);
          if (this.on.every(Boolean)) {
            A.win(); this.b++;
            if (this.b >= boards.length) return L.win();
            L.say('Un cerveau de plus. Le prochain est plus gros.', 2); this.setup(); return;
          }
          if (this.moves >= this.limit) return L.die('Trop de coups. Les synapses ont fondu.');
          const left = this.sol.filter(Boolean).length;
          if (left === 1 && !this.sabo && !L.pity) {
            this.sabo = true;
            const opts = [...this.sol.keys()].filter(i => !this.sol[i]);
            this.toggle(U.pick(opts)); this.fx = .6; A.oi(); G.shake = 6;
            L.say('Il te restait un seul coup. J\'ai appuyé sur un neurone. Oups.', 3);
          }
        }
      }
    },
    draw(c) {
      brainBg(c, this.t);
      const [ox, oy] = this.org(), cs = this.cell, n = this.n;
      for (let i = 0; i < n * n; i++) {
        const x = ox + (i % n) * cs, y = oy + Math.floor(i / n) * cs, on = this.on[i];
        const hov = U.inR(G.mouse.x, G.mouse.y, x, y, cs, cs); if (hov) G.hover = true;
        c.save();
        c.fillStyle = on ? '#2a1640' : '#0c0912'; c.fillRect(x + 4, y + 4, cs - 8, cs - 8);
        c.strokeStyle = on ? CH.none.col : 'rgba(255,255,255,.12)'; c.lineWidth = hov ? 3 : 2;
        if (on) { c.shadowColor = CH.none.col; c.shadowBlur = 18; }
        c.strokeRect(x + 4, y + 4, cs - 8, cs - 8);
        c.fillStyle = on ? '#e9c9ff' : 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(x + cs / 2, y + cs / 2, on ? 13 : 9, 0, 7); c.fill();
        if (L.pity && this.sol[i]) { c.shadowBlur = 0; c.strokeStyle = hexA(COL.gold, .5); c.setLineDash([3, 4]); c.strokeRect(x + 12, y + 12, cs - 24, cs - 24); }
        c.restore();
      }
      if (this.fx > 0) { c.fillStyle = `rgba(255,43,58,${this.fx * .3})`; c.fillRect(0, 0, W, H); }
      txt(c, 'Allume TOUS les neurones', 480, 62, { al: 'center', size: 22, f: 'd', col: COL.gold, w: 900 });
      txt(c, `Un clic inverse la case et ses voisines (haut, bas, gauche, droite)  ·  cerveau ${this.b + 1} / ${boards.length}`, 480, 86, { al: 'center', size: 13, col: COL.dim });
      txt(c, `Coups : ${this.moves} / ${this.limit}`, 480, 520, { al: 'center', size: 14, col: this.moves > this.limit - 4 ? COL.red : COL.ink, w: 700 });
      brainHost(c, this.t, this.moves / this.limit);
    }
  });
}

/* --- Phase : le chemin mémorisé --- */
function pathPhase(L) {
  const C = 9, R = 5, CS = 66, OX = 480 - C * CS / 2, OY = 132;
  if (!L.m.path) {
    // chemin aléatoire de la colonne 0 à la colonne 8, sans repasser deux fois au même endroit
    let ok = false, path;
    while (!ok) {
      path = [[0, U.ri(0, R - 1)]]; const seen = new Set([path[0].join()]);
      let x = 0, y = path[0][1], guard = 0;
      while (x < C - 1 && guard++ < 80) {
        const opts = [[1, 0], [1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return ny >= 0 && ny < R && !seen.has(nx + ',' + ny); });
        if (!opts.length) break;
        const [dx, dy] = U.pick(opts); x += dx; y += dy; path.push([x, y]); seen.add(x + ',' + y);
      }
      ok = x === C - 1 && path.length >= 13 && path.length <= 18;
    }
    L.m.path = path; L.m.show = 3.4;
    const near = [];
    path.slice(3, -3).forEach(([x, y]) => [[0, 1], [0, -1]].forEach(([dx, dy]) => { const k = x + ',' + (y + dy); if (y + dy >= 0 && y + dy < R && !path.some(p => p.join() === k)) near.push([x, y + dy]); }));
    L.m.decoy = U.pick(near);
  }
  const path = L.m.path, key = p => p.join(), onPath = new Set(path.map(key));
  return {
    touch: 'pad',
    init() { this.t = 0; this.st = 'show'; this.show = L.pity ? 4.5 : L.m.show; this.i = 0; this.p = path[0].slice(); this.trail = [key(path[0])]; this.crack = null; },
    onDie() { L.m.show = Math.max(1.5, L.m.show - .35); },
    update(dt) {
      this.t += dt;
      if (this.st === 'show') { if (this.t > this.show) { this.st = 'play'; A.blip(300); if (this.show < 3 && !L.m.saidShort) { L.m.saidShort = 1; L.say('J\'affiche le chemin moins longtemps à chaque mort. Le chemin, lui, ne change pas.', 3); } } return; }
      let d = null;
      if (G.hit.ArrowUp || G.hit.KeyW) d = [0, -1]; else if (G.hit.ArrowDown || G.hit.KeyS) d = [0, 1];
      else if (G.hit.ArrowLeft || G.hit.KeyA) d = [-1, 0]; else if (G.hit.ArrowRight || G.hit.KeyD) d = [1, 0];
      if (!d) return;
      const nx = this.p[0] + d[0], ny = this.p[1] + d[1];
      if (nx < 0 || ny < 0 || nx >= C || ny >= R) return;
      this.p = [nx, ny]; A.tone(300 + nx * 40, .06, 'triangle', .08);
      const k = key(this.p);
      if (L.m.decoy && k === key(L.m.decoy)) { this.crack = this.p.slice(); return L.die('Le raccourci doré. Il n\'y a jamais de raccourci.'); }
      if (!onPath.has(k)) { this.crack = this.p.slice(); return L.die('Ce neurone n\'était pas sur le chemin.'); }
      if (!this.trail.includes(k)) this.trail.push(k);
      if (k === key(path[path.length - 1])) L.win();
    },
    draw(c) {
      brainBg(c, this.t);
      const show = this.st === 'show';
      for (let x = 0; x < C; x++) for (let y = 0; y < R; y++) {
        const k = x + ',' + y, px = OX + x * CS, py = OY + y * CS;
        const lit = (show && onPath.has(k)) || this.trail.includes(k);
        const dec = !show && L.m.decoy && k === key(L.m.decoy);
        c.save();
        c.fillStyle = lit ? '#2a1640' : '#0d0a13'; c.fillRect(px + 3, py + 3, CS - 6, CS - 6);
        c.strokeStyle = lit ? CH.none.col : dec ? COL.gold : 'rgba(255,255,255,.08)'; c.lineWidth = lit || dec ? 2 : 1;
        if (lit || dec) { c.shadowColor = c.strokeStyle; c.shadowBlur = dec ? 10 + 6 * Math.sin(this.t * 5) : 14; }
        c.strokeRect(px + 3, py + 3, CS - 6, CS - 6); c.restore();
        if (dec) txt(c, 'raccourci ?', px + CS / 2, py + CS / 2 + 4, { al: 'center', size: 10, col: COL.gold, w: 700 });
      }
      const e = path[path.length - 1];
      txt(c, 'FIN', OX + e[0] * CS + CS / 2, OY + e[1] * CS + CS / 2 + 5, { al: 'center', size: 13, col: COL.gold, w: 700 });
      if (this.crack) { c.save(); c.strokeStyle = COL.red; c.lineWidth = 3; const px = OX + this.crack[0] * CS, py = OY + this.crack[1] * CS; seg(c, px + 10, py + 10, px + CS - 10, py + CS - 10); seg(c, px + CS - 10, py + 10, px + 10, py + CS - 10); c.restore(); }
      drawStick(c, 'none', OX + this.p[0] * CS + CS / 2, OY + this.p[1] * CS + CS - 8, { s: .9, t: this.t, brain: 14 });
      txt(c, show ? `Mémorise le chemin…  ${Math.max(0, this.show - this.t).toFixed(1)} s` : 'Refais le chemin de mémoire (' + (G.touch ? 'flèches à l’écran' : 'flèches') + '). Une case fausse = mort.', 480, 70, { al: 'center', size: show ? 22 : 15, f: show ? 'd' : 'u', col: show ? COL.gold : COL.ink, w: show ? 900 : 600 });
      if (show) { c.fillStyle = hexA(COL.gold, .6); c.fillRect(380, 84, 200 * Math.max(0, 1 - this.t / this.show), 3); }
      txt(c, `Temps d'affichage : ${this.show.toFixed(1)} s`, 480, 520, { al: 'center', size: 12, col: COL.dim });
    }
  };
}

LEVELS.push({
  id: 2, host: 'none', title: 'Le Cerveau en Surchauffe', sub: 'Énigmes et mémoire',
  quote: "J'ai le plus gros cerveau de la bande. Le problème, c'est qu'il réfléchit trop.",
  tcontrols: 'Touche les neurones et les cases  ·  flèches à l’écran : refaire le chemin',
  controls: 'Clic, flèches ou 1-4 : choisir un neurone  ·  souris : allumer les cases  ·  flèches : refaire le chemin',
  freed: 'None est libéré. Son cerveau a pris trois tailles. Il refuse de mettre un bonnet.',
  taunts: ['Gros cerveau. Petite mémoire.', 'Tu as réfléchi trop longtemps. Ou pas assez.', 'Ton cerveau a planté. Le mien, jamais.', 'Je connaissais la séquence avant toi.'],
  phases: [
    { name: 'Les Neurones', proph: 'Tu vas réussir les trois premières séries. À la quatrième, les neurones vont bouger. Tu vas cliquer au mauvais endroit.', tip: 'Retiens les COULEURS, pas les places : à la série 4, les neurones changent de place avant ton tour.', make: simonPhase({ lens: [3, 4, 5, 6], rotate: 3, lie: 2 }) },
    { name: 'Les Synapses', proph: 'À un seul coup de la victoire, je vais toucher ton cerveau. Juste une fois.', tip: 'Allume les 9 puis les 16 cases. Chaque clic inverse la case et ses voisines.', make: lightsPhase([{ n: 3, k: 4, limit: 14 }, { n: 4, k: 5, limit: 24 }]) },
    { name: 'Le Chemin', proph: 'Tu vas oublier le quatrième virage. Et le raccourci doré va te tenter.', tip: 'Le chemin reste le même après chaque mort. Seul le temps pour le mémoriser diminue.', make: pathPhase },
    { name: 'À l\'Envers', proph: 'Tu vas le refaire dans le bon sens. Par réflexe. Ton cerveau est trop poli.', tip: 'Répète chaque série en commençant par la FIN.', make: simonPhase({ lens: [3, 4, 5], rev: true, rotateFrom: 2 }) }
  ]
});

/* =========================================================
   NIVEAU 3 — FANTA — Trop de Muscle (jauges, pression, bras de fer)
   ========================================================= */
const WALLS = [{ zw: .22, sp: .75 }, { zw: .18, sp: .95 }, { zw: .15, sp: 1.15 }, { zw: .14, sp: 1.15, rev: 1 }, { zw: .13, sp: 1.0, mv: 1 }, { zw: .13, sp: 1.25 }, { zw: .11, sp: 1.1, fake: 1 }];

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
    txt(c, G.touch ? 'Arrête la jauge dans la bonne zone : touche l’écran' : 'Arrête la jauge dans la bonne zone : Espace, X ou clic', 480, 96, { al: 'center', size: 15, col: COL.ink });
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
    txt(c, G.touch ? 'Tapote l’écran pour garder la pression dans la zone verte' : 'Tapote Espace / clic pour garder la pression dans la zone verte', 480, 70, { al: 'center', size: 15, col: COL.ink });
    txt(c, `${Math.max(0, 45 - this.t).toFixed(0)} s avant que la canette tiédisse`, 480, 94, { al: 'center', size: 12, col: COL.dim });
  }
});

const wrestlePhase = L => ({
  touch: 'lr',
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
      this.pred = sd / m < .1;
    }
    if (this.t > 1.5) this.v -= (this.pred ? 40 : (L.pity ? 18 : 24)) * dt;
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
    txt(c, G.touch ? 'Alterne ◀ ▶ le plus vite possible' : 'Alterne ← → (ou Q D) le plus vite possible', 480, 70, { al: 'center', size: 16, col: COL.ink });
    txt(c, 'Golden prédit les rythmes trop réguliers.', 480, 94, { al: 'center', size: 13, col: COL.dim });
    if (this.pred) txt(c, 'PRÉDIT : TON RYTHME EST RÉGULIER', 480, 150, { al: 'center', size: 26, f: 'd', col: COL.red, w: 900, glow: COL.red, a: .6 + .4 * Math.sin(this.t * 20) });
    if (this.t < 1.5) txt(c, 'PRÊT…', 480, 200, { al: 'center', size: 40, f: 'd', col: COL.gold, w: 900 });
  }
});

LEVELS.push({
  id: 3, host: 'fanta', title: 'Trop de Muscle', sub: 'Jauges, pression et bras de fer',
  quote: "J'ai trop de force. C'est ça, mon vrai problème.",
  tcontrols: 'Touche l’écran : frapper / secouer  ·  ◀ puis ▶ en alternance : bras de fer',
  controls: 'Espace, X ou clic : frapper / secouer  ·  ← → (ou Q D) : bras de fer',
  freed: 'Fanta est libéré. Il a cassé la porte en sortant.',
  taunts: ['Trop fort, trop faible. Jamais juste.', 'Des muscles, zéro timing.', 'Même ta force est prévisible.'],
  phases: [
    { name: 'Les Sept Murs', proph: 'Tu vas réussir les trois premiers murs. Au quatrième, la jauge va te mentir.', make: gaugePhase },
    { name: 'La Canette', proph: 'Tu vas trop secouer. Je le sais parce que je vais secouer avec toi.', make: canPhase },
    { name: 'Bras de Fer', proph: 'Ton rythme est un livre ouvert. Je le lis en buvant mon café.', tip: 'Alterne vite ← →, mais pas comme un métronome : un rythme parfaitement régulier rend Golden bien plus fort.', make: wrestlePhase }
  ]
});
