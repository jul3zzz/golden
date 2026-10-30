'use strict';
/* GOLDEN — moteur de plateforme partagé (niveaux 1, 5, 6, 10, boss) */

const STATS = {
  jules: { spd: 175, jmp: 560, g: 1900, w: 28, h: 46, crack: .22, heavy: 1, gait: 8 },
  none: { spd: 255, jmp: 600, g: 1750, w: 24, h: 50, glide: 1, brain: 1, crack: .5 },
  fanta: { spd: 260, jmp: 610, g: 1800, w: 26, h: 48, punch: 1, crack: .5 },
  mitty: { spd: 275, jmp: 600, g: 1800, w: 22, h: 44, djump: 1, crack: .5 },
  fondu: { spd: 265, jmp: 620, g: 1800, w: 22, h: 46, fog: 1, crack: .5 },
  noro: { spd: 270, jmp: 620, g: 1800, w: 22, h: 46, phase: 1, crack: .5 }
};

const DEATHMSG = {
  spike: "Des piques. Zéro originalité, efficacité totale.",
  fall: "Le vide t'a appelé. Tu as répondu.",
  laser: "Grillé. Il fallait phaser (Maj ou X).",
  flag: "Les checkpoints, c'est pour les faibles.",
  cup: "Un café géant sur la tête.",
  ghost: "Ton ancienne version t'a rattrapé.",
  strike: "Golden a frappé là où tu allais être."
};

/* bloc : solid | fragile | fake | invis | brick | laser | move */
function Bk(x, y, w, h, k = 'solid', o = {}) { return Object.assign({ x, y, w, h, k, on: true, bx: x, by: y, crack: 0, vy: 0, rev: 0, seen: false, fa: 1, dx: 0, dy: 0 }, o); }
function Sp(x, y, w, dir = 'up', o = {}) { return Object.assign({ x, y, w, dir, on: true, hidden: false, pop: 1 }, o.hidden ? { pop: 0 } : {}, o); }

