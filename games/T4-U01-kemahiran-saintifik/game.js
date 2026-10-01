// Sains Tahun 4 · Unit 1 Kemahiran Saintifik (SP 1.1.7 – 1.1.12) — space-time, interpreting data, operational definition,
// variables, hypothesis + a full sugar-stirring experiment.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, sequence, emojiCard, textCard, beaker, pottedPlant, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const choices = (root, opts, z = 0.3, size = 0.075, gap = 0.4) => opts.map(([id, label, ok], i) => { const c = textCard('pilih_' + id, label, gap * 0.9); c.userData.ok = ok; c.position.set((i - (opts.length - 1) / 2) * gap, 0, z); root.add(c); return c; });
const tapChoice = (S, cs, x, y) => S.hitTest(x, y, cs.filter(c => c.visible));

// ------------------------------------------------------------ L1 Perhubungan ruang dan masa: melting ice lolly
function lolly(name, melt) {
  const g = group(name, mesh(new THREE.BoxGeometry(0.012, 0.06, 0.006), M(0xd7a86e), 0, 0.03, 0));
  const h = 0.1 * (1 - melt), body = mesh(new THREE.CapsuleGeometry(0.03, Math.max(0.001, h - 0.03), 6, 14).scale(1, 1, 0.5), M(0xf48fb1), 0, 0.06 + h / 2, 0);
  if (melt < 1) g.add(body);
  if (melt > 0) g.add(mesh(new THREE.CylinderGeometry(0.03 + melt * 0.05, 0.03 + melt * 0.05, 0.004, 24), M(0xf48fb1), 0, 0.002, 0));
  if (melt === 1) g.children[0].rotation.z = 1.4;
  return g;
}
function L1(S, play) {
  const root = group('L1', table(1.3, 0.8, play));
  const dr = sequence(S, root, [{ obj: lolly('mula', 0) }, { obj: lolly('minit10', 0.45) }, { obj: lolly('minit20', 1) }], {
    type: 'time', gap: 0.35, hint: n => `🤔 ${['Mula', '10 minit', '20 minit'][n]}: bagaimanakah bentuk aiskrim pada masa ini?`,
    ok: it => `✅ ${{ mula: 'Mula: bentuk asal.', minit10: '10 minit: mula cair, saiz mengecil.', minit20: '20 minit: cair sepenuhnya.' }[it.obj.name]}`,
    onDone: () => S.info('⏱️ Apabila masa bertambah, bentuk aiskrim menjadi <b>tidak sekata</b> dan saiznya <b>mengecil</b>. Parameter: lokasi, arah, bentuk, saiz, isi padu dan berat.', 9),
  });
  ['Mula', '10 minit', '20 minit'].forEach((l, i) => { const t = textSprite(l, { h: 0.032, bg: '#fff59dee' }); t.position.set((i - 1) * 0.35, 0.03, -0.32); root.add(t); });
  return { root, view: { w: 1.3, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L2 Mentafsir data: bird feeders
function feeder(name, label) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2), M(0x6d4c41), 0, 0.1, 0), mesh(new THREE.BoxGeometry(0.12, 0.01, 0.09), M(0x8d6e63), 0, 0.2, 0), mesh(new THREE.ConeGeometry(0.1, 0.06, 4), M(0xc62828), 0, 0.26, 0).rotateY(Math.PI / 4));
  const t = textSprite('Tempat ' + label, { h: 0.03 }); t.position.set(0, 0.33, 0); g.add(t); return g;
}
const BIRDS = { A: 33, B: 20, C: 26 };
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const fs = Object.keys(BIRDS).map((k, i) => { const f = feeder('tempat_' + k, k); f.position.set(-0.4 + i * 0.4, 0, -0.2); root.add(f); for (let b = 0; b < Math.round(BIRDS[k] / 8); b++) { const s = emojiSprite('🐦', 0.05); s.position.set((b - 1.5) * 0.04, 0.23, 0.02); f.add(s); } return f; });
  const tc = document.createElement('canvas'); tc.width = 420; tc.height = 200; const tg = tc.getContext('2d');
  tg.fillStyle = '#fff'; tg.fillRect(0, 0, 420, 200); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; tg.fillText('Tempat makan', 14, 32); tg.fillText('Jumlah burung (5 hari)', 180, 32);
  tg.font = '24px system-ui'; Object.entries(BIRDS).forEach(([k, v], i) => { tg.fillText(k, 60, 80 + i * 42); tg.fillText(v, 270, 80 + i * 42); });
  const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const tab = mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshBasicMaterial({ map: tt }), 0, 0.004, 0.22); tab.rotation.x = -Math.PI / 2; tab.userData.fx = true; root.add(tab);
  let stage = 0;
  return {
    root, view: { w: 1.4, d: 0.85 },
    hit: (x, y) => (S.hitTest(x, y, fs) || S.nearest(x, y, fs, 60))?.name ?? null,
    tap(x, y) {
      const f = S.hitTest(x, y, fs) || S.nearest(x, y, fs, 60); if (!f || stage > 1) return;
      const k = f.name.slice(-1);
      if (stage === 0) { if (k !== 'A') return S.info('📋 Lihat jadual: tempat manakah yang paling banyak burung?'); stage = 1; S.evt('most', 'A'); return S.info('✅ Tempat A paling banyak didatangi burung (33). Sekarang tuding tempat yang <b>paling sedikit</b> didatangi burung.'); }
      if (k !== 'B') return S.info('📋 Bandingkan 20, 26 dan 33.');
      stage = 2; S.evt('least', 'B'); S.info('✅ Tempat B paling sedikit didatangi burung (20). <b>Mentafsir data</b> ialah memberikan penerangan yang rasional daripada data.', 9);
    },
  };
}

