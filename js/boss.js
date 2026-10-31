'use strict';
/* GOLDEN — le trône : combat final contre Golden */

class Wave {
  constructor(x, dir) { this.x = x; this.dir = dir; this.t = 0; }
  update(dt) { this.t += dt; this.x += this.dir * 380 * dt; if (this.x < -60 || this.x > W + 60) this.gone = true; }
  hurt(bx) { return U.rr(bx, { x: this.x - 12, y: 434, w: 24, h: 26 }); }
  draw(c) {
    c.save(); c.strokeStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 14; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { c.globalAlpha = 1 - i * .3; c.beginPath(); c.arc(this.x - this.dir * i * 9, 460, 26 - i * 4, Math.PI, Math.PI * 2); c.stroke(); }
    c.restore();
    txt(c, 'oi', this.x, 426, { al: 'center', size: 14, f: 'd', col: COL.gold, w: 900 });
  }
}
class Cup {
  constructor(x, y, vx, vy, boss) { Object.assign(this, { x, y, vx, vy, boss, r: 0 }); }
  update(dt) {
    this.vy += 1200 * dt; this.x += this.vx * dt; this.y += this.vy * dt; this.r += dt * 8;
    if (this.y >= 452) { this.gone = true; this.boss.haz.push(new Puddle(this.x)); P.burst(this.x, 456, 10, '#7a4a22', 160, .5); A.crack(); }
  }
  hurt(bx) { return U.circRect(this.x, this.y, 10, bx); }
  draw(c) {
    c.save(); c.translate(this.x, this.y); c.rotate(this.r);
    c.fillStyle = '#16100a'; c.strokeStyle = COL.gold; c.lineWidth = 1.5; c.shadowColor = COL.gold; c.shadowBlur = 8;
    c.beginPath(); c.moveTo(-7, -8); c.lineTo(7, -8); c.lineTo(5, 8); c.lineTo(-5, 8); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
}
class Puddle {
  constructor(x) { this.x = x; this.life = 1.9; }
  update(dt) { this.life -= dt; if (this.life <= 0) this.gone = true; }
  hurt(bx) { return this.life > .15 && U.rr(bx, { x: this.x - 32, y: 452, w: 64, h: 10 }); }
  draw(c) { c.save(); c.globalAlpha = Math.min(1, this.life * 2); c.fillStyle = '#5a3416'; c.shadowColor = '#c08a3a'; c.shadowBlur = 10; c.beginPath(); c.ellipse(this.x, 459, 34, 5, 0, 0, 7); c.fill(); c.restore(); }
}
class Bullet {
  constructor(x, y, vx, vy) { Object.assign(this, { x, y, vx, vy }); }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.gone = true; }
  hurt(bx) { return U.circRect(this.x, this.y, 5, bx); }
  draw(c) { c.save(); c.fillStyle = '#ff2b3a'; c.shadowColor = '#ff2b3a'; c.shadowBlur = 14; c.beginPath(); c.arc(this.x, this.y, 6, 0, 7); c.fill(); c.fillStyle = '#ffd8d8'; c.beginPath(); c.arc(this.x, this.y, 2.5, 0, 7); c.fill(); c.restore(); }
}