class World {
  constructor(o) {
    this.o = o; this.Wd = o.w || W; this.t = 0; this.cam = 0;
    this.blocks = o.blocks || []; this.spikes = o.spikes || []; this.trig = o.triggers || []; this.ents = o.ents || [];
    this.exit = o.exit ? { x: o.exit[0], y: o.exit[1], w: 36, h: 56, fake: !!o.exitFake, tx: null, ty: null, label: o.exitLabel, onFake: o.onFake } : null;
    this.decoDoors = [];
    this.mirror = !!o.mirror; this.swap = false; this.dead = false; this.won = false; this.deadBy = '';
    this.noDie = !!o.noDie; this.hurtCb = null; this.eyes = o.eyes !== false;
    this.p = null; this.setChar(o.char);
    this.p.x = o.start[0]; this.p.y = o.start[1];
  }
  setChar(id) {
    this.char = id; this.st = STATS[id]; this.tint = CH[id].col;
    const old = this.p || {};
    this.p = { x: old.x || 0, y: old.y || 0, vx: 0, vy: old.vy || 0, w: this.st.w, h: this.st.h, face: old.face || 1, ground: false, gb: null, jumps: 0, coy: 0, buf: 0, phase: 0, pcd: 0, punch: 0, inv: 0, run: 0, gait: 0, tired: 0, winded: 0 };
  }
  box() { const p = this.p; return { x: p.x - p.w / 2, y: p.y - p.h, w: p.w, h: p.h }; }
  solid(b) { return b.on && !b.nos && b.k !== 'laser' && b.k !== 'deco' && !(b.k === 'fog' && this.st.fog); }
  kill(by) {
    if (this.dead || this.won) return;
    if (this.p.inv > 0) return;
    if (this.noDie) { this.hurtCb && this.hurtCb(by); return; }
    this.dead = true; this.deadBy = by;
    P.burst(this.p.x, this.p.y - 20, 26, this.tint, 260);
  }
  crumble(b) { if (!b.on) return; b.on = false; b.falling = true; b.vy = 0; A.crack(); P.burst(b.x + b.w / 2, b.y + 4, 10, '#8a7a5a', 120, .6, 3); }
  popSpike(s) { if (!s.hidden) return; s.hidden = false; A.blip(220); }
  moveExit(x, y) { this.exit.tx = x; this.exit.ty = y; A.zap(); }
  spikeBox(s) {
    const h = 14 * s.pop;
    switch (s.dir) {
      case 'down': return { x: s.x + 3, y: s.y, w: s.w - 6, h: h - 2 };
      case 'left': return { x: s.x - h + 2, y: s.y + 3, w: h - 2, h: s.w - 6 };
      case 'right': return { x: s.x, y: s.y + 3, w: h - 2, h: s.w - 6 };
      default: return { x: s.x + 3, y: s.y - h + 2, w: s.w - 6, h: h - 2 };
    }
  }
  doPunch() {
    const p = this.p, r = { x: p.face > 0 ? p.x : p.x - 50, y: p.y - p.h, w: 50, h: p.h };
    for (const b of this.blocks) if (b.on && b.k === 'brick' && U.rr(r, b)) { this.crumble(b); A.punch(); G.shake = 8; P.burst(b.x + b.w / 2, b.y + b.h / 2, 30, '#ff8a1f', 300); }
  }
  update(dt) {
    if (this.dead || this.won) return;
    this.t += dt;
    const p = this.p, st = this.st;
    for (const b of this.blocks) {
      if (b.k === 'move' && b.on) {
        const s = Math.sin(this.t * (b.ms || 1) + (b.mp || 0));
        const nx = b.bx + (b.mx || 0) * s, ny = b.by + (b.my || 0) * s;
        b.dx = nx - b.x; b.dy = ny - b.y; b.x = nx; b.y = ny;
      }
      if (b.blink) b.lit = ((this.t + (b.bp || 0)) % b.blink) < b.blink * .55;
      if (b.rev > 0) b.rev -= dt;
      if (!b.on && b.falling) { b.vy += 1800 * dt; b.y += b.vy * dt; b.fa = Math.max(0, b.fa - dt * 1.4); }
    }
    if (p.ground && p.gb && p.gb.k === 'move' && p.gb.on) { p.x += p.gb.dx; p.y = p.gb.y; }

    // commandes
    let L = K.left(), R = K.right();
    if (this.swap) { const tmp = L; L = R; R = tmp; }
    const ax = (R ? 1 : 0) - (L ? 1 : 0);
    p.vx = ax * st.spd; if (ax) p.face = ax; p.run = ax ? 1 : 0;
    if (K.jumpHit()) p.buf = .13; else p.buf -= dt;
    if (st.heavy) {
      // Jules s'essouffle après ~4 s de course : arrêt forcé, mains sur les genoux
      if (p.winded > 0) {
        p.winded -= dt; p.vx = 0; p.run = 0; p.buf = 0;
        if (Math.random() < dt * 6) P.burst(p.x + p.face * 9, p.y - 46, 1, '#d8e0ff', 30, .7, 2.5, -60);
      } else if (p.ground && ax) {
        p.tired += dt;
        if (p.tired > 4.2) { p.winded = 1.4; p.tired = 0; A.pant(); }
      } else p.tired = Math.max(0, p.tired - dt * 1.3);
    }
    p.coy = p.ground ? .09 : p.coy - dt;
    if (p.buf > 0) {
      if (p.coy > 0) { p.vy = -st.jmp; p.buf = 0; p.coy = 0; p.ground = false; p.jumps = 1; A.jump(); }
      else if (st.djump && p.jumps < 2) { p.vy = -st.jmp * .92; p.jumps = 2; p.buf = 0; A.jump(1.3); P.burst(p.x, p.y, 8, this.tint, 120, .4); }
    }
    let g = st.g;
    if (!K.jump() && p.vy < 0) g *= 2.2;
    if (st.glide && K.jump() && p.vy > 0) { g *= .22; if (p.vy > 140) p.vy = 140; }
    p.vy = Math.min(p.vy + g * dt, 1000);

    if (p.pcd > 0) p.pcd -= dt; if (p.phase > 0) p.phase -= dt; if (p.punch > 0) p.punch -= dt; if (p.inv > 0) p.inv -= dt;
    if (K.actHit()) {
      if (st.phase && p.pcd <= 0) { p.phase = .6; p.pcd = 1.25; A.zap(); P.burst(p.x, p.y - 24, 12, this.tint, 140, .5); }
      if (st.punch && p.punch <= 0) { p.punch = .25; this.doPunch(); }
    }

    // déplacement horizontal
    p.x += p.vx * dt;
    let bx = this.box();
    for (const b of this.blocks) {
      if (!this.solid(b) || !U.rr(bx, b)) continue;
      if (b.k === 'invis') b.seen = true;
      if (b.k === 'fake') { this.crumble(b); continue; }
      if (p.x < b.x + b.w / 2) p.x = b.x - p.w / 2 - .01; else p.x = b.x + b.w + p.w / 2 + .01;
      bx = this.box();
    }
    p.x = U.clamp(p.x, p.w / 2, this.Wd - p.w / 2);

    // déplacement vertical
    const wasG = p.ground; p.ground = false; p.gb = null;
    const prevY = p.y;
    p.y += p.vy * dt; bx = this.box();
    for (const b of this.blocks) {
      if (!this.solid(b) || !U.rr(bx, b)) continue;
      if (b.k === 'invis') b.seen = true;
      if (p.vy >= 0 && prevY <= b.y + 6 + Math.max(0, b.dy || 0)) { p.y = b.y; p.vy = 0; p.ground = true; p.gb = b; p.jumps = 0; }
      else if (p.vy < 0 && prevY - p.h >= b.y + b.h - 8) { p.y = b.y + b.h + p.h; p.vy = 0; }
      bx = this.box();
    }
    if (p.ground && !wasG) { A.land(); if (st.heavy) { A.step(); G.shake = Math.max(G.shake, 4); } }
    if (p.ground && p.run) {
      const before = p.gait; p.gait += dt * (st.gait || 13);
      if (st.heavy && Math.floor(before / Math.PI) !== Math.floor(p.gait / Math.PI)) {
        A.step(); G.shake = Math.max(G.shake, 2.2);
        P.burst(p.x - p.face * 8, p.y, 4, '#8a7a5a', 70, .35, 2, 300);
      }
    } else p.gait = Math.PI * .5;
    const gb = p.gb;
    if (gb) {
      if (gb.k === 'fragile') { gb.crack += dt; if (gb.crack > st.crack) this.crumble(gb); }
      if (gb.k === 'fake') { gb.crack += dt; if (gb.crack > .06) this.crumble(gb); }
    }

    for (const tr of this.trig) { if (tr.done) continue; if (U.rr(bx, tr)) { if (tr.once !== false) tr.done = true; tr.fn(this); } }
    for (const e of this.ents) e.update && e.update(dt, this);
    this.ents = this.ents.filter(e => !e.gone);

    for (const s of this.spikes) { if (!s.hidden && s.pop < 1) s.pop = Math.min(1, s.pop + dt * 12); }
    for (const s of this.spikes) if (s.on && s.pop >= .5 && U.rr(bx, this.spikeBox(s))) this.kill('spike');
    for (const b of this.blocks) if (b.on && b.k === 'laser' && !(b.blink && !b.lit) && p.phase <= 0 && U.rr(bx, b)) this.kill('laser');
    for (const e of this.ents) if (e.hurt && e.hurt(bx, this)) this.kill(e.by || 'spike');
    if (p.y > H + 80) this.kill('fall');

    const ex = this.exit;
    if (ex && !this.dead) {
      if (ex.tx != null) {
        ex.x += (ex.tx - ex.x) * Math.min(1, dt * 8); ex.y += (ex.ty - ex.y) * Math.min(1, dt * 8);
        if (Math.abs(ex.tx - ex.x) < 1 && Math.abs(ex.ty - ex.y) < 1) { ex.x = ex.tx; ex.y = ex.ty; ex.tx = null; }
      } else if (U.rr(bx, { x: ex.x - ex.w / 2 + 6, y: ex.y - ex.h, w: ex.w - 12, h: ex.h })) {
        if (ex.fake) { if (!ex.revealed) { ex.revealed = true; ex.onFake && ex.onFake(this); } }
        else this.won = true;
      }
    }
    if (this.Wd > W) { const target = U.clamp(p.x - W / 2, 0, this.Wd - W); this.cam += (target - this.cam) * Math.min(1, dt * 6); }
  }

