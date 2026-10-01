// Sains Tahun 5 · Unit 6 Haba (SP 6.1.1 – 6.1.7) — using a thermometer, heating and cooling water with a live graph,
// expansion and contraction of solid / liquid / gas, everyday examples.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, sequence, emojiCard, textCard, beaker, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Cara menggunakan termometer
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const STEPS = [['bikar', 'Letakkan bikar di atas permukaan rata'], ['pegang', 'Pegang bahagian atas termometer secara tegak'], ['rendam', 'Rendam bebuli tanpa menyentuh dasar bikar'],
    ['tunggu', 'Tunggu aras cecair berhenti berubah'], ['baca', 'Mata berada pada aras cecair untuk membaca suhu']];
  const dr = sequence(S, root, STEPS.map(([id, t]) => ({ obj: textCard(id, t, 0.27), id, t })), {
    type: 'step', gap: 0.33, slotW: 0.3, slotZ: -0.2, rowZ: 0.28, ok: it => `✅ ${it.t}.`,
    onDone: () => setTimeout(() => S.info('🌡️ Termometer mengukur suhu dalam darjah Celsius (°C). Jangan gunakan termometer untuk mengacau air.', 9), 2200),
  });
  return { root, view: { w: 1.8, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Panaskan dan sejukkan air (live graph)
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const stand = group('penunu', mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.06, 16), M(0x546e7a), 0, 0.03, 0)); stand.position.set(-0.45, 0, -0.1); root.add(stand);
  const flame = mesh(new THREE.ConeGeometry(0.02, 0.06, 12), M(0x42a5f5, { emissive: 0x1e88e5, emissiveIntensity: 1, transparent: true, opacity: 0.85 }), 0, 0.09, 0); flame.visible = false; flame.userData.fx = true; stand.add(flame);
  const gauze = mesh(new THREE.BoxGeometry(0.14, 0.006, 0.14), M(0x9e9e9e, { metalness: 0.6 }), 0, 0.125, 0); stand.add(gauze);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) stand.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.125), M(0x424242), x * 0.06, 0.0625, z * 0.06));
  const bk = beaker('bikar'); bk.scale.setScalar(1.3); bk.position.set(0, 0.128, 0); stand.add(bk);
  const water = mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.07, 20), M(0x4fc3f7, { transparent: true, opacity: 0.6 }), 0, 0.17, 0); water.userData.fx = true; stand.add(water);
  const tube = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24), M(0xffffff, { transparent: true, opacity: 0.5 }), 0.02, 0.27, 0); stand.add(tube);
  const col = mesh(new THREE.CylinderGeometry(0.003, 0.003, 1), M(0xe53935)); col.position.set(0.02, 0, 0.002); stand.add(col);
  const bubbles = []; for (let i = 0; i < 12; i++) { const b = mesh(new THREE.SphereGeometry(0.004, 6, 4), M(0xffffff, { transparent: true, opacity: 0.8 })); b.visible = false; b.userData.fx = true; stand.add(b); bubbles.push(b); }
  const read = textSprite('30 °C', { h: 0.04, bg: '#fff59dee' }); read.position.set(-0.45, 0.48, -0.1); root.add(read);
  // graph
  const gc = document.createElement('canvas'); gc.width = 520; gc.height = 360; const g = gc.getContext('2d'); const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
  const pts = []; const X = t => 60 + t * 7, Y = v => 320 - v * 2.8;
  const draw = () => { g.fillStyle = '#fff'; g.fillRect(0, 0, 520, 360); g.strokeStyle = '#2b2340'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 20); g.lineTo(60, 320); g.lineTo(510, 320); g.stroke();
    g.fillStyle = '#2b2340'; g.font = 'bold 22px system-ui'; g.fillText('Suhu (°C)', 70, 30); g.fillText('Masa', 450, 350); g.font = '20px system-ui'; for (const v of [0, 30, 100]) { g.fillText(v, 14, Y(v) + 7); g.setLineDash([6, 6]); g.strokeStyle = '#bbb'; g.beginPath(); g.moveTo(60, Y(v)); g.lineTo(510, Y(v)); g.stroke(); g.setLineDash([]); }
    g.strokeStyle = '#e53935'; g.lineWidth = 5; g.beginPath(); pts.forEach(([t, v], i) => (i ? g.lineTo(X(t), Y(v)) : g.moveTo(X(t), Y(v)))); g.stroke(); gt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ map: gt }), 0.3, 0.2, -0.25); board.rotation.x = -0.5; board.userData.fx = true; root.add(board);
  const btn = textCard('api', '🔥 Hidupkan penunu', 0.26, { border: '#ef6c00' }); btn.position.set(-0.45, 0, 0.3); root.add(btn);
  const ask = [['90', '90 °C'], ['100', '100 °C'], ['0', '0 °C']].map(([id, l], i) => { const c = textCard('takat_' + id, l, 0.14); c.position.set(0.05 + i * 0.17, 0, 0.32); c.visible = false; root.add(c); return c; });
  let shown = 30, T = 30, on = false, time = 0, boilT = 0, phase = 'heat', sample = 0, answered = false;
  function label(t) { const c = textCard('api', t, 0.26, { border: on ? '#1e88e5' : '#ef6c00' }); btn.remove(...btn.children); btn.add(...c.children); }
  return {
    root, view: { w: 1.6, d: 1.0 },
    hit: (x, y) => S.hitTest(x, y, [btn, ...ask.filter(c => c.visible)])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [btn, ...ask.filter(c => c.visible)]); if (!c) return;
      if (ask.includes(c)) {
        if (answered) return; if (c.name !== 'takat_100') return S.info(c.name === 'takat_0' ? '🤔 0 °C ialah takat beku air. Bilakah suhu air berhenti meningkat semasa dipanaskan?' : '🤔 Lihat graf — suhu air kekal pada aras berapa semasa mendidih?');
        answered = true; S.evt('point', '100'); return S.info('✅ Takat didih air ialah <b>100 °C</b>. Takat beku air ialah <b>0 °C</b>.', 9);
      }
      if (phase === 'done') return;
      on = !on; flame.visible = on; label(on ? '❄️ Matikan penunu' : '🔥 Hidupkan penunu');
      S.info(on ? '🔥 Air menerima haba — perhatikan termometer dan graf.' : '❄️ Penunu dimatikan. Air panas dibiarkan…');
    },
    update(dt) {
      if (phase === 'done' && !on && T <= 31) return;
      time += dt; const room = 30;
      if (on) T = Math.min(100, T + 14 * dt); else T += (room - T) * 0.45 * dt;
      if ((sample += dt) > 0.4 && time < 64) { sample = 0; pts.push([time, T]); draw(); }
      col.scale.y = 0.02 + T / 100 * 0.2; col.position.y = 0.16 + col.scale.y / 2;
      const boiling = on && T >= 100; bubbles.forEach((b, i) => { b.visible = boiling; if (boiling) { b.position.set(Math.sin(i * 2.4) * 0.03, 0.14 + ((time * 0.08 + i / 12) % 1) * 0.06, Math.cos(i * 2.4) * 0.03); } });
      if (Math.round(T) !== shown) { shown = Math.round(T); read.material.map?.dispose(); read.material = textSprite(`${shown} °C`, { h: 0.04, bg: '#fff59dee' }).material; }
      if (boiling) { boilT += dt; if (boilT > 2.5 && phase === 'heat') { phase = 'cool'; S.evt('heat', 'didih'); S.info('✅ Air mendidih — suhu <b>kekal pada 100 °C</b> walaupun terus dipanaskan. Sekarang matikan penunu.', 8); } }
      if (phase === 'cool' && !on && T <= 31) { phase = 'done'; S.evt('cool', 'bilik'); ask.forEach(c => (c.visible = true)); S.info('✅ Air kehilangan haba ke persekitaran — suhu menurun dan kekal pada <b>suhu bilik</b>. Apakah takat didih air?', 9); }
    },
  };
}

