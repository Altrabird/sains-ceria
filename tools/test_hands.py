"""Headless check of the hand-gesture layer.
1) ?handsim: synthetic hand landmarks drive real gestures end-to-end (two-finger drag coin into circuit -> bulb lights,
   point-and-hold opens a box lid, wave spins the pinwheel, still open palm resets the kit).
2) ?hands with a fake webcam: the real MediaPipe HandLandmarker loads and runs without errors.
Usage: python tools/test_hands.py"""
import os, sys, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_port}"
OUT = os.path.join(ROOT, "tools", "_hands")
os.makedirs(OUT, exist_ok=True)
fails = []


BULB_PX = """() => { const c = document.querySelector('#stage canvas'), r = c.getBoundingClientRect();
  const p = window.kitRoot.userData.byId('circuit_tester').getObjectByName('anchor_bulb').getWorldPosition(new window.kitRoot.position.constructor()).project(window.__cam);
  return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height] }"""


def brightness(pg):
    """Mean brightness of the rendered pixels around the bulb (what a pupil actually sees)."""
    import io
    from PIL import Image, ImageStat
    x, y = pg.evaluate(BULB_PX)
    im = Image.open(io.BytesIO(pg.screenshot())).convert("L")
    return ImageStat.Stat(im.crop((int(x) - 14, int(y) - 14, int(x) + 14, int(y) + 14))).mean[0]


def check(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name, extra)
    if not ok:
        fails.append(name)


