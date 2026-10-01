// Sains Tahun 6 · Unit 5 Pemeliharaan dan Pemuliharaan (SP 5.1.1 – 5.1.6) — extinct vs endangered, threats and
// their solutions, preservation vs conservation, restore a forest (replant) and release turtle hatchlings.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, tree, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Pupus atau diancam kepupusan
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const dr = sorter(S, root, {
    type: 'status', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'pupus', label: '💀 Telah pupus', color: 0xe0e0e0, x: -0.42, z: -0.18, w: 0.78 }, { id: 'ancam', label: '⚠️ Diancam kepupusan', color: 0xffe0b2, x: 0.42, z: -0.18, w: 0.78 }],
    items: [['dodo', '🐦', 'Burung Dodo', 'pupus'], ['dinosaur', '🦖', 'Dinosaur', 'pupus'], ['mamot', '', 'Mamot', 'pupus'], ['quagga', '', 'Quagga', 'pupus'], ['serigala', '', 'Serigala Tasmania', 'pupus'],
      ['gajah', '🐘', 'Gajah', 'ancam'], ['badak', '🦏', 'Badak sumbu', 'ancam'], ['orang_utan', '🦧', 'Orang utan', 'ancam'], ['harimau', '🐅', 'Harimau Malaya', 'ancam'], ['pakma', '🌺', 'Bunga pakma', 'ancam']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah spesies ini masih wujud hari ini?' })),
    ok: (it, z) => z.id === 'pupus' ? `💀 ${it.label} — <b>telah pupus</b>, tidak wujud lagi.` : `⚠️ ${it.label} — masih wujud tetapi <b>diancam kepupusan</b>.`,
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Faktor ancaman dan penyelesaian
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['habitat', '🌳', 'Pemusnahan habitat', 'Wartakan hutan simpan'], ['buru', '🔫', 'Pemburuan haram', 'Kuatkuasakan undang-undang'], ['cemar', '🏭', 'Pencemaran', 'Kitar semula, didik masyarakat'],
    ['tebang', '🌲', 'Penebangan berlebihan', 'Pembalakan terpilih'], ['produk', '🛍️', 'Jualan produk spesies terancam', 'Boikot produk spesies terancam']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f.toLowerCase()}</b>.` })),
    { type: 'solve', gap: 0.34, onDone: () => setTimeout(() => S.info('🌍 Bencana alam dan pemanasan global juga mengancam hidupan.', 9), 2500) });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Pemeliharaan atau pemuliharaan
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const dr = sorter(S, root, {
    type: 'protect', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'pelihara', label: '🛡️ Pemeliharaan (kekalkan keadaan asal)', color: 0xc8e6c9, x: -0.42, z: -0.18, w: 0.78 }, { id: 'pulih', label: '🌱 Pemuliharaan (kembalikan ke keadaan asal)', color: 0xbbdefb, x: 0.42, z: -0.18, w: 0.78 }],
    items: [['terpilih', '🌲', 'Pembalakan terpilih', 'pelihara'], ['didik', '📢', 'Mendidik masyarakat', 'pelihara'], ['undang', '⚖️', 'Kuatkuasa undang-undang', 'pelihara'], ['hutan', '🏞️', 'Hutan simpan', 'pelihara'], ['marin', '🐠', 'Taman marin', 'pelihara'],
      ['penyu', '🐢', 'Pusat pemuliharaan penyu', 'pulih'], ['orang_utan', '🦧', 'Pusat pemuliharaan orang utan', 'pulih'], ['tanam', '🌱', 'Menanam semula pokok', 'pulih']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah ia mengekalkan keadaan asal, atau mengembalikan kepada keadaan asal?' })),
    ok: (it, z) => `✅ ${it.label} — <b>${z.id === 'pelihara' ? 'pemeliharaan' : 'pemuliharaan'}</b>.`,
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Pulihkan hutan dan pantai
function L4(S, play) {
  const root = group('L4', table(1.7, 0.95, play));
  const land = mesh(new THREE.BoxGeometry(0.9, 0.012, 0.5), M(0x8d6e63), -0.38, 0.006, -0.12); root.add(land);
  const sand = mesh(new THREE.BoxGeometry(0.4, 0.012, 0.5), M(0xffe082), 0.27, 0.006, -0.12); root.add(sand);
  const sea = mesh(new THREE.BoxGeometry(0.3, 0.014, 0.5), M(0x29b6f6, { transparent: true, opacity: 0.85 }), 0.62, 0.007, -0.12); sea.name = 'laut'; root.add(sea);
  const holes = []; [[-0.65, -0.25], [-0.4, -0.25], [-0.65, 0.0], [-0.4, 0.0]].forEach(([x, z], i) => {
    const s = mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.03, 10), M(0x6d4c41), x, 0.02, z); s.name = 'tunggul_' + (i + 1); root.add(s); holes.push(s); });
  const seeds = holes.map((_, i) => { const c = emojiCard('anak_pokok_' + (i + 1), '🌱', 'Anak pokok', 0.08, { border: '#43a047' }); c.position.set(-0.75 + i * 0.13, 0, 0.3); root.add(home(c)); return c; });
  const hatch = group('pusat_penyu', mesh(new THREE.BoxGeometry(0.16, 0.04, 0.12), M(0xa1887f, { transparent: true, opacity: 0.6 }), 0, 0.02, 0)); hatch.position.set(0.2, 0, 0.0); root.add(hatch);
  const ht = textSprite('Pusat pemuliharaan penyu', { h: 0.024, bg: '#ffffffdd' }); ht.position.set(0.2, 0.08, 0.0); root.add(ht);
  const turtles = [0, 1, 2].map(i => { const t = group('penyu_' + (i + 1), mesh(new THREE.SphereGeometry(0.02, 12, 8).scale(1, 0.4, 1.3), M(0x33691e), 0, 0.01, 0), mesh(new THREE.SphereGeometry(0.008, 8, 6), M(0x689f38), 0, 0.01, 0.03)); t.position.set(0.16 + i * 0.04, 0.02, 0.0); t.userData.carryY = 0.05; root.add(home(t)); return t; });
  const planted = new Set(), freed = new Set();
  const animals = []; let back = false;
  const finish = () => { if (planted.size === 4 && freed.size === 3 && !back) { back = true; for (const [e, x, z] of [['🦧', -0.52, -0.12], ['🐦', -0.3, -0.3]]) { const a = emojiSprite(e, 0.1); a.position.set(x, 0.3, z); root.add(a); animals.push(a); }
    setTimeout(() => S.info('✅ Hutan pulih, penyu kembali ke laut dan haiwan kembali ke habitat. Pemeliharaan dan pemuliharaan mengelakkan kepupusan dan kehilangan habitat.', 10), 1500); } };
  const dr = dragger(S, () => [...seeds.filter(s => s.visible), ...turtles.filter(t => !freed.has(t))], {
    onDrop(o) {
      if (seeds.includes(o)) {
        const h = holes.filter(h => !planted.has(h)).sort((a, b) => flat(a.position, o.position) - flat(b.position, o.position))[0];
        if (!h || flat(h.position, o.position) > 0.1) return goHome(S, o);
        planted.add(h); o.visible = false; const t = tree('pokok_' + h.name.slice(8)); t.position.copy(h.position).setY(0); t.scale.setScalar(0.01); root.add(t); S.tween(1.5, k => t.scale.setScalar(0.01 + k * 0.9));
        S.evt('plant', h.name); S.info(`🌳 Pokok ditanam semula (${planted.size}/4).`); return finish();
      }
      if (Math.abs(o.position.x - sea.position.x) > 0.17) { S.info('🐢 Bawa anak penyu ke laut.'); return goHome(S, o); }
      freed.add(o); o.position.y = 0.012; const x0 = o.position.x; S.tween(2, k => (o.position.x = x0 + k * 0.08)); S.evt('turtle', o.name); S.info(`🐢 Anak penyu dilepaskan ke laut (${freed.size}/3).`); finish();
    },
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr, update(dt) { animals.forEach((a, i) => (a.position.y = 0.3 + Math.sin(performance.now() / 400 + i) * 0.02)); } };
}

const LEVELS = [
  { id: 'L1', title: 'Pupus dan diancam kepupusan', sp: 'SP 5.1.3 · 5.1.4', make: L1 },
  { id: 'L2', title: 'Ancaman dan penyelesaian', sp: 'SP 5.1.5 · 5.1.2', make: L2 },
  { id: 'L3', title: 'Pemeliharaan atau pemuliharaan', sp: 'SP 5.1.1 · 5.1.2', make: L3 },
  { id: 'L4', title: 'Pulihkan hutan dan pantai', sp: 'SP 5.1.2 · 5.1.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Pemeliharaan dan Pemuliharaan',
  intro: '<b>Sains Tahun 6 · Unit 5.</b> Selamatkan haiwan dan tumbuhan daripada kepupusan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
