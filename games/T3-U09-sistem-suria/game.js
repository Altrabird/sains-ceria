// Sains Tahun 3 · Unit 9 Sistem Suria (SP 9.1.1 – 9.1.5) — build the planet order, other members, temperature, orbits.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const PLANETS = [['utarid', 'Utarid', 0x9e9e9e, 0.016], ['zuhrah', 'Zuhrah', 0xe6c27a, 0.022], ['bumi', 'Bumi', 0x1e88e5, 0.023], ['marikh', 'Marikh', 0xd84315, 0.019],
  ['musytari', 'Musytari', 0xd7a86e, 0.05], ['zuhal', 'Zuhal', 0xe8d5a3, 0.043], ['uranus', 'Uranus', 0x80deea, 0.032], ['neptun', 'Neptun', 0x3949ab, 0.031]];
const R = i => 0.12 + i * 0.075;  // orbit radius of planet i
function space(play) {  // dark disc "space" instead of a table
  const g = group('angkasa', mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.01, 64), new THREE.MeshBasicMaterial({ color: 0x0d1033, transparent: !!play, opacity: play ? 0.75 : 1 }), 0, -0.006, 0));
  for (let i = 0; i < 120; i++) { const s = mesh(new THREE.SphereGeometry(0.002, 4, 3), new THREE.MeshBasicMaterial({ color: 0xffffff })); const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 0.84; s.position.set(Math.cos(a) * r, 0.001, Math.sin(a) * r); s.userData.fx = true; g.add(s); }
  return g;
}
function sun() { const s = group('matahari', mesh(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc107 }))); s.position.y = 0.07; const h = emojiSprite('☀️', 0.22); h.userData.fx = true; s.add(h); return s; }
function planet(id, color, r) {
  const g = group(id, mesh(new THREE.SphereGeometry(r, 20, 14), M(color, { roughness: 0.6 })));
  if (id === 'zuhal') g.add(mesh(new THREE.RingGeometry(r * 1.3, r * 2, 32), M(0xd7ccc8, { side: THREE.DoubleSide, transparent: true, opacity: 0.8 })).rotateX(-1.2));
  if (id === 'bumi') g.add(mesh(new THREE.SphereGeometry(r * 1.01, 12, 8), M(0x43a047, { transparent: true, opacity: 0.5, wireframe: true })));
  g.position.y = r; return g;
}
const ring = (r, color = 0x5c6bc0) => { const m = mesh(new THREE.RingGeometry(r - 0.002, r + 0.002, 96), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; m.userData.fx = true; return m; };

// ------------------------------------------------------------ L1 Urutan planet dari Matahari
function L1(S, play) {
  const root = group('L1', space(play)); root.add(sun());
  const slots = PLANETS.map((p, i) => { root.add(ring(R(i))); const s = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 20), new THREE.MeshBasicMaterial({ color: 0xfdd835, transparent: true, opacity: 0.6 }), R(i), 0.004, 0); s.name = 'orbit_' + (i + 1); root.add(s); return s; });
  const mix = [5, 2, 7, 0, 3, 6, 1, 4];
  const ps = PLANETS.map(([id, label, c, r], i) => { const p = planet(id, c, r); p.position.set(-0.63 + mix[i] * 0.18, p.position.y, 0.75); p.userData.label = label; const t = textSprite(label, { h: 0.03 }); t.position.set(0, r + 0.03, 0); p.add(t); root.add(home(p)); return p; });
  let next = 0;
  const dr = dragger(S, () => ps.filter(p => p.userData.done === undefined), {
    onDrop(p) {
      const s = slots.find(s => flat(s.position, p.position) < 0.045);
      if (!s) return goHome(S, p);
      if (s !== slots[next] || p.name !== PLANETS[next][0]) { S.info(`🤔 Planet ke-${next + 1} dari Matahari ialah… ${next ? 'selepas ' + PLANETS[next - 1][1] : 'yang paling dekat dengan Matahari'}.`); return goHome(S, p); }
      p.userData.done = next++; moveTo(S, p, s.position.clone().setY(p.position.y)); S.evt('order', p.name);
      S.info(next < 8 ? `✅ ${next}. ${p.userData.label}` + (next === 4 ? ' — <b>asteroid</b> terletak di antara Marikh dan Musytari.' : '') : '🪐 Utarid, Zuhrah, Bumi, Marikh, Musytari, Zuhal, Uranus, Neptun — Matahari ialah <b>pusat</b> Sistem Suria!', 7);
      if (next === 4) { for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, rr = (R(3) + R(4)) / 2 + (Math.random() - 0.5) * 0.03; const k = mesh(new THREE.DodecahedronGeometry(0.004), M(0x8d6e63)); k.position.set(Math.cos(a) * rr, 0.005, Math.sin(a) * rr); k.userData.fx = true; k.name = 'asteroid'; root.add(k); } }
    },
  });
  return { root, view: { w: 1.8, d: 2.1 }, ...dr };
}

