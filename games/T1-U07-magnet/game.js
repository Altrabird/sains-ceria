// Sains Tahun 1 · Unit 7 Magnet (SP 7.1.1 – 7.1.6) — shapes + uses, what magnets attract, poles, strength, magnet pin.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const RED = 0xe53935, BLUE = 0x1e63d6, GREY = 0x9e9e9e, DARK = 0x37474f;
const poleTag = (ch, x, y = 0.035) => { const t = textSprite(ch, { h: 0.028, bg: '#ffffffdd', fg: ch === 'U' ? '#c62828' : '#1565c0' }); t.position.set(x, y, 0); return t; };

// ------------------------------------------------------------ magnets (x axis = S -> U unless flipped)
function barMagnet(name, { len = 0.14, w = 0.035, h = 0.02, tags = true } = {}) {
  const g = group(name, mesh(new THREE.BoxGeometry(len / 2, h, w), M(BLUE, { roughness: 0.4 }), -len / 4, h / 2, 0), mesh(new THREE.BoxGeometry(len / 2, h, w), M(RED, { roughness: 0.4 }), len / 4, h / 2, 0));
  if (tags) g.add(poleTag('S', -len / 4), poleTag('U', len / 4));
  g.userData.len = len; return g;
}
function cylMagnet(name) {
  return group(name, mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 20), M(BLUE), -0.035, 0.014, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 20), M(RED), 0.035, 0.014, 0).rotateZ(Math.PI / 2));
}
function horseshoe(name, u = false) {  // ladam: round bend; U: flat bottom
  const g = group(name);
  if (u) {
    g.add(mesh(new THREE.BoxGeometry(0.1, 0.02, 0.025), M(RED), 0, 0.0125, -0.04));
    for (const [x, c] of [[-0.04, RED], [0.04, BLUE]]) g.add(mesh(new THREE.BoxGeometry(0.022, 0.02, 0.07), M(c), x, 0.0125, 0.0), mesh(new THREE.BoxGeometry(0.022, 0.021, 0.02), M(GREY), x, 0.0125, 0.045));
  } else {
    g.add(mesh(new THREE.TorusGeometry(0.04, 0.012, 10, 24, Math.PI), M(RED), 0, 0.012, -0.01).rotateX(-Math.PI / 2).rotateZ(Math.PI));
    for (const x of [-0.04, 0.04]) g.add(mesh(new THREE.BoxGeometry(0.024, 0.024, 0.04), M(x < 0 ? RED : BLUE), x, 0.012, 0.01), mesh(new THREE.BoxGeometry(0.025, 0.025, 0.015), M(GREY), x, 0.012, 0.035));
  }
  return g;
}
const button = name => group(name, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 28), M(DARK, { metalness: 0.5, roughness: 0.4 }), 0, 0.007, 0));
const ring = name => group(name, mesh(new THREE.TorusGeometry(0.03, 0.012, 12, 28), M(DARK, { metalness: 0.5, roughness: 0.4 }), 0, 0.012, 0).rotateX(Math.PI / 2));

// ------------------------------------------------------------ L1 Bentuk magnet + kegunaan
const SHAPES = [['bar', 'Magnet bar', () => barMagnet('m_bar', { tags: false })], ['silinder', 'Magnet silinder', () => cylMagnet('m_silinder')],
  ['ladam', 'Magnet ladam', () => horseshoe('m_ladam')], ['bentuk_u', 'Magnet bentuk U', () => horseshoe('m_bentuk_u', true)],
  ['butang', 'Magnet butang', () => button('m_butang')], ['cincin', 'Magnet cincin', () => ring('m_cincin')]];
