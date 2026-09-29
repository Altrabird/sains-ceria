// Hand-gesture layer: MediaPipe HandLandmarker (21 joints/frame, computer vision on the same camera)
// → pinch (grab/drag/drop), point-and-hold (tap), open-palm wave (wind), open-palm hold (reset).
// classify() + Gestures are pure (no DOM) so ar/hands.test.mjs can check them in Node.

export const CONN = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
export const TUNE = {         // calibration knobs — real hands/cameras differ, adjust here
  pinchOn: 0.33, pinchOff: 0.5, // thumb-index gap / palm size
  reach: 1.2,                  // pinch only if index tip reaches past its knuckle (a fist is not a pinch)
  extend: 1.15,                 // tip must be this much farther from wrist than the PIP joint
  dwell: 0.8,                   // s pointing at the same object = tap
  hold: 2.0,                    // s open palm held still = reset
  wave: 1.0,                    // palm x speed (frame widths/s) = wind
  still: 0.15,
  smooth: 0.5,
};
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function classify(lm, wasPinch = false) {
  const s = dist(lm[0], lm[9]) || 1e-6;
  const ext = [[8, 6], [12, 10], [16, 14], [20, 18]].map(([t, p]) => dist(lm[t], lm[0]) > dist(lm[p], lm[0]) * TUNE.extend);
  const pinch = dist(lm[4], lm[8]) / s < (wasPinch ? TUNE.pinchOff : TUNE.pinchOn)
    && dist(lm[8], lm[0]) > dist(lm[5], lm[0]) * TUNE.reach;
  const g = pinch ? 'pinch' : ext[0] && !ext[1] && !ext[2] && !ext[3] ? 'point' : ext.every(Boolean) ? 'open' : 'none';
  const palm = [0, 5, 9, 13, 17].reduce((a, i) => ({ x: a.x + lm[i].x / 5, y: a.y + lm[i].y / 5 }), { x: 0, y: 0 });
  const key = g === 'pinch' ? { x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 } : g === 'point' ? lm[8] : palm;
  return { g, x: key.x, y: key.y, px: palm.x };
}

// Turns a stream of classified frames into events. h = { hit(x,y)->key|null, tap, grab, drag, drop, wind, reset }.
export class Gestures {
  constructor(h) { this.h = h; this.t = 0; this.x = null; this.pinching = false; this.clear(); this.lastWind = -9; }
  clear() { this.key = null; this.dwell = 0; this.fired = false; this.hist = []; this.still = 0; this.resetDone = false; this.g = 'none'; }
  get progress() { return this.g === 'point' ? Math.min(1, this.dwell / TUNE.dwell) : this.g === 'open' ? Math.max(0, Math.min(1, this.still / TUNE.hold)) : 0; }
  update(c, t) {
    const dt = this.t ? Math.min(0.1, t - this.t) : 0; this.t = t;
    const h = this.h;
    if (!c) {
      if (this.pinching) { this.pinching = false; h.drop(this.x, this.y); }
      this.x = null; this.clear(); return;
    }
    if (this.x === null) { this.x = c.x; this.y = c.y; }
    this.x += (c.x - this.x) * TUNE.smooth; this.y += (c.y - this.y) * TUNE.smooth;
    const g = this.g = c.g;
    if (g === 'pinch') { if (!this.pinching) { this.pinching = true; h.grab(this.x, this.y); } else h.drag(this.x, this.y); }
    else if (this.pinching) { this.pinching = false; h.drop(this.x, this.y); }

    if (g === 'point') {
      const k = h.hit(this.x, this.y);
      if (k && k === this.key) this.dwell += dt; else { this.key = k; this.dwell = 0; this.fired = false; }
      if (k && !this.fired && this.dwell >= TUNE.dwell) { this.fired = true; h.tap(this.x, this.y); }
    } else { this.key = null; this.dwell = 0; this.fired = false; }

    if (g === 'open') {
      this.hist.push({ t, x: c.px }); while (this.hist.length && this.hist[0].t < t - 0.6) this.hist.shift();
      let path = 0; for (let i = 1; i < this.hist.length; i++) path += Math.abs(this.hist[i].x - this.hist[i - 1].x);
      const span = this.hist.length > 1 ? t - this.hist[0].t : 0;
      const speed = span > 0.2 ? path / span : 0;
      if (speed > TUNE.wave && t - this.lastWind > 1.5) { this.lastWind = t; this.still = 0; h.wind(); }
      else if (speed < TUNE.still) this.still += dt; else this.still = 0;
      if (this.still >= TUNE.hold && !this.resetDone) { this.resetDone = true; h.reset(); }
    } else { this.hist = []; this.still = 0; this.resetDone = false; }
  }
}

// Fake landmarks for tests: gesture g at normalized key point (x, y).
export function synthHand(g, x, y, s = 0.08) {
  const up = [[0, 0], [-.3, -.2], [-.5, -.4], [-.6, -.6], [-.7, -.8],
    [-.25, -1], [-.28, -1.4], [-.3, -1.7], [-.32, -2], [0, -1.05], [0, -1.5], [0, -1.8], [0, -2.1],
    [.22, -1], [.24, -1.4], [.25, -1.7], [.26, -1.95], [.42, -.9], [.47, -1.2], [.5, -1.4], [.52, -1.6]];
  const curl = { 6: [-.25, -1.3], 7: [-.2, -1.1], 8: [-.2, -.95], 10: [0, -1.35], 11: [.05, -1.15], 12: [.05, -1],
    14: [.22, -1.3], 15: [.25, -1.1], 16: [.25, -.95], 18: [.42, -1.15], 19: [.45, -1], 20: [.45, -.88] };
  const p = up.map(v => [...v]);
  if (g !== 'open') for (const i of [10, 11, 12, 14, 15, 16, 18, 19, 20]) p[i] = curl[i];
  if (g === 'none') for (const i of [6, 7, 8]) p[i] = curl[i];
  if (g === 'pinch') p[4] = [p[8][0] + .05, p[8][1] + .05];
  const lm = p.map(([a, b]) => ({ x: a * s, y: b * s, z: 0 }));
  const k = classify(lm);
  return lm.map(q => ({ x: q.x - k.x + x, y: q.y - k.y + y, z: 0 }));
}

// ---- browser only
export async function createHandTracker() {
  const base = new URL('../vendor/mediapipe/', import.meta.url).href;
  const { FilesetResolver, HandLandmarker } = await import(base + 'vision_bundle.mjs');
  const files = await FilesetResolver.forVisionTasks(base + 'wasm');
  const make = delegate => HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: base + 'hand_landmarker.task', delegate }, runningMode: 'VIDEO', numHands: 1,
    minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
  });
  try { return await make('GPU'); } catch { return make('CPU'); }
}

export function drawHand(ctx, lm, toScreen, color) {
  const pts = lm.map(p => toScreen(p.x, p.y));
  ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.fillStyle = '#fff';
  ctx.beginPath(); for (const [a, b] of CONN) { ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); } ctx.stroke();
  for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill(); }
}
