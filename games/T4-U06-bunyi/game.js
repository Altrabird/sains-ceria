// Sains Tahun 4 · Unit 6 Bunyi (SP 6.1.1 – 6.1.5) — vibrations make sound (real tones), sound spreads in all directions,
// echoes off hard surfaces, useful vs harmful sound, reducing noise.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sorter, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

let AC = null;
function tone(freq, dur = 0.4, { type = 'sine', vol = 0.15, delay = 0 } = {}) {  // real sound through WebAudio (silent if unavailable)
  try {
    AC ||= new AudioContext(); const t0 = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
    o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  } catch { /* no audio */ }
}
const SOUND = { tiupan: () => tone(660, 0.6, { type: 'triangle' }), ketukan: () => [523, 659, 784].forEach((f, i) => tone(f, 0.3, { delay: i * 0.12 })), petikan: () => tone(196, 0.9, { type: 'sawtooth', vol: 0.06 }),
  gesekan: () => tone(294, 0.8, { type: 'sawtooth', vol: 0.05 }), tepukan: () => tone(3000, 0.25, { type: 'square', vol: 0.03 }) };
function shake(S, o, secs = 0.6) { const x0 = o.position.x; return S.tween(secs, k => o.position.x = x0 + Math.sin(k * 60) * 0.004 * (1 - k)); }
function waves(S, root, at, { color = 0x7e57c2, r = 0.6, n = 3, ry = 0 } = {}) {  // expanding sound rings on the table
  for (let i = 0; i < n; i++) setTimeout(() => {
    const m = mesh(new THREE.RingGeometry(0.97, 1, 48), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.copy(at).setY(0.01 + ry); m.userData.fx = true; m.scale.setScalar(0.01); root.add(m);
    S.tween(1.2, k => { m.scale.setScalar(0.01 + k * r); m.material.opacity = 1 - k; }, () => root.remove(m));
  }, i * 250);
}

// ------------------------------------------------------------ L1 Bunyi dihasilkan oleh getaran
function L1(S, play) {
  const root = group('L1', table(1.6, 0.9, play));
  const mt = matcher(S, root, [
    { id: 'tiupan', target: ['🎶', 'Seruling'], card: ['', 'Tiupan'], ok: '🎶 <b>Tiupan</b>: udara dalam seruling bergetar.' },
    { id: 'ketukan', target: ['🎹', 'Bar xilofon'], card: ['', 'Ketukan'], ok: '🎹 <b>Ketukan</b>: bar xilofon bergetar.' },
    { id: 'petikan', target: ['🎸', 'Gitar'], card: ['', 'Petikan'], ok: '🎸 <b>Petikan</b>: tali gitar bergetar.' },
    { id: 'gesekan', target: ['🎻', 'Biola'], card: ['', 'Gesekan'], ok: '🎻 <b>Gesekan</b>: tali alat muzik bergetar.' },
    { id: 'tepukan', target: ['🥁', 'Simbal'], card: ['', 'Tepukan'], ok: '🥁 <b>Tepukan</b>: kepingan simbal bergetar.' },
  ], { type: 'vibrate', gap: 0.3 });
  const drop = mt.drop;
  mt.drop = (x, y) => { const before = mt.held; drop(x, y); if (before?.userData.done) { SOUND[before.userData.id](); const t = root.getObjectByName('sasaran_' + before.userData.id); shake(S, t); waves(S, root, t.position.clone(), { r: 0.25 }); } };
  return { root, view: { w: 1.6, d: 0.9 }, ...mt };
}

// ------------------------------------------------------------ L2 Bunyi bergerak ke semua arah
function L2(S, play) {
  const root = group('L2', table(1.3, 1.0, play));
  const bell = group('loceng', mesh(new THREE.CylinderGeometry(0.02, 0.07, 0.09, 24, 1, true), M(0xfbc02d, { metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), 0, 0.05, 0), mesh(new THREE.SphereGeometry(0.022, 14, 10), M(0xfbc02d, { metalness: 0.6 }), 0, 0.1, 0));
  bell.position.set(0, 0, -0.05); root.add(bell);
  const kids = [...Array(6)].map((_, i) => { const a = i / 6 * Math.PI * 2, k = kid('murid' + i, { shirt: [0xef5350, 0x42a5f5, 0x66bb6a, 0xffca28, 0xab47bc, 0x26c6da][i], girl: i % 2 === 1 }); k.position.set(Math.cos(a) * 0.38, 0, -0.05 + Math.sin(a) * 0.3); k.rotation.y = Math.atan2(-k.position.x, -(k.position.z + 0.05)); root.add(k); return k; });
  let rung = 0;
  return {
    root, view: { w: 1.3, d: 1.0 },
    hit: (x, y) => S.hitTest(x, y, [bell])?.name ?? null,
    async tap(x, y) {
      if (S.hitTest(x, y, [bell]) !== bell) return;
      rung++; tone(880, 1.2, { type: 'triangle' }); tone(1320, 0.8, { vol: 0.05 }); shake(S, bell); waves(S, root, bell.position.clone(), { r: 0.6, color: 0xffb300 });
      await S.wait(0.6);
      kids.forEach(k => { const e = emojiSprite('👂', 0.05); e.position.set(0, 0.3, 0); k.add(e); setTimeout(() => k.remove(e), 1800); });
      S.evt('ring', 'loceng'); S.info('🔔 Semua murid di sekeliling loceng dapat mendengar bunyi — <b>bunyi bergerak ke semua arah</b>.', 8);
    },
  };
}

// ------------------------------------------------------------ L3 Pantulan bunyi (gema)
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const boy = kid('murid', { shirt: 0x42a5f5 }); boy.scale.setScalar(1.5); boy.position.set(-0.45, 0, -0.1); boy.rotation.y = Math.PI / 2; root.add(boy);
  const spot = mesh(new THREE.BoxGeometry(0.06, 0.004, 0.36), M(0xffd84d, { transparent: true, opacity: 0.6 }), 0.42, 0.002, -0.1); spot.name = 'tapak_permukaan'; root.add(spot);
  const walls = [['dinding_batu', 'Dinding batu (keras)', 0x9e9e9e, true], ['langsir', 'Langsir (lembut)', 0xf48fb1, false]].map(([id, l, c, hard], i) => {
    const w = group(id, mesh(new THREE.BoxGeometry(0.04, 0.3, 0.34), M(c, { roughness: hard ? 0.4 : 1 }), 0, 0.15, 0)); w.userData.hard = hard; w.position.set(-0.1 + i * 0.3, 0, 0.3); w.scale.setScalar(0.5); root.add(home(w));
    const t = textSprite(l, { h: 0.028 }); t.position.set(0, 0.36, 0); w.add(t); return w; });
  const shout = emojiCard('jerit', '📣', 'Jerit "Helo!"', 0.1, { border: '#e53935' }); shout.position.set(-0.45, 0, 0.3); root.add(shout);
  let current = null; const tested = new Set();
  const dr = dragger(S, () => walls, {
    onDrop(w) {
      if (flat(w.position, spot.position) > 0.15) { if (current === w) current = null; w.scale.setScalar(0.5); return goHome(S, w); }
      if (current && current !== w) { current.scale.setScalar(0.5); goHome(S, current); }
      current = w; w.scale.setScalar(1); moveTo(S, w, spot.position.clone().setY(0)); S.info('Sekarang tuding <b>Jerit</b>.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [shout])?.name ?? null,
    async tap(x, y) {
      if (S.hitTest(x, y, [shout]) !== shout) return;
      if (!current) return S.info('Letakkan satu permukaan di tapak kuning dahulu.');
      tone(440, 0.3, { type: 'square', vol: 0.06 });
      const ball = mesh(new THREE.SphereGeometry(0.015, 10, 8), new THREE.MeshBasicMaterial({ color: 0xef5350 })); ball.userData.fx = true; root.add(ball);
      await S.tween(0.6, k => ball.position.set(-0.35 + k * 0.74, 0.18, -0.1));
      if (current.userData.hard) {
        tone(440, 0.3, { type: 'square', vol: 0.025, delay: 0 }); ball.material.color.set(0x1e88e5);
        await S.tween(0.6, k => ball.position.set(0.39 - k * 0.74, 0.18, -0.1)); root.remove(ball);
        tested.add('keras'); S.evt('echo', 'keras'); S.info('🔁 "Helo… helo…" — bunyi <b>dipantulkan</b> oleh permukaan keras. Ini ialah <b>gema</b>. Contoh: gua, bilik kosong, dewan kosong.', 8);
      } else {
        await S.tween(0.4, k => ball.scale.setScalar(1 - k)); root.remove(ball);
        tested.add('lembut'); S.evt('echo', 'lembut'); S.info('🤫 Tiada gema — langsir yang lembut <b>menyerap bunyi</b>.');
      }
    },
  };
}

// ------------------------------------------------------------ L4 Kegunaan pantulan bunyi + bunyi berfaedah / memudaratkan
function L4(S, play) {
  const root = group('L4', table(1.6, 0.9, play));
  const dr = sorter(S, root, {
    type: 'effect', size: 0.1, gap: 0.19,
    zones: [{ id: 'berfaedah', label: '😊 Bunyi berfaedah', color: 0xc8e6c9, x: -0.38, z: -0.18, w: 0.66 }, { id: 'memudaratkan', label: '😣 Bunyi memudaratkan', color: 0xffcdd2, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['muzik', '🎵', 'Muzik', 'berfaedah'], ['suara', '🗣️', 'Suara', 'berfaedah'], ['siren', '🚑', 'Siren ambulans', 'berfaedah'], ['telefon', '📱', 'Deringan telefon', 'berfaedah'], ['sonar', '🚢', 'Sonar kapal', 'berfaedah'],
      ['jentera', '🚜', 'Jentera pembinaan', 'memudaratkan'], ['trafik', '🚚', 'Bunyi trafik sesak', 'memudaratkan'], ['kuat', '🔊', 'Muzik terlalu kuat', 'memudaratkan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah bunyi ini membantu kita, atau mengganggu kehidupan?' })),
    ok: (it, z) => z.id === 'berfaedah' ? `😊 ${it.label}: ${{ muzik: 'menghiburkan.', suara: 'kita boleh berkomunikasi.', siren: 'menandakan kecemasan.', telefon: 'menandakan panggilan masuk.', sonar: 'pantulan bunyi mengesan objek di dalam air.' }[it.id]}` : `😣 ${it.label}: bunyi bising mengganggu komunikasi dan ketenangan, menyebabkan tekanan emosi dan masalah pendengaran.`,
  });
  return { root, view: { w: 1.6, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L5 Mengurangkan pencemaran bunyi
function L5(S, play) {
  const root = group('L5', table(1.5, 0.9, play));
  const room = group('bilik', mesh(new THREE.BoxGeometry(0.5, 0.012, 0.36), M(0xd7ccc8), 0, 0.006, 0), mesh(new THREE.BoxGeometry(0.5, 0.25, 0.012), M(0xfff8e1), 0, 0.125, -0.18), mesh(new THREE.BoxGeometry(0.012, 0.25, 0.36), M(0xfff8e1), 0.25, 0.125, 0));
  room.position.set(-0.3, 0, -0.12); root.add(room);
  const win = mesh(new THREE.BoxGeometry(0.15, 0.1, 0.014), M(0x90caf9), -0.3, 0.14, -0.29); root.add(win);
  const road = emojiSprite('🚚', 0.1); road.position.set(-0.3, 0.3, -0.45); root.add(road);
  const worker = kid('pekerja', { shirt: 0xffeb3b, pants: 0x37474f }); worker.scale.setScalar(1.6); worker.position.set(0.45, 0, -0.15); root.add(worker);
  const plane = emojiSprite('✈️', 0.13); plane.position.set(0.5, 0.42, -0.35); root.add(plane);
  const items = [['langsir', '🎀', 'Langsir', 'bilik'], ['permaidani', '🟪', 'Permaidani', 'bilik'], ['pelindung', '🎧', 'Pelindung telinga', 'pekerja']]
    .map(([id, e, l, to], i) => { const c = emojiCard(id, e, l, 0.1, { border: '#7e57c2' }); c.userData.to = to; c.position.set(-0.3 + i * 0.3, 0, 0.3); root.add(home(c)); return c; });
  let noise = 3; const meter = [];
  for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(0.03, 0.03 + i * 0.02, 0.01), M(0xe53935), -0.6 + i * 0.04, 0.02 + i * 0.01, 0.0); root.add(b); meter.push(b); }
  const ml = textSprite('Bunyi bising di dalam bilik', { h: 0.022 }); ml.position.set(-0.56, 0.1, 0.0); root.add(ml);
  const done = new Set();
  const dr = dragger(S, () => items.filter(c => !done.has(c.name)), {
    onDrop(c, x, y) {
      const toRoom = flat(c.position, room.position) < 0.28, toWorker = nearScreen(S, worker, x, y, 0.15, 90) || flat(c.position, worker.position) < 0.15;
      if (!toRoom && !toWorker) return goHome(S, c);
      if ((c.userData.to === 'bilik') !== toRoom) { S.info(c.userData.to === 'bilik' ? '🤔 Bahan penyerap bunyi dipasang di dalam <b>bilik</b>.' : '🤔 Pelindung telinga dipakai oleh <b>pekerja</b> di lapangan terbang.'); return goHome(S, c); }
      done.add(c.name); S.evt('reduce', c.name);
      if (toRoom) { c.visible = false; if (c.name === 'langsir') room.add(mesh(new THREE.BoxGeometry(0.17, 0.12, 0.01), M(0xf48fb1, { roughness: 1 }), 0, 0.14, -0.165)); else room.add(mesh(new THREE.BoxGeometry(0.3, 0.004, 0.2), M(0x8e24aa, { roughness: 1 }), 0, 0.014, 0.02)); noise--; meter.forEach((b, i) => b.visible = i < noise); S.info('🔉 Bahan penyerap bunyi <b>mengurangkan getaran bunyi</b>. Bilik semakin tenang.'); }
      else { c.visible = false; const e = emojiSprite('🎧', 0.06); e.position.set(0, 0.2, 0.02); worker.add(e); S.info('🎧 Pelindung telinga melindungi telinga daripada bunyi yang kuat.'); }
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr, update() { road.position.x = -0.3 + Math.sin(performance.now() / 600) * 0.15; } };
}

const LEVELS = [
  { id: 'L1', title: 'Bunyi dihasilkan oleh getaran', sp: 'SP 6.1.1', make: L1 },
  { id: 'L2', title: 'Bunyi bergerak ke semua arah', sp: 'SP 6.1.2', make: L2 },
  { id: 'L3', title: 'Pantulan bunyi', sp: 'SP 6.1.3', make: L3 },
  { id: 'L4', title: 'Bunyi berfaedah dan memudaratkan', sp: 'SP 6.1.3 · 6.1.4', make: L4 },
  { id: 'L5', title: 'Mengurangkan pencemaran bunyi', sp: 'SP 6.1.5', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Bunyi',
  intro: '<b>Sains Tahun 4 · Unit 6.</b> Dengar bunyi yang sebenar! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
