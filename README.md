# Sains Ceria · Tahun 1–6

Interactive science games for the Malaysian primary syllabus (KSSR Sains, Tahun 1–6): **63 units, one game each**,
played with **hand gestures in front of the camera** (MediaPipe) or with mouse/touch. All text and narration in Bahasa Melayu.

**Play:** https://edugames.altrabird.click/

- ☝️ point and hold = press / tap · ✌️ two fingers = grab and move (scroll on menus) · 👋 wave = blow/shake · ✋ hold still = restart
- Progress (stars per level) is saved on the device; no login.
- Works offline once loaded (installable web app), or as an Android app (one hub APK with every game).

## Tech

Plain HTML + ES modules, no bundler: [three.js](https://threejs.org/) scenes, [MediaPipe](https://developers.google.com/mediapipe) hand
landmarks, [Capacitor](https://capacitorjs.com/) for Android. Every game is `games/T<year>-U<unit>-<slug>/` on the shared engine in
`shared/` (see `CLAUDE.md` for the full layout and rules).

```bash
python -m http.server 8000            # http://localhost:8000/
python games/<id>/tools/test_game.py  # plays every level (mouse + simulated hands) in headless Chromium
python tools/test_hub.py              # hub, progress, hand navigation
python tools/build.py web             # dist/web  (static site)
python tools/build.py apk-hub         # dist/Sains-Ceria.apk (all games)
DEPLOY=root@host:/var/www/edugames sh tools/deploy.sh
```

## License

MIT — see [LICENSE](LICENSE). Third-party parts below keep their own licenses.

## Credits

- 3D icons: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) — MIT License
- Fonts: Fredoka, Nunito — SIL Open Font License
- three.js (MIT), MediaPipe Tasks Vision (Apache 2.0), MindAR (MIT) — vendored in `shared/vendor/`
- Narration: Microsoft Edge neural TTS voice ms-MY-YasminNeural
