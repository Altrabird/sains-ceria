// Sains Tahun 3 · Unit 7 Ketumpatan (SP 7.1.1 – 7.1.4) — float or sink, salt makes water denser, oil on water, applications.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const WATER = 0x4fc3f7;
// glass tank: width w, water surface at y = h; objects dropped in fall, then settle at the surface or the bottom
function tank(name, w = 0.5, d = 0.22, h = 0.2) {
  const g = group(name, mesh(new THREE.BoxGeometry(w, h + 0.04, d), M(0xe1f5fe, { transparent: true, opacity: 0.2, depthWrite: false }), 0, (h + 0.04) / 2, 0),
    mesh(new THREE.BoxGeometry(w - 0.01, 0.015, d - 0.01), M(0xe6c88a), 0, 0.008, 0));
  const water = mesh(new THREE.BoxGeometry(w - 0.012, h - 0.015, d - 0.012), M(WATER, { transparent: true, opacity: 0.4, depthWrite: false }), 0, 0.015 + (h - 0.015) / 2, 0); water.name = 'air'; water.userData.fx = true; g.add(water);
  g.userData = { w, d, h, water }; return g;
}
async function settle(S, T, o, floats, at = 0, half = 0.02) {  // drop o into tank T at local x
  T.attach(o); const y0 = T.userData.h + 0.12; o.position.set(at, y0, 0);
  const yEnd = floats ? T.userData.h - half * 0.4 : 0.015 + half;
  await S.tween(floats ? 0.6 : 1.2, k => { o.position.y = y0 + (yEnd - y0) * k; });
  if (floats) await S.tween(0.6, k => o.position.y = yEnd + Math.sin(k * Math.PI * 2) * 0.01);
}

// ------------------------------------------------------------ L1 Timbul dan tenggelam: drop, then explain
const OBJ = [['ranting', 'Ranting', true, () => mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.12, 8).rotateZ(Math.PI / 2), M(0x6d4c41))],
  ['span', 'Span', true, () => mesh(new THREE.BoxGeometry(0.06, 0.03, 0.04), M(0xffd54f, { roughness: 1 }))],
  ['bola_plastik', 'Bola plastik', true, () => mesh(new THREE.SphereGeometry(0.022, 14, 10), M(0xef5350))],
  ['batu', 'Batu', false, () => mesh(new THREE.DodecahedronGeometry(0.025, 0), M(0x757575, { flatShading: true }))],
  ['sabun', 'Sabun', false, () => mesh(new THREE.BoxGeometry(0.06, 0.02, 0.035), M(0xf48fb1))],
  ['kunci', 'Kunci besi', false, () => mesh(new THREE.BoxGeometry(0.05, 0.005, 0.012), M(0xb0bec5, { metalness: 0.8 }))]];
function L1(S, play) {
  const root = group('L1', table(1.4, 0.85, play));
  const T = tank('akuarium', 0.6); T.position.set(0, 0, -0.16); root.add(T);
  const objs = OBJ.map(([id, label, fl, make], i) => { const o = group(id, make()); o.userData = { label, floats: fl }; o.position.set(-0.42 + [3, 0, 5, 1, 4, 2][i] * 0.168, 0.03, 0.2); o.userData.carryY = 0.1; const t = textSprite(label, { h: 0.024 }); t.position.set(0, 0.05, 0.03); o.add(t); o.userData.tag = t; root.add(home(o)); return o; });
  let n = 0;
  const dr = dragger(S, () => objs.filter(o => !o.userData.in), {
    async onDrop(o, x, y) {
      if (!(nearScreen(S, T, x, y, 0.15, 120) || flat(o.position, T.position) < 0.3)) return goHome(S, o);
      o.userData.in = true; o.userData.tag.position.y = 0.04; const at = -0.24 + (n++) * 0.095;
      await settle(S, T, o, o.userData.floats, at);
      S.evt('drop', o.name);
      S.info(o.userData.floats ? `🛟 ${o.userData.label} <b>timbul</b> — berada di permukaan air, <b>kurang tumpat</b> daripada air.` : `⚓ ${o.userData.label} <b>tenggelam</b> — berada di dasar air, <b>lebih tumpat</b> daripada air.`);
    },
  });
  return { root, view: { w: 1.05, d: 0.7 }, ...dr };
}

