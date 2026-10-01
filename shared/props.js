// Props built from three.js primitives + the drag helper, shared by unit games (no GLBs needed).
// Units: metres, table top at y = 0, +z toward the pupil. Every factory returns a named Group (names = test handles).
import * as THREE from 'three';
import { textSprite, emojiSprite } from './stage.js';

export const LIFT = 0.06;  // held objects float this high over the table

export const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
export const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
export const group = (name, ...kids) => { const g = new THREE.Group(); g.name = name; g.add(...kids); return g; };

// leaf outline (also the tracing path in L3): base at u=0, tip at u=1, length L, half-width W
export function leafOutline(n = 40, L = 0.16, W = 0.05) {
  const up = [], lo = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, y = W * Math.sin(Math.PI * u) ** 0.8 * (1 - 0.35 * u);
    up.push([u * L - L / 2, y]); lo.push([u * L - L / 2, -y]);
  }
  return up.concat(lo.reverse().slice(1));
}
export function leaf(name = 'daun') {
  const shape = new THREE.Shape(leafOutline().map(([x, y]) => new THREE.Vector2(x, y)));
  const blade = mesh(new THREE.ShapeGeometry(shape), M(0x3fa34d, { side: THREE.DoubleSide }));
  blade.rotation.x = -Math.PI / 2;
  const vein = M(0x24702f), g = group(name, blade);
  g.add(mesh(new THREE.BoxGeometry(0.17, 0.002, 0.003), vein, 0, 0.002, 0));
  for (let i = 1; i <= 5; i++) for (const side of [1, -1]) {  // side veins: from the midrib out and toward the tip
    const x0 = -0.08 + i * 0.024, half = 0.05 * Math.sin(Math.PI * (x0 / 0.16 + 0.5)) ** 0.8 * 0.8;
    const dx = 0.022, dz = -side * half, len = Math.hypot(dx, dz);
    const v = mesh(new THREE.BoxGeometry(len, 0.002, 0.002), vein, x0 + dx / 2, 0.002, dz / 2);
    v.rotation.y = -Math.atan2(dz, dx); g.add(v);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.04), vein, -0.1, 0.002, 0).rotateZ(Math.PI / 2));
  g.position.y = 0.004; return g;
}
export function magnifier(name = 'kanta') {
  const ring = mesh(new THREE.TorusGeometry(0.045, 0.007, 10, 32), M(0x2a5bd7, { metalness: 0.3 }));
  const glass = mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.003, 32), M(0xd8f0ff, { transparent: true, opacity: 0.35, roughness: 0 }));
  glass.rotation.x = Math.PI / 2;
  const handle = mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.08), M(0x7a4a22), 0, -0.085, 0);
  const lens = group('', ring, glass, handle); lens.rotation.x = -Math.PI / 2; lens.position.y = 0.012;
  return group(name, lens);
}
export const table = (w, d, play) => mesh(new THREE.BoxGeometry(w, 0.02, d), M(0xf3e6d3, play ? { transparent: true, opacity: 0.5 } : {}), 0, -0.011, 0);

// a draggable thing remembers where it lives
export const home = o => { o.userData.home = o.position.clone(); return o; };
export function goHome(S, o, lift = 0.05) {
  const a = o.position.clone(), b = o.userData.home;
  return S.tween(0.45, t => { o.position.lerpVectors(a, b, t); o.position.y += Math.sin(t * Math.PI) * lift; });
}
export function moveTo(S, o, b, dur = 0.35) { const a = o.position.clone(); return S.tween(dur, t => o.position.lerpVectors(a, b, t)); }
export const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// generic hold/drag for a list of draggables; level supplies onDrop(o) and optional onDrag(o, dt)
export function dragger(S, items, { onPick, onDrop, onDrag } = {}) {
  let held = null, lastT = 0;
  return {
    get held() { return held; },
    pick(x, y) {
      const o = S.hitTest(x, y, items()) || S.nearest(x, y, items());
      if (!o || onPick?.(o) === false) return false;
      held = o; lastT = performance.now(); return true;
    },
    drag(x, y) {
      if (!held) return;
      const p = S.onPlane(x, y, held.userData.carryY ?? 0); if (!p) return;
      const now = performance.now(), dt = Math.max(0.001, (now - lastT) / 1000); lastT = now;
      const prev = held.position.clone();
      held.position.set(p.x, (held.userData.carryY ?? 0) + LIFT, p.z);
      onDrag?.(held, dt, prev);
    },
    drop() { if (!held) return; const o = held; held = null; onDrop(o); },
  };
}


