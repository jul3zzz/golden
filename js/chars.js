'use strict';
/* GOLDEN — les personnages (stickmans dessinés au trait) */

const CH = {
  jules: { name: 'Jules', col: '#6f8cff', title: 'Le Poids Lourd', desc: "Gros. Très lent. Chaque pas fait BOUM, et s'il court trop longtemps, il doit s'arrêter pour reprendre son souffle.", power: "Casse les sols fragiles. Les plaques de pression l'adorent." },
  none: { name: 'None', col: '#b57bff', title: 'Le Cerveau', desc: "Un cerveau tellement gros qu'il ne rentre plus dans son crâne. Il réfléchit à tout. Surtout trop.", power: 'Lévite par la pensée et voit les pièges cachés.' },
  fanta: { name: 'Fanta', col: '#ff8a1f', title: 'Le Musclé', desc: "Des bras plus gros que sa tête. Il frappe d'abord et ne réfléchit jamais.", power: 'Pulvérise les murs de briques.' },
  mitty: { name: 'Mitty', col: '#ff5fa2', title: 'La GOAT', desc: "La GOAT. La plus forte de la bande, la plus agile, la seule qui garde son calme. Même Golden la respecte (il ne l'avouera jamais).", power: 'Double saut.' },
  fondu: { name: 'Fondu', col: '#5dff9e', title: 'Le Fondu', desc: "Sa kippa ne tombe jamais, même la tête en bas. Il connaît le noir mieux que personne.", power: 'Traverse les murs de brume noire.' },
  noro: { name: 'Norowareta', col: '#29f0ff', title: "L'Hologramme", desc: "呪われた. Un signal maudit coincé entre deux fréquences. Il n'existe qu'à 72 %.", power: 'Phase à travers les lasers.' },
  golden: { name: 'Golden', col: '#f2c14e', title: 'Roi du Ragebait', desc: "Yeux rouges, tasse de café, aura infinie. Il a déjà prédit ta prochaine erreur. oi oi oi.", power: 'Prédit tout.' }
};
const CH_ORDER = ['jules', 'none', 'fanta', 'mitty', 'fondu', 'noro'];
const HEADY = { jules: -46 };

function seg(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }

/* cerveau géant de None, posé sur le haut du crâne (R = taille) */
function drawBrain(c, headY, hr, R, col, t, tint) {
  const pul = 1 + .025 * Math.sin(t * 4), rx = R * 1.18 * pul, ry = R * .86 * pul;
  const cx = -.5, cy = headY - hr * .35 - ry * .8;
  c.save();
  c.beginPath();
  const n = 9, steps = n * 8;
  for (let i = 0; i <= steps; i++) {
    const a = i / steps * Math.PI * 2, k = 1 + .06 * Math.abs(Math.sin(a * n / 2));
    const fl = Math.sin(a) > 0 ? 1 - .22 * Math.sin(a) : 1; // dessous un peu aplati
    const px = cx + Math.cos(a) * rx * k, py = cy + Math.sin(a) * ry * k * fl;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
  if (tint) c.fillStyle = 'transparent';
  else { const g = c.createRadialGradient(cx - rx * .3, cy - ry * .5, 1, cx, cy, rx * 1.15); g.addColorStop(0, '#ffd2ef'); g.addColorStop(.45, '#e48ad0'); g.addColorStop(1, '#7d3e9c'); c.fillStyle = g; }
  c.strokeStyle = tint || col; c.lineWidth = 2; c.fill(); c.stroke();
  if (!tint) {
    c.save(); c.clip();
    c.shadowBlur = 0; c.strokeStyle = 'rgba(92,30,110,.75)'; c.lineWidth = Math.max(1, R * .085);
    // scissure entre les deux hémisphères
    c.beginPath(); c.moveTo(cx, cy - ry * 1.05); c.bezierCurveTo(cx + 1.5, cy - ry * .4, cx - 1.5, cy + ry * .1, cx + .5, cy + ry * .55); c.stroke();
    // circonvolutions
    for (const sd of [-1, 1]) for (let r = 0; r < 4; r++) {
      const y0 = cy - ry * .62 + r * ry * .42, x0 = cx + sd * rx * .12, x1 = cx + sd * rx * (.95 - Math.abs(r - 1.3) * .14);
      c.beginPath(); c.moveTo(x0, y0);
      const segs = 4;
      for (let j = 1; j <= segs; j++) { const xx = x0 + (x1 - x0) * j / segs, yy = y0 + (j % 2 ? -1 : 1) * ry * .14 + Math.sin(r * 3 + j) * ry * .05; c.quadraticCurveTo(x0 + (x1 - x0) * (j - .5) / segs, yy + (j % 2 ? -1 : 1) * ry * .1, xx, yy); }
      c.stroke();
    }
    c.restore();
    // reflet
    c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.35)';
    c.beginPath(); c.ellipse(cx - rx * .45, cy - ry * .5, rx * .16, ry * .1, -.5, 0, 7); c.fill();
    // éclairs de pensée
    if (Math.sin(t * 5.3) > .82) {
      c.strokeStyle = '#fff2a8'; c.shadowColor = col; c.shadowBlur = 10; c.lineWidth = 1.3;
      const sx = cx + Math.sin(t * 17) * rx * .6, sy = cy - ry * 1.05;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 3, sy - 4); c.lineTo(sx - 1, sy - 6); c.lineTo(sx + 2, sy - 10); c.stroke();
    }
  }
  c.restore();
}

