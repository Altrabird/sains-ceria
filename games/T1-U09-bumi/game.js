// Sains Tahun 1 · Unit 9 Bumi (SP 9.1.1, 9.2.1 – 9.2.3) — landforms, soil types, soil in a jar, a simple water filter.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, magnifier, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const SEA = 0x2196f3, GRASS = 0x7cb342;
const flat2 = (w, d, color, x, z, y = 0.002, o = {}) => mesh(new THREE.BoxGeometry(w, 0.004, d), M(color, o), x, y, z);
const disc = (r, color, x, z, sx = 1, sz = 1, y = 0.004) => { const m = mesh(new THREE.CylinderGeometry(r, r, 0.004, 32), M(color, { roughness: 0.3 }), x, y, z); m.scale.set(sx, 1, sz); return m; };

// ------------------------------------------------------------ L1 Bentuk muka bumi: flag each landform
function landscape() {
  const g = group('landskap', flat2(1.4, 0.9, GRASS, 0, 0, 0.002));
  const sea = flat2(0.42, 0.9, SEA, 0.5, 0, 0.006, { roughness: 0.2 }); g.add(sea);
  g.add(flat2(0.1, 0.9, 0xf2d79b, 0.25, 0, 0.005));  // beach
  const mountain = group('', mesh(new THREE.ConeGeometry(0.16, 0.32, 7), M(0x8d8d8d, { flatShading: true }), 0, 0.16, 0), mesh(new THREE.ConeGeometry(0.06, 0.12, 7), M(0xffffff, { flatShading: true }), 0, 0.27, 0));
  mountain.position.set(-0.48, 0, -0.27); g.add(mountain);
  for (const x of [-0.2, 0.06]) { const h = mesh(new THREE.SphereGeometry(0.11, 20, 12, 0, 6.3, 0, 1.57).scale(1, 0.8, 1), M(0x8bc34a), x, 0, -0.3); g.add(h); }
  // river from the mountain foot to the sea
  const curve = new THREE.CatmullRomCurve3([[-0.4, -0.12], [-0.25, -0.05], [-0.05, -0.08], [0.1, 0.0], [0.3, -0.05]].map(([x, z]) => new THREE.Vector3(x, 0.006, z)));
  const river = mesh(new THREE.TubeGeometry(curve, 40, 0.022, 6).scale(1, 0.15, 1), M(0x42a5f5, { roughness: 0.2 })); g.add(river);
  g.add(disc(0.12, 0x1e88e5, -0.32, 0.22, 1.3, 0.8));  // lake
  g.add(disc(0.045, 0x4fc3f7, 0.08, 0.28));              // pond
  for (let i = 0; i < 6; i++) g.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.05), M(0x558b2f), 0.08 + Math.cos(i) * 0.055, 0.025, 0.28 + Math.sin(i) * 0.055));
  for (const [x, z] of [[-0.05, 0.12], [0.15, 0.15], [-0.6, 0.05]]) g.add(mesh(new THREE.ConeGeometry(0.03, 0.08, 8), M(0x2e7d32), x, 0.04, z), mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02), M(0x6d4c41), x, 0.008, z));
  return g;
}
const LAND = [['gunung', 'Gunung', [-0.48, 0.33, -0.27]], ['bukit', 'Bukit', [-0.2, 0.1, -0.3]], ['lembah', 'Lembah', [-0.07, 0.02, -0.32]], ['sungai', 'Sungai', [-0.05, 0.01, -0.08]],
  ['pantai', 'Pantai', [0.25, 0.01, 0.15]], ['laut', 'Laut', [0.52, 0.01, -0.05]], ['tasik', 'Tasik', [-0.32, 0.01, 0.22]], ['kolam', 'Kolam', [0.08, 0.01, 0.28]]];
