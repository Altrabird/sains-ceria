"""Pre-record the guided-step narration in Malaysian Malay (Microsoft neural voice ms-MY-YasminNeural) so every
device plays the same Malaysian accent, offline. Only re-records lines whose text changed.
Usage: python tools/make_audio.py [--voice ms-MY-OsmanNeural]   (needs: pip install edge-tts, internet once)
Output: assets/audio/<AMxx>_<q|s1..|k>.mp3 + assets/audio/manifest.json {key: spoken text}"""
import asyncio, json, os, re, sys
import edge_tts

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(ROOT, "assets", "audio")
VOICE = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else "ms-MY-YasminNeural"
EMOJI = re.compile(r"[\U0001F000-\U0001FFFF☀-➿️]")


def spoken(text):
    return EMOJI.sub("", text).replace("—", ",").strip()


def lines():
    # MUST match the text shared/guide.js asks for (guide.test.mjs checks the keys exist)
    steps = json.load(open(os.path.join(ROOT, "assets", "steps.json"), encoding="utf-8"))
    for am, s in steps.items():
        if not am.startswith("AM"):
            continue
        yield f"{am}_q", "Soalan. " + s["q"]
        for i, st in enumerate(s["steps"], 1):
            yield f"{am}_s{i}", f"Langkah {i}. " + st["t"]
        yield f"{am}_k", "Tahniah! Kesimpulan. " + s["k"]


async def main():
    os.makedirs(OUT, exist_ok=True)
    man_path = os.path.join(OUT, "manifest.json")
    man = json.load(open(man_path, encoding="utf-8")) if os.path.exists(man_path) else {}
    want = {k: spoken(t) for k, t in lines()}
    made = 0
    for key, text in want.items():
        f = os.path.join(OUT, key + ".mp3")
        if man.get(key) == text and os.path.exists(f) and man.get("_voice") == VOICE:
            continue
        await edge_tts.Communicate(text, VOICE, rate="-8%").save(f)
        made += 1
        print("rec", key, text[:60])
    for stale in set(man) - set(want) - {"_voice"}:  # removed steps
        try:
            os.remove(os.path.join(OUT, stale + ".mp3"))
        except FileNotFoundError:
            pass
    want["_voice"] = VOICE
    json.dump(want, open(man_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{made} recorded, {len(want) - 1} lines total, voice {VOICE}")


asyncio.run(main())
