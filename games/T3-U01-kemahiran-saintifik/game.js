// Sains Tahun 3 · Unit 1 Kemahiran Saintifik (SP 1.1.2 – 1.1.6) — classify twice, measure from zero + time, infer, predict, graph.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, pottedPlant, car, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const choiceRow = (root, opts, z = 0.27, size = 0.08, prefix = 'pilihan_') => opts.map((o, i) => { const c = emojiCard(prefix + o[0], o[1] || '', o[2], size, { border: '#7e57c2' }); c.userData.ok = o[3]; c.position.set((i - (opts.length - 1) / 2) * 0.32, 0, z); root.add(c); return c; });

// ------------------------------------------------------------ L1 Mengelas: by shape, then by colour
function L1(S, play) {
  const root = group('L1', table(1.6, 0.85, play));
  const SH = [['bulat_merah', '●', 'Bulat merah', 'bulat', 'merah'], ['bulat_hijau', '●', 'Bulat hijau', 'bulat', 'hijau'], ['segi_tiga_merah', '▲', 'Segi tiga merah', 'segi_tiga', 'merah'], ['segi_tiga_hijau', '▲', 'Segi tiga hijau', 'segi_tiga', 'hijau']];
  let layer = group('pusingan1'); root.add(layer); let dr;
  const round = (n) => {
    root.remove(layer); layer = group('pusingan' + n); root.add(layer);
    const byShape = n === 1;
    dr = sorter(S, layer, {
      type: byShape ? 'shape' : 'colour', size: 0.12, gap: 0.3,
      zones: byShape ? [{ id: 'bulat', label: '● Bulat', color: 0xe3f2fd, x: -0.38, z: -0.18, w: 0.6 }, { id: 'segi_tiga', label: '▲ Segi tiga', color: 0xfff3e0, x: 0.38, z: -0.18, w: 0.6 }]
        : [{ id: 'merah', label: 'Merah', color: 0xffcdd2, x: -0.38, z: -0.18, w: 0.6 }, { id: 'hijau', label: 'Hijau', color: 0xc8e6c9, x: 0.38, z: -0.18, w: 0.6 }],
      items: SH.map(([id, e, label, shp, col]) => ({ id, emoji: e, tint: col === 'merah' ? '#e53935' : '#43a047', label, zone: byShape ? shp : col, why: byShape ? 'Kelaskan mengikut ciri <b>bentuk</b>.' : 'Kali ini kelaskan mengikut ciri <b>warna</b>.' })),
      ok: (it, z) => `✅ ${it.label} → kumpulan <b>${z.label.replace(/^[●▲] /, '').toLowerCase()}</b>.`,
      onDone: () => { if (byShape) { S.info('✅ Ciri sepunya: <b>bentuk</b>. Sekarang kelaskan semula objek yang sama mengikut <b>warna</b>!'); setTimeout(() => round(2), 2500); } },
    });
  };
  round(1);
  return { root, view: { w: 1.6, d: 0.85 }, pick: (x, y) => dr.pick(x, y), drag: (x, y) => dr.drag(x, y), drop: (x, y) => dr.drop(x, y) };
}

