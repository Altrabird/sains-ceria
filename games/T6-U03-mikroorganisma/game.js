// Sains Tahun 6 · Unit 3 Mikroorganisma (SP 3.1.1 – 3.1.5) — identify microorganisms under a microscope,
// life processes (yeast balloon breathes, mould grows where there is water), uses and harms.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// microscope view drawings (circle of radius r at cx, cy)
const DRAW = {
  fungi: (g, c, r) => { g.strokeStyle = '#6d4c41'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { const a = i * 0.9; g.beginPath(); g.moveTo(c, c + r * 0.6); g.quadraticCurveTo(c + Math.cos(a) * r * 0.3, c, c + Math.cos(a) * r * 0.55, c - Math.sin(a) * r * 0.5 - 20); g.stroke(); g.fillStyle = '#558b2f'; g.beginPath(); g.arc(c + Math.cos(a) * r * 0.55, c - Math.sin(a) * r * 0.5 - 20, 12, 0, 7); g.fill(); } },
  bakteria: (g, c, r) => { g.fillStyle = '#ab47bc'; for (let i = 0; i < 9; i++) { g.save(); g.translate(c - r * 0.5 + (i % 3) * r * 0.5, c - r * 0.45 + Math.floor(i / 3) * r * 0.45); g.rotate(i); g.beginPath(); g.roundRect(-28, -9, 56, 18, 9); g.fill(); g.restore(); } },
  alga: (g, c, r) => { for (let i = 0; i < 6; i++) { const x = c - r * 0.45 + (i % 3) * r * 0.45, y = c - r * 0.25 + Math.floor(i / 3) * r * 0.5; g.fillStyle = '#7cb342'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.fillStyle = '#33691e'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.6) * 14, y + Math.sin(k * 1.6) * 14, 6, 0, 7); g.fill(); } } },
  protozoa: (g, c, r) => { g.fillStyle = '#80deea'; g.beginPath(); g.ellipse(c, c, r * 0.6, r * 0.25, 0.4, 0, 7); g.fill(); g.strokeStyle = '#00838f'; g.lineWidth = 2; for (let a = 0; a < 6.28; a += 0.15) { const x = c + Math.cos(a) * r * 0.6, y = c + Math.sin(a) * r * 0.25; const X = c + (x - c) * Math.cos(0.4) - (y - c) * Math.sin(0.4), Y = c + (x - c) * Math.sin(0.4) + (y - c) * Math.cos(0.4); g.beginPath(); g.moveTo(X, Y); g.lineTo(X + (X - c) * 0.08, Y + (Y - c) * 0.08); g.stroke(); } g.fillStyle = '#5e35b1'; g.beginPath(); g.arc(c, c, 18, 0, 7); g.fill(); },
  virus: (g, c, r) => { g.fillStyle = '#e53935'; g.strokeStyle = '#e53935'; g.lineWidth = 6; for (let a = 0; a < 6.28; a += 0.45) { g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * r * 0.55, c + Math.sin(a) * r * 0.55); g.stroke(); g.beginPath(); g.arc(c + Math.cos(a) * r * 0.55, c + Math.sin(a) * r * 0.55, 9, 0, 7); g.fill(); } g.fillStyle = '#1e88e5'; g.beginPath(); g.arc(c, c, r * 0.35, 0, 7); g.fill(); },
};
const SAMPLES = [['roti', 'Roti berkulat', 'fungi', 'Kulat roti ialah <b>fungi</b> (juga yis dan Penicillium).'], ['yogurt', 'Yogurt', 'bakteria', 'Bakteria berbentuk sfera, rod atau lingkaran — contoh Salmonella dan E. coli.'],
  ['air_hijau', 'Air kolam hijau', 'alga', '<b>Alga</b> (Chlorella, Volvox) mempunyai klorofil dan membuat makanan melalui fotosintesis.'], ['air_kolam', 'Air kolam', 'protozoa', '<b>Protozoa</b> (Paramesium, Amoeba) bergerak untuk mendapatkan makanan.'],
  ['selesema', 'Lendir selesema', 'virus', '<b>Virus</b> hanya hidup dan membiak dalam benda hidup lain — dilihat dengan mikroskop elektron.']];
