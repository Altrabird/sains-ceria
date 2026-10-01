// Sains Tahun 2 · Unit 10 Teknologi: Set binaan (SP 10.1.1 – 10.1.6) — components, follow the manual, free build, take apart + store.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const U = 0.04;  // one stud pitch
const COL = { merah: 0xe53935, hijau: 0x43a047, biru: 0x1e88e5, kuning: 0xfdd835 };
// a toy brick; kind: kiub (2x2), panjang (2x4), prisma (wedge), silinder (round 1x1 tall)
function brick(name, kind, color) {
  const m = M(COL[color], { roughness: 0.35 }), g = group(name);
  if (kind === 'kiub' || kind === 'panjang') {
    const w = kind === 'panjang' ? 4 : 2; g.add(mesh(new THREE.BoxGeometry(w * U, U * 0.9, 2 * U), m, 0, U * 0.45, 0));
    for (let i = 0; i < w; i++) for (let j = 0; j < 2; j++) g.add(mesh(new THREE.CylinderGeometry(U * 0.3, U * 0.3, U * 0.2, 12), m, (i - (w - 1) / 2) * U, U, (j - 0.5) * U));
  }
  if (kind === 'prisma') g.add(mesh(new THREE.CylinderGeometry(U * 1.15, U * 1.15, 2 * U, 3).rotateZ(Math.PI / 2).rotateX(Math.PI / 2), m, 0, U * 0.55, 0));
  if (kind === 'silinder') g.add(mesh(new THREE.CylinderGeometry(U * 0.45, U * 0.45, U * 1.6, 16), m, 0, U * 0.8, 0), mesh(new THREE.CylinderGeometry(U * 0.3, U * 0.3, U * 0.2, 12), m, 0, U * 1.7, 0));
  g.userData = { kind, color }; return g;
}
const KIND = { kiub: 'Kiub', prisma: 'Prisma', silinder: 'Silinder', panjang: 'Bongkah panjang' };

// helicopter sub-assemblies (built from bricks), origin = attach point on the body
function heliPart(id, name = id) {
  const g = group(name);
  if (id === 'kepala') { const p = brick('', 'prisma', 'merah'); p.rotation.y = Math.PI / 2; g.add(p); }
  if (id === 'badan') { g.add(brick('', 'panjang', 'hijau')); const y = brick('', 'panjang', 'kuning'); y.position.y = -U * 0.0; y.scale.y = 0.5; g.add(y); const s = brick('', 'silinder', 'kuning'); s.position.y = U; g.add(s); }
  if (id === 'ekor') { const a = brick('', 'panjang', 'biru'); a.scale.set(1.2, 0.8, 0.6); g.add(a); const f = brick('', 'kiub', 'biru'); f.position.set(-U * 2, U * 0.7, 0); g.add(f); }
  if (id === 'kipas') { for (let i = 0; i < 3; i++) { const b = brick('', 'panjang', 'merah'); b.scale.set(1, 0.4, 0.5); b.geometry; b.children.forEach(c => c.position.x += U * 2); const p = group('', b); p.rotation.y = i * Math.PI * 2 / 3; g.add(p); } g.add(mesh(new THREE.CylinderGeometry(U * 0.7, U * 0.7, U * 0.5, 16), M(COL.kuning), 0, U * 0.2, 0)); }
  return g;
}
const SLOTS = { kepala: [U * 3.2, 0, 0], badan: [0, 0, 0], ekor: [-U * 3.4, U * 0.2, 0], kipas: [0, U * 2.2, 0] };
const ORDER = ['kepala', 'badan', 'ekor', 'kipas'];

