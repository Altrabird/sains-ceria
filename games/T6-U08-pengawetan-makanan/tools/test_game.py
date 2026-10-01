"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L3"]:
        g.open(lv, "&handsim"); g.check(lv + " wrong pair refused", "🤔" in g.match_wrong(), g.info())
        g.match_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L2"); g.check("L2 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L4", "&handsim")
    g.drag(g.pos("simpan", 0.04), g.pos("urutan_1")); g.check("L4 storing is not first", "🤔" in g.info(), g.info())
    for i, s in enumerate(["cuci", "lap", "timbang_awal", "jemur", "timbang_akhir", "simpan"]): (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