const GROUPS = ['fungi', 'bakteria', 'alga', 'protozoa', 'virus'];

// ------------------------------------------------------------ L1 Kenali mikroorganisma
function L1(S, play) {
  const root = group('L1', table(1.7, 0.95, play));
  const scope = group('mikroskop', mesh(new THREE.BoxGeometry(0.14, 0.02, 0.12), M(0x37474f), 0, 0.01, 0), mesh(new THREE.BoxGeometry(0.025, 0.2, 0.03), M(0x455a64), 0, 0.11, -0.045),
    mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.12, 16), M(0xeceff1, { metalness: 0.4 }), 0, 0.19, -0.01).rotateX(0.3), mesh(new THREE.BoxGeometry(0.11, 0.008, 0.09), M(0x263238), 0, 0.09, 0.01));
  scope.position.set(-0.45, 0, -0.15); root.add(scope);
  const vc = document.createElement('canvas'); vc.width = vc.height = 320; const vg = vc.getContext('2d'); const vt = new THREE.CanvasTexture(vc); vt.colorSpace = THREE.SRGBColorSpace;
  const showView = k => { vg.fillStyle = '#111'; vg.fillRect(0, 0, 320, 320); vg.save(); vg.beginPath(); vg.arc(160, 160, 150, 0, 7); vg.clip(); vg.fillStyle = '#fffde7'; vg.fillRect(0, 0, 320, 320); if (k) DRAW[k](vg, 160, 150); vg.restore(); vt.needsUpdate = true; };
  showView(null);
  const view = mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: vt }), 0.0, 0.2, -0.25); view.rotation.x = -0.45; view.userData.fx = true; root.add(view);
  const vl = textSprite('🔬 Pandangan mikroskop', { h: 0.028 }); vl.position.set(0, 0.4, -0.3); root.add(vl);
  const slides = SAMPLES.map(([id, l], i) => { const c = textCard('sampel_' + id, l, 0.2, { border: '#26a69a' }); c.position.set(-0.6 + i * 0.25, 0, 0.32); c.userData.carryY = 0.1; root.add(home(c)); return c; });
  const picks = GROUPS.map((k, i) => { const c = textCard('kumpulan_' + k, k[0].toUpperCase() + k.slice(1), 0.19, { border: '#7e57c2' }); c.position.set(-0.22 + i * 0.21, 0, 0.1); c.visible = false; root.add(c); return c; });
  let cur = null; const done = new Set();
  const dr = dragger(S, () => slides.filter(s => s.visible && !cur), {
    onDrop(c) {
      if (flat(c.position, scope.position) > 0.17) return goHome(S, c);
      cur = SAMPLES.find(s => 'sampel_' + s[0] === c.name); c.visible = false; showView(cur[2]); picks.forEach(p => (p.visible = true));
      S.info(`🔬 ${cur[1]} di bawah mikroskop. Kumpulan mikroorganisma manakah ini?`);
    },
  });
  return {
    root, view: { w: 1.7, d: 0.95 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, picks.filter(p => p.visible))?.name ?? null,
    tap(x, y) {
      const p = S.hitTest(x, y, picks.filter(p => p.visible)); if (!p || !cur) return;
      if (p.name !== 'kumpulan_' + cur[2]) return S.info('🤔 Lihat bentuknya: benang dan spora? rod? hijau berklorofil? bersilia? berduri?');
      S.evt('identify', cur[0]); S.info('✅ ' + cur[3], 7); done.add(cur[0]); cur = null; picks.forEach(q => (q.visible = false)); setTimeout(() => !cur && showView(null), 2500);
      if (done.size === SAMPLES.length) setTimeout(() => S.info('🦠 Mikroorganisma ialah hidupan seni yang tidak dapat dilihat oleh mata kasar.', 9), 3000);
    },
  };
}

