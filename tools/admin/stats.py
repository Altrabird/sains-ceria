"""Sums the anonymous beacons (shared/track.js -> nginx /b -> /var/log/edugames/events.log*) into stats.json for /admin/.

  On the VPS (cron, every 10 min):  python3 /opt/edugames/stats.py /var/log/edugames /var/www/edugames-admin/stats.json /var/www/edugames/games.json
  Writes next to stats.json: recent.json (latest 300 events, the admin activity log), events.csv (every event, for Excel)
  and public.json (totals only: the hub's visitor counter, served without a password at /kiraan.json).
  Self-check:                        python tools/admin/stats.py --selftest

Log line = "<time_iso8601>\\t<query string>\\t<user agent>" (nginx log_format sains_ev). Times are shown in Malaysia time."""
import glob, gzip, json, os, statistics, sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qsl

MYT = timezone(timedelta(hours=8))


def lines(folder):
    # ponytail: re-reads every log each run (~1 s per 100 MB); keep a running total if the logs ever reach GBs
    for f in sorted(glob.glob(os.path.join(folder, "events.log*"))):
        with (gzip.open if f.endswith(".gz") else open)(f, "rt", encoding="utf-8", errors="replace") as fh:
            yield from fh


def parse(line):
    try:
        t, args, ua = line.rstrip("\n").split("\t", 2)
        e = dict(parse_qsl(args))
        e["_t"], e["_ua"] = datetime.fromisoformat(t).astimezone(MYT), ua
        return e if "e" in e and "d" in e else None
    except ValueError:
        return None


def device(ua):
    if "iPad" in ua or ("Android" in ua and "Mobile" not in ua):
        return "Tablet"
    if "Android" in ua or "iPhone" in ua:
        return "Phone"
    if "CrOS" in ua:
        return "Chromebook"
    return "Computer" if any(k in ua for k in ("Windows", "Macintosh", "Linux")) else "Other"


def num(e, k):
    try:
        return int(float(e.get(k) or 0))
    except ValueError:
        return 0


def med(xs):
    return round(statistics.median(xs)) if xs else None


def p90(xs):
    return sorted(xs)[min(len(xs) - 1, int(len(xs) * 0.9))] if xs else None


