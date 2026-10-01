"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("label_elips", 0.03), g.pos("galaksi_berpilin")); g.check("L1 wrong galaxy refused", "🤔" in g.info(), g.info())
    for i, k in enumerate(["berpilin", "elips", "tidak_sekata"]): (g.hand_drag if i == 0 else g.drag)(g.pos("label_" + k, 0.03), g.pos("galaksi_" + k))
    g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.click(g.pos("calon_pusat")); g.check("L2 centre refused", "🤔" in g.info(), g.info())
    g.hand_tap(g.pos("calon_pinggir")); g.check("L2 found the Solar System", "pinggir" in g.info(), g.info())
    g.click(g.pos("pandangan_sisi", 0.03)); g.wait(2000)
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.drag(g.pos("alam_semesta", 0.04), g.pos("urutan_1")); g.check("L3 universe is not smallest", "🤔" in g.info(), g.info())
    for i, s in enumerate(["bumi", "sistem_suria", "bima_sakti", "alam_semesta"]): (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4", "&handsim"); g.check("L4 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
