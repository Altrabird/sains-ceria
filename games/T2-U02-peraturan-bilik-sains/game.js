// Sains Tahun 2 · Unit 2 Peraturan Bilik Sains (SP 2.1.1) — waste, bags outside, tell the teacher, clean + put back.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, sink, beaker, door, emojiCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const say = (root, at, text, secs = 3) => { const b = textSprite(text, { h: 0.04, bg: '#fffbe6f0' }); b.position.copy(at); root.add(b); setTimeout(() => root.remove(b), secs * 1000); };
function bin(name = 'bakul_sampah') {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.15, 20, 1, true), M(0x37474f, { side: THREE.DoubleSide }), 0, 0.075, 0), mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.005, 20), M(0x263238), 0, 0.003, 0));
  const l = textSprite('♻️ Bakul sampah', { h: 0.03 }); l.position.set(0, 0.2, 0); g.add(l); return g;
}
function conical(name) { return group(name, mesh(new THREE.CylinderGeometry(0.012, 0.04, 0.08, 20, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.04, 0), mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 16, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.095, 0)); }
function testTubes(name) { return group(name, mesh(new THREE.BoxGeometry(0.1, 0.012, 0.035), M(0x8d6e63), 0, 0.05, 0), ...[-0.03, 0, 0.03].map((x, i) => mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 12), M([0x4fc3f7, 0xffd54f, 0xef5350][i], { transparent: true, opacity: 0.7 }), x, 0.045, 0))); }

// ------------------------------------------------------------ L1 Buang sisa di tempat yang betul
const WASTE = [['kertas', 'Kertas renyuk', 'pepejal', () => mesh(new THREE.IcosahedronGeometry(0.025, 0), M(0xfafafa, { flatShading: true }), 0, 0.025, 0)],
  ['kulit_pisang', 'Kulit pisang', 'pepejal', () => mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 12, Math.PI), M(0xfdd835), 0, 0.012, 0).rotateX(Math.PI / 2)],
  ['tisu', 'Tisu kotor', 'pepejal', () => mesh(new THREE.BoxGeometry(0.05, 0.012, 0.05), M(0xeeeeee, { roughness: 1 }), 0, 0.006, 0).rotateY(0.4)],
  ['air_sabun', 'Air sabun', 'cecair', () => { const b = beaker(''); b.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.05, 20), M(0xb3e5fc, { transparent: true, opacity: 0.8 }), 0, 0.027, 0)); return b; }],
  ['air_berwarna', 'Air berwarna', 'cecair', () => { const b = beaker(''); b.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.05, 20), M(0xce93d8, { transparent: true, opacity: 0.85 }), 0, 0.027, 0)); return b; }]];
