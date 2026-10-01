// Sains Tahun 6 · Unit 11 Galaksi (SP 11.1.1 – 11.1.5) — 3D particle galaxies (spiral, elliptical, irregular),
// find the Solar System in the Milky Way (top and side view), size order, facts.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, sequence, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// particle galaxy: kind = 'berpilin' | 'elips' | 'tidak_sekata'; r = radius
function galaxy(name, kind, r = 0.15, n = 1600) {
  const pos = [], col = [], c = new THREE.Color(), rnd = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  for (let i = 0; i < n; i++) {
    let x, y, z, core;
    if (kind === 'berpilin') { const arm = i % 2, d = Math.random() ** 0.7 * r, a = d / r * 5 + arm * Math.PI + rnd() * 0.35; x = Math.cos(a) * d; z = Math.sin(a) * d; y = rnd() * 0.006 * (1 + (1 - d / r) * 3); core = 1 - d / r;
      if (i % 5 === 0) { x = rnd() * r * 0.18; z = rnd() * r * 0.12; y = rnd() * r * 0.08; core = 1; } }  // bar / bulge
    else if (kind === 'elips') { x = rnd() * r; y = rnd() * r * 0.45; z = rnd() * r * 0.65; core = 1 - Math.min(1, Math.hypot(x, y * 2, z * 1.5) / r); }
    else { const k = i % 4, cx = [-0.05, 0.06, 0.0, 0.07][k] * r / 0.15, cz = [0.03, -0.04, -0.07, 0.06][k] * r / 0.15; x = cx + rnd() * r * 0.35; z = cz + rnd() * r * 0.3; y = rnd() * r * 0.15; core = Math.random() * 0.6; }
    pos.push(x, y, z); c.setHSL(0.08 + (1 - core) * 0.55, 0.7, 0.55 + core * 0.4); col.push(c.r, c.g, c.b);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.011, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })); pts.userData.fx = true;
  return group(name, pts);
}
const space = (root, w, d) => { const bg = mesh(new THREE.BoxGeometry(w, 0.004, d), M(0x0d1b3e)); bg.position.y = 0.002; bg.userData.fx = true; root.add(bg); };

// ------------------------------------------------------------ L1 Bentuk galaksi
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play)); space(root, 1.5, 0.55);
  const KINDS = [['berpilin', 'Galaksi berpilin'], ['elips', 'Galaksi elips'], ['tidak_sekata', 'Galaksi tidak sekata']];
  const order = [2, 0, 1];
  const gal = KINDS.map(([k], i) => { const g = galaxy('galaksi_' + k, k, 0.18); g.position.set(-0.48 + order[i] * 0.48, 0.12, -0.15); g.rotation.x = 0.9; g.userData.k = k; root.add(g); return g; });
  const labels = KINDS.map(([k, l], i) => { const c = textCard('label_' + k, l, 0.26, { border: '#7e57c2' }); c.userData.k = k; c.position.set(-0.45 + i * 0.45, 0, 0.32); root.add(home(c)); return c; });
  const dr = dragger(S, () => labels.filter(c => !c.userData.done), {
    onDrop(c, x, y) {
      const g = S.nearest(x, y, gal, 110); if (!g) return goHome(S, c);
      if (g.userData.k !== c.userData.k) { S.info('🤔 Lihat bentuknya: berlengan berpusar, bujur seperti telur, atau tiada bentuk tetap?'); return goHome(S, c); }
      c.userData.done = true; moveTo(S, c, new THREE.Vector3(g.position.x, 0, 0.12)); S.evt('shape', g.userData.k);
      S.info({ berpilin: '✅ <b>Galaksi berpilin</b> — mempunyai lengan yang berpusar.', elips: '✅ <b>Galaksi elips</b> — berbentuk bujur.', tidak_sekata: '✅ <b>Galaksi tidak sekata</b> — tiada bentuk yang tetap.' }[g.userData.k]);
      if (labels.every(l => l.userData.done)) setTimeout(() => S.info('🌌 Galaksi ialah sistem berjuta-juta bintang, gas, debu dan jirim lain. Alam semesta mengandungi berbilion-bilion galaksi.', 10), 2500);
    },
  });
  return { root, view: { w: 1.5, d: 0.95 }, ...dr, update(dt) { gal.forEach((g, i) => (g.children[0].rotation.y += dt * (0.15 + i * 0.05))); } };
}