// ------------------------------------------------------------ L2 Proses hidup dan faktor pertumbuhan
function L2(S, play) {
  const root = group('L2', table(1.7, 0.95, play));
  const bottle = group('botol', mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 20), M(0xffffff, { transparent: true, opacity: 0.35 }), 0, 0.08, 0), mesh(new THREE.CylinderGeometry(0.015, 0.04, 0.04, 16), M(0xffffff, { transparent: true, opacity: 0.35 }), 0, 0.18, 0));
  const mix = mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.001, 20), M(0xffe082), 0, 0.001, 0); mix.userData.fx = true; bottle.add(mix);
  const balloon = mesh(new THREE.SphereGeometry(0.05, 18, 12), M(0xe53935)); balloon.scale.set(0.3, 0.3, 0.3); balloon.position.y = 0.21; bottle.add(balloon);
  bottle.position.set(-0.5, 0, -0.15); root.add(bottle);
  const ING = [['yis', '🟤', 'Yis'], ['gula', '🍬', 'Gula'], ['air_suam', '♨️', 'Air suam']];
  const ings = ING.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#ef6c00' }); c.position.set(-0.65 + i * 0.16, 0, 0.3); root.add(home(c)); return c; });
  // bread
  const bread = k => { const b = group('roti_' + k, mesh(new THREE.BoxGeometry(0.14, 0.02, 0.14), M(0xffe0b2), 0, 0.01, 0), mesh(new THREE.BoxGeometry(0.15, 0.022, 0.15), M(0xd7a86e), 0, 0.009, 0)); return b; };
  const breads = ['kering', 'lembap'].map((k, i) => { const b = bread(k); b.position.set(0.15 + i * 0.25, 0, -0.15); root.add(b); const t = textSprite(`Roti ${k}`, { h: 0.028, bg: '#ffffffdd' }); t.position.set(b.position.x, 0.1, -0.15); root.add(t); return b; });
  const drop = emojiCard('titis_air', '💧', 'Titiskan air', 0.09, { border: '#1e88e5' }); drop.position.set(0.15, 0, 0.3); root.add(home(drop));
  const ff = textCard('lima_hari', '⏩ Biarkan 5 hari', 0.22, { border: '#ef6c00' }); ff.position.set(0.55, 0, 0.3); ff.visible = false; root.add(ff);
  const ask = [['air', '💧 Air'], ['cahaya', '💡 Cahaya']].map(([id, l], i) => { const c = textCard('faktor_' + id, l, 0.2); c.position.set(0.3 + i * 0.24, 0, 0.1); c.visible = false; root.add(c); return c; });
  const inBottle = new Set(); let wet = false, grown = false, answered = false, t = 0;
  const dr = dragger(S, () => [...ings.filter(c => c.visible), ...(wet ? [] : [drop])], {
    onDrop(c) {
      if (c === drop) {
        if (flat(c.position, breads[1].position) > 0.14) { if (flat(c.position, breads[0].position) < 0.14) S.info('🤔 Roti kering mesti kekal kering. Titiskan air pada roti yang satu lagi.'); return goHome(S, c); }
        wet = true; c.visible = false; breads[1].children[0].material.color.set(0xd7ccc8); S.evt('setup', 'roti'); S.info('💧 Roti dilembapkan. Kedua-dua roti dalam beg plastik — jenis dan saiz roti dimalarkan.'); ff.visible = true; return;
      }
      if (flat(c.position, bottle.position) > 0.14) return goHome(S, c);
      inBottle.add(c.name); c.visible = false; mix.scale.y = inBottle.size * 40; mix.position.y = inBottle.size * 0.02;
      if (inBottle.size === 3) { S.evt('setup', 'yis'); S.info('🎈 Lilit belon pada mulut botol… perhatikan!'); S.tween(4, k => { const s = 0.3 + k * 0.9; balloon.scale.set(s, s * 1.1, s); balloon.position.y = 0.19 + s * 0.05; }, () => { S.evt('respire', 'yis'); S.info('✅ Belon mengembang — yis <b>bernafas</b> dan menghasilkan gas. Mikroorganisma juga bergerak dan bertumbuh.', 7); }); }
      else S.info(`➕ ${ING.find(i => i[0] === c.name)[2]} dimasukkan.`);
    },
  });
  return {
    root, view: { w: 1.7, d: 0.95 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [ff, ...ask].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [ff, ...ask].filter(c => c.visible)); if (!c) return;
      if (c === ff && !grown) { grown = true; ff.visible = false;
        for (let i = 0; i < 9; i++) { const sp = mesh(new THREE.CircleGeometry(0.012 + Math.random() * 0.012, 14), M(0x33691e)); sp.rotation.x = -Math.PI / 2; sp.position.set((Math.random() - 0.5) * 0.11, 0.021, (Math.random() - 0.5) * 0.11); sp.scale.setScalar(0.01); breads[1].add(sp); S.tween(2, k => sp.scale.setScalar(0.01 + k)); }
        setTimeout(() => { S.evt('grow', 'kulapuk'); ask.forEach(a => (a.visible = true)); S.info('🍞 Hari ke-5: kulapuk tumbuh pada roti <b>lembap</b> sahaja. Faktor apakah yang diperlukan? (Jangan sentuh kulapuk dengan tangan!)'); }, 2200); return; }
      if (ask.includes(c) && !answered) {
        if (c.name !== 'faktor_air') return S.info('🤔 Pemboleh ubah yang dimanipulasikan ialah kehadiran air.');
        answered = true; S.evt('factor', 'air'); S.info('✅ Mikroorganisma memerlukan <b>air</b>, udara, nutrien, suhu dan keasidan yang sesuai untuk bertumbuh.', 9);
      }
    },
  };
}