// ------------------------------------------------------------ L2 Mengukur: pencil from 0 cm, then a stopwatch
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const CM = 0.06;  // a big 0-10 cm ruler: 6 cm on screen per real cm, so the reading is honest
  const rc = document.createElement('canvas'); rc.width = 1100; rc.height = 110; const rg = rc.getContext('2d');
  rg.fillStyle = '#ffe082'; rg.fillRect(0, 0, 1100, 110); rg.fillStyle = '#333'; rg.font = 'bold 34px system-ui'; rg.textAlign = 'center';
  for (let mm = 0; mm <= 100; mm++) { const x = 50 + mm * 10; rg.fillRect(x - 1, 0, 2, mm % 10 ? (mm % 5 ? 18 : 28) : 44); if (mm % 10 === 0) rg.fillText(mm / 10, x, 84); }
  const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace;
  const ru = group('pembaris', mesh(new THREE.BoxGeometry(11 * CM, 0.006, 1.1 * CM), M(0xffca28), 0, 0.003, 0));
  const face = mesh(new THREE.PlaneGeometry(11 * CM, 1.1 * CM), new THREE.MeshBasicMaterial({ map: rt }), 0, 0.0065, 0); face.rotation.x = -Math.PI / 2; ru.add(face);
  ru.position.set(0, 0, -0.22); root.add(ru);
  const zeroX = ru.position.x - 5.5 * CM + 0.5 * CM;  // the 0 mark
  const L = 5 * CM;
  const pen = group('pensel', mesh(new THREE.CylinderGeometry(0.012, 0.012, L - 0.03, 6).rotateZ(Math.PI / 2), M(0xffc107), (L - 0.03) / 2, 0.014, 0), mesh(new THREE.ConeGeometry(0.012, 0.03, 6).rotateZ(-Math.PI / 2), M(0xe0c097), L - 0.015, 0.014, 0));
  pen.position.set(zeroX + 0.12, 0, -0.1); pen.userData.carryY = 0.0; root.add(home(pen));  // origin = the pencil's back end
  const readings = choiceRow(root, [['4cm', '', '4 cm', false], ['5cm', '', '5 cm', true], ['6cm', '', '6 cm', false]], 0.15, 0.07); readings.forEach(r => r.visible = false);
  const track = mesh(new THREE.BoxGeometry(0.8, 0.004, 0.08), M(0xbdbdbd), 0, 0.002, 0.33); track.userData.fx = true; root.add(track);
  const toy = car('kereta_mainan'); toy.scale.setScalar(0.8); toy.position.set(-0.4, 0, 0.33); root.add(toy); toy.visible = false; track.visible = false;
  const watch = emojiCard('jam_randik', '⏱️', 'Jam randik', 0.1, { border: '#e53935' }); watch.position.set(0.55, 0, 0.33); watch.visible = false; root.add(watch);
  let aligned = false, read = false, timing = null, timed = false, t = 0, driving = false;
  const dr = dragger(S, () => (aligned ? [] : [pen]), {
    onDrop(o) {
      o.position.z = -0.22 + 0.055;
      if (Math.abs(o.position.x - zeroX) > 0.02) { S.info('📏 Letakkan hujung pensel pada <b>senggat 0</b>.'); return; }
      aligned = true; o.position.x = zeroX; S.evt('align', 'pensel'); readings.forEach(r => r.visible = true);
      S.info('👀 Lihat skala <b>tegak dari atas</b>. Berapakah panjang pensel?');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [...readings.filter(r => r.visible), ...(watch.visible ? [watch] : [])])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...readings.filter(r => r.visible && !read), ...(watch.visible && !timed ? [watch] : [])]); if (!c) return;
      if (c === watch) {
        if (timing === null) { timing = 0; driving = true; S.info('⏱️ Jam randik dimulakan! Tuding sekali lagi apabila kereta sampai ke hujung.'); return; }
        timed = true; driving = false; S.evt('time', 'jam_randik'); return S.info(`⏱️ Masa: <b>${timing.toFixed(1)} saat (s)</b>. Masa diukur dengan jam randik dalam unit saat.`);
      }
      if (!c.userData.ok) return S.info('🤔 Pastikan hujung pensel bermula pada 0, kemudian baca senggat di hujung yang satu lagi.');
      read = true; S.evt('read', '5cm'); readings.forEach(r => r.visible = false);
      watch.visible = toy.visible = track.visible = true;
      S.info('✅ Pensel: <b>5 cm</b>. Rekod bacaan bersama unit. Sekarang ukur masa: tuding <b>jam randik</b> untuk mula.');
    },
    update(dt) { t += dt; if (driving) { timing += dt; toy.position.x = Math.min(0.4, toy.position.x + dt * 0.25); } },
  };
}

// ------------------------------------------------------------ L3 Membuat inferens
const INF = [
  ['layu', '🥀', 'Pokok layu dan tanahnya kering.', [['air', 'Pokok mungkin tidak mendapat air yang mencukupi.', true], ['merah', 'Pokok suka warna merah.', false], ['tidur', 'Pokok sedang tidur.', false]]],
  ['jalan_basah', '☔', 'Jalan basah dan ada lopak air.', [['hujan', 'Hujan mungkin turun tadi.', true], ['pasir', 'Jalan diperbuat daripada pasir.', false], ['malam', 'Hari sudah malam.', false]]],
  ['aiskrim', '🍦', 'Aiskrim di atas meja menjadi cair.', [['panas', 'Cuaca mungkin panas.', true], ['manis', 'Aiskrim itu manis.', false], ['besar', 'Meja itu besar.', false]]],
];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  let r = 0, scene = null, cards = [];
  function setup() {
    if (scene) root.remove(scene); cards.forEach(c => root.remove(c));
    const [id, e, obs, opts] = INF[r]; scene = group('pemerhatian');
    if (id === 'layu') { const p = pottedPlant('pokok'); p.scale.setScalar(2); p.userData.setWilt(1); scene.add(p); } else { const c = emojiCard('gambar', e, '', 0.2); scene.add(c); }
    const o = textSprite('👀 Pemerhatian: ' + obs, { h: 0.034 }); o.position.set(0, 0.32, 0); scene.add(o);
    scene.position.set(0, 0, -0.2); root.add(scene);
    const mix = [[1, 0, 2], [2, 1, 0], [0, 2, 1]][r];
    cards = opts.map((o, i) => { const c = emojiCard('inferens_' + o[0], '', o[1], 0.13, { border: '#7e57c2' }); c.userData.ok = o[2]; c.position.set((mix[i] - 1) * 0.42, 0, 0.25); root.add(c); return c; });
    S.info(`🤔 Inferens ${r + 1}/3: pilih penerangan yang <b>munasabah</b> berdasarkan bukti.`);
  }
  setup();
  return {
    root, view: { w: 1.4, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, cards)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, cards); if (!c || r > 2) return;
      if (!c.userData.ok) return S.info('🤔 Adakah penerangan itu berdasarkan <b>bukti</b> dalam pemerhatian? Cuba lagi.');
      S.evt('infer', INF[r][0]); S.star(c.position.clone().setY(0.2));
      S.info('✅ Inferens: ' + INF[r][3].find(o => o[2])[1] + ' Inferens perlu disemak lagi.', 6);
      r++; if (r < 3) setTimeout(setup, 2800);
    },
  };
}

