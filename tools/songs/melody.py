"""Melody guide track from note text (our own rendering of a traditional tune: no recordings of other people used).

  python tools/songs/melody.py games/<id> | song.json   -> songs_draft/<id>/melodi.wav  (from "melody" in lagu.json)

lagu.json "melody": {"bpm": 90, "notes": "C4 C4 G4 G4 A4 A4 G4:2 | ...", "chords": "C C F C | ..."}
  notes: NOTE[octave][:beats], R = rest, '|' = bar line (ignored); chords: one per bar, played as a soft pad + bass.
Used as the reference audio for ACE-Step (make_song.py --melody) or as a karaoke backing track."""
import json, math, os, re, struct, sys, wave

RATE = 32000
SEMI = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
CHORD = {"": (0, 4, 7), "m": (0, 3, 7), "7": (0, 4, 7, 10)}


def freq(name):
    m = re.fullmatch(r"([A-G])([#b]?)(\d)", name)
    n = SEMI[m[1]] + {"#": 1, "b": -1, "": 0}[m[2]] + (int(m[3]) - 4) * 12
    return 440 * 2 ** (n / 12)


def parse(notes):
    out = []
    for tok in notes.replace("|", " ").split():
        name, _, beats = tok.partition(":")
        out.append((None if name.upper() == "R" else freq(name), float(beats or 1)))
    return out


def bell(f, t, dur):  # glockenspiel-ish: bright attack, exponential decay, a few partials
    if f is None:
        return 0.0
    env = min(1, t * 200) * math.exp(-3.2 * t / max(dur, 0.25)) * (1 if t < dur else max(0, 1 - (t - dur) * 20))
    return env * (math.sin(2 * math.pi * f * t) + 0.35 * math.sin(4 * math.pi * f * t) + 0.12 * math.sin(6 * math.pi * f * t))


def render(melody):
    bpm = melody.get("bpm", 90); beat = 60 / bpm
    notes = parse(melody["notes"])
    total = sum(b for _, b in notes) * beat + 1.0
    buf = [0.0] * int(total * RATE)
    t0 = 0.0
    for f, b in notes:
        dur = b * beat; i0 = int(t0 * RATE)
        for i in range(int((dur + 0.05) * RATE)):
            if i0 + i < len(buf):
                buf[i0 + i] += 0.5 * bell(f, i / RATE, dur)
        t0 += dur
    if melody.get("chords"):  # soft pad: root (bass, octave 2) + triad (octave 3), one chord per 4-beat bar
        bar = 4 * beat
        for k, ch in enumerate(melody["chords"].replace("|", " ").split()):
            m = re.fullmatch(r"([A-G][#b]?)(m|7)?", ch); root = freq(m[1] + "3")
            tones = [root / 2] + [root * 2 ** (s / 12) for s in CHORD[m[2] or ""]]
            i0 = int(k * bar * RATE)
            for i in range(int(bar * RATE)):
                if i0 + i >= len(buf):
                    break
                t = i / RATE; env = min(1, t * 8) * min(1, (bar - t) * 8)
                buf[i0 + i] += 0.07 * env * sum(math.sin(2 * math.pi * f * t) for f in tones)
    peak = max(1e-9, max(abs(x) for x in buf))
    return [x / peak * 0.85 for x in buf]


def save(samples, path):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(x * 32767)) for x in samples))


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        assert abs(freq("A4") - 440) < 1e-9 and abs(freq("C4") - 261.63) < 0.01 and abs(freq("C#5") - 554.37) < 0.01
        s = render({"bpm": 120, "notes": "C4 E4 G4:2 | R C5"})
        assert abs(len(s) / RATE - (6 * 0.5 + 1)) < 0.01 and max(abs(x) for x in s) <= 0.85 + 1e-9
        print("melody selftest: all passed"); sys.exit()
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
    arg = sys.argv[1]
    if arg.endswith(".json"):  # a song not yet in a game
        gid, song = os.path.splitext(os.path.basename(arg))[0], json.load(open(arg, encoding="utf-8"))
    else:
        gid = os.path.basename(os.path.normpath(arg))
        song = json.load(open(os.path.join(root, "games", gid, "assets", "lagu.json"), encoding="utf-8"))
    out = os.path.join(root, "songs_draft", gid); os.makedirs(out, exist_ok=True)
    save(render(song["melody"]), os.path.join(out, "melodi.wav"))
    print("saved", os.path.relpath(os.path.join(out, "melodi.wav"), root))