def summarize(evs, games, now=None):
    now = now or datetime.now(MYT)
    meta = {g["id"]: g for g in games}
    days = defaultdict(lambda: {"devices": set(), "views": 0, "starts": 0, "done": 0})
    dev_days, sessions = defaultdict(set), set()
    hours, weekdays = [0] * 24, [0] * 7
    G = defaultdict(lambda: {"devices": set(), "opens": 0, "starts": 0, "done": 0, "times": []})
    L = defaultdict(lambda: {"starts": 0, "done": 0, "quits": 0, "resets": 0, "times": [], "quitAt": Counter(), "stepT": defaultdict(list)})
    platform, kind, inputs = Counter(), Counter(), Counter()
    cam = {"levels": 0, "denied": 0, "weak": 0, "det": [], "fps": [], "res": Counter()}
    heat = defaultdict(Counter)
    songs = defaultdict(lambda: {"plays": 0, "devices": set(), "where": Counter()})
    for e in evs:
        t, k, g, l = e["_t"], e["e"], e.get("g"), e.get("l")
        day = days[t.date().isoformat()]
        day["devices"].add(e["d"]); dev_days[e["d"]].add(t.date()); sessions.add(e.get("s"))
        if k == "v":
            day["views"] += 1; hours[t.hour] += 1; weekdays[t.weekday()] += 1
            platform["Android app" if e.get("a") == "1" else "Web"] += 1; kind[device(e["_ua"])] += 1
            if g:
                G[g]["devices"].add(e["d"])
                G[g]["opens"] += e.get("p") == "menu"
        elif k == "ls":
            day["starts"] += 1; G[g]["starts"] += 1; L[g, l]["starts"] += 1
        elif k == "st":
            L[g, l]["stepT"][num(e, "i")].append(num(e, "t"))
        elif k == "r":
            L[g, l]["resets"] += 1
        elif k == "s":  # a song started (shared/lagu.js); p = menu (game page) or lagu (Lagu Sains page)
            songs[g]["plays"] += 1; songs[g]["devices"].add(e["d"]); songs[g]["where"][e.get("p", "")] += 1
        elif k in ("ld", "q"):
            lv, tt = L[g, l], num(e, "t")
            im, it, ih = num(e, "im"), num(e, "it"), num(e, "ih")
            if k == "ld":
                day["done"] += 1; G[g]["done"] += 1; lv["done"] += 1; lv["times"].append(tt); G[g]["times"].append(tt)
                inputs["Hand gestures" if ih and ih >= im + it else "Hand + mouse/touch" if ih else "Mouse" if im >= it else "Touch"] += 1
            else:
                lv["quits"] += 1; lv["quitAt"][num(e, "i")] += 1
            if e.get("c") in ("ok", "no"):  # play mode (camera asked for)
                cam["levels"] += 1; cam["denied"] += e["c"] == "no"; cam["weak"] += e.get("wk") == "1"
                if ih and e.get("det"):
                    cam["det"].append(num(e, "det"))
                if e.get("fps"):
                    cam["fps"].append(num(e, "fps"))
                if e.get("r"):
                    cam["res"][e["r"]] += 1
        elif k == "c":
            try:
                x, y, w = float(e["x"]), float(e["y"]), int(e["w"])
            except (KeyError, ValueError):
                continue
            page = "hub" if e.get("p") == "hub" else f"{g}|{l}" if e.get("p") == "lvl" else f"{g}|menu"
            size = "phone" if w < 700 else "tablet" if w < 1100 else "desktop"
            heat[f"{page}|{size}"][f"{int(x * 50)},{int(y * 50)}"] += 1

    today = now.date()
    recent = lambda n: len({d for d, ds in dev_days.items() if any((today - x).days < n for x in ds)})
    daily = []
    for i in range(59, -1, -1):
        d = (today - timedelta(days=i)).isoformat(); v = days.get(d)
        daily.append({"d": d, "devices": len(v["devices"]) if v else 0, **({k: v[k] for k in ("views", "starts", "done")} if v else {"views": 0, "starts": 0, "done": 0})})
    title = lambda g: meta.get(g, {}).get("title", g)
    games_out = sorted(({"id": g, "title": title(g), "year": meta.get(g, {}).get("year"), "unit": meta.get(g, {}).get("unit"),
                         "devices": len(v["devices"]), "opens": v["opens"], "starts": v["starts"], "done": v["done"], "medT": med(v["times"])}
                        for g, v in G.items() if g), key=lambda r: -r["starts"])
    levels_out = []
    for (g, l), v in sorted(L.items(), key=lambda kv: (kv[0][0] or "", kv[0][1] or "")):
        stepT = {i: med(ts) for i, ts in sorted(v["stepT"].items())}
        levels_out.append({"g": g, "title": title(g), "l": l, "starts": v["starts"], "done": v["done"], "quits": v["quits"], "resets": v["resets"],
                           "medT": med(v["times"]), "p90T": p90(v["times"]), "quitAt": dict(sorted(v["quitAt"].items())), "stepT": stepT})
    years = Counter()
    for g in games_out:
        years[g["year"] or 0] += g["starts"]
    return {
        "generated": now.isoformat(timespec="minutes"),
        "totals": {"devices": len(dev_days), "devices7": recent(7), "devicesToday": recent(1), "returning": sum(len(v) > 1 for v in dev_days.values()),
                   "sessions": len(sessions), "views": sum(d["views"] for d in days.values()),
                   "starts": sum(g["starts"] for g in games_out), "done": sum(g["done"] for g in games_out)},
        "daily": daily, "hours": hours, "weekdays": weekdays, "years": {str(k): v for k, v in sorted(years.items())},
        "games": games_out, "levels": levels_out,
        "songs": sorted(({"id": g, "title": title(g), "song": meta.get(g, {}).get("song", ""), "year": meta.get(g, {}).get("year"),
                          "plays": v["plays"], "devices": len(v["devices"]), "fromMenu": v["where"]["menu"], "fromSongs": v["where"]["lagu"]}
                         for g, v in songs.items() if g), key=lambda r: -r["plays"]),
        "platform": dict(platform), "devices": dict(kind), "inputs": dict(inputs),
        "camera": {"levels": cam["levels"], "denied": cam["denied"], "weak": cam["weak"], "medDet": med(cam["det"]), "medFps": med(cam["fps"]),
                   "lowFps": sum(f < 12 for f in cam["fps"]), "res": dict(cam["res"].most_common(8))},
        "heat": {k: dict(v) for k, v in heat.items()},
    }


