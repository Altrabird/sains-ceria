// Sains Tahun 3 · Unit 10 Mesin: Takal (SP 10.1.1 – 10.1.5) — parts of a fixed pulley, pull down to lift up,
// uses of pulleys, design and test a pulley model.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, diagramBoard, labelPins, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const ROPE = 0xc9a227;
// a fixed pulley on a stand: wheel at height H; load hangs on the left, the pull handle on the right.
// setPull(d): rope pulled down by d metres -> load rises d, wheel turns. Returns the group with userData helpers.
function pulley(name, { H = 0.34, r = 0.045, load = null, maxPull = 0.2 } = {}) {
  const g = group(name);
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.015, 0.06), M(0x78909c), 0, H + 0.08, 0), mesh(new THREE.BoxGeometry(0.015, 0.075, 0.015), M(0x90a4ae), 0, H + 0.04, 0));
  const wheel = group('roda', mesh(new THREE.CylinderGeometry(r, r, 0.02, 32), M(0x1e88e5, { metalness: 0.3 })).rotateX(Math.PI / 2), mesh(new THREE.TorusGeometry(r, 0.005, 6, 32), M(0x0d47a1)));
  for (let i = 0; i < 4; i++) wheel.add(mesh(new THREE.BoxGeometry(0.004, r * 1.6, 0.022), M(0x90caf9)).rotateZ(i * Math.PI / 4));
  wheel.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 12), M(0x37474f)).rotateX(Math.PI / 2));  // gandar
  wheel.position.y = H; g.add(wheel);
  const ropeL = mesh(new THREE.CylinderGeometry(0.003, 0.003, 1, 8), M(ROPE)), ropeR = ropeL.clone(), top = mesh(new THREE.TorusGeometry(r + 0.003, 0.003, 6, 24, Math.PI), M(ROPE));
  top.position.y = H; ropeL.userData.fx = ropeR.userData.fx = top.userData.fx = true; g.add(ropeL, ropeR, top);
  const bob = load || group('beban', mesh(new THREE.BoxGeometry(0.06, 0.05, 0.05), M(0x616161, { metalness: 0.4 }), 0, -0.025, 0), mesh(new THREE.TorusGeometry(0.01, 0.003, 6, 12), M(0x424242), 0, 0.003, 0));
  g.add(bob);
  const handle = group('pemegang_tali', mesh(new THREE.SphereGeometry(0.018, 14, 10), M(0xef5350)));
  g.add(handle);
  const yLoad0 = 0.06, yHand0 = H - 0.12;
  g.userData.pull = 0;
  g.userData.setPull = d => {
    d = THREE.MathUtils.clamp(d, 0, maxPull); g.userData.pull = d;
    const yl = yLoad0 + d, yh = yHand0 - d;
    bob.position.set(-r, yl, 0); handle.position.set(r, yh, 0);
    ropeL.position.set(-r, (yl + H) / 2, 0); ropeL.scale.y = H - yl; ropeR.position.set(r, (yh + H) / 2, 0); ropeR.scale.y = H - yh;
    wheel.rotation.z = -d / r;
  };
  g.userData.setPull(0); g.userData.handle = handle; g.userData.load = bob; g.userData.max = maxPull;
  return g;
}
// vertical rope drag for one or more pulleys: grab the red handle, move the pointer down to pull
function ropeDrag(S, pulleys, onPull) {
  let held = null, y0 = 0, p0 = 0;
  const planeY = (p, x, y) => { const z = p.getWorldPosition(new THREE.Vector3()).z, hit = S.rayAt(x, y).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -z), new THREE.Vector3()); return hit ? hit.y : null; };
  return {
    pick(x, y) {
      const h = pulleys.map(p => p.userData.handle).find(h => S.hitTest(x, y, [h]) || S.nearest(x, y, [h], 45));
      if (!h) return false; held = pulleys.find(p => p.userData.handle === h); y0 = planeY(held, x, y); p0 = held.userData.pull; return y0 !== null;
    },
    drag(x, y) { if (!held) return; const yy = planeY(held, x, y); if (yy === null) return; held.userData.setPull(p0 + (y0 - yy) / held.scale.y); onPull?.(held); },
    drop() { held = null; },
    hit: (x, y) => (pulleys.some(p => S.nearest(x, y, [p.userData.handle], 45)) ? 'tali' : null),
  };
}