// ------------------------------------------------------------ L2 Ahli lain Sistem Suria: find them
const MEMBERS = { bulan: '🌕 <b>Bulan</b> — satelit semula jadi bagi Bumi.', asteroid: '⚫ <b>Asteroid</b> — batuan di antara Marikh dan Musytari.', komet: '☄️ <b>Komet</b> — ais dan debu dengan ekor yang panjang.', meteoroid: '🌑 <b>Meteoroid</b> — serpihan batuan kecil di angkasa.', matahari: '☀️ <b>Matahari</b> — bintang di pusat Sistem Suria.' };
function L2(S, play) {
  const root = group('L2', space(play)); const sn = sun(); root.add(sn);
  const earth = planet('bumi', 0x1e88e5, 0.035); earth.position.set(0.35, 0.035, 0.1); root.add(earth);
  const moon = group('bulan', mesh(new THREE.SphereGeometry(0.013, 14, 10), M(0xe0e0e0))); moon.position.set(0.43, 0.02, 0.15); root.add(moon);
  const belt = group('asteroid'); for (let i = 0; i < 14; i++) belt.add(mesh(new THREE.DodecahedronGeometry(0.01 + Math.random() * 0.008), M(0x8d6e63, { flatShading: true }), (i % 7 - 3) * 0.035, 0.012, Math.floor(i / 7) * 0.04)); belt.position.set(-0.4, 0, 0.25); root.add(belt);
  const comet = group('komet', mesh(new THREE.SphereGeometry(0.018, 12, 8), M(0xe1f5fe)), mesh(new THREE.ConeGeometry(0.02, 0.16, 12, 1, true).rotateZ(Math.PI / 2).translate(-0.09, 0, 0), new THREE.MeshBasicMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.45, side: THREE.DoubleSide })));
  comet.position.set(-0.3, 0.06, -0.35); root.add(comet);
  const meteor = group('meteoroid', mesh(new THREE.DodecahedronGeometry(0.009), M(0x9e9e9e))); meteor.position.set(0.2, 0.02, -0.35); root.add(meteor);
  const objs = [sn, moon, belt, comet, meteor], found = new Set();
  const find = (x, y) => S.hitTest(x, y, objs) || S.nearest(x, y, objs, 40);
  return {
    root, view: { w: 1.3, d: 1.1 },
    hit: (x, y) => find(x, y)?.name ?? null,
    tap(x, y) {
      const o = find(x, y); if (!o) return;
      if (!found.has(o.name)) { found.add(o.name); const t = textSprite(o.name[0].toUpperCase() + o.name.slice(1), { h: 0.035 }); t.position.copy(o.position).setY(0.12); root.add(t); }
      S.evt('member', o.name); S.info(MEMBERS[o.name], 7);
    },
    update(dt) { comet.position.x += dt * 0.02; if (comet.position.x > 0.1) comet.position.x = -0.4; const a = performance.now() / 2000; moon.position.set(0.35 + Math.cos(a) * 0.08, 0.02, 0.1 + Math.sin(a) * 0.08); },
  };
}

