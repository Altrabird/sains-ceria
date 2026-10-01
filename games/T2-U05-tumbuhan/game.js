// Sains Tahun 2 · Unit 5 Tumbuh-tumbuhan (SP 5.1.1 – 5.1.6) — why plants matter, germination test, growth order, growth record, water test.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, leaf, sorter, emojiCard, pottedPlant, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const button = (name, label, x, z, color = '#1e88e5') => { const b = emojiCard(name, '', label, 0.07, { border: color }); b.position.set(x, 0, z); return b; };

// ------------------------------------------------------------ L1 Kepentingan tumbuh-tumbuhan
function L1(S, play) {
  const root = group('L1', table(1.6, 0.9, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.2, w: 0.36, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'use', size: 0.1, gap: 0.19, row: 0.28,
    zones: [Z('habitat', '🏡 Habitat', 0xc5e1a5, -0.57), Z('makanan', '🍽️ Makanan', 0xffe082, -0.19), Z('udara', '🌬️ Udara', 0xb3e5fc, 0.19), Z('ubat', '💊 Ubat', 0xf8bbd0, 0.57)],
    items: [['sarang', '🐦', 'Sarang burung di pokok', 'habitat'], ['tupai', '🐿️', 'Tupai di pokok', 'habitat'], ['tembikai', '🍉', 'Tembikai', 'makanan'], ['padi', '🌾', 'Padi', 'makanan'],
      ['bernafas', '😮', 'Manusia bernafas', 'udara'], ['arnab', '🐇', 'Haiwan bernafas', 'udara'], ['lidah_buaya', '🌿', 'Lidah buaya', 'ubat'], ['pegaga', '🍃', 'Pegaga', 'ubat']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bagaimanakah tumbuhan membantu di sini? Habitat, makanan, udara atau ubat?' })),
    ok: (it, z) => `✅ Tumbuh-tumbuhan ialah sumber <b>${{ habitat: 'habitat untuk haiwan', makanan: 'makanan', udara: 'udara untuk bernafas', ubat: 'ubat' }[z.id]}</b>.`,
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L2 Biji benih bercambah: 4-dish fair test
function dish(name, label) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 28, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.45, side: THREE.DoubleSide }), 0, 0.008, 0),
    mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 24), M(0xffffff, { roughness: 1 }), 0, 0.007, 0), mesh(new THREE.SphereGeometry(0.012, 12, 8).scale(1.3, 0.8, 1), M(0xffc107), 0, 0.016, 0));
  const t = textSprite(label, { h: 0.024 }); t.position.set(0, 0.06, 0.05); g.add(t); return g;
}
const sprout = () => group('tunas', mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.04), M(0x8bc34a), 0, 0.035, 0), ...[-1, 1].map(s => mesh(new THREE.SphereGeometry(0.012, 10, 6).scale(1, 0.25, 0.6), M(0x66bb6a), s * 0.012, 0.055, 0)));
function L2(S, play) {
  const root = group('L2', table(1.5, 0.9, play));
  const D = [['piring_a', 'A: Peti ais'], ['piring_b', 'B: Kapas kering'], ['piring_c', 'C: Dibalut plastik'], ['piring_d', 'D: Biasa']]
    .map(([id, label], i) => { const d = dish(id, label); d.scale.setScalar(1.3); d.position.set(-0.45 + i * 0.3, 0, -0.05); d.userData.carryY = 0.04; root.add(home(d)); return d; });
  const fridge = group('peti_ais', mesh(new THREE.BoxGeometry(0.2, 0.16, 0.14), M(0xb0bec5), 0, 0.08, 0), mesh(new THREE.BoxGeometry(0.18, 0.06, 0.005), M(0x90caf9, { transparent: true, opacity: 0.6 }), 0, 0.08, 0.071));
  fridge.position.set(-0.45, 0, -0.3); root.add(fridge); const fl = textSprite('Peti ais', { h: 0.028 }); fl.position.set(-0.45, 0.2, -0.3); root.add(fl);
  const water = emojiCard('penitis_air', '💧', 'Air', 0.09, { border: '#1e88e5' }); water.position.set(0.15, 0, 0.32);
  const wrap = emojiCard('plastik', '🧻', 'Plastik', 0.09, { border: '#8e24aa' }); wrap.position.set(0.42, 0, 0.32);
  root.add(home(water), home(wrap));
  const clock = button('seminggu', '⏱️ Seminggu kemudian', 0.5, -0.33, '#43a047'); clock.visible = false; root.add(clock);
  const need = { air_a: 'piring_a', air_c: 'piring_c', air_d: 'piring_d' }; const setup = new Set();
  let waited = false;
  const REASONS = [['suhu', 'Suhu tidak sesuai', 'piring_a'], ['air', 'Tiada air', 'piring_b'], ['udara', 'Tiada udara', 'piring_c']];
  const reasons = REASONS.map(([id, label, d], i) => { const c = emojiCard('sebab_' + id, '', label, 0.07, { border: '#e53935' }); c.userData = { dish: d, id }; c.position.set(-0.4 + i * 0.3, 0, 0.32); c.visible = false; root.add(home(c)); return c; });
  const explained = new Set();
  function check() {
    if (setup.size === 5 && !clock.visible) { clock.visible = true; S.info('🧪 Penyediaan siap. Tuding <b>Seminggu kemudian</b>.'); }
  }
  const dr = dragger(S, () => waited ? reasons.filter(r => !explained.has(r)) : [water, wrap, D[0]].filter(o => !(o === D[0] && setup.has('peti_ais'))), {
    onDrop(o, x, y) {
      if (o === D[0]) {
        if (!(nearScreen(S, fridge, x, y, 0.13, 80) || flat(o.position, fridge.position) < 0.15)) return goHome(S, o);
        setup.add('peti_ais'); moveTo(S, o, fridge.position.clone().add(new THREE.Vector3(0, 0.02, 0.11))); S.evt('setup', 'peti_ais'); S.info('❄️ Piring A di dalam <b>peti ais</b> — suhu sejuk.'); return check();
      }
      const d = S.closest(D, x, y, d => flat(d.getWorldPosition(new THREE.Vector3()), o.position) < 0.1 || nearScreen(S, d, x, y, 0.02, 55));
      if (o.userData.dish) {
        if (!d) return goHome(S, o);
        if (d.name !== o.userData.dish) { S.info('🤔 Bandingkan keadaan piring itu sekali lagi.'); return goHome(S, o); }
        explained.add(o); moveTo(S, o, root.worldToLocal(d.getWorldPosition(new THREE.Vector3())).add(new THREE.Vector3(0, 0, 0.13))); S.evt('reason', o.userData.id);
        S.info(`✅ ${d.name.slice(-1).toUpperCase()} tidak bercambah: <b>${REASONS.find(r => r[0] === o.userData.id)[1].toLowerCase()}</b>.`); return;
      }
      goHome(S, o);
      if (!d) return;
      if (o === water) {
        const key = 'air_' + d.name.slice(-1);
        if (d.name === 'piring_b') return S.info('🤔 Piring B ialah <b>kapas kering</b> — jangan tambah air.');
        if (setup.has(key)) return;
        setup.add(key); d.children[1].material = M(0xcfe8fc, { roughness: 0.6 }); S.evt('setup', key); S.info(`💧 Kapas piring ${d.name.slice(-1).toUpperCase()} dibasahkan.`); return check();
      }
      if (o === wrap) {
        if (d.name !== 'piring_c') return S.info('🤔 Hanya piring C dibalut plastik — supaya tiada udara.');
        if (setup.has('plastik')) return;
        setup.add('plastik'); d.add(mesh(new THREE.SphereGeometry(0.065, 20, 10, 0, 6.3, 0, 1.57).scale(1, 0.5, 1), M(0xe1bee7, { transparent: true, opacity: 0.45 }), 0, 0.01, 0));
        S.evt('setup', 'plastik'); S.info('🧻 Piring C dibalut plastik — <b>tiada udara</b>.'); return check();
      }
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (clock.visible && !waited ? S.hitTest(x, y, [clock])?.name ?? null : null),
    tap(x, y) {
      if (!clock.visible || waited || S.hitTest(x, y, [clock]) !== clock) return;
      waited = true; clock.visible = false; const sp = sprout(); D[3].add(sp); sp.scale.setScalar(0.01); S.tween(1.2, k => sp.scale.setScalar(0.01 + k));
      water.visible = wrap.visible = false; reasons.forEach(r => r.visible = true);
      S.evt('week', 'seminggu'); S.info('🌱 Hanya piring <b>D</b> bercambah! Letakkan sebab pada piring yang tidak bercambah.', 9);
    },
  };
}

// ------------------------------------------------------------ tomato growth stages
const seedM = () => M(0xd4a373);
const soil = () => mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 20), M(0x6d4c2f), 0, 0.006, 0);
function tomato(stage) {
  const g = group(['biji_benih', 'bercambah', 'anak_pokok', 'berbunga', 'berbuah'][stage]);
  if (stage <= 1) { g.add(mesh(new THREE.SphereGeometry(0.018, 14, 10).scale(1.4, 0.7, 1), seedM(), 0, 0.012, 0)); if (stage === 1) g.add(mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.03), M(0xf5f5dc), 0.02, 0.0, 0).rotateZ(-0.6), mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.025), M(0x9ccc65), -0.005, 0.03, 0)); return g; }
  const h = [0, 0, 0.07, 0.15, 0.17][stage]; g.add(soil(), mesh(new THREE.CylinderGeometry(0.004, 0.005, h), M(0x558b2f), 0, h / 2, 0));
  const nl = [0, 0, 2, 6, 7][stage];
  for (let i = 0; i < nl; i++) { const l = leaf(''); l.scale.setScalar(0.4); l.position.set(0.035 * (i % 2 ? 1 : -1), h * (0.5 + i / nl * 0.45), 0); l.rotation.set(0, i % 2 ? 0 : Math.PI, (i % 2 ? 1 : -1) * 0.4); g.add(l); }
  if (stage === 3) for (let i = 0; i < 3; i++) g.add(mesh(new THREE.SphereGeometry(0.008, 8, 6), M(0xffeb3b), (i - 1) * 0.03, h * 0.85, 0.02));
  if (stage === 4) for (let i = 0; i < 3; i++) g.add(mesh(new THREE.SphereGeometry(0.015, 12, 10), M(0xe53935), (i - 1) * 0.035, h * 0.7, 0.025));
  return g;
}
const STAGES = ['Biji benih', 'Biji benih bercambah', 'Anak pokok', 'Pokok berbunga', 'Pokok berbuah'];
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const slots = STAGES.map((s, i) => { const m = mesh(new THREE.BoxGeometry(0.16, 0.004, 0.14), M(0xffd84d, { transparent: true, opacity: 0.7 }), -0.5 + i * 0.25, 0.002, -0.22); m.name = 'urutan_' + (i + 1); root.add(m);
    const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set(m.position.x - 0.09, 0.02, -0.22); root.add(n); return m; });
  const mix = [3, 0, 4, 1, 2];
  const pieces = STAGES.map((label, i) => { const o = tomato(i); o.scale.setScalar(1.4); o.position.set(-0.5 + mix[i] * 0.25, 0, 0.14); const t = textSprite(label, { h: 0.024 }); t.position.set(0, 0.0, 0.07); o.add(t); root.add(home(o)); return o; });
  let next = 0;
  const dr = dragger(S, () => pieces.filter(p => p.userData.done === undefined), {
    onDrop(o) {
      const s = slots.find(s => flat(s.position, o.position) < 0.09);
      if (!s) return goHome(S, o);
      if (s !== slots[next] || pieces.indexOf(o) !== next) { S.info(`🤔 Peringkat ${next + 1}: ${next ? 'apakah yang berlaku selepas ' + STAGES[next - 1].toLowerCase() + '?' : 'tumbesaran bermula dengan biji benih.'}`); return goHome(S, o); }
      o.userData.done = next++; moveTo(S, o, s.position.clone()); S.evt('grow', o.name);
      S.info(next < 5 ? `✅ ${STAGES[next - 1]}.` : '🍅 Biji benih → bercambah → anak pokok → pokok berbunga → pokok berbuah!');
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Perubahan semasa tumbesaran: corn record
const DAYS = [[3, 2, 1.0, 0.3], [9, 5, 1.5, 0.5], [15, 10, 1.8, 0.8], [21, 14, 2.5, 1.0]];
function corn(day) {
  const d = DAYS[day], h = 0.05 + day * 0.06, g = group('pokok_jagung', mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.06, 20), M(0xc8643b), 0, 0.03, 0), mesh(new THREE.CylinderGeometry(0.003 + d[3] * 0.004, 0.003 + d[3] * 0.005, h), M(0x7cb342), 0, 0.06 + h / 2, 0));
  for (let i = 0; i < d[1]; i++) { const l = mesh(new THREE.BoxGeometry(0.03 + d[2] * 0.025, 0.002, 0.008 + d[2] * 0.003), M(0x66bb6a)); l.geometry.translate(0.015 + d[2] * 0.012, 0, 0); l.position.set(0, 0.07 + h * (i + 1) / (d[1] + 1), 0); l.rotation.set(0, i * 2.4, -0.4); g.add(l); }
  return g;
}
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  let day = -1, plant = null;
  const next = button('hari_seterusnya', '📅 Hari seterusnya', -0.45, 0.25, '#43a047'); root.add(next);
  const tape = emojiCard('pita_ukur', '📏', 'Pita ukur', 0.09, { border: '#ff8f00' }); tape.position.set(-0.15, 0, 0.3); tape.visible = false; root.add(home(tape));
  const tc = document.createElement('canvas'); tc.width = 520; tc.height = 220; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    tg.fillStyle = '#fff'; tg.fillRect(0, 0, 520, 220); tg.font = 'bold 22px system-ui'; tg.fillStyle = '#2b2340';
    ['Hari', 'Bil. daun', 'Saiz daun', 'Lilitan'].forEach((h, r) => tg.fillText(h, 10, 36 + r * 50));
    DAYS.forEach((d, c) => { if (c > day) return; tg.font = '22px system-ui'; [`Ke-${d[0]}`, d[1], d[2] + ' cm', c === 3 && tape.userData.done ? d[3] + ' cm' : c < 3 ? d[3] + ' cm' : '?'].forEach((v, r) => tg.fillText(v, 150 + c * 92, 36 + r * 50)); });
    tt.needsUpdate = true;
  };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.42, 0.18), new THREE.MeshBasicMaterial({ map: tt }), 0.32, 0.12, -0.1); board.rotation.set(-0.4, -0.3, 0); board.userData.fx = true; root.add(board);
  function grow() {
    day++; if (plant) root.remove(plant); plant = corn(day); plant.position.set(-0.2, 0, -0.15); plant.scale.setScalar(1.3); root.add(plant); draw();
    S.evt('day', 'hari_' + DAYS[day][0]);
    S.info(`🌽 Hari ke-${DAYS[day][0]}: <b>${DAYS[day][1]} helai daun</b>, saiz daun ${DAYS[day][2]} cm.` + (day === 3 ? ' Sekarang ukur <b>lilitan batang</b> dengan pita ukur.' : ''));
    if (day === 3) { next.visible = false; tape.visible = true; }
  }
  grow();
  const dr = dragger(S, () => (tape.visible && !tape.userData.done ? [tape] : []), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, plant, x, y, 0.12, 80) || flat(o.position, plant.position) < 0.12)) return goHome(S, o);
      tape.userData.done = true; o.visible = false; draw();
      const ring = mesh(new THREE.TorusGeometry(0.012, 0.002, 6, 16), M(0xff8f00), -0.2, 0.12, -0.15); ring.rotation.x = Math.PI / 2; root.add(ring);
      S.evt('measure', 'lilitan'); S.info('📏 Lilitan batang: <b>1.0 cm</b>. Bilangan daun, saiz daun, ketinggian pokok dan lilitan batang <b>bertambah</b> semasa tumbesaran.', 9);
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (next.visible ? S.hitTest(x, y, [next])?.name ?? null : null),
    tap(x, y) { if (next.visible && S.hitTest(x, y, [next]) === next) grow(); },
  };
}

