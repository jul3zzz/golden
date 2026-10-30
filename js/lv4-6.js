'use strict';
/* GOLDEN — niveaux 4 à 6 */

/* =========================================================
   NIVEAU 4 — MITTY — Le Fil de Mitty (labyrinthe à la souris)
   ========================================================= */
function mazePhase(cfg) {
  return L => ({
    init() { this.st = 'wait'; this.t = 0; this.trail = []; this.pv = null; this.spd = 0; this.w = cfg.w + (L.pity ? 10 : 0); this.max = cfg.maxSpd ? cfg.maxSpd * (L.pity ? 1.4 : 1) : 0; },
    eff() {
      const m = G.mouse;
      if (m.x < 0 || m.x > W || m.y < 0 || m.y > H) return null;
      return cfg.mirror ? { x: W - m.x, y: m.y } : { x: m.x, y: m.y };
    },
    bars() {
      return (cfg.bars || []).map(b => { const s = Math.sin(this.t * b.spd + (b.ph || 0)) * b.amp; return { x: b.x + (b.ax === 'x' ? s : 0), y: b.y + (b.ax === 'y' ? s : 0), w: b.w, h: b.h }; });
    },
    update(dt) {
      this.t += dt;
      const e = this.eff(), s = cfg.pts[0], g = cfg.pts[cfg.pts.length - 1];
      if (this.st === 'wait') {
        if (e && U.dist(e.x, e.y, s[0], s[1]) < 20 && (G.mouse.click || G.mouse.down)) { G.mouse.click = false; this.st = 'go'; this.pv = e; A.blip(); }
        return;
      }
      if (!e) return L.die('Tu as quitté la zone de jeu. Le fil a cassé.');
      const d = U.dist(e.x, e.y, this.pv.x, this.pv.y);
      this.spd = U.lerp(this.spd, d / Math.max(dt, .001), .2); this.pv = e;
      if (this.max && this.spd > this.max) return L.die('Trop vite. Mitty avait dit : doucement.');
      this.trail.push([e.x, e.y]); if (this.trail.length > 600) this.trail.shift();
      let inside = U.distPoly(e.x, e.y, cfg.pts) <= this.w / 2;
      if (!inside && cfg.decoy && U.distPoly(e.x, e.y, cfg.decoy) <= this.w / 2) inside = true;
      if (!inside) return L.die(U.pick(['Tu as touché le mur.', 'Le mur. Encore le mur.', 'Un pixel de trop.']));
      if (cfg.decoy) { const de = cfg.decoy[cfg.decoy.length - 1]; if (U.dist(e.x, e.y, de[0], de[1]) < 18) return L.die('La fausse sortie. Elle était écrite en gros pourtant.'); }
      for (const b of this.bars()) if (U.inR(e.x, e.y, b.x - 2, b.y - 2, b.w + 4, b.h + 4)) return L.die('Une barre. Tu l\'avais vue, en plus.');
      if (U.dist(e.x, e.y, g[0], g[1]) < 18) L.win();
    },
    corridor(c, pts) {
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.strokeStyle = hexA(COL.gold, .55); c.lineWidth = this.w + 4; c.shadowColor = COL.gold; c.shadowBlur = 12; c.stroke();
      c.shadowBlur = 0; c.strokeStyle = '#120f18'; c.lineWidth = this.w; c.stroke();
      c.restore();
    },
    draw(c) {
      G.cursorNone = true;
      c.fillStyle = '#050407'; c.fillRect(0, 0, W, H);
      c.save(); c.strokeStyle = 'rgba(255,95,162,.04)'; for (let x = 0; x < W; x += 24) seg(c, x, 0, x, H); for (let y = 0; y < H; y += 24) seg(c, 0, y, W, y); c.restore();
      if (cfg.decoy) this.corridor(c, cfg.decoy);
      this.corridor(c, cfg.pts);
      const s = cfg.pts[0], g = cfg.pts[cfg.pts.length - 1];
      if (cfg.decoy) { const de = cfg.decoy[cfg.decoy.length - 1]; c.save(); c.fillStyle = '#3dff7a'; c.shadowColor = '#3dff7a'; c.shadowBlur = 16; c.beginPath(); c.arc(de[0], de[1], 12, 0, 7); c.fill(); c.restore(); txt(c, 'SORTIE', de[0], de[1] - 24, { al: 'center', size: 12, col: '#3dff7a', w: 700, ls: 2 }); txt(c, '(raccourci)', de[0], de[1] + 30, { al: 'center', size: 10, col: COL.dim }); }
      c.save(); c.fillStyle = this.st === 'wait' ? '#ff5fa2' : 'rgba(255,95,162,.3)'; c.shadowColor = '#ff5fa2'; c.shadowBlur = 18 + 8 * Math.sin(this.t * 5); c.beginPath(); c.arc(s[0], s[1], 14, 0, 7); c.fill(); c.restore();
      txt(c, 'DÉPART', s[0], s[1] - 22, { al: 'center', size: 11, col: '#ff5fa2', w: 700, ls: 2 });
      c.save(); c.strokeStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 16; c.lineWidth = 2; c.beginPath(); c.arc(g[0], g[1], 13, 0, 7); c.stroke(); c.restore();
      drawStick(c, 'mitty', g[0] + 26, g[1] + 22, { s: 1.1, t: this.t, face: -1 });
      for (const b of this.bars()) { c.save(); c.fillStyle = COL.red; c.shadowColor = COL.red; c.shadowBlur = 14; c.fillRect(b.x, b.y, b.w, b.h); c.restore(); }
      if (this.trail.length > 1) {
        c.save(); c.strokeStyle = 'rgba(255,95,162,.7)'; c.lineWidth = 1.5; c.shadowColor = '#ff5fa2'; c.shadowBlur = 6;
        c.beginPath(); c.moveTo(s[0], s[1]); this.trail.forEach(p => c.lineTo(p[0], p[1])); c.stroke(); c.restore();
      }
      if (cfg.dark && this.t > 3) {
        const e = this.eff() || { x: -500, y: -500 };
        const rg = c.createRadialGradient(e.x, e.y, 40, e.x, e.y, 105);
        rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.985)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 3; i++) {
          const ex = 160 + i * 320 + Math.sin(this.t * .7 + i * 2) * 60, ey = 140 + i * 110 + Math.cos(this.t * .5 + i) * 40;
          c.save(); c.globalAlpha = .45 + .3 * Math.sin(this.t * 2 + i); c.fillStyle = COL.red; c.shadowColor = COL.red; c.shadowBlur = 16;
          c.beginPath(); c.ellipse(ex - 9, ey, 5, 2, .25, 0, 7); c.ellipse(ex + 9, ey, 5, 2, -.25, 0, 7); c.fill(); c.restore();
        }
        if (this.st === 'wait') { c.save(); c.fillStyle = '#ff5fa2'; c.shadowColor = '#ff5fa2'; c.shadowBlur = 18; c.beginPath(); c.arc(s[0], s[1], 10, 0, 7); c.fill(); c.restore(); }
      } else if (cfg.dark) txt(c, `Mémorise. Lumière coupée dans ${Math.ceil(3 - this.t)}`, 480, 520, { al: 'center', size: 15, col: COL.gold, w: 700 });
      const e = this.eff();
      if (e) {
        c.save(); c.strokeStyle = '#fff'; c.fillStyle = '#ff5fa2'; c.shadowColor = '#ff5fa2'; c.shadowBlur = 12; c.lineWidth = 1.5;
        c.beginPath(); c.arc(e.x, e.y, 4, 0, 7); c.fill(); seg(c, e.x - 9, e.y, e.x - 6, e.y); seg(c, e.x + 6, e.y, e.x + 9, e.y); seg(c, e.x, e.y - 9, e.x, e.y - 6); seg(c, e.x, e.y + 6, e.x, e.y + 9);
        c.restore();
      }
      if (this.st === 'wait') txt(c, cfg.mirror ? 'Clique sur le DÉPART… avec une souris qui va à l\'envers' : 'Clique sur le DÉPART, puis suis le fil sans toucher les murs', 480, 524, { al: 'center', size: 14, col: COL.ink, a: .6 + .4 * Math.sin(this.t * 4) });
      if (this.max) { const r = Math.min(1, this.spd / this.max); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(800, 512, 140, 6); c.fillStyle = r > .8 ? COL.red : '#ff5fa2'; c.fillRect(800, 512, 140 * r, 6); txt(c, 'VITESSE', 800, 506, { size: 10, col: COL.dim, ls: 2 }); }
    }
  });
}

