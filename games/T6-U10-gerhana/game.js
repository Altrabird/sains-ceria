// Sains Tahun 6 · Unit 10 Gerhana (SP 10.1.1 – 10.1.4) — eclipse simulator (drag the Moon: lunar and solar
// eclipse), positions and phases, umbra and penumbra, safe viewing.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, diagramBoard, labelPins, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Simulasi gerhana
function L1(S, play) {
  const root = group('L1', table(1.7, 1.0, play));
  const R = 0.28, C = new THREE.Vector3(0.15, 0.07, -0.05);
  const sun = mesh(new THREE.SphereGeometry(0.11, 24, 16), M(0xffd54f, { emissive: 0xffb300, emissiveIntensity: 1 }), -0.68, 0.12, -0.05); root.add(sun);
  const st = textSprite('☀️ Matahari', { h: 0.03 }); st.position.set(-0.68, 0.28, -0.05); root.add(st);
  const earth = group('bumi', mesh(new THREE.SphereGeometry(0.07, 24, 16), M(0x1e88e5)), mesh(new THREE.SphereGeometry(0.0705, 12, 8, 0, 2, 0.6, 1), M(0x43a047))); earth.position.copy(C); root.add(earth);
  const et = textSprite('🌍 Bumi', { h: 0.028 }); et.position.set(C.x, 0.19, C.z); root.add(et);
  // Earth's shadow cone (behind Earth, away from the Sun)
  const cone = mesh(new THREE.ConeGeometry(0.07, 0.45, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  cone.rotation.z = -Math.PI / 2; cone.position.set(C.x + 0.225, C.y, C.z); cone.userData.fx = true; root.add(cone);
  const ring = mesh(new THREE.TorusGeometry(R, 0.002, 6, 80), M(0x90a4ae)); ring.rotation.x = Math.PI / 2; ring.position.copy(C); ring.userData.fx = true; root.add(ring);
  const P = a => C.clone().add(new THREE.Vector3(Math.cos(a) * R, 0, -Math.sin(a) * R));
  for (const [n, a] of [['titik_purnama', 0], ['titik_baharu', Math.PI]]) { const d = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 12), M(0xffd84d)); d.position.copy(P(a)).setY(0.002); d.name = n; root.add(d); }
  const moonMat = M(0xcfd8dc); const moon = group('bulan', mesh(new THREE.SphereGeometry(0.03, 20, 14), moonMat)); root.add(moon);
  const spot = mesh(new THREE.CircleGeometry(0.025, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.75 })); spot.userData.fx = true; spot.visible = false; earth.add(spot);
  const mshadow = mesh(new THREE.ConeGeometry(0.03, R - 0.06, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); mshadow.rotation.z = -Math.PI / 2; mshadow.userData.fx = true; mshadow.visible = false; root.add(mshadow);
  let a = Math.PI / 2; const seen = new Set();
  const place = () => {
    moon.position.copy(P(a)); const lunar = Math.cos(a) > 0.985, solar = Math.cos(a) < -0.985;
    moonMat.color.setHex(lunar ? 0xb5532c : 0xcfd8dc); moonMat.emissive?.setHex(lunar ? 0x3e1408 : 0x000000);
    spot.visible = solar; spot.position.set(-0.071, 0, 0); spot.rotation.y = -Math.PI / 2;
    mshadow.visible = solar; mshadow.position.set(C.x - R / 2 - 0.0, C.y, C.z);
    return lunar ? 'lunar' : solar ? 'solar' : null;
  };
  place();
  const dr = dragger(S, () => [moon], {
    onDrag(o) { const d = o.position.clone().sub(C); a = Math.atan2(-d.z, d.x); place(); },
    onDrop() { const k = place(); moon.position.y = C.y;
      if (k === 'lunar') { S.info('🌕 <b>Gerhana Bulan</b>: Matahari — Bumi — Bulan dalam satu garis lurus. Bumi menghalang cahaya matahari; Bulan masuk ke bayang-bayang Bumi dan kelihatan perang kemerahan. Berlaku semasa fasa bulan purnama.', 10); }
      else if (k === 'solar') { S.info('🌑 <b>Gerhana Matahari</b>: Matahari — Bulan — Bumi dalam satu garis lurus. Bayang-bayang Bulan jatuh pada Bumi — siang menjadi gelap. Berlaku semasa fasa bulan baharu.', 10); }
      else S.info('🌙 Tiada gerhana. Matahari, Bumi dan Bulan tidak dalam satu garis lurus.');
      if (k && !seen.has(k)) { seen.add(k); S.evt('eclipse', k); }
    },
  });
  return { root, view: { w: 1.7, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L2 Kedudukan dan fasa
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['bulan_susun', '🌕', 'Gerhana Bulan: susunan', 'Matahari — Bumi — Bulan'], ['matahari_susun', '🌑', 'Gerhana Matahari: susunan', 'Matahari — Bulan — Bumi'],
    ['bulan_fasa', '🌕', 'Gerhana Bulan: fasa', 'Bulan purnama'], ['matahari_fasa', '🌑', 'Gerhana Matahari: fasa', 'Bulan baharu (siang)'], ['orbit', '🔄', 'Bukan setiap bulan berlaku gerhana', 'Orbit Bulan condong']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f}</b>.` })), { type: 'position', gap: 0.34 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Umbra dan penumbra
function drawShadow(g, W, H) {
  g.fillStyle = '#0d1b3e'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#ffd54f'; g.lineWidth = 5; for (let i = 0; i < 5; i++) { const y = H * (0.3 + i * 0.1); g.beginPath(); g.moveTo(W * 0.02, y); g.lineTo(W * 0.25, y); g.stroke(); g.beginPath(); g.moveTo(W * 0.22, y - 8); g.lineTo(W * 0.25, y); g.lineTo(W * 0.22, y + 8); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(W * 0.4, H * 0.32); g.lineTo(W * 0.98, H * 0.12); g.lineTo(W * 0.98, H * 0.88); g.lineTo(W * 0.4, H * 0.68); g.fill();
  g.fillStyle = '#000'; g.beginPath(); g.moveTo(W * 0.4, H * 0.36); g.lineTo(W * 0.98, H * 0.43); g.lineTo(W * 0.98, H * 0.57); g.lineTo(W * 0.4, H * 0.64); g.fill();
  g.fillStyle = '#9e9e9e'; g.beginPath(); g.arc(W * 0.38, H * 0.5, H * 0.17, 0, 7); g.fill();
}
function L3(S, play) {
  const root = group('L3', table(1.5, 0.95, play));
  const d = diagramBoard('rajah_bayang', { w: 0.8, h: 0.4, draw: drawShadow, tilt: 0.8, pins: { umbra: [0.8, 0.5], penumbra: [0.8, 0.22], objek_legap: [0.38, 0.5], cahaya: [0.12, 0.3] } }); d.position.set(0, 0, -0.2); root.add(d);
  const dr = labelPins(S, root, d, [['umbra', 'Umbra (sangat gelap)'], ['penumbra', 'Penumbra (separa gelap)'], ['objek_legap', 'Objek legap (Bulan/Bumi)'], ['cahaya', 'Cahaya matahari']], {
    row: 0.3, size: 0.09, onLabel: id => { S.evt('shadow', id); S.info({ umbra: '✅ <b>Umbra</b> — bahagian bayang-bayang yang sangat gelap.', penumbra: '✅ <b>Penumbra</b> — bahagian bayang-bayang yang separa gelap.', objek_legap: '✅ Cahaya tidak menembusi objek <b>legap</b>.', cahaya: '✅ Cahaya bergerak <b>lurus</b>.' }[id]); },
  });
  return { root, view: { w: 1.5, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L4 Pemerhatian selamat
function L4(S, play) {
  const root = group('L4', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'safe', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'selamat', label: '✅ Cara selamat', color: 0xc8e6c9, x: -0.38, z: -0.18, w: 0.7 }, { id: 'bahaya', label: '⛔ Berbahaya kepada mata', color: 0xffcdd2, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['cermin', '🥽', 'Cermin mata khas gerhana', 'selamat'], ['penuras', '🔭', 'Teleskop dengan penuras sesuai', 'selamat'], ['lubang', '📦', 'Kotak lubang jarum', 'selamat'], ['tv', '📺', 'Tonton siaran langsung', 'selamat'],
      ['kasar', '👀', 'Lihat terus dengan mata kasar', 'bahaya'], ['hitam', '🕶️', 'Cermin mata hitam biasa', 'bahaya'], ['teropong', '🔍', 'Teropong tanpa penuras', 'bahaya'], ['air', '💧', 'Lihat pantulan dalam air', 'bahaya']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah cahaya Matahari yang terang masih boleh sampai terus ke mata?' })),
    ok: (it, z) => z.id === 'selamat' ? `✅ ${it.label} — selamat.` : `⛔ ${it.label} — boleh merosakkan mata!`,
    onDone: () => setTimeout(() => S.info('🌒 Semasa gerhana Matahari penuh, persekitaran gelap, suhu menurun dan haiwan kembali ke sarang. Jangan lihat Matahari dengan mata kasar.', 10), 2500),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Simulasi gerhana', sp: 'SP 10.1.1 · 10.1.2 · 10.1.4', make: L1 },
  { id: 'L2', title: 'Kedudukan dan fasa', sp: 'SP 10.1.1 · 10.1.2', make: L2 },
  { id: 'L3', title: 'Umbra dan penumbra', sp: 'SP 10.1.3', make: L3 },
  { id: 'L4', title: 'Pemerhatian selamat', sp: 'SP 10.1.2 · 10.1.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Gerhana',
  intro: '<b>Sains Tahun 6 · Unit 10.</b> Gerhana Bulan dan gerhana Matahari! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
