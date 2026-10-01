// Sains Tahun 2 · Unit 6 Terang dan Gelap (SP 6.1.1 – 6.1.6) — light sources, light vs dark, shadows, clarity, paper puppet.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sorter, emojiCard, traceSheet, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

function torch(name = 'lampu_suluh') {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 20), M(0xd32f2f), 0, 0, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.035, 0.024, 0.04, 20), M(0xd32f2f), 0.07, 0, 0).rotateZ(Math.PI / 2));
  const lens = mesh(new THREE.CircleGeometry(0.033, 20), M(0xfff8e1, { emissive: 0xffd54f, emissiveIntensity: 0 }), 0.091, 0, 0); lens.rotation.y = Math.PI / 2; lens.name = 'kanta_lampu'; g.add(lens);
  const beam = mesh(new THREE.ConeGeometry(0.15, 0.7, 24, 1, true).rotateZ(Math.PI / 2).translate(0.44, 0, 0), new THREE.MeshBasicMaterial({ color: 0xfff59d, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
  beam.name = 'alur_cahaya'; beam.visible = false; beam.userData.fx = true; g.add(beam);
  g.userData.on = v => { lens.material.emissiveIntensity = v ? 2.5 : 0; beam.visible = v; };
  return g;
}
const screenPanel = (name = 'skrin', w = 0.32, h = 0.26) => group(name, mesh(new THREE.BoxGeometry(0.01, h, w), M(0xfafafa), 0, h / 2 + 0.02, 0), mesh(new THREE.BoxGeometry(0.04, 0.02, 0.1), M(0x8d6e63), 0, 0.01, 0));

// ------------------------------------------------------------ L1 Sumber cahaya
function L1(S, play) {
  const root = group('L1', table(1.6, 0.85, play));
  let sorted = false, picked = false;
  const dr = sorter(S, root, {
    type: 'source', size: 0.12,
    zones: [{ id: 'sumber', label: '💡 Sumber cahaya', color: 0xfff59d, x: -0.38, z: -0.18, w: 0.66 }, { id: 'bukan', label: '🚫 Bukan sumber cahaya', color: 0xcfd8dc, x: 0.38, z: -0.18, w: 0.66 }],
    items: [['matahari', '☀️', 'Matahari', 'sumber'], ['lampu', '💡', 'Lampu', 'sumber'], ['api', '🕯️', 'Api lilin', 'sumber'],
      ['buku', '📖', 'Buku', 'bukan'], ['bola', '⚽', 'Bola', 'bukan'], ['cawan', '☕', 'Cawan', 'bukan']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: `Adakah ${label.toLowerCase()} mengeluarkan cahaya sendiri?` })),
    ok: (it, z) => `✅ ${it.label} ${z.id === 'sumber' ? '<b>ialah sumber cahaya</b>' : '<b>bukan</b> sumber cahaya'}.`,
    onDone() { sorted = true; setTimeout(() => S.info('☝️ Tuding sumber cahaya yang <b>semula jadi</b>.'), 2000); },
  });
  const sources = () => { const o = []; root.traverse(c => ['matahari', 'lampu', 'api'].includes(c.name) && o.push(c)); return o; };
  return {
    root, view: { w: 1.6, d: 0.85 }, ...dr,
    hit: (x, y) => (sorted && !picked ? S.hitTest(x, y, sources())?.name ?? null : null),
    tap(x, y) {
      if (!sorted || picked) return;
      const s = S.hitTest(x, y, sources()); if (!s) return;
      if (s.name !== 'matahari') return S.info(`🤔 ${s.name === 'lampu' ? 'Lampu' : 'Api lilin'} dibuat oleh manusia. Yang mana terjadi secara semula jadi?`);
      picked = true; S.evt('natural', 'matahari'); S.star(s.getWorldPosition(new THREE.Vector3()).setY(0.25));
      S.info('☀️ <b>Matahari</b> ialah sumber cahaya semula jadi. Cahaya diperoleh daripada matahari, lampu dan api.');
    },
  };
}

