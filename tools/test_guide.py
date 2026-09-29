"""Headless check: for every amali, doing the experiment (via the same tap/rig code the hands use) ticks every
guided step and ends on the kesimpulan. Usage: python tools/test_guide.py [AM07 ...]"""
import os, sys, json, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PLAN = {  # the actions a pupil would do, in order
    "AM01": ["weighing_scale", "height_chart", "tape_measure", "hand_tracing", "kid_boy", "kid_girl"],
    "AM02": ["cup_A", "cup_B", "cup_C", "cup_D", "mini_fridge"] + ["sprout_stages"] * 4 + ["cup_A"],
    "AM03": ["watering_can", "plant_growth", "plant_growth", "ruler_30cm", "worksheet"],
    "AM04": ["plant_healthy", "plant_no_water", "plant_no_light", "plant_no_air", "dark_box", "plant_healthy"],
    "AM05": ["stopwatch", "shoe_box_dark", "shoe_box_lit", "flashlight"],
    "AM06": ["sheet_transparent", "sheet_translucent", "sheet_opaque"],
    "AM07": ["coin", "iron_nail", "paper_clip", "eraser", "sponge"],
    "AM08": ["horseshoe_magnet", "sieve", "muddy_water"],
    "AM09": ["sample_sugar", "sample_sand", "sample_salt", "sample_coffee"],
    "AM10": ["glass_hot", "sample_sugar", "glass_cold", "sugar_cube", "stopwatch"],
    "AM11": ["water_cycle_setup", "card_sejatan", "card_kondensasi", "card_kerpasan", "card_pengumpulan"],
    "AM12": ["pinwheel", "balloon", "balloon_rocket"],
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
out = os.path.join(ROOT, "tools", "_guide")
os.makedirs(out, exist_ok=True)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for am in sys.argv[1:] or PLAN:
        pg = b.new_page(viewport={"width": 1000, "height": 700})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://127.0.0.1:{srv.server_port}/ar/?preview={am}")
        pg.wait_for_function("window.kitReady === true", timeout=120000)
        if am == "AM01":
            pg.screenshot(path=f"{out}/{am}_start.png")
        for i in PLAN[am]:
            pg.evaluate(f"window.tapItem({json.dumps(i)})")
        pg.wait_for_timeout(700)
        prog = pg.inner_text("#guide .prog")
        done = "Tahniah" in pg.inner_text("#guide")
        pg.screenshot(path=f"{out}/{am}_done.png")
        ok = done and not errs
        print(("PASS " if ok else "FAIL ") + am, prog, errs[:2])
        if not ok:
            fails.append(am)
        pg.close()
    b.close()
srv.shutdown()
print("failed:", fails or "none")
sys.exit(1 if fails else 0)