function L1(S, play) {
  const root = group('L1', landscape());
  const anchors = LAND.map(([id, , p]) => { const a = new THREE.Object3D(); a.name = 'tempat_' + id; a.position.set(...p); root.add(a); return a; });
  const flags = LAND.map(([id, label], i) => {
    const f = emojiCard('bendera_' + id, '', label, 0.085, { border: '#e65100' }); f.userData.id = id;
    f.position.set(-0.48 + (i % 4) * 0.32, 0, 0.5 + Math.floor(i / 4) * 0.13); root.add(home(f)); return f;
  });
  const shelf = flat2(1.5, 0.27, 0xfff3e0, 0, 0.565, 0.003); root.add(shelf);
  const placed = new Set();
  const dr = dragger(S, () => flags.filter(f => !placed.has(f)), {
    onDrop(f, x, y) {
      const a = S.nearest(x, y, anchors, 55);  /* nearest landform on screen, never the first in the list */
      if (!a) return goHome(S, f);
      if (a.name !== 'tempat_' + f.userData.id) {
        const was = LAND.find(l => 'tempat_' + l[0] === a.name)[1];
        S.info(`🤔 Itu bukan ${LAND.find(l => l[0] === f.userData.id)[1].toLowerCase()} — cuba lagi! (Petunjuk: tempat itu ialah ${was.toLowerCase()}.)`);
        return goHome(S, f);
      }
      placed.add(f); moveTo(S, f, a.position.clone().setY(a.position.y));
      S.evt('landform', f.userData.id); S.star(a.position.clone().setY(a.position.y + 0.12));
      S.info(`✅ <b>${LAND.find(l => l[0] === f.userData.id)[1]}</b>.` + (placed.size === 8 ? ' Ada <b>lapan</b> bentuk muka bumi!' : ''));
    },
  });
  return { root, view: { w: 1.5, d: 1.15 }, ...dr };
}

// ------------------------------------------------------------ soil piles (L2, L3)
const SOIL = {
  kebun: { label: 'Tanah kebun', color: 0x5d4037, has: ['🌿 ranting kayu', '🍂 daun kering', '⚫ batu', '⏳ butir pasir', '🐛 haiwan kecil'] },
  liat: { label: 'Tanah liat', color: 0xc1693c, has: ['🟤 butir-butir tanah yang sangat halus'] },
  pasir: { label: 'Pasir', color: 0xe6c88a, has: ['⚫ batu', '⏳ butir pasir'] },
};
function pile(id) {
  const s = SOIL[id], g = group('timbunan_' + id, mesh(new THREE.ConeGeometry(0.1, 0.06, 24), M(s.color, { roughness: 1, flatShading: id !== 'liat' }), 0, 0.03, 0));
  if (id === 'kebun') { g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08), M(0x795548), 0.01, 0.045, 0.02).rotateZ(1.2), mesh(new THREE.SphereGeometry(0.014, 8, 6).scale(1.4, 0.2, 1), M(0xd84315), -0.03, 0.04, 0.03)); }
  if (id !== 'liat') for (let i = 0; i < 4; i++) g.add(mesh(new THREE.DodecahedronGeometry(0.008), M(0x9e9e9e, { flatShading: true }), Math.cos(i * 1.6) * 0.07, 0.008, Math.sin(i * 1.6) * 0.07));
  return g;
}

