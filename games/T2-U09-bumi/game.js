// Sains Tahun 2 · Unit 9 Bumi: Air dan Udara (SP 9.1.1 – 9.2.6) — water sources, flow, water cycle, blocked drains,
// air around us, wind (👋 wave = wind) and a straw rocket.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sorter, emojiCard, cycleRing, house, tree, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const WATER = 0x42a5f5;
const blowButton = () => { const b = emojiCard('tiup', '🌬️', 'Tiup / lambai 👋', 0.1, { border: '#29b6f6' }); b.position.set(-0.55, 0, 0.3); return b; };

// ------------------------------------------------------------ L1 Sumber air semula jadi
function L1(S, play) {
  const root = group('L1', table(1.6, 0.85, play));
  const dr = sorter(S, root, {
    type: 'source', size: 0.11, gap: 0.19,
    zones: [{ id: 'semula_jadi', label: '🌧️ Sumber air semula jadi', color: 0xb3e5fc, x: -0.38, z: -0.18, w: 0.66 }, { id: 'buatan', label: '🚰 Buatan manusia', color: 0xe0e0e0, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['hujan', '🌧️', 'Hujan', 'semula_jadi'], ['sungai', '🏞️', 'Sungai', 'semula_jadi'], ['tasik', '🌊', 'Tasik', 'semula_jadi'], ['laut', '🏖️', 'Laut', 'semula_jadi'], ['mata_air', '⛲', 'Mata air', 'semula_jadi'],
      ['paip', '🚰', 'Paip air', 'buatan'], ['botol', '🍶', 'Botol air', 'buatan'], ['kolam_renang', '🏊', 'Kolam renang', 'buatan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Adakah ${label.toLowerCase()} terjadi secara semula jadi?` })),
    ok: (it, z) => `✅ ${it.label}: ${z.id === 'semula_jadi' ? '<b>sumber air semula jadi</b>' : 'dibuat oleh manusia'}.`,
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Arah aliran air: tilt the tray
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const tray = group('dulang', mesh(new THREE.BoxGeometry(0.6, 0.012, 0.2), M(0xcfd8dc), 0, 0, 0), ...[-0.3, 0.3].map(x => mesh(new THREE.BoxGeometry(0.012, 0.04, 0.2), M(0xb0bec5), x, 0.02, 0)), ...[-0.1, 0.1].map(z => mesh(new THREE.BoxGeometry(0.6, 0.04, 0.012), M(0xb0bec5), 0, 0.02, z)));
  const water = mesh(new THREE.BoxGeometry(0.58, 0.014, 0.18), M(WATER, { transparent: true, opacity: 0.6 }), 0, 0.012, 0); water.userData.fx = true; tray.add(water);
  tray.position.set(0, 0.06, -0.05); root.add(tray);
  const blocks = [-1, 1].map(s => { const b = group(s < 0 ? 'blok_kiri' : 'blok_kanan', mesh(new THREE.BoxGeometry(0.06, 0.06, 0.08), M(0x8d6e63), 0, 0.03, 0)); b.position.set(s * 0.27, 0, 0.14); b.userData.side = s; root.add(b);  // in front of the tray end it lifts
    const t = textSprite('Tinggikan', { h: 0.024 }); t.position.set(0, 0.1, 0.06); b.add(t); return b; });
  let tilted = 0; const done = new Set();
  return {
    root, view: { w: 1.3, d: 0.8 },
    hit: (x, y) => S.hitTest(x, y, blocks)?.name ?? null,
    async tap(x, y) {
      const b = S.hitTest(x, y, blocks); if (!b) return;
      const s = b.userData.side; tilted = s;
      await S.tween(0.6, k => { tray.rotation.z = -s * 0.12 * k; });
      await S.tween(1.2, k => { water.scale.x = 1 - 0.55 * k; water.position.x = s * -0.13 * k; water.scale.y = 1 + k; });
      done.add(b.name); S.evt('flow', b.name);
      S.info(`💧 Air mengalir dari tempat <b>tinggi</b> (${s < 0 ? 'kiri' : 'kanan'}) ke tempat <b>rendah</b> (${s < 0 ? 'kanan' : 'kiri'}). Air sungai dan air terjun juga mengalir ke tempat rendah, kemudian ke laut.`, 8);
      setTimeout(() => S.tween(0.6, k => { tray.rotation.z *= (1 - k); water.scale.set(1, 1, 1); water.position.x *= (1 - k); }), 2500);
    },
  };
}

// ------------------------------------------------------------ L3 Kitar air semula jadi
const waterBody = () => group('air', mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 24), M(WATER, { transparent: true, opacity: 0.8 }), 0, 0.008, 0));
const vapour = () => group('wap_air', ...[0, 1, 2].map(i => mesh(new THREE.TorusGeometry(0.012, 0.003, 6, 12, Math.PI * 1.4), M(0xe0f7fa, { transparent: true, opacity: 0.8 }), (i - 1) * 0.02, 0.03 + (i % 2) * 0.012, 0)));
const cloud = (name = 'awan', c = 0xeceff1) => group(name, ...[[-0.025, 0, 0.022], [0.0, 0.01, 0.028], [0.028, 0, 0.022]].map(([x, y, r]) => mesh(new THREE.SphereGeometry(r, 14, 10), M(c), x, 0.03 + y, 0)));
const rain = () => { const g = cloud('hujan', 0x90a4ae); for (let i = 0; i < 6; i++) g.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.014), M(WATER), (i - 2.5) * 0.01, 0.005 - (i % 2) * 0.006, 0)); return g; };
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const dr = cycleRing(S, root, [['air', 'Air', waterBody], ['wap_air', 'Wap air', vapour], ['awan', 'Awan', () => cloud()], ['hujan', 'Hujan', rain]], 'cycle', { start: 'air' });
  const sun = emojiSprite('☀️', 0.1); sun.position.set(-0.55, 0.35, -0.3); root.add(sun);
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Aliran air terganggu: unblock the drain
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const drain = group('longkang', mesh(new THREE.BoxGeometry(1.1, 0.02, 0.14), M(0x78909c), 0, 0.0, -0.15), mesh(new THREE.BoxGeometry(0.06, 0.08, 0.16), M(0x546e7a), 0.45, 0.04, -0.15));
  root.add(drain);
  const grate = group('jeriji', ...[...Array(5)].map((_, i) => mesh(new THREE.BoxGeometry(0.005, 0.07, 0.005), M(0x263238), 0.41, 0.04, -0.21 + i * 0.03))); root.add(grate);
  const flood = mesh(new THREE.BoxGeometry(1.1, 0.03, 0.14), M(0x6d8b74, { transparent: true, opacity: 0.75 }), 0, 0.02, -0.15); flood.name = 'banjir'; flood.userData.fx = true; root.add(flood);
  const mozz = []; for (let i = 0; i < 4; i++) { const m = emojiSprite('🦟', 0.04); m.position.set(-0.3 + i * 0.15, 0.12, -0.15); root.add(m); mozz.push(m); }
  const TRASH = [['botol_plastik', '🧴', 'Botol plastik'], ['tin_minuman', '🥫', 'Tin minuman'], ['plastik', '🛍️', 'Plastik'], ['kertas', '📰', 'Kertas'], ['daun', '🍂', 'Sampah daun']];
  const trash = TRASH.map(([id, e, label], i) => { const t = emojiCard(id, e, label, 0.08, { border: '#8d6e63' }); t.position.set(-0.4 + i * 0.18, 0.02, -0.15); t.rotation.z = (i % 2 ? 0.2 : -0.2); root.add(t); return t; });
  const bin = group('tong_sampah', mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 20), M(0x2e7d32), 0, 0.065, 0)); bin.position.set(-0.5, 0, 0.25); root.add(bin);
  const bl = textSprite('Tong sampah', { h: 0.026 }); bl.position.set(-0.5, 0.17, 0.25); root.add(bl);
  const town = house('rumah'); town.position.set(0.45, 0, 0.2); town.scale.setScalar(0.8); root.add(town);
  let t = 0; const cleared = new Set();
  const dr = dragger(S, () => trash.filter(o => !cleared.has(o)), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, bin, x, y, 0.1, 80) || flat(o.position, bin.position) < 0.12)) return moveTo(S, o, o.position.clone().setY(0.02));
      cleared.add(o); moveTo(S, o, bin.position.clone().setY(0.1)).then(() => o.visible = false); S.evt('clear', o.name);
      const left = trash.length - cleared.size;
      S.tween(0.6, k => { flood.scale.y = Math.max(0.05, (left + 1 - k) / 6); flood.material.color.lerp(new THREE.Color(0x64b5f6), 0.2); });
      mozz.slice(left).forEach(m => m.visible = false);
      S.info(left ? `🗑️ Sampah dibuang. Tinggal ${left} lagi.` : '💧 Air mengalir semula! Aliran air yang terganggu boleh menyebabkan <b>banjir kilat</b>, <b>pembiakan nyamuk</b> dan <b>air sungai berbau</b>.', 9);
    },
  });
  setTimeout(() => S.info('⚠️ Longkang tersumbat! Air bertakung, nyamuk membiak. Buang sampah ke dalam tong sampah.', 7), 500);
  return { root, view: { w: 1.5, d: 0.85 }, ...dr, update(dt) { t += dt; mozz.forEach((m, i) => { m.position.y = 0.12 + Math.sin(t * 6 + i) * 0.02; }); } };
}

