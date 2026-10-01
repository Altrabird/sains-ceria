// Sains Tahun 1 · Unit 2 Peraturan Bilik Sains (SP 2.1.1) — queue + permission, spot the rule-breakers, tidy up.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sink, beaker, labTable, stool, kid, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const face = (o, x, z) => o.rotation.y = Math.atan2(x - o.position.x, z - o.position.z);  // turn a figure to look at (x, z)
function bubble(S, root, text, at, secs = 3) {
  const b = textSprite(text, { h: 0.045, bg: '#fffbe6f0' }); b.position.copy(at); root.add(b);
  setTimeout(() => root.remove(b), secs * 1000);
}

// ------------------------------------------------------------ L1 Sebelum masuk: queue, then ask the teacher
function door() {
  const frame = group('', ...[[-0.11, 0.15, 0.02, 0.3], [0.11, 0.15, 0.02, 0.3], [0, 0.3, 0.24, 0.02]].map(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, 0.03), M(0x8a5a2e), x, y, 0)));
  const panel = mesh(new THREE.BoxGeometry(0.2, 0.29, 0.015), M(0xc98a4b), 0.1, 0.145, 0);
  panel.add(mesh(new THREE.BoxGeometry(0.05, 0.08, 0.017), M(0xbfe3ff), 0.04, 0.06, 0), mesh(new THREE.SphereGeometry(0.008), M(0xffd24a, { metalness: 0.7 }), 0.07, -0.01, 0.012));
  const hinge = group('pintu_engsel', panel); hinge.position.x = -0.1;
  const wall = mesh(new THREE.BoxGeometry(0.7, 0.32, 0.02), M(0xe9dcc8), 0, 0.16, -0.012);
  wall.add(mesh(new THREE.BoxGeometry(0.22, 0.3, 0.03), M(0x2a2a2a), 0, -0.01, 0));  // the doorway (dark behind the door)
  const sign = textSprite('BILIK SAINS', { h: 0.04, bg: '#ffffff', fg: '#1f4fa8' }); sign.position.set(0, 0.36, 0.02);
  return group('pintu', wall, frame, hinge, sign);
}
function L1(S, play) {
  const root = group('L1', table(1.4, 0.8, play));
  const d = door(); d.position.set(0.3, 0, -0.3); root.add(d);
  const teacher = kid('guru', { shirt: 0xf2a7c3, pants: 0x1d2b53, girl: true, scale: 1.35, hair: 0x3b2314 });
  teacher.position.set(0.55, 0, -0.14); face(teacher, 0, 0.1); root.add(teacher);
  const spots = [0.2, 0.02, -0.16].map((x, i) => {
    const m = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 24), M(0xffd84d), x, 0.002, -0.05);
    const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set(x, 0.02, 0.01); root.add(m, n); return m;
  });
  const kids = [['murid1', { shirt: 0xffffff, pants: 0x1f4fa8 }], ['murid2', { shirt: 0xffffff, pants: 0x1d2b53, girl: true }], ['murid3', { shirt: 0xffffff, pants: 0x1f4fa8, hair: 0x111111 }]]
    .map(([id, o], i) => { const k = kid(id, o); k.position.set([-0.55, -0.38, -0.2][i], 0, [0.22, -0.12, 0.25][i]); k.rotation.y = [0.6, -0.3, 0.2][i]; root.add(home(k)); return k; });
  const lbl = textSprite('Cikgu', { h: 0.03 }); lbl.position.set(0.55, 0.34, -0.14); root.add(lbl);
  const inLine = new Map(); let open = false;
  const dr = dragger(S, () => (open ? [] : kids.filter(k => !inLine.has(k))), {
    onDrop(k) {
      const i = spots.findIndex((s, j) => ![...inLine.values()].includes(j) && flat(s.position, k.position) < 0.1);
      if (i < 0) { S.info('Beratur di atas <b>tanda kuning</b> di depan pintu.'); return goHome(S, k); }
      inLine.set(k, i); moveTo(S, k, new THREE.Vector3(spots[i].position.x, 0, spots[i].position.z));
      k.rotation.y = Math.PI / 2;  // face the door
      S.evt('queue', k.name);
      S.info(inLine.size < 3 ? `✅ Bagus! <b>${3 - inLine.size}</b> murid lagi perlu beratur.` : '✅ Semua murid sudah beratur. Sekarang tuding <b>Cikgu</b> untuk minta kebenaran.');
    },
  });
  const tapTargets = () => [teacher, ...kids];
  return {
    root, view: { w: 1.4, d: 0.8 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [teacher])?.name ?? null,
    async tap(x, y) {
      const t = S.hitTest(x, y, tapTargets());
      if (t !== teacher || open) return;
      if (inLine.size < 3) { bubble(S, root, 'Beratur dahulu, ya!', new THREE.Vector3(0.55, 0.42, -0.14)); return S.info('👩‍🏫 Cikgu: “Beratur dahulu sebelum masuk.”'); }
      open = true;
      bubble(S, root, 'Minta kebenaran masuk, cikgu?', new THREE.Vector3(0.2, 0.3, -0.05), 2);
      await S.wait(1.2);
      bubble(S, root, 'Boleh! Silakan masuk.', new THREE.Vector3(0.55, 0.42, -0.14), 3);
      S.evt('ask', 'guru'); S.info('👩‍🏫 Cikgu memberi <b>kebenaran</b>. Murid masuk ke Bilik Sains dengan tertib.');
      const hinge = d.getObjectByName('pintu_engsel');
      await S.tween(0.8, t => hinge.rotation.y = t * 1.6);
      const doorPt = new THREE.Vector3(0.3, 0, -0.32);
      for (const [k, i] of [...inLine].sort((a, b) => a[1] - b[1])) {
        face(k, doorPt.x, doorPt.z); await moveTo(S, k, doorPt, 0.6); k.visible = false;
      }
    },
  };
}

