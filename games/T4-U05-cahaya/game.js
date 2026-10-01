// Sains Tahun 4 · Unit 5 Sifat Cahaya (SP 5.1.1 – 5.3.4) — light travels straight, shadow clarity, shadow size + shape,
// reflection with mirrors (ray tracing), uses of reflection, refraction + rainbow.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, matcher, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const BEAM = new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.85 });
function torch(name = 'lampu_suluh') {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16).rotateZ(Math.PI / 2), M(0xd32f2f), 0, 0, 0), mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.03, 16).rotateZ(Math.PI / 2), M(0xd32f2f), 0.06, 0, 0));
  g.add(mesh(new THREE.CircleGeometry(0.028, 16).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff59d }), 0.076, 0, 0)); return g;
}
// a beam segment between two points (y fixed)
function beamBetween(a, b, w = 0.008) { const L = a.distanceTo(b), m = mesh(new THREE.BoxGeometry(L, w, w), BEAM); m.position.copy(a).lerp(b, 0.5); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); m.userData.fx = true; return m; }
function screen(name = 'skrin', w = 0.3, h = 0.24) { const g = group(name, mesh(new THREE.BoxGeometry(0.01, h, w), M(0xfafafa), 0, h / 2 + 0.01, 0), mesh(new THREE.BoxGeometry(0.04, 0.02, 0.1), M(0x8d6e63), 0, 0.01, 0)); g.rotation.y = 0.6; return g; }