// ------------------------------------------------------------ lab furniture + glassware
const STEEL = () => M(0xcfd6dc, { metalness: 0.8, roughness: 0.2 });
// sink with a tap: children 'paip' (tap it) and 'aliran' (water stream, hidden until switched on); basin floor at y≈0.065
export function sink(name = 'sinki') {
  const g = group(name, mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), M(0xb9c3cc, { metalness: 0.5, roughness: 0.3 }), 0, 0.03, 0),
    mesh(new THREE.BoxGeometry(0.38, 0.02, 0.26), M(0x8e9aa6, { metalness: 0.5, roughness: 0.3 }), 0, 0.055, 0));
  const tap = group('paip', mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2), STEEL(), 0, 0.1, 0),
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11), STEEL(), 0, 0.2, 0.05).rotateX(Math.PI / 2),
    mesh(new THREE.CylinderGeometry(0.011, 0.009, 0.03), STEEL(), 0, 0.19, 0.1),
    mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 6), M(0x3a7bd5), 0, 0.215, 0));
  tap.position.set(0, 0.02, -0.13);
  const stream = mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.14, 10), M(0x7cc6ff, { transparent: true, opacity: 0.6 }), 0, 0.13, -0.025);
  stream.name = 'aliran'; stream.visible = false; stream.userData.fx = true;
  g.add(tap, stream); return g;
}
const GLASS = (o = {}) => M(0xdff3ff, { transparent: true, opacity: 0.45, roughness: 0.05, ...o });
export const beaker = (name = 'bikar') => group(name, mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 24, 1, true), GLASS({ side: THREE.DoubleSide }), 0, 0.045, 0),
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.003, 24), GLASS(), 0, 0.002, 0));
export function labTable(name = 'meja', w = 0.4, d = 0.24, h = 0.16) {
  const top = mesh(new THREE.BoxGeometry(w, 0.015, d), M(0x9aa3ad), 0, h, 0);
  const legs = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => mesh(new THREE.BoxGeometry(0.015, h, 0.015), M(0x6b7380), a * (w / 2 - 0.02), h / 2, b * (d / 2 - 0.02)));
  return group(name, top, ...legs);
}
export const stool = (name = 'kerusi', h = 0.09) => group(name, mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 20), M(0x2f6fd6), 0, h, 0),
  ...[0, 1, 2, 3].map(i => mesh(new THREE.CylinderGeometry(0.004, 0.004, h), M(0x666666), Math.cos(i * Math.PI / 2 + 0.78) * 0.03, h / 2, Math.sin(i * Math.PI / 2 + 0.78) * 0.03)));

// ------------------------------------------------------------ people: a chunky child (or adult) figure ~0.2 m tall, facing +z
// opts: shirt, pants, skin, hair, girl (skirt + pigtails), scale. Named parts for animation: 'kepala', 'tanganL', 'tanganR', 'kakiL', 'kakiR'.
export function kid(name, { shirt = 0xffffff, pants = 0x1f4fa8, skin = 0xe0ac7e, hair = 0x2b1d14, girl = false, scale = 1 } = {}) {
  const g = group(name);
  const legL = group('kakiL', mesh(new THREE.CylinderGeometry(0.012, 0.011, 0.07), M(girl ? skin : pants), 0, -0.035, 0), mesh(new THREE.BoxGeometry(0.022, 0.012, 0.034), M(0x222222), 0, -0.07, 0.006));
  const legR = legL.clone(); legL.position.set(-0.016, 0.075, 0); legR.position.set(0.016, 0.075, 0); legR.name = 'kakiR';
  const body = mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.07, 16), M(shirt), 0, 0.11, 0);
  const lower = girl ? mesh(new THREE.ConeGeometry(0.045, 0.05, 16, 1, true), M(pants, { side: THREE.DoubleSide }), 0, 0.075, 0)
    : mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 16), M(pants), 0, 0.075, 0);
  const arm = side => {
    const a = group(side < 0 ? 'tanganL' : 'tanganR', mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.06), M(shirt), 0, -0.03, 0), mesh(new THREE.SphereGeometry(0.01), M(skin), 0, -0.064, 0));
    a.position.set(side * 0.04, 0.14, 0); return a;
  };
  const head = group('kepala', mesh(new THREE.SphereGeometry(0.034, 20, 14), M(skin)),
    mesh(new THREE.SphereGeometry(0.036, 20, 14, 0, Math.PI * 2, 0, 1.0), M(hair), 0, 0.004, -0.006).rotateX(-0.45),  // hairline set back: face visible from above
    ...[-1, 1].map(s => mesh(new THREE.SphereGeometry(0.0045), M(0x111111), s * 0.012, 0.006, 0.031)),
    mesh(new THREE.TorusGeometry(0.008, 0.002, 6, 12, Math.PI), M(0xb5523b), 0, -0.01, 0.031).rotateZ(Math.PI));  // smile
  if (girl) head.add(...[-1, 1].map(s => mesh(new THREE.SphereGeometry(0.012), M(hair), s * 0.036, -0.004, -0.01)));
  head.position.y = 0.18;
  g.add(legL, legR, lower, body, arm(-1), arm(1), head);
  g.scale.setScalar(scale); return g;
}

