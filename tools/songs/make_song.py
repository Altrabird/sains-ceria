"""Draft a unit's song with ACE-Step 1.5 on acemusic.ai (free cloud API, no GPU) from games/<id>/assets/lagu.json.

  1. free API key: https://acemusic.ai/api-key (sign up), then set it in your shell — never commit it:
       PowerShell:  $env:ACEMUSIC_API_KEY = "..."      Git Bash:  export ACEMUSIC_API_KEY=...
  2. python tools/songs/make_song.py games/T1-U07-magnet [female|male] [--style=tadika|joget] [--melody] [--instrumental]
       -> songs_draft/<id>/lagu_<voice>_<time>.mp3 (one take per run, ~20 s)
     --melody        sing to our own melody guide (tools/songs/melody.py -> songs_draft/<id>/melodi.wav, ACE-Step "cover")
     --instrumental  backing track only: a teacher / the pupils sing (guaranteed Malaysian accent)
     (a .json path works instead of games/<id>, for trying a song before it has a game)

Pronunciation: sebutan baku — lyrics are sung exactly as spelt (no respelling).
Listen to every take before use. Copy the good one to games/<id>/assets/lagu.mp3."""
import base64, json, os, sys, time, urllib.error, urllib.request

API = os.environ.get("ACESTEP_API", "https://api.acemusic.ai")
KEY = os.environ.get("ACEMUSIC_API_KEY", "")
# shared musical styles ({style} in a caption). Naming a specific folk tune (Bangau Oh Bangau...) sounded odd: describe a genre.
STYLES = {
    "joget": "slow Malay joget rhythm for children, accordion, rebana frame drum, violin, gentle gambus, classic Malay feel, children's choir echoes the chorus",
    "tadika": "Malaysian kindergarten classroom song, soft piano and glockenspiel, simple bouncy melody with few notes, slow clear singing like a teacher leading the class",
}
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))


def load(arg):
    if arg.endswith(".json"):
        return os.path.splitext(os.path.basename(arg))[0], json.load(open(arg, encoding="utf-8"))
    gid = os.path.basename(os.path.normpath(arg))
    return gid, json.load(open(os.path.join(ROOT, "games", gid, "assets", "lagu.json"), encoding="utf-8"))


def main(arg, voice="female", melody=False, instrumental=False, style="tadika"):
    gid, song = load(arg)
    if not KEY and "acemusic.ai" in API:
        sys.exit("set ACEMUSIC_API_KEY first (free key: https://acemusic.ai/api-key)")
    out = os.path.join(ROOT, "songs_draft", gid); os.makedirs(out, exist_ok=True)
    caption = song["caption"].replace("{voice}", "instrumental, no vocals" if instrumental else song.get("voices", {}).get(voice, voice))         .replace("{style}", STYLES.get(style, style))
    content = caption
    body = {"batch_size": 1, "use_cot_caption": False, "use_cot_language": False,
            "audio_config": {"vocal_language": "ms", "duration": song.get("duration"), "bpm": song.get("melody", {}).get("bpm") or song.get("bpm"),
                             "format": "mp3", **({"instrumental": True} if instrumental else {})}}
    if not instrumental:
        body["lyrics"] = song["lyrics"]  # with `lyrics` set, the message text is the style caption
    if melody:  # sing over our own melody guide (ACE-Step cover): keeps the traditional tune
        guide = os.path.join(out, "melodi.wav")
        if not os.path.exists(guide):
            sys.exit(f"no {os.path.relpath(guide, ROOT)}: run python tools/songs/melody.py {arg} first")
        content = [{"type": "text", "text": caption},
                   {"type": "input_audio", "input_audio": {"data": base64.b64encode(open(guide, "rb").read()).decode(), "format": "wav"}}]
        body.update(task_type="cover", audio_cover_strength=float(os.environ.get("COVER_STRENGTH", "0.6")))
    body["messages"] = [{"role": "user", "content": content}]
    req = urllib.request.Request(API + "/v1/chat/completions", json.dumps(body).encode("utf-8"),
                                 {"Content-Type": "application/json; charset=utf-8", "User-Agent": "sains-ceria/1",
                                  **({"Authorization": "Bearer " + KEY} if KEY else {})})
    kind = ("instrumental" if instrumental else voice) + "_" + style
    print(f"generating {song.get('title', gid)} ({kind}{', on melody guide' if melody else ''}) ...")
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:500]}")
    audio = res["choices"][0]["message"].get("audio") or []
    if not audio:
        sys.exit("no audio returned: " + json.dumps(res)[:500])
    stamp = time.strftime("%m%d-%H%M%S")
    for a in audio:
        dst = os.path.join(out, f"lagu_{kind}{'_melodi' if melody else ''}_{stamp}.mp3")
        with open(dst, "wb") as f:
            f.write(base64.b64decode(a["audio_url"]["url"].split(",", 1)[1]))
        print("saved", os.path.relpath(dst, ROOT))
    print(f"done in {time.time() - t0:.0f} s")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    style = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--style=")), "tadika")
    main(args[0], args[1] if len(args) > 1 else "female", "--melody" in sys.argv, "--instrumental" in sys.argv, style)
