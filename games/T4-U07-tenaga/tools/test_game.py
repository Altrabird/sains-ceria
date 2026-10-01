"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

CH = [["kimia", "elektrik", "cahaya"], ["keupayaan", "kinetik", "bunyi"], ["kimia", "kinetik"], ["cahaya", "kimia"], ["elektrik", "cahaya", "bunyi"]]
with Game(__file__) as g:
    g.open("L1", "&handsim"); g.check("L1 wrong zone refused", "🤔" in g.sort_wrong(), g.info())
    g.sort_all(); g.check("L1 -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2", "&handsim"); g.check("L2 wrong pair refused", "🤔" in g.match_wrong(), g.info())
    g.match_all(); g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3", "&handsim")
    g.click(g.pos("bentuk_bunyi", 0.03)); g.check("L3 wrong first form refused", "tenaga asal" in g.info(), g.info())
    for r, chain in enumerate(CH):
        for i, f in enumerate(chain):
            (g.hand_tap if r == 0 and i == 0 else g.click)(g.pos("bentuk_" + f, 0.03))
        g.wait(3000)
    g.check("L3 five chains -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    for w in ["penyaman", "lampu", "tv", "kereta"]:
        g.click(g.pos("pembaziran_" + w, 0.06))
    g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L3")
