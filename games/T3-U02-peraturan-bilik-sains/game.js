// Sains Tahun 3 · Unit 2 Peraturan Bilik Sains (SP 2.1.1) — before (windows, door, closed shoes), during (spot 5 mistakes),
// after (wash glassware, switch off fan and lamp).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sink, beaker, labTable, door, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

function windowPanel(name) {
  const g = group(name, mesh(new THREE.BoxGeometry(0.2, 0.16, 0.012), M(0x8d6e63), 0, 0.2, 0), mesh(new THREE.BoxGeometry(0.18, 0.14, 0.014), M(0x37474f), 0, 0.2, 0));
  const sash = group('daun_tingkap', mesh(new THREE.BoxGeometry(0.09, 0.14, 0.006), M(0x90caf9, { transparent: true, opacity: 0.7 }), 0.045, 0, 0));
  sash.position.set(-0.09, 0.2, 0.01); g.add(sash); g.userData.sash = sash; return g;
}

// ------------------------------------------------------------ L1 Sebelum menjalankan aktiviti
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const wall = mesh(new THREE.BoxGeometry(1.4, 0.32, 0.02), M(0xe9dcc8), 0, 0.16, -0.35); root.add(wall);
  const wins = ['tingkap1', 'tingkap2'].map((id, i) => { const w = windowPanel(id); w.position.set(-0.5 + i * 0.3, 0, -0.33); root.add(w); return w; });
  const d = door(); d.position.set(0.4, 0, -0.34); d.children[0].visible = false; root.add(d);
  const dim = mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x000010, transparent: true, opacity: 0.45, depthTest: false }), 0, 0.45, 0);
  dim.rotation.x = -Math.PI / 2; dim.renderOrder = 10; dim.userData.fx = true; root.add(dim);
  const pupil = kid('murid', { shirt: 0xffffff, pants: 0x1f4fa8 }); pupil.scale.setScalar(1.5); pupil.position.set(-0.05, 0, 0.0); root.add(pupil);
  const shoes = [['kasut_bertutup', '👟', 'Kasut bertutup', true], ['selipar', '👡', 'Sandal terbuka', false]].map(([id, e, label, ok], i) => { const c = emojiCard(id, e, label, 0.1, { border: '#3a7bd5' }); c.userData.ok = ok; c.position.set(0.25 + i * 0.25, 0, 0.27); root.add(home(c)); return c; });
  const opened = new Set(); let shod = false;
  
  const dr = dragger(S, () => (shod ? [] : shoes), {
    onDrop(c) {
      if (flat(c.position, pupil.position) > 0.15) return goHome(S, c);
      if (!c.userData.ok) { S.info('🚫 Kasut terbuka tidak melindungi kaki. Pakai <b>kasut yang bertutup</b> bagi mengelakkan kecederaan.'); return goHome(S, c); }
      shod = true; c.visible = false; ['kakiL', 'kakiR'].forEach(n => pupil.getObjectByName(n).children[1].material.color.set(0xffffff));
      S.evt('shoes', 'kasut'); S.info('👟 Kasut bertutup dipakai — kaki selamat daripada kecederaan.');
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [...wins, d].filter(o => !opened.has(o.name)))?.name ?? null,
    tap(x, y) {
      const o = S.hitTest(x, y, [...wins, d].filter(o => !opened.has(o.name))); if (!o) return;
      opened.add(o.name);
      if (o === d) S.tween(0.7, k => d.getObjectByName('pintu_engsel').rotation.y = k * 1.5);
      else S.tween(0.6, k => o.userData.sash.rotation.y = k * 1.9);
      S.tween(0.8, k => dim.material.opacity = 0.45 * (1 - (opened.size - 1 + k) / 3));
      S.evt('open', o.name);
      S.info(opened.size < 3 ? `🪟 Dibuka (${opened.size}/3).` : '🌤️ Semua pintu dan tingkap dibuka supaya mendapat <b>cahaya dan aliran udara yang baik</b>.');
    },
  };
}