// ------------------------------------------------------------ L2 Air menjadi lebih tumpat: salt lifts the grape
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const B = tank('bikar', 0.22, 0.22, 0.24); B.position.set(-0.15, 0, -0.15); root.add(B);
  const grape = group('anggur', mesh(new THREE.SphereGeometry(0.025, 16, 12).scale(1, 1.2, 1), M(0x6a1b9a, { roughness: 0.3 }))); grape.position.set(0.25, 0.03, 0.22); grape.userData.carryY = 0.1; root.add(home(grape));
  const gl = textSprite('Buah anggur', { h: 0.024 }); gl.position.set(0, 0.05, 0.03); grape.add(gl);
  const salt = emojiCard('garam', '🧂', 'Garam (1 sudu)', 0.1, { border: '#90a4ae' }); salt.position.set(0.3, 0, -0.1); salt.visible = false; root.add(salt);
  let inWater = false, spoons = 0, floated = false;
  let meter = null; const setMeter = n => { if (meter) root.remove(meter); meter = textSprite(`Garam: ${n} sudu`, { h: 0.03, bg: '#fff59dee' }); meter.position.set(-0.15, 0.33, -0.15); root.add(meter); };
  setMeter(0);
  const dr = dragger(S, () => (inWater ? [] : [grape]), {
    async onDrop(o, x, y) {
      if (!(nearScreen(S, B, x, y, 0.15, 100) || flat(o.position, B.position) < 0.15)) return goHome(S, o);
      inWater = true; gl.visible = false; await settle(S, B, o, false, 0, 0.03);
      S.evt('sink', 'anggur'); salt.visible = true; S.info('🍇 Anggur <b>tenggelam</b> — lebih tumpat daripada air. Tuding garam untuk melarutkannya ke dalam air.');
    },
  });
  return {
    root, view: { w: 1.3, d: 0.8 }, ...dr,
    hit: (x, y) => (salt.visible && !floated ? S.hitTest(x, y, [salt])?.name ?? null : null),
    async tap(x, y) {
      if (!salt.visible || floated || S.hitTest(x, y, [salt]) !== salt) return;
      spoons++; setMeter(spoons);
      for (let i = 0; i < 6; i++) { const g = mesh(new THREE.BoxGeometry(0.004, 0.004, 0.004), M(0xffffff)); g.userData.fx = true; g.position.set(-0.15 + (Math.random() - 0.5) * 0.1, 0.3, -0.15); root.add(g); S.tween(0.6, k => g.position.y = 0.3 - k * 0.12, () => root.remove(g)); }
      B.userData.water.material.opacity = 0.4 + spoons * 0.08;
      S.evt('salt', 'sudu_' + spoons);
      if (spoons < 3) return S.info(`🧂 ${spoons} sudu garam dilarutkan. Anggur masih tenggelam…`);
      floated = true; const y0 = grape.position.y; await S.tween(1.5, k => grape.position.y = y0 + (B.userData.h - 0.015 - y0) * k);
      S.evt('float', 'anggur'); S.info('🍇 Anggur <b>timbul</b>! Melarutkan garam menjadikan air <b>lebih tumpat</b>.', 8);
    },
  };
}