LEVELS.push({
  id: 4, host: 'mitty', title: 'Le Fil de Mitty', sub: 'Labyrinthe à la souris',
  quote: "Calme. Respire. Et surtout, ne touche pas les murs.",
  controls: 'Souris (ou doigt) : clique sur le départ et guide le fil jusqu\'à Mitty sans toucher les bords',
  freed: 'Mitty est libérée. Elle refuse de parler de la phase 3.',
  taunts: ['Ta main tremble. Je le vois d\'ici.', 'Un pixel. Il suffisait d\'un pixel.', 'Mitty est déçue. Moi, je suis ravi.'],
  phases: [
    { name: 'Le Fil', proph: 'Tu vas trembler dans le dernier virage. Pas avant. Le dernier.', make: mazePhase({ w: 44, pts: [[80, 470], [80, 380], [300, 380], [300, 120], [520, 120], [520, 420], [700, 420], [700, 200], [880, 200], [880, 90]] }) },
    {
      name: 'Les Barres Rouges', proph: 'Tu vas attendre. Puis tu vas te précipiter. Mauvais ordre.', make: mazePhase({
        w: 32, pts: [[70, 90], [250, 90], [250, 450], [420, 450], [420, 90], [590, 90], [590, 450], [760, 450], [760, 270], [900, 270]],
        bars: [{ x: 225, y: 265, w: 50, h: 10, ax: 'y', amp: 150, spd: 1.6 }, { x: 395, y: 265, w: 50, h: 10, ax: 'y', amp: 150, spd: 2.1, ph: 1 }, { x: 565, y: 265, w: 50, h: 10, ax: 'y', amp: 150, spd: 2.6, ph: 2 }, { x: 825, y: 245, w: 10, h: 50, ax: 'x', amp: 55, spd: 3 }]
      })
    },
    { name: 'Le Miroir', proph: 'Ta main ira à gauche quand tu voudras aller à droite. Ton cerveau va fondre.', tip: 'Gauche et droite sont inversées. Haut et bas, non.', make: mazePhase({ w: 40, mirror: true, pts: [[880, 470], [880, 300], [640, 300], [640, 470], [400, 470], [400, 110], [150, 110], [150, 420], [60, 420]] }) },
    { name: 'Le Noir', proph: 'Tu vas prendre le raccourci. Tout le monde prend le raccourci.', tip: 'Mémorise le chemin. Ne va pas trop vite : la jauge VITESSE ne doit pas devenir rouge.', make: mazePhase({ w: 34, dark: true, maxSpd: 640, pts: [[70, 270], [240, 270], [240, 100], [480, 100], [480, 440], [700, 440], [700, 170], [890, 170]], decoy: [[240, 190], [130, 190], [130, 470], [60, 470]] }) }
  ]
});

