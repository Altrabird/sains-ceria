"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    for i in range(3):
        x = -0.3 + i * 0.25
        (g.hand_drag if i == 0 else g.drag)(g.pos("kadbod%d" % (i + 1), 0.07), g.at(x, 0, 0))
    g.check("L1 slits aligned -> level done", g.done(), g.info()); g.shot("L1")

    g.open("L2")
    for b, k in [("plastik_jernih", "lut_sinar"), ("plastik_berwarna", "lut_cahaya"), ("kad_manila", "legap")]:
        g.drag(g.pos(b, 0.1), g.pos("pemegang", 0.05)); g.wait(600)
        if b == "kad_manila":
            g.click(g.pos("jenis_lut_sinar", 0.02)); g.check("L2 card is not transparent", "🤔" in g.info(), g.info())
        g.click(g.pos("jenis_" + k, 0.02)); g.wait(400)
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.drag(g.pos("silinder"), g.at(-0.35, 0.1, -0.05)); g.drag(g.pos("silinder"), g.at(0.35, 0.1, -0.05))
    g.check("L3 near/far shadows", g.guide() == "1/2", g.guide())
    g.click(g.pos("pusing", 0.04)); g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    for i in range(8):  # search both mirror angles like a pupil would
        for j in range(8):
            if g.done(): break
            g.click(g.pos("cermin2", 0.045), 120)
        if g.done(): break
        g.click(g.pos("cermin1", 0.045), 120)
    g.check("L4 two mirrors reflect light to the target -> level done", g.done(), g.info()); g.shot("L4")

    g.open("L5", "&handsim"); g.check("L5 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.open("L6")
    g.drag(g.pos("pensel", 0.02), g.pos("gelas", 0.1)); g.drag(g.pos("cermin", 0.02), g.pos("besen", 0.04)); g.wait(1500)
    g.check("L6 -> level done", g.done(), g.guide()); g.shot("L6")

    g.play_mode_hands("L1")
