// Sains Tahun 1 · Unit 3 Benda Hidup dan Benda Bukan Hidup (SP 3.1.1, 3.1.2, 3.2.1–3.2.5)
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, tree, bird, car, rock, plane, pottedPlant, house, nest, emojiCard, beaker, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

const zone = (name, label, color, x, z, w = 0.55, d = 0.3) => {
  const g = group(name, mesh(new THREE.BoxGeometry(w, 0.006, d), M(color, { transparent: true, opacity: 0.55 }), 0, 0.003, 0));
  const t = textSprite(label, { h: 0.04 }); t.position.set(0, 0.03, d / 2 + 0.03); g.add(t);
  g.position.set(x, 0, z); g.userData.size = [w, d]; return g;
};
const inZone = (z, p) => Math.abs(p.x - z.position.x) < z.userData.size[0] / 2 + 0.03 && Math.abs(p.z - z.position.z) < z.userData.size[1] / 2 + 0.03;

// ------------------------------------------------------------ L1 Hidup atau bukan hidup: sort six things
function L1(S, play) {
  const root = group('L1', table(1.4, 0.85, play));
  const live = zone('zon_hidup', '🌱 Benda hidup', 0x9be39b, -0.33, -0.2), dead = zone('zon_bukan', '🧸 Benda bukan hidup', 0xf3b6c8, 0.33, -0.2);
  root.add(live, dead);
  const doll = kid('anak_patung', { shirt: 0xf48fb1, pants: 0xec407a, girl: true, hair: 0xb5651d, scale: 0.6 });
  const things = [[kid('manusia', { shirt: 0x42a5f5 }), true, 'Manusia bernafas, makan, bergerak, membesar dan membiak.'],
    [tree('pokok'), true, 'Pokok bernafas, memerlukan air, membesar dan membiak.'],
    [bird('burung'), true, 'Burung bernafas, makan, bergerak, membesar dan membiak.'],
    [doll, false, 'Anak patung tidak bernafas dan tidak membesar.'],
    [car('kereta'), false, 'Kereta boleh bergerak, tetapi tidak bernafas, tidak makan dan tidak membesar.'],
    [rock('batu'), false, 'Batu tidak bernafas, tidak bergerak dan tidak membesar.']];
  const order = [3, 0, 4, 2, 5, 1];  // mixed up along the front
  const items = things.map(([o, alive, why], i) => {
    o.position.set((order[i] - 2.5) * 0.21, 0, 0.22); o.userData.alive = alive; o.userData.why = why; root.add(home(o)); return o;
  });
  const placed = new Set();
  const dr = dragger(S, () => items.filter(o => !placed.has(o)), {
    onDrop(o) {
      const z = inZone(live, o.position) ? live : inZone(dead, o.position) ? dead : null;
      if (!z) return goHome(S, o);
      if ((z === live) !== o.userData.alive) { S.info(`🤔 Cuba lagi! ${o.userData.why}`); return goHome(S, o); }
      placed.add(o);
      const n = items.filter(x => placed.has(x) && x.userData.alive === o.userData.alive).length;
      moveTo(S, o, z.position.clone().add(new THREE.Vector3((n - 2) * 0.16, 0, -0.02)));
      S.star(z.position.clone().setY(0.25)); S.evt('sort', o.name);
      S.info(`✅ ${o.userData.alive ? '<b>Benda hidup</b>' : '<b>Benda bukan hidup</b>'} — ${o.userData.why}`);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Ciri benda hidup: bird vs aeroplane
const TRAITS = [
  ['bernafas', '💨', 'Bernafas', 'Burung <b>bernafas</b> — lihat badannya naik turun.'],
  ['makan', '🌾', 'Makan & minum', 'Burung <b>memerlukan air dan makanan</b>.'],
  ['bergerak', '🏃', 'Bergerak', 'Burung <b>bergerak</b> — ia terbang.'],
  ['membesar', '📏', 'Membesar', 'Anak burung <b>membesar</b> menjadi burung dewasa.'],
  ['membiak', '🥚', 'Membiak', 'Burung <b>membiak</b> — ia bertelur dan anak burung menetas.'],
];
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const b = bird('burung'); b.scale.setScalar(1.6); b.position.set(-0.32, 0.0, -0.15); b.rotation.y = -0.4; root.add(b);
  const ap = plane('kapal_terbang'); ap.scale.setScalar(1.4); ap.position.set(0.32, 0.0, -0.15); ap.rotation.y = 0.5; root.add(ap);
  for (const [o, t] of [[b, 'Burung'], [ap, 'Kapal terbang']]) { const l = textSprite(t, { h: 0.035 }); l.position.set(o.position.x, 0.22, o.position.z); root.add(l); }
  const cards = TRAITS.map(([id, e, label], i) => { const c = emojiCard(id, e, label, 0.11); c.position.set((i - 2) * 0.2, 0, 0.22); c.userData.carryY = 0; root.add(home(c)); return c; });
  const given = new Set(); let planeMoved = false, t = 0;
  const anim = { breathe: false, fly: 0, eat: null, chick: null, egg: null };
  const fx = {
    bernafas() { anim.breathe = true; },
    makan() { const seeds = group('', ...[0, 1, 2, 3, 4].map(i => mesh(new THREE.SphereGeometry(0.004), M(0xd9b45a), (i - 2) * 0.008, 0.003, 0.01 * (i % 2)))); seeds.position.set(b.position.x + 0.08, 0, b.position.z + 0.02); root.add(seeds); anim.eat = seeds; },
    bergerak() { anim.fly = 3; },
    membesar() {
      const chick = bird('anak_burung', 0xf2d05a); chick.scale.setScalar(0.5); chick.position.set(b.position.x - 0.12, 0, b.position.z + 0.1); root.add(chick);
      S.tween(2.5, k => chick.scale.setScalar(0.5 + k * 0.6));
    },
    membiak() {
      const n = group('', ...[0, 1].map(i => mesh(new THREE.SphereGeometry(0.012, 12, 8).scale(1, 1.25, 1), M(0xf7f1e3), i * 0.025, 0.014, 0)));
      n.position.set(b.position.x + 0.1, 0, b.position.z - 0.08); root.add(n); anim.egg = n;
      setTimeout(() => { n.children[0].visible = false; const c = bird('', 0xf2d05a); c.scale.setScalar(0.35); c.position.set(0, 0, 0); n.add(c); }, 1800);
    },
  };
  const dr = dragger(S, () => cards.filter(c => !given.has(c.name)), {
    onDrop(c) {
      const onBird = flat(c.position, b.position) < 0.16, onPlane = flat(c.position, ap.position) < 0.18;
      if (onPlane) {
        if (c.name === 'bergerak') {
          planeMoved = true; S.evt('plane', 'bergerak');
          S.info('✈️ Kapal terbang juga <b>boleh bergerak</b>. Tetapi adakah ia bernafas, makan atau membesar? Beri ciri-ciri kepada burung.');
          const p0 = ap.position.clone(); S.tween(2, k => { ap.position.y = Math.sin(k * Math.PI) * 0.15; ap.position.x = p0.x + Math.sin(k * Math.PI * 2) * 0.05; });
          return goHome(S, c);
        }
        S.info(`❌ Kapal terbang <b>tidak ${c.name === 'makan' ? 'memerlukan makanan' : c.name}</b> — ia benda bukan hidup.`);
        return goHome(S, c);
      }
      if (!onBird) return goHome(S, c);
      if (!planeMoved) { S.info('Mula dengan kad <b>Bergerak</b>: letakkan pada kapal terbang. Adakah ia boleh bergerak?'); return goHome(S, c); }
      given.add(c.name); c.visible = false; fx[c.name]();
      S.star(b.position.clone().setY(0.2)); S.evt('trait', c.name);
      S.info('✅ ' + TRAITS.find(x => x[0] === c.name)[3]);
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    update(dt) {
      t += dt;
      if (anim.breathe) b.getObjectByName('badan').scale.set(1.3, 1 + Math.sin(t * 4) * 0.08, 0.9 + Math.sin(t * 4) * 0.06);
      if (anim.fly > 0) {
        anim.fly -= dt; const k = Math.max(0, anim.fly);
        b.position.y = Math.sin((3 - k) / 3 * Math.PI) * 0.18;
        for (const n of ['sayapL', 'sayapR']) b.getObjectByName(n).rotation.x = (n === 'sayapL' ? 1 : -1) * Math.sin(t * 25) * 0.8;
      }
      if (anim.eat) { b.rotation.z = -0.4 * Math.abs(Math.sin(t * 6)); anim.eat.children.forEach((s, i) => { if (Math.sin(t * 6) > 0.95 && s.visible) { s.visible = false; return; } }); if (anim.eat.children.every(s => !s.visible)) { b.rotation.z = 0; anim.eat = null; } }
    },
  };
}

// ------------------------------------------------------------ L3 Susun mengikut saiz: kecil -> besar
const ANIMALS = [['tikus', '🐭', 'Tikus', 0.07], ['kucing_hutan', '🐈', 'Kucing hutan', 0.09], ['rusa', '🦌', 'Rusa', 0.12], ['seladang', '🐃', 'Seladang', 0.15], ['gajah', '🐘', 'Gajah', 0.19]];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const slots = ANIMALS.map((a, i) => {
    const m = mesh(new THREE.BoxGeometry(0.2, 0.006, 0.14), M(0xffd84d, { transparent: true, opacity: 0.7 }), (i - 2) * 0.24, 0.003, -0.18);
    const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set((i - 2) * 0.24, 0.02, -0.08); root.add(m, n); return m;
  });
  const arrow = textSprite('Kecil  ➜  Besar', { h: 0.045, bg: '#2b2340ee', fg: '#fff' }); arrow.position.set(0, 0.03, -0.36); root.add(arrow);
  const mixed = [3, 0, 4, 1, 2];
  const cards = ANIMALS.map(([id, e, label, size], i) => { const c = emojiCard(id, e, label, size, { border: '#3a7bd5' }); c.position.set((mixed[i] - 2) * 0.24, 0, 0.22); c.userData.rank = i; root.add(home(c)); return c; });
  let next = 0;
  const dr = dragger(S, () => cards.filter(c => c.userData.rank >= next), {
    onDrop(c) {
      const i = slots.findIndex(s => flat(s.position, c.position) < 0.12);
      if (i < 0) return goHome(S, c);
      if (i !== next) { S.info(`Petak ${next + 1} dahulu! Mulakan dengan haiwan yang <b>paling kecil</b>, kemudian semakin besar.`); return goHome(S, c); }
      if (c.userData.rank !== next) {
        const want = ANIMALS[next][2];
        S.info(c.userData.rank > next ? `🤔 ${ANIMALS[c.userData.rank][2]} lebih <b>besar</b>. Cari haiwan yang lebih kecil.` : `🤔 Cuba lagi.`);
        return goHome(S, c);
      }
      next++; moveTo(S, c, slots[i].position.clone().setY(0)); S.star(slots[i].position.clone().setY(0.25));
      S.evt('size', c.name);
      S.info(next < 5 ? `✅ ${ANIMALS[i][2]}! Seterusnya: haiwan yang lebih besar.` : '🎉 Tikus → kucing hutan → rusa → seladang → gajah: <b>kecil ke besar</b>!');
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L4 Keperluan asas: water, food, shelter from the rain
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const plant = pottedPlant('pokok'); plant.position.set(-0.5, 0, -0.15); plant.userData.setWilt(1); root.add(plant);
  const child = kid('manusia', { shirt: 0x42a5f5 }); child.position.set(-0.1, 0, -0.12); root.add(home(child));
  const b = bird('burung'); b.position.set(0.2, 0, -0.08); root.add(home(b));
  const hs = house('rumah'); hs.position.set(0.32, 0, -0.32); root.add(hs);
  const branch = group('dahan', mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.18), M(0x7a4a22), 0, 0.09, 0), mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.12), M(0x7a4a22), 0.04, 0.15, 0).rotateZ(-1.2));
  const ns = nest('sarang'); ns.position.set(0.09, 0.19, 0); branch.add(ns); branch.position.set(0.58, 0, -0.18); root.add(branch);
  const water = beaker('air'); water.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 20), M(0x4aa8e8, { transparent: true, opacity: 0.7 }), 0, 0.032, 0)); water.position.set(-0.45, 0, 0.25);
  const food = group('makanan', mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.01, 24), M(0xffffff), 0, 0.005, 0), mesh(new THREE.SphereGeometry(0.03, 14, 10).scale(1, 0.6, 1), M(0xfafafa), -0.012, 0.018, 0),
    mesh(new THREE.SphereGeometry(0.018, 10, 8).scale(1.3, 0.8, 1), M(0xb5651d), 0.022, 0.016, 0.005), mesh(new THREE.SphereGeometry(0.008), M(0xe53935), 0.01, 0.014, -0.025));
  food.position.set(-0.2, 0, 0.25);
  root.add(home(water), home(food));
  const tags = [[plant, 'Pokok'], [child, 'Manusia'], [b, 'Burung']].map(([o, t]) => { const l = textSprite(t, { h: 0.03 }); l.position.set(0, 0.3, 0); o.add(l); return l; });
  tags[2].position.y = 0.13;
  let watered = false, fed = false, raining = false; const safe = new Set(); const drops = [];
  function startRain() {
    raining = true; b.userData.carryY = 0.14;  // the bird flies at nest height so pointing at the nest lands on it
    S.info('🌧️ Hujan turun! Manusia dan haiwan memerlukan <b>tempat perlindungan</b>. Bawa manusia ke rumah dan burung ke sarang.', 8);
    for (let i = 0; i < 70; i++) { const d = mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03), M(0x6fb6ff, { transparent: true, opacity: 0.7 })); d.userData.fx = true; d.position.set(Math.random() * 1.4 - 0.7, Math.random() * 0.6, Math.random() * 0.7 - 0.35); drops.push(d); root.add(d); }
    const cloud = group('', ...[[-0.05, 0], [0.03, 0.01], [0.09, -0.01]].map(([x, y]) => mesh(new THREE.SphereGeometry(0.06, 12, 8), M(0x9aa5b1), x, y, 0)));
    cloud.position.set(0, 0.62, -0.1); cloud.userData.fx = true; cloud.traverse(o => o.userData.fx = true); root.add(cloud);
  }
  const dr = dragger(S, () => [water, food].filter(o => o.visible).concat(raining ? [child, b].filter(o => !safe.has(o)) : []), {
    onDrop(o) {
      if (o === water) {
        if (flat(o.position, plant.position) < 0.12) {
          watered = true; o.visible = false; plant.getObjectByName('akar').visible = true;
          S.tween(2, k => plant.userData.setWilt(1 - k)); S.evt('water', 'pokok');
          S.info('💧 Akar pokok <b>menyerap air</b> untuk membuat makanan. Pokok segar semula!');
          return;
        }
        if (flat(o.position, child.position) < 0.12) { o.visible = false; S.info('🥤 Manusia memerlukan air untuk <b>menghilangkan dahaga</b>. Pokok juga perlukan air!'); setTimeout(() => { o.position.copy(o.userData.home); o.visible = true; }, 2000); return; }
        return goHome(S, o);
      }
      if (o === food) {
        if (flat(o.position, plant.position) < 0.12) { S.info('🌞 Tumbuhan <b>membuat makanannya sendiri</b>! Beri makanan kepada manusia.'); return goHome(S, o); }
        if (flat(o.position, child.position) < 0.12) {
          if (!watered) { S.info('Siram <b>pokok</b> dengan air dahulu.'); return goHome(S, o); }
          fed = true; o.visible = false; S.evt('food', 'manusia'); S.tween(0.6, k => child.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.12));
          S.info('🍚 Manusia memerlukan makanan untuk mendapatkan <b>tenaga dan membesar</b>.');
          setTimeout(startRain, 2500); return;
        }
        return goHome(S, o);
      }
      // shelter during the rain
      const target = o === child ? hs : ns, at = target.getWorldPosition(new THREE.Vector3());
      if (flat(o.position, at) > 0.14) { S.info(o === child ? 'Bawa manusia ke <b>rumah</b>.' : 'Bawa burung ke <b>sarang</b> di atas dahan.'); return goHome(S, o); }
      safe.add(o); S.evt('shelter', o.name);
      if (o === child) { moveTo(S, o, at.clone().add(new THREE.Vector3(0, 0, 0.1))).then(() => o.visible = false); }
      else moveTo(S, o, root.worldToLocal(at.clone()).add(new THREE.Vector3(0, 0.005, 0)));
      S.info(o === child ? '🏠 Rumah melindungi manusia daripada <b>hujan, panas dan bahaya</b>.' : '🐦 Sarang melindungi burung daripada hujan dan bahaya.');
      if (safe.size === 2) setTimeout(() => { drops.forEach(d => root.remove(d)); drops.length = 0; S.info('☀️ Hujan berhenti. Semua selamat!'); }, 2500);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    update(dt) { for (const d of drops) { d.position.y -= dt * 0.9; if (d.position.y < 0) d.position.y = 0.6; } },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Hidup atau bukan hidup', sp: 'SP 3.1.1', make: L1 },
  { id: 'L2', title: 'Ciri benda hidup', sp: 'SP 3.1.1', make: L2 },
  { id: 'L3', title: 'Susun mengikut saiz', sp: 'SP 3.1.2', make: L3 },
  { id: 'L4', title: 'Keperluan asas', sp: 'SP 3.2.1 – 3.2.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Benda Hidup dan Benda Bukan Hidup',
  intro: '<b>Sains Tahun 1 · Unit 3.</b> Kenal benda hidup! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
