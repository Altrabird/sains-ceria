"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

with Game(__file__) as g:
    g.open("L1", "&handsim")
    for i, (x, z) in enumerate([(-0.25, -0.12), (0.25, -0.12), (0, 0.13)]):
        (g.hand_drag if i == 0 else g.drag)(g.pos("bola%d" % (i + 1), 0.02), g.at(x, 0.24, z)); g.wait(700)
    g.check("L1 three balls fall to the centre -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    g.click(g.pos("putar", 0.03)); g.click(g.pos("edar", 0.03)); g.wait(1800)
    g.click(g.pos("jawapan_365h", 0.03)); g.check("L2 a day is not a year", "🤔" in g.info(), g.info())
    g.click(g.pos("jawapan_24j", 0.03)); g.wait(1700); g.click(g.pos("jawapan_365h", 0.03))
    g.check("L2 -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    for _ in range(4):
        if g.done(): break
        g.click(g.pos("putar_glob", 0.03)); g.wait(1200)
    g.check("L3 day and night -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    for t in ["8pagi", "10pagi", "12tgh", "2ptg", "4ptg"]:
        g.click(g.pos("masa_" + t, 0.03))
    g.wait(1700); g.click(g.pos("masa_8pagi", 0.03)); g.check("L4 morning shadow is long", "🤔" in g.info(), g.info())
    g.click(g.pos("masa_12tgh", 0.03)); g.check("L4 -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