// ------------------------------------------------------------ L2 Terang dan gelap
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const desk = group('meja', mesh(new THREE.BoxGeometry(0.4, 0.012, 0.22), M(0xb07a45), 0, 0.12, 0), ...[[-0.18, -0.09], [0.18, -0.09], [-0.18, 0.09], [0.18, 0.09]].map(([x, z]) => mesh(new THREE.BoxGeometry(0.012, 0.12, 0.012), M(0x8a5a2e), x, 0.06, z)));
  desk.position.set(0.05, 0, -0.15); root.add(desk);
  const reader = kid('murid', { shirt: 0xffffff }); reader.position.set(0.05, 0, 0.0); reader.rotation.y = Math.PI; reader.scale.setScalar(1.3); root.add(reader);
  const pc = document.createElement('canvas'); pc.width = 320; pc.height = 200; const pg = pc.getContext('2d'); const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace;
  const page = blur => { pg.filter = 'none'; pg.fillStyle = '#fffdf2'; pg.fillRect(0, 0, 320, 200); pg.filter = blur ? 'blur(6px)' : 'none'; pg.fillStyle = '#222'; pg.font = 'bold 30px system-ui'; pg.fillText('Saya suka', 24, 70); pg.fillText('membaca!', 24, 120); pg.filter = 'none'; pt.needsUpdate = true; };
  page(true);
  const book = mesh(new THREE.PlaneGeometry(0.16, 0.1), new THREE.MeshBasicMaterial({ map: pt }), 0.05, 0.128, -0.15); book.rotation.x = -Math.PI / 2; book.name = 'buku'; root.add(book);
  const veil = mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x05050a, transparent: true, opacity: 0.85, depthTest: false }), 0, 0.35, 0);
  veil.rotation.x = -Math.PI / 2; veil.renderOrder = 10; veil.userData.fx = true; root.add(veil);
  const lamp = emojiCard('lampu_meja', '💡', 'Lampu meja', 0.11, { border: '#fbc02d' }); lamp.position.set(-0.45, 0, 0.25); lamp.userData.carryY = 0.12; root.add(home(lamp));
  lamp.traverse(o => { if (o.material) { o.material.depthTest = false; o.renderOrder = 11; } });
  let lit = false, read = false;
  const dr = dragger(S, () => (lit ? [] : [lamp]), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, desk, x, y, 0.12, 100) || flat(o.position, desk.position) < 0.2)) return goHome(S, o);
      lit = true; moveTo(S, o, desk.position.clone().add(new THREE.Vector3(-0.15, 0.125, 0)));
      lamp.traverse(m => { if (m.material) { m.material.depthTest = true; m.renderOrder = 0; } });
      S.tween(1, k => veil.material.opacity = 0.85 * (1 - k)); page(false);
      S.evt('light', 'lampu_meja'); S.info('💡 Bilik menjadi <b>terang</b>! Sekarang tuding buku untuk membaca.');
    },
  });
  setTimeout(() => !lit && S.info('🌑 Bilik <b>gelap</b> — sukar membaca. Sumber cahaya diperlukan.', 6), 600);
  return {
    root, view: { w: 1.3, d: 0.8 }, ...dr,
    hit: (x, y) => (lit && !read ? S.hitTest(x, y, [book])?.name ?? null : null),
    tap(x, y) {
      if (!lit || read || S.hitTest(x, y, [book]) !== book) return;
      read = true; S.evt('read', 'buku'); S.info('📖 Dalam keadaan <b>terang</b>, mudah membaca, menulis dan melukis.');
    },
  };
}

