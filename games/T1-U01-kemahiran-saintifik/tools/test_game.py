"""Plays every level headless the way a pupil would: real mouse drags/taps (and simulated hands for L1 + L4),
then checks the guided steps reached the end with no JS errors. Usage: python tools/test_game.py [out_dir]"""
import os, sys, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
WEB = "/games/" + os.path.basename(ROOT)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "tools", "_test")
os.makedirs(OUT, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails, errors = [], []


def check(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name, extra)
    if not ok:
        fails.append(name)


def pos(pg, name, dy=0):
    p = pg.evaluate("([n, d]) => window.screenOf(n, d)", [name, dy])
    return p["x"], p["y"]


def drag(pg, a, b, steps=25, pause=16):
    pg.mouse.move(*a); pg.mouse.down()
    for i in range(1, steps + 1):  # paced like a real hand (the fish level punishes teleporting)
        pg.mouse.move(a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps); pg.wait_for_timeout(pause)
    pg.mouse.up(); pg.wait_for_timeout(600)


def info(pg):
    return pg.inner_text("#info")


def guide(pg):
    return pg.inner_text("#guide .prog")


def open_level(pg, lv, extra=""):
    pg.goto(f"http://127.0.0.1:{srv.server_port}{WEB}/?preview={lv}{extra}")
    pg.wait_for_function("window.gameReady === true", timeout=20000); pg.wait_for_timeout(500)


HAND = """async ([g, x, y, secs]) => { const { synthHand } = await import('/shared/hands.js');
  const t0 = performance.now(); while (performance.now() - t0 < secs * 1000) {
    window.feedHand(synthHand(g, 1 - x / innerWidth, y / innerHeight)); await new Promise(r => setTimeout(r, 33)); } }"""


def hand(pg, g, at, secs=0.3):
    pg.evaluate(HAND, [g, at[0], at[1], secs])


with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"])
    pg = b.new_page(viewport={"width": 1280, "height": 720})
    pg.on("pageerror", lambda e: errors.append(str(e)))

    # ---- L1: wrong pad bounces back, then all five senses, then the magnifier
    open_level(pg, "L1")
    drag(pg, pos(pg, "daun"), pos(pg, "pad_telinga"))
    check("L1 wrong sense rejected", "Cuba lagi" in info(pg) and guide(pg) == "0/2")
    for obj, pad in [("daun", "mata"), ("jam", "telinga"), ("ais", "tangan"), ("bunga", "hidung"), ("aiskrim", "lidah")]:
        drag(pg, pos(pg, obj), pos(pg, "pad_" + pad))
    check("L1 five senses matched", guide(pg) == "1/2", guide(pg))
    pg.wait_for_timeout(600)
    drag(pg, pos(pg, "kanta"), pos(pg, "daun"))
    check("L1 magnifier on leaf completes level", pg.evaluate("window.levelDone === true"))
    pg.screenshot(path=os.path.join(OUT, "L1.png"))

    # ---- L1 with hands: ✌️ grab the clock, carry to the ear pad, open hand to drop
    open_level(pg, "L1", "&handsim")
    a, z = pos(pg, "jam"), pos(pg, "pad_telinga")
    hand(pg, "two", a, 0.5)
    for i in range(1, 16):
        hand(pg, "two", (a[0] + (z[0] - a[0]) * i / 15, a[1] + (z[1] - a[1]) * i / 15), 0.04)
    hand(pg, "open", z, 0.4)
    pg.wait_for_timeout(600)
    check("L1 hand grab+drop matches clock to ear", "pendengaran" in info(pg), info(pg))

    # ---- L2: grabbing a fish by hand is refused; net catches, slow carry delivers, fast carry spills
    open_level(pg, "L2")
    pg.mouse.click(*pos(pg, "ikan1")); pg.wait_for_timeout(200)
    drag(pg, pos(pg, "ikan1"), pos(pg, "akuariumB", 0.1), steps=5)
    check("L2 fish cannot be grabbed by hand", "penyauk" in info(pg))

    def catch(pg):  # chase any fish still in tank A with the net held down
        for _ in range(60):
            free = pg.evaluate("""() => ['ikan1','ikan2','ikan3'].filter(n => {
                const f = window.level.root.getObjectByName(n); return f.parent === window.level.root && f.position.x < 0; })""")
            caught = pg.evaluate("() => window.level.root.getObjectByName('penyauk').children.some(c => /^ikan/.test(c.name))")
            if caught:
                return True
            if not free:
                return False
            pg.mouse.move(*pos(pg, free[0], 0.1 - pg.evaluate(f"window.level.root.getObjectByName('{free[0]}').position.y")))
            pg.wait_for_timeout(30)
        return False

    net0 = pos(pg, "penyauk")
    pg.mouse.move(*net0); pg.mouse.down(); pg.wait_for_timeout(50)
    caught = catch(pg)
    check("L2 net catches a fish", caught)
    bx = pos(pg, "akuariumB", 0.1)
    here = pg.evaluate("() => { const p = window.level.root.getObjectByName('penyauk').position; return window.screenAt(p.x, 0.1, p.z); }")
    # a fast shake in front of the tanks (~3 m/s); headless Chromium paints ~15 fps, so each move is one event
    front = pg.evaluate("() => [[-0.1, 0.1, 0.3], [0.05, 0.1, 0.32], [-0.1, 0.1, 0.34], [0.05, 0.1, 0.3], [-0.1, 0.1, 0.32], [0.05, 0.1, 0.34]].map(p => window.screenAt(...p))")
    for q in front:
        pg.mouse.move(q["x"], q["y"])
    pg.wait_for_timeout(100)
    check("L2 carrying too fast spills the fish", "laju" in info(pg), info(pg))
    pg.mouse.up(); pg.wait_for_timeout(700)
    for n in range(3):
        pg.mouse.move(*pos(pg, "penyauk")); pg.mouse.down(); pg.wait_for_timeout(50)
        if not catch(pg):
            break
        here = pg.evaluate("() => { const p = window.level.root.getObjectByName('penyauk').position; return window.screenAt(p.x, 0.1, p.z); }")
        bx = pos(pg, "akuariumB", 0.1)
        for i in range(1, 41):
            pg.mouse.move(here["x"] + (bx[0] - here["x"]) * i / 40, here["y"] + (bx[1] - here["y"]) * i / 40); pg.wait_for_timeout(16)
        pg.mouse.up(); pg.wait_for_timeout(600)
    check("L2 three fish moved carefully completes level", pg.evaluate("window.levelDone === true"), guide(pg))
    pg.screenshot(path=os.path.join(OUT, "L2.png"))

    # ---- L3: trace the dotted leaf with a mouse drag, then tap the three cards
    open_level(pg, "L3")
    path = pg.evaluate("() => window.level.tracePath().map(([x, y, z]) => window.screenAt(x, y, z))")
    pg.mouse.move(path[0]["x"], path[0]["y"]); pg.mouse.down()
    for q in path + [path[0]]:
        pg.mouse.move(q["x"], q["y"], steps=3)
    pg.mouse.up(); pg.wait_for_timeout(800)
    check("L3 tracing the outline completes the sketch", guide(pg) == "1/2", guide(pg))
    for c in ["lisan", "lakaran", "tulisan"]:
        pg.mouse.click(*pos(pg, c)); pg.wait_for_timeout(300)
    check("L3 three ways to communicate completes level", pg.evaluate("window.levelDone === true"))
    pg.screenshot(path=os.path.join(OUT, "L3.png"))

    # ---- L4 with hands: ☝️ point-and-hold the tap; then mouse: scrub, store x3, close drawer
    open_level(pg, "L4", "&handsim")
    drag(pg, pos(pg, "span"), pos(pg, "piring", 0.0))
    check("L4 scrubbing needs water first", "paip" in info(pg).lower(), info(pg))
    hand(pg, "point", pos(pg, "paip", 0.15), 1.2)
    hand(pg, "none", pos(pg, "paip", 0.15), 0.2)
    check("L4 point-and-hold opens the tap", guide(pg) == "1/4", guide(pg))
    d = pos(pg, "piring", 0.005)
    pg.mouse.move(*pos(pg, "span")); pg.mouse.down()
    for i in range(24):
        pg.mouse.move(d[0] + (40 if i % 2 else -40), d[1] + (10 if i % 4 < 2 else -10), steps=4); pg.wait_for_timeout(20)
    pg.mouse.up(); pg.wait_for_timeout(900)
    check("L4 scrubbing cleans the dish", guide(pg) == "2/4", guide(pg))
    for t in ["kanta", "bikar", "piring"]:
        drag(pg, pos(pg, t), pos(pg, "laci"))
    check("L4 three tools stored", guide(pg) == "3/4", guide(pg))
    pg.mouse.click(*pos(pg, "laci", 0.04)); pg.wait_for_timeout(1000)
    check("L4 closing drawer completes level", pg.evaluate("window.levelDone === true"))
    pg.screenshot(path=os.path.join(OUT, "L4.png"))

    # ---- play mode with a real (fake) camera device: hand tracker loads
    ctx = b.new_context(permissions=["camera"], viewport={"width": 1280, "height": 720})
    b2 = ctx.new_page(); b2.on("pageerror", lambda e: errors.append(str(e)))
    b2.goto(f"http://127.0.0.1:{srv.server_port}{WEB}/?play=L1")
    try:
        b2.wait_for_function("document.getElementById('handChip').textContent.includes('AKTIF')", timeout=40000); ok = True
    except Exception:
        ok = False
    check("play mode: camera + MediaPipe hand tracker running", ok, b2.inner_text("#handChip"))
    b.close()

check("no JS errors", not errors, errors[:3])
print("failed:", fails or "none")
sys.exit(1 if fails else 0)
