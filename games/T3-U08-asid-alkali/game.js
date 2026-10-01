// Sains Tahun 3 · Unit 8 Asid dan Alkali (SP 8.1.1 – 8.1.4) — litmus tests, taste is not an indicator,
// cabbage indicator, lime for acidic soil.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, beaker, emojiCard, pottedPlant, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const BLUE = 0x1e88e5, RED = 0xe53935;
const SIFAT = { asid: 'berasid', alkali: 'beralkali', neutral: 'neutral' };
// litmus pair: a blue and a red strip on one holder; dip(kind) turns them per the rules
function litmusPair(name = 'kertas_litmus') {
  const strip = (c, x) => { const m = mesh(new THREE.BoxGeometry(0.018, 0.09, 0.003), M(c), x, 0.06, 0); return m; };
  const b = strip(BLUE, -0.013), r = strip(RED, 0.013);
  const g = group(name, b, r, mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), M(0x8d6e63), 0, 0.11, 0));
  g.userData.dip = kind => { b.material.color.setHex(kind === 'asid' ? RED : BLUE); r.material.color.setHex(kind === 'alkali' ? BLUE : RED); };
  g.userData.reset = () => { b.material.color.setHex(BLUE); r.material.color.setHex(RED); };
  return g;
}
function sample(id, label, liquid, kind) {
  const b = beaker(id); b.scale.setScalar(1.6); b.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.05, 20), M(liquid, { transparent: true, opacity: 0.75 }), 0, 0.027, 0));
  const t = textSprite(label, { h: 0.016 }); t.position.set(0, 0.0, 0.05); b.add(t);  // in front of the beaker (scaled 1.6x) b.userData = { label, kind }; return b;
}
const SAMPLES = [['limau_nipis', 'Limau nipis', 0xdce775, 'asid'], ['asam_jawa', 'Asam jawa', 0x8d6e63, 'asid'], ['sabun', 'Air sabun', 0xe1f5fe, 'alkali'],
  ['kapur_sirih', 'Kapur sirih', 0xf5f5f5, 'alkali'], ['air_garam', 'Air garam', 0xe3f2fd, 'neutral'], ['air_gula', 'Air gula', 0xfffde7, 'neutral']];

