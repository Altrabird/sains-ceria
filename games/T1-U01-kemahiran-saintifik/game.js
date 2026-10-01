// Sains Tahun 1 · Unit 1 Kemahiran Saintifik — four levels, props built from three.js primitives (no GLBs needed).
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, leafOutline, leaf, magnifier, table, sink, beaker, traceSheet, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const CAREFUL = 2.0;  // m/s: carrying a fish faster than this and it slips back into tank A (raise if real hands jitter)

// ------------------------------------------------------------ props (shared ones live in shared/props.js)
function alarmClock() {
  const body = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 32), M(0xd8343a), 0, 0.055, 0); body.rotation.x = Math.PI / 2;
  const face = mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.004, 32), M(0xffffff), 0, 0.055, 0.016); face.rotation.x = Math.PI / 2;
  const hand1 = mesh(new THREE.BoxGeometry(0.004, 0.03, 0.002), M(0x222222), 0, 0.068, 0.019);
  const hand2 = mesh(new THREE.BoxGeometry(0.022, 0.004, 0.002), M(0x222222), 0.009, 0.055, 0.019);
  const bellL = mesh(new THREE.SphereGeometry(0.018, 16, 8, 0, 6.3, 0, 1.6), M(0xd8343a, { metalness: 0.4 }), -0.03, 0.098, 0);
  const bellR = bellL.clone(); bellR.position.x = 0.03;
  const legs = [-0.025, 0.025].map(x => mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.02), M(0x333333), x, 0.012, 0));
  return group('jam', body, face, hand1, hand2, bellL, bellR, ...legs);
}
const iceCube = () => group('ais', mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), M(0x7cc8f2, { transparent: true, opacity: 0.75, roughness: 0.05, emissive: 0x2a6f99, emissiveIntensity: 0.25 }), 0, 0.03, 0),
  new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.06, 0.06, 0.06)), new THREE.LineBasicMaterial({ color: 0xffffff })).translateY(0.03));
function rose() {
  const stem = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12), M(0x2f8a3b), 0, 0.06, 0);
  const head = group('', ...[0, 1, 2, 3, 4].map(i => {
    const p = mesh(new THREE.SphereGeometry(0.022 - i * 0.003, 12, 8), M(i % 2 ? 0xc81d36 : 0xe02a45), Math.cos(i * 2.4) * 0.008, 0.012 + i * 0.004, Math.sin(i * 2.4) * 0.008);
    p.scale.y = 0.8; return p;
  }));
  head.position.y = 0.12;
  const lf = mesh(new THREE.SphereGeometry(0.014, 8, 6), M(0x2f8a3b), 0.014, 0.06, 0); lf.scale.set(1.4, 0.3, 0.7);
  const g = group('bunga', stem, head, lf); g.rotation.z = -0.25; return g;
}
function iceCream() {
  const cone = mesh(new THREE.ConeGeometry(0.03, 0.09, 24), M(0xd9a35b), 0, 0.045, 0); cone.rotation.x = Math.PI;
  const scoop = mesh(new THREE.SphereGeometry(0.034, 20, 14), M(0xf6a5c8), 0, 0.1, 0);
  return group('aiskrim', cone, scoop);
}
function tank(name, x) {
  const W = 0.36, H = 0.22, D = 0.22;
  const glass = mesh(new THREE.BoxGeometry(W, H, D), M(0xcfefff, { transparent: true, opacity: 0.18, roughness: 0, depthWrite: false }), 0, H / 2, 0);
  const water = mesh(new THREE.BoxGeometry(W - 0.01, 0.17, D - 0.01), M(0x4aa8e8, { transparent: true, opacity: 0.3, depthWrite: false }), 0, 0.09, 0);
  const sand = mesh(new THREE.BoxGeometry(W - 0.01, 0.015, D - 0.01), M(0xcbb487), 0, 0.008, 0);
  const weed = mesh(new THREE.ConeGeometry(0.015, 0.1, 6), M(0x2f9a52), -W / 2 + 0.05, 0.06, -0.05);
  const g = group(name, glass, water, sand, weed); g.position.x = x;
  g.userData.box = { W, H, D }; glass.userData.fx = water.userData.fx = true;  // fish inside stay pickable for the warning
  return g;
}
function fish(name) {
  const body = mesh(new THREE.SphereGeometry(0.025, 16, 10), M(0xff8a1f)); body.scale.set(1.4, 0.9, 0.6);
  const tail = mesh(new THREE.ConeGeometry(0.018, 0.03, 8), M(0xff6a00), -0.044, 0, 0); tail.rotation.z = -Math.PI / 2;
  const eye = mesh(new THREE.SphereGeometry(0.004), M(0x111111), 0.024, 0.006, 0.01);
  return group(name, body, tail, eye);
}
function net() {
  const rim = mesh(new THREE.TorusGeometry(0.05, 0.004, 8, 32), M(0x2a5bd7)); rim.rotation.x = Math.PI / 2;
  const bag = mesh(new THREE.ConeGeometry(0.05, 0.07, 20, 1, true), M(0x9fd4f5, { transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 0, -0.035, 0);
  bag.rotation.x = Math.PI;
  const handle = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3), M(0x2f7d3a), 0, 0.08, 0.17); handle.rotation.x = 1.1;
  return group('penyauk', rim, bag, handle);
}

