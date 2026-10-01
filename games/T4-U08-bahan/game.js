// Sains Tahun 4 · Unit 8 Bahan (SP 8.1.1 – 8.2.4) — sources of materials, a three-station property lab,
// light/heat/elasticity, choose the material for the job, invention steps.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, sequence, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Sumber asas bahan
function L1(S, play) {
  const root = group('L1', table(1.7, 0.95, play));
  const Z = (id, label, color, i) => ({ id, label, color, x: -0.6 + i * 0.4, z: -0.22, w: 0.36, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'source', size: 0.085, gap: 0.145, row: 0.32, w: 1.7,
    zones: [Z('tumbuhan', '🌳 Tumbuh-tumbuhan', 0xc8e6c9, 0), Z('haiwan', '🐑 Haiwan', 0xffe0b2, 1), Z('petroleum', '🛢️ Petroleum', 0xcfd8dc, 2), Z('batuan', '⛰️ Batuan', 0xd7ccc8, 3)],
    items: [['tayar', '⚫', 'Tayar getah', 'tumbuhan'], ['kerusi', '🪑', 'Kerusi kayu', 'tumbuhan'], ['tuala', '🧺', 'Tuala kapas', 'tumbuhan'], ['sweater', '🧥', 'Sweater bulu', 'haiwan'],
      ['kasut', '👞', 'Kasut kulit', 'haiwan'], ['tali_leher', '👔', 'Tali leher sutera', 'haiwan'], ['beg_plastik', '🛍️', 'Beg plastik', 'petroleum'], ['baju_hujan', '☔', 'Baju hujan', 'petroleum'],
      ['rantai', '💍', 'Rantai emas', 'batuan'], ['mangkuk', '🥣', 'Mangkuk seramik', 'batuan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Daripada manakah bahan ${label.toLowerCase()} berasal?` })),
    ok: (it, z) => `✅ ${it.label} — bahan daripada <b>${z.label.replace(/^\S+ /, '').toLowerCase()}</b>.`,
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Makmal sifat bahan: three test stations
const MAT = { kain_kapas: ['Kain kapas', 0xfff8e1, { serap: true, apung: false, elektrik: false }], plastik: ['Plastik', 0x90caf9, { serap: false, apung: true, elektrik: false }],
  kayu_aiskrim: ['Batang aiskrim kayu', 0xd7a86e, { serap: true, apung: true, elektrik: false }], kunci: ['Kunci', 0xb0bec5, { serap: false, apung: false, elektrik: true }], syiling: ['Duit syiling', 0xd4af37, { serap: false, apung: false, elektrik: true }] };
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const ST = [['serap', '💧 Titis air', 0xe3f2fd], ['apung', '🌊 Bekas air', 0x81d4fa], ['elektrik', '💡 Litar elektrik', 0xfff9c4]];
  const stations = ST.map(([id, l, c], i) => { const s = group('stesen_' + id, mesh(new THREE.BoxGeometry(0.3, 0.02, 0.24), M(c), 0, 0.01, 0)); s.position.set(-0.45 + i * 0.45, 0, -0.2); root.add(s); const t = textSprite(l, { h: 0.034 }); t.position.set(0, 0.05, -0.15); s.add(t); s.userData.id = id; return s; });
  const samples = Object.entries(MAT).map(([id, [l, c]], i) => { const o = group(id, mesh(new THREE.BoxGeometry(0.07, 0.012, 0.05), M(c, { metalness: id === 'kunci' || id === 'syiling' ? 0.7 : 0 }), 0, 0.006, 0)); o.position.set(-0.5 + i * 0.25, 0, 0.3); o.userData.carryY = 0.03; const t = textSprite(l, { h: 0.024 }); t.position.set(0, 0.03, 0.05); o.add(t); root.add(home(o)); return o; });
  const tc = document.createElement('canvas'); tc.width = 560; tc.height = 250; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 560, 250); tg.fillStyle = '#2b2340'; tg.font = 'bold 20px system-ui'; ['Bahan', 'Air', 'Dalam air', 'Elektrik'].forEach((h, i) => tg.fillText(h, 10 + i * 135, 26));
    tg.font = '19px system-ui'; Object.entries(MAT).forEach(([id, [l, , p]], r) => { const y = 64 + r * 38; tg.fillText(l.replace('Batang aiskrim kayu', 'Kayu aiskrim'), 10, y); const R = res[id] || {};
      if ('serap' in R) tg.fillText(p.serap ? 'Menyerap' : 'Kalis air', 145, y); if ('apung' in R) tg.fillText(p.apung ? 'Terapung' : 'Tenggelam', 280, y); if ('elektrik' in R) tg.fillText(p.elektrik ? 'Konduktor' : 'Penebat', 415, y); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.5, 0.22), new THREE.MeshBasicMaterial({ map: tt }), 0.0, 0.004, 0.08); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  let tests = 0;
  const dr = dragger(S, () => samples, {
    onDrop(o) {
      const s = stations.find(s => flat(s.position, o.position) < 0.17);
      if (!s) return goHome(S, o);
      const [l, , p] = MAT[o.name], k = s.userData.id, r = (res[o.name] ||= {});
      if (!(k in r)) { r[k] = true; tests++; draw(); S.evt('test', o.name + '_' + k); }
      const fx = emojiSprite({ serap: p.serap ? '💦' : '💧', apung: p.apung ? '🛟' : '⚓', elektrik: p.elektrik ? '💡' : '⚫' }[k], 0.07); fx.position.copy(s.position).setY(0.12); root.add(fx); setTimeout(() => root.remove(fx), 1500);
      S.info({ serap: p.serap ? `💦 ${l} <b>menyerap air</b>.` : `💧 ${l} <b>kalis air</b> — titisan tidak diserap.`, apung: p.apung ? `🛟 ${l} <b>terapung</b>.` : `⚓ ${l} <b>tenggelam</b>.`, elektrik: p.elektrik ? `💡 Mentol menyala — ${l} <b>konduktor elektrik</b>.` : `⚫ Mentol tidak menyala — ${l} <b>penebat elektrik</b>.` }[k]);
      goHome(S, o);
    },
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Cahaya, haba, kenyal
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const mt = matcher(S, root, [
    { id: 'kaca', target: ['🪟', 'Sisip kaca'], card: ['', 'Pandangan jelas'] },
    { id: 'surih', target: ['📄', 'Kertas surih'], card: ['', 'Pandangan kurang jelas'] },
    { id: 'berwarna', target: ['🟪', 'Kertas berwarna'], card: ['', 'Objek tidak kelihatan'] },
    { id: 'logam', target: ['🥄', 'Sudu logam'], card: ['', 'Konduktor haba'], ok: '✅ Logam mengalirkan haba dengan baik — <b>konduktor haba</b>.' },
    { id: 'kayu', target: ['🥢', 'Sudu kayu'], card: ['', 'Penebat haba'], ok: '✅ Kayu tidak membenarkan haba mengalir dengan baik — <b>penebat haba</b>.' },
    { id: 'getah', target: ['🎈', 'Gelang getah, belon'], card: ['', 'Kenyal'], ok: '✅ Bahan <b>kenyal</b> kembali ke keadaan asal selepas ditarik, dipicit atau diregangkan.' },
  ], { type: 'property', gap: 0.27, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.7, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Pilih bahan mengikut kegunaan
const JOBS = [['periuk', '🍲', 'Periuk untuk memasak', [['logam', 'Logam', true], ['plastik', 'Plastik', false], ['kertas', 'Kertas', false]], 'Periuk logam mengalirkan haba dengan baik untuk memasak.'],
  ['kain_lap', '🧽', 'Kain untuk mengelap tumpahan', [['plastik', 'Plastik', false], ['kapas', 'Kain kapas', true], ['kaca', 'Kaca', false]], 'Kain kapas menyerap air untuk mengelap tumpahan.'],
  ['kereta', '🚗', 'Penggerak model kereta mainan', [['kayu', 'Batang kayu', false], ['getah', 'Gelang getah', true], ['kaca', 'Kaca', false]], 'Gelang getah yang kenyal digunakan pada model kereta mainan.'],
  ['tingkap', '🪟', 'Tingkap supaya cahaya masuk', [['kaca', 'Kaca', true], ['kayu', 'Kayu', false], ['logam', 'Logam', false]], 'Kaca membenarkan cahaya menembusinya.']];
function L4(S, play) {
  const root = group('L4', table(1.4, 0.9, play));
  let r = 0, cur = [];
  function setup() {
    cur.forEach(c => root.remove(c)); cur = [];
    const [id, e, l, opts] = JOBS[r];
    const q = emojiCard('kegunaan_' + id, e, l, 0.16); q.position.set(0, 0, -0.2); root.add(q); cur.push(q);
    opts.forEach(([oid, ol, ok], i) => { const c = textCard('bahan_' + oid, ol, 0.3); c.userData.ok = ok; c.position.set(-0.36 + i * 0.36, 0, 0.27); root.add(c); cur.push(c); });
    S.info(`🧰 Pilih bahan yang paling sesuai (${r + 1}/4).`);
  }
  setup();
  return {
    root, view: { w: 1.4, d: 0.9 },
    hit: (x, y) => S.hitTest(x, y, cur.slice(1))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, cur.slice(1)); if (!c || r >= JOBS.length) return;
      if (!c.userData.ok) return S.info('🤔 Fikir tentang sifat bahan itu. Adakah ia sesuai untuk kegunaan ini?');
      S.evt('choose', JOBS[r][0]); S.star(c.position.clone().setY(0.2)); S.info('✅ ' + JOBS[r][4], 6); r++; if (r < JOBS.length) setTimeout(setup, 2600);
    },
  };
}

// ------------------------------------------------------------ L5 Mereka cipta objek
function L5(S, play) {
  const root = group('L5', table(1.6, 0.85, play));
  const dr = sequence(S, root, [['masalah', '❓', 'Kenal pasti masalah'], ['idea', '💡', 'Cetuskan idea'], ['lakar', '✏️', 'Lakarkan reka bentuk'], ['alat', '✂️', 'Sediakan alat dan bahan'], ['bina', '🚗', 'Bina objek']]
    .map(([id, e, l]) => ({ obj: emojiCard(id, e, l, 0.12, { border: '#7e57c2' }), label: '' })), {
    type: 'invent', gap: 0.29, slotW: 0.22, hint: n => `🤔 Langkah ${n + 1}: ${n ? 'apakah langkah seterusnya?' : 'mulakan dengan memahami masalah.'}`,
    onDone: () => S.info('🚗 Model kereta mainan siap! Pilih bahan mengikut sifat dan kegunaannya.', 8),
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Sumber asas bahan', sp: 'SP 8.1.1 – 8.1.3', make: L1 },
  { id: 'L2', title: 'Makmal sifat bahan', sp: 'SP 8.2.1', make: L2 },
  { id: 'L3', title: 'Cahaya, haba dan kenyal', sp: 'SP 8.2.1 · 8.2.2', make: L3 },
  { id: 'L4', title: 'Pilih bahan mengikut kegunaan', sp: 'SP 8.2.3', make: L4 },
  { id: 'L5', title: 'Mereka cipta objek', sp: 'SP 8.2.4', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bahan',
  intro: '<b>Sains Tahun 4 · Unit 8.</b> Dari mana bahan datang dan apakah sifatnya? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
