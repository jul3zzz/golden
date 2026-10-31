'use strict';
/* GOLDEN — mode libre : on choisit son perso, puis 5 niveaux de plateforme */

const FREE = { char: 'jules' };
Object.assign(DEATHMSG, {
  door: "Une fausse porte. Elles le sont presque toutes.",
  coffee: "Noyé dans le café de Golden. Il était encore chaud.",
  rain: "Une tasse, pile sur la tête. Golden visait ta prochaine position."
});
const FREE_TAUNTS = {
  jules: ['Tu t\'es essoufflé au pire moment. Je l\'avais noté.', 'BOUM. BOUM. Mort.'],
  none: ['Tu voyais le piège. Tu y es allé quand même.', 'Le plus gros cerveau. Le pire choix.'],
  fanta: ['Les muscles ne sautent pas plus loin.', 'Tu as frappé le mauvais mur.'],
  mitty: ['Même la GOAT tombe. Rarement. Là, oui.', 'Le double saut, c\'était pour sauter, pas pour paniquer.'],
  fondu: ['La brume t\'aimait bien. Le vide, moins.', 'Ta kippa a survécu. Toi, non.'],
  noro: ['Tu as phasé une demi-seconde trop tard.', 'Signal perdu. Encore.']
};

/* porte truquée : la toucher tue */
class FakeDoor {
  constructor(x, y, label) { Object.assign(this, { x, y, label, w: 36, h: 56 }); this.by = 'door'; }
  hurt(bx) { return U.rr(bx, { x: this.x - 12, y: this.y - 50, w: 24, h: 50 }); }
  draw(c, w) { w.drawExit(c, this); }
}
/* café qui monte */
class Coffee {
  constructor(y, spd, delay = 1.5) { Object.assign(this, { y, spd, delay, t: 0 }); this.by = 'coffee'; }
  update(dt) { this.t += dt; if (this.t > this.delay) this.y -= this.spd * dt; }
  hurt(bx) { return bx.y + bx.h > this.y + 8; }
  draw(c, w) {
    const y = this.y, t = this.t;
    c.save();
    const g = c.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#6b3a17'); g.addColorStop(.3, '#3a1d0a'); g.addColorStop(1, '#140903');
    c.fillStyle = g; c.beginPath(); c.moveTo(-10, H + 10);
    for (let x = -10; x <= w.Wd + 10; x += 20) c.lineTo(x, y + Math.sin(x * .03 + t * 3) * 4);
    c.lineTo(w.Wd + 10, H + 10); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(242,193,78,.55)'; c.shadowColor = COL.gold; c.shadowBlur = 10; c.lineWidth = 2; c.beginPath();
    for (let x = -10; x <= w.Wd + 10; x += 20) c.lineTo(x, y + Math.sin(x * .03 + t * 3) * 4);
    c.stroke(); c.shadowBlur = 0;
    c.fillStyle = 'rgba(255,220,170,.25)';
    for (let i = 0; i < 9; i++) { const bx = (i * 113 + t * 30) % w.Wd, by = y + 20 + ((i * 47 + t * 40) % 60); c.beginPath(); c.arc(bx, by, 2 + i % 3, 0, 7); c.fill(); }
    c.restore();
    if (this.t < this.delay + 2) txt(c, 'LE CAFÉ MONTE', w.Wd / 2, Math.min(H - 20, y - 14), { al: 'center', size: 13, col: COL.gold, w: 700, ls: 3, a: .8 });
  }
}
/* tasse lancée par Golden, avec son ombre d'avertissement */
class CupDrop {
  constructor(x, floorY = 460) { Object.assign(this, { x, y: -60, t: 0, warn: .7, fy: floorY }); this.by = 'rain'; }
  update(dt, w) {
    this.t += dt;
    if (this.t > this.warn) {
      this.y += 950 * dt;
      for (const b of w.blocks) if (w.solid(b) && b.y > 60 && U.inR(this.x, this.y, b.x, b.y, b.w, b.h)) { this.land(); return; }
      if (this.y > H + 40) this.gone = true;
    }
  }
  land() { this.gone = true; A.crack(); G.shake = Math.max(G.shake, 4); P.burst(this.x, this.y, 14, '#7a4a22', 200, .5); }
  hurt(bx) { return this.t > this.warn && U.rr(bx, { x: this.x - 15, y: this.y - 26, w: 30, h: 26 }); }
  draw(c) {
    const k = Math.min(1, this.t / this.warn);
    c.save(); c.fillStyle = `rgba(255,43,58,${.15 + .25 * k})`; c.beginPath(); c.ellipse(this.x, this.fy, 22 * (.5 + k * .5), 5, 0, 0, 7); c.fill(); c.restore();
    if (this.t > this.warn) drawBigCup(c, this.x - 18, this.y - 30, 40, 30);
  }
}
/* panneau (souvent menteur) */
function sign(c, x, y, s, col = COL.ink) {
  c.save(); c.fillStyle = '#3a2a18'; c.fillRect(x - 2, y, 4, 460 - y);
  const w = Math.max(70, s.length * 8.5 + 20);
  c.fillStyle = '#1a120a'; c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.fillRect(x - w / 2, y - 28, w, 28); c.strokeRect(x - w / 2, y - 28, w, 28); c.restore();
  txt(c, s, x, y - 9, { al: 'center', size: 12, col, w: 700, ls: 1 });
}
/* plateformes timides : elles s'enfoncent quand on reste dessus */
function shyPre(dt, w) {
  for (const b of w.blocks) if (b.shy && b.on) {
    const on = w.p.ground && w.p.gb === b;
    const ny = on ? b.y + 75 * dt : Math.max(b.by, b.y - 35 * dt);
    b.dy = ny - b.y; b.y = ny;
    if (on) w.p.y = b.y;
  }
}

