// Sains Tahun 2 · Unit 3 Manusia (SP 3.1.1 – 3.1.6) — birth + growth stages, growth differs, inheritance.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, scale, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Manusia membiak + saya membesar
const STAGES = [['bayi', 'Bayi', 0.45], ['kanak_kanak', 'Kanak-kanak', 0.85], ['remaja', 'Remaja', 1.2], ['dewasa', 'Dewasa', 1.5]];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const mum = kid('ibu', { shirt: 0xf48fb1, pants: 0x6a1b9a, girl: true, scale: 1.45, hair: 0x4e342e }); mum.position.set(-0.58, 0, -0.22); mum.rotation.y = 0.5; root.add(mum);
  const baby = kid('', { shirt: 0x81d4fa, pants: 0x81d4fa }); baby.scale.setScalar(0.35); baby.position.set(0.0, 0.11, 0.05); baby.rotation.x = -1.2; mum.add(baby);
  const ml = textSprite('Ibu dan bayi', { h: 0.03 }); ml.position.set(-0.58, 0.4, -0.22); root.add(ml);
  const slots = STAGES.map((s, i) => { const m = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.004, 24), M(0xffd84d), -0.2 + i * 0.22, 0.002, -0.2); m.name = 'peringkat_' + (i + 1); root.add(m);
    const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set(m.position.x, 0.02, -0.12); root.add(n); return m; });
  for (let i = 0; i < 3; i++) { const a = textSprite('➜', { h: 0.035, bg: '#ffffff00', fg: '#1e88e5' }); a.position.set(-0.09 + i * 0.22, 0.03, -0.2); root.add(a); }
  const mix = [2, 0, 3, 1];
  const people = STAGES.map(([id, label, sc], i) => {
    const k = kid(id, { shirt: id === 'remaja' ? 0xffffff : id === 'dewasa' ? 0x90caf9 : 0xfdd835, pants: id === 'dewasa' ? 0x424242 : 0x1f4fa8 }); k.scale.setScalar(sc);
    if (id === 'bayi') { k.rotation.x = -1.1; k.position.y = 0.03; }
    k.position.set(-0.4 + mix[i] * 0.25, k.position.y, 0.25); const t = textSprite(label, { h: 0.028 }); t.position.set(-0.4 + mix[i] * 0.25, 0.02, 0.36); root.add(t); k.userData.tag = t; k.userData.y0 = k.position.y;
    root.add(home(k)); return k;
  });
  const shirt = emojiCard('baju_lama', '👕', 'Baju tahun lepas', 0.1, { border: '#43a047' }); shirt.position.set(0.55, 0, 0.3); shirt.visible = false; root.add(home(shirt));
  let told = false, next = 0, tried = false;
  const dr = dragger(S, () => [...(told ? people.filter((p, i) => p.userData.done === undefined) : []), ...(shirt.visible && !tried ? [shirt] : [])], {
    onDrop(o) {
      if (o === shirt) {
        const k = people.find(p => p.name === 'kanak_kanak');
        if (flat(o.position, k.position) > 0.12) return goHome(S, o);
        tried = true; o.visible = false; const sm = emojiSprite('👕', 0.06); sm.position.set(0, 0.13, 0.03); k.add(sm); sm.scale.set(0.04, 0.035, 1);
        S.evt('shirt', 'baju'); return S.info('👕 Baju tahun lepas <b>semakin ketat</b>! Badan semakin tinggi dan berat bertambah — kita membesar.');
      }
      const s = slots.find(s => flat(s.position, o.position) < 0.09);
      if (!s) return goHome(S, o);
      if (s !== slots[next] || o.name !== STAGES[next][0]) { S.info(`🤔 Peringkat ${next + 1}: siapakah yang ${next ? 'seterusnya' : 'paling awal'}?`); return goHome(S, o); }
      o.userData.done = next; next++; o.userData.tag.visible = false;
      moveTo(S, o, s.position.clone().setY(o.userData.y0)); S.evt('stage', o.name);
      if (next === 4) { shirt.visible = true; S.info('📈 Bayi → kanak-kanak → remaja → dewasa: <b>saiz, tinggi dan berat bertambah</b>. Cuba pakaikan baju tahun lepas pada kanak-kanak!'); }
      else S.info(`✅ ${STAGES[next - 1][1]}.`);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => (!told ? S.hitTest(x, y, [mum])?.name ?? null : null),
    tap(x, y) {
      if (told || S.hitTest(x, y, [mum]) !== mum) return;
      told = true; const h = emojiSprite('💕', 0.06); h.position.set(0, 0.32, 0); mum.add(h);
      S.evt('birth', 'ibu'); S.info('👶 Manusia <b>membiak secara melahirkan anak</b>. Sekarang susun peringkat tumbesaran manusia.');
    },
  };
}

// ------------------------------------------------------------ L2 Tumbesaran berbeza: same age, different growth
function heightChart(name = 'carta_tinggi') {
  const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#fff8e1'; g.fillRect(0, 0, 128, 512); g.fillStyle = '#333'; g.font = 'bold 22px system-ui';
  for (let cm = 0; cm <= 150; cm += 5) { const y = 500 - cm * 3.2; g.fillRect(0, y, cm % 10 ? 30 : 55, 2); if (cm % 10 === 0 && cm >= 100) g.fillText(cm, 62, y + 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return group(name, mesh(new THREE.PlaneGeometry(0.08, 0.32), new THREE.MeshBasicMaterial({ map: t }), 0, 0.16, 0));
}
const PUPILS = [['ali', 'Ali', { shirt: 0x66bb6a }, 1.18, 124, 24], ['mei', 'Mei', { shirt: 0xf06292, girl: true, pants: 0xf48fb1 }, 1.3, 130, 27]];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.85, play));
  const chart = heightChart(); chart.position.set(-0.35, 0, -0.3); root.add(chart);
  const sc = scale(); sc.scale.setScalar(1.4); sc.position.set(0.15, 0, -0.22); root.add(sc);
  for (const [o, t] of [[chart, 'Pembaris dinding (cm)'], [sc, 'Alat penimbang (kg)']]) { const l = textSprite(t, { h: 0.03 }); l.position.set(o.position.x, 0.38, o.position.z); root.add(l); }
  const kids = PUPILS.map(([id, label, o, s], i) => { const k = kid(id, o); k.scale.setScalar(s); k.position.set(-0.35 + i * 0.25, 0, 0.25); const t = textSprite(`${label} (8 tahun)`, { h: 0.028 }); t.position.set(0, 0.25, 0); k.add(t); root.add(home(k)); return k; });
  const tc = document.createElement('canvas'); tc.width = 360; tc.height = 170; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = { ali: {}, mei: {} };
  const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 360, 170); tg.fillStyle = '#2b2340'; tg.font = 'bold 24px system-ui'; ['Murid', 'Tinggi', 'Berat'].forEach((h, i) => tg.fillText(h, 14 + i * 115, 34));
    tg.font = '24px system-ui'; PUPILS.forEach(([id, label], r) => { const y = 84 + r * 50; tg.fillText(label, 14, y); if (res[id].t) tg.fillText(res[id].t + ' cm', 129, y); if (res[id].w) tg.fillText(res[id].w + ' kg', 244, y); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.3, 0.14), new THREE.MeshBasicMaterial({ map: tt }), 0.52, 0.1, 0.05); board.rotation.set(-0.4, -0.4, 0); board.userData.fx = true; root.add(board);
  let tall = 0, weigh = 0, chosen = false;
  const dr = dragger(S, () => kids, {
    onDrop(k, x, y) {
      const p = PUPILS.find(p => p[0] === k.name);
      if (nearScreen(S, chart, x, y, 0.1, 90) || flat(k.position, chart.position) < 0.15) {
        moveTo(S, k, chart.position.clone().add(new THREE.Vector3(0.07, 0, 0.04)));
        if (!res[k.name].t) { res[k.name].t = p[4]; tall++; S.evt('height', k.name); } draw();
        S.info(`📏 Tinggi ${p[1]}: <b>${p[4]} cm</b>.`); setTimeout(() => goHome(S, k), 1800); return;
      }
      if (nearScreen(S, sc, x, y, 0.12, 80) || flat(k.position, sc.position) < 0.15) {
        if (tall < 2) { S.info('📏 Ukur <b>tinggi</b> kedua-dua murid dahulu.'); return goHome(S, k); }
        moveTo(S, k, sc.position.clone().setY(0.13)); const n = sc.getObjectByName('jarum'); S.tween(0.8, t => n.rotation.z = -t * p[5] / 30 * Math.PI);
        if (!res[k.name].w) { res[k.name].w = p[5]; weigh++; S.evt('weight', k.name); } draw();
        S.info(`⚖️ Berat ${p[1]}: <b>${p[5]} kg</b>.` + (weigh === 2 ? ' Tuding murid yang <b>lebih tinggi</b>.' : '')); setTimeout(() => { goHome(S, k); n.rotation.z = 0; }, 1800); return;
      }
      goHome(S, k);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => (weigh === 2 ? S.hitTest(x, y, kids)?.name ?? null : null),
    tap(x, y) {
      if (weigh < 2 || chosen) return;
      const k = S.hitTest(x, y, kids); if (!k) return;
      if (k.name === 'ali') return S.info('🤔 Lihat jadual: Ali 124 cm, Mei 130 cm.');
      chosen = true; S.evt('compare', 'mei'); S.star(k.position.clone().setY(0.4));
      S.info('✅ Mei lebih tinggi dan lebih berat, walaupun mereka <b>sama umur</b>. Tumbesaran <b>berbeza antara individu</b>.');
    },
  };
}

// ------------------------------------------------------------ L3 Pewarisan: match Kugan's traits to relatives
const FAMILY = {
  datuk: { label: 'Datuk', skin: '#a1673f', iris: '#3e2723', hair: 'kerinting', hairColor: '#bdbdbd', glasses: true, tash: true },
  bapa: { label: 'Bapa', skin: '#7b4a2a', iris: '#1b1b1b', hair: 'lurus', hairColor: '#111' },
  ibu: { label: 'Ibu', skin: '#c68b5e', iris: '#8d5524', hair: 'lurus', hairColor: '#2d1a10' },
  kugan: { label: 'Kugan', skin: '#7b4a2a', iris: '#8d5524', hair: 'kerinting', hairColor: '#111' },
};
function portrait(id) {
  const f = FAMILY[id], c = document.createElement('canvas'); c.width = 256; c.height = 300; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(4, 4, 248, 292, 26); g.fill(); g.lineWidth = 8; g.strokeStyle = id === 'kugan' ? '#e0457b' : '#3a7bd5'; g.stroke();
  g.fillStyle = f.hairColor;
  if (f.hair === 'kerinting') for (let i = 0; i < 26; i++) { const a = Math.PI + i / 25 * Math.PI; g.beginPath(); g.arc(128 + Math.cos(a) * 82, 128 + Math.sin(a) * 82, 22, 0, 7); g.fill(); }
  else { g.beginPath(); g.ellipse(128, 118, 86, 78, 0, Math.PI, 0); g.fill(); g.fillRect(42, 110, 20, 60); g.fillRect(194, 110, 20, 60); }
  g.fillStyle = f.skin; g.beginPath(); g.ellipse(128, 140, 70, 82, 0, 0, 7); g.fill();
  if (f.hair === 'lurus') { g.fillStyle = f.hairColor; g.beginPath(); g.ellipse(128, 80, 72, 30, 0, Math.PI, 0); g.fill(); }
  for (const x of [100, 156]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, 135, 15, 11, 0, 0, 7); g.fill(); g.fillStyle = f.iris; g.beginPath(); g.arc(x, 135, 8, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(x, 135, 3.5, 0, 7); g.fill(); }
  if (f.glasses) { g.strokeStyle = '#333'; g.lineWidth = 4; for (const x of [100, 156]) { g.beginPath(); g.arc(x, 135, 22, 0, 7); g.stroke(); } }
  if (f.tash) { g.fillStyle = '#9e9e9e'; g.beginPath(); g.ellipse(128, 182, 30, 8, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#5d2e1a'; g.lineWidth = 5; g.beginPath(); g.arc(128, 188, 20, 0.2, Math.PI - 0.2); g.stroke();
  g.fillStyle = '#2b2340'; g.font = 'bold 34px system-ui'; g.textAlign = 'center'; g.fillText(f.label, 128, 280);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const card = mesh(new THREE.PlaneGeometry(0.17, 0.2), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }), 0, 0.105, 0); card.rotation.x = -0.35;
  return group('potret_' + id, card, mesh(new THREE.BoxGeometry(0.1, 0.01, 0.03), M(0x8a8a8a), 0, 0.005, 0));
}
const TRAITS = [['rambut', 'Rambut kerinting', f => f.hair === 'kerinting'], ['iris', 'Warna iris mata perang', f => f.iris === FAMILY.kugan.iris], ['kulit', 'Warna kulit', f => f.skin === FAMILY.kugan.skin]];
function L3(S, play) {
  const root = group('L3', table(1.5, 0.85, play));
  const rel = ['datuk', 'bapa', 'ibu'].map((id, i) => { const p = portrait(id); p.position.set(-0.45 + i * 0.3, 0, -0.2); p.userData.id = id; root.add(p); return p; });
  const ku = portrait('kugan'); ku.scale.setScalar(1.2); ku.position.set(0.5, 0, 0.0); root.add(ku);
  const kl = textSprite('Ciri Kugan', { h: 0.03 }); kl.position.set(0.5, 0.3, 0.0); root.add(kl);
  const cards = TRAITS.map(([id, label], i) => { const c = emojiCard('ciri_' + id, '', label, 0.09, { border: '#e0457b' }); c.userData.id = id; c.position.set(-0.45 + i * 0.3, 0, 0.27); root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c, x, y) {
      const p = rel.find(p => nearScreen(S, p, x, y, 0.1, 75) || flat(p.position, c.position) < 0.12);
      if (!p) return goHome(S, c);
      const tr = TRAITS.find(t => t[0] === c.userData.id), f = FAMILY[p.userData.id];
      if (!tr[2](f)) { S.info(`🤔 Bandingkan ${tr[1].toLowerCase()} Kugan dengan ${f.label.toLowerCase()} sekali lagi.`); return goHome(S, c); }
      done.add(c); moveTo(S, c, p.position.clone().add(new THREE.Vector3(0, 0, 0.12)));
      S.evt('inherit', c.userData.id); S.info(`✅ ${tr[1]} Kugan diwarisi daripada <b>${f.label.toLowerCase()}</b>.` + (c.userData.id === 'rambut' ? ' Jenis rambut Kugan sama seperti rambut datuknya!' : ''));
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Manusia membiak dan membesar', sp: 'SP 3.1.1 · 3.1.2', make: L1 },
  { id: 'L2', title: 'Tumbesaran berbeza', sp: 'SP 3.1.3', make: L2 },
  { id: 'L3', title: 'Pewarisan', sp: 'SP 3.1.4 – 3.1.6', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia — Saya Membesar',
  intro: '<b>Sains Tahun 2 · Unit 3.</b> Membiak, membesar dan mewarisi ciri! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
