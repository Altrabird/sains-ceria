// Sains Tahun 5 · Unit 3 Haiwan (SP 3.1.1 – 3.3.6) — special traits and behaviours for protection, surviving
// extreme weather, protecting eggs and young, food chain, pond food web, imaginary animal model.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, sequence, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const P = ([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.toLowerCase()}</b>.` });

// ------------------------------------------------------------ L1 Melindungi diri daripada musuh
function L1(S, play) {
  const root = group('L1', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['kura', '🐢', 'Kura-kura', 'Cangkerang keras'], ['lebah', '🐝', 'Lebah', 'Sengat berbisa'], ['rama', '🦋', 'Rama-rama', 'Corak mata palsu'], ['buaya', '🐊', 'Buaya', 'Sisik keras'],
    ['arnab', '🐇', 'Arnab', 'Otot kaki kuat'], ['kerbau', '🐃', 'Kerbau', 'Tanduk tajam'], ['cicak', '🦎', 'Cicak', 'Memutuskan ekor'], ['sotong', '🦑', 'Sotong', 'Menyemburkan dakwat']].map(P),
    { type: 'defence', gap: 0.225, targetZ: -0.24, rowZ: 0.3, onDone: () => setTimeout(() => S.info('🛡️ Ciri dan tingkah laku khas melindungi haiwan daripada musuh — supaya spesies tidak pupus.', 9), 2500) });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Cuaca melampau