  /* ---------- rendu ---------- */
  draw(c, o = {}) {
    c.save();
    if (this.mirror) { c.translate(W, 0); c.scale(-1, 1); }
    this.drawBg(c);
    c.translate(-Math.round(this.cam), 0);
    this.drawStage(c);
    if (!o.noPlayer) this.drawPlayer(c);
    P.draw(c);
    c.restore();
  }
  drawStage(c) {
    for (const b of this.blocks) this.drawBlock(c, b);
    for (const s of this.spikes) this.drawSpike(c, s);
    for (const d of this.decoDoors) this.drawExit(c, d);
    if (this.exit) this.drawExit(c, this.exit);
    for (const e of this.ents) e.draw && e.draw(c, this);
  }
  withCam(c, fn) { c.save(); if (this.mirror) { c.translate(W, 0); c.scale(-1, 1); } c.translate(-Math.round(this.cam), 0); fn(); c.restore(); }
  drawBg(c) {
    const t = this.t, cam = this.cam;
    c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(-((cam * .25) % 220), 0);
    for (let i = -1; i < 7; i++) {
      const x = i * 220 + 40;
      c.fillStyle = 'rgba(242,193,78,.03)'; c.fillRect(x, 0, 46, H);
      c.fillStyle = 'rgba(242,193,78,.07)'; c.fillRect(x, 0, 1, H); c.fillRect(x + 46, 0, 1, H);
    }
    c.restore();
    if (this.eyes) {
      const px = this.p.x - cam, py = this.p.y;
      for (const s of [-1, 1]) {
        const cx = W / 2 + s * 46, cy = 92;
        const dx = U.clamp((px - cx) / W * 16, -9, 9), dy = U.clamp((py - cy) / H * 8, -3, 5);
        c.save(); c.globalAlpha = .15 + .06 * Math.sin(t * 1.7); c.fillStyle = '#ff2b3a'; c.shadowColor = '#ff2b3a'; c.shadowBlur = 30;
        c.beginPath(); c.ellipse(cx + dx, cy + dy, 16, 5.5, s * .2, 0, 7); c.fill(); c.restore();
      }
    }
  }
  drawBlock(c, b) {
    if (b.k === 'deco' || b.hide) return;
    if (!b.on && !b.falling) return;
    if (b.k === 'invis' && !b.seen && b.rev <= 0) {
      // le cerveau de None devine les plateformes invisibles
      if (this.st.brain) { c.save(); c.strokeStyle = hexA(this.tint, .45); c.setLineDash([3, 4]); c.lineWidth = 1; c.strokeRect(b.x + .5, b.y + .5, b.w - 1, b.h - 1); c.restore(); }
      return;
    }
    c.save();
    if (b.k === 'fog') {
      const t = this.t;
      c.fillStyle = '#050407'; c.fillRect(b.x, b.y, b.w, b.h);
      for (let i = 0; i < 7; i++) {
        const yy = b.y + ((i * 37 + t * 22) % b.h), g = c.createRadialGradient(b.x + b.w / 2 + Math.sin(t + i) * b.w * .3, yy, 0, b.x + b.w / 2, yy, b.w * .9);
        g.addColorStop(0, 'rgba(93,255,158,.10)'); g.addColorStop(1, 'rgba(93,255,158,0)'); c.fillStyle = g; c.fillRect(b.x, b.y, b.w, b.h);
      }
      c.strokeStyle = 'rgba(93,255,158,.35)'; c.setLineDash([2, 5]); c.lineWidth = 1; c.strokeRect(b.x + .5, b.y + .5, b.w - 1, b.h - 1);
      c.restore();
      if (b.h > 90) txt(c, 'BRUME', b.x + b.w / 2, b.y + 18, { al: 'center', size: 9, col: 'rgba(93,255,158,.6)', w: 700, ls: 2 });
      return;
    }
    c.globalAlpha *= (b.falling ? b.fa : 1) * (b.a == null ? 1 : b.a);
    if (b.k === 'laser') {
      const on = !(b.blink && !b.lit);
      if (!on) { c.strokeStyle = 'rgba(255,43,58,.25)'; c.setLineDash([4, 8]); c.lineWidth = 1; c.strokeRect(b.x + b.w / 2, b.y, .1, b.h); c.restore(); return; }
      const fl = .75 + .25 * Math.sin(this.t * 40 + b.x);
      c.shadowColor = '#ff2b3a'; c.shadowBlur = 18; c.fillStyle = `rgba(255,43,58,${.45 * fl})`; c.fillRect(b.x - 3, b.y, b.w + 6, b.h);
      c.fillStyle = `rgba(255,220,220,${.9 * fl})`; c.fillRect(b.x + b.w / 2 - 1.5, b.y, 3, b.h);
      c.restore(); return;
    }
    const edge = b.edge || this.tint;
    if (b.k === 'invis') {
      const a = b.seen ? .85 : U.clamp(b.rev, 0, 1);
      c.globalAlpha *= a; c.strokeStyle = edge; c.shadowColor = edge; c.shadowBlur = 12; c.lineWidth = 2;
      c.fillStyle = 'rgba(20,16,28,.6)'; c.fillRect(b.x, b.y, b.w, b.h); c.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      c.restore(); return;
    }
    if (b.k === 'brick') {
      c.fillStyle = '#1c0f06'; c.fillRect(b.x, b.y, b.w, b.h);
      c.strokeStyle = 'rgba(255,138,31,.5)'; c.lineWidth = 1;
      for (let yy = 0; yy < b.h; yy += 14) { c.strokeRect(b.x + .5, b.y + yy + .5, b.w - 1, 14); for (let xx = (yy / 14) % 2 ? 10 : 0; xx < b.w; xx += 20) seg(c, b.x + xx, b.y + yy, b.x + xx, b.y + yy + 14); }
      c.restore(); return;
    }
    c.fillStyle = '#15121d'; c.fillRect(b.x, b.y, b.w, b.h);
    const lg = c.createLinearGradient(0, b.y, 0, b.y + Math.min(b.h, 30)); lg.addColorStop(0, hexA(edge, .22)); lg.addColorStop(1, hexA(edge, 0));
    c.fillStyle = lg; c.fillRect(b.x, b.y, b.w, Math.min(b.h, 30));
    if (b.h > 40) { c.fillStyle = 'rgba(242,193,78,.05)'; for (let xx = b.x + 20; xx < b.x + b.w; xx += 40) c.fillRect(xx, b.y + 10, 1, b.h - 10); }
    c.fillStyle = edge; c.shadowColor = edge; c.shadowBlur = 14;
    if (b.k === 'fragile') {
      c.globalAlpha *= .85;
      for (let xx = b.x; xx < b.x + b.w; xx += 10) c.fillRect(xx, b.y, 6, 3);
      c.shadowBlur = 0; c.strokeStyle = 'rgba(236,232,244,.6)'; c.lineWidth = 1;
      const n = Math.floor(b.crack / (this.st.crack || .5) * 5) + 1;
      for (let i = 0; i < n; i++) { const xx = b.x + (i * 37 % b.w); c.beginPath(); c.moveTo(xx, b.y + 2); c.lineTo(xx + 5, b.y + b.h / 2); c.lineTo(xx - 2, b.y + b.h); c.stroke(); }
    } else {
      c.fillRect(b.x, b.y, b.w, 3);
      c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(b.x, b.y, 1, b.h); c.fillRect(b.x + b.w - 1, b.y, 1, b.h);
      if (b.k === 'fake' && this.st.brain) { c.strokeStyle = 'rgba(255,43,58,.7)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeRect(b.x + 2, b.y + 2, b.w - 4, Math.min(b.h, 30) - 4); txt(c, '?', b.x + b.w / 2, b.y + 20, { al: 'center', size: 12, col: COL.red, w: 700 }); }
    }
    c.restore();
  }
  drawSpike(c, s) {
    if (s.on && s.hidden && this.st.brain) {
      // piques cachées, vues par None
      const n = Math.max(1, Math.round(s.w / 16)), tw = s.w / n;
      c.save(); c.strokeStyle = 'rgba(255,43,58,.55)'; c.setLineDash([2, 3]); c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < n; i++) { const x = s.x + i * tw; c.moveTo(x, s.y); c.lineTo(x + tw / 2, s.y - 12); c.lineTo(x + tw, s.y); }
      c.stroke(); c.restore();
    }
    if (!s.on || s.pop <= 0) return;
    const n = Math.max(1, Math.round(s.w / 16)), tw = s.w / n, h = 14 * s.pop;
    c.save(); c.fillStyle = '#d9d2e3'; c.shadowColor = '#ff2b3a'; c.shadowBlur = 8;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      if (s.dir === 'up') { const x = s.x + i * tw; c.moveTo(x, s.y); c.lineTo(x + tw / 2, s.y - h); c.lineTo(x + tw, s.y); }
      else if (s.dir === 'down') { const x = s.x + i * tw; c.moveTo(x, s.y); c.lineTo(x + tw / 2, s.y + h); c.lineTo(x + tw, s.y); }
      else if (s.dir === 'left') { const y = s.y + i * tw; c.moveTo(s.x, y); c.lineTo(s.x - h, y + tw / 2); c.lineTo(s.x, y + tw); }
      else { const y = s.y + i * tw; c.moveTo(s.x, y); c.lineTo(s.x + h, y + tw / 2); c.lineTo(s.x, y + tw); }
    }
    c.fill(); c.restore();
  }
  drawExit(c, e) {
    const x = e.x, y = e.y;
    c.save();
    const g = c.createLinearGradient(0, y - 56, 0, y); g.addColorStop(0, '#2a1d05'); g.addColorStop(1, '#000');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - 17, y); c.lineTo(x - 17, y - 40); c.arc(x, y - 40, 17, Math.PI, 0); c.lineTo(x + 17, y); c.closePath(); c.fill();
    c.strokeStyle = e.revealed ? COL.red : COL.gold; c.lineWidth = 2.5; c.shadowColor = c.strokeStyle; c.shadowBlur = 14 + 6 * Math.sin(this.t * 4); c.stroke();
    c.restore();
    txt(c, e.revealed ? 'FAUSSE' : (e.label || 'SORTIE'), x, y - 64, { al: 'center', size: 11, col: e.revealed ? COL.red : COL.gold, w: 700, ls: 2 });
  }
  drawPlayer(c, alpha = 1) {
    const p = this.p;
    let a = alpha;
    if (p.phase > 0) a *= .3;
    if (p.inv > 0 && Math.sin(this.t * 40) > 0) a *= .3;
    if (this.st.glide && K.jump() && p.vy > 0 && !p.ground) P.list.length < 300 && Math.random() < .3 && P.burst(p.x, p.y - 50, 1, this.tint, 40, .5, 2, -50);
    drawStick(c, this.char, p.x, p.y, { face: p.face, t: this.t, gait: p.gait, run: p.ground ? p.run : 0, air: !p.ground, punch: p.punch > 0, winded: p.winded > 0, a });
    if (p.winded > 0) txt(c, 'hff… hff…', p.x, p.y - 70 + Math.sin(this.t * 9) * 2, { al: 'center', size: 12, col: '#d8e0ff', it: true, a: .85 * a });
    else if (p.tired > 2.6) {
      // gouttes de sueur : il va bientôt devoir s'arrêter
      const k = (this.t * 1.6) % 1, sx = p.x - p.face * 13, sy = p.y - 56 + k * 14;
      c.save(); c.globalAlpha *= a * (1 - k); c.fillStyle = '#8fd0ff'; c.shadowColor = '#8fd0ff'; c.shadowBlur = 6;
      c.beginPath(); c.moveTo(sx, sy - 5); c.quadraticCurveTo(sx + 3, sy, sx, sy + 1.5); c.quadraticCurveTo(sx - 3, sy, sx, sy - 5); c.fill(); c.restore();
    }
  }
}

