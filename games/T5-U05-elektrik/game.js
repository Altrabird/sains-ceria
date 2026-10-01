// Sains Tahun 5 · Unit 5 Elektrik (SP 5.1.1 – 5.3.3) — sources of electricity, circuit symbols, series vs parallel,
// brightness factors (cells, bulbs), safety and saving electricity.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, sorter, matcher, emojiCard, textCard, diagramBoard, labelPins, battery, bulb, switchPart, wire, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// bulb brightness 0..1 (bulb() only knows on/off)
function glow(b, lvl) {
  b.userData.setOn(lvl > 0); const [glass, fil, h] = [b.children[4], b.children[5], b.children[6]];
  glass.material.emissiveIntensity = 2.2 * lvl; fil.material.emissiveIntensity = 3 * lvl; h.scale.setScalar(0.04 + 0.1 * lvl);
}
const V = (x, z) => new THREE.Vector3(x, 0.006, z);

// ------------------------------------------------------------ L1 Sumber tenaga elektrik
function L1(S, play) {
  const root = group('L1', table(1.8, 0.95, play));
  const mt = matcher(S, root, [['stesen', '🏭', 'Stesen jana kuasa', 'Turbin menjana elektrik'], ['suria', '☀️', 'Sel suria', 'Cahaya → elektrik'], ['sel_kering', '🔋', 'Sel kering', 'Kimia → elektrik'],
    ['dinamo', '🚲', 'Dinamo', 'Kinetik → elektrik'], ['akumulator', '🚗', 'Akumulator', 'Bekalkan elektrik kenderaan'], ['penjana', '⛽', 'Penjana', 'Guna bahan api']]
    .map(([id, e, l, f]) => ({ id, target: [e, l], card: ['', f], ok: `✅ ${l}: <b>${f.replace('→', 'kepada').toLowerCase()}</b>.` })), { type: 'source', gap: 0.29, targetZ: -0.22, rowZ: 0.3 });
  return { root, view: { w: 1.8, d: 0.95 }, ...mt };
}

// ------------------------------------------------------------ L2 Simbol komponen
const SYM = {
  sel_kering: g => { g.moveTo(10, 100); g.lineTo(130, 100); g.moveTo(130, 55); g.lineTo(130, 145); g.moveTo(170, 75); g.lineTo(170, 125); g.moveTo(170, 100); g.lineTo(290, 100); g.lineWidth = 10; },
  mentol: g => { g.moveTo(10, 100); g.lineTo(105, 100); g.moveTo(195, 100); g.lineTo(290, 100); g.moveTo(195, 100); g.arc(150, 100, 45, 0, 7); g.moveTo(118, 68); g.lineTo(182, 132); g.moveTo(182, 68); g.lineTo(118, 132); },
  suis_terbuka: g => { g.moveTo(10, 100); g.lineTo(100, 100); g.lineTo(190, 55); g.moveTo(200, 100); g.lineTo(290, 100); g.moveTo(106, 100); g.arc(100, 100, 6, 0, 7); g.moveTo(206, 100); g.arc(200, 100, 6, 0, 7); },
  suis_tertutup: g => { g.moveTo(10, 100); g.lineTo(290, 100); g.moveTo(106, 100); g.arc(100, 100, 6, 0, 7); g.moveTo(206, 100); g.arc(200, 100, 6, 0, 7); },
  wayar: g => { g.moveTo(10, 100); g.lineTo(290, 100); },
};
function L2(S, play) {
  const root = group('L2', table(1.7, 0.95, play));
  const holder = group('simbol');
  Object.entries(SYM).forEach(([id, f], i) => {
    const d = diagramBoard('simbol_' + id, { w: 0.27, h: 0.18, px: 300, tilt: 1.1, pins: { [id]: [0.5, 0.88] }, draw: g => { g.strokeStyle = '#2b2340'; g.lineWidth = 7; g.beginPath(); f(g); g.stroke(); } });
    d.position.set(-0.6 + i * 0.3, 0, -0.18); holder.add(d);
  });
  root.add(holder);
  const dr = labelPins(S, root, holder, [['sel_kering', 'Sel kering'], ['mentol', 'Mentol'], ['suis_terbuka', 'Suis terbuka'], ['suis_tertutup', 'Suis tertutup'], ['wayar', 'Wayar penyambung']], {
    row: 0.3, size: 0.09, wrong: '🤔 Bukan simbol itu. Lihat bentuknya sekali lagi.', onLabel: id => { S.evt('symbol', id); S.info(`✅ Simbol <b>${id.replace('_', ' ')}</b>.`); },
  });
  return { root, view: { w: 1.6, d: 1.0 }, ...dr };
}

