"""Headless check of ar/index.html in no-camera preview mode: every kit loads, every item's tap interaction runs
without JS errors. Saves before/after screenshots + a contact sheet. Usage: python tools/test_ar.py [outdir] [AM07 ...]"""
import os, sys, json, threading, functools, http.server
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))  # served root: shared/ + games/
WEB = "/games/" + os.path.basename(os.path.abspath(ROOT))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "tools", "_ar_test")
os.makedirs(out, exist_ok=True)
kits = json.load(open(os.path.join(ROOT, "assets", "kits.json"), encoding="utf-8"))
ams = sys.argv[2:] or [k for k in kits if k.startswith("AM")]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails, shots = {}, []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for am in ams:
        pg = b.new_page(viewport={"width": 800, "height": 600})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
        pg.goto(f"http://127.0.0.1:{srv.server_port}{WEB}/?preview={am}")
        pg.wait_for_function("window.kitReady === true", timeout=120000)
        pg.wait_for_timeout(800)
        pg.screenshot(path=f"{out}/{am}_a.png")
        ids = [it["id"] for it in kits[am]["items"]]
        # tap order: rig items first (tests), then everything else; await each so animations complete
        for i in ids:
            try:
                pg.evaluate(f"window.tapItem({json.dumps(i)})")
            except Exception as e:
                errs.append(f"tap {i}: {e}")
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f"{out}/{am}_b.png")
        shots += [f"{out}/{am}_a.png", f"{out}/{am}_b.png"]
        if errs:
            fails[am] = errs
        print(am, "OK" if not errs else errs)
        pg.close()
    b.close()
srv.shutdown()
ims = [Image.open(f).resize((400, 300)) for f in shots]
cols = 4
sheet = Image.new("RGB", (400 * cols, 300 * ((len(ims) + cols - 1) // cols)), "white")
for k, im in enumerate(ims):
    sheet.paste(im, ((k % cols) * 400, (k // cols) * 300))
sheet.save(f"{out}/contact.png")
print("contact sheet:", f"{out}/contact.png")
sys.exit(1 if fails else 0)