// ------------------------------------------------------------ L2 Semasa aktiviti: spot who breaks the rules
const burger = () => group('', mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.01, 16), M(0xd99a4e), 0, 0, 0),
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 16), M(0x6b3a1f), 0, 0.009, 0), mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.003, 16), M(0x4caf50), 0, 0.014, 0),
  mesh(new THREE.SphereGeometry(0.019, 16, 8, 0, 6.3, 0, 1.4), M(0xd99a4e), 0, 0.016, 0));
const cup = () => group('', mesh(new THREE.CylinderGeometry(0.014, 0.011, 0.04, 16), M(0xe53935), 0, 0, 0), mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.04), M(0xffffff), 0.004, 0.03, 0));
function L2(S, play) {
  const root = group('L2', table(1.4, 0.8, play));
  for (const [x, n] of [[-0.25, 'meja1'], [0.28, 'meja2']]) {
    const t = labTable(n); t.position.set(x, 0, -0.22); root.add(t);
    const b = beaker(); b.position.set(x, 0.168, -0.22); b.scale.setScalar(0.8); root.add(b);
  }
  const RULE = {
    berlari: '🚫 Dilarang <b>berlari</b> di dalam Bilik Sains — anda boleh jatuh dan tercedera.',
    makan: '🚫 Dilarang <b>makan</b> di dalam Bilik Sains — makanan boleh tercemar bahan kimia.',
    minum: '🚫 Dilarang <b>minum</b> di dalam Bilik Sains.',
    bermain: '🚫 Dilarang <b>bermain dan bergurau</b> di dalam Bilik Sains — bermain boleh mencederakan kamu.',
  };
  const mk = (id, o, x, z, rot) => { const k = kid(id, o); k.position.set(x, 0, z); k.rotation.y = rot; root.add(k); return k; };
  const runner = mk('berlari', { shirt: 0xffffff, pants: 0x1f4fa8 }, 0, 0, 0);
  const eater = mk('makan', { shirt: 0xffffff, pants: 0x1f4fa8, hair: 0x111111 }, -0.12, 0.08, 0.3);
  const drinker = mk('minum', { shirt: 0xffffff, pants: 0x1d2b53, girl: true }, 0.12, 0.1, -0.2);
  const player = mk('bermain', { shirt: 0xffffff, pants: 0x1f4fa8 }, 0.48, 0.12, -0.4);
  const good = [mk('baik1', { shirt: 0xffffff, pants: 0x1d2b53, girl: true }, -0.52, -0.18, Math.PI / 2), mk('baik2', { shirt: 0xffffff, pants: 0x1f4fa8 }, 0.56, -0.2, -Math.PI / 2)];
  const goggles = k => k.getObjectByName('kepala').add(mesh(new THREE.BoxGeometry(0.05, 0.014, 0.01), M(0x66ccff, { transparent: true, opacity: 0.7 }), 0, 0.005, 0.033));
  good.forEach(goggles);
  const food = burger(); food.position.set(0, -0.07, 0.02); eater.getObjectByName('tanganR').add(food);
  const drink = cup(); drink.position.set(0, -0.07, 0.02); drinker.getObjectByName('tanganR').add(drink);
  const ball = mesh(new THREE.SphereGeometry(0.02, 16, 12), M(0xff7043)); ball.position.set(0.5, 0.25, 0.18); root.add(ball);
  const bad = [runner, eater, drinker, player], stopped = new Set();
  let t = 0;
  const pickable = () => [...bad, ...good];
  const find = (x, y) => S.hitTest(x, y, pickable()) || S.nearest(x, y, pickable(), 45);
  return {
    root, view: { w: 1.4, d: 0.8 },
    hit: (x, y) => find(x, y)?.name ?? null,
    tap(x, y) {
      const k = find(x, y); if (!k) return;
      if (good.includes(k)) { S.evt('good', k.name); bubble(S, root, '👍', k.position.clone().setY(0.3), 1.5); return S.info('👍 Murid ini <b>mematuhi peraturan</b>: memakai gogal dan menjalankan aktiviti dengan tertib.'); }
      if (stopped.has(k)) return S.info(RULE[k.name]);
      stopped.add(k);
      if (k === eater) food.visible = false;
      if (k === drinker) drink.visible = false;
      if (k === player) ball.visible = false;
      ['tanganL', 'tanganR', 'kakiL', 'kakiR'].forEach(n => k.getObjectByName(n).rotation.x = 0);
      const mark = emojiSprite('✅', 0.07); mark.position.set(0, 0.3, 0); k.add(mark);
      S.star(k.position.clone().setY(0.35)); S.evt('spot', k.name); S.info(RULE[k.name], 7);
      if (stopped.size === 4) setTimeout(() => S.info('🎉 Semua murid kini patuh. Tuding murid yang <b>sentiasa mematuhi peraturan</b>.'), 3000);
    },
    update(dt) {
      t += dt;
      if (!stopped.has(runner)) {
        const a = t * 0.7, x = Math.cos(a) * 0.5, z = 0.3 + Math.sin(a) * 0.07;
        runner.position.set(x, Math.abs(Math.sin(t * 9)) * 0.01, z); runner.rotation.y = Math.atan2(-Math.sin(a) * 0.5, Math.cos(a) * 0.07);
        runner.getObjectByName('kakiL').rotation.x = Math.sin(t * 9) * 0.7; runner.getObjectByName('kakiR').rotation.x = -Math.sin(t * 9) * 0.7;
        runner.getObjectByName('tanganL').rotation.x = -Math.sin(t * 9) * 0.6; runner.getObjectByName('tanganR').rotation.x = Math.sin(t * 9) * 0.6;
      }
      if (!stopped.has(eater)) eater.getObjectByName('tanganR').rotation.x = -1.6 - Math.max(0, Math.sin(t * 2)) * 0.6;
      if (!stopped.has(drinker)) drinker.getObjectByName('tanganR').rotation.x = -2.0 - Math.max(0, Math.sin(t * 1.5 + 1)) * 0.4;
      if (!stopped.has(player)) {
        ball.position.y = 0.2 + Math.abs(Math.sin(t * 3)) * 0.15;
        player.getObjectByName('tanganL').rotation.x = player.getObjectByName('tanganR').rotation.x = -2.6 + Math.abs(Math.sin(t * 3)) * 0.4;
      }
    },
  };
}