function bossPhase(cfg) {
  return L => ({
    init() {
      this.w = new World({ char: CH_ORDER[0], start: [200, 460], eyes: false, noDie: true, blocks: [Bk(0, 460, 960, 80), Bk(150, 385, 150, 14), Bk(660, 385, 150, 14)] });
      this.w.hurtCb = () => this.hurt();
      this.li = 0; this.t = 0; this.cd = 0; this.flip = 0; this.haz = []; this.shots = [];
      this.g = { x: 480, y: 210, hp: cfg.hp || 1, max: cfg.hp || 1, vul: 0, flash: 0, dash: null };
      this.q = -1; this.at = null; this.ending = 0;
      this.mode = cfg.final ? 'credits' : 'fight'; this.mt = 0; this.dodges = 0; this.still = 0;
      this.survive = L.pity ? 22 : 30;
      if (!cfg.final) this.nextAtk();
    },
    say(s, d) { L.say(s, d); },
    nextAtk() { this.q = (this.q + 1) % cfg.script.length; this.at = { n: cfg.script[this.q], t: 0, i: 0, rt: 0 }; const a = this.at.n; if (a === 'drink') this.g.vul = cfg.drink; if (a === 'oi') A.oi(); },
    hurt() {
      const p = this.w.p;
      if (p.inv > 0 || this.ending || this.mode === 'blow' || this.mode === 'still' || this.mode === 'break') return;
      this.li++; A.die(); G.shake = 12; G.flash = .25; G.flashCol = '#ff1030';
      P.burst(p.x, p.y - 22, 30, CH[this.w.char].col, 300);
      if (this.li >= 6) return L.die('Les six sont tombés. Golden n\'a pas renversé une goutte de café.');
      const prev = CH_ORDER[this.li - 1], next = CH_ORDER[this.li];
      const { x, y, face } = p;
      this.w.setChar(next); Object.assign(this.w.p, { x, y, face, inv: 1.6 });
      this.say(`${CH[prev].name} ${prev === 'mitty' ? 'est tombée' : 'est tombé'}. ${CH[next].name} prend le relais.`, 2);
    },
    updAtk(dt) {
      const a = this.at, g = this.g, p = this.w.p; a.t += dt;
      switch (a.n) {
        case 'oi':
          if (a.t < .1 && !a.said) { a.said = 1; this.say('oi oi oi.', 1.2); }
          while (a.i < 3 && a.t >= .35 + a.i * .5) { a.i++; this.haz.push(new Wave(g.x, -1), new Wave(g.x, 1)); A.beat(); G.shake = 5; }
          if (a.t > 2.7) this.nextAtk(); break;
        case 'cups':
          while (a.i < 5 && a.t >= .2 + a.i * .35) { a.i++; const T = .9, tx = U.clamp(p.x + U.rnd(-30, 30), 20, 940); this.haz.push(new Cup(g.x, g.y - 70, (tx - g.x) / T, (452 - (g.y - 70) - .5 * 1200 * T * T) / T, this)); A.blip(300); }
          if (a.t > 3) this.nextAtk(); break;
        case 'predict':
          while (a.i < 5 && a.t >= a.i * .7) {
            a.i++; const lead = .8;
            this.haz.push(new Strike(U.clamp(p.x + p.vx * lead, 30, 930), lead));
            if (a.i === 1) this.say(p.vx < 0 ? 'Tu vas aller à gauche.' : p.vx > 0 ? 'Tu vas aller à droite.' : 'Tu vas bouger. Enfin.', 1.4);
          }
          if (a.t > 4.3) this.nextAtk(); break;
        case 'dash':
          if (!g.dash) {
            if (a.i >= 2) { this.nextAtk(); break; }
            a.i++; const from = p.x < 480 ? 1010 : -50, ty = U.clamp(p.ground ? p.y : p.y + p.vy * .25, 250, 460);
            g.dash = { dir: from > 480 ? -1 : 1, t: 0 }; g.x = from; g.y = ty; A.warn();
          }
          break;
        case 'rings':
          while (a.i < 3 && a.t >= a.i * .9) {
            a.i++; const n = 22, gap = U.ri(0, n - 1);
            for (let k = 0; k < n; k++) { const d = Math.min(Math.abs(k - gap), n - Math.abs(k - gap)); if (d <= 1) continue; const ang = k / n * Math.PI * 2 + a.i * .4; this.haz.push(new Bullet(g.x, g.y - 60, Math.cos(ang) * 185, Math.sin(ang) * 185)); }
            A.zap();
          }
          if (a.t > 3.6) this.nextAtk(); break;
        case 'flip':
          if (!a.i) { a.i = 1; this.flip = 5; this.say('Le monde à l\'envers. Comme ta tête.', 2); }
          a.rt -= dt; if (a.rt <= 0) { a.rt = .4; this.haz.push(new Cup(U.rnd(30, 930), -10, 0, 0, this)); }
          if (a.t > 5) this.nextAtk(); break;
        case 'drink':
          if (a.t > cfg.drink) this.nextAtk(); break;
      }
    },
    update(dt) {
      this.t += dt; this.mt += dt;
      const g = this.g, w = this.w, p = w.p;
      if (this.flip > 0) this.flip -= dt;
      if (g.vul > 0) g.vul -= dt; if (g.flash > 0) g.flash -= dt;
      if (this.mode === 'credits') { if (this.mt > 5.5) { this.mode = 'rise'; this.mt = 0; A.oi(); G.flash = .5; G.flashCol = '#ff1030'; G.shake = 20; } return; }
      if (this.mode === 'rise') { if (this.mt > 2.2) { this.mode = 'survive'; this.mt = 0; this.nextAtk(); this.say('Tu croyais vraiment que c\'était fini ? oi oi oi.', 3); } w.update(dt); return; }
      if (this.mode === 'break') { if (this.mt > 2.6) return L.win(); return; }
      if (this.ending > 0) { this.ending -= dt; if (this.ending <= 0) return L.win(); return; }

      w.update(dt);
      // déplacement de Golden
      if (g.dash) {
        g.dash.t += dt;
        if (g.dash.t > .7) {
          g.x += g.dash.dir * 1150 * dt;
          if (g.x < -80 || g.x > W + 80) { g.dash = null; g.y = 210; }
        }
      } else if (this.mode !== 'blow' && this.mode !== 'still') {
        const tx = 480 + Math.sin(this.t * .6) * 240;
        g.x += (tx - g.x) * Math.min(1, dt * 2.5); g.y += (210 + Math.sin(this.t * 1.3) * 12 - g.y) * Math.min(1, dt * 3);
      }
      if (this.mode === 'fight' || this.mode === 'survive') this.updAtk(dt);
      if (this.mode === 'survive' && this.mt >= this.survive) {
        this.mode = 'blow'; this.mt = 0; this.haz = []; this.at = null; g.dash = null; g.x = 480; g.y = 300;
        this.say('…Impossible. Alors frappe-moi. Vas-y.', 3);
      }
      // tirs
      if (this.cd > 0) this.cd -= dt;
      const fire = K.actHit() || G.mouse.click;
      if (this.mode === 'still') {
        this.still += dt;
        if ((G.anyHit && !G.hit.Escape) || G.mouse.click) { G.mouse.click = false; this.still = 0; P.pop(g.x, g.y - 130, 'Prédit.', COL.red, 22); A.zap(); }
        if (this.still >= 5) { this.mode = 'break'; this.mt = 0; A.boom(); G.shake = 30; G.flash = .6; G.flashCol = COL.gold; P.burst(g.x, g.y - 60, 160, COL.gold, 600, 1.6, 4, 200); P.burst(g.x, g.y - 60, 60, COL.red, 400, 1.4, 3, 200); }
        return;
      }
      if (fire && this.cd <= 0) {
        G.mouse.click = false; this.cd = .22;
        if (this.mode === 'blow') {
          this.dodges++; A.zap(); P.pop(g.x, g.y - 130, 'Prédit.', COL.red, 22);
          g.x = U.clamp(p.x + (Math.random() < .5 ? -1 : 1) * U.rnd(160, 300), 80, 880);
          if (this.dodges >= 3) { this.mode = 'still'; this.still = 0; this.say('Il prédit chaque coup… Alors ne fais RIEN. Plus rien du tout.', 5); }
        } else {
          const sx = p.x, sy = p.y - 30, tx = g.x, ty = g.y - 60, d = Math.hypot(tx - sx, ty - sy) || 1;
          this.shots.push({ x: sx, y: sy, vx: (tx - sx) / d * 760, vy: (ty - sy) / d * 760, col: CH[w.char].col }); A.blip(1200);
        }
      }
      for (const s of this.shots) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (U.dist(s.x, s.y, g.x, g.y - 60) < 38) {
          s.dead = true;
          if (g.vul > 0 && !g.dash && this.mode === 'fight') { g.hp--; g.flash = .12; A.punch(); P.burst(s.x, s.y, 14, COL.gold, 260, .5); }
          else { P.pop(s.x, s.y - 10, 'PRÉDIT', COL.red, 13); P.burst(s.x, s.y, 5, COL.red, 120, .3); }
        }
        if (s.x < -20 || s.x > W + 20 || s.y < -20) s.dead = true;
      }
      this.shots = this.shots.filter(s => !s.dead);
      for (const h of this.haz) h.update(dt, this);
      this.haz = this.haz.filter(h => !h.gone);
      const bx = w.box();
      for (const h of this.haz) if (h.hurt(bx)) this.hurt();
      if (g.dash && g.dash.t > .7 && U.rr(bx, { x: g.x - 24, y: g.y - 68, w: 48, h: 68 })) this.hurt();
      if (this.mode === 'fight' && g.hp <= 0 && !this.ending) {
        this.ending = 1.8; this.haz = []; g.vul = 0; A.boom(); G.shake = 18;
        P.burst(g.x, g.y - 60, 80, COL.gold, 400, 1.2); this.say(cfg.endLine, 2.2);
      }
    },
    drawGolden(c) {
      const g = this.g, p = this.w.p;
      if (this.mode === 'break') {
        const k = Math.min(1, this.mt / 2);
        c.save(); c.globalAlpha = 1 - k;
        for (let i = 0; i < 8; i++) { c.save(); c.beginPath(); c.rect(g.x - 80, g.y - 140 + i * 18, 160, 18); c.clip(); drawStick(c, 'golden', g.x + (Math.random() - .5) * 60 * k, g.y, { s: 2.4, t: this.t }); c.restore(); }
        c.restore();
        txt(c, 'ERREUR : AUCUN FUTUR À PRÉDIRE', 480, 120, { al: 'center', size: 30, f: 'd', col: COL.red, w: 900, glow: COL.red });
        return;
      }
      if (g.dash && g.dash.t <= .7) {
        c.save(); c.strokeStyle = `rgba(255,43,58,${.4 + .4 * Math.sin(this.t * 30)})`; c.setLineDash([12, 8]); c.lineWidth = 3; c.strokeRect(0, g.y - 68, W, 68); c.restore();
        txt(c, 'PRÉDICTION', g.dash.dir < 0 ? W - 120 : 120, g.y - 76, { al: 'center', size: 12, col: COL.red, w: 700, ls: 3 });
      }
      goldenAura(c, g.x, g.y, 2.4, this.t, g.vul > 0 ? .5 : 1);
      if (g.vul > 0) { c.save(); c.strokeStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 20; c.lineWidth = 2; c.beginPath(); c.arc(g.x, g.y - 60, 46 + 3 * Math.sin(this.t * 10), 0, 7); c.stroke(); c.restore(); }
      drawStick(c, 'golden', g.x, g.y, { s: 2.4, t: this.t, face: p.x < g.x ? -1 : 1, drink: g.vul > 0, run: g.dash ? 1 : 0 });
      if (g.flash > 0) { c.save(); c.globalAlpha = .6; c.fillStyle = '#fff'; c.beginPath(); c.arc(g.x, g.y - 60, 40, 0, 7); c.fill(); c.restore(); }
      if (g.vul > 0) txt(c, 'IL BOIT : TIRE !', g.x, g.y - 128, { al: 'center', size: 14, col: COL.gold, w: 700, ls: 2, glow: COL.gold });
    },
    draw(c) {
      const w = this.w, g = this.g, p = w.p;
      c.save();
      if (this.flip > 0) { c.translate(0, H); c.scale(1, -1); }
      w.draw(c, { noPlayer: true });
      c.fillStyle = 'rgba(242,193,78,.05)'; c.fillRect(380, 60, 200, 340);
      w.drawPlayer(c);
      if (cfg.dark) {
        const rg = c.createRadialGradient(p.x, p.y - 24, 50, p.x, p.y - 24, 170);
        rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.96)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
      }
      for (const h of this.haz) h.draw(c);
      for (const s of this.shots) { c.save(); c.fillStyle = s.col; c.shadowColor = s.col; c.shadowBlur = 12; c.beginPath(); c.arc(s.x, s.y, 4, 0, 7); c.fill(); c.restore(); }
      this.drawGolden(c);
      P.draw(c);
      c.restore();
      if (this.flip > 0) txt(c, 'MONDE INVERSÉ', 480, 520, { al: 'center', size: 13, col: COL.red, w: 700, ls: 3 });
      // HUD du boss
      if (!cfg.final || this.mode === 'fight') {
        txt(c, 'GOLDEN · ROI DU RAGEBAIT', 480, 52, { al: 'center', size: 11, col: COL.gold, w: 700, ls: 3 });
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(280, 58, 400, 8); c.fillStyle = COL.gold; c.fillRect(280, 58, 400 * Math.max(0, g.hp) / g.max, 8);
      } else if (this.mode === 'survive') {
        txt(c, `Golden prédit ta chute dans ${Math.max(0, this.survive - this.mt).toFixed(1)} s`, 480, 58, { al: 'center', size: 16, col: COL.red, w: 700, glow: COL.red });
      } else if (this.mode === 'blow') txt(c, 'X, MAJ OU CLIC : FRAPPER GOLDEN', 480, 58, { al: 'center', size: 15, col: COL.gold, w: 700, ls: 2 });
      else if (this.mode === 'still') {
        txt(c, 'NE TOUCHE À RIEN', 480, 58, { al: 'center', size: 18, col: COL.ink, w: 700, ls: 4 });
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(380, 66, 200, 5); c.fillStyle = COL.gold; c.fillRect(380, 66, 200 * Math.min(1, this.still / 5), 5);
      }
      for (let i = 0; i < 6; i++) {
        const id = CH_ORDER[i], x = 26 + i * 34, dead = i < this.li;
        c.save(); c.globalAlpha = dead ? .25 : 1; headIcon(c, id, x, 512, 13, { ringCol: i === this.li ? CH[id].col : 'rgba(255,255,255,.15)' }); c.restore();
        if (dead) { c.save(); c.strokeStyle = COL.red; c.lineWidth = 2; seg(c, x - 9, 503, x + 9, 521); seg(c, x + 9, 503, x - 9, 521); c.restore(); }
      }
      if (this.mode === 'credits' || this.mode === 'rise') this.drawCredits(c);
    },
    drawCredits(c) {
      const k = this.mode === 'credits' ? Math.min(1, this.mt * 2) : Math.max(0, 1 - this.mt * 1.5);
      c.save(); c.globalAlpha = k; c.fillStyle = '#030205'; c.fillRect(0, 0, W, H);
      txt(c, 'VICTOIRE', 480, 150, { al: 'center', size: 90, f: 'd', col: COL.gold, w: 900, glow: COL.gold, blur: 30 });
      const roll = ['Merci d\'avoir joué !', 'Golden a été vaincu.', 'Jules · None · Fanta · Mitty · Fondu · Norowareta', 'Tu peux fermer le jeu.', 'Vraiment.', 'C\'est fini.', '…', '…non ?'];
      roll.forEach((s, i) => txt(c, s, 480, 260 + i * 34 - this.mt * 22, { al: 'center', size: 18, col: COL.ink, a: U.clamp(1 - Math.abs(260 + i * 34 - this.mt * 22 - 300) / 140, 0, 1) }));
      if (this.mt > 4.4 && this.mode === 'credits') glitchBars(c, 2);
      c.restore();
    }
  });
}