// ------------------------------------------------------------ L1 Cahaya bergerak lurus: line up three slits
function L1(S, play) {
  const root = group('L1', table(1.4, 0.8, play));
  const Y = 0.08, tc = torch(); tc.position.set(-0.55, Y, 0); root.add(tc);
  const sc = screen(); sc.position.set(0.55, 0, 0); root.add(sc);
  const spot = mesh(new THREE.CircleGeometry(0.02, 20), new THREE.MeshBasicMaterial({ color: 0xffeb3b })); spot.rotation.y = -Math.PI / 2; spot.position.set(-0.007, Y, 0); spot.visible = false; sc.add(spot);
  const cards = [-0.3, -0.05, 0.2].map((x, i) => {
    const c = group('kadbod' + (i + 1), mesh(new THREE.BoxGeometry(0.012, 0.14, 0.06), M(0xa1887f), 0, 0.07, -0.05), mesh(new THREE.BoxGeometry(0.012, 0.14, 0.06), M(0xa1887f), 0, 0.07, 0.05),
      mesh(new THREE.BoxGeometry(0.012, 0.05, 0.04), M(0xa1887f), 0, 0.125, 0), mesh(new THREE.BoxGeometry(0.012, 0.05, 0.04), M(0xa1887f), 0, 0.025, 0));
    c.position.set(x, 0, [0.12, -0.1, 0.15][i]); c.userData.carryY = 0; root.add(c); return c;
  });
  const t = textSprite('Kadbod bercelah', { h: 0.028 }); t.position.set(-0.05, 0.2, 0); root.add(t);
  let beams = [], done = false;
  function trace() {
    beams.forEach(b => root.remove(b)); beams = [];
    let x0 = -0.48, blocked = null;
    for (const c of cards) { if (Math.abs(c.position.z) > 0.012) { blocked = c; break; } }
    const end = blocked ? blocked.position.x - 0.01 : 0.55;
    beams.push(beamBetween(new THREE.Vector3(x0, Y, 0), new THREE.Vector3(end, Y, 0))); beams.forEach(b => root.add(b));
    spot.visible = !blocked;
    if (!blocked && !done) { done = true; S.evt('straight', 'skrin'); S.info('💡 Cahaya sampai ke skrin hanya apabila celah sebaris. Kesimpulan: <b>cahaya bergerak lurus</b>. Contoh: lampu kereta, alur cahaya matahari pada celahan pokok.', 10); }
  }
  trace();
  const dr = dragger(S, () => (done ? [] : cards), {
    onDrag(o) { o.position.x = cards.indexOf(o) * 0.25 - 0.3; if (Math.abs(o.position.z) < 0.02) o.position.z = 0; trace(); },
    onDrop(o) { o.position.x = cards.indexOf(o) * 0.25 - 0.3; if (Math.abs(o.position.z) < 0.045) o.position.z = 0; o.position.y = 0; S.evt('slide', o.name); trace(); },  /* forgiving snap onto the beam line */
  });
  return { root, view: { w: 1.3, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L2 Kejelasan bayang-bayang
const BUTTER = [['plastik_jernih', 'Plastik jernih', 0, 'lut_sinar', 0xe1f5fe, 0.3], ['plastik_berwarna', 'Plastik berwarna', 0.35, 'lut_cahaya', 0xf06292, 0.7], ['kad_manila', 'Kad manila', 0.9, 'legap', 0x212121, 1]];
function butterflyShape() { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(0.03, 0.05, 0.07, 0.05, 0.05, 0); s.bezierCurveTo(0.07, -0.04, 0.03, -0.04, 0, 0); s.bezierCurveTo(-0.03, -0.04, -0.07, -0.04, -0.05, 0); s.bezierCurveTo(-0.07, 0.05, -0.03, 0.05, 0, 0); return s; }
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const Y = 0.1, tc = torch(); tc.position.set(-0.5, Y, -0.1); root.add(tc);
  const sc = screen('skrin', 0.32, 0.26); sc.position.set(0.45, 0, -0.1); root.add(sc);
  const shadow = mesh(new THREE.ShapeGeometry(butterflyShape()), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0, side: THREE.DoubleSide })); shadow.rotation.y = -Math.PI / 2; shadow.scale.setScalar(1.6); shadow.position.set(-0.007, Y + 0.02, 0); shadow.userData.fx = true; sc.add(shadow);
  root.add(beamBetween(new THREE.Vector3(-0.42, Y, -0.1), new THREE.Vector3(0.43, Y, -0.1), 0.06)).material = new THREE.MeshBasicMaterial({ color: 0xfff59d, transparent: true, opacity: 0.25 });
  const holder = group('pemegang', mesh(new THREE.CylinderGeometry(0.003, 0.003, Y), M(0x555555), 0, Y / 2, 0)); holder.position.set(0, 0, -0.1); root.add(holder);
  const objs = BUTTER.map(([id, l, op, kind, color, opacity], i) => { const b = group(id, mesh(new THREE.ShapeGeometry(butterflyShape()), M(color, { transparent: true, opacity, side: THREE.DoubleSide }), 0, Y, 0)); b.children[0].rotation.y = Math.PI / 2; b.position.set(-0.3 + i * 0.3, 0, 0.27); b.userData = { label: l, op, kind }; b.userData.carryY = 0; const t = textSprite(l, { h: 0.026 }); t.position.set(0, 0.03, 0.04); b.add(t); root.add(home(b)); return b; });
  const kinds = [['lut_sinar', 'Lut sinar'], ['lut_cahaya', 'Lut cahaya'], ['legap', 'Legap']].map(([id, l], i) => { const c = textCard('jenis_' + id, l, 0.24); c.userData.id = id; c.position.set(-0.3 + i * 0.3, 0, 0.12); c.visible = false; root.add(c); return c; });
  let cur = null; const done = new Set();
  const dr = dragger(S, () => (cur ? [] : objs.filter(o => !done.has(o.name))), {
    onDrop(o) {
      if (flat(o.position, holder.position) > 0.12) return goHome(S, o);
      cur = o; moveTo(S, o, holder.position.clone()); S.tween(0.5, k => shadow.material.opacity = o.userData.op * k);
      kinds.forEach(k => k.visible = true); S.info(`🦋 ${o.userData.label}: perhatikan bayang-bayang. Apakah jenis objek ini?`);
    },
  });
  return {
    root, view: { w: 1.3, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, kinds.filter(k => k.visible))?.name ?? null,
    tap(x, y) {
      const k = S.hitTest(x, y, kinds.filter(k => k.visible)); if (!k || !cur) return;
      if (k.userData.id !== cur.userData.kind) return S.info('🤔 Lihat bayang-bayang: tiada, tidak jelas, atau jelas?');
      done.add(cur.name); S.evt('clarity', cur.name);
      S.info({ lut_sinar: '✅ <b>Lut sinar</b>: semua cahaya melaluinya — tiada bayang-bayang.', lut_cahaya: '✅ <b>Lut cahaya</b>: sebahagian cahaya melaluinya — bayang-bayang tidak jelas.', legap: '✅ <b>Legap</b>: tiada cahaya melaluinya — bayang-bayang jelas.' }[cur.userData.kind]);
      kinds.forEach(c => c.visible = false); shadow.material.opacity = 0; cur.visible = false; cur = null;
    },
  };
}

