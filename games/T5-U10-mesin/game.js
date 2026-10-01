// Sains Tahun 5 · Unit 10 Mesin (SP 10.1.1 – 10.1.5) — simple machines combined in everyday tools, traits of a
// sustainable tool, improving a rubbish bin (wheels + compartments, then sort the waste), steps to invent.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, sequence, emojiCard, textCard, diagramBoard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Gabungan mesin ringkas
const TOOLS = [
  ['pengokot', 'Pengokot', { tuas: [0.45, 0.25], baji: [0.3, 0.72] }, (g, W, H) => {
    g.fillStyle = '#90a4ae'; g.beginPath(); g.roundRect(W * 0.1, H * 0.62, W * 0.8, H * 0.14, 20); g.fill();
    g.fillStyle = '#1e88e5'; g.beginPath(); g.roundRect(W * 0.12, H * 0.3, W * 0.76, H * 0.22, 30); g.fill(); g.fillStyle = '#eceff1'; g.fillRect(W * 0.22, H * 0.56, W * 0.12, H * 0.05); }],
  ['pengasah', 'Pengasah pensel', { roda_gandar: [0.82, 0.5], baji: [0.42, 0.5] }, (g, W, H) => {
    g.fillStyle = '#e53935'; g.beginPath(); g.roundRect(W * 0.3, H * 0.25, W * 0.4, H * 0.55, 20); g.fill(); g.fillStyle = '#ffca28'; g.fillRect(W * 0.02, H * 0.46, W * 0.3, H * 0.08);
    g.strokeStyle = '#424242'; g.lineWidth = 14; g.beginPath(); g.moveTo(W * 0.7, H * 0.5); g.lineTo(W * 0.85, H * 0.5); g.lineTo(W * 0.85, H * 0.75); g.stroke(); g.fillStyle = '#212121'; g.fillRect(W * 0.82, H * 0.72, W * 0.1, H * 0.08); }],
  ['pemotong', 'Pemotong kuku', { tuas: [0.6, 0.28], baji: [0.15, 0.55] }, (g, W, H) => {
    g.fillStyle = '#b0bec5'; g.beginPath(); g.moveTo(W * 0.08, H * 0.5); g.lineTo(W * 0.9, H * 0.55); g.lineTo(W * 0.9, H * 0.65); g.lineTo(W * 0.08, H * 0.62); g.fill();
    g.fillStyle = '#78909c'; g.beginPath(); g.moveTo(W * 0.2, H * 0.45); g.lineTo(W * 0.9, H * 0.22); g.lineTo(W * 0.92, H * 0.3); g.lineTo(W * 0.22, H * 0.5); g.fill(); }],
  ['jam', 'Jam tangan', { gear: [0.42, 0.45], skru: [0.6, 0.68], roda_gandar: [0.9, 0.5] }, (g, W, H) => {
    g.fillStyle = '#8d6e63'; g.fillRect(W * 0.4, 0, W * 0.2, H); g.fillStyle = '#cfd8dc'; g.beginPath(); g.arc(W * 0.5, H * 0.5, H * 0.36, 0, 7); g.fill();
    g.fillStyle = '#ffb300'; for (const [x, y, r] of [[0.42, 0.45, 0.12], [0.58, 0.38, 0.08]]) { g.beginPath(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, rr = H * r * (i % 2 ? 1 : 0.8); g.lineTo(W * x + Math.cos(a) * rr, H * y + Math.sin(a) * rr); } g.fill(); }
    g.fillStyle = '#546e7a'; g.beginPath(); g.arc(W * 0.6, H * 0.68, H * 0.03, 0, 7); g.fill(); g.fillRect(W * 0.86, H * 0.44, W * 0.06, H * 0.12); }],
];
const PARTS = [['tuas', '🔧', 'Tuas'], ['baji', '🔪', 'Baji'], ['roda_gandar', '🎡', 'Roda dan gandar'], ['gear', '⚙️', 'Gear'], ['skru', '🔩', 'Skru'], ['takal', '🏗️', 'Takal']];
const USE = { pengokot_tuas: 'Tuas menekan kokot', pengokot_baji: 'Kokot (baji) menembusi dan mencantumkan kertas', pengasah_roda_gandar: 'Roda dan gandar memutarkan pengasah', pengasah_baji: 'Baji mengasah mata pensel',
  pemotong_tuas: 'Tuas memudahkan tekanan', pemotong_baji: 'Baji memotong kuku', jam_gear: 'Gear menggerakkan jarum jam', jam_skru: 'Skru mencantumkan bahagian jam', jam_roda_gandar: 'Roda dan gandar melaraskan jarum jam' };
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play));
  const chips = PARTS.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#7e57c2' }); c.position.set(-0.6 + i * 0.24, 0, 0.3); root.add(home(c)); return c; });
  let t = 0, board = null, pins = [], title = null;
  function setup() {
    if (board) root.remove(board); if (title) root.remove(title);
    const [id, label, P, draw] = TOOLS[t];
    board = diagramBoard('alat_' + id, { w: 0.55, h: 0.36, draw, tilt: 0.75, pins: Object.fromEntries(Object.entries(P).map(([k, uv]) => [id + '_' + k, uv])) }); board.position.set(0, 0, -0.2); root.add(board);
    pins = []; board.traverse(o => o.name.startsWith('pin_') && pins.push(o)); pins.forEach(p => p.scale.setScalar(1.5));
    title = textSprite(`${label} (${t + 1}/${TOOLS.length})`, { h: 0.035, bg: '#fff59dee' }); title.position.set(-0.45, 0.03, 0.1); root.add(title);
    S.info(`🔍 ${label}: letakkan mesin ringkas pada setiap titik merah jambu.`);
  }
  setup();
  const dr = dragger(S, () => chips, {
    onDrop(c, x, y) {
      const live = pins.filter(p => p.visible), d = p => { const s = S.screenOf(p); return Math.hypot(s.x - x, s.y - y); };
      const p = live.filter(p => d(p) < 60).sort((a, b) => d(a) - d(b))[0];
      goHome(S, c); if (!p) return;
      const key = p.name.slice(4), want = key.slice(TOOLS[t][0].length + 1);
      if (want !== c.name) return S.info('🤔 Bukan mesin itu. Fikirkan fungsi bahagian ini.');
      p.visible = false; const tag = textSprite(PARTS.find(q => q[0] === want)[2], { h: 0.024, bg: '#c8e6c9ee' }); tag.position.copy(p.position).add(new THREE.Vector3(0, 0, 0.01)); p.parent.add(tag);
      S.evt('part', key); S.info(`✅ ${USE[key]}.`);
      if (pins.every(p => !p.visible)) { t++; if (t < TOOLS.length) setTimeout(setup, 2200); else setTimeout(() => S.info('🛠️ Gabungan mesin ringkas membolehkan alat berfungsi dengan baik dan memudahkan kerja.', 9), 2200); }
    },
  });
  return { root, view: { w: 1.5, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L2 Ciri alat yang lestari
function L2(S, play) {
  const root = group('L2', table(1.7, 0.95, play));
  const dr = sorter(S, root, {
    type: 'trait', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'lestari', label: '🌱 Alat lestari', color: 0xc8e6c9, x: -0.4, z: -0.18, w: 0.74 }, { id: 'tidak', label: '⚠️ Bukan ciri lestari', color: 0xffcdd2, x: 0.4, z: -0.18, w: 0.74 }],
    items: [['bahan', '🧱', 'Bahan sesuai', 'lestari'], ['tahan', '⏳', 'Jangka hayat panjang', 'lestari'], ['senggara', '🔧', 'Mudah diselenggara', 'lestari'], ['murah', '💰', 'Kos rendah', 'lestari'], ['mesra', '🌱', 'Mesra alam', 'lestari'], ['selamat', '⛑️', 'Selamat digunakan', 'lestari'],
      ['rosak', '💔', 'Cepat rosak', 'tidak'], ['mahal', '💸', 'Sangat mahal', 'tidak'], ['cemar', '🏭', 'Mencemarkan alam', 'tidak'], ['bahaya', '⚡', 'Berbahaya', 'tidak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah ciri ini menjadikan alat lebih baik untuk pengguna dan alam?' })),
    ok: (it, z) => z.id === 'lestari' ? `✅ ${it.label} — ciri alat <b>lestari</b>.` : `⚠️ ${it.label} — <b>bukan</b> ciri alat lestari.`,
    onDone: () => setTimeout(() => S.info('⚙️ Penciptaan alat memudahkan dan mempercepat kerja, menjimatkan masa, kos dan tenaga, serta meningkatkan kualiti dan kuantiti produk.', 10), 2500),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Tambah baik tong sampah
function L3(S, play) {
  const root = group('L3', table(1.6, 0.95, play));
  const bin = group('tong', mesh(new THREE.BoxGeometry(0.6, 0.16, 0.22), M(0x43a047), 0, 0.1, 0)); bin.position.set(-0.05, 0, -0.18); root.add(bin);
  const UP = [['roda', '⚙️', 'Pasang roda'], ['pembahagi', '🗂️', 'Bahagikan ruang']];
  const ups = UP.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.1, { border: '#ef6c00' }); c.position.set(0.5, 0, -0.2 + i * 0.22); root.add(home(c)); return c; });
  const RU = [['kitar', '♻️ Kitar semula', 0x1e88e5], ['kompos', '🍂 Kompos', 0x8d6e63], ['sisa', '🗑️ Sisa', 0x616161]];
  const rooms = []; let wheels = false, split = false;
  const WASTE = [['botol', '🧴', 'Botol plastik', 'kitar'], ['tin', '🥫', 'Tin', 'kitar'], ['surat_khabar', '📰', 'Surat khabar', 'kitar'], ['pisang', '🍌', 'Kulit pisang', 'kompos'], ['sayur', '🥬', 'Sisa sayur', 'kompos'], ['tisu', '🧻', 'Tisu kotor', 'sisa']];
  const waste = WASTE.map(([id, e, l, z], i) => { const c = emojiCard(id, e, l, 0.085, { border: '#3a7bd5' }); c.position.set(-0.6 + i * 0.2, 0, 0.3); c.userData.zone = z; c.userData.carryY = 0.2; c.visible = false; root.add(home(c)); return c; });
  const left = () => waste.filter(w => w.visible && !w.userData.done);
  const dr = dragger(S, () => [...ups.filter(u => u.visible), ...left()], {
    onDrop(c) {
      if (ups.includes(c)) {
        if (flat(c.position, bin.position) > 0.35) return goHome(S, c);
        c.visible = false;
        if (c.name === 'roda') { wheels = true; for (const x of [-0.24, 0.24]) for (const z of [-0.11, 0.11]) bin.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), M(0x212121), x, 0.03, z).rotateX(Math.PI / 2)); bin.children[0].position.y = 0.12; S.evt('improve', 'roda'); S.info('✅ Tong sampah <b>beroda</b> — lebih mudah digerakkan.'); }
        else { split = true; RU.forEach(([id, l, col], i) => { const r = mesh(new THREE.BoxGeometry(0.18, 0.01, 0.2), M(col), -0.2 + i * 0.2, 0.21, 0); r.name = 'ruang_' + id; bin.add(r); rooms.push(r); const t = textSprite(l, { h: 0.028, bg: '#ffffffdd' }); t.position.set(-0.2 + i * 0.2, 0.26, 0); bin.add(t); });
          S.evt('improve', 'pembahagi'); S.info('✅ <b>Pembahagian ruang</b> membantu mengasingkan bahan kitar semula dan sisa untuk kompos.'); }
        if (wheels && split) { waste.forEach(w => (w.visible = true)); setTimeout(() => S.info('🗑️ Uji tong baharu: masukkan setiap sampah ke ruang yang betul.'), 1800); }
        return;
      }
      const r = rooms.slice().sort((a, b) => flat(a.getWorldPosition(new THREE.Vector3()), c.getWorldPosition(new THREE.Vector3())) - flat(b.getWorldPosition(new THREE.Vector3()), c.getWorldPosition(new THREE.Vector3())))[0];
      if (!r || flat(r.getWorldPosition(new THREE.Vector3()), c.getWorldPosition(new THREE.Vector3())) > 0.13) return goHome(S, c);
      if (r.name !== 'ruang_' + c.userData.zone) { S.info('🤔 Bolehkah bahan ini dikitar semula, dijadikan kompos, atau hanya sisa?'); return goHome(S, c); }
      c.userData.done = true; c.visible = false; S.evt('waste', c.name); S.info(`✅ ${WASTE.find(w => w[0] === c.name)[2]} → ${RU.find(q => q[0] === c.userData.zone)[1].slice(2).toLowerCase()}.`);
      if (!left().length) setTimeout(() => S.info('🌍 Tong sampah ini lebih lestari — mudah digerakkan dan membantu kitar semula serta kompos.', 9), 2000);
    },
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Langkah mereka cipta
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const dr = sequence(S, root, [['lakar', '✏️ Lakar reka bentuk'], ['label', '🔩 Label bahan dan bahagian'], ['terang', '📋 Terangkan ciri lestari'], ['bentang', '🎤 Bentangkan hasil']].map(([id, l]) => ({ obj: textCard(id, l, 0.26), id, l })), {
    type: 'invent', gap: 0.34, slotW: 0.29, ok: it => `✅ ${it.l.slice(3)}.`,
    onDone: () => setTimeout(() => S.info('💡 Reka cipta yang baik memudahkan kerja, menjimatkan masa, kos dan tenaga, serta mesra alam.', 9), 2200),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Gabungan mesin ringkas', sp: 'SP 10.1.1 – 10.1.3', make: L1 },
  { id: 'L2', title: 'Ciri alat yang lestari', sp: 'SP 10.1.4', make: L2 },
  { id: 'L3', title: 'Tambah baik tong sampah', sp: 'SP 10.1.4', make: L3 },
  { id: 'L4', title: 'Langkah mereka cipta', sp: 'SP 10.1.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Mesin (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 10.</b> Gabungan mesin ringkas dan reka cipta lestari! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