LEVELS.push({
  id: 11, boss: true, host: 'golden', title: 'Le Trône de Golden', sub: 'Combat final', quoteBy: 'Golden',
  quote: 'Je sais déjà comment ça se termine. Viens quand même. oi oi oi.',
  controls: '← → : bouger · Espace : sauter · X, Maj ou clic : tirer (ça ne marche que quand Golden boit son café) · chaque coup reçu fait tomber un des six',
  taunts: ['Le roi ne tombe pas. Le roi prédit.', 'Mon café est encore chaud. Toi, tu refroidis.', 'Six amis. Six chutes. Une prophétie.'],
  onDone: () => G.go(new EndScene()),
  phases: [
    { name: 'oi oi oi', proph: 'Tu vas tirer pendant qu\'il ne boit pas. Tu vas gaspiller ta rage.', tip: 'Saute par-dessus les ondes « oi ». Tire uniquement quand Golden boit son café.', make: bossPhase({ hp: 18, drink: 3, script: ['oi', 'cups', 'drink'], endLine: 'Ce n\'était que l\'échauffement.' }) },
    { name: 'Je Prédis Tout', proph: 'Je frappe là où tu vas. Pas là où tu es. Arrête d\'être là où tu vas.', tip: 'Les cibles rouges visent ta position future : change de direction au dernier moment.', make: bossPhase({ hp: 20, drink: 2.6, script: ['predict', 'dash', 'drink', 'cups', 'predict', 'drink'], endLine: 'Tu commences à m\'agacer. C\'est bien.' }) },
    { name: 'Aura', proph: 'Dans le noir, tu ne vois que mes yeux. Moi, je vois tout.', make: bossPhase({ hp: 22, drink: 2.4, dark: true, script: ['rings', 'flip', 'drink', 'rings', 'oi', 'drink'], endLine: '…Ça suffit.' }) },
    { name: 'La Dernière Prophétie', proph: 'Tu vas croire que c\'est fini. Ce n\'est jamais fini.', make: bossPhase({ final: true, script: ['oi', 'predict', 'cups', 'rings', 'dash'] }) }
  ]
});
