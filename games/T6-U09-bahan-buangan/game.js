// Sains Tahun 6 · Unit 9 Bahan Buangan (SP 9.1.1 – 9.1.5) — biodegradable or not, sort waste into the right bins,
// the 5R, clean a polluted river (effects of careless disposal).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, emojiChip, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Terbiodegradasi atau tidak
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const dr = sorter(S, root, {
    type: 'bio', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'bio', label: '🍂 Terbiodegradasi', color: 0xdcedc8, x: -0.42, z: -0.18, w: 0.78 }, { id: 'tidak', label: '🧴 Tidak terbiodegradasi', color: 0xe0e0e0, x: 0.42, z: -0.18, w: 0.78 }],
    items: [['pisang', '🍌', 'Kulit pisang', 'bio'], ['kertas', '📰', 'Kertas', 'bio'], ['daun', '🍁', 'Daun kering', 'bio'], ['sisa', '🍚', 'Sisa makanan', 'bio'], ['kayu', '🥢', 'Penyepit kayu', 'bio'],
      ['botol', '🧴', 'Botol plastik', 'tidak'], ['tin', '🥫', 'Tin logam', 'tidak'], ['kaca', '🍾', 'Botol kaca', 'tidak'], ['bateri', '🔋', 'Bateri (sisa toksik)', 'tidak'], ['straw', '🥤', 'Penyedut plastik', 'tidak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bolehkah mikroorganisma menguraikan bahan ini?' })),
    ok: (it, z) => z.id === 'bio' ? `✅ ${it.label} — boleh diuraikan oleh mikroorganisma.` : `✅ ${it.label} — <b>tidak</b> boleh diuraikan oleh mikroorganisma.`,
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Asingkan ikut jenis
const BINS = [['kaca', 'Kaca', 0x795548], ['kertas', 'Kertas', 0x1e88e5], ['plastik', 'Plastik', 0xff9800], ['logam', 'Logam', 0x9e9e9e], ['toksik', 'Sisa toksik', 0xd32f2f], ['kompos', 'Sisa makanan', 0x43a047]];
function L2(S, play) {
  const root = group('L2', table(1.9, 0.95, play));
  const bins = BINS.map(([id, l, col], i) => { const b = group('tong_' + id, mesh(new THREE.BoxGeometry(0.2, 0.16, 0.14), M(col), 0, 0.08, 0), mesh(new THREE.BoxGeometry(0.21, 0.012, 0.15), M(0x263238), 0, 0.166, 0));
    b.position.set(-0.72 + i * 0.29, 0, -0.2); b.userData.id = id; root.add(b); const t = textSprite(l, { h: 0.055, bg: '#ffffffee' }); t.position.set(b.position.x, 0.26, -0.2); root.add(t); return b; });
  const W = [['botol_kaca', '🍾', 'Botol kaca', 'kaca'], ['akhbar', '📰', 'Surat khabar', 'kertas'], ['kotak', '📦', 'Kotak kertas', 'kertas'], ['botol', '🧴', 'Botol plastik', 'plastik'], ['beg', '🛍️', 'Beg plastik', 'plastik'],
    ['tin', '🥫', 'Tin', 'logam'], ['bateri', '🔋', 'Bateri', 'toksik'], ['cat', '🎨', 'Tin cat', 'toksik'], ['pisang', '🍌', 'Kulit pisang', 'kompos'], ['sayur', '🥬', 'Sisa sayur', 'kompos']];
  const items = W.map(([id, e, l, b], i) => { const c = emojiChip(id, e, l, 0.085, { border: '#607d8b' }); c.userData.bin = b; c.position.set(-0.6 + (i % 5) * 0.3, 0, 0.2 + Math.floor(i / 5) * 0.12); root.add(home(c)); return c; });
  let left = items.length;
  const dr = dragger(S, () => items.filter(c => c.visible), {
    onDrop(c, x, y) {
      const b = S.nearest(x, y, bins, 80);
      if (!b) return goHome(S, c);
      if (b.userData.id !== c.userData.bin) { S.info('🤔 Bahan ini diperbuat daripada apa? Pilih tong yang sepadan.'); return goHome(S, c); }
      c.visible = false; S.evt('bin', c.name); S.info(`✅ ${W.find(w => w[0] === c.name)[2]} → tong <b>${BINS.find(q => q[0] === b.userData.id)[1].toLowerCase()}</b>.`);
      if (!--left) setTimeout(() => S.info('♻️ Asingkan bahan buangan mengikut jenis. Sisa makanan dijadikan baja kompos; sisa minyak dalam bekas khas.', 9), 2500);
    },
  });
  return { root, view: { w: 1.9, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Amalkan 5R
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['refuse', '🚫', 'Refuse', 'Tolak beg plastik'], ['reduce', '💧', 'Reduce', 'Bawa botol air sendiri'], ['reuse', '👜', 'Reuse', 'Guna semula beg kain'],
    ['recycle', '♻️', 'Recycle', 'Kitar semula tin dan kertas'], ['repair', '🔧', 'Repair', 'Baiki kerusi yang rosak']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ <b>${l}</b>: ${f.toLowerCase()}.` })), { type: 'fiveR', gap: 0.34 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Bersihkan sungai
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const river = mesh(new THREE.BoxGeometry(1.0, 0.012, 0.42), M(0x6d6b4f, { transparent: true, opacity: 0.9 }), -0.1, 0.006, -0.12); root.add(river);
  for (const z of [-0.36, 0.12]) root.add(mesh(new THREE.BoxGeometry(1.0, 0.02, 0.06), M(0x7cb342), -0.1, 0.01, z));
  const binG = group('tong_sampah', mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 16), M(0x43a047), 0, 0.065, 0)); binG.position.set(0.58, 0, 0.0); root.add(binG);
  const bl = textSprite('🗑️ Tong sampah', { h: 0.028, bg: '#ffffffdd' }); bl.position.set(0.58, 0.2, 0); root.add(bl);
  const TR = [['botol', '🧴'], ['beg', '🛍️'], ['tin', '🥫'], ['polistirena', '🍱'], ['tayar', '⚫'], ['straw', '🥤']];
  const trash = TR.map(([id, e], i) => { const s = group('sampah_' + id, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), M(0x8d6e63, { transparent: true, opacity: 0.0 }), 0, 0.01, 0)); const sp = emojiSprite(e, 0.07); sp.position.y = 0.035; s.add(sp);
    s.position.set(-0.5 + (i % 3) * 0.3 + (i > 2 ? 0.12 : 0), 0.01, -0.22 + (i > 2 ? 0.17 : 0)); s.userData.carryY = 0.15; root.add(home(s)); return s; });
  const fish = []; let t = 0, cleaned = 0;
  const dr = dragger(S, () => trash.filter(s => s.visible), {
    onDrop(o) {
      if (flat(o.position, binG.position) > 0.14) return goHome(S, o);
      o.visible = false; cleaned++; S.evt('clean', o.name);
      river.material.color.lerpColors(new THREE.Color(0x6d6b4f), new THREE.Color(0x29b6f6), cleaned / TR.length);
      S.info(cleaned < TR.length ? `🧹 Sampah dibuang ke dalam tong (${cleaned}/${TR.length}). Pembuangan tidak terancang mencemarkan air dan menyumbat longkang.` : '✅ Sungai bersih! Hidupan akuatik selamat dan tiada banjir kilat akibat longkang tersumbat.', 7);
      if (cleaned === TR.length) for (let i = 0; i < 3; i++) { const f = emojiSprite('🐟', 0.07); f.position.set(-0.4 + i * 0.25, 0.04, -0.15 + (i % 2) * 0.1); root.add(f); fish.push(f); }
    },
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr, update(dt) { t += dt; trash.forEach((s, i) => { if (s !== dr.held && s.visible && s.position.y < 0.05) s.position.y = 0.01 + Math.sin(t * 2 + i) * 0.004; }); fish.forEach((f, i) => (f.position.x = -0.4 + i * 0.25 + Math.sin(t + i) * 0.05)); } };
}

const LEVELS = [
  { id: 'L1', title: 'Terbiodegradasi atau tidak', sp: 'SP 9.1.1 – 9.1.3', make: L1 },
  { id: 'L2', title: 'Asingkan ikut jenis', sp: 'SP 9.1.1 · 9.1.5', make: L2 },
  { id: 'L3', title: 'Amalkan 5R', sp: 'SP 9.1.4 · 9.1.5', make: L3 },
  { id: 'L4', title: 'Bersihkan sungai', sp: 'SP 9.1.4 · 9.1.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bahan Buangan',
  intro: '<b>Sains Tahun 6 · Unit 9.</b> Urus bahan buangan untuk kehidupan lestari! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
