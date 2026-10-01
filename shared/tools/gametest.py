"""Test kit for games built on shared/stage.js. In games/<id>/tools/test_game.py:

    import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "shared", "tools"))
    from gametest import Game
    with Game(__file__) as g:
        g.open("L1"); g.drag(g.pos("daun"), g.pos("pad_mata")); g.check("leaf matched", g.guide() == "1/2")
        ...

Serves the repo root, opens /games/<id>/?preview=L1 in headless Chromium (fake camera allowed), collects JS errors,
and exits 1 if any check failed. Headless Chromium paints ~15 fps, so pointer moves arrive ~55 ms apart."""
import os, sys, threading, functools, http.server
from playwright.sync_api import sync_playwright

HAND = """async ([g, x, y, secs]) => { const { synthHand } = await import('/shared/hands.js');
  const t0 = performance.now(); while (performance.now() - t0 < secs * 1000) {
    window.feedHand(synthHand(g, 1 - x / innerWidth, y / innerHeight)); await new Promise(r => setTimeout(r, 33)); } }"""


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Game:
    def __init__(self, test_file):
        self.root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(test_file)), ".."))
        self.web = "/games/" + os.path.basename(self.root)
        self.out = os.path.join(self.root, "tools", "_test"); os.makedirs(self.out, exist_ok=True)
        self.fails, self.errors = [], []

    def __enter__(self):
        repo = os.path.abspath(os.path.join(self.root, "..", ".."))
        self.srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_Quiet, directory=repo))
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.srv.server_port}{self.web}/"
        self.p = sync_playwright().start()
        self.b = self.p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                                              "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"])
        self.pg = self.b.new_context(permissions=["camera"], viewport={"width": 1280, "height": 720}).new_page()
        self.pg.on("pageerror", lambda e: self.errors.append(str(e)))
        return self

    def __exit__(self, *exc):
        if exc[0] is None:
            self.check("no JS errors", not self.errors, self.errors[:3])
        self.b.close(); self.p.stop(); self.srv.shutdown()
        print("failed:", self.fails or "none")
        if exc[0] is None:
            sys.exit(1 if self.fails else 0)

    # ---- page
    def open(self, level, extra=""):
        self.pg.goto(f"{self.url}?preview={level}{extra}")
        self.pg.wait_for_function("window.gameReady === true", timeout=20000); self.pg.wait_for_timeout(500)

    def play_mode_hands(self, level="L1"):
        """real camera path: ?play= with Chromium's fake camera -> MediaPipe tracker must come up"""
        self.pg.goto(f"{self.url}?play={level}")
        try:
            self.pg.wait_for_function("document.getElementById('handChip').textContent.includes('AKTIF')", timeout=40000); ok = True
        except Exception:
            ok = False
        self.check("play mode: camera + MediaPipe hand tracker running", ok, self.pg.inner_text("#handChip"))

    def js(self, code, arg=None):
        return self.pg.evaluate(code, arg)

    def info(self):
        return self.pg.inner_text("#info")

    def guide(self):
        return self.pg.inner_text("#guide .prog")

    def done(self):
        return self.pg.evaluate("window.levelDone === true")

    def shot(self, name):
        self.pg.screenshot(path=os.path.join(self.out, name + ".png"))

    def wait(self, ms):
        self.pg.wait_for_timeout(ms)

    def until(self, js="window.levelDone === true", timeout=15000):
        """poll a JS condition instead of a fixed wait (slow machines / parallel runs)"""
        try:
            self.pg.wait_for_function(js, timeout=timeout); return True
        except Exception:
            return False

    # ---- input
    def pos(self, name, dy=0):
        p = self.pg.evaluate("([n, d]) => window.screenOf(n, d)", [name, dy]); return p["x"], p["y"]

    def at(self, x, y, z):
        p = self.pg.evaluate("p => window.screenAt(...p)", [x, y, z]); return p["x"], p["y"]

    def drag(self, a, b, steps=25, pause=16):
        m = self.pg.mouse; m.move(*a); m.down()
        for i in range(1, steps + 1):
            m.move(a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps); self.pg.wait_for_timeout(pause)
        m.up(); self.pg.wait_for_timeout(600)

    def click(self, a, wait=400):
        self.pg.mouse.click(*a); self.pg.wait_for_timeout(wait)

    def hand(self, g, at, secs=0.3):
        """simulated MediaPipe hand: g in two|point|open|none at screen px, held for secs"""
        self.pg.evaluate(HAND, [g, at[0], at[1], secs])

    def hand_drag(self, a, b, steps=15):
        self.hand("two", a, 0.5)
        for i in range(1, steps + 1):
            self.hand("two", (a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps), 0.04)
        self.hand("open", b, 0.4); self.pg.wait_for_timeout(600)

    def sort_cards(self):
        """[(card name, zone id)] for every shared sorter() card still in the level"""
        return self.js("() => { const out = []; window.level.root.traverse(o => o.userData.it && out.push([o.name, o.userData.it.zone])); return out; }")

    def sort_all(self, by_hand=1):
        """drop every sorter() card on its zone; the first `by_hand` with simulated hands, the rest with the mouse"""
        for i, (card, zone) in enumerate(self.sort_cards()):
            (self.hand_drag if i < by_hand else self.drag)(self.pos(card, 0.04), self.pos("zon_" + zone))

    def sort_wrong(self):
        """drop the first sorter() card on a wrong zone; returns the hint text"""
        zones = self.js("() => { const z = []; window.level.root.traverse(o => o.name.startsWith('zon_') && z.push(o.name)); return z; }")
        card, zone = self.sort_cards()[0]
        self.drag(self.pos(card, 0.04), self.pos(next(z for z in zones if z != "zon_" + zone)))
        return self.info()

    def hand_tap(self, at):
        self.hand("point", at, 1.2); self.hand("none", at, 0.2); self.pg.wait_for_timeout(300)

    # ---- result
    def check(self, name, ok, extra=""):
        print(("PASS " if ok else "FAIL ") + name, extra)
        if not ok:
            self.fails.append(name)