// ------------------------------------------------------------ L1 Memerhati: object -> sense organ
function L1(S, play) {
  const root = group('L1', table(1.5, 0.8, play));
  const objs = [['daun', leaf(), 'mata'], ['jam', alarmClock(), 'telinga'], ['ais', iceCube(), 'tangan'], ['bunga', rose(), 'hidung'], ['aiskrim', iceCream(), 'lidah']];
  const SENSE = {
    mata: ['👁️', 'Penglihatan', 'memerhati daun'], telinga: ['👂', 'Pendengaran', 'mendengar bunyi jam'],
    tangan: ['👆', 'Sentuhan', 'menyentuh ais'], hidung: ['👃', 'Bau', 'menghidu bunga'], lidah: ['👅', 'Rasa', 'merasa aiskrim'],
  };
  const padOrder = ['telinga', 'lidah', 'mata', 'hidung', 'tangan'];  // shuffled against the object row
  const pads = padOrder.map((k, i) => {
    const p = group('pad_' + k, mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.012, 40), M(0xffd84d)));
    const e = emojiSprite(SENSE[k][0], 0.11); e.position.y = 0.09; e.userData.fx = true; p.add(e);
    const l = textSprite(SENSE[k][1], { h: 0.035 }); l.position.set(0, 0.02, 0.105); p.add(l);
    p.position.set((i - 2) * 0.27, 0, -0.2); p.userData.sense = k; root.add(p); return p;
  });
  const items = objs.map(([id, o, sense], i) => { o.position.set((i - 2) * 0.27, 0, 0.2); o.userData.sense = sense; o.userData.id = id; root.add(home(o)); return o; });
  const lens = magnifier(); lens.position.set(0.62, 0, 0.3); lens.visible = false; root.add(home(lens));
  let matched = 0;
  const free = () => items.filter(o => !o.userData.done).concat(lens.visible && !lens.userData.done ? [lens] : []);
  const d = dragger(S, free, {
    onDrop(o) {
      if (o === lens) {
        const lf = items[0];
        if (flat(o.position, lf.position) < 0.12) {
          lens.userData.done = true; moveTo(S, lens, lf.position.clone().add(new THREE.Vector3(0, 0.06, 0)));
          S.tween(0.8, t => lf.scale.setScalar(1 + t * 1.3));
          S.evt('magnify', 'kanta'); S.info('🔍 Kanta pembesar membantu pemerhatian — <b>urat daun</b> kelihatan lebih jelas!');
        } else { S.info('Letakkan kanta pembesar <b>di atas daun</b>.'); goHome(S, o); }
        return;
      }
      const pad = pads.find(p => flat(p.position, o.position) < 0.11);
      if (!pad) return goHome(S, o);
      if (pad.userData.sense !== o.userData.sense) { S.info(`Cuba lagi! Deria apakah yang kita guna untuk <b>${SENSE[o.userData.sense][2].split(' ')[0]}</b>?`); return goHome(S, o); }
      o.userData.done = true; moveTo(S, o, pad.position.clone().add(new THREE.Vector3(0, 0.012, 0.0)));
      const [, name, act] = SENSE[pad.userData.sense];
      S.star(pad.position.clone().add(new THREE.Vector3(0, 0.15, 0)));
      S.evt('match', o.userData.id);
      S.info(`✅ Deria <b>${name.toLowerCase()}</b> — ${act}.`);
      if (++matched === 5) {
        lens.visible = true; lens.scale.setScalar(0.01); S.tween(0.5, t => lens.scale.setScalar(0.01 + t));
        setTimeout(() => S.info('🔍 Hebat! Sekarang pegang <b>kanta pembesar</b> dan letakkan di atas daun.'), 2500);
      }
    },
  });
  return { root, view: { w: 1.5, d: 0.8 }, ...d };
}