// ------------------------------------------------------------ L3 Pengembangan dan pengecutan
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const X = [-0.5, 0, 0.5];
  // solid: ball and ring
  const ringStand = group('gelang', mesh(new THREE.TorusGeometry(0.036, 0.005, 8, 32), M(0xc9a227, { metalness: 0.7 }), 0, 0.16, 0).rotateX(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16), M(0x8d6e63), 0.04, 0.08, 0));
  ringStand.position.set(X[0], 0, -0.15); root.add(ringStand);
  const ball = mesh(new THREE.SphereGeometry(0.032, 20, 14), M(0x616161, { metalness: 0.8, roughness: 0.3 }), X[0], 0.2, -0.15); ball.name = 'bebola'; root.add(ball);
  // liquid: flask with coloured water in a tube
  const flask = group('kelalang', mesh(new THREE.SphereGeometry(0.05, 20, 14), M(0xe53935, { transparent: true, opacity: 0.85 }), 0, 0.05, 0), mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22), M(0xffffff, { transparent: true, opacity: 0.4 }), 0, 0.2, 0));
  const lcol = mesh(new THREE.CylinderGeometry(0.004, 0.004, 1), M(0xe53935)); lcol.scale.y = 0.06; lcol.position.y = 0.1 + 0.03; flask.add(lcol);
  flask.position.set(X[1], 0, -0.15); root.add(flask);
  // gas: bottle with balloon
  const bottle = group('botol', mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 20), M(0xe3f2fd, { transparent: true, opacity: 0.5 }), 0, 0.06, 0), mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.04, 16), M(0xe3f2fd, { transparent: true, opacity: 0.5 }), 0, 0.14, 0));
  const balloon = mesh(new THREE.SphereGeometry(0.035, 18, 12), M(0xe53935)); balloon.position.y = 0.18; balloon.scale.set(0.3, 0.4, 0.3); bottle.add(balloon);
  bottle.position.set(X[2], 0, -0.15); root.add(bottle);
  const names = [['bebola', 'Pepejal'], ['cecair', 'Cecair'], ['gas', 'Gas']];
  names.forEach(([, l], i) => { const t = textSprite(l, { h: 0.035, bg: '#ffffffdd' }); t.position.set(X[i], 0.36, -0.15); root.add(t); });
  const btns = []; names.forEach(([id], i) => ['panas', 'sejuk'].forEach((k, j) => { const c = textCard(k + '_' + id, k === 'panas' ? '🔥 Panaskan' : '❄️ Sejukkan', 0.17, { border: k === 'panas' ? '#ef6c00' : '#1e88e5' }); c.position.set(X[i] - 0.095 + j * 0.19, 0, 0.18); c.userData = { id, k }; root.add(c); btns.push(c); }));
  const hot = {}, ev = new Set();
  const once = (t, id) => { if (!ev.has(t + id)) { ev.add(t + id); S.evt(t, id); } };
  function apply(id, k) {
    const h = k === 'panas';
    if (id === 'bebola') {
      ball.material.color.set(h ? 0xff7043 : 0x616161);
      if (h) { ball.position.y = 0.2; S.tween(0.6, t => ball.scale.setScalar(1 + 0.25 * t)); }
      else S.tween(0.6, t => ball.scale.setScalar(1.25 - 0.25 * t), () => S.tween(0.6, t => (ball.position.y = 0.2 - 0.165 * t)));
      return h ? '🔥 Bebola logam <b>mengembang</b> — tidak dapat melalui gelang.' : '❄️ Bebola logam <b>mengecut</b> — kini dapat melalui gelang.';
    }
    if (id === 'cecair') { const a = lcol.scale.y, b = h ? 0.17 : 0.03; S.tween(1, t => { lcol.scale.y = a + (b - a) * t; lcol.position.y = 0.1 + lcol.scale.y / 2; }); return h ? '🔥 Air berwarna <b>mengembang</b> — aras dalam tiub meningkat.' : '❄️ Air berwarna <b>mengecut</b> — aras dalam tiub menurun.'; }
    const a = balloon.scale.x, b = h ? 1.1 : 0.3; S.tween(1, t => { const s = a + (b - a) * t; balloon.scale.set(s, s * 1.15, s); balloon.position.y = 0.16 + s * 0.04; });
    return h ? '🔥 Udara dalam botol <b>mengembang</b> — belon mengembung.' : '❄️ Udara <b>mengecut</b> — belon mengempis.';
  }
  return {
    root, view: { w: 1.7, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, btns)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, btns); if (!c) return; const { id, k } = c.userData;
      if (k === 'sejuk' && !hot[id]) return S.info('🤔 Panaskan dahulu, kemudian sejukkan.');
      if (k === 'panas' && hot[id]) return S.info('🔥 Sudah panas. Cuba sejukkan.');
      hot[id] = k === 'panas'; S.info(apply(id, k), 7); once(k === 'panas' ? 'expand' : 'contract', id);
      if (ev.size === 6) setTimeout(() => S.info('🌡️ Pepejal, cecair dan gas <b>mengembang</b> apabila menerima haba dan <b>mengecut</b> apabila kehilangan haba.', 9), 2500);
    },
  };
}

