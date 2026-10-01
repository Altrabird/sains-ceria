"""Hub test: year tabs, search, open a game, finish a level, 🏠 back to the hub, progress + continue, reset.
Usage: python tools/test_hub.py"""
import os, sys, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.join(ROOT, "shared", "tools"))
from gametest import Game

GAMES = json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8"))
GID = "T6-U07-kelajuan"  # L4 = 3 quick matcher drags
with Game(os.path.join(ROOT, "games", GID, "tools", "test_hub.py")) as g:
    hub = g.url + "../../index.html"
    g.pg.goto(hub); g.pg.wait_for_selector("a.card")
    g.check("six year rows", g.pg.locator("h2").count() == 6)
    g.check("every game has a tile", g.pg.locator("a.card").count() == len(GAMES), g.pg.locator("a.card").count())
    g.pg.fill("#search", "gerhana"); g.check("search finds gerhana", g.pg.locator("a.card").count() == 1 and "Gerhana" in g.pg.inner_text("#list"), g.pg.inner_text("#list")[:80])
    g.pg.fill("#search", "")
    g.check("every card links to index.html", all(h.endswith("/index.html") for h in g.pg.eval_on_selector_all("a.card", "as => as.map(a => a.getAttribute('href'))")))

    # ---- hands on the hub: ✌️ drag scrolls, ☝️ hold on a card opens it
    g.pg.goto(hub + "?handsim"); g.pg.wait_for_selector("a.card"); g.wait(300)
    g.check("hub hand toggle on in simulation", "simulasi" in g.pg.inner_text("#hnToggle"))
    y0 = g.js("() => scrollY"); g.hand("two", (640, 600), 0.4)
    for k in range(8): g.hand("two", (640, 600 - k * 40), 0.08)
    g.hand("none", (640, 300), 0.3)
    g.check("✌️ hand drag scrolls the hub", g.js("() => scrollY") > y0 + 100, [y0, g.js("() => scrollY")])
    sel = f"a.card[href='games/{GID}/index.html']"
    g.js(f"() => document.querySelector(\"{sel}\").scrollIntoView({{block: 'center'}})"); g.wait(300)
    cxy = lambda q: g.js(f"() => {{ const r = document.querySelector(\"{q}\").getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }}")
    with g.pg.expect_navigation(timeout=8000):
        try: g.hand("point", cxy(sel), 1.6)
        except Exception as e: assert "destroyed" in str(e), e
    g.pg.wait_for_selector("#menu .lv")
    g.check("☝️ hold on a hub card opens the game page", "Kelajuan" in g.pg.inner_text("#menu"))
    # ---- hands on the game page
    g.pg.goto(g.url + "index.html?handsim"); g.pg.wait_for_selector("#menu .lv"); g.wait(300)
    g.js("() => document.querySelectorAll('#menu .lv')[3].scrollIntoView({block: 'center'})"); g.wait(300)
    with g.pg.expect_navigation(timeout=8000):
        try: g.hand("point", cxy("#menu .lv:nth-child(4) a.green"), 1.6)
        except Exception as e: assert "destroyed" in str(e), e
    g.check("☝️ hold on ▶ Main starts the level", "play=L4" in g.pg.url, g.pg.url)

    g.pg.goto(hub); g.pg.wait_for_selector("a.card")
    g.pg.click(f"a.card[href='games/{GID}/index.html']"); g.pg.wait_for_selector("#menu .lv")
    g.check("game menu opens from the hub", "Kelajuan" in g.pg.inner_text("#menu"))
    g.check("game menu links back to the hub file", g.pg.get_attribute("#menu .mnav a", "href") == "../../index.html")

    g.open("L4", "&handsim")
    c = lambda sel: g.js(f"() => {{ const r = document.querySelector('{sel}').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }}")
    before = g.js("() => document.querySelector('#guide [data-act=speak]').getAttribute('aria-pressed')")
    g.hand("point", c("#guide [data-act=speak]"), 1.6)
    after = g.js("() => document.querySelector('#guide [data-act=speak]').getAttribute('aria-pressed')")
    g.check("hand point-hold presses the sound button", before != after, [before, after])
    g.match_all(); g.check("level done", g.done(), g.guide()); g.wait(3200)
    g.check("Tahniah! card shown", g.js("() => !document.getElementById('win').hidden"))
    z = g.js("() => ['handLayer', 'cursor', 'guide', 'win', 'info', 'top'].map(id => +getComputedStyle(document.getElementById(id)).zIndex)")
    g.check("hand layer + ring are in front of every panel", min(z[:2]) > max(z[2:]), z)
    with g.pg.expect_navigation(timeout=8000):
        try: g.hand("point", c("#win .wbtn a.green"), 1.6)
        except Exception as e: assert "destroyed" in str(e), e  # the press navigated away mid-gesture: that is the point
    g.check("hand point-hold on the Tahniah! button navigates", g.pg.url.endswith("/index.html"), g.pg.url)
    prog = g.js("() => [JSON.parse(localStorage.getItem('sains.done')), JSON.parse(localStorage.getItem('sains.last'))]")
    g.check("progress saved", prog[0] == {GID: ["L4"]} and prog[1]["id"] == GID and prog[1]["level"] == "L4", prog)

    g.pg.wait_for_selector("a.card")  # the Tahniah! press brought us back to the hub
    card = g.pg.inner_text(f"a.card[href='games/{GID}/index.html']")
    g.check("card shows 1/4", "1/4" in card, card)
    g.check("continue button", g.pg.is_visible("#cont") and g.pg.get_attribute("#cont", "href").endswith("?play=L4") and "1 / " in g.pg.inner_text("#stars"), g.pg.inner_text("#cont"))
    g.shot("hub")

    g.check("footer credits the developer", "Developed by Harsidi bin Junick" in g.pg.inner_text("footer"))
