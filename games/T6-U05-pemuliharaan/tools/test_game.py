"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L3"]:
        g.open(lv); g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(by_hand=1 if lv == "L1" else 0); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L2", "&handsim"); g.check("L2 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L4", "&handsim")
    g.drag(g.pos("penyu_1"), g.pos("tunggul_1")); g.check("L4 turtle goes to the sea", "laut" in g.info(), g.info())
    for i in range(1, 5): (g.hand_drag if i == 1 else g.drag)(g.pos("anak_pokok_%d" % i, 0.03), g.pos("tunggul_%d" % i))
    for i in range(1, 4): g.drag(g.pos("penyu_%d" % i), g.pos("laut"))
    g.check("L4 -> level done", g.done(), g.guide()); g.wait(1500); g.shot("L4")

    g.play_mode_hands("L4")
