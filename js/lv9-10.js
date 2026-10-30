'use strict';
/* GOLDEN — niveaux 9 et 10 */

/* =========================================================
   NIVEAU 9 — GOLDEN OS — Chargement Infini (fausse interface)
   ========================================================= */
function osDesk(c, t, title) {
  c.fillStyle = '#0a0810'; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = .07; drawStick(c, 'golden', 480, 470, { s: 7, t, noCape: true }); c.restore();
  c.fillStyle = 'rgba(5,4,8,.95)'; c.fillRect(0, 512, W, 28); c.fillStyle = COL.line; c.fillRect(0, 512, W, 1);
  txt(c, 'GoldenOS', 34, 531, { size: 13, f: 'd', col: COL.gold, w: 700 });
  headIcon(c, 'golden', 18, 526, 9);
  const d = new Date();
  txt(c, `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}  ·  café : 97 %`, W - 14, 531, { al: 'right', size: 12, col: COL.dim });
  if (title) txt(c, title, 480, 64, { al: 'center', size: 13, col: COL.gold, w: 700, ls: 3 });
}
function osWin(c, x, y, w, h, title, o = {}) {
  panel(c, x, y, w, h, { fill: 'rgba(14,11,19,.98)', line: o.line || 'rgba(242,193,78,.45)', cut: 4, glow: o.glow });
  c.fillStyle = o.bar || 'rgba(242,193,78,.12)'; c.fillRect(x + 1, y + 1, w - 2, 26);
  txt(c, title, x + 12, y + 18, { size: 13, col: o.tcol || COL.gold, w: 700, max: w - 50 });
}

const POPS = {
  cookie: { title: 'Cookies au café ?', body: 'GoldenOS utilise des cookies pour prédire tes erreurs.', btns: [{ l: 'TOUT ACCEPTER', big: 1, act: 'spawn2' }, { l: 'refuser (déconseillé)', tiny: 1, act: 'close' }] },
  fakex: { title: 'Félicitations !!!', body: 'Tu as gagné une tasse dorée. Ferme pour la récupérer.', x: 'spawn1', btns: [{ l: 'non merci', tiny: 1, act: 'close' }] },
  update: { title: 'Mise à jour', body: 'Golden 2.0 est disponible. Il prédit encore mieux.', btns: [{ l: 'Installer', act: 'spawn1' }, { l: 'Plus tard', act: 'close' }] },
  oi: { title: 'oi oi oi', body: '(cette fenêtre est honnête : sa croix marche)', x: 'close', btns: [] }
};

