// Sains Tahun 2 · Unit 7 Elektrik (SP 7.1.1 – 7.1.7) — components, complete circuit, troubleshooting, conductors, buzzer.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, emojiCard, battery, bulb, switchPart, buzzer, wire, home, goHome, moveTo, flat, nearScreen, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ circuit board: battery (bottom), load (top-left), switch/gap (top-right)
const SLOT = { sel: new THREE.Vector3(0, 0, 0.12), beban: new THREE.Vector3(-0.22, 0, -0.12), suis: new THREE.Vector3(0.22, 0, -0.12) };
const LABEL = { sel: 'Sel kering', beban: 'Mentol', suis: 'Suis' };
class Circuit {
  constructor(S, root, { gapLabel = 'Suis', x = -0.12 } = {}) {
    this.S = S; this.g = group('papan_litar', mesh(new THREE.BoxGeometry(0.72, 0.008, 0.38), M(0xd7ccc8), 0, -0.002, 0)); this.g.position.x = x; root.add(this.g);
    const y = 0.016, P = (a, b) => new THREE.Vector3(a, y, b);
    this.loop = [P(-0.06, 0.12), P(-0.3, 0.12), P(-0.3, -0.12), P(-0.252, -0.12), P(-0.188, -0.12), P(0.18, -0.12), P(0.26, -0.12), P(0.32, -0.12), P(0.32, 0.12), P(0.06, 0.12)];
    this.wires = [[0, 1, 2, 3], [4, 5], [6, 7, 8, 9]].map(ix => { const w = wire(ix.map(i => this.loop[i])); this.g.add(w); return w; });
    this.markers = {};
    for (const [k, p] of Object.entries(SLOT)) {
      const m = mesh(new THREE.BoxGeometry(k === 'sel' ? 0.14 : 0.1, 0.004, 0.07), M(0xffd84d, { transparent: true, opacity: 0.55 }), p.x, 0.003, p.z); m.name = 'soket_' + k; this.g.add(m); this.markers[k] = m;
      const t = textSprite(k === 'suis' ? gapLabel : LABEL[k], { h: 0.024 }); t.position.set(p.x, 0.02, p.z + (k === 'sel' ? 0.07 : -0.06)); this.g.add(t);
    }
    this.parts = {}; this.dots = []; this.loose = false;
    for (let i = 0; i < 10; i++) { const d = mesh(new THREE.SphereGeometry(0.005), M(0xffeb3b, { emissive: 0xffeb3b, emissiveIntensity: 1 })); d.visible = false; d.userData.fx = true; this.g.add(d); this.dots.push(d); }
    this.t = 0; this.on = false;
  }
  place(k, part) { this.parts[k] = part; this.g.attach(part); part.position.copy(SLOT[k]); part.rotation.set(0, 0, 0); this.markers[k].visible = false; this.update(); }
  remove(k) { const p = this.parts[k]; delete this.parts[k]; this.markers[k].visible = true; this.update(); return p; }
  slotNear(x, y, part) {  // which free slot is the pointer over
    return this.S.closest(Object.keys(SLOT), x, y, k => !this.parts[k] && (nearScreen(this.S, this.markers[k], x, y, 0.02, 60) || flat(this.g.localToWorld(SLOT[k].clone()), part.getWorldPosition(new THREE.Vector3())) < 0.07), k => this.markers[k]);
  }
  get complete() {
    const { sel, beban, suis } = this.parts;
    const gapOk = suis && (suis.userData.setClosed ? suis.userData.closed : suis.userData.conductor);
    return !!(sel && !sel.userData.dead && beban && !beban.userData.broken && !beban.userData.loose && gapOk && !this.loose);
  }
  update() {
    this.on = this.complete;
    this.parts.beban?.userData.setOn?.(this.on);
    this.dots.forEach(d => d.visible = this.on);
  }
  tick(dt) {
    if (!this.on) return; this.t += dt * 0.25;
    const L = this.loop; this.dots.forEach((d, i) => { const u = ((this.t + i / this.dots.length) % 1) * (L.length - 1), a = Math.floor(u); d.position.lerpVectors(L[a], L[Math.min(a + 1, L.length - 1)], u - a); });
  }
}
let audio;
function buzz(on) {  // a real beep (pupils hear the circuit is complete)
  try {
    audio ||= new AudioContext();
    if (on && !buzz.osc) { buzz.osc = audio.createOscillator(); const g = audio.createGain(); g.gain.value = 0.05; buzz.osc.frequency.value = 880; buzz.osc.type = 'square'; buzz.osc.connect(g).connect(audio.destination); buzz.osc.start(); }
    if (!on && buzz.osc) { buzz.osc.stop(); buzz.osc = null; }
  } catch { /* no audio in this browser */ }
}

