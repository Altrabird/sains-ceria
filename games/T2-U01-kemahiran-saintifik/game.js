// Sains Tahun 2 · Unit 1 Kemahiran Saintifik — classify, measure + record, handle/sketch/label a snail, investigation order.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, beaker, magnifier, snail, sink, traceSheet, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

const zone = (name, label, color, x, z, w = 0.6, d = 0.3) => {
  const g = group(name, mesh(new THREE.BoxGeometry(w, 0.006, d), M(color, { transparent: true, opacity: 0.6 }), 0, 0.003, 0));
  const t = textSprite(label, { h: 0.04 }); t.position.set(0, 0.03, -d / 2 - 0.03); g.add(t); g.position.set(x, 0, z); g.userData.size = [w, d]; return g;
};
const inZone = (z, p) => Math.abs(p.x - z.position.x) < z.userData.size[0] / 2 + 0.02 && Math.abs(p.z - z.position.z) < z.userData.size[1] / 2 + 0.02;

// ------------------------------------------------------------ L1 Mengelas: berkepak / tidak berkepak
const BEASTS = [['itik', '🦆', 'Itik', true], ['penguin', '🐧', 'Penguin', true], ['helang', '🦅', 'Helang', true],
  ['kambing', '🐐', 'Kambing', false], ['tenuk', '🐾', 'Tenuk', false], ['harimau', '🐅', 'Harimau', false]];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const yes = zone('zon_berkepak', '🐦 Berkepak', 0xb3e5fc, -0.36, -0.18), no = zone('zon_tidak', '🚫 Tidak berkepak', 0xffccbc, 0.36, -0.18);
  root.add(yes, no);
  const mix = [4, 1, 5, 0, 3, 2];
  const cards = BEASTS.map(([id, e, label, wings], i) => { const c = emojiCard(id, e, label, 0.13, { border: '#3a7bd5' }); c.userData.wings = wings; c.position.set(-0.6 + mix[i] * 0.24, 0, 0.25); root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c) {
      const z = inZone(yes, c.position) ? yes : inZone(no, c.position) ? no : null;
      if (!z) return goHome(S, c);
      const label = BEASTS.find(b => b[0] === c.name)[2];
      if ((z === yes) !== c.userData.wings) { S.info(`🤔 Adakah ${label.toLowerCase()} mempunyai kepak? Lihat sekali lagi.`); return goHome(S, c); }
      done.add(c); const n = [...done].filter(x => x.userData.wings === c.userData.wings).length;
      moveTo(S, c, z.position.clone().add(new THREE.Vector3((n - 2) * 0.18, 0, 0)));
      S.evt('classify', c.name); S.info(`✅ ${label} — <b>${c.userData.wings ? 'berkepak' : 'tidak berkepak'}</b>.` + (done.size === 6 ? ' Mengelas ialah mengumpulkan objek mengikut <b>ciri sepunya</b>.' : ''));
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Mengukur + berkomunikasi
function scale(name = 'alat_penimbang') {
  const g = group(name, mesh(new THREE.BoxGeometry(0.16, 0.08, 0.12), M(0xe53935), 0, 0.04, 0), mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 28), M(0xcfd8dc, { metalness: 0.6 }), 0, 0.085, 0),
    mesh(new THREE.CircleGeometry(0.035, 28), M(0xffffff), 0, 0.045, 0.061));
  const needle = mesh(new THREE.BoxGeometry(0.003, 0.03, 0.002), M(0x111111), 0, 0.045, 0.063); needle.geometry.translate(0, 0.014, 0); needle.name = 'jarum'; g.add(needle);
  return g;
}
function ruler(name = 'pembaris') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#ffe082'; g.fillRect(0, 0, 1024, 96); g.fillStyle = '#333'; g.font = 'bold 22px system-ui';
  for (let i = 0; i <= 50; i++) { const x = 12 + i * 20; g.fillRect(x, 0, 2, i % 5 ? 20 : 36); if (i % 5 === 0) g.fillText(i, x - 6, 62); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const top = mesh(new THREE.PlaneGeometry(0.52, 0.05), new THREE.MeshBasicMaterial({ map: t }), 0, 0.005, 0); top.rotation.x = -Math.PI / 2;
  return group(name, mesh(new THREE.BoxGeometry(0.52, 0.004, 0.05), M(0xffca28), 0, 0.002, 0), top);
}
const MEASURE = [['beg', '🎒', 'Beg sekolah', 'berat', 3], ['tembikai', '🍉', 'Tembikai', 'berat', 2], ['pensel', '✏️', 'Pensel', 'panjang', 15], ['buku', '📕', 'Buku', 'panjang', 25]];
function L2(S, play) {
  const root = group('L2', table(1.5, 0.85, play));
  const sc = scale(); sc.scale.setScalar(1.4); sc.position.set(-0.35, 0, -0.18); root.add(sc);
  const ru = ruler(); ru.position.set(0.25, 0, -0.18); root.add(ru);
  for (const [o, t] of [[sc, 'Alat penimbang (kg)'], [ru, 'Pembaris (cm)']]) { const l = textSprite(t, { h: 0.032 }); l.position.set(o.position.x, 0.2, o.position.z - 0.08); root.add(l); }
  const items = MEASURE.map(([id, e, label], i) => { const c = emojiCard(id, e, label, 0.1, { border: '#00897b' }); c.position.set(-0.45 + i * 0.3, 0, 0.27); root.add(home(c)); return c; });
  // record table
  const tc = document.createElement('canvas'); tc.width = 400; tc.height = 230; const tg = tc.getContext('2d'); const ttex = new THREE.CanvasTexture(tc); ttex.colorSpace = THREE.SRGBColorSpace;
  const res = {};
  const drawTable = () => {
    tg.fillStyle = '#fff'; tg.fillRect(0, 0, 400, 230); tg.strokeStyle = '#999'; tg.lineWidth = 2; tg.font = 'bold 24px system-ui'; tg.fillStyle = '#2b2340';
    tg.fillText('Objek', 16, 34); tg.fillText('Ukuran', 220, 34);
    MEASURE.forEach(([id, , label, kind, v], r) => { const y = 74 + r * 40; tg.strokeRect(8, y - 30, 384, 40); tg.font = '24px system-ui'; tg.fillText(label, 16, y); if (res[id]) tg.fillText(`${v} ${kind === 'berat' ? 'kg' : 'cm'}`, 220, y); });
    ttex.needsUpdate = true;
  };
  drawTable();
  const board = mesh(new THREE.PlaneGeometry(0.3, 0.17), new THREE.MeshBasicMaterial({ map: ttex }), 0.5, 0.12, 0.05); board.rotation.y = -0.4; board.rotation.x = -0.3; board.name = 'jadual'; root.add(board);
  const measured = new Set(); let recorded = false;
  const dr = dragger(S, () => items.filter(i => !measured.has(i)), {
    onDrop(c, x, y) {
      const m = MEASURE.find(m => m[0] === c.name);
      const onScale = flat(c.position, sc.position) < 0.15 || nearScreen(S, sc, x, y, 0.12, 70), onRuler = flat(c.position, ru.position) < 0.2 && Math.abs(c.position.z - ru.position.z) < 0.08;
      if (!onScale && !onRuler) return goHome(S, c);
      if ((m[3] === 'berat') !== onScale) { S.info(m[3] === 'berat' ? `⚖️ Untuk mengukur <b>berat</b> ${m[2].toLowerCase()}, gunakan <b>alat penimbang</b>.` : `📏 Untuk mengukur <b>panjang</b> ${m[2].toLowerCase()}, gunakan <b>pembaris</b>.`); return goHome(S, c); }
      measured.add(c); res[c.name] = true;
      if (onScale) { moveTo(S, c, sc.position.clone().setY(0.13)); const n = sc.getObjectByName('jarum'); S.tween(1, k => n.rotation.z = -k * m[4] / 5 * Math.PI); }
      else moveTo(S, c, ru.position.clone().add(new THREE.Vector3(-0.26 + 0.012 + m[4] / 100 / 2, 0, 0.0)));
      S.evt('measure', c.name); S.info(`${onScale ? '⚖️' : '📏'} ${m[2]}: <b>${m[4]} ${onScale ? 'kilogram (kg)' : 'sentimeter (cm)'}</b>.`);
      setTimeout(() => { if (onScale) { goHome(S, c); sc.getObjectByName('jarum').rotation.z = 0; } }, 2500);
      if (measured.size === 4) setTimeout(() => S.info('📋 Tuding <b>jadual</b> untuk mencatat ukuran — berkomunikasi melalui jadual.'), 2800);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    hit: (x, y) => (measured.size === 4 ? S.hitTest(x, y, [board])?.name ?? null : null),
    tap(x, y) {
      if (measured.size < 4 || recorded || S.hitTest(x, y, [board]) !== board) return;
      recorded = true; drawTable(); S.evt('record', 'jadual'); S.star(board.position.clone().setY(0.25));
      S.info('📋 Maklumat dicatat dalam <b>jadual</b>. Kita juga boleh berkomunikasi melalui tulisan, lisan, gambar, carta, graf dan model.');
    },
  };
}

// ------------------------------------------------------------ L3 Siput kebun: gloves, sketch, label, release
function snailOutline() {
  const p = [];
  for (let i = 0; i <= 8; i++) p.push([-0.18 + i * 0.04, -0.07]);                         // foot, tail -> head
  p.push([0.15, -0.05], [0.17, 0.0], [0.2, 0.09], [0.175, 0.0], [0.13, -0.02]);         // head + tentacle
  for (let i = 0; i <= 16; i++) { const a = -0.25 + i / 16 * (Math.PI + 0.45); p.push([-0.01 + Math.cos(a) * 0.1, 0.03 + Math.sin(a) * 0.1]); }  // shell
  p.push([-0.12, -0.04]);
  return p;
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const garden = group('kebun', mesh(new THREE.BoxGeometry(0.28, 0.02, 0.2), M(0x6d4c2f, { roughness: 1 }), 0, 0.01, 0));
  for (let i = 0; i < 6; i++) garden.add(mesh(new THREE.ConeGeometry(0.01, 0.06, 5), M(0x43a047), -0.12 + i * 0.05, 0.05, -0.08 + (i % 2) * 0.04));
  garden.position.set(-0.5, 0, -0.18); root.add(garden);
  const gl = textSprite('Kebun', { h: 0.03 }); gl.position.set(-0.5, 0.1, -0.18); root.add(gl);
  const tray = group('dulang', mesh(new THREE.BoxGeometry(0.2, 0.012, 0.14), M(0xb0bec5), 0, 0.006, 0)); tray.position.set(-0.5, 0, 0.18); root.add(tray);
  const sn = snail(); sn.scale.setScalar(1.6); sn.position.set(-0.5, 0.02, -0.18); sn.userData.carryY = 0.02; root.add(sn);
  const gloves = emojiCard('sarung_tangan', '🧤', 'Sarung tangan', 0.1, { border: '#1e88e5' }); gloves.position.set(-0.15, 0, 0.3); root.add(home(gloves));
  const hands = emojiCard('tangan', '🙌', 'Tangan saya', 0.1, { border: '#999' }); hands.position.set(-0.15, 0, 0.05); root.add(hands);
  const ts = traceSheet(S, { w: 0.5, h: 0.32, pts: snailOutline(), ink: '#6d4c41' });
  ts.sheet.position.set(0.32, 0.002, -0.05); root.add(ts.sheet, ts.pencil);
  const spots = { cangkerang: [-0.01, 0.03], sesungut: [0.19, 0.08] };
  const dots = Object.entries(spots).map(([k, [x, y]]) => { const d = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 20), M(0xe0457b), 0.32 + x, 0.006, -0.05 - y); d.name = 'titik_' + k; d.visible = false; root.add(d); return d; });
  const labels = [['cangkerang', 'Cangkerang'], ['sesungut', 'Sesungut']].map(([id, t], i) => { const c = emojiCard('label_' + id, '', t, 0.06, { border: '#f5a623' }); c.userData.part = id; c.position.set(0.15 + i * 0.25, 0, 0.32); c.visible = false; root.add(home(c)); return c; });
  let gloved = false, onTray = false, sketched = false, released = false; const labelled = new Set();
  const dr = dragger(S, () => [...(gloved ? [] : [gloves]), ...(gloved && !released && (!onTray || labelled.size === 2) ? [sn] : []), ...labels.filter(l => l.visible && !labelled.has(l))], {
    onPick(o) { if (o === sn && !gloved) return false; },
    onDrop(o) {
      if (o === gloves) {
        if (flat(o.position, hands.position) > 0.12) return goHome(S, o);
        gloved = true; o.visible = false; hands.visible = false;
        const on = emojiSprite('🧤', 0.08); on.position.set(-0.15, 0.08, 0.1); root.add(on);
        S.evt('gloves', 'sarung_tangan'); return S.info('🧤 Pakai sarung tangan. Sekarang pindahkan siput dari kebun ke <b>dulang</b> dengan cermat.');
      }
      if (o === sn && !onTray) {
        if (flat(o.position, tray.position) > 0.12) { S.info('Letakkan siput di atas <b>dulang</b> dengan perlahan.'); return moveTo(S, o, new THREE.Vector3(-0.5, 0.02, -0.18)); }
        onTray = true; moveTo(S, o, tray.position.clone().setY(0.012)); S.evt('handle', 'siput');
        return S.info('🐌 Siput di atas dulang. Perhatikan, kemudian <b>lakarkan</b> siput di atas kertas.');
      }
      if (o === sn && onTray) {
        if (flat(o.position, garden.position) > 0.16) return moveTo(S, o, tray.position.clone().setY(0.012));
        released = true; moveTo(S, o, garden.position.clone().setY(0.02)); S.evt('release', 'siput');
        return S.info('🌱 Siput dilepaskan ke <b>tempat asalnya</b> selepas penyiasatan. Bagus!');
      }
      const d = dots.find(d => flat(d.position, o.position) < 0.06);
      if (!d) return goHome(S, o);
      if (d.name !== 'titik_' + o.userData.part) { S.info('🤔 Bukan di situ. Lihat siput di atas dulang.'); return goHome(S, o); }
      labelled.add(o); d.visible = false; moveTo(S, o, d.position.clone().setY(0)); S.evt('label', o.userData.part);
      if (labelled.size === 2) S.info('🏷️ Lakaran dilabel! Sekarang <b>lepaskan siput</b> kembali ke kebun.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    pen(x, y, on) {
      if (!onTray || sketched || !ts.pen(x, y, on)) return;
      sketched = true; S.evt('sketch', 'siput'); S.star(ts.sheet.position.clone().setY(0.2));
      dots.forEach(d => d.visible = true); labels.forEach(l => l.visible = true);
      S.info('✏️ Lakaran siap! <b>Labelkan</b> cangkerang dan sesungut.');
    },
    tracePath: ts.tracePath,
  };
}

// ------------------------------------------------------------ L4 Urutan penyiasatan + clean + store
const SEQ = [['letak', '🌺', 'Letakkan bunga raya di atas dulang'], ['perhati', '🔍', 'Perhatikan'], ['lakar', '✏️', 'Lakarkan'], ['bersih', '🧼', 'Bersihkan peralatan']];
function conical(name) { return group(name, mesh(new THREE.CylinderGeometry(0.012, 0.04, 0.08, 20, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.04, 0), mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 16, 1, true), M(0xe1f5fe, { transparent: true, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.095, 0)); }
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  const slots = SEQ.map((s, i) => { const m = mesh(new THREE.BoxGeometry(0.16, 0.004, 0.11), M(0xffd84d, { transparent: true, opacity: 0.7 }), -0.5 + i * 0.22, 0.002, -0.3); m.name = 'urutan_' + (i + 1); root.add(m);
    const n = textSprite(String(i + 1), { h: 0.03 }); n.position.set(m.position.x - 0.1, 0.02, -0.3); root.add(n); return m; });
  for (let i = 0; i < 3; i++) { const a = textSprite('➜', { h: 0.03, bg: '#ffffff00' }); a.position.set(-0.39 + i * 0.22, 0.02, -0.3); root.add(a); }
  const mix = [2, 0, 3, 1];
  const cards = SEQ.map(([id, e, label], i) => { const c = emojiCard(id, e, label, 0.11, { border: '#7e57c2' }); c.position.set(-0.5 + mix[i] * 0.22, 0, -0.05); root.add(home(c)); return c; });
  const sk = sink(); sk.scale.setScalar(0.9); sk.position.set(-0.35, 0, 0.27); root.add(sk);
  const shelf = group('rak', mesh(new THREE.BoxGeometry(0.34, 0.012, 0.12), M(0xb07a45), 0, 0.12, 0), ...[-0.17, 0.17].map(x => mesh(new THREE.BoxGeometry(0.012, 0.12, 0.12), M(0x8a5a2e), x, 0.06, 0)));
  shelf.position.set(0.5, 0, 0.18); root.add(shelf);
  const tools = [conical('kelalang_kon'), beaker('bikar'), magnifier('kanta')];
  tools.forEach((t, i) => { t.position.set(0.05 + i * 0.12, 0, 0.3); t.userData.carryY = 0.13; root.add(home(t)); });
  let next = 0, washed = false; const stored = new Set();
  const dr = dragger(S, () => [...cards.filter((c, i) => c.userData.slot === undefined), ...(washed ? tools.filter(t => !stored.has(t)) : [])], {
    onDrop(o, x, y) {
      if (tools.includes(o)) {
        if (!(nearScreen(S, shelf, x, y, 0.13, 90) || flat(o.position, shelf.position) < 0.18)) return goHome(S, o);
        const spot = shelf.position.clone().add(new THREE.Vector3(-0.11 + stored.size * 0.11, 0.126, 0)); stored.add(o); moveTo(S, o, spot);
        S.evt('store', o.name); return S.info(stored.size < 3 ? '✅ Disimpan di rak.' : '✅ Peralatan disimpan dengan <b>betul dan selamat</b>.');
      }
      const s = slots.find(s => flat(s.position, o.position) < 0.1);
      if (!s) return goHome(S, o);
      if (s !== slots[next] || o.name !== SEQ[next][0]) { S.info(`🤔 Langkah ${next + 1}: apakah yang kita lakukan ${next ? 'seterusnya' : 'dahulu'}?`); return goHome(S, o); }
      o.userData.slot = next; next++; moveTo(S, o, s.position.clone().setY(0)); S.evt('order', o.name);
      if (next === 4) S.info('🧼 Urutan betul! Sekarang tuding <b>paip</b> untuk mencuci tangan dan peralatan.');
    },
  });
  return {
    root, view: { w: 1.5, d: 0.9 }, ...dr,
    hit: (x, y) => (next === 4 && !washed ? S.hitTest(x, y, [sk.getObjectByName('paip')])?.name ?? null : null),
    tap(x, y) {
      if (next < 4 || washed || S.hitTest(x, y, [sk.getObjectByName('paip')]) == null) return;
      washed = true; sk.getObjectByName('aliran').visible = true;
      const bub = emojiSprite('🧼', 0.08); bub.position.set(-0.35, 0.2, 0.27); root.add(bub);
      setTimeout(() => { sk.getObjectByName('aliran').visible = false; root.remove(bub); }, 2500);
      S.evt('wash', 'tangan'); S.info('🙌 Cuci tangan dan peralatan selepas digunakan. Kemudian <b>simpan</b> peralatan di rak.');
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Mengelas', sp: 'SP 1.1.2', make: L1 },
  { id: 'L2', title: 'Mengukur dan berkomunikasi', sp: 'SP 1.1.3 · 1.1.4', make: L2 },
  { id: 'L3', title: 'Kendalikan dan lakar siput', sp: 'SP 1.2.2 · 1.2.3', make: L3 },
  { id: 'L4', title: 'Urutan penyiasatan', sp: 'SP 1.2.4 · 1.2.5', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Kemahiran Saintifik (Tahun 2)',
  intro: '<b>Sains Tahun 2 · Unit 1.</b> Kelaskan, ukur, lakar dan siasat! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / lakar · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
