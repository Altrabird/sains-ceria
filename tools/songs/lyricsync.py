"""Did the AI singer sing every lyric line, and when? Whisper (faster-whisper, GPU if available) transcribes the song with
word times; each lyric line is matched in order (fuzzy, so 'Pencil' still matches 'Pensel'). Gives:
  - missing lines (the singer skipped or garbled them) -> make_song.py rejects the take
  - "sync": start time (s) of every lyric line -> shared/lagu.js highlights the line being sung in 🎤 Mod nyanyi

  python tools/songs/lyricsync.py                 report every song (games/*/assets/lagu.mp3)
  python tools/songs/lyricsync.py T1-U07-magnet   one or more ids
  python tools/songs/lyricsync.py --write         also store "sync" in lagu.json when every line was found
pip install faster-whisper rapidfuzz nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*" imageio-ffmpeg
Self-check: python tools/songs/lyricsync.py --selftest"""
import glob, json, os, re, site, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
_models = None
# Three listeners: each mishears different sung words ("lengkap dalam" heard as "lengkap jalan" by medium only), so a line
# counts as sung if ANY of them heard it. A really wrong word (tolak sung as tarik) is heard wrong by all three.
LISTENERS = ("medium", "small", "large-v3")  # timing from the first that heard the line (large-v3 last: it hallucinates on music)


def models():
    global _models
    if _models is None:
        for d in glob.glob(os.path.join(site.getsitepackages()[-1], "nvidia", "*", "bin")):  # pip CUDA libs (cuBLAS, cuDNN)
            os.add_dll_directory(d); os.environ["PATH"] = d + os.pathsep + os.environ["PATH"]
        from faster_whisper import WhisperModel
        try:
            _models = [WhisperModel(n, device="cuda", compute_type="float16") for n in LISTENERS]
        except Exception:  # no GPU: one CPU listener (slower, a few more false "missing")
            _models = [WhisperModel("medium", device="cpu", compute_type="int8")]
    return _models


model = lambda: models()[0]


def samples(path):
    import imageio_ffmpeg, numpy as np
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


ONES = "kosong satu dua tiga empat lima enam tujuh lapan sembilan".split()


