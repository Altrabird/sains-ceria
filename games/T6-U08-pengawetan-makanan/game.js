// Sains Tahun 6 · Unit 8 Teknologi Pengawetan Makanan (SP 8.1.1 – 8.2.6) — signs of spoiled food, preservation
// methods grouped by how they work, food to method, the dried-chilli project steps.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, sequence, emojiCard, textCard, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const P = ([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l} → <b>${f.toLowerCase()}</b>.` });

// ------------------------------------------------------------ L1 Kerosakan makanan
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['susu', '🥛', 'Susu rosak', 'Berbuih, berketul, berbau busuk'], ['roti', '🍞', 'Roti dan nasi rosak', 'Bertompok kehitaman, berlendir'], ['buah', '🍅', 'Buah dan sayur rosak', 'Berkulat, berubah tekstur dan warna'],
    ['daging', '🥩', 'Daging rosak', 'Kehitaman, berbau busuk, berlendir'], ['ikan', '🐟', 'Ikan dan udang rosak', 'Berbau busuk, melekit, lembik']].map(P),
    { type: 'spoil', gap: 0.34, onDone: () => setTimeout(() => S.info('🦠 Makanan rosak akibat tindakan mikroorganisma. Pengawetan menghalang atau melambatkan pertumbuhannya.', 9), 2500) });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Kaedah pengawetan
function L2(S, play) {
  const root = group('L2', table(1.9, 0.95, play));
  const Z = (id, label, color, x) => ({ id, label, color, x, z: -0.18, w: 0.58, d: 0.3 });
  const dr = sorter(S, root, {
    type: 'method', size: 0.08, gap: 0.15, row: 0.3,
    zones: [Z('suhu', '🌡️ Suhu (panas atau sejuk)', 0xffe0b2, -0.62), Z('air', '💧 Menyingkirkan air', 0xe3f2fd, 0), Z('udara', '🔒 Halang udara / keasidan', 0xe8f5e9, 0.62)],
    items: [['didih', '♨️', 'Pendidihan', 'suhu'], ['dingin', '🧊', 'Pendinginan', 'suhu'], ['beku', '❄️', 'Penyejukbekuan', 'suhu'], ['pasteur', '🥛', 'Pempasteuran', 'suhu'],
      ['kering', '☀️', 'Pengeringan', 'air'], ['masin', '🧂', 'Pemasinan', 'air'], ['salai', '🔥', 'Penyalaian', 'air'],
      ['vakum', '🥩', 'Pembungkusan vakum', 'udara'], ['tin', '🥫', 'Pengetinan', 'udara'], ['jeruk', '🥒', 'Penjerukan', 'udara'], ['lilin', '🍏', 'Pelilinan', 'udara']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Bagaimanakah kaedah ini menghalang mikroorganisma — suhu, kurang air, atau tiada udara / keasidan?' })),
    ok: (it, z) => `✅ ${it.label} — ${{ suhu: 'suhu tinggi membunuh atau suhu rendah melambatkan mikroorganisma', air: 'menyingkirkan air daripada makanan', udara: 'menghalang udara atau mewujudkan keadaan tidak sesuai' }[z.id]}.`,
  });
  return { root, view: { w: 1.9, d: 0.95 }, ...dr };
}

// ------------------------------------------------------------ L3 Makanan dan kaedahnya
function L3(S, play) {
  const root = group('L3', table(1.9, 0.95, play));
  const mt = matcher(S, root, [['ikan_kering', '🐟', 'Ikan kering', 'Pengeringan'], ['jem', '🍯', 'Jem durian', 'Pendidihan'], ['telur', '🥚', 'Telur masin', 'Pemasinan'],
    ['susu', '🥛', 'Susu kotak', 'Pempasteuran'], ['sardin', '🥫', 'Sardin', 'Pengetinan'], ['epal', '🍎', 'Epal berkilat', 'Pelilinan']].map(P),
    { type: 'food', gap: 0.29, onDone: () => setTimeout(() => S.info('🌶️ Satu makanan boleh diawet dengan pelbagai kaedah, dan beberapa kaedah boleh digabungkan — contoh ikan dimasinkan kemudian dikeringkan.', 10), 2500) });
  return { root, view: { w: 1.9, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L4 Projek cili kering
function L4(S, play) {
  const root = group('L4', table(1.9, 0.95, play));
  const ST = [['cuci', '🧤 Cuci cili dengan sarung tangan'], ['lap', '🧻 Lap hingga kering'], ['timbang_awal', '⚖️ Timbang jisim awal'], ['jemur', '☀️ Jemur tujuh hari'], ['timbang_akhir', '⚖️ Timbang jisim akhir'], ['simpan', '🔒 Simpan dalam bekas kedap udara']];
  const dr = sequence(S, root, ST.map(([id, l]) => ({ obj: textCard(id, l, 0.25), l })), {
    type: 'project', gap: 0.29, slotW: 0.27, ok: it => `✅ ${it.l.slice(it.l.indexOf(' ') + 1)}.`,
    onDone: () => setTimeout(() => S.info('🌶️ Jisim akhir lebih kecil kerana air telah disingkirkan. Pengawetan menjadikan makanan tahan lama, mengelakkan pembaziran, membekalkan makanan di luar musim, memudahkan eksport dan menghasilkan makanan sedia dimakan.', 12), 2200),
  });
  return { root, view: { w: 1.9, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Kerosakan makanan', sp: 'SP 8.1.1 · 8.1.2', make: L1 },
  { id: 'L2', title: 'Kaedah pengawetan', sp: 'SP 8.2.1 · 8.2.2', make: L2 },
  { id: 'L3', title: 'Makanan dan kaedahnya', sp: 'SP 8.2.2 · 8.2.5', make: L3 },
  { id: 'L4', title: 'Projek cili kering', sp: 'SP 8.2.3 · 8.2.6', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Pengawetan Makanan',
  intro: '<b>Sains Tahun 6 · Unit 8.</b> Mengapa makanan rosak dan bagaimana mengawetnya! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
