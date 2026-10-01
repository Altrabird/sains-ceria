// Sains Tahun 6 · Unit 13 Teknologi (SP 13.1.1 – 13.1.3) — tools that overcome human limits, technology in each
// field, good and bad effects, fly a drone to fertilise the crop plots.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Mengatasi had keupayaan manusia
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play));
  const mt = matcher(S, root, [['seni', '🦠', 'Objek sangat seni', 'Mikroskop'], ['jauh', '🪐', 'Objek sangat jauh', 'Teleskop'], ['perlahan', '💓', 'Bunyi sangat perlahan', 'Stetoskop'], ['komunikasi', '👫', 'Rakan di tempat jauh', 'Telefon']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f.toLowerCase()}</b>.` })),
    { type: 'tool', gap: 0.36, onDone: () => setTimeout(() => S.info('💡 Teknologi ialah aplikasi pengetahuan sains untuk mengatasi had keupayaan manusia.', 9), 2500) });
  return { root, view: { w: 1.6, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Teknologi dalam pelbagai bidang
function L2(S, play) {
  const root = group('L2', table(2.0, 0.95, play));
  const Z = (id, label, color, i) => ({ id, label, color, x: -0.76 + i * 0.38, z: -0.18, w: 0.35, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'field', size: 0.09, gap: 0.2, row: 0.3,
    zones: [Z('pertanian', '🌾 Pertanian', 0xdcedc8, 0), Z('perubatan', '🏥 Perubatan', 0xffcdd2, 1), Z('pengangkutan', '🚄 Pengangkutan', 0xbbdefb, 2), Z('komunikasi', '📡 Komunikasi', 0xe1bee7, 3), Z('pembinaan', '🏗️ Pembinaan', 0xffe0b2, 4)],
    items: [['dron', '🚁', 'Dron membaja', 'pertanian'], ['sinar_x', '🦴', 'Mesin sinar-X', 'perubatan'], ['mri', '🧲', 'Mesin MRI', 'perubatan'], ['kapal', '✈️', 'Kapal terbang', 'pengangkutan'],
      ['kereta_api', '🚄', 'Kereta api laju', 'pengangkutan'], ['internet', '🌐', 'Internet', 'komunikasi'], ['pasang_siap', '🏠', 'Kaedah pasang siap', 'pembinaan'], ['kren', '🏗️', 'Kren', 'pembinaan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Dalam bidang manakah teknologi ini membantu manusia?' })),
    ok: (it, z) => `✅ ${it.label} — bidang <b>${z.label.slice(z.label.indexOf(' ') + 1).toLowerCase()}</b>.`,
  });
  return { root, view: { w: 2.0, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Kebaikan dan keburukan
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const dr = sorter(S, root, {
    type: 'effect', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'baik', label: '👍 Kebaikan', color: 0xc8e6c9, x: -0.42, z: -0.18, w: 0.78 }, { id: 'buruk', label: '👎 Keburukan', color: 0xffcdd2, x: 0.42, z: -0.18, w: 0.78 }],
    items: [['masa', '🚁', 'Dron jimat masa dan tenaga', 'baik'], ['ubat', '💊', 'Ubat merawat penyakit', 'baik'], ['kawasan', '🏙️', 'Kawasan baharu dibangunkan', 'baik'], ['pantas', '📱', 'Maklumat dikongsi pantas', 'baik'], ['mudah', '🚗', 'Memudahkan pergerakan', 'baik'],
      ['bateri', '🔋', 'Pelupusan bateri mencemarkan', 'buruk'], ['ketagih', '⚠️', 'Penyalahgunaan ubat', 'buruk'], ['hutan', '🌳', 'Penebangan hutan', 'buruk'], ['data', '🔓', 'Data peribadi diceroboh', 'buruk'], ['asap', '💨', 'Gas kenderaan cemarkan udara', 'buruk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah kesan ini membantu manusia, atau merugikan manusia dan alam?' })),
    ok: (it, z) => z.id === 'baik' ? `👍 ${it.label} — <b>kebaikan</b> teknologi.` : `👎 ${it.label} — <b>keburukan</b> teknologi.`,
    onDone: () => setTimeout(() => S.info('⚖️ Gunakan teknologi secara bijak untuk memaksimumkan kebaikan dan mengurangkan keburukannya.', 9), 2500),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Misi dron pertanian
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const plots = []; for (let i = 0; i < 6; i++) { const p = mesh(new THREE.BoxGeometry(0.24, 0.012, 0.16), M(0xbcaaa4), -0.45 + (i % 3) * 0.3, 0.006, -0.25 + Math.floor(i / 3) * 0.22); p.name = 'petak_' + (i + 1); root.add(p); plots.push(p);
    for (let k = 0; k < 6; k++) { const s = mesh(new THREE.ConeGeometry(0.01, 0.03, 6), M(0x9e9d24), p.position.x - 0.09 + (k % 3) * 0.09, 0.025, p.position.z - 0.04 + Math.floor(k / 3) * 0.08); s.name = 'tanaman'; p.userData.crops = (p.userData.crops || []).concat(s); root.add(s); } }
  const drone = group('dron', mesh(new THREE.BoxGeometry(0.06, 0.02, 0.06), M(0xeceff1, { metalness: 0.4 }), 0, 0, 0));
  const rotors = []; for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { drone.add(mesh(new THREE.BoxGeometry(0.06, 0.005, 0.006), M(0x455a64), x * 0.025, 0, z * 0.025).rotateY(Math.atan2(z, x))); const r = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.003, 16), M(0xe53935, { transparent: true, opacity: 0.6 }), x * 0.045, 0.008, z * 0.045); drone.add(r); rotors.push(r); }
  drone.position.set(0.55, 0.2, 0.3); drone.userData.carryY = 0.18; root.add(home(drone));
  const pad = textSprite('🔋 Stesen dron', { h: 0.028, bg: '#ffffffdd' }); pad.position.set(0.55, 0.04, 0.3); root.add(pad);
  const done = new Set(); let t = 0; const drops = [];
  const dr = dragger(S, () => [drone], {
    onDrag(o) {
      const p = plots.find(p => !done.has(p) && Math.abs(p.position.x - o.position.x) < 0.12 && Math.abs(p.position.z - o.position.z) < 0.08); if (!p) return;
      done.add(p); p.material.color.set(0x6d4c41); p.userData.crops.forEach(c => { c.material.color.set(0x43a047); S.tween(1, k => c.scale.setScalar(1 + k * 0.8)); });
      for (let i = 0; i < 8; i++) { const d = mesh(new THREE.SphereGeometry(0.004, 6, 4), M(0x4fc3f7)); d.position.copy(o.position).add(new THREE.Vector3((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.06)); d.userData.fx = true; root.add(d); drops.push(d); }
      S.evt('spray', p.name); S.info(`💧 Petak ${p.name.slice(6)} dibaja (${done.size}/6).`);
      if (done.size === 6) setTimeout(() => S.info('✅ Dron membantu kerja membaja dan meracun rumpai — menjimatkan masa dan tenaga. Tetapi bateri dron mesti dilupuskan dengan betul supaya tidak mencemarkan alam.', 10), 1200);
    },
    onDrop(o) { goHome(S, o); },
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr,
    update(dt) { t += dt; rotors.forEach(r => (r.rotation.y += dt * 30)); if (dr.held !== drone) drone.position.y = 0.2 + Math.sin(t * 3) * 0.01;
      for (let i = drops.length - 1; i >= 0; i--) { drops[i].position.y -= dt * 0.4; if (drops[i].position.y < 0.02) { root.remove(drops[i]); drops.splice(i, 1); } } } };
}

const LEVELS = [
  { id: 'L1', title: 'Mengatasi had keupayaan', sp: 'SP 13.1.1', make: L1 },
  { id: 'L2', title: 'Teknologi dalam pelbagai bidang', sp: 'SP 13.1.2', make: L2 },
  { id: 'L3', title: 'Kebaikan dan keburukan', sp: 'SP 13.1.3', make: L3 },
  { id: 'L4', title: 'Misi dron pertanian', sp: 'SP 13.1.2 · 13.1.3', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Teknologi',
  intro: '<b>Sains Tahun 6 · Unit 13.</b> Teknologi mengatasi had keupayaan manusia! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
