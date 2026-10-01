// Sains Tahun 6 · Unit 1 Kemahiran Saintifik (SP 1.1.1 – 1.1.12) — basic and integrated process skills with the
// balloon car, its variables, and the balloon-car experiment (balloon size vs distance) with 👋 wave to release.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const P = ([id, e, ex, sk]) => ({ id, target: [e, ex], card: ['', sk], ok: `✅ ${ex} → <b>${sk.toLowerCase()}</b>.` });

// ------------------------------------------------------------ L1 Kemahiran proses sains asas
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['memerhati', '👀', 'Perhatikan saiz belon', 'Memerhati'], ['mengelas', '🗂️', 'Kumpul kereta ikut saiz belon', 'Mengelas'], ['mengukur', '📏', 'Ukur jarak dengan pembaris', 'Mengukur'],
    ['inferens', '🤔', 'Kereta dekat kerana udara sedikit', 'Membuat inferens'], ['meramal', '🔮', 'Belon besar akan pergi jauh', 'Meramal'], ['komunikasi', '📋', 'Catat jarak dalam jadual', 'Berkomunikasi']].map(P),
    { type: 'skill', gap: 0.29, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Kemahiran proses sains bersepadu
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['ruang_masa', '⏳', 'Belon mengecil apabila semakin lama kereta bergerak', 'Ruang dan masa'], ['tafsir', '📉', 'Kenal pasti pola dalam data', 'Mentafsir data'],
    ['operasi', '📝', 'Nyatakan perkara yang dilakukan dan diperhatikan', 'Definisi secara operasi'], ['hipotesis', '💭', 'Semakin besar belon, semakin jauh kereta', 'Membuat hipotesis'], ['eksperimen', '🧪', 'Rancang, kumpul data, buat kesimpulan, lapor', 'Mengeksperimen']].map(P),
    { type: 'skill2', gap: 0.34, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Pemboleh ubah
function L3(S, play) {
  const root = group('L3', table(1.6, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.16, w: 0.46, d: 0.26 });
  const dr = sorter(S, root, {
    type: 'variable', size: 0.09, gap: 0.24, row: 0.3,
    zones: [Z('manipulasi', 'Dimanipulasikan', 0xffcdd2, -0.52), Z('bergerak_balas', 'Bergerak balas', 0xc8e6c9, 0), Z('malar', 'Dimalarkan', 0xbbdefb, 0.52)],
    items: [['saiz_belon', '🎈', 'Saiz belon', 'manipulasi'], ['jarak', '📏', 'Jarak pergerakan kereta', 'bergerak_balas'], ['bentuk', '🚗', 'Bentuk kereta', 'malar'], ['saiz_kereta', '📐', 'Saiz kereta', 'malar'], ['jisim', '⚖️', 'Jisim kereta', 'malar']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Apa yang kita ubah, apa yang kita ukur, dan apa yang kita kekalkan?' })),
    ok: (it, z) => `✅ ${it.label} — pemboleh ubah <b>${z.label.toLowerCase()}</b>.`,
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L4 Eksperimen kereta belon
const DIST = { kecil: 40, sederhana: 70, besar: 100 };  // cm (simulated data)
const SIZE = { kecil: 0.03, sederhana: 0.045, besar: 0.06 };
function balloonCar() {
  const g = group('kereta_belon', mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 16), M(0xe3f2fd, { transparent: true, opacity: 0.7 }), 0, 0.045, 0).rotateZ(Math.PI / 2));
  for (const x of [-0.04, 0.04]) for (const z of [-0.033, 0.033]) g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 14), M(0xe53935), x, 0.016, z).rotateX(Math.PI / 2));
  const b = mesh(new THREE.SphereGeometry(1, 20, 14), M(0x42a5f5)); b.position.set(-0.07, 0.07, 0); b.scale.setScalar(0.001); b.name = 'belon'; g.add(b);
  return g;
}
function L4(S, play) {
  const root = group('L4', table(1.9, 0.95, play));
  const X0 = -0.75;
  const ruler = mesh(new THREE.BoxGeometry(1.1, 0.006, 0.05), M(0xffd54f), X0 + 0.55, 0.003, 0.08); root.add(ruler);
  for (let c = 0; c <= 100; c += 10) { const t = mesh(new THREE.BoxGeometry(0.003, 0.007, c % 50 ? 0.02 : 0.04), M(0x212121), X0 + c / 100, 0.004, 0.065); root.add(t);
    if (c % 20 === 0) { const l = textSprite(String(c), { h: 0.022, bg: '#ffffff00' }); l.position.set(X0 + c / 100, 0.02, 0.12); root.add(l); } }
  const cm = textSprite('cm', { h: 0.022, bg: '#ffffff00' }); cm.position.set(X0 + 1.08, 0.02, 0.12); root.add(cm);
  const car = balloonCar(); car.scale.setScalar(1.6); car.position.set(X0, 0, -0.05); root.add(car); const bal = car.getObjectByName('belon');
  const sizes = Object.keys(DIST).map((k, i) => { const c = textCard('belon_' + k, `🎈 Belon ${k}`, 0.2, { border: '#42a5f5' }); c.userData.k = k; c.position.set(-0.6 + i * 0.23, 0, 0.32); root.add(c); return c; });
  const go = textCard('lepas', '🚀 Lepaskan (👋)', 0.2, { border: '#ef6c00' }); go.position.set(0.15, 0, 0.32); root.add(go);
  const tc = document.createElement('canvas'); tc.width = 440; tc.height = 200; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 440, 200); tg.fillStyle = '#2b2340'; tg.font = 'bold 24px system-ui'; tg.fillText('Saiz belon', 14, 34); tg.fillText('Jarak (cm)', 250, 34);
    tg.font = '24px system-ui'; Object.keys(DIST).forEach((k, i) => { tg.fillText(k, 14, 80 + i * 44); tg.fillText(res[k] ?? '–', 280, 80 + i * 44); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.56, 0.255), new THREE.MeshBasicMaterial({ map: tt }), 0.55, 0.16, -0.3); board.rotation.x = -0.6; board.userData.fx = true; root.add(board);
  const concl = [['diterima', 'Hipotesis diterima', true], ['ditolak', 'Hipotesis ditolak', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.22); c.userData.ok = ok; c.position.set(0.45 + i * 0.25, 0, 0.32); c.visible = false; root.add(c); return c; });
  let sel = null, moving = false, done = false;
  function release() {
    if (!sel) return S.info('🎈 Pilih saiz belon dahulu.'); if (moving) return;
    moving = true; const k = sel, d = DIST[k] / 100, s0 = SIZE[k]; car.position.x = X0;
    S.info(`🚀 Kereta belon ${k} dilepaskan…`);
    S.tween(1.2 + d, t => { const e = 1 - (1 - t) * (1 - t); car.position.x = X0 + d * e; bal.scale.setScalar(Math.max(0.006, s0 * (1 - t))); }, () => {
      moving = false; res[k] = DIST[k]; draw(); S.evt('trial', k); S.info(`📏 Belon ${k}: kereta bergerak <b>${DIST[k]} cm</b>.`);
      if (Object.keys(res).length === 3) { concl.forEach(c => (c.visible = true)); go.visible = false; setTimeout(() => S.info('📋 Hipotesis: semakin besar saiz belon, semakin jauh jarak pergerakan kereta. Adakah ia diterima?'), 1500); }
    });
  }
  return {
    root, view: { w: 1.9, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [...sizes, go, ...concl].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...sizes, go, ...concl].filter(c => c.visible)); if (!c) return;
      if (sizes.includes(c)) { if (moving) return; sel = c.userData.k; car.position.x = X0; bal.scale.setScalar(SIZE[sel]); sizes.forEach(s => s.children[0].material.color.set(s === c ? 0xc8e6c9 : 0xffffff)); return S.info(`🎈 Belon ${sel} ditiup. Lepaskan kereta atau lambai 👋.`); }
      if (c === go) return release();
      if (concl.includes(c) && !done) {
        if (!c.userData.ok) return S.info('🤔 Kecil 40 cm, sederhana 70 cm, besar 100 cm. Adakah data menyokong hipotesis?');
        done = true; S.evt('conclude', 'diterima'); S.info('✅ Semakin besar saiz belon, semakin jauh jarak pergerakan kereta belon. <b>Hipotesis diterima.</b>', 9);
      }
    },
    wind: release,
  };
}

const LEVELS = [
  { id: 'L1', title: 'Kemahiran proses sains asas', sp: 'SP 1.1.1 – 1.1.6', make: L1 },
  { id: 'L2', title: 'Kemahiran proses sains bersepadu', sp: 'SP 1.1.7 – 1.1.12', make: L2 },
  { id: 'L3', title: 'Pemboleh ubah', sp: 'SP 1.1.10', make: L3 },
  { id: 'L4', title: 'Eksperimen kereta belon', sp: 'SP 1.1.11 · 1.1.12', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kemahiran Saintifik (Tahun 6)',
  intro: '<b>Sains Tahun 6 · Unit 1.</b> Kemahiran proses sains dengan kereta belon! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = lepaskan kereta · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