// ------------------------------------------------------------ L3 Litar bersiri dan litar selari
function L3(S, play) {
  const root = group('L3', table(1.7, 0.95, play));
  // series (left): switch + 2 bulbs on top edge, battery bottom
  const sSw = switchPart('suis_siri'), sB = [bulb('mentol_siri1'), bulb('mentol_siri2')], sBat = battery('bateri_siri');
  sSw.position.set(-0.68, 0, -0.15); sB[0].position.set(-0.5, 0, -0.15); sB[1].position.set(-0.32, 0, -0.15); sBat.position.set(-0.5, 0, 0.15);
  root.add(sSw, ...sB, sBat, wire([V(-0.76, -0.15), V(-0.24, -0.15), V(-0.24, 0.15), V(-0.76, 0.15), V(-0.76, -0.15)], 0x455a64));
  const sl = textSprite('Litar bersiri', { h: 0.035, bg: '#bbdefbee' }); sl.position.set(-0.5, 0.02, 0.3); root.add(sl);
  // parallel (right): two branches, each with a switch + bulb
  const pSw = [switchPart('suis_a'), switchPart('suis_b')], pB = [bulb('mentol_a'), bulb('mentol_b')], pBat = battery('bateri_selari');
  [-0.2, 0].forEach((z, i) => { pSw[i].position.set(0.36, 0, z); pB[i].position.set(0.56, 0, z); });
  pBat.position.set(0.46, 0, 0.17); root.add(...pSw, ...pB, pBat);
  root.add(wire([V(0.24, -0.2), V(0.68, -0.2)], 0x455a64), wire([V(0.24, 0), V(0.68, 0)], 0x455a64), wire([V(0.24, -0.2), V(0.24, 0.17), V(0.68, 0.17), V(0.68, -0.2)], 0x455a64));
  const pl = textSprite('Litar selari', { h: 0.035, bg: '#f8bbd0ee' }); pl.position.set(0.46, 0.02, 0.3); root.add(pl);
  const ask = [['siri', 'Litar bersiri lebih cerah'], ['selari', 'Litar selari lebih cerah']].map(([id, l], i) => { const c = textCard('jawapan_' + id, l, 0.3); c.position.set(-0.17 + i * 0.34, 0, 0.36); c.visible = false; root.add(c); return c; });
  const seen = new Set(); let answered = false;
  const mark = (k, msg) => { if (!seen.has(k)) { seen.add(k); S.evt(k.split(':')[0], k.split(':')[1]); } S.info(msg, 7);
    if (seen.has('circuit:siri') && seen.has('circuit:selari') && seen.has('branch:selari') && !ask[0].visible) setTimeout(() => { ask.forEach(c => (c.visible = true)); S.info('💡 Bandingkan kecerahan mentol. Litar manakah lebih cerah?'); }, 2000); };
  function refresh() {
    sB.forEach(b => glow(b, sSw.userData.closed ? 0.4 : 0));
    pB.forEach((b, i) => glow(b, pSw[i].userData.closed ? 1 : 0));
  }
  refresh();
  const sw = [sSw, ...pSw];
  return {
    root, view: { w: 1.7, d: 1.0 },
    hit: (x, y) => S.hitTest(x, y, [...sw, ...ask.filter(c => c.visible)])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...sw, ...ask.filter(c => c.visible)]); if (!c) return;
      if (ask.includes(c)) {
        if (answered) return;
        if (c.name === 'jawapan_siri') return S.info('🤔 Lihat semula — mentol dalam litar bersiri lebih malap kerana arus mempunyai satu laluan sahaja.');
        answered = true; S.evt('compare', 'selari'); return S.info('✅ Dengan bilangan sel kering dan mentol yang sama, mentol dalam <b>litar selari</b> menyala lebih cerah.', 9);
      }
      c.userData.setClosed(!c.userData.closed); refresh();
      if (c === sSw) return c.userData.closed ? mark('circuit:siri', '✅ Litar bersiri lengkap — arus mempunyai <b>satu laluan</b>. Kedua-dua mentol menyala, tetapi malap.') : S.info('⭕ Suis dibuka — litar tidak lengkap, <b>semua</b> mentol padam.');
      const on = pSw.filter(s => s.userData.closed).length;
      if (on === 2) return mark('circuit:selari', '✅ Litar selari — arus mempunyai <b>lebih daripada satu laluan</b>. Mentol menyala cerah.');
      if (on === 1 && seen.has('circuit:selari') && !c.userData.closed) return mark('branch:selari', '✅ Suis satu cabang dibuka — mentol cabang itu padam, tetapi mentol pada cabang lain <b>masih menyala</b>.');
      S.info(on ? '🔌 Satu cabang lengkap. Tutup suis cabang yang satu lagi.' : '⭕ Kedua-dua cabang terbuka.');
    },
  };
}