// ------------------------------------------------------------ L3 Ketumpatan cecair: oil always ends on top
function L3(S, play) {
  const root = group('L3', table(1.3, 0.8, play));
  const B = group('bikar', mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 28, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }), 0, 0.13, 0)); B.position.set(-0.15, 0, -0.15); root.add(B);
  const layer = (c, o) => { const m = mesh(new THREE.CylinderGeometry(0.077, 0.077, 1, 28), M(c, { transparent: true, opacity: o, depthWrite: false })); m.scale.y = 0.0001; m.userData.fx = true; B.add(m); return m; };
  const water = layer(WATER, 0.5), oil = layer(0xfdd835, 0.7);
  const jugs = [['minyak', '🛢️', 'Minyak masak', 0xfdd835], ['air', '💧', 'Air', WATER]].map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.1, { border: '#ef6c00' }); c.position.set(0.2 + i * 0.2, 0, 0.25); root.add(home(c)); return c; });
  const amt = { air: 0, minyak: 0 };
  const lay = () => { const hw = amt.air * 0.08, ho = amt.minyak * 0.06; water.scale.y = Math.max(0.0001, hw); water.position.y = hw / 2 + 0.002; oil.scale.y = Math.max(0.0001, ho); oil.position.y = hw + ho / 2 + 0.002; };
  const done = new Set();
  const dr = dragger(S, () => jugs.filter(j => !done.has(j.name)), {
    async onDrop(j, x, y) {
      goHome(S, j);
      if (!(nearScreen(S, B, x, y, 0.15, 100) || flat(j.position, B.position) < 0.15)) return;
      done.add(j.name);
      if (j.name === 'minyak' && !amt.air) { amt.minyak = 1; await S.tween(1, k => { oil.scale.y = Math.max(0.0001, 0.06 * k); oil.position.y = 0.03 * k + 0.002; }); S.evt('pour', 'minyak'); return S.info('🛢️ Minyak dituang dahulu. Sekarang tuang air.'); }
      if (j.name === 'air' && amt.minyak) {  // water poured onto oil sinks below it
        S.info('💧 Air tenggelam melalui minyak…');
        await S.tween(1.5, k => { amt.air = k; lay(); }); amt.air = 1;
      } else { amt[j.name] = 1; await S.tween(1, k => lay()); }
      lay(); S.evt('pour', j.name);
      if (done.size === 2) S.info('🛢️ Minyak berada di atas air — minyak <b>kurang tumpat</b> daripada air. Ketumpatan setiap cecair adalah berbeza.', 8);
    },
  });
  const tag = (t, y) => { const s = textSprite(t, { h: 0.026 }); s.position.set(0.15, y, 0); B.add(s); };
  tag('← minyak', 0.11); tag('← air', 0.04);
  return { root, view: { w: 1.3, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L4 Aplikasi dalam kehidupan
function L4(S, play) {
  const root = group('L4', table(1.6, 0.9, play));
  const sea = mesh(new THREE.BoxGeometry(1.5, 0.12, 0.42), M(WATER, { transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.06, -0.15); sea.userData.fx = true; root.add(sea);
  const swimmer = kid('perenang', { shirt: 0xff8a65 }); swimmer.position.set(-0.5, 0.0, -0.15); root.add(swimmer);
  const boat = group('bot', mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), M(0x8d6e63), 0, 0.14, 0)); boat.position.set(0, 0, -0.15); root.add(boat);
  const cage = group('sangkar_ikan', mesh(new THREE.TorusGeometry(0.1, 0.006, 6, 24), M(0x37474f), 0, 0.12, 0).rotateX(Math.PI / 2)); cage.position.set(0.5, -0.06, -0.15); root.add(cage);
  for (const [o, l] of [[swimmer, 'Perenang tenggelam!'], [boat, 'Bot hanyut'], [cage, 'Sangkar ikan tenggelam']]) { const t = textSprite(l, { h: 0.026 }); t.position.set(o.position.x, 0.3, -0.15); root.add(t); o.userData.tag = t; }
  const ITEMS = [['jaket', '🦺', 'Jaket keselamatan', swimmer, '🦺 Jaket keselamatan <b>kurang tumpat</b> daripada air — perenang terapung.'],
    ['sauh', '⚓', 'Sauh besi', boat, '⚓ Sauh besi <b>lebih tumpat</b> — tenggelam ke dasar dan menahan bot.'],
    ['pelampung', '🛟', 'Pelampung', cage, '🛟 Pelampung <b>kurang tumpat</b> — sangkar ternakan ikan kekal di permukaan.']];
  const cards = ITEMS.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.1, { border: '#00897b' }); c.position.set(-0.4 + [1, 2, 0][i] * 0.4, 0, 0.3); root.add(home(c)); return c; });
  let t = 0; const fixed = new Set();
  const dr = dragger(S, () => cards.filter(c => !fixed.has(c.name)), {
    onDrop(c, x, y) {
      const it = ITEMS.find(i => i[0] === c.name), target = it[3];
      if (!(nearScreen(S, target, x, y, 0.12, 90) || flat(target.position, c.position) < 0.2)) {
        const other = ITEMS.find(i => nearScreen(S, i[3], x, y, 0.12, 90));
        if (other) S.info('🤔 Adakah barang itu sesuai di situ? Fikir: timbul atau tenggelam?');
        return goHome(S, c);
      }
      fixed.add(c.name); c.visible = false; target.userData.tag.visible = false;
      if (target === swimmer) { S.tween(0.8, k => swimmer.position.y = -0.08 * (1 - k) + 0.02 * k); const v = emojiSprite('🦺', 0.06); v.position.set(0, 0.12, 0.04); swimmer.add(v); }
      if (target === boat) { const a = group('', mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.12), M(0x5d4037), 0.09, 0.08, 0)); const s = emojiSprite('⚓', 0.04); s.position.set(0.09, 0.02, 0); a.add(s); boat.add(a); }
      if (target === cage) { S.tween(0.8, k => cage.position.y = -0.06 + 0.06 * k); for (let i = 0; i < 4; i++) { const f = mesh(new THREE.SphereGeometry(0.018, 10, 8), M(0x1e88e5)); f.position.set(Math.cos(i * 1.57) * 0.1, 0.13, Math.sin(i * 1.57) * 0.1); cage.add(f); } }
      S.evt('apply', c.name); S.info(it[4], 7);
    },
  });
  return {
    root, view: { w: 1.6, d: 0.9 }, ...dr,
    update(dt) { t += dt; if (!fixed.has('jaket')) swimmer.position.y = -0.08 + Math.sin(t * 3) * 0.01; if (!fixed.has('sauh')) boat.position.x = Math.sin(t * 0.5) * 0.12; },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Timbul dan tenggelam', sp: 'SP 7.1.1', make: L1 },
  { id: 'L2', title: 'Air menjadi lebih tumpat', sp: 'SP 7.1.2', make: L2 },
  { id: 'L3', title: 'Ketumpatan cecair', sp: 'SP 7.1.3', make: L3 },
  { id: 'L4', title: 'Aplikasi dalam kehidupan', sp: 'SP 7.1.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Ketumpatan',
  intro: '<b>Sains Tahun 3 · Unit 7.</b> Timbul atau tenggelam? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
