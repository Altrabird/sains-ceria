"""Draft a unit's song with ACE-Step 1.5 on acemusic.ai (free cloud API, no GPU) from games/<id>/assets/lagu.json.

  1. free API key: https://acemusic.ai/api-key (sign up), then set it once in your shell — never commit it:
       PowerShell:  $env:ACEMUSIC_API_KEY = "..."      Git Bash:  export ACEMUSIC_API_KEY=...
  2. python tools/songs/make_song.py games/T1-U07-magnet [n]   -> songs_draft/<id>/lagu_<n>.mp3 (n takes, default 2)

Listen to every take: Malay vocals can drift to Indonesian pronunciation. Copy the good one to games/<id>/assets/lagu.mp3.
(A local ACE-Step server works too: ACESTEP_API=http://127.0.0.1:8001 — same endpoint.)"""
import base64, json, os, sys, time, urllib.error, urllib.request

API = os.environ.get("ACESTEP_API", "https://api.acemusic.ai")
KEY = os.environ.get("ACEMUSIC_API_KEY", "")
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))


def main(game, n=2):
    gid = os.path.basename(os.path.normpath(game))
    song = json.load(open(os.path.join(ROOT, "games", gid, "assets", "lagu.json"), encoding="utf-8"))
    if not KEY and "acemusic.ai" in API:
        sys.exit("set ACEMUSIC_API_KEY first (free key: https://acemusic.ai/api-key)")
    body = {
        "messages": [{"role": "user", "content": song["caption"]}],   # with `lyrics` set, the message is the style caption
        "lyrics": song["lyrics"], "batch_size": n,
        "use_cot_caption": False,     # keep our caption as written
        "use_cot_language": False,    # never let it guess the language (Indonesian is the risk)
        "audio_config": {"vocal_language": "ms", "duration": song.get("duration"), "bpm": song.get("bpm"), "format": "mp3"},
    }
    req = urllib.request.Request(API + "/v1/chat/completions", json.dumps(body).encode("utf-8"),
                                 {"Content-Type": "application/json; charset=utf-8", "User-Agent": "sains-ceria/1",
                                  **({"Authorization": "Bearer " + KEY} if KEY else {})})
    print(f"generating {n} takes of {song.get('title', gid)} ...")
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:500]}")
    audio = res["choices"][0]["message"].get("audio") or []
    if not audio:
        sys.exit("no audio returned: " + json.dumps(res)[:500])
    out = os.path.join(ROOT, "songs_draft", gid); os.makedirs(out, exist_ok=True)
    stamp = time.strftime("%m%d-%H%M")
    for i, a in enumerate(audio, 1):
        dst = os.path.join(out, f"lagu_{stamp}_{i}.mp3")
        with open(dst, "wb") as f:
            f.write(base64.b64decode(a["audio_url"]["url"].split(",", 1)[1]))
        print("saved", os.path.relpath(dst, ROOT))
    print(f"done in {time.time() - t0:.0f} s")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 2)
