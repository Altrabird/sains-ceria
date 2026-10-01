// Sains Tahun 6 · Unit 12 Kestabilan dan Kekuatan (SP 12.1.1 – 12.1.7) — shake-table stability tests (height, base
// area) with 👋 to shake, straw strength test (paper / plastic / iron), structure shapes, bottle stool steps.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, sequence, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Meja goncang: kestabilan
const ROUNDS = [
  { id: 'tinggi', objs: [['rendah', 0.08, 0.06, 0xe53935, true], ['tinggi', 0.08, 0.3, 0xe53935, false]], q: 'Ketinggian', ok: ['semakin_rendah', 'Semakin rendah, semakin stabil'], no: ['semakin_tinggi', 'Semakin tinggi, semakin stabil'],
    msg: '✅ Semakin <b>rendah</b> objek atau binaan, semakin stabil.' },
  { id: 'tapak', objs: [['tapak_besar', 0.07, 0.2, 0x1e88e5, true], ['tapak_kecil', 0.025, 0.2, 0x1e88e5, false]], q: 'Luas tapak', ok: ['tapak_besar_stabil', 'Tapak besar lebih stabil'], no: ['tapak_kecil_stabil', 'Tapak kecil lebih stabil'],
    msg: '✅ Semakin <b>besar luas tapak</b>, semakin stabil. Zirafah mengangkangkan kaki semasa minum untuk meluaskan tapak dan merendahkan ketinggian.' },
];
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play));
  const board = group('kadbod', mesh(new THREE.BoxGeometry(0.7, 0.012, 0.3), M(0xc8a165), 0, 0.006, 0)); board.position.set(-0.15, 0, -0.12); root.add(board);
  const shakeBtn = textCard('goncang', '👋 Goncang kadbod', 0.24, { border: '#ef6c00' }); shakeBtn.position.set(0.5, 0, -0.1); root.add(shakeBtn);
  let r = 0, objs = [], cards = [], shaking = false, shaken = false;
  function setup() {
    objs.forEach(o => board.remove(o)); cards.forEach(c => root.remove(c)); objs = []; cards = []; shaken = false;
    const R = ROUNDS[r];
    R.objs.forEach(([id, w, h, col, stable], i) => { const piv = group('objek_' + id); piv.position.set(-0.15 + i * 0.3, 0.012, 0); const m = R.id === 'tapak' ? mesh(new THREE.CylinderGeometry(w, w, h, 24), M(col), 0, h / 2, 0) : mesh(new THREE.BoxGeometry(w, h, w), M(col), 0, h / 2, 0);
      piv.add(m); piv.userData = { stable, w }; board.add(piv); objs.push(piv); const t = textSprite(id.replace('_', ' '), { h: 0.028, bg: '#ffffffdd' }); t.position.set(0, h + 0.04, 0); piv.add(t); });
    [R.ok, R.no].forEach(([id, l], i) => { const c = textCard('jawapan_' + id, l, 0.3); c.userData.ok = i === 0; c.position.set(-0.35 + i * 0.36, 0, 0.32); c.visible = false; root.add(c); cards.push(c); });
    shakeBtn.visible = true; S.info(`🧪 Faktor: <b>${R.q}</b>. Goncang kadbod ke hadapan dan ke belakang (lambai 👋).`);
  }
  setup();
  function shake() {
    if (shaking || shaken) return; shaking = true;
    S.tween(2.4, t => { board.position.z = -0.12 + Math.sin(t * 30) * 0.025 * (1 - t * 0.3);
      objs.forEach(o => { if (!o.userData.stable && t > 0.35) o.rotation.x = Math.min(Math.PI / 2, (t - 0.35) * 4); else if (o.userData.stable) o.rotation.x = Math.sin(t * 30) * 0.03; }); }, () => {
      board.position.z = -0.12; shaking = false; shaken = true; shakeBtn.visible = false; cards.forEach(c => (c.visible = true)); S.evt('shake', ROUNDS[r].id);
      S.info('📋 Satu objek jatuh, satu kekal. Apakah kesimpulannya?');
    });
  }
  return {
    root, view: { w: 1.6, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [shakeBtn, ...cards].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [shakeBtn, ...cards].filter(c => c.visible)); if (!c) return;
      if (c === shakeBtn) return shake();
      if (!c.userData.ok) return S.info('🤔 Lihat objek yang jatuh semasa digoncang.');
      const R = ROUNDS[r]; S.evt('conclude', R.id); S.info(R.msg, 8); cards.forEach(k => (k.visible = false)); r++;
      if (r < ROUNDS.length) setTimeout(setup, 3200); else setTimeout(() => S.info('🏗️ Kestabilan ialah keupayaan objek dan binaan untuk kekal atau kembali ke kedudukan asal.', 9), 3200);
    },
    wind: shake,
  };
}

