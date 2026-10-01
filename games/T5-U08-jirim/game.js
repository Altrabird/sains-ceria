// Sains Tahun 5 · Unit 8 Jirim (SP 8.1.1 – 8.2.4) — three states of matter, particle simulator with heating and
// cooling (melting, boiling, condensation, freezing), changes around us, the water cycle.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Tiga keadaan jirim
function L1(S, play) {
  const root = group('L1', table(1.7, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.5, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'state', size: 0.09, gap: 0.18, row: 0.3,
    zones: [Z('pepejal', '🧊 Pepejal', 0xe3f2fd, -0.56), Z('cecair', '💧 Cecair', 0xe0f7fa, 0), Z('gas', '💨 Gas', 0xf3e5f5, 0.56)],
    items: [['batu', '', 'Batu', 'pepejal'], ['ais', '🧊', 'Ais', 'pepejal'], ['buku', '📕', 'Buku', 'pepejal'], ['air', '🥛', 'Air', 'cecair'], ['minyak', '🛢️', 'Minyak masak', 'cecair'], ['jus', '🧃', 'Jus oren', 'cecair'],
      ['udara', '🎈', 'Udara dalam belon', 'gas'], ['wap', '♨️', 'Wap air', 'gas'], ['asap', '💨', 'Asap', 'gas']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah bentuk dan isi padunya tetap?' })),
    ok: (it, z) => `✅ ${it.label} — ${{ pepejal: 'bentuk dan isi padu <b>tetap</b>', cecair: 'bentuk ikut bekas, isi padu <b>tetap</b>', gas: 'bentuk dan isi padu <b>tidak tetap</b>, memenuhi ruang' }[z.id]}.`,
    onDone: () => setTimeout(() => S.info('⚖️ Pepejal, cecair dan gas mempunyai jisim dan memenuhi ruang — semuanya jirim.', 9), 2500),
  });
  return { root, view: { w: 1.7, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Simulasi zarah
const NAME = { 'pepejal>cecair': 'peleburan', 'cecair>gas': 'pendidihan', 'gas>cecair': 'kondensasi', 'cecair>pepejal': 'pembekuan' };
const DESC = { peleburan: 'Pepejal bertukar menjadi cecair', pendidihan: 'Cecair bertukar menjadi gas pada takat didih', kondensasi: 'Gas bertukar menjadi cecair', pembekuan: 'Cecair bertukar menjadi pepejal' };
function L2(S, play) {
  const root = group('L2', table(1.5, 0.95, play));
  const B = 0.16, C = new THREE.Vector3(-0.15, B, -0.1);
  const box = mesh(new THREE.BoxGeometry(B * 2, B * 2, B * 2), M(0xffffff, { transparent: true, opacity: 0.12, side: THREE.BackSide })); box.position.copy(C); box.userData.fx = true; root.add(box);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: 0x607d8b })); edges.position.copy(C); root.add(edges);
  const COL = { pepejal: 0xe91e63, cecair: 0x1e88e5, gas: 0x8e24aa };
  const parts = []; const mat = M(COL.pepejal);
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) { const p = mesh(new THREE.SphereGeometry(0.018, 12, 8), mat); p.userData.home = new THREE.Vector3((x - 1) * 0.038, -B + 0.02 + y * 0.038, (z - 1) * 0.038); p.userData.v = new THREE.Vector3().randomDirection().multiplyScalar(0.25); p.userData.t = p.userData.home.clone(); p.position.copy(C).add(p.userData.home); root.add(p); parts.push(p); }
  const btns = [['panas', '🔥 Panaskan', '#ef6c00'], ['sejuk', '❄️ Sejukkan', '#1e88e5']].map(([id, l, b], i) => { const c = textCard(id, l, 0.22, { border: b }); c.position.set(0.42, 0, -0.15 + i * 0.2); root.add(c); return c; });
  let state = 'pepejal', time = 0, retarget = 0; const seen = new Set();
  const label = () => { const t = textSprite({ pepejal: 'Pepejal: zarah tersusun rapat dan teratur', cecair: 'Cecair: zarah rapat tetapi tidak teratur', gas: 'Gas: zarah berjauhan, bergerak laju' }[state], { h: 0.032, bg: '#ffffffdd' }); t.name = 'keadaan'; t.position.set(-0.15, 0.4, -0.1); return t; };
  let lbl = label(); root.add(lbl);
  return {
    root, view: { w: 1.4, d: 1.0 },
    hit: (x, y) => S.hitTest(x, y, btns)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, btns); if (!c) return;
      const order = ['pepejal', 'cecair', 'gas'], i = order.indexOf(state) + (c.name === 'panas' ? 1 : -1);
      if (i < 0) return S.info('❄️ Sudah pepejal — tidak boleh disejukkan menjadi keadaan lain.');
      if (i > 2) return S.info('🔥 Sudah gas. Cuba sejukkan.');
      const nx = order[i], n = NAME[state + '>' + nx]; state = nx; mat.color.setHex(COL[state]);
      root.remove(lbl); lbl = label(); root.add(lbl);
      if (state === 'cecair') parts.forEach(p => p.userData.t.set((Math.random() - 0.5) * 0.25, -B + 0.02 + Math.random() * 0.07, (Math.random() - 0.5) * 0.25));
      if (!seen.has(n)) { seen.add(n); S.evt('change', n); }
      S.info(`${c.name === 'panas' ? '🔥 Menerima haba' : '❄️ Kehilangan haba'}: <b>${n}</b> — ${DESC[n].toLowerCase()}.`, 7);
      if (seen.size === 4) setTimeout(() => S.info('✅ Jirim berubah keadaan apabila menerima atau kehilangan haba. Penyejatan pula berlaku pada sebarang suhu di bawah takat didih.', 9), 2600);
    },
    update(dt) {
      time += dt; retarget += dt;
      if (state === 'cecair' && retarget > 1) { retarget = 0; parts.forEach(p => { if (Math.random() < 0.3) p.userData.t.set((Math.random() - 0.5) * 0.25, -B + 0.02 + Math.random() * 0.07, (Math.random() - 0.5) * 0.25); }); }
      parts.forEach((p, i) => {
        const rel = p.position.clone().sub(C);
        if (state === 'pepejal') { rel.lerp(p.userData.home, Math.min(1, dt * 4)); rel.x += Math.sin(time * 20 + i) * 0.0008; }
        else if (state === 'cecair') rel.lerp(p.userData.t, Math.min(1, dt * 1.5));
        else { rel.addScaledVector(p.userData.v, dt); for (const a of ['x', 'y', 'z']) if (Math.abs(rel[a]) > B - 0.02) { rel[a] = Math.sign(rel[a]) * (B - 0.02); p.userData.v[a] *= -1; } }
        p.position.copy(C).add(rel);
      });
    },
  };
}