const popupPhase = L => ({
  init() { this.prog = 0; this.pops = []; this.spawnT = 2.2; this.t = 0; this.warn = 0; },
  add(type) {
    const d = POPS[type || U.pick(['cookie', 'fakex', 'update', 'oi', 'cookie', 'fakex'])];
    const w = 320, h = 156;
    this.pops.push({ d, x: U.rnd(40, W - w - 40), y: U.rnd(80, 340), w, h, age: 0, xj: 0 });
    A.blip(300);
  },
  btnRects(p) {
    const r = [], main = p.d.btns.filter(b => !b.tiny);
    let x = p.x + p.w - 14;
    for (let i = main.length - 1; i >= 0; i--) { const b = main[i], w = b.big ? 180 : 110; x -= w; r.push({ x, y: p.y + p.h - 46, w, h: 32, b }); x -= 10; }
    p.d.btns.filter(b => b.tiny).forEach(b => r.push({ x: p.x + 14, y: p.y + p.h - 26, w: 100, h: 18, b }));
    if (p.d.x) r.push({ x: p.x + p.w - 26 + (p.xj % 2 ? -(p.w - 34) : 0), y: p.y + 4, w: 20, h: 20, b: { act: p.d.x, isX: true } });
    return r;
  },
  update(dt) {
    this.t += dt;
    const m = G.mouse;
    for (let i = this.pops.length - 1; i >= 0; i--) {
      const p = this.pops[i];
      if (p.d.x === 'spawn1' && p.xj < 2) {
        const xr = this.btnRects(p).find(r => r.b.isX);
        if (xr && U.inR(m.x, m.y, xr.x - 6, xr.y - 6, xr.w + 12, xr.h + 12)) { p.xj++; A.zap(); }
      }
      if (!m.click) continue;
      for (const r of this.btnRects(p)) {
        if (!U.inR(m.x, m.y, r.x, r.y, r.w, r.h)) continue;
        m.click = false; A.click();
        if (r.b.act === 'close') this.pops.splice(i, 1);
        else { this.pops.splice(i, 1); this.add(); if (r.b.act === 'spawn2') this.add(); L.say(r.b.isX ? 'La croix était fausse. Évidemment.' : 'Mauvais bouton. Il en arrive d\'autres.', 2); }
        break;
      }
      if (m.click && U.inR(m.x, m.y, p.x, p.y, p.w, p.h)) m.click = false;
    }
    const holding = G.down.Space || (m.down && U.inR(m.x, m.y, 330, 330, 300, 56));
    if (holding) { if (this.pops.length) this.warn = 1; else this.prog += (L.pity ? 7 : 5) * dt; }
    this.warn = Math.max(0, this.warn - dt);
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.prog < 100) { this.spawnT = U.rnd(2.2, 3.5) * (L.pity ? 1.4 : 1); this.add(); }
    for (const p of this.pops) { p.age += dt; if (p.age > 6.5) return L.die('Une fenêtre est restée ouverte trop longtemps. Golden s\'est installé à ta place.'); }
    if (this.pops.length >= 5) return L.die('Trop de fenêtres. Ton PC appartient à Golden.');
    if (this.prog >= 100) L.win();
  },
  draw(c) {
    osDesk(c, this.t, 'INSTALLATION DE GOLDENOS');
    osWin(c, 220, 150, 520, 260, 'Assistant d\'installation');
    txt(c, 'Maintiens Espace (ou le bouton) pour installer.', 480, 220, { al: 'center', size: 16, col: COL.ink });
    txt(c, 'Impossible d\'installer pendant qu\'une fenêtre est ouverte.', 480, 244, { al: 'center', size: 13, col: COL.dim });
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(260, 280, 440, 18); c.fillStyle = COL.gold; c.fillRect(260, 280, 440 * this.prog / 100, 18);
    txt(c, Math.floor(this.prog) + ' %', 480, 316, { al: 'center', size: 13, col: COL.ink, w: 700 });
    drawBtn(c, 330, 330, 300, 56, 'MAINTENIR POUR INSTALLER', { size: 16, col: this.pops.length ? COL.red : COL.gold });
    if (this.warn > 0) txt(c, 'Ferme les fenêtres d\'abord.', 480, 402, { al: 'center', size: 14, col: COL.red, w: 700 });
    for (const p of this.pops) {
      osWin(c, p.x, p.y, p.w, p.h, p.d.title, { line: p.age > 4.5 ? COL.red : 'rgba(242,193,78,.6)', glow: p.age > 4.5 ? COL.red : null });
      wrap(c, p.d.body, p.x + 14, p.y + 52, p.w - 28, 18, { size: 13, col: COL.ink, w: 500 });
      for (const r of this.btnRects(p)) {
        if (r.b.isX) { drawBtn(c, r.x, r.y, r.w, r.h, '✕', { size: 12, cut: 3 }); continue; }
        if (r.b.tiny) { const h = U.inR(G.mouse.x, G.mouse.y, r.x, r.y, r.w, r.h); if (h) G.hover = true; txt(c, r.b.l, r.x, r.y + 13, { size: 11, col: h ? COL.ink : '#5a5466', w: 500 }); continue; }
        drawBtn(c, r.x, r.y, r.w, r.h, r.b.l, { size: r.b.big ? 15 : 13, col: r.b.big ? '#3dff7a' : COL.gold, w: 700, cut: 4 });
      }
      c.fillStyle = COL.red; c.fillRect(p.x + 1, p.y + p.h - 3, (p.w - 2) * Math.min(1, p.age / 6.5), 2);
    }
  }
});