// ------------------------------------------------------------ L2 Semasa: spot five mistakes
const MISTAKE = {
  menconteng: '✏️ Jangan <b>menconteng meja</b> — bilik sains mesti sentiasa bersih dan kemas.',
  cuai: '🧪 Ambil peralatan sains dengan <b>cermat dan tertib</b> supaya tidak terjatuh.',
  tanpa_arahan: '👩‍🏫 Jangan menjalankan aktiviti <b>tanpa arahan guru</b>.',
  makan: '🍔 Dilarang <b>makan dan minum</b> di dalam bilik sains.',
  sorok: '🙋 Bikar retak! <b>Segera maklumkan kepada guru</b> jika berlaku kerosakan peralatan.',
};
function L2(S, play) {
  const root = group('L2', table(1.6, 0.9, play));
  for (const [x, n] of [[-0.35, 'meja1'], [0.35, 'meja2']]) { const t = labTable(n, 0.5, 0.24); t.position.set(x, 0, -0.22); root.add(t); }
  const mk = (id, o, x, z, ry = 0) => { const k = kid(id, o); k.position.set(x, 0, z); k.rotation.y = ry; root.add(k); return k; };
  const scrib = mk('menconteng', { shirt: 0xffffff }, -0.5, -0.05, Math.PI);
  const doodle = textSprite('〰️✏️', { h: 0.03, bg: '#ffffff00' }); doodle.position.set(-0.5, 0.18, -0.16); root.add(doodle);
  const careless = mk('cuai', { shirt: 0xffffff, girl: true, pants: 0x1d2b53 }, -0.15, 0.15, 0.4);
  const tilted = beaker(''); tilted.position.set(0.02, 0.12, 0.04); tilted.rotation.z = 1.0; careless.getObjectByName('tanganR').add(tilted);
  const mixer = mk('tanpa_arahan', { shirt: 0xffffff }, 0.2, -0.05, Math.PI);
  const fizz = emojiSprite('💥', 0.06); fizz.position.set(0.2, 0.22, -0.2); root.add(fizz);
  const eater = mk('makan', { shirt: 0xffffff, hair: 0x111111 }, 0.5, 0.15, -0.4);
  const food = emojiSprite('🍔', 0.05); food.position.set(0.03, 0.16, 0.04); eater.add(food);
  const hider = mk('sorok', { shirt: 0xffffff, girl: true, pants: 0x1f4fa8 }, 0.55, -0.05, Math.PI);
  const crack = emojiSprite('🧪', 0.05); crack.position.set(0.5, 0.17, -0.2); root.add(crack);
  const good = mk('baik', { shirt: 0xffffff }, -0.62, 0.22, 0.5);
  good.getObjectByName('kepala').add(mesh(new THREE.BoxGeometry(0.05, 0.014, 0.01), M(0x66ccff, { transparent: true, opacity: 0.7 }), 0, 0.005, 0.033));
  const bad = [scrib, careless, mixer, eater, hider], fixed = new Set(); let t = 0;
  const find = (x, y) => S.hitTest(x, y, [...bad, good]) || S.nearest(x, y, [...bad, good], 45);
  return {
    root, view: { w: 1.6, d: 0.9 },
    hit: (x, y) => find(x, y)?.name ?? null,
    tap(x, y) {
      const k = find(x, y); if (!k) return;
      if (k === good) return S.info('👍 Murid ini memakai gogal dan bekerja dengan tertib — <b>mematuhi peraturan</b>.');
      if (fixed.has(k)) return S.info(MISTAKE[k.name]);
      fixed.add(k); const ok = emojiSprite('✅', 0.06); ok.position.set(0, 0.3, 0); k.add(ok);
      ({ menconteng: () => doodle.visible = false, cuai: () => tilted.rotation.z = 0, tanpa_arahan: () => fizz.visible = false, makan: () => food.visible = false, sorok: () => { const h = k.getObjectByName('tanganR'); h.rotation.x = -2.8; } })[k.name]();
      S.evt('mistake', k.name); S.star(k.position.clone().setY(0.35)); S.info(MISTAKE[k.name], 7);
    },
    update(dt) { t += dt; if (!fixed.has(careless)) tilted.rotation.z = 1.0 + Math.sin(t * 4) * 0.2; if (!fixed.has(mixer)) fizz.scale.setScalar(0.05 + Math.abs(Math.sin(t * 5)) * 0.03); },
  };
}

