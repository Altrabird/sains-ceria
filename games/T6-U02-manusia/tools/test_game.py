"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim")
    g.drag(g.pos("bayi", 0.04), g.pos("urutan_1")); g.check("L2 baby is not first", "🤔" in g.info(), g.info())
    for i, s in enumerate(["persenyawaan", "zigot", "embrio", "fetus", "bayi"]): (g.hand_drag if i == 0 else g.drag)(g.pos(s, 0.04), g.pos("urutan_%d" % (i + 1)))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.drag(g.pos("isyarat"), g.pos("pin_otak")); g.check("L3 signal starts at the hand", "🤔" in g.info(), g.info())
    for i, p in enumerate(["tangan", "saraf_tunjang", "otak", "saraf_tunjang", "tangan"]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("isyarat"), g.pos("pin_" + p))
    g.check("L3 -> level done", g.done(), g.guide()); g.shot("L3")

    for lv in ["L4", "L5"]:
        g.open(lv); g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(by_hand=1 if lv == "L4" else 0); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.play_mode_hands("L3")
