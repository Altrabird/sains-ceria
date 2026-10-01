// Sains Tahun 5 · Unit 4 Tumbuh-tumbuhan (SP 4.1.1 – 4.2.4) — protection from enemies, adapting to climate,
// seed and fruit dispersal (sort + a dispersal lab: wind, water, explosion).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Melindungi diri daripada musuh
function L1(S, play) {
  const root = group('L1', table(2.0, 0.95, play));
  const Z = (id, label, color, i) => ({ id, label, color, x: -0.76 + i * 0.38, z: -0.18, w: 0.35, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'protect', size: 0.085, gap: 0.185, row: 0.3,
    zones: [Z('duri', '🌵 Berduri tajam', 0xe8f5e9, 0), Z('getah', '💧 Getah', 0xfffde7, 1), Z('bulu', '〰️ Bulu halus', 0xf3e5f5, 2), Z('racun', '☠️ Beracun', 0xffebee, 3), Z('busuk', '🤢 Berbau busuk', 0xefebe9, 4)],
    items: [['durian', '', 'Durian', 'duri'], ['nanas', '🍍', 'Nanas', 'duri'], ['nangka', '', 'Nangka', 'getah'], ['betik', '', 'Betik', 'getah'], ['buluh', '🎋', 'Buluh', 'bulu'],
      ['labu', '🎃', 'Labu', 'bulu'], ['alamanda', '🌼', 'Alamanda', 'racun'], ['pongpong', '', 'Pong-pong', 'racun'], ['jeremin', '🌿', 'Jeremin', 'busuk'], ['tahi_ayam', '🌸', 'Bunga tahi ayam', 'busuk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Duri melukakan, getah melekit, bulu halus gatal, racun memudaratkan, bau busuk menjauhkan musuh.' })),
    ok: (it, z) => `✅ ${it.label} — ${z.label.slice(z.label.indexOf(' ') + 1).toLowerCase()}.`,
    onDone: () => setTimeout(() => S.info('🛡️ Ciri khas ini melindungi tumbuhan daripada musuh dan memastikan kemandirian spesies.', 9), 2500),
  });
  return { root, view: { w: 2.0, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Menyesuaikan diri dengan iklim
function L2(S, play) {
  const root = group('L2', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['kelapa', '🌴', 'Kelapa (angin kencang)', 'Batang mudah lentur'], ['kaktus', '🌵', 'Kaktus (kering)', 'Daun menjadi duri'], ['tomato', '🍅', 'Tomato (panas)', 'Bulu halus pada batang'],
    ['kunyit', '', 'Kunyit (panas)', 'Menggulungkan daun'], ['keladi', '', 'Keladi (panas)', 'Daun berlilin'], ['getah', '🍂', 'Pokok getah (kering)', 'Meluruhkan daun'], ['pain', '🌲', 'Pokok pain (sejuk)', 'Daun jarum, kulit tebal']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l.split(' (')[0]}: <b>${f.toLowerCase()}</b>.` })),
    { type: 'climate', gap: 0.255, targetZ: -0.24, rowZ: 0.3, onDone: () => setTimeout(() => S.info('🌍 Ciri-ciri ini membantu tumbuhan mengurangkan kehilangan air dan terus hidup dalam iklim yang berbeza.', 9), 2500) });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Cara pencaran biji benih dan buah
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const Z = (id, label, color, i) => ({ id, label, color, x: -0.63 + i * 0.42, z: -0.18, w: 0.39, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'disperse', size: 0.09, gap: 0.21, row: 0.3,
    zones: [Z('angin', '🌬️ Angin', 0xe3f2fd, 0), Z('air', '🌊 Air', 0xe0f7fa, 1), Z('haiwan', '🐇 Haiwan dan manusia', 0xfff3e0, 2), Z('letupan', '💥 Letupan', 0xfce4ec, 3)],
    items: [['angsana', '', 'Angsana: bersayap', 'angin'], ['dandelion', '🌼', 'Dandelion: berbulu halus', 'angin'], ['kelapa', '🥥', 'Kelapa: sabut berongga', 'air'], ['teratai', '', 'Teratai: ringan, terapung', 'air'],
      ['rambutan', '', 'Rambutan: berisi, menarik', 'haiwan'], ['pepulut', '', 'Pepulut: bercangkuk', 'haiwan'], ['keembung', '', 'Keembung: lenggai merekah', 'letupan'], ['getah', '', 'Getah: buah meletup', 'letupan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Lihat ciri buah atau biji benih itu — ringan, terapung, menarik, bercangkuk atau merekah?' })),
    ok: (it, z) => `✅ ${it.label} — tersebar melalui <b>${z.label.slice(z.label.indexOf(' ') + 1).toLowerCase()}</b>.`,
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Makmal pencaran: wind, water, explosion
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  // dandelion
  const dand = group('dandelion', mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.22, 8), M(0x7cb342), 0, 0.11, 0)); dand.position.set(-0.55, 0, -0.15); root.add(dand);
  const seeds = []; for (let i = 0; i < 40; i++) { const d = new THREE.Vector3().randomDirection(); const s = mesh(new THREE.SphereGeometry(0.008, 6, 4), M(0xffffff)); s.position.set(d.x * 0.045, 0.24 + d.y * 0.045, d.z * 0.045); dand.add(s); seeds.push(s); }
  const wind = emojiCard('angin', '🌬️', 'Angin', 0.1, { border: '#29b6f6' }); wind.position.set(-0.55, 0, 0.25); root.add(wind);
  // water + coconut
  const pond = mesh(new THREE.BoxGeometry(0.42, 0.03, 0.34), M(0x4fc3f7, { transparent: true, opacity: 0.75 }), 0.05, 0.015, -0.15); pond.name = 'kolam'; root.add(pond);
  const coco = group('kelapa', mesh(new THREE.SphereGeometry(0.045, 20, 14), M(0x795548, { roughness: 0.9 }), 0, 0.045, 0)); coco.position.set(0.05, 0, 0.27); root.add(home(coco));
  const ct = textSprite('🥥 Kelapa', { h: 0.026 }); ct.position.set(0, 0.11, 0); coco.add(ct);
  // keembung pod
  const pod = group('keembung', mesh(new THREE.SphereGeometry(0.04, 16, 12).scale(0.7, 1.4, 0.7), M(0x8bc34a), 0, 0.06, 0)); pod.position.set(0.55, 0, -0.1); root.add(pod);
  const pt = textSprite('Keembung', { h: 0.026 }); pt.position.set(0, 0.15, 0); pod.add(pt);
  const done = new Set(); let floating = false, tt = 0;
  const finish = (id, msg) => { if (done.has(id)) return; done.add(id); S.evt('disperse', id); S.info(msg, 7);
    if (done.size === 3) setTimeout(() => S.info('🌱 Pencaran mengelakkan persaingan, mengelakkan kepupusan dan memastikan sumber makanan berterusan.', 9), 3500); };
  function blow() {
    if (done.has('angin')) return;
    seeds.forEach((s, i) => { const a = s.position.clone(), b = new THREE.Vector3(0.5 + Math.random() * 0.6, 0.15 + Math.random() * 0.3, -0.3 + Math.random() * 0.5); S.tween(2 + Math.random() * 1.5, t => s.position.lerpVectors(a, b, t).y += Math.sin(t * 9 + i) * 0.02, () => (s.visible = false)); });
    finish('angin', '✅ Biji benih dandelion kecil, ringan dan berbulu halus — <b>angin</b> membawanya jauh.');
  }
  function pop() {
    if (done.has('letupan')) return; pod.children[0].material.color.set(0x8d6e63); pod.children[0].scale.set(1.4, 0.8, 1.4);
    for (let i = 0; i < 14; i++) { const s = mesh(new THREE.SphereGeometry(0.008, 6, 4), M(0x3e2723)); s.position.set(0, 0.07, 0); pod.add(s); const a = Math.random() * 6.28, r = 0.15 + Math.random() * 0.15;
      S.tween(0.9, t => s.position.set(Math.cos(a) * r * t, 0.07 + Math.sin(t * Math.PI) * 0.15 - t * 0.06, Math.sin(a) * r * t)); }
    finish('letupan', '✅ Lenggai keembung kering, merekah dan <b>meletup</b> — biji benih tercampak jauh dari pokok induk.');
  }
  const dr = dragger(S, () => (floating ? [] : [coco]), {
    onDrop(o) {
      if (Math.abs(o.position.x - pond.position.x) > 0.25 || Math.abs(o.position.z - pond.position.z) > 0.22) return goHome(S, o);
      floating = true; o.position.set(-0.08, 0.01, -0.15);
      finish('air', '✅ Kelapa <b>terapung</b> kerana kulit berlilin dan sabut berongga — air membawanya ke tempat lain.');
    },
  });
  return {
    root, view: { w: 1.6, d: 0.95 }, ...dr,
    hit: (x, y) => dr.hit?.(x, y) ?? S.hitTest(x, y, [wind, pod])?.name ?? null,
    tap(x, y) { const c = S.hitTest(x, y, [wind, pod]); if (c === wind) blow(); else if (c === pod) pop(); },
    wind: blow,
    update(dt) { if (!floating) return; tt += dt; coco.position.x = Math.min(0.2, -0.08 + tt * 0.04); coco.position.y = 0.0 + Math.sin(tt * 3) * 0.006; },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Melindungi diri daripada musuh', sp: 'SP 4.1.1', make: L1 },
  { id: 'L2', title: 'Menyesuaikan diri dengan iklim', sp: 'SP 4.1.2', make: L2 },
  { id: 'L3', title: 'Pencaran biji benih dan buah', sp: 'SP 4.2.1 · 4.2.2', make: L3 },
  { id: 'L4', title: 'Makmal pencaran', sp: 'SP 4.2.1 – 4.2.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tumbuh-tumbuhan (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 4.</b> Kemandirian tumbuhan dan pencaran biji benih! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = angin · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
