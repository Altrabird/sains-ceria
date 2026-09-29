"""End-to-end CV check without a phone: render a marker card in perspective on a 'desk' into a fake webcam video
(.y4m), feed it to Chromium as the camera, open ar/?am=AMxx and wait for MindAR's onTargetFound.
Usage: python tools/test_tracking.py [--all] [AM07 AM11 ...]  (default: all 12; --all = use combined targets.mind)"""
import os, sys, threading, functools, http.server, random
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
TMP = os.path.join(ROOT, "tools", "_tracking")
os.makedirs(TMP, exist_ok=True)
W, H = 640, 480


def perspective_coeffs(dst, src):
    import numpy as np
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def frame(marker, jitter):
    bg = Image.new("RGB", (W, H), (120, 95, 70))  # wooden desk
    d = ImageDraw.Draw(bg)
    rnd = random.Random(1)
    for i in range(40):
        y = rnd.randrange(H)
        d.line((0, y, W, y + rnd.randint(-20, 20)), fill=(110 + rnd.randint(-10, 10), 85, 60), width=2)
    m = Image.open(marker).convert("RGB").resize((600, 600))
    j = jitter
    quad = [(190 + j, 90), (470 + j, 100), (520 + j, 400), (140 + j, 390)]  # tilted card, ~45% of frame
    card = m.transform((W, H), Image.PERSPECTIVE, perspective_coeffs(quad, [(0, 0), (600, 0), (600, 600), (0, 600)]),
                       Image.BICUBIC)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(quad, fill=255)
    bg.paste(card, (0, 0), mask)
    return bg


def y4m(marker, path, n=30):
    with open(path, "wb") as f:
        f.write(f"YUV4MPEG2 W{W} H{H} F10:1 Ip A1:1 C420jpeg\n".encode())
        for i in range(n):
            ycc = frame(marker, (i % 6) - 3).convert("YCbCr")
            y, cb, cr = ycc.split()
            f.write(b"FRAME\n" + y.tobytes() + cb.resize((W // 2, H // 2)).tobytes() + cr.resize((W // 2, H // 2)).tobytes())


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
ALL = "--all" in sys.argv
ams = [a for a in sys.argv[1:] if a != "--all"] or [f"AM{i:02d}" for i in range(1, 13)]
bad = []
with sync_playwright() as p:
    for am in ams:
        vid = os.path.join(TMP, f"{am}.y4m")
        y4m(os.path.join(ROOT, "markers", f"{am}.png"), vid)
        frame(os.path.join(ROOT, "markers", f"{am}.png"), 0).save(os.path.join(TMP, f"{am}_cam.png"))
        b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--use-fake-ui-for-media-stream",
                                    "--use-fake-device-for-media-stream", f"--use-file-for-fake-video-capture={vid}"])
        pg = b.new_page(viewport={"width": 640, "height": 480})
        pg.on("pageerror", lambda e: print("  pageerror:", e))
        pg.goto(f"http://127.0.0.1:{srv.server_port}/ar/" + ("?all" if ALL else f"?am={am}"))
        try:
            pg.wait_for_function(f"document.getElementById('hint').textContent.startsWith('{am}')", timeout=180000)
            pg.wait_for_timeout(4000)
            pg.screenshot(path=os.path.join(TMP, f"{am}_ar.png"))
            print(am, "TRACKED")
        except Exception as e:
            pg.screenshot(path=os.path.join(TMP, f"{am}_ar.png"))
            print(am, "NOT FOUND", str(e)[:80])
            bad.append(am)
        b.close()
srv.shutdown()
print("not tracked:", bad or "none")
sys.exit(1 if bad else 0)
