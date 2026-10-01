// Sains Tahun 1 · Unit 5 Haiwan — body parts, what they are for, similar body coverings, sketch + label.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, traceSheet, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const row = (n, i, gap, z) => new THREE.Vector3((i - (n - 1) / 2) * gap, 0, z);

// ------------------------------------------------------------ L1 Bahagian tubuh: give each part to its animal
const PARTS = [['sumbu', 'Sumbu', 'badak_sumbu'], ['cangkerang', 'Cangkerang', 'kura_kura'], ['sisik', 'Sisik', 'ikan'],
  ['sesungut', 'Sesungut', 'rama_rama'], ['kaki_selaput', 'Kaki selaput renang', 'itik'], ['tanduk', 'Tanduk', 'kambing']];
const ANIMALS = { badak_sumbu: ['🦏', 'Badak sumbu'], kura_kura: ['🐢', 'Kura-kura'], ikan: ['🐟', 'Ikan'], rama_rama: ['🦋', 'Rama-rama'],
  itik: ['🦆', 'Itik'], kambing: ['🐐', 'Kambing'], burung: ['🐦', 'Burung'], buaya: ['🐊', 'Buaya'], kuda: ['🐎', 'Kuda'],
  lembu: ['🐄', 'Lembu'], kucing: ['🐈', 'Kucing'], hamster: ['🐹', 'Hamster'], arnab: ['🐇', 'Arnab'], harimau: ['🐅', 'Harimau'] };
const animal = (id, size = 0.15, border = '#3a7bd5') => emojiCard(id, ANIMALS[id][0], ANIMALS[id][1], size, { border });

