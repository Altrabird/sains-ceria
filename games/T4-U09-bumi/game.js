// Sains Tahun 4 · Unit 9 Bumi (SP 9.1.1 – 9.2.4) — gravity on a globe, rotation + revolution, day and night,
// the sun's apparent path and a pencil's shadow through the day.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

function globe(name = 'glob', r = 0.12) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#1e88e5'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#43a047';
  for (const [x, y, rx, ry] of [[90, 90, 60, 45], [130, 170, 30, 50], [260, 80, 40, 35], [280, 150, 35, 55], [380, 90, 70, 40], [420, 180, 30, 25]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.3, 0, 7); g.fill(); }
  g.fillStyle = '#fafafa'; g.fillRect(0, 0, 512, 14); g.fillRect(0, 242, 512, 14);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = mesh(new THREE.SphereGeometry(r, 40, 28), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })); s.name = 'permukaan';
  return group(name, s);
}

// ------------------------------------------------------------ L1 Graviti bumi: balls fall toward the centre from every side
function L1(S, play) {
  const root = group('L1', table(1.3, 0.85, play));
  const G = globe('bumi', 0.15); G.position.set(0, 0.3, -0.12); root.add(G);
  const stand = mesh(new THREE.CylinderGeometry(0.01, 0.04, 0.15, 12), M(0x616161), 0, 0.075, -0.12); root.add(stand);
  const pc = textSprite('Pusat bumi', { h: 0.024 }); pc.position.set(0, 0.3, -0.12); pc.material.depthTest = false; pc.renderOrder = 5; root.add(pc);
  const balls = [0xef5350, 0xffca28, 0x66bb6a].map((c, i) => { const b = group('bola' + (i + 1), mesh(new THREE.SphereGeometry(0.02, 14, 10), M(c), 0, 0.02, 0)); b.position.set(-0.3 + i * 0.3, 0, 0.27); b.userData.carryY = 0.3 - 0.06; root.add(home(b)); return b; });
  const sides = new Set();
  const dr = dragger(S, () => balls.filter(b => !b.userData.fell), {
    async onDrop(b) {
      const p = b.position.clone(); p.y = 0.3; const c = G.position.clone(), dir = p.clone().sub(c);
      if (dir.length() < 0.16 || dir.length() > 0.45) { S.info('Lepaskan bola di <b>sekeliling</b> bumi — atas, kiri, kanan atau depan.'); return goHome(S, b); }
      dir.normalize(); const end = c.clone().addScaledVector(dir, 0.17); b.userData.fell = true;
      await moveTo(S, b, end, 0.6); G.attach(b);
      const side = Math.abs(dir.x) > Math.abs(dir.z) ? (dir.x > 0 ? 'kanan' : 'kiri') : (dir.z > 0 ? 'depan' : 'belakang'); sides.add(side);
      S.evt('drop', b.name); S.info(`⬇️ Bola dari sebelah <b>${side}</b> jatuh ke arah <b>pusat bumi</b>. Graviti bumi menarik semua objek ke arah pusat bumi.`, 7);
    },
  });
  return { root, view: { w: 1.25, d: 1.15 }, ...dr, update(dt) { G.rotation.y += dt * 0.3; } };
}

