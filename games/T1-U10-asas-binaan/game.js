// Sains Tahun 1 · Unit 10 Asas Binaan (SP 10.1.1 – 10.1.5) — 2D shapes, 3D solids, build a robot, shape follows use.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ solids (origin at the bottom)
const SOLID = {
  kubus: c => mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), M(c), 0, 0.035, 0),
  kuboid: c => mesh(new THREE.BoxGeometry(0.12, 0.05, 0.06), M(c), 0, 0.025, 0),
  piramid: c => mesh(new THREE.ConeGeometry(0.055, 0.08, 4), M(c, { flatShading: true }), 0, 0.04, 0).rotateY(Math.PI / 4),
  prisma: c => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 3).rotateZ(Math.PI / 2).rotateY(0.7), M(c, { flatShading: true }), 0, 0.02, 0),  // turned to show a triangle face
  kon: c => mesh(new THREE.ConeGeometry(0.04, 0.09, 24), M(c), 0, 0.045, 0),
  silinder: c => mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 24), M(c), 0, 0.03, 0).rotateZ(Math.PI / 2),
  sfera: c => mesh(new THREE.SphereGeometry(0.04, 24, 16), M(c), 0, 0.04, 0),
};
const COLORS = { kubus: 0xe53935, kuboid: 0x1e88e5, piramid: 0xfdd835, prisma: 0x8e24aa, kon: 0xfb8c00, silinder: 0x43a047, sfera: 0xec407a };
const solid = (kind, name = kind, color = COLORS[kind]) => { const g = group(name, SOLID[kind](color)); g.userData.kind = kind; return g; };

// ------------------------------------------------------------ L1 Empat bentuk asas: shape sorter
const SHAPE2D = {
  segi_tiga: ['Segi tiga', () => { const s = new THREE.Shape(); s.moveTo(-0.05, -0.043); s.lineTo(0.05, -0.043); s.lineTo(0, 0.043); s.closePath(); return s; }],
  segi_empat_sama: ['Segi empat sama', () => { const s = new THREE.Shape(); s.moveTo(-0.04, -0.04); s.lineTo(0.04, -0.04); s.lineTo(0.04, 0.04); s.lineTo(-0.04, 0.04); s.closePath(); return s; }],
  segi_empat_tepat: ['Segi empat tepat', () => { const s = new THREE.Shape(); s.moveTo(-0.06, -0.032); s.lineTo(0.06, -0.032); s.lineTo(0.06, 0.032); s.lineTo(-0.06, 0.032); s.closePath(); return s; }],
  bulatan: ['Bulatan', () => { const s = new THREE.Shape(); s.absarc(0, 0, 0.042, 0, Math.PI * 2); return s; }],
};
const tile = (id, color, depth = 0.012) => { const m = mesh(new THREE.ExtrudeGeometry(SHAPE2D[id][1](), { depth, bevelEnabled: false }), M(color)); m.rotation.x = -Math.PI / 2; return group(id, m); };
function L1(S, play) {
  const root = group('L1', table(1.3, 0.8, play));
  const board = mesh(new THREE.BoxGeometry(0.8, 0.02, 0.22), M(0xd7a86e), 0, 0.01, -0.15); root.add(board);
  const ids = Object.keys(SHAPE2D);
  const holes = ids.map((id, i) => { const h = tile(id, 0x3e2723, 0.003); h.name = 'lubang_' + id; h.position.set(-0.28 + i * 0.19, 0.021, -0.15); root.add(h); return h; });
  const cols = [0xe53935, 0x1e88e5, 0x43a047, 0xfdd835], mix = [2, 0, 3, 1];
  const tiles = ids.map((id, i) => { const t = tile(id, cols[i]); t.position.set(-0.3 + mix[i] * 0.2, 0, 0.22); root.add(home(t)); const l = textSprite(SHAPE2D[id][0], { h: 0.03 }); l.position.set(0, 0.03, 0.07); t.add(l); t.userData.tag = l; return t; });
  const done = new Set();
  const dr = dragger(S, () => tiles.filter(t => !done.has(t)), {
    onDrop(t) {
      const h = holes.find(h => flat(h.position, t.position) < 0.07);
      if (!h) return goHome(S, t);
      if (h.name !== 'lubang_' + t.name) { S.info(`🤔 ${SHAPE2D[t.name][0]} tidak muat di situ. Bandingkan bentuknya.`); return goHome(S, t); }
      done.add(t); t.userData.tag.visible = false; moveTo(S, t, h.position.clone().setY(0.012));
      S.evt('fit', t.name); S.info(`✅ <b>${SHAPE2D[t.name][0]}</b> muat!` + (done.size === 4 ? ' Inilah <b>empat bentuk asas</b>.' : ''));
    },
  });
  return { root, view: { w: 1.1, d: 0.7 }, ...dr };
}