def selftest():
    T = "2026-10-05T09:15:00+00:00"
    log = [f"{T}\te=v&d=a&s=1&a=0&p=hub\tMozilla (Linux; Android 13; SM-T220)",
           f"{T}\te=v&d=a&s=1&p=lvl&g=G1&l=L1\tAndroid",
           f"{T}\te=ls&d=a&s=1&p=lvl&g=G1&l=L1\tAndroid",
           f"{T}\te=st&d=a&s=1&p=lvl&g=G1&l=L1&i=1&t=20\tAndroid",
           f"{T}\te=ld&d=a&s=1&p=lvl&g=G1&l=L1&t=40&im=0&it=0&ih=6&c=ok&det=70&fps=20&r=640x480\tAndroid",
           f"{T}\te=ls&d=b&s=2&p=lvl&g=G1&l=L1\tWindows",
           f"{T}\te=q&d=b&s=2&p=lvl&g=G1&l=L1&i=1&t=90&c=no\tWindows",
           f"{T}\te=c&d=b&s=2&p=hub&x=0.5&y=0.21&w=1280\tWindows",
           f"{T}\te=s&d=b&s=2&g=G1&p=lagu\tWindows",
           "garbage line", f"{T}\tno-event\tx"]
    s = summarize(filter(None, map(parse, log)), [{"id": "G1", "title": "Magnet", "year": 1, "song": "Paku Oh Paku"}], datetime(2026, 10, 5, 20, tzinfo=MYT))
    assert s["songs"] == [{"id": "G1", "title": "Magnet", "song": "Paku Oh Paku", "year": 1, "plays": 1, "devices": 1, "fromMenu": 0, "fromSongs": 1}], s["songs"]
    assert s["totals"] == {"devices": 2, "devices7": 2, "devicesToday": 2, "returning": 0, "sessions": 2, "views": 2, "starts": 2, "done": 1}, s["totals"]
    lv = s["levels"][0]
    assert (lv["starts"], lv["done"], lv["quits"], lv["medT"], lv["quitAt"], lv["stepT"]) == (2, 1, 1, 40, {1: 1}, {1: 20}), lv
    assert s["inputs"] == {"Hand gestures": 1} and s["camera"]["denied"] == 1 and s["camera"]["medDet"] == 70, s["camera"]
    assert s["devices"] == {"Tablet": 2} and s["heat"] == {"hub|desktop": {"25,10": 1}} and s["years"] == {"1": 2}
    assert s["hours"][17] == 2 and s["daily"][-1]["done"] == 1  # 09:15 UTC = 17:15 Malaysia
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        data, recent, public = write_all(list(filter(None, map(parse, log))), [{"id": "G1", "title": "Magnet", "year": 1, "unit": 7}],
                                         os.path.join(d, "stats.json"), datetime(2026, 10, 5, 20, tzinfo=MYT))
        assert set(data["ranges"]) == {"all", "30", "7", "1"} and data["ranges"]["1"]["totals"]["devices"] == 2
        assert recent[0]["peristiwa"] == "Main lagu" and all(r["peristiwa"] != "Ketik" for r in recent) and recent[1]["peristiwa"] == "Keluar awal" and recent[1]["permainan"] == "Magnet" and recent[-1]["halaman"] == "Hub"
        assert public == {"pelawat": 2, "paparan": 2, "tahap_dimainkan": 2, "lagu_dimainkan": 1, "dikemas_kini": "2026-10-05T20:00+08:00"}, public
        csv_text = open(os.path.join(d, "events.csv"), encoding="utf-8-sig").read().splitlines()
        assert csv_text[0].startswith("masa,peristiwa") and len(csv_text) == 10, len(csv_text)  # header + 9 events
    print("stats selftest: all passed")


