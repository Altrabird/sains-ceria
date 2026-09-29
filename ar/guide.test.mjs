// node ar/guide.test.mjs — step tracker + steps.json sanity (every step references real kit items)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { StepTracker } from './guide.js';

const steps = JSON.parse(readFileSync(new URL('../assets/steps.json', import.meta.url)));
const kits = JSON.parse(readFileSync(new URL('../assets/kits.json', import.meta.url)));
for (const [am, s] of Object.entries(steps)) {
  if (!am.startsWith('AM')) continue;
  assert.ok(s.q && s.k && s.steps.length, `${am} has q, k, steps`);
  const inKit = new Set(kits[am].items.map(i => i.id));
  for (const st of s.steps) for (const id of st.ids || []) assert.ok(inKit.has(id), `${am}: step uses '${id}' which is not in the kit`);
}

const t = new StepTracker(steps.AM07);
assert.equal(t.event({ type: 'rig', id: 'eraser' }), false);          // wrong item for step 1
assert.equal(t.event({ type: 'tap', id: 'coin' }), false);            // wrong event type
assert.equal(t.event({ type: 'rig', id: 'coin', lit: true }), true);  // step 1 done
assert.equal(t.event({ type: 'rig', id: 'iron_nail' }), false);       // step 2 needs 2 different
assert.equal(t.event({ type: 'rig', id: 'iron_nail' }), false);       // same id twice doesn't count
assert.equal(t.event({ type: 'rig', id: 'paper_clip' }), true);
t.event({ type: 'rig', id: 'eraser' }); assert.equal(t.event({ type: 'rig', id: 'sponge' }), true);
assert.ok(t.done);

const m = new StepTracker(steps.AM10);                                // match{} filters
assert.equal(m.event({ type: 'rig', id: 'sample_sugar', glass: 'glass_cold' }), false);
assert.equal(m.event({ type: 'rig', id: 'sample_sugar', glass: 'glass_hot' }), true);
const w = new StepTracker(steps.AM12);                                // on: [..] alternatives
assert.equal(w.event({ type: 'spin', id: 'pinwheel' }), true);
console.log('guide.test: all passed');
