// Sains Tahun 4 · Unit 4 Tumbuh-tumbuhan (SP 4.1.1 – 4.2.5) — responses to water, gravity, light and touch;
// photosynthesis needs, products and importance.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, leaf, pottedPlant, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const GREEN = 0x66bb6a, ROOT = 0xd7b98e;
const tube = (pts, r, color) => { const m = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 6), M(color)); m.userData.fx = true; return m; };

// ------------------------------------------------------------ L1 Air: roots grow toward water (petri dish)
function L1(S, play) {
  const root = group('L1', table(1.3, 0.8, play));
  const dish = group('piring_petri', mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 40), M(0xe1f5fe, { transparent: true, opacity: 0.4 }), 0, 0.01, 0)); dish.position.set(0, 0, -0.1); root.add(dish);
  const cotton = (x, wet, name) => { const c = group(name, mesh(new THREE.SphereGeometry(0.06, 14, 10).scale(1, 0.4, 1.2), M(wet ? 0x90caf9 : 0xfafafa, { roughness: 1 }), 0, 0.02, 0)); c.position.set(x, 0, -0.1); root.add(c); const t = textSprite(name === 'kapas_A' ? 'Kapas A' : 'Kapas B', { h: 0.032 }); t.position.set(x, 0.07, -0.25); root.add(t); return c; };
  const A = cotton(-0.13, false, 'kapas_A'), B = cotton(0.13, false, 'kapas_B');
  const seeds = [-0.06, 0, 0.06].map(z => { const s = mesh(new THREE.SphereGeometry(0.012, 10, 8), M(0xc0ca33), 0, 0.022, -0.1 + z); root.add(s); return s; });
  const drop = emojiCard('penitis', '💧', 'Air', 0.09, { border: '#1e88e5' }); drop.position.set(0.4, 0, 0.22); root.add(home(drop));
  const next = emojiCard('seminggu', '📅', 'Seminggu kemudian', 0.09, { border: '#43a047' }); next.position.set(-0.4, 0, 0.22); next.visible = false; root.add(next);
  let wet = false, grown = false;
  const dr = dragger(S, () => (wet ? [] : [drop]), {
    onDrop(o, x, y) {
      goHome(S, o);
      const c = S.closest([A, B], x, y, c => nearScreen(S, c, x, y, 0.02, 60) || flat(c.position, o.position) < 0.08);
      if (!c) return;
      if (c === B) return S.info('🤔 Lembapkan kapas <b>A sahaja</b>. Kapas B dibiarkan kering.');
      wet = true; c.children[0].material.color.setHex(0x64b5f6); next.visible = true; S.evt('wet', 'A'); S.info('💧 Kapas A dilembapkan. Tuding <b>Seminggu kemudian</b>.');
    },
  });
  return {
    root, view: { w: 1.1, d: 0.75 }, ...dr,
    hit: (x, y) => (next.visible && !grown ? S.hitTest(x, y, [next])?.name ?? null : null),
    tap(x, y) {
      if (!next.visible || grown || S.hitTest(x, y, [next]) !== next) return;
      grown = true; seeds.forEach(s => { const r = tube([s.position.clone(), s.position.clone().add(new THREE.Vector3(-0.04, 0, 0.01)), new THREE.Vector3(-0.1, 0.02, s.position.z)], 0.003, ROOT); r.scale.setScalar(0.01); root.add(r); S.tween(1.5, k => r.scale.setScalar(Math.max(0.01, k))); });
      S.evt('grow', 'akar'); S.info('🌱 Akar tumbuh ke arah kapas <b>lembap</b>. Kesimpulan: <b>akar tumbuh ke arah air</b>.', 8);
    },
  };
}