// ------------------------------------------------------------ L4 Meramal: what comes next?
const PRED = [
  ['manik', 'Apa seterusnya?', ['🔴', '🟢', '🔴', '🟢', '🔴'], [['hijau', '🟢', 'Hijau', true], ['merah', '🔴', 'Merah', false], ['biru', '🔵', 'Biru', false]], 'Warna manik berselang-seli.'],
  ['saiz', 'Saiz bola seterusnya?', ['⚽', '⚽', '⚽', '⚽'], [['lebih_besar', '⬆️', 'Lebih besar', true], ['sama', '➡️', 'Sama', false], ['lebih_kecil', '⬇️', 'Lebih kecil', false]], 'Saiz semakin bertambah.'],
  ['nombor', 'Tinggi pokok hari ke-4?', ['2 cm', '4 cm', '6 cm'], [['8cm', '', '8 cm', true], ['7cm', '', '7 cm', false], ['10cm', '', '10 cm', false]], 'Pokok bertambah 2 cm setiap hari.'],
];
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  let r = 0, row = null, cards = [];
  function setup() {
    if (row) root.remove(row); cards.forEach(c => root.remove(c));
    const [id, q, seq, opts] = PRED[r]; row = group('corak');
    seq.forEach((s, i) => { const sz = id === 'saiz' ? 0.06 + i * 0.02 : 0.1; const c = s.includes('cm') ? emojiCard('', '', s, 0.07) : emojiCard('', s, '', sz); c.position.set(-0.5 + i * 0.2, 0, 0); row.add(c); });
    const qm = emojiCard('', '❓', '', 0.1, { border: '#e53935' }); qm.position.set(-0.5 + seq.length * 0.2, 0, 0); row.add(qm);
    const t = textSprite('🔮 ' + q, { h: 0.04 }); t.position.set(0, 0.2, 0); row.add(t);
    row.position.set(0, 0, -0.2); root.add(row);
    cards = choiceRow(root, opts, 0.25, 0.09, 'ramalan_');
  }
  setup();
  return {
    root, view: { w: 1.4, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, cards)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, cards); if (!c || r > 2) return;
      if (!c.userData.ok) return S.info('🤔 Lihat <b>pola</b> sekali lagi. Ramalan berasaskan bukti, bukan tekaan semata-mata.');
      S.evt('predict', PRED[r][0]); S.star(c.position.clone().setY(0.2));
      S.info(`✅ Ramalan tepat! Bukti: <b>${PRED[r][4]}</b>`, 5);
      r++; if (r < 3) setTimeout(setup, 2600);
    },
  };
}

