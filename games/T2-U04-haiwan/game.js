// Sains Tahun 2 · Unit 4 Haiwan (SP 4.1.1 – 4.1.7) — how animals reproduce, how many young, life cycles, young vs parent, protecting eggs.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, leaf, nest, bird, sorter, emojiCard, cycleRing, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Cara membiak
function L1(S, play) {
  const root = group('L1', table(1.6, 0.85, play));
  const dr = sorter(S, root, {
    type: 'reproduce', size: 0.12, gap: 0.21,
    zones: [{ id: 'telur', label: '🥚 Bertelur', color: 0xfff59d, x: -0.38, z: -0.18, w: 0.66 }, { id: 'lahir', label: '🍼 Melahirkan anak', color: 0xf8bbd0, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['katak', '🐸', 'Katak', 'telur'], ['buaya', '🐊', 'Buaya', 'telur'], ['nyamuk', '🦟', 'Nyamuk', 'telur'], ['itik', '🦆', 'Itik', 'telur'],
      ['kucing', '🐈', 'Kucing', 'lahir'], ['kanggaru', '🦘', 'Kanggaru', 'lahir'], ['lumba_lumba', '🐬', 'Ikan lumba-lumba', 'lahir']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Adakah ${label.toLowerCase()} ${zone === 'telur' ? 'melahirkan anak' : 'bertelur'}? Fikir semula.` })),
    ok: (it, z) => `✅ ${it.label} <b>${z.id === 'telur' ? 'bertelur' : 'melahirkan anak'}</b>.`,
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Bilangan telur dan anak: 2 x 2
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const Z = (id, label, color, x, z) => ({ id, label, color, x, z, w: 0.62, d: 0.2 });
  const dr = sorter(S, root, {
    type: 'count', size: 0.095, gap: 0.152, row: 0.36,
    zones: [Z('telur_sedikit', '🥚 Telur sedikit', 0xfff59d, -0.35, -0.3), Z('telur_banyak', '🥚🥚🥚 Telur banyak', 0xffe082, 0.35, -0.3),
      Z('anak_sedikit', '🍼 Anak sedikit', 0xf8bbd0, -0.35, 0.02), Z('anak_banyak', '🍼🍼🍼 Anak banyak', 0xf48fb1, 0.35, 0.02)],
    items: [['burung', '🐦', 'Burung', 'telur_sedikit'], ['angsa', '🦢', 'Angsa', 'telur_sedikit'], ['penguin', '🐧', 'Penguin', 'telur_sedikit'],
      ['ikan', '🐟', 'Ikan', 'telur_banyak'], ['katak', '🐸', 'Katak', 'telur_banyak'], ['semut', '🐜', 'Semut', 'telur_banyak'],
      ['tenggiling', '🐾', 'Tenggiling', 'anak_sedikit'], ['lumba_lumba', '🐬', 'Ikan lumba-lumba', 'anak_sedikit'], ['arnab', '🐇', 'Arnab', 'anak_banyak'], ['kucing', '🐈', 'Kucing', 'anak_banyak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `${label}: ${zone.startsWith('telur') ? 'bertelur' : 'melahirkan anak'} — sedikit atau banyak?` })),
    ok: it => `✅ ${it.label}: ${it.zone.replace('_', ' ')}. Bilangan telur atau anak haiwan <b>tidak sama banyak</b>.`,
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ life-cycle stages built from primitives
const GREEN = 0x66bb6a;
const frogEggs = () => group('telur_katak', ...[...Array(12)].map((_, i) => { const e = mesh(new THREE.SphereGeometry(0.011, 10, 8), M(0xe1f5fe, { transparent: true, opacity: 0.7 }), Math.cos(i * 2.4) * 0.03 * Math.sqrt(i / 12), 0.011, Math.sin(i * 2.4) * 0.03 * Math.sqrt(i / 12)); e.add(mesh(new THREE.SphereGeometry(0.004), M(0x111111))); return e; }));
const tadpole = () => group('berudu', mesh(new THREE.SphereGeometry(0.016, 14, 10).scale(1.2, 0.9, 1), M(0x37474f), 0, 0.016, 0), mesh(new THREE.ConeGeometry(0.01, 0.05, 8).rotateZ(Math.PI / 2).scale(1, 0.25, 1), M(0x546e7a), -0.04, 0.016, 0));
function frog(name, s = 1, tail = false) {
  const g = group(name, mesh(new THREE.SphereGeometry(0.025, 16, 12).scale(1.3, 0.8, 1), M(GREEN), 0, 0.022, 0), mesh(new THREE.SphereGeometry(0.018, 14, 10), M(GREEN), 0.026, 0.032, 0),
    ...[-1, 1].map(z => mesh(new THREE.SphereGeometry(0.007), M(0x111111), 0.03, 0.045, z * 0.009)), ...[-1, 1].map(z => mesh(new THREE.SphereGeometry(0.012, 10, 8).scale(1.6, 0.5, 0.8), M(0x43a047), -0.02, 0.008, z * 0.022)));
  if (tail) g.add(mesh(new THREE.ConeGeometry(0.008, 0.04, 8).rotateZ(Math.PI / 2).scale(1, 0.3, 1), M(0x546e7a), -0.045, 0.02, 0));
  g.scale.setScalar(s); return g;
}
const eggsOnLeaf = () => { const l = leaf('telur_rama'); l.scale.setScalar(0.7); [...Array(5)].forEach((_, i) => l.add(mesh(new THREE.SphereGeometry(0.006), M(0xfff176), -0.02 + i * 0.01, 0.007, (i % 2) * 0.008))); return l; };
const larva = () => group('larva', ...[...Array(7)].map((_, i) => mesh(new THREE.SphereGeometry(0.011 - Math.abs(i - 2) * 0.0008, 10, 8), M(i % 2 ? 0x7cb342 : 0x212121), -0.03 + i * 0.011, 0.011 + Math.sin(i) * 0.002, 0)));
const pupa = () => group('pupa', mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12), M(0x6d4c41), 0, 0.09, 0).rotateZ(Math.PI / 2), mesh(new THREE.CapsuleGeometry(0.012, 0.03, 6, 10), M(0x9ccc65), 0, 0.055, 0));
function butterfly(name = 'rama_rama') {
  const wing = (s, y, sz) => mesh(new THREE.CircleGeometry(sz, 20).scale(1, 0.8, 1), M(0xff8f00, { side: THREE.DoubleSide }), 0, y, s * sz * 0.9);
  const g = group(name, mesh(new THREE.CapsuleGeometry(0.004, 0.04, 4, 8).rotateZ(Math.PI / 2), M(0x212121), 0, 0.03, 0));
  for (const s of [-1, 1]) { const w1 = wing(s, 0.03, 0.03); w1.rotation.x = -Math.PI / 2 + s * 0.4; w1.position.x = 0.008; const w2 = wing(s, 0.03, 0.022); w2.rotation.x = -Math.PI / 2 + s * 0.4; w2.position.x = -0.016; g.add(w1, w2); }
  return g;
}
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const dr = cycleRing(S, root, [['telur_katak', 'Telur', frogEggs], ['berudu', 'Berudu', tadpole], ['anak_katak', 'Anak katak', () => frog('anak_katak', 0.6, true)], ['katak', 'Katak dewasa', () => frog('katak', 1)]], 'frog');
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const dr = cycleRing(S, root, [['telur_rama', 'Telur', eggsOnLeaf], ['larva', 'Larva (beluncas)', larva], ['pupa', 'Pupa', pupa], ['rama_rama', 'Rama-rama', butterfly]], 'butterfly');
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L5 Anak dan induk
function L5(S, play) {
  const root = group('L5', table(1.6, 0.85, play));
  const dr = sorter(S, root, {
    type: 'resemble', size: 0.12,
    zones: [{ id: 'serupa', label: '👪 Anak menyerupai induk', color: 0xb3e5fc, x: -0.38, z: -0.18, w: 0.66 }, { id: 'berbeza', label: '🔄 Anak tidak menyerupai induk', color: 0xffe0b2, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['beruang', '🐻', 'Beruang', 'serupa'], ['harimau', '🐅', 'Harimau', 'serupa'], ['belalang', '🦗', 'Belalang', 'serupa'],
      ['katak', '🐸', 'Katak', 'berbeza'], ['rama_rama', '🦋', 'Rama-rama', 'berbeza'], ['kumbang', '🐞', 'Kumbang kura-kura', 'berbeza']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: zone === 'berbeza' ? `Anak ${label.toLowerCase()} kelihatan sangat berbeza (contoh: berudu, larva).` : `Anak ${label.toLowerCase()} kelihatan seperti induknya, cuma lebih kecil.` })),
    ok: (it, z) => `✅ Anak ${it.label.toLowerCase()} <b>${z.id === 'serupa' ? 'menyerupai' : 'tidak menyerupai'}</b> induknya. Induk bermaksud ibu dan bapa haiwan.`,
  });
  return { root, view: { w: 1.6, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L6 Melindungi telur dan anak
function L6(S, play) {
  const root = group('L6', table(1.5, 0.85, play));
  const branch = group('dahan', mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.26), M(0x6d4c41), 0, 0.13, 0), mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.16), M(0x6d4c41), 0.06, 0.22, 0).rotateZ(-1.1));
  const ns = nest('sarang'); ns.position.set(0.12, 0.25, 0); branch.add(ns); branch.position.set(-0.55, 0, -0.2); root.add(branch);
  const mom = bird('ibu_burung'); mom.position.set(0.0, 0.27, 0.05); branch.add(mom);
  const sand = group('pasir', mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 24), M(0xf2d79b, { roughness: 1 }), 0, 0.01, 0)); sand.position.set(-0.05, 0, -0.18); root.add(sand);
  const turtle = emojiCard('penyu', '🐢', 'Penyu', 0.1); turtle.position.set(0.12, 0, -0.18); root.add(turtle);
  const hide = group('tempat_tersorok', mesh(new THREE.BoxGeometry(0.22, 0.012, 0.14), M(0x8d6e63), 0, 0.1, 0), ...[[-0.1, -0.06], [0.1, -0.06], [-0.1, 0.06], [0.1, 0.06]].map(([x, z]) => mesh(new THREE.BoxGeometry(0.012, 0.1, 0.012), M(0x6d4c41), x, 0.05, z)));
  hide.position.set(0.48, 0, -0.18); root.add(hide);
  const hl = textSprite('Bawah meja (tersorok)', { h: 0.026 }); hl.position.set(0.48, 0.15, -0.18); root.add(hl);
  const eggs = (name, color, n) => group(name, ...[...Array(n)].map((_, i) => mesh(new THREE.SphereGeometry(0.012, 12, 8).scale(1, 1.25, 1), M(color), (i - (n - 1) / 2) * 0.026, 0.015, 0)));
  const birdEggs = eggs('telur_burung', 0xb3e5fc, 3), turtleEggs = eggs('telur_penyu', 0xfafafa, 4), kittens = group('anak_kucing', ...[0, 1, 2].map(i => { const c = mesh(new THREE.SphereGeometry(0.018, 12, 8).scale(1.3, 0.8, 1), M([0xff8a65, 0x9e9e9e, 0xffcc80][i]), (i - 1) * 0.04, 0.015, 0); return c; }));
  [birdEggs, turtleEggs, kittens].forEach((o, i) => { o.scale.setScalar(1.5); o.position.set(-0.35 + i * 0.35, 0, 0.27); const t = textSprite(['Telur burung', 'Telur penyu', 'Anak kucing'][i], { h: 0.026 }); t.position.set(0, 0.05, 0.04); o.add(t); root.add(home(o)); });
  birdEggs.userData.carryY = 0.2;
  const safe = new Set();
  const dr = dragger(S, () => [birdEggs, turtleEggs, kittens].filter(o => !safe.has(o)), {
    async onDrop(o, x, y) {
      const T = { telur_burung: [ns, 0, '🐦 Burung membuat sarang di atas dahan pokok untuk melindungi telur daripada haiwan lain di bawah pokok.'], telur_penyu: [sand, 0.02, '🐢 Penyu <b>menimbus</b> telurnya di dalam pasir.'], anak_kucing: [hide, 0.0, '🐈 Kucing melahirkan anak di <b>tempat tersorok</b> supaya selamat daripada gangguan musuh. Ibu kucing menjaga dan menyusukan anaknya.'] }[o.name];
      if (!(nearScreen(S, T[0], x, y, T[1], 70) || flat(o.position, T[0].getWorldPosition(new THREE.Vector3())) < 0.12)) {
        const wrong = [ns, sand, hide].find(t => nearScreen(S, t, x, y, 0, 70));
        if (wrong) S.info('🤔 Adakah tempat itu sesuai? Fikirkan di mana haiwan itu melindungi telur atau anaknya.');
        return goHome(S, o);
      }
      safe.add(o);
      const at = root.worldToLocal(T[0].getWorldPosition(new THREE.Vector3()));
      if (o === birdEggs) { at.y += 0.01; o.scale.setScalar(0.9); }
      if (o === turtleEggs) { await moveTo(S, o, at.clone().setY(0.02)); await S.tween(1, k => o.position.y = 0.02 - k * 0.03); o.visible = false; const mound = mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, 6.3, 0, 1.57).scale(1, 0.4, 1), M(0xe6c88a), at.x, 0.02, at.z); root.add(mound); }
      else await moveTo(S, o, at);
      S.evt('protect', o.name); S.info(T[2], 8);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Cara membiak', sp: 'SP 4.1.1 · 4.1.2', make: L1 },
  { id: 'L2', title: 'Bilangan telur dan anak', sp: 'SP 4.1.3 · 4.1.4', make: L2 },
  { id: 'L3', title: 'Kitar hidup katak', sp: 'SP 4.1.5 · 4.1.7', make: L3 },
  { id: 'L4', title: 'Kitar hidup rama-rama', sp: 'SP 4.1.5 · 4.1.7', make: L4 },
  { id: 'L5', title: 'Anak dan induk', sp: 'SP 4.1.6', make: L5 },
  { id: 'L6', title: 'Melindungi telur dan anak', sp: 'TP 6', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haiwan — Pembiakan dan Kitar Hidup',
  intro: '<b>Sains Tahun 2 · Unit 4.</b> Bagaimana haiwan membiak dan membesar? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