const VARIANTS = () => {
  const fr = () => U.pick(CH_ORDER);
  return [{ id: 'golden', ok: true }, { id: 'golden', ok: true }, { id: 'golden', ok: true }, { id: 'golden', noRed: true }, { id: fr(), crown: true }, { id: fr(), crown: true },
  { id: fr(), redEyes: true }, { id: fr(), redEyes: true }, { id: fr() }, { id: fr() }, { id: fr() }, U.pick([{ id: 'golden', ok: true }, { id: fr() }])];
};
const captchaPhase = L => ({
  init() { this.round = 0; this.t = 0; this.newRound(); },
  newRound() { this.tiles = U.shuffle(VARIANTS()).map(v => Object.assign({ sel: false }, v)); this.shT = 2.6; this.vx = 0; this.vy = 0; this.fled = false; this.bx = 560; this.by = 450; },
  tr(i) { return { x: 300 + (i % 4) * 92, y: 120 + Math.floor(i / 4) * 92, w: 86, h: 86 }; },
  update(dt) {
    this.t += dt;
    const m = G.mouse;
    if (this.round === 2) { this.shT -= dt; if (this.shT <= 0) { this.shT = 2.6; this.tiles = U.shuffle(this.tiles); A.blip(200); } }
    if (this.round === 2 && !this.fled && U.inR(m.x, m.y, this.bx - 10, this.by - 10, 160, 56)) { this.fled = true; this.bx = 300; A.zap(); L.say('Le bouton aussi a des doutes.', 1.6); }
    if (m.click) {
      for (let i = 0; i < 12; i++) { const r = this.tr(i); if (U.inR(m.x, m.y, r.x, r.y, r.w, r.h)) { m.click = false; this.tiles[i].sel = !this.tiles[i].sel; A.click(); } }
      if (m.click && U.inR(m.x, m.y, this.bx, this.by, 140, 36)) {
        m.click = false;
        const ok = this.tiles.every(t => !!t.sel === !!t.ok);
        if (!ok) return L.die('Échec. Tu n\'as pas su reconnaître Golden. Golden, lui, te reconnaît.');
        A.win(); this.round++; if (this.round >= 3) return L.win(); this.newRound(); P.pop(480, 100, `Vérification ${this.round} / 3`, COL.gold, 18);
      }
    }
  },
  draw(c) {
    osDesk(c, this.t, 'VÉRIFICATION : ES-TU HUMAIN ?');
    osWin(c, 280, 76, 400, 420, `Sélectionne tous les Golden (${this.round + 1}/3)`);
    txt(c, 'Golden = couronne ET yeux rouges.', 480, 116 - 4, { al: 'center', size: 12, col: COL.dim });
    this.tiles.forEach((t, i) => {
      const r = this.tr(i);
      const h = U.inR(G.mouse.x, G.mouse.y, r.x, r.y, r.w, r.h); if (h) G.hover = true;
      c.fillStyle = t.sel ? 'rgba(242,193,78,.18)' : '#0d0b12'; c.fillRect(r.x, r.y, r.w, r.h);
      c.strokeStyle = t.sel ? COL.gold : h ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'; c.lineWidth = t.sel ? 2 : 1; c.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1);
      c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
      drawStick(c, t.id, r.x + r.w / 2 - 6, r.y + r.h / 2 + 2 - (HEADY[t.id] || -42) * 2.3, { s: 2.3, t: this.t, noCape: true, crown: t.crown, redEyes: t.redEyes, noRed: t.noRed, glow: 4 });
      c.restore();
      if (t.sel) { c.fillStyle = COL.gold; c.beginPath(); c.arc(r.x + r.w - 12, r.y + 12, 8, 0, 7); c.fill(); txt(c, '✓', r.x + r.w - 12, r.y + 16, { al: 'center', size: 11, col: '#000', w: 700 }); }
    });
    drawBtn(c, this.bx, this.by, 140, 36, 'VÉRIFIER', { size: 14, w: 700, cut: 4 });
  }
});

