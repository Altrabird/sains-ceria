// Sains Tahun 3 · Unit 5 Tumbuh-tumbuhan (SP 5.1.1 – 5.1.4, TP6) — ways plants reproduce, grow from parts, why it matters,
// propagation technology (tissue culture, marcotting).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, leaf, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Cara pembiakan (6 ways)
function L1(S, play) {
  const root = group('L1', table(1.6, 1.0, play));
  const Z = (id, label, color, i) => ({ id, label, color, x: -0.5 + (i % 3) * 0.5, z: -0.36 + Math.floor(i / 3) * 0.3, w: 0.44, d: 0.2 });
  const dr = sorter(S, root, {
    type: 'method', size: 0.075, gap: 0.12, row: 0.38,
    zones: [Z('biji', '🌰 Biji benih', 0xfff9c4, 0), Z('anak', '🌱 Anak pokok', 0xc8e6c9, 1), Z('batang_bawah', '🥔 Batang bawah tanah', 0xd7ccc8, 2),
      Z('daun', '🍃 Daun', 0xb2dfdb, 3), Z('keratan', '✂️ Keratan batang', 0xffe0b2, 4), Z('spora', '🍄 Spora', 0xe1bee7, 5)],
    items: [['betik', '🍈', 'Betik', 'biji'], ['cili', '🌶️', 'Cili', 'biji'], ['pisang', '🍌', 'Pisang', 'anak'], ['keladi', '🌿', 'Keladi', 'anak'], ['kentang', '🥔', 'Ubi kentang', 'batang_bawah'], ['bawang', '🧅', 'Bawang', 'batang_bawah'],
      ['setawar', '🍃', 'Setawar', 'daun'], ['lidah_jin', '🌵', 'Lidah jin', 'daun'], ['bunga_kertas', '🌺', 'Bunga kertas', 'keratan'], ['ubi_kayu', '🥖', 'Ubi kayu', 'keratan'], ['paku_pakis', '🌿', 'Paku pakis', 'spora'], ['cendawan', '🍄', 'Cendawan', 'spora']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Bagaimanakah pokok ${label.toLowerCase()} membiak?` })),
    ok: (it, z) => `✅ Pokok ${it.label.toLowerCase()} membiak melalui <b>${z.label.replace(/^\S+ /, '').toLowerCase()}</b>.`,
  });
  return { root, view: { w: 1.6, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L2 Satu pokok, pelbagai cara: plant parts, watch shoots
function pot(name) { return group(name, mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.07, 20), M(0xc8643b), 0, 0.035, 0), mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.006, 20), M(0x5d4037), 0, 0.068, 0)); }
const PARTS = [['keratan_kangkung', '✂️', 'Keratan batang kangkung'], ['biji_kangkung', '🌰', 'Biji benih kangkung'], ['batang_ubi', '🍠', 'Batang bawah tanah ubi keledek']];
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const pots = PARTS.map(([id, , label], i) => { const p = pot('pasu_' + id); p.scale.setScalar(1.4); p.position.set(-0.35 + i * 0.35, 0, -0.18); p.userData.id = id; root.add(p); const t = textSprite(label, { h: 0.024 }); t.position.set(p.position.x, 0.16, -0.18); root.add(t); return p; });
  const cards = PARTS.map(([id, e, label], i) => { const c = emojiCard(id, e, label, 0.1, { border: '#43a047' }); c.position.set(-0.35 + [2, 0, 1][i] * 0.35, 0, 0.27); root.add(home(c)); return c; });
  const next = emojiCard('hari_seterusnya', '📅', 'Hari seterusnya', 0.09, { border: '#43a047' }); next.position.set(0.55, 0, 0.05); next.visible = false; root.add(next);
  const planted = new Set(), shoots = []; let day = 0, recorded = false;
  const table_ = textSprite('Jadual A', { h: 0.03 }); table_.position.set(0.55, 0.03, -0.2); table_.visible = false; root.add(table_);
  const dr = dragger(S, () => cards.filter(c => !planted.has(c.name)), {
    onDrop(c, x, y) {
      const p = pots.find(p => nearScreen(S, p, x, y, 0.08, 70) || flat(p.position, c.position) < 0.1);
      if (!p) return goHome(S, c);
      if (p.userData.id !== c.name) { S.info('Tanam di dalam pasu yang berlabel sama.'); return goHome(S, c); }
      planted.add(c.name); c.visible = false; S.evt('plant', c.name);
      const sh = group('pucuk_' + c.name, mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.06), M(0x7cb342), 0, 0.03, 0)); const l = leaf(''); l.scale.setScalar(0.35); l.position.y = 0.06; sh.add(l);
      sh.position.set(p.position.x, 0.1, p.position.z); sh.scale.setScalar(0.001); root.add(sh); shoots.push(sh);
      if (planted.size === 3) { next.visible = true; S.info('🌱 Semua ditanam. Tuding <b>Hari seterusnya</b> dan perhatikan pertumbuhan pucuk.'); }
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [next].filter(n => n.visible))?.name ?? null,
    tap(x, y) {
      if (!next.visible || S.hitTest(x, y, [next]) !== next) return;
      day++; shoots.forEach(s => S.tween(0.6, k => s.scale.setScalar(Math.max(0.001, (day - 1 + k) / 3))));
      S.evt('day', 'hari_' + day); S.info(`📅 Hari ${day}: ${day < 2 ? 'belum ada pucuk.' : '🌱 pucuk tumbuh pada semua pasu!'}`);
      if (day === 3) { next.visible = false; table_.visible = true; S.info('📋 Pertumbuhan pucuk: <b>ada</b> bagi keratan batang, biji benih dan batang bawah tanah. Satu pokok boleh membiak dengan <b>pelbagai cara</b>.', 9); }
    },
  };
}

// ------------------------------------------------------------ L3 Kepentingan pembiakan
function L3(S, play) {
  const root = group('L3', table(1.6, 0.9, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.2, w: 0.36, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'importance', size: 0.09, gap: 0.19, row: 0.3,
    zones: [Z('makanan', '🍎 Sumber makanan', 0xffe082, -0.57), Z('habitat', '🐿️ Habitat', 0xc5e1a5, -0.19), Z('oksigen', '💨 Bekalan oksigen', 0xb3e5fc, 0.19), Z('kayu', '🪑 Sumber kayu', 0xd7ccc8, 0.57)],
    items: [['padi', '🌾', 'Padi', 'makanan'], ['buah', '🍊', 'Buah-buahan', 'makanan'], ['sarang', '🐦', 'Burung bersarang', 'habitat'], ['monyet', '🐒', 'Monyet di pokok', 'habitat'],
      ['bernafas', '😮', 'Kita bernafas', 'oksigen'], ['udara', '🌳', 'Udara bersih', 'oksigen'], ['meja', '🪑', 'Meja kayu', 'kayu'], ['rumah', '🏠', 'Rumah kayu', 'kayu']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Tumbuhan membiak untuk mengekalkan makanan, habitat, oksigen dan kayu. Yang mana satu?' })),
    ok: (it, z) => `✅ Pembiakan tumbuhan mengekalkan <b>${z.label.replace(/^\S+ /, '').toLowerCase()}</b> supaya sentiasa ada.`,
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L4 Teknologi pembiakan: kultur tisu + tut
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  // tissue culture jar
  const jar = group('balang_kultur', mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.07, 0), mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 24), M(0xfff9c4, { transparent: true, opacity: 0.8 }), 0, 0.016, 0));
  jar.position.set(-0.4, 0, -0.18); root.add(jar);
  const jl = textSprite('Nutrien (kultur tisu)', { h: 0.026 }); jl.position.set(-0.4, 0.2, -0.18); root.add(jl);
  const tissue = emojiCard('tisu_pokok', '🌿', 'Tisu pokok orkid', 0.09, { border: '#43a047' }); tissue.position.set(-0.45, 0, 0.27); root.add(home(tissue));
  // mango branch for marcotting
  const branch = group('dahan_mangga', mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.4), M(0x6d4c41), 0, 0.2, 0), mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.2), M(0x6d4c41), 0.08, 0.35, 0).rotateZ(-0.9));
  const ml = leaf(''); ml.scale.setScalar(0.8); ml.position.set(0.16, 0.42, 0); branch.add(ml);
  branch.position.set(0.35, 0, -0.22); root.add(branch);
  const bl = textSprite('Pokok mangga', { h: 0.026 }); bl.position.set(0.35, 0.47, -0.22); root.add(bl);
  const TUT = [['kupas', '🔪', '1. Kupas kulit dahan'], ['tanah', '🟫', '2. Balut dengan tanah'], ['plastik', '🛍️', '3. Bungkus dengan plastik']];
  const steps = TUT.map(([id, e, l], i) => { const c = emojiCard('tut_' + id, e, l, 0.09, { border: '#8d6e63' }); c.position.set(0.05 + [2, 0, 1][i] * 0.22, 0, 0.27); root.add(home(c)); return c; });
  let cultured = false, tut = 0, cut = false;
  const wrap = group('balutan'); wrap.position.set(0, 0.22, 0); branch.add(wrap);
  const dr = dragger(S, () => [...(cultured ? [] : [tissue]), ...steps.filter(s => !s.userData.done)], {
    onDrop(c, x, y) {
      if (c === tissue) {
        if (!(nearScreen(S, jar, x, y, 0.08, 75) || flat(c.position, jar.position) < 0.12)) return goHome(S, c);
        cultured = true; c.visible = false;
        for (let i = 0; i < 4; i++) { const p = group('', mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.04), M(0x7cb342), 0, 0.02, 0)); const l = leaf(''); l.scale.setScalar(0.18); l.position.y = 0.04; p.add(l); p.position.set((i % 2 - 0.5) * 0.05, 0.03, (Math.floor(i / 2) - 0.5) * 0.05); p.scale.setScalar(0.01); jar.add(p); S.tween(1 + i * 0.3, k => p.scale.setScalar(0.01 + k)); }
        S.evt('culture', 'orkid'); return S.info('🧪 <b>Kultur tisu</b>: pokok baharu tumbuh daripada tisu pokok yang diletakkan dalam nutrien. Contoh: pokok pisang dan orkid.', 8);
      }
      if (!(nearScreen(S, branch, x, y, 0.22, 80) || flat(c.position, branch.position) < 0.15)) return goHome(S, c);
      const id = c.name.replace('tut_', '');
      if (id !== TUT[tut][0]) { S.info(`🤔 Langkah ${tut + 1} dahulu: <b>${TUT[tut][2].slice(3).toLowerCase()}</b>.`); return goHome(S, c); }
      c.userData.done = true; c.visible = false; tut++;
      if (id === 'kupas') wrap.add(mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 12), M(0xfff3e0)));
      if (id === 'tanah') wrap.add(mesh(new THREE.SphereGeometry(0.035, 14, 10).scale(1, 1.3, 1), M(0x5d4037, { roughness: 1 })));
      if (id === 'plastik') { wrap.add(mesh(new THREE.SphereGeometry(0.04, 14, 10).scale(1, 1.3, 1), M(0xe1bee7, { transparent: true, opacity: 0.5 }))); setTimeout(() => { for (let i = 0; i < 6; i++) wrap.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.04), M(0xf5f5dc), Math.cos(i) * 0.03, -0.02, Math.sin(i) * 0.03).rotateZ(Math.cos(i) * 0.6)); S.info('🌱 Akar tumbuh! Tuding dahan untuk memotongnya dan menanam pokok baharu.'); }, 1500); }
      S.evt('tut', id);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (tut === 3 && !cut ? S.hitTest(x, y, [branch])?.name ?? null : null),
    async tap(x, y) {
      if (tut < 3 || cut || S.hitTest(x, y, [branch]) !== branch) return;
      cut = true; const piece = group('anak_mangga'); root.attach(wrap); piece.position.copy(wrap.position); root.add(piece); piece.attach(wrap);
      await S.tween(1, k => piece.position.set(0.35 + k * 0.2, 0.22 * (1 - k), -0.22 + k * 0.3));
      S.evt('cut', 'tut'); S.info('🥭 <b>Tut</b> menambahkan bilangan pokok buah-buahan tanpa melalui proses menanam biji benih. Contoh: mangga dan limau kasturi.', 9);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Cara pembiakan', sp: 'SP 5.1.1', make: L1 },
  { id: 'L2', title: 'Satu pokok, pelbagai cara', sp: 'SP 5.1.3 · 5.1.4', make: L2 },
  { id: 'L3', title: 'Kepentingan pembiakan', sp: 'SP 5.1.2', make: L3 },
  { id: 'L4', title: 'Teknologi pembiakan', sp: 'DSKP TP6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tumbuh-tumbuhan — Pembiakan',
  intro: '<b>Sains Tahun 3 · Unit 5.</b> Bagaimana tumbuhan membiak? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