// ------------------------------------------------------------ L1 Uji dengan kertas litmus
function L1(S, play) {
  const root = group('L1', table(1.5, 0.9, play));
  const beakers = SAMPLES.map(([id, l, c, k], i) => { const b = sample(id, l, c, k); b.position.set(-0.55 + i * 0.22, 0, -0.18); root.add(b); return b; });
  const lit = litmusPair(); lit.position.set(0.45, 0, 0.25); lit.userData.carryY = 0.08; root.add(home(lit));
  const ll = textSprite('Kertas litmus biru + merah', { h: 0.024 }); ll.position.set(0, 0.15, 0); lit.add(ll);
  const choices = ['asid', 'alkali', 'neutral'].map((k, i) => { const c = emojiCard('sifat_' + k, '', SIFAT[k][0].toUpperCase() + SIFAT[k].slice(1), 0.065, { border: ['#e53935', '#1e88e5', '#7cb342'][i] }); c.userData.kind = k; c.position.set(-0.25 + i * 0.25, 0, 0.3); c.visible = false; root.add(c); return c; });
  const key = textSprite('Biru→merah = asid · Merah→biru = alkali · Tiada perubahan = neutral', { h: 0.034, bg: '#fff59dee' }); key.position.set(0, 0.03, 0.12); root.add(key);
  let current = null; const done = new Set();
  const dr = dragger(S, () => (current ? [] : [lit]), {
    async onDrop(o, x, y) {
      const b = beakers.find(b => !done.has(b) && (nearScreen(S, b, x, y, 0.08, 60) || flat(b.position, o.position) < 0.08));
      if (!b) return goHome(S, o);
      current = b; o.userData.reset();
      await moveTo(S, o, b.position.clone().setY(0.1)); await S.tween(0.4, k => o.position.y = 0.1 - k * 0.05);
      o.userData.dip(b.userData.kind); S.evt('dip', b.name);
      choices.forEach(c => c.visible = true);
      S.info(`🧪 ${b.userData.label}: litmus biru ${b.userData.kind === 'asid' ? '<b>→ merah</b>' : 'kekal biru'}, litmus merah ${b.userData.kind === 'alkali' ? '<b>→ biru</b>' : 'kekal merah'}. Apakah sifatnya?`, 10);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (current ? S.hitTest(x, y, choices)?.name ?? null : null),
    tap(x, y) {
      if (!current) return;
      const c = S.hitTest(x, y, choices); if (!c) return;
      if (c.userData.kind !== current.userData.kind) return S.info('🤔 Lihat perubahan warna kertas litmus sekali lagi.');
      done.add(current); const tag = textSprite(SIFAT[c.userData.kind], { h: 0.024, bg: ['#ffcdd2', '#bbdefb', '#dcedc8'][['asid', 'alkali', 'neutral'].indexOf(c.userData.kind)] + 'ee' }); tag.position.set(0, 0.11, 0); current.add(tag);
      S.evt('classify', current.name); S.info(`✅ ${current.userData.label} bersifat <b>${SIFAT[c.userData.kind]}</b>.`);
      current = null; choices.forEach(k => k.visible = false); goHome(S, lit); lit.userData.reset();
    },
  };
}

// ------------------------------------------------------------ L2 Rasa dan sentuhan bukan penunjuk saintifik
function L2(S, play) {
  const root = group('L2', table(1.3, 0.8, play));
  const coffee = sample('kopi', 'Air kopi', 0x4e342e, 'asid'); coffee.position.set(-0.2, 0, -0.15); root.add(coffee);
  const steam = emojiSprite('♨️', 0.06); steam.position.set(-0.2, 0.2, -0.15); root.add(steam);
  const guesses = [['asid', 'Berasid'], ['alkali', 'Beralkali']].map(([k, l], i) => { const c = emojiCard('teka_' + k, '', l, 0.065, { border: '#7e57c2' }); c.userData.kind = k; c.position.set(0.15 + i * 0.22, 0, -0.05); c.visible = false; root.add(c); return c; });
  const tongue = emojiCard('rasa', '👅', 'Rasa (pahit)', 0.1, { border: '#ef6c00' }); tongue.position.set(0.25, 0, -0.25); root.add(tongue);
  const lit = litmusPair(); lit.position.set(0.3, 0, 0.25); lit.userData.carryY = 0.08; lit.visible = false; root.add(home(lit));
  let guessed = false, tested = false;
  const dr = dragger(S, () => (lit.visible && !tested ? [lit] : []), {
    async onDrop(o, x, y) {
      if (!(nearScreen(S, coffee, x, y, 0.08, 70) || flat(o.position, coffee.position) < 0.1)) return goHome(S, o);
      tested = true; await moveTo(S, o, coffee.position.clone().setY(0.05)); o.userData.dip('asid'); S.evt('litmus', 'kopi');
      S.info('🧪 Litmus biru → <b>merah</b>: air kopi <b>berasid</b>, walaupun rasanya pahit! <b>Rasa dan sentuhan bukan penunjuk saintifik.</b>', 10);
    },
  });
  return {
    root, view: { w: 1.3, d: 0.8 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [tongue, ...guesses.filter(g => g.visible)])?.name ?? null,
    tap(x, y) {
      const t = S.hitTest(x, y, [tongue, ...guesses.filter(g => g.visible)]); if (!t) return;
      if (t === tongue) { guesses.forEach(g => g.visible = true); S.evt('taste', 'kopi'); return S.info('👅 Kopi rasanya <b>pahit</b>. Bahan beralkali kebanyakannya pahit… Apakah tekaan anda?'); }
      if (guessed) return;
      guessed = true; lit.visible = true; S.evt('guess', t.userData.kind);
      S.info(t.userData.kind === 'alkali' ? '🤔 Tekaan anda: beralkali. Mari uji dengan kertas litmus!' : '🤔 Tekaan anda: berasid. Mari buktikan dengan kertas litmus!');
    },
  };
}

// ------------------------------------------------------------ L3 Pengganti kertas litmus: purple cabbage extract
function L3(S, play) {
  const root = group('L3', table(1.3, 0.8, play));
  const jars = [['limau_nipis', 'Limau nipis', 'asid', 0xf06292], ['sabun', 'Air sabun', 'alkali', 0x66bb6a], ['air_garam', 'Air garam', 'neutral', 0x7e57c2]]
    .map(([id, l, k, c], i) => { const b = sample(id, l, 0xeeeeee, k); b.userData.col = c; b.position.set(-0.35 + i * 0.3, 0, -0.15); root.add(b); return b; });
  const ext = emojiCard('ekstrak_kubis', '🥬', 'Ekstrak kubis ungu', 0.1, { border: '#7b1fa2' }); ext.position.set(0.0, 0, 0.25); root.add(home(ext));
  const others = textSprite('Pengganti lain: ekstrak kunyit, ekstrak bunga raya', { h: 0.024, bg: '#fff59dee' }); others.position.set(0, 0.03, 0.38); root.add(others);
  const done = new Set();
  const dr = dragger(S, () => (done.size < 3 ? [ext] : []), {
    async onDrop(o, x, y) {
      goHome(S, o);
      const b = jars.find(b => !done.has(b) && (nearScreen(S, b, x, y, 0.08, 70) || flat(b.position, o.position) < 0.12));
      if (!b) return;
      done.add(b); const liq = b.children[b.children.length - 2]; const c0 = liq.material.color.clone(), c1 = new THREE.Color(b.userData.col);
      await S.tween(1, k => liq.material.color.lerpColors(c0, c1, k));
      S.evt('extract', b.name);
      S.info({ asid: '🩷 Limau nipis menjadi <b>merah jambu</b> — berasid.', alkali: '💚 Air sabun menjadi <b>hijau</b> — beralkali.', neutral: '💜 Air garam kekal <b>ungu</b> — neutral.' }[b.userData.kind]);
    },
  });
  return { root, view: { w: 1.3, d: 0.8 }, ...dr };
}

// ------------------------------------------------------------ L4 Kegunaan: lime reduces soil acidity
function L4(S, play) {
  const root = group('L4', table(1.4, 0.85, play));
  const bed = group('tanah_kebun', mesh(new THREE.BoxGeometry(0.6, 0.04, 0.3), M(0x5d4037, { roughness: 1 }), 0, 0.02, 0)); bed.position.set(-0.15, 0, -0.15); root.add(bed);
  const plants = [0, 1, 2].map(i => { const p = pottedPlant('pokok' + i); p.children[0].visible = false; p.position.set(-0.35 + i * 0.2, 0.04, -0.15); p.userData.setWilt(1); root.add(p); return p; });
  const lit = litmusPair(); lit.position.set(0.3, 0, 0.25); lit.userData.carryY = 0.08; root.add(home(lit));
  const lime = emojiCard('kapur', '🧂', 'Kapur (beralkali)', 0.1, { border: '#9e9e9e' }); lime.position.set(0.5, 0, 0.0); lime.visible = false; root.add(home(lime));
  let tested = false, limed = false, retested = false;
  const dr = dragger(S, () => [...(!tested || (limed && !retested) ? [lit] : []), ...(lime.visible && !limed ? [lime] : [])], {
    async onDrop(o, x, y) {
      const onBed = nearScreen(S, bed, x, y, 0.04, 140) || flat(o.position, bed.position) < 0.3;
      if (!onBed) return goHome(S, o);
      if (o === lit) {
        lit.userData.reset(); await moveTo(S, o, bed.position.clone().setY(0.05));
        if (!tested) { tested = true; lit.userData.dip('asid'); S.evt('test', 'berasid'); lime.visible = true; S.info('🧪 Litmus biru → merah: tanah kebun <b>berasid</b>. Pokok tidak subur. Taburkan <b>kapur</b>!'); }
        else { retested = true; lit.userData.dip('neutral'); S.evt('test', 'neutral'); S.info('🧪 Litmus tidak berubah: tanah kini <b>neutral</b>. Kapur beralkali mengurangkan keasidan tanah. Asid dan alkali digunakan dalam pertanian, perubatan, kesihatan dan perindustrian.', 10); }
        setTimeout(() => goHome(S, o), 1500); return;
      }
      limed = true; o.visible = false;
      for (let i = 0; i < 20; i++) { const d = mesh(new THREE.SphereGeometry(0.004), M(0xffffff)); d.userData.fx = true; d.position.set(-0.15 + (Math.random() - 0.5) * 0.55, 0.2, -0.15 + (Math.random() - 0.5) * 0.25); root.add(d); S.tween(0.7, k => d.position.y = 0.2 - k * 0.16); }
      plants.forEach(p => S.tween(2, k => p.userData.setWilt(1 - k)));
      S.evt('lime', 'kapur'); S.info('🌱 Kapur ditabur — pokok segar semula! Uji tanah sekali lagi.');
    },
  });
  return { root, view: { w: 1.4, d: 0.85 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Uji dengan kertas litmus', sp: 'SP 8.1.1', make: L1 },
  { id: 'L2', title: 'Rasa bukan penunjuk', sp: 'SP 8.1.2', make: L2 },
  { id: 'L3', title: 'Pengganti kertas litmus', sp: 'SP 8.1.3', make: L3 },
  { id: 'L4', title: 'Kegunaan bahan', sp: 'SP 8.1.4', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Asid dan Alkali',
  intro: '<b>Sains Tahun 3 · Unit 8.</b> Uji bahan dengan kertas litmus! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