const TOS = [
  'Article 1 — Golden a toujours raison.', 'Article 2 — En cas de désaccord, voir l\'article 1.',
  'Article 3 — Toute rage exprimée devient la propriété de Golden.', 'Article 4 — Le café de Golden ne doit jamais refroidir.',
  'Article 5 — Jules s\'engage à ne pas casser le sol. Il le cassera quand même.', 'Article 6 — None garde son cerveau à l\'intérieur de son crâne. Il déborde quand même.',
  '@7', 'Article 8 — Fanta n\'a pas le droit de frapper les murs porteurs.', 'Article 9 — Mitty est la seule personne raisonnable ici.',
  'Article 10 — Fondu garde sa kippa, quoi qu\'il arrive.', 'Article 11 — Norowareta n\'existe qu\'à 72 %.',
  'Article 12 — Toute tentative de quitter le jeu sera prédite.', 'Article 13 — « oi oi oi » est une phrase complète.',
  'Article 14 — Golden peut modifier ces conditions pendant que tu les lis.', 'Article 15 — Tu viens de lire l\'article 15. Golden l\'avait prédit.',
  'Article 16 — Les checkpoints sont décoratifs.', 'Article 17 — Les portes peuvent se déplacer sans préavis.',
  'Article 18 — Le joueur reconnaît être prévisible.', '@19', 'Article 20 — Personne ne lit jusqu\'ici. Sauf toi, apparemment.',
  'Article 21 — Le mot « ragebait » est une marque de respect.', 'Article 22 — Golden ne dort pas. Il attend.', '@23',
  'Article 24 — Rien.', 'Article 25 — Toujours rien.', 'Article 26 — Tu cherches encore ? Mignon.', 'Article 27 — Le joueur accepte de perdre avec dignité.',
  'Article 28 — Le joueur n\'a pas de dignité (voir article 27).', 'Article 29 — Fin des conditions. Ou pas.', '', '@FAKE'
];
const tosPhase = L => ({
  init() { this.sc = 0; this.t = 0; this.ok = false; this.moved = false; this.drag = null; },
  box() { return this.moved ? 23 : 19; },
  line(s) {
    if (s === '@7') return `Article 7 — La véritable case d'acceptation se trouve à l'article ${this.box()}.`;
    if (s === '@19') return this.moved ? 'Article 19 — (Cette case a déménagé. Relis l\'article 7.)' : 'Article 19 — [CASE] Je coche cette case et j\'accepte tout.';
    if (s === '@23') return this.moved ? 'Article 23 — [CASE] Je coche cette case et j\'accepte tout.' : 'Article 23 — Golden se réserve le droit de déménager des cases.';
    if (s === '@FAKE') return '[FAUX] J\'ai tout lu et j\'accepte les conditions.';
    return s;
  },
  update(dt) {
    this.t += dt;
    if (!this.moved && this.t > 22 && !this.ok) { this.moved = true; L.say('Article 14. J\'ai déplacé la case. Tu avais le temps de la cocher.', 3.2); }
    const lh = 26, total = TOS.length * lh, view = 300, maxS = Math.max(0, total - view + 10);
    const m = G.mouse;
    this.sc += m.wheel * .6;
    if (G.down.ArrowDown) this.sc += 260 * dt; if (G.down.ArrowUp) this.sc -= 260 * dt;
    if (m.down && U.inR(m.x, m.y, 200, 110, 560, 300)) { if (this.drag != null) this.sc += this.drag - m.y; this.drag = m.y; } else this.drag = null;
    this.sc = U.clamp(this.sc, 0, maxS);
    if (m.click) {
      for (let i = 0; i < TOS.length; i++) {
        const y = 110 + i * lh - this.sc + 18, s = this.line(TOS[i]);
        if (y < 110 || y > 410) continue;
        if (s.includes('[CASE]') && U.inR(m.x, m.y, 210, y - 18, 520, 24)) { m.click = false; this.ok = !this.ok; A.click(); }
        if (s.includes('[FAUX]') && U.inR(m.x, m.y, 210, y - 18, 520, 24)) { m.click = false; return L.die('Tu n\'as rien lu. Personne ne lit. Golden le savait.'); }
      }
      if (m.click && U.inR(m.x, m.y, 380, 440, 200, 44)) { m.click = false; A.click(); if (this.ok) return L.win(); L.say('Coche la vraie case d\'abord.', 1.6); }
    }
  },
  draw(c) {
    osDesk(c, this.t, 'CONDITIONS GÉNÉRALES DE GOLDEN');
    osWin(c, 190, 76, 580, 346, 'Lis tout. Coche la bonne case. (molette, flèches ou glisser)');
    c.save(); c.beginPath(); c.rect(200, 108, 560, 306); c.clip();
    const lh = 26;
    for (let i = 0; i < TOS.length; i++) {
      const y = 110 + i * lh - this.sc + 18, s = this.line(TOS[i]);
      if (y < 90 || y > 440) continue;
      if (s.includes('[CASE]') || s.includes('[FAUX]')) {
        const ck = s.includes('[CASE]') && this.ok;
        c.strokeStyle = COL.ink; c.lineWidth = 1.5; c.strokeRect(212, y - 13, 14, 14);
        if (ck) txt(c, '✓', 219, y - 1, { al: 'center', size: 13, col: COL.gold, w: 700 });
        txt(c, s.replace('[CASE] ', '').replace('[FAUX] ', ''), 234, y, { size: 14, col: s.includes('[FAUX]') ? COL.ink : '#d8d2e2', w: s.includes('[FAUX]') ? 700 : 500, max: 520 });
      } else txt(c, s, 212, y, { size: 14, col: '#b9b2c6', w: 500, max: 540 });
    }
    c.restore();
    const total = TOS.length * lh, view = 300, maxS = Math.max(1, total - view + 10);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(760, 110, 4, 300); c.fillStyle = COL.gold; c.fillRect(760, 110 + 300 * (this.sc / maxS) * (1 - view / total), 4, 300 * view / total);
    drawBtn(c, 380, 440, 200, 44, 'CONTINUER', { size: 16, w: 700, dis: !this.ok });
  }
});