function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const order = ['kura_kura', 'kambing', 'ikan', 'badak_sumbu', 'itik', 'rama_rama'];
  const beasts = order.map((id, i) => { const a = animal(id); a.position.copy(row(6, i, 0.23, -0.2)); root.add(a); return a; });
  const mix = [3, 0, 5, 1, 4, 2];
  const cards = PARTS.map(([id, label, owner], i) => { const c = emojiCard(id, '', label, 0.07, { border: '#f5a623' }); c.position.copy(row(6, mix[i], 0.23, 0.24)); c.userData.owner = owner; root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c) {
      const a = beasts.find(b => flat(b.position, c.position) < 0.11);
      if (!a) return goHome(S, c);
      const label = PARTS.find(p => p[0] === c.name)[1];
      if (a.name !== c.userData.owner) { S.info(`🤔 ${ANIMALS[a.name][1]} tidak mempunyai <b>${label.toLowerCase()}</b>. Cuba lagi!`); return goHome(S, c); }
      done.add(c); moveTo(S, c, a.position.clone().add(new THREE.Vector3(0, 0, 0.1)));
      S.star(a.position.clone().setY(0.25)); S.evt('part', c.name);
      S.info(`✅ ${ANIMALS[a.name][1]} mempunyai <b>${label.toLowerCase()}</b>.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Fungsi: give each animal the part it needs for its problem
const NEEDS = [
  ['burung', 'kepak', 'Kepak', '🌊 Perlu menyeberang sungai', 'fly', '🐦 <b>Kepak (sayap)</b> membantu burung <b>terbang</b>.'],
  ['itik', 'kaki_selaput', 'Kaki selaput renang', '🌊 Perlu berenang', 'swim', '🦆 <b>Kaki selaput renang</b> membantu itik <b>berenang</b>.'],
  ['ikan', 'ekor', 'Ekor', '↩️ Perlu membelok', 'steer', '🐟 <b>Ekor</b> membantu ikan <b>memandu arah</b>.'],
  ['badak_sumbu', 'sumbu', 'Sumbu', '🐅 Harimau datang!', 'defend', '🦏 <b>Sumbu</b> membantu badak sumbu <b>mempertahankan diri</b>.'],
  ['buaya', 'kulit_keras', 'Kulit keras', '🐅 Harimau datang!', 'defend', '🐊 <b>Kulit keras</b> membantu buaya <b>mempertahankan diri</b>.'],
];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.85, play));
  const river = mesh(new THREE.BoxGeometry(1.5, 0.004, 0.16), M(0x64b5f6, { transparent: true, opacity: 0.7 }), 0, 0.002, -0.38); river.userData.fx = true; root.add(river);
  const beasts = NEEDS.map(([id, , , need], i) => {
    const a = animal(id, 0.14); a.position.copy(row(5, i, 0.28, -0.12)); root.add(a);
    const t = textSprite(need, { h: 0.026 }); t.position.set(0, 0.2, 0); a.add(t); a.userData.problem = t; return a;
  });
  const mix = [2, 4, 0, 3, 1];
  const cards = NEEDS.map(([owner, id, label], i) => { const c = emojiCard(id, '', label, 0.07, { border: '#f5a623' }); c.position.copy(row(5, mix[i], 0.28, 0.25)); c.userData.owner = owner; root.add(home(c)); return c; });
  const done = new Set();
  async function act(a, kind) {
    const p0 = a.position.clone();
    if (kind === 'fly') await S.tween(2, k => { a.position.set(p0.x, Math.sin(k * Math.PI) * 0.18, p0.z - k * 0.26); });
    if (kind === 'swim') await S.tween(2, k => { a.position.set(p0.x + Math.sin(k * 6) * 0.02, 0, p0.z - k * 0.26); });
    if (kind === 'steer') await S.tween(2, k => { a.position.set(p0.x + Math.sin(k * Math.PI * 2) * 0.08, 0, p0.z); a.rotation.y = Math.cos(k * Math.PI * 2) * 0.6; });
    if (kind === 'defend') {
      const tiger = animal('harimau', 0.12, '#d32f2f'); tiger.position.set(p0.x + 0.18, 0, p0.z + 0.1); root.add(tiger);
      await S.tween(0.6, k => tiger.position.x = p0.x + 0.18 - k * 0.06);
      await S.tween(0.3, k => a.position.x = p0.x + Math.sin(k * Math.PI) * 0.04);
      await S.tween(1, k => { tiger.position.x = p0.x + 0.12 + k * 0.5; tiger.position.z = p0.z + 0.1 + k * 0.2; });
      root.remove(tiger);
    }
  }
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c) {
      const a = beasts.find(b => flat(b.position, c.position) < 0.12);
      if (!a) return goHome(S, c);
      const n = NEEDS.find(x => x[0] === a.name);
      if (a.name !== c.userData.owner) { S.info(`🤔 ${PARTS.find(p => p[0] === c.name)?.[1] || NEEDS.find(x => x[1] === c.name)[2]} tidak membantu ${ANIMALS[a.name][1].toLowerCase()} yang ${n[3].replace(/^\S+ /, '').toLowerCase()}.`); return goHome(S, c); }
      done.add(c); c.visible = false; a.userData.problem.visible = false;
      S.evt('function', c.name); S.info(n[5], 7);
      act(a, n[4]).then(() => S.star(a.position.clone().setY(0.25)));
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L3 Berbeza tetapi serupa: which animals have soft fur?
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const zone = group('zon_bulu', mesh(new THREE.BoxGeometry(0.9, 0.006, 0.26), M(0xffe0b2, { transparent: true, opacity: 0.8 }), 0, 0.003, 0));
  const zl = textSprite('🧶 Berbulu halus', { h: 0.04 }); zl.position.set(0, 0.03, 0.16); zone.add(zl); zone.position.set(0, 0, -0.22); root.add(zone);
  const FUR = { lembu: true, kucing: true, hamster: true, arnab: true, ikan: 'bersisik', kura_kura: 'bercangkerang', buaya: 'berkulit keras' };
  const ids = ['ikan', 'kucing', 'buaya', 'lembu', 'kura_kura', 'hamster', 'arnab'];
  const cards = ids.map((id, i) => { const a = animal(id, 0.13); a.position.copy(row(7, i, 0.2, 0.22)); root.add(home(a)); return a; });
  const inside = new Set();
  const dr = dragger(S, () => cards.filter(c => !inside.has(c)), {
    onDrop(c) {
      if (Math.abs(c.position.x - zone.position.x) > 0.47 || Math.abs(c.position.z - zone.position.z) > 0.16) return goHome(S, c);
      if (FUR[c.name] !== true) { S.info(`🤔 ${ANIMALS[c.name][1]} tidak berbulu halus — ia <b>${FUR[c.name]}</b>.`); return goHome(S, c); }
      inside.add(c); moveTo(S, c, zone.position.clone().add(new THREE.Vector3((inside.size - 2.5) * 0.2, 0, 0)));
      S.evt('fur', c.name); S.star(zone.position.clone().setY(0.25));
      S.info(inside.size < 4 ? `✅ ${ANIMALS[c.name][1]} berbulu halus.` : '🎉 Lembu, kucing, hamster dan arnab ialah haiwan berlainan, tetapi semuanya <b>berbulu halus</b>!');
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Perhatikan dan labelkan: trace a fish, then label it
function fishOutline() {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; pts.push([0.04 + Math.cos(a) * 0.15, Math.sin(a) * 0.075]); }  // upper body, head -> back
  pts.push([-0.14, 0.02], [-0.21, 0.07], [-0.19, 0], [-0.21, -0.07], [-0.14, -0.02]);  // tail
  for (let i = 14; i >= 0; i--) { const a = i / 14 * Math.PI; pts.push([0.04 + Math.cos(a) * 0.15, -Math.sin(a) * 0.075]); }
  return pts.slice(0, -1);
}
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const model = animal('ikan', 0.16); model.position.set(-0.5, 0, -0.15); root.add(model);
  const spots = { sirip: [0.04, 0.12], sisik: [0.07, 0.0], ekor: [-0.19, 0.0] };
  const ts = traceSheet(S, {
    w: 0.6, h: 0.36, pts: fishOutline(), ink: '#e65100',
    decorate(g, px) {  // printed fin + eye; numbered dots where the labels go
      g.fillStyle = '#ffe0b2'; g.beginPath(); [[0.0, 0.07], [0.04, 0.13], [0.1, 0.065]].forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](...px(p))); g.fill();
      g.fillStyle = '#333'; g.beginPath(); g.arc(...px([0.14, 0.02]), 9, 0, 7); g.fill();
    },
  });
  const sheet = ts.sheet; sheet.position.set(0.12, 0.002, -0.08); root.add(sheet, ts.pencil);
  const dots = Object.entries(spots).map(([k, [x, y]]) => {
    const d = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 20), M(0xe0457b), 0.12 + x, 0.006, -0.08 - y); d.name = 'titik_' + k; d.visible = false; root.add(d); return d;
  });
  const labels = [['sirip', 'Sirip'], ['sisik', 'Sisik'], ['ekor', 'Ekor']].map(([id, t], i) => { const c = emojiCard(id, '', t, 0.06, { border: '#f5a623' }); c.position.set(-0.2 + i * 0.25, 0, 0.3); c.visible = false; root.add(home(c)); return c; });
  let sketched = false; const placed = new Set();
  const dr = dragger(S, () => labels.filter(c => c.visible && !placed.has(c)), {
    onDrop(c) {
      const d = dots.find(d => flat(d.position, c.position) < 0.07);
      if (!d) return goHome(S, c);
      if (d.name !== 'titik_' + c.name) { S.info('🤔 Bukan di situ. Lihat ikan sebenar di sebelah kiri.'); return goHome(S, c); }
      placed.add(c); d.visible = false; moveTo(S, c, d.position.clone().setY(0));
      S.evt('label', c.name); S.star(d.position.clone().setY(0.15));
      S.info({ sirip: '✅ <b>Sirip</b> membantu ikan berenang.', sisik: '✅ <b>Sisik</b> menutupi badan ikan.', ekor: '✅ <b>Ekor</b> membantu ikan memandu arah.' }[c.name]);
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    pen(x, y, on) {
      if (sketched || !ts.pen(x, y, on)) return;
      sketched = true; S.evt('sketch', 'ikan'); S.star(sheet.position.clone().setY(0.2));
      S.info('✏️ Lakaran ikan siap! Sekarang <b>labelkan</b> bahagian tubuhnya.');
      dots.forEach(d => d.visible = true); labels.forEach((c, i) => { c.visible = true; c.scale.setScalar(0.01); S.tween(0.4 + i * 0.1, t => c.scale.setScalar(0.01 + t)); });
    },
    tracePath: ts.tracePath,
  };
}

const LEVELS = [
  { id: 'L1', title: 'Bahagian tubuh haiwan', sp: 'DSKP hlm. 39', make: L1 },
  { id: 'L2', title: 'Kepentingan bahagian tubuh', sp: 'DSKP hlm. 39', make: L2 },
  { id: 'L3', title: 'Berbeza tetapi serupa', sp: 'DSKP hlm. 39', make: L3 },
  { id: 'L4', title: 'Lakar dan labelkan', sp: 'DSKP hlm. 39', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haiwan',
  intro: '<b>Sains Tahun 1 · Unit 5.</b> Kenali bahagian tubuh haiwan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / lakar · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