// ------------------------------------------------------------ L2 Tujuh bongkah: name the solids
const NAMES = { kubus: 'Kubus', kuboid: 'Kuboid', piramid: 'Piramid', prisma: 'Prisma', kon: 'Kon', silinder: 'Silinder', sfera: 'Sfera' };
function L2(S, play) {
  const root = group('L2', table(1.5, 0.85, play));
  const kinds = Object.keys(NAMES);
  const solids = kinds.map((k, i) => { const s = solid(k, 'bongkah_' + k); s.scale.setScalar(1.3); s.position.set(-0.6 + i * 0.2, 0, -0.12); root.add(s); return s; });
  const mix = [3, 6, 0, 5, 1, 4, 2];
  const cards = kinds.map((k, i) => { const c = emojiCard('nama_' + k, '', NAMES[k], 0.07, { border: '#3949ab' }); c.userData.kind = k; c.position.set(-0.6 + mix[i] * 0.2, 0, 0.27); root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c) {
      const s = solids.find(s => flat(s.position, c.position) < 0.09);
      if (!s) return goHome(S, c);
      if (s.userData.kind !== c.userData.kind) { S.info(`🤔 Itu bukan ${NAMES[c.userData.kind].toLowerCase()}. Kira permukaan dan bucunya.`); return goHome(S, c); }
      done.add(c); moveTo(S, c, s.position.clone().add(new THREE.Vector3(0, 0, 0.11)));
      S.evt('solid', c.userData.kind); S.info(`✅ <b>${NAMES[c.userData.kind]}</b>.` + (done.size === 7 ? ' Inilah <b>tujuh bongkah bentuk asas</b>!' : ''));
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L3 Membina robot: blocks into the design's slots
const ROBOT = [['topi', 'kon', [0, 0.27, 0], 0xfb8c00], ['kepala', 'kubus', [0, 0.2, 0], 0xfdd835], ['badan', 'kuboid', [0, 0.12, 0], 0x1e88e5],
  ['tangan_kiri', 'silinder', [-0.1, 0.13, 0], 0xe53935], ['tangan_kanan', 'silinder', [0.1, 0.13, 0], 0xe53935], ['kaki_kiri', 'kuboid', [-0.03, 0.0, 0], 0xff7043], ['kaki_kanan', 'kuboid', [0.03, 0.0, 0], 0xff7043]];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const stand = group('robot', mesh(new THREE.BoxGeometry(0.3, 0.01, 0.12), M(0xb0bec5), 0, 0.005, 0)); stand.position.set(0.2, 0, -0.15); root.add(stand);
  // the design sketch: ghost outlines where each block goes
  const slots = ROBOT.map(([id, kind, p]) => {
    const ghost = solid(kind, 'slot_' + id, 0x64b5f6); ghost.traverse(o => o.material && Object.assign(o.material, { transparent: true, opacity: 0.45, depthWrite: false }));
    if (id.startsWith('kaki')) ghost.scale.set(0.4, 1.4, 0.8); if (id === 'badan') ghost.scale.set(1, 1.6, 1); if (id.startsWith('tangan')) ghost.scale.set(0.8, 0.8, 0.8);
    ghost.position.set(...p); ghost.position.y += 0.01; ghost.userData.id = id; ghost.userData.kind = kind; stand.add(ghost); return ghost;
  });
  const sketch = textSprite('✏️ Lakaran reka bentuk robot', { h: 0.03 }); sketch.position.set(0.2, 0.42, -0.15); root.add(sketch);
  const pool = ROBOT.map(([id, kind, , color], i) => { const b = solid(kind, 'blok_' + id, color); b.userData.slot = id; b.position.set(-0.6 + (i % 4) * 0.13, 0, 0.05 + Math.floor(i / 4) * 0.18); b.userData.carryY = 0.05; root.add(home(b)); return b; });
  const placed = new Set(); let alive = false, t = 0;
  const dr = dragger(S, () => pool.filter(b => !placed.has(b)), {
    onDrop(b, x, y) {
      const d = s => { const p = s.getWorldPosition(new THREE.Vector3()); p.y += 0.03; const q = p.project(S.camera); return Math.hypot((q.x + 1) / 2 * innerWidth - x, (1 - q.y) / 2 * innerHeight - y); };
      const s = slots.filter(s => s.visible && d(s) < 50).sort((a, c) => d(a) - d(c))[0];  // nearest open slot (filled ones are hidden)
      if (!s) return goHome(S, b);
      if (s.userData.kind !== b.userData.kind) { S.info(`🤔 Lakaran menunjukkan <b>${NAMES[s.userData.kind].toLowerCase()}</b> di situ.`); return goHome(S, b); }
      placed.add(b); b.userData.at = s; s.visible = false;
      stand.attach(b); b.scale.copy(s.scale); moveTo(S, b, s.position.clone());
      S.evt('build', s.userData.id); S.info(`✅ ${NAMES[b.userData.kind]} untuk ${s.userData.id.replace('_', ' ')}.` + (placed.size === 7 ? ' Robot siap! Tuding robot untuk menghidupkannya.' : ''));
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (placed.size === 7 ? S.hitTest(x, y, [stand])?.name ?? null : null),
    tap(x, y) {
      if (placed.size < 7 || alive || S.hitTest(x, y, [stand]) !== stand) return;
      alive = true; const face = emojiSprite('😊', 0.06); face.position.set(0, 0.24, 0.045); stand.add(face);
      S.evt('robot', 'robot');
      S.info('🤖 Robot saya dibina daripada <b>kon</b> (topi), <b>kubus</b> (kepala), <b>kuboid</b> (badan dan kaki) dan <b>silinder</b> (tangan)!', 10);
    },
    update(dt) {
      if (!alive) return; t += dt;
      const arm = [...placed].find(b => b.userData.slot === 'tangan_kanan'); if (arm) arm.rotation.z = Math.sin(t * 5) * 0.5;
      stand.rotation.y = Math.sin(t * 1.5) * 0.3;
    },
  };
}

// ------------------------------------------------------------ L4 Bentuk mengikut kegunaan: roll test + a shelf
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const goal = group('gol', ...[[-0.12, 0], [0.12, 0]].map(([z]) => mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12), M(0x1565c0), 0.6, 0.06, z)), mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24), M(0x1565c0), 0.6, 0.12, 0).rotateX(Math.PI / 2));
  root.add(goal);
  const ballS = group('bola_sfera', mesh(new THREE.SphereGeometry(0.04, 24, 16), M(0xffeb3b), 0, 0.04, 0)); ballS.add(mesh(new THREE.SphereGeometry(0.041, 6, 4), new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true }), 0, 0.04, 0));
  const ballC = group('bola_kubus', mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), M(0xffeb3b), 0, 0.035, 0)); ballC.add(mesh(new THREE.BoxGeometry(0.071, 0.071, 0.071), new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true }), 0, 0.035, 0));
  ballS.position.set(-0.5, 0, -0.15); ballC.position.set(-0.5, 0, 0.05); root.add(ballS, ballC);
  for (const [b, l] of [[ballS, 'Bola sfera'], [ballC, 'Bola kubus']]) { const t = textSprite(l, { h: 0.028 }); t.position.set(0, 0.1, 0); b.add(t); }
  const shelf = group('rak', mesh(new THREE.BoxGeometry(0.4, 0.012, 0.1), M(0xb07a45), 0, 0.15, 0), ...[-0.18, 0.18].map(x => mesh(new THREE.BoxGeometry(0.012, 0.15, 0.1), M(0x8a5a2e), x, 0.075, 0)));
  shelf.rotation.y = 0; shelf.position.set(0.15, 0, 0.0); root.add(shelf);
  const sl = textSprite('Rak', { h: 0.028 }); sl.position.set(0.15, 0.2, -0.05); root.add(sl);
  const clock = (name, kind) => {
    const g = group(name, kind === 'kuboid' ? mesh(new THREE.BoxGeometry(0.1, 0.05, 0.05), M(0xe53935), 0, 0.025, 0) : mesh(new THREE.SphereGeometry(0.032, 20, 14), M(0xe53935), 0, 0.032, 0));
    const face = textSprite('7:30', { h: 0.022, bg: '#212121', fg: '#69f0ae' }); face.position.set(0, kind === 'kuboid' ? 0.028 : 0.035, 0.035); g.add(face);
    g.userData.kind = kind; g.userData.carryY = 0.16; return g;
  };
  const clocks = [clock('jam_kuboid', 'kuboid'), clock('jam_sfera', 'sfera')];
  clocks[0].position.set(-0.2, 0, 0.28); clocks[1].position.set(0.05, 0, 0.3); clocks.forEach(c => root.add(home(c)));
  const kicked = new Set(), shelved = new Set();
  async function kick(b) {
    if (kicked.has(b)) return; kicked.add(b);
    const x0 = b.position.x;
    if (b === ballS) { await S.tween(1.6, k => { b.position.x = x0 + k * 1.05; b.children[0].rotation.z = b.children[1].rotation.z = -k * 25; }); S.info('⚽ Bola sfera <b>mudah bergolek</b> apabila disepak — GOL!'); }
    else { await S.tween(0.8, k => { b.position.x = x0 + Math.min(k, 0.5) * 0.12; b.rotation.z = -Math.min(k * 2, 1) * Math.PI / 2; }); S.info('🧊 Bola kubus <b>tidak bergolek</b> — ia hanya terbalik sekali.'); }
    S.evt('kick', b.name);
  }
  const dr = dragger(S, () => clocks.filter(c => !shelved.has(c)), {
    async onDrop(c, x, y) {
      if (!(nearScreen(S, shelf, x, y, 0.16, 90) || flat(c.position, shelf.position) < 0.2)) return goHome(S, c);
      shelved.add(c); const spot = shelf.position.clone().add(new THREE.Vector3(c.userData.kind === 'kuboid' ? -0.08 : 0.08, 0.156, 0));
      await moveTo(S, c, spot);
      if (c.userData.kind === 'sfera') {
        await S.tween(1, k => { c.position.x = spot.x + k * 0.14; c.position.y = spot.y - Math.max(0, k - 0.6) / 0.4 * 0.156; c.rotation.z = -k * 6; });
        S.info('😮 Jam berbentuk sfera <b>bergolek</b> dan jatuh dari rak!');
      } else S.info('✅ Jam meja berbentuk <b>kuboid terletak dengan baik</b> di atas rak.');
      S.evt('shelf', c.name);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [ballS, ballC].filter(b => !kicked.has(b)))?.name ?? null,
    tap(x, y) { const b = S.hitTest(x, y, [ballS, ballC]); if (b) kick(b); },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Empat bentuk asas', sp: 'SP 10.1.1', make: L1 },
  { id: 'L2', title: 'Tujuh bongkah bentuk asas', sp: 'SP 10.1.2', make: L2 },
  { id: 'L3', title: 'Membina robot', sp: 'SP 10.1.3 · 10.1.5', make: L3 },
  { id: 'L4', title: 'Bentuk mengikut kegunaan', sp: 'SP 10.1.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Asas Binaan',
  intro: '<b>Sains Tahun 1 · Unit 10.</b> Bentuk dan bongkah! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