// ------------------------------------------------------------ living things + everyday objects (Tahun 1 units)
export function tree(name = 'pokok', h = 0.22) {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.014, 0.02, h * 0.55), M(0x7a4a22), 0, h * 0.27, 0));
  for (const [x, y, z, r] of [[0, 0.72, 0, 0.075], [-0.045, 0.62, 0.02, 0.055], [0.05, 0.63, -0.01, 0.058], [0.01, 0.85, 0, 0.05]])
    g.add(mesh(new THREE.IcosahedronGeometry(r * h / 0.22, 1), M(0x3c9a44, { flatShading: true }), x * h / 0.22, y * h, z));
  return g;
}
// small bird facing +x; parts 'sayapL'/'sayapR' flap, 'badan' breathes
export function bird(name = 'burung', color = 0x9c6b3e) {
  const body = mesh(new THREE.SphereGeometry(0.03, 16, 12), M(color)); body.scale.set(1.3, 1, 0.9); body.name = 'badan';
  const head = mesh(new THREE.SphereGeometry(0.019, 14, 10), M(color), 0.036, 0.02, 0);
  const beak = mesh(new THREE.ConeGeometry(0.006, 0.016, 8), M(0xf2b134), 0.058, 0.018, 0).rotateZ(-Math.PI / 2);
  const eyes = [-1, 1].map(s => mesh(new THREE.SphereGeometry(0.0035), M(0x111111), 0.048, 0.026, s * 0.011));
  const belly = mesh(new THREE.SphereGeometry(0.022, 12, 8), M(0xf3dcb8), 0.008, -0.008, 0); belly.scale.set(1.2, 0.8, 0.85);
  const wing = s => { const w = mesh(new THREE.SphereGeometry(0.022, 12, 8), M(0x7a4f2a)); w.scale.set(1.2, 0.35, 0.6); const p = group(s < 0 ? 'sayapL' : 'sayapR', w); w.position.set(-0.004, 0, s * 0.012); p.position.set(0, 0.01, s * 0.022); return p; };
  const tail = mesh(new THREE.BoxGeometry(0.03, 0.004, 0.02), M(0x7a4f2a), -0.045, 0.008, 0).rotateZ(0.4);
  const legs = [-1, 1].map(s => mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.02), M(0xf2b134), 0.004, -0.032, s * 0.008));
  const g = group(name, body, belly, head, beak, ...eyes, wing(-1), wing(1), tail, ...legs);
  g.children.forEach(c => c.position.y += 0.042); return g;
}
export function car(name = 'kereta', color = 0xe53935) {
  const g = group(name, mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08), M(color, { metalness: 0.3, roughness: 0.35 }), 0, 0.035, 0),
    mesh(new THREE.BoxGeometry(0.09, 0.035, 0.07), M(color, { metalness: 0.3, roughness: 0.35 }), -0.01, 0.07, 0),
    mesh(new THREE.BoxGeometry(0.092, 0.025, 0.072), M(0xbfe3ff, { roughness: 0.1 }), -0.01, 0.07, 0));
  for (const [x, z] of [[0.05, 0.04], [-0.05, 0.04], [0.05, -0.04], [-0.05, -0.04]]) g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), M(0x222222), x, 0.018, z).rotateX(Math.PI / 2));
  return g;
}
export const rock = (name = 'batu', r = 0.04) => group(name, mesh(new THREE.DodecahedronGeometry(r, 0), M(0x8d8d8d, { flatShading: true, roughness: 1 }), 0, r * 0.7, 0).rotateY(0.6));
export function plane(name = 'kapal_terbang') {
  const g = group(name, mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.18, 16), M(0xf5f7fa), 0, 0, 0).rotateZ(Math.PI / 2),
    mesh(new THREE.SphereGeometry(0.016, 14, 10), M(0xf5f7fa), 0.09, 0, 0),
    mesh(new THREE.BoxGeometry(0.06, 0.004, 0.2), M(0x3a6fd8), 0.005, 0, 0),
    mesh(new THREE.BoxGeometry(0.03, 0.004, 0.07), M(0x3a6fd8), -0.08, 0.004, 0),
    mesh(new THREE.BoxGeometry(0.03, 0.04, 0.004), M(0x3a6fd8), -0.083, 0.022, 0));
  for (let i = 0; i < 5; i++) g.add(mesh(new THREE.SphereGeometry(0.0035), M(0x1d2b53), 0.06 - i * 0.022, 0.008, 0.0145));
  g.children.forEach(c => c.position.y += 0.05); return g;
}
// potted plant; 'daun' group droops when wilt = 1 (set .userData.setWilt(0..1)); 'akar' roots hidden by default
export function pottedPlant(name = 'pokok_pasu') {
  const pot = mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.06, 20), M(0xc8643b), 0, 0.03, 0);
  const soil = mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.006, 20), M(0x5a3b22), 0, 0.058, 0);
  const stem = mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.1), M(0x3c9a44), 0, 0.11, 0);
  const leaves = group('daun', ...[0, 1, 2, 3].map(i => {
    const l = mesh(new THREE.SphereGeometry(0.022, 10, 6).scale(1, 0.2, 0.55).translate(0.022, 0, 0), M(0x46b04f));
    const p = group('', l); p.rotation.y = i * Math.PI / 2 + 0.4; p.position.y = 0.09 + i * 0.022; return p;
  }));
  const roots = group('akar', ...[-1, 0, 1].map(s => mesh(new THREE.CylinderGeometry(0.002, 0.001, 0.04), M(0xe9d7b0), s * 0.012, 0.035, 0).rotateZ(s * 0.5)));
  roots.visible = false;
  const g = group(name, pot, soil, stem, leaves, roots);
  g.userData.setWilt = w => { leaves.children.forEach((p, i) => p.children[0].rotation.z = -w * (0.9 + i * 0.1)); stem.rotation.z = w * 0.25; leaves.rotation.z = w * 0.25; leaves.children.forEach(p => p.children[0].material.color.setHex(w > 0.5 ? 0x9bb04a : 0x46b04f)); };
  return g;
}
export function house(name = 'rumah') {
  return group(name, mesh(new THREE.BoxGeometry(0.2, 0.13, 0.16), M(0xf3e1b5), 0, 0.065, 0),
    mesh(new THREE.ConeGeometry(0.16, 0.09, 4), M(0xc0392b), 0, 0.175, 0).rotateY(Math.PI / 4),
    mesh(new THREE.BoxGeometry(0.05, 0.08, 0.004), M(0x8a5a2e), 0, 0.04, 0.081));
}
export const nest = (name = 'sarang') => group(name, mesh(new THREE.TorusGeometry(0.04, 0.016, 8, 20), M(0x8a6a3a, { roughness: 1 }), 0, 0.016, 0).rotateX(Math.PI / 2),
  mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.01, 16), M(0x6b4f2a), 0, 0.006, 0));