/* x,y = pieds. o : s, face, t, run, air, punch, drink, brain, a, crown, redEyes, noRed, noCape */
function drawStick(c, id, x, y, o = {}) {
  const s = o.s || 1, f = o.face || 1, t = o.t || 0;
  c.save(); c.translate(x, y); c.scale(s * f, s);
  let alpha = o.a == null ? 1 : o.a;
  if (id === 'noro') alpha *= .8 + .17 * Math.sin(t * 23) * Math.sin(t * 5.3);
  c.globalAlpha *= alpha;
  if (id === 'noro') {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 24);
    g.addColorStop(0, 'rgba(41,240,255,.5)'); g.addColorStop(1, 'rgba(41,240,255,0)');
    c.fillStyle = g; c.fillRect(-24, -8, 48, 12);
    c.save(); c.globalAlpha *= .4;
    c.translate(-2.5, 0); stickBody(c, id, o, '#ff2b6a');
    c.translate(5, 0); stickBody(c, id, o, '#29f0ff');
    c.restore();
  }
  if (id === 'golden' && !o.noCape) {
    const fl = Math.sin(t * 2.2) * 4;
    c.save(); c.fillStyle = '#0d0608'; c.strokeStyle = 'rgba(242,193,78,.45)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-5, -31); c.quadraticCurveTo(-16, -14, -20 + fl, 2); c.lineTo(-2, -2); c.lineTo(4, -30); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  stickBody(c, id, o, null);
  if (id === 'noro') {
    c.shadowBlur = 0; c.fillStyle = 'rgba(6,5,9,.55)';
    for (let yy = -62; yy < 2; yy += 3) c.fillRect(-22, yy + ((t * 40) % 3), 44, 1);
    if (Math.sin(t * 9) > .93) { c.fillStyle = 'rgba(41,240,255,.5)'; c.fillRect(-14, -30 + Math.sin(t * 50) * 12, 28, 2); }
  }
  c.restore();
}

/* armature de chaque perso : y des hanches / épaules / tête (pieds = 0),
   écart des hanches et des épaules, longueurs cuisse/tibia et bras/avant-bras */
const RIG = {
  base: { hip: -19, sh: -33, head: -43, hr: 8, hipX: 1.5, shL: -1.5, shR: 1.5, th: 10, sn: 10, ua: 8.5, fa: 8 },
  jules: { hip: -13, sh: -31, head: -46, hr: 9.5, hipX: 5, shL: -9, shR: 11.5, th: 7, sn: 7, ua: 9, fa: 8.5 },
  fanta: { shL: -11, shR: 11, hipX: 3.5, ua: 9, fa: 8.5 },
  mitty: { hip: -13, sh: -32, head: -42, hipX: 3, th: 7, sn: 7 }
};
const rigOf = id => Object.assign({}, RIG.base, RIG[id]);