// ------------------------------------------------------------ L1 Kenali komponen: collect exactly what the manual lists
function L1(S, play) {
  const root = group('L1', table(1.5, 0.9, play));
  const manual = document.createElement('canvas'); manual.width = 360; manual.height = 260; const mg = manual.getContext('2d');
  mg.fillStyle = '#fff'; mg.fillRect(0, 0, 360, 260); mg.fillStyle = '#2b2340'; mg.font = 'bold 28px system-ui'; mg.fillText('📘 Manual bergambar', 14, 38); mg.font = '26px system-ui';
  [['4 × Kiub hijau', '#43a047'], ['2 × Prisma merah', '#e53935'], ['1 × Silinder kuning', '#c9a400']].forEach(([t, c], i) => { mg.fillStyle = c; mg.fillRect(18, 74 + i * 60, 30, 30); mg.fillStyle = '#2b2340'; mg.fillText(t, 62, 98 + i * 60); });
  const mt = new THREE.CanvasTexture(manual); mt.colorSpace = THREE.SRGBColorSpace;
  const page = mesh(new THREE.PlaneGeometry(0.36, 0.26), new THREE.MeshBasicMaterial({ map: mt }), -0.5, 0.004, -0.18); page.rotation.x = -Math.PI / 2; page.userData.fx = true; root.add(page);
  const tray = group('dulang', mesh(new THREE.BoxGeometry(0.34, 0.012, 0.22), M(0xeceff1), 0, 0.006, 0)); tray.position.set(-0.08, 0, -0.18); root.add(tray);
  const tl = textSprite('Dulang komponen', { h: 0.028 }); tl.position.set(-0.08, 0.03, -0.32); root.add(tl);
  const WANT = { 'kiub_hijau': 4, 'prisma_merah': 2, 'silinder_kuning': 1 };
  const pile = [['kiub', 'hijau'], ['kiub', 'hijau'], ['kiub', 'hijau'], ['kiub', 'hijau'], ['kiub', 'merah'], ['prisma', 'merah'], ['prisma', 'merah'], ['prisma', 'biru'], ['silinder', 'kuning'], ['silinder', 'hijau'], ['kiub', 'biru']]
    .map(([k, c], i) => { const b = brick(`blok${i}_${k}_${c}`, k, c); b.position.set(0.2 + (i % 4) * 0.12, 0, -0.25 + Math.floor(i / 4) * 0.17); b.rotation.y = i * 0.7; root.add(home(b)); return b; });
  const got = {}; let n = 0;
  const dr = dragger(S, () => pile.filter(b => !b.userData.inTray), {
    onDrop(b) {
      if (Math.abs(b.position.x - tray.position.x) > 0.19 || Math.abs(b.position.z - tray.position.z) > 0.13) return goHome(S, b);
      const key = `${b.userData.kind}_${b.userData.color}`;
      if (!WANT[key]) { S.info(`🤔 Manual tidak memerlukan ${KIND[b.userData.kind].toLowerCase()} ${b.userData.color}. Kenal pasti <b>bentuk</b> dan <b>warna</b>.`); return goHome(S, b); }
      if ((got[key] || 0) >= WANT[key]) { S.info(`🔢 Sudah cukup ${KIND[b.userData.kind].toLowerCase()} ${b.userData.color}. Kira <b>bilangan</b> dalam manual.`); return goHome(S, b); }
      got[key] = (got[key] || 0) + 1; b.userData.inTray = true; n++;
      moveTo(S, b, tray.position.clone().add(new THREE.Vector3(-0.13 + (n - 1) % 4 * 0.085, 0.012, -0.05 + Math.floor((n - 1) / 4) * 0.1)));
      S.evt('collect', key + '_' + got[key]); S.info(`✅ ${KIND[b.userData.kind]} ${b.userData.color} (${got[key]}/${WANT[key]}).`);
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L2 Pasang mengikut manual: helicopter
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const heli = group('helikopter'); heli.position.set(0.0, 0.0, -0.15); heli.scale.setScalar(1.3); root.add(heli);
  const ghosts = ORDER.map(id => { const g = heliPart(id, 'slot_' + id); g.traverse(o => { if (o.material) { o.material = o.material.clone(); Object.assign(o.material, { transparent: true, opacity: 0.2, depthWrite: false, color: new THREE.Color(0x90a4ae) }); } }); g.position.set(...SLOTS[id]); heli.add(g); return g; });
  const tl = textSprite('Manual: kepala → badan → ekor → kipas', { h: 0.03 }); tl.position.set(0, 0.3, -0.15); root.add(tl);
  const mix = [2, 0, 3, 1];
  const parts = ORDER.map((id, i) => { const p = heliPart(id); p.position.set(-0.45 + mix[i] * 0.3, 0, 0.27); p.userData.carryY = 0.05; const t = textSprite(id[0].toUpperCase() + id.slice(1), { h: 0.028 }); t.position.set(0, 0.12, 0.04); p.add(t); p.userData.tag = t; root.add(home(p)); return p; });
  let next = 0, flying = false, spin = 0;
  const dr = dragger(S, () => parts.filter(p => !p.userData.done), {
    onDrop(p, x, y) {
      const gh = S.closest(ghosts, x, y, g => g.visible && nearScreen(S, g, x, y, U, 70));
      if (!gh) return goHome(S, p);
      if (gh.name !== 'slot_' + ORDER[next] || p.name !== ORDER[next]) { S.info(`📘 Ikut manual: langkah ${next + 1} ialah <b>${ORDER[next]}</b>.`); return goHome(S, p); }
      p.userData.done = true; p.userData.tag.visible = false; gh.visible = false; heli.attach(p); moveTo(S, p, gh.position.clone()); p.rotation.set(0, 0, 0); p.scale.setScalar(1);
      next++; S.evt('assemble', p.name);
      S.info(next < 4 ? `✅ ${p.name[0].toUpperCase() + p.name.slice(1)} dipasang.` : '🚁 Model helikopter siap! Tuding helikopter untuk menerbangkannya.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (next === 4 && !flying ? S.hitTest(x, y, [heli])?.name ?? null : null),
    tap(x, y) {
      if (next < 4 || flying || S.hitTest(x, y, [heli]) !== heli) return;
      flying = true; S.evt('fly', 'helikopter'); S.tween(3, k => heli.position.y = Math.sin(k * Math.PI) * 0.2);
      S.info('🚁 Manual bergambar ialah panduan memasang set binaan dengan <b>betul dan teratur</b>.');
    },
    update(dt) { if (flying) { spin += dt * 20; parts.find(p => p.name === 'kipas').rotation.y = spin; } },
  };
}

// ------------------------------------------------------------ L3 Cipta binaan baharu: snap-to-grid free build
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const plate = group('papan_asas', mesh(new THREE.BoxGeometry(12 * U, 0.01, 8 * U), M(0x66bb6a), 0, 0.005, 0)); plate.position.set(-0.1, 0, -0.1); root.add(plate);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) plate.add(mesh(new THREE.CylinderGeometry(U * 0.3, U * 0.3, U * 0.15, 8), M(0x5aa75e), (i - 5.5) * U, 0.012, (j - 3.5) * U));
  const SUPPLY = [['kiub', 'merah'], ['kiub', 'biru'], ['panjang', 'kuning'], ['panjang', 'hijau'], ['prisma', 'merah'], ['silinder', 'kuning']];
  const bin = []; let made = 0; const placed = [];
  function spawn(i) { const [k, c] = SUPPLY[i]; const b = brick(`bekal_${i}`, k, c); b.position.set(0.45 + (i % 2) * 0.12, 0, -0.25 + Math.floor(i / 2) * 0.17); b.userData.supply = i; root.add(home(b)); bin[i] = b; }
  SUPPLY.forEach((_, i) => spawn(i));
  const done = emojiCard('siap', '✅', 'Siap', 0.08, { border: '#43a047' }); done.position.set(-0.55, 0, 0.3); root.add(done);
  let finished = false;
  const dr = dragger(S, () => [...bin.filter(Boolean), ...placed], {
    onDrop(b) {
      const lx = b.position.x - plate.position.x, lz = b.position.z - plate.position.z;
      if (Math.abs(lx) > 6 * U || Math.abs(lz) > 4 * U) { if (placed.includes(b)) { placed.splice(placed.indexOf(b), 1); root.remove(b); } else goHome(S, b); return; }
      const snap = v => Math.round(v / U) * U, x = plate.position.x + snap(lx), z = plate.position.z + snap(lz);
      const below = placed.filter(o => o !== b && Math.abs(o.position.x - x) < U * 1.5 && Math.abs(o.position.z - z) < U * 1.5);
      const y = below.length ? Math.max(...below.map(o => o.position.y + U * 0.9)) : 0.012;
      b.position.set(x, y, z);
      if (b.userData.supply !== undefined) { const i = b.userData.supply; b.userData.supply = undefined; bin[i] = null; placed.push(b); spawn(i); made++; b.name = 'binaan_' + made; S.evt('build', 'blok' + made); }
      if (made === 6) S.info('🧱 Hebat! Teruskan membina, atau tuding <b>Siap</b> untuk ceritakan binaan anda.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [done])?.name ?? null,
    tap(x, y) {
      if (S.hitTest(x, y, [done]) !== done || finished) return;
      if (placed.length < 6) return S.info(`Gunakan sekurang-kurangnya <b>6</b> komponen (sekarang ${placed.length}).`);
      finished = true; const kinds = [...new Set(placed.map(p => KIND[p.userData.kind].toLowerCase()))];
      S.evt('create', 'binaan'); S.info(`🎨 Binaan baharu anda menggunakan <b>${placed.length}</b> komponen: ${kinds.join(', ')}. Ceritakan binaan anda dan fungsinya kepada kawan!`, 10);
    },
  };
}

// ------------------------------------------------------------ L4 Buka dan simpan: reverse order, sort into the box
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  const heli = group('helikopter'); heli.position.set(-0.3, 0, -0.18); heli.scale.setScalar(1.2); root.add(heli);
  const parts = ORDER.map(id => { const p = heliPart(id, 'bahagian_' + id); p.userData.id = id; p.position.set(...SLOTS[id]); heli.add(p); return p; });
  const box = group('kotak', mesh(new THREE.BoxGeometry(0.42, 0.04, 0.26), M(0xe3f2fd, { transparent: true, opacity: 0.6 }), 0, 0.02, 0));
  const COMP = ['merah', 'hijau', 'biru', 'kuning'].map((c, i) => { const m = mesh(new THREE.BoxGeometry(0.19, 0.005, 0.11), M(COL[c], { transparent: true, opacity: 0.35 }), -0.1 + (i % 2) * 0.2, 0.045, -0.06 + Math.floor(i / 2) * 0.12); m.name = 'petak_' + c; box.add(m); return m; });
  box.position.set(0.32, 0, 0.12); root.add(box);
  const lid = mesh(new THREE.BoxGeometry(0.43, 0.01, 0.27), M(0x90caf9, { transparent: true, opacity: 0.5 }), 0.32, 0.06, -0.1); lid.rotation.x = -1.2; lid.name = 'penutup'; root.add(lid);
  let next = 3; const loose = []; let stored = 0, closed = false;
  const dr = dragger(S, () => loose.filter(b => !b.userData.stored), {
    onDrop(b) {
      const d = m => flat(m.getWorldPosition(new THREE.Vector3()), b.position), c = COMP.filter(m => d(m) < 0.1).sort((a, z) => d(a) - d(z))[0];  // nearest compartment
      if (!c) return goHome(S, b);
      if (c.name !== 'petak_' + b.userData.color) { S.info('🎨 Susun komponen mengikut <b>warna</b>.'); return goHome(S, b); }
      b.userData.stored = true; stored++; const at = root.worldToLocal(c.getWorldPosition(new THREE.Vector3())); moveTo(S, b, at.add(new THREE.Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.04)));
      if (stored === loose.length) S.evt('storeall', 'kotak');
      S.info(stored < loose.length ? `📦 ${stored}/${loose.length} komponen disimpan.` : `🔢 ${loose.length} komponen dikira — semuanya cukup. Tuding <b>penutup</b> untuk menutup kotak.`);
    },
  });
  function explode(p) {  // a taken-off part breaks into loose bricks on the table
    const bricks = []; p.traverse(o => { if (o.userData.kind && !bricks.includes(o) && !bricks.some(b => b.getObjectById(o.id))) bricks.push(o); });
    bricks.forEach((b, i) => { const nb = brick(`kepingan_${p.userData.id}_${i}`, b.userData.kind, b.userData.color); nb.position.set(-0.3 + loose.length % 6 * 0.085, 0, 0.22 + Math.floor(loose.length / 6) * 0.1); /* clear of the guide panel */ root.add(home(nb)); loose.push(nb); });
    heli.remove(p);
  }
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, next >= 0 ? parts.filter(p => p.parent) : stored === loose.length && !closed ? [lid] : [])?.name ?? null,
    tap(x, y) {
      if (next >= 0) {
        const along = S.rayAt(x, y).intersectObjects(parts.filter(p => p.parent), true).map(h => parts.find(p => p.getObjectById(h.object.id)));
        const p = along.includes(parts[next]) ? parts[next] : along[0]; if (!p) return;  // the expected part anywhere on the ray wins (rotor sits over the mast)
        if (p !== parts[next]) return S.info(`🔧 Buka mengikut urutan, bermula daripada <b>langkah akhir</b> pemasangan: ${ORDER[next]}.`);
        explode(p); S.evt('dismantle', p.userData.id); next--;
        S.info(next >= 0 ? `✅ ${p.userData.id[0].toUpperCase() + p.userData.id.slice(1)} dibuka. Seterusnya: ${ORDER[next]}.` : '🧩 Semua bahagian dibuka. Susun komponen ke dalam kotak mengikut warna.');
        return;
      }
      if (stored === loose.length && !closed && S.hitTest(x, y, [lid]) === lid) { closed = true; S.tween(0.6, k => lid.rotation.x = -1.2 * (1 - k)); lid.position.z = -0.1 + 0.22 * 1; S.evt('close', 'kotak'); S.info('📦 Komponen disimpan di dalam kotak dengan <b>kemas dan teratur</b>.'); }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Kenali komponen', sp: 'SP 10.1.1 · 10.1.2', make: L1 },
  { id: 'L2', title: 'Pasang mengikut manual', sp: 'SP 10.1.3', make: L2 },
  { id: 'L3', title: 'Cipta binaan baharu', sp: 'SP 10.1.4 · 10.1.5', make: L3 },
  { id: 'L4', title: 'Buka dan simpan', sp: 'SP 10.1.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Teknologi — Set Binaan',
  intro: '<b>Sains Tahun 2 · Unit 10.</b> Bina model dengan set binaan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
