# Sains games — one game per unit, Tahun 1–6

Web-first: every game is plain HTML + ES modules (three.js, MindAR, MediaPipe) that runs in a browser
**and** becomes an Android APK through Capacitor. No Unity, no bundler, no framework.

## Layout

```
index.html, games.json   hub page; games.json lists every game (build fails if it and games/ disagree)
shared/                  engine used by every game
  hands.js               MediaPipe hand landmarks -> gestures (point-hold, two-finger grab, wave, palm reset); TUNE knobs
  guide.js               StepTracker (self-ticking steps) + GuidePanel + Malay mp3 narration (assets/audio/ of the page)
  blender/lib.py         bpy helpers (mat, box, cyl, ...) for asset build scripts
  vendor/                three r160, MindAR 1.2.5, MediaPipe tasks-vision — offline, never use a CDN
games/T<y>-U<nn>-<slug>/ one game per syllabus unit, e.g. games/T1-U07-magnet/
  index.html             the game; imports ../../shared/...; its own files by relative path (assets/...)
  assets/                GLBs, manifest.json, kits.json, steps.json, audio/
  blender/, tools/       dev only — never shipped
  build/<id>.apk         APK output (gitignored)
games/T2-amali/          the first project (Rekod Amali T2, 12 amali) — the reference implementation; see its README
tools/build.py           `web` -> dist/web for the VPS; `apk <id>` -> games/<id>/build/<id>.apk
tools/deploy.sh          DEPLOY=user@host:/path sh tools/deploy.sh
android/                 Capacitor project (patched: CAMERA permission, -PappId/-PappName per game)
```

Folder id = `T<year>-U<unit 2 digits>-<lowercase-slug>`. Add it to `games.json` with year, unit, title, desc.

## Source material

Syllabus notes: `C:\Users\HARSIDI BIN JUNICK\Downloads\Telegram Desktop\Nota Ringkas Sains Tahun N by RPH365.pdf`.
They are **images with no text layer** — render pages with pymupdf and read them visually.
Order: year by year, unit by unit (T1 U1 -> T6 U10). Each unit card lists DSKP standard codes (SP x.y.z); put them in the game.

## Daily game workflow

1. Read the unit's PDF pages; pick 1 core interactive mechanic per unit (what a pupil *does*, not a quiz of the notes).
2. Assets: three.js primitives in code first; Blender (shared/blender/lib.py, headless) only when a prop needs it.
3. Reuse shared/ — gestures and guided steps must come from hands.js/guide.js. When a game needs something
   T2-amali has inside its index.html (scene setup, hand cursor, GLB loader), move it into shared/ then, not before.
4. All pupil-facing text in Bahasa Melayu (Malaysia). Narration = pre-recorded ms-MY mp3s (see T2-amali tools/make_audio.py), never Indonesian.
5. Done = all of:
   - works with mouse/touch only AND with hand gestures
   - one headless check (playwright, like games/T2-amali/tools/test_ar.py) that loads it with no JS errors and completes the steps
   - listed in games.json; `python tools/build.py web` passes
   - `python tools/build.py apk <id>` builds
   - commit

## Run / build

```bash
python -m http.server 8000          # repo root -> http://localhost:8000/
npm test                            # node unit tests
python tools/build.py web
python tools/build.py apk T2-amali
```

Phones need HTTPS for the camera on the web (VPS: Caddy gives it automatically). The APK needs nothing.
