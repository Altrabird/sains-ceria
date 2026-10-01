"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

LAND = ["gunung", "bukit", "lembah", "sungai", "pantai", "laut", "tasik", "kolam"]
with Game(__file__) as g:
    # ---- L1: flag on the wrong landform refused; eight flags (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("bendera_laut", 0.03), g.pos("tempat_tasik"))
    g.check("L1 lake is not the sea", "bukan laut" in g.info(), g.info())
    g.hand_drag(g.pos("bendera_gunung", 0.03), g.pos("tempat_gunung"))
    g.check("L1 hand flags the mountain", "Gunung" in g.info(), g.info())
    for l in LAND[1:]:
        g.drag(g.pos("bendera_" + l, 0.03), g.pos("tempat_" + l))
    g.check("L1 all eight -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: magnify three piles; wrong name refused; name all three
    g.open("L2")
    m = g.pos("kanta"); g.pg.mouse.move(*m); g.pg.mouse.down()
    for s in ["pasir", "kebun", "liat"]:
        g.pg.mouse.move(*g.at(*[g.js(f"() => window.level.root.getObjectByName('timbunan_{s}').position.x"), 0.06, -0.15]), steps=12); g.wait(300)
    g.pg.mouse.up(); g.wait(800)
    g.check("L2 three soils inspected", g.guide() == "1/2", g.guide())
    g.drag(g.pos("nama_pasir", 0.03), g.pos("timbunan_liat"))
    g.check("L2 wrong soil name refused", "kandungannya" in g.info(), g.info())
    for s in ["kebun", "liat", "pasir"]:
        g.drag(g.pos("nama_" + s, 0.03), g.pos("timbunan_" + s))
    g.check("L2 named -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: fill (wrong jar refused), shake by waving a hand, pick the jar with floating bits
    g.open("L3", "&handsim")
    g.drag(g.pos("timbunan_pasir"), g.pos("balang_kebun", 0.1))
    g.check("L3 soil goes in its own jar", "berlabel sama" in g.info(), g.info())
    for s in ["kebun", "liat", "pasir"]:
        g.drag(g.pos("timbunan_" + s), g.pos("balang_" + s, 0.1))
    g.check("L3 jars filled", g.guide() == "1/3", g.guide())
    c = g.pos("balang_liat", 0.1)
    for i in range(14):  # 👋 wave an open palm left-right fast
        g.hand("open", (c[0] + (150 if i % 2 else -150), c[1]), 0.08)
    g.check("L3 wave shakes all jars", g.until("document.querySelector('#guide .prog').textContent === '2/3'", 8000), g.guide())
    g.wait(3500); g.click(g.pos("balang_pasir", 0.1))
    g.check("L3 sand jar has nothing floating", "terapung" in g.info(), g.info())
    g.click(g.pos("balang_kebun", 0.1))
    g.check("L3 garden soil chosen -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: stones first refused; layers bottom-up; pour
    g.open("L4")
    g.drag(g.pos("batu_kecil", 0.03), g.pos("penapis", 0.27))
    g.check("L4 must start from the bottom", "Mula dari bawah" in g.info(), g.info())
    for l in ["kapas", "pasir", "batu_kecil"]:
        g.drag(g.pos(l, 0.03), g.pos("penapis", 0.27))
    g.check("L4 filter built", g.guide() == "1/2", g.guide())
    g.click(g.pos("air_keruh", 0.05))
    g.check("L4 muddy water filtered -> level done", g.until(), g.info())
    g.shot("L4")

    g.play_mode_hands("L1")