// ------------------------------------------------------------ L3 Kegunaan dan keburukan
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const dr = sorter(S, root, {
    type: 'use', size: 0.085, gap: 0.165, row: 0.3,
    zones: [{ id: 'guna', label: '👍 Berguna', color: 0xc8e6c9, x: -0.42, z: -0.18, w: 0.78 }, { id: 'buruk', label: '👎 Merbahaya', color: 0xffcdd2, x: 0.42, z: -0.18, w: 0.78 }],
    items: [['roti', '🍞', 'Yis: roti dan tapai', 'guna'], ['yogurt', '🥛', 'Bakteria: yogurt', 'guna'], ['tempe', '🟫', 'Fungi: tempe', 'guna'], ['antibiotik', '💊', 'Antibiotik', 'guna'], ['vaksin', '💉', 'Vaksin', 'guna'], ['baja', '🌱', 'Baja organik', 'guna'],
      ['basi', '🤢', 'Makanan rosak', 'buruk'], ['gigi', '🦷', 'Gigi reput', 'buruk'], ['racun', '🤮', 'Keracunan makanan', 'buruk'], ['tanaman', '🍂', 'Tanaman rosak', 'buruk'], ['influenza', '🤧', 'Influenza (virus)', 'buruk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah mikroorganisma ini membantu kita atau memudaratkan?' })),
    ok: (it, z) => z.id === 'guna' ? `✅ ${it.label} — mikroorganisma <b>berguna</b>.` : `⚠️ ${it.label} — kesan <b>buruk</b> mikroorganisma.`,
    onDone: () => setTimeout(() => S.info('🦠 Influenza, beguk dan campak disebabkan oleh virus. Kurap disebabkan oleh fungi.', 9), 2500),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Kenali mikroorganisma', sp: 'SP 3.1.1 · 3.1.2', make: L1 },
  { id: 'L2', title: 'Proses hidup dan pertumbuhan', sp: 'SP 3.1.3 · 3.1.4', make: L2 },
  { id: 'L3', title: 'Kegunaan dan keburukan', sp: 'SP 3.1.5', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Mikroorganisma',
  intro: '<b>Sains Tahun 6 · Unit 3.</b> Hidupan seni di bawah mikroskop! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
