'use strict';
/* GOLDEN — niveaux 7 et 8 */

/* =========================================================
   NIVEAU 7 — GOLDEN — Le QCM du Roi (quiz piégé)
   ========================================================= */
const QX = [150, 500], QY = [300, 392], QW = 310, QH = 70;
const STROOP = { ROUGE: '#ff2b3a', BLEU: '#3d7bff', VERT: '#3dff7a', JAUNE: '#ffd23f' };

function quizPhase(qs) {
  return L => ({
    init() { this.k = 0; this.t = 0; this.ok = 0; this.next(); },
    next() {
      const q = qs[this.k]();
      this.q = q; this.qt = 0; this.hov = [0, 0, 0, 0]; this.pred = -1; this.fb = 0;
      this.time = (q.time || 10) + (L.pity ? 5 : 0);
      this.pos = q.ans ? q.ans.map((_, i) => ({ x: QX[i % 2], y: QY[i >> 1], vx: U.rnd(-90, 90), vy: U.rnd(-60, 60) })) : [];
      this.perm = [0, 1, 2, 3]; this.shT = q.spd || .8; this.gtp = 0;
      if (q.kind === 'golden') this.mobs = ['golden', ...CH_ORDER].map(id => ({ id, x: U.rnd(120, 840), y: U.rnd(320, 500), vx: U.rnd(-70, 70), face: 1 }));
    },
    rect(i) {
      if (this.q.kind === 'shuffle') { const j = this.perm[i]; return { x: QX[j % 2], y: QY[j >> 1], w: QW, h: QH }; }
      const p = this.pos[i]; return { x: p.x, y: p.y, w: QW, h: QH };
    },
    good() {
      A.win(); this.fb = .7; this.ok++;
      P.pop(480, 260, U.pick(['Chance.', 'Hm.', 'Même une horloge cassée…', 'Bien. Pour l\'instant.', 'Je l\'avais prévu aussi.']), COL.gold, 22);
    },
    update(dt) {
      this.t += dt;
      if (this.fb > 0) { this.fb -= dt; if (this.fb <= 0) { this.k++; if (this.k >= qs.length) return L.win(); this.next(); } return; }
      const q = this.q, m = G.mouse;
      this.qt += dt;
      if (this.qt > this.time) return q.kind === 'nothing' ? this.good() : L.die('Trop lent. Golden a répondu à ta place.');
      if (q.kind === 'nothing') { if (m.click || (G.anyHit && !G.hit.Escape)) { m.click = false; L.die('Tu as cliqué. On t\'avait dit RIEN.'); } return; }
      if (q.kind === 'shuffle') { this.shT -= dt; if (this.shT <= 0) { this.shT = q.spd || .8; this.perm = U.shuffle(this.perm); } }
      if (q.kind === 'static' || q.kind === 'flee') {
        this.pos.forEach((p, i) => {
          if (q.kind === 'static' && i !== q.ok) { p.x += p.vx * dt; p.y += Math.sin(this.t * 2 + i) * 18 * dt; }
          if (q.kind === 'flee' && i === q.ok) {
            const cx = p.x + QW / 2, cy = p.y + QH / 2, d = U.dist(m.x, m.y, cx, cy);
            if (d < 170) { p.x += (cx - m.x) / d * 330 * dt; p.y += (cy - m.y) / d * 330 * dt; }
          }
          if (p.x < 40 || p.x > W - 40 - QW) p.vx *= -1;
          p.x = U.clamp(p.x, 40, W - 40 - QW); p.y = U.clamp(p.y, 270, H - 20 - QH);
        });
      }
      if (q.kind === 'golden') {
        for (const o of this.mobs) { o.x += o.vx * dt; if (o.x < 80 || o.x > 880) o.vx *= -1; o.face = o.vx > 0 ? 1 : -1; }
        const g = this.mobs[0];
        if (this.gtp < 2 && U.dist(m.x, m.y, g.x, g.y - 30) < 70) { this.gtp++; g.x = m.x < 480 ? U.rnd(620, 860) : U.rnd(100, 340); g.y = U.rnd(330, 500); A.zap(); P.pop(g.x, g.y - 70, 'Prédit.', COL.red, 16); }
        if (m.click) {
          m.click = false;
          const hit = this.mobs.find(o => U.inR(m.x, m.y, o.x - 18, o.y - 62, 36, 66));
          if (hit && hit.id === 'golden') this.good();
          else if (hit) L.die(`C'était ${CH[hit.id].name}. Golden est vexé.`);
        }
        return;
      }
      for (let i = 0; i < 4; i++) {
        const r = this.rect(i);
        const h = U.inR(m.x, m.y, r.x, r.y, r.w, r.h);
        this.hov[i] = h ? this.hov[i] + dt : 0;
        if (q.kind === 'predict' && this.hov[i] > .4 && this.pred !== i) { this.pred = i; A.blip(240); }
      }
      if (m.click) {
        for (let i = 0; i < 4; i++) {
          const r = this.rect(i);
          if (!U.inR(m.x, m.y, r.x, r.y, r.w, r.h)) continue;
          m.click = false; A.click();
          if (q.kind === 'predict') return i === this.pred ? L.die('Golden avait prédit cette réponse. Évidemment.') : this.good();
          return i === q.ok ? this.good() : L.die(q.why || 'Mauvaise réponse. Golden le savait avant toi.');
        }
      }
    },
    draw(c) {
      c.fillStyle = '#08060b'; c.fillRect(0, 0, W, H);
      const sp = c.createRadialGradient(480, 0, 10, 480, 0, 520); sp.addColorStop(0, 'rgba(242,193,78,.12)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sp; c.fillRect(0, 0, W, H);
      const q = this.q;
      goldenAura(c, 70, 250, 1.4, this.t, .8);
      drawStick(c, 'golden', 70, 250, { s: 2, t: this.t, drink: Math.sin(this.t) > .7 });
      txt(c, `QUESTION ${this.k + 1} / ${qs.length}`, 480, 66, { al: 'center', size: 12, col: COL.gold, w: 700, ls: 4 });
      wrap(c, q.q, 480, 118, 700, 34, { al: 'center', size: 30, w: 700, col: COL.ink, f: q.big ? 'd' : undefined });
      const r = Math.max(0, 1 - this.qt / this.time);
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(180, 234, 600, 6);
      c.fillStyle = r < .3 ? COL.red : COL.gold; c.fillRect(180, 234, 600 * r, 6);
      if (q.kind === 'nothing') {
        const s = 1 + .06 * Math.sin(this.t * 8);
        c.save(); c.translate(480, 380); c.scale(s, s); drawBtn(c, -170, -45, 340, 90, 'CLIQUE ICI ▶', { size: 30, col: '#3dff7a', w: 700 }); c.restore();
        txt(c, `Encore ${Math.max(0, this.time - this.qt).toFixed(1)} s`, 480, 480, { al: 'center', size: 14, col: COL.dim });
      } else if (q.kind === 'golden') {
        for (const o of this.mobs) drawStick(c, o.id, o.x, o.y, { s: 1.3, t: this.t, run: 1, face: o.face, cup: false, noCape: true });
      } else {
        for (let i = 0; i < 4; i++) {
          const rr = this.rect(i), item = q.ans[i];
          const label = typeof item === 'string' ? item : item.l;
          const o = { size: 20 };
          if (item.c) o.tcol = item.c;
          if (item.fill) { o.fill = hexA(item.fill, .55); o.col = item.fill; }
          drawBtn(c, rr.x, rr.y, rr.w, rr.h, label, o);
          if (q.kind === 'predict' && this.pred === i) { c.save(); c.strokeStyle = COL.red; c.lineWidth = 3; c.shadowColor = COL.red; c.shadowBlur = 16; c.strokeRect(rr.x - 4, rr.y - 4, rr.w + 8, rr.h + 8); c.restore(); txt(c, 'PRÉDIT', rr.x + rr.w - 8, rr.y - 8, { al: 'right', size: 12, col: COL.red, w: 700, ls: 2 }); }
        }
      }
      if (this.fb > 0) txt(c, 'BONNE RÉPONSE', 480, 290, { al: 'center', bl: 'middle', size: 44, f: 'd', col: COL.gold, w: 900, glow: COL.gold, a: Math.min(1, this.fb * 3) });
    }
  });
}

const Q = {
  roi: () => ({ q: 'Qui est le roi du ragebait ?', ans: ['Jules', 'Fanta', 'Golden', 'Personne'], ok: 2, why: 'Il n\'y a qu\'un roi. Et il te regarde.' }),
  stroopMot: () => {
    const words = U.shuffle(['ROUGE', 'BLEU', 'VERT', 'JAUNE']), cols = ['#3d7bff', '#ff2b3a', '#ffd23f', '#3dff7a'];
    const ans = words.map((w, i) => ({ l: w, c: cols[(i + 1) % 4] === STROOP[w] ? cols[(i + 2) % 4] : cols[(i + 1) % 4] }));
    return { q: 'Clique sur le MOT « ROUGE ».', ans, ok: words.indexOf('ROUGE'), why: 'Le mot. Pas la couleur. Lis.' };
  },
  cerveau: () => ({ q: 'Qui a un cerveau qui dépasse du crâne ?', ans: ['Fondu', 'None', 'Mitty', 'Norowareta'], ok: 1, why: 'None. Son cerveau ne rentre plus dans sa tête.' }),
  deuxDeux: () => ({ q: 'Combien font 2 + 2 ?', ans: ['4', '5', 'Ce que Golden décide', '22'], ok: 2, why: 'Ici, c\'est Golden qui décide. Même les maths.' }),
  rien: () => ({ q: 'Ne clique sur RIEN.', kind: 'nothing', time: 5, big: true }),
  boisson: () => ({ q: 'Que boit Golden ?', ans: ['Du soda', 'Du café', 'Du thé', 'Tes larmes'], ok: 1, why: 'Du café. Il en boit en ce moment même.' }),
  statique: () => ({ q: 'Clique sur le bouton qui ne bouge PAS.', ans: ['Celui-ci', 'Celui-là', 'Lui', 'Moi'], ok: U.ri(0, 3), kind: 'static' }),
  holo: () => ({ q: 'Qui est un hologramme ?', ans: ['Norowareta', 'Fanta', 'Jules', 'Mitty'], ok: 0, kind: 'shuffle', spd: .75 }),
  predit: () => ({ q: 'Golden a prédit ta réponse. Choisis-en une AUTRE.', ans: ['Celle-ci', 'Celle-là', 'Une autre', 'La dernière'], ok: -1, kind: 'predict' }),
  morts: () => {
    const n = S.d.deaths, vals = U.shuffle([n, n + 1, n > 0 ? n - 1 : n + 2, n + 3]);
    return { q: 'Combien de fois es-tu mort jusqu\'ici ?', ans: vals.map(String), ok: vals.indexOf(n), why: `C'était ${n}. Enfin, ${n + 1} maintenant.` };
  },
  stroopCouleur: () => {
    const names = U.shuffle(['ROUGE', 'BLEU', 'VERT', 'JAUNE']), fills = U.shuffle(['ROUGE', 'BLEU', 'VERT', 'JAUNE']);
    for (let i = 0; i < 4; i++) if (names[i] === fills[i]) { const j = (i + 1) % 4; [fills[i], fills[j]] = [fills[j], fills[i]]; }
    return { q: 'Clique sur le bouton de couleur VERTE. (La couleur. Pas le mot.)', ans: names.map((l, i) => ({ l, fill: STROOP[fills[i]] })), ok: fills.indexOf('VERT'), why: 'La couleur. On te l\'avait écrit.' };
  },
  fanta: () => ({ q: 'Fanta est…', ans: ['gros', 'musclé', 'un hologramme', 'une fille'], ok: 1, why: 'Gros, c\'est Jules. Fanta, c\'est les muscles.' }),
  kippa: () => ({ q: 'Qui porte une kippa ?', ans: ['None', 'Jules', 'Fondu', 'Golden'], ok: 2 }),
  bonne: () => ({ q: 'Quelle réponse est la bonne ?', ans: ['Celle-ci', 'Pas celle-ci', 'La première', 'Golden a toujours raison'], ok: 3 }),
  mitty: () => ({ q: 'Mitty est…', ans: ['un robot', 'la GOAT', 'un hologramme', 'Golden déguisée'], ok: 1, kind: 'shuffle', spd: .5, why: 'La GOAT. Même Golden le sait.' }),
  oi: () => ({ q: 'Que dit Golden ?', ans: ['ah ah ah', 'gg wp', 'oi oi oi', 'pardon'], ok: 2, kind: 'flee', time: 12 }),
  niveaux: () => ({ q: 'Combien de niveaux avant le trône de Golden ?', ans: ['9', '10', '11', 'Golden décide'], ok: 1, why: 'Dix. Pour une fois, la logique gagnait. Tu ne t\'y attendais pas.' }),
  cible: () => ({ q: 'Dernière question : clique sur Golden.', kind: 'golden', time: 14 })
};

LEVELS.push({
  id: 7, host: 'golden', title: 'Le QCM du Roi', sub: 'Quiz piégé', quoteBy: 'Golden',
  quote: 'Dix-huit questions. Une seule règle : la bonne réponse, c\'est celle que je veux.',
  tcontrols: 'Touche la bonne réponse avant la fin du chrono  ·  une erreur = retour au début de la série',
  controls: 'Souris : clique sur la bonne réponse avant la fin du chrono  ·  une erreur = retour au début de la série',
  freed: 'Tu as survécu au QCM. Golden note ta moyenne : 0/20, par principe.',
  taunts: ['Mauvaise réponse. Comme prévu.', 'Tu as lu la question ? Non.', 'Zéro. Pointé.'],
  phases: [
    { name: 'Échauffement', proph: 'Tu vas répondre « 4 ». Tu as tort.', make: quizPhase([Q.roi, Q.stroopMot, Q.cerveau, Q.deuxDeux, Q.rien, Q.boisson]) },
    { name: 'Les Pièges', proph: 'Je vais prédire ta réponse avant que tu cliques. Tu vas cliquer quand même.', tip: 'Un bouton survolé trop longtemps devient « prédit ».', make: quizPhase([Q.statique, Q.holo, Q.predit, Q.morts, Q.stroopCouleur, Q.fanta]) },
    { name: 'La Finale', proph: 'La bonne réponse va fuir ta souris. Comme tes chances.', make: quizPhase([Q.kippa, Q.bonne, Q.mitty, Q.oi, Q.niveaux, Q.cible]) }
  ]
});

/* =========================================================
   NIVEAU 8 — LES SIX — La Course des Six (changement de perso)
   ========================================================= */
const OBS = {
  brick: { who: 'fanta', name: 'MUR' },
  gap: { who: 'none', name: 'GOUFFRE' },
  laser: { who: 'noro', name: 'LASER' },
  fog: { who: 'fondu', name: 'BRUME' },
  high: { who: 'mitty', name: 'MUR HAUT' },
  plate: { who: 'jules', name: 'PLAQUE' }
};
const GY = 440;

function runPhase(cfg) {
  return L => ({
    init() {
      this.dist = 0; this.t = 0; this.y = GY; this.vy = 0; this.ground = true; this.jumps = 0;
      this.allowed = cfg.chars; this.cur = this.allowed[0];
      const seq = [];
      for (let r = 0; r < cfg.reps; r++) seq.push(...U.shuffle(cfg.types));
      let x = 900; this.obs = [];
      for (const k of seq) {
        if (Math.random() < .4) { this.obs.push({ k: 'spike', x }); x += 300; }
        const o = { k, x }; this.obs.push(o);
        if (cfg.lie) { o.lie = U.pick(CH_ORDER.filter(id => id !== OBS[k].who)); }
        x += (k === 'gap' ? 480 : k === 'plate' ? 330 : 0) + U.rnd(460, 600);
      }
      this.end = x + 200; this.spd = cfg.spd - (L.pity ? 40 : 0);
    },
    sw(id) { if (this.allowed.includes(id) && id !== this.cur) { this.cur = id; A.blip(500 + CH_ORDER.indexOf(id) * 80); P.burst(200, this.y - 24, 12, CH[id].col, 160, .4); } },
    overGap(px) { return this.obs.some(o => o.k === 'gap' && px > o.x + 6 && px < o.x + 480 - 6); },
    update(dt) {
      this.t += dt; this.dist += this.spd * dt;
      for (let i = 0; i < 6; i++) if (G.hit['Digit' + (i + 1)] || G.hit['Numpad' + (i + 1)]) this.sw(CH_ORDER[i]);
      if (G.mouse.click && G.mouse.y > 488) {
        const i = Math.floor((G.mouse.x - (480 - 3 * 76)) / 76);
        if (i >= 0 && i < 6) { G.mouse.click = false; this.sw(CH_ORDER[i]); }
      }
      const px = this.dist + 200;
      if (K.jumpHit() || (G.mouse.click && G.mouse.y < 488)) {
        G.mouse.click = false;
        if (this.ground) { this.vy = -620; this.ground = false; this.jumps = 1; A.jump(); }
        else if (this.cur === 'mitty' && this.jumps < 2) { this.vy = -600; this.jumps = 2; A.jump(1.3); P.burst(200, this.y, 8, CH.mitty.col, 120, .4); }
      }
      const gap = this.overGap(px);
      const glide = gap && this.cur === 'none' && this.y >= GY - 1 && this.vy >= 0;
      if (glide) { this.vy = 0; this.y = GY; this.ground = true; this.jumps = 0; if (Math.random() < .4) P.burst(196, GY - 50, 1, CH.none.col, 50, .5, 2, -40); }
      else {
        this.vy += ((K.jump() || (G.mouse.down && G.mouse.y < 488)) && this.vy < 0 ? 1900 : 3400) * dt;
        this.y += this.vy * dt;
        if (!gap && this.y >= GY) { if (!this.ground) A.land(); this.y = GY; this.vy = 0; this.ground = true; this.jumps = 0; }
        else this.ground = false;
      }
      if (this.y > H + 40) return L.die(this.cur === 'none' ? 'None a raté le gouffre. Il fallait rester au sol pour léviter.' : `${CH[this.cur].name} ne lévite pas. Il fallait None.`);
      const box = { x: px - 11, y: this.y - 44, w: 22, h: 44 };
      for (const o of this.obs) {
        if (o.x > px + 40 || o.x < px - 600) continue;
        const need = OBS[o.k] && OBS[o.k].who;
        if (o.k === 'spike' && U.rr(box, { x: o.x + 4, y: GY - 16, w: 32, h: 16 })) return L.die('Un pique. Tout le monde peut sauter un pique.');
        if ((o.k === 'brick' && !o.broken) || o.k === 'laser' || o.k === 'fog') {
          const wdt = o.k === 'brick' ? 44 : o.k === 'laser' ? 14 : 70;
          if (U.rr(box, { x: o.x, y: 30, w: wdt, h: GY - 30 })) {
            if (this.cur === need) { if (o.k === 'brick' && !o.broken) { o.broken = true; A.punch(); G.shake = 8; P.burst(o.x + 22, GY - 120, 30, CH.fanta.col, 320); } }
            else return L.die(`Il fallait ${CH[need].name}. La forme ne ment jamais.`);
          }
        }
        if (o.k === 'high' && U.rr(box, { x: o.x, y: GY - 135, w: 40, h: 135 })) return L.die('Mur haut : seule Mitty a le double saut.');
        if (o.k === 'plate') {
          if (!o.open && this.ground && this.cur === 'jules' && px > o.x && px < o.x + 70) { o.open = true; A.boom(); G.shake = 6; }
          if (!o.open && U.rr(box, { x: o.x + 300, y: 30, w: 30, h: GY - 30 })) return L.die('La porte est restée fermée. Seul Jules est assez lourd pour la plaque.');
        }
      }
      if (px > this.end) L.win();
    },
    draw(c) {
      const cam = this.dist;
      c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
      c.save(); c.translate(-(cam * .3 % 200), 0);
      for (let i = 0; i < 7; i++) { c.fillStyle = 'rgba(242,193,78,.04)'; c.fillRect(i * 200, 60, 40, GY - 60); }
      c.restore();
      c.save(); c.translate(-cam, 0);
      let gx = cam - 40;
      const gaps = this.obs.filter(o => o.k === 'gap' && o.x + 480 > cam - 50 && o.x < cam + W + 50).sort((a, b) => a.x - b.x);
      for (const g of gaps) { if (g.x > gx) { c.fillStyle = '#100d16'; c.fillRect(gx, GY, g.x - gx, 100); c.fillStyle = COL.gold; c.fillRect(gx, GY, g.x - gx, 2); } gx = g.x + 480; }
      c.fillStyle = '#100d16'; c.fillRect(gx, GY, cam + W + 60 - gx, 100); c.fillStyle = COL.gold; c.fillRect(gx, GY, cam + W + 60 - gx, 2);
      for (const o of this.obs) {
        if (o.x > cam + W + 40 || o.x < cam - 520) continue;
        if (o.k === 'spike') { c.fillStyle = '#d9d2e3'; c.beginPath(); c.moveTo(o.x, GY); c.lineTo(o.x + 10, GY - 16); c.lineTo(o.x + 20, GY); c.lineTo(o.x + 30, GY - 16); c.lineTo(o.x + 40, GY); c.fill(); continue; }
        const who = o.lie || OBS[o.k].who, col = CH[who].col;
        let tagX = o.x + 20;
        if (o.k === 'brick' && !o.broken) { c.fillStyle = '#1c0f06'; c.fillRect(o.x, 30, 44, GY - 30); c.strokeStyle = 'rgba(255,138,31,.45)'; for (let y = 30; y < GY; y += 18) c.strokeRect(o.x + .5, y + .5, 43, 18); }
        if (o.k === 'laser') { c.save(); c.fillStyle = 'rgba(255,43,58,.45)'; c.shadowColor = COL.red; c.shadowBlur = 18; c.fillRect(o.x, 30, 14, GY - 30); c.fillStyle = '#fff'; c.fillRect(o.x + 6, 30, 2, GY - 30); c.restore(); tagX = o.x + 7; }
        if (o.k === 'fog') { for (let i = 0; i < 9; i++) { const g = c.createRadialGradient(o.x + 35, 60 + i * 44, 2, o.x + 35, 60 + i * 44, 46); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(o.x - 15, 14 + i * 44, 100, 92); } c.strokeStyle = 'rgba(255,255,255,.08)'; c.strokeRect(o.x, 30, 70, GY - 30); tagX = o.x + 35; }
        if (o.k === 'high') { c.fillStyle = '#100d16'; c.fillRect(o.x, GY - 135, 40, 135); c.fillStyle = '#efeaf7'; c.fillRect(o.x, GY - 135, 40, 2); }
        if (o.k === 'plate') {
          c.fillStyle = o.open ? '#3dff7a' : '#6f8cff'; c.fillRect(o.x, GY - 6, 70, 6);
          const gh = o.open ? 60 : GY - 30; c.fillStyle = '#14101c'; c.fillRect(o.x + 300, 30, 30, gh); c.strokeStyle = '#6f8cff'; c.strokeRect(o.x + 300.5, 30.5, 29, gh);
          tagX = o.x + 35;
        }
        if (o.k === 'gap') tagX = o.x + 240;
        if (!(o.k === 'brick' && o.broken)) {
          headIcon(c, who, tagX, o.k === 'high' ? GY - 165 : o.k === 'gap' ? GY - 60 : 70, 15, { ringCol: col });
          txt(c, OBS[o.k].name, tagX, o.k === 'high' ? GY - 187 : o.k === 'gap' ? GY - 82 : 100, { al: 'center', size: 10, col, w: 700, ls: 2 });
        }
      }
      c.restore();
      drawStick(c, this.cur, 200, this.y, { t: this.t, run: this.ground ? 1 : 0, air: !this.ground });
      const pr = Math.min(1, (this.dist + 200) / this.end);
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(200, 44, 560, 4); c.fillStyle = COL.gold; c.fillRect(200, 44, 560 * pr, 4);
      if (cfg.lie) txt(c, 'Les étiquettes mentent. Les formes, jamais.', 480, 68, { al: 'center', size: 13, it: true, col: COL.red });
      for (let i = 0; i < 6; i++) {
        const id = CH_ORDER[i], x = 480 - 3 * 76 + i * 76, ok = this.allowed.includes(id), on = id === this.cur;
        panel(c, x + 4, 490, 68, 44, { line: on ? CH[id].col : 'rgba(255,255,255,.1)', fill: on ? hexA(CH[id].col, .2) : 'rgba(10,8,14,.9)', glow: on ? CH[id].col : null, cut: 5 });
        c.save(); c.globalAlpha = ok ? 1 : .2; headIcon(c, id, x + 26, 512, 13); txt(c, String(i + 1), x + 56, 518, { al: 'center', size: 15, col: ok ? COL.ink : COL.dim, w: 700 }); c.restore();
      }
    }
  });
}

LEVELS.push({
  id: 8, host: 'golden', cast: CH_ORDER, title: 'La Course des Six', sub: 'Course avec changement de personnage', quoteBy: 'les six',
  quote: 'Chacun son obstacle. Il suffit de changer de personnage au bon moment. Facile.',
  tcontrols: 'Touche les portraits en bas : changer de personnage  ·  touche le haut de l’écran : sauter (garde le doigt pour sauter plus haut)',
  controls: 'Touches 1 à 6 (ou clic sur les portraits) : changer de personnage  ·  Espace / Z / clic : sauter',
  freed: 'Les six ont couru ensemble. Golden a chronométré. Il n\'est pas impressionné.',
  taunts: ['Mauvais personnage. Bon timing pour mourir.', 'Tu as paniqué sur le 4. Je l\'avais noté.', 'Six amis. Zéro coordination.'],
  phases: [
    { name: 'Trois Amis', proph: 'Tu vas oublier de changer de personnage avant la plaque. Deux fois.', tip: 'Mur → Fanta (3). Gouffre → None (2), reste au sol pour léviter. Plaque → Jules (1) pour ouvrir la porte.', make: runPhase({ chars: ['jules', 'none', 'fanta'], types: ['brick', 'gap', 'plate'], reps: 4, spd: 300 }) },
    { name: 'Cinq Amis', proph: 'Le mur haut arrive juste après le laser. Tu vas garder Norowareta.', tip: 'Laser → Norowareta (6). Mur haut → Mitty (4) et son double saut.', make: runPhase({ chars: ['jules', 'none', 'fanta', 'mitty', 'noro'], types: ['brick', 'gap', 'plate', 'laser', 'high'], reps: 3, spd: 320 }) },
    { name: 'Les Six', proph: 'J\'ai repeint les étiquettes. Tu vas lire les couleurs au lieu de regarder les formes.', tip: 'Brume noire → Fondu (5). Les portraits et couleurs mentent : fie-toi à la forme.', make: runPhase({ chars: CH_ORDER, types: ['brick', 'gap', 'plate', 'laser', 'high', 'fog'], reps: 3, spd: 335, lie: true }) }
  ]
});
