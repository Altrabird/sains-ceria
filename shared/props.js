// Props built from three.js primitives + the drag helper, shared by unit games (no GLBs needed).
// Units: metres, table top at y = 0, +z toward the pupil. Every factory returns a named Group (names = test handles).
import * as THREE from 'three';

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
