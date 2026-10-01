"""Headless check: serve the folder, open viewer/, wait for every GLB thumbnail, screenshot, fail on any load error.
Usage: python tools/snap_gallery.py [out.png] [filter]"""
import sys, threading, functools, http.server, os
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))  # served root: shared/ + games/
WEB = "/games/" + os.path.basename(os.path.abspath(ROOT))
out = sys.argv[1] if len(sys.argv) > 1 else "gallery.png"
filt = sys.argv[2] if len(sys.argv) > 2 else ""

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": 1400, "height": 900})
    errs = []
    pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:{srv.server_port}{WEB}/viewer/")
    pg.wait_for_function("window.thumbsDone === true", timeout=300000)
    if filt:
        pg.select_option("#filter", filt)
    errs += pg.evaluate("window.thumbErrors")
    pg.screenshot(path=out, full_page=True)
    b.close()
srv.shutdown()
print("errors:", errs or "none")
sys.exit(1 if errs else 0)