const waitPhase = L => ({
  init() { this.t = 0; this.need = 22; },
  update(dt) {
    this.t += dt;
    if ((G.anyHit && !G.hit.Escape) || G.mouse.click) { G.mouse.click = false; return L.die(U.pick(['Tu as touché. On avait dit RIEN.', 'Même pas 20 secondes. Golden en était sûr.', 'Ta main a bougé toute seule ? Prédit.'])); }
    if (this.t > 2 && !this.s1) { this.s1 = 1; L.say('Ne touche à RIEN pendant 20 secondes. Ni clavier, ni clic.', 3); }
    if (this.t > 10 && !this.s2) { this.s2 = 1; G.shake = 16; A.boom(); }
    if (this.t > 16 && !this.s3) { this.s3 = 1; A.oi(); L.say('Tu peux appuyer maintenant. Promis.', 2.5); }
    if (this.t >= this.need) L.win();
  },
  shown() { const r = this.need - 2 - this.t; if (this.t > 10 && this.t < 13) return r + 7; if (this.t > 19) return 0; return r; },
  draw(c) {
    osDesk(c, this.t, 'FINALISATION');
    osWin(c, 220, 170, 520, 200, 'Installation de GoldenOS');
    const pc = this.t > 19 ? 100 : 99;
    c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(260, 250, 440, 18); c.fillStyle = COL.gold; c.fillRect(260, 250, 440 * pc / 100, 18);
    txt(c, pc + ' %', 480, 292, { al: 'center', size: 22, col: COL.ink, w: 700 });
    txt(c, `Ne touche à rien : ${Math.max(0, this.shown()).toFixed(1)} s`, 480, 330, { al: 'center', size: 16, col: COL.dim });
    if (this.t > 4) { const s = 1 + .05 * Math.sin(this.t * 9); c.save(); c.translate(820, 120); c.scale(s, s); drawBtn(c, -80, -24, 160, 48, 'PASSER ▶▶', { size: 16, col: '#3dff7a', w: 700 }); c.restore(); }
    if (this.t > 7 && this.t < 12) { osWin(c, 60, 390, 380, 100, 'ERREUR 0x0RAGE', { line: COL.red, bar: 'rgba(255,43,58,.2)', tcol: COL.red }); txt(c, 'Appuie sur ENTRÉE pour continuer.', 80, 456, { size: 15, col: COL.ink, w: 600 }); }
    if (this.t > 13 && this.t < 17) {
      c.fillStyle = 'rgba(3,2,5,.88)'; c.fillRect(0, 0, W, 512);
      txt(c, 'INSTALLATION TERMINÉE ✓', 480, 240, { al: 'center', size: 46, f: 'd', col: '#3dff7a', w: 900, glow: '#3dff7a' });
      txt(c, 'Clique n\'importe où pour continuer', 480, 284, { al: 'center', size: 16, col: COL.ink, a: .6 + .4 * Math.sin(this.t * 6) });
    }
    if (this.t > 19) txt(c, 'APPUIE SUR UNE TOUCHE', 480, 140, { al: 'center', size: 30, f: 'd', col: COL.gold, w: 900, glow: COL.gold, a: .5 + .5 * Math.sin(this.t * 8) });
  }
});

LEVELS.push({
  id: 9, host: 'golden', title: 'Chargement Infini', sub: 'Fausse interface et patience', quoteBy: 'GoldenOS',
  quote: 'Installation de GoldenOS en cours. Merci de votre patience. Vous n\'en avez pas.',
  controls: 'Souris : ferme les fenêtres, coche, valide  ·  Espace : installer  ·  molette / flèches : faire défiler',
  freed: 'GoldenOS est installé. Ton ordinateur est maintenant prévisible, lui aussi.',
  taunts: ['Tu as cliqué sur la pub. Tout le monde clique sur la pub.', 'Ta patience : 0 %.', 'Erreur utilisateur. Comme toujours.'],
  phases: [
    { name: 'Les Fenêtres', proph: 'Tu vas cliquer sur « TOUT ACCEPTER ». C\'est le plus gros bouton.', tip: 'Les vrais boutons de fermeture sont souvent les plus petits.', make: popupPhase },
    { name: 'Es-tu Humain ?', proph: 'Tu vas oublier un Golden. Ou en sélectionner un faux. Les deux, idéalement.', make: captchaPhase },
    { name: 'Les Conditions', proph: 'Tu ne vas pas lire. Personne ne lit.', make: tosPhase },
    { name: '99 %', proph: 'Vingt secondes sans rien toucher. Tu n\'en es pas capable.', tip: 'Ne touche ni au clavier ni à la souris (tu peux la bouger, pas cliquer).', make: waitPhase }
  ]
});

/* =========================================================
   NIVEAU 10 — GOLDEN — La Prophétie (duels de prédiction)
   ========================================================= */
