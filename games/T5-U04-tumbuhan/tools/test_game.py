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
    c = g.pos("dandelion")
    for k in range(8): g.hand("open", (c[0] + (160 if k % 2 else -160), c[1]), 0.08)
    g.check("L4 wave blows the seeds", "angin" in g.info(), g.info())
    g.drag(g.pos("kelapa"), g.pos("kolam")); g.check("L4 coconut floats", "terapung" in g.info(), g.info())
    g.click(g.pos("keembung", 0.05)); g.check("L4 -> level done", g.done(), g.guide()); g.wait(1500); g.shot("L4")

    g.play_mode_hands("L4")
