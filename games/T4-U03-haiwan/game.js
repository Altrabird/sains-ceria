// Sains Tahun 4 · Unit 3 Haiwan (SP 3.1.1 – 3.2.4) — breathing organs, the frog's two organs, vertebrates,
// five vertebrate classes, special mammals.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const sortLevel = (name, cfg) => (S, play) => { const root = group(name, table(cfg.w || 1.6, cfg.d || 0.9, play)); const dr = sorter(S, root, cfg); return { root, view: { w: cfg.w || 1.6, d: cfg.d || 0.9 }, ...dr }; };
const Z4 = (ids) => ids.map(([id, label, color], i) => ({ id, label, color, x: -0.57 + i * 0.38, z: -0.22, w: 0.34, d: 0.3 }));

// ------------------------------------------------------------ L1 Organ pernafasan
const L1 = sortLevel('L1', {
  type: 'organ', size: 0.085, gap: 0.145, row: 0.3,
  zones: Z4([['peparu', '💨 Peparu', 0xffcdd2], ['insang', '🐟 Insang', 0xb3e5fc], ['kulit', '💧 Kulit lembap', 0xc8e6c9], ['spirakel', '🦗 Spirakel', 0xfff9c4]]),
  items: [['kucing', '🐈', 'Kucing', 'peparu'], ['buaya', '🐊', 'Buaya', 'peparu'], ['lembu', '🐄', 'Lembu', 'peparu'], ['ikan', '🐟', 'Ikan', 'insang'], ['ketam', '🦀', 'Ketam', 'insang'], ['udang', '🦐', 'Udang', 'insang'],
    ['cacing', '〰️', 'Cacing', 'kulit'], ['lintah', '🐛', 'Lintah', 'kulit'], ['belalang', '🦗', 'Belalang', 'spirakel'], ['kupu', '🦋', 'Kupu-kupu', 'spirakel']]
    .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Bagaimanakah ${label.toLowerCase()} bernafas?` })),
  ok: (it, z) => `✅ ${it.label} bernafas melalui <b>${z.label.replace(/^\S+ /, '').toLowerCase()}</b>.` + (z.id === 'spirakel' ? ' Spirakel ialah liang pernafasan pada kulit serangga.' : ''),
});

// ------------------------------------------------------------ L2 Katak: lebih daripada satu organ
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const land = group('darat', mesh(new THREE.BoxGeometry(0.5, 0.03, 0.34), M(0x8bc34a), 0, 0.015, 0)); land.position.set(-0.32, 0, -0.15); root.add(land);
  const pond = group('kolam', mesh(new THREE.BoxGeometry(0.5, 0.02, 0.34), M(0x4fc3f7, { transparent: true, opacity: 0.75 }), 0, 0.01, 0)); pond.position.set(0.32, 0, -0.15); root.add(pond);
  for (const [o, l] of [[land, '🌿 Darat'], [pond, '💧 Air']]) { const t = textSprite(l, { h: 0.035 }); t.position.set(o.position.x, 0.05, -0.34); root.add(t); }
  const frog = emojiCard('katak', '🐸', 'Katak', 0.13); frog.position.set(0, 0, 0.25); root.add(home(frog));
  const opts = [['peparu', 'Peparu'], ['kulit', 'Kulit lembap'], ['insang', 'Insang']].map(([id, l], i) => { const c = textCard('organ_' + id, l, 0.22); c.userData.id = id; c.position.set(-0.3 + i * 0.3, 0, 0.36); c.visible = false; root.add(c); return c; });
  let where = null; const done = new Set();
  const dr = dragger(S, () => [frog], {
    onDrop(o) {
      const z = flat(o.position, land.position) < 0.25 ? 'darat' : flat(o.position, pond.position) < 0.25 ? 'air' : null;
      if (!z) return goHome(S, o);
      where = z; o.position.y = 0.03; opts.forEach(c => c.visible = true);
      S.info(z === 'darat' ? '🐸 Katak di <b>darat</b>. Organ apakah yang digunakan untuk bernafas?' : '🐸 Katak di dalam <b>air</b>. Organ apakah yang digunakan untuk bernafas?');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, opts.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, opts.filter(c => c.visible)); if (!c || !where) return;
      const want = where === 'darat' ? 'peparu' : 'kulit';
      if (c.userData.id !== want) return S.info(c.userData.id === 'insang' ? '🤔 Katak dewasa tidak mempunyai insang. Cuba lagi.' : '🤔 Cuba lagi.');
      done.add(where); S.evt('frog', where); opts.forEach(k => k.visible = false);
      S.info(where === 'darat' ? '✅ Di darat, katak bernafas melalui <b>peparu</b>. Sekarang bawa katak ke dalam air.' : '✅ Di dalam air, katak bernafas melalui <b>kulit lembap</b>.');
      if (done.size === 2) setTimeout(() => S.info('🐸 Katak boleh hidup di darat dan di air. Sesilia dan salamander juga bernafas melalui peparu dan kulit lembap.', 9), 2200);
      where = null;
    },
  };
}

// ------------------------------------------------------------ L3 Vertebrata dan invertebrata
const L3 = sortLevel('L3', {
  type: 'backbone', size: 0.1, gap: 0.16, w: 1.7,
  zones: [{ id: 'vertebrata', label: '🦴 Vertebrata (ada tulang belakang)', color: 0xe1f5fe, x: -0.4, z: -0.2, w: 0.72 }, { id: 'invertebrata', label: '🚫 Invertebrata (tiada tulang belakang)', color: 0xfff3e0, x: 0.4, z: -0.2, w: 0.72 }],
  items: [['ular', '🐍', 'Ular', 'vertebrata'], ['kuda', '🐎', 'Kuda', 'vertebrata'], ['burung', '🐦', 'Burung', 'vertebrata'], ['ikan', '🐟', 'Ikan', 'vertebrata'], ['kura', '🐢', 'Kura-kura', 'vertebrata'],
    ['cacing', '〰️', 'Cacing', 'invertebrata'], ['belalang', '🦗', 'Belalang', 'invertebrata'], ['lebah', '🐝', 'Lebah', 'invertebrata'], ['nyamuk', '🦟', 'Nyamuk', 'invertebrata'], ['udang', '🦐', 'Udang', 'invertebrata']]
    .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Adakah ${label.toLowerCase()} mempunyai tulang belakang?` })),
  ok: (it, z) => `✅ ${it.label} ${z.id === 'vertebrata' ? '<b>mempunyai</b>' : '<b>tidak mempunyai</b>'} tulang belakang.`,
});

