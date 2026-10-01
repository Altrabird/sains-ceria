# AR Amali Sains T2 — asset kit

3D + computer-vision assets for turning **Rekod Amali Sains Tahun 2** (12 amali, AM01–AM12) into an AR game.
Everything is generated from scripts, so any asset can be tweaked and rebuilt in seconds.

| Folder | What |
|---|---|
| `blender/build_assets.py` | Builds **99 GLB props** + `assets/manifest.json` (headless Blender, ~15 s) |
| `assets/models/*.glb` | The props — real-world metres, origin at base, glTF Y-up |
| `assets/manifest.json` | Per asset: BM name, amali tags, size, tris, interactive nodes, science facts |
| `assets/kits.json` | Which props sit on each amali's card, and where |
| `markers/AMxx.png` | 12 image-tracking markers; `kad-penanda-AR.pdf` = print sheet (12 cm cards) |
| `markers/targets.mind` | MindAR targets, all 12 (index = AM number − 1); `AMxx.mind` = single-card (~450 KB) |
| `viewer/` | Asset gallery + inspector (thumbnails, orbit, pivot sliders, state toggles, anchors) |
| `index.html` | Playable AR prototype: camera → detect card (MindAR) → kit appears → **hand gestures** (MediaPipe) to experiment |
| `../../shared/hands.js` | Gesture layer: 21 hand landmarks → two-finger grab / point-hold / wave / palm-hold; knobs in `TUNE` |
| `../../shared/vendor/` | three.js r160 + MindAR 1.2.5 (MIT), MediaPipe tasks-vision 1.0.1 + hand model (Apache-2.0), bundled for offline use |
| `tools/` | Marker generator/compiler + headless tests |

## Run

From the **repo root**: `python -m http.server 8000`
- Gallery: http://localhost:8000/games/T2-amali/viewer/
- AR menu: http://localhost:8000/games/T2-amali/ (webcam works on localhost). `?preview=AM07` = 3D without camera.
- **Phones need HTTPS** for the camera (e.g. GitHub Pages).

## Asset conventions (what the game code relies on)

- `pivot_*` nodes move: `pivot_lid` (rot X), `pivot_door` (rot Y), `pivot_needle` (rot Y, 360° = 120 kg),
  `pivot_slider` (move Y), `pivot_tape` (scale X), `pivot_rotor`/`pivot_hand` (spin Z), `pivot_spin` (spin Y),
  `pivot_inflate` (uniform scale), `pivot_rocket` (move X), `pivot_water` (scale Y = water level), `pivot_lever`, `pivot_blade_a`.
- `anchor_*` empties = snap points (`anchor_test` on the circuit tester, `anchor_drop_in` above glasses, `anchor_evap`…).
- `stage_0..4` (sprout) / `week_1..3` (plant) = show one at a time.
- `MAT_*` materials are named for runtime changes: `MAT_bulb_glass` + `MAT_filament` emissive = bulb on; `MAT_water*` tint = dissolving.
- Root node `userData` holds the science: `conductor`, `soluble` + `water_tint`, `opacity` + `light_through`, `germinates`,
  `healthy`, `sequence` (water-cycle cards), `magnetic`, `method`, `tp`.

## Two computer-vision models on one camera

1. **MindAR image tracking** finds the printed card (feature points → pose) and anchors the kit on it.
2. **MediaPipe Hand Landmarker** finds 21 hand joints every frame; `shared/hands.js` turns them into gestures:

| Gesture | Action |
|---|---|
| ☝️ point + hold 0.8 s | tap the object under the fingertip |
| ✌️ two fingers up, move, lower | grab & drop (coin → circuit, sugar → glass, magnet → sand, card → diorama) |
| 👋 wave open palm | moving air: pinwheel spins, balloon rocket launches |
| ✋ open palm still 2 s | reset the experiment |

**Modes** (menu at `games/T2-amali/`): **▶ click an amali** = `?play=AM07` — no card, live selfie camera behind the kit, hand gestures (main mode);
📷 card = `?am=AM07` (single card) or `?all` (any card); 🧊 `?preview=AM07` = plain 3D, mouse only. The top-bar dropdown switches amali in one click.
Mouse/touch always work too.
Tuning for real classrooms (grab delay, dwell time…) lives in `TUNE` at the top of `shared/hands.js`.

## Guided steps (Arahan)

Every amali shows a step card: the soalan inkuiri, then steps with their gesture (☝️ / 🤏 / 👋) that **tick themselves**
when the pupil actually does them (bulb lit, card placed in order…), ending with the kesimpulan + stars. 🔊 turns on
narration: pre-recorded **Malaysian Malay** mp3s (`assets/audio/`, Microsoft neural voice ms-MY-Yasmin) — same accent on
every device, offline. Never falls back to an Indonesian voice. After editing `assets/steps.json` run
`python tools/make_audio.py` (only changed lines are re-recorded; `--voice ms-MY-OsmanNeural` for a male voice). Edit steps in `assets/steps.json`
(q/k come from Rekod Amali data.js); `node guide.test.mjs` checks every step names a real kit item.

## What the AR prototype already does

| Amali | Tap interaction |
|---|---|
| AM01 | Scale needle → weight, stadiometer → height, tape extends |
| AM02 | Sprout cycles through 5 germination stages; fridge door opens; cups A–D show condition facts |
| AM03 | Plant cycles week 1 → 3 |
| AM04 | Each plant states its condition; dark box lid opens |
| AM05 | Mystery-box lids open (lit box has a lamp); torch on/off; stopwatch runs |
| AM06 | Sheet moves between torch and screen → shadow darkness = 1 − `light_through` |
| AM07 | Test object clips into the circuit → bulb lights only for conductors |
| AM08 | Magnet pulls the clips out; sieve catches the pebbles; funnel filters muddy water |
| AM09 | Sample drops into the glass → dissolves/tints or leaves sediment |
| AM10 | Pick hot/cold glass, drop fine sugar or cube → simulated dissolve timer |
| AM11 | Jar shows evaporation/rain particles; label cards must be placed in the right order on the diorama |
| AM12 | Balloon rocket launches along the string; pinwheel spins; balloon inflates/deflates |

## Rebuild / test (run from `games/T2-amali/`)

```bash
"C:/Program Files (x86)/Steam/steamapps/common/Blender/blender.exe" -b -P blender/build_assets.py            # all
"C:/Program Files (x86)/Steam/steamapps/common/Blender/blender.exe" -b -P blender/build_assets.py -- AM07    # one amali / id
python tools/make_markers.py && python tools/compile_markers.py    # markers + .mind
python tools/snap_gallery.py out.png     # every GLB loads in three.js
python tools/test_ar.py                  # every kit loads + every tap runs without JS errors
python tools/test_tracking.py            # fake webcam of a tilted card → MindAR must detect all 12
python tools/test_hands.py               # simulated hands drive two-finger/point/wave/reset; real MediaPipe model loads
node ../../shared/hands.test.mjs                   # gesture classifier + state machine
node guide.test.mjs                   # step tracker + steps.json references
python tools/test_guide.py               # doing each amali completes all its steps
python tools/test_am06.py                # AM06: one panel in the centre slot, beam never steals a touch
```