const lp = d => L => platPhase(Object.assign({ char: FREE.char, start: [50, 460] }, typeof d === 'function' ? d(L) : d));

const FREE_LEVELS = [
  {
    id: 101, title: 'Le Hall des Pièges', sub: 'Pièges classiques',
    quote: 'Rien de nouveau ici. Des piques, des faux sols, une porte qui bouge. Et tu vas quand même mourir.',
    phases: [
      {
        name: 'Le Couloir Piégé', proph: 'Tu vas sauter au mauvais moment. Deux fois.',
        make: lp(L => ({
          blocks: [Bk(0, 460, 560, 80), Bk(560, 460, 90, 80, 'fake'), Bk(650, 460, 310, 80)],
          spikes: [Sp(300, 460, 32, 'up', { hidden: true }), Sp(430, 460, 48, 'up')],
          exit: [910, 460],
          triggers: [
            { x: 240, y: 0, w: 8, h: 540, fn: w => w.popSpike(w.spikes[0]) },
            { x: 660, y: 0, w: 8, h: 540, fn: w => { w.ents.push(new Faller(790, -90, 74, 62)); L.say('Attention à la tête.', 1.6); } }
          ]
        }))
      },
      {
        name: "L'Escalier", proph: 'La deuxième marche va céder. Tu le sais. Tu vas t\'arrêter dessus quand même.',
        tip: 'Le laser du haut clignote : passe quand il est éteint.',
        make: lp({
          blocks: [Bk(0, 460, 200, 80), Bk(260, 400, 90, 14), Bk(400, 340, 90, 14, 'fragile'), Bk(540, 290, 90, 14), Bk(690, 230, 270, 14), Bk(780, 110, 6, 120, 'laser', { blink: 2 })],
          spikes: [Sp(200, 540, 760, 'up')], exit: [910, 230]
        })
      },
      {
        name: 'La Porte Fuyarde', proph: 'La porte va fuir. Puis revenir. Puis fuir encore.',
        make: lp(L => ({
          blocks: [Bk(0, 460, 960, 80), Bk(620, 400, 100, 14), Bk(760, 345, 110, 14)],
          spikes: [Sp(420, 460, 32, 'up', { hidden: true })],
          exit: [880, 460],
          triggers: [
            { x: 790, y: 380, w: 10, h: 80, fn: w => { w.moveExit(835, 345); L.say('Une porte, ça monte aussi.', 2); } },
            { x: 770, y: 290, w: 10, h: 55, fn: w => { w.moveExit(60, 460); w.armed = true; L.say('Et ça redescend. Tout au fond.', 2.4); } },
            { x: 480, y: 0, w: 10, h: 540, once: false, fn: w => { if (w.armed && !w.sp) { w.sp = 1; w.popSpike(w.spikes[0]); } } }
          ]
        }))
      }
    ]
  },
  {
    id: 102, title: 'La Salle des Pouvoirs', sub: 'Chaque perso a son raccourci',
    quote: 'Fanta casse, Mitty saute, Fondu traverse, Norowareta phase, None réfléchit, Jules… essaie.',
    phases: [
      {
        name: 'Le Mur', proph: 'Tu vas sauter sur le mur. Le plafond t\'attend.',
        tip: 'Fanta peut casser le mur (X). Les autres passent par-dessus… sans sauter sous le plafond.',
        make: lp(L => ({
          blocks: [Bk(0, 460, 960, 80), Bk(470, 300, 40, 160, 'brick'), Bk(330, 400, 70, 14), Bk(400, 345, 60, 14), Bk(380, 150, 200, 14)],
          spikes: [Sp(380, 164, 200, 'down')], exit: [910, 460],
          triggers: [{ x: 600, y: 0, w: 8, h: 540, fn: w => w.ents.push(new Faller(690, -90, 74, 62)) }]
        }))
      },
      {
        name: 'Le Gouffre', proph: 'La plateforme du milieu va bouger juste quand tu sautes.',
        tip: 'Mitty a un double saut. None lévite (maintiens Saut). Les autres : timing.',
        make: lp({
          blocks: [Bk(0, 460, 300, 80), Bk(370, 420, 50, 14, 'fragile'), Bk(470, 390, 60, 14, 'move', { mx: 30, ms: 1.6 }), Bk(580, 420, 50, 14, 'fragile'), Bk(700, 460, 260, 80)],
          spikes: [Sp(300, 540, 400, 'up')], exit: [910, 460]
        })
      },
      {
        name: 'Brume et Lasers', proph: 'Tu vas traverser le deuxième laser une demi-seconde trop tôt.',
        tip: 'Fondu traverse la brume. Norowareta phase à travers les lasers (X). Les autres grimpent et attendent.',
        make: lp({
          blocks: [Bk(0, 460, 960, 80), Bk(300, 240, 40, 220, 'fog'), Bk(200, 400, 60, 14), Bk(110, 340, 60, 14), Bk(200, 285, 60, 14),
            Bk(560, 40, 6, 420, 'laser', { blink: 2.4, bp: 0 }), Bk(650, 40, 6, 420, 'laser', { blink: 2.4, bp: -.55 }), Bk(740, 40, 6, 420, 'laser', { blink: 2.4, bp: -1.1 })],
          exit: [900, 460]
        })
      }
    ]
  },
  {
    id: 103, title: 'Le Labyrinthe Menteur', sub: 'Panneaux et portes truqués',
    quote: 'J\'ai écrit tous les panneaux moi-même. Avec amour. Et avec mensonges.',
    phases: [
      {
        name: 'Les Trois Portes', proph: 'Tu vas choisir la porte qui dit « VRAIE SORTIE ». Évidemment.',
        tip: 'Une seule porte est vraie. Toucher une fausse porte tue : saute par-dessus.',
        make: lp({
          blocks: [Bk(0, 460, 960, 80)], exit: [880, 460], exitLabel: 'PAS ICI',
          init: w => { w.ents.push(new FakeDoor(300, 460, 'SORTIE'), new FakeDoor(590, 460, 'VRAIE SORTIE')); }
        })
      },
      {
        name: 'Les Panneaux', proph: 'Tu vas obéir aux panneaux. Ils ont été écrits par moi.',
        make: lp(L => ({
          blocks: [Bk(0, 460, 330, 80), Bk(410, 460, 550, 80), Bk(560, 330, 180, 14)],
          spikes: [Sp(330, 540, 80, 'up'), Sp(560, 344, 180, 'down'), Sp(800, 460, 32, 'up', { hidden: true })],
          exit: [910, 460],
          triggers: [{ x: 760, y: 0, w: 8, h: 540, fn: w => w.popSpike(w.spikes[2]) }],
          over: (c, w) => w.withCam(c, () => { sign(c, 290, 380, 'NE SAUTE PAS', COL.red); sign(c, 520, 400, 'SAUTE ICI →', '#3dff7a'); sign(c, 860, 380, '← SORTIE'); })
        }))
      },
      {
        name: 'Les Plateformes Timides', proph: 'Elles s\'enfoncent quand tu restes dessus. Tu vas rester dessus.',
        make: lp({
          blocks: [Bk(0, 460, 140, 80), Bk(200, 410, 70, 14, 'solid', { shy: 1 }), Bk(330, 380, 70, 14, 'solid', { shy: 1 }), Bk(460, 410, 70, 14, 'solid', { shy: 1 }),
            Bk(590, 370, 70, 14, 'solid', { shy: 1 }), Bk(720, 400, 70, 14, 'solid', { shy: 1 }), Bk(850, 460, 110, 80)],
          spikes: [Sp(140, 540, 710, 'up')], exit: [905, 460], pre: shyPre
        })
      }
    ]
  },
  {
    id: 104, title: 'La Tour de Café', sub: 'Ça monte, ça tombe',
    quote: 'Mon café déborde. C\'est ton problème, pas le mien.',
    phases: [
      {
        name: 'La Montée', proph: 'Tu vas suivre le zigzag. Le zigzag ment à la fin.',
        tip: 'Le café monte : grimpe sans traîner. Une des dernières plateformes est fausse.',
        make: lp({
          blocks: [Bk(0, 460, 960, 80), Bk(120, 400, 120, 14), Bk(300, 345, 110, 14), Bk(470, 290, 110, 14, 'fragile'), Bk(640, 240, 110, 14),
            Bk(480, 185, 110, 14), Bk(300, 130, 110, 14, 'fake'), Bk(660, 130, 120, 14)],
          exit: [735, 130], init: w => w.ents.push(new Coffee(560, 16))
        })
      },
      {
        name: 'La Pluie de Tasses', proph: 'Je vise là où tu seras. Comme toujours.',
        tip: 'Survis 22 secondes. Les ombres rouges montrent où la tasse va tomber : change de direction.',
        make: lp(L => ({
          start: [480, 460], eyes: false,
          blocks: [Bk(0, 460, 960, 80), Bk(180, 350, 140, 14), Bk(640, 350, 140, 14)],
          init: w => { w.cT = 1.4; w.n = 0; },
          pre: (dt, w) => {
            w.cT -= dt;
            if (w.cT <= 0) {
              w.n++; w.cT = (L.pity ? 1.3 : 1) - Math.min(.3, w.t * .012);
              const p = w.p, x = w.n % 3 === 0 ? p.x : U.clamp(p.x + p.vx * .65, 30, W - 30);
              const fy = (x > 180 && x < 320 && p.y < 400) || (x > 640 && x < 780 && p.y < 400) ? 350 : 460;
              w.ents.push(new CupDrop(x, fy));
            }
            if (w.t >= 22) w.won = true;
          },
          over: (c, w) => {
            drawStick(c, 'golden', 480, 110 + Math.sin(w.t * 2) * 6, { s: 1.8, t: w.t, drink: w.cT > .6 });
            txt(c, `${Math.max(0, 22 - w.t).toFixed(1)} s`, 480, 66, { al: 'center', size: 22, f: 'd', col: COL.gold, w: 900 });
          }
        }))
      },
      {
        name: 'Le Déluge', proph: 'Café en bas, tasses en haut. Tu vas regarder le mauvais côté.',
        tip: 'Grimpe vers la gauche. Les tasses suivent ta trajectoire.',
        make: lp(L => ({
          start: [910, 460],
          blocks: [Bk(0, 460, 960, 80), Bk(720, 400, 120, 14), Bk(550, 345, 110, 14), Bk(380, 290, 110, 14), Bk(210, 240, 110, 14, 'fragile'),
            Bk(370, 185, 110, 14), Bk(180, 130, 140, 14)],
          exit: [230, 130],
          init: w => { w.ents.push(new Coffee(560, 19, 1.2)); w.cT = 2; },
          pre: (dt, w) => {
            w.cT -= dt;
            if (w.cT <= 0) {
              w.cT = L.pity ? 2.2 : 1.6;
              const p = w.p, x = U.clamp(p.x + p.vx * .6, 30, W - 30);
              const under = w.blocks.filter(b => b.on && b.k !== 'laser' && x > b.x && x < b.x + b.w && b.y >= p.y - 2).sort((a, b) => a.y - b.y)[0];
              w.ents.push(new CupDrop(x, under ? under.y : 460));
            }
          }
        }))
      }
    ]
  },
  {
    id: 105, title: 'La Prédiction Finale', sub: 'Golden joue contre toi',
    quote: 'Tu as choisi ton personnage. Je l\'avais choisi avant toi.',
    phases: [
      {
        name: 'Le Long Couloir', proph: 'Tu vas rater le faux sol. Puis le mur. Puis tout le reste.',
        tip: 'Le couloir est long : la caméra suit. Tous les pièges du mode libre, à la suite.',
        make: lp(L => ({
          w: 1920,
          blocks: [Bk(0, 460, 600, 80), Bk(600, 460, 80, 80, 'fake'), Bk(680, 460, 420, 80), Bk(810, 395, 60, 14), Bk(880, 330, 40, 130, 'brick'),
            Bk(1190, 460, 730, 80), Bk(1400, 60, 6, 400, 'laser', { blink: 2.2 }), Bk(1490, 60, 6, 400, 'laser', { blink: 2.2, bp: -.6 })],
          spikes: [Sp(1100, 540, 90, 'up'), Sp(1660, 460, 32, 'up', { hidden: true })],
          exit: [1870, 460],
          triggers: [
            { x: 1240, y: 0, w: 8, h: 540, fn: w => w.ents.push(new Faller(1320, -90, 74, 62)) },
            { x: 1610, y: 0, w: 8, h: 540, fn: w => w.popSpike(w.spikes[1]) },
            { x: 1800, y: 0, w: 8, h: 540, fn: w => { w.moveExit(1760, 460); L.say('Je l\'ai reculée de quelques pas. Pour le plaisir.', 2.2); } }
          ]
        }))
      },
      {
        name: 'Les Frappes', proph: 'Je frappe là où tu seras dans une seconde. Pas là où tu es.',
        tip: 'Survis 26 secondes. Change de direction quand une cible rouge apparaît devant toi.',
        make: lp(L => ({
          start: [480, 460], eyes: false,
          blocks: [Bk(0, 460, 960, 80), Bk(180, 350, 140, 14), Bk(640, 350, 140, 14), Bk(410, 250, 140, 14)],
          init: w => { w.sT = 1.2; w.n = 0; },
          pre: (dt, w) => {
            w.sT -= dt;
            if (w.sT <= 0) {
              // les persos lents ont plus de temps pour esquiver
              const k = Math.max(1, 255 / w.st.spd);
              w.n++; w.sT = ((L.pity ? 1.25 : .95) - Math.min(.25, w.t * .006)) * k;
              const p = w.p, lead = .75 * k, x = w.n % 4 === 0 ? p.x : U.clamp(p.x + p.vx * lead, 30, W - 30);
              w.ents.push(new Strike(x, lead));
            }
            if (w.t >= 26) w.won = true;
          },
          over: (c, w) => {
            drawStick(c, 'golden', 480, 120 + Math.sin(w.t * 2) * 6, { s: 1.8, t: w.t, drink: w.sT > .6 });
            txt(c, `${Math.max(0, 26 - w.t).toFixed(1)} s`, 480, 66, { al: 'center', size: 22, f: 'd', col: COL.gold, w: 900 });
          }
        }))
      },
      {
        name: 'La Vraie Porte, Encore', proph: 'Tu connais déjà la réponse. Tu vas l\'oublier quand même.',
        make: L => {
          const spawn = Bk(0, 460, 130, 80);
          const stairs = [Bk(380, 400, 80, 14), Bk(500, 340, 80, 14), Bk(620, 280, 80, 14), Bk(740, 220, 220, 14)];
          const sp = Sp(258, 460, 48, 'up', { hidden: true });
          return platPhase({
            char: FREE.char, start: [60, 460], blocks: [spawn, Bk(130, 460, 830, 80), ...stairs], spikes: [sp],
            exit: [905, 220], exitFake: true,
            triggers: [
              { x: 700, y: 380, w: 10, h: 80, once: false, fn: w => { if (w.armed && !w.c1) { w.c1 = 1; w.ents.push(new Faller(520, -90, 74, 62)); } } },
              { x: 430, y: 380, w: 10, h: 80, once: false, fn: w => { if (w.armed && !w.c2) { w.c2 = 1; w.ents.push(new Faller(230, -90, 74, 62)); } } }
            ],
            onFake: w => {
              A.oi(); G.shake = 10; w.armed = true;
              L.say('oi oi oi. Encore sous tes pieds. Je te l\'avais déjà fait au niveau 1.', 3.6);
              stairs.forEach(b => w.crumble(b));
              w.crumble(spawn); w.popSpike(sp);
              w.decoDoors.push(w.exit);
              w.exit = { x: 65, y: 540, w: 120, h: 56, fake: false, tx: null, ty: null };
            }
          });
        }
      }
    ]
  }
];
FREE_LEVELS.forEach((lv, i) => {
  Object.assign(lv, {
    free: true, tag: 'LIBRE ' + (i + 1), quoteBy: 'Golden', idx: i,
    tcontrols: '◀ ▶ : bouger  ·  ▲ : sauter  ·  ✦ : capacité (Fanta frappe, Norowareta phase)',
    controls: '← → ou Q D : bouger  ·  Espace, Z ou ↑ : sauter  ·  X ou Maj : capacité (Fanta frappe, Norowareta phase)',
    back: () => new FreeScene()
  });
  Object.defineProperty(lv, 'freed', { get: () => `${CH[FREE.char].name} a survécu à « ${lv.title} ». Golden fait semblant de ne pas être surpris.` });
});