// ------------------------------------------------------------ L2 Sistem Suria dalam Bima Sakti
function L2(S, play) {
  const root = group('L2', table(1.5, 0.95, play)); space(root, 1.4, 0.75);
  const mw = galaxy('bima_sakti', 'berpilin', 0.3, 4000); mw.position.set(-0.1, 0.12, -0.08); mw.rotation.x = 0.9; root.add(mw);
  const disk = mw.children[0];
  const CAND = [['pusat', [0, 0, 0], 'Di pusat galaksi'], ['pinggir', [0.2, 0, 0.09], 'Di pinggir lengan berpilin'], ['luar', [0.38, 0, -0.2], 'Di luar galaksi']];
  const dots = CAND.map(([id, p]) => { const d = mesh(new THREE.SphereGeometry(0.014, 12, 8), M(0xffeb3b, { emissive: 0xffeb3b, emissiveIntensity: 0.8 })); d.position.set(...p); d.name = 'calon_' + id; disk.add(d); return d; });
  const side = textCard('pandangan_sisi', '👁️ Pandangan sisi', 0.24, { border: '#7e57c2' }); side.position.set(0.5, 0, 0.3); side.visible = false; root.add(side);
  let found = false, sided = false, spin = true;
  return {
    root, view: { w: 1.4, d: 1.0 },
    hit: (x, y) => (S.nearest(x, y, found ? [] : dots, 35) || S.hitTest(x, y, side.visible ? [side] : []))?.name ?? null,
    tap(x, y) {
      if (side.visible && S.hitTest(x, y, [side])) {
        side.visible = false; sided = true; spin = false; const a = mw.rotation.x;
        S.tween(1.5, t => (mw.rotation.x = a + (Math.PI / 2 - 0.02 - a) * t), () => { S.evt('side', 'sisi'); S.info('✅ Dari sisi, galaksi Bima Sakti kelihatan seperti <b>cakera nipis yang membonjol</b> di bahagian tengah.', 9); });
        return;
      }
      if (found) return; const d = S.nearest(x, y, dots, 35); if (!d) return;
      if (d.name !== 'calon_pinggir') return S.info(d.name === 'calon_pusat' ? '🤔 Pusat galaksi sangat cerah dan tebal — Sistem Suria tidak di situ.' : '🤔 Sistem Suria berada di dalam galaksi Bima Sakti.');
      found = true; dots.forEach(o => o !== d && (o.visible = false)); d.scale.setScalar(1.6); const t = textSprite('☀️ Sistem Suria', { h: 0.03, bg: '#fff59dee' }); t.position.copy(d.position).add(new THREE.Vector3(0, 0.04, 0)); disk.add(t);
      S.evt('find', 'pinggir'); S.info('✅ Sistem Suria berada di <b>pinggir satu lengan berpilin</b> galaksi Bima Sakti — galaksi pilin berpalang dengan dua lengan utama. Matahari ialah satu daripada bintangnya.', 9);
      side.visible = true;
    },
    update(dt) { if (spin) disk.rotation.y += dt * 0.08; },
  };
}

// ------------------------------------------------------------ L3 Perbandingan saiz
function L3(S, play) {
  const root = group('L3', table(1.6, 0.95, play));
  const dr = sequence(S, root, [['bumi', '🌍', 'Bumi'], ['sistem_suria', '☀️', 'Sistem Suria'], ['bima_sakti', '🌌', 'Galaksi Bima Sakti'], ['alam_semesta', '✨', 'Alam semesta']].map(([id, e, l]) => ({ obj: emojiCard(id, e, l, 0.12, { border: '#3a7bd5' }), l })), {
    type: 'size', gap: 0.34, slotW: 0.24, hint: n => n ? '🤔 Apakah yang lebih besar dan mengandunginya?' : '🤔 Mula dengan yang paling kecil.', ok: it => `✅ ${it.l}.`,
    onDone: () => setTimeout(() => S.info('✏️ Jika Sistem Suria sebesar diameter sebatang pensel, galaksi Bima Sakti sebesar padang sekolah! Saiz Sistem Suria sangat kecil berbanding Bima Sakti.', 11), 2200),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Fakta galaksi
function L4(S, play) {
  const root = group('L4', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['galaksi', '🌌', 'Galaksi', 'Berjuta-juta bintang, gas dan debu'], ['alam', '✨', 'Alam semesta', 'Berbilion-bilion galaksi'], ['bima', '🌀', 'Bima Sakti', 'Galaksi pilin berpalang'],
    ['matahari', '☀️', 'Matahari', 'Satu bintang dalam Bima Sakti'], ['bumi', '🌍', 'Bumi', 'Satu daripada lapan planet Sistem Suria']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.toLowerCase()}</b>.` })), { type: 'fact', gap: 0.34 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Bentuk galaksi', sp: 'SP 11.1.1 · 11.1.5', make: L1 },
  { id: 'L2', title: 'Sistem Suria dalam Bima Sakti', sp: 'SP 11.1.2 · 11.1.3', make: L2 },
  { id: 'L3', title: 'Perbandingan saiz', sp: 'SP 11.1.4', make: L3 },
  { id: 'L4', title: 'Fakta galaksi', sp: 'SP 11.1.1 – 11.1.3', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Galaksi',
  intro: '<b>Sains Tahun 6 · Unit 11.</b> Jelajah galaksi dan Bima Sakti! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
