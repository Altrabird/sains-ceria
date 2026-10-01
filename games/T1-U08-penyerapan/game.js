// Sains Tahun 1 · Unit 8 Penyerapan (SP 8.1.1 – 8.1.6) — which objects absorb water, how much, why it matters, a mini mop.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const WATER = 0x4fc3f7;
const drop = () => mesh(new THREE.SphereGeometry(0.008, 12, 10).scale(1, 1.3, 1), M(WATER, { transparent: true, opacity: 0.85, roughness: 0.05 }));
function dropper(name = 'penitis') {
  return group(name, mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12), M(0xe0f7fa, { transparent: true, opacity: 0.6 }), 0, 0.05, 0),
    mesh(new THREE.CylinderGeometry(0.0025, 0.006, 0.025, 10), M(0xe0f7fa, { transparent: true, opacity: 0.6 }), 0, 0.0, 0),
    mesh(new THREE.SphereGeometry(0.011, 12, 10).scale(1, 1.4, 1), M(0xff7043), 0, 0.1, 0),
    mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 12), M(WATER, { transparent: true, opacity: 0.7 }), 0, 0.04, 0));
}
const cloth = (name, color, w = 0.09, d = 0.07) => group(name, mesh(new THREE.BoxGeometry(w, 0.006, d), M(color, { roughness: 1 }), 0, 0.003, 0));