// ------------------------------------------------------------ L1 Bahagian takal tetap (label a drawing)
function drawPulley(g, W, H) {
  g.fillStyle = '#90a4ae'; g.fillRect(W * 0.2, H * 0.04, W * 0.6, H * 0.05); g.fillRect(W * 0.47, H * 0.09, W * 0.06, H * 0.14);
  g.fillStyle = '#1e88e5'; g.beginPath(); g.arc(W * 0.5, H * 0.33, W * 0.17, 0, 7); g.fill();
  g.strokeStyle = '#0d47a1'; g.lineWidth = 10; g.beginPath(); g.arc(W * 0.5, H * 0.33, W * 0.17, 0, 7); g.stroke();
  g.fillStyle = '#37474f'; g.beginPath(); g.arc(W * 0.5, H * 0.33, W * 0.03, 0, 7); g.fill();
  g.strokeStyle = '#c9a227'; g.lineWidth = 9; g.beginPath(); g.moveTo(W * 0.33, H * 0.72); g.lineTo(W * 0.33, H * 0.33); g.arc(W * 0.5, H * 0.33, W * 0.17, Math.PI, 0); g.lineTo(W * 0.67, H * 0.9); g.stroke();
  g.fillStyle = '#616161'; g.fillRect(W * 0.24, H * 0.72, W * 0.18, H * 0.14);
}
function L1(S, play) {
  const root = group('L1', table(1.3, 0.85, play));
  const d = diagramBoard('rajah_takal', { w: 0.36, h: 0.45, draw: drawPulley, pins: { alur: [0.33, 0.24], gandar: [0.5, 0.33], roda: [0.6, 0.42], tali: [0.67, 0.72], beban: [0.33, 0.79] }, tilt: 0.9 });
  d.position.set(0, 0, -0.18); root.add(d);
  const dr = labelPins(S, root, d, [['alur', 'Alur'], ['gandar', 'Gandar'], ['roda', 'Roda'], ['tali', 'Tali'], ['beban', 'Beban']], {
    onLabel: id => { S.evt('label', id); S.info({ alur: '✅ <b>Alur</b> — tempat tali melalui roda.', gandar: '✅ <b>Gandar</b> — paksi roda berputar.', roda: '✅ <b>Roda</b> beralur.', tali: '✅ <b>Tali</b> ditarik untuk mengangkat beban.', beban: '✅ <b>Beban</b> — objek yang diangkat.' }[id]); },
  });
  return { root, view: { w: 1.1, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L2 Cara takal tetap berfungsi
function L2(S, play) {
  const root = group('L2', table(1.2, 0.8, play));
  const P = pulley('takal', { maxPull: 0.2 }); P.scale.setScalar(1.2); P.position.set(-0.05, 0, -0.12); root.add(P);
  const shelf = mesh(new THREE.BoxGeometry(0.12, 0.012, 0.08), M(0x8d6e63), -0.2, 0.33, -0.12); root.add(shelf);
  const sl = textSprite('Rak tinggi', { h: 0.026 }); sl.position.set(-0.2, 0.36, -0.12); root.add(sl);
  const arrows = [textSprite('⬇ Tarik tali', { h: 0.03, bg: '#ffcdd2ee' }), textSprite('⬆ Beban naik', { h: 0.03, bg: '#c8e6c9ee' })];
  arrows[0].position.set(0.15, 0.28, -0.1); arrows[1].position.set(-0.24, 0.2, -0.1); arrows.forEach(a => root.add(a));
  let done = false;
  const rd = ropeDrag(S, [P], p => {
    if (!done && p.userData.pull >= p.userData.max - 0.005) {
      done = true; S.evt('lift', 'beban'); S.star(new THREE.Vector3(-0.2, 0.5, -0.12));
      S.info('✅ Apabila tali <b>ditarik ke bawah</b>, beban <b>diangkat ke atas</b> melalui takal tetap. Takal memudahkan kerja mengangkat beban.', 9);
    }
  });
  return { root, view: { w: 0.85, d: 1.15 }, ...rd };
}

// ------------------------------------------------------------ L3 Kegunaan takal
function L3(S, play) {
  const root = group('L3', table(1.6, 0.9, play));
  const flag = group('bendera', mesh(new THREE.BoxGeometry(0.06, 0.04, 0.003), M(0xd32f2f), 0, -0.02, 0)); flag.children[0].geometry.translate(0.03, 0, 0);
  const bucket = group('baldi', mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.035, 14), M(0x546e7a), 0, -0.02, 0));
  const crate = group('kontena', mesh(new THREE.BoxGeometry(0.07, 0.035, 0.035), M(0xef6c00), 0, -0.02, 0));
  const net = group('pukat', mesh(new THREE.SphereGeometry(0.03, 10, 8), M(0x26a69a, { wireframe: true }), 0, -0.02, 0));
  const USES = [['bendera', flag, 'Menaikkan bendera'], ['perigi', bucket, 'Menimba air dari perigi'], ['pukat', net, 'Menarik pukat'], ['pelabuhan', crate, 'Memunggah kontena di pelabuhan']];
  const ps = USES.map(([id, load, label], i) => { const p = pulley('takal_' + id, { load, maxPull: 0.2 }); p.position.set(-0.55 + i * 0.37, 0, -0.18); root.add(p); const t = textSprite(label, { h: 0.034 }); t.position.set(p.position.x, 0.03, 0.02); root.add(t); p.userData.id = id; return p; });
  ps[1].add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 18, 1, true), M(0x9e9e9e, { side: THREE.DoubleSide }), -0.045, 0.03, 0));  // well
  const done = new Set();
  const rd = ropeDrag(S, ps, p => {
    if (done.has(p.userData.id) || p.userData.pull < p.userData.max - 0.005) return;
    done.add(p.userData.id); S.evt('use', p.userData.id); S.info(`✅ Takal digunakan untuk <b>${USES.find(u => u[0] === p.userData.id)[2].toLowerCase()}</b>.`);
  });
  return { root, view: { w: 1.6, d: 1.3 }, ...rd };
}

