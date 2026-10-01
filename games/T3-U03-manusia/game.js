// Sains Tahun 3 · Unit 3 Manusia (SP 3.1.1 – 3.3.4) — teeth types + structure, milk vs permanent, tooth care,
// food pyramid, balanced plate, digestion route.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, diagramBoard, labelPins, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ teeth (white, tall)
function tooth(name, kind) {
  const m = M(0xfafafa, { roughness: 0.3 }), g = group(name);
  if (kind === 'kacip') g.add(mesh(new THREE.BoxGeometry(0.05, 0.08, 0.018), m, 0, 0.04, 0), mesh(new THREE.BoxGeometry(0.05, 0.004, 0.006), m, 0, 0.082, 0));
  if (kind === 'taring') g.add(mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.06, 12), m, 0, 0.03, 0), mesh(new THREE.ConeGeometry(0.022, 0.04, 12), m, 0, 0.08, 0));
  if (kind === 'geraham') { g.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), m, 0, 0.03, 0)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(mesh(new THREE.SphereGeometry(0.013, 10, 8), m, x * 0.015, 0.062, z * 0.012)); }
  g.add(mesh(new THREE.BoxGeometry(0.07, 0.02, 0.06), M(0xf48fb1), 0, -0.005, 0));  // gum
  return g;
}