// ------------------------------------------------------------ L2 Jenis dan kandungan tanah: magnify, then name
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const piles = ['pasir', 'kebun', 'liat'].map((id, i) => { const p = pile(id); p.position.set(-0.4 + i * 0.4, 0, -0.15); p.userData.id = id; root.add(p); return p; });
  const lens = magnifier(); lens.scale.setScalar(1.4); lens.position.set(0.55, 0, 0.3); lens.userData.carryY = 0.06; root.add(home(lens));
  const seen = new Set(), named = new Set(); let cardsOn = false;
  const cards = Object.entries(SOIL).map(([id, s], i) => { const c = emojiCard('nama_' + id, '', s.label, 0.06, { border: '#6d4c41' }); c.userData.id = id; c.position.set(-0.4 + i * 0.3, 0, 0.3); c.visible = false; root.add(home(c)); return c; });
  const shown = {};
  const dr = dragger(S, () => (cardsOn ? cards.filter(c => !named.has(c)) : [lens]), {
    onDrag(o) {
      if (o !== lens) return;
      const p = piles.find(p => flat(p.position, o.position) < 0.1);
      if (!p || seen.has(p)) return;
      seen.add(p); S.evt('inspect', p.userData.id);
      const list = SOIL[p.userData.id].has; S.info(`🔍 Kandungan: ${list.join(', ')}.`, 7);
      const t = textSprite(list.map(l => l.split(' ')[0]).join(' '), { h: 0.04 }); t.position.set(0, 0.13, 0); p.add(t); shown[p.userData.id] = t;
      if (seen.size === 3) { cardsOn = true; goHome(S, lens); cards.forEach(c => c.visible = true); setTimeout(() => S.info('🏷️ Sekarang letakkan nama pada setiap jenis tanah.'), 2500); }
    },
    onDrop(o) {
      if (o === lens) return;
      const p = piles.find(p => flat(p.position, o.position) < 0.13);
      if (!p) return goHome(S, o);
      if (p.userData.id !== o.userData.id) { S.info(`🤔 Lihat kandungannya sekali lagi: ${SOIL[p.userData.id].has.join(', ')}.`); return goHome(S, o); }
      named.add(o); moveTo(S, o, p.position.clone().add(new THREE.Vector3(0, 0, 0.13)));
      S.evt('name', o.userData.id); S.info(`✅ <b>${SOIL[o.userData.id].label}</b> — ${SOIL[o.userData.id].has.join(', ')}.`);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L3 Bandingkan kandungan tanah: jar, water, shake, settle
function jar(name) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, 0.08, 0),
    mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 24), M(0x1e88e5), 0, 0.17, 0));
  const water = mesh(new THREE.CylinderGeometry(0.047, 0.047, 1, 24), M(0x90caf9, { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0, 0); water.name = 'air'; water.scale.y = 0.0001; water.userData.fx = true; g.add(water);
  const layers = group('lapisan'); g.add(layers);
  return g;
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const ids = ['kebun', 'liat', 'pasir'];
  const jars = ids.map((id, i) => { const j = jar('balang_' + id); j.position.set(-0.35 + i * 0.35, 0, -0.18); j.userData.id = id; root.add(j); const t = textSprite(SOIL[id].label, { h: 0.032 }); t.position.set(0, 0.24, 0); j.add(t); return j; });
  const piles = ids.map((id, i) => { const p = pile(id); p.scale.setScalar(0.6); p.position.set(-0.35 + i * 0.35, 0, 0.25); p.userData.id = id; root.add(home(p)); return p; });
  const filled = new Set(), shaken = new Set(); let settled = false, chosen = false;
  function fill(j) {
    const L = j.getObjectByName('lapisan'), c = SOIL[j.userData.id].color;
    L.add(mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 24), M(c, { roughness: 1 }), 0, 0.017, 0));
    const w = j.getObjectByName('air'); S.tween(1, k => { w.scale.y = Math.max(0.0001, k * 0.13); w.position.y = k * 0.065 + 0.002; });
  }
  async function shake(j) {
    if (!filled.has(j) || shaken.has(j)) return;
    shaken.add(j); const x0 = j.position.x;
    const w = j.getObjectByName('air'); w.material.color.set(SOIL[j.userData.id].color); w.material.opacity = 0.85;
    j.getObjectByName('lapisan').visible = false;
    await S.tween(1, k => { j.position.x = x0 + Math.sin(k * Math.PI * 8) * 0.02; j.rotation.z = Math.sin(k * Math.PI * 8) * 0.15; });
    S.evt('shake', j.userData.id);
    if (shaken.size === 3) settle();
    else S.info(`🥤 Balang ${SOIL[j.userData.id].label.toLowerCase()} digoncang. Goncang balang lain.`);
  }
  async function settle() {
    S.info('⏱️ Biarkan selama 30 minit…', 3);
    const clock = textSprite('⏱️ 30 minit', { h: 0.05, bg: '#fff59dee' }); clock.position.set(0, 0.35, -0.18); root.add(clock);
    await S.wait(2.5); root.remove(clock);
    for (const j of jars) {
      const id = j.userData.id, L = j.getObjectByName('lapisan'); L.clear(); L.visible = true;
      const w = j.getObjectByName('air'), band = (h, c, y) => L.add(mesh(new THREE.CylinderGeometry(0.046, 0.046, h, 24), M(c, { roughness: 1 }), 0, y, 0));
      if (id === 'kebun') { band(0.012, 0x9e9e9e, 0.008); band(0.012, 0xe6c88a, 0.02); band(0.012, 0x5d4037, 0.032); w.material.color.set(0x8d6e63); w.material.opacity = 0.6;
        for (let i = 0; i < 5; i++) L.add(mesh(new THREE.BoxGeometry(0.018, 0.003, 0.008), M(i % 2 ? 0x795548 : 0xd84315), (i - 2) * 0.016, 0.128, (i % 3 - 1) * 0.015)); }
      if (id === 'liat') { band(0.02, 0xc1693c, 0.012); w.material.color.set(0xd7a27a); w.material.opacity = 0.75; }
      if (id === 'pasir') { band(0.01, 0x9e9e9e, 0.006); band(0.018, 0xe6c88a, 0.02); w.material.color.set(0x90caf9); w.material.opacity = 0.45; }
    }
    settled = true; S.evt('settle', 'balang');
    S.info('👀 Perhatikan: tanah kebun ada bahan <b>terapung</b> (ranting, daun); tanah liat menjadikan air <b>keruh</b>; pasir mendap dan air <b>jernih</b>. Tuding balang yang paling banyak bahan terapung.', 12);
  }
  const dr = dragger(S, () => piles.filter(p => !filled.has(jars.find(j => j.userData.id === p.userData.id))), {
    onDrop(p, x, y) {
      const j = S.closest(jars, x, y, j => flat(j.position, p.position) < 0.1 || nearScreen(S, j, x, y, 0.16));
      if (!j) return goHome(S, p);
      if (j.userData.id !== p.userData.id) { S.info('Masukkan tanah ke dalam balang yang berlabel sama.'); return goHome(S, p); }
      p.visible = false; filled.add(j); fill(j); S.evt('fill', j.userData.id);
      S.info(filled.size < 3 ? `🥤 ${SOIL[j.userData.id].label} dan air dimasukkan ke dalam balang.` : '🥤 Semua balang ada tanah dan air. Tutup dan <b>goncangkan</b> balang: tuding setiap balang, atau 👋 lambai tangan.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, jars)?.name ?? null,
    tap(x, y) {
      const j = S.hitTest(x, y, jars); if (!j) return;
      if (!settled) { if (filled.size < 3) return S.info('Masukkan tanah ke dalam <b>semua</b> balang dahulu.'); return shake(j); }
      if (chosen) return;
      if (j.userData.id !== 'kebun') return S.info('🤔 Lihat bahagian atas air. Balang manakah yang ada ranting dan daun terapung?');
      chosen = true; S.evt('compare', 'kebun'); S.star(j.position.clone().setY(0.3)); S.info('✅ <b>Tanah kebun</b> mengandungi ranting kayu dan daun kering yang terapung.');
    },
    wind() { if (filled.size === 3 && !settled) jars.forEach(shake); },
  };
}

// ------------------------------------------------------------ L4 Kegunaan tanah: build a simple water filter
function L4(S, play) {
  const root = group('L4', table(1.3, 0.85, play));
  const bottle = group('penapis', mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.22, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, 0.27, 0),
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, 0.07, 0));
  bottle.position.set(0.05, 0, -0.12); root.add(bottle);
  const cup = mesh(new THREE.CylinderGeometry(0.048, 0.048, 1, 24), M(0x81d4fa, { transparent: true, opacity: 0.7 })); cup.scale.y = 0.0001; cup.userData.fx = true; bottle.add(cup);
  const LAYERS = [['kapas', 'Kapas', 0xffffff, 0.17], ['pasir', 'Pasir', 0xe6c88a, 0.2], ['batu_kecil', 'Batu-batu kecil', 0x9e9e9e, 0.235]];
  const tubs = LAYERS.map(([id, label, color], i) => {
    const t = group(id, mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.035, 20), M(0x90a4ae), 0, 0.018, 0), id === 'batu_kecil'
      ? group('', ...[...Array(7)].map((_, k) => mesh(new THREE.DodecahedronGeometry(0.01), M(color, { flatShading: true }), Math.cos(k) * 0.02, 0.04, Math.sin(k) * 0.02)))
      : mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 20), M(color, { roughness: 1 }), 0, 0.036, 0));
    const l = textSprite(label, { h: 0.03 }); l.position.set(0, 0.075, 0); t.add(l);
    t.position.set([-0.4, 0.45, -0.15][i], 0, [0.25, 0.25, 0.3][i]); t.userData.color = color; t.userData.y = LAYERS[i][3]; root.add(home(t)); return t;
  });
  const muddy = group('air_keruh', mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 20), M(0x8d6e63, { transparent: true, opacity: 0.85 }), 0, 0.05, 0));
  const ml = textSprite('Air keruh', { h: 0.03 }); ml.position.set(0, 0.13, 0); muddy.add(ml); muddy.position.set(-0.45, 0, -0.15); muddy.visible = false; root.add(muddy);
  const ORDER = ['kapas', 'pasir', 'batu_kecil']; let next = 0, poured = false;
  const dr = dragger(S, () => tubs.filter(t => t.visible), {
    onDrop(t, x, y) {
      if (!(flat(t.position, bottle.position) < 0.12 || nearScreen(S, bottle, x, y, 0.27, 80))) return goHome(S, t);
      if (t.name !== ORDER[next]) { S.info(`🤔 Mula dari bawah: <b>${LAYERS[next][1].toLowerCase()}</b> dahulu.`); return goHome(S, t); }
      next++; t.visible = false;
      bottle.add(mesh(new THREE.CylinderGeometry(0.058 + next * 0.004, 0.056 + next * 0.004, 0.035, 24), M(t.userData.color, { roughness: 1, flatShading: t.name === 'batu_kecil' }), 0, t.userData.y, 0));
      S.evt('layer', t.name);
      S.info(next < 3 ? `✅ Lapisan ${LAYERS[next - 1][1].toLowerCase()}.` : '✅ Penapis air ringkas siap! Tuding <b>air keruh</b> untuk menuangnya.');
      if (next === 3) muddy.visible = true;
    },
  });
  return {
    root, view: { w: 1.3, d: 0.85 }, ...dr,
    hit: (x, y) => (muddy.visible && !poured ? S.hitTest(x, y, [muddy])?.name ?? null : null),
    async tap(x, y) {
      if (!muddy.visible || poured || S.hitTest(x, y, [muddy]) !== muddy) return;
      poured = true;
      await S.tween(0.8, k => { muddy.position.set(-0.45 + k * 0.45, k * 0.3, -0.15 + k * 0.03); muddy.rotation.z = -k * 1.6; });
      for (let i = 0; i < 10; i++) { const d = mesh(new THREE.SphereGeometry(0.005), M(0x4fc3f7)); d.userData.fx = true; d.position.set(0.05, 0.14, -0.12); root.add(d); S.tween(0.5, k => d.position.y = 0.14 - k * 0.1, () => root.remove(d)); await S.wait(0.15); }
      await S.tween(1.5, k => { cup.scale.y = Math.max(0.0001, k * 0.07); cup.position.y = k * 0.035 + 0.003; });
      muddy.visible = false;
      S.evt('filter', 'air'); S.info('💧 Air yang keluar lebih <b>jernih</b>! Batu-batu kecil dan pasir digunakan untuk membuat penapis air ringkas.');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Bentuk muka bumi', sp: 'SP 9.1.1', make: L1 },
  { id: 'L2', title: 'Jenis dan kandungan tanah', sp: 'SP 9.2.1 · 9.2.2', make: L2 },
  { id: 'L3', title: 'Bandingkan kandungan tanah', sp: 'SP 9.2.2 · 9.2.3', make: L3 },
  { id: 'L4', title: 'Kegunaan tanah', sp: 'DSKP hlm. 46', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bumi',
  intro: '<b>Sains Tahun 1 · Unit 9.</b> Terokai bumi dan tanah! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = goncang · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