// an upright card with a big emoji + label, readable from the front-above camera; size = card height (m)
export function emojiCard(name, emoji, label = '', size = 0.12, { border = '#e0457b' } = {}) {
  const c = document.createElement('canvas'); c.width = 256; c.height = label && emoji ? 300 : label ? 140 : 256;  // no emoji = a word card
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(4, 4, 248, c.height - 8, 28); g.fill();
  g.lineWidth = 8; g.strokeStyle = border; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '170px "Noto Color Emoji","Segoe UI Emoji","Apple Color Emoji",sans-serif'; g.fillText(emoji, 128, 128);
  if (label && !emoji) { g.fillStyle = '#2b2340'; let f = 52; const ws = label.split(' '), lines = ws.length > 2 ? [ws.slice(0, Math.ceil(ws.length / 2)).join(' '), ws.slice(Math.ceil(ws.length / 2)).join(' ')] : [label];
    do g.font = `bold ${f}px system-ui, sans-serif`; while (Math.max(...lines.map(l => g.measureText(l).width)) > 228 && --f > 18);
    lines.forEach((l, i) => g.fillText(l, 128, 70 + (i - (lines.length - 1) / 2) * f * 1.1));
  } else if (label) { g.fillStyle = '#2b2340'; let f = 44; do g.font = `bold ${f}px system-ui, sans-serif`; while (g.measureText(label).width > 236 && --f > 18); g.fillText(label, 128, 268); }  // shrink to fit
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const w = size * c.width / c.height;
  const card = mesh(new THREE.PlaneGeometry(w, size), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, transparent: true }), 0, size / 2 + 0.005, 0);
  card.rotation.x = -0.35;
  const g2 = group(name, card, mesh(new THREE.BoxGeometry(w * 0.6, 0.01, 0.03), M(0x8a8a8a), 0, 0.005, 0));
  g2.userData.cardW = w; return g2;
}