class Prophet {
  constructor(opts, fallback) { this.n = opts; this.h = []; this.c = {}; this.fb = fallback; this.hits = 0; this.total = 0; }
  predict() {
    for (let k = Math.min(5, this.h.length); k >= 1; k--) {
      const cc = this.c[k + ':' + this.h.slice(-k).join('')];
      if (!cc) continue;
      let tot = 0, best = null, bv = -1;
      for (const o of U.shuffle(this.n)) { const v = cc[o] || 0; tot += v; if (v > bv) { bv = v; best = o; } }
      if (tot >= 2 || k === 1) return best;
    }
    return this.fb(this.h);
  }
  push(x) {
    for (let k = 1; k <= 5; k++) if (this.h.length >= k) { const key = k + ':' + this.h.slice(-k).join(''); (this.c[key] || (this.c[key] = {}))[x] = ((this.c[key] || {})[x] || 0) + 1; }
    this.h.push(x);
  }
}
const BEATS = { P: 'F', F: 'C', C: 'P' }; // ce qui bat la clé
const RPS_NAME = { P: 'PIERRE', F: 'FEUILLE', C: 'CISEAUX' };

function rpsIcon(c, k, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.fillStyle = hexA(col, .15); c.lineWidth = 3; c.shadowColor = col; c.shadowBlur = 10;
  if (k === 'P') { c.beginPath(); c.moveTo(-20, 8); c.lineTo(-14, -14); c.lineTo(8, -20); c.lineTo(22, -2); c.lineTo(12, 18); c.lineTo(-12, 20); c.closePath(); c.fill(); c.stroke(); }
  if (k === 'F') { c.fillRect(-16, -22, 32, 44); c.strokeRect(-16, -22, 32, 44); for (let i = -12; i < 16; i += 8) seg(c, -10, i, 10, i); }
  if (k === 'C') { c.beginPath(); c.arc(-10, 14, 7, 0, 7); c.arc(10, 14, 7, 0, 7); c.stroke(); seg(c, -6, 8, 10, -22); seg(c, 6, 8, -10, -22); }
  c.restore();
}

function duelBg(c, t, me, gold, goal) {
  c.fillStyle = '#07050a'; c.fillRect(0, 0, W, H);
  goldenAura(c, 480, 230, 2.4, t);
  drawStick(c, 'golden', 480, 230, { s: 2.4, t });
  txt(c, 'TOI', 160, 80, { al: 'center', size: 13, col: COL.dim, w: 700, ls: 3 });
  txt(c, String(me), 160, 140, { al: 'center', size: 64, f: 'd', col: COL.ink, w: 900 });
  txt(c, 'GOLDEN', 800, 80, { al: 'center', size: 13, col: COL.red, w: 700, ls: 3 });
  txt(c, String(gold), 800, 140, { al: 'center', size: 64, f: 'd', col: COL.red, w: 900, glow: COL.red });
  txt(c, `premier à ${goal[0]} (toi) · ${goal[1]} (Golden)`, 480, 66, { al: 'center', size: 12, col: COL.dim });
}