// ------------------------------------------------------------ L3 Selepas: wash, then switch off fan + lamp
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const sk = sink(); sk.position.set(-0.4, 0, -0.18); root.add(sk);
  const used = [0, 1, 2].map(i => { const b = beaker('bikar' + (i + 1)); b.scale.setScalar(1.5); b.position.set(-0.15 + i * 0.13, 0, 0.27); b.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 16), M([0xce93d8, 0xa5d6a7, 0xffcc80][i], { transparent: true, opacity: 0.8 }), 0, 0.017, 0)); b.userData.carryY = 0.08; root.add(home(b)); return b; });
  const wallSw = group('dinding', mesh(new THREE.BoxGeometry(0.5, 0.25, 0.02), M(0xe9dcc8), 0, 0.125, 0)); wallSw.position.set(0.4, 0, -0.33); root.add(wallSw);
  const sw = (id, label, x) => { const g = group(id, mesh(new THREE.BoxGeometry(0.06, 0.08, 0.012), M(0xfafafa), 0, 0, 0)); const tog = mesh(new THREE.BoxGeometry(0.02, 0.03, 0.012), M(0x424242), 0, 0.012, 0.008); g.add(tog); g.userData.tog = tog; g.position.set(x, 0.15, -0.315); const l = textSprite(label, { h: 0.024 }); l.position.set(0, 0.07, 0.01); g.add(l); root.add(g); return g; };
  const fanSw = sw('suis_kipas', 'Kipas', 0.3), lampSw = sw('suis_lampu', 'Lampu', 0.5);
  const fan = group('kipas', mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), M(0x9e9e9e), 0, 0, 0), ...[0, 1, 2].map(i => mesh(new THREE.BoxGeometry(0.16, 0.004, 0.03), M(0xbdbdbd), 0.08, 0, 0).rotateY(i * 2.09)));
  fan.children.slice(1).forEach((b, i) => { b.position.set(0, 0, 0); b.geometry.translate(0.08, 0, 0); b.rotation.y = i * 2.09; });
  fan.position.set(0.05, 0.42, -0.1); root.add(fan);
  const bulbGlow = emojiSprite('💡', 0.08); bulbGlow.position.set(0.3, 0.42, -0.1); root.add(bulbGlow);
  let washed = 0, fanOn = true, lampOn = true, spin = 0;
  const dr = dragger(S, () => used.filter(b => !b.userData.clean), {
    onDrop(b, x, y) {
      if (!(nearScreen(S, sk, x, y, 0.06, 90) || flat(b.position, sk.position) < 0.17)) return goHome(S, b);
      b.userData.clean = true; washed++; b.children[b.children.length - 1].visible = false;
      sk.getObjectByName('aliran').visible = true; setTimeout(() => sk.getObjectByName('aliran').visible = false, 1200);
      goHome(S, b); S.evt('wash', b.name);
      S.info(washed < 3 ? `🧼 Bikar dibersihkan (${washed}/3).` : '✨ Semua peralatan dibersihkan. Sebelum keluar, <b>tutup suis kipas dan lampu</b>.');
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [fanSw, lampSw])?.name ?? null,
    tap(x, y) {
      const s = S.hitTest(x, y, [fanSw, lampSw]); if (!s) return;
      if (washed < 3) return S.info('🧼 Bersihkan peralatan sains dahulu.');
      if (s === fanSw && fanOn) { fanOn = false; s.userData.tog.position.y = -0.012; S.evt('off', 'kipas'); }
      if (s === lampSw && lampOn) { lampOn = false; s.userData.tog.position.y = -0.012; bulbGlow.visible = false; S.evt('off', 'lampu'); }
      S.info(!fanOn && !lampOn ? '🔌 Suis kipas dan lampu ditutup bagi <b>mengelakkan pembaziran elektrik</b>.' : '✅ Suis ditutup.');
    },
    update(dt) { if (fanOn) spin += dt * 12; fan.rotation.y = spin; },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Sebelum aktiviti', sp: 'SP 2.1.1', make: L1 },
  { id: 'L2', title: 'Semasa aktiviti', sp: 'SP 2.1.1', make: L2 },
  { id: 'L3', title: 'Selepas aktiviti', sp: 'SP 2.1.1', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Peraturan Bilik Sains (Tahun 3)',
  intro: '<b>Sains Tahun 3 · Unit 2.</b> Patuhi peraturan sebelum, semasa dan selepas aktiviti! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
