// Sains Tahun 6 · Unit 7 Kelajuan (SP 7.1.1 – 7.1.4) — races (same distance / same time), marble ramp with a
// stopwatch (ramp height vs time), calculating speed / distance / time, matching units.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, emojiCard, textCard, car, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Perlumbaan
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const X0 = -0.7, X1 = 0.55;
  for (const z of [-0.2, 0.02]) root.add(mesh(new THREE.BoxGeometry(1.4, 0.004, 0.16), M(0x616161), -0.05, 0.002, z));
  const fin = mesh(new THREE.BoxGeometry(0.02, 0.006, 0.4), M(0xffffff), X1 + 0.06, 0.004, -0.09); root.add(fin);
  const ft = textSprite('🏁 TAMAT', { h: 0.032, bg: '#ffffffdd' }); ft.position.set(X1 + 0.06, 0.06, -0.32); root.add(ft);
  const cars = [car('kereta_merah', 0xe53935), car('kereta_biru', 0x1e88e5)]; cars.forEach((c, i) => { c.scale.setScalar(1.5); c.position.set(X0, 0, i ? 0.02 : -0.2); root.add(c); });
  const timers = cars.map((c, i) => { const t = textSprite('0.0 s', { h: 0.03, bg: '#fff59dee' }); t.position.set(X0, 0.1, c.position.z); root.add(t); return t; });
  const start = textCard('mula', '🏁 Mula perlumbaan', 0.24, { border: '#43a047' }); start.position.set(-0.55, 0, 0.32); root.add(start);
  const ROUNDS = [{ id: 'jarak', T: [20, 17], D: [1, 1], q: 'Jarak sama. Kereta manakah lebih laju?', ans: 'kereta_biru', ok: '✅ Kereta biru sampai dalam 17 s, kereta merah 20 s. Pada jarak yang sama, objek lebih laju mengambil masa <b>lebih singkat</b>.' },
    { id: 'masa', T: [10, 10], D: [1, 0.8], q: 'Masa sama (10 s). Kereta manakah lebih laju?', ans: 'kereta_merah', ok: '✅ Dalam 10 s, kereta merah bergerak 5 m, kereta biru 4 m. Dalam masa yang sama, objek lebih laju bergerak <b>lebih jauh</b>.' }];
  let r = 0, running = false, asking = false, el = 0;
  const setT = (i, s) => { timers[i].material = textSprite(`${s.toFixed(1)} s`, { h: 0.03, bg: '#fff59dee' }).material; };
  function race() {
    if (running || asking || r >= 2) return; running = true; el = 0; const R = ROUNDS[r];
    cars.forEach((c, i) => { c.position.x = X0; setT(i, 0); });
    S.info(r ? '⏱️ Perlumbaan 10 saat…' : '🏁 Perlumbaan sejauh 5 m…');
    const dur = 3.4;  // seconds on screen (scaled from 20 s)
    S.tween(dur, t => { cars.forEach((c, i) => { const k = Math.min(1, t * R.T[0] / R.T[i]); c.position.x = X0 + (X1 - X0) * R.D[i] * (r ? t : k); timers[i].position.x = c.position.x; }); }, () => {
      cars.forEach((c, i) => setT(i, R.T[i])); running = false; asking = true; S.info('🤔 ' + R.q + ' Tuding kereta itu.');
    });
  }
  return {
    root, view: { w: 1.8, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [start, ...cars])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [start, ...cars]); if (!c) return;
      if (c === start) return race();
      if (!asking) return;
      const R = ROUNDS[r]; if (c.name !== R.ans) return S.info('🤔 Bandingkan masa dan jarak sekali lagi.');
      asking = false; S.evt('race', R.id); S.info(R.ok, 8); r++;
      if (r === 1) setTimeout(() => S.info('🏁 Pusingan 2: masa yang sama. Tekan Mula.'), 3500);
      else setTimeout(() => S.info('🚀 Kelajuan ialah ukuran kepantasan pergerakan objek — unit cm/s, m/s atau km/j.', 9), 3500);
    },
  };
}