# feed a gesture for `secs` at ~30 fps; pos may be a function of progress 0..1
FEED = """async ([g, secs, a, b]) => {
  const { synthHand } = await import('/ar/hands.js');
  const n = Math.max(1, Math.round(secs * 30));
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
    window.feedHand(g === 'lost' ? null : synthHand(g, x, y));
    await new Promise(r => setTimeout(r, 33));
  }
}"""
WAVE = """async (secs) => {
  const { synthHand } = await import('/ar/hands.js');
  for (let i = 0; i < secs * 30; i++) { window.feedHand(synthHand('open', 0.5 + 0.2 * Math.sin(i / 3), 0.5)); await new Promise(r => setTimeout(r, 33)); }
}"""

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])

    def open_sim(am):
        pg = b.new_page(viewport={"width": 900, "height": 650})
        pg.on("pageerror", lambda e: fails.append(f"pageerror {am}: {e}") or print("  pageerror:", e))
        pg.goto(f"{URL}/ar/?preview={am}&handsim")
        pg.wait_for_function("window.kitReady === true", timeout=120000)
        return pg

    # AM07: pinch coin, drag onto tester, release -> bulb glows
    pg = open_sim("AM07")
    coin, tester = pg.evaluate("window.itemScreen('coin')"), pg.evaluate("window.itemScreen('circuit_tester')")
    dark = brightness(pg)
    pg.evaluate(FEED, ["two", 0.3, coin, coin])
    pg.screenshot(path=f"{OUT}/AM07_grab.png")
    pg.evaluate(FEED, ["two", 0.8, coin, tester])
    pg.evaluate(FEED, ["none", 0.2, tester, tester])
    pg.wait_for_timeout(1500)
    glow = pg.evaluate("""() => { let v = 0; window.kitRoot.userData.byId('circuit_tester').traverse(o => {
        if (o.material && /bulb_glass/.test(o.material.name)) v = o.material.emissiveIntensity }); return v }""")
    lit = brightness(pg)
    check("AM07 two-finger drag coin into circuit lights bulb", glow > 0 and lit > dark + 25,
          f"(bulb pixels {dark:.0f} -> {lit:.0f}, info='{pg.inner_text('#info')[:50]}')")
    pg.screenshot(path=f"{OUT}/AM07_drop.png")
    # drag an insulator in -> bulb off
    er = pg.evaluate("window.itemScreen('eraser')")
    pg.evaluate(FEED, ["none", 0.5, tester, er])  # hand travels to the eraser, then raises two fingers
    pg.evaluate(FEED, ["two", 0.3, er, er]); pg.evaluate(FEED, ["two", 0.8, er, tester]); pg.evaluate(FEED, ["none", 0.2, tester, tester])
    pg.wait_for_timeout(1500)
    glow = pg.evaluate("""() => { let v = 0; window.kitRoot.userData.byId('circuit_tester').traverse(o => {
        if (o.material && /bulb_glass/.test(o.material.name)) v = o.material.emissiveIntensity }); return v }""")
    off = brightness(pg)
    check("AM07 eraser (insulator) turns bulb off", glow == 0 and off < lit - 25, f"(bulb pixels {lit:.0f} -> {off:.0f})")
    pg.close()

    # AM05: point & hold on a box -> lid opens
    pg = open_sim("AM05")
    box = pg.evaluate("window.itemScreen('shoe_box_dark')")
    rot0 = pg.evaluate("window.kitRoot.userData.byId('shoe_box_dark').getObjectByName('pivot_lid').rotation.x")
    pg.evaluate(FEED, ["point", 1.4, box, box])
    pg.wait_for_timeout(900)
    rot1 = pg.evaluate("window.kitRoot.userData.byId('shoe_box_dark').getObjectByName('pivot_lid').rotation.x")
    check("AM05 point-and-hold opens lid", abs(rot1 - rot0) > 1, f"({rot0:.2f} -> {rot1:.2f})")
    pg.screenshot(path=f"{OUT}/AM05_point.png")
    pg.close()

    # AM12: wave -> pinwheel spins; still palm -> reset rebuilds the kit
    pg = open_sim("AM12")
    r0 = pg.evaluate("window.kitRoot.userData.byId('pinwheel').getObjectByName('pivot_rotor').rotation.z")
    pg.evaluate(WAVE, 1.2)
    pg.wait_for_timeout(600)
    r1 = pg.evaluate("window.kitRoot.userData.byId('pinwheel').getObjectByName('pivot_rotor').rotation.z")
    check("AM12 hand wave spins pinwheel", abs(r1 - r0) > 1, f"({r0:.2f} -> {r1:.2f})")
    pg.screenshot(path=f"{OUT}/AM12_wave.png")
    u0 = pg.evaluate("window.kitRoot.uuid")
    mid = {"x": 0.5, "y": 0.5}
    pg.evaluate(FEED, ["none", 0.3, mid, mid])
    pg.evaluate(FEED, ["open", 2.6, mid, mid])
    pg.wait_for_timeout(1500)
    check("open palm held still resets kit", pg.evaluate("window.kitRoot.uuid") != u0)
    pg.close()
    b.close()

    # real MediaPipe model on a fake camera
    y4m = os.path.join(ROOT, "tools", "_tracking", "AM07.y4m")
    if os.path.exists(y4m):
        b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--use-fake-ui-for-media-stream",
                                    "--use-fake-device-for-media-stream", f"--use-file-for-fake-video-capture={y4m}"])
        pg = b.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"{URL}/ar/?play=AM07")
        try:
            pg.wait_for_function("/AKTIF|gagal/.test(document.getElementById('handChip').textContent)", timeout=180000)
            pg.wait_for_timeout(3000)
            chip = pg.inner_text("#handChip")
        except Exception as e:
            chip = "timeout " + str(e)[:60]
        pg.screenshot(path=f"{OUT}/play_mode.png")
        check("play mode (no card): camera + MediaPipe HandLandmarker running", "AKTIF" in chip and not errs, f"({chip}; {errs[:2]})")
        # the AR (MindAR) page too: both CV models together
        pg.goto(f"{URL}/ar/?am=AM07")
        try:
            pg.wait_for_function("document.getElementById('hint').textContent.startsWith('AM07')", timeout=180000)
            pg.wait_for_function("/AKTIF|gagal/.test(document.getElementById('handChip').textContent)", timeout=180000)
            pg.wait_for_timeout(3000)
            chip = pg.inner_text("#handChip")
        except Exception as e:
            chip = "timeout " + str(e)[:60]
        check("AR mode: marker tracked + hand tracker active together", "AKTIF" in chip and not errs, f"({chip}; {errs[:2]})")
        pg.screenshot(path=f"{OUT}/AR_both.png")
        b.close()
    else:
        print("skip real-model test (run tools/test_tracking.py AM07 first)")
srv.shutdown()
print("failed:", fails or "none")
sys.exit(1 if fails else 0)