// ------------------------------------------------------------ L3 Saiz dan bentuk bayang-bayang
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const Y = 0.1, tc = torch(); tc.position.set(-0.5, Y, -0.05); root.add(tc);
  const sc = screen('skrin', 0.34, 0.3); sc.rotation.y = 1.15; sc.position.set(0.45, 0, -0.12); root.add(sc);  /* faced to the camera so the shadow is visible */
  const cyl = group('silinder', mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 20), M(0x42a5f5), 0, 0, 0)); cyl.position.set(0, Y, -0.05); cyl.userData.carryY = Y - 0.06; root.add(cyl);
  const sh = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })); sh.rotation.y = -Math.PI / 2; sh.position.set(-0.007, Y + 0.02, 0); sh.userData.fx = true; sc.add(sh);
  const circ = mesh(new THREE.CircleGeometry(0.5, 28), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide })); circ.rotation.y = -Math.PI / 2; circ.position.copy(sh.position); circ.visible = false; circ.userData.fx = true; sc.add(circ);
  const rot = emojiCard('pusing', '🔄', 'Pusing silinder', 0.08, { border: '#3a7bd5' }); rot.position.set(0.0, 0, 0.3); root.add(rot);
  let endOn = false; const seen = new Set();
  const update = () => {
    const d = Math.max(0.05, cyl.position.x - tc.position.x), k = 0.16 / d;  // nearer the torch -> bigger shadow
    sh.visible = !endOn; circ.visible = endOn;
    sh.scale.set(0.05 * k, 0.08 * k, 1); circ.scale.setScalar(0.05 * k);
    if (d < 0.25 && !seen.has('besar')) { seen.add('besar'); S.evt('size', 'besar'); S.info('🔦 Objek <b>lebih dekat</b> dengan lampu suluh — bayang-bayang <b>lebih besar</b>.'); }
    if (d > 0.7 && !seen.has('kecil')) { seen.add('kecil'); S.evt('size', 'kecil'); S.info('🔦 Objek <b>lebih jauh</b> dari lampu suluh — bayang-bayang <b>lebih kecil</b>. Semakin bertambah jarak, semakin berkurang saiz bayang-bayang.'); }
  };
  update();
  const dr = dragger(S, () => [cyl], { onDrag(o) { o.position.z = -0.05; o.position.y = Y; o.position.x = THREE.MathUtils.clamp(o.position.x, -0.38, 0.38); update(); }, onDrop(o) { o.position.y = Y; o.position.z = -0.05; update(); } });
  return {
    root, view: { w: 1.3, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [rot])?.name ?? null,
    tap(x, y) {
      if (S.hitTest(x, y, [rot]) !== rot) return;
      endOn = !endOn; S.tween(0.5, k => cyl.children[0].rotation.z = (endOn ? k : 1 - k) * Math.PI / 2); update();
      S.evt('shape', endOn ? 'bulatan' : 'segi_empat');
      S.info(endOn ? '⚫ Silinder dilihat dari hujung — bayang-bayang <b>bulatan</b>.' : '⬛ Silinder dilihat dari sisi — bayang-bayang <b>segi empat</b>. Jika orientasi objek berubah, bentuk bayang-bayang juga berubah.');
    },
  };
}

