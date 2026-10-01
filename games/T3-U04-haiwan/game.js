// Sains Tahun 3 · Unit 4 Haiwan (SP 4.1.1 – 4.1.5) — feed animals, classify eating habits, match teeth, polar bear.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, diagramBoard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Beri makan: who eats what?
const EATS = { arnab: ['tumbuhan'], harimau: ['haiwan'], ayam: ['tumbuhan', 'haiwan'] };
const FOOD = [['lobak', '🥕', 'Lobak merah', 'tumbuhan'], ['sawi', '🥬', 'Sawi', 'tumbuhan'], ['daging', '🥩', 'Daging', 'haiwan'], ['bijirin', '🌾', 'Bijirin', 'tumbuhan'], ['cacing', '🐛', 'Cacing', 'haiwan']];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const A = [['arnab', '🐇', 'Arnab'], ['harimau', '🐅', 'Harimau'], ['ayam', '🐔', 'Ayam']].map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.16, { border: '#3a7bd5' }); c.position.set(-0.4 + i * 0.4, 0, -0.18); c.userData.ate = new Set(); root.add(c); return c; });
  const cards = FOOD.map(([id, e, l, kind], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#ef6c00' }); c.userData.kind = kind; c.position.set(-0.5 + [2, 0, 4, 1, 3][i] * 0.25, 0, 0.28); root.add(home(c)); return c; });
  const need = { arnab: 2, harimau: 1, ayam: 2 }; let fed = 0;
  const dr = dragger(S, () => cards, {
    onDrop(c) {
      const a = A.find(a => flat(a.position, c.position) < 0.13); goHome(S, c);
      if (!a) return;
      const label = FOOD.find(f => f[0] === c.name)[2];
      if (!EATS[a.name].includes(c.userData.kind)) {
        const no = emojiSprite('🙅', 0.06); no.position.set(0.06, 0.2, 0); a.add(no); setTimeout(() => a.remove(no), 1200);
        return S.info(`🙅 ${a.name[0].toUpperCase() + a.name.slice(1)} tidak makan ${label.toLowerCase()}.`);
      }
      const yum = emojiSprite('😋', 0.06); yum.position.set(0.06, 0.2, 0); a.add(yum); setTimeout(() => a.remove(yum), 1200);
      if (!a.userData.ate.has(c.userData.kind)) { a.userData.ate.add(c.userData.kind); S.evt('feed', a.name + '_' + c.userData.kind); }
      S.info(`😋 ${a.name[0].toUpperCase() + a.name.slice(1)} makan ${label.toLowerCase()}.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Herbivor, karnivor, omnivor
function L2(S, play) {
  const root = group('L2', table(1.6, 0.9, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.2, w: 0.48, d: 0.32 });
  const dr = sorter(S, root, {
    type: 'diet', size: 0.1, gap: 0.17, row: 0.3,
    zones: [Z('herbivor', '🌿 Herbivor', 0xc8e6c9, -0.52), Z('karnivor', '🥩 Karnivor', 0xffcdd2, 0), Z('omnivor', '🍽️ Omnivor', 0xfff9c4, 0.52)],
    items: [['arnab', '🐇', 'Arnab', 'herbivor'], ['lembu', '🐄', 'Lembu', 'herbivor'], ['kambing', '🐐', 'Kambing', 'herbivor'], ['harimau', '🐅', 'Harimau', 'karnivor'], ['helang', '🦅', 'Helang', 'karnivor'],
      ['buaya', '🐊', 'Buaya', 'karnivor'], ['ayam', '🐔', 'Ayam', 'omnivor'], ['beruang', '🐻', 'Beruang', 'omnivor'], ['monyet', '🐒', 'Monyet', 'omnivor']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Apakah makanan ${label.toLowerCase()}: tumbuhan sahaja, haiwan sahaja, atau kedua-duanya?` })),
    ok: (it, z) => `✅ ${it.label} ialah <b>${z.id}</b> — ${{ herbivor: 'makan tumbuh-tumbuhan sahaja', karnivor: 'makan haiwan lain sahaja', omnivor: 'makan tumbuh-tumbuhan dan haiwan lain' }[z.id]}.`,
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L3 Kegigian haiwan: match the skull to the diet
function drawJaw(kind) {  // side view of upper + lower jaw, teeth outlined on a dark background
  return (g, W, H) => {
    g.fillStyle = '#263238'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#efe6d2'; g.beginPath(); g.ellipse(W * 0.4, H * 0.3, W * 0.36, H * 0.22, 0, 0, 7); g.fill();  // skull
    g.fillRect(W * 0.1, H * 0.36, W * 0.82, H * 0.08); g.fillRect(W * 0.1, H * 0.62, W * 0.82, H * 0.08);        // jaws
    g.fillStyle = '#3e2723'; g.beginPath(); g.arc(W * 0.55, H * 0.25, H * 0.06, 0, 7); g.fill();
    const T = (x, w, h, sharp, up) => { g.fillStyle = '#ffffff'; g.strokeStyle = '#90a4ae'; g.lineWidth = 3; g.beginPath(); const y = up ? H * 0.44 : H * 0.62;
      if (sharp) { g.moveTo(W * x - w / 2, y); g.lineTo(W * x + w / 2, y); g.lineTo(W * x, up ? y + h : y - h); }
      else g.rect(W * x - w / 2, up ? y : y - h, w, h); g.closePath(); g.fill(); g.stroke(); };
    for (const up of [true, false]) {
      if (kind === 'herbivor') { [0.86, 0.8].forEach(x => T(x, 26, 50, false, up)); [0.6, 0.48, 0.36, 0.24].forEach(x => T(x, 60, 46, false, up)); }
      if (kind === 'karnivor') { T(0.83, 40, 95, true, up); [0.7, 0.58, 0.46, 0.34].forEach(x => T(x, 46, 55, true, up)); }
      if (kind === 'omnivor') { [0.88, 0.83].forEach(x => T(x, 22, 45, false, up)); T(0.74, 34, 70, true, up); [0.56, 0.44, 0.32].forEach(x => T(x, 52, 42, false, up)); }
    }
  };
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const order = ['karnivor', 'omnivor', 'herbivor'];
  const skulls = order.map((k, i) => { const s = diagramBoard('tengkorak_' + k, { w: 0.34, h: 0.24, draw: drawJaw(k), tilt: 0.6 }); s.position.set(-0.4 + i * 0.4, 0, -0.2); s.userData.kind = k; root.add(s); return s; });
  const TEETH = { herbivor: '🌿 Herbivor: gigi kacip kuat untuk memotong tumbuhan, gigi geraham besar untuk melumatkan tumbuhan.', karnivor: '🥩 Karnivor: gigi taring tajam untuk mengoyakkan daging.', omnivor: '🍽️ Omnivor: gigi kacip, gigi taring dan gigi geraham.' };
  const cards = [['herbivor', '🐄', 'Herbivor'], ['karnivor', '🐅', 'Karnivor'], ['omnivor', '🐻', 'Omnivor']].map(([id, e, l], i) => { const c = emojiCard('jenis_' + id, e, l, 0.1, { border: '#7e57c2' }); c.userData.kind = id; c.position.set(-0.4 + [1, 0, 2][i] * 0.4, 0, 0.28); root.add(home(c)); return c; });
  const dr = dragger(S, () => cards.filter(c => !c.userData.done), {
    onDrop(c, x, y) {
      const s = S.closest(skulls, x, y, s => nearScreen(S, s, x, y, 0.07, 80) || flat(s.position, c.position) < 0.15);
      if (!s) return goHome(S, c);
      if (s.userData.kind !== c.userData.kind) { S.info('🦷 Lihat gigi tengkorak itu: adakah taringnya tajam? Adakah gerahamnya besar?'); return goHome(S, c); }
      c.userData.done = true; moveTo(S, c, s.position.clone().add(new THREE.Vector3(0, 0, 0.14)));
      S.evt('teeth', s.userData.kind); S.info('✅ ' + TEETH[s.userData.kind], 8);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Perubahan tabiat pemakanan: bear -> polar bear
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const forest = mesh(new THREE.BoxGeometry(0.6, 0.006, 0.34), M(0x81c784), -0.38, 0.003, -0.16); const ice = mesh(new THREE.BoxGeometry(0.6, 0.006, 0.34), M(0xe3f2fd), 0.38, 0.003, -0.16);
  root.add(forest, ice);
  for (const [x, l] of [[-0.38, '🌳 Hutan'], [0.38, '🧊 Kawasan kutub (sejuk, diliputi ais)']]) { const t = textSprite(l, { h: 0.03 }); t.position.set(x, 0.03, -0.36); root.add(t); }
  const bear = emojiCard('beruang', '🐻', 'Beruang', 0.14); bear.position.set(-0.38, 0, -0.16); root.add(bear);
  const polar = emojiCard('beruang_kutub', '🐻', 'Beruang kutub', 0.14, { border: '#90caf9' }); polar.position.set(0.38, 0, -0.16); root.add(polar);
    const FD = [['buah', '🍓', 'Buah beri', 'hutan'], ['madu', '🍯', 'Madu', 'hutan'], ['ikan', '🐟', 'Ikan', 'both'], ['anjing_laut', '🐋', 'Anjing laut', 'kutub']];
  const cards = FD.map(([id, e, l, where], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#ef6c00' }); c.userData.where = where; c.position.set(-0.38 + i * 0.25, 0, 0.28); root.add(home(c)); return c; });
  const forBear = new Set(), forPolar = new Set(); let chosen = false;
  const choices = [['herbivor', 'Herbivor'], ['karnivor', 'Karnivor'], ['omnivor', 'Omnivor']].map(([id, l], i) => { const c = emojiCard('pilih_' + id, '', l, 0.07, { border: '#7e57c2' }); c.userData.id = id; c.position.set(0.15 + i * 0.2, 0, 0.1); c.visible = false; root.add(c); return c; });
  const dr = dragger(S, () => cards.filter(c => !c.userData.done), {
    onDrop(c) {
      const toB = flat(c.position, bear.position) < 0.14, toP = flat(c.position, polar.position) < 0.14;
      if (!toB && !toP) return goHome(S, c);
      const label = FD.find(f => f[0] === c.name)[2];
      if (toP && c.userData.where === 'hutan') { S.info(`🧊 Tiada ${label.toLowerCase()} di kawasan kutub yang sejuk dan diliputi ais!`); return goHome(S, c); }
      if (toB && c.userData.where === 'kutub') { S.info(`🌳 Tiada ${label.toLowerCase()} di dalam hutan.`); return goHome(S, c); }
      c.userData.done = true; (toB ? forBear : forPolar).add(c.name); moveTo(S, c, (toB ? bear : polar).position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.15, 0, 0.12)));
      S.evt('food', c.name); S.info(`😋 ${toB ? 'Beruang' : 'Beruang kutub'} makan ${label.toLowerCase()}.`);
      if (cards.every(k => k.userData.done)) { choices.forEach(k => k.visible = true); setTimeout(() => S.info('❄️ Beruang kutub hanya makan haiwan lain. Tuding tabiat pemakanannya.'), 1500); }
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, choices.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, choices.filter(c => c.visible)); if (!c || chosen) return;
      if (c.userData.id !== 'karnivor') return S.info('🤔 Di kawasan kutub, beruang kutub hanya makan ikan dan anjing laut.');
      chosen = true; S.evt('change', 'karnivor'); S.info('✅ Beruang secara semula jadi ialah <b>omnivor</b>. Beruang kutub ialah <b>karnivor</b> kerana persekitarannya berubah — tiada tumbuhan di kawasan kutub.', 10);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Beri makan haiwan', sp: 'SP 4.1.1', make: L1 },
  { id: 'L2', title: 'Tabiat pemakanan', sp: 'SP 4.1.2 · 4.1.3', make: L2 },
  { id: 'L3', title: 'Kegigian haiwan', sp: 'SP 4.1.4', make: L3 },
  { id: 'L4', title: 'Perubahan tabiat pemakanan', sp: 'SP 4.1.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haiwan — Tabiat Pemakanan',
  intro: '<b>Sains Tahun 3 · Unit 4.</b> Herbivor, karnivor atau omnivor? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
