// Sains Tahun 1 · Unit 6 Tumbuhan — build a plant from its parts, compare plant features, similar plants, label.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, leaf, plantParts, glassPot, emojiCard, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const SOIL = 0.13;  // soil surface inside glassPot
const FN = {
  akar: '🌱 <b>Akar</b> menyokong pokok serta menyerap air dan nutrien daripada tanah.',
  batang: '🪵 <b>Batang</b> mengangkut makanan, air dan nutrien ke bahagian tumbuhan.',
  daun: '🍃 <b>Daun</b> membuat makanan.',
  bunga: '🌺 <b>Bunga</b> bertukar menjadi buah dan biji benih.',
};

// ------------------------------------------------------------ L1 Bina pokok: assemble bottom-up, then water it
function L1(S, play) {
  const root = group('L1', table(1.4, 0.85, play));
  const pot = glassPot(); pot.position.set(0.2, 0, -0.12); root.add(pot);
  const parts = plantParts();
  const ORDER = ['akar', 'batang', 'daun', 'bunga'];
  const loose = [['bunga', -0.55, 0.2], ['akar', -0.3, 0.25], ['daun', -0.45, -0.1], ['batang', -0.15, 0.05]];
  for (const [id, x, z] of loose) {
    const p = parts[id]; p.position.set(x, id === 'akar' ? 0.13 : id === 'bunga' ? 0.02 : 0.0, z);
    p.userData.carryY = 0.1; root.add(home(p));
    const t = textSprite(id[0].toUpperCase() + id.slice(1), { h: 0.035 }); t.position.set(0, { akar: 0.03, batang: 0.23, daun: 0.2, bunga: 0.06 }[id], 0); p.add(t); p.userData.tag = t;
  }
  const can = group('penyiram', mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.07, 16), M(0x26a69a), 0, 0.035, 0),
    mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.08), M(0x26a69a), 0.06, 0.07, 0).rotateZ(-0.9), mesh(new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI), M(0x00796b), -0.02, 0.07, 0).rotateZ(1.2));
  can.position.set(0.5, 0, 0.18); can.visible = false; root.add(can);
  let next = 0, watered = false; const flows = [];
  const dr = dragger(S, () => ORDER.slice(next).map(k => parts[k]), {
    onDrop(p) {
      if (flat(p.position, pot.position) > 0.14) return goHome(S, p);
      if (p.name !== ORDER[next]) { S.info(`🤔 Bina dari bawah: mulakan dengan <b>${ORDER[next]}</b>.`); return goHome(S, p); }
      next++; p.userData.tag.visible = false; p.rotation.set(0, 0, 0);
      moveTo(S, p, pot.position.clone().setY(SOIL + (p.name === 'bunga' ? 0.2 : 0)));
      S.evt('build', p.name); S.info(FN[p.name], 7);
      if (next === 4) { can.visible = true; setTimeout(() => S.info('🚿 Pokok siap! Tuding <b>penyiram</b> untuk menyiram pokok.'), 3500); }
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (can.visible ? S.hitTest(x, y, [can])?.name ?? null : null),
    async tap(x, y) {
      if (!can.visible || watered || S.hitTest(x, y, [can]) !== can) return;
      watered = true;
      await S.tween(0.6, k => { can.position.set(0.5 - k * 0.2, k * 0.2, 0.18 - k * 0.25); can.rotation.z = k * 0.6; });
      S.info('💧 Akar menyerap air → batang mengangkut air ke daun → daun membuat makanan.', 9);
      const base = pot.position.clone();
      for (let i = 0; i < 12; i++) {  // water drops: soil -> up the stem -> out to the leaves
        const d = mesh(new THREE.SphereGeometry(0.006), M(0x2196f3, { emissive: 0x1565c0, emissiveIntensity: 0.6 })); d.userData.fx = true; root.add(d); flows.push(d);
        const side = i % 2 ? 1 : -1;
        S.tween(3, k => d.position.set(base.x + (k > 0.7 ? (k - 0.7) / 0.3 * 0.05 * side : 0), SOIL - 0.08 + Math.min(k, 0.7) / 0.7 * 0.26, base.z), () => root.remove(d));
        await S.wait(0.2);
      }
      const sun = emojiSprite('☀️', 0.12); sun.position.set(base.x + 0.25, 0.45, base.z); root.add(sun);
      await S.wait(2.4);
      const fl = parts.bunga; await S.tween(1, k => fl.scale.setScalar(1 - k * 0.9));
      const fruit = mesh(new THREE.SphereGeometry(0.02, 14, 10), M(0x8bc34a)); fruit.position.copy(fl.position).add(new THREE.Vector3(0, 0.01, 0)); fruit.name = 'buah'; root.add(fruit);
      await S.tween(0.8, k => fruit.scale.setScalar(0.2 + k));
      S.evt('water', 'pokok'); S.info('🌺 ➜ 🍈 Bunga bertukar menjadi <b>buah</b> yang mengandungi <b>biji benih</b>!');
    },
  };
}

// ------------------------------------------------------------ L2 Bandingkan ciri: 8 specimens into a 4 x 2 table
function lotus() {
  const pad = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 20), M(0x43a047), 0, 0.002, 0);
  const petals = [...Array(8)].map((_, i) => { const p = mesh(new THREE.SphereGeometry(0.016, 10, 8).scale(0.6, 1.4, 0.35).translate(0, 0.02, 0), M(i % 2 ? 0xf48fb1 : 0xf06292)); p.position.y = 0.006; p.rotation.set(0.5, i * Math.PI / 4, 0, 'YXZ'); return p; });
  return group('teratai', pad, ...petals, mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012), M(0xffd54f), 0, 0.012, 0));
}
function fern() {
  const g = group('paku_pakis', mesh(new THREE.CylinderGeometry(0.002, 0.003, 0.16), M(0x33691e), 0, 0.005, 0).rotateZ(Math.PI / 2));
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const l = mesh(new THREE.SphereGeometry(0.012, 8, 6).scale(1, 0.15, 0.35), M(0x558b2f), -0.07 + i * 0.016, 0.006, s * (0.016 - i * 0.001)); l.rotation.y = s * 0.5; g.add(l); }
  return g;
}
const woodStem = () => group('batang_durian', mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.08, 9), M(0x6d4c2f, { flatShading: true, roughness: 1 }), 0, 0.04, 0));
function papayaStem() {
  const g = group('batang_betik', mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.09, 16), M(0x9ccc65), 0, 0.045, 0));
  for (let i = 0; i < 4; i++) g.add(mesh(new THREE.TorusGeometry(0.023, 0.002, 6, 16), M(0x7cb342), 0, 0.015 + i * 0.022, 0).rotateX(Math.PI / 2));
  return g;
}
function netLeaf() { const l = leaf('daun_ros'); l.scale.setScalar(0.9); return l; }
function parallelLeaf() {
  const g = group('daun_pandan', mesh(new THREE.BoxGeometry(0.2, 0.003, 0.026), M(0x2e7d32), 0, 0.003, 0));
  for (const z of [-0.008, 0, 0.008]) g.add(mesh(new THREE.BoxGeometry(0.19, 0.002, 0.0015), M(0x1b5e20), 0, 0.005, z));
  return g;
}
const tapRoot = () => { const a = plantParts({ roots: 'tunjang' }).akar; a.name = 'akar_tunjang'; a.rotation.z = Math.PI / 2; a.position.y = 0.012; return group('akar_tunjang', a); };
const fibrousRoot = () => { const a = plantParts({ roots: 'serabut' }).akar; a.rotation.z = Math.PI / 2; a.position.y = 0.012; return group('akar_serabut', a); };
const ROWS = [['Bunga', [lotus, 'Berbunga: teratai'], [fern, 'Tidak berbunga: paku pakis']],
  ['Batang', [woodStem, 'Berkayu: durian'], [papayaStem, 'Tidak berkayu: betik']],
  ['Urat daun', [netLeaf, 'Jejala: bunga ros'], [parallelLeaf, 'Selari: pandan']],
  ['Akar', [tapRoot, 'Tunjang: bunga ros'], [fibrousRoot, 'Serabut: pandan']]];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.95, play));
  const cells = [];
  ROWS.forEach(([title, a, b], r) => {
    const z = -0.38 + r * 0.14;
    const t = textSprite(title, { h: 0.032, bg: '#ffd84dee' }); t.position.set(-0.6, 0.02, z); root.add(t);
    [a, b].forEach(([make, label], c) => {
      const cell = mesh(new THREE.BoxGeometry(0.4, 0.004, 0.12), M(c ? 0x81d4fa : 0xf48fb1, { transparent: true, opacity: 0.6 }), -0.22 + c * 0.44, 0.002, z);
      cell.name = 'petak_' + make().name; root.add(cell); cells.push(cell);
      const l = textSprite(label, { h: 0.032, bg: '#ffffffdd' }); l.position.set(cell.position.x + 0.08, 0.02, z + 0.035); root.add(l);
    });
  });
  const specs = ROWS.flatMap(([, a, b]) => [a[0](), b[0]()]);
  const mix = [5, 2, 7, 0, 3, 6, 1, 4];
  specs.forEach((s, i) => { s.position.set(-0.63 + mix[i] * 0.18, 0, 0.36); s.userData.carryY = 0.0; root.add(home(s)); });
  const placed = new Set();
  const dr = dragger(S, () => specs.filter(s => !placed.has(s)), {
    onDrop(s) {
      const cell = cells.find(c => Math.abs(c.position.x - s.position.x) < 0.2 && Math.abs(c.position.z - s.position.z) < 0.07);
      if (!cell) return goHome(S, s);
      if (cell.name !== 'petak_' + s.name) { S.info('🤔 Perhatikan ciri bahagian itu sekali lagi. Cuba petak lain.'); return goHome(S, s); }
      placed.add(s); moveTo(S, s, cell.position.clone().add(new THREE.Vector3(-0.1, 0, 0)));
      S.evt('compare', s.name); S.star(cell.position.clone().setY(0.15));
      const label = ROWS.flatMap(([t, a, b]) => [[a[0], a[1], t], [b[0], b[1], t]]).find(([mk]) => mk().name === s.name);
      S.info(`✅ ${label[2]} — <b>${label[1]}</b>.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Berbeza tetapi serupa: bunga raya vs bunga ros
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const plantAt = (name, color, x, label) => {
    const pot = glassPot(name); pot.position.set(x, 0, -0.2); root.add(pot);
    const p = plantParts({ flower: color }); for (const k of ['akar', 'batang', 'daun', 'bunga']) { p[k].position.y += SOIL; pot.add(p[k]); }
    const t = textSprite(label, { h: 0.035 }); t.position.set(0, 0.42, 0); pot.add(t); return pot;
  };
  plantAt('bunga_raya', 0xe53935, -0.5, 'Pokok bunga raya'); plantAt('bunga_ros', 0xd81b60, 0.5, 'Pokok bunga ros');
  const mid = group('zon_serupa', mesh(new THREE.BoxGeometry(0.5, 0.006, 0.36), M(0xc8e6c9, { transparent: true, opacity: 0.8 }), 0, 0.003, 0));
  const ml = textSprite('🤝 Serupa', { h: 0.04 }); ml.position.set(0, 0.03, -0.2); mid.add(ml); mid.position.set(0, 0, -0.15); root.add(mid);
  const FEAT = [['berbunga', 'Berbunga', true], ['jejala', 'Urat daun jejala', true], ['berkayu', 'Batang berkayu', true], ['tunjang', 'Akar tunjang', true],
    ['selari', 'Urat daun selari', 'Kedua-dua pokok mempunyai urat daun <b>jejala</b>, bukan selari.'], ['serabut', 'Akar serabut', 'Kedua-dua pokok mempunyai akar <b>tunjang</b>, bukan serabut.']];
  const mix = [4, 0, 2, 5, 1, 3];
  const cards = FEAT.map(([id, label, ok], i) => { const c = emojiCard(id, '', label, 0.085, { border: '#43a047' }); c.position.set(-0.6 + mix[i] * 0.24, 0, 0.27); c.userData.ok = ok; root.add(home(c)); return c; });
  const inside = new Set();
  const dr = dragger(S, () => cards.filter(c => !inside.has(c)), {
    onDrop(c) {
      if (Math.abs(c.position.x) > 0.27 || Math.abs(c.position.z - mid.position.z) > 0.2) return goHome(S, c);
      if (c.userData.ok !== true) { S.info('🤔 ' + c.userData.ok); return goHome(S, c); }
      inside.add(c); const i = inside.size - 1; moveTo(S, c, mid.position.clone().add(new THREE.Vector3((i % 2 - 0.5) * 0.24, 0, (Math.floor(i / 2) - 0.5) * 0.14)));
      S.evt('same', c.name); S.star(mid.position.clone().setY(0.2));
      S.info(inside.size < 4 ? `✅ Kedua-dua pokok: <b>${FEAT.find(f => f[0] === c.name)[1].toLowerCase()}</b>.` : '🎉 Pokok bunga raya dan pokok bunga ros berlainan, tetapi mempunyai <b>ciri bahagian yang serupa</b>!');
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Labelkan: put the part names on the plant
function L4(S, play) {
  const root = group('L4', table(1.3, 0.85, play));
  const pot = glassPot(); pot.position.set(0.15, 0, -0.15); pot.scale.setScalar(1.3); root.add(pot);
  const p = plantParts(); for (const k of ['akar', 'batang', 'daun', 'bunga']) { p[k].position.y += SOIL; pot.add(p[k]); }
  const PIN = { bunga: [0.08, 0.36], daun: [0.12, 0.25], batang: [-0.035, 0.2], akar: [0.02, 0.08] };  // local to pot (x, y)
  const pins = Object.entries(PIN).map(([k, [x, y]]) => {
    const d = mesh(new THREE.SphereGeometry(0.012, 12, 8), M(0xe0457b, { emissive: 0xe0457b, emissiveIntensity: 0.3 }), x, y, 0.06); d.name = 'pin_' + k; pot.add(d); return d;
  });
  const mix = ['akar', 'bunga', 'batang', 'daun'];
  const labels = mix.map((k, i) => { const c = emojiCard('label_' + k, '', k[0].toUpperCase() + k.slice(1), 0.075, { border: '#e0457b' }); c.position.set(-0.55 + i * 0.16, 0, 0.28); c.userData.part = k; root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => labels.filter(c => !done.has(c)), {
    onDrop(c, x, y) {
      const pin = S.nearest(x, y, pins.filter(p => p.visible), 60);  /* screen-space nearest: pins float at different heights */
      if (!pin) return goHome(S, c);
      if (pin.name !== 'pin_' + c.userData.part) { S.info('🤔 Bukan bahagian itu. Lihat sekali lagi.'); return goHome(S, c); }
      done.add(c); pin.visible = false;
      const w = pin.getWorldPosition(new THREE.Vector3()); moveTo(S, c, root.worldToLocal(w.clone()).add(new THREE.Vector3(0.12, -0.03, 0.04)));
      S.evt('label', c.userData.part); S.info('✅ ' + FN[c.userData.part], 7);
    },
  });
  return { root, view: { w: 1.3, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Bina pokok', sp: 'DSKP hlm. 40–41', make: L1 },
  { id: 'L2', title: 'Bandingkan ciri tumbuhan', sp: 'DSKP hlm. 40–41', make: L2 },
  { id: 'L3', title: 'Berbeza tetapi serupa', sp: 'DSKP hlm. 40–41', make: L3 },
  { id: 'L4', title: 'Labelkan bahagian', sp: 'DSKP hlm. 40–41', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tumbuhan',
  intro: '<b>Sains Tahun 1 · Unit 6.</b> Kenali bahagian tumbuhan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