// ------------------------------------------------------------ L4 Dalam kehidupan
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'life', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'kembang', label: '🔥 Mengembang (menerima haba)', color: 0xffe0b2, x: -0.38, z: -0.18, w: 0.7 }, { id: 'kecut', label: '❄️ Mengecut (kehilangan haba)', color: 0xbbdefb, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['jambatan', '🌉', 'Celah sambungan jambatan', 'kembang'], ['landasan', '🚆', 'Celah landasan kereta api', 'kembang'], ['naik', '🌡️', 'Termometer: cecair naik', 'kembang'], ['penutup', '🥫', 'Penutup logam longgar dalam air panas', 'kembang'],
      ['kabel', '🔌', 'Kabel dipasang kendur', 'kecut'], ['turun', '🧊', 'Termometer: cecair turun', 'kecut'], ['belon', '🎈', 'Belon mengempis dalam peti sejuk', 'kecut'], ['tayar', '🚲', 'Tayar kurang tegang pada pagi sejuk', 'kecut']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah bahan ini menerima haba atau kehilangan haba?' })),
    ok: (it, z) => `✅ ${it.label} — ${z.id === 'kembang' ? 'bahan <b>mengembang</b> apabila panas' : 'bahan <b>mengecut</b> apabila sejuk'}.`,
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Menggunakan termometer', sp: 'SP 6.1.1 · 6.1.2', make: L1 },
  { id: 'L2', title: 'Perubahan suhu air', sp: 'SP 6.1.3 · 6.1.4 · 6.1.7', make: L2 },
  { id: 'L3', title: 'Pengembangan dan pengecutan', sp: 'SP 6.1.5', make: L3 },
  { id: 'L4', title: 'Dalam kehidupan', sp: 'SP 6.1.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Haba (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 6.</b> Suhu, takat didih, pengembangan dan pengecutan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