/* coude ou genou (IK à deux os) : pref = côté vers lequel l'articulation doit plier */
function ikJoint(sx, sy, hx, hy, a, b, px, py) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || .01;
  const max = a + b - .05;
  if (d > max) { hx = sx + dx / d * max; hy = sy + dy / d * max; d = max; }
  const th = Math.atan2(hy - sy, hx - sx), al = Math.acos(U.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const e1 = th + al, e2 = th - al;
  const e = Math.cos(e1) * px + Math.sin(e1) * py >= Math.cos(e2) * px + Math.sin(e2) * py ? e1 : e2;
  return [sx + Math.cos(e) * a, sy + Math.sin(e) * a, hx, hy];
}
function limb(c, sx, sy, hx, hy, a, b, px, py) {
  const j = ikJoint(sx, sy, hx, hy, a, b, px, py);
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(j[0], j[1]); c.lineTo(j[2], j[3]); c.stroke();
  return j;
}

function stickBody(c, id, o, tint) {
  const t = o.t || 0, run = o.run || 0, air = !!o.air, wnd = !!o.winded && !air;
  const ink = tint || (id === 'golden' ? '#f7d27c' : id === 'noro' ? '#8ff8ff' : '#efeaf7');
  const col = CH[id].col, dark = '#0b0910', big = id === 'jules';
  c.strokeStyle = ink; c.fillStyle = ink; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = o.lw || 3;
  c.shadowColor = col; c.shadowBlur = tint ? 0 : (o.glow == null ? 9 : o.glow);
  const R = rigOf(id), ph = o.gait != null ? o.gait : t * 13;
  const sw = Math.sin(ph) * run;

  // le haut du corps monte et descend (respiration, foulée, essoufflement)
  let bob = run ? -Math.abs(Math.cos(ph)) * (big ? 2.2 : 1.6) : air ? 0 : Math.sin(t * 2.2) * .5;
  if (wnd) bob = 4 + Math.sin(t * 9) * 1.2;
  const hipY = R.hip + (run ? bob * .6 : wnd ? 2 : 0), shY = R.sh + bob, headY = R.head + bob * (wnd ? 1.1 : 1), hr = R.hr;

  // jambes : on place les pieds, les genoux se plient tout seuls
  const ga = big ? 7 : 10;
  let fL, fR, kp;
  if (air) { fL = [-5, -6]; fR = [7, -10]; kp = 1; }
  else if (run) { fL = [Math.sin(ph) * ga, -Math.max(0, Math.cos(ph)) * 4.5]; fR = [-Math.sin(ph) * ga, -Math.max(0, -Math.cos(ph)) * 4.5]; kp = 1; }
  else if (wnd) { fL = [-R.hipX - 6, 0]; fR = [R.hipX + 6, 0]; kp = 0; }
  else { fL = [-R.hipX - 4, 0]; fR = [R.hipX + 4, 0]; kp = 0; }
  const leg = (hx, f, side) => {
    const j = limb(c, hx, hipY, f[0], f[1], R.th, R.sn, kp ? 1 : side, kp ? 0 : -.3);
    seg(c, j[2], j[3], j[2] + 3.5, j[3]); // pied
  };
  leg(-R.hipX, fL, -1); leg(R.hipX, fR, 1);

  // cheveux de Mitty (derrière)
  if (id === 'mitty') {
    const sway = run ? Math.sin(ph) * 2 : air ? -3 : 0;
    c.save(); c.fillStyle = tint ? 'transparent' : '#1d0a16';
    c.beginPath(); c.moveTo(-1, headY - 9); c.quadraticCurveTo(-15 + sway, headY - 3, -12 + sway, shY + 11); c.lineTo(-5, shY + 6); c.quadraticCurveTo(-6, headY + 4, 4, headY - 6); c.closePath();
    c.fill(); c.stroke(); c.restore();
  }

  // tronc
  if (big) {
    seg(c, 0, headY + hr, 1, shY - 4);
    c.save(); c.fillStyle = tint ? 'transparent' : dark; c.beginPath(); c.ellipse(1.5, (shY + hipY) / 2 - 1, 12.5, (hipY - shY) / 2 + 4, 0, 0, 7); c.fill(); c.stroke();
    if (!tint) { c.shadowBlur = 0; c.strokeStyle = hexA(col, .55); c.lineWidth = 1.2; c.beginPath(); c.arc(6, (shY + hipY) / 2 + 1, 1.3, 0, 7); c.stroke(); }
    c.restore();
  } else if (id === 'fanta') {
    seg(c, 0, headY + hr, 0, shY);
    c.save(); c.fillStyle = tint ? 'transparent' : dark; c.beginPath(); c.moveTo(R.shL - 1, shY - 1); c.lineTo(R.shR + 1, shY - 1); c.lineTo(4, hipY); c.lineTo(-4, hipY); c.closePath(); c.fill(); c.stroke();
    if (!tint) {
      // pectoraux
      c.shadowBlur = 0; c.strokeStyle = hexA(col, .65); c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-7, shY + 2.5); c.quadraticCurveTo(-4, shY + 7, -.6, shY + 4); c.stroke();
      c.beginPath(); c.moveTo(7, shY + 2.5); c.quadraticCurveTo(4, shY + 7, .6, shY + 4); c.stroke();
    }
    c.restore();
  } else if (id === 'mitty') {
    seg(c, 0, headY + hr, 0, shY);
    c.save(); c.fillStyle = tint ? 'transparent' : '#2a0f1f'; c.beginPath(); c.moveTo(-3, shY); c.lineTo(3, shY); c.lineTo(11 + sw * 2, hipY); c.lineTo(-11 + sw * 2, hipY); c.closePath(); c.fill(); c.stroke(); c.restore();
  } else {
    seg(c, 0, headY + hr, 0, hipY);
  }

  // bras : on place les mains, les coudes se plient tout seuls
  const sL = [R.shL, shY + (big ? 0 : 1)], sR = [R.shR, shY + (big ? 0 : 1)];
  const out = big ? 7 : id === 'fanta' ? 3 : 5;
  let hL, hR, eL = [-1, .4], eR = [1, .4];
  if (air) { hL = [sL[0] - 11, shY - 7]; hR = [sR[0] + 11, shY - 9]; eL = [-.4, 1]; eR = [.4, 1]; }
  else if (run) {
    const sa = big ? 3.5 : 8;
    hL = [sL[0] - (big ? out : 1) - Math.sin(ph) * sa, shY + 13]; hR = [sR[0] + (big ? out : 1) + Math.sin(ph) * sa, shY + 13];
    if (!big) { eL = [-1, .2]; eR = [-1, .2]; }
  } else { hL = [sL[0] - out, shY + 15]; hR = [sR[0] + out, shY + 15]; }
  if (wnd) { hL = [-R.hipX - 5, hipY + 7]; hR = [R.hipX + 7, hipY + 7]; }
  if (o.punch) { hR = [sR[0] + 22, shY + 1]; eR = [0, 1]; }
  if (o.drink) { hR = [6, headY + 6]; eR = [1, .6]; }
  if (o.cup && !o.drink) { hR = [sR[0] + 10, shY + 9]; eR = [.2, 1]; }
  const h1 = hL, h2 = hR;
  const arm = (s, h, e) => {
    if (id === 'fanta') {
      c.save(); c.lineWidth = 5;
      const j = limb(c, s[0], s[1], h[0], h[1], R.ua, R.fa, e[0], e[1]);
      const mx = (s[0] + j[0]) / 2, my = (s[1] + j[1]) / 2;
      c.fillStyle = tint ? 'transparent' : ink;
      c.beginPath(); c.ellipse(mx, my, 4.3, 3, Math.atan2(j[1] - s[1], j[0] - s[0]), 0, 7); c.fill();
      c.beginPath(); c.arc(j[2], j[3], 3, 0, 7); c.fill();
      c.restore();
    } else limb(c, s[0], s[1], h[0], h[1], R.ua, R.fa, e[0], e[1]);
  };
  // Jules : bras devant le ventre, sinon le bras du fond passe derrière
  if (!big) arm(sL, h1, eL);

  // tête
  c.save(); c.fillStyle = tint ? 'transparent' : dark; c.beginPath(); c.arc(0, headY, hr, 0, 7); c.fill(); c.stroke(); c.restore();

  // accessoires
  if (id === 'none') drawBrain(c, headY, hr, o.brain || 14, col, t, tint);
  if (id === 'mitty' && !tint) {
    // chaîne en or de la GOAT
    c.save(); c.shadowColor = COL.gold; c.shadowBlur = 8; c.strokeStyle = COL.gold; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(-3.5, shY + 1); c.quadraticCurveTo(0, shY + 7, 3.5, shY + 1); c.stroke();
    c.fillStyle = COL.gold; c.beginPath(); c.arc(0, shY + 7.5, 2.3, 0, 7); c.fill();
    for (let i = 0; i < 3; i++) {
      const k = (t * .7 + i / 3) % 1, a = Math.sin(k * Math.PI), sx = [-13, 12, -9][i], sy = headY + [-6, 2, -16][i] - k * 6;
      c.save(); c.globalAlpha *= a; c.beginPath();
      for (let j = 0; j < 8; j++) { const r = j % 2 ? .9 : 2.6, an = j * Math.PI / 4; c.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); }
      c.closePath(); c.fill(); c.restore();
    }
    c.restore();
  }
  if (o.winded && !tint) {
    // bouche ouverte qui halète
    c.save(); c.fillStyle = '#000'; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(2.2, headY + 4, 1.8, 1.4 + Math.abs(Math.sin(t * 9)) * 1.4, 0, 0, 7); c.fill(); c.stroke(); c.restore();
  }
  if (id === 'mitty') {
    c.save(); c.fillStyle = tint || col; c.shadowColor = col;
    c.beginPath(); c.moveTo(2, headY - 8); c.lineTo(-3, headY - 13); c.lineTo(-3, headY - 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(2, headY - 8); c.lineTo(7, headY - 13); c.lineTo(7, headY - 4); c.closePath(); c.fill();
    c.restore();
  }
  if (id === 'fondu') {
    c.save(); c.fillStyle = tint ? 'transparent' : '#1d4d33'; c.lineWidth = 2;
    c.beginPath(); c.arc(-1.5, headY - hr + 2.5, 6.5, Math.PI + .15, -.15); c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  if (!tint && (id === 'golden' || o.crown)) {
    c.save(); c.fillStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 12; c.lineWidth = 1;
    const cy = headY - hr + 2;
    c.beginPath(); c.moveTo(-8, cy); c.lineTo(-9, cy - 9); c.lineTo(-4.5, cy - 4); c.lineTo(0, cy - 11); c.lineTo(4.5, cy - 4); c.lineTo(9, cy - 9); c.lineTo(8, cy); c.closePath(); c.fill();
    c.restore();
  }
  if (!tint && ((id === 'golden' && !o.noRed) || o.redEyes)) {
    c.save(); c.fillStyle = '#ff2b3a'; c.shadowColor = '#ff0020'; c.shadowBlur = 12;
    c.beginPath(); c.ellipse(2.5, headY - .5, 2, 1.4, .3, 0, 7); c.ellipse(6.2, headY - .5, 1.8, 1.3, -.3, 0, 7); c.fill();
    c.restore();
  } else if (!tint && id === 'golden') {
    c.save(); c.fillStyle = '#fff'; c.beginPath(); c.arc(2.5, headY - .5, 1.3, 0, 7); c.arc(6.2, headY - .5, 1.2, 0, 7); c.fill(); c.restore();
  } else if (!tint) {
    // yeux des amis (ils clignent de temps en temps)
    const blink = (t % 3.7) < .12, ex = hr * .05, ey = headY - hr * .1;
    c.save(); c.shadowBlur = 0; c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = 1.2;
    if (blink) { seg(c, ex - 1.2, ey, ex + 1.2, ey); seg(c, ex + 2.8, ey, ex + 5.2, ey); }
    else { c.beginPath(); c.arc(ex, ey, 1.2, 0, 7); c.moveTo(ex + 5.1, ey); c.arc(ex + 4, ey, 1.1, 0, 7); c.fill(); }
    c.restore();
  }

  if (big) arm(sL, h1, eL);
  arm(sR, h2, eR);

  // tasse de café de Golden
  if (!tint && (id === 'golden' || o.cup)) {
    const hx = h2[0], hy = h2[1];
    c.save(); c.shadowBlur = 0; c.fillStyle = '#16100a'; c.strokeStyle = COL.gold; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(hx - 1, hy - 9); c.lineTo(hx + 8, hy - 9); c.lineTo(hx + 7, hy + 1); c.lineTo(hx, hy + 1); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.arc(hx + 8.5, hy - 4.5, 2.8, -1.2, 1.2); c.stroke();
    c.strokeStyle = 'rgba(236,232,244,.45)'; c.lineWidth = 1;
    for (let i = 0; i < 2; i++) { c.beginPath(); const sx = hx + 2 + i * 3; c.moveTo(sx, hy - 11); c.quadraticCurveTo(sx + 3 * Math.sin(t * 3 + i), hy - 15, sx, hy - 19 - 2 * Math.sin(t * 2 + i)); c.stroke(); }
    c.restore();
  }
}

/* tête dans un médaillon (icônes) */
function headIcon(c, id, x, y, r, o = {}) {
  c.save();
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = o.bg || '#0b0910'; c.fill();
  if (o.ring !== false) { c.strokeStyle = o.ringCol || hexA(CH[id].col, .7); c.lineWidth = 1.5; c.stroke(); }
  c.clip();
  const sc = r / (id === 'none' ? 21 : 13);
  drawStick(c, id, x, y - (HEADY[id] || -42) * sc + (id === 'golden' || o.crown ? 3 * sc : 0) + (id === 'none' ? 9 * sc : 0), Object.assign({ t: G.t, noCape: true }, o, { s: sc, a: 1 }));
  c.restore();
}

/* aura sombre et dorée de Golden */
function goldenAura(c, x, y, s, t, k = 1) {
  c.save();
  const rg = c.createRadialGradient(x, y - 40 * s, 4 * s, x, y - 40 * s, 120 * s);
  rg.addColorStop(0, `rgba(160,20,30,${.32 * k})`); rg.addColorStop(.45, `rgba(90,60,10,${.16 * k})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = rg; c.fillRect(x - 130 * s, y - 170 * s, 260 * s, 260 * s);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) {
    const ph = (t * .45 + i / 22) % 1;
    const px = x + Math.sin(i * 12.9898 + t * 1.3) * 34 * s * (1 - ph * .5);
    const py = y - ph * 120 * s;
    const r = (1 - ph) * 3.2 * s + .6;
    c.fillStyle = i % 3 ? `rgba(242,193,78,${.55 * (1 - ph) * k})` : `rgba(255,43,58,${.6 * (1 - ph) * k})`;
    c.beginPath(); c.arc(px, py, r, 0, 7); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = `rgba(242,193,78,${.18 * k})`; c.lineWidth = 1.2 * s;
  for (let i = 0; i < 3; i++) {
    const rr = (36 + i * 16 + 6 * Math.sin(t * 2 + i)) * s;
    c.beginPath(); c.ellipse(x, y - 30 * s, rr, rr * 1.25, 0, 0, 7); c.stroke();
  }
  c.restore();
}

/* aura simple d'un ami */
function softAura(c, x, y, col, r, a = .35) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