def malay_number(n):
    """24 -> 'dua puluh empat', 365 -> 'tiga ratus enam puluh lima' (Whisper writes sung numbers as digits)"""
    if n < 10: return ONES[n]
    if n == 10: return "sepuluh"
    if n == 11: return "sebelas"
    if n < 20: return ONES[n - 10] + " belas"
    if n < 100: return ONES[n // 10] + " puluh" + (" " + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ("seratus" if n // 100 == 1 else ONES[n // 100] + " ratus") + (" " + malay_number(n % 100) if n % 100 else "")
    if n < 10000: return ("seribu" if n // 1000 == 1 else ONES[n // 1000] + " ribu") + (" " + malay_number(n % 1000) if n % 1000 else "")
    return str(n)


def norm(s):
    s = re.sub(r"\d+", lambda m: " " + malay_number(int(m[0])) + " ", s.lower())
    return re.sub(r"[^a-z ]+", " ", s).split()


def lines_of(lyrics):
    """sung lines in order (section tags dropped, choruses repeated as written)"""
    return [l.strip() for l in lyrics.split("\n") if l.strip() and not l.strip().startswith("[")]


def words_of(path, m=None):
    # no initial_prompt and no conditioning on earlier text: both made Whisper hallucinate ("selamat malam...") on music
    segs, _ = (m or model()).transcribe(samples(path), language="ms", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    return [(w2, w.start, w.end) for s in segs for w in (s.words or []) for w2 in norm(w.word)]


def listen(lines, path):
    """align with every listener; a line is sung if any heard it (time from the first listener that did, kept in order)"""
    runs = [align(lines, words_of(path, m)) for m in models()]
    out, last = [], 0.0
    for i, line in enumerate(lines):
        hit = next((r[i] for r in runs if r[i][2] is not None), None)
        if hit is None:
            out.append((line, 0.0, None, None)); continue
        st = max(hit[2], last + 0.1)  # listeners' clocks differ slightly: never let a line start before the previous one
        out.append((line, hit[1], st, max(hit[3], st))); last = st
    return out


WORD_OK, LINE_OK = 64, 75  # every lyric word >= 64 like its sung word (pensel~pencil 67 passes, tolak~tarik 60 fails), mean >= 75


def line_score(lyric, heard):
    """word-by-word alignment (edit distance with fuzzy word similarity). A skipped or different word sinks the line;
    a dropped short word (dan, di, oh...) is forgiven because Whisper often misses them in singing."""
    from rapidfuzz import fuzz
    a, b = lyric, heard
    n, m = len(a), len(b)
    gap = lambda w: 0 if len(w) > 3 else 70
    S = [[0.0] * (m + 1) for _ in range(n + 1)]; P = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        S[i][0] = S[i - 1][0] + gap(a[i - 1]); P[i][0] = (i - 1, 0, gap(a[i - 1]))
    for j in range(1, m + 1):
        S[0][j] = S[0][j - 1] - 10; P[0][j] = (0, j - 1, None)  # extra heard words cost a little
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            r = fuzz.ratio(a[i - 1], b[j - 1])
            S[i][j], P[i][j] = max((S[i - 1][j - 1] + r, (i - 1, j - 1, r)), (S[i - 1][j] + gap(a[i - 1]), (i - 1, j, gap(a[i - 1]))),
                                   (S[i][j - 1] - 10, (i, j - 1, None)), key=lambda t: t[0])
    per, i, j = [], n, m
    while i or j:
        pi, pj, r = P[i][j]
        if r is not None and pi == i - 1:
            per.append(r)
        i, j = pi, pj
    word_ok = bool(per) and min(per) >= WORD_OK and sum(per) / len(per) >= LINE_OK
    # second chance at letter level, ignoring word boundaries ("kemas teratur" heard as "ke masteratur"), but every
    # content word must still be there: catches tolak->tarik (60) while letting dilip/bilik and pencil/pensel pass
    ja, jb = "".join(a), "".join(b)
    char = fuzz.ratio(ja, jb)
    char_ok = char >= 78 and all(fuzz.partial_ratio(w, jb) >= WORD_OK for w in a if len(w) >= 4)
    return word_ok or char_ok, max(sum(per) / len(per) if per else 0.0, char if char_ok else 0.0)


def align(lines, words):
    """-> [(line, score, start, end) ...]; start None = the line was not sung (or sung wrong).
    Global, in order: dynamic programming picks the placement of all lines that maximises total score
    (a greedy search would jump to a later repeat of a chorus and lose everything in between)."""
    from rapidfuzz import fuzz
    W = [w for w, _, _ in words]; L = len(lines)
    cands = []  # per line: [(start, end, score)] of word spans that pass
    for line in lines:
        t = norm(line); n = len(t); tj = " ".join(t); c = {}
        for i in range(len(W)):
            for k in range(max(1, n - 2), n + 3):
                if i + k > len(W) or fuzz.ratio(tj, " ".join(W[i:i + k])) < 50:
                    continue
                ok, sc = line_score(t, W[i:i + k])
                if ok and sc > c.get(i, (0, 0))[1]:
                    c[i] = (i + k, sc)
        cands.append([(i, j, sc) for i, (j, sc) in c.items()])
    # dp[l][p] = best total for lines[:l] using words[:p]
    NEG = float("-inf"); Wn = len(W)
    dp = [[NEG] * (Wn + 1) for _ in range(L + 1)]; back = [[None] * (Wn + 1) for _ in range(L + 1)]
    dp[0] = [0.0] * (Wn + 1)
    for l in range(1, L + 1):
        ends = {}
        for i, j, sc in cands[l - 1]:
            if dp[l - 1][i] > NEG and dp[l - 1][i] + sc > ends.get(j, (NEG,))[0]:
                ends[j] = (dp[l - 1][i] + sc, (i, j, sc))
        for p in range(Wn + 1):
            best = (dp[l - 1][p], ("skip", p))  # line l-1 not sung
            if p and dp[l][p - 1] > best[0]:
                best = (dp[l][p - 1], ("carry", p - 1))
            if p in ends and ends[p][0] > best[0]:
                best = (ends[p][0], ("use",) + ends[p][1])
            dp[l][p], back[l][p] = best
    out, l, p = [None] * L, L, Wn
    while l:
        b = back[l][p]
        if b[0] == "carry":
            p = b[1]; continue
        if b[0] == "skip":
            out[l - 1] = (lines[l - 1], 0.0, None, None)
        else:
            _, i, j, sc = b
            # Whisper can stretch a line's first word back over an instrumental intro/gap: a sung line lasts at most
            # ~0.8 s per word + 1.5 s, so trust the line's end and cap its length
            st = max(words[i][1], words[j - 1][2] - (0.8 * (j - i) + 1.5))
            out[l - 1] = (lines[l - 1], sc, st, words[j - 1][2]); p = i
        l -= 1
    return out


def check(gid, path=None, write=False, quiet=False):
    """-> list of missing lines ([] = every line sung)"""
    a = os.path.join(ROOT, "games", gid, "assets"); song = json.load(open(os.path.join(a, "lagu.json"), encoding="utf-8"))
    res = listen(lines_of(song["lyrics"]), path or os.path.join(a, "lagu.mp3"))
    missing = [l for l, sc, st, _ in res if st is None]
    if not quiet:
        print(f"{gid}: {len(res) - len(missing)}/{len(res)} lines sung" + ("".join(f"\n   MISSING: {l}" for l in missing)), flush=True)
    if write and not missing and path is None:
        song["sync"] = [round(st, 2) for _, _, st, _ in res]
        open(os.path.join(a, "lagu.json"), "w", encoding="utf-8").write(json.dumps(song, ensure_ascii=False, indent=2) + "\n")
    return missing, res


def selftest():
    ok = lambda l, h: line_score(norm(l), norm(h))[0]
    assert ok("Pensel oh pensel, kenapa kau tak lekat?", "pencil oh pencil kenapa kau tak lekat")      # misheard word: fine
    assert ok("Macam mana aku tak rapat, ada magnet di situ", "macam mana aku tak rapat ada net di situ")
    assert not ok("Macam mana aku tak tolak, kutub kita sama", "macam mana aku tak tarik kutub kita bersama")  # wrong words
    assert not ok("Objek besi boleh berkarat", "objek besi")                                        # half a line
    assert ok("Bilik sains kemas teratur", "dilip sains ke masteratur")                             # split words
    assert ok("Saintis cilik, saintis cilik", "santis jilip santis jilip")
    assert ok("Dua puluh empat jam sehari", "24 jam sehari") and ok("Tiga ratus enam puluh lima", "365")  # digits
    assert not ok("Guna penyauk dengan cermat", "gunak penyawak") and not ok("Bumi beredar mengelilingi Matahari", "bumi beredar mengelip")
    w = [(t, i, i + .5) for i, t in enumerate("air dan udara punca pengaratan cat dan gris air dan udara punca pengaratan".split())]
    res = align(["Air dan udara", "Punca pengaratan", "Cat dan gris", "Air dan udara", "Punca pengaratan"], w)
    assert [r[2] for r in res] == [0, 3, 5, 8, 11], res   # repeated chorus: each copy placed in order, nothing lost
    res = align(["Air dan udara", "Perang kemerahan", "Punca pengaratan"], w)
    assert res[1][2] is None and res[2][2] == 3, res      # a skipped line is reported, the rest still placed
    w = [("graviti", 0.0, 0.4), ("menarik", 12.6, 13.1), ("objek", 13.2, 13.9)]  # first word stuck at 0 s by Whisper
    assert align(["Graviti menarik objek"], w)[0][2] >= 10, align(["Graviti menarik objek"], w)
    print("lyricsync selftest: all passed")


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        selftest(); sys.exit()
    ids = [a for a in sys.argv[1:] if not a.startswith("--")] or sorted(
        os.path.basename(os.path.dirname(os.path.dirname(p))) for p in glob.glob(os.path.join(ROOT, "games", "*", "assets", "lagu.mp3")))
    bad = [g for g in ids if check(g, write="--write" in sys.argv)[0]]
    print(f"{len(ids) - len(bad)}/{len(ids)} songs sing every line" + (f"; missing lines in: {' '.join(bad)}" if bad else ""))
    sys.exit(1 if bad else 0)
