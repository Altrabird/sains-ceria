// Sains Tahun 4 · Unit 10 Mesin (SP 10.1.1 – 10.2.4) — lever parts, fulcrum distance vs effort, seven simple machines,
// complex machines, combine machines to load a lorry, sustainable machines.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, emojiCard, textCard, diagramBoard, labelPins, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Beban, fulkrum dan daya
function drawLever(g, W, H) {
  g.fillStyle = '#8d6e63'; g.fillRect(W * 0.08, H * 0.48, W * 0.84, H * 0.06);
  g.fillStyle = '#607d8b'; g.beginPath(); g.moveTo(W * 0.5, H * 0.54); g.lineTo(W * 0.42, H * 0.8); g.lineTo(W * 0.58, H * 0.8); g.closePath(); g.fill();
  g.fillStyle = '#757575'; g.fillRect(W * 0.12, H * 0.3, W * 0.16, H * 0.18);
  g.fillStyle = '#e53935'; g.beginPath(); g.moveTo(W * 0.85, H * 0.18); g.lineTo(W * 0.85, H * 0.4); g.lineTo(W * 0.8, H * 0.33); g.moveTo(W * 0.85, H * 0.4); g.lineTo(W * 0.9, H * 0.33); g.lineWidth = 10; g.strokeStyle = '#e53935'; g.stroke();
}
function L1(S, play) {
  const root = group('L1', table(1.3, 0.85, play));
  const d = diagramBoard('rajah_tuas', { w: 0.5, h: 0.36, draw: drawLever, pins: { beban: [0.2, 0.36], fulkrum: [0.5, 0.7], daya: [0.85, 0.27] }, tilt: 0.8 }); d.position.set(0, 0, -0.2); root.add(d);
  const dr = labelPins(S, root, d, [['beban', 'Beban'], ['fulkrum', 'Fulkrum'], ['daya', 'Daya']], {
    onLabel: id => { S.evt('label', id); S.info({ beban: '✅ <b>Beban</b>: berat sesuatu jasad.', fulkrum: '✅ <b>Fulkrum</b>: titik yang berfungsi sebagai pengimbang atau penyokong.', daya: '✅ <b>Daya</b>: tolakan atau tarikan ke atas objek.' }[id]); },
  });
  return { root, view: { w: 1.1, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L2 Jarak beban dari fulkrum (fair experiment)
function L2(S, play) {
  const root = group('L2', table(1.3, 0.85, play));
  const CM = 0.012, L = 50 * CM;  // 50 cm ruler
  const lever = group('pembaris'); lever.position.set(0, 0.07, -0.12); root.add(lever);
  lever.add(mesh(new THREE.BoxGeometry(L, 0.008, 0.04), M(0xffca28), 0, 0, 0));
  for (let cm = 0; cm <= 50; cm += 5) lever.add(mesh(new THREE.BoxGeometry(0.002, 0.009, 0.02), M(0x333333), -L / 2 + cm * CM, 0.001, 0.01));
  const block = mesh(new THREE.BoxGeometry(5 * CM, 5 * CM, 5 * CM), M(0x8d6e63), -L / 2 + 2.5 * CM, 0.004 + 2.5 * CM, 0); lever.add(block);
  const fulcrum = group('fulkrum', mesh(new THREE.ConeGeometry(0.03, 0.07, 3), M(0x1e88e5, { flatShading: true }), 0, 0.035, 0)); fulcrum.position.set(-L / 2 + 25 * CM, 0, -0.12); fulcrum.userData.carryY = 0; root.add(fulcrum);
  const hand = emojiSprite('👇', 0.07); hand.position.set(L / 2 - 0.02, 0.17, -0.12); root.add(hand);
  let meter = null;
  const setMeter = (cm) => { if (meter) root.remove(meter); const f = Math.round(10 * cm / (50 - cm)); meter = textSprite(`Jarak beban–fulkrum: ${cm} cm · Daya diperlukan: ${'💪'.repeat(Math.max(1, Math.round(f / 3)))} (${f})`, { h: 0.032, bg: '#fff59dee' }); meter.position.set(0, 0.03, 0.12); root.add(meter); };
  const tried = new Set(); let concluded = false;
  const concl = [['dekat', 'Semakin dekat beban dari fulkrum, semakin sedikit daya diperlukan.', true], ['jauh', 'Semakin dekat beban dari fulkrum, semakin banyak daya diperlukan.', false]]
    .map(([id, t, ok], i) => { const c = textCard('kesimpulan_' + id, t, 0.42); c.userData.ok = ok; c.position.set(-0.23 + i * 0.46, 0, 0.32); c.visible = false; root.add(c); return c; });
  const place = cm => { fulcrum.position.x = -L / 2 + cm * CM; lever.rotation.z = 0; setMeter(cm); };
  place(25);
  const dr = dragger(S, () => (concluded ? [] : [fulcrum]), {
    onDrag(o) { o.position.z = -0.12; },
    async onDrop(o) {
      const cm = THREE.MathUtils.clamp(Math.round(((o.position.x + L / 2) / CM) / 5) * 5, 10, 30); o.position.z = -0.12; place(cm);
      await S.tween(0.6, k => lever.rotation.z = -0.12 * Math.sin(k * Math.PI));
      if ([25, 20, 15].includes(cm) && !tried.has(cm)) { tried.add(cm); S.evt('fulcrum', 'cm' + cm); }
      S.info(`📏 Fulkrum pada <b>${cm} cm</b> dari blok kayu.` + (tried.size === 3 ? ' Bandingkan daya yang diperlukan dan pilih kesimpulan.' : ' Cuba 25 cm, 20 cm dan 15 cm.'));
      if (tried.size === 3) concl.forEach(c => c.visible = true);
    },
  });
  return {
    root, view: { w: 1.2, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, concl.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, concl.filter(c => c.visible)); if (!c || concluded) return;
      if (!c.userData.ok) return S.info('🤔 Lihat bilangan 💪: pada 15 cm, adakah daya bertambah atau berkurang?');
      concluded = true; S.evt('conclude', 'dekat'); S.info('✅ Semakin dekat jarak beban dari fulkrum, semakin sedikit daya yang diperlukan untuk mengangkat beban.', 9);
    },
  };
}

// ------------------------------------------------------------ L3 Tujuh mesin ringkas
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['roda_gandar', '🚪', 'Tombol pintu', 'Roda dan gandar'], ['tuas', '🧹', 'Penyapu', 'Tuas'], ['skru', '🍾', 'Penutup botol', 'Skru'], ['gear', '🕰️', 'Jam', 'Gear'],
    ['takal', '🪟', 'Bidai', 'Takal'], ['satah_condong', '🪜', 'Tangga', 'Satah condong'], ['baji', '🔪', 'Pisau', 'Baji']]
    .map(([id, e, ex, m]) => ({ id, target: [e, ex], card: ['', m], ok: `✅ ${ex} — <b>${m.toLowerCase()}</b>. Mesin ringkas membantu kita melakukan kerja dengan lebih mudah dan cepat.` })), { type: 'simple', gap: 0.24, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Mesin kompleks: which simple machines are inside?
const COMPLEX = [['gunting', '✂️', 'Gunting pemangkas', ['skru', 'baji']], ['kereta_sorong', '🛒', 'Kereta sorong', ['tuas', 'skru', 'roda_gandar']], ['basikal', '🚲', 'Basikal', ['gear', 'skru', 'roda_gandar']]];
const SIMPLE = [['roda_gandar', 'Roda dan gandar'], ['tuas', 'Tuas'], ['skru', 'Skru'], ['gear', 'Gear'], ['takal', 'Takal'], ['satah_condong', 'Satah condong'], ['baji', 'Baji']];
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const chips = SIMPLE.map(([id, l], i) => { const c = textCard('mesin_' + id, l, 0.2); c.userData.id = id; c.position.set(-0.63 + i * 0.21, 0, 0.32); root.add(c); return c; });
  let r = 0, got = new Set(), show = null;
  function setup() {
    if (show) root.remove(show); got = new Set(); chips.forEach(c => c.children[0].material.color.set(0xffffff));
    const [id, e, l, need] = COMPLEX[r]; show = emojiCard('kompleks_' + id, e, l, 0.2); show.position.set(0, 0, -0.18); root.add(show);
    S.info(`⚙️ ${l}: tuding <b>${need.length}</b> mesin ringkas yang terdapat di dalamnya.`);
  }
  setup();
  return {
    root, view: { w: 1.6, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, chips)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, chips); if (!c || r >= COMPLEX.length) return;
      const need = COMPLEX[r][3];
      if (!need.includes(c.userData.id)) return S.info(`🤔 ${COMPLEX[r][2]} tidak menggunakan ${SIMPLE.find(s => s[0] === c.userData.id)[1].toLowerCase()}.`);
      got.add(c.userData.id); c.children[0].material.color.set(0xc8e6c9);
      if (got.size < need.length) return S.info(`✅ ${SIMPLE.find(s => s[0] === c.userData.id)[1]}. Cari lagi.`);
      S.evt('complex', COMPLEX[r][0]); S.info(`✅ ${COMPLEX[r][2]} ialah <b>mesin kompleks</b>: gabungan ${need.map(n => SIMPLE.find(s => s[0] === n)[1].toLowerCase()).join(', ')}.`, 6);
      r++; if (r < COMPLEX.length) setTimeout(setup, 2800);
    },
  };
}

