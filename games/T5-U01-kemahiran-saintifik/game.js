// Sains Tahun 5 · Unit 1 Kemahiran Saintifik (SP 1.1.1 – 1.1.12) — process skills, variables, and a full soap-bubble
// experiment (glycerin vs bubble life) with a 👋 wave to blow.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Kemahiran proses sains
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['memerhati', '👀', 'Daun hijau, 4 helai', 'Memerhati'], ['mengelas', '🗂️', 'Kumpul ikut ciri', 'Mengelas'], ['mengukur', '📏', 'Pensel 5 cm', 'Mengukur'], ['inferens', '🥀', 'Pokok layu kerana tiada air', 'Membuat inferens'],
    ['meramal', '🔮', 'Esok mungkin hujan', 'Meramal'], ['komunikasi', '📊', 'Lukis graf bar', 'Berkomunikasi'], ['ruang_masa', '🍦', 'Aiskrim cair ikut masa', 'Ruang dan masa'], ['tafsir', '📋', 'Tempat A paling banyak burung', 'Mentafsir data']]
    .map(([id, e, ex, sk]) => ({ id, target: [e, ex], card: ['', sk], ok: `✅ ${ex} → <b>${sk.toLowerCase()}</b>.` })), { type: 'skill', gap: 0.215, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Pemboleh ubah penyiasatan buih sabun
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const hyp = textCard('hipotesis', 'Hipotesis: Semakin bertambah kuantiti gliserin, semakin bertambah tempoh buih sabun untuk pecah.', 0.8, { border: '#ef6c00' }); hyp.position.set(0, 0, -0.42); root.add(hyp);
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.14, w: 0.46, d: 0.24 });
  const dr = sorter(S, root, {
    type: 'variable', size: 0.08, gap: 0.24, row: 0.32,
    zones: [Z('manipulasi', 'Dimanipulasikan', 0xffcdd2, -0.52), Z('bergerak_balas', 'Bergerak balas', 0xc8e6c9, 0), Z('malar', 'Dimalarkan', 0xbbdefb, 0.52)],
    items: [['gliserin', '🧴', 'Kuantiti gliserin', 'manipulasi'], ['tempoh', '⏱️', 'Tempoh buih pecah', 'bergerak_balas'], ['pencuci', '🧼', 'Jenis cecair pencuci', 'malar'], ['air', '💧', 'Isi padu air', 'malar'], ['saiz', '⚪', 'Saiz buih', 'malar'], ['angin', '🌬️', 'Kelajuan angin', 'malar']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Apa yang kita ubah, apa yang kita ukur, dan apa yang kita kekalkan?' })),
    ok: (it, z) => `✅ ${it.label} — pemboleh ubah <b>${z.label.toLowerCase()}</b>.`,
  });
  return { root, view: { w: 1.6, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L3 Jalankan eksperimen buih sabun
const LIFE = { 1: 4, 3: 8, 5: 13 };  // seconds the bubble lasts (simulated data)
function L3(S, play) {
  const root = group('L3', table(1.5, 0.95, play));
  const lid = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 32), M(0x1e88e5), -0.25, 0.006, -0.15); lid.name = 'penutup'; root.add(lid);
  const spoons = [1, 3, 5].map((n, i) => { const c = textCard('sudu_' + n, `${n} sudu gliserin`, 0.22); c.userData.n = n; c.position.set(-0.45 + i * 0.25, 0, 0.32); root.add(c); return c; });
  const blow = emojiCard('tiup', '🌬️', 'Tiup / lambai 👋', 0.1, { border: '#29b6f6' }); blow.position.set(0.32, 0, 0.32); root.add(blow);
  const tc = document.createElement('canvas'); tc.width = 420; tc.height = 150; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 420, 150); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; tg.fillText('Gliserin (sudu)', 10, 40); tg.fillText('Tempoh (s)', 10, 110);
    tg.font = '26px system-ui'; [1, 3, 5].forEach((n, i) => { tg.fillText(n, 210 + i * 70, 40); tg.fillText(res[n] ?? '–', 205 + i * 70, 110); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.42, 0.15), new THREE.MeshBasicMaterial({ map: tt }), 0.3, 0.004, -0.12); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  const concl = [['diterima', 'Hipotesis diterima', true], ['ditolak', 'Hipotesis ditolak', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.26); c.userData.ok = ok; c.position.set(0.05 + i * 0.3, 0, 0.12); c.visible = false; root.add(c); return c; });
  let sel = null, bubble = null, life = 0, t = 0, done = false;
  const pickMsg = () => S.info('🧴 Pilih kuantiti gliserin dahulu.');
  function doBlow() {
    if (!sel) return pickMsg(); if (bubble) return;
    bubble = mesh(new THREE.SphereGeometry(0.07, 28, 20), new THREE.MeshStandardMaterial({ color: 0xb3e5fc, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.3 })); bubble.position.set(-0.25, 0.08, -0.15); bubble.userData.fx = true; root.add(bubble);
    life = LIFE[sel]; t = 0; S.info(`⏱️ Buih ditiup dengan ${sel} sudu gliserin… kira masa!`);
  }
  return {
    root, view: { w: 1.5, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [...spoons, blow, ...concl.filter(c => c.visible)])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...spoons, blow, ...concl.filter(c => c.visible)]); if (!c) return;
      if (spoons.includes(c)) { if (bubble) return; sel = c.userData.n; spoons.forEach(s => s.children[0].material.color.set(s === c ? 0xc8e6c9 : 0xffffff)); return S.info(`🧴 ${sel} sudu besar gliserin. Pakai gogal, kemudian tiup buih!`); }
      if (c === blow) return doBlow();
      if (concl.includes(c) && !done) {
        if (!c.userData.ok) return S.info('🤔 Data: 1 sudu 4 s, 3 sudu 8 s, 5 sudu 13 s. Adakah data menyokong hipotesis?');
        done = true; S.evt('conclude', 'diterima'); S.info('✅ Semakin bertambah kuantiti gliserin, semakin bertambah tempoh buih sabun untuk pecah. <b>Hipotesis diterima.</b>', 9);
      }
    },
    wind: doBlow,
    update(dt) {
      if (!bubble) return; t += dt * 3;  // 3x speed so pupils do not wait long
      bubble.position.y = 0.08 + Math.sin(t) * 0.01; bubble.material.color.setHSL((t * 0.1) % 1, 0.6, 0.8);
      if (t >= life) { root.remove(bubble); bubble = null; res[sel] = life; draw(); S.evt('trial', 'g' + sel); S.info(`💥 Buih pecah selepas <b>${life} saat</b>.`);
        if (Object.keys(res).length === 3) { concl.forEach(c => c.visible = true); setTimeout(() => S.info('📋 Bandingkan keputusan. Adakah hipotesis diterima?'), 1500); } }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Kemahiran proses sains', sp: 'SP 1.1.1 – 1.1.9', make: L1 },
  { id: 'L2', title: 'Pemboleh ubah', sp: 'SP 1.1.10 · 1.1.11', make: L2 },
  { id: 'L3', title: 'Eksperimen buih sabun', sp: 'SP 1.1.12', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kemahiran Saintifik (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 1.</b> Kemahiran proses sains dan eksperimen buih sabun! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = tiup · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
