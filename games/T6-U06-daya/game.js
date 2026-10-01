// Sains Tahun 6 · Unit 6 Daya (SP 6.1.1 – 6.3.3) — pull and push, effects of force, friction experiment
// (dry cell rolling onto four surfaces), reducing / increasing friction, air pressure.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, battery, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const P = ([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f.toLowerCase()}</b>.` });

// ------------------------------------------------------------ L1 Tarikan dan tolakan
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'force', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'tarik', label: '⬅️ Tarikan (mendekati kita)', color: 0xbbdefb, x: -0.38, z: -0.18, w: 0.7 }, { id: 'tolak', label: '➡️ Tolakan (menjauhi kita)', color: 0xffccbc, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['laci', '🗄️', 'Membuka laci', 'tarik'], ['troli', '🛒', 'Menarik troli', 'tarik'], ['timba', '💧', 'Menimba air dari perigi', 'tarik'], ['tali', '🎗️', 'Bermain tarik tali', 'tarik'],
      ['tendang', '⚽', 'Menendang bola', 'tolak'], ['pintu', '🚪', 'Menolak pintu', 'tolak'], ['kereta', '🚗', 'Menolak kereta rosak', 'tolak'], ['buai', '🎠', 'Menolak buaian', 'tolak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah objek bergerak mendekati atau menjauhi kita?' })),
    ok: (it, z) => `✅ ${it.label} — <b>${z.id === 'tarik' ? 'tarikan' : 'tolakan'}</b>.`,
    onDone: () => setTimeout(() => S.info('💪 Daya ialah tarikan atau tolakan yang bertindak ke atas sesuatu objek.', 9), 2500),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Kesan daya
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['bentuk', '🟣', 'Menekan plastisin', 'Mengubah bentuk'], ['arah', '🏸', 'Memukul bulu tangkis', 'Mengubah arah'], ['laju', '🚴', 'Mengayuh basikal lebih kuat', 'Mengubah kelajuan'],
    ['gerak', '📦', 'Menarik troli berisi kotak', 'Menggerakkan objek pegun'], ['henti', '🥅', 'Penjaga gol menghalang bola', 'Menghentikan objek bergerak']].map(P), { type: 'effect', gap: 0.34 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Penyiasatan daya geseran
const SURF = [['kertas', 'Kertas', 0xfafafa, 60], ['kain', 'Kain', 0x64b5f6, 42], ['kertas_pasir', 'Kertas pasir', 0xa1887f, 25], ['permaidani', 'Permaidani', 0x7e57c2, 14]];
function L3(S, play) {
  const root = group('L3', table(1.8, 0.95, play));
  const X0 = -0.55;
  const ramp = mesh(new THREE.BoxGeometry(0.3, 0.012, 0.14), M(0xbcaaa4), X0 - 0.15, 0.05, -0.1); ramp.rotation.z = -0.35; root.add(ramp);
  const blk = mesh(new THREE.BoxGeometry(0.04, 0.1, 0.14), M(0x8d6e63), X0 - 0.29, 0.05, -0.1); root.add(blk);
  const strip = mesh(new THREE.BoxGeometry(0.8, 0.006, 0.14), M(SURF[0][2]), X0 + 0.4, 0.003, -0.1); strip.name = 'permukaan'; root.add(strip);
  for (let c = 0; c <= 70; c += 10) { const l = textSprite(String(c), { h: 0.02, bg: '#ffffff00' }); l.position.set(X0 + c / 100, 0.012, 0.0); root.add(l); }
  const bat = battery('bateri'); bat.children.slice(0, 3).forEach(m => (m.visible = false)); bat.position.y = -0.03;
  const cell = group('sel_kering', bat); cell.scale.setScalar(1.6); cell.rotation.y = Math.PI / 2; root.add(cell);
  const startPos = () => cell.position.set(X0 - 0.25, 0.09, -0.1);
  startPos();
  const picks = SURF.map(([id, l, col], i) => { const c = textCard('permukaan_' + id, l, 0.18, { border: '#' + col.toString(16).padStart(6, '0') }); c.userData.i = i; c.position.set(-0.7 + i * 0.21, 0, 0.32); root.add(c); return c; });
  const go = textCard('lepas', '▶️ Lepaskan sel kering', 0.22, { border: '#ef6c00' }); go.position.set(0.2, 0, 0.32); root.add(go);
  const tc = document.createElement('canvas'); tc.width = 440; tc.height = 230; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {}; const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 440, 230); tg.fillStyle = '#2b2340'; tg.font = 'bold 24px system-ui'; tg.fillText('Permukaan', 14, 34); tg.fillText('Jarak (cm)', 270, 34);
    tg.font = '23px system-ui'; SURF.forEach(([id, l], i) => { tg.fillText(l, 14, 78 + i * 44); tg.fillText(res[id] ?? '–', 300, 78 + i * 44); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.46, 0.24), new THREE.MeshBasicMaterial({ map: tt }), 0.6, 0.15, -0.28); board.rotation.x = -0.6; board.userData.fx = true; root.add(board);
  const concl = [['betul', 'Geseran besar → jarak pendek', true], ['salah', 'Geseran besar → jarak jauh', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.26); c.userData.ok = ok; c.position.set(0.15 + i * 0.3, 0, 0.32); c.visible = false; root.add(c); return c; });
  let sel = null, moving = false, done = false;
  function release() {
    if (sel === null) return S.info('🧱 Pilih jenis permukaan dahulu.'); if (moving) return;
    moving = true; startPos(); const [id, l, , d] = SURF[sel];
    S.tween(0.5, t => cell.position.set(X0 - 0.25 + t * 0.25, 0.09 - t * 0.075, -0.1), () => S.tween(0.6 + d / 60, t => { const e = 1 - (1 - t) * (1 - t); cell.position.x = X0 + e * d / 100; bat.rotation.x = -e * d / 10; }, () => {
      moving = false; res[id] = d; draw(); S.evt('trial', id); S.info(`📏 ${l}: sel kering bergerak <b>${d} cm</b>.`);
      if (Object.keys(res).length === 4) { concl.forEach(c => (c.visible = true)); go.visible = false; setTimeout(() => S.info('📋 Bandingkan data. Apakah hubungan daya geseran dengan jarak pergerakan?'), 1500); }
    }));
  }
  return {
    root, view: { w: 1.8, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, [...picks, go, ...concl].filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...picks, go, ...concl].filter(c => c.visible)); if (!c) return;
      if (picks.includes(c)) { if (moving) return; sel = c.userData.i; strip.material.color.setHex(SURF[sel][2]); startPos(); picks.forEach(p => p.children[0].material.color.set(p === c ? 0xc8e6c9 : 0xffffff)); return S.info(`🧱 Permukaan ${SURF[sel][1].toLowerCase()} dipasang. Lepaskan sel kering dari landasan.`); }
      if (c === go) return release();
      if (concl.includes(c) && !done) {
        if (!c.userData.ok) return S.info('🤔 Permaidani paling kasar — sel kering bergerak paling dekat atau paling jauh?');
        done = true; S.evt('conclude', 'geseran'); S.info('✅ Semakin besar daya geseran, semakin <b>pendek</b> jarak pergerakan sel kering. Permukaan kasar menghasilkan geseran lebih besar.', 9);
      }
    },
    wind: release,
  };
}