// ------------------------------------------------------------ L4 Faktor kecerahan mentol (litar bersiri)
function L4(S, play) {
  const root = group('L4', table(1.5, 0.95, play));
  let cells = 1, bulbs = 1, circ = null, done = false;
  const tried = new Set();
  const btns = [['tambah_sel', '🔋', '+ Sel kering'], ['kurang_sel', '➖', '− Sel kering'], ['tambah_mentol', '💡', '+ Mentol'], ['kurang_mentol', '➖', '− Mentol']]
    .map(([id, e, l], i) => { const c = textCard(id, e + ' ' + l, 0.2, { border: i < 2 ? '#43a047' : '#fb8c00' }); c.position.set(-0.6 + i * 0.22, 0, 0.32); root.add(c); return c; });
  const ask = [['diterima', 'Hipotesis diterima', true], ['ditolak', 'Hipotesis ditolak', false]].map(([id, l, ok], i) => { const c = textCard('kesimpulan_' + id, l, 0.24); c.userData.ok = ok; c.position.set(0.47, 0, -0.05 + i * 0.17); c.visible = false; root.add(c); return c; });
  const hyp = textCard('hipotesis', 'Semakin bertambah bilangan sel kering, semakin cerah mentol.', 0.36, { border: '#ef6c00' }); hyp.position.set(0.47, 0, -0.32); root.add(hyp);
  let meter = null;
  function build() {
    if (circ) root.remove(circ); circ = group('litar'); root.add(circ);
    const lvl = Math.min(1, 0.35 * cells / bulbs);
    for (let i = 0; i < bulbs; i++) { const b = bulb('mentol_' + i); b.position.set(-0.3 + (i - (bulbs - 1) / 2) * 0.13, 0, -0.18); circ.add(b); glow(b, lvl); }
    for (let i = 0; i < cells; i++) { const b = battery('sel_' + i); b.position.set(-0.3 + (i - (cells - 1) / 2) * 0.15, 0, 0.12); circ.add(b); }
    circ.add(wire([V(-0.58, -0.18), V(-0.02, -0.18), V(-0.02, 0.12), V(-0.58, 0.12), V(-0.58, -0.18)], 0x455a64));
    if (meter) root.remove(meter); meter = textSprite(`${cells} sel kering · ${bulbs} mentol · kecerahan ${'★'.repeat(Math.max(1, Math.round(lvl * 3)))}`, { h: 0.035, bg: '#fff59dee' }); meter.position.set(-0.3, 0.2, -0.32); root.add(meter);
  }
  build();
  function record() {
    if (bulbs === 1 && cells > 1 && !tried.has('c' + cells)) { tried.add('c' + cells); S.evt('cells', 'c' + cells); }
    if (cells === 1 && bulbs > 1 && !tried.has('b' + bulbs)) { tried.add('b' + bulbs); S.evt('bulbs', 'b' + bulbs); }
    if (tried.size === 4 && !ask[0].visible) setTimeout(() => { ask.forEach(c => (c.visible = true)); S.info('📋 Bilangan sel kering bertambah → mentol semakin cerah. Adakah hipotesis diterima?'); }, 1800);
  }
  return {
    root, view: { w: 1.5, d: 1.0 },
    hit: (x, y) => S.hitTest(x, y, [...btns, ...ask.filter(c => c.visible)])?.name ?? null,
    tap(x, y) {
      const c = S.hitTest(x, y, [...btns, ...ask.filter(c => c.visible)]); if (!c) return;
      if (ask.includes(c)) {
        if (done) return; if (!c.userData.ok) return S.info('🤔 Lihat bintang kecerahan apabila sel kering ditambah.');
        done = true; S.evt('conclude', 'diterima'); return S.info('✅ Semakin bertambah bilangan sel kering, semakin cerah mentol. Dalam litar bersiri, semakin bertambah mentol, semakin <b>malap</b> mentol.', 10);
      }
      const k = c.name; if (k === 'tambah_sel') cells = Math.min(3, cells + 1); if (k === 'kurang_sel') cells = Math.max(1, cells - 1);
      if (k === 'tambah_mentol') bulbs = Math.min(3, bulbs + 1); if (k === 'kurang_mentol') bulbs = Math.max(1, bulbs - 1);
      build(); S.info(k.includes('sel') ? (bulbs === 1 ? `🔋 ${cells} sel kering — ${cells > 1 ? 'mentol semakin <b>cerah</b>' : 'kecerahan asal'}.` : '💡 Kurangkan mentol kepada 1 untuk menguji bilangan sel kering.')
        : (cells === 1 ? `💡 ${bulbs} mentol dalam litar bersiri — ${bulbs > 1 ? 'mentol semakin <b>malap</b>' : 'kecerahan asal'}.` : '🔋 Kurangkan sel kering kepada 1 untuk menguji bilangan mentol.'));
      record();
    },
  };
}