const USES = [['peti_sejuk', '🧊', 'Pintu peti sejuk', true], ['tanda_nama', '📛', 'Tanda nama', true], ['kotak_pensel', '👝', 'Kotak pensel', true],
  ['pemutar_skru', '🔩', 'Pemutar skru bermagnet', true], ['cawan', '☕', 'Cawan', false], ['buku', '📖', 'Buku', false]];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.9, play));
  const mags = SHAPES.map(([id, , make], i) => { const m = make(); m.scale.setScalar(1.3); m.position.set(-0.62 + i * 0.25, 0, -0.08); m.userData.id = id; root.add(m); return m; });
  const mix = [2, 5, 0, 4, 1, 3];
  const cards = SHAPES.map(([id, label], i) => { const c = emojiCard('nama_' + id, '', label, 0.085, { border: '#e53935' }); c.position.set(-0.62 + mix[i] * 0.25, 0, 0.32); c.userData.id = id; root.add(home(c)); return c; });
  const named = new Set(); let usesOn = false; const used = new Set();
  const uses = USES.map(([id, e, label, ok], i) => { const c = emojiCard(id, e, label, 0.12, { border: '#7e57c2' }); c.position.set(-0.62 + i * 0.25, 0, -0.33); c.userData.ok = ok; c.visible = false; root.add(c); return c; });
  const dr = dragger(S, () => cards.filter(c => !named.has(c)), {
    onDrop(c) {
      const m = mags.find(m => flat(m.position, c.position) < 0.11);
      if (!m) return goHome(S, c);
      if (m.userData.id !== c.userData.id) { S.info('🤔 Bukan bentuk itu. Magnet dinamakan berdasarkan <b>bentuknya</b>.'); return goHome(S, c); }
      named.add(c); moveTo(S, c, m.position.clone().add(new THREE.Vector3(0, 0, 0.1)));
      S.evt('shape', c.userData.id); S.info(`✅ <b>${SHAPES.find(s => s[0] === c.userData.id)[1]}</b>.`);
      if (named.size === 6) { usesOn = true; uses.forEach((u, i) => { u.visible = true; u.scale.setScalar(0.01); S.tween(0.4 + i * 0.1, k => u.scale.setScalar(0.01 + k)); }); S.info('🎉 Magnet dinamakan berdasarkan bentuknya. Sekarang tuding objek yang <b>menggunakan magnet</b>.'); }
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (usesOn ? S.hitTest(x, y, uses)?.name ?? null : null),
    tap(x, y) {
      const u = usesOn && S.hitTest(x, y, uses); if (!u) return;
      const label = USES.find(x => x[0] === u.name)[2];
      if (!u.userData.ok) return S.info(`🤔 ${label} tidak menggunakan magnet.`);
      if (!used.has(u)) { used.add(u); const m = emojiSprite('🧲', 0.06); m.position.set(0.06, 0.14, 0); u.add(m); }
      S.evt('use', u.name); S.info(`🧲 <b>${label}</b> menggunakan magnet. Magnet berguna dalam kehidupan seharian.`);
    },
  };
}

// ------------------------------------------------------------ L2 Objek dan magnet: sweep the magnet over objects
function nail(n) { return group(n, mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 8), M(0xb0bec5, { metalness: 0.8, roughness: 0.3 }), 0, 0.004, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 12), M(0xb0bec5, { metalness: 0.8 }), -0.04, 0.004, 0).rotateZ(Math.PI / 2)); }
function screw(n) { const g = group(n, mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.05, 8), M(0x90a4ae, { metalness: 0.8 }), 0, 0.006, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.006, 12), M(0x90a4ae, { metalness: 0.8 }), -0.026, 0.006, 0).rotateZ(Math.PI / 2)); for (let i = 0; i < 6; i++) g.add(mesh(new THREE.TorusGeometry(0.0045, 0.0012, 4, 10), M(0x78909c, { metalness: 0.8 }), -0.018 + i * 0.007, 0.006, 0).rotateY(Math.PI / 2)); return g; }
function clip(n) { const loop = r => new THREE.TorusGeometry(r, 0.0015, 6, 20).rotateX(Math.PI / 2).scale(2, 1, 1); return group(n, mesh(loop(0.009), M(0xcfd8dc, { metalness: 0.8 }), 0, 0.002, 0), mesh(loop(0.006), M(0xcfd8dc, { metalness: 0.8 }), 0.004, 0.002, 0)); }
function key(n) { return group(n, mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 20), M(0xb0bec5, { metalness: 0.8 }), -0.03, 0.004, 0).rotateX(Math.PI / 2), mesh(new THREE.BoxGeometry(0.045, 0.004, 0.006), M(0xb0bec5, { metalness: 0.8 }), 0.005, 0.004, 0), mesh(new THREE.BoxGeometry(0.004, 0.004, 0.01), M(0xb0bec5), 0.02, 0.004, 0.006), mesh(new THREE.BoxGeometry(0.004, 0.004, 0.008), M(0xb0bec5), 0.012, 0.004, 0.005)); }
function pencil(n) { return group(n, mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6), M(0xffc107), 0, 0.005, 0).rotateZ(Math.PI / 2), mesh(new THREE.ConeGeometry(0.005, 0.015, 6), M(0xe0c097), 0.057, 0.005, 0).rotateZ(-Math.PI / 2), mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.01, 6), M(0xf48fb1), -0.055, 0.005, 0).rotateZ(Math.PI / 2)); }
const marble = n => group(n, mesh(new THREE.SphereGeometry(0.012, 16, 12), M(0x29b6f6, { roughness: 0.05, transparent: true, opacity: 0.85 }), 0, 0.012, 0));
const eraser = n => group(n, mesh(new THREE.BoxGeometry(0.04, 0.014, 0.022), M(0xf8bbd0), 0, 0.007, 0), mesh(new THREE.BoxGeometry(0.02, 0.0145, 0.0225), M(0xffffff), 0.012, 0.007, 0));
const ruler = n => group(n, mesh(new THREE.BoxGeometry(0.15, 0.003, 0.025), M(0x80deea, { transparent: true, opacity: 0.75 }), 0, 0.0015, 0));
const OBJ = [['paku', 'Paku', nail, true], ['skru', 'Skru', screw, true], ['klip', 'Klip kertas', clip, true], ['kunci', 'Kunci besi', key, true],
  ['pensel', 'Pensel', pencil, false], ['guli', 'Guli', marble, false], ['pemadam', 'Pemadam', eraser, false], ['pembaris', 'Pembaris plastik', ruler, false]];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.9, play));
  const mix = [5, 0, 6, 3, 1, 7, 2, 4];
  const objs = OBJ.map(([id, label, make, mag], i) => {
    const o = make(id); o.position.set(-0.6 + (mix[i] % 4) * 0.27, 0, -0.2 + Math.floor(mix[i] / 4) * 0.24); o.scale.setScalar(1.9);
    o.userData = { label, mag }; const t = textSprite(label, { h: 0.018 }); t.position.set(0, 0.025, 0.025); o.add(t); o.userData.tag = t; root.add(o); return o;
  });
  const box = group('kotak_ditarik', mesh(new THREE.BoxGeometry(0.22, 0.05, 0.16), M(0xc8e6c9, { transparent: true, opacity: 0.8 }), 0, 0.025, 0));
  const bl = textSprite('Dapat ditarik', { h: 0.032 }); bl.position.set(0, 0.08, 0); box.add(bl); box.position.set(0.55, 0, 0.25); root.add(box);
  const mag = barMagnet('magnet'); mag.scale.setScalar(1.4); mag.position.set(0.5, 0, -0.1); root.add(mag);
  const tested = new Set(), stuck = [];
  const ends = () => [-1, 1].map(s => mag.localToWorld(new THREE.Vector3(s * mag.userData.len / 2, 0, 0)));
  const dr = dragger(S, () => [mag], {
    onDrag() {
      for (const o of objs) {
        if (stuck.includes(o)) continue;
        const end = ends().map(e => root.worldToLocal(e)).find(e => flat(e, o.position) < 0.08);
        if (!end) continue;
        if (o.userData.mag) {
          stuck.push(o); o.userData.tag.visible = false; mag.attach(o);
          const side = mag.worldToLocal(end.clone()).x > 0 ? 1 : -1;
          o.position.set(side * (mag.userData.len / 2 + 0.012), 0.004, (stuck.length - 2.5) * 0.012); o.rotation.set(0, Math.PI / 2, 0);
          S.evt('test', o.name, { attract: true }); S.info(`🧲 <b>${o.userData.label}</b> ditarik oleh magnet! (besi / keluli)`);
        } else if (!tested.has(o)) {
          S.evt('test', o.name, { attract: false }); S.info(`✋ <b>${o.userData.label}</b> tidak ditarik oleh magnet.`);
        }
        tested.add(o);
      }
    },
    onDrop(m) {
      if (flat(m.position, box.position) < 0.14 && stuck.length === 4) {
        for (const o of stuck) { box.attach(o); o.position.set((Math.random() - 0.5) * 0.12, 0.05, (Math.random() - 0.5) * 0.08); }
        stuck.length = 0; S.evt('collect', 'kotak');
        S.info('✅ Paku, skru, klip kertas dan kunci besi <b>dapat ditarik</b>. Pensel, guli, pemadam dan pembaris plastik <b>tidak dapat ditarik</b>.', 9);
      } else if (flat(m.position, box.position) < 0.14) S.info('Tarik <b>semua</b> objek yang dapat ditarik dahulu.');
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L3 Tarikan dan tolakan: like poles repel, unlike attract
function L3(S, play) {
  const root = group('L3', table(1.4, 0.8, play));
  const track = mesh(new THREE.BoxGeometry(0.9, 0.004, 0.07), M(0xd7ccc8), 0, 0.002, 0); track.userData.fx = true; root.add(track);
  const fixed = barMagnet('magnet_tetap'); fixed.scale.setScalar(1.5); fixed.position.set(-0.2, 0, 0); root.add(fixed);  // [S|U], U faces right
  const pin = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05), M(0x555555), -0.2 - 0.07, 0.025, 0); root.add(pin);
  const mv = barMagnet('magnet_gerak'); mv.scale.setScalar(1.5); mv.position.set(0.3, 0, 0); root.add(mv);  // [S|U]: S faces the fixed U -> attract
  const L = 0.14 * 1.5;
  let flipped = false, settled = false, held = false; const arrows = [];
  const facing = () => (flipped ? 'U' : 'S');  // pole of the moving magnet that faces the fixed magnet's U end
  function showArrows(kind) {
    arrows.forEach(a => root.remove(a)); arrows.length = 0;
    const a = textSprite(kind === 'tarik' ? '→ ← Menarik' : '← → Menolak', { h: 0.04, bg: kind === 'tarik' ? '#c8e6c9ee' : '#ffcdd2ee' });
    a.position.set(-0.2 + L / 2 + 0.06, 0.12, 0); root.add(a); arrows.push(a); setTimeout(() => root.remove(a), 2500);
  }
  const dr = dragger(S, () => [mv], {
    onPick() { held = true; settled = false; },
    onDrag(o) { o.position.z = 0; o.position.x = THREE.MathUtils.clamp(o.position.x, -0.2 + L + 0.005, 0.42); },
    onDrop() { held = false; },
  });
  return {
    root, view: { w: 1.4, d: 0.8 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [mv])?.name ?? null,
    tap(x, y) {
      if (S.hitTest(x, y, [mv]) !== mv) return;
      flipped = !flipped; settled = false;
      const r0 = mv.rotation.y; S.tween(0.5, k => mv.rotation.y = r0 + k * Math.PI);
      S.evt('flip', 'magnet_gerak'); S.info(`🔄 Magnet diterbalikkan: kutub <b>${facing()}</b> kini menghadap kutub U.`);
    },
    update(dt) {
      if (held || settled) return;
      const gap = mv.position.x - L / 2 - (-0.2 + L / 2);
      if (gap > 0.14) return;
      if (facing() === 'S') {  // U-S: unlike poles attract
        mv.position.x -= Math.min(gap, dt * (0.25 + (0.14 - gap) * 3));
        if (gap <= 0.001) { settled = true; showArrows('tarik'); S.evt('pull', 'U-S'); S.info('🧲 Kutub <b>U</b> dan kutub <b>S</b> — kutub berlainan <b>menarik</b>!'); }
      } else {  // U-U: like poles repel
        mv.position.x += dt * (0.3 + (0.14 - gap) * 3);
        if (gap >= 0.13) { settled = true; showArrows('tolak'); S.evt('push', 'U-U'); S.info('↔️ Kutub <b>U</b> dan kutub <b>U</b> — kutub sama <b>menolak</b>!'); }
      }
    },
  };
}

// ------------------------------------------------------------ L4 Kekuatan magnet: fair test with paper clips
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const tray = group('dulang_klip', mesh(new THREE.BoxGeometry(0.3, 0.02, 0.2), M(0xeceff1), 0, 0.01, 0));
  for (let i = 0; i < 30; i++) { const c = clip(''); c.position.set((Math.random() - 0.5) * 0.26, 0.022, (Math.random() - 0.5) * 0.16); c.rotation.y = Math.random() * 6; tray.add(c); }
  tray.position.set(-0.1, 0, -0.15); root.add(tray);
  const mk = (id, x) => { const m = barMagnet(id); m.scale.setScalar(1.3); m.position.set(x, 0, 0.25); const t = textSprite(id === 'magnet_a' ? 'Magnet A' : 'Magnet B', { h: 0.032 }); t.position.set(0, 0.07, 0); m.add(t); root.add(home(m)); return m; };
  const A = mk('magnet_a', -0.35), B = mk('magnet_b', 0.15);
  const POWER = { magnet_a: 3, magnet_b: 7 };
  // results chart
  const cc = document.createElement('canvas'); cc.width = 320; cc.height = 260; const cg = cc.getContext('2d'); const ctex = new THREE.CanvasTexture(cc); ctex.colorSpace = THREE.SRGBColorSpace;
  const results = {};
  const draw = () => {
    cg.fillStyle = '#fff'; cg.fillRect(0, 0, 320, 260); cg.fillStyle = '#2b2340'; cg.font = 'bold 24px system-ui'; cg.fillText('Bilangan klip kertas', 20, 32);
    cg.strokeStyle = '#999'; cg.beginPath(); cg.moveTo(40, 220); cg.lineTo(300, 220); cg.stroke();
    [['magnet_a', 'A', 90], ['magnet_b', 'B', 210]].forEach(([k, l, x]) => {
      cg.fillStyle = '#2b2340'; cg.font = 'bold 22px system-ui'; cg.fillText(l, x + 12, 248);
      if (results[k]) { cg.fillStyle = k === 'magnet_a' ? '#90caf9' : '#ef9a9a'; cg.fillRect(x, 220 - results[k] * 22, 40, results[k] * 22); cg.fillStyle = '#2b2340'; cg.fillText(results[k], x + 12, 212 - results[k] * 22); }
    });
    ctex.needsUpdate = true;
  };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.28, 0.23), new THREE.MeshBasicMaterial({ map: ctex }), 0.45, 0.16, -0.2); board.rotation.x = -0.3; board.userData.fx = true; root.add(board);
  const fair = textSprite('Ujian adil: magnet sama bentuk & saiz', { h: 0.028, bg: '#fff59dee' }); fair.position.set(-0.1, 0.02, 0.4); root.add(fair);
  const dr = dragger(S, () => [A, B].filter(m => !results[m.name]), {
    onDrop(m) {
      if (flat(m.position, tray.position) > 0.17) return goHome(S, m);
      const n = POWER[m.name]; results[m.name] = n;
      const hang = []; for (let i = 0; i < n; i++) { const c = clip(''); c.position.set(-0.05 + (i % 4) * 0.025, -0.012 - Math.floor(i / 4) * 0.014, 0.02); c.rotation.x = Math.PI / 2; m.add(c); hang.push(c); }
      goHome(S, m, 0.15); draw();
      S.evt('strength', m.name); S.info(`📎 ${m.name === 'magnet_a' ? 'Magnet A' : 'Magnet B'} menarik <b>${n}</b> klip kertas.`);
      if (Object.keys(results).length === 2) setTimeout(() => S.info('📊 Lihat carta. Tuding magnet yang <b>lebih kuat</b>.'), 2200);
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (Object.keys(results).length === 2 ? S.hitTest(x, y, [A, B])?.name ?? null : null),
    tap(x, y) {
      if (Object.keys(results).length < 2) return;
      const m = S.hitTest(x, y, [A, B]); if (!m) return;
      if (m === A) return S.info('🤔 Magnet A menarik 3 klip sahaja. Magnet mana yang menarik <b>lebih banyak</b> klip?');
      S.evt('choose', 'magnet_b'); S.star(B.position.clone().setY(0.2));
      S.info('💪 Magnet B lebih kuat — ia menarik <b>lebih banyak klip kertas</b>. Setiap magnet mempunyai kekuatan yang berbeza.');
    },
  };
}

// ------------------------------------------------------------ L5 Reka cipta pin bermagnet: two button magnets through cloth
function L5(S, play) {
  const root = group('L5', table(1.3, 0.8, play));
  const cloth = mesh(new THREE.BoxGeometry(0.008, 0.26, 0.3), M(0x64b5f6, { roughness: 1 }), 0, 0.13, -0.05); cloth.name = 'kain'; root.add(cloth);
  const cl = textSprite('Kain baju', { h: 0.03 }); cl.position.set(0, 0.3, -0.05); root.add(cl);
  const disc = (name, face) => {  // button magnet standing on edge; 'face' = pole on the side facing the cloth
    const g = group(name, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.016, 28), M(DARK, { metalness: 0.5 }), 0, 0.035, 0).rotateZ(Math.PI / 2));
    const t = poleTag(face, 0, 0.09); g.add(t); g.userData.tag = t; g.userData.face = face; return g;
  };
  const front = disc('magnet_depan', 'U'); front.position.set(-0.016, 0.1, -0.05); front.scale.setScalar(1.2); root.add(front);
  const face = emojiSprite('😊', 0.08); face.position.set(-0.05, 0.14, -0.05); face.visible = false; root.add(face);
  const back = disc('magnet_belakang', 'U'); back.position.set(0.3, 0, 0.2); back.scale.setScalar(1.2); back.userData.carryY = 0.1; root.add(home(back));
  const hint = textSprite('Kutub U menghadap kain', { h: 0.026 }); hint.position.set(-0.12, 0.22, -0.05); root.add(hint);
  let done = false;
  const dr = dragger(S, () => (done ? [] : [back]), {
    onDrop(o) {
      if (o.position.x < 0 || flat(o.position, cloth.position) > 0.12) return goHome(S, o);
      const target = new THREE.Vector3(0.016, 0.1, -0.05);
      if (o.userData.face === 'U') {
        moveTo(S, o, target, 0.2).then(() => moveTo(S, o, o.userData.home, 0.5));
        S.evt('try', 'U-U'); return S.info('↔️ Kutub <b>U</b> dengan kutub <b>U</b> — kutub sama menolak! Tuding magnet untuk menterbalikkannya.');
      }
      done = true; moveTo(S, o, target, 0.3); face.visible = true; face.scale.setScalar(0.001); S.tween(0.5, k => face.scale.setScalar(0.001 + k * 0.08));
      S.evt('pin', 'U-S'); S.info('😊 Kutub berlainan (U dan S) <b>menarik</b> melalui kain — pin bermagnet siap!');
    },
  });
  return {
    root, view: { w: 1.3, d: 0.8 }, ...dr,
    hit: (x, y) => (done ? null : S.hitTest(x, y, [back])?.name ?? null),
    tap(x, y) {
      if (done || S.hitTest(x, y, [back]) !== back) return;
      const f = back.userData.face = back.userData.face === 'U' ? 'S' : 'U';
      back.remove(back.userData.tag); back.userData.tag = poleTag(f, 0, 0.09); back.add(back.userData.tag);
      S.tween(0.4, k => back.children[0].rotation.y = k * Math.PI);
      S.evt('flip', f); S.info(`🔄 Kini kutub <b>${f}</b> menghadap kain.`);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Bentuk dan kegunaan magnet', sp: 'SP 7.1.1 · 7.1.2', make: L1 },
  { id: 'L2', title: 'Objek dan magnet', sp: 'SP 7.1.3', make: L2 },
  { id: 'L3', title: 'Tarikan dan tolakan', sp: 'SP 7.1.4', make: L3 },
  { id: 'L4', title: 'Kekuatan magnet', sp: 'SP 7.1.5 · 7.1.6', make: L4 },
  { id: 'L5', title: 'Reka cipta pin bermagnet', sp: 'SP 7.1.6', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Magnet',
  intro: '<b>Sains Tahun 1 · Unit 7.</b> Bermain dengan magnet! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / terbalikkan · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