const doorsPhase = L => ({
  init() {
    const m = L.m; this.pro = m.pro || (m.pro = new Prophet(['G', 'D'], h => h.length ? (h[h.length - 1] === 'G' ? 'D' : 'G') : 'D'));
    this.me = 0; this.gold = 0; this.goalMe = 12; this.goalG = L.pity ? 16 : 12; this.t = 0; this.rev = 0; this.pred = this.pro.predict(); this.last = null;
  },
  pick(x) {
    this.last = x; const hit = x === this.pred;
    this.pro.total++; if (hit) { this.pro.hits++; this.gold++; A.zap(); } else { this.me++; A.blip(880); }
    this.pro.push(x); this.rev = .9;
  },
  update(dt) {
    this.t += dt;
    if (this.rev > 0) { this.rev -= dt; if (this.rev <= 0) { if (this.gold >= this.goalG) return L.die(`Golden t'a lu ${this.pro.hits} fois sur ${this.pro.total}. Tu es un livre ouvert.`); if (this.me >= this.goalMe) return L.win(); this.pred = this.pro.predict(); } return; }
    const m = G.mouse;
    if (G.hit.ArrowLeft || G.hit.KeyA || (m.click && m.x < 480 && m.y > 280)) { m.click = false; this.pick('G'); }
    else if (G.hit.ArrowRight || G.hit.KeyD || (m.click && m.x >= 480 && m.y > 280)) { m.click = false; this.pick('D'); }
  },
  draw(c) {
    duelBg(c, this.t, this.me, this.gold, [this.goalMe, this.goalG]);
    for (const [k, x] of [['G', 270], ['D', 690]]) {
      const sel = this.rev > 0 && this.last === k, pr = this.rev > 0 && this.pred === k;
      const h = G.mouse.y > 280 && (k === 'G' ? G.mouse.x < 480 : G.mouse.x >= 480); if (h) G.hover = true;
      c.save(); c.fillStyle = sel ? 'rgba(242,193,78,.15)' : '#0e0b13'; c.strokeStyle = pr ? COL.red : (sel || h ? COL.gold : 'rgba(242,193,78,.35)'); c.lineWidth = pr ? 3 : 2;
      c.shadowColor = c.strokeStyle; c.shadowBlur = pr || sel ? 18 : 0;
      c.beginPath(); c.moveTo(x - 70, 500); c.lineTo(x - 70, 350); c.arc(x, 350, 70, Math.PI, 0); c.lineTo(x + 70, 500); c.closePath(); c.fill(); c.stroke(); c.restore();
      txt(c, k === 'G' ? '← GAUCHE' : 'DROITE →', x, 440, { al: 'center', size: 18, col: COL.ink, w: 700 });
      if (pr) txt(c, 'PRÉDIT', x, 330, { al: 'center', size: 16, col: COL.red, w: 900, ls: 3 });
    }
    if (this.rev > 0) txt(c, this.last === this.pred ? 'Golden l\'avait écrit.' : 'Golden s\'est trompé. Pour cette fois.', 480, 290, { al: 'center', size: 18, it: true, col: this.last === this.pred ? COL.red : COL.gold });
    else { panel(c, 400, 262, 160, 46, { line: COL.red }); txt(c, 'PRÉDICTION SCELLÉE', 480, 290, { al: 'center', size: 11, col: COL.red, w: 700, ls: 2 }); }
    const rate = this.pro.total ? Math.round(this.pro.hits / this.pro.total * 100) : 0;
    txt(c, `Golden lit en toi : ${rate} %  (le hasard pur ferait 50 %)`, 480, 528, { al: 'center', size: 12, col: COL.dim });
  }
});

const rpsPhase = L => ({
  init() {
    const m = L.m; this.pro = m.pro3 || (m.pro3 = new Prophet(['P', 'F', 'C'], h => h.length ? h[h.length - 1] : 'P'));
    this.me = 0; this.gold = 0; this.goalMe = 6; this.goalG = L.pity ? 9 : 6; this.t = 0; this.rev = 0; this.res = '';
  },
  pick(x) {
    const pred = this.pro.predict(), g = BEATS[pred];
    this.last = x; this.gmove = g; this.pro.total++;
    if (x === g) this.res = 'ÉGALITÉ';
    else if (BEATS[x] === g) { this.res = 'GOLDEN GAGNE'; this.gold++; this.pro.hits++; A.zap(); }
    else { this.res = 'TU GAGNES'; this.me++; A.blip(880); }
    this.pro.push(x); this.rev = 1.1;
  },
  update(dt) {
    this.t += dt;
    if (this.rev > 0) { this.rev -= dt; if (this.rev <= 0) { if (this.gold >= this.goalG) return L.die('Golden a joué ton coup avant toi. Six fois.'); if (this.me >= this.goalMe) return L.win(); } return; }
    const m = G.mouse;
    const keys = [['P', 'Digit1', 'Numpad1'], ['F', 'Digit2', 'Numpad2'], ['C', 'Digit3', 'Numpad3']];
    for (const [k, a, b] of keys) if (G.hit[a] || G.hit[b]) return this.pick(k);
    if (m.click) ['P', 'F', 'C'].forEach((k, i) => { if (m.click && U.inR(m.x, m.y, 210 + i * 190, 380, 160, 120)) { m.click = false; A.click(); this.pick(k); } });
  },
  draw(c) {
    duelBg(c, this.t, this.me, this.gold, [this.goalMe, this.goalG]);
    ['P', 'F', 'C'].forEach((k, i) => {
      const x = 210 + i * 190, sel = this.rev > 0 && this.last === k;
      drawBtn(c, x, 380, 160, 120, '', { col: sel ? COL.gold : undefined });
      rpsIcon(c, k, x + 80, 425, 1, sel ? COL.gold : COL.ink);
      txt(c, `${i + 1} · ${RPS_NAME[k]}`, x + 80, 486, { al: 'center', size: 13, col: COL.ink, w: 700 });
    });
    if (this.rev > 0) {
      rpsIcon(c, this.gmove, 600, 140, 1.2, COL.red);
      txt(c, 'Golden joue ' + RPS_NAME[this.gmove], 600, 196, { al: 'center', size: 13, col: COL.red, w: 700 });
      txt(c, this.res, 480, 330, { al: 'center', size: 34, f: 'd', col: this.res === 'TU GAGNES' ? COL.gold : this.res === 'ÉGALITÉ' ? COL.ink : COL.red, w: 900 });
    } else txt(c, 'Touches 1 / 2 / 3 ou clic. Golden choisit en même temps que toi.', 480, 330, { al: 'center', size: 14, col: COL.dim });
  }
});

