"""Plays every level like a pupil (mouse + simulated hands). Usage: python tools/test_game.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "shared", "tools"))
from gametest import Game

P = ["utarid", "zuhrah", "bumi", "marikh", "musytari", "zuhal", "uranus", "neptun"]
with Game(__file__) as g:
    g.open("L1", "&handsim")
    g.drag(g.pos("bumi", 0.02), g.pos("orbit_1"))
    g.check("L1 Earth is not first", "paling dekat" in g.info(), g.info())
    g.hand_drag(g.pos("utarid", 0.02), g.pos("orbit_1"))
    for i, p in enumerate(P[1:], 2):
        g.drag(g.pos(p, 0.02), g.pos("orbit_%d" % i))
    g.check("L1 eight planets in order -> level done", g.done(), g.guide()); g.shot("L1")

    g.open("L2")
    for m in ["matahari", "bulan", "asteroid", "komet", "meteoroid"]:
        g.click(g.pos(m, 0.01), 250)
    g.check("L2 five members found -> level done", g.done(), g.guide()); g.shot("L2")

    g.open("L3")
    g.click(g.pos("utarid", 0.02)); g.check("L3 Mercury is not the hottest", "atmosfera" in g.info(), g.info())
    g.click(g.pos("zuhrah", 0.02)); g.click(g.pos("neptun", 0.03))
    g.check("L3 hottest + coldest -> level done", g.done(), g.guide()); g.shot("L3")

    g.open("L4")
    g.click(g.pos("mula", 0.05)); g.wait(4500)
    g.click(g.pos("jawapan_bumi", 0.03)); g.check("L4 Earth is quicker", "pusingan" in g.info(), g.info())
    g.click(g.pos("jawapan_marikh", 0.03))
    g.check("L4 farther = longer -> level done", g.done(), g.guide()); g.shot("L4")

    g.play_mode_hands("L1")