// ------------------------------------------------------------ L4 Lima kelas vertebrata
const L4 = sortLevel('L4', {
  type: 'class', size: 0.08, gap: 0.145, row: 0.32, w: 1.7, d: 0.95,
  zones: [['mamalia', 'Mamalia', 0xffcdd2], ['reptilia', 'Reptilia', 0xd7ccc8], ['amfibia', 'Amfibia', 0xc8e6c9], ['burung', 'Burung', 0xfff9c4], ['ikan', 'Ikan', 0xb3e5fc]].map(([id, label, color], i) => ({ id, label, color, x: -0.62 + i * 0.31, z: -0.22, w: 0.28, d: 0.3 })),
  items: [['rusa', '🦌', 'Rusa', 'mamalia'], ['kucing', '🐈', 'Kucing', 'mamalia'], ['kura', '🐢', 'Kura-kura', 'reptilia'], ['buaya', '🐊', 'Buaya', 'reptilia'], ['katak', '🐸', 'Katak', 'amfibia'],
    ['ayam', '🐔', 'Ayam', 'burung'], ['bangau', '🦢', 'Burung bangau', 'burung'], ['puyu', '🐟', 'Ikan puyu', 'ikan'], ['emas', '🐠', 'Ikan emas', 'ikan'], ['ular', '🐍', 'Ular', 'reptilia']]
    .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Lihat ciri: organ pernafasan, cara membiak, litupan badan dan habitat.' })),
  ok: (it, z) => `✅ ${it.label} → <b>${z.label}</b>. ${{ mamalia: 'Peparu, melahirkan anak, berbulu halus.', reptilia: 'Peparu, bertelur, bersisik atau berkulit keras.', amfibia: 'Peparu dan kulit lembap, bertelur, hidup di darat dan air.', burung: 'Peparu, bertelur, berbulu pelepah.', ikan: 'Insang, bertelur, bersisik, hidup di air.' }[z.id]}`,
});

