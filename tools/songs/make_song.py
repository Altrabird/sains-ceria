"""Unit songs ("Lagu Sains") with ACE-Step 1.5 on acemusic.ai (free cloud API, no GPU), from games/<id>/assets/lagu.json.

  1. free API key: https://acemusic.ai/api-key (sign up), then set it in your shell — never commit it:
       PowerShell:  $env:ACEMUSIC_API_KEY = "..."      Git Bash:  export ACEMUSIC_API_KEY=...
  2. python tools/songs/make_song.py games/T1-U07-magnet [male|female] [--style=...] [--draft]
       -> games/<id>/assets/lagu.mp3 (80 kbps, checked: length + no long silence), or songs_draft/<id>/ with --draft
     python tools/songs/make_song.py --all        every game with a lagu.json and no lagu.mp3 yet (then games.json "song")
     python tools/songs/make_song.py --check      check every lagu.json / lagu.mp3 pair, no generation
     python tools/songs/make_song.py --fix [ids]  remake songs whose singer skipped lyric lines (tools/songs/lyricsync.py)
     --melody / --instrumental: sing on our melody guide (tools/songs/melody.py) / backing track only

lagu.json: {"title", "style" (a STYLES key), "lyrics" ([Verse 1] / [Chorus] ... sections), optional "bpm", "duration", "voice"}.
Pronunciation: sebutan baku — lyrics sung exactly as spelt. Listen before shipping: a bad take is regenerated with
python tools/songs/make_song.py games/<id> (it overwrites). Decisions: male voice, genre styles (naming a folk tune sounded odd)."""
import base64, json, os, re, subprocess, sys, time, urllib.error, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # lyricsync

API = os.environ.get("ACESTEP_API", "https://api.acemusic.ai")
KEY = os.environ.get("ACEMUSIC_API_KEY", "")
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

CAPTION = ("Malaysian children's educational song, {style}, sung in standard Malaysian Malay (sebutan baku), clear Malaysian diction, "
           "not Indonesian, {voice}, catchy and easy for primary school children to sing along, every word clear, warm and cheerful")
VOICES = {"male": "friendly clear male voice, Malaysian primary school teacher",
          "female": "warm clear female voice, Malaysian kindergarten teacher"}
# genre, not a named folk tune (that sounded odd). bpm kept moderate so pupils can follow the words.
STYLES = {
    "tadika": ("Malaysian kindergarten classroom song, soft piano and glockenspiel, simple bouncy melody with few notes, slow clear singing like a teacher leading the class", 88),
    "pop": ("bright modern Malaysian kids pop like a children's TV theme, acoustic guitar, light drums, claps, ukulele, kids choir on the chorus", 100),
    "dikir": ("Malay dikir barat style, call and response between a lead singer and a group chorus, rebana and gong, hand claps, joyful and rhythmic", 96),
    "zapin": ("Malay zapin style, gambus lute, marwas hand drums, accordion, graceful swaying rhythm", 92),
    "nasyid": ("Malaysian children's nasyid, warm vocal harmonies, light frame drum and soft synth pad, gentle and uplifting", 84),
    "joget": ("Malay joget rhythm for children, accordion, violin, rebana, playful and danceable but not fast", 98),
}
FF = None


def ffmpeg():
    global FF
    if not FF:
        import imageio_ffmpeg  # pip install imageio-ffmpeg (bundled ffmpeg, no system install)
        FF = imageio_ffmpeg.get_ffmpeg_exe()
    return FF


def syllables(lyrics):
    words = re.findall(r"[A-Za-z]+", "\n".join(l for l in lyrics.split("\n") if not l.strip().startswith("[")))
    return sum(max(1, len(re.findall(r"[aeiou]+", w.lower()))) for w in words)


