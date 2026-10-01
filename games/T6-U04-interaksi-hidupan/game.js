// Sains Tahun 6 · Unit 4 Interaksi antara Hidupan (SP 4.1.1 – 4.2.3) — predator and prey, intra/interspecies
// competition, symbiosis (mutualism, parasitism, commensalism), plants competing for space (small vs big pot).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const zones2 = (a, b) => [{ id: a[0], label: a[1], color: 0xffe0b2, x: -0.4, z: -0.18, w: 0.74 }, { id: b[0], label: b[1], color: 0xc8e6c9, x: 0.4, z: -0.18, w: 0.74 }];

// ------------------------------------------------------------ L1 Mangsa-pemangsa
function L1(S, play) {
  const root = group('L1', table(1.7, 0.95, play));
  const dr = sorter(S, root, {
    type: 'role', size: 0.1, gap: 0.19, row: 0.3, zones: zones2(['pemangsa', '🐾 Pemangsa (memburu)'], ['mangsa', '🏃 Mangsa (diburu)']),
    items: [['citah', '🐆', 'Citah', 'pemangsa'], ['singa', '🦁', 'Singa', 'pemangsa'], ['helang', '🦅', 'Helang', 'pemangsa'], ['buaya', '🐊', 'Buaya', 'pemangsa'],
      ['rusa', '🦌', 'Rusa', 'mangsa'], ['kuda_belang', '🦓', 'Kuda belang', 'mangsa'], ['arnab', '🐇', 'Arnab', 'mangsa'], ['ayam', '🐔', 'Anak ayam', 'mangsa']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah haiwan ini memburu haiwan lain, atau diburu?' })),
    ok: (it, z) => z.id === 'pemangsa' ? `✅ ${it.label} — <b>pemangsa</b> yang memburu haiwan lain untuk dimakan.` : `✅ ${it.label} — <b>mangsa</b> yang diburu.`,
    onDone: () => setTimeout(() => S.info('🌿 Interaksi antara haiwan: mangsa-pemangsa, persaingan dan simbiosis.', 9), 2500),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Persaingan
function L2(S, play) {
  const root = group('L2', table(1.7, 0.95, play));
  const dr = sorter(S, root, {
    type: 'compete', size: 0.1, gap: 0.27, row: 0.3, zones: zones2(['intra', '🟰 Intraspesies (spesies sama)'], ['inter', '🔀 Interspesies (spesies berlainan)']),
    items: [['tiung', '🐦', 'Dua tiung jantan: pasangan', 'intra'], ['singa', '🦁', 'Dua singa jantan: kawasan', 'intra'], ['ayam', '🐥', 'Anak-anak ayam: makanan', 'intra'],
      ['gnu', '🦓', 'Kuda belang dan gnu: air', 'inter'], ['dubuk', '🐆', 'Singa dan dubuk: makanan', 'inter'], ['rumpai', '🌾', 'Padi dan rumpai: nutrien', 'inter']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah mereka daripada spesies yang sama atau berlainan?' })),
    ok: (it, z) => `✅ ${it.label} — persaingan <b>${z.id === 'intra' ? 'intraspesies' : 'interspesies'}</b>.`,
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Simbiosis
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.54, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'symbiosis', size: 0.095, gap: 0.2, row: 0.3,
    zones: [Z('mutualisme', '🤝 Mutualisme', 0xc8e6c9, -0.6), Z('parasitisme', '🩸 Parasitisme', 0xffcdd2, 0), Z('komensalisme', '🚌 Komensalisme', 0xbbdefb, 0.6)],
    items: [['badut', '🐠', 'Ikan badut dan buran', 'mutualisme'], ['lebah', '🐝', 'Lebah dan bunga', 'mutualisme'], ['burung_kerbau', '🐃', 'Burung dan kerbau', 'mutualisme'],
      ['sengkenit', '🐱', 'Sengkenit dan kucing', 'parasitisme'], ['pakma', '🌺', 'Pakma dan pokok perumah', 'parasitisme'], ['lintah', '🐛', 'Lintah dan kerbau', 'parasitisme'],
      ['remora', '🦈', 'Remora dan jerung', 'komensalisme'], ['orkid', '🌸', 'Orkid dan pokok perumah', 'komensalisme']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Siapa mendapat manfaat? Adakah sesiapa mengalami kerugian?' })),
    ok: (it, z) => `✅ ${it.label} — ${{ mutualisme: '<b>kedua-dua</b> pihak mendapat manfaat', parasitisme: 'parasit mendapat manfaat, <b>perumah rugi</b>', komensalisme: 'satu pihak mendapat manfaat, pihak lain <b>tidak terjejas</b>' }[z.id]}.`,
    onDone: () => setTimeout(() => S.info('🔗 Simbiosis ialah hubungan rapat antara dua spesies.', 9), 2500),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Penyiasatan ruang (pasu kecil vs besar)
function pot(name, r) {
  const g = group(name, mesh(new THREE.CylinderGeometry(r, r * 0.75, r * 1.1, 24), M(0xd84315), 0, r * 0.55, 0), mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.006, 24), M(0x5d4037), 0, r * 1.08, 0));
  const plants = []; for (let i = 0; i < 15; i++) { const a = i * 2.4, d = Math.sqrt(i / 15) * r * 0.8;
    const p = group('anak_pokok', mesh(new THREE.CylinderGeometry(0.002, 0.002, 1, 5), M(0x7cb342), 0, 0.5, 0), mesh(new THREE.SphereGeometry(0.012, 8, 6).scale(1.3, 0.4, 0.8), M(0x43a047), 0, 1, 0));
    p.position.set(Math.cos(a) * d, r * 1.08, Math.sin(a) * d); p.scale.set(1, 0.005, 1); p.children[1].scale.set(1, 200, 1); g.add(p); plants.push(p); }
  g.userData.plants = plants; return g;
}
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const pots = [pot('pasu_kecil', 0.06), pot('pasu_besar', 0.12)]; pots[0].position.set(-0.4, 0, -0.12); pots[1].position.set(0.05, 0, -0.12); root.add(...pots);
  pots.forEach((p, i) => { const t = textSprite(i ? 'Pasu besar · 15 biji benih' : 'Pasu kecil · 15 biji benih', { h: 0.028, bg: '#ffffffdd' }); t.position.set(p.position.x, 0.32, -0.12); root.add(t); });
  const can = emojiCard('siram', '🚿', 'Siram (air sama)', 0.1, { border: '#1e88e5' }); can.position.set(-0.55, 0, 0.3); root.add(home(can));
  const ff = textCard('tiga_minggu', '⏩ Tiga minggu', 0.22, { border: '#ef6c00' }); ff.position.set(0.5, 0, 0.0); ff.visible = false; root.add(ff);
  const ask = [['besar', 'Pasu besar tumbuh lebih subur'], ['kecil', 'Pasu kecil tumbuh lebih subur']].map(([id, l], i) => { const c = textCard('jawapan_' + id, l, 0.3); c.position.set(-0.15 + i * 0.36, 0, 0.3); c.visible = false; root.add(c); return c; });
  const watered = new Set(); let grown = false, answered = false;
  const dr = dragger(S, () => (watered.size < 2 ? [can] : []), {
    onDrop(c) {
      const p = pots.slice().sort((a, b) => flat(a.position, c.position) - flat(b.position, c.position))[0];
      goHome(S, c); if (flat(p.position, c.position) > 0.2) return;
      if (watered.has(p.name)) return S.info('💧 Pasu ini sudah disiram. Siram pasu yang satu lagi dengan jumlah air yang sama.');
      watered.add(p.name); p.children[1].material.color.set(0x3e2723); S.evt('water', p.name); S.info(`💧 ${p.name === 'pasu_kecil' ? 'Pasu kecil' : 'Pasu besar'} disiram.`);
      if (watered.size === 2) { ff.visible = true; setTimeout(() => S.info('⏩ Jumlah air sama, biji benih sama. Biarkan selama tiga minggu.'), 1200); }
    },
  });
  return {
    root, view: { w: 1.6, d: 0.95 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [ff, ...ask].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [ff, ...ask].filter(c => c.visible)); if (!c) return;
      if (c === ff && !grown) { grown = true; ff.visible = false;
        pots.forEach((p, i) => p.userData.plants.forEach((pl, k) => { const h = i ? 0.1 + (k % 3) * 0.015 : 0.05 + (k % 4) * 0.01; S.tween(2.5, t => { pl.scale.set(1, 0.005 + h * t, 1); pl.children[1].scale.set(i ? 1.4 : 0.7, 1 / (0.005 + h * t) * 0.4, i ? 1.4 : 0.7); }); if (!i) pl.children[1].material = M(0xc0ca33); }));
        setTimeout(() => { S.evt('grow', 'minggu3'); ask.forEach(a => (a.visible = true)); S.info('🌱 Selepas tiga minggu: anak pokok dalam pasu kecil rendah, kurus dan kekuningan. Mengapa?'); }, 2700); return; }
      if (ask.includes(c) && !answered) {
        if (c.name !== 'jawapan_besar') return S.info('🤔 Lihat semula — dalam pasu kecil, 15 anak pokok berebut ruang yang terhad.');
        answered = true; S.evt('conclude', 'besar'); S.info('✅ Tumbuhan <b>bersaing</b> untuk air, cahaya matahari, nutrien dan ruang. Interaksi mengawal populasi, memastikan kemandirian spesies dan menjaga keseimbangan alam.', 10);
      }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Mangsa-pemangsa', sp: 'SP 4.1.1', make: L1 },
  { id: 'L2', title: 'Persaingan', sp: 'SP 4.1.2', make: L2 },
  { id: 'L3', title: 'Simbiosis', sp: 'SP 4.1.3 · 4.2.2', make: L3 },
  { id: 'L4', title: 'Persaingan tumbuhan', sp: 'SP 4.2.1 · 4.2.3', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Interaksi antara Hidupan',
  intro: '<b>Sains Tahun 6 · Unit 4.</b> Mangsa-pemangsa, persaingan dan simbiosis! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