// ------------------------------------------------------------ L3 Selepas aktiviti: unclog the sink, tidy, push in the stool
function L3(S, play) {
  const root = group('L3', table(1.5, 0.8, play));
  const sk = sink(); sk.position.set(-0.4, 0, -0.12); root.add(sk);
  const water = mesh(new THREE.BoxGeometry(0.37, 0.03, 0.25), M(0x8a8a5c, { transparent: true, opacity: 0.75 }), -0.4, 0.07, -0.12); water.userData.fx = true; root.add(water);
  const tissue = group('tisu', mesh(new THREE.IcosahedronGeometry(0.022, 0), M(0xffffff, { flatShading: true })));
  const leafy = group('daun', mesh(new THREE.SphereGeometry(0.022, 10, 6).scale(1, 0.25, 0.6), M(0x3fa34d)));
  const peel = group('kulit_oren', mesh(new THREE.SphereGeometry(0.02, 12, 8, 0, 6.3, 0, 1.4), M(0xff9800, { side: THREE.DoubleSide })));
  const litter = [tissue, leafy, peel];
  litter.forEach((o, i) => { o.position.set(-0.47 + i * 0.07, 0.09, -0.12 + (i - 1) * 0.04); o.userData.carryY = 0.05; root.add(home(o)); });
  const bin = group('tong_sampah', mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 20, 1, true), M(0x555b66, { side: THREE.DoubleSide }), 0, 0.065, 0),
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.005, 20), M(0x444444), 0, 0.003, 0));
  bin.position.set(-0.55, 0, 0.25); root.add(bin);
  const binL = textSprite('Tong sampah', { h: 0.03 }); binL.position.set(-0.55, 0.18, 0.25); root.add(binL);
  const bench = labTable('meja', 0.38, 0.22); bench.position.set(0.1, 0, -0.18); root.add(bench);
  const bk = beaker(); bk.position.set(0.02, 0.168, -0.15); bk.userData.carryY = 0.17;
  const book = group('buku', mesh(new THREE.BoxGeometry(0.08, 0.015, 0.06), M(0x43a047), 0, 0.008, 0), mesh(new THREE.BoxGeometry(0.075, 0.012, 0.055), M(0xffffff), 0.003, 0.008, 0));
  book.position.set(0.17, 0.168, -0.17); book.userData.carryY = 0.17;
  root.add(home(bk), home(book));
  const shelf = group('rak', mesh(new THREE.BoxGeometry(0.3, 0.012, 0.12), M(0xb07a45), 0, 0.12, 0), mesh(new THREE.BoxGeometry(0.3, 0.012, 0.12), M(0xb07a45), 0, 0.006, 0),
    ...[-0.15, 0.15].map(x => mesh(new THREE.BoxGeometry(0.012, 0.25, 0.12), M(0x8a5a2e), x, 0.125, 0)), mesh(new THREE.BoxGeometry(0.3, 0.012, 0.12), M(0xb07a45), 0, 0.245, 0));
  shelf.position.set(0.55, 0, -0.22); root.add(shelf);
  const shelfL = textSprite('Rak', { h: 0.03 }); shelfL.position.set(0.55, 0.3, -0.22); root.add(shelfL);
  const seat = stool(); seat.position.set(0.12, 0, 0.12); root.add(seat);
  const binned = new Set(), stored = new Set(); let tucked = false;
  const dr = dragger(S, () => [...litter.filter(o => !binned.has(o)), ...[bk, book].filter(o => !stored.has(o))], {
    onDrop(o) {
      if (litter.includes(o)) {
        if (flat(o.position, bin.position) > 0.12) { S.info('Buang sampah ke dalam <b>tong sampah</b>.'); return goHome(S, o); }
        binned.add(o); moveTo(S, o, bin.position.clone().setY(0.05)).then(() => o.visible = false);
        S.evt('litter', o.name);
        const left = 3 - binned.size;
        S.tween(0.6, t => water.position.y = 0.07 - (binned.size - 1 + t) / 3 * 0.02);
        if (!left) { S.tween(1, t => water.material.opacity = 0.75 * (1 - t), () => water.visible = false); S.info('💧 Singki tidak tersumbat lagi — air mengalir keluar!'); }
        else S.info(`🗑️ Bagus! Sampah di dalam singki menyebabkan singki <b>tersumbat</b>. Tinggal ${left} lagi.`);
        return;
      }
      if (binned.size < 3) { S.info('Keluarkan <b>sampah dari singki</b> dahulu.'); return goHome(S, o); }
      if (flat(o.position, shelf.position) > 0.17) { S.info('Simpan di atas <b>rak</b>.'); return goHome(S, o); }
      const slot = shelf.position.clone().add(new THREE.Vector3(stored.size ? 0.07 : -0.07, 0.126, 0));
      stored.add(o); moveTo(S, o, slot); S.evt('tidy', o.name);
      S.info(stored.size < 2 ? '📚 Disimpan di rak. Satu lagi!' : '✅ Meja sudah kemas. Tuding <b>kerusi</b> untuk menolaknya ke bawah meja.');
    },
  });
  return {
    root, view: { w: 1.5, d: 0.8 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [seat])?.name ?? null,
    tap(x, y) {
      if (S.hitTest(x, y, [seat]) !== seat || tucked) return;
      if (stored.size < 2) return S.info('Kemaskan <b>bikar dan buku</b> dahulu.');
      tucked = true; moveTo(S, seat, new THREE.Vector3(0.12, 0, -0.16), 0.6);
      S.evt('stool', 'kerusi'); S.info('✨ Bilik Sains <b>bersih dan kemas</b>. Pembelajaran dapat dilakukan dengan berkesan!');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Sebelum masuk', sp: 'SP 2.1.1', make: L1 },
  { id: 'L2', title: 'Semasa aktiviti', sp: 'SP 2.1.1', make: L2 },
  { id: 'L3', title: 'Selepas aktiviti', sp: 'SP 2.1.1', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Peraturan Bilik Sains',
  intro: '<b>Sains Tahun 1 · Unit 2.</b> Patuhi peraturan Bilik Sains! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