// ------------------------------------------------------------ L5 Udara di sekeliling kita
function L5(S, play) {
  const root = group('L5', table(1.5, 0.85, play));
  const jar = group('balang_tanah', mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.07, 0), mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.07, 24), M(0x6d4c2f, { roughness: 1 }), 0, 0.035, 0));
  jar.position.set(-0.45, 0, -0.18); root.add(jar);
  const tank = group('akuarium', mesh(new THREE.BoxGeometry(0.24, 0.14, 0.12), M(0xe1f5fe, { transparent: true, opacity: 0.25, depthWrite: false }), 0, 0.07, 0), mesh(new THREE.BoxGeometry(0.23, 0.11, 0.11), M(WATER, { transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.058, 0));
  const pump = mesh(new THREE.BoxGeometry(0.04, 0.03, 0.03), M(0x37474f), 0.13, 0.015, 0.08); pump.name = 'pam_udara'; tank.add(pump); tank.position.set(0.0, 0, -0.18); root.add(tank);
  for (const [o, t] of [[jar, 'Tanah'], [tank, 'Air']]) { const l = textSprite(t, { h: 0.028 }); l.position.set(o.position.x, 0.2, -0.18); root.add(l); }
  const water = emojiCard('air_siram', '💧', 'Air', 0.09, { border: '#1e88e5' }); water.position.set(-0.45, 0, 0.25); root.add(home(water));
  const boy = kid('murid', { shirt: 0x42a5f5 }); boy.scale.setScalar(1.4); boy.position.set(0.45, 0, -0.2); root.add(boy);
  const arrows = [['masuk', '⬅️ Tarik nafas', 0.1], ['keluar', '➡️ Hembus nafas', -0.02]].map(([id, label, dz]) => { const a = emojiCard('nafas_' + id, '', label, 0.055, { border: '#7e57c2' }); a.position.set(0.45, 0, 0.07 + dz); a.visible = false; root.add(a); a.userData.id = id; return a; });
  const gases = [['oksigen', 'Oksigen', 'masuk'], ['karbon_dioksida', 'Karbon dioksida', 'keluar']].map(([id, label, dir], i) => { const c = emojiCard(id, '', label, 0.065, { border: '#00897b' }); c.userData.dir = dir; c.position.set(0.0 + i * 0.22, 0, 0.3); c.visible = false; root.add(home(c)); return c; });
  const bubbles = []; let soilAir = false, waterAir = false; const placed = new Set();
  const spawn = (at, n = 12) => { for (let i = 0; i < n; i++) { const b = mesh(new THREE.SphereGeometry(0.004 + Math.random() * 0.003), M(0xffffff, { transparent: true, opacity: 0.8 })); b.userData.fx = true; b.position.copy(at).add(new THREE.Vector3((Math.random() - 0.5) * 0.06, Math.random() * 0.02, (Math.random() - 0.5) * 0.04)); b.userData.v = 0.03 + Math.random() * 0.03; b.userData.top = at.y + 0.08; root.add(b); bubbles.push(b); } };
  const next = () => { if (soilAir && waterAir) { arrows.forEach(a => a.visible = true); gases.forEach(g => g.visible = true); S.info('🫧 Udara ada di dalam air dan tanah! Udara terdiri daripada gas seperti oksigen dan karbon dioksida. Letakkan kad gas pada arah nafas.', 9); } };
  const dr = dragger(S, () => [...(!soilAir ? [water] : []), ...gases.filter(g => g.visible && !placed.has(g))], {
    onDrop(o, x, y) {
      if (o === water) {
        if (!(nearScreen(S, jar, x, y, 0.1, 80) || flat(o.position, jar.position) < 0.12)) return goHome(S, o);
        soilAir = true; o.visible = false; spawn(jar.position.clone().setY(0.075)); S.evt('air', 'tanah'); S.info('🫧 Gelembung udara keluar dari tanah — <b>ada udara di dalam tanah</b>.'); return next();
      }
      const a = arrows.find(a => flat(a.position, o.position) < 0.08);
      if (!a) return goHome(S, o);
      if (a.userData.id !== o.userData.dir) { S.info('🤔 Gas manakah yang diperlukan untuk bernafas, dan yang manakah dibebaskan?'); return goHome(S, o); }
      placed.add(o); moveTo(S, o, a.position.clone().add(new THREE.Vector3(-0.17, 0, 0))); S.evt('gas', o.name);
      S.info(o.name === 'oksigen' ? '✅ <b>Oksigen</b> diperlukan oleh benda hidup untuk bernafas.' : '✅ <b>Karbon dioksida</b> dibebaskan semasa benda hidup bernafas.');
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => (!waterAir ? S.hitTest(x, y, [tank])?.name ?? null : null),
    tap(x, y) {
      if (waterAir || S.hitTest(x, y, [tank]) !== tank) return;
      waterAir = true; spawn(tank.position.clone().add(new THREE.Vector3(0.1, 0.01, 0)), 16); S.evt('air', 'air');
      S.info('🐟 Gelembung udara di dalam akuarium — <b>ada udara di dalam air</b>. Ikan bernafas menggunakan udara di dalam air.'); next();
    },
    update(dt) { for (const b of [...bubbles]) { b.position.y += b.userData.v * dt * 2; if (b.position.y > b.userData.top) { b.position.y = b.userData.top - 0.08; } } },
  };
}

// ------------------------------------------------------------ L6 Angin: 👋 wave a hand (or the button) to make wind
function L6(S, play) {
  const root = group('L6', table(1.5, 0.85, play));
  const sea = mesh(new THREE.BoxGeometry(0.5, 0.01, 0.3), M(WATER, { transparent: true, opacity: 0.7 }), -0.38, 0.005, -0.15); sea.userData.fx = true; root.add(sea);
  const boat = group('kapal_layar', mesh(new THREE.BoxGeometry(0.1, 0.02, 0.04), M(0x8d6e63), 0, 0.02, 0), mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.1), M(0x5d4037), 0, 0.07, 0), mesh(new THREE.ConeGeometry(0.035, 0.07, 3).rotateZ(-Math.PI / 2).scale(0.6, 1, 0.1), M(0xef5350, { side: THREE.DoubleSide }), 0.02, 0.07, 0));
  boat.position.set(-0.55, 0, -0.15); root.add(boat);
  const mill = group('kincir_angin', mesh(new THREE.CylinderGeometry(0.01, 0.018, 0.2), M(0xeeeeee), 0, 0.1, 0));
  const blades = group('bilah', ...[0, 1, 2, 3].map(i => mesh(new THREE.BoxGeometry(0.012, 0.08, 0.004), M(0x90a4ae), 0, 0.04, 0).rotateZ(i * Math.PI / 2).translateY(0)));
  blades.children.forEach((b, i) => { b.geometry.translate(0, 0.04, 0); b.rotation.z = i * Math.PI / 2; b.position.set(0, 0, 0); });
  blades.position.set(0, 0.2, 0.012); mill.add(blades); mill.position.set(-0.05, 0, -0.2); root.add(mill);
  const kite = group('layang_layang', mesh(new THREE.ConeGeometry(0.04, 0.08, 4).scale(1, 1, 0.1), M(0xfdd835, { side: THREE.DoubleSide }), 0, 0, 0)); kite.position.set(0.25, 0.03, -0.15); kite.rotation.x = -1.2; root.add(kite);
  const line = mesh(new THREE.CylinderGeometry(0.0007, 0.0007, 1), M(0x555555)); line.userData.fx = true; root.add(line);
  const shirt = group('pakaian', mesh(new THREE.BoxGeometry(0.06, 0.07, 0.004), M(0x7986cb), 0, -0.04, 0)); const pole = mesh(new THREE.BoxGeometry(0.3, 0.004, 0.004), M(0x5d4037), 0.5, 0.2, -0.15); root.add(pole);
  shirt.position.set(0.5, 0.2, -0.15); root.add(shirt);
  const drip = emojiSprite('💧', 0.035); drip.position.set(0, -0.09, 0); shirt.add(drip);
  for (const [o, t] of [[boat, 'Kapal layar'], [mill, 'Kincir angin'], [kite, 'Layang-layang'], [shirt, 'Pakaian basah']]) { const l = textSprite(t, { h: 0.024 }); l.position.set(o.position.x, 0.02, 0.08); root.add(l); }
  const btn = blowButton(); root.add(btn);
  let gust = 0, windy = false, hits = [], storm = false, spin = 0, t = 0;
  function wind() {
    const now = performance.now() / 1000; hits = hits.filter(h => now - h < 6); hits.push(now);
    gust = 3;
    if (!windy) { windy = true; S.evt('wind', 'angin'); S.info('🌬️ <b>Udara bergerak ialah angin.</b> Angin tidak dapat dilihat tetapi dapat dirasai: kapal layar bergerak, kincir angin berputar, layang-layang terbang, pakaian kering!', 9); drip.visible = false; return; }
    if (hits.length >= 3 && !storm) {
      storm = true; S.evt('storm', 'angin_kencang');
      const roof = town.children[1]; S.tween(1.5, k => { roof.position.set(k * 0.2, 0.175 + Math.sin(k * Math.PI) * 0.15, 0); roof.rotation.z = k * 2; });
      S.tween(1, k => { treeTop.rotation.z = -k * 0.6; });
      S.info('🌪️ <b>Angin kencang</b> menyebabkan ombak besar, mengancam nyawa dan memusnahkan harta benda!', 9);
    }
  }
  const town = house('rumah'); town.position.set(0.25, 0, 0.2); town.scale.setScalar(0.7); root.add(town);
  const treeTop = tree('pokok', 0.18); treeTop.position.set(0.45, 0, 0.25); root.add(treeTop);
  return {
    root, view: { w: 1.5, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, [btn])?.name ?? null,
    tap(x, y) { if (S.hitTest(x, y, [btn]) === btn) wind(); },
    wind,
    update(dt) {
      t += dt; const g = Math.max(0, gust); gust -= dt;
      spin += dt * (0.5 + g * 6); blades.rotation.z = spin;
      if (g > 0) { boat.position.x = Math.min(-0.2, boat.position.x + dt * 0.05); kite.position.y = Math.min(0.4, kite.position.y + dt * 0.15); kite.position.x = 0.25 + Math.sin(t * 3) * 0.02; shirt.rotation.x = Math.sin(t * 12) * 0.4 * Math.min(1, g); }
      else { kite.position.y = Math.max(0.03, kite.position.y - dt * 0.05); shirt.rotation.x *= 0.9; }
      sea.position.y = 0.005 + (storm ? Math.abs(Math.sin(t * 4)) * 0.02 : 0);
      const a = new THREE.Vector3(0.15, 0.01, 0.0), b = kite.position; line.position.lerpVectors(a, b, 0.5); line.scale.y = a.distanceTo(b); line.lookAt(b); line.rotateX(Math.PI / 2);
    },
  };
}

// ------------------------------------------------------------ L7 Roket angin
function L7(S, play) {
  const root = group('L7', table(1.3, 0.8, play));
  const rocket = group('roket', mesh(new THREE.ConeGeometry(0.03, 0.05, 16), M(0xef5350), 0, 0.14, 0), mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 16), M(0xfafafa), 0, 0.07, 0), ...[-1, 1].map(s => mesh(new THREE.BoxGeometry(0.004, 0.04, 0.03), M(0xef5350), s * 0.03, 0.035, 0)), mesh(new THREE.CircleGeometry(0.012, 16), M(0x42a5f5), 0, 0.09, 0.031));
  rocket.position.set(-0.3, 0, -0.1); rocket.scale.setScalar(1.3); root.add(rocket);
  const shortStraw = group('straw_pendek', mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12), M(0xf48fb1), 0, 0.03, 0)); shortStraw.position.set(0.1, 0, 0.25); root.add(home(shortStraw));
  const longStraw = group('straw_panjang', mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 12), M(0x4fc3f7), 0, 0.1, 0)); longStraw.position.set(0.35, 0, 0.25); root.add(home(longStraw));
  for (const [o, t] of [[shortStraw, 'Straw pendek (6 cm)'], [longStraw, 'Straw panjang']]) { const l = textSprite(t, { h: 0.024 }); l.position.set(0, 0.0, 0.05); o.add(l); }
  const btn = blowButton(); btn.position.set(0.45, 0, -0.2); root.add(btn);
  let stage = 0;
  const dr = dragger(S, () => (stage === 0 ? [shortStraw] : stage === 1 ? [longStraw] : []), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, rocket, x, y, 0.08, 90) || flat(o.position, rocket.position) < 0.12)) return goHome(S, o);
      if (o === shortStraw) { stage = 1; rocket.attach(o); o.position.set(0, -0.02, -0.035); S.evt('build', 'straw_pendek'); return S.info('✂️ Straw pendek dilekatkan pada roket kertas. Masukkan <b>straw panjang</b> ke dalam straw pendek.'); }
      stage = 2; o.position.copy(rocket.position).add(new THREE.Vector3(0, -0.12, -0.045)); S.evt('build', 'straw_panjang');
      S.info('🚀 Roket angin siap! <b>Tiup</b> straw — lambai tangan 👋 atau tuding butang Tiup.');
    },
  });
  async function blow() {
    if (stage !== 2) return S.info('Bina roket dahulu.');
    stage = 3; const y0 = rocket.position.y;
    await S.tween(1.6, k => { rocket.position.y = y0 + Math.sin(k * Math.PI) * 0.45; rocket.position.x = -0.3 + k * 0.4; rocket.rotation.z = -k * 0.6; });
    S.evt('launch', 'roket'); S.info('🚀 <b>Udara yang bergerak menerbangkan roket!</b>', 8);
  }
  return {
    root, view: { w: 1.3, d: 0.8 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [btn])?.name ?? null,
    tap(x, y) { if (S.hitTest(x, y, [btn]) === btn) blow(); },
    wind: blow,
  };
}

const LEVELS = [
  { id: 'L1', title: 'Sumber air semula jadi', sp: 'SP 9.1.1', make: L1 },
  { id: 'L2', title: 'Arah aliran air', sp: 'SP 9.1.2 · 9.1.3', make: L2 },
  { id: 'L3', title: 'Kitar air semula jadi', sp: 'SP 9.1.4 · 9.1.5', make: L3 },
  { id: 'L4', title: 'Aliran air terganggu', sp: 'TP 5 – 6', make: L4 },
  { id: 'L5', title: 'Udara di sekeliling kita', sp: 'SP 9.2.1 · 9.2.2', make: L5 },
  { id: 'L6', title: 'Angin', sp: 'SP 9.2.3 · 9.2.4', make: L6 },
  { id: 'L7', title: 'Mencipta roket angin', sp: 'SP 9.2.5 · 9.2.6', make: L7 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bumi — Air dan Udara',
  intro: '<b>Sains Tahun 2 · Unit 9.</b> Air dan udara di sekeliling kita! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = angin · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
