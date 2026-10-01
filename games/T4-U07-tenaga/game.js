// Sains Tahun 4 · Unit 7 Tenaga (SP 7.1.1 – 7.2.3) — renewable vs non-renewable, nine forms of energy,
// energy changes (build the chain), using energy wisely.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, kid, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Sumber tenaga
function L1(S, play) {
  const root = group('L1', table(1.7, 0.9, play));
  const dr = sorter(S, root, {
    type: 'source', size: 0.1, gap: 0.17, w: 1.7,
    zones: [{ id: 'baharu', label: '♻️ Boleh dibaharui', color: 0xc8e6c9, x: -0.4, z: -0.2, w: 0.72 }, { id: 'tidak', label: '⛔ Tidak boleh dibaharui', color: 0xffcdd2, x: 0.4, z: -0.2, w: 0.72 }],
    items: [['matahari', '☀️', 'Matahari', 'baharu'], ['air', '🌊', 'Air', 'baharu'], ['angin', '🌬️', 'Angin', 'baharu'], ['ombak', '🌊', 'Ombak', 'baharu'], ['biojisim', '🌿', 'Biojisim', 'baharu'],
      ['petroleum', '🛢️', 'Petroleum', 'tidak'], ['gas_asli', '🔥', 'Gas asli', 'tidak'], ['arang_batu', '⚫', 'Arang batu', 'tidak'], ['nuklear', '☢️', 'Nuklear (uranium)', 'tidak']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bolehkah sumber ini dijana secara berterusan, atau ia terhad?' })),
    ok: (it, z) => z.id === 'baharu' ? `♻️ ${it.label} — boleh dijana secara <b>berterusan</b>.` : `⛔ ${it.label} — <b>terhad</b> dan tidak boleh dijana semula.`,
  });
  return { root, view: { w: 1.7, d: 0.9 }, ...dr };
}

// ------------------------------------------------------------ L2 Sembilan bentuk tenaga
function L2(S, play) {
  const root = group('L2', table(1.8, 0.95, play));
  const mt = matcher(S, root, [
    ['suria', '☀️', 'Matahari', 'Suria'], ['haba', '♨️', 'Cerek panas', 'Haba'], ['cahaya', '🔦', 'Lampu suluh menyala', 'Cahaya'], ['bunyi', '🎸', 'Gitar dipetik', 'Bunyi'], ['elektrik', '💡', 'Litar lengkap', 'Elektrik'],
    ['kimia', '🍞', 'Makanan dan bateri', 'Kimia'], ['kinetik', '🚴', 'Basikal bergerak', 'Kinetik'], ['keupayaan', '🏹', 'Lastik diregangkan', 'Keupayaan'], ['nuklear', '☢️', 'Uranium', 'Nuklear'],
  ].map(([id, e, ex, form]) => ({ id, target: [e, ex], card: ['', form], ok: `✅ ${ex} — tenaga <b>${form.toLowerCase()}</b>.` })), { type: 'form', gap: 0.19, size: 0.1, targetZ: -0.24, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L3 Tenaga berubah bentuk: tap the forms in order
const CHAINS = [['lampu_suluh', '🔦', 'Lampu suluh', ['kimia', 'elektrik', 'cahaya']], ['penerjun', '🤽', 'Penerjun', ['keupayaan', 'kinetik', 'bunyi']],
  ['basikal', '🚴', 'Mengayuh basikal', ['kimia', 'kinetik']], ['fotosintesis', '🌱', 'Fotosintesis', ['cahaya', 'kimia']], ['televisyen', '📺', 'Televisyen', ['elektrik', 'cahaya', 'bunyi']]];
const FORMS = ['suria', 'haba', 'cahaya', 'bunyi', 'elektrik', 'kimia', 'kinetik', 'keupayaan'];
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  const chips = FORMS.map((f, i) => { const c = textCard('bentuk_' + f, f[0].toUpperCase() + f.slice(1), 0.19); c.userData.f = f; c.position.set(-0.7 + i * 0.2, 0, 0.33); root.add(c); return c; });
  let r = 0, k = 0, row = null;
  function setup() {
    if (row) root.remove(row); row = group('rantai'); root.add(row); k = 0;
    const [id, e, l, chain] = CHAINS[r];
    const dev = emojiCard('alat_' + id, e, l, 0.13); dev.position.set(-0.6, 0, -0.2); row.add(dev);
    chain.forEach((_, i) => { const s = mesh(new THREE.BoxGeometry(0.2, 0.004, 0.1), M(0xffd84d, { transparent: true, opacity: 0.6 }), -0.3 + i * 0.3, 0.002, -0.2); row.add(s); if (i) { const a = textSprite('➜', { h: 0.05, bg: '#ffffff00' }); a.position.set(-0.45 + i * 0.3, 0.03, -0.2); row.add(a); } });
    S.info(`⚡ ${l}: tuding bentuk tenaga mengikut urutan perubahannya (${chain.length} langkah).`);
  }
  setup();
  return {
    root, view: { w: 1.7, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, chips)?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, chips); if (!c || r >= CHAINS.length) return;
      const chain = CHAINS[r][3];
      if (c.userData.f !== chain[k]) return S.info(`🤔 ${k ? 'Tenaga ' + chain[k - 1] + ' berubah menjadi…?' : 'Apakah tenaga asal?'}`);
      const t = textCard('', c.userData.f[0].toUpperCase() + c.userData.f.slice(1), 0.18, { border: '#43a047' }); t.position.set(-0.3 + k * 0.3, 0, -0.2); row.add(t); k++;
      if (k === chain.length) { S.evt('chain', CHAINS[r][0]); S.info(`✅ ${CHAINS[r][2]}: ${chain.join(' → ')}. Tenaga tidak dicipta atau dimusnahkan — hanya berubah bentuk.`, 6); r++; if (r < CHAINS.length) setTimeout(setup, 2800); }
    },
  };
}

// ------------------------------------------------------------ L4 Gunakan tenaga secara berhemat
function L4(S, play) {
  const root = group('L4', table(1.5, 0.95, play));
  const room = group('bilik', mesh(new THREE.BoxGeometry(0.9, 0.012, 0.5), M(0xd7ccc8), 0, 0.006, 0), mesh(new THREE.BoxGeometry(0.9, 0.3, 0.012), M(0xfff8e1), 0, 0.15, -0.25));
  room.position.set(0, 0, -0.1); root.add(room);
  const WASTE = [
    ['penyaman', '❄️', 'Penyaman udara', '🪟', 'Penyaman udara dimatikan, tingkap dibuka — udara segar dan jimat elektrik.', [-0.3, 0.2, -0.33]],
    ['lampu', '💡', 'Lampu menyala pada siang hari', '🌤️', 'Lampu dimatikan — guna cahaya matahari pada siang hari.', [0, 0.32, -0.2]],
    ['tv', '📺', 'TV terpasang, tiada penonton', '⚫', 'TV dimatikan apabila tidak ditonton — elakkan pembaziran tenaga.', [0.3, 0.12, -0.25]],
    ['kereta', '🚗', 'Ke sekolah dengan kereta (dekat)', '🚲', 'Berjalan kaki, berbasikal atau gunakan pengangkutan awam.', [0.55, 0.0, 0.25]],
  ];
  const items = WASTE.map(([id, e, l, e2, msg, p]) => { const c = emojiCard('pembaziran_' + id, e, l, 0.12, { border: '#e53935' }); c.position.set(...p); c.userData = { id, e2, msg, label: l }; root.add(c); return c; });
  const fixed = new Set(); let bill = 100;
  const meterLbl = () => { const t = textSprite(`💸 Bil elektrik: RM${bill}`, { h: 0.04, bg: bill > 60 ? '#ffcdd2ee' : '#c8e6c9ee' }); t.position.set(-0.45, 0.04, 0.32); t.name = 'bil'; return t; };
  let m = meterLbl(); root.add(m);
  return {
    root, view: { w: 1.5, d: 0.95 },
    hit: (x, y) => S.hitTest(x, y, items.filter(c => !fixed.has(c)))?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, items.filter(c => !fixed.has(c))); if (!c) return;
      fixed.add(c); const p = c.position.clone(); root.remove(c);
      const ok = emojiCard('jimat_' + c.userData.id, c.userData.e2, '✓', 0.12, { border: '#43a047' }); ok.position.copy(p); root.add(ok);
      bill -= 15; root.remove(m); m = meterLbl(); root.add(m);
      S.evt('save', c.userData.id); S.info('✅ ' + c.userData.msg, 6);
      if (fixed.size === 4) setTimeout(() => S.info('🌍 Berhemat menjimatkan perbelanjaan, mengurangkan pencemaran dan memastikan sumber tenaga mencukupi pada masa hadapan.', 9), 2500);
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Sumber tenaga', sp: 'SP 7.1.1 · 7.1.2 · 7.2.1', make: L1 },
  { id: 'L2', title: 'Sembilan bentuk tenaga', sp: 'SP 7.1.3', make: L2 },
  { id: 'L3', title: 'Perubahan bentuk tenaga', sp: 'SP 7.1.4 – 7.1.6', make: L3 },
  { id: 'L4', title: 'Gunakan tenaga secara berhemat', sp: 'SP 7.2.2 · 7.2.3', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Tenaga',
  intro: '<b>Sains Tahun 4 · Unit 7.</b> Sumber, bentuk dan perubahan tenaga! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
