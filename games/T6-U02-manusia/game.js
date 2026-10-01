// Sains Tahun 6 · Unit 2 Manusia (SP 2.1.1 – 2.2.5) — reproductive organs and functions, fertilisation to birth,
// nerve signal route (peripheral → spinal cord → brain → back), voluntary / involuntary / reflex, caring for nerves.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, sequence, emojiCard, textCard, diagramBoard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Organ pembiakan dan fungsinya
function L1(S, play) {
  const root = group('L1', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['testis', '♂️', 'Testis', 'Menghasilkan sperma'], ['zakar', '♂️', 'Zakar', 'Menyalurkan sperma'], ['ovari', '♀️', 'Ovari', 'Menghasilkan ovum'],
    ['fallopio', '♀️', 'Tiub Fallopio', 'Tempat persenyawaan'], ['uterus', '♀️', 'Uterus (rahim)', 'Tempat embrio berkembang'], ['faraj', '♀️', 'Faraj', 'Saluran menerima sperma']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.toLowerCase()}</b>.` })), { type: 'organ', gap: 0.3, targetZ: -0.22, rowZ: 0.3 });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Persenyawaan hingga kelahiran
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const ST = [['persenyawaan', '⚪', 'Sperma + ovum', 'Persenyawaan: sperma bercantum dengan ovum di tiub Fallopio'], ['zigot', '🔵', 'Zigot', 'Ovum yang disenyawakan membentuk zigot'], ['embrio', '🟣', 'Embrio', 'Zigot membahagi dan membentuk embrio'],
    ['fetus', '🤰', 'Fetus', 'Embrio berkembang di dalam uterus menjadi fetus'], ['bayi', '👶', 'Bayi', 'Selepas kira-kira sembilan bulan, bayi dilahirkan']];
  const dr = sequence(S, root, ST.map(([id, e, l, m]) => ({ obj: emojiCard(id, e, l, 0.12, { border: '#ec407a' }), m })), {
    type: 'stage', gap: 0.32, slotW: 0.22, ok: it => `✅ ${it.m}.`, hint: n => n ? '🤔 Apakah peringkat seterusnya?' : '🤔 Mula dengan percantuman sperma dan ovum.',
    onDone: () => setTimeout(() => S.info('👪 Pembiakan menambah bilangan individu baharu dan memastikan kemandirian spesies manusia.', 9), 2200),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Laluan isyarat saraf
function drawNerves(g, W, H) {
  const X = u => u * W, Y = v => v * H;
  g.fillStyle = '#ffe0b2'; g.beginPath(); g.ellipse(X(0.5), Y(0.1), W * 0.12, H * 0.08, 0, 0, 7); g.fill(); g.beginPath(); g.roundRect(X(0.3), Y(0.19), W * 0.4, H * 0.42, 40); g.fill();
  g.lineCap = 'round'; g.strokeStyle = '#ffe0b2'; g.lineWidth = W * 0.09; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X(0.5 + s * 0.17), Y(0.24)); g.lineTo(X(0.5 + s * 0.38), Y(0.55)); g.stroke(); g.beginPath(); g.moveTo(X(0.5 + s * 0.1), Y(0.58)); g.lineTo(X(0.5 + s * 0.13), Y(0.97)); g.stroke(); }
  g.fillStyle = '#f48fb1'; g.beginPath(); g.ellipse(X(0.5), Y(0.08), W * 0.08, H * 0.05, 0, 0, 7); g.fill();
  g.strokeStyle = '#fbc02d'; g.lineWidth = 9; g.beginPath(); g.moveTo(X(0.5), Y(0.12)); g.lineTo(X(0.5), Y(0.58)); g.stroke();
  g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X(0.5), Y(0.24)); g.lineTo(X(0.5 + s * 0.38), Y(0.55)); g.stroke(); g.beginPath(); g.moveTo(X(0.5), Y(0.56)); g.lineTo(X(0.5 + s * 0.13), Y(0.97)); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(X(0.5), Y(0.28 + i * 0.07)); g.lineTo(X(0.5 + s * 0.15), Y(0.3 + i * 0.07)); g.stroke(); } }
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.95, play));
  const PINS = { otak: [0.5, 0.08], saraf_tunjang: [0.5, 0.4], tangan: [0.86, 0.54] };
  const d = diagramBoard('badan', { w: 0.44, h: 0.74, draw: drawNerves, pins: PINS, tilt: 1.0 }); d.position.set(-0.15, 0, -0.2); root.add(d);
  d.traverse(o => o.name.startsWith('pin_') && (o.material = M(0xfbc02d, { emissive: 0xfbc02d, emissiveIntensity: 0.5 })));
  const lbl = { otak: 'Otak', saraf_tunjang: 'Saraf tunjang', tangan: 'Tangan (saraf periferi)' };
  for (const [id, [u, v]] of Object.entries(PINS)) { const t = textSprite(lbl[id], { h: 0.03, bg: '#ffffffdd' }); t.position.set((u - 0.5) * 0.44 + 0.07, (0.5 - v) * 0.74 + 0.035, 0.01); d.children[0].add(t); }
  const sig = group('isyarat', mesh(new THREE.SphereGeometry(0.02, 12, 10), M(0xffeb3b, { emissive: 0xffc107, emissiveIntensity: 0.8 }))); sig.position.set(0.35, 0, 0.28); sig.userData.carryY = 0.25; root.add(home(sig));
  const st = textSprite('⚡ Isyarat: bola datang!', { h: 0.026 }); st.position.set(0, 0.05, 0); sig.add(st);
  const ROUTE = ['tangan', 'saraf_tunjang', 'otak', 'saraf_tunjang', 'tangan'];
  const MSG = ['👁️ Organ deria menerima rangsangan — isyarat bermula di saraf periferi.', '➡️ Saraf tunjang membawa maklumat ke otak.', '🧠 Otak mentafsir maklumat dan menghantar isyarat arahan.', '➡️ Arahan dibawa melalui saraf tunjang.', '✅ Saraf periferi membawa arahan ke otot tangan — tangkap bola! Sistem saraf pusat (otak + saraf tunjang) mengkoordinasi gerak balas.'];
  let k = 0;
  const pin = id => d.getObjectByName('pin_' + id);
  const dr = dragger(S, () => (k < 5 ? [sig] : []), {
    onDrop(o, x, y) {
      const hit = Object.keys(PINS).filter(id => nearScreen(S, pin(id), x, y, 0, 50)).sort((a, b) => { const p = id => { const s = S.screenOf(pin(id)); return Math.hypot(s.x - x, s.y - y); }; return p(a) - p(b); })[0];
      if (!hit) return;
      if (hit !== ROUTE[k]) { S.info(`🤔 Seterusnya isyarat bergerak ke <b>${lbl[ROUTE[k]].toLowerCase()}</b>.`); return goHome(S, o); }
      o.position.copy(root.worldToLocal(pin(hit).getWorldPosition(new THREE.Vector3()))); S.evt('signal', 's' + k); S.info(MSG[k], 7); k++;
    },
  });
  return { root, view: { w: 1.2, d: 1.5 }, ...dr };
}

// ------------------------------------------------------------ L4 Jenis tindakan
function L4(S, play) {
  const root = group('L4', table(1.7, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.5, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'action', size: 0.09, gap: 0.18, row: 0.3,
    zones: [Z('terkawal', '🎯 Terkawal', 0xe3f2fd, -0.56), Z('luar_kawal', '❤️ Luar kawal', 0xfce4ec, 0), Z('refleks', '⚡ Refleks', 0xfff3e0, 0.56)],
    items: [['menari', '💃', 'Menari', 'terkawal'], ['makan', '🍽️', 'Makan', 'terkawal'], ['bercakap', '🗣️', 'Bercakap', 'terkawal'], ['jantung', '❤️', 'Denyutan jantung', 'luar_kawal'], ['bernafas', '💨', 'Pernafasan', 'luar_kawal'],
      ['cerna', '🍎', 'Pencernaan', 'luar_kawal'], ['tajam', '📌', 'Tarik kaki pijak benda tajam', 'refleks'], ['panas', '🔥', 'Tarik tangan dari benda panas', 'refleks'], ['kelip', '👁️', 'Mata berkelip bila habuk', 'refleks']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bolehkah kita mengawalnya? Adakah ia berlaku serta-merta tanpa berfikir?' })),
    ok: (it, z) => `✅ ${it.label} — tindakan <b>${z.label.slice(z.label.indexOf(' ') + 1).toLowerCase()}</b>.`,
    onDone: () => setTimeout(() => S.info('🧠 Otak mengkoordinasi tindakan terkawal dan luar kawal. Saraf tunjang mengawal sebahagian tindakan refleks.', 9), 2500),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L5 Menjaga sistem saraf
function L5(S, play) {
  const root = group('L5', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'care', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'baik', label: '✅ Menjaga sistem saraf', color: 0xc8e6c9, x: -0.38, z: -0.18, w: 0.7 }, { id: 'buruk', label: '❌ Merosakkan sistem saraf', color: 0xffcdd2, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['seimbang', '🥗', 'Makanan seimbang', 'baik'], ['tidur', '😴', 'Tidur mencukupi', 'baik'], ['keledar', '⛑️', 'Pakai topi keledar', 'baik'], ['postur', '🪑', 'Postur yang betul', 'baik'],
      ['alkohol', '🍺', 'Minuman beralkohol', 'buruk'], ['lewat', '🌙', 'Tidur terlalu lewat', 'buruk'], ['tanpa', '🛵', 'Menunggang tanpa topi keledar', 'buruk'], ['bongkok', '📱', 'Membongkok lama main telefon', 'buruk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah amalan ini melindungi otak, saraf tunjang dan saraf?' })),
    ok: (it, z) => z.id === 'baik' ? `✅ ${it.label} — menjaga sistem saraf.` : `⚠️ ${it.label} — boleh merosakkan sistem saraf (contoh: Bell's palsy, masalah keseimbangan).`,
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Organ pembiakan', sp: 'SP 2.1.1', make: L1 },
  { id: 'L2', title: 'Persenyawaan hingga kelahiran', sp: 'SP 2.1.2 · 2.1.3', make: L2 },
  { id: 'L3', title: 'Laluan isyarat saraf', sp: 'SP 2.2.1 – 2.2.3', make: L3 },
  { id: 'L4', title: 'Jenis tindakan', sp: 'SP 2.2.2', make: L4 },
  { id: 'L5', title: 'Menjaga sistem saraf', sp: 'SP 2.2.4 · 2.2.5', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia (Tahun 6)',
  intro: '<b>Sains Tahun 6 · Unit 2.</b> Pembiakan manusia dan sistem saraf! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
