// Sains Tahun 5 · Unit 9 Fasa Bulan dan Buruj (SP 9.1.1 – 9.2.2) — moon orbit simulator (lit half always faces the
// Sun, phase seen from Earth), order of the eight phases, connect-the-stars constellations, constellation uses.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, sequence, emojiCard, textCard, wire, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const PHASES = ['Anak bulan', 'Bulan sabit', 'Bulan separa', 'Bulan hampir purnama', 'Bulan purnama', 'Bulan hampir purnama', 'Bulan separa', 'Bulan sabit'];
// phase picture: i = 0..7 (0 new, 4 full), waxing lit on the right
function drawPhase(g, W, H, i) {
  const r = Math.min(W, H) * 0.4, cx = W / 2, cy = H / 2, k = (1 - Math.cos(i * Math.PI / 4)) / 2, wax = i < 4;
  g.fillStyle = '#0d1b3e'; g.fillRect(0, 0, W, H); g.fillStyle = '#263238'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  if (k > 0.01) { g.fillStyle = '#eceff1'; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !wax); g.fill();
    g.fillStyle = k > 0.5 ? '#eceff1' : '#263238'; g.beginPath(); g.ellipse(cx, cy, r * Math.abs(2 * k - 1) + 0.5, r, 0, 0, 7); g.fill(); }
}
function phaseCard(name, i, w = 0.15) {
  const c = document.createElement('canvas'); c.width = c.height = 200; drawPhase(c.getContext('2d'), 200, 200, i);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = mesh(new THREE.PlaneGeometry(w, w), new THREE.MeshBasicMaterial({ map: t }), 0, w / 2 * Math.sin(1.0) + 0.005, 0); m.rotation.x = -1.0;
  return group(name, m);
}

