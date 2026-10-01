"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    for lv in ["L2", "L3"]:
        g.open(lv); g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(by_hand=1 if lv == "L2" else 0); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L4", "&handsim")
    for i in range(1, 7):
        x, y, z = g.js("() => { const p = window.level.root.getObjectByName('petak_%d').position; return [p.x, 0.18 + 0.06, p.z]; }" % i)
        (g.hand_drag if i == 1 else g.drag)(g.pos("dron"), g.at(x, y, z))
    g.check("L4 -> level done", g.done(), g.guide()); g.wait(800); g.shot("L4")

    g.play_mode_hands("L4")
