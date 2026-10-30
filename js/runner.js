'use strict';
/* GOLDEN — déroulement d'un niveau : intro, prophétie, morts, pause, fin */

const TAUNTS = [
  'Prédit.', 'oi oi oi.', "Je l'avais écrit avant que tu naisses.", "Ton échec a le goût de mon café.",
  'Encore. Je regarde.', "J'ai déjà vu cette mort. En mieux.", 'Même tes réflexes sont prévisibles.',
  'Respire. Ça ne changera rien.', 'Je bois mon café. Toi, tu bois la défaite.', 'Tu croyais ? Moi, je savais.',
  "C'était écrit. Littéralement.", "Tu rages ? C'est exactement le but.", 'Une prophétie de plus qui se réalise.',
  "Ta patience, c'est mon café du matin.", 'Recommence. Je ne me lasse jamais.', 'Presque. Non, je mens. Pas presque.',
  "Je t'avais vu venir à des kilomètres.", 'Ralentis. Ou accélère. Ça ne change rien.', 'oi oi oi… encore toi ?',
  'Mort n°{n}. Je l\'avais notée hier.', "Le jeu n'est pas dur. C'est toi qui es prévisible.", 'Tu peux fermer l\'onglet. Je le saurai.'
];

class LevelRun {
  constructor(lv) {
    this.lv = lv; this.mem = {};
    this.i = Math.min(S.d.phase[lv.id] || 0, lv.phases.length - 1);
    this.state = this.i === 0 ? 'intro' : 'card'; this.st = 0; this.dh = 0; this.paused = false;
    this.make();
  }
  enter() { A.amb(this.lv.boss ? .07 : .045); G.touchUI(true); }
  exit() { G.touchUI(false); }
  make() {
    const ph = this.lv.phases[this.i];
    this.m = this.mem[this.i] || (this.mem[this.i] = {});
    P.list = [];
    this.cur = ph.make(this);
    this.cur.init && this.cur.init(this);
    this.bub = null;
  }
  get pity() { return this.dh >= 12; }
  die(msg) {
    if (this.state !== 'play') return;
    this.state = 'dead'; this.st = 0; this.dh++;
    S.d.deaths++; S.d.lvDeaths[this.lv.id] = (S.d.lvDeaths[this.lv.id] || 0) + 1; S.save();
    A.die(); G.shake = 14; G.flash = .35; G.flashCol = '#ff1030';
    const pool = (this.lv.taunts || []).concat(TAUNTS);
    let t = U.pick(pool); if (t === this.taunt) t = U.pick(pool);
    this.taunt = t.replace('{n}', S.d.deaths); this.deathMsg = msg || '';
    if (Math.random() < .28) A.oi();
    if (this.dh === 12) this.pityMsg = true;
    this.cur.onDie && this.cur.onDie(this, msg);
  }
  win() {
    if (this.state !== 'play') return;
    A.win();
    if (this.i + 1 < this.lv.phases.length) { this.state = 'clear'; this.st = 0; S.d.phase[this.lv.id] = this.i + 1; S.save(); }
    else {
      this.state = 'done'; this.st = 0; S.d.phase[this.lv.id] = 0; S.d.done[this.lv.id] = true;
      if (this.lv.free) {
        const fr = S.d.free, who = fr.done[this.lv.id] || (fr.done[this.lv.id] = []);
        if (!who.includes(this.lv.host)) who.push(this.lv.host);
        fr.un = Math.max(fr.un, this.lv.idx + 2);
      } else S.d.unlocked = Math.max(S.d.unlocked, this.lv.id + 1);
      S.save();
      if (this.lv.onDone) { this.lv.onDone(); }
    }
  }
  say(s, d = 2.8) { this.bub = { s, t: d }; }
  back() { return this.lv.back ? this.lv.back() : new MapScene(); }
  get tag() { return this.lv.boss ? 'TRÔNE' : this.lv.tag || 'NIVEAU ' + this.lv.id; }
  restartPhase() { this.make(); this.state = 'play'; this.st = 0; this.cur.start && this.cur.start(this); }
  update(dt) {
    this.st += dt;
    if (G.hit.Escape || G.hit.KeyP) this.paused = !this.paused;
    if (this.paused) return;
    if (this.bub) { this.bub.t -= dt; if (this.bub.t <= 0) this.bub = null; }
    switch (this.state) {
      case 'intro': if (this.st > .8 && K.any()) { G.mouse.click = false; this.state = 'card'; this.st = 0; } break;
      case 'card':
        if ((this.st > .7 && K.any()) || this.st > 6) { G.mouse.click = false; G.hit = {}; G.anyHit = false; this.state = 'play'; this.st = 0; this.cur.start && this.cur.start(this); }
        break;
      case 'play': S.d.time += dt; this.cur.update(dt, this); break;
      case 'dead':
        if ((this.st > .45 && K.any()) || this.st > 1.7) {
          G.mouse.click = false; G.hit = {}; G.anyHit = false;
          this.restartPhase();
          if (this.pityMsg) { this.pityMsg = false; this.say("Pitié activée. C'est encore plus humiliant.", 3.5); }
        }
        break;
      case 'clear': if (this.st > 1.3) { this.i++; this.dh = 0; this.make(); this.state = 'card'; this.st = 0; } break;
      case 'done': if (this.st > 1.2 && K.any()) { G.mouse.click = false; G.go(this.back()); } break;
    }
    P.update(dt);
    if (this.state === 'play' && this.time0 == null) this.time0 = 0;
  }
  draw(c) {
    this.cur.draw(c, this);
    this.drawHUD(c);
    if (this.bub) this.drawBubble(c);
    if (this.state === 'intro') this.drawIntro(c);
    else if (this.state === 'card') this.drawCard(c);
    else if (this.state === 'dead') this.drawDead(c);
    else if (this.state === 'clear') this.drawClear(c);
    else if (this.state === 'done') this.drawDone(c);
    if (this.paused) this.drawPause(c);
  }
  drawHUD(c) {
    const lv = this.lv, n = lv.phases.length;
    c.save(); c.fillStyle = 'rgba(5,4,8,.78)'; c.fillRect(0, 0, W, 30); c.fillStyle = COL.line; c.fillRect(0, 30, W, 1); c.restore();
    txt(c, this.tag + '  ·  ' + lv.title.toUpperCase(), 14, 20, { size: 12, col: COL.gold, w: 700, ls: 2 });
    for (let i = 0; i < n; i++) {
      const x = W / 2 - (n - 1) * 11 + i * 22;
      c.beginPath(); c.arc(x, 15, 5, 0, 7);
      c.fillStyle = i < this.i ? COL.gold : i === this.i ? hexA(COL.gold, .45) : 'rgba(255,255,255,.12)'; c.fill();
      if (i === this.i) { c.strokeStyle = COL.gold; c.lineWidth = 1; c.stroke(); }
    }
    skull(c, W - 170, 16, .9);
    txt(c, String(S.d.deaths), W - 158, 20, { size: 14, col: COL.ink, w: 700 });
    txt(c, 'phase : ' + this.dh, W - 110, 20, { size: 11, col: COL.dim, w: 600 });
    if (btn(c, W - 40, 4, 32, 22, 'II', { size: 12, cut: 4 })) this.paused = !this.paused;
  }
  drawBubble(c) {
    const a = Math.min(1, this.bub.t * 3);
    c.save(); c.globalAlpha = a;
    const ls = lines(c, this.bub.s, 520, { size: 15, w: 600 });
    const h = 22 + ls.length * 20;
    panel(c, W / 2 - 300, 40, 600, h, { line: hexA(COL.red, .6) });
    headIcon(c, 'golden', W / 2 - 270, 40 + h / 2, 18, { ringCol: COL.red });
    ls.forEach((l, i) => txt(c, l, W / 2 - 240, 40 + 26 + i * 20, { size: 15, col: '#f6dede', w: 600 }));
    c.restore();
  }
  dim(c, a = .82) { c.fillStyle = `rgba(3,2,5,${a})`; c.fillRect(0, 0, W, H); }
  drawIntro(c) {
    const lv = this.lv, host = lv.host, t = G.t;
    this.dim(c, .93);
    softAura(c, 250, 330, CH[host].col, 230, .22);
    if (host === 'golden') goldenAura(c, 250, 440, 3, t);
    if (lv.cast) lv.cast.forEach((id, i) => drawStick(c, id, 110 + i * 56, 440, { s: 1.6, t: t + i, face: 1 }));
    else drawStick(c, host, 250, 440, { s: host === 'golden' ? 3 : 3.4, t, face: 1, cup: host === 'golden' });
    txt(c, lv.boss ? 'LE TRÔNE' : lv.free ? `${lv.tag} / 5  ·  AVEC ${CH[host].name.toUpperCase()}` : 'NIVEAU ' + lv.id + ' / 10', 470, 128, { size: 13, col: COL.gold, w: 700, ls: 5 });
    txt(c, lv.title, 468, 196, { size: 64, f: 'd', col: COL.ink, w: 900, glow: hexA(CH[host].col, .6), blur: 22, max: 470 });
    txt(c, lv.sub.toUpperCase(), 470, 228, { size: 13, col: CH[host].col, w: 700, ls: 3 });
    wrap(c, '« ' + lv.quote + ' »', 470, 272, 440, 24, { size: 19, it: true, w: 500, col: '#e9e3f2' });
    txt(c, '— ' + (lv.quoteBy || CH[host].name), 470, 300 + (lines(c, lv.quote, 440, { size: 19 }).length - 1) * 24, { size: 13, col: COL.dim });
    panel(c, 470, 340, 440, 74, { line: 'rgba(255,255,255,.12)' });
    txt(c, 'COMMANDES', 486, 362, { size: 11, col: COL.gold, w: 700, ls: 3 });
    wrap(c, lv.controls, 486, 384, 410, 19, { size: 14, col: COL.ink, w: 500 });
    txt(c, 'Appuie sur une touche', 470, 456, { size: 14, col: COL.dim, a: .55 + .45 * Math.sin(t * 4) });
  }
  drawCard(c) {
    const ph = this.lv.phases[this.i], n = this.lv.phases.length;
    this.dim(c, .74);
    panel(c, 160, 130, 640, 280, { line: hexA(COL.gold, .5), glow: hexA(COL.gold, .25) });
    headIcon(c, 'golden', 222, 196, 34, { ringCol: COL.red });
    txt(c, `PHASE ${this.i + 1} / ${n}`, 276, 178, { size: 12, col: COL.gold, w: 700, ls: 4 });
    txt(c, ph.name, 274, 226, { size: 46, f: 'd', col: COL.ink, w: 900, glow: hexA(COL.gold, .45), max: 500 });
    txt(c, 'PROPHÉTIE DE GOLDEN', 196, 272, { size: 11, col: COL.red, ls: 3, w: 700 });
    wrap(c, '« ' + ph.proph + ' »', 196, 300, 570, 24, { size: 18, col: '#f3dede', w: 500, it: true });
    if (ph.tip) txt(c, ph.tip, 196, 376, { size: 13, col: COL.dim, w: 600, max: 570 });
    txt(c, 'Appuie sur une touche', 784, 398, { al: 'right', size: 12, col: COL.dim, a: .55 + .45 * Math.sin(G.t * 4) });
  }
  drawDead(c) {
    const k = Math.min(1, this.st * 5);
    c.fillStyle = `rgba(36,0,6,${.6 * k})`; c.fillRect(0, 0, W, H);
    c.save(); c.translate(480, 210); c.rotate(-.07); const sc = 1 + (1 - k) * 1.4; c.scale(sc, sc);
    txt(c, 'PRÉDIT.', 0, 0, { al: 'center', bl: 'middle', size: 112, f: 'd', col: COL.red, w: 900, glow: '#ff0020', blur: 30, a: k });
    c.restore();
    panel(c, 190, 316, 580, 96, { line: hexA(COL.red, .5) });
    headIcon(c, 'golden', 238, 364, 30, { ringCol: COL.red });
    wrap(c, this.taunt, 284, 352, 470, 23, { size: 19, col: COL.ink, w: 600 });
    if (this.deathMsg) txt(c, this.deathMsg, 284, 398, { size: 13, col: '#c9a9ae', w: 500, max: 470 });
    txt(c, `MORT N°${S.d.deaths}   ·   ${this.dh} DANS CETTE PHASE`, 480, 446, { al: 'center', size: 12, col: hexA(COL.red, .85), ls: 2, w: 700 });
  }
  drawClear(c) {
    const k = Math.min(1, this.st * 4);
    this.dim(c, .5 * k);
    txt(c, 'PHASE FRANCHIE', 480, 260, { al: 'center', bl: 'middle', size: 54, f: 'd', col: COL.gold, w: 900, glow: COL.gold, blur: 24, a: k });
    txt(c, U.pick(['Golden prend note.', 'Golden fronce les sourcils.', 'Golden sirote son café.']), 480, 306, { al: 'center', size: 15, col: COL.dim, a: k });
  }
  drawDone(c) {
    const lv = this.lv, k = Math.min(1, this.st * 3);
    this.dim(c, .88 * k);
    c.save(); c.globalAlpha = k;
    softAura(c, 480, 190, CH[lv.host].col, 180, .3);
    if (lv.cast) lv.cast.forEach((id, i) => drawStick(c, id, 480 - 140 + i * 56, 230, { s: 1.4, t: G.t + i }));
    else drawStick(c, lv.host, 480, 230, { s: 2.4, t: G.t, cup: lv.host === 'golden' });
    txt(c, 'NIVEAU TERMINÉ', 480, 300, { al: 'center', size: 58, f: 'd', col: COL.gold, w: 900, glow: COL.gold, blur: 20 });
    txt(c, lv.freed || `${CH[lv.host].name} est libéré.`, 480, 336, { al: 'center', size: 18, col: COL.ink });
    txt(c, `${S.d.lvDeaths[lv.id] || 0} morts dans ce niveau  ·  ${S.d.deaths} au total`, 480, 368, { al: 'center', size: 13, col: COL.dim });
    txt(c, '« Ce n\'était qu\'une répétition. » — Golden', 480, 404, { al: 'center', size: 14, it: true, col: hexA(COL.red, .9) });
    txt(c, lv.free ? 'Appuie sur une touche pour revenir au mode libre' : 'Appuie sur une touche pour revenir au palais', 480, 452, { al: 'center', size: 13, col: COL.dim, a: .55 + .45 * Math.sin(G.t * 4) });
    c.restore();
  }
  drawPause(c) {
    this.dim(c, .86);
    txt(c, 'PAUSE', 480, 150, { al: 'center', size: 64, f: 'd', col: COL.gold, w: 900, glow: COL.gold });
    txt(c, '« Même en pause, je te vois. »', 480, 186, { al: 'center', size: 15, it: true, col: COL.dim });
    if (btn(c, 360, 220, 240, 48, 'Reprendre')) this.paused = false;
    if (btn(c, 360, 278, 240, 48, 'Recommencer la phase')) { this.paused = false; this.restartPhase(); }
    if (btn(c, 360, 336, 240, 48, this.lv.free ? 'Retour au mode libre' : 'Retour au palais')) { this.paused = false; G.go(this.back()); }
    if (btn(c, 360, 394, 240, 48, A.muted ? 'Son : coupé' : 'Son : activé')) A.setMute(!A.muted);
  }
}