// ------------------------------------------------------------ L1 Objek dan air: drip water, watch who absorbs it
function paperRoll(n) { return group(n, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 20), M(0xfafafa, { roughness: 1 }), 0, 0.03, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.092, 12), M(0xbcaaa4), 0, 0.03, 0).rotateZ(Math.PI / 2)); }
function glass(n) { return group(n, mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.08, 20, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.05 }), 0, 0.04, 0), mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.004, 20), M(0xe1f5fe, { transparent: true, opacity: 0.5 }), 0, 0.002, 0)); }
function spoon(n) { return group(n, mesh(new THREE.SphereGeometry(0.018, 14, 8, 0, 6.3, 1.6, 1.5).scale(1.3, 0.4, 1), M(0xcfd8dc, { metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide }), 0.03, 0.008, 0), mesh(new THREE.BoxGeometry(0.07, 0.003, 0.008), M(0xcfd8dc, { metalness: 0.9, roughness: 0.2 }), -0.025, 0.006, 0)); }
function toyCar(n) { return group(n, mesh(new THREE.BoxGeometry(0.07, 0.025, 0.04), M(0xe53935, { roughness: 0.3 }), 0, 0.022, 0), mesh(new THREE.BoxGeometry(0.035, 0.02, 0.035), M(0xe53935, { roughness: 0.3 }), -0.005, 0.044, 0), ...[[0.022, 0.02], [-0.022, 0.02], [0.022, -0.02], [-0.022, -0.02]].map(([x, z]) => mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12), M(0x212121), x, 0.009, z).rotateX(Math.PI / 2))); }
function clip(n) { const loop = r => new THREE.TorusGeometry(r, 0.0015, 6, 20).rotateX(Math.PI / 2).scale(2, 1, 1); return group(n, mesh(loop(0.009), M(0xcfd8dc, { metalness: 0.8 }), 0, 0.002, 0), mesh(loop(0.006), M(0xcfd8dc, { metalness: 0.8 }), 0.004, 0.002, 0)); }
const OBJ = [['tisu_dapur', 'Tisu dapur', paperRoll, true], ['kain_lap', 'Kain lap', n => cloth(n, 0x42a5f5), true], ['kertas', 'Kertas', n => cloth(n, 0xffffff, 0.08, 0.1), true], ['sapu_tangan', 'Sapu tangan', n => cloth(n, 0xf8bbd0, 0.08, 0.08), true],
  ['gelas_kaca', 'Gelas kaca', glass, false], ['sudu_logam', 'Sudu logam', spoon, false], ['mainan_plastik', 'Mainan plastik', toyCar, false], ['klip_kertas', 'Klip kertas', clip, false]];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.9, play));
  const mix = [0, 5, 2, 7, 4, 1, 6, 3];
  const objs = OBJ.map(([id, label, make, absorbs], i) => {
    const o = make(id); o.scale.setScalar(1.6); o.position.set(-0.55 + (mix[i] % 4) * 0.3, 0, -0.18 + Math.floor(mix[i] / 4) * 0.26);
    o.userData = { label, absorbs }; const t = textSprite(label, { h: 0.026 }); t.position.set(0, 0.012, 0.075); o.add(t); root.add(o); return o;
  });
  const dp = dropper(); dp.position.set(0.62, 0, 0.3); dp.userData.carryY = 0.12; root.add(home(dp));
  const dl = textSprite('Penitis', { h: 0.028 }); dl.position.set(0.62, 0.02, 0.38); root.add(dl);
  const tested = new Set(); let tapping = false; const found = new Set();
  const dr = dragger(S, () => [dp], {
    async onDrop(p) {
      const o = objs.find(o => flat(o.position, p.position) < 0.1);
      if (!o) return;
      const box = new THREE.Box3().setFromObject(o), top = box.max.y;
      const d = drop(); d.position.set(o.position.x, 0.12, o.position.z); root.add(d);
      await S.tween(0.4, k => d.position.y = 0.12 - k * (0.12 - top - 0.006));
      if (o.userData.absorbs) {  // soaks in: a dark wet patch spreads, the drop vanishes
        const wet = mesh(new THREE.CircleGeometry(0.02, 20), new THREE.MeshBasicMaterial({ color: 0x1565c0, transparent: true, opacity: 0, depthWrite: false })); wet.rotation.x = -Math.PI / 2; wet.position.set(o.position.x, top + 0.001, o.position.z); wet.userData.fx = true; root.add(wet);
        await S.tween(1, k => { d.scale.setScalar(1 - k); wet.scale.setScalar(1 + k * 0.6); wet.material.opacity = k * 0.35; });
        root.remove(d); S.info(`💧 <b>${o.userData.label}</b> menyerap air — titisan air hilang dan objek menjadi basah.`);
      } else {  // beads up and stays
        await S.tween(0.5, k => d.scale.set(1 + k * 0.4, 1 - k * 0.4, 1 + k * 0.4));
        S.info(`💧 <b>${o.userData.label}</b> tidak menyerap air — titisan air kekal di atasnya.`);
      }
      tested.add(o); S.evt('drip', o.name, { absorbs: o.userData.absorbs });
      if (tested.size === 8 && !tapping) { tapping = true; setTimeout(() => S.info('🔍 Sekarang tuding semua objek yang <b>boleh menyerap air</b>.'), 2500); }
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (tapping ? S.hitTest(x, y, objs)?.name ?? null : null),
    tap(x, y) {
      if (!tapping) return;
      const o = S.hitTest(x, y, objs); if (!o) return;
      if (!o.userData.absorbs) return S.info(`🤔 ${o.userData.label} tidak menyerap air. Lihat titisan air di atasnya.`);
      if (!found.has(o)) { found.add(o); const c = emojiSprite('✅', 0.05); c.position.set(0, 0.1, 0); o.add(c); }
      S.evt('absorb', o.name); S.info(`✅ ${o.userData.label} <b>boleh menyerap air</b>.`);
    },
  };
}

// ------------------------------------------------------------ L2 Keupayaan menyerap: soak, squeeze, compare (fair test)
function cylinder(name) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 20, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.08, 0),
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 20), M(0xe1f5fe, { transparent: true, opacity: 0.6 }), 0, 0.003, 0));
  for (let i = 1; i <= 4; i++) g.add(mesh(new THREE.BoxGeometry(0.012, 0.002, 0.002), M(0x37474f), 0.025, i * 0.03, 0.026));
  const w = mesh(new THREE.CylinderGeometry(0.028, 0.028, 1, 20), M(WATER, { transparent: true, opacity: 0.75 }), 0, 0, 0); w.name = 'air'; w.scale.y = 0.0001; w.userData.fx = true; g.add(w);
  const funnel = mesh(new THREE.ConeGeometry(0.05, 0.05, 20, 1, true), M(0xeeeeee, { transparent: true, opacity: 0.6, side: THREE.DoubleSide }), 0, 0.2, 0); funnel.rotation.x = Math.PI; g.add(funnel);
  return g;
}
const MATS = [['kain_lap', 'Kain lap', 0x42a5f5, 40], ['tisu', 'Kertas tisu', 0xffffff, 10], ['kapas', 'Kapas muka', 0xfff8e1, 25]];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.9, play));
  const basin = group('besen', mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.06, 28, 1, true), M(0x90a4ae, { side: THREE.DoubleSide }), 0, 0.03, 0),
    mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.004, 28), M(WATER, { transparent: true, opacity: 0.7 }), 0, 0.045, 0));
  basin.position.set(-0.45, 0, -0.15); root.add(basin);
  const bl = textSprite('Besen air (rendam 20 saat)', { h: 0.028 }); bl.position.set(-0.45, 0.1, -0.15); root.add(bl);
  const cyls = MATS.map(([id, label], i) => { const c = cylinder('silinder_' + id); c.position.set(0.05 + i * 0.22, 0, -0.2); root.add(c); const t = textSprite(label, { h: 0.032 }); t.position.set(0, 0.27, 0); c.add(t); return c; });
  const mats = MATS.map(([id, label, color], i) => { const m = cloth(id, color, 0.1, 0.1); m.position.set(-0.45 + i * 0.22, 0, 0.25); m.userData.carryY = 0.05; root.add(home(m)); const t = textSprite(label, { h: 0.032 }); t.position.set(0, 0.02, 0.08); m.add(t); return m; });
  const same = textSprite('Ujian adil: saiz bahan sama', { h: 0.026, bg: '#fff59dee' }); same.position.set(-0.15, 0.02, 0.4); root.add(same);
  const soaked = new Set(), squeezed = new Map(); let order = [];
  const dr = dragger(S, () => mats.filter(m => !squeezed.has(m)), {
    async onDrop(m, x, y) {
      if (flat(m.position, basin.position) < 0.13 || nearScreen(S, basin, x, y, 0.04, 80)) {
        moveTo(S, m, basin.position.clone().setY(0.04)); S.info(`⏱️ ${MATS.find(x => x[0] === m.name)[1]} direndam…`, 3);
        await S.wait(2); soaked.add(m); m.children[0].material.color.multiplyScalar(0.8);
        S.info(`✅ Direndam 20 saat. Sekarang perah ${MATS.find(x => x[0] === m.name)[1].toLowerCase()} di atas silinder penyukatnya.`);
        return;
      }
      const c = cyls.find(c => flat(c.position, m.position) < 0.1 || nearScreen(S, c, x, y, 0.2) || nearScreen(S, c, x, y, 0.08));  // funnel or tube
      if (!c) return goHome(S, m);
      if (!soaked.has(m)) { S.info('Rendam bahan di dalam <b>besen air</b> dahulu.'); return goHome(S, m); }
      if (c.name !== 'silinder_' + m.name) { S.info('Perah di atas silinder yang berlabel sama.'); return; }
      const ml = MATS.find(x => x[0] === m.name)[3];
      moveTo(S, m, c.position.clone().setY(0.25));
      await S.tween(0.8, k => m.scale.set(1 - k * 0.5, 1 + k * 2, 1 - k * 0.5));  // squeeze
      const w = c.getObjectByName('air'), h = ml / 40 * 0.12;
      for (let i = 0; i < 4; i++) { const d = drop(); d.position.set(c.position.x, 0.2, c.position.z); root.add(d); S.tween(0.5, k => d.position.y = 0.2 - k * 0.15, () => root.remove(d)); await S.wait(0.15); }
      await S.tween(1.2, k => { w.scale.y = Math.max(0.0001, k * h); w.position.y = k * h / 2 + 0.005; });
      squeezed.set(m, ml); m.visible = false;
      const t = textSprite(`${ml} ml`, { h: 0.03, bg: '#b3e5fcee' }); t.position.set(0, 0.17, 0.04); c.add(t);
      S.evt('squeeze', m.name); S.info(`🥛 ${MATS.find(x => x[0] === m.name)[1]}: <b>${ml} ml</b> air dikumpulkan.`);
      if (squeezed.size === 3) setTimeout(() => S.info('📊 Tuding silinder mengikut susunan: air <b>paling sedikit</b> dahulu hingga <b>paling banyak</b>.', 9), 1800);
    },
  });
  const want = ['tisu', 'kapas', 'kain_lap'];
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (squeezed.size === 3 ? S.hitTest(x, y, cyls)?.name ?? null : null),
    tap(x, y) {
      if (squeezed.size < 3) return;
      const c = S.hitTest(x, y, cyls); if (!c) return;
      const id = c.name.replace('silinder_', '');
      if (order.includes(id)) return;
      if (id !== want[order.length]) { order = []; return S.info('🤔 Mula semula: tuding silinder dengan air <b>paling sedikit</b> dahulu.'); }
      order.push(id); S.star(c.position.clone().setY(0.3)); S.evt('rank', id);
      S.info(order.length < 3 ? `${order.length}. ${MATS.find(x => x[0] === id)[1]} (${MATS.find(x => x[0] === id)[3]} ml)` : '🎉 Kertas tisu → kapas muka → kain lap. <b>Lebih banyak air dikumpulkan, lebih banyak air diserap.</b>', 9);
    },
  };
}