// ------------------------------------------------------------ L2 Kendalikan spesimen: net, fish, two tanks
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const A = tank('akuariumA', -0.3), B = tank('akuariumB', 0.3); root.add(A, B);
  for (const [t, label] of [[A, 'A'], [B, 'B']]) { const l = textSprite('Akuarium ' + label, { h: 0.04 }); l.position.set(t.position.x, 0.27, 0); root.add(l); }
  const pen = net(); pen.position.set(0, 0, 0.28); pen.userData.carryY = 0.1; root.add(home(pen));
  const fishes = ['ikan1', 'ikan2', 'ikan3'].map((id, i) => {
    const f = fish(id); f.userData = { tank: A, a: i * 2.1, r: 0.05 + i * 0.02, sp: 0.9 + i * 0.3, y: 0.06 + i * 0.03 }; root.add(f); return f;
  });
  let caught = null, speed = 0;
  const inside = (t, p, m = 0.03) => Math.abs(p.x - t.position.x) < t.userData.box.W / 2 - m && Math.abs(p.z) < t.userData.box.D / 2 - m * 0.5;
  function slipBack(msg) {
    const f = caught; caught = null; root.attach(f);
    f.userData.tank = A; f.userData.swim = true; S.info(msg, 5);
  }
  const d = dragger(S, () => [pen, ...fishes.filter(f => f.parent === root)], {
    onPick(o) {
      if (o !== pen) { S.info('🚫 Jangan pegang ikan dengan tangan! Gunakan <b>alat yang betul — penyauk</b>.'); return false; }
      S.evt('grab', 'penyauk');
    },
    onDrag(o, dt, prev) {
      speed = speed * 0.7 + (flat(o.position, prev) / dt) * 0.3;
      const bag = o.position.clone().add(new THREE.Vector3(0, -0.05, 0));
      if (!caught && inside(A, o.position)) {
        const f = fishes.find(f => f.userData.tank === A && f.parent === root && flat(f.position, bag) < 0.09);
        if (f) { caught = f; pen.attach(f); f.position.set(0, -0.03, 0); f.rotation.set(0, 0, 0); S.evt('catch', f.name); S.info('🐟 Ikan ditangkap! Bawa ke akuarium B dengan <b>perlahan-lahan</b>.'); }
      } else if (caught && inside(B, o.position)) {
        const f = caught; caught = null; root.attach(f); f.userData.tank = B; f.userData.y = 0.07 + Math.random() * 0.05;
        S.star(new THREE.Vector3(B.position.x, 0.3, 0)); S.evt('release', f.name);
        const left = fishes.filter(x => x.userData.tank === A).length;
        S.info(left ? `✅ Ikan selamat di akuarium B. Tinggal <b>${left}</b> lagi.` : '🎉 Semua ikan dipindahkan dengan cermat!');
      } else if (caught && speed > CAREFUL && !inside(A, o.position)) {
        slipBack('💦 Aduh! Terlalu laju — ikan terlepas ke akuarium A. Kendalikan spesimen dengan <b>cermat</b>.');
      }
    },
    onDrop(o) { if (caught) slipBack('Ikan perlukan air! Masukkan ikan ke dalam <b>akuarium B</b>.'); speed = 0; goHome(S, o); },
  });
  return {
    root, view: { w: 1.3, d: 0.8 }, ...d,
    update(dt) {
      for (const f of fishes) {
        if (f.parent !== root) continue;
        const u = f.userData, c = u.tank.position;
        u.a += dt * u.sp;
        const tx = c.x + Math.cos(u.a) * u.r * 1.6, tz = Math.sin(u.a) * u.r * 0.9, ty = u.y + Math.sin(u.a * 2) * 0.01;
        if (u.swim) { f.position.lerp(new THREE.Vector3(tx, ty, tz), 0.08); if (f.position.distanceTo(new THREE.Vector3(tx, ty, tz)) < 0.01) u.swim = false; }
        else f.position.set(tx, ty, tz);
        f.rotation.y = -Math.atan2(Math.cos(u.a) * 0.9, -Math.sin(u.a) * 1.6);
      }
    },
  };
}