function L1(S, play) {
  const root = group('L1', table(1.4, 0.85, play));
  const bn = bin(); bn.position.set(-0.4, 0, -0.18); root.add(bn);
  const sk = sink(); sk.position.set(0.35, 0, -0.18); root.add(sk);
  const skl = textSprite('Singki', { h: 0.03 }); skl.position.set(0.35, 0.28, -0.18); root.add(skl);
  const mix = [3, 0, 4, 1, 2];
  const items = WASTE.map(([id, label, kind, make], i) => { const o = group(id, make()); o.userData = { label, kind }; o.position.set(-0.5 + mix[i] * 0.25, 0, 0.25); o.scale.setScalar(1.7); o.userData.carryY = 0.08; const t = textSprite(label, { h: 0.02 }); t.position.set(0, 0.075, 0); o.add(t); root.add(home(o)); return o; });
  const done = new Set();
  const dr = dragger(S, () => items.filter(o => !done.has(o)), {
    async onDrop(o, x, y) {
      const toBin = nearScreen(S, bn, x, y, 0.12, 80) || flat(o.position, bn.position) < 0.12;
      const toSink = nearScreen(S, sk, x, y, 0.06, 90) || flat(o.position, sk.position) < 0.2;
      if (!toBin && !toSink) return goHome(S, o);
      if (toSink && o.userData.kind === 'pepejal') { S.info(`🚫 ${o.userData.label} ialah <b>sisa pepejal</b>. Singki boleh <b>tersumbat</b> jika sisa pepejal dibuang ke dalamnya!`); return goHome(S, o); }
      if (toBin && o.userData.kind === 'cecair') { S.info(`🤔 ${o.userData.label} ialah <b>sisa cecair</b> — buang ke dalam singki.`); return goHome(S, o); }
      done.add(o);
      if (toBin) { await moveTo(S, o, bn.position.clone().setY(0.14)); await moveTo(S, o, bn.position.clone().setY(0.03)); o.visible = false; S.info(`🗑️ Sisa pepejal → <b>bakul sampah</b>.`); }
      else {
        await moveTo(S, o, sk.position.clone().add(new THREE.Vector3(0.05, 0.12, 0.05)));
        await S.tween(0.6, k => o.rotation.z = k * 1.8); o.children[0].children[2]?.scale.setScalar(0.01);
        await goHome(S, o); o.rotation.z = 0; S.info('🚰 Sisa cecair → <b>singki</b>.');
      }
      S.evt('waste', o.name);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Tinggalkan beg di luar
const CARRY = [['beg', '🎒', 'Beg sekolah', false], ['buku', '📗', 'Buku', true], ['pensel', '✏️', 'Pensel', true], ['buku_nota', '📒', 'Buku catatan', true]];
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const d = door(); d.position.set(0.25, 0, -0.32); root.add(d);
  d.getObjectByName('pintu_engsel').rotation.y = 1.4;
  const rack = group('rak_beg', mesh(new THREE.BoxGeometry(0.3, 0.012, 0.12), M(0xb07a45), 0, 0.1, 0), ...[-0.15, 0.15].map(x => mesh(new THREE.BoxGeometry(0.012, 0.1, 0.12), M(0x8a5a2e), x, 0.05, 0)));
  rack.position.set(-0.4, 0, -0.25); root.add(rack);
  const rl = textSprite('Rak beg (di luar)', { h: 0.03 }); rl.position.set(-0.4, 0.17, -0.25); root.add(rl);
  const pupil = kid('murid', { shirt: 0xffffff }); pupil.scale.setScalar(1.2); pupil.position.set(-0.05, 0, 0.0); root.add(pupil);
  const mix = [1, 3, 0, 2];
  const items = CARRY.map(([id, e, label, ok], i) => { const c = emojiCard(id, e, label, 0.1, { border: '#3a7bd5' }); c.userData.ok = ok; c.userData.carryY = 0.05; c.position.set(-0.45 + mix[i] * 0.3, 0, 0.27); root.add(home(c)); return c; });
  const inside = new THREE.Vector3(0.25, 0, -0.32); const done = new Set();
  const dr = dragger(S, () => items.filter(c => !done.has(c)), {
    onDrop(c, x, y) {
      const toRack = nearScreen(S, rack, x, y, 0.1, 80) || flat(c.position, rack.position) < 0.16;
      const toDoor = nearScreen(S, d, x, y, 0.15, 90) || flat(c.position, inside) < 0.16;
      if (!toRack && !toDoor) return goHome(S, c);
      if (toDoor && !c.userData.ok) { S.info('🚫 Tinggalkan <b>beg</b> di luar — beg di dalam Bilik Sains boleh <b>mengganggu pergerakan</b>.'); return goHome(S, c); }
      if (toRack && c.userData.ok) { S.info(`🤔 ${CARRY.find(x => x[0] === c.name)[2]} dibenarkan dibawa ke dalam Bilik Sains.`); return goHome(S, c); }
      done.add(c);
      if (toRack) moveTo(S, c, rack.position.clone().setY(0.106)); else moveTo(S, c, inside.clone()).then(() => c.visible = false);
      S.evt('carry', c.name); S.info(toRack ? '🎒 Beg ditinggalkan di <b>rak luar</b>.' : `✅ ${CARRY.find(x => x[0] === c.name)[2]} <b>dibenarkan</b> dibawa masuk.`);
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L3 Maklumkan kepada guru
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const bench = mesh(new THREE.BoxGeometry(0.5, 0.012, 0.2), M(0x9aa3ad), 0, 0.12, -0.15); root.add(bench);
  for (const [x, z] of [[-0.23, -0.07], [0.23, -0.07], [-0.23, -0.23], [0.23, -0.23]]) root.add(mesh(new THREE.BoxGeometry(0.012, 0.12, 0.012), M(0x6b7380), x, 0.06, z));
  const glass = beaker('bikar'); glass.position.set(0.18, 0.126, -0.12); root.add(glass);
  const teacher = kid('guru', { shirt: 0xffffff, pants: 0xe91e63, girl: true, scale: 1.35, hair: 0xf06292 }); teacher.position.set(-0.52, 0, -0.1); teacher.rotation.y = 0.8; root.add(teacher);
  const tl = textSprite('Cikgu', { h: 0.03 }); tl.position.set(-0.52, 0.34, -0.1); root.add(tl);
  const friend = kid('kawan', { shirt: 0xffffff, pants: 0x1f4fa8 }); friend.position.set(0.3, 0, 0.08); friend.rotation.y = -0.5; root.add(friend);
  const me = kid('saya', { shirt: 0xffffff, pants: 0x1d2b53, girl: true }); me.position.set(-0.05, 0, 0.12); root.add(me);
  let phase = 'calm', shards = null, told = 0;
  async function breakGlass() {
    phase = 'broken'; await S.tween(0.4, k => { glass.position.x = 0.18 + k * 0.08; glass.rotation.z = -k * 1.5; });
    glass.visible = false; shards = group('kaca_pecah', ...[...Array(7)].map((_, i) => mesh(new THREE.TetrahedronGeometry(0.015 + Math.random() * 0.01), M(0xe1f5fe, { transparent: true, opacity: 0.8 }), Math.cos(i) * 0.05, 0, Math.sin(i * 2) * 0.05)));
    shards.position.set(0.26, 0.13, -0.12);
    root.add(shards); S.info('💥 Alamak! Bikar <b>pecah</b>. Apakah yang patut kamu lakukan?', 8);
  }
  setTimeout(breakGlass, 1500);
  return {
    root, view: { w: 1.4, d: 0.85 },
    hit: (x, y) => S.hitTest(x, y, [teacher, friend, ...(shards ? [shards] : [])])?.name ?? null,
    async tap(x, y) {
      const t = S.hitTest(x, y, [teacher, friend, ...(shards ? [shards] : [])]) || (shards && S.nearest(x, y, [shards], 50)); if (!t) return;
      if (t === shards) return S.info('🚫 Jangan sentuh kaca pecah — tangan boleh tercedera! <b>Beritahu guru.</b>');
      if (t === friend && phase === 'hurt') return S.info('🤕 Kawan anda tercedera. Siapakah yang perlu diberitahu?');
      if (t !== teacher) return;
      if (phase === 'broken') {
        phase = 'calm2'; told++; say(root, new THREE.Vector3(-0.05, 0.32, 0.12), 'Cikgu, bikar pecah!'); setTimeout(() => say(root, new THREE.Vector3(-0.52, 0.42, -0.1), 'Terima kasih! Cikgu bersihkan.'), 1200);
        S.evt('tell', 'pecah'); S.info('✅ Beritahu guru jika alat dan radas <b>rosak atau pecah</b>.');
        setTimeout(() => { root.remove(shards); shards = null; }, 2500);
        setTimeout(() => {  // then a friend gets hurt
          phase = 'hurt'; const ouch = emojiSprite('🤕', 0.07); ouch.position.set(0, 0.3, 0); friend.add(ouch); friend.userData.ouch = ouch;
          S.info('🤕 Kawan anda <b>tercedera</b> — jarinya luka. Apakah yang patut kamu lakukan?', 8);
        }, 4500);
        return;
      }
      if (phase === 'hurt') {
        phase = 'done'; told++; say(root, new THREE.Vector3(-0.05, 0.32, 0.12), 'Cikgu, kawan saya cedera!');
        await moveTo(S, teacher, new THREE.Vector3(0.12, 0, 0.08), 1);
        friend.userData.ouch.visible = false; const aid = emojiSprite('🩹', 0.06); aid.position.set(0.05, 0.15, 0.04); friend.add(aid);
        S.evt('tell', 'cedera'); S.info('✅ Beritahu guru jika murid <b>tercedera</b>. Keselamatan murid terjaga!');
        return;
      }
      S.info('👩‍🏫 Cikgu: “Teruskan aktiviti dengan berhati-hati.”');
    },
  };
}

// ------------------------------------------------------------ L4 Bersihkan dan simpan di tempat asal
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const sk = sink(); sk.position.set(-0.4, 0, -0.15); root.add(sk); sk.getObjectByName('aliran').visible = true;
  const shelf = group('almari', mesh(new THREE.BoxGeometry(0.46, 0.012, 0.14), M(0xb07a45), 0, 0.006, 0), mesh(new THREE.BoxGeometry(0.46, 0.012, 0.14), M(0xb07a45), 0, 0.2, 0),
    ...[-0.23, 0.23].map(x => mesh(new THREE.BoxGeometry(0.012, 0.2, 0.14), M(0x8a5a2e), x, 0.1, 0)), mesh(new THREE.BoxGeometry(0.46, 0.2, 0.01), M(0x8a5a2e), 0, 0.1, -0.07));
  shelf.position.set(0.35, 0, -0.22); root.add(shelf);
  const KINDS = [['bikar', () => beaker('')], ['kelalang_kon', () => conical('')], ['tabung_uji', () => testTubes('')]];
  const slots = KINDS.map(([id, make], i) => {  // dashed outline = tempat asal
    const ghost = group('tempat_' + id, make()); ghost.traverse(o => o.material && Object.assign(o.material = o.material.clone(), { transparent: true, opacity: 0.18, depthWrite: false, color: new THREE.Color(0x3949ab) }));
    ghost.position.set(0.35 - 0.14 + i * 0.14, 0.012, -0.22); ghost.scale.setScalar(1.4); ghost.userData.id = id; root.add(ghost); return ghost;
  });
  const dirty = KINDS.map(([id, make], i) => {
    const o = group(id, make()); o.position.set(-0.1 + i * 0.17, 0, 0.25); o.scale.setScalar(1.4); o.userData.carryY = 0.08;
    const spots = mesh(new THREE.SphereGeometry(0.03, 10, 8).scale(1, 0.3, 1), M(0x795548, { transparent: true, opacity: 0.8 }), 0, 0.04, 0); spots.name = 'kotoran'; o.add(spots);
    root.add(home(o)); return o;
  });
  const clean = new Set(), stored = new Set();
  const dr = dragger(S, () => dirty.filter(o => !stored.has(o)), {
    onDrop(o, x, y) {
      if (nearScreen(S, sk, x, y, 0.08, 90) || flat(o.position, sk.position) < 0.16) {
        if (clean.has(o)) return goHome(S, o);
        clean.add(o); const k = o.getObjectByName('kotoran'); S.tween(0.8, t => { k.scale.setScalar(1 - t * 0.99); }, () => k.visible = false);
        const sp = emojiSprite('✨', 0.06); sp.position.set(0, 0.14, 0); o.add(sp); setTimeout(() => o.remove(sp), 1500);
        S.evt('wash', o.name); S.info('💧 Dibersihkan selepas digunakan.'); return goHome(S, o);
      }
      const s = S.closest(slots, x, y, s => nearScreen(S, s, x, y, 0.05, 50) || flat(s.position, o.position) < 0.06);
      if (!s) return goHome(S, o);
      if (!clean.has(o)) { S.info('🧼 Bersihkan alat ini di <b>singki</b> dahulu.'); return goHome(S, o); }
      if (s.userData.id !== o.name) { S.info('🤔 Simpan semula di <b>tempat asalnya</b> — lihat garis bentuk di almari.'); return goHome(S, o); }
      stored.add(o); s.visible = false; moveTo(S, o, s.position.clone()); S.evt('store', o.name);
      S.info(stored.size < 3 ? '✅ Disimpan di tempat asal dengan kemas.' : '✨ Bilik Sains <b>bersih, kemas, tersusun dan selamat</b>!');
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Buang sisa di tempat yang betul', sp: 'SP 2.1.1', make: L1 },
  { id: 'L2', title: 'Tinggalkan beg di luar', sp: 'SP 2.1.1', make: L2 },
  { id: 'L3', title: 'Maklumkan kepada guru', sp: 'SP 2.1.1', make: L3 },
  { id: 'L4', title: 'Bersihkan dan simpan', sp: 'SP 2.1.1', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Peraturan Bilik Sains (Tahun 2)',
  intro: '<b>Sains Tahun 2 · Unit 2.</b> Jaga Bilik Sains! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