function startFree(i) {
  const lv = FREE_LEVELS[i];
  lv.host = FREE.char;
  lv.taunts = FREE_TAUNTS[FREE.char];
  G.go(new LevelRun(lv));
}

/* écran de choix : perso + niveau */
const FREE_STATS = {
  jules: { v: 1, s: 2, cap: 'Lourd : casse les sols fragiles très vite, s\'essouffle' },
  none: { v: 3, s: 3, cap: 'Lévite (maintiens Saut) et voit les pièges cachés' },
  fanta: { v: 4, s: 3, cap: 'Frappe (X) : pulvérise les murs de briques' },
  mitty: { v: 5, s: 4, cap: 'Double saut. C\'est la GOAT.' },
  fondu: { v: 4, s: 4, cap: 'Traverse les murs de brume noire' },
  noro: { v: 4, s: 4, cap: 'Phase (X) : traverse les lasers' }
};
class FreeScene {
  enter() { this.t = 0; FREE.char = S.d.free.last || FREE.char; A.amb(.04); G.touchUI(false); }
  update(dt) {
    this.t += dt;
    if (G.hit.Escape) G.go(new TitleScene());
    CH_ORDER.forEach((id, i) => { if (G.hit['Digit' + (i + 1)]) this.pick(id); });
    if (G.hit.ArrowRight || G.hit.KeyD) this.pick(CH_ORDER[(CH_ORDER.indexOf(FREE.char) + 1) % 6]);
    if (G.hit.ArrowLeft || G.hit.KeyA) this.pick(CH_ORDER[(CH_ORDER.indexOf(FREE.char) + 5) % 6]);
    const m = G.mouse;
    if (m.click) CH_ORDER.forEach((id, i) => { if (U.inR(m.x, m.y, 40 + i * 148, 96, 136, 176)) { m.click = false; this.pick(id); } });
  }
  pick(id) { if (FREE.char !== id) { FREE.char = id; S.d.free.last = id; S.save(); A.click(); } }
  draw(c) {
    const t = this.t, sel = FREE.char, fr = S.d.free;
    throneBg(c, t);
    txt(c, 'MODE LIBRE', 40, 58, { size: 40, f: 'd', col: COL.gold, w: 900, glow: hexA(COL.gold, .5) });
    txt(c, 'Choisis ton perso, puis un des 5 niveaux. Chaque perso a ses avantages.', 42, 82, { size: 14, col: COL.dim });
    CH_ORDER.forEach((id, i) => {
      const x = 40 + i * 148, y = 96, on = id === sel, ch = CH[id];
      const hov = U.inR(G.mouse.x, G.mouse.y, x, y, 136, 176); if (hov) G.hover = true;
      panel(c, x, y, 136, 176, { line: on ? ch.col : hov ? hexA(ch.col, .5) : 'rgba(255,255,255,.1)', glow: on ? hexA(ch.col, .35) : null });
      if (on) softAura(c, x + 68, y + 92, ch.col, 70, .25);
      drawStick(c, id, x + 68, y + 128, { s: 1.75, t: t + i, run: on && Math.sin(t * 1.2) > .4 ? 1 : 0 });
      txt(c, ch.name, x + 68, y + 152, { al: 'center', size: 15, col: on ? ch.col : COL.ink, w: 700 });
      txt(c, String(i + 1), x + 10, y + 18, { size: 11, col: COL.dim, w: 700 });
      const st = FREE_STATS[id];
      for (let k = 0; k < 5; k++) { c.fillStyle = k < st.v ? hexA(ch.col, .9) : 'rgba(255,255,255,.1)'; c.fillRect(x + 22 + k * 19, y + 164, 15, 4); }
    });
    const st = FREE_STATS[sel];
    txt(c, `${CH[sel].name.toUpperCase()}  ·  ${CH[sel].title}`, 40, 300, { size: 12, col: CH[sel].col, w: 700, ls: 3 });
    txt(c, st.cap, 40, 322, { size: 15, col: COL.ink, w: 600 });
    FREE_LEVELS.forEach((lv, i) => {
      const x = 40 + i * 178, y = 346, open = i < fr.un, done = (fr.done[lv.id] || []);
      const hov = open && U.inR(G.mouse.x, G.mouse.y, x, y, 166, 124);
      panel(c, x, y, 166, 124, { line: done.includes(sel) ? COL.gold : hov ? CH[sel].col : open ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)', glow: hov ? hexA(CH[sel].col, .3) : null });
      c.save(); c.globalAlpha = open ? 1 : .35;
      txt(c, lv.tag, x + 14, y + 24, { size: 11, col: COL.gold, w: 700, ls: 3 });
      wrap(c, lv.title, x + 14, y + 52, 140, 22, { size: 19, f: 'd', col: COL.ink, w: 900 });
      txt(c, open ? lv.sub : 'Verrouillé', x + 14, y + 98, { size: 11, col: COL.dim, max: 140 });
      done.forEach((id, k) => headIcon(c, id, x + 22 + k * 22, y + 112, 9, { ringCol: CH[id].col }));
      c.restore();
      if (hov) G.hover = true;
      if (open && hov && G.mouse.click) { G.mouse.click = false; A.click(); startFree(i); }
    });
    txt(c, 'Termine un niveau (avec n\'importe qui) pour débloquer le suivant. Les médaillons montrent qui l\'a fini.', 40, 500, { size: 12, col: COL.dim });
    if (btn(c, 800, 20, 140, 32, '← Titre', { size: 13, cut: 5 })) G.go(new TitleScene());
    soundBtn(c, 680, 21);
  }
}