// ------------------------------------------------------------ the five senses (Tahun 1 U1, U4)
export const SENSES = {
  mata: ['👁️', 'Penglihatan', 'Mata'], telinga: ['👂', 'Pendengaran', 'Telinga'], hidung: ['👃', 'Bau', 'Hidung'],
  lidah: ['👅', 'Rasa', 'Lidah'], kulit: ['✋', 'Sentuhan', 'Kulit'],
};
// round yellow pad with the organ emoji floating above and a label; name = 'pad_<key>'
export function sensePad(k, label = SENSES[k][1]) {
  const p = group('pad_' + k, mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.012, 40), M(0xffd84d)));
  const e = emojiSprite(SENSES[k][0], 0.11); e.position.y = 0.09; e.userData.fx = true; p.add(e);
  const l = textSprite(label, { h: 0.035 }); l.position.set(0, 0.02, 0.105); p.add(l);
  p.userData.sense = k; return p;
}
export function fruit(kind) {
  const F = { ciku: [0x8b5a2b, 0.032, [1, 1.1, 1]], epal: [0xd32f2f, 0.035, [1, 0.9, 1]], oren: [0xff8f00, 0.036, [1, 0.95, 1]], kedondong: [0x9ccc65, 0.03, [1, 1.35, 1]] }[kind];
  const body = mesh(new THREE.SphereGeometry(F[1], 20, 14), M(F[0], { roughness: kind === 'oren' ? 0.9 : 0.5 }), 0, F[1] * F[2][1], 0);
  body.scale.set(...F[2]);
  const stem = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.014), M(0x5d4037), 0, F[1] * F[2][1] * 2 + 0.004, 0);
  const g = group(kind, body, stem);
  if (kind !== 'ciku') g.add(mesh(new THREE.SphereGeometry(0.01, 8, 6).scale(1.4, 0.2, 0.7), M(0x43a047), 0.01, F[1] * F[2][1] * 2 + 0.006, 0));
  return g;
}