// ------------------------------------------------------------ L4 Pantulan cahaya: turn mirrors to hit the target
function L4(S, play) {
  const root = group('L4', table(1.4, 0.95, play));
  const Y = 0.05, src = new THREE.Vector3(-0.55, Y, 0.25);
  const tc = torch(); tc.position.copy(src); root.add(tc);
  const target = group('sasaran', mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 24), M(0xef5350), 0, 0.005, 0)); target.add(emojiSprite('🎯', 0.07).translateY(0.06)); target.position.set(0.35, 0, -0.3); root.add(target);
  const mirrorAt = [new THREE.Vector3(-0.1, Y, 0.25), new THREE.Vector3(-0.1, Y, -0.3)];
  // angle = orientation of the mirror surface in the xz plane; tap rotates by 45°
  const mirrors = mirrorAt.map((p, i) => { const m = group('cermin' + (i + 1), mesh(new THREE.BoxGeometry(0.14, 0.09, 0.008), M(0xb3e5fc, { metalness: 0.9, roughness: 0.05 }), 0, 0.045, 0)); m.position.set(p.x, 0, p.z); m.userData.ang = i ? 0 : Math.PI / 2; m.rotation.y = m.userData.ang; root.add(m); return m; });
  let beams = [], hit = false;
  function trace() {
    beams.forEach(b => root.remove(b)); beams = [];
    let p = src.clone().add(new THREE.Vector3(0.08, 0, 0)), d = new THREE.Vector3(1, 0, 0);
    for (let bounce = 0; bounce < 4; bounce++) {
      let best = null;
      for (const m of mirrors) {  // intersect ray with the mirror's line segment (half-length 0.07)
        const c = new THREE.Vector3(m.position.x, Y, m.position.z), t = new THREE.Vector3(Math.cos(m.rotation.y), 0, -Math.sin(m.rotation.y)), n = new THREE.Vector3(t.z, 0, -t.x);
        const denom = d.dot(n); if (Math.abs(denom) < 1e-4) continue;
        const s = c.clone().sub(p).dot(n) / denom; if (s < 0.01) continue;
        const q = p.clone().addScaledVector(d, s); if (Math.abs(q.clone().sub(c).dot(t)) > 0.07) continue;
        if (!best || s < best.s) best = { s, q, n };
      }
      const tgt = new THREE.Vector3(target.position.x, Y, target.position.z), tt = tgt.clone().sub(p).dot(d);
      const tHit = tt > 0 && p.clone().addScaledVector(d, tt).distanceTo(tgt) < 0.05 && (!best || tt < best.s);
      if (tHit) { beams.push(beamBetween(p, tgt)); hit = true; break; }
      if (!best) { beams.push(beamBetween(p, p.clone().addScaledVector(d, 0.6))); break; }
      beams.push(beamBetween(p, best.q)); d = d.clone().sub(best.n.clone().multiplyScalar(2 * d.dot(best.n))).normalize(); p = best.q;
    }
    beams.forEach(b => root.add(b));
  }
  trace();
  return {
    root, view: { w: 1.3, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, mirrors)?.name ?? null,
    tap(x, y) {
      const m = S.hitTest(x, y, mirrors); if (!m || hit) return;
      m.rotation.y += Math.PI / 4; S.evt('turn', m.name); trace();
      if (hit) { S.evt('hit', 'sasaran'); S.star(target.position.clone().setY(0.15)); S.info('🎯 Cahaya dipantulkan oleh <b>dua cermin</b> ke sasaran — seperti <b>periskop</b>! Cahaya dipantulkan apabila terkena permukaan rata dan licin.', 10); }
      else S.info('🔄 Cermin dipusing. Ikut alur cahaya — adakah ia sampai ke sasaran?');
    },
  };
}

// ------------------------------------------------------------ L5 Kegunaan pantulan cahaya
function L5(S, play) {
  const root = group('L5', table(1.5, 0.9, play));
  const mt = matcher(S, root, [
    { id: 'sisi', target: ['🚗', 'Cermin sisi'], card: ['', 'Melihat objek di belakang dan di sisi kereta'], ok: '✅ <b>Cermin sisi</b> — melihat objek di belakang dan di sisi kereta.' },
    { id: 'cembung', target: ['🛣️', 'Cermin cembung'], card: ['', 'Melihat kenderaan yang terlindung'], ok: '✅ <b>Cermin cembung</b> — mengelakkan kemalangan di selekoh.' },
    { id: 'pergigian', target: ['🦷', 'Cermin pergigian'], card: ['', 'Melihat gigi yang terlindung'], ok: '✅ <b>Cermin pergigian</b> membantu doktor gigi.' },
    { id: 'periskop', target: ['🔭', 'Periskop'], card: ['', 'Melihat objek yang terhalang'], ok: '✅ <b>Periskop</b> — dua cermin memantulkan cahaya ke mata pemerhati.' },
  ], { type: 'use', gap: 0.34, cardSize: 0.1 });
  return { root, view: { w: 1.5, d: 0.9 }, ...mt };
}

