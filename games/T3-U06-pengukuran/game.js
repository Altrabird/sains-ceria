// Sains Tahun 3 · Unit 6 Pengukuran: luas dan isi padu (SP 6.1.1 – 6.1.7) — area units, count squares, estimate a leaf,
// fill a box with 1 cm³ cubes, read a measuring cylinder at eye level, water displacement.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, leafOutline, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const choices = (root, opts, z = 0.3, prefix = 'jawapan_') => opts.map(([id, label, ok], i) => { const c = emojiCard(prefix + id, '', label, 0.075, { border: '#7e57c2' }); c.userData.ok = ok; c.position.set((i - (opts.length - 1) / 2) * 0.28, 0, z); root.add(c); return c; });

// graph paper lying on the table: N x R cells of `cell` metres; tap() -> [col, row] of the cell under the pointer
function graphPaper(S, { cols, rows, cell = 0.045, draw }) {
  const PX = 60, W = cols * PX, H = rows * PX, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const paint = marks => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); draw?.(g, PX);
    for (const [i, j, color, text] of marks) { g.fillStyle = color; g.fillRect(i * PX + 2, j * PX + 2, PX - 4, PX - 4); if (text) { g.fillStyle = '#1a237e'; g.font = 'bold 30px system-ui'; g.textAlign = 'center'; g.fillText(text, i * PX + PX / 2, j * PX + PX / 2 + 10); } }
    g.strokeStyle = '#64b5f6'; g.lineWidth = 2; for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(i * PX, 0); g.lineTo(i * PX, H); g.stroke(); } for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, j * PX); g.lineTo(W, j * PX); g.stroke(); }
    tex.needsUpdate = true;
  };
  const sheet = mesh(new THREE.PlaneGeometry(cols * cell, rows * cell), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.003, 0); sheet.rotation.x = -Math.PI / 2; sheet.name = 'kertas_graf';
  return { sheet, paint, PX, cellAt(x, y) { const h = S.rayAt(x, y).intersectObject(sheet)[0]; return h ? [Math.floor(h.uv.x * cols), Math.floor((1 - h.uv.y) * rows)] : null; } };
}