// ------------------------------------------------------------ L1 Bulan mengelilingi Bumi
function L1(S, play) {
  const root = group('L1', table(1.7, 1.0, play));
  const R = 0.3, C = new THREE.Vector3(0.1, 0.06, -0.05);
  const sun = mesh(new THREE.SphereGeometry(0.09, 24, 16), M(0xffd54f, { emissive: 0xffb300, emissiveIntensity: 1 }), -0.7, 0.1, -0.05); root.add(sun);
  const st = textSprite('☀️ Matahari', { h: 0.03 }); st.position.set(-0.7, 0.24, -0.05); root.add(st);
  for (let i = 0; i < 3; i++) { const ray = mesh(new THREE.BoxGeometry(0.25, 0.003, 0.006), M(0xffe082, { emissive: 0xffca28, emissiveIntensity: 0.6 }), -0.48, 0.1, -0.2 + i * 0.15); ray.userData.fx = true; root.add(ray); }
  const earth = group('bumi', mesh(new THREE.SphereGeometry(0.06, 24, 16), M(0x1e88e5)), mesh(new THREE.SphereGeometry(0.0605, 12, 8, 0, 2, 0.6, 1), M(0x43a047))); earth.position.copy(C); root.add(earth);
  const ring = mesh(new THREE.TorusGeometry(R, 0.002, 6, 80), M(0x90a4ae)); ring.rotation.x = Math.PI / 2; ring.position.copy(C); ring.userData.fx = true; root.add(ring);
  const P = a => C.clone().add(new THREE.Vector3(Math.cos(a) * R, 0, -Math.sin(a) * R));
  const angOf = i => Math.PI + i * Math.PI / 4;  // phase i at this orbit angle (0 = between Earth and Sun)
  [0, 2, 4, 6].forEach(i => { const d = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 12), M(0xffd84d)); d.position.copy(P(angOf(i))).setY(0.002); d.name = 'orbit_' + i; root.add(d); });
  const moon = group('bulan', mesh(new THREE.SphereGeometry(0.035, 24, 16, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xf5f5f5 })), mesh(new THREE.SphereGeometry(0.035, 24, 16, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x37474f })));
  moon.children.forEach(m => (m.rotation.y = -Math.PI / 2)); root.add(moon);
  // view from Earth
  const vc = document.createElement('canvas'); vc.width = vc.height = 256; const vt = new THREE.CanvasTexture(vc); vt.colorSpace = THREE.SRGBColorSpace;
  const view = mesh(new THREE.PlaneGeometry(0.24, 0.24), new THREE.MeshBasicMaterial({ map: vt }), 0.62, 0.17, -0.25); view.rotation.x = -0.5; view.userData.fx = true; root.add(view);
  const vl = textSprite('👀 Dilihat dari Bumi', { h: 0.03 }); vl.position.set(0.62, 0.34, -0.3); root.add(vl);
  let a = angOf(7) + 0.1, idx = -1; const seen = new Set();
  const place = () => { moon.position.copy(P(a)); const i = ((Math.round((a - Math.PI) / (Math.PI / 4)) % 8) + 8) % 8;
    if (i !== idx) { idx = i; drawPhase(vc.getContext('2d'), 256, 256, i); vt.needsUpdate = true; } return i; };
  place();
  const dr = dragger(S, () => [moon], {
    onDrag(o) { const d = o.position.clone().sub(C); a = Math.atan2(-d.z, d.x); place(); },
    onDrop() { const i = place(); moon.position.y = C.y;
      S.info(`🌙 ${PHASES[i]} — ${i === 0 ? 'bahagian yang disinari Matahari membelakangi Bumi' : i === 4 ? 'seluruh bahagian yang disinari menghadap Bumi' : 'sebahagian yang disinari dapat dilihat dari Bumi'}.`);
      if (i % 2 === 0 && !seen.has(i)) { seen.add(i); S.evt('phase', 'f' + i); }
      if (seen.size === 4) setTimeout(() => S.info('✅ Bulan tidak bercahaya sendiri — ia memantulkan cahaya Matahari. Apabila Bulan beredar mengelilingi Bumi, bahagian bercahaya yang kita lihat berubah. Bulan berputar dan beredar dalam ~27 hari, jadi kita sentiasa melihat permukaan yang sama.', 12), 2500);
    },
  });
  return { root, view: { w: 1.7, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L2 Urutan fasa Bulan
function L2(S, play) {
  const root = group('L2', table(1.9, 0.95, play));
  const dr = sequence(S, root, PHASES.map((l, i) => ({ obj: phaseCard('fasa_' + (i + 1), i), label: l })), {
    type: 'order', gap: 0.21, slotW: 0.17, rowZ: 0.28, hint: n => n ? `🤔 Selepas ${PHASES[n - 1].toLowerCase()}, bahagian bercahaya ${n < 4 ? 'semakin besar' : 'semakin kecil'}.` : '🤔 Fasa pertama: anak bulan — hampir tidak kelihatan.',
    onDone: () => setTimeout(() => S.info('🕌 Takwim Qamari (Hijrah) ditentukan berdasarkan perubahan fasa Bulan. Bulan purnama kelihatan pada pertengahan bulan Qamari.', 10), 2500),
  });
  return { root, view: { w: 1.9, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Sambung bintang: buruj
const BURUJ = [
  ['biduk', 'Biduk', 'gayung', [[0.1, 0.3], [0.22, 0.32], [0.33, 0.38], [0.45, 0.45], [0.5, 0.72], [0.7, 0.72], [0.72, 0.45], [0.45, 0.45]]],
  ['belantik', 'Belantik', 'pemburu', [[0.35, 0.15], [0.45, 0.5], [0.35, 0.85], null, [0.65, 0.2], [0.55, 0.5], [0.68, 0.85], null, [0.45, 0.5], [0.5, 0.5], [0.55, 0.5]]],
  ['pari', 'Pari', 'layang-layang', [[0.5, 0.12], [0.5, 0.88], null, [0.3, 0.45], [0.7, 0.5]]],
  ['skorpio', 'Skorpio', 'kala jengking', [[0.2, 0.2], [0.3, 0.3], [0.4, 0.35], [0.5, 0.45], [0.55, 0.6], [0.6, 0.75], [0.72, 0.8], [0.8, 0.68]]],
];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.95, play));
  const W = 0.9, H = 0.5, tilt = 0.9;
  const sky = group('langit'); sky.rotation.x = -tilt; sky.position.set(0, H / 2 * Math.cos(tilt) + 0.01, -0.1);
  const bg = mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ color: 0x0d1b3e })); bg.userData.fx = true; sky.add(bg);
  for (let i = 0; i < 40; i++) { const s = mesh(new THREE.SphereGeometry(0.002, 4, 3), new THREE.MeshBasicMaterial({ color: 0x90a4ae })); s.position.set((Math.random() - 0.5) * W, (Math.random() - 0.5) * H, 0.002); s.userData.fx = true; sky.add(s); }
  const holder = group('buruj'); sky.add(holder); root.add(sky);
  const name = textSprite(' ', { h: 0.035, bg: '#ffffff00' }); root.add(name);
  let b = 0, k = 0, stars = [], prev = null;
  const at = ([u, v]) => new THREE.Vector3((u - 0.5) * W, (0.5 - v) * H, 0.006);
  const key = p => p.join(',');
  function setup() {
    holder.clear(); stars = []; k = 0; prev = null;
    const [id, , , path] = BURUJ[b];
    const uniq = [...new Map(path.filter(Boolean).map(p => [key(p), p])).values()];
    uniq.forEach((p, i) => { const s = mesh(new THREE.SphereGeometry(0.013, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff59d })); s.position.copy(at(p)); s.name = `bintang_${id}_${i}`; s.userData.key = key(p); holder.add(s); stars.push(s); });
    S.info(`⭐ Sambungkan bintang mengikut urutan (bintang berkelip) untuk membentuk buruj ${BURUJ[b][1]}.`);
  }
  const path = () => BURUJ[b][3];
  const target = () => { while (path()[k] === null) { k++; prev = null; } return k < path().length ? stars.find(s => s.userData.key === key(path()[k])) : null; };
  setup();
  let t = 0;
  return {
    root, view: { w: 1.3, d: 1.0 },
    next: () => (b < BURUJ.length ? target()?.name : null),  /* test hook */
    hit: (x, y) => S.nearest(x, y, stars, 40)?.name ?? null,
    tap(x, y) {
      if (b >= BURUJ.length) return;
      const s = S.nearest(x, y, stars, 40), want = target(); if (!s || !want) return;
      if (s !== want) return S.info('🤔 Tuding bintang yang sedang berkelip.');
      if (prev) holder.add(wire([prev.position.clone(), s.position.clone()], 0xffd54f));
      prev = s; k++;
      if (k >= path().length) {
        const [id, nm, shape] = BURUJ[b]; S.evt('trace', id);
        name.material = textSprite(`${nm}: corak seperti ${shape}`, { h: 0.035, bg: '#fff59dee' }).material; name.position.set(0, 0.03, 0.3);
        S.info(`✅ Buruj <b>${nm}</b> — corak seperti ${shape}.`, 6); b++;
        if (b < BURUJ.length) setTimeout(setup, 2800); else setTimeout(() => S.info('🌌 Buruj ialah gugusan bintang yang membentuk corak tertentu di langit pada waktu malam.', 9), 2800);
      }
    },
    update(dt) { t += dt; if (b < BURUJ.length) { const w = target(); stars.forEach(s => s.scale.setScalar(s === w ? 1.3 + Math.sin(t * 8) * 0.4 : 1)); } },
  };
}

