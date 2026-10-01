// Sains Tahun 2 · Unit 8 Campuran (SP 8.1.1 – 8.1.5) — separating mixtures, soluble or not, dissolving faster.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, beaker, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const bowl = (name, color = 0xe0e0e0) => group(name, mesh(new THREE.SphereGeometry(0.06, 20, 10, 0, 6.3, Math.PI / 2, Math.PI / 2), M(color, { side: THREE.DoubleSide }), 0, 0.06, 0));
function glass(name, water = 0x90caf9) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.11, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.055, 0),
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.004, 24), M(0xe1f5fe, { transparent: true, opacity: 0.5 }), 0, 0.002, 0));
  const w = mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.08, 24), M(water, { transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.042, 0); w.name = 'air'; w.userData.fx = true; g.add(w);
  return g;
}
const bits = (n, make, spread, y = 0.01) => [...Array(n)].map(() => { const m = make(); m.position.set(rnd(-spread, spread), y + rnd(0, 0.01), rnd(-spread, spread)); m.rotation.set(rnd(0, 3), rnd(0, 3), 0); return m; });

// ------------------------------------------------------------ L1 Mengasingkan campuran: right method for each mixture
const MIX = [
  ['kacang_muruku', 'Kacang + muruku', 'tangan', '✋ <b>Menyisih</b>: bahan bersaiz besar dan berbeza bentuk mudah diasingkan dengan tangan.'],
  ['tepung_kismis', 'Tepung + kismis', 'ayak', '🥣 <b>Mengayak</b>: tepung yang halus melepasi lubang ayak; kismis tertinggal di dalam ayak.'],
  ['klip_pasir', 'Klip kertas + pasir', 'magnet', '🧲 <b>Menggunakan magnet</b>: magnet menarik klip kertas; pasir tidak ditarik.'],
  ['kayu_pasir', 'Serpihan kayu + pasir', 'air', '💧 <b>Mengapung</b>: serpihan kayu terapung, pasir tenggelam.'],
  ['kelopak_air', 'Kelopak bunga + air', 'turas', '🧻 <b>Menuras</b>: kelopak tertinggal pada kertas turas; cecair terkumpul di dalam kelalang kon.'],
];
const TOOLS = [['tangan', '✋', 'Tangan'], ['ayak', '🥣', 'Ayak'], ['magnet', '🧲', 'Magnet'], ['air', '💧', 'Air'], ['turas', '🧻', 'Kertas turas']];
function mixture(id) {
  const B = bowl(id);
  const add = arr => { arr.forEach(m => B.add(m)); return arr; };
  B.userData.parts = {
    kacang_muruku: () => ({ a: add(bits(6, () => mesh(new THREE.SphereGeometry(0.008, 8, 6).scale(1.4, 1, 1), M(0xbc8a5f)), 0.03, 0.03)), b: add(bits(4, () => mesh(new THREE.TorusGeometry(0.012, 0.004, 6, 12), M(0xffb300)), 0.03, 0.03)) }),
    tepung_kismis: () => ({ a: add([mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, 6.3, 0, 1.2).scale(1, 0.4, 1), M(0xfafafa, { roughness: 1 }), 0, 0.02, 0)]), b: add(bits(6, () => mesh(new THREE.SphereGeometry(0.006, 6, 4), M(0x4e342e)), 0.03, 0.04)) }),
    klip_pasir: () => ({ a: add([mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, 6.3, 0, 1.2).scale(1, 0.4, 1), M(0xe6c88a, { roughness: 1 }), 0, 0.02, 0)]), b: add(bits(4, () => mesh(new THREE.TorusGeometry(0.009, 0.0015, 6, 14).scale(2, 1, 1), M(0xcfd8dc, { metalness: 0.8 })), 0.03, 0.04)) }),
    kayu_pasir: () => ({ a: add([mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, 6.3, 0, 1.2).scale(1, 0.4, 1), M(0xe6c88a, { roughness: 1 }), 0, 0.02, 0)]), b: add(bits(6, () => mesh(new THREE.BoxGeometry(0.014, 0.004, 0.008), M(0x795548)), 0.03, 0.04)) }),
    kelopak_air: () => ({ a: add([mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, 6.3, 0, 1.3).scale(1, 0.5, 1), M(0xf48fb1, { transparent: true, opacity: 0.7 }), 0, 0.025, 0)]), b: add(bits(6, () => mesh(new THREE.SphereGeometry(0.008, 8, 6).scale(1.3, 0.3, 1), M(0xd81b60)), 0.03, 0.045)) }),
  }[id]();
  return B;
}
function L1(S, play) {
  const root = group('L1', table(1.6, 0.9, play));
  const mixes = MIX.map(([id, label], i) => { const b = mixture(id); b.scale.setScalar(1.4); b.position.set(-0.6 + i * 0.3, 0, -0.18); const t = textSprite(label, { h: 0.026 }); t.position.set(0, 0.12, 0); b.add(t); root.add(b); return b; });
  const cards = TOOLS.map(([id, e, label], i) => { const c = emojiCard('kaedah_' + id, e, label, 0.1, { border: '#00897b' }); c.userData.tool = id; c.position.set(-0.6 + [3, 0, 4, 1, 2][i] * 0.3, 0, 0.27); root.add(home(c)); return c; });
  const done = new Set();
  async function separate(b, tool) {
    const P = b.userData.parts, out = new THREE.Vector3(b.position.x, 0, b.position.z + 0.14);
    if (tool === 'tangan') { const dish = bowl('', 0xbbdefb); dish.scale.setScalar(0.8); dish.position.copy(out); root.add(dish); for (const k of P.a) { root.attach(k); await moveTo(S, k, out.clone().add(new THREE.Vector3(rnd(-0.02, 0.02), 0.03, rnd(-0.02, 0.02))), 0.2); } }
    if (tool === 'ayak') { const sv = mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.02, 20, 1, true), M(0x9e9e9e, { wireframe: true }), 0, 0.12, 0); b.add(sv); P.b.forEach(k => { k.position.y = 0.11; }); await S.tween(1.2, t => P.a[0].scale.set(1, 0.4 + t * 0.3, 1)); }
    if (tool === 'magnet') { const mg = emojiSprite('🧲', 0.08); mg.position.set(0, 0.16, 0); b.add(mg); await Promise.all(P.b.map((k, i) => S.tween(0.6 + i * 0.05, t => k.position.lerp(new THREE.Vector3((i - 1.5) * 0.008, 0.13, 0), t * 0.3)))); }
    if (tool === 'air') { const w = mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.05, 20), M(0x90caf9, { transparent: true, opacity: 0.5 }), 0, 0.035, 0); w.userData.fx = true; b.add(w); await S.tween(1, t => P.b.forEach(k => k.position.y = 0.03 + t * 0.03)); }
    if (tool === 'turas') { const f = mesh(new THREE.ConeGeometry(0.05, 0.05, 20, 1, true), M(0xffffff, { side: THREE.DoubleSide }), 0, 0.15, 0); f.rotation.x = Math.PI; b.add(f); P.b.forEach(k => k.position.set(rnd(-0.02, 0.02), 0.165, rnd(-0.02, 0.02))); P.a[0].material.color.set(0xf06292); }
  }
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    async onDrop(c, x, y) {
      const b = mixes.find(b => nearScreen(S, b, x, y, 0.05, 70) || flat(b.position, c.position) < 0.12);
      if (!b) return goHome(S, c);
      const m = MIX.find(m => m[0] === b.name);
      if (m[2] !== c.userData.tool) { S.info(`🤔 Adakah ${TOOLS.find(t => t[0] === c.userData.tool)[2].toLowerCase()} sesuai untuk mengasingkan ${m[1].toLowerCase()}?`); return goHome(S, c); }
      done.add(c); c.visible = false; S.info(m[3], 8); await separate(b, m[2]); S.evt('separate', m[0]);
    },
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L2 Larut dan tidak larut
const SUBS = [['gula', 'Gula', true, 0xffffff], ['garam', 'Garam', true, 0xeeeeee], ['biji_jagung', 'Biji jagung', false, 0xfbc02d], ['kacang_hijau', 'Kacang hijau', false, 0x689f38], ['beras', 'Beras', false, 0xfff8e1]];
function L2(S, play) {
  const root = group('L2', table(1.6, 0.9, play));
  const glasses = SUBS.map(([id, label], i) => { const g = glass('gelas_' + id); g.scale.setScalar(1.3); g.position.set(-0.6 + i * 0.3, 0, -0.2); g.userData.id = id; const t = textSprite(label, { h: 0.024 }); t.position.set(0, 0.14, 0); g.add(t); root.add(g); return g; });
  const spoons = SUBS.map(([id, label, , color], i) => {
    const sp = group(id, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16), M(0xb0bec5), 0, 0.004, 0), ...bits(id === 'gula' || id === 'garam' ? 1 : 8, () => id === 'gula' || id === 'garam' ? mesh(new THREE.ConeGeometry(0.025, 0.018, 16), M(color, { roughness: 1 }), 0, 0.017, 0) : mesh(new THREE.SphereGeometry(0.006, 8, 6).scale(id === 'beras' ? 1.8 : 1, 1, 1), M(color)), 0.015, 0.012));
    sp.position.set(-0.6 + [2, 4, 0, 3, 1][i] * 0.3, 0, 0.27); sp.scale.setScalar(1.6); sp.userData.carryY = 0.13; const t = textSprite(label, { h: 0.026 }); t.position.set(0, 0.05, 0.03); sp.add(t); root.add(home(sp)); return sp;
  });
  const tc = document.createElement('canvas'); tc.width = 520; tc.height = 230; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 520, 230); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; ['Bahan', 'Pemerhatian', 'Keputusan'].forEach((h, i) => tg.fillText(h, 10 + i * 170, 28));
    tg.font = '21px system-ui'; SUBS.forEach(([id, label, sol], r) => { const y = 66 + r * 38; tg.fillText(label, 10, y); if (res[id]) { tg.fillText(sol ? 'Tidak kelihatan' : 'Masih kelihatan', 180, y); tg.fillStyle = sol ? '#2e7d32' : '#c62828'; tg.fillText(sol ? 'Larut' : 'Tidak larut', 350, y); tg.fillStyle = '#2b2340'; } }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.36, 0.16), new THREE.MeshBasicMaterial({ map: tt }), 0.5, 0.004, 0.06); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  const inGlass = new Map();
  const dr = dragger(S, () => spoons.filter(s => !inGlass.has(s)), {
    async onDrop(sp, x, y) {
      const g = glasses.find(g => nearScreen(S, g, x, y, 0.1, 70) || flat(g.position, sp.position) < 0.1);
      if (!g) return goHome(S, sp);
      if (g.userData.id !== sp.name) { S.info('Masukkan setiap bahan ke dalam gelas yang berlabel sama.'); return goHome(S, sp); }
      const stuff = sp.children.slice(1).filter(c => c.isMesh); inGlass.set(sp, g);
      await moveTo(S, sp, g.position.clone().setY(0.17)); sp.visible = false;
      stuff.forEach(m => { g.attach(m); m.position.set(rnd(-0.02, 0.02), 0.012, rnd(-0.02, 0.02)); m.scale.multiplyScalar(0.8); });
      g.userData.stuff = stuff; S.info('🥄 Tuding gelas untuk <b>mengaduk</b> campuran.');
    },
  });
  return {
    root, view: { w: 1.6, d: 0.9 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, glasses.filter(g => g.userData.stuff && !res[g.userData.id]))?.name ?? null,
    async tap(x, y) {
      const g = S.hitTest(x, y, glasses.filter(g => g.userData.stuff && !res[g.userData.id])); if (!g) return;
      const [id, label, sol] = SUBS.find(s => s[0] === g.userData.id);
      res[id] = true;
      await S.tween(1.2, t => { g.rotation.y = t * 6; if (sol) g.userData.stuff.forEach(m => m.scale.setScalar(Math.max(0.001, 0.8 * (1 - t)))); });
      draw(); S.evt('dissolve', id);
      S.info(sol ? `✨ ${label} <b>larut</b> — ${label.toLowerCase()} tidak hilang, ia larut di dalam air.` : `👀 ${label} <b>tidak larut</b> — masih kelihatan selepas diaduk.`);
    },
  };
}