// ------------------------------------------------------------ L1 Jenis gigi dan fungsi
function L1(S, play) {
  const root = group('L1', table(1.4, 0.85, play));
  const T = [['kacip', 'Gigi kacip'], ['taring', 'Gigi taring'], ['geraham', 'Gigi geraham']].map(([k, l], i) => { const t = tooth('gigi_' + k, k); t.scale.setScalar(1.8); t.position.set(-0.35 + i * 0.35, 0.01, -0.18); t.userData.kind = k; root.add(t); const lb = textSprite(l, { h: 0.032 }); lb.position.set(t.position.x, 0.24, -0.18); root.add(lb); return t; });
  const JOBS = [['memotong', '🍪', 'Memotong biskut', 'kacip'], ['mengoyak', '🍗', 'Mengoyakkan daging', 'taring'], ['melumat', '🍚', 'Melumatkan nasi', 'geraham']];
  const cards = JOBS.map(([id, e, l, k], i) => { const c = emojiCard(id, e, l, 0.11, { border: '#00897b' }); c.userData.kind = k; c.position.set(-0.35 + [1, 2, 0][i] * 0.35, 0, 0.27); root.add(home(c)); return c; });
  const dr = dragger(S, () => cards.filter(c => !c.userData.done), {
    onDrop(c, x, y) {
      const t = S.closest(T, x, y, t => nearScreen(S, t, x, y, 0.08, 75) || flat(t.position, c.position) < 0.13);
      if (!t) return goHome(S, c);
      if (t.userData.kind !== c.userData.kind) { S.info('🤔 Gigi itu tidak sesuai untuk kerja itu. Lihat bentuknya.'); return goHome(S, c); }
      c.userData.done = true; moveTo(S, c, t.position.clone().setY(0).add(new THREE.Vector3(0, 0, 0.12)));
      S.evt('job', c.name); S.info(`✅ Gigi ${t.userData.kind} → <b>${JOBS.find(j => j[0] === c.name)[2].toLowerCase()}</b>.`);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Struktur gigi (cross-section diagram)
function drawTooth(g, W, H) {
  g.fillStyle = '#e8d3b0'; g.fillRect(0, H * 0.62, W, H * 0.38);  // jaw bone
  g.fillStyle = '#f48fb1'; g.beginPath(); g.ellipse(W * 0.5, H * 0.6, W * 0.42, H * 0.1, 0, 0, Math.PI * 2); g.fill();  // gum
  const tooth = (r, color) => { g.fillStyle = color; g.beginPath(); g.moveTo(W * (0.5 - r), H * 0.2); g.quadraticCurveTo(W * 0.5, H * (0.2 - r * 0.6), W * (0.5 + r), H * 0.2); g.lineTo(W * (0.5 + r * 0.8), H * 0.62); g.lineTo(W * (0.5 + r * 0.25), H * 0.95); g.lineTo(W * (0.5 - r * 0.25), H * 0.95); g.lineTo(W * (0.5 - r * 0.8), H * 0.62); g.closePath(); g.fill(); };
  tooth(0.28, '#fafafa'); tooth(0.22, '#f3d9a4'); tooth(0.1, '#f8bbd0');
  g.strokeStyle = '#d32f2f'; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.47, H * 0.3); g.lineTo(W * 0.47, H * 0.92); g.stroke();
  g.strokeStyle = '#1565c0'; g.beginPath(); g.moveTo(W * 0.53, H * 0.3); g.lineTo(W * 0.53, H * 0.92); g.stroke();
  g.strokeStyle = '#ffeb3b'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * 0.5, H * 0.28); g.lineTo(W * 0.5, H * 0.92); g.stroke();
}
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const d = diagramBoard('rajah_gigi', { w: 0.42, h: 0.4, draw: drawTooth, pins: { enamel: [0.27, 0.18], dentin: [0.33, 0.4], gusi: [0.12, 0.6], saraf: [0.5, 0.45], salur_darah: [0.47, 0.75] }, tilt: 0.85 });
  d.position.set(0, 0, -0.18); root.add(d);
  const dr = labelPins(S, root, d, [['enamel', 'Enamel'], ['dentin', 'Dentin'], ['gusi', 'Gusi'], ['saraf', 'Saraf'], ['salur_darah', 'Salur darah']], {
    onLabel: id => { S.evt('label', id); S.info({ enamel: '✅ <b>Enamel</b> — lapisan paling luar dan paling keras.', dentin: '✅ <b>Dentin</b> — di bawah enamel.', gusi: '✅ <b>Gusi</b> — memegang gigi.', saraf: '✅ <b>Saraf</b> — merasa sakit, panas dan sejuk.', salur_darah: '✅ <b>Salur darah</b> — membawa makanan kepada gigi.' }[id]); },
  });
  return { root, view: { w: 1.3, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L3 Gigi susu dan gigi kekal
function L3(S, play) {
  const root = group('L3', table(1.6, 0.9, play));
  const dr = sorter(S, root, {
    type: 'teeth', size: 0.085, gap: 0.16, row: 0.3,
    zones: [{ id: 'susu', label: '🍼 Gigi susu', color: 0xe1f5fe, x: -0.38, z: -0.2, w: 0.66, d: 0.34 }, { id: 'kekal', label: '🦷 Gigi kekal', color: 0xfff9c4, x: 0.38, z: -0.2, w: 0.66, d: 0.34 }],
    items: [['b20', '', '20 batang', 'susu'], ['b32', '', '32 batang', 'kekal'], ['nipis', '', 'Enamel nipis', 'susu'], ['tebal', '', 'Enamel tebal', 'kekal'], ['m6b', '', 'Tumbuh: 6 bulan', 'susu'], ['m6t', '', 'Tumbuh: 6 tahun', 'kekal'],
      ['l3t', '', 'Lengkap: 3 tahun', 'susu'], ['l21t', '', 'Lengkap: 21 tahun', 'kekal'], ['pendek', '', 'Jangka hayat pendek', 'susu']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bandingkan gigi susu dan gigi kekal sekali lagi.' })),
    ok: (it, z) => `✅ ${it.label} → <b>gigi ${z.id}</b>. Kedua-duanya mempunyai gigi kacip, taring dan geraham.`,
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L4 Penjagaan kesihatan gigi: brush plaque off, floss, sort habits
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  const t = tooth('gigi', 'geraham'); t.scale.setScalar(2.2); t.position.set(-0.3, 0.03, -0.12); root.add(t);
  const spots = [...Array(7)].map((_, i) => { const p = mesh(new THREE.SphereGeometry(0.008, 8, 6).scale(1, 0.4, 1), M(0x5d4037, { transparent: true, opacity: 1 }), (i % 4 - 1.5) * 0.013, 0.068, (Math.floor(i / 4) - 0.5) * 0.017); p.userData.fx = true; t.add(p); return p; });  // plaque on the crown
  const brush = group('berus_gigi', mesh(new THREE.BoxGeometry(0.16, 0.012, 0.02), M(0x42a5f5), 0, 0.03, 0), mesh(new THREE.BoxGeometry(0.04, 0.02, 0.022), M(0xffffff, { roughness: 1 }), -0.07, 0.015, 0));
  brush.position.set(-0.05, 0, 0.27); brush.userData.carryY = 0.18; root.add(home(brush));
  const bl = textSprite('Berus gigi', { h: 0.026 }); bl.position.set(0, 0.06, 0.03); brush.add(bl);
  let scrub = 0, clean = false;
  const habits = group('tabiat'); root.add(habits); habits.visible = false;
  const brushDr = dragger(S, () => (clean ? [] : [brush]), {
    onDrag(o, dt, prev) {
      if (clean || flat(o.position, t.position) > 0.12) return;
      scrub += flat(o.position, prev); spots.forEach(p => p.material.opacity = Math.max(0, 1 - scrub / 0.8));
      if (scrub >= 0.8) { clean = true; spots.forEach(p => p.visible = false); S.evt('brush', 'gigi'); S.star(t.position.clone().setY(0.35)); goHome(S, brush);
        S.info('🪥 Gigi bersih! Sisa makanan membolehkan kuman membiak dan merosakkan gigi. Sekarang kelaskan tabiat baik dan buruk.', 7); habits.visible = true; }
    },
    onDrop: o => { if (!clean) S.info('🪥 Gosok berus ke kiri dan ke kanan di atas gigi.'); },
  });
  const habitDr = sorter(S, habits, {
    type: 'habit', size: 0.085, gap: 0.19, row: 0.33,
    zones: [{ id: 'baik', label: '😁 Tabiat baik', color: 0xc8e6c9, x: 0.2, z: -0.25, w: 0.38, d: 0.24 }, { id: 'buruk', label: '😖 Merosakkan gigi', color: 0xffcdd2, x: 0.58, z: -0.25, w: 0.3, d: 0.24 }],
    items: [['berus2', '😁', 'Berus gigi 2 kali sehari', 'baik'], ['flos', '🧵', 'Guna flos', 'baik'], ['klinik', '🏥', 'Periksa gigi 6 bulan sekali', 'baik'],
      ['gula', '🍬', 'Kerap makan manis', 'buruk'], ['tak_berus', '😴', 'Tidur tanpa berus gigi', 'buruk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah tabiat ini menjaga atau merosakkan gigi?' })),
    ok: (it, z) => z.id === 'baik' ? `✅ ${it.label} — menjaga kesihatan gigi.` : `⚠️ ${it.label} — boleh merosakkan gigi.`,
  });
  return {
    root, view: { w: 1.5, d: 0.9 },
    pick: (x, y) => (!clean ? brushDr.pick(x, y) : habitDr.pick(x, y)),
    drag: (x, y) => (!clean || brushDr.held ? brushDr.drag(x, y) : habitDr.drag(x, y)),
    drop: (x, y) => (brushDr.held ? brushDr.drop(x, y) : habitDr.drop(x, y)),
  };
}

// ------------------------------------------------------------ L5 Piramid makanan Malaysia
function pyramid() {
  const g = group('piramid'), C = [0xffe082, 0xc5e1a5, 0x90caf9, 0xf8bbd0], N = ['Aras 1: makan secukupnya', 'Aras 2: makan banyak', 'Aras 3: makan sederhana', 'Aras 4: makan sedikit'];
  for (let i = 0; i < 4; i++) {
    const w = 0.7 - i * 0.16, m = mesh(new THREE.BoxGeometry(w, 0.05, 0.12), M(C[i]), 0, 0.025 + i * 0.05, 0); m.name = 'aras_' + (i + 1); g.add(m);
    const l = textSprite(N[i], { h: 0.022, bg: '#ffffffcc' }); l.position.set(w / 2 + 0.12, 0.03 + i * 0.05, 0.06); g.add(l);
  }
  return g;
}
const FOODS = [['nasi', '🍚', 'Nasi', 1], ['roti', '🍞', 'Roti', 1], ['ubi', '🍠', 'Ubi', 1], ['pisang', '🍌', 'Pisang', 2], ['sayur', '🥦', 'Sayur', 2], ['epal', '🍎', 'Epal', 2],
  ['ikan', '🐟', 'Ikan', 3], ['ayam', '🍗', 'Ayam', 3], ['susu', '🥛', 'Susu', 3], ['minyak', '🛢️', 'Minyak', 4], ['gula', '🍬', 'Gula', 4], ['garam', '🧂', 'Garam', 4]];
function L5(S, play) {
  const root = group('L5', table(1.6, 0.95, play));
  const P = pyramid(); P.position.set(-0.15, 0, -0.22); P.scale.setScalar(1.25); root.add(P);
  const order = [7, 2, 10, 4, 0, 9, 5, 11, 1, 6, 3, 8];
  const cards = FOODS.map(([id, e, l, lv], i) => { const c = emojiCard(id, e, l, 0.095, { border: '#ef6c00' }); c.userData.level = lv; c.position.set(-0.66 + order[i] * 0.12, 0, 0.32); root.add(home(c)); return c; });
  const filled = [0, 0, 0, 0, 0];
  const dr = dragger(S, () => cards.filter(c => !c.userData.done), {
    onDrop(c, x, y) {
      const sy = m => { const p = m.getWorldPosition(new THREE.Vector3()); p.y += 0.025; const q = p.project(S.camera); return (1 - q.y) / 2 * innerHeight; };
      const lv = [1, 2, 3, 4].map(i => P.getObjectByName('aras_' + i)).map(m => [m, Math.abs(sy(m) - y)]).sort((a, b) => a[1] - b[1])[0];  // level whose top is nearest the pointer
      const n = +lv[0].name.slice(-1);
      if (n !== c.userData.level) { S.info(`🤔 ${FOODS.find(f => f[0] === c.name)[2]} bukan di aras ${n}. ${['', 'Aras 1 ialah nasi, mi, bijirin dan ubi.', 'Aras 2 ialah buah-buahan dan sayur-sayuran.', 'Aras 3 ialah ikan, ayam, daging, kekacang dan susu.', 'Aras 4 ialah lemak, minyak, garam dan gula.'][c.userData.level]}`); return goHome(S, c); }
      c.userData.done = true; const k = filled[n]++, w = 0.7 - (n - 1) * 0.16;
      moveTo(S, c, P.position.clone().add(new THREE.Vector3(-w / 2 + 0.06 + k * 0.1, 0.05 * n, 0.0))); c.scale.setScalar(0.75);
      S.evt('pyramid', c.name); S.info(`✅ Aras ${n}: <b>${['', 'makan secukupnya', 'makan banyak', 'makan sederhana', 'makan sedikit'][n]}</b>.`);
    },
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L6 Makanan seimbang: build a balanced plate
const PLATE = [['nasi', '🍚', 'Nasi', 'karbohidrat'], ['ikan', '🐟', 'Ikan', 'protein'], ['sayur', '🥦', 'Sayur', 'pelawas'], ['tembikai', '🍉', 'Tembikai', 'vitamin'], ['air', '🥛', 'Air kosong', 'air'],
  ['goreng', '🍟', 'Kentang goreng', 'lemak'], ['kek', '🍰', 'Kek manis', 'gula'], ['gula_gula', '🍭', 'Gula-gula', 'gula']];
function L6(S, play) {
  const root = group('L6', table(1.5, 0.9, play));
  const plate = group('pinggan', mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.015, 40), M(0xfafafa), 0, 0.008, 0), mesh(new THREE.TorusGeometry(0.19, 0.008, 8, 40), M(0x90caf9), 0, 0.016, 0).rotateX(Math.PI / 2));
  plate.position.set(-0.2, 0, -0.15); root.add(plate);
  const kid_ = emojiSprite('🙂', 0.12); kid_.position.set(0.35, 0.18, -0.2); root.add(kid_);
  const cards = PLATE.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.085, { border: '#43a047' }); c.position.set(-0.55 + [3, 6, 0, 5, 2, 7, 1, 4][i] * 0.15, 0, 0.32); root.add(home(c)); return c; });
  const on = new Set(); let served = false;
  const need = ['karbohidrat', 'protein', 'pelawas', 'vitamin', 'air'];
  const dr = dragger(S, () => cards.filter(c => !on.has(c.name)), {
    onDrop(c) {
      if (flat(c.position, plate.position) > 0.22) return goHome(S, c);
      const it = PLATE.find(p => p[0] === c.name);
      if (['lemak', 'gula'].includes(it[3])) {
        S.info(it[3] === 'lemak' ? '⚠️ Makanan berlemak berlebihan menyebabkan <b>kegemukan</b>. Pilih makanan lain.' : '⚠️ Makanan manis berlebihan menyebabkan <b>kerosakan gigi</b>. Pilih makanan lain.'); return goHome(S, c);
      }
      on.add(c.name); const k = on.size - 1; moveTo(S, c, plate.position.clone().add(new THREE.Vector3(Math.cos(k * 1.25) * 0.1, 0.02, Math.sin(k * 1.25) * 0.08))); c.scale.setScalar(0.7);
      S.evt('plate', c.name); S.info(`✅ ${it[2]} — ${it[3]}.` + (on.size === 5 ? ' 🍽️ Hidangan seimbang mengandungi <b>semua kelas makanan</b> dalam jumlah yang mencukupi!' : ''));
      if (on.size === 5) kid_.material.map = emojiSprite('😋', 0.12).material.map;
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L7 Pencernaan: move the food along the gut
function drawBody(g, W, H) {
  g.fillStyle = '#ffe0b2'; g.beginPath(); g.ellipse(W * 0.5, H * 0.12, W * 0.13, H * 0.1, 0, 0, 7); g.fill();  // head
  g.beginPath(); g.roundRect(W * 0.28, H * 0.22, W * 0.44, H * 0.7, 60); g.fill();  // body
  g.fillStyle = '#e57373'; g.beginPath(); g.ellipse(W * 0.5, H * 0.17, W * 0.04, H * 0.015, 0, 0, 7); g.fill();  // mouth
  g.strokeStyle = '#ef9a9a'; g.lineWidth = 14; g.beginPath(); g.moveTo(W * 0.5, H * 0.19); g.lineTo(W * 0.5, H * 0.38); g.stroke();  // oesophagus
  g.fillStyle = '#ef9a9a'; g.beginPath(); g.ellipse(W * 0.56, H * 0.43, W * 0.1, H * 0.06, 0.4, 0, 7); g.fill();  // stomach
  g.strokeStyle = '#f8bbd0'; g.lineWidth = 16; g.beginPath(); for (let i = 0; i < 7; i++) { const y = H * (0.55 + i * 0.035); g.moveTo(W * 0.36, y); g.bezierCurveTo(W * 0.45, y - 12, W * 0.55, y + 12, W * 0.64, y); } g.stroke();  // intestines
  g.strokeStyle = '#ce93d8'; g.lineWidth = 10; g.beginPath(); g.moveTo(W * 0.5, H * 0.8); g.lineTo(W * 0.5, H * 0.9); g.stroke();
}
const ROUTE = [['mulut', [0.5, 0.17], 'Makanan dihancurkan oleh gigi, lidah dan air liur.'], ['esofagus', [0.5, 0.3], 'Makanan melalui esofagus ke perut.'], ['perut', [0.56, 0.43], 'Makanan menjadi semakin kecil.'], ['usus', [0.5, 0.65], 'Nutrien daripada makanan diserap.'], ['dubur', [0.5, 0.9], 'Makanan yang tidak diperlukan dikeluarkan sebagai tinja.']];
function L7(S, play) {
  const root = group('L7', table(1.4, 0.95, play));
  const d = diagramBoard('badan', { w: 0.34, h: 0.62, draw: drawBody, pins: Object.fromEntries(ROUTE.map(([id, uv]) => [id, uv])), tilt: 1.0 });
  d.position.set(-0.15, 0, -0.2); root.add(d);
  d.traverse(o => o.name.startsWith('pin_') && (o.material = M(0xfdd835, { emissive: 0xfdd835, emissiveIntensity: 0.4 })));
  const bolus = group('makanan', mesh(new THREE.SphereGeometry(0.02, 12, 10), M(0x8d6e63))); bolus.position.set(0.3, 0, 0.25); bolus.userData.carryY = 0.25; root.add(home(bolus));
  const bt = textSprite('🍔 Makanan', { h: 0.026 }); bt.position.set(0, 0.05, 0); bolus.add(bt);
  let next = 0; const BEH = [['perlahan', '🍽️', 'Makan perlahan sambil duduk', true], ['berlari', '🏃', 'Makan sambil berlari', false], ['cepat', '⏩', 'Makan terlalu cepat', false]];
  const choices = BEH.map(([id, e, l, ok], i) => { const c = emojiCard('cara_' + id, e, l, 0.1, { border: '#7e57c2' }); c.userData.ok = ok; c.position.set(0.15 + i * 0.2, 0, -0.1); c.visible = false; root.add(c); return c; });
  const pin = id => d.getObjectByName('pin_' + id);
  const dr = dragger(S, () => (next < 5 ? [bolus] : []), {
    onDrop(o, x, y) {
      const hit = S.closest(ROUTE.map(r => r[0]), x, y, id => pin(id).visible && nearScreen(S, pin(id), x, y, 0, 45), id => pin(id));
      if (!hit) return;
      if (hit !== ROUTE[next][0]) { S.info(`🤔 Makanan bergerak mengikut urutan. Seterusnya: <b>${ROUTE[next][0]}</b>.`); return goHome(S, o); }
      pin(hit).visible = false; o.position.copy(root.worldToLocal(pin(hit).getWorldPosition(new THREE.Vector3())));
      const tag = textSprite(`${next + 1}. ${hit[0].toUpperCase() + hit.slice(1)}`, { h: 0.022, bg: '#fff59dee' }); tag.position.copy(pin(hit).position).add(new THREE.Vector3(0.09, 0, 0.01)); pin(hit).parent.add(tag);
      if (next >= 2) o.scale.setScalar(1 - (next - 1) * 0.2);
      S.evt('digest', hit); S.info(`${next + 1}. <b>${hit[0].toUpperCase() + hit.slice(1)}</b>: ${ROUTE[next][2]}`, 6); next++;
      if (next === 5) { o.visible = false; setTimeout(() => { choices.forEach(c => c.visible = true); S.info('🍔 Pencernaan menghancurkan makanan supaya nutrien boleh diserap. Tuding cara makan yang <b>tidak mengganggu</b> pencernaan.'); }, 2500); }
    },
  });
  return {
    root, view: { w: 1.4, d: 0.95 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, choices.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, choices.filter(c => c.visible)); if (!c) return;
      if (!c.userData.ok) return S.info('⚠️ Perbuatan ini mengganggu pencernaan — boleh menyebabkan <b>tersedak, muntah, tercekik dan sakit perut</b>.');
      S.evt('habit', 'perlahan'); S.star(c.position.clone().setY(0.2)); S.info('✅ Makan perlahan sambil duduk — pencernaan lancar!');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Jenis gigi dan fungsi', sp: 'SP 3.1.1', make: L1 },
  { id: 'L2', title: 'Struktur gigi', sp: 'SP 3.1.2', make: L2 },
  { id: 'L3', title: 'Gigi susu dan gigi kekal', sp: 'SP 3.1.3', make: L3 },
  { id: 'L4', title: 'Penjagaan kesihatan gigi', sp: 'SP 3.1.4 · 3.1.5', make: L4 },
  { id: 'L5', title: 'Piramid makanan', sp: 'SP 3.2.1 – 3.2.3', make: L5 },
  { id: 'L6', title: 'Makanan seimbang', sp: 'SP 3.2.3 – 3.2.5', make: L6 },
  { id: 'L7', title: 'Pencernaan', sp: 'SP 3.3.1 – 3.3.4', make: L7 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia — Gigi, Makanan, Pencernaan',
  intro: '<b>Sains Tahun 3 · Unit 3.</b> Gigi, makanan seimbang dan pencernaan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