/* phase de plateforme : d = options du World + crochets init/pre/post/over/onDie */
function platPhase(d) {
  return {
    init(L) { this.w = new World(d); if (d.init) d.init(this.w, L); },
    update(dt, L) {
      const w = this.w;
      if (d.pre) d.pre(dt, w, L);
      w.update(dt);
      if (d.post) d.post(dt, w, L);
      if (w.dead) L.die((d.deathMsg && d.deathMsg[w.deadBy]) || DEATHMSG[w.deadBy] || '');
      else if (w.won) L.win();
    },
    draw(c, L) { const w = this.w; if (d.drawWorld) d.drawWorld(c, w, L); else w.draw(c); if (d.over) d.over(c, w, L); },
    onDie(L, msg) { d.onDie && d.onDie(this.w, L, msg); }
  };
}

/* objet qui tombe du plafond (tasse géante) */
class Faller {
  constructor(x, y, w, h) { Object.assign(this, { x, y, w, h, vy: 0, landed: false }); this.by = 'cup'; }
  update(dt, wd) {
    if (this.landed) return;
    this.vy += 2600 * dt; this.y += this.vy * dt;
    for (const b of wd.blocks) {
      if (wd.solid(b) && U.rr(this, b) && this.y + this.h <= b.y + 40) {
        this.y = b.y - this.h; this.landed = true; G.shake = 10; A.boom();
        P.burst(this.x + this.w / 2, this.y + this.h, 24, '#7a4a22', 260);
        wd.blocks.push(Bk(this.x + 8, this.y + 10, this.w - 16, this.h - 10, 'solid', { hide: true }));
        break;
      }
    }
    if (this.y > H + 200) this.gone = true;
  }
  hurt(bx) { return !this.landed && U.rr(bx, { x: this.x + 4, y: this.y, w: this.w - 8, h: this.h }); }
  draw(c) { drawBigCup(c, this.x, this.y, this.w, this.h); }
}
function drawBigCup(c, x, y, w, h) {
  c.save(); c.fillStyle = '#140e08'; c.strokeStyle = COL.gold; c.lineWidth = 2.5; c.shadowColor = COL.gold; c.shadowBlur = 12;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + w - 14, y); c.lineTo(x + w - 20, y + h); c.lineTo(x + 6, y + h); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(x + w - 14, y + h * .45, h * .22, -1.3, 1.3); c.stroke();
  c.fillStyle = '#3a210d'; c.fillRect(x + 3, y + 3, w - 20, 6);
  txt(c, 'G', x + (w - 14) / 2, y + h * .7, { al: 'center', f: 'd', size: h * .45, col: COL.gold, w: 900 });
  c.restore();
}