// ------------------------------------------------------------ L5 Keselamatan dan penjimatan elektrik
function L5(S, play) {
  const root = group('L5', table(1.6, 0.95, play));
  const dr = sorter(S, root, {
    type: 'safety', size: 0.09, gap: 0.19, row: 0.3,
    zones: [{ id: 'baik', label: '✅ Selamat dan jimat', color: 0xc8e6c9, x: -0.38, z: -0.18, w: 0.7 }, { id: 'buruk', label: '❌ Cuai atau membazir', color: 0xffcdd2, x: 0.38, z: -0.18, w: 0.7 }],
    items: [['padam', '💡', 'Padam lampu bila keluar', 'baik'], ['kipas', '🌀', 'Guna kipas, bukan penyaman', 'baik'], ['kering', '🙌', 'Tangan kering sentuh suis', 'baik'], ['satu_plag', '🔌', 'Satu plag satu soket', 'baik'],
      ['basah', '💦', 'Tangan basah sentuh suis', 'buruk'], ['wayar', '⚡', 'Guna wayar rosak', 'buruk'], ['banyak_plag', '🔥', 'Banyak plag satu soket', 'buruk'], ['peti', '🧊', 'Pintu peti sejuk terbuka', 'buruk']]
      .map(([id, emoji, label, zone]) => ({ id, emoji, label, zone, why: 'Adakah amalan ini selamat dan menjimatkan elektrik?' })),
    ok: (it, z) => z.id === 'baik' ? `✅ ${it.label} — amalan <b>selamat dan jimat</b>.` : `⚠️ ${it.label} — boleh menyebabkan renjatan elektrik, litar pintas, kebakaran atau pembaziran.`,
    onDone: () => setTimeout(() => S.info('🔌 Penggunaan tenaga elektrik dipengaruhi oleh jenis peralatan dan tempoh penggunaan.', 9), 2500),
  });
  return { root, view: { w: 1.6, d: 0.95 }, ...dr };
}

const LEVELS = [
  { id: 'L1', title: 'Sumber tenaga elektrik', sp: 'SP 5.1.1', make: L1 },
  { id: 'L2', title: 'Simbol komponen', sp: 'SP 5.2.2', make: L2 },
  { id: 'L3', title: 'Litar bersiri dan selari', sp: 'SP 5.2.1 · 5.2.3 · 5.2.6', make: L3 },
  { id: 'L4', title: 'Faktor kecerahan mentol', sp: 'SP 5.2.4 · 5.2.5 · 5.2.7', make: L4 },
  { id: 'L5', title: 'Selamat dan jimat', sp: 'SP 5.3.1 – 5.3.3', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Elektrik (Tahun 5)',
  intro: '<b>Sains Tahun 5 · Unit 5.</b> Litar bersiri, litar selari dan kecerahan mentol! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