// ------------------------------------------------------------ L2 Guli pada landasan
const TIME = { 1: 3.0, 2: 2.2, 3: 1.6 };
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const X0 = -0.55, L = 0.9;
  const books = group('buku'); books.position.set(X0 - 0.02, 0, -0.1); root.add(books);
  const plank = mesh(new THREE.BoxGeometry(L, 0.01, 0.08), M(0xd7a86e)); root.add(plank);
  const ball = mesh(new THREE.SphereGeometry(0.02, 16, 12), M(0x29b6f6, { metalness: 0.3, roughness: 0.2 })); ball.name = 'guli'; root.add(ball);
  let h = 1;
  const H = () => h * 0.035;
  const layout = () => { books.clear(); for (let i = 0; i < h; i++) books.add(mesh(new THREE.BoxGeometry(0.1, 0.03, 0.12), M([0xe53935, 0x43a047, 0x1e88e5][i]), 0, 0.015 + i * 0.035, 0));
    const a = Math.asin(H() / L); plank.rotation.z = -a; plank.position.set(X0 + L / 2 * Math.cos(a), H() / 2 + 0.006, -0.1); ball.position.set(X0, H() + 0.03, -0.1); return a; };
  layout();
  const watch = textSprite('⏱️ 0.0 s', { h: 0.04, bg: '#fff59dee' }); watch.position.set(0.0, 0.28, -0.1); root.add(watch);
  const picks = [1, 2, 3].map((n, i) => { const c = textCard('tinggi_' + n, `📚 ${n} buku`, 0.16, { border: '#8d6e63' }); c.userData.n = n; c.position.set(-0.6 + i * 0.19, 0, 0.32); root.add(c); return c; });
  const go = textCard('lepas', '▶️ Lepaskan guli', 0.2, { border: '#ef6c00' }); go.position.set(0.0, 0, 0.32); root.add(go);
  const tc = document.createElement('canvas'); tc.width = 420; tc.height = 190; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 420, 190); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; tg.fillText('Ketinggian', 14, 32); tg.fillText('Masa (s)', 270, 32);
    tg.font = '22px system-ui'; [1, 2, 3].forEach((n, i) => { tg.fillText(`${n} buku`, 14, 74 + i * 42); tg.fillText(res[n] ?? '–', 290, 74 + i * 42); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.42, 0.19), new THREE.MeshBasicMaterial({ map: tt }), 0.55, 0.14, -0.28); board.rotation.x = -0.6; board.userData.fx = true; root.add(board);
  const concl = [['singkat', 'Landasan tinggi → masa singkat → lebih laju', true], ['lama', 'Landasan tinggi → masa lama → lebih perlahan', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.3); c.userData.ok = ok; c.position.set(0.02 + i * 0.34, 0, 0.32); c.visible = false; root.add(c); return c; });
  let rolling = false, done = false, shown = '';
  function release() {
    if (rolling) return; rolling = true; const a = layout(), T = TIME[h];
    S.tween(T * 0.8, t => { const e = t * t; ball.position.set(X0 + L * e * Math.cos(a), H() + 0.03 - L * e * Math.sin(a), -0.1); const v = (T * t).toFixed(1); if (v !== shown) { shown = v; watch.material.map?.dispose(); watch.material = textSprite(`⏱️ ${v} s`, { h: 0.04, bg: '#fff59dee' }).material; } }, () => {
      rolling = false; res[h] = T.toFixed(1); draw(); S.evt('trial', 'h' + h); S.info(`⏱️ ${h} buku: guli sampai ke hujung dalam <b>${T.toFixed(1)} s</b>.`);
      if (Object.keys(res).length === 3) { concl.forEach(c => (c.visible = true)); go.visible = false; setTimeout(() => S.info('📋 Jarak sama. Bandingkan masa. Apakah kesimpulannya?'), 1500); }
    });
  }
  return {
    root, view: { w: 1.6, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [...picks, go, ...concl].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...picks, go, ...concl].filter(c => c.visible)); if (!c) return;
      if (picks.includes(c)) { if (rolling) return; h = c.userData.n; layout(); picks.forEach(p => p.children[0].material.color.set(p === c ? 0xc8e6c9 : 0xffffff)); return S.info(`📚 Landasan setinggi ${h} buku.`); }
      if (c === go) return release();
      if (concl.includes(c) && !done) {
        if (!c.userData.ok) return S.info('🤔 3 buku: 1.6 s, 1 buku: 3.0 s. Masa manakah lebih singkat?');
        done = true; S.evt('conclude', 'laju'); S.info('✅ Semakin tinggi landasan, semakin <b>singkat</b> masa — guli bergerak lebih laju. Kelajuan ditentukan dengan mengukur jarak dan masa menggunakan jam randik.', 9);
      }
    },
    wind: release,
  };
}

