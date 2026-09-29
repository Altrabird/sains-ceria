"""Compile markers/AM01..AM12.png into markers/targets.mind with MindAR's own compiler (headless Chromium).
Target index i  <->  AM{i+1:02d}. Usage: python tools/compile_markers.py"""
import os, sys, base64, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
IMGS = [f"markers/AM{i:02d}.png" for i in range(1, 13)]

PAGE = """<!doctype html><script type="module">
import { Compiler } from '/vendor/mind-ar/mindar-image.prod.js';
const load = src => new Promise((ok, err) => { const i = new Image(); i.onload = () => ok(i); i.onerror = err; i.src = src; });
window.run = async (srcs) => {
  // 512 px is plenty for a 12 cm card and keeps targets.mind small for phones
  const imgs = (await Promise.all(srcs.map(s => load('/' + s)))).map(i => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    c.getContext('2d').drawImage(i, 0, 0, 512, 512); return c;
  });
  const c = new Compiler();
  await c.compileImageTargets(imgs, p => { window.progress = p; });
  const buf = new Uint8Array(c.exportData());
  let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
};
window.ready = true;
</script>"""


class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path == "/__compile":
            b = PAGE.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
        else:
            super().do_GET()


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(H, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    pg = b.new_page()
    pg.on("pageerror", lambda e: print("pageerror:", e))
    pg.goto(f"http://127.0.0.1:{srv.server_port}/__compile")
    pg.wait_for_function("window.ready === true")
    # one file with all 12 (scan any card) + one per amali (faster to download/track: ar/?am=AM07)
    jobs = [("targets.mind", IMGS)] + [(f"AM{i:02d}.mind", [s]) for i, s in enumerate(IMGS, 1)]
    for name, srcs in jobs:
        data = base64.b64decode(pg.evaluate("srcs => window.run(srcs)", srcs))
        open(os.path.join(ROOT, "markers", name), "wb").write(data)
        print(f"{name}: {len(data) // 1024} KB, {len(srcs)} target(s)")
        if len(data) < 10000:
            sys.exit("suspiciously small .mind file")
    b.close()
srv.shutdown()