/* =========================================================
   NIVEAU 5 — FONDU — Fondu au Noir (plateformes de mémoire)
   ========================================================= */
const FT = 5.2;
function fadeA(t, T = FT) { const u = t % T; if (u < 2.2) return 0; if (u < 2.7) return (u - 2.2) / .5; if (u < 4.7) return 1; return 1 - (u - 4.7) / .5; }

function fonduDraw(c, w, a, label) {
  w.draw(c, { noPlayer: true });
  if (a > 0) { c.fillStyle = `rgba(2,1,3,${a * .975})`; c.fillRect(0, 0, W, H); }
  w.withCam(c, () => w.drawPlayer(c));
  const u = w.t % FT;
  c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(380, 40, 200, 4);
  c.fillStyle = '#5dff9e'; c.fillRect(380, 40, 200 * (u / FT), 4);
  c.fillStyle = 'rgba(0,0,0,.9)'; c.fillRect(380 + 200 * 2.2 / FT, 40, 200 * 2.5 / FT, 4);
  if (label) txt(c, label, 480, 62, { al: 'center', size: 12, col: '#5dff9e', w: 600 });
}

LEVELS.push({
  id: 5, host: 'fondu', title: 'Fondu au Noir', sub: 'Plateformes de mémoire',
  quote: "Le noir, je connais. C'est la lumière qui me fait peur.",
  controls: '← → ou Q D : bouger  ·  Espace, Z ou ↑ : sauter  ·  attends sur une plateforme sûre pendant le noir',
  freed: 'Fondu est libéré. Sa kippa n\'a pas bougé d\'un millimètre.',
  taunts: ['Dans le noir, je vois tout. Toi, rien.', 'Tu as sauté dans le vide. Littéralement.', 'La mémoire, ce n\'est pas ton fort.'],
  phases: [
    {
      name: 'Le Noir', proph: "Tu vas sauter pendant le noir. Parce que tu n'as pas de patience.",
      make: L => platPhase({
        char: 'fondu', start: [55, 460], eyes: false,
        blocks: [Bk(0, 460, 120, 80), Bk(175, 420, 60, 14), Bk(290, 370, 60, 14), Bk(400, 410, 50, 14), Bk(505, 350, 60, 14), Bk(615, 300, 55, 14), Bk(720, 360, 60, 14), Bk(820, 420, 45, 14), Bk(890, 460, 70, 80)],
        spikes: [Sp(120, 540, 770, 'up')], exit: [930, 460],
        drawWorld: (c, w) => fonduDraw(c, w, fadeA(w.t), 'Lumière ▸ noir ▸ lumière')
      })
    },
    {
      name: 'Ce Qui Bouge', proph: 'Les plateformes vertes bougent dans le noir. Tu vas rester dessus quand même.',
      tip: 'Attends le noir sur les plateformes dorées : elles ne bougent jamais.',
      make: L => {
        const mv = (a, b, w, inv) => Bk(a[0], a[1], w, 14, 'solid', { edge: '#5dff9e', pa: a, pb: b, st: inv ? 1 : 0, mover: true, x: (inv ? b : a)[0], y: (inv ? b : a)[1] });
        const m1 = mv([170, 420], [170, 290], 60), m2 = mv([440, 330], [440, 450], 60, true), m3 = mv([730, 390], [730, 250], 60);
        const gold = { edge: COL.gold };
        return platPhase({
          char: 'fondu', start: [55, 460], eyes: false,
          blocks: [Bk(0, 460, 110, 80, 'solid', gold), m1, Bk(300, 380, 70, 14, 'solid', gold), m2, Bk(590, 330, 70, 14, 'solid', gold), m3, Bk(860, 460, 100, 80, 'solid', gold)],
          spikes: [Sp(110, 540, 750, 'up')], exit: [915, 460],
          init: w => { w.lastK = 0; },
          pre: (dt, w) => {
            const k = Math.floor((w.t + FT - 3.7) / FT);
            if (k !== w.lastK) { w.lastK = k; for (const b of [m1, m2, m3]) { b.st ^= 1; const p = b.st ? b.pb : b.pa; b.x = p[0]; b.y = p[1]; } }
          },
          drawWorld: (c, w) => fonduDraw(c, w, fadeA(w.t), 'Les plateformes vertes changent de place dans le noir')
        });
      }
    },
    {
      name: 'Fondu Enchaîné', proph: 'Deux mondes, un seul solide à la fois. Tu vas sauter une demi-seconde trop tard.',
      tip: 'Saute juste avant que ta plateforme s\'efface : la suivante apparaît pendant ton saut.',
      make: L => {
        const T = L.pity ? 5.2 : 4;
        const A_ = [[165, 420], [385, 380], [605, 400], [800, 370]].map(p => Bk(p[0], p[1], 60, 14, 'solid', { layer: 'A', edge: '#5dff9e' }));
        const B_ = [[275, 400], [495, 360], [710, 390]].map(p => Bk(p[0], p[1], 60, 14, 'solid', { layer: 'B', edge: '#b57bff' }));
        return platPhase({
          char: 'fondu', start: [55, 460], eyes: false,
          blocks: [Bk(0, 460, 120, 80), ...A_, ...B_, Bk(880, 460, 80, 80)],
          spikes: [Sp(120, 540, 760, 'up')], exit: [925, 460],
          pre: (dt, w) => {
            const a = .5 + .5 * Math.cos(w.t * Math.PI * 2 / T), ov = L.pity ? .12 : 0;
            for (const b of A_) { b.nos = a < .5 - ov; b.a = .1 + .9 * a; }
            for (const b of B_) { b.nos = a > .5 + ov; b.a = .1 + .9 * (1 - a); }
          },
          drawWorld: (c, w) => { w.draw(c); txt(c, 'Vert ⇄ violet : un seul monde est solide à la fois', 480, 62, { al: 'center', size: 12, col: COL.dim }); }
        });
      }
    }
  ]
});