// ------------------------------------------------------------ L3 Lakar + Berkomunikasi
function L3(S, play) {
  const root = group('L3', table(1.4, 0.8, play));
  const real = leaf('spesimen'); real.scale.setScalar(1.6); real.position.set(-0.47, 0.004, 0.05); root.add(real);
  const tag = textSprite('Spesimen', { h: 0.035 }); tag.position.set(-0.47, 0.06, 0.15); root.add(tag);
  // the leaf outline, 3.25x, to trace on paper
  const ts = traceSheet(S, { pts: leafOutline(36).map(([x, y]) => [x * 3.25, y * 3.25]) });
  const sheet = ts.sheet; sheet.position.set(0.16, 0.002, 0.05); root.add(sheet, ts.pencil);
  let sketched = false;
  const cards = [['lisan', '🗣️', 'Lisan', '🗣️ <b>Lisan</b> — bercakap: “Daun ini berwarna hijau dan mempunyai urat.”'],
    ['lakaran', '✏️', 'Lakaran', '✏️ <b>Lakaran</b> — melukis apa yang diperhatikan, seperti lakaran daun anda!'],
    ['tulisan', '📝', 'Tulisan', '📝 <b>Tulisan</b> — menulis: “Kumbang kura-kura berwarna merah dengan tompok-tompok hitam pada sayapnya.”']]
    .map(([id, e, t, msg], i) => {
      const cc = document.createElement('canvas'); cc.width = 256; cc.height = 180;
      const cg = cc.getContext('2d'); cg.fillStyle = '#fff'; cg.fillRect(0, 0, 256, 180); cg.strokeStyle = '#e0457b'; cg.lineWidth = 10; cg.strokeRect(5, 5, 246, 170);
      cg.textAlign = 'center'; cg.font = '80px "Noto Color Emoji","Segoe UI Emoji",sans-serif'; cg.fillText(e, 128, 95);
      cg.fillStyle = '#2b2340'; cg.font = 'bold 34px system-ui'; cg.fillText(t, 128, 155);
      const ct = new THREE.CanvasTexture(cc); ct.colorSpace = THREE.SRGBColorSpace;
      const card = mesh(new THREE.BoxGeometry(0.2, 0.14, 0.01), [M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff), new THREE.MeshStandardMaterial({ map: ct }), M(0xffffff)]);
      card.name = id; card.userData = { msg }; card.position.set((i - 1) * 0.27, 0.09, -0.32); card.rotation.x = -0.35; card.visible = false;
      root.add(card); return card;
    });
  const tapped = new Set();
  return {
    root, view: { w: 1.4, d: 0.8 },
    pen(x, y, on) {
      if (sketched || !ts.pen(x, y, on)) return;
      sketched = true;
      S.star(sheet.position.clone().add(new THREE.Vector3(0, 0.15, 0))); S.evt('sketch', 'daun');
      S.info('✏️ Lakaran daun yang tepat! Lakaran ialah satu cara <b>berkomunikasi</b>. Tuding setiap kad.');
      cards.forEach((cd, i) => { cd.visible = true; cd.scale.setScalar(0.01); S.tween(0.4 + i * 0.15, t => cd.scale.setScalar(0.01 + t)); });
    },
    hit: (x, y) => S.hitTest(x, y, cards.filter(c => c.visible))?.name ?? null,
    tap(x, y) {
      const cd = S.hitTest(x, y, cards.filter(c => c.visible)); if (!cd) return;
      S.info(cd.userData.msg, 8); S.evt('comm', cd.name);
      if (!tapped.has(cd.name)) { tapped.add(cd.name); S.star(cd.position.clone().add(new THREE.Vector3(0, 0.1, 0))); }
    },
    tracePath: ts.tracePath,  // for tests
  };
}

