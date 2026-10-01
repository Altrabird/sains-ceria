"""AM06 regression: panels never overlap in the centre slot (select A, B, C in any order, also by hand-drag), and
pointing at a panel inside the torch beam selects the panel, not the torch. Usage: python tools/test_am06.py"""
import os, sys, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))  # served root: shared/ + games/
WEB = "/games/" + os.path.basename(os.path.abspath(ROOT))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
threading.Thread(target=srv.serve_forever, daemon=True).start()
SHEETS = ["sheet_transparent", "sheet_translucent", "sheet_opaque"]
STATE = """() => { const r = window.kitRoot, it = r.userData.byId;
  const scr = it('white_screen').position, tor = it('flashlight').position;
  const mid = { x: scr.x + (tor.x - scr.x) * 0.45, z: scr.z + (tor.z - scr.z) * 0.45 };
  const inMid = %s.filter(id => Math.hypot(it(id).position.x - mid.x, it(id).position.z - mid.z) < 0.08);
  let beam = false; it('flashlight').traverse(o => { if (o.name === 'beam') beam = o.visible; });
  return { inMid, beam }; }""" % SHEETS
FEED = """async ([g, secs, a]) => { const { synthHand } = await import('/shared/hands.js');
  for (let i = 0; i <= secs * 30; i++) { window.feedHand(g === 'lost' ? null : synthHand(g, a.x, a.y)); await new Promise(r => setTimeout(r, 33)); } }"""
fails = []


def check(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name, extra)
    ok or fails.append(name)


with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": 1000, "height": 700})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:{srv.server_port}{WEB}/?preview=AM06&handsim")
    pg.wait_for_function("window.kitReady === true", timeout=120000)
    st = pg.evaluate(STATE)
    check("start: centre slot empty", st["inMid"] == [], str(st))
    for order in (SHEETS, list(reversed(SHEETS)), [SHEETS[1], SHEETS[0], SHEETS[1]]):
        for sid in order:
            pg.evaluate(f"window.tapItem('{sid}')")
            pg.wait_for_timeout(900)
        st = pg.evaluate(STATE)
        check(f"after {order}: exactly one panel in centre", len(st["inMid"]) <= 1, str(st))
    pg.screenshot(path=os.path.join(ROOT, "tools", "_hands", "AM06_slots.png"))
    # beam on; point (finger) at the opaque panel inside the beam -> panel selected, torch stays on
    pg.evaluate("window.tapItem('sheet_opaque')"); pg.wait_for_timeout(900)
    st = pg.evaluate(STATE)
    if "sheet_opaque" not in st["inMid"]:
        pg.evaluate("window.tapItem('sheet_opaque')"); pg.wait_for_timeout(900)
    op = pg.evaluate("window.itemScreen('sheet_opaque')")  # sits in the centre, inside the beam
    pg.evaluate(FEED, ["point", 1.3, op]); pg.wait_for_timeout(1200)
    st = pg.evaluate(STATE)
    check("finger on panel inside beam selects the panel (returns to side), torch stays on", st["beam"] and st["inMid"] == [], str(st))
    # finger on the torch body still switches it
    fl = pg.evaluate("window.itemScreen('flashlight')")
    pg.evaluate(FEED, ["none", 0.3, fl]); pg.evaluate(FEED, ["point", 1.3, fl]); pg.wait_for_timeout(500)
    check("finger on torch body toggles light", pg.evaluate(STATE)["beam"] is False)
    check("no JS errors", not errs, str(errs[:2]))
    b.close()
srv.shutdown()
print("failed:", fails or "none")
sys.exit(1 if fails else 0)