// ------------------------------------------------------------ L2 Cahaya: shoots bend toward the hole
function boxWithHole(name, side) {
  const g = group(name), m = M(0xa1887f);
  g.add(mesh(new THREE.BoxGeometry(0.22, 0.22, 0.012), m, 0, 0.11, -0.1), mesh(new THREE.BoxGeometry(0.22, 0.012, 0.2), m, 0, 0.22, 0));
  for (const s of [-1, 1]) { const wall = mesh(new THREE.BoxGeometry(0.012, 0.22, 0.2), m, s * 0.11, 0.11, 0); if (s === side) wall.add(mesh(new THREE.CircleGeometry(0.025, 20), new THREE.MeshBasicMaterial({ color: 0xfff59d, side: THREE.DoubleSide }), s * 0.007, 0.04, 0).rotateY(Math.PI / 2)); g.add(wall); }
  return g;
}
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const boxes = [['kotak_A', -1, 'A (lubang di kiri)'], ['kotak_B', 1, 'B (lubang di kanan)']].map(([id, side, l], i) => { const b = boxWithHole(id, side); b.position.set(-0.25 + i * 0.5, 0, -0.15); b.userData.side = side; root.add(b); const t = textSprite(l, { h: 0.03 }); t.position.set(b.position.x, 0.27, -0.15); root.add(t);
    const sun = emojiSprite('☀️', 0.08); sun.position.set(b.position.x + side * 0.22, 0.17, -0.15); root.add(sun); return b; });
  const pots = [0, 1].map(i => { const p = pottedPlant('cili_' + i); p.scale.setScalar(1.2); p.position.set(-0.2 + i * 0.4, 0, 0.25); p.userData.carryY = 0.0; root.add(home(p)); return p; });
  const placed = new Map();
  const next = emojiCard('seminggu', '📅', 'Seminggu kemudian', 0.08, { border: '#43a047' }); next.position.set(0.5, 0, 0.3); next.visible = false; root.add(next);
  const dr = dragger(S, () => pots.filter(p => !placed.has(p)), {
    onDrop(p) {
      const b = boxes.find(b => flat(b.position, p.position) < 0.15 && ![...placed.values()].includes(b));
      if (!b) return goHome(S, p);
      placed.set(p, b); moveTo(S, p, b.position.clone()); S.evt('box', b.name);
      if (placed.size === 2) { next.visible = true; S.info('📦 Anak pokok cili di dalam kotak. Tuding <b>Seminggu kemudian</b>.'); }
    },
  });
  let bent = false;
  return {
    root, view: { w: 1.2, d: 0.8 }, ...dr,
    hit: (x, y) => (next.visible && !bent ? S.hitTest(x, y, [next])?.name ?? null : null),
    tap(x, y) {
      if (!next.visible || bent || S.hitTest(x, y, [next]) !== next) return;
      bent = true; for (const [p, b] of placed) S.tween(1.5, k => p.children.slice(2, 4).forEach(c => c.rotation.z = -b.userData.side * 0.6 * k));
      S.evt('bend', 'pucuk'); S.info('🌱 Pucuk membengkok ke arah lubang. Kesimpulan: <b>pucuk tumbuh ke arah cahaya</b>.', 8);
    },
  };
}

// ------------------------------------------------------------ L3 Graviti + sentuhan (semalu)
function mimosa(name) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.18), M(0x6d4c41), 0, 0.09, 0));
  g.userData.fronds = [];
  for (let i = 0; i < 4; i++) {
    const f = group(''); f.position.set(0, 0.06 + i * 0.03, 0); f.rotation.y = i * 1.6;
    const leaflets = [];
    for (let j = 0; j < 7; j++) for (const s of [-1, 1]) { const l = mesh(new THREE.SphereGeometry(0.008, 6, 4).scale(1, 0.15, 0.45), M(GREEN)); const p = group('', l); l.position.z = s * 0.007; p.position.x = 0.02 + j * 0.012; p.userData.s = s; f.add(p); leaflets.push(p); }
    g.add(f); g.userData.fronds.push(leaflets);
  }
  g.userData.fold = k => g.userData.fronds.forEach(fr => fr.forEach(p => p.rotation.x = p.userData.s * k * 1.4));
  return g;
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const dish = group('piring_tegak', mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.015, 32), M(0xe1f5fe, { transparent: true, opacity: 0.6 }), 0, 0, 0).rotateX(Math.PI / 2));
  dish.position.set(-0.32, 0.13, -0.15); root.add(dish);
  const dl = textSprite('Piring petri ditegakkan', { h: 0.026 }); dl.position.set(-0.32, 0.27, -0.15); root.add(dl);
  const seeds = [[-0.05, 0.05], [0.05, 0.05], [0, -0.04]].map(([x, y]) => { const s = mesh(new THREE.SphereGeometry(0.01, 8, 6), M(0xc0ca33), x, y, 0.012); dish.add(s); return s; });
  const turn = emojiCard('pusing', '🔄', 'Putar piring', 0.08, { border: '#3a7bd5' }); turn.position.set(-0.32, 0, 0.22); root.add(turn);
  const plant = mimosa('semalu'); plant.scale.setScalar(1.6); plant.position.set(0.32, 0, -0.15); root.add(plant);
  const pl = textSprite('Pokok semalu', { h: 0.03 }); pl.position.set(0.32, 0.36, -0.15); root.add(pl);
  let turned = false, touched = false, folding = 0;
  return {
    root, view: { w: 1.3, d: 0.85 },
    hit: (x, y) => (S.hitTest(x, y, [turn, plant]) || S.nearest(x, y, [plant], 60))?.name ?? null,
    async tap(x, y) {
      const t = S.hitTest(x, y, [turn, plant]) || S.nearest(x, y, [plant], 60); if (!t) return;
      if (t === turn && !turned) {
        turned = true; await S.tween(0.8, k => dish.rotation.z = k * Math.PI / 2);
        seeds.forEach(s => { const w = root.worldToLocal(s.getWorldPosition(new THREE.Vector3())); root.add(tube([w.clone(), w.clone().add(new THREE.Vector3(0.01, -0.03, 0.01)), w.clone().add(new THREE.Vector3(0, -0.06, 0.01))], 0.002, ROOT)); });  // roots point down after the turn
        S.evt('gravity', 'akar'); return S.info('⬇️ Walaupun piring diputar, akar tetap tumbuh ke <b>bawah</b>. Kesimpulan: <b>akar tumbuh ke arah graviti</b>.', 8);
      }
      if (t === plant && !touched) { touched = true; folding = 1; S.evt('touch', 'semalu'); S.info('🤚 Daun pokok semalu <b>menguncup</b> apabila disentuh! Pokok perangkap lalat Venus juga menutup daunnya.', 8); }
    },
    update(dt) { if (folding > 0) { folding = Math.max(0, folding - dt * 0.15); plant.userData.fold(Math.min(1, folding * 4)); } },
  };
}