/* =========================================================
   NIVEAU 6 — NOROWARETA — Signal Corrompu (glitch + fantômes)
   ========================================================= */
class Ghost {
  constructor(rec, delay) { this.rec = rec; this.t = 0; this.delay = delay; this.by = 'ghost'; }
  pos() { const i = Math.floor((this.t - this.delay) * 30); return i >= 0 && i < this.rec.length ? this.rec[i] : null; }
  update(dt) { this.t += dt; if ((this.t - this.delay) * 30 >= this.rec.length) this.gone = true; }
  hurt(bx) { const p = this.pos(); return p && U.rr(bx, { x: p[0] - 7, y: p[1] - 40, w: 14, h: 36 }); }
  draw(c) {
    const p = this.pos(); if (!p) { if (this.t < this.delay) { const r = this.rec[0]; txt(c, Math.ceil(this.delay - this.t), r[0], r[1] - 60, { al: 'center', size: 16, col: COL.red, w: 700 }); } return; }
    c.save(); c.globalAlpha = .55; drawStick(c, 'noro', p[0], p[1], { face: p[2], t: this.t, run: 1, glow: 0 }); c.restore();
    c.save(); c.globalAlpha = .35; c.fillStyle = COL.red; c.beginPath(); c.arc(p[0], p[1] - 24, 22, 0, 7); c.fill(); c.restore();
  }
}
function glitchBars(c, k) {
  for (let i = 0; i < 6 * k; i++) {
    c.fillStyle = U.pick(['rgba(41,240,255,.22)', 'rgba(255,43,106,.22)', 'rgba(255,255,255,.12)']);
    c.fillRect(U.rnd(-100, W), U.rnd(0, H), U.rnd(80, 500), U.rnd(2, 14));
  }
}

