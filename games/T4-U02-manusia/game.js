// Sains Tahun 4 · Unit 2 Manusia (SP 2.1.1 – 2.3.5) — breathing route, gas exchange, breathing rate experiment,
// clean vs polluted air, excretion, stimulus and response.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sorter, matcher, emojiCard, textCard, diagramBoard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

function drawChest(g, W, H) {
  g.fillStyle = '#ffe0b2'; g.beginPath(); g.ellipse(W * 0.5, H * 0.13, W * 0.16, H * 0.11, 0, 0, 7); g.fill(); g.beginPath(); g.roundRect(W * 0.18, H * 0.26, W * 0.64, H * 0.72, 70); g.fill();
  g.fillStyle = '#f48fb1'; g.beginPath(); g.ellipse(W * 0.5, H * 0.14, W * 0.035, H * 0.03, 0, 0, 7); g.fill();  // nose
  g.strokeStyle = '#90a4ae'; g.lineWidth = 16; g.beginPath(); g.moveTo(W * 0.5, H * 0.2); g.lineTo(W * 0.5, H * 0.46); g.stroke();  // trachea
  g.fillStyle = '#ef9a9a'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W * (0.5 + s * 0.15), H * 0.62, W * 0.12, H * 0.2, 0, 0, 7); g.fill(); }
}

// ------------------------------------------------------------ L1 Organ pernafasan: route in and out
function L1(S, play) {
  const root = group('L1', table(1.3, 0.9, play));
  const PINS = { hidung: [0.5, 0.14], trakea: [0.5, 0.34], peparu: [0.35, 0.62] };
  const d = diagramBoard('badan', { w: 0.34, h: 0.55, draw: drawChest, pins: PINS, tilt: 1.0 }); d.position.set(-0.15, 0, -0.2); root.add(d);
  d.traverse(o => o.name.startsWith('pin_') && (o.material = M(0x4fc3f7, { emissive: 0x4fc3f7, emissiveIntensity: 0.4 })));
  const air = group('udara', mesh(new THREE.SphereGeometry(0.02, 12, 10), M(0x81d4fa, { transparent: true, opacity: 0.8 }))); air.position.set(0.3, 0, 0.25); air.userData.carryY = 0.25; root.add(home(air));
  const at = textSprite('💨 Udara', { h: 0.026 }); at.position.set(0, 0.04, 0); air.add(at);
  const ROUTE = ['hidung', 'trakea', 'peparu', 'trakea', 'hidung'];
  let k = 0;
  const pin = id => d.getObjectByName('pin_' + id);
  const dr = dragger(S, () => (k < 5 ? [air] : []), {
    onDrop(o, x, y) {
      const hit = S.closest(Object.keys(PINS), x, y, id => nearScreen(S, pin(id), x, y, 0, 45), id => pin(id));
      if (!hit) return;
      if (hit !== ROUTE[k]) { S.info(`🤔 ${k < 3 ? 'Menarik nafas' : 'Menghembus nafas'}: seterusnya <b>${ROUTE[k]}</b>.`); return goHome(S, o); }
      o.position.copy(root.worldToLocal(pin(hit).getWorldPosition(new THREE.Vector3()))); S.evt('route', 'r' + k); k++;
      if (k === 3) S.info('✅ Menarik nafas: hidung → trakea → <b>peparu</b>. Sekarang hembus nafas keluar.');
      else if (k === 5) S.info('✅ Menghembus nafas: peparu → trakea → hidung. <b>Peparu</b> ialah organ pernafasan manusia.', 8);
      else S.info(`➡️ ${hit[0].toUpperCase() + hit.slice(1)}`);
    },
  });
  return { root, view: { w: 1.2, d: 1.35 }, ...dr };
}

// ------------------------------------------------------------ L2 Pertukaran gas + kandungan udara
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const mt = matcher(S, root, [
    { id: 'masuk', target: ['⬅️', 'Masuk ke peparu'], card: ['', 'Oksigen'], ok: '✅ <b>Oksigen</b> masuk ke dalam peparu.' },
    { id: 'keluar', target: ['➡️', 'Keluar dari peparu'], card: ['', 'Karbon dioksida'], ok: '✅ <b>Karbon dioksida</b> keluar dari peparu. Pertukaran gas berlaku di peparu.' },
    { id: 'disedut', target: ['👃', 'Udara disedut masuk'], card: ['', 'Lebih oksigen'], ok: '✅ Udara disedut masuk mengandungi <b>lebih oksigen</b>.' },
    { id: 'dihembus', target: ['💨', 'Udara dihembus keluar'], card: ['', 'Lebih karbon dioksida'], ok: '✅ Udara dihembus keluar mengandungi <b>lebih karbon dioksida</b>.' },
  ], { type: 'gas', gap: 0.32 });
  return { root, view: { w: 1.4, d: 0.85 }, ...mt };
}