// ------------------------------------------------------------ L5 Keperluan tumbesaran: water only pot A for 7 days
function L5(S, play) {
  const root = group('L5', table(1.4, 0.85, play));
  const A = pottedPlant('pokok_a'), B = pottedPlant('pokok_b'); A.scale.setScalar(1.6); B.scale.setScalar(1.6);
  A.position.set(-0.25, 0, -0.15); B.position.set(0.25, 0, -0.15); root.add(A, B);
  for (const [p, t] of [[A, 'A (disiram)'], [B, 'B (tidak disiram)']]) { const l = textSprite(t, { h: 0.032 }); l.position.set(p.position.x, 0.38, -0.15); root.add(l); }
  const sun = emojiSprite('☀️', 0.12); sun.position.set(0, 0.5, -0.3); root.add(sun);
  const can = emojiCard('penyiram', '🚿', 'Siram', 0.1, { border: '#1e88e5' }); can.position.set(0, 0, 0.27); root.add(home(can));
  let cal = null; const setDay = n => { if (cal) root.remove(cal); cal = textSprite(`Hari ${n} / 7`, { h: 0.045, bg: '#fff59dee' }); cal.position.set(0, 0.03, 0.05); root.add(cal); };
  setDay(0);
  let day = 0, chosen = false;
  const dr = dragger(S, () => (day < 7 ? [can] : []), {
    onDrop(o, x, y) {
      goHome(S, o);
      const onA = nearScreen(S, A, x, y, 0.15, 90) || flat(o.position, A.position) < 0.14, onB = nearScreen(S, B, x, y, 0.15, 90) || flat(o.position, B.position) < 0.14;
      if (onB) return S.info('🤔 Dalam penyiasatan ini, siram <b>pokok A sahaja</b> setiap hari.');
      if (!onA) return;
      day++; setDay(day);
      B.userData.setWilt(day / 7); S.evt('water', 'hari_' + day);
      S.info(day < 7 ? `💧 Hari ${day}: pokok A disiram.` : '📅 Selepas 7 hari: tuding pokok yang <b>membesar dengan baik</b>.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (day === 7 ? S.hitTest(x, y, [A, B])?.name ?? null : null),
    tap(x, y) {
      if (day < 7 || chosen) return;
      const p = S.hitTest(x, y, [A, B]); if (!p) return;
      if (p === B) return S.info('🥀 Pokok B <b>layu</b> kerana tidak mendapat air.');
      chosen = true; S.evt('compare', 'pokok_a'); S.star(A.position.clone().setY(0.4));
      S.info('🌱 Pokok A membesar dengan baik. Air, udara dan cahaya matahari diperlukan untuk tumbesaran; tumbuhan akan layu dan mati tanpa keperluan asasnya.', 10);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Kepentingan tumbuh-tumbuhan', sp: 'SP 5.1.1', make: L1 },
  { id: 'L2', title: 'Biji benih bercambah', sp: 'SP 5.1.2', make: L2 },
  { id: 'L3', title: 'Urutan tumbesaran', sp: 'SP 5.1.4', make: L3 },
  { id: 'L4', title: 'Perubahan semasa tumbesaran', sp: 'SP 5.1.3', make: L4 },
  { id: 'L5', title: 'Keperluan tumbesaran', sp: 'SP 5.1.5 · 5.1.6', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tumbuh-tumbuhan',
  intro: '<b>Sains Tahun 2 · Unit 5.</b> Kepentingan, percambahan dan tumbesaran tumbuhan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