// ------------------------------------------------------------ L3 Bayang-bayang + kejelasan
const OBJS = [['bola', 'Bola', 0.85, 'circle', 'jelas'], ['kertas_tebal', 'Kertas tebal', 0.85, 'rect', 'jelas'], ['kertas_surih', 'Kertas surih', 0.3, 'rect', 'kurang jelas'], ['plastik_jernih', 'Plastik jernih', 0, 'rect', 'tiada']];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const tc = torch(); tc.scale.setScalar(1.4); tc.position.set(-0.5, 0.12, -0.12); root.add(tc);
  const sc = screenPanel(); sc.position.set(0.45, 0, -0.12); sc.rotation.y = 0.9; root.add(sc);  // turned to face the camera
  const holder = group('pemegang', mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.1), M(0x555555), 0, 0.05, 0), mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 16), M(0x555555), 0, 0.003, 0)); holder.position.set(0, 0, -0.12); root.add(holder);
  for (const [o, t, y] of [[tc, 'Lampu suluh', 0.2], [sc, 'Skrin', 0.33], [holder, 'Letak objek di sini', 0.2]]) { const l = textSprite(t, { h: 0.026 }); l.position.set(o.position.x, y, -0.12); root.add(l); }
  const make = { bola: () => mesh(new THREE.SphereGeometry(0.035, 20, 14), M(0xffffff)), kertas_tebal: () => mesh(new THREE.BoxGeometry(0.004, 0.08, 0.06), M(0x8d6e63)),
    kertas_surih: () => mesh(new THREE.BoxGeometry(0.004, 0.08, 0.06), M(0xffffff, { transparent: true, opacity: 0.6 })), plastik_jernih: () => mesh(new THREE.BoxGeometry(0.004, 0.08, 0.06), M(0xe1f5fe, { transparent: true, opacity: 0.25 })) };
  const objs = OBJS.map(([id, label], i) => { const m = make[id](); m.position.y = 0.045; m.rotation.y = 0.9; const o = group(id, m); o.position.set(-0.5 + i * 0.2, 0, 0.25); o.userData.carryY = 0.07; const t = textSprite(label, { h: 0.024 }); t.position.set(0, 0.11, 0); o.add(t); root.add(home(o)); return o; });
  const shadows = { circle: mesh(new THREE.CircleGeometry(0.07, 28), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0 })), rect: mesh(new THREE.PlaneGeometry(0.11, 0.15), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0 })) };
  for (const s of Object.values(shadows)) { s.rotation.y = -Math.PI / 2; s.position.set(-0.006, 0.17, 0); s.userData.fx = true; sc.add(s); }
  let on = false, current = null; const tested = new Set();
  // record table
  const tcv = document.createElement('canvas'); tcv.width = 380; tcv.height = 210; const tg = tcv.getContext('2d'); const tt = new THREE.CanvasTexture(tcv); tt.colorSpace = THREE.SRGBColorSpace;
  const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 380, 210); tg.fillStyle = '#2b2340'; tg.font = 'bold 22px system-ui'; tg.fillText('Objek', 12, 30); tg.fillText('Bayang-bayang', 190, 30);
    tg.font = '22px system-ui'; OBJS.forEach(([id, label, , , c], r) => { tg.fillText(label, 12, 70 + r * 38); if (tested.has(id)) tg.fillText(c, 190, 70 + r * 38); }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.3, 0.17), new THREE.MeshBasicMaterial({ map: tt }), 0.4, 0.004, 0.24); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  const dr = dragger(S, () => (on ? objs : []), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, holder, x, y, 0.08, 70) || flat(o.position, holder.position) < 0.1)) { if (current === o) { current = null; Object.values(shadows).forEach(s => s.material.opacity = 0); } return goHome(S, o); }
      if (current && current !== o) goHome(S, current);
      current = o; moveTo(S, o, holder.position.clone().setY(0.06));
      const [id, label, op, shape, clarity] = OBJS.find(x => x[0] === o.name);
      Object.values(shadows).forEach(s => s.material.opacity = 0);
      S.tween(0.5, k => shadows[shape].material.opacity = op * k);
      tested.add(id); draw(); S.evt('shadow', id);
      S.info(op ? `🌑 ${label}: bayang-bayang <b>${clarity}</b> — cahaya ${op > 0.5 ? 'dihalang sepenuhnya' : 'dihalang sebahagian'}.` : `✨ ${label}: <b>tiada</b> bayang-bayang — cahaya dapat melaluinya.`);
      if (tested.size === 4) setTimeout(() => S.info('📋 Kejelasan bayang-bayang <b>bergantung pada objek</b> yang digunakan.', 8), 2200);
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (!on ? S.hitTest(x, y, [tc])?.name ?? null : null),
    tap(x, y) {
      if (on || S.hitTest(x, y, [tc]) !== tc) return;
      on = true; tc.userData.on(true); S.evt('torch', 'lampu_suluh');
      S.info('🔦 Lampu suluh dihidupkan. Letakkan objek di antara lampu suluh dan skrin. Bayang-bayang terhasil apabila <b>cahaya dihalang oleh objek</b>.');
    },
  };
}