// ------------------------------------------------------------ L3 Mendefinisi secara operasi: tissue thickness
function L3(S, play) {
  const root = group('L3', table(1.3, 0.8, play));
  const LEFT = { A: 40, B: 30, C: 20 };
  const bs = Object.keys(LEFT).map((k, i) => {
    const b = beaker('bikar_' + k); b.scale.setScalar(2); b.position.set(-0.35 + i * 0.35, 0, -0.15);
    const w = mesh(new THREE.CylinderGeometry(0.032, 0.032, 1, 20), M(0x42a5f5, { transparent: true, opacity: 0.6 }), 0, 0, 0); w.name = 'air'; w.userData.fx = true; b.add(w); b.userData.w = w;
    const tissue = mesh(new THREE.BoxGeometry(0.03, 0.08, 0.004 + i * 0.006), M(0xfafafa, { roughness: 1 }), 0, 0.06, 0); b.add(tissue);
    const t = textSprite(`${k} (${['nipis', 'sederhana', 'tebal'][i]})`, { h: 0.03 }); t.position.set(0, 0.15, 0); b.add(t);
    root.add(b); b.userData.set = ml => { const h = ml / 50 * 0.075; w.scale.y = h; w.position.y = h / 2 + 0.003; }; b.userData.set(50); return b;
  });
  const go = emojiCard('rendam', '⏱️', 'Rendam 1 minit', 0.1, { border: '#43a047' }); go.position.set(0.5, 0, 0.25); root.add(go);
  const def = textSprite('Keupayaan menyerap air = isi padu air yang tinggal di dalam bikar', { h: 0.026, bg: '#fff59dee' }); def.position.set(-0.1, 0.03, 0.12); root.add(def);
  let soaked = false, picked = false;
  return {
    root, view: { w: 1.3, d: 0.8 },
    hit: (x, y) => S.hitTest(x, y, soaked ? bs : [go])?.name ?? null,
    async tap(x, y) {
      if (!soaked) { if (S.hitTest(x, y, [go]) !== go) return; soaked = true; go.visible = false;
        await S.tween(2, k => bs.forEach(b => b.userData.set(50 - (50 - LEFT[b.name.slice(-1)]) * k)));
        bs.forEach(b => { const t = textSprite(`Tinggal ${LEFT[b.name.slice(-1)]} ml`, { h: 0.028, bg: '#b3e5fcee' }); t.position.set(0, 0.0, 0.06); b.add(t); });
        S.evt('soak', 'tisu'); return S.info('💧 Tuding tisu yang <b>paling tinggi</b> keupayaan menyerap air.'); }
      const b = S.hitTest(x, y, bs); if (!b || picked) return;
      if (b.name !== 'bikar_C') return S.info('🤔 Ingat definisi: keupayaan menyerap paling tinggi = isi padu air yang tinggal <b>paling sedikit</b>.');
      picked = true; S.evt('define', 'C'); S.info('✅ Tisu C (paling tebal): air tinggal paling sedikit — keupayaan menyerap air paling tinggi. Itulah <b>definisi secara operasi</b>.', 9);
    },
  };
}

