// Sains Tahun 5 · Unit 7 Pengaratan (SP 7.1.1 – 7.1.5) — which objects rust, the steel-wool investigation
// (dry air / water without air / water and air), protecting iron objects + a rain test.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const RUST = 0x8d4a1f, IRON = 0x8a8f96;

// ------------------------------------------------------------ L1 Objek berkarat
function L1(S, play) {
  const root = group('L1', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'rust', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'besi', label: '🟤 Boleh berkarat (besi)', color: 0xffccbc, x: -0.38, z: -0.18, w: 0.7 }, { id: 'tidak', label: '⚪ Tidak berkarat', color: 0xe0e0e0, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['paku', '🔩', 'Paku besi', 'besi'], ['pagar', '🚧', 'Pagar besi', 'besi'], ['rantai', '⛓️', 'Rantai basikal', 'besi'], ['tin', '🥫', 'Tin besi', 'besi'],
      ['gelas', '🥛', 'Gelas kaca', 'tidak'], ['sudu', '🥄', 'Sudu plastik', 'tidak'], ['pensel', '✏️', 'Pensel kayu', 'tidak'], ['bola', '⚽', 'Bola getah', 'tidak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Hanya objek yang diperbuat daripada besi boleh berkarat.' })),
    ok: (it, z) => z.id === 'besi' ? `✅ ${it.label} diperbuat daripada <b>besi</b> — boleh berkarat (lapisan perang kemerahan, kasar dan rapuh).` : `✅ ${it.label} bukan besi — <b>tidak berkarat</b>.`,
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L2 Penyiasatan sabut keluli
function tubeSet(name, x) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 20, 1, true), M(0xffffff, { transparent: true, opacity: 0.3, side: THREE.DoubleSide }), 0, 0.11, 0),
    mesh(new THREE.CylinderGeometry(0.037, 0.033, 0.03, 16), M(0xa1887f), 0, 0.235, 0));
  const wool = mesh(new THREE.IcosahedronGeometry(0.03, 1), M(IRON, { metalness: 0.6, roughness: 0.9, flatShading: true }), 0, 0.12, 0); wool.name = 'sabut_' + name; g.add(wool);
  g.position.set(x, 0, -0.15); g.userData.wool = wool; return g;
}
function L2(S, play) {
  const root = group('L2', table(1.6, 0.95, play));
  const T = { A: ['kalsium', 'Udara kering (tanpa air)'], B: ['air_didih', 'Air tanpa udara'], C: ['air_biasa', 'Air dan udara'] };
  const tubes = Object.keys(T).map((k, i) => { const t = tubeSet('tabung_' + k, -0.35 + i * 0.35); root.add(t); const l = textSprite(`${k}: ${T[k][1]}`, { h: 0.03, bg: '#ffffffdd' }); l.position.set(t.position.x, 0.33, -0.15); root.add(l); t.userData.k = k; t.userData.need = k === 'B' ? ['air_didih', 'minyak'] : [T[k][0]]; t.userData.got = []; return t; });
  const ITEMS = [['kalsium', '⚪', 'Kalsium klorida kontang'], ['air_didih', '💧', 'Air telah dididihkan'], ['minyak', '🟡', 'Lapisan minyak'], ['air_biasa', '🚰', 'Air biasa']];
  const chips = ITEMS.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#3a7bd5' }); c.position.set(-0.5 + i * 0.33, 0, 0.3); root.add(home(c)); return c; });
  const ff = textCard('empat_hari', '⏩ Biarkan selama 4 hari', 0.3, { border: '#ef6c00' }); ff.position.set(0.55, 0, 0.05); ff.visible = false; root.add(ff);
  const ask = [['air_udara', 'Kehadiran air dan udara menyebabkan pengaratan', true], ['air', 'Air sahaja menyebabkan pengaratan', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.36); c.userData.ok = ok; c.position.set(-0.2 + i * 0.42, 0, 0.3); c.visible = false; root.add(c); return c; });
  const fill = (t, id) => {
    if (id === 'kalsium') t.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 16), M(0xfafafa), 0, 0.03, 0));
    if (id === 'air_didih' || id === 'air_biasa') t.add(Object.assign(mesh(new THREE.CylinderGeometry(0.032, 0.032, id === 'air_biasa' ? 0.08 : 0.17, 16), M(0x81d4fa, { transparent: true, opacity: 0.55 }), 0, id === 'air_biasa' ? 0.04 : 0.085, 0), { userData: { fx: true } }));
    if (id === 'minyak') t.add(Object.assign(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 16), M(0xffd54f, { transparent: true, opacity: 0.8 }), 0, 0.177, 0), { userData: { fx: true } }));
  };
  let waited = false, done = false;
  const dr = dragger(S, () => chips.filter(c => c.visible), {
    onDrop(c) {
      const t = tubes.slice().sort((a, b) => flat(a.position, c.position) - flat(b.position, c.position))[0];
      if (flat(t.position, c.position) > 0.15) return goHome(S, c);
      const id = c.name;
      if (!t.userData.need.includes(id)) { S.info(`🤔 Tabung ${t.userData.k} perlukan keadaan "${T[t.userData.k][1].toLowerCase()}".`); return goHome(S, c); }
      if (id === 'minyak' && !t.userData.got.includes('air_didih')) { S.info('🤔 Masukkan air yang telah dididihkan dahulu, kemudian lapisan minyak di atasnya.'); return goHome(S, c); }
      t.userData.got.push(id); fill(t, id); c.visible = false; S.evt('setup', id);
      S.info({ kalsium: '✅ Kalsium klorida kontang menyerap lembapan — udara dalam tabung A kering.', air_didih: '✅ Air yang telah dididihkan kurang mengandungi udara terlarut.', minyak: '✅ Lapisan minyak menghalang udara memasuki air.', air_biasa: '✅ Tabung C: sabut keluli terdedah kepada air dan udara.' }[id]);
      if (chips.every(c => !c.visible)) { ff.visible = true; setTimeout(() => S.info('⏩ Gunakan kuantiti sabut keluli yang sama. Biarkan selama empat hari.'), 1500); }
    },
  });
  return {
    root, view: { w: 1.6, d: 0.95 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [ff, ...ask].filter(c => c.visible))?.name ?? dr.hit?.(x, y) ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [ff, ...ask].filter(c => c.visible)); if (!c) return;
      if (c === ff && !waited) {
        waited = true; ff.visible = false; const w = tubes[2].userData.wool;
        S.tween(2.5, t => w.material.color.setHex(IRON).lerp(new THREE.Color(RUST), t), () => { ask.forEach(a => (a.visible = true)); S.evt('wait', 'hari4'); S.info('📋 Hari ke-4: hanya sabut keluli dalam tabung <b>C</b> berkarat. Apakah kesimpulannya?'); });
        return S.info('⏳ Empat hari berlalu…');
      }
      if (ask.includes(c) && !done) {
        if (!c.userData.ok) return S.info('🤔 Tabung B ada air tetapi tiada udara — adakah ia berkarat?');
        done = true; S.evt('conclude', 'air_udara'); S.info('✅ <b>Kehadiran air dan udara</b> menyebabkan pengaratan.', 9);
      }
    },
  };
}

