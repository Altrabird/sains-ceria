// Sains Tahun 5 · Unit 2 Manusia (SP 2.1.1 – 2.3.3) — skeleton parts and functions, joints and movement,
// blood circulation route, caring for body systems.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sorter, matcher, emojiCard, textCard, diagramBoard, labelPins, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// skeleton picture in 0..1 coords (v down), bone colour on white
function drawSkeleton(g, W, H) {
  const X = u => u * W, Y = v => v * H, bone = '#e8dcc0', line = '#8d7b5a';
  g.lineCap = 'round'; g.strokeStyle = line; g.fillStyle = bone;
  const L = (pts, w) => { g.lineWidth = w + 6; g.strokeStyle = line; g.beginPath(); pts.forEach(([u, v], i) => i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v))); g.stroke(); g.lineWidth = w; g.strokeStyle = bone; g.stroke(); };
  g.beginPath(); g.ellipse(X(0.5), Y(0.09), W * 0.1, H * 0.075, 0, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = line; g.stroke();  // skull
  g.fillStyle = '#5d4037'; for (const s of [-1, 1]) { g.beginPath(); g.arc(X(0.5 + s * 0.035), Y(0.085), W * 0.022, 0, 7); g.fill(); }
  L([[0.5, 0.16], [0.5, 0.52]], 14);  // spine
  for (let i = 0; i < 6; i++) { const v = 0.24 + i * 0.035, w = 0.15 - i * 0.008; g.lineWidth = 9; g.strokeStyle = line; g.beginPath(); g.ellipse(X(0.5), Y(v), W * w, H * 0.02, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); }  // ribs
  L([[0.33, 0.2], [0.67, 0.2]], 12);  // shoulders
  for (const s of [-1, 1]) {
    L([[0.5 + s * 0.17, 0.2], [0.5 + s * 0.24, 0.36], [0.5 + s * 0.28, 0.5]], 12);  // arm
    L([[0.5 + s * 0.28, 0.5], [0.5 + s * 0.3, 0.55]], 18);  // hand
    L([[0.5 + s * 0.08, 0.56], [0.5 + s * 0.1, 0.75], [0.5 + s * 0.1, 0.93]], 15);  // leg
    L([[0.5 + s * 0.1, 0.94], [0.5 + s * 0.15, 0.96]], 12);  // foot
  }
  g.fillStyle = bone; g.beginPath(); g.ellipse(X(0.5), Y(0.55), W * 0.13, H * 0.035, 0, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = line; g.stroke();  // pelvis
}

// ------------------------------------------------------------ L1 Rangka utama
function L1(S, play) {
  const root = group('L1', table(1.5, 0.95, play));
  const d = diagramBoard('rangka', { w: 0.42, h: 0.74, draw: drawSkeleton, tilt: 1.0,
    pins: { tengkorak: [0.5, 0.09], tulang_rusuk: [0.6, 0.3], tulang_belakang: [0.5, 0.46], tulang_tangan: [0.74, 0.38], tulang_kaki: [0.6, 0.78] } });
  d.position.set(0, 0, -0.18); root.add(d);
  const dr = labelPins(S, root, d, [['tengkorak', 'Tengkorak'], ['tulang_rusuk', 'Tulang rusuk'], ['tulang_belakang', 'Tulang belakang'], ['tulang_tangan', 'Tulang tangan'], ['tulang_kaki', 'Tulang kaki']], {
    row: 0.3, size: 0.1, onLabel: id => { S.evt('label', id); S.info(`✅ ${id.replace('_', ' ')[0].toUpperCase() + id.replace('_', ' ').slice(1)}. Tulang-tulang membentuk <b>sistem rangka</b>.`); },
  });
  return { root, view: { w: 1.2, d: 1.45 }, ...dr };
}

// ------------------------------------------------------------ L2 Fungsi rangka
function L2(S, play) {
  const root = group('L2', table(1.6, 0.9, play));
  const mt = matcher(S, root, [
    ['tengkorak', '💀', 'Tengkorak', 'Melindungi otak'], ['rusuk', '❤️', 'Tulang rusuk', 'Melindungi jantung dan peparu'],
    ['belakang', '🧍', 'Tulang belakang', 'Menyokong tubuh'], ['kaki', '🦵', 'Tulang kaki', 'Sokongan dan pergerakan'],
  ].map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.toLowerCase()}</b>.` })), { type: 'function', gap: 0.34, onDone: () => setTimeout(() => S.info('🦴 Sistem rangka menyokong tubuh, mengekalkan bentuk badan, membolehkan pergerakan dan melindungi organ dalaman.', 9), 2500) });
  return { root, view: { w: 1.5, d: 0.9 }, ...mt };
}

// ------------------------------------------------------------ L3 Sendi: find the joints, watch them move
const JOINTS = { leher: [0.5, 0.17], bahu: [0.33, 0.2], siku: [0.74, 0.36], pergelangan: [0.27, 0.5], pinggul: [0.6, 0.56], lutut: [0.4, 0.75], buku_lali: [0.6, 0.93] };
function L3(S, play) {
  const root = group('L3', table(1.5, 0.95, play));
  const d = diagramBoard('rangka', { w: 0.42, h: 0.74, draw: drawSkeleton, tilt: 1.0, pins: JOINTS }); d.position.set(-0.3, 0, -0.15); root.add(d);
  const pins = []; d.traverse(o => o.name.startsWith('pin_') && pins.push(o));
  pins.forEach(p => { p.scale.setScalar(1.6); p.material = M(0x4fc3f7, { emissive: 0x4fc3f7, emissiveIntensity: 0.5 }); });
  const boy = kid('murid', { shirt: 0x42a5f5 }); boy.scale.setScalar(1.7); boy.position.set(0.3, 0, -0.25); root.add(boy);
  const part = n => boy.getObjectByName(n);
  const MOVE = {
    leher: ['kepala', 'rotation', 'y', 0.6, 'Kepala berpusing ke kiri dan kanan.'], bahu: ['tanganL', 'rotation', 'z', 2.0, 'Tangan bergerak ke hadapan, ke belakang, ke tepi dan berputar.'],
    siku: ['tanganR', 'rotation', 'x', -1.2, 'Lengan dibengkokkan dan diluruskan.'], pergelangan: ['tanganR', 'rotation', 'z', -0.5, 'Tangan dilenturkan.'],
    pinggul: ['kakiL', 'rotation', 'x', -0.8, 'Kaki diangkat ke hadapan.'], lutut: ['kakiR', 'rotation', 'x', 0.9, 'Kaki dibengkokkan dan diluruskan.'], buku_lali: ['kakiL', 'rotation', 'x', 0.35, 'Kaki dilenturkan.'],
  };
  const found = new Set();
  function wiggle([n, prop, ax, amt]) {
    const o = part(n); if (!o) return; const r0 = o[prop][ax];
    S.tween(1.4, t => { o[prop][ax] = r0 + Math.sin(t * Math.PI * 2) * amt; }, () => { o[prop][ax] = r0; });
  }
  return {
    root, view: { w: 1.4, d: 1.45 },
    hit: (x, y) => S.closest(pins, x, y, p => p.visible && nearScreen(S, p, x, y, 0, 30))?.name ?? null,
    tap(x, y) {
      const p = pins.filter(p => !found.has(p)).map(p => [p, p.getWorldPosition(new THREE.Vector3()).project(S.camera)]).map(([p, q]) => [p, Math.hypot((q.x + 1) / 2 * innerWidth - x, (1 - q.y) / 2 * innerHeight - y)]).filter(a => a[1] < 30).sort((a, b) => a[1] - b[1])[0]?.[0];
      if (!p) return S.info('🔎 Sendi ialah tempat pertemuan dua atau lebih tulang. Cari titik biru.');
      const id = p.name.slice(4); found.add(p); p.material = M(0x43a047, { emissive: 0x43a047, emissiveIntensity: 0.6 });
      const tag = textSprite(id.replace('_', ' '), { h: 0.022, bg: '#c8e6c9ee' }); tag.position.copy(p.position).add(new THREE.Vector3(0, 0.02, 0.01)); p.parent.add(tag);
      wiggle(MOVE[id]); S.evt('joint', id); S.info(`✅ Sendi <b>${id.replace('_', ' ')}</b>: ${MOVE[id][4]}`);
      if (found.size === pins.length) setTimeout(() => S.info('🦴 Sendi membolehkan pergerakan dan kebolehlenturan tubuh. Tanpa sendi, anggota tubuh tidak dapat dibengkokkan.', 9), 2200);
    },
  };
}

// ------------------------------------------------------------ L4 Laluan darah
function drawCirc(g, W, H) {
  g.font = 'bold 44px system-ui'; g.textAlign = 'center';
  const E = (e, u, v, l) => { g.font = '120px system-ui'; g.fillText(e, u * W, v * H + 40); g.font = 'bold 40px system-ui'; g.fillStyle = '#2b2340'; g.fillText(l, u * W, v * H + 100); };
  g.fillStyle = '#ef9a9a';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W * (0.2 + s * 0.07), H * 0.3, W * 0.06, H * 0.14, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2b2340'; g.font = 'bold 40px system-ui'; g.fillText('Peparu', W * 0.2, H * 0.55);
  E('❤️', 0.5, 0.25, 'Jantung'); E('🧍', 0.8, 0.22, 'Tubuh');
  g.strokeStyle = '#e53935'; g.lineWidth = 10; g.beginPath(); g.moveTo(W * 0.3, H * 0.72); g.lineTo(W * 0.7, H * 0.72); g.stroke();
  g.strokeStyle = '#1e88e5'; g.beginPath(); g.moveTo(W * 0.3, H * 0.86); g.lineTo(W * 0.7, H * 0.86); g.stroke();
  g.font = 'bold 30px system-ui'; g.fillStyle = '#c62828'; g.fillText('lebih oksigen', W * 0.5, H * 0.7); g.fillStyle = '#1565c0'; g.fillText('lebih karbon dioksida', W * 0.5, H * 0.84);
}
function L4(S, play) {
  const root = group('L4', table(1.5, 0.95, play));
  const PINS = { peparu: [0.2, 0.3], jantung: [0.5, 0.25], tubuh: [0.8, 0.22] };
  const d = diagramBoard('rajah_darah', { w: 0.9, h: 0.42, draw: drawCirc, pins: PINS, tilt: 0.9 }); d.position.set(0, 0, -0.2); root.add(d);
  const blood = group('darah', mesh(new THREE.SphereGeometry(0.025, 16, 12), M(0xe53935))); blood.position.set(-0.4, 0, 0.3); blood.userData.carryY = 0.25; root.add(home(blood));
  const bt = textSprite('🩸 Darah', { h: 0.026 }); bt.position.set(0, 0.045, 0); blood.add(bt);
  const ROUTE = ['peparu', 'jantung', 'tubuh', 'jantung', 'peparu'];
  let k = 0;
  const pin = id => d.getObjectByName('pin_' + id);
  const dr = dragger(S, () => (k < 5 ? [blood] : []), {
    onDrop(o, x, y) {
      const hit = S.closest(Object.keys(PINS), x, y, id => nearScreen(S, pin(id), x, y, 0, 50), id => pin(id));
      if (!hit) return;
      if (hit !== ROUTE[k]) { S.info(`🤔 ${k < 3 ? 'Darah lebih oksigen' : 'Darah lebih karbon dioksida'}: seterusnya ke <b>${ROUTE[k]}</b>.`); return goHome(S, o); }
      o.position.copy(root.worldToLocal(pin(hit).getWorldPosition(new THREE.Vector3()))); S.evt('route', 'r' + k); k++;
      if (k === 2) o.children[0].material.color.set(0xe53935);
      if (k === 3) { o.children[0].material.color.set(0x5c6bc0); S.info('✅ Darah lebih oksigen: peparu → jantung → <b>tubuh</b>. Kini darah membawa karbon dioksida dari tubuh.'); }
      else if (k === 5) { o.children[0].material.color.set(0xe53935); S.info('✅ Darah lebih karbon dioksida: tubuh → jantung → <b>peparu</b>. Di peparu, karbon dioksida disingkirkan dan oksigen diserap.', 9); }
      else S.info(`➡️ ${hit[0].toUpperCase() + hit.slice(1)}`);
    },
  });
  return { root, view: { w: 1.2, d: 1.45 }, ...dr };
}

// ------------------------------------------------------------ L5 Pelihara setiap sistem
function L5(S, play) {
  const root = group('L5', table(1.8, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.4, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'care', size: 0.09, gap: 0.21, row: 0.3,
    zones: [Z('rangka', '🦴 Rangka', 0xede7f6, -0.63), Z('pernafasan', '👃 Pernafasan', 0xfce4ec, -0.21), Z('peredaran', '❤️ Peredaran darah', 0xe8f5e9, 0.21), Z('pencernaan', '🍎 Pencernaan', 0xe3f2fd, 0.63)],
    items: [['susu', '🥛', 'Makanan kaya kalsium', 'rangka'], ['topi', '⛑️', 'Pakai alat pelindung', 'rangka'], ['rokok', '🚭', 'Hindari rokok', 'pernafasan'], ['tangan', '🧼', 'Kerap basuh tangan', 'pernafasan'],
      ['senam', '🏃', 'Bersenam', 'peredaran'], ['lemak', '🍔', 'Kurangkan lemak dan gula', 'peredaran'], ['sayur', '🥦', 'Makanan berserat', 'pencernaan'], ['air', '💧', 'Minum air secukupnya', 'pencernaan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Amalan ini menjaga sistem yang mana?' })),
    ok: (it, z) => `✅ ${it.label} — menjaga sistem <b>${z.label.slice(2).toLowerCase()}</b>.`,
    onDone: () => setTimeout(() => S.info('💪 Semua sistem saling berkait. Penjagaan semua sistem membantu tubuh berfungsi dengan baik.', 9), 2500),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Sistem rangka', sp: 'SP 2.1.1', make: L1 },
  { id: 'L2', title: 'Fungsi rangka', sp: 'SP 2.1.1 · 2.1.4', make: L2 },
  { id: 'L3', title: 'Sendi dan pergerakan', sp: 'SP 2.1.2 · 2.1.3', make: L3 },
  { id: 'L4', title: 'Laluan darah', sp: 'SP 2.2.1 · 2.2.2', make: L4 },
  { id: 'L5', title: 'Pelihara sistem tubuh', sp: 'SP 2.3.1 – 2.3.3', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 2.</b> Rangka, sendi dan peredaran darah! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