// ------------------------------------------------------------ L1 Komponen dan fungsi
const FN = [['sel_kering', 'Membekalkan tenaga elektrik'], ['mentol', 'Mengeluarkan cahaya'], ['suis', 'Menyambungkan dan memutuskan litar'], ['wayar', 'Menyambungkan komponen elektrik']];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const wireCoil = group('wayar', wire([...Array(30)].map((_, i) => new THREE.Vector3(Math.cos(i * 0.6) * 0.04, 0.01 + i * 0.0006, Math.sin(i * 0.6) * 0.03))));
  const parts = [battery('sel_kering'), bulb('mentol'), switchPart('suis'), wireCoil];
  parts.forEach((p, i) => { p.scale.setScalar(1.5); p.position.set(-0.5 + i * 0.33, 0, -0.18); root.add(p); });
  const names = ['Sel kering', 'Mentol', 'Suis', 'Wayar penyambung']; parts.forEach((p, i) => { const t = textSprite(names[i], { h: 0.03 }); t.position.set(p.position.x, 0.14, -0.18); root.add(t); });
  const mix = [2, 0, 3, 1];
  const cards = FN.map(([id, label], i) => { const c = emojiCard('fungsi_' + id, '', label, 0.1, { border: '#f9a825' }); c.userData.id = id; c.position.set(-0.5 + mix[i] * 0.33, 0, 0.27); root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c, x, y) {
      const p = S.closest(parts, x, y, p => nearScreen(S, p, x, y, 0.03, 70) || flat(p.position, c.position) < 0.12);
      if (!p) return goHome(S, c);
      if (p.name !== c.userData.id) { S.info('🤔 Bukan fungsi komponen itu. Cuba lagi.'); return goHome(S, c); }
      done.add(c); moveTo(S, c, p.position.clone().add(new THREE.Vector3(0, 0, 0.12)));
      S.evt('function', p.name); S.info(`✅ ${names[parts.indexOf(p)]} — <b>${FN.find(f => f[0] === p.name)[1].toLowerCase()}</b>.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Litar elektrik lengkap
function L2(S, play) {
  const root = group('L2', table(1.4, 0.85, play));
  const C = new Circuit(S, root);
  const loose = [['sel', battery('sel_kering')], ['beban', bulb('mentol')], ['suis', switchPart('suis')]];
  loose.forEach(([k, p], i) => { p.userData.slot = k; p.position.set(0.42, 0, -0.25 + i * 0.2); p.scale.setScalar(1.2); root.add(home(p)); });
  let closedOnce = false, opened = false;
  const dr = dragger(S, () => loose.map(l => l[1]).filter(p => !Object.values(C.parts).includes(p)), {
    onDrop(p, x, y) {
      const k = C.slotNear(x, y, p);
      if (!k) return goHome(S, p);
      if (k !== p.userData.slot) { S.info(`🤔 Soket itu untuk <b>${LABEL[k].toLowerCase()}</b>.`); return goHome(S, p); }
      p.scale.setScalar(1); C.place(k, p); S.evt('place', p.name);
      if (Object.keys(C.parts).length === 3) S.info('🔌 Semua komponen disambungkan dengan wayar. Tuding <b>suis</b> untuk menutupnya.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (C.parts.suis ? S.hitTest(x, y, [C.parts.suis])?.name ?? null : null),
    tap(x, y) {
      const sw = C.parts.suis; if (!sw || S.hitTest(x, y, [sw]) !== sw) return;
      if (Object.keys(C.parts).length < 3) return S.info('Pasang semua komponen dahulu.');
      sw.userData.setClosed(!sw.userData.closed); C.update();
      if (sw.userData.closed) { closedOnce = true; S.evt('close', 'suis'); S.info('💡 Suis tertutup — <b>litar lengkap</b>. Arus elektrik mengalir, mentol menyala!'); }
      else if (closedOnce) { if (!opened) { opened = true; S.evt('open', 'suis'); } S.info('⭕ Suis terbuka — <b>litar tidak lengkap</b>. Mentol tidak menyala.'); }
    },
    update: dt => C.tick(dt),
  };
}

// ------------------------------------------------------------ L3 Mentol tidak menyala: find and fix four faults
const FAULTS = [['suis', 'Suis terbuka'], ['sel', 'Sel kering kekurangan tenaga'], ['mentol', 'Mentol dipasang tidak ketat'], ['wayar', 'Wayar dipasang tidak kemas']];
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const C = new Circuit(S, root);
  let round = 0, sw, bat, bl, newBat;
  const gapMark = mesh(new THREE.SphereGeometry(0.012), M(0xff5252, { emissive: 0xff1744, emissiveIntensity: 0.6 })); gapMark.name = 'hujung_wayar'; gapMark.visible = false;
  C.g.add(gapMark); gapMark.position.copy(C.loop[7]);
  function setup() {
    for (const k of ['sel', 'beban', 'suis']) if (C.parts[k]) C.g.remove(C.remove(k));
    if (newBat) { root.remove(newBat); newBat = null; }
    const f = FAULTS[round][0];
    bat = battery('sel_kering', { dead: f === 'sel' }); bl = bulb('mentol'); sw = switchPart('suis');
    bl.userData.loose = f === 'mentol'; if (bl.userData.loose) bl.position.y = 0.01;
    C.loose = f === 'wayar'; C.wires[2].visible = f !== 'wayar'; gapMark.visible = f === 'wayar';
    C.place('sel', bat); C.place('beban', bl); C.place('suis', sw);
    if (bl.userData.loose) { bl.children.slice(3).forEach(c => c.position.y += 0.012); bl.rotation.z = 0.25; }
    sw.userData.setClosed(f !== 'suis'); C.update();
    if (f === 'sel') { newBat = battery('sel_baharu'); newBat.position.set(0.42, 0, 0.25); newBat.scale.setScalar(1.2); root.add(home(newBat)); const t = textSprite('Sel kering baharu', { h: 0.024 }); t.position.set(0, 0.07, 0.03); newBat.add(t); }
    S.info(`🔍 Masalah ${round + 1}/4: mentol <b>tidak menyala</b>. Periksa litar dan baiki!`);
  }
  function fixed(id) {
    C.update(); S.evt('fix', id); S.star(C.g.position.clone().setY(0.2));
    S.info(`✅ Dibaiki: <b>${FAULTS[round][1].toLowerCase()}</b>. Mentol menyala!`);
    round++; if (round < 4) setTimeout(setup, 2500); else setTimeout(() => S.info('🛠️ Sebab mentol tidak menyala: suis terbuka, sel kering lemah, mentol rosak, mentol tidak ketat, wayar tidak kemas.', 10), 2500);
  }
  setup();
  const dr = dragger(S, () => (newBat ? [newBat] : []), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, bat, x, y, 0.03, 70) || flat(o.position, bat.getWorldPosition(new THREE.Vector3())) < 0.1)) return goHome(S, o);
      C.g.remove(C.remove('sel')); newBat.scale.setScalar(1); C.place('sel', newBat); newBat = null; fixed('sel');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => S.hitTest(x, y, [sw, bl, bat, gapMark].filter(Boolean))?.name ?? null,
    tap(x, y) {
      if (round > 3) return;
      const t = S.hitTest(x, y, [sw, bl, bat, gapMark].filter(o => o.visible)) || (gapMark.visible && S.nearest(x, y, [gapMark], 40)); if (!t) return;
      const f = FAULTS[round][0];
      if (t === sw && f === 'suis') { sw.userData.setClosed(true); return fixed('suis'); }
      if (t === bl && f === 'mentol') { bl.userData.loose = false; bl.rotation.z = 0; bl.children.slice(3).forEach(c => c.position.y -= 0.012); bl.position.y = 0; return fixed('mentol'); }
      if (t === gapMark && f === 'wayar') { C.loose = false; C.wires[2].visible = true; gapMark.visible = false; return fixed('wayar'); }
      if (t === bat && f === 'sel') return S.info('🔋 Sel kering ini <b>lemah</b>. Gantikan dengan sel kering baharu.');
      S.info('🤔 Bahagian itu tiada masalah. Periksa bahagian lain.');
    },
    update: dt => C.tick(dt),
  };
}

// ------------------------------------------------------------ L4 Konduktor dan penebat
const OBJ = [['klip_kertas', 'Klip kertas', true, 0xcfd8dc], ['sudu_logam', 'Sudu logam', true, 0xb0bec5], ['paku', 'Paku', true, 0x90a4ae], ['duit_syiling', 'Duit syiling', true, 0xd4af37],
  ['getah_pemadam', 'Getah pemadam', false, 0xf48fb1], ['straw', 'Straw', false, 0xef5350], ['rod_kaca', 'Rod kaca', false, 0xb3e5fc], ['kayu_aiskrim', 'Kayu aiskrim', false, 0xd7a86e]];
function L4(S, play) {
  const root = group('L4', table(1.5, 0.9, play));
  const C = new Circuit(S, root, { gapLabel: 'Objek diuji', x: -0.25 });
  C.place('sel', battery()); C.place('beban', bulb());
  const objs = OBJ.map(([id, label, cond, color], i) => {
    const shape = id === 'duit_syiling' ? new THREE.CylinderGeometry(0.018, 0.018, 0.004, 20) : new THREE.BoxGeometry(0.08, 0.008, id === 'kayu_aiskrim' ? 0.014 : 0.008);
    const o = group(id, mesh(shape, M(color, { metalness: cond ? 0.8 : 0, roughness: cond ? 0.3 : 0.6, transparent: id === 'rod_kaca', opacity: id === 'rod_kaca' ? 0.6 : 1 }), 0, 0.006, 0));
    o.userData = { label, conductor: cond }; o.scale.setScalar(1.6); o.position.set(0.32 + (i % 2) * 0.18, 0, -0.3 + Math.floor(i / 2) * 0.17); const t = textSprite(label, { h: 0.016 }); t.position.set(0, 0.02, 0.025); o.add(t); root.add(home(o)); return o;
  });
  const tc = document.createElement('canvas'); tc.width = 420; tc.height = 380; const tg = tc.getContext('2d'); const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
  const res = {};
  const draw = () => { tg.fillStyle = '#fff'; tg.fillRect(0, 0, 420, 380); tg.fillStyle = '#2b2340'; tg.font = 'bold 20px system-ui'; ['Objek', 'Mentol', 'Jenis'].forEach((h, i) => tg.fillText(h, 10 + i * 140, 26));
    tg.font = '19px system-ui'; OBJ.forEach(([id, label, c], r) => { const y = 62 + r * 40; tg.fillText(label, 10, y); if (id in res) { tg.fillStyle = c ? '#2e7d32' : '#c62828'; tg.fillText(c ? 'Menyala' : 'Tidak', 150, y); tg.fillText(c ? 'Konduktor' : 'Penebat', 290, y); tg.fillStyle = '#2b2340'; } }); tt.needsUpdate = true; };
  draw();
  const board = mesh(new THREE.PlaneGeometry(0.26, 0.24), new THREE.MeshBasicMaterial({ map: tt }), -0.25, 0.004, 0.31); board.rotation.x = -Math.PI / 2; board.userData.fx = true; root.add(board);
  let current = null;
  const dr = dragger(S, () => objs, {
    onPick(o) { if (o === current) { C.remove('suis'); current = null; } },
    onDrop(o, x, y) {
      const k = C.slotNear(x, y, o);
      if (k !== 'suis') return goHome(S, o);
      C.place('suis', o); current = o; res[o.name] = o.userData.conductor; draw();
      S.evt('test', o.name);
      S.info(o.userData.conductor ? `💡 ${o.userData.label}: mentol <b>menyala</b> — <b>konduktor</b> membenarkan arus elektrik mengalir.` : `⭕ ${o.userData.label}: mentol <b>tidak menyala</b> — <b>penebat</b> tidak membenarkan arus elektrik mengalir.`);
      setTimeout(() => { if (current === o) { C.remove('suis'); current = null; goHome(S, o); root.attach(o); } }, 2200);
    },
  });
  return { root, view: { w: 1.5, d: 0.9 }, ...dr, update: dt => C.tick(dt) };
}

// ------------------------------------------------------------ L5 Litar buzzer
function L5(S, play) {
  const root = group('L5', table(1.4, 0.85, play));
  const C = new Circuit(S, root, {});
  const bl = bulb(); C.place('sel', battery()); C.place('beban', bl); const sw = switchPart(); C.place('suis', sw);
  const bz = buzzer('buzzer'); bz.scale.setScalar(1.3); bz.position.set(0.42, 0, 0.1); root.add(home(bz)); const t = textSprite('Buzzer', { h: 0.026 }); t.position.set(0, 0.07, 0.03); bz.add(t);
  let swapped = false, beeped = false;
  const dr = dragger(S, () => (swapped ? [] : [bz]), {
    onDrop(o, x, y) {
      if (!(nearScreen(S, bl, x, y, 0.04, 70) || flat(o.position, bl.getWorldPosition(new THREE.Vector3())) < 0.1)) return goHome(S, o);
      swapped = true; C.g.remove(C.remove('beban')); bz.scale.setScalar(1); C.place('beban', bz);
      S.evt('swap', 'buzzer'); S.info('🔔 Mentol digantikan dengan <b>buzzer</b>. Tuding suis untuk menutup litar.');
    },
  });
  return {
    root, view: { w: 1.4, d: 0.85 }, ...dr,
    hit: (x, y) => (swapped ? S.hitTest(x, y, [sw])?.name ?? null : null),
    tap(x, y) {
      if (!swapped || S.hitTest(x, y, [sw]) !== sw) return;
      sw.userData.setClosed(!sw.userData.closed); C.update(); buzz(C.on);
      if (C.on && !beeped) { beeped = true; S.evt('buzz', 'buzzer'); }
      S.info(C.on ? '🔊 Bzzz! Buzzer <b>menghasilkan bunyi</b> apabila litar lengkap.' : '🔇 Litar tidak lengkap — buzzer senyap.');
    },
    update: dt => C.tick(dt),
  };
}

const LEVELS = [
  { id: 'L1', title: 'Komponen dan fungsi', sp: 'SP 7.1.1 · 7.1.2', make: L1 },
  { id: 'L2', title: 'Litar elektrik', sp: 'SP 7.1.3', make: L2 },
  { id: 'L3', title: 'Mentol tidak menyala', sp: 'SP 7.1.4', make: L3 },
  { id: 'L4', title: 'Konduktor dan penebat', sp: 'SP 7.1.5 – 7.1.7', make: L4 },
  { id: 'L5', title: 'Litar buzzer', sp: 'TP 6', make: L5 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
addEventListener('pagehide', () => buzz(false));
boot({
  title: 'Elektrik',
  intro: '<b>Sains Tahun 2 · Unit 7.</b> Bina litar elektrik! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik suis · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => { buzz(false); return LEVELS.find(l => l.id === id).make(S, play); },
});