// ------------------------------------------------------------ tracing sheet (lakar): dotted outline the pupil follows with ☝️ / mouse drag
// pts = outline in sheet metres (x right, y up, origin at sheet centre). decorate(g, px) draws extra print on the paper.
// Returns { sheet, pen(x, y, on) -> true once when the outline is done, tracePath() (tests), fill(color) }.
export function traceSheet(S, { name = 'kertas', w = 0.64, h = 0.44, pts, decorate, ink = '#2f7d3a', need = 0.85 }) {
  const PX = 1000, CW = Math.round(w * PX), CH = Math.round(h * PX);
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const px = ([x, y]) => [CW / 2 + x * PX, CH / 2 - y * PX], P = pts.map(px);
  g.fillStyle = '#fffdf6'; g.fillRect(0, 0, CW, CH);
  decorate?.(g, px);
  g.setLineDash([4, 14]); g.lineWidth = 6; g.lineCap = 'round'; g.strokeStyle = '#9a8fb0';
  g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#e0457b'; g.beginPath(); g.arc(...P[0], 12, 0, 7); g.fill();  // start dot
  const sheet = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), 0, 0.002, 0);
  sheet.rotation.x = -Math.PI / 2; sheet.name = name;
  const pencil = group('pensel', mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), M(0xffc21a), 0, 0.06, 0),
    mesh(new THREE.ConeGeometry(0.006, 0.02, 6), M(0x333333), 0, -0.01, 0).rotateX(Math.PI));
  pencil.visible = false; pencil.rotation.z = -0.4;
  const seen = new Set(); let last = null, done = false;
  const api = {
    sheet, pencil,
    pen(x, y, on) {
      if (done) return false;
      const hit = S.rayAt(x, y).intersectObject(sheet)[0];
      pencil.visible = !!hit && on;
      if (!hit || !on) { last = null; return false; }
      pencil.parent?.worldToLocal(pencil.position.copy(hit.point)); pencil.position.y += 0.02;
      const qx = hit.uv.x * CW, qy = (1 - hit.uv.y) * CH;
      g.strokeStyle = ink; g.lineWidth = 9; g.lineCap = 'round';
      if (last && Math.hypot(qx - last[0], qy - last[1]) < 90) { g.beginPath(); g.moveTo(...last); g.lineTo(qx, qy); g.stroke(); }
      last = [qx, qy]; tex.needsUpdate = true;
      P.forEach(([a, b], i) => { if (Math.hypot(a - qx, b - qy) < 30) seen.add(i); });
      if (seen.size < P.length * need) return false;
      done = true; pencil.visible = false; api.fill(ink + '55'); return true;
    },
    fill(color) {
      g.fillStyle = color; g.beginPath(); P.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fill();
      g.strokeStyle = ink; g.lineWidth = 9; g.stroke(); tex.needsUpdate = true;
    },
    progress: () => seen.size / P.length,
    tracePath: () => pts.map(([x, y]) => sheet.localToWorld(new THREE.Vector3(x, y, 0)).toArray()),
  };
  return api;
}

// ------------------------------------------------------------ flowering plant built from parts (Tahun 1 U6)
// Each part is a Group whose origin is the soil surface where the plant stands, so parts snap together at (0,0,0).
// roots: 'tunjang' (tap root) | 'serabut' (fibrous); flower colour; woody stem = brown.
export function plantParts({ flower = 0xe53935, roots = 'tunjang', woody = true } = {}) {
  const rootM = M(0xd7b98e);
  const akar = group('akar');
  if (roots === 'tunjang') {
    akar.add(mesh(new THREE.ConeGeometry(0.01, 0.13, 10), rootM, 0, -0.065, 0).rotateX(Math.PI));
    for (let i = 0; i < 6; i++) { const r = mesh(new THREE.CylinderGeometry(0.002, 0.001, 0.05), rootM, 0, -0.03 - i * 0.015, 0); r.rotation.z = (i % 2 ? 1 : -1) * 1.0; r.rotation.y = i * 1.1; r.translateY(-0.022); akar.add(r); }
  } else for (let i = 0; i < 14; i++) { const r = mesh(new THREE.CylinderGeometry(0.0022, 0.001, 0.08), rootM); r.rotation.set((Math.random() - 0.5) * 1.2, i * 0.45, (Math.random() - 0.5) * 1.2); r.translateY(-0.04); akar.add(r); }
  const batang = group('batang', mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.2, 10), M(woody ? 0x7a5230 : 0x6aa84f), 0, 0.1, 0));
  const daun = group('daun');
  for (let i = 0; i < 4; i++) {
    const l = leaf(''); l.scale.setScalar(0.55); l.position.set(0.05 * (i % 2 ? 1 : -1), 0.07 + i * 0.03, 0); l.rotation.set(0, i % 2 ? 0.3 : Math.PI - 0.3, (i % 2 ? 1 : -1) * 0.35); daun.add(l);
  }
  const bunga = group('bunga');
  for (let i = 0; i < 5; i++) { const p = mesh(new THREE.SphereGeometry(0.02, 12, 8).scale(1.4, 0.25, 0.9).translate(0.024, 0, 0), M(flower)); p.rotation.set(0, i * Math.PI * 2 / 5, 0.5); bunga.add(p); }
  bunga.add(mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.04), M(0xffd54f), 0, 0.02, 0).rotateZ(0.3));
  bunga.position.y = 0.2;
  return { akar, batang, daun, bunga };
}
// clear pot with soil you can see the roots through; top of soil at y = 0.13 (put plant parts there)
export function glassPot(name = 'pasu') {
  return group(name, mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.14, 24, 1, true), M(0xdff3ff, { transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), 0, 0.07, 0),
    mesh(new THREE.CylinderGeometry(0.087, 0.075, 0.13, 24), M(0x6d4c2f, { transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.065, 0));
}
