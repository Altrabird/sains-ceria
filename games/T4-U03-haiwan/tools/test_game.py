"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    for lv in ["L1", "L3", "L4"]:
        g.open(lv, "&handsim")
        g.check(lv + " wrong zone refused", "🤔" in g.sort_wrong(), g.info())
        g.sort_all(); g.check(lv + " -> level done", g.done(), g.guide()); g.shot(lv)

    g.open("L2")
    g.drag(g.pos("katak", 0.05), g.pos("darat"))
    g.click(g.pos("organ_insang", 0.03)); g.check("L2 adult frog has no gills", "insang" in g.info(), g.info())
    g.click(g.pos("organ_peparu", 0.03))
    g.drag(g.pos("katak", 0.05), g.pos("kolam")); g.click(g.pos("organ_kulit", 0.03))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L5")
    g.click(g.pos("kelas_ikan", 0.03)); g.check("L5 whale is not a fish", "🤔" in g.info(), g.info())
    for _ in range(3):
        g.click(g.pos("kelas_mamalia", 0.03)); g.wait(3300)
    g.check("L5 -> level done", g.done(), g.guide()); g.shot("L5")

    g.play_mode_hands("L1")