EVENT = {"v": "Buka halaman", "ls": "Mula tahap", "st": "Langkah selesai", "ld": "Tahap selesai", "q": "Keluar awal",
         "r": "Ulang tahap", "c": "Ketik", "s": "Main lagu"}
PAGE = {"hub": "Hub", "menu": "Menu permainan", "lvl": "Tahap", "lagu": "Lagu Sains"}
CSV_COLS = ["masa", "peristiwa", "halaman", "tahun", "unit", "permainan", "tahap", "peranti", "app", "id_peranti", "sesi", "saat",
            "langkah", "klik_tetikus", "sentuh", "tangan", "kamera", "kamera_lemah", "resolusi", "tangan_dikesan_pct", "fps", "x", "y", "lebar"]


def row(e, meta):
    g = meta.get(e.get("g"), {})
    return {"masa": e["_t"].strftime("%Y-%m-%d %H:%M:%S"), "peristiwa": EVENT.get(e["e"], e["e"]), "halaman": PAGE.get(e.get("p", ""), e.get("p", "")),
            "tahun": g.get("year", ""), "unit": g.get("unit", ""), "permainan": g.get("title", e.get("g", "")), "tahap": e.get("l", ""),
            "peranti": device(e["_ua"]), "app": "Android" if e.get("a") == "1" else "Web", "id_peranti": e["d"][:4], "sesi": e.get("s", "")[:4],
            "saat": e.get("t", ""), "langkah": e.get("i", ""), "klik_tetikus": e.get("im", ""), "sentuh": e.get("it", ""), "tangan": e.get("ih", ""),
            "kamera": {"ok": "ya", "no": "tiada/disekat", "pv": "tanpa kamera"}.get(e.get("c", ""), ""), "kamera_lemah": e.get("wk", ""),
            "resolusi": e.get("r", ""), "tangan_dikesan_pct": e.get("det", ""), "fps": e.get("fps", ""), "x": e.get("x", ""), "y": e.get("y", ""), "lebar": e.get("w", "")}


def write_all(evs, games, out, now=None):
    """stats.json (one summary per period), recent.json, events.csv, public.json — each written atomically"""
    import csv, io
    now = now or datetime.now(MYT); meta = {g["id"]: g for g in games}
    evs = sorted(evs, key=lambda e: e["_t"])
    since = lambda days: [e for e in evs if (now.date() - e["_t"].date()).days < days]
    data = {"generated": now.isoformat(timespec="minutes"),
            "ranges": {k: summarize(v, games, now) for k, v in (("all", evs), ("30", since(30)), ("7", since(7)), ("1", since(1)))}}
    recent = [row(e, meta) for e in evs if e["e"] != "c"][-300:][::-1]  # taps are for the heat map, not the log
    buf = io.StringIO(); w = csv.DictWriter(buf, CSV_COLS); w.writeheader(); w.writerows(row(e, meta) for e in evs)
    a = data["ranges"]["all"]["totals"]
    public = {"pelawat": a["devices"], "paparan": a["views"], "tahap_dimainkan": a["starts"],
              "lagu_dimainkan": sum(x["plays"] for x in data["ranges"]["all"]["songs"]), "dikemas_kini": data["generated"]}
    folder = os.path.dirname(os.path.abspath(out))
    for name, text in ((os.path.basename(out), json.dumps(data, ensure_ascii=False, separators=(",", ":"))),
                       ("recent.json", json.dumps(recent, ensure_ascii=False, separators=(",", ":"))),
                       ("events.csv", "﻿" + buf.getvalue()),  # BOM: Excel opens UTF-8 Malay text correctly
                       ("public.json", json.dumps(public, ensure_ascii=False))):
        tmp = os.path.join(folder, name + ".tmp")
        with open(tmp, "w", encoding="utf-8", newline="") as fh:
            fh.write(text)
        os.replace(tmp, os.path.join(folder, name))  # the admin page never reads a half-written file
    return data, recent, public


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        selftest(); sys.exit()
    folder, out, games_json = sys.argv[1:4]
    try:
        games = json.load(open(games_json, encoding="utf-8"))
    except (OSError, ValueError):
        games = []
    write_all(list(filter(None, map(parse, lines(folder)))), games, out)