// ------------------------------------------------------------ L1 Unit luas
function L1(S, play) {
  const root = group('L1', table(1.6, 0.85, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.48, d: 0.32 });
  const dr = sorter(S, root, {
    type: 'unit', size: 0.1, gap: 0.22, row: 0.28,
    zones: [Z('cm2', 'sentimeter persegi (cm²)', 0xe1f5fe, -0.52), Z('m2', 'meter persegi (m²)', 0xe8f5e9, 0), Z('km2', 'kilometer persegi (km²)', 0xfff3e0, 0.52)],
    items: [['buku', '📕', 'Luas buku', 'cm2'], ['kad', '🎴', 'Luas kad', 'cm2'], ['tikar', '🧺', 'Luas tikar', 'm2'], ['bilik', '🏫', 'Luas bilik darjah', 'm2'], ['sabah', '🗺️', 'Luas negeri Sabah', 'km2'], ['tasik', '🏞️', 'Luas tasik besar', 'km2']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Kecil → cm², sederhana → m², sangat besar → km². Cuba lagi.' })),
    ok: (it, z) => `✅ ${it.label} diukur dalam <b>${z.label}</b>. Luas ialah besarnya sesuatu kawasan atau permukaan.`,
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Luas permukaan sekata: count squares in a 3 x 2 rectangle
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const R = { x0: 2, y0: 1, w: 3, h: 2 };
  const gp = graphPaper(S, { cols: 8, rows: 5, cell: 0.07, draw: (g, PX) => { g.strokeStyle = '#e53935'; g.lineWidth = 8; g.strokeRect(R.x0 * PX, R.y0 * PX, R.w * PX, R.h * PX); } });
  gp.sheet.position.set(0, 0.003, -0.12); root.add(gp.sheet);
  const marks = new Map(); gp.paint([]);
  const t = textSprite('1 petak = 1 cm × 1 cm = 1 cm²', { h: 0.03 }); t.position.set(0, 0.03, -0.33); root.add(t);
  const ans = choices(root, [['5', '5 cm²', false], ['6', '6 cm²', true], ['8', '8 cm²', false]]); ans.forEach(a => a.visible = false);
  let answered = false;
  const inside = ([i, j]) => i >= R.x0 && i < R.x0 + R.w && j >= R.y0 && j < R.y0 + R.h;
  return {
    root, view: { w: 0.9, d: 0.7 },
    hit: (x, y) => (ans[0].visible ? S.hitTest(x, y, ans)?.name ?? null : gp.cellAt(x, y) ? 'petak' : null),
    tap(x, y) {
      if (ans[0].visible) {
        const a = S.hitTest(x, y, ans); if (!a || answered) return;
        if (!a.userData.ok) return S.info('🤔 Kira semula petak yang bernombor.');
        answered = true; S.evt('area', '6cm2'); return S.info('✅ 3 cm × 2 cm: <b>6 petak = 6 cm²</b>.');
      }
      const c = gp.cellAt(x, y); if (!c) return;
      if (!inside(c)) return S.info('Kira petak <b>di dalam</b> segi empat merah sahaja.');
      const k = c.join(','); if (marks.has(k)) return;
      marks.set(k, [...c, '#c5e1a5', String(marks.size + 1)]); gp.paint([...marks.values()]); S.evt('count', k);
      if (marks.size === 6) { ans.forEach(a => a.visible = true); S.info('🔢 Semua petak dikira. Berapakah luasnya?'); }
    },
  };
}

// ------------------------------------------------------------ L3 Anggar luas permukaan tidak sekata: a leaf on graph paper
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const COLS = 10, ROWS = 6, out = leafOutline(40).map(([x, y]) => [x / 0.16 * 8.6 + 5, -y / 0.05 * 2.6 + 3]);  // leaf in cell units
  const drawLeaf = (g, PX) => { g.fillStyle = '#81c784'; g.beginPath(); out.forEach(([x, y], i) => i ? g.lineTo(x * PX, y * PX) : g.moveTo(x * PX, y * PX)); g.closePath(); g.fill(); };
  const gp = graphPaper(S, { cols: COLS, rows: ROWS, cell: 0.06, draw: drawLeaf });
  gp.sheet.position.set(0, 0.003, -0.12); root.add(gp.sheet);
  // coverage of each cell by the leaf (sample a 10x10 grid inside the cell)
  const pc = document.createElement('canvas'); pc.width = COLS * 10; pc.height = ROWS * 10; const pg = pc.getContext('2d'); drawLeaf(pg, 10);
  const px = pg.getImageData(0, 0, pc.width, pc.height).data;
  const cover = (i, j) => { let n = 0; for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) if (px[((j * 10 + b) * pc.width + i * 10 + a) * 4 + 3] > 100) n++; return n / 100; };
  const counted = new Map(), need = []; for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) if (cover(i, j) >= 0.5) need.push(i + ',' + j);
  gp.paint([]);
  let done = false;
  return {
    root, view: { w: 0.9, d: 0.6 },
    hit: (x, y) => (gp.cellAt(x, y) ? 'petak' : null),
    tap(x, y) {
      if (done) return; const c = gp.cellAt(x, y); if (!c) return;
      const f = cover(...c), k = c.join(',');
      if (counted.has(k)) return;
      if (f < 0.5) return S.info(f > 0 ? '✋ Petak ini <b>kurang separuh</b> penuh — jangan kira.' : 'Petak ini kosong.');
      counted.set(k, [...c, f > 0.95 ? '#43a047aa' : '#fdd835aa', '✓']); gp.paint([...counted.values()]); S.evt('mark', k);
      S.info(`${f > 0.95 ? '🟩 Penuh' : '🟨 Separuh atau lebih'} — dikira. Jumlah: <b>${counted.size}</b> petak.`);
      if (counted.size === need.length) { done = true; S.evt('estimate', 'daun'); S.info(`🍃 Anggaran luas daun ≈ <b>${need.length} cm²</b>. Kira petak penuh dan petak separuh penuh atau lebih.`, 9); }
    },
    need: () => need,  // for tests
  };
}