// ------------------------------------------------------------ L4 Bersihkan + Simpan
function L4(S, play) {
  const root = group('L4', table(1.5, 0.8, play));
  const sk = sink(); sk.position.set(-0.35, 0, 0); root.add(sk);
  const faucet = sk.getObjectByName('paip'), stream = sk.getObjectByName('aliran');
  // dirty petri dish in the sink
  const dirtMat = M(0x7a5a2e, { transparent: true, opacity: 1 });
  const dish = group('piring', mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 32), M(0xe6f6ff, { transparent: true, opacity: 0.6, roughness: 0.05 }), 0, 0.007, 0),
    ...[[0.02, 0.01], [-0.025, -0.012], [0.005, -0.028], [-0.01, 0.03]].map(([x, z], i) => mesh(new THREE.CylinderGeometry(0.011 + i * 0.002, 0.011, 0.003, 12), dirtMat, x, 0.016, z)));
  dish.position.set(-0.35, 0.065, -0.02); dish.userData.carryY = 0.05; root.add(home(dish));
  const sponge = group('span', mesh(new THREE.BoxGeometry(0.08, 0.035, 0.05), M(0xffd23f, { roughness: 1 }), 0, 0.018, 0),
    mesh(new THREE.BoxGeometry(0.08, 0.012, 0.05), M(0x39a85b, { roughness: 1 }), 0, 0.041, 0));
  sponge.position.set(-0.05, 0, 0.22); sponge.userData.carryY = 0.07; root.add(home(sponge));
  const soap = group('sabun', mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09), M(0x5bc07a), 0, 0.045, 0), mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04), M(0xffffff), 0, 0.11, 0));
  soap.position.set(-0.12, 0, -0.12); root.add(soap);
  // tools waiting to be stored + a drawer with 3 slots
  const lens = magnifier(); lens.position.set(0.0, 0, 0.0);
  const bk = beaker(); bk.position.set(0.12, 0, 0.0);
  for (const o of [lens, bk]) root.add(home(o));
  const drawer = new THREE.Group(); drawer.name = 'laci';
  const wood = M(0xb07a45), dark = M(0x8a5a2e);
  drawer.add(mesh(new THREE.BoxGeometry(0.46, 0.012, 0.3), wood, 0, 0.006, 0));
  for (const [x, z, w, d] of [[0, 0.15, 0.46, 0.012], [0, -0.15, 0.46, 0.012], [0.23, 0, 0.012, 0.3], [-0.23, 0, 0.012, 0.3], [-0.077, 0, 0.01, 0.3], [0.077, 0, 0.01, 0.3]])
    drawer.add(mesh(new THREE.BoxGeometry(w, 0.07, d), x === 0 || Math.abs(x) > 0.2 ? wood : dark, x, 0.035, z));
  const front = mesh(new THREE.BoxGeometry(0.5, 0.09, 0.02), wood, 0, 0.045, 0.16); drawer.add(front);
  drawer.add(mesh(new THREE.BoxGeometry(0.1, 0.015, 0.02), M(0x444444, { metalness: 0.6 }), 0, 0.05, 0.18));
  drawer.position.set(0.48, 0, 0.1); root.add(drawer);
  const cabinet = mesh(new THREE.BoxGeometry(0.52, 0.1, 0.3), M(0x8a5a2e), 0.48, 0.05, -0.22); root.add(cabinet);  // closing slides the drawer in here
  const slots = [-0.153, 0, 0.153].map(x => drawer.position.clone().add(new THREE.Vector3(x, 0.012, 0)));
  const lbl = textSprite('Laci', { h: 0.035 }); lbl.position.set(0.48, 0.16, -0.24); root.add(lbl);
  let water = false, scrub = 0, clean = false, closed = false; const stored = new Set();
  const tools = [lens, bk, dish];
  const d = dragger(S, () => [sponge, ...tools.filter(o => !stored.has(o.name) && (o !== dish || clean))], {
    onPick(o) { if (closed) return false; },
    onDrag(o, dt, prev) {
      if (o !== sponge || clean) return;
      if (flat(o.position, dish.position) > 0.1) return;
      if (!water) { S.info('🚰 Buka <b>paip</b> dahulu — tuding paip.', 3); return; }
      scrub += flat(o.position, prev);
      dirtMat.opacity = Math.max(0, 1 - scrub / 0.9);
      if (dirtMat.opacity === 0) {
        clean = true; S.evt('clean', 'piring');
        S.star(dish.position.clone().add(new THREE.Vector3(0, 0.12, 0)));
        dish.userData.home = new THREE.Vector3(-0.12, 0, 0.1); goHome(S, dish, 0.1);
        S.info('✨ Piring petri sudah <b>bersih</b>! Tutup paip, kemudian simpan semua alat di dalam laci.');
      }
    },
    onDrop(o) {
      if (o === sponge) return goHome(S, o);
      if (flat(o.position, drawer.position) > 0.26) return goHome(S, o);
      const slot = slots[stored.size]; stored.add(o.name);
      moveTo(S, o, slot); o.userData.home = slot;
      S.evt('store', o.name); S.star(slot.clone().add(new THREE.Vector3(0, 0.12, 0)));
      S.info(stored.size < 3 ? `✅ Disimpan. Tinggal <b>${3 - stored.size}</b> lagi.` : '✅ Semua alat disimpan. Tuding <b>laci</b> untuk menutupnya.');
      // the drawer carries what is stored when it closes
      setTimeout(() => drawer.attach(o), 400);
    },
  });
  const tappables = () => [faucet, drawer];
  return {
    root, view: { w: 1.5, d: 0.8 }, ...d,
    hit: (x, y) => S.hitTest(x, y, tappables())?.name ?? null,
    tap(x, y) {
      const t = S.hitTest(x, y, tappables()); if (!t) return;
      if (t === faucet) {
        water = !water; stream.visible = water; S.evt('water', 'paip', { on: water });
        S.info(water ? '🚰 Air dibuka. Pegang <b>span</b> dan sental piring petri.' : 'Paip ditutup — jimat air! 💧');
      } else if (t === drawer) {
        if (stored.size < 3) return S.info('Simpan <b>semua</b> alat di dalam laci dahulu.');
        if (closed) return;
        closed = true; const z0 = drawer.position.z;
        S.tween(0.8, k => drawer.position.z = z0 - k * 0.3);
        S.evt('close', 'laci'); S.info('🔒 Laci ditutup. Peralatan disimpan dengan <b>betul dan selamat</b>!');
      }
    },
  };
}

// ------------------------------------------------------------ boot
const LEVELS = [
  { id: 'L1', title: 'Memerhati dengan deria', sp: 'SP 1.1.1', make: L1 },
  { id: 'L2', title: 'Kendalikan spesimen', sp: 'SP 1.2.1 · 1.2.2', make: L2 },
  { id: 'L3', title: 'Lakar & berkomunikasi', sp: 'SP 1.2.3 · 1.1.2', make: L3 },
  { id: 'L4', title: 'Bersih & simpan alat', sp: 'SP 1.2.4 · 1.2.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Saintis Cilik — Kemahiran Saintifik',
  intro: '<b>Sains Tahun 1 · Unit 1.</b> Jadi saintis! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / lakar · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