// ------------------------------------------------------------ L3 Kepentingan penyerapan: the right material for each job
function umbrella(n) { const g = group(n, mesh(new THREE.ConeGeometry(0.08, 0.04, 8, 1, true), M(0xfdd835, { side: THREE.DoubleSide }), 0, 0.15, 0), mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15), M(0x5d4037), 0, 0.075, 0)); return g; }
const boots = n => group(n, ...[-0.022, 0.022].map(x => group('', mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 14), M(0xfdd835), x, 0.03, 0), mesh(new THREE.BoxGeometry(0.03, 0.016, 0.045), M(0xfdd835), x, 0.008, 0.012))));
const ITEMS = [['tuala', 'Tuala', n => cloth(n, 0xf48fb1, 0.1, 0.07), 'mandi', '🛁 Tuala <b>menyerap air</b> untuk mengeringkan badan.'],
  ['kain_lap', 'Kain lap', n => cloth(n, 0x66bb6a, 0.08, 0.07), 'tumpah', '🧽 Kain lap <b>menyerap air</b> untuk mengeringkan tumpahan.'],
  ['payung', 'Payung plastik', umbrella, 'hujan', '☂️ Payung plastik <b>tidak menyerap air</b>, jadi ia melindungi diri daripada air hujan.'],
  ['kasut_getah', 'Kasut getah', boots, 'lopak', '👢 Kasut getah <b>tidak menyerap air</b>, jadi kaki tidak basah.']];