// ------------------------------------------------------------ L4 Kotak lohong: fill with 1 cm³ cubes
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const U = 0.07, box = group('kotak_lohong', mesh(new THREE.BoxGeometry(2 * U + 0.006, 2 * U + 0.006, 2 * U + 0.006), M(0xe1f5fe, { transparent: true, opacity: 0.25, depthWrite: false }), 0, U, 0));
  box.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * U, 2 * U, 2 * U)), new THREE.LineBasicMaterial({ color: 0x1565c0 })).translateY(U));
  box.position.set(-0.2, 0, -0.12); root.add(box);
  const dl = textSprite('2 cm × 2 cm × 2 cm', { h: 0.028 }); dl.position.set(-0.2, 2 * U + 0.05, -0.12); root.add(dl);
  const slots = []; for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) slots.push(new THREE.Vector3((i - 0.5) * U, (j + 0.5) * U, (k - 0.5) * U));
  const cubes = [...Array(8)].map((_, n) => { const c = group('kubus' + n, mesh(new THREE.BoxGeometry(U * 0.96, U * 0.96, U * 0.96), M([0x42a5f5, 0x66bb6a, 0xffa726, 0xef5350][n % 4]), 0, U / 2, 0)); c.position.set(0.08 + (n % 4) * 0.085, 0, 0.08 + Math.floor(n / 4) * 0.1); c.userData.carryY = 0.05; root.add(home(c)); return c; });
  const filled = []; let answered = false;
  const ans = choices(root, [['4', '4 cm³', false], ['6', '6 cm³', false], ['8', '8 cm³', true]], 0.33); ans.forEach(a => a.visible = false);
  const dr = dragger(S, () => cubes.filter(c => !filled.includes(c)), {
    onDrop(c, x, y) {
      if (!(nearScreen(S, box, x, y, U, 90) || flat(c.position, box.position) < 0.12)) return goHome(S, c);
      const s = slots[filled.length]; filled.push(c); box.attach(c); c.position.set(s.x, s.y - U / 2, s.z); c.rotation.set(0, 0, 0);
      S.evt('cube', c.name);
      if (filled.length === 8) { ans.forEach(a => a.visible = true); S.info('📦 Kotak penuh! Berapakah isi padu kotak itu?'); }
      else S.info(`🧊 ${filled.length} kubus 1 cm³.`);
    },
  });
  return {
    root, view: { w: 1.0, d: 0.7 }, ...dr,
    hit: (x, y) => (ans[0].visible ? S.hitTest(x, y, ans)?.name ?? null : null),
    tap(x, y) {
      const a = ans[0].visible && S.hitTest(x, y, ans); if (!a || answered) return;
      if (!a.userData.ok) return S.info('🤔 Kira semua kubus di dalam kotak.');
      answered = true; S.evt('volume', '8cm3'); S.info('✅ Isi padu kotak lohong = jumlah kubus 1 cm³ = <b>8 cm³</b>.');
    },
  };
}