// ------------------------------------------------------------ L6 Pembiasan + pelangi
function L6(S, play) {
  const root = group('L6', table(1.4, 0.85, play));
  const glass = group('gelas', mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.16, 24, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, 0.08, 0),
    mesh(new THREE.CylinderGeometry(0.058, 0.054, 0.1, 24), M(0x4fc3f7, { transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.05, 0));
  glass.position.set(-0.35, 0, -0.15); root.add(glass);
  const pencil = group('pensel', mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8), M(0xffc107), 0, 0.1, 0)); pencil.position.set(-0.1, 0, 0.25); pencil.rotation.z = Math.PI / 2; pencil.userData.carryY = 0.05; root.add(home(pencil));
  const basin = group('besen', mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.05, 28, 1, true), M(0x90caf9, { side: THREE.DoubleSide }), 0, 0.025, 0), mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.004, 28), M(0x4fc3f7, { transparent: true, opacity: 0.7 }), 0, 0.04, 0));
  basin.position.set(0.25, 0, -0.1); root.add(basin);
  const sun = emojiSprite('☀️', 0.12); sun.position.set(-0.05, 0.42, -0.3); root.add(sun);
  const paper = mesh(new THREE.PlaneGeometry(0.26, 0.2), M(0xfafafa, { side: THREE.DoubleSide }), 0.5, 0.12, -0.25); paper.rotation.y = -1.3; root.add(paper);
  const mirror = group('cermin', mesh(new THREE.BoxGeometry(0.07, 0.006, 0.05), M(0xb3e5fc, { metalness: 0.9, roughness: 0.05 }), 0, 0.003, 0)); mirror.position.set(0.25, 0, 0.27); mirror.userData.carryY = 0.05; root.add(home(mirror));
  for (const [o, l] of [[pencil, 'Pensel'], [mirror, 'Cermin']]) { const t = textSprite(l, { h: 0.026 }); t.position.set(0, 0.04, 0.03); o.add(t); }
  let bent = false, rainbow = false;
  const dr = dragger(S, () => [...(bent ? [] : [pencil]), ...(rainbow ? [] : [mirror])], {
    onDrop(o, x, y) {
      if (o === pencil) {
        if (!(nearScreen(S, glass, x, y, 0.1, 80) || flat(o.position, glass.position) < 0.1)) return goHome(S, o);
        bent = true; o.rotation.set(0, 0, 0.5); o.position.set(glass.position.x, 0.02, glass.position.z);
        const under = mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.09, 8), M(0xffa000), 0.025, 0.045, 0); under.rotation.z = 0.15; o.children[0].scale.y = 0.6; o.children[0].position.y = 0.14; o.add(under);  // the part in water looks shifted
        S.evt('refract', 'pensel'); return S.info('🥄 Pensel kelihatan <b>bengkok</b>! Cahaya bergerak dari air ke udara melalui dua medium berbeza — arahnya berubah. Inilah <b>pembiasan cahaya</b>.', 9);
      }
      if (!(nearScreen(S, basin, x, y, 0.04, 80) || flat(o.position, basin.position) < 0.12)) return goHome(S, o);
      rainbow = true; moveTo(S, o, basin.position.clone().setY(0.02)); o.rotation.z = 0.5;
      const cols = [0xe53935, 0xff9800, 0xffeb3b, 0x43a047, 0x1e88e5, 0x3949ab, 0x8e24aa];
      cols.forEach((c, i) => { const r = mesh(new THREE.RingGeometry(0.075 - i * 0.008, 0.083 - i * 0.008, 32, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); r.position.set(0, -0.06, 0.003); r.scale.set(1.3, 1.3, 1); r.userData.fx = true; paper.add(r); r.scale.setScalar(0.01); S.tween(1 + i * 0.1, k => r.scale.setScalar(0.01 + k * 1.3)); });
      S.evt('rainbow', 'pelangi'); S.info('🌈 Pelangi terbentuk! Apabila cahaya matahari terkena titisan air hujan, cahaya dibiaskan dan membentuk <b>pelangi</b>.', 9);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Cahaya bergerak lurus', sp: 'SP 5.1.1', make: L1 },
  { id: 'L2', title: 'Kejelasan bayang-bayang', sp: 'SP 5.1.2', make: L2 },
  { id: 'L3', title: 'Saiz dan bentuk bayang-bayang', sp: 'SP 5.1.3 · 5.1.4', make: L3 },
  { id: 'L4', title: 'Pantulan cahaya', sp: 'SP 5.2.1 · 5.2.3', make: L4 },
  { id: 'L5', title: 'Kegunaan pantulan', sp: 'SP 5.2.2 · 5.2.4', make: L5 },
  { id: 'L6', title: 'Pembiasan dan pelangi', sp: 'SP 5.3.1 – 5.3.4', make: L6 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Sifat Cahaya',
  intro: '<b>Sains Tahun 4 · Unit 5.</b> Cahaya bergerak lurus, dipantulkan dan dibiaskan! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