function L2(S, play) {
  const root = group('L2', table(1.7, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.5, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'weather', size: 0.1, gap: 0.2, row: 0.3,
    zones: [Z('sejuk', '❄️ Cuaca sejuk', 0xe3f2fd, -0.56), Z('migrasi', '✈️ Berhijrah', 0xede7f6, 0), Z('panas', '☀️ Cuaca panas', 0xfff3e0, 0.56)],
    items: [['beruang', '🐻', 'Beruang kutub: bulu tebal', 'sejuk'], ['penguin', '🐧', 'Penguin: bulu pelepah padat', 'sejuk'], ['walrus', '', 'Walrus: lemak tebal', 'sejuk'],
      ['paus', '🐋', 'Paus berhijrah', 'migrasi'], ['angsa', '🦢', 'Burung berhijrah', 'migrasi'],
      ['badak', '🦛', 'Badak air berendam', 'panas'], ['unta', '🐪', 'Unta: lemak dalam bonggol', 'panas'], ['musang', '🦊', 'Musang gurun: telinga besar', 'panas']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah ciri ini untuk cuaca sejuk, cuaca panas, atau haiwan ini berhijrah?' })),
    ok: (it, z) => `✅ ${it.label} — ${z.id === 'sejuk' ? 'memerangkap haba dalam <b>cuaca sejuk</b>' : z.id === 'panas' ? 'menyejukkan badan dalam <b>cuaca panas</b>' : 'berhijrah ke kawasan lebih panas apabila <b>cuaca sejuk</b>'}.`,
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Melindungi telur dan anak
function L3(S, play) {
  const root = group('L3', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['buaya', '🐊', 'Buaya', 'Sembunyi telur dalam jerumun'], ['katak', '🐸', 'Katak', 'Telur diselaputi lendir'], ['kura', '🐢', 'Kura-kura', 'Timbus telur dalam tanah'],
    ['kanggaru', '🦘', 'Kanggaru', 'Bawa anak dalam kantung'], ['tilapia', '🐟', 'Ikan tilapia', 'Bawa anak dalam mulut'], ['ayam', '🐔', 'Ayam', 'Menyerang apabila anak diganggu'], ['singa', '🦁', 'Singa', 'Beri makanan kepada anak']].map(P),
    { type: 'young', gap: 0.255, targetZ: -0.24, rowZ: 0.3, onDone: () => setTimeout(() => S.info('🥚 Melindungi telur dan anak memastikan spesies dapat terus hidup dan tidak pupus.', 9), 2500) });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Rantai makanan
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  const sun = emojiSprite('☀️', 0.12); sun.position.set(-0.62, 0.12, -0.32); root.add(sun);
  const dr = sequence(S, root, [['buah', '🍎', 'Buah-buahan'], ['tupai', '🐿️', 'Tupai'], ['ular', '🐍', 'Ular'], ['helang', '🦅', 'Helang']].map(([id, e, l]) => ({ obj: emojiCard(id, e, l, 0.12, { border: '#43a047' }), label: '' , id, l })), {
    type: 'chain', gap: 0.3, slotW: 0.22, hint: n => n ? `🤔 Siapakah yang memakan ${['buah-buahan', 'tupai', 'ular'][n - 1]}?` : '🤔 Rantai makanan bermula dengan pengeluar — tumbuhan hijau.',
    ok: it => `✅ ${it.l}${it.id === 'buah' ? ' — <b>pengeluar</b> (dihasilkan oleh tumbuhan hijau)' : ' — <b>pengguna</b>'}.`,
    onDone: () => {
      for (let i = 0; i < 3; i++) { const a = textSprite('➜', { h: 0.06, bg: '#ffffff00' }); a.position.set(-0.3 + i * 0.3, 0.06, -0.2); root.add(a); }
      const e = mesh(new THREE.SphereGeometry(0.022, 12, 10), M(0xffd54f, { emissive: 0xffc107, emissiveIntensity: 0.8 })); e.position.set(-0.62, 0.12, -0.32); root.add(e);
      S.tween(3, t => e.position.set(-0.62 + t * 1.07, 0.12 + Math.sin(t * Math.PI * 4) * 0.03, -0.32 + Math.min(t * 4, 1) * 0.12));
      S.info('⚡ Anak panah bermaksud "dimakan oleh". Tenaga dari Matahari dipindahkan dari pengeluar kepada pengguna.', 9);
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L5 Siratan makanan kolam: tap prey, then its predator
const NODES = { rumpai: ['🌿', 'Rumpai air', -0.55, 0.05], siput: ['🐌', 'Siput', -0.15, -0.3], berudu: ['', 'Berudu', -0.15, 0.05], belalang: ['🦗', 'Belalang', -0.15, 0.32], katak: ['🐸', 'Katak', 0.2, 0.32], bangau: ['🦩', 'Bangau', 0.55, -0.05] };
const LINKS = ['rumpai>siput', 'rumpai>berudu', 'rumpai>belalang', 'belalang>katak', 'siput>bangau', 'berudu>bangau', 'katak>bangau'];
function arrow(a, b, color = 0xe53935) {
  const d = b.clone().sub(a), L = d.length() - 0.13, dir = d.clone().normalize(), mid = a.clone().add(dir.clone().multiplyScalar(0.065 + L / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const shaft = mesh(new THREE.CylinderGeometry(0.008, 0.008, L - 0.03, 8), M(color)); shaft.position.copy(mid); shaft.quaternion.copy(q);
  const head = mesh(new THREE.ConeGeometry(0.02, 0.04, 12), M(color)); head.position.copy(a.clone().add(dir.clone().multiplyScalar(0.065 + L - 0.02))); head.quaternion.copy(q);
  return group('anak_panah', shaft, head);
}
function L5(S, play) {
  const root = group('L5', table(1.5, 0.95, play));
  const nodes = Object.entries(NODES).map(([id, [e, l, x, z]]) => { const c = emojiCard(id, e, l, 0.11, { border: '#43a047' }); c.position.set(x, 0, z); c.userData.id = id; root.add(c); return c; });
  const ring = mesh(new THREE.TorusGeometry(0.08, 0.008, 8, 32), M(0xffc107, { emissive: 0xffc107, emissiveIntensity: 0.6 })); ring.rotation.x = -Math.PI / 2; ring.visible = false; root.add(ring);
  const made = new Set(); let sel = null;
  return {
    root, view: { w: 1.5, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, nodes)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, nodes); if (!c || made.size === LINKS.length) return;
      if (!sel || sel === c) { sel = sel === c ? null : c; ring.visible = !!sel; if (sel) { ring.position.set(c.position.x, 0.005, c.position.z); S.info(`👉 ${NODES[c.name][1]} dimakan oleh…? Tuding pemangsanya.`); } return; }
      const k = sel.name + '>' + c.name; sel = null; ring.visible = false;
      if (!LINKS.includes(k)) return S.info(`🤔 Adakah ${NODES[k.split('>')[1]][1].toLowerCase()} memakan ${NODES[k.split('>')[0]][1].toLowerCase()}? Cuba lagi.`);
      if (made.has(k)) return S.info('👍 Anak panah itu sudah ada.');
      made.add(k); const [a, b] = k.split('>').map(id => nodes.find(n => n.name === id).position.clone().setY(0.03)); root.add(arrow(a, b));
      S.evt('link', k.replace('>', '_')); S.info(`✅ ${NODES[k.split('>')[0]][1]} dimakan oleh <b>${NODES[k.split('>')[1]][1].toLowerCase()}</b>.`);
      if (made.size === LINKS.length) setTimeout(() => S.info('🕸️ Siratan makanan ialah gabungan beberapa rantai makanan dalam suatu habitat.', 9), 2200);
    },
  };
}

// ------------------------------------------------------------ L6 Model haiwan imaginasi: Muri-muri
function L6(S, play) {
  const root = group('L6', table(1.5, 0.95, play));
  const mt = matcher(S, root, [['sisik', '🛡️', 'Sisik', 'Melindungi badan daripada kecederaan'], ['duri', '🦔', 'Duri dan kuku tajam', 'Mempertahankan diri'],
    ['bulu', '🧥', 'Bulu dan lemak tebal', 'Mengekalkan haba ketika sejuk'], ['telinga', '👂', 'Cuping telinga kecil', 'Mengurangkan kehilangan haba']].map(P),
    { type: 'model', gap: 0.34, onDone: () => setTimeout(() => S.info('🐾 Muri-muri siap! Lakar → label → pilih bahan → bina → terangkan. Ciri khas haiwan membantu kemandirian spesies dan keseimbangan alam.', 10), 2500) });
  return { root, view: { w: 1.5, d: 0.95 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Melindungi diri daripada musuh', sp: 'SP 3.1.1 · 3.1.2', make: L1 },
  { id: 'L2', title: 'Cuaca melampau', sp: 'SP 3.1.3', make: L2 },
  { id: 'L3', title: 'Melindungi telur dan anak', sp: 'SP 3.1.4 · 3.1.5', make: L3 },
  { id: 'L4', title: 'Rantai makanan', sp: 'SP 3.3.1 – 3.3.3', make: L4 },
  { id: 'L5', title: 'Siratan makanan', sp: 'SP 3.3.4 · 3.3.5', make: L5 },
  { id: 'L6', title: 'Model haiwan imaginasi', sp: 'SP 3.2.1 – 3.2.4', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haiwan (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 3.</b> Kemandirian spesies dan siratan makanan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