// ------------------------------------------------------------ L4 Keperluan fotosintesis
function L4(S, play) {
  const root = group('L4', table(1.4, 0.9, play));
  const p = pottedPlant('pokok'); p.scale.setScalar(2.4); p.position.set(0, 0, -0.18); root.add(p); p.userData.setWilt(0.4);
  const NEED = [['cahaya', '☀️', 'Cahaya matahari'], ['air', '💧', 'Air'], ['co2', '💨', 'Karbon dioksida'], ['klorofil', '🍃', 'Klorofil']];
  const tok = NEED.map(([id, e, l], i) => { const c = emojiCard('keperluan_' + id, e, l, 0.1, { border: '#43a047' }); c.position.set(-0.45 + i * 0.3, 0, 0.27); c.userData.id = id; root.add(home(c)); return c; });
  const decoys = [['gula', '🍬', 'Gula-gula'], ['batu', '⚫', 'Batu']].map(([id, e, l], i) => { const c = emojiCard('umpan_' + id, e, l, 0.09, { border: '#9e9e9e' }); c.position.set(-0.55 + i * 1.1, 0, 0.0); root.add(home(c)); return c; });
  const fed = new Set();
  const dr = dragger(S, () => [...tok, ...decoys].filter(c => !fed.has(c.name)), {
    onDrop(c, x, y) {
      if (!(nearScreen(S, p, x, y, 0.2, 110) || flat(c.position, p.position) < 0.18)) return goHome(S, c);
      if (decoys.includes(c)) { S.info('🤔 Tumbuhan tidak memerlukan itu untuk membuat makanan.'); return goHome(S, c); }
      fed.add(c.name); c.visible = false; S.evt('need', c.userData.id);
      p.userData.setWilt(Math.max(0, 0.4 - fed.size * 0.1));
      S.info({ cahaya: '☀️ Cahaya matahari — sumber utama tenaga.', air: '💧 Air — diserap masuk melalui akar.', co2: '💨 Karbon dioksida — gas dalam udara yang masuk melalui daun.', klorofil: '🍃 Klorofil — bahan berwarna hijau pada tumbuhan.' }[c.userData.id]);
      if (fed.size === 4) setTimeout(() => S.info('🌿 <b>Fotosintesis</b> ialah proses tumbuh-tumbuhan membuat makanan sendiri.', 8), 2000);
    },
  });
  return { root, view: { w: 1.4, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L5 Persamaan fotosintesis + hasil
function L5(S, play) {
  const root = group('L5', table(1.6, 0.9, play));
  const slots = ['bahan1', 'bahan2', 'hasil1', 'hasil2'].map((id, i) => { const m = mesh(new THREE.BoxGeometry(0.3, 0.004, 0.13), M(i < 2 ? 0xbbdefb : 0xc8e6c9, { transparent: true, opacity: 0.7 }), [-0.66, -0.33, 0.33, 0.66][i], 0.002, -0.2); m.name = 'petak_' + id; root.add(m); return m; });
  const arrow = textCard('anak_panah', '➜ cahaya matahari + klorofil ➜', 0.3); arrow.position.set(0, 0, -0.2); root.add(arrow);
  for (const [x, t] of [[-0.495, '+'], [0.495, '+']]) { const s = textSprite(t, { h: 0.06, bg: '#ffffff00' }); s.position.set(x, 0.03, -0.2); root.add(s); }
  const W = [['karbon_dioksida', 'Karbon dioksida', 'bahan'], ['air', 'Air', 'bahan'], ['glukosa', 'Glukosa', 'hasil'], ['oksigen', 'Oksigen', 'hasil']];
  const cards = W.map(([id, l, kind], i) => { const c = textCard('perkataan_' + id, l, 0.28); c.userData = { id, kind }; c.position.set(-0.45 + [2, 0, 3, 1][i] * 0.3, 0, 0.27); root.add(home(c)); return c; });
  const used = new Set();
  const dr = dragger(S, () => cards.filter(c => !c.userData.done), {
    onDrop(c) {
      const s = slots.filter(s => !used.has(s)).find(s => flat(s.position, c.position) < 0.15);
      if (!s) return goHome(S, c);
      const kind = s.name.includes('bahan') ? 'bahan' : 'hasil';
      if (kind !== c.userData.kind) { S.info(kind === 'bahan' ? '🤔 Di sebelah kiri: bahan yang <b>diperlukan</b>.' : '🤔 Di sebelah kanan: bahan yang <b>dihasilkan</b>.'); return goHome(S, c); }
      used.add(s); c.userData.done = true; moveTo(S, c, s.position.clone()); S.evt('equation', c.userData.id);
      S.info({ karbon_dioksida: '✅ Karbon dioksida diperlukan.', air: '✅ Air diperlukan.', glukosa: '✅ <b>Glukosa</b> disimpan sebagai kanji pada daun, batang, akar, biji benih, bunga dan buah.', oksigen: '✅ <b>Oksigen</b> dibebaskan melalui daun ke udara.' }[c.userData.id], 7);
      if (used.size === 4) setTimeout(() => S.info('🌿 Karbon dioksida + air → (cahaya matahari, klorofil) → glukosa + oksigen.', 8), 2500);
    },
  });
  return { root, view: { w: 1.5, d: 0.7 }, ...dr };
}

// ------------------------------------------------------------ L6 Kepentingan fotosintesis + responses that help
function L6(S, play) {
  const root = group('L6', table(1.6, 0.9, play));
  const mt = matcher(S, root, [
    { id: 'makanan', target: ['🍅', 'Sumber makanan'], card: ['🌾', 'Padi, sayur dan buah'], ok: '✅ Fotosintesis membekalkan <b>sumber makanan</b>.' },
    { id: 'oksigen', target: ['😮', 'Untuk pernafasan'], card: ['', 'Oksigen'], ok: '✅ Fotosintesis membekalkan <b>oksigen</b> untuk pernafasan.' },
    { id: 'seimbang', target: ['🌳', 'Keseimbangan udara'], card: ['', 'Karbon dioksida diserap'], ok: '✅ Fotosintesis <b>mengekalkan keseimbangan udara</b> di alam ini.' },
    { id: 'pucuk', target: ['☀️', 'Pucuk tumbuh ke arah cahaya'], card: ['', 'Mendapat cahaya matahari'], ok: '✅ Gerak balas pucuk membantu tumbuhan mendapat <b>cahaya</b> untuk fotosintesis.' },
    { id: 'akar', target: ['💧', 'Akar tumbuh ke arah air'], card: ['', 'Mendapat air'], ok: '✅ Gerak balas akar membantu tumbuhan mendapat <b>air</b> untuk fotosintesis.' },
  ], { type: 'importance', gap: 0.3, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.6, d: 0.95 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Akar dan air', sp: 'SP 4.1.1 – 4.1.4', make: L1 },
  { id: 'L2', title: 'Pucuk dan cahaya', sp: 'SP 4.1.1 – 4.1.4', make: L2 },
  { id: 'L3', title: 'Graviti dan sentuhan', sp: 'SP 4.1.1 – 4.1.4', make: L3 },
  { id: 'L4', title: 'Keperluan fotosintesis', sp: 'SP 4.2.1 · 4.2.2', make: L4 },
  { id: 'L5', title: 'Hasil fotosintesis', sp: 'SP 4.2.3', make: L5 },
  { id: 'L6', title: 'Kepentingan fotosintesis', sp: 'SP 4.2.4 · 4.2.5', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tumbuh-tumbuhan — Gerak Balas dan Fotosintesis',
  intro: '<b>Sains Tahun 4 · Unit 4.</b> Tumbuhan bergerak balas dan membuat makanan sendiri! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