// ------------------------------------------------------------ L2 Kekuatan bahan: penyedut minuman
const STRAWS = [['kertas', 'Penyedut kertas', 0xf5f5f5, 2], ['plastik', 'Penyedut plastik', 0x81d4fa, 4], ['besi', 'Penyedut besi', 0x9e9e9e, 99]];
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const rigs = STRAWS.map(([id, l, col], i) => { const g = group('rig_' + id); g.position.set(-0.5 + i * 0.4, 0, -0.15); root.add(g);
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.06), M(0x90a4ae), s * 0.12, 0.1, 0));
    const straw = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 12), M(col, id === 'besi' ? { metalness: 0.8, roughness: 0.25 } : {}), 0, 0.205, 0); straw.rotation.z = Math.PI / 2; straw.name = 'penyedut_' + id; g.add(straw);
    const hook = group('beban_' + id); hook.position.set(0, 0.2, 0); g.add(hook); g.userData = { id, straw, hook, n: 0, done: false };
    const t = textSprite(l, { h: 0.028, bg: '#ffffffdd' }); t.position.set(0, 0.3, 0); g.add(t); return g; });
  const adds = STRAWS.map(([id], i) => { const c = textCard('tambah_' + id, '➕ Tambah pemberat', 0.22, { border: '#ef6c00' }); c.userData.rig = rigs[i]; c.position.set(-0.5 + i * 0.4, 0, 0.18); root.add(c); return c; });
  const ask = STRAWS.map(([id, l], i) => { const c = textCard('terkuat_' + id, l.replace('Penyedut', 'Paling kuat:'), 0.24); c.position.set(-0.5 + i * 0.4, 0, 0.36); c.visible = false; root.add(c); return c; });
  let answered = false;
  const allDone = () => rigs.every(r => r.userData.done);
  return {
    root, view: { w: 1.6, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [...adds, ...ask].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...adds, ...ask].filter(c => c.visible)); if (!c) return;
      if (ask.includes(c)) {
        if (answered) return; if (c.name !== 'terkuat_besi') return S.info('🤔 Penyedut manakah yang menampung paling banyak pemberat tanpa berubah bentuk?');
        answered = true; S.evt('conclude', 'besi'); return S.info('✅ Bahan berbeza mempunyai kekuatan berbeza: <b>besi</b> paling kuat, kemudian plastik, kemudian kertas. Kekuatan ialah keupayaan menampung daya tanpa berubah bentuk.', 10);
      }
      const rig = c.userData.rig, U = rig.userData; if (U.done) return;
      const [id, l, , max] = STRAWS.find(s => s[0] === U.id);
      U.n++; const w = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.022, 14), M(0x37474f)); w.position.y = -0.03 - (U.n - 1) * 0.024; U.hook.add(w);
      if (U.n > max) {
        U.done = true; U.straw.visible = false; for (const sg of [-1, 1]) { const h = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.145, 12), U.straw.material, sg * 0.068, 0.18, 0); h.rotation.z = Math.PI / 2 + sg * 0.35; rig.add(h); } U.hook.position.y = 0.155;
        S.evt('test', id); S.info(`💥 ${l} berubah bentuk selepas <b>${U.n} pemberat</b>.`);
      } else if (U.n >= 6) { U.done = true; S.evt('test', id); S.info(`💪 ${l} masih kukuh dengan <b>${U.n} pemberat</b>!`); }
      else S.info(`➕ ${l}: ${U.n} pemberat — bentuk belum berubah.`);
      if (U.done) c.visible = false;
      if (allDone() && !ask[0].visible) setTimeout(() => { ask.forEach(a => (a.visible = true)); S.info('📋 Penyedut manakah paling kuat?'); }, 1500);
    },
  };
}

// ------------------------------------------------------------ L3 Bentuk struktur
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const mt = matcher(S, root, [['kekuda', '🌉', 'Kekuda', 'Rangka segi tiga menyokong beban'], ['lengkungan', '🌈', 'Lengkungan', 'Struktur melengkung menyokong beban'], ['kubah', '🕌', 'Kubah', 'Struktur hemisfera yang kuat'],
    ['zirafah', '🦒', 'Zirafah mengangkang', 'Luaskan tapak, rendahkan ketinggian']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.toLowerCase()}</b>.` })), { type: 'shape', gap: 0.38 });
  return { root, view: { w: 1.7, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Model bangku botol
function L4(S, play) {
  const root = group('L4', table(1.7, 0.95, play));
  const dr = sequence(S, root, [['lakar', '✏️ Lakar reka bentuk'], ['cantum', '🧴 Cantumkan pasangan botol dengan pita pelekat'], ['susun', '🔄 Susun botol rapat-rapat dan lilit pita'], ['alas', '🎀 Alas dengan tuala, hias dengan kain'], ['uji', '🧪 Uji kestabilan dan kekuatan']]
    .map(([id, l]) => ({ obj: textCard(id, l, 0.27), l })), {
    type: 'build', gap: 0.31, slotW: 0.28, ok: it => `✅ ${it.l.slice(it.l.indexOf(' ') + 1)}.`,
    onDone: () => setTimeout(() => S.info('🪑 Binaan yang kuat dan stabil tidak mudah rosak, menjimatkan kos baik pulih, selamat dan tahan lama.', 9), 2200),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Meja goncang', sp: 'SP 12.1.1 – 12.1.3', make: L1 },
  { id: 'L2', title: 'Kekuatan bahan', sp: 'SP 12.1.4', make: L2 },
  { id: 'L3', title: 'Bentuk struktur', sp: 'SP 12.1.2 · 12.1.4', make: L3 },
  { id: 'L4', title: 'Model bangku botol', sp: 'SP 12.1.5 – 12.1.7', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kestabilan dan Kekuatan',
  intro: '<b>Sains Tahun 6 · Unit 12.</b> Binaan yang stabil dan kuat! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = goncang · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