// ------------------------------------------------------------ L5 Contoh istimewa mamalia: clues -> class
const MYST = [['paus', '🐋', ['Hidup di laut', 'Bernafas dengan peparu', 'Melahirkan anak'], 'Paus hidup di laut tetapi bernafas dengan peparu dan melahirkan anak — <b>mamalia</b>!'],
  ['kelawar', '🦇', ['Boleh terbang', 'Berbulu halus', 'Melahirkan anak dan menyusukannya'], 'Kelawar boleh terbang tetapi ialah <b>mamalia</b>!'],
  ['platipus', '🦆', ['Bertelur', 'Berbulu halus', 'Menyusukan anaknya'], 'Platipus bertelur tetapi menyusukan anaknya — <b>mamalia</b> yang istimewa!']];
function L5(S, play) {
  const root = group('L5', table(1.5, 0.9, play));
  const classes = ['mamalia', 'ikan', 'burung', 'reptilia'].map((id, i) => { const c = textCard('kelas_' + id, id[0].toUpperCase() + id.slice(1), 0.24); c.userData.id = id; c.position.set(-0.45 + i * 0.3, 0, 0.32); root.add(c); return c; });
  let r = 0, scene = null;
  function setup() {
    if (scene) root.remove(scene);
    const [id, e, clues] = MYST[r]; scene = group('misteri');
    const card = emojiCard('haiwan_' + id, '❓', '', 0.18); card.position.set(-0.45, 0, -0.15); scene.add(card); scene.userData.card = card;
    clues.forEach((c, i) => { const t = textCard('petunjuk' + i, '🔎 ' + c, 0.4); t.position.set(0.2, 0, -0.34 + i * 0.165); scene.add(t); });
    root.add(scene); S.info(`🕵️ Haiwan misteri ${r + 1}/3: baca petunjuk, kemudian tuding kelasnya.`);
  }
  setup();
  return {
    root, view: { w: 1.5, d: 0.9 },
    hit: (x, y) => S.hitTest(x, y, classes)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, classes); if (!c || r > 2) return;
      if (c.userData.id !== 'mamalia') return S.info('🤔 Lihat semula petunjuk: adakah haiwan ini menyusukan atau melahirkan anak, dan berbulu halus?');
      const [id, e, , msg] = MYST[r]; scene.remove(scene.userData.card); const real = emojiCard('haiwan_' + id, e, id[0].toUpperCase() + id.slice(1), 0.18); real.position.set(-0.45, 0, -0.15); scene.add(real);
      S.evt('special', id); S.info('✅ ' + msg, 6); r++; if (r < 3) setTimeout(setup, 3000);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Organ pernafasan haiwan', sp: 'SP 3.1.1 · 3.1.2', make: L1 },
  { id: 'L2', title: 'Katak: dua organ', sp: 'SP 3.1.3', make: L2 },
  { id: 'L3', title: 'Vertebrata dan invertebrata', sp: 'SP 3.2.1', make: L3 },
  { id: 'L4', title: 'Lima kelas vertebrata', sp: 'SP 3.2.2 · 3.2.3', make: L4 },
  { id: 'L5', title: 'Mamalia istimewa', sp: 'SP 3.2.4', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haiwan — Pernafasan dan Pengelasan',
  intro: '<b>Sains Tahun 4 · Unit 3.</b> Bagaimana haiwan bernafas dan dikelaskan? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