// ------------------------------------------------------------ L4 Mengawal pemboleh ubah: plant growth
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  for (const [x, w, sc] of [[-0.15, 'Disiram sekali', 1.1], [0.15, 'Disiram tiga kali', 1.6]]) { const p = pottedPlant(''); p.scale.setScalar(sc); p.position.set(x, 0, -0.38); root.add(p); const t = textSprite(w, { h: 0.026 }); t.position.set(x, 0.32, -0.38); root.add(t); }
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.08, w: 0.46, d: 0.26 });
  const dr = sorter(S, root, {
    type: 'variable', size: 0.08, gap: 0.24, row: 0.33,
    zones: [Z('manipulasi', 'Dimanipulasi (diubah)', 0xffcdd2, -0.52), Z('bergerak_balas', 'Bergerak balas (diukur)', 0xc8e6c9, 0), Z('malar', 'Malar (dikekalkan)', 0xbbdefb, 0.52)],
    items: [['air', '💧', 'Jumlah air yang disiram', 'manipulasi'], ['saiz', '📏', 'Saiz pokok', 'bergerak_balas'], ['cahaya', '☀️', 'Jumlah cahaya matahari', 'malar'], ['jenis_tanah', '🟫', 'Jenis tanah', 'malar'], ['kuantiti_tanah', '⚖️', 'Kuantiti tanah', 'malar']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Apa yang kita ubah, apa yang kita ukur, dan apa yang kita kekalkan sama?' })),
    ok: (it, z) => `✅ ${it.label} — pemboleh ubah <b>${z.label.split(' (')[0].toLowerCase()}</b>.`,
    onDone: () => S.info('⚖️ <b>Penyiasatan adil</b>: ubah satu pemboleh ubah sahaja.', 7),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L5 Mengeksperimen: stirring and dissolving sugar
const RUNS = { A: [1, 10], B: [3, 5], C: [6, 2] };
function L5(S, play) {
  const root = group('L5', table(1.5, 0.9, play));
  const hyp = choices(root, [['betul', 'Semakin bertambah bilangan adukan, semakin berkurang masa untuk gula melarut.', true], ['salah', 'Gula yang manis melarut dengan cepat.', false]], -0.32, 0.11, 0.6);
  const bs = Object.entries(RUNS).map(([k, [n]], i) => {
    const b = beaker('bikar_' + k); b.scale.setScalar(2); b.position.set(-0.35 + i * 0.35, 0, -0.05); b.visible = false;
    b.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 20), M(0x90caf9, { transparent: true, opacity: 0.5 }), 0, 0.032, 0));
    const sugar = mesh(new THREE.ConeGeometry(0.02, 0.012, 14), M(0xffffff), 0, 0.008, 0); b.add(sugar); b.userData.sugar = sugar;
    const rod = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.1), M(0xe1f5fe, { transparent: true, opacity: 0.7 }), 0.01, 0.06, 0); rod.rotation.z = 0.25; b.add(rod); b.userData.rod = rod;
    const t = textSprite(`${k}: aduk ${n} kali/minit`, { h: 0.024 }); t.position.set(0, 0.13, 0); b.add(t); root.add(b); return b;
  });
  const go = emojiCard('mula', '⏱️', 'Jalankan eksperimen', 0.1, { border: '#43a047' }); go.position.set(0.55, 0, 0.25); go.visible = false; root.add(go);
  const concl = choices(root, [['diterima', 'Hipotesis diterima', true], ['ditolak', 'Hipotesis ditolak', false]], 0.32, 0.075, 0.32); concl.forEach(c => c.position.x += 0.22); concl.forEach(c => c.visible = false);
  let stage = 0, t = 0, running = false;
  const tc = document.createElement('canvas'); tc.width = 380; tc.height = 190; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const drawT = done => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 380, 190); tg.fillStyle = '#2b2340'; tg.font = 'bold 20px system-ui'; ['Bikar', 'Adukan', 'Masa (minit)'].forEach((h, i) => tg.fillText(h, 10 + i * 110, 28));
    tg.font = '22px system-ui'; Object.entries(RUNS).forEach(([k, [n, m]], r) => { tg.fillText(k, 20, 70 + r * 40); tg.fillText(n, 140, 70 + r * 40); if (done[k]) tg.fillText(m, 260, 70 + r * 40); }); tt.needsUpdate = true; };
  const doneT = {}; drawT(doneT);
  const board = mesh(new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: tt }), -0.48, 0.004, 0.22); board.rotation.x = -Math.PI / 2; board.userData.fx = true; board.visible = false; root.add(board);
  return {
    root, view: { w: 1.5, d: 0.9 },
    hit: (x, y) => tapChoice(S, [...hyp, go, ...concl], x, y)?.name ?? null,
    tap(x, y) {
      const c = tapChoice(S, [...hyp, go, ...concl], x, y); if (!c) return;
      if (stage === 0 && hyp.includes(c)) {
        if (!c.userData.ok) return S.info('🤔 Hipotesis menyatakan hubungan antara pemboleh ubah <b>dimanipulasi</b> (bilangan adukan) dan <b>bergerak balas</b> (masa melarut).');
        stage = 1; hyp.forEach(h => h.visible = h === c); bs.forEach(b => b.visible = true); go.visible = true; board.visible = true; S.evt('hypothesis', 'betul');
        return S.info('🧪 Malar: kuantiti gula, saiz gula, isi padu air dan suhu air. Tuding <b>Jalankan eksperimen</b>.');
      }
      if (stage === 1 && c === go) { stage = 2; go.visible = false; running = true; return S.info('⏱️ Eksperimen berjalan… perhatikan gula melarut.'); }
      if (stage === 3 && concl.includes(c)) {
        if (!c.userData.ok) return S.info('🤔 Data: semakin banyak adukan, semakin singkat masa. Adakah data menyokong hipotesis?');
        stage = 4; S.evt('conclude', 'diterima'); S.info('✅ Hipotesis <b>diterima</b>. Laporan: tujuan, masalah, hipotesis, pemboleh ubah, alat dan bahan, langkah, data, tafsiran, kesimpulan.', 10);
      }
    },
    update(dt) {
      if (!running) return; t += dt;
      bs.forEach(b => { const [n, m] = RUNS[b.name.slice(-1)]; b.userData.rod.rotation.y += dt * n * 3; const left = Math.max(0, 1 - t / (m * 0.6)); b.userData.sugar.scale.setScalar(Math.max(0.001, left)); if (!left && !doneT[b.name.slice(-1)]) { doneT[b.name.slice(-1)] = true; drawT(doneT); } });
      if (Object.keys(doneT).length === 3) { running = false; stage = 3; S.evt('run', 'eksperimen'); concl.forEach(c => c.visible = true); S.info('📋 Tafsiran: gula yang diaduk paling banyak melarut paling cepat. Apakah kesimpulannya?'); }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Perhubungan ruang dan masa', sp: 'SP 1.1.7', make: L1 },
  { id: 'L2', title: 'Mentafsir data', sp: 'SP 1.1.8', make: L2 },
  { id: 'L3', title: 'Mendefinisi secara operasi', sp: 'SP 1.1.9', make: L3 },
  { id: 'L4', title: 'Mengawal pemboleh ubah', sp: 'SP 1.1.10', make: L4 },
  { id: 'L5', title: 'Hipotesis dan eksperimen', sp: 'SP 1.1.11 · 1.1.12', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kemahiran Saintifik (Tahun 4)',
  intro: '<b>Sains Tahun 4 · Unit 1.</b> Tafsir data, kawal pemboleh ubah dan jalankan eksperimen! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
