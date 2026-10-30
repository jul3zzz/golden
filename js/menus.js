'use strict';
/* GOLDEN — écran titre, palais (carte), galerie, fin */

function throneBg(c, t) {
  c.fillStyle = '#060509'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(700, 300, 20, 700, 300, 520);
  g.addColorStop(0, 'rgba(120,12,24,.30)'); g.addColorStop(.5, 'rgba(60,40,8,.10)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.strokeStyle = 'rgba(242,193,78,.06)'; c.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const x = 560 + i * 50; seg(c, x, 0, x + Math.sin(t * .3 + i) * 6, H); }
  c.restore();
}

function soundBtn(c, x, y) { if (btn(c, x, y, 110, 30, A.muted ? 'Son : coupé' : 'Son : activé', { size: 12, cut: 5 })) A.setMute(!A.muted); }

class TitleScene {
  enter() { this.t = 0; this.qx = 70; this.qy = 432; this.quit = 0; this.quitN = 0; A.amb(.04); G.touchUI(false); }
  update(dt) {
    this.t += dt;
    const m = G.mouse, cx = this.qx + 110, cy = this.qy + 23, d = U.dist(m.x, m.y, cx, cy);
    if (d < 120 && d > 0 && this.quitN < 6) { this.qx += (cx - m.x) / d * 460 * dt; this.qy += (cy - m.y) / d * 460 * dt; }
    this.qx = U.clamp(this.qx, 16, W - 236); this.qy = U.clamp(this.qy, 40, H - 60);
    if (this.quit > 0) this.quit -= dt;
    if (G.hit.Enter) G.go(new MapScene());
  }
  draw(c) {
    const t = this.t;
    throneBg(c, t);
    goldenAura(c, 720, 470, 4.2, t);
    drawStick(c, 'golden', 720, 470, { s: 4.2, t, face: -1, drink: Math.sin(t * .7) > .75 });
    CH_ORDER.forEach((id, i) => {
      const x = 540 + i * 70 - (i > 2 ? -150 : 0), y = 520;
      c.save(); c.globalAlpha = .55; drawStick(c, id, i < 3 ? 470 + i * 46 : 830 + (i - 3) * 46, y, { s: 1, t: t + i, glow: 4 }); c.restore();
    });
    txt(c, 'GOLDEN', 64, 196, { size: 138, f: 'd', col: COL.gold, w: 900, glow: hexA(COL.gold, .7), blur: 30 });
    txt(c, 'LE ROI DU RAGEBAIT', 70, 236, { size: 16, col: COL.red, w: 700, ls: 8 });
    txt(c, 'Il a déjà prédit comment tu vas perdre.', 70, 272, { size: 17, it: true, col: COL.ink, w: 500 });
    txt(c, '10 niveaux · 1 trône · un mode libre · environ une heure de rage', 70, 296, { size: 13, col: COL.dim });
    if (btn(c, 70, 320, 220, 48, S.d.deaths || S.d.unlocked > 1 ? 'CONTINUER' : 'JOUER', { size: 20, w: 700 })) G.go(new MapScene());
    if (btn(c, 70, 376, 220, 44, 'MODE LIBRE', { size: 16, col: COL.gold })) G.go(new FreeScene());
    if (btn(c, 300, 376, 170, 44, 'PERSONNAGES', { size: 14 })) G.go(new GalleryScene());
    if (btn(c, this.qx, this.qy, 220, 44, 'QUITTER', { size: 16, col: COL.red })) { this.quitN++; this.quit = 2.6; A.oi('Tu ne pars pas.'); }
    if (this.quit > 0) txt(c, this.quitN < 3 ? '« Tu ne pars pas. » — Golden' : this.quitN < 6 ? '« Ferme l\'onglet si tu oses. Je le saurai. »' : '« Bon. Le bouton ne bouge plus. Ça ne change rien. »', 70, 492, { size: 15, it: true, col: COL.red, a: Math.min(1, this.quit) });
    if (S.d.deaths) { skull(c, 846, 28, .9); txt(c, `${S.d.deaths} morts`, 860, 32, { size: 13, col: COL.ink, w: 700 }); }
    soundBtn(c, 16, 14);
  }
}

const NODES = [[110, 432], [250, 432], [390, 432], [530, 432], [670, 432], [810, 432], [810, 290], [650, 290], [490, 290], [330, 290], [150, 178]];

class MapScene {
  enter() { this.t = 0; this.sel = -1; this.reset = 0; A.amb(.04); G.touchUI(false); }
  update(dt) {
    this.t += dt; if (this.reset > 0) this.reset -= dt;
    if (G.hit.Escape) G.go(new TitleScene());
    const m = G.mouse; this.sel = -1;
    NODES.forEach((n, i) => { if (U.dist(m.x, m.y, n[0], n[1]) < 34) this.sel = i; });
    if (this.sel >= 0) {
      G.hover = true;
      if (m.click && this.sel < S.d.unlocked) { m.click = false; A.click(); G.go(new LevelRun(LEVELS[this.sel])); }
      else if (m.click) { m.click = false; A.blip(160); P.pop(NODES[this.sel][0], NODES[this.sel][1] - 50, 'Verrouillé', COL.red, 14); }
    }
    P.update(dt);
  }
  draw(c) {
    const t = this.t, un = S.d.unlocked;
    throneBg(c, t);
    txt(c, 'LE PALAIS DE LA RAGE', 40, 64, { size: 46, f: 'd', col: COL.gold, w: 900, glow: hexA(COL.gold, .5) });
    txt(c, 'Dix salles, un trône. Golden attend en haut.', 42, 90, { size: 14, col: COL.dim });
    c.save(); c.lineWidth = 2; c.setLineDash([2, 8]); c.lineCap = 'round';
    for (let i = 0; i < NODES.length - 1; i++) { c.strokeStyle = i + 1 < un ? hexA(COL.gold, .7) : 'rgba(255,255,255,.12)'; seg(c, NODES[i][0], NODES[i][1], NODES[i + 1][0], NODES[i + 1][1]); }
    c.restore();
    NODES.forEach((n, i) => {
      const lv = LEVELS[i], open = i < un, done = S.d.done[lv.id], hov = this.sel === i, boss = lv.boss;
      const r = boss ? 40 : 30;
      if (boss) goldenAura(c, n[0], n[1] + 40, 1.2, t, open ? 1 : .3);
      c.save();
      c.beginPath(); c.arc(n[0], n[1], r + (hov ? 4 : 0), 0, 7);
      c.fillStyle = open ? '#100c16' : '#08070b'; c.fill();
      c.strokeStyle = done ? COL.gold : open ? hexA(CH[lv.host].col, .8) : 'rgba(255,255,255,.12)'; c.lineWidth = done ? 3 : 2;
      if (open) { c.shadowColor = c.strokeStyle; c.shadowBlur = hov ? 22 : 10; }
      c.stroke(); c.restore();
      c.save(); c.globalAlpha = open ? 1 : .25;
      c.beginPath(); c.arc(n[0], n[1], r - 2, 0, 7); c.clip();
      if (lv.cast) ['fanta', 'none', 'mitty'].forEach((id, k) => drawStick(c, id, n[0] - 13 + k * 13, n[1] + 19, { s: .62, t: t + k, glow: 4 }));
      else drawStick(c, lv.host, n[0], n[1] + (boss ? 30 : 22), { s: boss ? 1 : .8, t, glow: 5, noCape: true, cup: lv.host === 'golden' });
      c.restore();
      txt(c, boss ? 'TRÔNE' : String(lv.id), n[0], n[1] + r + 18, { al: 'center', size: boss ? 11 : 13, col: open ? COL.ink : COL.dim, w: 700, ls: boss ? 3 : 0 });
      if (!open) { c.save(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(n[0], n[1] - 4, 6, Math.PI, 0); c.stroke(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(n[0] - 8, n[1] - 4, 16, 12); c.restore(); }
      if (S.d.phase[lv.id] && open) txt(c, `phase ${S.d.phase[lv.id] + 1}`, n[0], n[1] - r - 8, { al: 'center', size: 10, col: COL.gold });
    });
    const i = this.sel >= 0 ? this.sel : Math.min(un - 1, NODES.length - 1), lv = LEVELS[i];
    panel(c, 400, 118, 520, 128, { line: hexA(CH[lv.host].col, .5) });
    txt(c, (lv.boss ? 'LE TRÔNE' : 'NIVEAU ' + lv.id) + (i < un ? '' : '  ·  VERROUILLÉ'), 420, 144, { size: 11, col: CH[lv.host].col, w: 700, ls: 3 });
    txt(c, lv.title, 420, 182, { size: 34, f: 'd', col: COL.ink, w: 900, max: 480 });
    txt(c, lv.sub + (lv.cast ? '  ·  les six' : '  ·  ' + CH[lv.host].name), 420, 206, { size: 14, col: COL.dim });
    txt(c, S.d.done[lv.id] ? `Terminé · ${S.d.lvDeaths[lv.id] || 0} morts` : (S.d.lvDeaths[lv.id] ? `${S.d.lvDeaths[lv.id]} morts ici` : (i < un ? 'Clique pour entrer' : 'Termine le niveau précédent')), 420, 230, { size: 13, col: S.d.done[lv.id] ? COL.gold : COL.ink });
    c.fillStyle = 'rgba(5,4,8,.8)'; c.fillRect(0, 506, W, 34); c.fillStyle = COL.line; c.fillRect(0, 506, W, 1);
    skull(c, 26, 523, .9);
    txt(c, `${S.d.deaths} morts   ·   ${U.fmtTime(S.d.time)} de jeu   ·   Prophétie de Golden : ▮▮▮ morts (scellée jusqu'à la fin)`, 42, 528, { size: 13, col: COL.ink });
    if (btn(c, 800, 20, 140, 32, 'Personnages', { size: 13, cut: 5 })) G.go(new GalleryScene());
    if (btn(c, 680, 20, 110, 32, 'Titre', { size: 13, cut: 5 })) G.go(new TitleScene());
    soundBtn(c, 560, 21);
    if (btn(c, 800, 470, 140, 28, this.reset > 0 ? 'Sûr ? Re-clique' : 'Tout effacer', { size: 11, cut: 4, col: COL.red })) {
      if (this.reset > 0) { S.reset(); this.reset = 0; P.pop(480, 300, 'Progression effacée. Golden a tout gardé en mémoire.', COL.red, 16); } else this.reset = 3;
    }
    P.draw(c);
  }
}

class GalleryScene {
  enter() { this.t = 0; this.ids = ['golden', ...CH_ORDER]; this.i = 0; G.touchUI(false); }
  update(dt) {
    this.t += dt;
    if (G.hit.ArrowRight || G.hit.KeyD) this.i = (this.i + 1) % this.ids.length;
    if (G.hit.ArrowLeft || G.hit.KeyA) this.i = (this.i + this.ids.length - 1) % this.ids.length;
    if (G.hit.Escape) G.go(new MapScene());
    const m = G.mouse;
    if (m.click) this.ids.forEach((id, k) => { if (U.dist(m.x, m.y, 210 + k * 90, 484) < 30) { m.click = false; this.i = k; A.click(); } });
  }
  draw(c) {
    const id = this.ids[this.i], ch = CH[id], t = this.t;
    throneBg(c, t);
    softAura(c, 260, 300, ch.col, 220, .25);
    if (id === 'golden') goldenAura(c, 260, 400, 3.6, t);
    c.save(); c.fillStyle = '#0f0c14'; c.beginPath(); c.ellipse(260, 404, 110, 18, 0, 0, 7); c.fill(); c.strokeStyle = hexA(ch.col, .5); c.stroke(); c.restore();
    drawStick(c, id, 260, 400, { s: id === 'golden' ? 3.6 : 4.2, t, run: Math.sin(t * .8) > .5 ? 1 : 0, drink: id === 'golden' && Math.sin(t * .7) > .7 });
    txt(c, 'LES PERSONNAGES', 480, 70, { size: 12, col: COL.dim, w: 700, ls: 4 });
    txt(c, ch.name, 478, 140, { size: 72, f: 'd', col: ch.col, w: 900, glow: hexA(ch.col, .5), blur: 22, max: 450 });
    txt(c, ch.title.toUpperCase(), 482, 172, { size: 14, col: COL.ink, w: 700, ls: 4 });
    wrap(c, ch.desc, 482, 218, 420, 25, { size: 18, col: '#ddd6e8', w: 500 });
    panel(c, 482, 320, 420, 64, { line: hexA(ch.col, .5) });
    txt(c, id === 'golden' ? 'POUVOIR' : 'CAPACITÉ', 498, 344, { size: 11, col: ch.col, w: 700, ls: 3 });
    txt(c, ch.power, 498, 368, { size: 16, col: COL.ink, w: 600, max: 390 });
    this.ids.forEach((k, j) => headIcon(c, k, 210 + j * 90, 484, 26, { ringCol: j === this.i ? CH[k].col : 'rgba(255,255,255,.15)' }));
    txt(c, '← → pour changer', 860, 530, { al: 'right', size: 12, col: COL.dim });
    if (btn(c, 24, 20, 120, 32, '← Retour', { size: 13, cut: 5 })) G.go(new MapScene());
  }
}

class EndScene {
  enter() { this.t = 0; S.d.finished = true; S.d.unlocked = Math.max(S.d.unlocked, 12); S.save(); A.amb(.03); G.touchUI(false); this.n = S.d.deaths; setTimeout(() => A.oi('oï oï oï… évidemment.'), 2600); }
  update(dt) { this.t += dt; if (G.hit.Escape) G.go(new MapScene()); }
  draw(c) {
    const t = this.t;
    throneBg(c, t);
    const k = Math.min(1, t / 1.2);
    c.save(); c.globalAlpha = k;
    panel(c, 170, 50, 620, 250, { line: hexA(COL.gold, .6), glow: hexA(COL.gold, .3) });
    txt(c, 'LA PROPHÉTIE DE GOLDEN', 480, 92, { al: 'center', size: 13, col: COL.gold, w: 700, ls: 5 });
    txt(c, 'Écrite avant ta toute première partie :', 480, 126, { al: 'center', size: 16, it: true, col: COL.dim });
    const shown = t < 2 ? '▮▮▮' : String(Math.min(this.n, Math.floor((t - 2) * this.n / 1.4)));
    txt(c, `« Tu mourras ${shown} fois. »`, 480, 192, { al: 'center', size: 50, f: 'd', col: COL.ink, w: 900, glow: hexA(COL.red, .5) });
    if (t > 3.6) txt(c, `Tu es mort exactement ${this.n} fois.`, 480, 236, { al: 'center', size: 18, col: COL.ink, a: Math.min(1, t - 3.6) });
    if (t > 4.6) txt(c, 'Évidemment. oi oi oi.', 480, 270, { al: 'center', size: 18, it: true, col: COL.red, a: Math.min(1, t - 4.6) });
    c.restore();
    if (t > 5.6) {
      const a = Math.min(1, t - 5.6);
      c.save(); c.globalAlpha = a;
      [...CH_ORDER, 'golden'].forEach((id, i) => {
        const x = 150 + i * 110;
        if (id === 'golden') goldenAura(c, x, 430, 1.4, t, .7);
        drawStick(c, id, x, 430, { s: id === 'golden' ? 1.6 : 1.5, t: t + i, run: Math.sin(t * 1.5 + i) > .3 ? 1 : 0, cup: id === 'golden' });
        txt(c, CH[id].name, x, 456, { al: 'center', size: 12, col: CH[id].col, w: 700 });
      });
      txt(c, `Temps total : ${U.fmtTime(S.d.time)}  ·  Merci d'avoir joué.  ·  Golden reviendra. Il l'a déjà prédit.`, 480, 336, { al: 'center', size: 14, col: COL.dim });
      if (btn(c, 300, 480, 170, 40, 'Retour au palais', { size: 14 })) G.go(new MapScene());
      if (btn(c, 490, 480, 170, 40, 'Rejouer le trône', { size: 14 })) G.go(new LevelRun(LEVELS[10]));
      c.restore();
    }
  }
}

G.boot(new TitleScene());