// ------------------------------------------------------------ L4 Mengawal daya geseran
function L4(S, play) {
  const root = group('L4', table(1.7, 0.95, play));
  const dr = sorter(S, root, {
    type: 'friction', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'kurang', label: '🧈 Mengurangkan geseran', color: 0xe3f2fd, x: -0.4, z: -0.18, w: 0.74 }, { id: 'tambah', label: '🧤 Menambahkan geseran', color: 0xfff3e0, x: 0.4, z: -0.18, w: 0.74 }],
    items: [['minyak', '🛢️', 'Minyak pelincir pada rantai', 'kurang'], ['bedak', '⚪', 'Bedak pada papan karom', 'kurang'], ['roda', '🛒', 'Roda pada troli', 'kurang'], ['kain', '🧣', 'Kain membuka penutup balang', 'tambah'],
      ['berus', '🧹', 'Berus menanggalkan kotoran', 'tambah'], ['grip', '🏸', 'Grip pada raket', 'tambah'], ['tayar', '🚲', 'Bunga tayar', 'tambah'], ['brek', '🛑', 'Brek basikal', 'tambah']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah ia menjadikan permukaan lebih licin, atau lebih mencengkam?' })),
    ok: (it, z) => `✅ ${it.label} — <b>${z.id === 'kurang' ? 'mengurangkan' : 'menambahkan'}</b> geseran.`,
    onDone: () => setTimeout(() => S.info('⚖️ Geseran ada kesan baik (pemadam, brek, cengkaman) dan kesan buruk (tapak kasut haus, enjin rosak, bunyi bising).', 9), 2500),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L5 Tekanan udara
function L5(S, play) {
  const root = group('L5', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['penyedut', '🥤', 'Penyedut minuman', 'Tekanan rendah dalam penyedut, udara luar menolak air masuk'], ['picagari', '💉', 'Picagari', 'Omboh ditarik, udara luar menolak cecair masuk'],
    ['pelocok', '🚽', 'Pelocok', 'Perbezaan tekanan menolak kotoran dalam paip'], ['kad', '🥛', 'Kad pada cawan terbalik', 'Tekanan udara menolak kad ke atas'], ['gunung', '🏔️', 'Puncak gunung', 'Semakin tinggi, semakin rendah tekanan udara']].map(P),
    { type: 'pressure', gap: 0.36, onDone: () => setTimeout(() => S.info('🌬️ Zarah udara berlanggar dengan permukaan objek lalu menghasilkan tekanan udara.', 9), 2500) });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

const LEVELS = [
  { id: 'L1', title: 'Tarikan dan tolakan', sp: 'SP 6.1.1', make: L1 },
  { id: 'L2', title: 'Kesan daya', sp: 'SP 6.1.2', make: L2 },
  { id: 'L3', title: 'Penyiasatan daya geseran', sp: 'SP 6.2.1 · 6.2.3', make: L3 },
  { id: 'L4', title: 'Mengawal daya geseran', sp: 'SP 6.2.2 · 6.2.4', make: L4 },
  { id: 'L5', title: 'Tekanan udara', sp: 'SP 6.3.1 – 6.3.3', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Daya',
  intro: '<b>Sains Tahun 6 · Unit 6.</b> Tarikan, tolakan, geseran dan tekanan udara! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · 👋 lambai = lepaskan · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