// ------------------------------------------------------------ measuring cylinder (0-250 ml); setLevel(ml)
function cylinder(name, max = 250) {
  const H = 0.36, R = 0.05, g = group(name, mesh(new THREE.CylinderGeometry(R, R, H, 28, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, H / 2 + 0.01, 0),
    mesh(new THREE.CylinderGeometry(R * 1.8, R * 1.8, 0.012, 28), M(0xe1f5fe, { transparent: true, opacity: 0.6 }), 0, 0.006, 0));
  for (let ml = 10; ml <= max; ml += 10) { const big = ml % 50 === 0; g.add(mesh(new THREE.BoxGeometry(big ? 0.03 : 0.015, 0.002, 0.002), M(0x37474f), -R + 0.01, 0.01 + ml / max * H, R)); if (big) { const t = textSprite(String(ml), { h: 0.02, bg: '#ffffff00' }); t.position.set(-R - 0.03, 0.01 + ml / max * H, R); g.add(t); } }
  const w = mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 1, 28), M(0x42a5f5, { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0, 0); w.userData.fx = true; g.add(w);
  const men = mesh(new THREE.TorusGeometry(R * 0.93, 0.004, 6, 28), M(0x1e88e5)); men.rotation.x = Math.PI / 2; men.userData.fx = true; g.add(men);
  g.userData.setLevel = ml => { const h = Math.max(0.0001, ml / max * H); w.scale.y = h; w.position.y = 0.01 + h / 2; men.position.y = 0.01 + h - 0.002; };
  g.userData.y = ml => 0.01 + ml / max * H; g.userData.setLevel(0); return g;
}

// ------------------------------------------------------------ L5 Isi padu cecair: read at eye level
function L5(S, play) {
  const root = group('L5', table(1.3, 0.85, play));
  const cyl = cylinder('silinder_penyukat'); cyl.position.set(-0.15, 0, -0.15); cyl.scale.setScalar(1.3); root.add(cyl); cyl.userData.setLevel(200);
  const eye = emojiCard('mata', '👁️', 'Mata', 0.1, { border: '#3a7bd5' }); eye.position.set(0.15, 0, -0.15); eye.userData.carryY = 0; root.add(eye);
  const level = y => Math.round((y / 1.3 - 0.01) / 0.36 * 250 / 10) * 10;
  let eyeY = 0.1 * 1.3; eye.position.y = eyeY;
  const ans = choices(root, [['190', '190 ml', false], ['200', '200 ml', true], ['210', '210 ml', false]], 0.3); ans.forEach(a => a.visible = false);
  let aligned = false, answered = false;
  const dr = dragger(S, () => (aligned ? [] : [eye]), {
    onDrag(o) { o.position.x = 0.15; o.position.z = -0.15; },
    onDrop(o, x, y) {
      // the eye slides up/down beside the cylinder: height from the pointer's screen y
      const p = S.rayAt(x, y).ray, plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.15), hit = p.intersectPlane(plane, new THREE.Vector3());
      if (!hit) return; o.position.set(0.15, THREE.MathUtils.clamp(hit.y, 0.02, 0.48), -0.15);
      const at = level(o.position.y);
      if (Math.abs(at - 200) > 5) { const y0 = o.position.y; S.tween(0.6, k => o.position.y = y0 + (0.13 - y0) * k); }  // slide back where it can be grabbed again
      if (Math.abs(at - 200) > 5) return S.info(at > 200 ? '👁️ Mata terlalu <b>tinggi</b> — bacaan akan salah. Turunkan mata ke aras meniskus.' : '👁️ Mata terlalu <b>rendah</b>. Naikkan mata ke aras meniskus.');
      aligned = true; o.position.y = cyl.userData.y(200) * 1.3; S.evt('eye', 'meniskus'); ans.forEach(a => a.visible = true);
      S.info('👁️ Kedudukan mata berada pada <b>aras meniskus</b> (permukaan cecair yang berkeluk). Berapakah bacaannya?');
    },
  });
  return {
    root, view: { w: 1.3, d: 1.2 }, ...dr,
    hit: (x, y) => (ans[0].visible ? S.hitTest(x, y, ans)?.name ?? null : null),
    tap(x, y) {
      const a = ans[0].visible && S.hitTest(x, y, ans); if (!a || answered) return;
      if (!a.userData.ok) return S.info('🤔 Baca senggat pada bahagian bawah meniskus.');
      answered = true; S.evt('read', '200ml'); S.info('✅ Isi padu air = <b>200 ml</b>. Isi padu cecair diukur dengan silinder penyukat atau bikar.');
    },
  };
}