// ------------------------------------------------------------ L3 Larut lebih cepat: three races
const RACES = [
  ['suhu', 'Air panas', 'Air sejuk', 0, '🔥 Gula larut lebih cepat di dalam <b>air panas</b> berbanding air sejuk.'],
  ['aduk', 'Diaduk', 'Tidak diaduk', 0, '🥄 Bahan larut lebih cepat jika <b>diaduk</b>.'],
  ['saiz', 'Gula pasir', 'Gula kiub', 0, '🧂 <b>Gula pasir</b> (saiz lebih kecil) larut lebih cepat berbanding gula kiub.'],
];
function L3(S, play) {
  const root = group('L3', table(1.3, 0.85, play));
  let r = 0, racing = false, done = false, A, B, start;
  const title = { obj: null };
  function setup() {
    for (const g of [A, B]) if (g) root.remove(g);
    if (start) root.remove(start);
    const [id, la, lb] = RACES[r];
    A = glass('gelas_a', id === 'suhu' ? 0xffab91 : 0x90caf9); B = glass('gelas_b', 0x90caf9);
    [A, B].forEach((g, i) => { g.scale.setScalar(1.6); g.position.set(-0.22 + i * 0.44, 0, -0.12); root.add(g); const t = textSprite([la, lb][i], { h: 0.035 }); t.position.set(0, 0.17, 0); g.add(t); });
    for (const [g, cube] of [[A, false], [B, id === 'saiz']]) {
      const sug = cube ? mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), M(0xffffff), 0, 0.02, 0) : mesh(new THREE.ConeGeometry(0.025, 0.015, 16), M(0xffffff, { roughness: 1 }), 0, 0.012, 0);
      sug.name = 'gula'; g.add(sug); g.userData.sugar = sug;
    }
    if (id === 'suhu') { const st = emojiSprite('♨️', 0.06); st.position.set(0, 0.14, 0); A.add(st); }
    if (id === 'aduk') { const sp = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.14), M(0xb0bec5, { metalness: 0.8 }), 0.015, 0.09, 0); sp.rotation.z = 0.3; A.add(sp); }
    start = emojiCard('mula', '⏱️', 'Mula', 0.1, { border: '#43a047' }); start.position.set(0, 0, 0.25); root.add(start);
    racing = false; done = false;
    S.info(`🏁 Perlumbaan ${r + 1}/3: <b>${la}</b> lawan <b>${lb}</b>. Gunakan sama banyak gula dan air. Tuding <b>Mula</b>.`, 8);
  }
  setup();
  return {
    root, view: { w: 1.3, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, racing ? [] : done ? [A, B] : [start])?.name ?? null,
    async tap(x, y) {
      if (!racing && !done && S.hitTest(x, y, [start]) === start) {
        racing = true; start.visible = false;
        await S.tween(3, t => { A.userData.sugar.scale.setScalar(Math.max(0.001, 1 - t * 1.6)); B.userData.sugar.scale.setScalar(Math.max(0.001, 1 - t * 0.6)); if (RACES[r][0] === 'aduk') A.rotation.y = t * 12; });
        racing = false; done = true; S.info('⏱️ Masa tamat! Tuding gelas yang gulanya <b>larut lebih cepat</b>.'); return;
      }
      if (!done) return;
      const g = S.hitTest(x, y, [A, B]); if (!g) return;
      if (g === B) return S.info('🤔 Lihat gula yang tinggal. Gelas manakah yang gulanya sudah hilang?');
      done = false; S.evt('faster', RACES[r][0]); S.star(A.position.clone().setY(0.3)); S.info(RACES[r][4], 6);
      r++; if (r < 3) setTimeout(setup, 3000);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Mengasingkan campuran', sp: 'SP 8.1.1 · 8.1.2', make: L1 },
  { id: 'L2', title: 'Larut dan tidak larut', sp: 'SP 8.1.3 · 8.1.5', make: L2 },
  { id: 'L3', title: 'Larut lebih cepat', sp: 'SP 8.1.4', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Campuran',
  intro: '<b>Sains Tahun 2 · Unit 8.</b> Asingkan campuran dan larutkan bahan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / aduk · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