// ------------------------------------------------------------ L2 Dua pergerakan bumi
function L2(S, play) {
  const root = group('L2', table(1.4, 0.95, play));
  const sun = group('matahari', mesh(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffc107 }))); sun.position.set(0, 0.12, -0.12); root.add(sun);
  const orbit = mesh(new THREE.RingGeometry(0.33, 0.336, 80), new THREE.MeshBasicMaterial({ color: 0xef5350, side: THREE.DoubleSide })); orbit.rotation.x = -Math.PI / 2; orbit.position.set(0, 0.12, -0.12); orbit.scale.set(1, 0.75, 1); orbit.userData.fx = true; root.add(orbit);
  const holder = group('pemegang'); holder.position.copy(sun.position); root.add(holder);
  const E = globe('bumi', 0.05); E.position.set(0.33, 0, 0); E.rotation.z = 0.41; holder.add(E);
  const axis = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.15), M(0x212121)); axis.userData.fx = true; E.add(axis);
  const spinBtn = textCard('putar', '🌍 Putar pada paksi', 0.3), orbitBtn = textCard('edar', '☀️ Beredar mengelilingi Matahari', 0.3);
  spinBtn.position.set(-0.35, 0, 0.32); orbitBtn.position.set(0.0, 0, 0.32); root.add(spinBtn, orbitBtn);
  const Q = [['putaran', 'Putaran pada paksi mengambil masa…', [['24j', '24 jam (1 hari)', true], ['365h', '365¼ hari (1 tahun)', false]]], ['peredaran', 'Peredaran mengelilingi Matahari mengambil masa…', [['365h', '365¼ hari (1 tahun)', true], ['24j', '24 jam (1 hari)', false]]]];
  let spin = 0, rev = 0, qi = -1, cards = [], qlabel = null;
  function ask() {
    cards.forEach(c => root.remove(c)); if (qlabel) root.remove(qlabel); qi++; if (qi >= Q.length) return;
    qlabel = textSprite(Q[qi][1], { h: 0.035, bg: '#fff59dee' }); qlabel.position.set(0.0, 0.03, 0.18); root.add(qlabel);
    spinBtn.visible = orbitBtn.visible = false;  /* answers take the buttons' row */
    cards = Q[qi][2].map(([id, l, ok], i) => { const c = textCard('jawapan_' + id, l, 0.28); c.userData.ok = ok; c.position.set(-0.2 + i * 0.34, 0, 0.32); root.add(c); return c; });
  }
  const did = new Set();
  return {
    root, view: { w: 1.3, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [spinBtn, orbitBtn, ...cards].filter(o => o.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [spinBtn, orbitBtn, ...cards].filter(o => o.visible)); if (!c) return;
      if (c === spinBtn) { spin = 2; if (!did.has('putar')) { did.add('putar'); S.evt('move', 'putar'); } S.info('🌍 Bumi <b>berputar pada paksinya</b> dari barat ke timur (lawan jam). Paksi menghubungkan Kutub Utara dan Kutub Selatan.'); }
      if (c === orbitBtn) { rev = 1.5; if (!did.has('edar')) { did.add('edar'); S.evt('move', 'edar'); } S.info('☀️ Bumi <b>beredar mengelilingi Matahari</b> mengikut orbitnya (lawan jam).'); }
      if (did.size === 2 && qi < 0) setTimeout(ask, 1500);
      if (cards.includes(c)) {
        if (!c.userData.ok) return S.info('🤔 Satu hari = satu putaran. Satu tahun = satu peredaran.');
        S.evt('period', Q[qi][0]); S.info(qi ? '✅ Peredaran mengambil masa <b>1 tahun atau 365¼ hari</b>.' : '✅ Putaran mengambil masa <b>24 jam atau 1 hari</b>.'); setTimeout(ask, 1500);
      }
    },
    update(dt) { E.rotation.y += dt * (0.4 + spin * 4); spin = Math.max(0, spin - dt); holder.rotation.y += dt * (0.05 + rev * 0.8); rev = Math.max(0, rev - dt); },
  };
}

// ------------------------------------------------------------ L3 Siang dan malam: turn the globe, watch the house
function L3(S, play) {
  const root = group('L3', table(1.3, 0.85, play));
  const torch = group('lampu_suluh', mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 16).rotateZ(-Math.PI / 2), M(0xd32f2f), 0, 0, 0)); torch.position.set(-0.45, 0.25, -0.12); root.add(torch);
  const ray = mesh(new THREE.ConeGeometry(0.16, 0.4, 24, 1, true).rotateZ(Math.PI / 2).translate(0.2, 0, 0), new THREE.MeshBasicMaterial({ color: 0xfff59d, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); ray.userData.fx = true; torch.add(ray);
  const G = globe('glob', 0.14); G.position.set(0.1, 0.25, -0.12); root.add(G);
  const night = mesh(new THREE.SphereGeometry(0.143, 32, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x000022, transparent: true, opacity: 0.6, depthWrite: false })); night.rotation.y = 0; night.position.copy(G.position); night.userData.fx = true; root.add(night);  // far half (+x) in shadow
  const house = emojiSprite('🏠', 0.05); house.position.set(0, 0, 0.15); G.add(house);
  const lbls = [['Siang', -0.12], ['Malam', 0.32]].map(([l, x]) => { const t = textSprite(l, { h: 0.035 }); t.position.set(x, 0.45, -0.12); root.add(t); return t; });
  const spin = textCard('putar_glob', '🔄 Putar glob (lawan jam)', 0.32); spin.position.set(0.1, 0, 0.3); root.add(spin);
  const seen = new Set();
  const check = () => { const w = house.getWorldPosition(new THREE.Vector3()); const day = w.x < G.position.x - 0.02, nightNow = w.x > G.position.x + 0.02;
    if (day && !seen.has('siang')) { seen.add('siang'); S.evt('side', 'siang'); S.info('☀️ Rumah menghadap cahaya — <b>siang</b>.'); }
    if (nightNow && !seen.has('malam')) { seen.add('malam'); S.evt('side', 'malam'); S.info('🌙 Rumah terlindung daripada cahaya — <b>malam</b>. Bahagian bumi yang menghadap Matahari mengalami siang; yang terlindung mengalami malam.', 9); } };
  return {
    root, view: { w: 1.2, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, [spin])?.name ?? null,
    async tap(x, y) { if (S.hitTest(x, y, [spin]) !== spin) return; const r0 = G.rotation.y; await S.tween(1, k => { G.rotation.y = r0 + k * Math.PI / 2; check(); }); },
  };
}

