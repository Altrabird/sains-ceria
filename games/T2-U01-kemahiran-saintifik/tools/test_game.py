"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    # ---- L1: goat into 'berkepak' refused; classify six (one by hand)
    g.open("L1", "&handsim")
    g.drag(g.pos("kambing", 0.05), g.pos("zon_berkepak"))
    g.check("L1 goat has no wings", "kepak" in g.info(), g.info())
    g.hand_drag(g.pos("helang", 0.05), g.pos("zon_berkepak"))
    g.check("L1 hand classifies the eagle", "berkepak" in g.info(), g.info())
    for a, z in [("itik", "berkepak"), ("penguin", "berkepak"), ("kambing", "tidak"), ("tenuk", "tidak"), ("harimau", "tidak")]:
        g.drag(g.pos(a, 0.05), g.pos("zon_" + z))
    g.check("L1 classified -> level done", g.done(), g.guide())
    g.shot("L1")

    # ---- L2: bag on the ruler refused; measure four with the right tools; record
    g.open("L2")
    g.drag(g.pos("beg", 0.04), g.pos("pembaris"))
    g.check("L2 weight needs the scale", "alat penimbang" in g.info(), g.info())
    for o, t, dy in [("beg", "alat_penimbang", 0.12), ("tembikai", "alat_penimbang", 0.12), ("pensel", "pembaris", 0), ("buku", "pembaris", 0)]:
        g.drag(g.pos(o, 0.04), g.pos(t, dy)); g.wait(2700)
    g.check("L2 four measured", g.guide() == "1/2", g.guide())
    g.wait(500); g.click(g.pos("jadual"))
    g.check("L2 recorded -> level done", g.done(), g.guide())
    g.shot("L2")

    # ---- L3: snail before gloves refused; gloves; snail to tray; trace; label; release
    g.open("L3")
    g.drag(g.pos("siput", 0.02), g.pos("dulang"))
    g.check("L3 snail not handled bare-handed", g.guide() == "0/5", g.guide())
    g.drag(g.pos("sarung_tangan", 0.05), g.pos("tangan", 0.05))
    g.drag(g.pos("siput", 0.02), g.pos("dulang"))
    g.check("L3 gloves on, snail on the tray", g.guide() == "2/5", g.guide())
    path = g.js("() => window.level.tracePath().map(([x, y, z]) => window.screenAt(x, y, z))")
    g.pg.mouse.move(path[0]["x"], path[0]["y"]); g.pg.mouse.down()
    for q in path + [path[0]]:
        g.pg.mouse.move(q["x"], q["y"], steps=3)
    g.pg.mouse.up(); g.wait(600)
    g.check("L3 snail sketched", g.guide() == "3/5", g.guide())
    for l in ["cangkerang", "sesungut"]:
        g.drag(g.pos("label_" + l, 0.03), g.pos("titik_" + l))
    g.drag(g.pos("siput", 0.02), g.pos("kebun"))
    g.check("L3 labelled + released -> level done", g.done(), g.guide())
    g.shot("L3")

    # ---- L4: wrong first card refused; order 1-4; wash (by hand); store three
    g.open("L4", "&handsim")
    g.drag(g.pos("lakar", 0.05), g.pos("urutan_1"))
    g.check("L4 sketching is not first", "Langkah 1" in g.info(), g.info())
    for i, c in enumerate(["letak", "perhati", "lakar", "bersih"], 1):
        g.drag(g.pos(c, 0.05), g.pos("urutan_%d" % i))
    g.check("L4 ordered", g.guide() == "1/3", g.guide())
    g.hand_tap(g.pos("paip", 0.15))
    g.check("L4 washed by pointing", g.guide() == "2/3", g.guide())
    for t in ["kelalang_kon", "bikar", "kanta"]:
        g.drag(g.pos(t, 0.04), g.pos("rak", 0.13))
    g.check("L4 stored -> level done", g.done(), g.guide())
    g.shot("L4")

    g.play_mode_hands("L1")
