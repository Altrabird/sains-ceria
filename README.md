# Permainan Sains Tahun 1–6

Interactive science games (camera + hand gestures + 3D) for every unit of KSSR Sains Tahun 1–6.
One codebase → website on the VPS **and** one Android APK per game.

```bash
python -m http.server 8000                       # play locally: http://localhost:8000/
python tools/build.py web                        # -> dist/web/ (upload to VPS)
python tools/build.py apk T2-amali               # -> games/T2-amali/build/T2-amali.apk
DEPLOY=user@host:/var/www/sains sh tools/deploy.sh
```

Layout and the per-game checklist: [CLAUDE.md](CLAUDE.md). First game: [games/T2-amali](games/T2-amali/README.md).

## VPS (Caddy)

```
sains.example.my {
    root * /var/www/sains
    file_server
    encode gzip
}
```
Caddy fetches the HTTPS certificate itself — the camera only works over HTTPS.