// ------------------------------------------------------------ L4 Reka cipta model takal: order the design steps, then test
const DESIGN = [['masalah', '❓', 'Kenal pasti masalah'], ['idea', '💡', 'Jana idea'], ['lakar', '✏️', 'Lakar idea'], ['bahan', '🧰', 'Sediakan alat dan bahan'], ['bina', '🔨', 'Bina model takal']];
function L4(S, play) {
  const root = group('L4', table(1.6, 0.9, play));
  const slots = DESIGN.map((d, i) => { const m = mesh(new THREE.BoxGeometry(0.2, 0.004, 0.11), M(0xffd84d, { transparent: true, opacity: 0.6 }), -0.56 + i * 0.28, 0.002, -0.32); m.name = 'langkah_' + (i + 1); root.add(m); const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set(m.position.x - 0.12, 0.02, -0.32); root.add(n); return m; });
  const mix = [3, 0, 4, 2, 1];
  const cards = DESIGN.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.12, { border: '#7e57c2' }); c.position.set(-0.56 + mix[i] * 0.28, 0, 0.32); root.add(home(c)); return c; });
  const P = pulley('model_takal', { maxPull: 0.18 }); P.scale.setScalar(0.9); P.position.set(0.3, 0, -0.05); P.visible = false; root.add(P);
  let next = 0, tested = false;
  const order = dragger(S, () => cards.filter(c => c.userData.at === undefined), {
    onDrop(c) {
      const s = slots.find(s => flat(s.position, c.position) < 0.12);
      if (!s) return goHome(S, c);
      if (s !== slots[next] || c.name !== DESIGN[next][0]) { S.info(`🤔 Langkah ${next + 1}: ${next ? 'apakah seterusnya?' : 'mulakan dengan memahami masalah.'}`); return goHome(S, c); }
      c.userData.at = next++; moveTo(S, c, s.position.clone()); S.evt('design', c.name);
      if (next === 5) { P.visible = true; S.info('🏗️ Model takal siap! <b>Gantung dan uji</b>: tarik tali ke bawah.'); }
    },
  });
  const rope = ropeDrag(S, [P], p => { if (!tested && p.userData.pull >= p.userData.max - 0.005) { tested = true; S.evt('test', 'model'); S.info('✅ Model takal berfungsi! Jenis takal: takal tetap, takal bergerak dan takal bergabung.', 9); } });
  let mode = null;
  return {
    root, view: { w: 1.6, d: 1.2 },
    pick(x, y) { mode = P.visible && rope.pick(x, y) ? rope : order.pick(x, y) ? order : null; return !!mode; },
    drag(x, y) { mode?.drag(x, y); }, drop(x, y) { mode?.drop(x, y); mode = null; },
    hit: (x, y) => (P.visible ? rope.hit(x, y) : null),
  };
}

const LEVELS = [
  { id: 'L1', title: 'Bahagian takal tetap', sp: 'SP 10.1.1', make: L1 },
  { id: 'L2', title: 'Cara takal berfungsi', sp: 'SP 10.1.2', make: L2 },
  { id: 'L3', title: 'Kegunaan takal', sp: 'SP 10.1.3', make: L3 },
  { id: 'L4', title: 'Reka cipta model takal', sp: 'SP 10.1.4 · 10.1.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Mesin — Takal',
  intro: '<b>Sains Tahun 3 · Unit 10.</b> Angkat beban dengan takal! Guna <b>tangan</b> di depan kamera: ✌️ dua jari = pegang tali dan tarik ke bawah · ☝️ tuding &amp; tahan = ketik · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