function L3(S, play) {
  const root = group('L3', table(1.5, 0.9, play));
  const scenes = [['mandi', '🚿 Badan basah selepas mandi'], ['tumpah', '🥛 Air tertumpah di atas meja'], ['hujan', '🌧️ Hujan turun'], ['lopak', '💦 Berjalan dalam lopak air']]
    .map(([id, label], i) => {
      const k = kid('situasi_' + id, { shirt: [0x42a5f5, 0xffffff, 0xff8a65, 0x9ccc65][i] }); k.position.set(-0.54 + i * 0.36, 0, -0.18); root.add(k);
      const t = textSprite(label, { h: 0.026 }); t.position.set(0, 0.3, 0); k.add(t); k.userData.id = id;
      if (id === 'tumpah' || id === 'lopak') { const p = mesh(new THREE.CircleGeometry(0.06, 24), M(WATER, { transparent: true, opacity: 0.6 })); p.rotation.x = -Math.PI / 2; p.position.set(0.07, 0.002, 0.06); p.userData.fx = true; k.add(p); }
      return k;
    });
  const drops = [];
  for (let i = 0; i < 25; i++) { const d = mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.025), M(WATER, { transparent: true, opacity: 0.7 })); d.userData.fx = true; d.position.set(0.18 + Math.random() * 0.2 - 0.1, Math.random() * 0.4, -0.18 + Math.random() * 0.15 - 0.07); drops.push(d); root.add(d); }
  const mix = [2, 0, 3, 1];
  const items = ITEMS.map(([id, label, make], i) => { const o = make(id); o.scale.setScalar(id === 'payung' ? 0.75 : 1.3); o.position.set(-0.54 + mix[i] * 0.36, 0, 0.28); root.add(home(o)); const t = textSprite(label, { h: 0.026 }); t.position.set(0, 0.02, 0.07); o.add(t); return o; });
  const done = new Set();
  const dr = dragger(S, () => items.filter(o => !done.has(o)), {
    onDrop(o) {
      const k = scenes.find(k => flat(k.position, o.position) < 0.15);
      if (!k) return goHome(S, o);
      const it = ITEMS.find(x => x[0] === o.name);
      if (it[3] !== k.userData.id) { S.info(`🤔 ${it[1]} ${['tuala', 'kain_lap'].includes(o.name) ? 'menyerap air' : 'tidak menyerap air'}. Adakah itu sesuai di situ?`); return goHome(S, o); }
      done.add(o); moveTo(S, o, k.position.clone().add(new THREE.Vector3(0.07, 0, 0.07)));
      if (k.userData.id === 'hujan') { moveTo(S, o, k.position.clone().add(new THREE.Vector3(0, 0.12, 0))); }
      if (k.userData.id === 'tumpah') k.children.filter(c => c.geometry?.type === 'CircleGeometry').forEach(p => S.tween(1.5, t => p.scale.setScalar(1 - t * 0.99)));
      S.evt('use', o.name); S.star(k.position.clone().setY(0.35)); S.info(it[4], 7);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    update(dt) { for (const d of drops) { d.position.y -= dt * 0.8; if (d.position.y < 0) d.position.y = 0.4; } },
  };
}

// ------------------------------------------------------------ L4 Reka cipta mop mini
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const YARN = 0xffb74d;
  const threads = [...Array(5)].map((_, i) => { const t = group('benang' + (i + 1), mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), M(YARN, { roughness: 1 }), 0, 0.005, 0).rotateZ(Math.PI / 2)); t.position.set(-0.4 + i * 0.03, 0, 0.12 + i * 0.05); root.add(home(t)); return t; });
  const tie = group('ikatan', mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 20), M(0xffd84d, { transparent: true, opacity: 0.7 }), 0, 0.002, 0)); tie.position.set(-0.2, 0, -0.05); root.add(tie);
  const tl = textSprite('Ikat tali di sini', { h: 0.026 }); tl.position.set(-0.2, 0.03, 0.02); root.add(tl);
  const pen = group('pen_kosong', mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 12), M(0xbbdefb, { transparent: true, opacity: 0.75 }), 0, 0.01, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.03, 12), M(0x1565c0), 0.11, 0.01, 0).rotateZ(Math.PI / 2));
  const pl = textSprite('Pen kosong', { h: 0.03 }); pl.position.set(0, 0.04, 0.04); pen.add(pl);
  pen.position.set(0.15, 0, -0.1); root.add(pen);
  const spill = mesh(new THREE.CircleGeometry(0.1, 32), M(WATER, { transparent: true, opacity: 0.6 })); spill.rotation.x = -Math.PI / 2; spill.position.set(0.45, 0.002, 0.15); spill.name = 'tumpahan'; spill.userData.fx = true; root.add(spill);
  const sl = textSprite('Tumpahan air', { h: 0.026 }); sl.position.set(0.45, 0.03, 0.28); root.add(sl);
  let tied = 0, bundle = null, mop = null, spread = false, wiped = 0;
  const dr = dragger(S, () => (mop ? [mop] : bundle ? [bundle] : threads.filter(t => t.visible)), {
    onDrop(o) {
      if (threads.includes(o)) {
        if (flat(o.position, tie.position) > 0.08) return goHome(S, o);
        o.visible = false; tied++; S.evt('thread', o.name);
        if (tied === 5) {
          bundle = group('ikatan_benang', ...[...Array(5)].map((_, i) => mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), M(YARN), 0, 0.008, (i - 2) * 0.006).rotateZ(Math.PI / 2)), mesh(new THREE.TorusGeometry(0.008, 0.002, 6, 12), M(0xe53935), 0, 0.006, 0).rotateY(Math.PI / 2));
          bundle.position.copy(tie.position); root.add(bundle); tie.visible = tl.visible = false;
          S.info('🧵 Lima utas tali diikat di bahagian tengah. Masukkan ikatan tali ke dalam <b>pen kosong</b>.');
        } else S.info(`🧵 ${tied}/5 utas tali.`);
        return;
      }
      if (o === bundle) {
        if (flat(o.position, pen.position) > 0.12) return;
        root.remove(bundle); bundle = null;
        mop = group('mop', pen); pen.position.set(0, 0, 0); mop.position.set(0.15, 0, -0.1); root.add(mop);
        const head = group('kepala_mop', ...[...Array(10)].map((_, i) => mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), M(YARN), -0.15, 0.008, (i - 4.5) * 0.004).rotateZ(Math.PI / 2)));
        mop.add(head); mop.userData.carryY = 0;
        S.evt('insert', 'pen'); S.info('🖊️ Tali dimasukkan ke dalam pen dan diikat dengan getah. Tuding hujung tali untuk <b>mencerai-ceraikan</b> benang.');
        return;
      }
    },
    onDrag(o, dt, prev) {
      if (o !== mop || !spread) return;
      const head = mop.localToWorld(new THREE.Vector3(-0.17, 0, 0)); root.worldToLocal(head);
      if (flat(head, spill.position) > 0.1 * spill.scale.x + 0.03) return;
      wiped += flat(o.position, prev); spill.scale.setScalar(Math.max(0.01, 1 - wiped / 0.8));
      if (wiped >= 0.8 && spill.visible) {
        spill.visible = false; S.evt('mop', 'tumpahan'); S.star(spill.position.clone().setY(0.15));
        S.info('✨ Mop mini <b>menyerap</b> tumpahan air! Benang menyerap air.');
      }
    },
  });
  return {
    root, view: { w: 1.15, d: 0.7 }, ...dr,
    hit: (x, y) => (mop && !spread ? S.hitTest(x, y, [mop])?.name ?? null : null),
    tap(x, y) {
      if (!mop || spread || S.hitTest(x, y, [mop]) !== mop) return;
      spread = true; const head = mop.getObjectByName('kepala_mop');
      head.children.forEach((m, i) => S.tween(0.5, k => { m.rotation.y = (i - 4.5) * 0.12 * k; m.position.x = -0.15 - k * 0.01; }));
      S.evt('spread', 'mop'); S.info('🧹 Kepala mop siap! Sekarang uji mop: gerakkan mop di atas <b>tumpahan air</b>.');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Objek dan air', sp: 'SP 8.1.1 · 8.1.2', make: L1 },
  { id: 'L2', title: 'Keupayaan menyerap air', sp: 'SP 8.1.3', make: L2 },
  { id: 'L3', title: 'Kepentingan penyerapan', sp: 'SP 8.1.4', make: L3 },
  { id: 'L4', title: 'Reka cipta mop mini', sp: 'SP 8.1.5 · 8.1.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Penyerapan',
  intro: '<b>Sains Tahun 1 · Unit 8.</b> Objek mana yang menyerap air? Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
