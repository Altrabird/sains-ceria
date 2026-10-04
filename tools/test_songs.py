"""Song player: game menu song card, sing-along, Lagu Sains page, hub button (python tools/test_songs.py). Needs at least 3 songs."""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(ROOT, "tools", "_test"); os.makedirs(OUT, exist_ok=True)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
U = f"http://127.0.0.1:{srv.server_port}"
fails = []


def check(name, ok, info=""):
    print(("PASS " if ok else "FAIL ") + name, info if not ok else "")
    ok or fails.append(name)


with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"])
    for name, vp in (("desk", (1280, 800)), ("phone", (915, 412))):
        pg = b.new_page(viewport={"width": vp[0], "height": vp[1]}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(U + "/games/T1-U07-magnet/index.html"); pg.wait_for_selector(".song .stitle", timeout=10000)
        check(f"{name} menu song card title", pg.inner_text(".song .stitle") == "Paku Oh Paku", pg.inner_text(".song .stitle"))
        pg.click(".song .splay"); pg.wait_for_timeout(1500)
        check(f"{name} plays", pg.evaluate("document.querySelector('.song').classList.contains('on')"))
        check(f"{name} time moves", not pg.inner_text(".song .stime").startswith("0:00"), pg.inner_text(".song .stime"))
        pg.click(".song .slyr"); check(f"{name} lyrics open", pg.is_visible(".slyrics") and pg.locator(".slyrics .ls").count() >= 3)
        pg.screenshot(path=f"{OUT}/song_menu_{name}.png")
        pg.click(".song .ssing"); pg.wait_for_timeout(2500)
        check(f"{name} sing-along open", pg.is_visible("#singAlong") and pg.locator("#singAlong .ls p").count() > 8)
        pg.screenshot(path=f"{OUT}/song_sing_{name}.png")
        pg.click("#singAlong .sx"); check(f"{name} sing-along closes", pg.locator("#singAlong").count() == 0)
        pg.click(".song .splay"); pg.wait_for_timeout(400); check(f"{name} pause", not pg.evaluate("document.querySelector('.song').classList.contains('on')"))
        ev = pg.evaluate("window.__ev.filter(e => e.e === 's')")
        check(f"{name} song play tracked once", len(ev) == 1 and ev[0]["g"] == "T1-U07-magnet", ev)
        check(f"{name} menu no horizontal scroll", pg.evaluate("document.querySelector('#menu').scrollWidth <= innerWidth"))
        check(f"{name} menu no JS errors", not errs, errs)
        pg2 = b.new_page(viewport={"width": vp[0], "height": vp[1]}); errs2 = []; pg2.on("pageerror", lambda e: errs2.append(str(e)))
        pg2.goto(U + "/lagu.html"); pg2.wait_for_timeout(3000)
        n = pg2.locator(".song .stitle").count()
        check(f"{name} lagu.html cards", n >= 3, n)
        pg2.click("#all"); pg2.wait_for_timeout(1500)
        check(f"{name} play all starts first", pg2.locator(".song.now.on").count() == 1)
        ys = pg2.eval_on_selector_all("section.year", "s => s.map(x => x.dataset.y)")
        pg2.click(f"#tabs button[data-y='{ys[-1]}']"); check(f"{name} year filter", pg2.locator("section.year:not([hidden])").count() == 1)
        check(f"{name} lagu no horizontal scroll", pg2.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        pg2.screenshot(path=f"{OUT}/lagu_{name}.png")
        check(f"{name} lagu.html no JS errors", not errs2, errs2)
        pg3 = b.new_page(viewport={"width": vp[0], "height": vp[1]}); pg3.goto(U + "/index.html"); pg3.wait_for_timeout(1500)
        check(f"{name} hub songs button + card badges", pg3.is_visible("#songs") and pg3.locator("a.card .note").count() >= 3)
    print("failed:", ", ".join(fails) or "none")
sys.exit(1 if fails else 0)