// ------------------------------------------------------------ L4 Permainan bayang-bayang: paper puppet
function puppetOutline() {  // a little crowned figure, metres on the sheet
  const p = [[-0.06, -0.12], [0.06, -0.12], [0.05, -0.02], [0.09, 0.02], [0.08, 0.04], [0.04, 0.02], [0.035, 0.06], [0.045, 0.1], [0.04, 0.14], [0.02, 0.12], [0.0, 0.15], [-0.02, 0.12], [-0.04, 0.14], [-0.045, 0.1], [-0.035, 0.06], [-0.04, 0.02], [-0.08, 0.04], [-0.09, 0.02], [-0.05, -0.02]];
  const out = []; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; for (let k = 0; k < 3; k++) out.push([a[0] + (b[0] - a[0]) * k / 3, a[1] + (b[1] - a[1]) * k / 3]); }
  return out;
}
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const pts = puppetOutline();
  const ts = traceSheet(S, { w: 0.3, h: 0.34, pts, ink: '#212121' }); ts.sheet.position.set(-0.4, 0.002, -0.05); root.add(ts.sheet, ts.pencil);
  const tl = textSprite('1. Surih watak', { h: 0.028 }); tl.position.set(-0.4, 0.03, -0.25); root.add(tl);
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const puppet = group('watak', mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0x212121, side: THREE.DoubleSide })));
  puppet.children[0].rotation.y = Math.PI / 2; puppet.children[0].scale.setScalar(0.6); puppet.children[0].position.y = 0.16; puppet.visible = false; puppet.userData.carryY = 0.0; root.add(puppet);
  const stick = emojiCard('lidi', '🥢', 'Lidi', 0.09, { border: '#8d6e63' }); stick.position.set(-0.1, 0, 0.3); stick.visible = false; root.add(home(stick));
  const tc = torch(); tc.scale.setScalar(1.3); tc.position.set(0.0, 0.14, -0.12); root.add(tc); tc.userData.on(true);
  const sc = screenPanel('layar', 0.42, 0.34); sc.position.set(0.52, 0, -0.12); sc.rotation.y = 0.9; root.add(sc);
  const ll = textSprite('Layar', { h: 0.028 }); ll.position.set(0.52, 0.42, -0.12); root.add(ll);
  const shadow = mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); shadow.rotation.y = -Math.PI / 2; shadow.position.set(-0.007, 0.2, 0); shadow.visible = false; shadow.userData.fx = true; sc.add(shadow);
  let cut = false, onStick = false, shown = false;
  const between = o => o.position.x > 0.08 && o.position.x < 0.45 && Math.abs(o.position.z + 0.12) < 0.14;  // torch at x=0, screen at x=0.52
  const sizeAt = x => Math.min(1.6, 0.24 / Math.max(0.08, x));  // closer to the torch -> bigger shadow
  const dr = dragger(S, () => [...(cut && !onStick ? [stick] : []), ...(onStick ? [puppet] : [])], {
    onDrop(o, x, y) {
      if (o === stick) {
        if (flat(o.position, puppet.position) > 0.14) return goHome(S, o);
        onStick = true; stick.visible = false;
        puppet.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.16), M(0x8d6e63), 0, 0.08, 0)); S.evt('stick', 'lidi');
        return S.info('🥢 Watak dilekatkan pada lidi. Letakkan watak di antara <b>lampu suluh dan layar</b>.');
      }
      if (!between(o)) { shadow.visible = false; return; }
      o.position.z = -0.12; shadow.visible = true; shadow.scale.setScalar(sizeAt(o.position.x));
      if (!shown) { shown = true; S.evt('play', 'wayang'); S.info('🎭 Bayang-bayang watak muncul di layar! Gerakkan watak lebih dekat ke lampu suluh — bayang-bayang menjadi <b>lebih besar</b>.', 9); }
    },
    onDrag(o) { if (onStick) { shadow.visible = between(o); if (shadow.visible) shadow.scale.setScalar(sizeAt(o.position.x)); } },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    pen(x, y, on) {
      if (cut || !ts.pen(x, y, on)) return;
      cut = true; S.evt('trace', 'watak'); ts.sheet.visible = false; tl.visible = false;
      puppet.visible = true; puppet.position.set(-0.4, 0, -0.05); stick.visible = true;
      S.info('✂️ Watak disurih dan digunting! Lekatkan watak pada <b>lidi</b>.');
    },
    tracePath: ts.tracePath,
  };
}

const LEVELS = [
  { id: 'L1', title: 'Sumber cahaya', sp: 'SP 6.1.1', make: L1 },
  { id: 'L2', title: 'Terang dan gelap', sp: 'SP 6.1.2', make: L2 },
  { id: 'L3', title: 'Bayang-bayang', sp: 'SP 6.1.3 · 6.1.4', make: L3 },
  { id: 'L4', title: 'Permainan bayang-bayang', sp: 'SP 6.1.5 · 6.1.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Terang dan Gelap',
  intro: '<b>Sains Tahun 2 · Unit 6.</b> Cahaya dan bayang-bayang! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / surih · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