// ------------------------------------------------------------ L3 Kadar pernafasan: activity vs breaths per minute
const ACT = [['berehat', '🪑', 'Berehat', 18], ['berjalan', '🚶', 'Berjalan', 28], ['berlari', '🏃', 'Berlari', 45]];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const boy = kid('murid', { shirt: 0x42a5f5 }); boy.scale.setScalar(1.8); boy.position.set(-0.3, 0, -0.18); root.add(boy);
  const chest = boy.children[3];
  const cards = ACT.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.1, { border: '#43a047' }); c.position.set(0.1 + i * 0.2, 0, -0.15); root.add(c); return c; });
  const watch = textSprite('⏱️ 0 kali/minit', { h: 0.04, bg: '#fff59dee' }); watch.position.set(-0.3, 0.45, -0.18); root.add(watch);
  const tc = document.createElement('canvas'); tc.width = 380; tc.height = 170; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 380, 170); tg.fillStyle = '#2b2340'; tg.font = 'bold 20px system-ui'; tg.fillText('Aktiviti', 14, 28); tg.fillText('Kadar pernafasan', 170, 28);
    tg.font = '22px system-ui'; ACT.forEach(([id, , l, r], i) => { tg.fillText(l, 14, 70 + i * 36); if (res[id]) tg.fillText(r + ' kali/minit', 170, 70 + i * 36); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.36, 0.16), new THREE.MeshBasicMaterial({ map: tt }), 0.3, 0.004, 0.12); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  const concl = [textCard('pilih_betul', 'Semakin cergas aktiviti, semakin bertambah kadar pernafasan.', 0.4), textCard('pilih_salah', 'Kadar pernafasan sama bagi semua aktiviti.', 0.4)];
  concl.forEach((c, i) => { c.userData.ok = !i; c.position.set(-0.22 + i * 0.44, 0, 0.32); c.visible = false; root.add(c); });
  let rate = 0, t = 0, busy = false, shown = 0, chosen = false;
  let wSprite = watch; const setW = n => { root.remove(wSprite); wSprite = textSprite(`⏱️ ${n} kali/minit`, { h: 0.04, bg: '#fff59dee' }); wSprite.position.set(-0.3, 0.45, -0.18); root.add(wSprite); };
  return {
    root, view: { w: 1.4, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, [...cards, ...concl.filter(c => c.visible)])?.name ?? null,
    async tap(x, y) {
      const c = S.hitTest(x, y, [...cards, ...concl.filter(c => c.visible)]); if (!c || busy) return;
      if (concl.includes(c)) { if (chosen) return; if (!c.userData.ok) return S.info('🤔 Lihat jadual: kadar pernafasan berbeza.'); chosen = true; S.evt('conclude', 'cergas'); return S.info('✅ <b>Semakin cergas aktiviti, semakin bertambah kadar pernafasan.</b> Dimanipulasi: jenis aktiviti. Bergerak balas: kadar pernafasan.', 10); }
      const a = ACT.find(a => a[0] === c.name); if (res[a[0]]) return;
      busy = true; rate = a[3]; S.info(`${a[1]} ${a[2]} seminit… kira pergerakan dada naik dan turun.`);
      await S.tween(2.5, k => setW(Math.round(a[3] * k)));
      res[a[0]] = true; draw(); busy = false; S.evt('rate', a[0]);
      if (Object.keys(res).length === 3) { concl.forEach(k => k.visible = true); S.info('📋 Bandingkan data. Apakah kesimpulannya?'); }
    },
    update(dt) { t += dt; const s = 1 + Math.sin(t * Math.max(1, rate) / 60 * Math.PI * 2 * 3) * 0.08; chest.scale.set(s, 1, s); },
  };
}