// ------------------------------------------------------------ L4 Kedudukan matahari dan bayang-bayang pensel
const TIMES = [['8pagi', '8.00 pagi', -1.1], ['10pagi', '10.00 pagi', -0.55], ['12tgh', '12.00 tengah hari', 0], ['2ptg', '2.00 petang', 0.55], ['4ptg', '4.00 petang', 1.1]];
function L4(S, play) {
  const root = group('L4', table(1.4, 0.9, play));
  const plate = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.006, 40), M(0xfafafa), 0, 0.003, -0.12); root.add(plate);
  const pencil = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), M(0xffc107), 0, 0.06, -0.12); root.add(pencil);
  for (const [l, x] of [['Timur', -0.45], ['Barat', 0.45]]) { const t = textSprite(l, { h: 0.035, bg: '#fff59dee' }); t.position.set(x, 0.03, -0.12); root.add(t); }
  const sun = emojiSprite('☀️', 0.1); root.add(sun);
  const shadow = mesh(new THREE.BoxGeometry(1, 0.002, 0.012), new THREE.MeshBasicMaterial({ color: 0x333333 })); shadow.userData.fx = true; root.add(shadow);
  const btns = TIMES.map(([id, l], i) => { const c = textCard('masa_' + id, l, 0.22); c.position.set(-0.5 + i * 0.25, 0, 0.3); root.add(c); return c; });
  const seen = new Set(); let asked = false, done = false;
  const ask = textCard('soalan', 'Bilakah bayang-bayang paling pendek?', 0.4); ask.position.set(0, 0, 0.14); ask.visible = false; root.add(ask);
  const setT = ang => {  // ang: -1.1 (morning, east) .. 1.1 (evening, west)
    sun.position.set(Math.sin(ang) * 0.45, 0.12 + Math.cos(ang) * 0.3, -0.12);
    const L = Math.min(0.32, 0.12 * Math.abs(Math.tan(ang)) + 0.01), dir = -Math.sign(ang || 1e-6);  // shadow opposite the sun
    shadow.scale.x = L; shadow.position.set(dir * L / 2, 0.007, -0.12);
  };
  setT(-1.1);
  return {
    root, view: { w: 1.4, d: 0.9 },
    hit: (x, y) => S.hitTest(x, y, btns)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, btns); if (!c) return;
      const t = TIMES.find(t => 'masa_' + t[0] === c.name); setT(t[2]);
      if (!asked) {
        if (!seen.has(t[0])) { seen.add(t[0]); S.evt('time', t[0]); }
        S.info(`🕗 ${t[1]}: matahari di ${t[2] < 0 ? 'timur' : t[2] > 0 ? 'barat' : 'atas kepala'}, bayang-bayang ${t[2] ? 'ke arah ' + (t[2] < 0 ? 'barat' : 'timur') : 'sangat pendek'}.`);
        if (seen.size === 5) { asked = true; ask.visible = true; setTimeout(() => S.info('📏 Kedudukan matahari kelihatan berubah sepanjang hari. Tuding masa bayang-bayang <b>paling pendek</b>.'), 1500); }
        return;
      }
      if (done) return;
      if (t[0] !== '12tgh') return S.info('🤔 Bayang-bayang paling pendek apabila matahari paling tinggi.');
      done = true; S.evt('shortest', '12tgh'); S.info('✅ Pukul 12.00 tengah hari: matahari di atas kepala, bayang-bayang paling pendek. Panjang dan arah bayang-bayang berubah apabila Bumi berputar pada paksinya.', 10);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Graviti bumi', sp: 'SP 9.1.1 – 9.1.3', make: L1 },
  { id: 'L2', title: 'Dua pergerakan bumi', sp: 'SP 9.2.1 · 9.2.2', make: L2 },
  { id: 'L3', title: 'Siang dan malam', sp: 'SP 9.2.3', make: L3 },
  { id: 'L4', title: 'Matahari dan bayang-bayang', sp: 'SP 9.2.3 · 9.2.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bumi — Graviti, Putaran dan Peredaran',
  intro: '<b>Sains Tahun 4 · Unit 9.</b> Graviti, siang dan malam! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