// ------------------------------------------------------------ L3 Contoh di sekeliling kita
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const mt = matcher(S, root, [['lebur', '🧊', 'Ais mencair', 'Peleburan'], ['beku', '🍧', 'Air menjadi ais', 'Pembekuan'], ['sejat', '👕', 'Pakaian basah mengering', 'Penyejatan'],
    ['kondensasi', '🥤', 'Titisan air di luar gelas berisi ais', 'Kondensasi'], ['didih', '♨️', 'Air mendidih dalam cerek', 'Pendidihan']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} — <b>${f.toLowerCase()}</b>.` })), { type: 'example', gap: 0.32 });
  return { root, view: { w: 1.7, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Kitaran air semula jadi
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const sea = mesh(new THREE.BoxGeometry(0.6, 0.02, 0.5), M(0x29b6f6, { transparent: true, opacity: 0.85 }), -0.45, 0.01, 0.05); sea.name = 'laut'; root.add(sea);
  const land = mesh(new THREE.BoxGeometry(0.85, 0.03, 0.5), M(0x7cb342), 0.33, 0.015, 0.05); root.add(land);
  const hill = mesh(new THREE.ConeGeometry(0.16, 0.22, 6), M(0x8d6e63, { flatShading: true }), 0.5, 0.14, -0.08); root.add(hill);
  const river = mesh(new THREE.BoxGeometry(0.62, 0.006, 0.04), M(0x4fc3f7), 0.0, 0.032, 0.18); river.rotation.y = -0.15; river.name = 'sungai'; root.add(river);
  const sun = group('matahari', mesh(new THREE.SphereGeometry(0.06, 20, 14), M(0xffd54f, { emissive: 0xffb300, emissiveIntensity: 0.8 }))); sun.position.set(-0.55, 0.3, -0.22); root.add(sun);
  const cloud = group('awan'); for (const [x, y, r] of [[0, 0, 0.05], [0.05, 0.01, 0.04], [-0.05, 0.005, 0.04], [0.02, 0.035, 0.035]]) cloud.add(mesh(new THREE.SphereGeometry(r, 14, 10), M(0xffffff)));
  cloud.position.set(0.25, 0.32, -0.1); cloud.scale.setScalar(0.8); root.add(cloud);
  const steps = ['penyejatan', 'kondensasi', 'hujan', 'aliran'];
  const MSG = { penyejatan: '✅ ① Haba daripada Matahari menyebabkan air di permukaan Bumi <b>tersejat</b> menjadi wap air.', kondensasi: '✅ ② Wap air naik, menyejuk dan mengalami <b>kondensasi</b> menjadi titisan air yang membentuk awan.',
    hujan: '✅ ③ Titisan air bergabung, menjadi berat dan turun sebagai <b>hujan</b>.', aliran: '✅ ④ Air hujan <b>mengalir</b> ke sungai dan laut. Kitaran ini berulang!' };
  const HINT = ['🤔 Mula dengan sumber haba — Matahari.', '🤔 Wap air naik ke langit. Apakah yang terbentuk?', '🤔 Awan sudah berat dengan titisan air. Tuding awan.', '🤔 Ke manakah air hujan mengalir?'];
  const fx = []; let k = 0, flow = 0;
  const targets = [sun, cloud, cloud, river];
  return {
    root, view: { w: 1.6, d: 1.3 },
    hit: (x, y) => S.hitTest(x, y, [sun, cloud, river, sea])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [sun, cloud, river, sea]); if (!c || k >= 4) return;
      if (c !== targets[k]) return S.info(HINT[k]);
      const st = steps[k++];
      if (st === 'penyejatan') for (let i = 0; i < 24; i++) { const v = mesh(new THREE.SphereGeometry(0.006, 6, 4), M(0xe1f5fe, { transparent: true, opacity: 0.8 })); v.userData = { fx: true, kind: 'wap', s: Math.random() }; v.position.set(-0.6 + Math.random() * 0.4, 0.03, -0.1 + Math.random() * 0.3); root.add(v); fx.push(v); }
      if (st === 'kondensasi') { S.tween(1.5, t => cloud.scale.setScalar(0.8 + t * 0.6)); fx.filter(f => f.userData.kind === 'wap').forEach(f => (f.visible = false)); }
      if (st === 'hujan') { cloud.traverse(m => m.isMesh && m.material.color.set(0x90a4ae)); for (let i = 0; i < 40; i++) { const d = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.02, 4), M(0x0288d1)); d.userData = { fx: true, kind: 'hujan' }; d.position.set(0.15 + Math.random() * 0.25, Math.random() * 0.29, -0.18 + Math.random() * 0.16); root.add(d); fx.push(d); } }
      if (st === 'aliran') flow = 1;
      S.evt('cycle', st); S.info(MSG[st], 7);
      if (k === 4) setTimeout(() => S.info('🌍 Kitaran air membekalkan air secara berterusan kepada hidupan. Penyejatan dan kondensasi juga berlaku dalam model hujan.', 9), 3000);
    },
    update(dt) {
      fx.forEach(f => { if (f.userData.kind === 'wap' && f.visible) { f.position.y += dt * 0.12; f.position.x += dt * 0.1; if (f.position.y > 0.3) { f.position.y = 0.03; f.position.x = -0.6 + Math.random() * 0.4; } }
        if (f.userData.kind === 'hujan') { f.position.y -= dt * 0.5; if (f.position.y < 0.03) f.position.y = 0.29; } });
      if (flow) { flow += dt; river.material.color.setHSL(0.55, 0.8, 0.5 + Math.sin(flow * 6) * 0.08); }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Tiga keadaan jirim', sp: 'SP 8.1.1 – 8.1.4', make: L1 },
  { id: 'L2', title: 'Susunan zarah', sp: 'SP 8.1.3 · 8.2.1', make: L2 },
  { id: 'L3', title: 'Perubahan di sekeliling kita', sp: 'SP 8.2.2', make: L3 },
  { id: 'L4', title: 'Kitaran air semula jadi', sp: 'SP 8.2.3 · 8.2.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Jirim (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 8.</b> Pepejal, cecair, gas dan kitaran air! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