// ------------------------------------------------------------ L3 Suhu planet
function L3(S, play) {
  const root = group('L3', space(play)); root.add(sun());
  const ps = PLANETS.map(([id, label, c, r], i) => { root.add(ring(R(i), 0x283593)); const p = planet(id, c, r); const a = i * 0.8; p.position.set(Math.cos(a) * R(i), p.position.y, Math.sin(a) * R(i)); const t = textSprite(label, { h: 0.028 }); t.position.set(0, r + 0.03, 0); p.add(t); p.userData.i = i; root.add(p); return p; });
  const thermo = emojiCard('termometer', '🌡️', 'Suhu', 0.12, { border: '#e53935' }); thermo.position.set(0.7, 0, 0.6); root.add(thermo);
  let stage = 0;  // 0: find hottest, 1: find coldest
  const find = (x, y) => S.hitTest(x, y, ps) || S.nearest(x, y, ps, 40);
  return {
    root, view: { w: 1.7, d: 1.7 },
    hit: (x, y) => find(x, y)?.name ?? null,
    tap(x, y) {
      const p = find(x, y); if (!p || stage > 1) return;
      if (stage === 0) {
        if (p.name === 'utarid') return S.info('🤔 Utarid paling dekat dengan Matahari… tetapi ada planet lain yang <b>lebih panas</b>. Fikir tentang atmosfera.');
        if (p.name !== 'zuhrah') return S.info('🌡️ Planet yang dekat dengan Matahari lebih panas. Cuba planet yang lebih dekat.');
        stage = 1; S.evt('hot', 'zuhrah'); S.star(p.position.clone().setY(0.15));
        return S.info('🔥 <b>Zuhrah</b> paling panas kerana <b>atmosferanya tebal</b> dan memerangkap haba. Sekarang tuding planet yang paling <b>sejuk</b>.', 9);
      }
      if (p.name !== 'neptun') return S.info('❄️ Semakin jauh dari Matahari, semakin sejuk. Cuba planet yang lebih jauh.');
      stage = 2; S.evt('cold', 'neptun'); S.star(p.position.clone().setY(0.15));
      S.info('🥶 <b>Neptun</b> paling jauh dan paling sejuk. Matahari ialah sumber haba dalam Sistem Suria.', 8);
    },
  };
}

// ------------------------------------------------------------ L4 Orbit dan masa peredaran
function L4(S, play) {
  const root = group('L4', space(play)); root.add(sun());
  const E = planet('bumi', 0x1e88e5, 0.025), Mr = planet('marikh', 0xd84315, 0.021);
  const RE = 0.3, RM = 0.48; root.add(ring(RE, 0x42a5f5), ring(RM, 0xef5350));
  for (const [p, l] of [[E, 'Bumi'], [Mr, 'Marikh']]) { const t = textSprite(l, { h: 0.03 }); t.position.set(0, 0.06, 0); p.add(t); root.add(p); }
  const start = emojiCard('mula', '▶️', 'Mula peredaran', 0.1, { border: '#43a047' }); start.position.set(0.7, 0, 0.62); root.add(start);
  const ans = [['bumi', 'Bumi lebih lama'], ['marikh', 'Marikh lebih lama']].map(([id, l], i) => { const c = emojiCard('jawapan_' + id, '', l, 0.075, { border: '#7e57c2' }); c.userData.id = id; c.position.set(-0.35 + i * 0.7, 0, 0.62); c.visible = false; root.add(c); return c; });
  let running = false, t = 0, laps = 0, answered = false;
  const place = () => { E.position.set(Math.cos(t * 2) * RE, 0.025, Math.sin(t * 2) * RE * 0.8); Mr.position.set(Math.cos(t * 1.06) * RM, 0.021, Math.sin(t * 1.06) * RM * 0.8); };
  place();
  return {
    root, view: { w: 1.7, d: 1.7 },
    hit: (x, y) => S.hitTest(x, y, [start, ...ans.filter(a => a.visible)])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [start, ...ans.filter(a => a.visible)]); if (!c) return;
      if (c === start) { if (!running) { running = true; S.evt('start', 'orbit'); S.info('🛰️ Orbit ialah laluan bayangan planet berbentuk <b>elips</b> mengelilingi Matahari. Perhatikan Bumi dan Marikh…'); setTimeout(() => ans.forEach(a => a.visible = true), 4000); } return; }
      if (answered) return;
      if (c.userData.id !== 'marikh') return S.info('🤔 Kira pusingan: planet manakah yang belum lengkap satu pusingan?');
      answered = true; S.evt('period', 'marikh'); S.info('✅ <b>Semakin jauh planet dari Matahari, semakin lama masa peredarannya.</b> Bumi mengambil masa satu tahun; Marikh lebih jauh dan mengambil masa lebih lama.', 10);
    },
    update(dt) { if (running) { t += dt; place(); } },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Urutan planet', sp: 'SP 9.1.1', make: L1 },
  { id: 'L2', title: 'Ahli Sistem Suria', sp: 'SP 9.1.1', make: L2 },
  { id: 'L3', title: 'Suhu planet', sp: 'SP 9.1.2', make: L3 },
  { id: 'L4', title: 'Orbit dan masa peredaran', sp: 'SP 9.1.3 – 9.1.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Sistem Suria',
  intro: '<b>Sains Tahun 3 · Unit 9.</b> Bina Sistem Suria! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
