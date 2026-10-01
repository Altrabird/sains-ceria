"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.hand_drag(g.pos("bulan"), g.pos("orbit_4")); g.check("L1 full moon", "purnama" in g.info(), g.info()); g.shot("L1full")
    for i in [6, 0, 2]: g.drag(g.pos("bulan"), g.pos("orbit_%d" % i))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("fasa_5", 0.03), g.pos("urutan_1")); g.check("L2 full moon is not first", "🤔" in g.info(), g.info())
    for i in range(1, 9): (g.hand_drag if i == 1 else g.drag)(g.pos("fasa_%d" % i, 0.03), g.pos("urutan_%d" % i))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    first = True
    for b in range(4):
        g.wait(3200 if b else 300)
        for _ in range(20):
            nxt = g.js("() => window.level.next()")
            if not nxt or g.done(): break
            (g.hand_tap if first else g.click)(g.pos(nxt)); first = False
            g.wait(150)
        if b == 0: g.check("L3 Biduk traced", "gayung" in g.info(), g.info())
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim"); g.check("L4 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
