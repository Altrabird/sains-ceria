// node ar/hands.test.mjs — gesture classifier + state machine self-check
import assert from 'node:assert/strict';
import { classify, Gestures, synthHand, TUNE } from './hands.js';

for (const g of ['two', 'point', 'open', 'none']) {
  const c = classify(synthHand(g, 0.4, 0.6));
  assert.equal(c.g, g, `classify ${g}`);
  if (g !== 'none') { assert.ok(Math.abs(c.x - 0.4) < 1e-9 && Math.abs(c.y - 0.6) < 1e-9, `key point ${g}`); }
}

const ev = [];
const h = { hit: () => 'obj', tap: () => ev.push('tap'), grab: () => ev.push('grab'), drag: () => ev.push('drag'),
  drop: () => ev.push('drop'), wind: () => ev.push('wind'), reset: () => ev.push('reset') };
const G = new Gestures(h);
let t = 1;
const run = (g, secs, xf = () => 0.5) => { for (let i = 0; i < secs * 30; i++, t += 1 / 30) G.update(classify(synthHand(g, xf(t), 0.5), G.grabbing), t); };

run('point', TUNE.dwell + 0.2);                 // hold point on object -> exactly one tap
assert.deepEqual(ev.filter(e => e === 'tap'), ['tap']);
ev.length = 0; run('two', 0.5); run('none', 0.2);     // two fingers -> grab, drags, drop on release
assert.equal(ev[0], 'grab'); assert.ok(ev.includes('drag')); assert.equal(ev.at(-1), 'drop');
ev.length = 0; run('open', 1, tt => 0.5 + 0.2 * Math.sin(tt * 12));  // wave -> wind (once, cooldown)
assert.deepEqual(ev, ['wind']);
ev.length = 0; run('none', 0.1); run('open', TUNE.hold + 0.5);       // still palm -> one reset
assert.deepEqual(ev, ['reset']);
const lose = secs => { for (let i = 0; i < secs * 30; i++, t += 1 / 30) G.update(null, t); };
ev.length = 0; run('two', 0.3); lose(0.1);                           // blurry camera misses a few frames -> still holding
assert.ok(G.grabbing && !ev.includes('drop'), 'brief loss keeps the grab');
run('two', 0.1); lose(TUNE.lost + 0.1);                               // hand really gone mid-grab -> drop
assert.equal(ev.at(-1), 'drop');
ev.length = 0; run('none', 0.2); run('two', 0.05); run('none', 0.2);   // brief flicker through "two" -> no grab
assert.ok(!ev.includes('grab'), 'no grab on a flicker');
console.log('hands.test: all passed');