// ------------------------------------------------------------ L6 Pepejal tidak sekata: water displacement
function L6(S, play) {
  const root = group('L6', table(1.3, 0.85, play));
  const cyl = cylinder('silinder', 50); cyl.position.set(-0.15, 0, -0.15); cyl.scale.setScalar(1.3); root.add(cyl); cyl.userData.setLevel(20);
  const stone = group('batu', mesh(new THREE.DodecahedronGeometry(0.03, 0), M(0x616161, { flatShading: true }), 0, 0.03, 0)); stone.position.set(0.25, 0, 0.2); stone.userData.carryY = 0.1; root.add(home(stone));
  const st = textSprite('Batu', { h: 0.026 }); st.position.set(0, 0.08, 0); stone.add(st);
  const rec = textSprite('Bacaan awal: 20 ml', { h: 0.03, bg: '#fff59dee' }); rec.position.set(0.25, 0.03, -0.3); root.add(rec);
  const ans = choices(root, [['10', '10 ml', true], ['20', '20 ml', false], ['30', '30 ml', false]], 0.32); ans.forEach(a => a.visible = false);
  let sunk = false, answered = false;
  const dr = dragger(S, () => (sunk ? [] : [stone]), {
    async onDrop(o, x, y) {
      if (!(nearScreen(S, cyl, x, y, 0.3, 80) || flat(o.position, cyl.position) < 0.12)) return goHome(S, o);
      sunk = true; st.visible = false; o.position.set(-0.15, 0.4, -0.15);
      await S.tween(1, k => o.position.y = 0.4 - k * 0.38); o.scale.setScalar(0.8);
      await S.tween(1, k => cyl.userData.setLevel(20 + k * 10));
      const r2 = textSprite('Bacaan akhir: 30 ml', { h: 0.03, bg: '#fff59dee' }); r2.position.set(0.25, 0.03, -0.24); root.add(r2);
      S.evt('drop', 'batu'); ans.forEach(a => a.visible = true); S.info('💧 Paras air naik dari 20 ml ke 30 ml. Berapakah isi padu batu?');
    },
  });
  return {
    root, view: { w: 1.3, d: 0.85 }, ...dr,
    hit: (x, y) => (ans[0].visible ? S.hitTest(x, y, ans)?.name ?? null : null),
    tap(x, y) {
      const a = ans[0].visible && S.hitTest(x, y, ans); if (!a || answered) return;
      if (!a.userData.ok) return S.info('🤔 Isi padu batu = bacaan akhir − bacaan awal.');
      answered = true; S.evt('displace', '10ml'); S.info('✅ Isi padu batu = 30 ml − 20 ml = <b>10 ml</b>. Isi padu air yang tersesar sama dengan isi padu objek. Pengukuran mengelakkan pembaziran.', 9);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Luas dan unit', sp: 'SP 6.1.1', make: L1 },
  { id: 'L2', title: 'Luas permukaan sekata', sp: 'SP 6.1.2', make: L2 },
  { id: 'L3', title: 'Anggar luas tidak sekata', sp: 'SP 6.1.3', make: L3 },
  { id: 'L4', title: 'Isi padu kotak lohong', sp: 'SP 6.1.4', make: L4 },
  { id: 'L5', title: 'Isi padu cecair', sp: 'SP 6.1.5', make: L5 },
  { id: 'L6', title: 'Pepejal tidak sekata', sp: 'SP 6.1.6 · 6.1.7', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Pengukuran — Luas dan Isi Padu',
  intro: '<b>Sains Tahun 3 · Unit 6.</b> Ukur luas dan isi padu! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