// ------------------------------------------------------------ L3 Mencegah pengaratan + ujian hujan
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const fence = group('pagar'); for (let i = 0; i < 5; i++) fence.add(mesh(new THREE.BoxGeometry(0.012, 0.16, 0.012), M(IRON, { metalness: 0.5 }), -0.06 + i * 0.03, 0.08, 0)); fence.add(mesh(new THREE.BoxGeometry(0.15, 0.012, 0.012), M(IRON, { metalness: 0.5 }), 0, 0.13, 0));
  const chain = group('rantai'); for (let i = 0; i < 6; i++) chain.add(mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 14), M(IRON, { metalness: 0.5 }), -0.06 + i * 0.024, 0.02, 0).rotateY(i % 2 ? Math.PI / 2 : 0));
  const hanger = group('penyangkut', mesh(new THREE.TorusGeometry(0.05, 0.004, 6, 3), M(IRON, { metalness: 0.5 }), 0, 0.05, 0).rotateZ(Math.PI / 2 + Math.PI / 6), mesh(new THREE.TorusGeometry(0.012, 0.003, 6, 12, Math.PI * 1.4), M(IRON, { metalness: 0.5 }), 0, 0.11, 0));
  const spoon = group('sudu', mesh(new THREE.SphereGeometry(0.02, 14, 10).scale(1, 0.3, 1.4), M(IRON, { metalness: 0.5 }), 0, 0.01, -0.03), mesh(new THREE.BoxGeometry(0.01, 0.005, 0.08), M(IRON, { metalness: 0.5 }), 0, 0.01, 0.03));
  const nail = group('paku', mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 8), M(IRON, { metalness: 0.5 }), 0, 0.006, 0).rotateZ(Math.PI / 2), mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 12), M(IRON), 0.046, 0.006, 0).rotateZ(Math.PI / 2));
  const OBJ = [[fence, 'cat', 'Pagar', 0xd32f2f, '✅ Pagar besi <b>dicat</b>.'], [chain, 'gris', 'Rantai basikal', 0x263238, '✅ Rantai basikal <b>disapu gris</b> — cat akan tertanggal apabila rantai bergerak.'],
    [hanger, 'plastik', 'Penyangkut baju', 0x43a047, '✅ Penyangkut baju <b>disalut plastik</b>.'], [spoon, 'sadur', 'Sudu', 0xeceff1, '✅ Sudu <b>disadur</b> dengan logam yang tahan karat.']];
  OBJ.forEach(([o, , l], i) => { o.scale.setScalar(1.7); o.position.set(-0.6 + i * 0.32, 0, -0.18); root.add(o); const t = textSprite(l, { h: 0.032, bg: '#ffffffdd' }); t.position.set(o.position.x, 0.33, -0.18); root.add(t); });
  nail.scale.setScalar(1.7); nail.position.set(0.68, 0, -0.18); root.add(nail); const nt = textSprite('Paku (tiada perlindungan)', { h: 0.026, bg: '#ffffffdd' }); nt.position.set(0.68, 0.1, -0.18); root.add(nt);
  const TOOLS = [['cat', '🖌️', 'Cat'], ['gris', '🛢️', 'Gris / minyak'], ['plastik', '🟩', 'Salut plastik'], ['sadur', '✨', 'Sadur logam']];
  const tools = TOOLS.map(([id, e, l], i) => { const c = emojiCard(id, e, l, 0.09, { border: '#7e57c2' }); c.position.set(-0.5 + i * 0.32, 0, 0.3); root.add(home(c)); return c; });
  const rain = textCard('hujan', '🌧️ Uji dengan hujan', 0.26, { border: '#1e88e5' }); rain.position.set(0.6, 0, 0.12); rain.visible = false; root.add(rain);
  const coat = (o, color, id) => o.traverse(m => m.isMesh && (m.material = M(color, { metalness: id === 'sadur' ? 1 : id === 'gris' ? 0.3 : 0.1, roughness: id === 'gris' || id === 'sadur' ? 0.15 : 0.5 })));
  let rained = false; const drops = [];
  const dr = dragger(S, () => tools.filter(c => c.visible), {
    onDrop(c) {
      const hit = OBJ.slice().sort((a, b) => flat(a[0].position, c.position) - flat(b[0].position, c.position))[0];
      if (flat(hit[0].position, c.position) > 0.16) return goHome(S, c);
      if (hit[1] !== c.name) { S.info(`🤔 Pilih cara yang sesuai dengan kegunaan ${hit[2].toLowerCase()}.`); return goHome(S, c); }
      c.visible = false; coat(hit[0], hit[3], c.name); S.evt('protect', c.name); S.info(hit[4] + ' Lapisan pelindung menghalang besi bersentuhan dengan air dan udara.');
      if (tools.every(t => !t.visible)) { rain.visible = true; setTimeout(() => S.info('🌧️ Uji perlindungan: biarkan hujan turun.'), 1800); }
    },
  });
  return {
    root, view: { w: 1.7, d: 0.95 }, ...dr,
    hit: (x, y) => (rain.visible ? S.hitTest(x, y, [rain])?.name : null) ?? null,
    tap(x, y) {
      if (!rain.visible || rained || !S.hitTest(x, y, [rain])) return;
      rained = true; rain.visible = false;
      for (let i = 0; i < 60; i++) { const d = mesh(new THREE.SphereGeometry(0.005, 6, 4), M(0x4fc3f7)); d.position.set(-0.8 + Math.random() * 1.6, 0.3 + Math.random() * 0.3, -0.35 + Math.random() * 0.4); d.userData.fx = true; root.add(d); drops.push(d); }
      S.tween(3, t => nail.traverse(m => m.isMesh && m.material.color.setHex(IRON).lerp(new THREE.Color(RUST), t)), () => {
        drops.forEach(d => root.remove(d)); S.evt('rain', 'uji');
        S.info('✅ Paku tanpa perlindungan <b>berkarat</b>, objek lain kekal baik. Pencegahan menjadikan objek tahan lebih lama, selamat digunakan, kekal cantik dan menjimatkan kos.', 10);
      });
    },
    update(dt) { drops.forEach(d => { d.position.y -= dt * 0.6; if (d.position.y < 0) d.position.y = 0.5; }); },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Objek berkarat', sp: 'SP 7.1.1 · 7.1.2', make: L1 },
  { id: 'L2', title: 'Penyiasatan sabut keluli', sp: 'SP 7.1.3', make: L2 },
  { id: 'L3', title: 'Mencegah pengaratan', sp: 'SP 7.1.4 · 7.1.5', make: L3 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Pengaratan',
  intro: '<b>Sains Tahun 5 · Unit 7.</b> Mengapa besi berkarat dan bagaimana mencegahnya! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