// ------------------------------------------------------------ L4 Persekitaran dan pernafasan
function L4(S, play) {
  const root = group('L4', table(1.6, 0.85, play));
  const dr = sorter(S, root, {
    type: 'air', size: 0.1, gap: 0.19,
    zones: [{ id: 'bersih', label: '✅ Udara bersih', color: 0xc8e6c9, x: -0.38, z: -0.18, w: 0.66 }, { id: 'tercemar', label: '❌ Udara tercemar', color: 0xcfd8dc, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['taman', '🏞️', 'Taman rekreasi', 'bersih'], ['hutan', '🌳', 'Kawasan hutan', 'bersih'], ['pantai', '🏖️', 'Pantai', 'bersih'], ['rokok', '🚬', 'Asap rokok', 'tercemar'], ['sampah', '🔥', 'Pembakaran sampah', 'tercemar'], ['jerebu', '🌫️', 'Jerebu', 'tercemar'], ['kilang', '🏭', 'Asap kilang', 'tercemar']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah udara di situ bersih atau tercemar?' })),
    ok: (it, z) => z.id === 'bersih' ? `✅ ${it.label}: udara bersih membantu kita bernafas dengan lebih baik. Bersenamlah di sini!` : `⚠️ ${it.label}: udara tercemar — elakkan untuk menjaga kesihatan peparu.`,
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L5 Perkumuhan dan penyahtinjaan
function L5(S, play) {
  const root = group('L5', table(1.5, 0.85, play));
  const mt = matcher(S, root, [
    { id: 'ginjal', target: ['', 'Ginjal'], card: ['💧', 'Air kencing'], ok: '✅ <b>Ginjal</b> menyingkirkan air kencing. (Perkumuhan)' },
    { id: 'kulit', target: ['✋', 'Kulit'], card: ['💦', 'Peluh'], ok: '✅ <b>Kulit</b> merembeskan peluh. (Perkumuhan)' },
    { id: 'peparu', target: ['', 'Peparu'], card: ['💨', 'Karbon dioksida dan wap air'], ok: '✅ <b>Peparu</b> membebaskan karbon dioksida dan wap air. (Perkumuhan)' },
    { id: 'dubur', target: ['', 'Dubur'], card: ['🟤', 'Tinja'], ok: '✅ Tinja disingkirkan melalui <b>dubur</b>. (Penyahtinjaan)' },
  ], { type: 'excrete', gap: 0.32, onDone: () => S.info('🩺 Perkumuhan dan penyahtinjaan menyingkirkan bahan buangan dari badan untuk <b>mengelakkan penyakit</b>. Tinja yang keras boleh menyebabkan sembelit.', 10) });
  return { root, view: { w: 1.5, d: 0.85 }, ...mt };
}

// ------------------------------------------------------------ L6 Gerak balas terhadap rangsangan
function L6(S, play) {
  const root = group('L6', table(1.6, 0.9, play));
  const habits = [['arak', '🍾', 'Meminum arak'], ['gam', '🧴', 'Menghidu gam'], ['dadah', '💊', 'Menyalahgunakan dadah'], ['senaman', '🤸', 'Bersenam']];
  const hc = habits.map(([id, e, l], i) => { const c = emojiCard('tabiat_' + id, e, l, 0.09, { border: '#e53935' }); c.userData.bad = id !== 'senaman'; c.position.set(-0.45 + i * 0.3, 0, 0.0); c.visible = false; root.add(c); return c; });
  const marked = new Set();
  const mt = matcher(S, root, [
    { id: 'duri', target: ['🌵', 'Tersentuh duri'], card: ['✋', 'Tangan terangkat'] },
    { id: 'petir', target: ['⚡', 'Bunyi petir'], card: ['😱', 'Terkejut'] },
    { id: 'cahaya', target: ['☀️', 'Cahaya terang'], card: ['😑', 'Mata terpejam'] },
    { id: 'sejuk', target: ['❄️', 'Kesejukan'], card: ['🥶', 'Badan menggigil'] },
    { id: 'siren', target: ['🚑', 'Bunyi siren ambulans'], card: ['🚗', 'Beri laluan'] },
  ], { type: 'response', gap: 0.3, targetZ: -0.3, rowZ: 0.3, onDone: () => { hc.forEach(c => c.visible = true); S.info('🧠 Gerak balas mengelakkan kecederaan dan menyelamatkan diri. Tuding <b>tabiat yang mengganggu</b> gerak balas.', 8); } });
  return {
    root, view: { w: 1.6, d: 0.9 }, ...mt,
    hit: (x, y) => S.hitTest(x, y, hc.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, hc.filter(c => c.visible)); if (!c) return;
      if (!c.userData.bad) return S.info('💪 Bersenam baik untuk kesihatan — tidak mengganggu gerak balas.');
      if (!marked.has(c.name)) { marked.add(c.name); const x = emojiSprite('🚫', 0.07); x.position.set(0, 0.1, 0.02); c.add(x); S.evt('habit', c.name); }
      S.info('🚫 Tabiat ini boleh menyebabkan mabuk, berkhayal dan ketagih. Organ deria terganggu dan <b>gerak balas menjadi lambat</b>.');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Organ pernafasan', sp: 'SP 2.1.1 · 2.1.2', make: L1 },
  { id: 'L2', title: 'Pertukaran gas', sp: 'SP 2.1.3 · 2.1.4', make: L2 },
  { id: 'L3', title: 'Kadar pernafasan', sp: 'SP 2.1.5', make: L3 },
  { id: 'L4', title: 'Persekitaran dan pernafasan', sp: 'SP 2.1.6', make: L4 },
  { id: 'L5', title: 'Perkumuhan dan penyahtinjaan', sp: 'SP 2.2.1 – 2.2.4', make: L5 },
  { id: 'L6', title: 'Gerak balas terhadap rangsangan', sp: 'SP 2.3.1 – 2.3.5', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia — Pernafasan, Perkumuhan, Gerak Balas',
  intro: '<b>Sains Tahun 4 · Unit 2.</b> Bagaimana badan kita bernafas, menyingkir bahan buangan dan bergerak balas? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