LEVELS.push({
  id: 6, host: 'noro', title: 'Signal Corrompu', sub: 'Plateformes glitchées',
  quote: "J'existe à 72 %. Les 28 % restants, c'est Golden qui les a.",
  controls: '← → ou Q D : bouger  ·  Espace / Z : sauter  ·  Maj ou X : phaser à travers les lasers (0,6 s)',
  freed: 'Norowareta est libéré. Enfin, 72 % de lui.',
  taunts: ['Signal perdu. Joueur aussi.', 'Tes anciennes versions te détestent.', 'Erreur 0xRAGE.'],
  phases: [
    {
      name: 'Les Lasers', proph: 'Tu vas phaser trop tôt. Puis trop tard. Puis trop tôt.',
      tip: 'Maj ou X rend Norowareta intangible 0,6 s, puis il lui faut 1,25 s pour recharger.',
      make: L => platPhase({
        char: 'noro', start: [60, 460],
        blocks: [Bk(0, 460, 360, 80), Bk(440, 460, 520, 80), Bk(250, 0, 10, 460, 'laser'), Bk(540, 0, 10, 460, 'laser'), Bk(610, 0, 10, 460, 'laser'), Bk(780, 0, 10, 460, 'laser', { blink: 1.6 })],
        spikes: [Sp(360, 540, 80, 'up')], exit: [900, 460],
        over: (c, w) => { const p = w.p; txt(c, p.pcd > 0 ? 'RECHARGE' : 'PHASE PRÊTE', 480, 62, { al: 'center', size: 12, col: p.pcd > 0 ? COL.dim : '#29f0ff', w: 700, ls: 3 }); }
      })
    },
    {
      name: 'Commandes Corrompues', proph: 'Tes commandes vont s\'inverser au pire moment. Je choisis le moment.',
      tip: 'Toutes les 6 secondes, gauche et droite s\'échangent. Un glitch te prévient juste avant.',
      make: L => platPhase({
        char: 'noro', start: [60, 460], w: 1600,
        blocks: [Bk(0, 460, 300, 80), Bk(380, 420, 80, 14), Bk(520, 380, 80, 14), Bk(660, 420, 120, 14), Bk(840, 460, 300, 80), Bk(1200, 400, 80, 14), Bk(1340, 460, 260, 80),
          Bk(718, 0, 10, 420, 'laser'), Bk(980, 0, 10, 460, 'laser', { blink: 1.4 }), Bk(1060, 0, 10, 460, 'laser'), Bk(1460, 0, 10, 460, 'laser', { blink: 1.2, bp: .5 })],
        spikes: [Sp(300, 540, 540, 'up'), Sp(1140, 540, 200, 'up')], exit: [1560, 460],
        init: w => { w.sw = 6; },
        pre: (dt, w) => { w.sw -= dt; if (w.sw <= 0) { w.sw = L.pity ? 8 : 6; w.swap = !w.swap; A.zap(); G.shake = 6; } },
        over: (c, w) => {
          if (w.sw < .8) glitchBars(c, 1 - w.sw / .8);
          txt(c, 'COMMANDES : ' + (w.swap ? 'INVERSÉES' : 'NORMALES'), 480, 62, { al: 'center', size: 14, col: w.swap ? COL.red : '#29f0ff', w: 700, ls: 3 });
          txt(c, w.sw.toFixed(1) + ' s', 480, 82, { al: 'center', size: 11, col: COL.dim });
        }
      })
    },
    {
      name: 'Tes Anciennes Versions', proph: 'Chaque mort laisse un fantôme. Tes fantômes connaissent ton chemin. Ils arrivent.',
      tip: 'L\'écran est en miroir. Tes 3 derniers essais rejouent ton trajet 1,2 s après toi : ne t\'arrête pas.',
      make: L => {
        const m = L.m; m.ghosts = m.ghosts || [];
        let rec = [], acc = 0;
        return platPhase({
          char: 'noro', start: [60, 460], w: 1400, mirror: true,
          blocks: [Bk(0, 460, 260, 80), Bk(330, 410, 70, 14), Bk(460, 360, 70, 14), Bk(600, 420, 200, 14), Bk(860, 460, 240, 80), Bk(1160, 400, 70, 14), Bk(1270, 460, 130, 80),
            Bk(700, 0, 10, 420, 'laser'), Bk(980, 0, 10, 460, 'laser', { blink: 1.3 })],
          spikes: [Sp(260, 540, 600, 'up'), Sp(1100, 540, 170, 'up'), Sp(900, 460, 48, 'up')], exit: [1350, 460],
          init: w => { m.ghosts.slice(-3).forEach((r, i) => w.ents.push(new Ghost(r, 1.2 + i * .25))); },
          post: (dt, w) => { acc += dt; while (acc >= 1 / 30) { acc -= 1 / 30; rec.push([w.p.x, w.p.y, w.p.face]); } },
          onDie: () => { if (rec.length > 20) { m.ghosts.push(rec); if (m.ghosts.length > 3) m.ghosts.shift(); } },
          over: (c, w) => txt(c, `FANTÔMES : ${Math.min(3, m.ghosts.length)}`, 480, 62, { al: 'center', size: 12, col: COL.red, w: 700, ls: 3 })
        });
      }
    }
  ]
});