// ------------------------------------------------------------ L3 Mengira kelajuan, jarak dan masa
const Q = [['kelajuan', '🚆', 'Kereta api bergerak 250 km dalam 2 jam. Kelajuan?', 'Kelajuan = Jarak ÷ Masa', ['125 km/j', '500 km/j', '252 km/j'], '125 km/j', '250 km ÷ 2 jam = 125 km/j'],
  ['jarak', '🛴', 'Skuter bergerak 5 m/s selama 1 minit (60 s). Jarak?', 'Jarak = Kelajuan × Masa', ['65 m', '300 m', '12 m'], '300 m', '5 m/s × 60 s = 300 m'],
  ['masa', '🚗', 'Kereta bergerak 10 km pada 50 km/j. Masa?', 'Masa = Jarak ÷ Kelajuan', ['5 minit', '60 minit', '12 minit'], '12 minit', '10 km ÷ 50 km/j = 0.2 jam = 12 minit']];
function L3(S, play) {
  const root = group('L3', table(1.6, 0.95, play));
  let k = 0, objs = [];
  function setup() {
    objs.forEach(o => root.remove(o)); objs = [];
    const [id, e, q, f, opts] = Q[k];
    const pic = emojiSprite(e, 0.14); pic.position.set(-0.55, 0.12, -0.25); root.add(pic); objs.push(pic);
    const qc = textCard('soalan', q, 0.8, { border: '#3a7bd5' }); qc.position.set(0.15, 0, -0.3); root.add(qc); objs.push(qc);
    const fc = textCard('rumus', f, 0.34, { border: '#ef6c00', bg: '#fff8e1' }); fc.position.set(-0.45, 0, 0.05); root.add(fc); objs.push(fc);
    opts.forEach((o, i) => { const c = textCard('jawapan_' + i, o, 0.24); c.userData.v = o; c.position.set(-0.3 + i * 0.3, 0, 0.3); root.add(c); objs.push(c); });
    S.info(`🧮 Soalan ${k + 1}/3: gunakan rumus.`);
  }
  setup();
  const answers = () => objs.filter(o => o.name.startsWith('jawapan_'));
  return {
    root, view: { w: 1.6, d: 0.95 },
    hit: (x, y) => (k < 3 ? S.hitTest(x, y, answers())?.name : null) ?? null,
    tap(x, y) {
      if (k >= 3) return; const c = S.hitTest(x, y, answers()); if (!c) return;
      const [id, , , , , ans, work] = Q[k];
      if (c.userData.v !== ans) return S.info('🤔 Semak rumus dan unit sekali lagi.');
      S.evt('calc', id); S.info(`✅ ${work}.`, 6); k++;
      if (k < 3) setTimeout(setup, 2500); else setTimeout(() => S.info('🧮 Kelajuan = jarak ÷ masa. Jarak = kelajuan × masa. Masa = jarak ÷ kelajuan.', 9), 2500);
    },
  };
}

// ------------------------------------------------------------ L4 Padankan unit
function L4(S, play) {
  const root = group('L4', table(1.4, 0.9, play));
  const mt = matcher(S, root, [['cm', '📏', 'cm dan s', 'cm/s'], ['m', '🏃', 'm dan s', 'm/s'], ['km', '🚗', 'km dan jam', 'km/j']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f}</b>.` })), { type: 'unit', gap: 0.38, onDone: () => setTimeout(() => S.info('📐 Gunakan unit jarak dan masa yang sepadan.', 8), 2500) });
  return { root, view: { w: 1.4, d: 0.9 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Perlumbaan', sp: 'SP 7.1.1 · 7.1.2', make: L1 },
  { id: 'L2', title: 'Guli pada landasan', sp: 'SP 7.1.2 · 7.1.4', make: L2 },
  { id: 'L3', title: 'Mengira kelajuan', sp: 'SP 7.1.3', make: L3 },
  { id: 'L4', title: 'Padankan unit', sp: 'SP 7.1.3', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kelajuan',
  intro: '<b>Sains Tahun 6 · Unit 7.</b> Kelajuan, jarak dan masa! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = lepaskan guli · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