// ------------------------------------------------------------ L4 Kegunaan buruj
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const mt = matcher(S, root, [['biduk', '⭐', 'Biduk', 'Arah utara · musim menanam'], ['pari', '⭐', 'Pari', 'Arah selatan'], ['belantik', '⭐', 'Belantik', 'Musim sejuk'], ['skorpio', '⭐', 'Skorpio', 'Musim menuai']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ Buruj ${l}: <b>${f.toLowerCase()}</b>.` })),
    { type: 'use', gap: 0.36, onDone: () => setTimeout(() => S.info('🧭 Buruj digunakan sebagai petunjuk arah dan petunjuk musim.', 9), 2500) });
  return { root, view: { w: 1.6, d: 0.95 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Bulan mengelilingi Bumi', sp: 'SP 9.1.1 – 9.1.3', make: L1 },
  { id: 'L2', title: 'Urutan fasa Bulan', sp: 'SP 9.1.3', make: L2 },
  { id: 'L3', title: 'Buruj', sp: 'SP 9.2.1', make: L3 },
  { id: 'L4', title: 'Kegunaan buruj', sp: 'SP 9.2.2', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Fasa Bulan dan Buruj',
  intro: '<b>Sains Tahun 5 · Unit 9.</b> Fasa Bulan dan buruj di langit malam! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