// ------------------------------------------------------------ L5 Berkomunikasi: table -> bar graph -> report
const FRUIT = [['pisang', 'Pisang', 4, 0xfdd835], ['betik', 'Betik', 2, 0xff7043], ['tembikai', 'Tembikai', 6, 0x43a047]];
function L5(S, play) {
  const root = group('L5', table(1.4, 0.9, play));
  const tc = document.createElement('canvas'); tc.width = 360; tc.height = 200; const tg = tc.getContext('2d');
  tg.fillStyle = '#fff'; tg.fillRect(0, 0, 360, 200); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; tg.fillText('Buah', 14, 32); tg.fillText('Bilangan murid', 160, 32);
  tg.font = '22px system-ui'; FRUIT.forEach(([, l, n], i) => { tg.fillText(l, 14, 80 + i * 40); tg.fillText(n, 210, 80 + i * 40); });
  const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const tab = mesh(new THREE.PlaneGeometry(0.32, 0.18), new THREE.MeshBasicMaterial({ map: tt }), -0.45, 0.004, -0.15); tab.rotation.x = -Math.PI / 2; tab.userData.fx = true; root.add(tab);
  const H = 0.035, graph = group('graf'); graph.position.set(0.18, 0, -0.05); graph.scale.setScalar(1.5); graph.rotation.x = -0.45; root.add(graph);  // thin cells, tilted to face the camera: a tap lands on the cell you see
  graph.add(mesh(new THREE.BoxGeometry(0.004, 6.5 * H, 0.004), M(0x333333), -0.17, 3.25 * H, -0.12), mesh(new THREE.BoxGeometry(0.5, 0.004, 0.004), M(0x333333), 0.05, 0, -0.12));
  for (let v = 2; v <= 6; v += 2) { const t = textSprite(String(v), { h: 0.022, bg: '#ffffff00' }); t.position.set(-0.19, v * H, -0.12); graph.add(t); }
  const cols = FRUIT.map(([id, label, , color], c) => {
    const x = -0.08 + c * 0.13, cells = [];
    for (let v = 1; v <= 6; v++) { const cell = mesh(new THREE.BoxGeometry(0.09, H * 0.95, 0.002), M(0xeeeeee, { transparent: true, opacity: 0.35 }), x, (v - 0.5) * H, -0.12); cell.name = `${id}_${v}`; cell.userData = { id, v }; graph.add(cell); cells.push(cell); }
    const bar = mesh(new THREE.BoxGeometry(0.09, 1, 0.01), M(color), x, 0, -0.115); bar.scale.y = 0.0001; bar.userData.fx = true; graph.add(bar);
    const t = textSprite(label, { h: 0.024 }); t.position.set(x, -0.02, -0.06); graph.add(t);
    return { id, cells, bar, value: 0 };
  });
  const title = textSprite('Buah kegemaran murid', { h: 0.03 }); title.position.set(0.05, 7.2 * H, -0.12); graph.add(title);
  const correct = new Set(); let reported = false;
  const allCells = cols.flatMap(c => c.cells);
  return {
    root, view: { w: 1.4, d: 0.9 },
    hit: (x, y) => S.hitTest(x, y, allCells)?.name ?? null,
    tap(x, y) {
      if (correct.size < 3) {
        const cell = S.hitTest(x, y, allCells); if (!cell) return;
        const col = cols.find(c => c.id === cell.userData.id); col.value = cell.userData.v;
        col.bar.scale.y = col.value * H; col.bar.position.y = col.value * H / 2;
        const want = FRUIT.find(f => f[0] === col.id)[2];
        if (col.value === want && !correct.has(col.id)) { correct.add(col.id); S.evt('bar', col.id); }
        S.info(col.value === want ? `✅ ${FRUIT.find(f => f[0] === col.id)[1]}: ${want} orang — sama seperti jadual.` : '📋 Pastikan data dalam graf <b>sama</b> dengan jadual.');
        if (correct.size === 3) setTimeout(() => S.info('📊 Graf siap! Tuding bar buah yang <b>paling digemari</b> untuk membuat laporan.'), 1800);
        return;
      }
      if (reported) return;
      const cell = S.hitTest(x, y, allCells), col = cell && cols.find(c => c.id === cell.userData.id); if (!col) return;  // tap anywhere in a fruit's column
      if (col.id !== 'tembikai') return S.info('🤔 Bar manakah yang paling tinggi?');
      reported = true; S.evt('report', 'tembikai'); S.info('📢 Laporan: <b>Tembikai paling digemari</b>, iaitu 6 orang murid. Beri tajuk dan label, dan terangkan dapatan kepada rakan.', 9);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Mengelas', sp: 'SP 1.1.2', make: L1 },
  { id: 'L2', title: 'Mengukur dan menggunakan nombor', sp: 'SP 1.1.3', make: L2 },
  { id: 'L3', title: 'Membuat inferens', sp: 'SP 1.1.4', make: L3 },
  { id: 'L4', title: 'Meramal', sp: 'SP 1.1.5', make: L4 },
  { id: 'L5', title: 'Berkomunikasi', sp: 'SP 1.1.6', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kemahiran Proses Sains (Tahun 3)',
  intro: '<b>Sains Tahun 3 · Unit 1.</b> Kelaskan, ukur, buat inferens, ramal dan berkomunikasi! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