// ------------------------------------------------------------ L5 Gabungkan mesin ringkas: load the lorry
function L5(S, play) {
  const root = group('L5', table(1.6, 0.9, play));
  const lorry = group('lori', mesh(new THREE.BoxGeometry(0.4, 0.2, 0.26), M(0xeceff1), 0, 0.2, 0), mesh(new THREE.BoxGeometry(0.4, 0.02, 0.26), M(0x546e7a), 0, 0.1, 0)); lorry.position.set(0.45, 0, -0.15); root.add(lorry);
  for (const z of [-0.12, 0.12]) for (const x of [-0.12, 0.12]) lorry.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16).rotateX(Math.PI / 2), M(0x212121), x, 0.045, z));
  const box = group('kotak', mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), M(0xd7a86e), 0, 0.05, 0)); box.position.set(-0.4, 0, -0.15); root.add(box);
  const bl = textSprite('Kotak berat', { h: 0.028 }); bl.position.set(0, 0.14, 0); box.add(bl);
  const trolley = emojiCard('troli', '🛒', 'Troli (roda dan gandar)', 0.11, { border: '#43a047' }); trolley.position.set(-0.4, 0, 0.27); root.add(home(trolley));
  const plank = emojiCard('papan', '📏', 'Papan (satah condong)', 0.11, { border: '#43a047' }); plank.position.set(-0.05, 0, 0.27); root.add(home(plank));
  const push = textCard('tolak', '👉 Tolak troli ke atas papan', 0.3); push.position.set(0.3, 0, 0.3); push.visible = false; root.add(push);
  let hasTrolley = false, hasRamp = false, loaded = false, ramp = null;
  const dr = dragger(S, () => [...(hasTrolley ? [] : [trolley]), ...(hasRamp ? [] : [plank])], {
    onDrop(c) {
      if (c === trolley) { if (flat(c.position, box.position) > 0.15) return goHome(S, c); hasTrolley = true; c.visible = false; box.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14).rotateX(Math.PI / 2), M(0x212121), 0, 0.0, 0.06)); box.position.y = 0.03; S.evt('combine', 'troli'); S.info('🛒 Kotak di atas troli — <b>roda dan gandar</b> memudahkan kotak dialihkan.'); }
      else { if (c.position.x < 0.0 || c.position.x > 0.35) return goHome(S, c); hasRamp = true; c.visible = false; ramp = mesh(new THREE.BoxGeometry(0.42, 0.012, 0.14), M(0xa1887f), 0.06, 0.055, -0.15); ramp.rotation.z = Math.atan2(0.11, 0.4); root.add(ramp); S.evt('combine', 'papan'); S.info('📐 Papan dicondongkan ke lori — <b>satah condong</b>.'); }
      if (hasTrolley && hasRamp) push.visible = true;
    },
  });
  const choices = [['basikal', '🚲', 'Basikal'], ['kereta', '🚗', 'Kereta']].map(([id, e, l], i) => { const c = emojiCard('lestari_' + id, e, l, 0.11, { border: '#7e57c2' }); c.position.set(-0.35 + i * 0.3, 0, 0.27); c.visible = false; c.userData.id = id; root.add(c); return c; });
  let lestari = false;
  return {
    root, view: { w: 1.6, d: 0.9 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [push, ...choices].filter(c => c.visible))?.name ?? null,
    async tap(x, y) {
      const c = S.hitTest(x, y, [push, ...choices].filter(c => c.visible)); if (!c) return;
      if (c === push && !loaded) {
        loaded = true; push.visible = false;
        await S.tween(1, k => box.position.set(-0.4 + k * 0.55, 0.03, -0.15)); await S.tween(1, k => box.position.set(0.15 + k * 0.3, 0.03 + k * 0.08, -0.15));
        S.evt('load', 'lori'); choices.forEach(c => c.visible = true);
        return S.info('🚚 Kotak berat dimuatkan ke lori dengan <b>menggabungkan mesin ringkas</b>! Sekarang tuding mesin yang <b>lestari</b>.', 8);
      }
      if (choices.includes(c) && !lestari) {
        if (c.userData.id !== 'basikal') return S.info('🤔 Kereta memerlukan bahan api fosil dan mencemarkan alam sekitar.');
        lestari = true; S.evt('lestari', 'basikal'); S.info('🚲 Basikal mesin yang <b>lestari</b>: tahan lama, mudah dan selamat digunakan, tidak memerlukan bahan api fosil dan tidak mencemarkan alam sekitar.', 10);
      }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Beban, fulkrum dan daya', sp: 'SP 10.1.1', make: L1 },
  { id: 'L2', title: 'Jarak beban dari fulkrum', sp: 'SP 10.1.2 · 10.1.3', make: L2 },
  { id: 'L3', title: 'Tujuh mesin ringkas', sp: 'SP 10.2.1', make: L3 },
  { id: 'L4', title: 'Mesin kompleks', sp: 'SP 10.2.3 · 10.2.4', make: L4 },
  { id: 'L5', title: 'Gabungkan mesin ringkas', sp: 'SP 10.2.2 – 10.2.4', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Mesin',
  intro: '<b>Sains Tahun 4 · Unit 10.</b> Tuas, mesin ringkas dan mesin kompleks! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
