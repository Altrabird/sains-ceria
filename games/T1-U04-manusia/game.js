// Sains Tahun 1 · Unit 4 Manusia — senses and what they detect, identify fruit, use another sense, sense aids.
import * as THREE from 'three';
import { boot, textSprite, emojiSprite } from '../../shared/stage.js';
import { M, mesh, group, table, kid, emojiCard, sensePad, SENSES, fruit, home, goHome, moveTo, flat, dragger } from '../../shared/props.js';

// ------------------------------------------------------------ L1 Deria & ciri: property card -> body part
const PROPS = [['warna', '🎨', 'Warna, saiz, bentuk', 'mata'], ['bunyi', '🔔', 'Bunyi', 'telinga'], ['bau', '🌸', 'Bau', 'hidung'],
  ['rasa', '🍬', 'Manis, masam, masin', 'lidah'], ['tekstur', '🧽', 'Kasar, licin, lembut', 'kulit']];
function L1(S, play) {
  const root = group('L1', table(1.5, 0.85, play));
  const order = ['telinga', 'kulit', 'mata', 'lidah', 'hidung'];
  const pads = order.map((k, i) => { const p = sensePad(k, SENSES[k][2]); p.position.set((i - 2) * 0.27, 0, -0.2); root.add(p); return p; });
  const mix = [2, 4, 0, 3, 1];
  const cards = PROPS.map(([id, e, label, sense], i) => { const c = emojiCard(id, e, label, 0.18); c.position.set((mix[i] - 2) * 0.27, 0, 0.22); c.userData.sense = sense; root.add(home(c)); return c; });
  const done = new Set();
  const dr = dragger(S, () => cards.filter(c => !done.has(c)), {
    onDrop(c) {
      const pad = pads.find(p => flat(p.position, c.position) < 0.12);
      if (!pad) return goHome(S, c);
      if (pad.userData.sense !== c.userData.sense) { S.info(`🤔 ${SENSES[pad.userData.sense][2]} tidak dapat mengesan <b>${c.name === 'tekstur' ? 'kasar atau licin' : c.name}</b>. Cuba lagi!`); return goHome(S, c); }
      done.add(c); moveTo(S, c, pad.position.clone().add(new THREE.Vector3(0, 0.012, 0.03)));
      S.star(pad.position.clone().setY(0.25)); S.evt('ciri', c.name);
      const [, , label, sense] = PROPS.find(x => x[0] === c.name);
      S.info(`✅ <b>${SENSES[sense][2]}</b> (deria ${SENSES[sense][1].toLowerCase()}) mengenal pasti <b>${label.toLowerCase()}</b>.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L2 Kenal pasti buah: observe with senses, then sweet / sour
const FRUIT = {
  ciku: { warna: 'perang', bau: 'wangi manis', rasa: 'manis', manis: true, nama: 'Ciku' },
  epal: { warna: 'merah', bau: 'wangi', rasa: 'manis', manis: true, nama: 'Epal' },
  oren: { warna: 'oren', bau: 'segar', rasa: 'masam', manis: false, nama: 'Oren' },
  kedondong: { warna: 'hijau', bau: 'segar', rasa: 'masam', manis: false, nama: 'Kedondong' },
};
const OBS = { mata: 'warna', hidung: 'bau', lidah: 'rasa' };
function L2(S, play) {
  const root = group('L2', table(1.5, 0.85, play));
  const pads = ['mata', 'hidung', 'lidah'].map((k, i) => { const p = sensePad(k, SENSES[k][2]); p.position.set(-0.5 + i * 0.22, 0, -0.22); root.add(p); return p; });
  const basket = (name, label, x) => {
    const b = group(name, mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 24, 1, true), M(0xc8a165, { side: THREE.DoubleSide, roughness: 1 }), 0, 0.03, 0),
      mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.005, 24), M(0xa8834a), 0, 0.003, 0));
    const t = textSprite(label, { h: 0.035 }); t.position.set(0, 0.11, 0); b.add(t); b.position.set(x, 0, -0.2); root.add(b); return b;
  };
  const sweet = basket('bakul_manis', '🍭 Manis', 0.28), sour = basket('bakul_masam', '🍋 Masam', 0.55);
  // notebook: what has been observed
  const nc = document.createElement('canvas'); nc.width = 512; nc.height = 300; const ng = nc.getContext('2d');
  const ntex = new THREE.CanvasTexture(nc); ntex.colorSpace = THREE.SRGBColorSpace;
  const book = mesh(new THREE.PlaneGeometry(0.44, 0.26), new THREE.MeshBasicMaterial({ map: ntex }), -0.47, 0.002, 0.2); book.rotation.x = -Math.PI / 2; book.userData.fx = true; root.add(book);
  const notes = {};
  function drawNotes() {
    ng.fillStyle = '#fffdf2'; ng.fillRect(0, 0, 512, 300); ng.strokeStyle = '#c9b88a'; ng.lineWidth = 6; ng.strokeRect(3, 3, 506, 294); ng.fillStyle = '#2b2340'; ng.font = 'bold 34px system-ui'; ng.fillText('📒 Catatan', 16, 42);
    ng.font = 'bold 26px system-ui'; ng.fillStyle = '#5b4f6a'; ['Buah', 'Warna', 'Bau', 'Rasa'].forEach((h, i) => ng.fillText(h, 16 + i * 124, 80));
    ng.fillStyle = '#111'; ng.font = '28px system-ui';
    Object.keys(FRUIT).forEach((f, r) => { ng.fillText(FRUIT[f].nama, 16, 120 + r * 44); ['warna', 'bau', 'rasa'].forEach((k, i) => notes[f]?.[k] && ng.fillText(FRUIT[f][k], 140 + i * 124, 120 + r * 44)); });
    ntex.needsUpdate = true;
  }
  drawNotes();
  const fruits = Object.keys(FRUIT).map((k, i) => { const f = fruit(k); f.position.set(-0.05 + i * 0.16, 0, 0.2); f.scale.setScalar(1.3); root.add(home(f)); return f; });
  const kinds = new Set(), sorted = new Set();
  const dr = dragger(S, () => fruits.filter(f => !sorted.has(f)), {
    onDrop(f) {
      const pad = pads.find(p => flat(p.position, f.position) < 0.11);
      const F = FRUIT[f.name];
      if (pad) {
        const k = OBS[pad.userData.sense]; (notes[f.name] ||= {})[k] = true; drawNotes();
        kinds.add(k); S.evt('observe', k, { fruit: f.name });
        S.info(`${SENSES[pad.userData.sense][0]} ${F.nama}: ${k} <b>${F[k]}</b>.` + (kinds.size === 3 && !sorted.size ? ' Sekarang letakkan buah di bakul <b>manis</b> atau <b>masam</b>.' : ''));
        return goHome(S, f);
      }
      const b = flat(f.position, sweet.position) < 0.13 ? sweet : flat(f.position, sour.position) < 0.13 ? sour : null;
      if (!b) return goHome(S, f);
      if (!notes[f.name]?.rasa) { S.info(`Rasa ${F.nama} dahulu — bawa ke <b>lidah</b> 👅.`); return goHome(S, f); }
      if ((b === sweet) !== F.manis) { S.info(`🤔 ${F.nama} rasanya <b>${F.rasa}</b>. Cuba bakul lain.`); return goHome(S, f); }
      sorted.add(f); const n = [...sorted].filter(x => FRUIT[x.name].manis === F.manis).length;
      moveTo(S, f, b.position.clone().add(new THREE.Vector3((n - 1.5) * 0.06, 0.02, 0)));
      S.evt('sort', f.name); S.star(b.position.clone().setY(0.2));
      S.info(`✅ ${F.nama} — buah <b>${F.rasa}</b>.`);
    },
  });
  return { root, view: { w: 1.5, d: 0.85 }, ...dr };
}

// ------------------------------------------------------------ L3 Gunakan deria lain: find the torch in the dark by touch
function torch(name = 'lampu_suluh') {
  const body = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 20), M(0x333333, { metalness: 0.4, roughness: 0.4 }), 0, 0.02, 0); body.rotation.z = Math.PI / 2;
  const head = mesh(new THREE.CylinderGeometry(0.028, 0.02, 0.03, 20), M(0x444444, { metalness: 0.4 }), 0.072, 0.02, 0); head.rotation.z = Math.PI / 2;
  const lens = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.003, 20), M(0xfff3b0, { emissive: 0xffd54f, emissiveIntensity: 0 }), 0.088, 0.02, 0); lens.rotation.z = Math.PI / 2; lens.name = 'kanta_lampu';
  const btn = mesh(new THREE.BoxGeometry(0.014, 0.006, 0.01), M(0xd32f2f), -0.01, 0.04, 0);
  return group(name, body, head, lens, btn);
}
function L3(S, play) {
  const root = group('L3', table(1.4, 0.85, play));
  const pillow = group('bantal', mesh(new THREE.BoxGeometry(0.16, 0.04, 0.11), M(0xf8bbd0, { roughness: 1 }), 0, 0.02, 0)); pillow.children[0].geometry = new THREE.SphereGeometry(0.08, 16, 10).scale(1, 0.28, 0.7).translate(0, 0.022, 0);
  const brush = group('berus', mesh(new THREE.BoxGeometry(0.1, 0.02, 0.035), M(0x8d6e63), 0, 0.03, 0), mesh(new THREE.BoxGeometry(0.09, 0.02, 0.03), M(0x3e2723, { roughness: 1 }), 0, 0.01, 0));
  const ball = group('bola', mesh(new THREE.SphereGeometry(0.035, 16, 12), M(0x42a5f5), 0, 0.035, 0));
  const stone = group('batu', mesh(new THREE.DodecahedronGeometry(0.035, 0), M(0x8d8d8d, { flatShading: true }), 0, 0.03, 0));
  const tc = torch(); tc.rotation.y = 0.5;
  const objs = [[pillow, '<b>Lembut</b> — ini bantal.'], [brush, '<b>Kasar</b> — ini berus.'], [ball, '<b>Licin dan bulat</b> — ini bola.'], [stone, '<b>Keras dan kasar</b> — ini batu.'], [tc, '<b>Keras, licin, panjang</b>, ada butang… Ini <b>lampu suluh</b>! Tuding dan tahan untuk menghidupkannya.']];
  [[-0.45, 0.05], [-0.18, -0.15], [0.42, 0.12], [0.2, -0.18], [0.0, 0.14]].forEach(([x, z], i) => { objs[i][0].position.set(x, 0, z); objs[i][0].userData.feel = objs[i][1]; root.add(objs[i][0]); });
  // darkness: a black veil between camera and table; the torch lifts it
  const veil = mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x05050a, transparent: true, opacity: 0.93, depthTest: false }), 0, 0.3, 0);
  veil.rotation.x = -Math.PI / 2; veil.renderOrder = 10; veil.userData.fx = true; root.add(veil);
  const glow = emojiSprite('✋', 0.08); glow.material.depthTest = false; glow.renderOrder = 11; glow.visible = false; root.add(glow);
  const label = textSprite('Gelap! Guna deria sentuhan.', { h: 0.045, bg: '#2b2340ee', fg: '#fff' }); label.material.depthTest = false; label.renderOrder = 12; label.position.set(0, 0.35, -0.1); root.add(label);
  const felt = new Set(); let lit = false;
  const items = objs.map(o => o[0]);
  return {
    root, view: { w: 1.4, d: 0.85 },
    pen(x, y, on) {
      if (lit) return;
      glow.visible = on; if (!on) return;
      const p = S.onPlane(x, y, 0.05); if (p) glow.position.copy(p).setY(0.33);
      const o = S.hitTest(x, y, items) || S.nearest(x, y, items, 45);
      if (!o || felt.has(o)) return;
      felt.add(o); S.evt('feel', o.name); S.info('✋ ' + o.userData.feel, 6);
    },
    hit: (x, y) => (felt.has(tc) ? S.hitTest(x, y, [tc])?.name ?? null : null),
    tap(x, y) {
      if (lit || S.hitTest(x, y, [tc]) !== tc) return;
      if (!felt.has(tc) || felt.size < 3) return S.info('Rasa dahulu sekurang-kurangnya <b>tiga</b> objek — gerakkan jari ☝️ di atas objek-objek.');
      lit = true; glow.visible = false; label.visible = false;
      tc.getObjectByName('kanta_lampu').material.emissiveIntensity = 2.5;
      const beam = mesh(new THREE.ConeGeometry(0.12, 0.5, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
      beam.rotation.z = Math.PI / 2; beam.position.set(0.34, 0.02, 0); beam.userData.fx = true; tc.add(beam);
      S.tween(1, k => veil.material.opacity = 0.93 * (1 - k * 0.85));
      S.evt('torch', 'lampu_suluh'); S.info('🔦 Lampu suluh menyala! Apabila deria penglihatan tidak berfungsi dalam gelap, kita guna <b>deria sentuhan</b>.');
    },
  };
}

// ------------------------------------------------------------ L4 Alat bantu deria: glasses, hearing aid
function glasses(name = 'cermin_mata') {
  const m = M(0x1565c0, { metalness: 0.3 }), lensM = M(0xbbdefb, { transparent: true, opacity: 0.4 });
  const rim = x => group('', mesh(new THREE.TorusGeometry(0.022, 0.003, 8, 24), m), mesh(new THREE.CircleGeometry(0.021, 24), lensM)).translateX(x);
  return group(name, rim(-0.028), rim(0.028), mesh(new THREE.BoxGeometry(0.014, 0.003, 0.003), m, 0, 0.004, 0)).translateY(0.03);
}
function hearingAid(name = 'alat_pendengaran') {
  return group(name, mesh(new THREE.TorusGeometry(0.016, 0.006, 8, 16, Math.PI * 1.2), M(0xe0b088)).rotateZ(-0.6), mesh(new THREE.SphereGeometry(0.008), M(0x8d6e63), -0.006, -0.016, 0)).translateY(0.03);
}
function L4(S, play) {
  const root = group('L4', table(1.5, 0.85, play));
  const pupil = kid('murid', { shirt: 0xffffff, pants: 0x1f4fa8 }); pupil.scale.setScalar(1.4); pupil.position.set(-0.4, 0, 0.0); root.add(pupil);
  const atuk = kid('atuk', { shirt: 0x8d6e63, pants: 0x4e342e, hair: 0xbdbdbd }); atuk.scale.setScalar(1.5); atuk.position.set(0.32, 0, 0.0); root.add(atuk);
  // eye chart, blurred until the glasses are on
  const cc = document.createElement('canvas'); cc.width = 256; cc.height = 320; const cg = cc.getContext('2d'); const ctex = new THREE.CanvasTexture(cc); ctex.colorSpace = THREE.SRGBColorSpace;
  const drawChart = blur => {
    cg.filter = 'none'; cg.fillStyle = '#fff'; cg.fillRect(0, 0, 256, 320); cg.filter = blur ? 'blur(7px)' : 'none'; cg.fillStyle = '#111'; cg.textAlign = 'center';
    [['E', 110, 100], ['F P', 64, 175], ['T O Z', 44, 235], ['L P E D', 30, 285]].forEach(([t, s, y]) => { cg.font = `bold ${s}px system-ui`; cg.fillText(t, 128, y); });
    cg.filter = 'none'; ctex.needsUpdate = true;
  };
  drawChart(true);
  const chart = mesh(new THREE.PlaneGeometry(0.2, 0.25), new THREE.MeshBasicMaterial({ map: ctex }), -0.2, 0.2, -0.34); chart.rotation.x = -0.3; chart.name = 'carta'; chart.userData.fx = true; root.add(chart);
  const radio = group('radio', mesh(new THREE.BoxGeometry(0.12, 0.07, 0.04), M(0x6d4c41), 0, 0.035, 0), mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 20), M(0x222222), -0.025, 0.035, 0.021).rotateX(Math.PI / 2));
  radio.position.set(0.62, 0, -0.25); root.add(radio);
  const say = (o, t, s = 3) => { const b = textSprite(t, { h: 0.04, bg: '#fffbe6f0' }); b.position.copy(o.position).setY(0.42); root.add(b); setTimeout(() => root.remove(b), s * 1000); };
  const gl = glasses(); gl.position.set(-0.15, 0, 0.25); gl.scale.setScalar(2.2); const ha = hearingAid(); ha.position.set(0.1, 0, 0.25); ha.scale.setScalar(2.5);
  root.add(home(gl), home(ha));
  for (const [o, t] of [[gl, 'Cermin mata'], [ha, 'Alat bantu pendengaran']]) { const l = textSprite(t, { h: 0.03 }); l.position.set(o.position.x, 0.02, 0.33); root.add(l); }
  const notes = []; let hearing = false, seeing = false, t = 0;
  say(pupil, 'Saya tidak nampak dengan jelas…', 4); setTimeout(() => say(atuk, 'Apa? Saya tidak dengar…', 4), 1500);
  const dr = dragger(S, () => [gl, ha].filter(o => o.visible), {
    onDrop(o) {
      const near = [pupil, atuk].find(k => flat(k.position, o.position) < 0.14);
      if (!near) return goHome(S, o);
      if (o === gl && near === pupil) {
        o.visible = false; seeing = true; const g2 = glasses(''); g2.position.set(0, -0.022, 0.034); g2.scale.setScalar(0.7); g2.children.forEach(c => c.userData.fx = true); pupil.getObjectByName('kepala').add(g2);
        drawChart(false); say(pupil, 'Sekarang jelas! 😊'); S.evt('aid', 'cermin_mata');
        return S.info('👓 Cermin mata membantu <b>mata melihat dengan jelas</b>.');
      }
      if (o === ha && near === atuk) {
        o.visible = false; hearing = true; const h2 = hearingAid(''); h2.position.set(0.036, -0.03, 0); h2.scale.setScalar(0.8); atuk.getObjectByName('kepala').add(h2);
        say(atuk, 'Saya boleh dengar muzik! 🎵'); S.evt('aid', 'alat_pendengaran');
        return S.info('👂 Alat bantu pendengaran membantu <b>deria pendengaran</b>.');
      }
      S.info(o === gl ? '🤔 Atuk tidak bermasalah melihat. Siapa yang tidak nampak papan carta?' : '🤔 Murid itu boleh mendengar. Siapa yang tidak dengar radio?');
      goHome(S, o);
    },
  });
  return {
    root, view: { w: 1.5, d: 0.85 }, ...dr,
    update(dt) {
      t += dt;
      if (hearing && notes.length < 6 && t % 0.6 < dt) { const n = emojiSprite('🎵', 0.05); n.position.set(0.62, 0.1, -0.25); n.userData.v = new THREE.Vector3(-0.1 - Math.random() * 0.05, 0.05, 0.08); n.userData.age = 0; root.add(n); notes.push(n); }
      for (const n of [...notes]) { n.userData.age += dt; n.position.addScaledVector(n.userData.v, dt); n.material.opacity = 1 - n.userData.age / 3; if (n.userData.age > 3) { root.remove(n); notes.splice(notes.indexOf(n), 1); } }
    },
  };
}

const LEVELS = [
  { id: 'L1', title: 'Deria dan ciri', sp: 'DSKP hlm. 38', make: L1 },
  { id: 'L2', title: 'Kenal pasti buah', sp: 'DSKP hlm. 38', make: L2 },
  { id: 'L3', title: 'Gunakan deria lain', sp: 'DSKP hlm. 38', make: L3 },
  { id: 'L4', title: 'Alat bantu deria', sp: 'DSKP hlm. 38', make: L4 },
];
const steps = await (await fetch('assets/steps.json')).json();
const play = new URLSearchParams(location.search).has('play');
boot({
  title: 'Manusia — Deria Kita',
  intro: '<b>Sains Tahun 1 · Unit 4.</b> Kenali deria kita! Guna <b>tangan</b> di depan kamera: ☝️ tuding &amp; tahan = ketik / rasa · ✌️ dua jari = pegang &amp; alih · ✋ tapak tangan diam 2 s = ulang semula. Tetikus dan sentuhan juga boleh.',
  levels: LEVELS, steps,
  build: (id, S) => LEVELS.find(l => l.id === id).make(S, play),
});