def probe(path):
    """(seconds, mean dB, longest silence s) of an audio file."""
    err = subprocess.run([ffmpeg(), "-hide_banner", "-i", path, "-af", "volumedetect,silencedetect=n=-38dB:d=1.5", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    dur = int(h) * 3600 + int(m) * 60 + float(s)
    mean = float(re.search(r"mean_volume: (-?[\d.]+) dB", err)[1])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    gaps = [e - s for s, e in zip(starts, ends)] + ([dur - starts[-1]] if len(starts) > len(ends) else [])
    return dur, mean, max(gaps, default=0.0)


def problems(path, song):
    """Reasons to reject a take (empty = ok). ponytail: length/silence heuristics, not a listen — a human still approves."""
    dur, mean, gap = probe(path)
    need = syllables(song["lyrics"]) / 3.2  # sung children's pace ~2.5-3 syllables/s: shorter means words were cut or rushed
    out = []
    if dur < max(40, need):
        out.append(f"too short ({dur:.0f}s for {syllables(song['lyrics'])} syllables, want >= {max(40, need):.0f}s)")
    if dur > max(75, syllables(song["lyrics"]) / 1.0):  # under 1 syllable/s = long instrumental padding or repeats
        out.append(f"too long ({dur:.0f}s for {syllables(song['lyrics'])} syllables)")
    if mean < -30:
        out.append(f"too quiet (mean {mean:.1f} dB)")
    if gap > 6:
        out.append(f"{gap:.0f}s of silence")
    return out


def load(arg):
    if arg.endswith(".json"):
        return os.path.splitext(os.path.basename(arg))[0], json.load(open(arg, encoding="utf-8"))
    gid = os.path.basename(os.path.normpath(arg))
    return gid, json.load(open(os.path.join(ROOT, "games", gid, "assets", "lagu.json"), encoding="utf-8"))


def request(body):
    req = urllib.request.Request(API + "/v1/chat/completions", json.dumps(body).encode("utf-8"),
                                 {"Content-Type": "application/json; charset=utf-8", "User-Agent": "sains-ceria/1",
                                  **({"Authorization": "Bearer " + KEY} if KEY else {})})
    for attempt in range(6):  # the free cloud answers 502/503/504 when busy: wait and retry
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code not in (502, 503, 504, 429) or attempt == 5:
                raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")
            print(f"  busy (HTTP {e.code}), retrying in {30 * (attempt + 1)} s ...", flush=True)
            time.sleep(30 * (attempt + 1))
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 5:
                raise RuntimeError(f"network: {e}")
            time.sleep(20)


def generate(arg, voice=None, style=None, draft=False, melody=False, instrumental=False, tries=6, keep_if_missing=None):
    gid, song = load(arg)
    voice = voice or song.get("voice", "male")
    style = style or song.get("style", "tadika")
    desc, bpm = STYLES.get(style, (style, 90))
    caption = (song.get("caption") or CAPTION).replace("{style}", desc).replace(
        "{voice}", "instrumental, no vocals" if instrumental else VOICES.get(voice, voice))
    # thinking (ACE-Step's LM plans the song) + enough time for the words: tested 2026-10-04 on 3 songs x 2 takes,
    # lines actually sung 84% (defaults) -> 94% (this), so far fewer retakes. lyricsync still checks every take.
    body = {"batch_size": 1, "use_cot_caption": False, "use_cot_language": False, "thinking": not instrumental,
            "audio_config": {"vocal_language": "ms", "bpm": song.get("bpm", bpm), "format": "mp3",
                             "duration": song.get("duration") or round(syllables(song["lyrics"]) / 2.0 + 15),
                             **({"instrumental": True} if instrumental else {})}}
    if not instrumental:
        body["lyrics"] = song["lyrics"]  # with `lyrics` set, the message text is the style caption
    content = caption
    if melody:  # sing over our own melody guide (ACE-Step cover): keeps a tune we wrote out
        guide = os.path.join(ROOT, "songs_draft", gid, "melodi.wav")
        if not os.path.exists(guide):
            raise RuntimeError(f"no {guide}: run python tools/songs/melody.py {arg} first")
        content = [{"type": "text", "text": caption},
                   {"type": "input_audio", "input_audio": {"data": base64.b64encode(open(guide, "rb").read()).decode(), "format": "wav"}}]
        body.update(task_type="cover", audio_cover_strength=float(os.environ.get("COVER_STRENGTH", "0.6")))
    body["messages"] = [{"role": "user", "content": content}]

    drafts = os.path.join(ROOT, "songs_draft", gid); os.makedirs(drafts, exist_ok=True)
    best = None  # (missing lines, raw path, alignment)
    for t in range(1, tries + 1):
        print(f"{gid}: {song.get('title')} ({voice}, {style}) take {t} ...", flush=True)
        t0 = time.time()
        res = request(body)
        audio = (res["choices"][0]["message"].get("audio") or [None])[0]
        if not audio:
            print("  no audio returned:", json.dumps(res)[:200]); continue
        raw = os.path.join(drafts, f"lagu_{voice}_{style}_{time.strftime('%m%d-%H%M%S')}.mp3")
        open(raw, "wb").write(base64.b64decode(audio["audio_url"]["url"].split(",", 1)[1]))
        bad = problems(raw, song) if not instrumental else []
        if not bad and not instrumental:  # did the singer sing every lyric line? (tools/songs/lyricsync.py)
            import lyricsync
            miss, aligned = lyricsync.check(gid, path=raw, quiet=True) if not arg.endswith(".json") else ([], [])
            if best is None or len(miss) < len(best[0]):
                best = (miss, raw, aligned)
            if miss:
                bad = [f"{len(miss)} line(s) not sung: " + " / ".join(miss[:3]) + (" ..." if len(miss) > 3 else "")]
        print(f"  {time.time() - t0:.0f}s -> {os.path.relpath(raw, ROOT)} {'REJECT: ' + '; '.join(bad) if bad else 'ok'}", flush=True)
        if not bad:
            best = best or ([], raw, [])
            break
    if best is None:
        raise RuntimeError(f"{gid}: no acceptable take in {tries} tries")
    miss, raw, aligned = best
    if draft:
        return raw
    if keep_if_missing is not None and len(miss) >= keep_if_missing:
        print(f"  kept the current song: best new take still misses {len(miss)} line(s)", flush=True)
        return None
    dst = os.path.join(ROOT, "games", gid, "assets", "lagu.mp3")
    encode(raw, dst)
    p = os.path.join(ROOT, "games", gid, "assets", "lagu.json"); cur = json.load(open(p, encoding="utf-8"))
    if miss:  # no line times when lines are missing: the sing-along falls back to proportional scrolling
        cur.pop("sync", None); print(f"  WARNING kept best take with {len(miss)} line(s) not sung — listen to it: {miss}", flush=True)
    else:
        cur["sync"] = [round(a[2], 2) for a in aligned]
    open(p, "w", encoding="utf-8").write(json.dumps(cur, ensure_ascii=False, indent=2) + "\n")
    return dst


def encode(src, dst):
    """80 kbps, 44.1 kHz, loudness-normalised (every song plays at the same volume) -> ~0.6 MB/min."""
    tmp = dst + ".tmp.mp3"
    subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ar", "44100", "-b:a", "80k", tmp], check=True)
    os.replace(tmp, dst)


def games_with_songs():
    games = json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8"))
    return games, [g for g in games if os.path.exists(os.path.join(ROOT, "games", g["id"], "assets", "lagu.json"))]


def sync_games_json():
    """games.json "song" = the song title when lagu.mp3 exists (the hub reads it; tools/build.py checks it)."""
    games, _ = games_with_songs()
    for g in games:
        a = os.path.join(ROOT, "games", g["id"], "assets")
        if os.path.exists(os.path.join(a, "lagu.mp3")) and os.path.exists(os.path.join(a, "lagu.json")):
            g["song"] = json.load(open(os.path.join(a, "lagu.json"), encoding="utf-8"))["title"]
        else:
            g.pop("song", None)
    open(os.path.join(ROOT, "games.json"), "w", encoding="utf-8").write(json.dumps(games, ensure_ascii=False, indent=2) + "\n")


def check():
    _, todo = games_with_songs(); bad = 0
    for g in todo:
        gid, song = load("games/" + g["id"]); a = os.path.join(ROOT, "games", gid, "assets", "lagu.mp3")
        miss = [k for k in ("title", "style", "lyrics") if not song.get(k)] + ([] if song.get("style") in STYLES else ["unknown style"])
        secs = [l for l in song["lyrics"].split("\n") if l.startswith("[")]
        if not secs or any(not re.fullmatch(r"\[(Verse \d|Chorus|Bridge|Outro|Intro)\]", s) for s in secs):
            miss.append("bad [section] tags")
        p = problems(a, song) if os.path.exists(a) else ["no lagu.mp3"]
        if miss or p:
            bad += 1; print(f"{gid}: {'; '.join(miss + p)}")
    print(f"checked {len(todo)} songs, {bad} with problems")
    return bad


if __name__ == "__main__":
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opt = lambda k: next((a.split("=", 1)[1] for a in flags if a.startswith(f"--{k}=")), None)
    if "--check" in flags:
        sys.exit(1 if check() else 0)
    if not KEY and "acemusic.ai" in API:
        sys.exit("set ACEMUSIC_API_KEY first (free key: https://acemusic.ai/api-key)")
    if "--fix" in flags:  # remake songs whose singer skipped lines; a new take replaces the old only if it misses fewer
        import lyricsync
        _, todo = games_with_songs(); left = []
        ids = args or [g["id"] for g in todo]
        for gid in ids:
            miss, aligned = lyricsync.check(gid, quiet=True)
            if not miss:
                lyricsync.check(gid, write=True, quiet=True); print(f"{gid}: every line sung", flush=True); continue
            print(f"{gid}: {len(miss)} line(s) not sung -> remaking", flush=True)
            try:
                generate("games/" + gid, keep_if_missing=len(miss))
            except Exception as e:
                print("  FAILED:", e, flush=True)
            if lyricsync.check(gid, quiet=True)[0]:
                left.append(gid)
        print("still missing lines:", " ".join(left) or "none")
        sys.exit(1 if left else 0)
    if "--all" in flags:
        _, todo = games_with_songs(); failed = []
        todo = [g for g in todo if not os.path.exists(os.path.join(ROOT, "games", g["id"], "assets", "lagu.mp3"))]
        print(f"{len(todo)} songs to make", flush=True)
        for g in todo:
            try:
                generate("games/" + g["id"]); sync_games_json()
            except Exception as e:  # keep going: one bad song must not stop the batch
                failed.append(g["id"]); print("  FAILED:", e, flush=True)
        print("failed:", " ".join(failed) or "none")
        sys.exit(1 if failed else 0)
    out = generate(args[0], args[1] if len(args) > 1 else None, opt("style"), "--draft" in flags, "--melody" in flags, "--instrumental" in flags)
    print("saved", os.path.relpath(out, ROOT))
    if "--draft" not in flags:
        sync_games_json()