class Strike {
  constructor(x, lead) { this.x = x; this.t = 0; this.lead = lead; this.by = 'strike'; }
  update(dt) { this.t += dt; if (this.t > this.lead && !this.f) { this.f = 1; A.zap(); G.shake = 6; P.burst(this.x, 455, 14, '#7a4a22', 200); } if (this.t > this.lead + .2) this.gone = true; }
  hurt(bx) { return this.t > this.lead && U.rr(bx, { x: this.x - 26, y: 0, w: 52, h: 460 }); }
  draw(c) {
    if (this.t < this.lead) {
      const k = this.t / this.lead;
      c.save(); c.strokeStyle = `rgba(255,43,58,${.4 + .5 * k})`; c.lineWidth = 2; c.setLineDash([6, 6]);
      c.strokeRect(this.x - 26, 40, 52, 420); c.setLineDash([]);
      c.beginPath(); c.arc(this.x, 440, 14 + 10 * (1 - k), 0, 7); c.stroke(); seg(c, this.x - 22, 440, this.x + 22, 440); seg(c, this.x, 418, this.x, 462);
      c.restore();
    } else {
      c.save(); c.fillStyle = 'rgba(122,74,34,.85)'; c.shadowColor = COL.gold; c.shadowBlur = 24; c.fillRect(this.x - 26, 0, 52, 460); c.fillStyle = 'rgba(255,230,180,.8)'; c.fillRect(this.x - 4, 0, 8, 460); c.restore();
    }
  }
}

LEVELS.push({
  id: 10, host: 'golden', title: 'La Prophétie', sub: 'Duels contre la prédiction', quoteBy: 'Golden',
  quote: 'Tu crois choisir au hasard. Tu n\'as jamais rien choisi au hasard de ta vie.',
  controls: '← → ou clic : choisir une porte  ·  1 2 3 ou clic : pierre, feuille, ciseaux  ·  Mitty se déplace avec ← → et saute deux fois',
  freed: 'Tu as battu la prophétie. Golden pose enfin son café. Il t\'attend sur son trône.',
  taunts: ['Prédit. Prédit. Prédit.', 'Tu alternes. Tout le monde alterne.', 'Je me souviens de tous tes essais. Tous.'],
  phases: [
    { name: 'Gauche ou Droite', proph: 'Tu vas alterner. Puis tu vas essayer de ne pas alterner. Je lis les deux.', tip: 'Golden apprend de chacun de tes choix, même ceux des parties perdues. Sois vraiment imprévisible.', make: doorsPhase },
    { name: 'Pierre, Feuille, Ciseaux', proph: 'Tu vas rejouer ton coup gagnant. Les humains rejouent toujours leur coup gagnant.', make: rpsPhase },
    {
      name: 'Le Couloir Prédit', proph: 'Je frappe là où tu seras dans une seconde. Pas là où tu es.',
      tip: 'Survis 32 secondes. Change de direction quand une cible rouge apparaît devant toi.',
      make: L => platPhase({
        char: 'mitty', start: [480, 460], eyes: false,
        blocks: [Bk(0, 460, 960, 80), Bk(180, 350, 140, 14), Bk(640, 350, 140, 14), Bk(410, 250, 140, 14)],
        init: w => { w.sT = 1.2; w.n = 0; },
        pre: (dt, w) => {
          w.sT -= dt;
          if (w.sT <= 0) {
            w.n++; w.sT = (L.pity ? 1.15 : .85) - Math.min(.25, w.t * .006);
            const p = w.p, lead = .72;
            const x = w.n % 4 === 0 ? p.x : U.clamp(p.x + p.vx * lead, 30, W - 30);
            w.ents.push(new Strike(x, lead));
          }
          if (w.t >= 32) w.won = true;
        },
        over: (c, w) => {
          drawStick(c, 'golden', 480, 120 + Math.sin(w.t * 2) * 6, { s: 1.8, t: w.t, drink: w.sT > .6 });
          txt(c, `${Math.max(0, 32 - w.t).toFixed(1)} s`, 480, 66, { al: 'center', size: 22, f: 'd', col: COL.gold, w: 900 });
        }
      })
    }
  ]
});
